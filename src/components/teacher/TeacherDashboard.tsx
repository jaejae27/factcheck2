import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Radio,
  FileText,
  Award,
  BookOpen,
  Sparkles,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  Settings,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Sliders,
  Copy,
  Check,
  Printer,
  ChevronLeft,
  X,
  Play,
  Square,
  MessageSquare,
  Activity,
  UserCheck,
} from 'lucide-react';
import {
  Room,
  Student,
  Team,
  InvestigationData,
  EvidenceCard,
  HelpRequest,
  PeerReview,
  TeacherReview,
  StudentReflection,
  SchoolRecordDraft,
} from '../../types';
import { ROLE_DEFINITIONS } from '../../data/topics';
import {
  updateRoomStep,
  updateRoomPresentation,
  submitTeacherReview,
  resolveHelpRequest,
  sendDirectTeacherHint,
  saveSchoolRecordDraft,
  subscribeRoom,
  subscribeTeamsByRoom,
  subscribeStudentsByRoom,
  subscribeHelpRequests,
  subscribePeerReviews,
  subscribeTeacherReviews,
  subscribeStudentReflections,
  subscribeSchoolRecords,
  subscribeEvidenceByRoom,
  subscribeInvestigationByTeam,
  getInvestigation,
} from '../../lib/db';
import { exportFullClassExcel } from '../common/ExcelExporter';
import { ReportModal } from '../common/ReportExporter';
import { PresentationViewer } from '../student/PresentationViewer';
import { StudentInviteModal } from './StudentInviteModal';
import { StudentStatusModal } from './StudentStatusModal';
import { openReportInNewWindow, openPresentationInNewWindow } from '../../lib/popupHelper';

interface TeacherDashboardProps {
  room: Room;
  teams: Team[];
  students: Student[];
  onExit: () => void;
}

type TabType =
  | 'overview'
  | 'investigation_status'
  | 'evidence_vault'
  | 'briefing_control'
  | 'evaluation'
  | 'reflections'
  | 'student_analytics'
  | 'school_records'
  | 'data_management';

const PEDAGOGICAL_HINT_PRESETS = [
  '이 정보는 처음 어디에서 시작되었나요? 1차 출처를 찾아보세요.',
  '원출처를 한 단계 더 찾아보세요. (공식 기관 발표, 연구 논문 등)',
  '이 자료는 누가 만들었나요? 작성자의 전문성과 이해관계를 따져보세요.',
  '조사 대상은 누구인가요? 표본 수와 연령대를 확인하세요.',
  '다른 결과를 보여주는 자료는 없나요? 반대 증거를 검색해 보세요.',
  '조건이나 예외가 숨어 있지는 않나요? 특정 상황에서만 성립하는지 보세요.',
  '두 자료가 같은 원자료를 인용하고 있지는 않나요?',
  '현재 증거만으로 어디까지 말할 수 있을까요? 결론의 범위를 좁혀보세요.',
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  room: initialRoom,
  teams: initialTeams,
  students: initialStudents,
  onExit,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedCode, setCopiedCode] = useState(false);

  // Live state synchronized with Firestore
  const [liveRoom, setLiveRoom] = useState<Room>(initialRoom);
  const [liveTeams, setLiveTeams] = useState<Team[]>(initialTeams);
  const [liveStudents, setLiveStudents] = useState<Student[]>(initialStudents);

  // Selected Team focus filter
  const [selectedFocusTeamId, setSelectedFocusTeamId] = useState<string>('all');

  // Real-time subscribed collections
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);
  const [teacherReviews, setTeacherReviews] = useState<TeacherReview[]>([]);
  const [reflections, setReflections] = useState<StudentReflection[]>([]);
  const [schoolRecords, setSchoolRecords] = useState<SchoolRecordDraft[]>([]);
  const [allEvidence, setAllEvidence] = useState<EvidenceCard[]>([]);
  const [investigationsMap, setInvestigationsMap] = useState<Record<string, InvestigationData>>({});

  // Presentation State & modals
  const [showTeacherPresentation, setShowTeacherPresentation] = useState(false);
  const [presentingTeamId, setPresentingTeamId] = useState<string>(initialTeams[0]?.id || '');
  const [selectedReportTeam, setSelectedReportTeam] = useState<Team | null>(null);

  // Teacher Review Scoring modal / form
  const [scoringTeamId, setScoringTeamId] = useState<string>(initialTeams[0]?.id || '');
  const [teacherScores, setTeacherScores] = useState({
    appropriateSources: 5,
    crossVerification: 5,
    counterEvidenceCheck: 5,
    evidenceBasedVerdict: 5,
    clarityAndUnderstanding: 5,
  });
  const [teacherFeedbackText, setTeacherFeedbackText] = useState('');
  const [teacherSelectedBadge, setTeacherSelectedBadge] = useState<TeacherReview['recommendedBadge']>('source_hunter');

  // School Record generator states
  const [generatingRecords, setGeneratingRecords] = useState(false);
  const [recordLength, setRecordLength] = useState<'brief' | 'standard' | 'detailed'>('standard');
  const [editingRecord, setEditingRecord] = useState<SchoolRecordDraft | null>(null);

  // Student Invitation & Status Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // SOS Reply & Direct Hint State
  const [replyingHelp, setReplyingHelp] = useState<HelpRequest | null>(null);
  const [replyHintInput, setReplyHintInput] = useState('');
  const [directHintTeam, setDirectHintTeam] = useState<Team | null>(null);
  const [directHintInput, setDirectHintInput] = useState('');

  // Unassigned & Reconnected Students count
  const unassignedStudentsCount = liveStudents.filter((s) => !s.teamId).length;
  const reconnectedStudentsCount = liveStudents.filter((s) => s.isReconnected).length;

  // Real-time Subscriptions setup
  useEffect(() => {
    const unsubRoom = subscribeRoom(initialRoom.id, (updatedRoom) => {
      if (updatedRoom) setLiveRoom(updatedRoom);
    });

    const unsubTeams = subscribeTeamsByRoom(initialRoom.id, (updatedTeams) => {
      setLiveTeams(updatedTeams);
      if (updatedTeams.length > 0) {
        setScoringTeamId((prev) => prev || updatedTeams[0].id);
        setPresentingTeamId((prev) => prev || updatedTeams[0].id);
      }
    });

    const unsubStudents = subscribeStudentsByRoom(initialRoom.id, setLiveStudents);
    const unsubEvidence = subscribeEvidenceByRoom(initialRoom.id, setAllEvidence);
    const unsubHelp = subscribeHelpRequests(initialRoom.id, setHelpRequests);
    const unsubPeer = subscribePeerReviews(initialRoom.id, setPeerReviews);
    const unsubTeacher = subscribeTeacherReviews(initialRoom.id, setTeacherReviews);
    const unsubReflect = subscribeStudentReflections(initialRoom.id, setReflections);
    const unsubRecords = subscribeSchoolRecords(initialRoom.id, setSchoolRecords);

    return () => {
      unsubRoom();
      unsubTeams();
      unsubStudents();
      unsubEvidence();
      unsubHelp();
      unsubPeer();
      unsubTeacher();
      unsubReflect();
      unsubRecords();
    };
  }, [initialRoom.id]);

  // Real-time subscribe to investigation data for all teams
  useEffect(() => {
    if (liveTeams.length === 0) return;

    const unsubs = liveTeams.map((t) => {
      return subscribeInvestigationByTeam(t.id, (inv) => {
        if (inv) {
          setInvestigationsMap((prev) => ({ ...prev, [t.id]: inv }));
        }
      });
    });

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [liveTeams]);

  // State to track which team's live detailed submission view is expanded in Status tab
  const [expandedTeamDetails, setExpandedTeamDetails] = useState<Record<string, boolean>>({});

  const toggleTeamDetails = (teamId: string) => {
    setExpandedTeamDetails((prev) => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  // Keep default team selections in sync
  useEffect(() => {
    if (liveTeams.length > 0) {
      if (!scoringTeamId || !liveTeams.some(t => t.id === scoringTeamId)) {
        setScoringTeamId(liveTeams[0].id);
      }
      if (!presentingTeamId || !liveTeams.some(t => t.id === presentingTeamId)) {
        setPresentingTeamId(liveTeams[0].id);
      }
    }
  }, [liveTeams, scoringTeamId, presentingTeamId]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(liveRoom.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleBroadcastStep = async (step: number) => {
    await updateRoomStep(liveRoom.id, step);
  };

  const handleStartBriefing = async (teamId: string) => {
    setPresentingTeamId(teamId);
    await updateRoomPresentation(liveRoom.id, {
      active: true,
      teamId,
      slideIndex: 0,
      startedAt: new Date().toISOString(),
    });
    setShowTeacherPresentation(true);

    // Automatically open the presentation in a standalone popup window
    const targetTeam = liveTeams.find((t) => t.id === teamId);
    if (targetTeam) {
      const inv = investigationsMap[teamId] || { teamId, updatedAt: Date.now() };
      const teamEvs = allEvidence.filter((e) => e.teamId === teamId);
      const members = liveStudents.filter((s) => s.teamId === teamId);
      openPresentationInNewWindow(targetTeam, inv, teamEvs, members, liveRoom);
    }
  };

  const handleStopBriefing = async () => {
    await updateRoomPresentation(liveRoom.id, {
      active: false,
      teamId: '',
      slideIndex: 0,
    });
    setShowTeacherPresentation(false);
  };

  const handleSaveTeacherReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const sum = (Object.values(teacherScores) as number[]).reduce((a: number, b: number) => a + b, 0);

    await submitTeacherReview({
      roomId: liveRoom.id,
      teacherId: liveRoom.teacherId,
      teamId: scoringTeamId,
      scores: teacherScores,
      totalScore: sum,
      feedback: teacherFeedbackText,
      recommendedBadge: teacherSelectedBadge,
    });

    alert('모둠 평가가 성공적으로 저장되었습니다!');
    setTeacherFeedbackText('');
  };

  // Generate single or batch School Record with Gemini
  const handleGenerateSchoolRecords = async (targetStudent?: Student) => {
    try {
      setGeneratingRecords(true);
      const targets = targetStudent ? [targetStudent] : liveStudents;

      if (targets.length === 0) {
        alert('등록된 학생이 아직 없습니다. 학생들이 수업방에 참여한 후 생성해주세요.');
        return;
      }

      for (const st of targets) {
        const team = liveTeams.find((t) => t.id === st.teamId);
        const inv = team ? investigationsMap[team.id] : undefined;
        const stReflect = reflections.find((r) => r.studentId === st.id);
        const stEvidence = allEvidence.filter((e) => e.studentId === st.id);
        const teamTeacherReview = team ? teacherReviews.find((tr) => tr.teamId === team.id) : undefined;
        const roleDef = st.role ? ROLE_DEFINITIONS[st.role] : undefined;

        const res = await fetch('/api/ai/generate-school-record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student: st,
            roleDef,
            team,
            investigation: inv,
            reflection: stReflect,
            evidenceCards: stEvidence,
            teacherReview: teamTeacherReview,
            lengthOption: recordLength,
          }),
        });

        const data = await res.json();
        if (data.draftText) {
          await saveSchoolRecordDraft({
            roomId: liveRoom.id,
            studentId: st.id,
            studentName: st.name,
            studentNumber: st.studentNumber,
            teamId: st.teamId,
            teamNumber: team?.teamNumber || 1,
            role: st.role || 'source_tracker',
            topicTitle: team?.topicTitle || '',
            draftText: data.draftText,
            evaluatedCompetencies: data.evaluatedCompetencies || [
              '비판적 사고력',
              '출처 검증 능력',
              '반증 탐색 태도',
              '협력적 문제해결력',
            ],
            byteCount: new TextEncoder().encode(data.draftText).length,
            isConfirmedByTeacher: false,
          });
        }
      }
      alert('세특 생성이 완료되었습니다!');
    } catch (err) {
      console.error('Error generating school records:', err);
      alert('세특 생성 중 오류가 발생했습니다.');
    } finally {
      setGeneratingRecords(false);
    }
  };

  const activeHelpCount = helpRequests.filter((h) => !h.resolved).length;
  const filteredTeams = selectedFocusTeamId === 'all' 
    ? liveTeams 
    : liveTeams.filter(t => t.id === selectedFocusTeamId);

  const displayedEvidence = selectedFocusTeamId === 'all'
    ? allEvidence
    : allEvidence.filter(e => e.teamId === selectedFocusTeamId);

  const displayedStudents = selectedFocusTeamId === 'all'
    ? liveStudents
    : liveStudents.filter(s => s.teamId === selectedFocusTeamId);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-[#00f0ff] selection:text-[#030712] relative overflow-x-hidden bg-grid-lab">
      
      {/* Top Command Bar */}
      <header className="bg-[#060e1d]/90 border-b border-cyan-500/30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
                수사본부 관제탑 <span className="text-xs font-mono text-cyan-400 font-normal">COMMAND HQ</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {liveRoom.grade}학년 {liveRoom.classNumber}반 · {liveRoom.period}차시
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {liveRoom.title} · 담당 교사: <strong className="text-white">{liveRoom.teacherName}</strong>선생님
            </p>
          </div>
        </div>

        {/* Room Code Pill & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {/* Main Student Invite Button */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-black text-xs transition shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            title="학생 초대 QR 및 링크 열기"
          >
            <span className="text-sm">📲</span>
            <span>학생 초대</span>
            {liveRoom.lockJoin && (
              <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 text-[10px] font-bold">
                잠김
              </span>
            )}
          </button>

          {/* Student Status & Roster Button */}
          <button
            onClick={() => setShowStatusModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition"
            title="접속 수사관 목록 및 모둠 배정"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>접속 현황</span>
            <span className="font-mono text-[11px] text-cyan-300 bg-slate-800 px-1.5 py-0.2 rounded">
              {liveStudents.length}명
            </span>
            {unassignedStudentsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" title="미배정 학생 있음" />
            )}
          </button>

          {/* Room Code Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-inner">
            <span className="text-xs text-slate-400 font-mono">ROOM:</span>
            <button
              onClick={() => setShowInviteModal(true)}
              className="font-mono text-sm font-black text-amber-400 tracking-wider hover:underline"
              title="클릭하여 초대 QR 열기"
            >
              {liveRoom.roomCode}
            </button>
            <button
              onClick={copyRoomCode}
              className="p-1 text-slate-400 hover:text-white rounded transition"
              title="코드 복사"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={onExit}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition font-mono"
          >
            나가기
          </button>
        </div>
      </header>

      {/* Team Interactive Quick Selector Bar */}
      <div className="bg-[#0b1329]/80 border-b border-cyan-500/20 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto select-none backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 shrink-0 pr-1">
            <Users className="w-3.5 h-3.5" />
            모둠 퀵 선택:
          </span>
          <button
            onClick={() => setSelectedFocusTeamId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              selectedFocusTeamId === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-500/40 hover:text-white'
            }`}
          >
            전체 모둠 ({liveTeams.length})
          </button>
          {liveTeams.map((t) => {
            const teamMembers = liveStudents.filter((s) => s.teamId === t.id);
            const isSelected = selectedFocusTeamId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedFocusTeamId(t.id);
                  setScoringTeamId(t.id);
                  setPresentingTeamId(t.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] ring-2 ring-cyan-300'
                    : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                <span>{t.teamName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {teamMembers.length}명
                </span>
                {t.topicTitle && (
                  <span className="max-w-[80px] truncate text-[10px] opacity-75">
                    · {t.topicTitle}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedFocusTeamId !== 'all' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                const team = liveTeams.find(t => t.id === selectedFocusTeamId);
                if (team) setSelectedReportTeam(team);
              }}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
              title="보고서 팝업 모달 열기"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>보고서</span>
            </button>
            <button
              onClick={() => {
                const team = liveTeams.find(t => t.id === selectedFocusTeamId);
                if (team) {
                  const inv = investigationsMap[team.id] || { teamId: team.id, updatedAt: Date.now() };
                  const teamEvs = allEvidence.filter(e => e.teamId === team.id);
                  const members = liveStudents.filter(s => s.teamId === team.id);
                  openReportInNewWindow(team, inv, teamEvs, members, liveRoom);
                }
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition shadow-sm"
              title="새 창(독립 팝업)으로 보고서 열기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleStartBriefing(selectedFocusTeamId)}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
              title="실시간 브리핑 슬라이드 열기"
            >
              <Play className="w-3.5 h-3.5" />
              <span>브리핑</span>
            </button>
            <button
              onClick={() => {
                const team = liveTeams.find(t => t.id === selectedFocusTeamId);
                if (team) {
                  const inv = investigationsMap[team.id] || { teamId: team.id, updatedAt: Date.now() };
                  const teamEvs = allEvidence.filter(e => e.teamId === team.id);
                  const members = liveStudents.filter(s => s.teamId === team.id);
                  openPresentationInNewWindow(team, inv, teamEvs, members, liveRoom);
                }
              }}
              className="p-1.5 bg-indigo-900/70 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-bold transition shadow-sm"
              title="새 창(독립 팝업)으로 브리핑 슬라이드 열기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs (9-Tab Command Center) */}
      <div className="bg-[#060e1d]/90 border-b border-cyan-500/20 px-4 sm:px-8 overflow-x-auto select-none">
        <div className="flex items-center gap-2 min-w-max py-2.5">
          {[
            { id: 'overview', label: '🏠 수사본부 개요', badge: activeHelpCount > 0 ? activeHelpCount : null },
            { id: 'investigation_status', label: '🕵️ 수사 현황' },
            { id: 'evidence_vault', label: `📁 증거 보관소 (${allEvidence.length})` },
            { id: 'briefing_control', label: '🎙️ 브리핑 관제실' },
            { id: 'evaluation', label: '⚖️ 평가실' },
            { id: 'reflections', label: `🧠 개인 성찰 (${reflections.length})` },
            { id: 'student_analytics', label: `👥 학생 학습 분석 (${liveStudents.length})` },
            { id: 'school_records', label: '📝 세특 작성실' },
            { id: 'data_management', label: '📥 데이터 관리 & 출력' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-black animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* TAB 1: 수사본부 개요 (Overview) */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* COMMAND CONTROL: 전체 학급 진행 단계 제어 */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0a182c] via-[#0d2242] to-[#0a182c] rounded-3xl border-2 border-cyan-500/40 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      COMMAND CONTROL
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                      전체 학급 진행 단계 제어
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    단계를 클릭하면 모든 학생 태블릿/화면이 해당 탐구 단계로 실시간 전환됩니다.
                  </p>
                </div>
                <span className="px-3.5 py-1.5 rounded-2xl text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50 w-fit shadow">
                  현재 본부 단계: <strong>STEP 0{liveRoom.activeStep || 1} / 06</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                {[
                  { step: 1, num: '01', title: '사건 접수', desc: '사건 선택 & 역할 배정' },
                  { step: 2, num: '02', title: '수사 질문', desc: '최초 판단 & 가설 수립' },
                  { step: 3, num: '03', title: '증거 수집', desc: '증거 계획 & 카드 확보' },
                  { step: 4, num: '04', title: '증거 검증', desc: '교차검증 & 반증·예외' },
                  { step: 5, num: '05', title: '합동수사·판정', desc: '모둠 회의 & 팩트 판정' },
                  { step: 6, num: '06', title: '브리핑·성찰', desc: '발표 · 상호평가 · 성찰' },
                ].map((st) => {
                  const isActive = (liveRoom.activeStep || 1) === st.step;
                  return (
                    <button
                      key={st.step}
                      onClick={() => handleBroadcastStep(st.step)}
                      className={`p-3.5 rounded-2xl text-left transition flex flex-col justify-between gap-2 relative overflow-hidden group ${
                        isActive
                          ? 'bg-gradient-to-b from-cyan-400 to-cyan-500 text-slate-950 ring-2 ring-cyan-200 shadow-[0_0_16px_rgba(6,182,212,0.5)] font-black scale-[1.02]'
                          : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700/90 hover:text-white border border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-lg ${
                          isActive ? 'bg-slate-950 text-cyan-300' : 'bg-slate-900 text-slate-400'
                        }`}>
                          {st.num}
                        </span>
                        {isActive && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black leading-tight">{st.title}</h4>
                        <p className={`text-[10px] mt-0.5 ${isActive ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                          {st.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unassigned Students Alert Banner */}
            {unassignedStudentsCount > 0 && (
              <div className="p-4 bg-amber-950/60 border-2 border-amber-500/60 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-300">
                      수사팀 미배정 학생 {unassignedStudentsCount}명 대기 중
                    </h4>
                    <p className="text-xs text-slate-300">
                      수업방에 입장했으나 모둠이 정해지지 않은 학생이 있습니다. 모둠을 배정해 주세요.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md whitespace-nowrap"
                >
                  수사팀 즉시 배정하기
                </button>
              </div>
            )}

            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => setShowStatusModal(true)}
                className="p-5 bg-slate-900/90 hover:bg-slate-800/90 rounded-3xl border border-slate-800 hover:border-cyan-500/40 text-left space-y-1 transition group"
                title="클릭하여 학생 접속 현황 확인"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 group-hover:text-cyan-300 transition">참여 수사 모둠</span>
                  <Users className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                </div>
                <p className="text-2xl font-black text-white">{liveTeams.length}개 팀</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400">접속 학생 {liveStudents.length}명</span>
                  {unassignedStudentsCount > 0 && (
                    <span className="text-amber-400 font-bold">미배정 {unassignedStudentsCount}</span>
                  )}
                </div>
              </button>

              <div className="p-5 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">확보된 증거 카드</span>
                <p className="text-2xl font-black text-white">{allEvidence.length}건</p>
                <span className="text-[11px] text-cyan-300">
                  원출처 비율 {allEvidence.length ? Math.round((allEvidence.filter(e => e.isOriginalSource).length / allEvidence.length) * 100) : 0}%
                </span>
              </div>

              <div className="p-5 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">동료 상호 평가</span>
                <p className="text-2xl font-black text-white">{peerReviews.length}건</p>
                <span className="text-[11px] text-slate-400">질문 및 검증 진행 중</span>
              </div>

              <div className="p-5 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">성찰 일지 제출</span>
                <p className="text-2xl font-black text-white">{reflections.length} / {liveStudents.length}명</p>
                <span className="text-[11px] text-emerald-400">
                  {liveStudents.length ? Math.round((reflections.length / liveStudents.length) * 100) : 0}% 제출 완료
                </span>
              </div>
            </div>

            {/* Real-time SOS Help Requests Board */}
            <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <HelpCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">실시간 수사 지원 요청 (SOS 데스크)</h3>
                    <p className="text-xs text-slate-400">학생들이 도움을 요청한 내용이 실시간으로 표시됩니다.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  대기 중 {activeHelpCount}건
                </span>
              </div>

              {helpRequests.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-500">
                  현재 등록된 긴급 지원 요청이 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {helpRequests.map((hr) => (
                    <div
                      key={hr.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                        hr.resolved
                          ? 'bg-slate-950/40 border-slate-800 opacity-60'
                          : 'bg-rose-950/30 border-rose-500/40'
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-rose-300">
                            {hr.teamNumber}모둠 ({hr.studentName} 수사관)
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{hr.createdAt ? new Date(hr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed font-medium bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
                          "{hr.reason}"
                        </p>
                        {hr.teacherReply && (
                          <p className="text-cyan-300 text-[11px]">
                            💬 <strong>회신 힌트:</strong> {hr.teacherReply}
                          </p>
                        )}
                      </div>

                      {!hr.resolved && (
                        <div className="flex items-center gap-2 pt-1 border-t border-rose-500/20">
                          <button
                            onClick={() => {
                              setReplyingHelp(hr);
                              setReplyHintInput('');
                            }}
                            className="flex-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>수사 힌트 회신 & 완료</span>
                          </button>
                          <button
                            onClick={() => resolveHelpRequest(hr.id, hr.teamId, '선생님 구두 지도 완료')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold shrink-0 transition"
                          >
                            단순 완료
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: 수사 현황 (Investigation Status Matrix & Live Submissions) */}
        {activeTab === 'investigation_status' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                    REAL-TIME SYNC
                  </span>
                  <h3 className="text-base font-bold text-white">모둠별 실시간 수사 제출 현황 & 상세 관제</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  학생들이 실시간으로 작성 중인 가설, 증거 카드, 교차검증 분석, 최종 판정 내용을 즉시 확인하고 보고서 및 브리핑 슬라이드를 열람합니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const allExpanded = filteredTeams.every(t => expandedTeamDetails[t.id]);
                    const next: Record<string, boolean> = {};
                    filteredTeams.forEach(t => {
                      next[t.id] = !allExpanded;
                    });
                    setExpandedTeamDetails(next);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
                >
                  {filteredTeams.every(t => expandedTeamDetails[t.id]) ? '모든 모둠 제출내역 접기' : '모든 모둠 제출내역 전체 펼치기'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredTeams.map((t) => {
                const inv = investigationsMap[t.id];
                const teamEvs = allEvidence.filter((e) => e.teamId === t.id);
                const members = liveStudents.filter((s) => s.teamId === t.id);
                const isExpanded = !!expandedTeamDetails[t.id];
                const teamReflections = reflections.filter((r) => r.teamId === t.id);
                const teamPeerReviews = peerReviews.filter((p) => p.targetTeamId === t.id);

                return (
                  <div key={t.id} className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition shadow-lg">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black text-base font-mono shadow-inner">
                          {t.teamNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-white">{t.teamName}</h4>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                              STEP 0{t.currentStep || 1} / 06 ({Math.min(100, Math.round(((t.currentStep || 1) / 6) * 100))}%)
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 font-medium">
                            {t.topicTitle ? `주제: ${t.topicTitle}` : '사건 주제 선정 대기'}
                            {t.claim ? ` · 의심주장: "${t.claim}"` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            setDirectHintTeam(t);
                            setDirectHintInput('');
                          }}
                          className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold transition flex items-center gap-1 text-xs"
                          title="이 모둠에 교사 지시/힌트 전송"
                        >
                          <Radio className="w-3.5 h-3.5 text-cyan-400" />
                          <span>지시 전송</span>
                        </button>

                        <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
                          <button
                            onClick={() => setSelectedReportTeam(t)}
                            className="px-3 py-1.5 hover:bg-slate-700 text-cyan-300 font-bold transition flex items-center gap-1 text-xs"
                            title="수사보고서 모달 열람"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>보고서</span>
                          </button>
                          <button
                            onClick={() => {
                              const currInv = inv || { teamId: t.id, updatedAt: Date.now() };
                              openReportInNewWindow(t, currInv, teamEvs, members, liveRoom);
                            }}
                            className="p-1.5 hover:bg-slate-700 text-cyan-300 border-l border-slate-700 transition"
                            title="새 창(독립 팝업)으로 보고서 열기"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center rounded-xl bg-indigo-600 overflow-hidden shadow-sm">
                          <button
                            onClick={() => handleStartBriefing(t.id)}
                            className="px-3 py-1.5 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1 text-xs"
                            title="실시간 브리핑 슬라이드 열기"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>브리핑</span>
                          </button>
                          <button
                            onClick={() => {
                              const currInv = inv || { teamId: t.id, updatedAt: Date.now() };
                              openPresentationInNewWindow(t, currInv, teamEvs, members, liveRoom);
                            }}
                            className="p-1.5 hover:bg-indigo-500 text-indigo-100 border-l border-indigo-500 transition"
                            title="새 창(독립 팝업)으로 브리핑 슬라이드 열기"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => toggleTeamDetails(t.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 text-xs ${
                            isExpanded
                              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                          }`}
                        >
                          <span>{isExpanded ? '상세 접기 ▲' : '실시간 제출 상세 ▼'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Team Members List */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {members.length === 0 ? (
                        <span className="text-xs text-slate-500">배정된 수사관 대기 중</span>
                      ) : (
                        members.map((m) => (
                          <span key={m.id} className="px-2.5 py-1 bg-slate-950 rounded-xl text-xs font-bold text-slate-300 border border-slate-800 flex items-center gap-1.5">
                            <span className="text-cyan-400 font-mono">{m.studentNumber}번</span>
                            <span>{m.name}</span>
                            <span className="text-[10px] text-indigo-300 px-1.5 py-0.2 bg-indigo-950/80 rounded border border-indigo-500/30">
                              {m.role ? ROLE_DEFINITIONS[m.role]?.title.slice(0, 6) : '역할대기'}
                            </span>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Quick Summary Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 font-semibold block text-[11px]">수사 가설:</span>
                        <p className="text-slate-200 mt-0.5 line-clamp-2 italic">
                          "{inv?.hypothesis || '가설 수립 중...'}"
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block text-[11px]">수집 증거 현황:</span>
                        <p className="text-slate-200 mt-0.5 font-bold">
                          총 <span className="text-cyan-400">{teamEvs.length}건</span> (원출처 {teamEvs.filter(e => e.isOriginalSource).length}건 · 반증 {teamEvs.filter(e => e.stance === 'refutes' || e.stance === 'condition').length}건)
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block text-[11px]">최종 판정:</span>
                        <p className="text-slate-200 mt-0.5 font-black">
                          {inv?.finalVerdict ? (
                            <span className="text-cyan-300 px-2 py-0.5 rounded bg-[#0f274a] border border-cyan-500/40">
                              {inv.finalVerdict.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-slate-500">판정 진행 중</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* EXPANDED DETAILED LIVE SUBMISSION VIEW */}
                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in duration-200">
                        
                        {/* 1. 수사 질문 & 가설 */}
                        <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2">
                          <h5 className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                            <span>01/02</span>
                            <span>수사 가설 및 수사 질문 (실시간 제출)</span>
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                              <span className="text-[11px] text-slate-400 font-semibold">최초 판단 및 이유:</span>
                              <p className="text-slate-200 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                <strong>생각:</strong> {inv?.initialBelief || '미선택'} | <strong>이유:</strong> {inv?.initialReason || '미입력'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[11px] text-slate-400 font-semibold">수사 가설 문장:</span>
                              <p className="text-cyan-200 bg-slate-900 p-2.5 rounded-xl border border-cyan-500/20 italic">
                                "{inv?.hypothesis || '가설 미작성'}"
                              </p>
                            </div>
                          </div>
                          {inv?.investigationQuestions && inv.investigationQuestions.length > 0 && (
                            <div className="pt-1 text-xs">
                              <span className="text-[11px] text-slate-400 font-semibold">핵심 수사 질문 목록:</span>
                              <ul className="list-disc list-inside text-slate-300 mt-1 space-y-0.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                {inv.investigationQuestions.map((q, idx) => (
                                  <li key={idx}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* 2. 수집된 증거 카드 전체 목록 */}
                        <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2">
                          <h5 className="text-xs font-black text-emerald-400 flex items-center justify-between">
                            <span>03 수집된 팩트체크 증거 카드 ({teamEvs.length}건)</span>
                            <span className="text-[10px] text-slate-400 font-normal">실시간 동기화됨</span>
                          </h5>
                          {teamEvs.length === 0 ? (
                            <p className="text-xs text-slate-500 italic p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                              아직 등록된 증거 카드가 없습니다.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {teamEvs.map((ev, idx) => (
                                <div key={ev.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-white">#{idx + 1}. {ev.title}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      ev.stance === 'supports' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                                      ev.stance === 'refutes' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-blue-950 text-blue-300 border border-blue-500/30'
                                    }`}>
                                      {ev.stance === 'supports' ? '가설 지지' : ev.stance === 'refutes' ? '가설 반박' : '조건 제시'}
                                    </span>
                                  </div>
                                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">{ev.keyContent}</p>
                                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                                    <span>출처: {ev.publisher || '미기재'} ({ev.isOriginalSource ? '원출처' : '2차'})</span>
                                    {ev.keyMetrics && <span className="text-cyan-300 font-mono">📊 {ev.keyMetrics}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 3. 모둠 합동 교차검증 분석 */}
                        <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2">
                          <h5 className="text-xs font-black text-indigo-400">
                            04/05 모둠 합동 교차검증 & 반증 분석 결과
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                              <span className="text-[11px] font-bold text-slate-300">① 공통으로 확인된 사실</span>
                              <p className="text-slate-400 text-[11px]">{inv?.jointSynthesis?.commonFindings || '작성 대기 중'}</p>
                            </div>
                            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                              <span className="text-[11px] font-bold text-slate-300">② 자료 간 충돌 및 원인 차이</span>
                              <p className="text-slate-400 text-[11px]">{inv?.jointSynthesis?.reasonForConflict || '작성 대기 중'}</p>
                            </div>
                            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                              <span className="text-[11px] font-bold text-slate-300">③ 빠진 맥락 및 예외 조건</span>
                              <p className="text-slate-400 text-[11px]">{inv?.jointSynthesis?.missingContextExceptions || '작성 대기 중'}</p>
                            </div>
                            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                              <span className="text-[11px] font-bold text-slate-300">④ 주장할 수 있는 사실의 범위</span>
                              <p className="text-slate-400 text-[11px]">{inv?.jointSynthesis?.warrantScope || '작성 대기 중'}</p>
                            </div>
                          </div>
                        </div>

                        {/* 4. 최종 판정 및 결정적 근거 */}
                        <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2">
                          <h5 className="text-xs font-black text-cyan-400">
                            05 최종 팩트 판정 & 결정적 이유
                          </h5>
                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-300">판정 결과:</span>
                              <span className="font-black text-cyan-300 px-3 py-1 bg-[#0f274a] rounded-lg border border-cyan-500/40">
                                {inv?.finalVerdict || '판정 미완료'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[11px] text-slate-400 font-semibold">가장 결정적인 판정 근거:</span>
                              <p className="text-slate-200 mt-1 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                {inv?.decisiveEvidenceSummary || '작성 대기 중'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 5. 개인 성찰 & 동료평가 제출 상태 */}
                        <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2">
                          <h5 className="text-xs font-black text-amber-400 flex items-center justify-between">
                            <span>06 개인 성찰 일지 ({teamReflections.length}/{members.length}명) & 동료평가 ({teamPeerReviews.length}건 수신)</span>
                          </h5>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {members.map(m => {
                              const refItem = teamReflections.find(r => r.studentId === m.id);
                              return (
                                <div key={m.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex-1 min-w-[200px] space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-200">{m.name} 수사관</span>
                                    {refItem ? (
                                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">성찰 완료</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px]">작성 대기</span>
                                    )}
                                  </div>
                                  {refItem && (
                                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                                      배움: "{refItem.biggestLearning || refItem.habitToKeep || '기록 완료'}"
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: 증거 보관소 (Evidence Vault) */}
        {activeTab === 'evidence_vault' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">전체 수사팀 증거 보관소 ({displayedEvidence.length}건)</h3>
                <p className="text-xs text-slate-400">학생들이 등록한 모든 출처 정보, 주요 통계, 캡처 이미지를 확인합니다.</p>
              </div>
            </div>

            {displayedEvidence.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-sm text-slate-400">
                등록된 증거 카드가 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedEvidence.map((ev, idx) => (
                  <div key={ev.id} className="p-5 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-cyan-500/40 transition">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400">증거 #{idx + 1}. {ev.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.stance === 'supports' ? 'bg-emerald-500/20 text-emerald-300' :
                          ev.stance === 'refutes' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {ev.stance}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{ev.keyContent}</p>
                      
                      <div className="text-[11px] text-slate-400 space-y-0.5 pt-2 border-t border-slate-800">
                        <p>출처: <span className="text-slate-200 font-semibold">{ev.publisher || '미기재'}</span> ({ev.isOriginalSource ? '1차 원출처' : '2차 기사'})</p>
                        {ev.keyMetrics && <p>통계: <span className="text-emerald-400 font-mono">{ev.keyMetrics}</span></p>}
                        <p>작성자: {ev.studentName} ({ev.studentRole})</p>
                      </div>

                      {ev.imageUrl && (
                        <img
                          src={ev.imageUrl}
                          alt="증거 캡처"
                          className="max-h-28 rounded-xl object-contain bg-slate-950 border border-slate-800 mx-auto"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: 브리핑 관제실 (Live Presentation Sync) */}
        {activeTab === 'briefing_control' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-1">
              <h3 className="text-base font-bold text-white">모둠별 수사 브리핑 및 실시간 슬라이드 관제</h3>
              <p className="text-xs text-slate-400">
                발표할 모둠을 선택하고 브리핑을 시작하면, 전자칠판과 모든 학생 기기 화면이 8장 슬라이드로 동기화됩니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {liveTeams.map((t) => {
                const isCurrentActive = liveRoom.presentationState?.active && liveRoom.presentationState.teamId === t.id;
                const inv = investigationsMap[t.id];
                const teamEvs = allEvidence.filter((e) => e.teamId === t.id);
                const members = liveStudents.filter((s) => s.teamId === t.id);

                return (
                  <div
                    key={t.id}
                    className={`p-6 rounded-3xl border-2 transition space-y-4 ${
                      isCurrentActive
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-xl'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black font-mono">
                        {t.teamNumber}
                      </span>
                      {isCurrentActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse font-mono">
                          LIVE 중계 중
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{t.teamName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{t.topicTitle || t.claim || '사건 미정'}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        {isCurrentActive ? (
                          <button
                            onClick={handleStopBriefing}
                            className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg"
                          >
                            <Square className="w-3.5 h-3.5" />
                            중계 종료
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartBriefing(t.id)}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <Play className="w-3.5 h-3.5" />
                            브리핑 시작
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setPresentingTeamId(t.id);
                            setShowTeacherPresentation(true);
                          }}
                          className="px-2.5 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1"
                          title="대화면 슬라이드 뷰어로 브리핑 진행 및 관람"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>슬라이드</span>
                        </button>
                        <button
                          onClick={() => {
                            const currInv = inv || { teamId: t.id, updatedAt: Date.now() };
                            openPresentationInNewWindow(t, currInv, teamEvs, members, liveRoom);
                          }}
                          className="px-2.5 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1"
                          title="새 창(독립 팝업)으로 브리핑 슬라이드 띄우기"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>새 창</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <span>증거 {teamEvs.length}건</span>
                        <button
                          onClick={() => {
                            const currInv = inv || { teamId: t.id, updatedAt: Date.now() };
                            openReportInNewWindow(t, currInv, teamEvs, members, liveRoom);
                          }}
                          className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
                        >
                          <FileText className="w-3 h-3" />
                          보고서 팝업
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: 평가실 (Evaluation & FACT SCORE) */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base font-bold text-white">모둠 평가 및 FACT SCORE 자동 산출</h3>
                <p className="text-xs text-slate-400">
                  교사 루브릭 평가({liveRoom.teacherWeight}%) + 동료 상호평가({liveRoom.peerWeight}%)를 종합하여 수사대 훈장을 수여합니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">평가 대상:</span>
                <select
                  value={scoringTeamId}
                  onChange={(e) => setScoringTeamId(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                >
                  {liveTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.teamName} ({t.topicTitle || '사건'})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teacher Scoring Form */}
            <form onSubmit={handleSaveTeacherReview} className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-5 shadow-lg">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                선택 모둠 교사 정밀 평가 (5개 핵심 척도)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {[
                  { key: 'appropriateSources', label: '1. 신뢰성 있는 1차 공인 출처 추적 수준' },
                  { key: 'crossVerification', label: '2. 복수 자료 교차검증 및 차이점 분석력' },
                  { key: 'counterEvidenceCheck', label: '3. 반대 증거 및 조건·예외 파악의 엄밀성' },
                  { key: 'evidenceBasedVerdict', label: '4. 증거에 기반한 최종 판정의 논리적 타당성' },
                  { key: 'clarityAndUnderstanding', label: '5. 브리핑 전달력 및 질의응답 대응력' },
                ].map((item) => (
                  <div key={item.key} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                    <span className="font-semibold text-slate-300 block">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          type="button"
                          key={score}
                          onClick={() => setTeacherScores({ ...teacherScores, [item.key]: score })}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                            (teacherScores as any)[item.key] === score
                              ? 'bg-cyan-500 text-slate-950 font-black shadow-md ring-2 ring-cyan-300'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">수사대 추천 훈장 수여</label>
                  <select
                    value={teacherSelectedBadge}
                    onChange={(e) => setTeacherSelectedBadge(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="source_hunter">🥇 원출처 추적왕 (신뢰도 높은 1차 출처 정밀 추적)</option>
                    <option value="counter_master">🥈 반증의 달인 (단순 일반화를 깨는 반대 증거 발굴)</option>
                    <option value="logic_briefing">🥉 논리 브리핑상 (명쾌하고 논리적인 수사 보고)</option>
                    <option value="cross_check_pro">🏅 교차검증 마스터 (다양한 데이터 비교 분석)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">교사 총평 및 피드백 코멘트</label>
                  <input
                    type="text"
                    value={teacherFeedbackText}
                    onChange={(e) => setTeacherFeedbackText(e.target.value)}
                    placeholder="예: 공인 통계를 바탕으로 반증까지 철저하게 찾아낸 모범적인 수사였습니다."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                교사 평가 및 훈장 저장하기
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: 개인 성찰 (Reflections) */}
        {activeTab === 'reflections' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800">
              <h3 className="text-base font-bold text-white">학생 개인 성찰 일지 ({reflections.length}명 제출)</h3>
              <p className="text-xs text-slate-400">수사를 통해 학생들이 배운 점과 변화된 사고 과정을 확인합니다.</p>
            </div>

            {reflections.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-sm text-slate-400">
                제출된 성찰 일지가 아직 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reflections.map((rf) => (
                  <div key={rf.id} className="p-5 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <span className="font-bold text-white">{rf.studentNumber}번 {rf.studentName}</span>
                        <span className="text-[11px] text-slate-400 ml-2">({rf.teamNumber}모둠 · {rf.role})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                        생각변화: {rf.beliefChangeLevel}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-slate-300">
                      <p><strong className="text-cyan-300">가장 잘한 점:</strong> {rf.bestActivity}</p>
                      <p><strong className="text-emerald-400">결정적 증거:</strong> {rf.keyEvidenceFound}</p>
                      <p><strong className="text-amber-300">새로운 배움:</strong> {rf.newLearning}</p>
                      <p><strong className="text-slate-400">앞으로의 습관:</strong> {rf.futureFactCheckHabit}</p>
                      {rf.remainingQuestion && (
                        <p><strong className="text-rose-400">남은 질문:</strong> {rf.remainingQuestion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: 학생 학습 분석 (Student Analytics) */}
        {activeTab === 'student_analytics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800">
              <h3 className="text-base font-bold text-white">학급 전체 학생 수사 역량 분석표 ({displayedStudents.length}명)</h3>
              <p className="text-xs text-slate-400">학생별 역할, 기여 증거 수, 성찰 제출 여부 및 개별 세특 생성을 관리합니다.</p>
            </div>

            {displayedStudents.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-sm text-slate-400">
                수업방에 접속한 학생이 아직 없습니다.
              </div>
            ) : (
              <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-x-auto shadow-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-4 font-mono">번호</th>
                      <th className="p-4">이름</th>
                      <th className="p-4">모둠</th>
                      <th className="p-4">맡은 수사관 역할</th>
                      <th className="p-4">증거 등록</th>
                      <th className="p-4">성찰 제출</th>
                      <th className="p-4 text-right">세특 생성</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {displayedStudents.map((st) => {
                      const stEvidenceCount = allEvidence.filter((e) => e.studentId === st.id).length;
                      const stReflect = reflections.find((r) => r.studentId === st.id);
                      const team = liveTeams.find((t) => t.id === st.teamId);

                      return (
                        <tr key={st.id} className="hover:bg-slate-800/40">
                          <td className="p-4 font-mono font-bold text-slate-400">{st.studentNumber}</td>
                          <td className="p-4 font-bold text-white">{st.name}</td>
                          <td className="p-4 text-slate-300">{team?.teamName || '미배정'}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-cyan-300">
                              {st.role ? ROLE_DEFINITIONS[st.role]?.title : '역할 선택 대기'}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-emerald-400">{stEvidenceCount}건</td>
                          <td className="p-4">
                            {stReflect ? (
                              <span className="text-emerald-400 font-bold">제출 완료</span>
                            ) : (
                              <span className="text-slate-500">미제출</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleGenerateSchoolRecords(st)}
                              disabled={generatingRecords}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-sm"
                            >
                              AI 세특 생성
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: 세특 작성실 (School Records Studio) */}
        {activeTab === 'school_records' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">학교생활기록부 과목별 세특(교과세특) 작성 스튜디오</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    10원칙 준수
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  학생들의 실제 수사 데이터(역할, 증거, 반증, 성찰)를 바탕으로 교육부 기재요령에 맞춘 객관적 세특 초안을 생성합니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={recordLength}
                  onChange={(e) => setRecordLength(e.target.value as any)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                >
                  <option value="brief">간단히 (약 200자)</option>
                  <option value="standard">표준 (약 350자)</option>
                  <option value="detailed">상세히 (약 500자)</option>
                </select>

                <button
                  onClick={() => handleGenerateSchoolRecords()}
                  disabled={generatingRecords}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-black rounded-2xl text-xs transition shadow-lg shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  {generatingRecords ? 'AI 세특 일괄 생성 중...' : '학급 전체 세특 일괄 생성'}
                </button>
              </div>
            </div>

            {/* School Records Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schoolRecords.map((rec) => (
                <div key={rec.id} className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {rec.studentNumber}번 {rec.studentName} ({rec.teamNumber}모둠)
                        </h4>
                        <p className="text-xs text-cyan-300 mt-0.5">
                          역할: {ROLE_DEFINITIONS[rec.role]?.title || rec.role}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {rec.byteCount || new TextEncoder().encode(rec.draftText).length} 바이트
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                      {rec.draftText}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {rec.evaluatedCompetencies?.map((comp, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300">
                          #{comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(rec.draftText);
                        alert(`${rec.studentName} 학생 세특이 복사되었습니다.`);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      문구 복사
                    </button>
                    <button
                      onClick={() => setEditingRecord(rec)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition"
                    >
                      내용 수정 / 확정
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: 데이터 관리 & 출력 (Data Management & Excel Export) */}
        {activeTab === 'data_management' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-1">
              <h3 className="text-base font-bold text-white">수사 수업 데이터 일괄 내보내기 & 리포트 인쇄</h3>
              <p className="text-xs text-slate-400">
                수업 전체 데이터를 엑셀(XLSX)로 다운로드하거나, 모둠별 소논문 수사보고서를 PDF/인쇄할 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-3 text-emerald-400">
                  <Download className="w-6 h-6" />
                  <h4 className="text-base font-bold text-white">수업 통합 엑셀(XLSX) 다운로드</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  모둠 명단, 증거 카드 목록, 평가 점수표, 개인 성찰 답변 및 학생 세특 초안이 포함된 5개 시트 엑셀 파일을 즉시 생성합니다.
                </p>
                <button
                  onClick={() => exportFullClassExcel(liveRoom, liveTeams, liveStudents, allEvidence, teacherReviews, peerReviews, reflections, schoolRecords)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  전체 수업 데이터 엑셀 내보내기 (.xlsx)
                </button>
              </div>

              <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-3 text-cyan-400">
                  <Printer className="w-6 h-6" />
                  <h4 className="text-base font-bold text-white">모둠별 수사보고서 인쇄 및 PDF 열람</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  각 수사팀이 완성한 최종 소논문 보고서 양식을 열람하고 인쇄할 수 있습니다.
                </p>
                <div className="space-y-2">
                  {liveTeams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedReportTeam(t)}
                      className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-between"
                    >
                      <span>{t.teamName} ({t.topicTitle || '사건'})</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modal: Report Exporter Modal */}
      {selectedReportTeam && (
        <ReportModal
          room={liveRoom}
          team={selectedReportTeam}
          investigation={investigationsMap[selectedReportTeam.id] || {}}
          evidenceList={allEvidence.filter((e) => e.teamId === selectedReportTeam.id)}
          teamMembers={liveStudents.filter((s) => s.teamId === selectedReportTeam.id)}
          onClose={() => setSelectedReportTeam(null)}
        />
      )}

      {/* Teacher Presentation Viewer */}
      {showTeacherPresentation && liveRoom.presentationState?.active && (
        <PresentationViewer
          room={liveRoom}
          team={liveTeams.find((t) => t.id === presentingTeamId) || liveTeams[0]}
          investigation={investigationsMap[presentingTeamId] || {}}
          evidenceList={allEvidence.filter((e) => e.teamId === presentingTeamId)}
          teamMembers={liveStudents.filter((s) => s.teamId === presentingTeamId)}
          currentSlideIndex={liveRoom.presentationState?.slideIndex || 0}
          isPresenter={true}
          onSlideChange={async (newIdx) => {
            await updateRoomPresentation(liveRoom.id, {
              ...liveRoom.presentationState!,
              slideIndex: newIdx,
            });
          }}
          onClose={handleStopBriefing}
        />
      )}

      {/* Modal: Edit School Record */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">
                {editingRecord.studentName} 학생 세특 수정 & 확정
              </h4>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              rows={8}
              value={editingRecord.draftText}
              onChange={(e) => setEditingRecord({
                ...editingRecord,
                draftText: e.target.value,
                byteCount: new TextEncoder().encode(e.target.value).length,
              })}
              className="w-full p-4 text-xs bg-slate-900 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>바이트 수: {editingRecord.byteCount} 바이트</span>
              <button
                onClick={async () => {
                  await saveSchoolRecordDraft(editingRecord);
                  setEditingRecord(null);
                }}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition shadow-md"
              >
                수정 사항 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Invite Modal */}
      {showInviteModal && (
        <StudentInviteModal
          room={liveRoom}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {/* Real-time Student Roster & Team Assignment Modal */}
      {showStatusModal && (
        <StudentStatusModal
          room={liveRoom}
          students={liveStudents}
          teams={liveTeams}
          onClose={() => setShowStatusModal(false)}
        />
      )}

      {/* SOS Reply & Pedagogical Hint Modal */}
      {replyingHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Radio className="w-5 h-5" />
                <h4 className="font-bold text-white text-sm">
                  {replyingHelp.teamNumber}모둠 수사 지원 회신 (피드백 전송)
                </h4>
              </div>
              <button
                onClick={() => setReplyingHelp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">학생 SOS 요청 내용:</span>
              <p className="text-slate-200">"{replyingHelp.reason}"</p>
            </div>

            {/* Pedagogical Scaffolding Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-cyan-300">💡 비계 설정 발문 프리셋 (클릭 시 자동 입력):</label>
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {PEDAGOGICAL_HINT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setReplyHintInput(preset)}
                    className="p-2 text-left text-xs bg-slate-800 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-200 rounded-xl border border-slate-700 hover:border-cyan-500/40 transition"
                  >
                    • {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">학생 화면으로 전송할 지도 메시지:</label>
              <textarea
                rows={3}
                value={replyHintInput}
                onChange={(e) => setReplyHintInput(e.target.value)}
                placeholder="학생 화면 상단에 실시간으로 표시될 힌트 메시지를 입력하세요..."
                className="w-full p-3 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setReplyingHelp(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (replyingHelp) {
                    await resolveHelpRequest(replyingHelp.id, replyingHelp.teamId, replyHintInput || '수사 지원 완료');
                    setReplyingHelp(null);
                    setReplyHintInput('');
                  }
                }}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black transition shadow-lg flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>힌트 전송 & 지원 완료</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Team Hint Modal */}
      {directHintTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Radio className="w-5 h-5" />
                <h4 className="font-bold text-white text-sm">
                  {directHintTeam.teamName}에 실시간 수사 지시/피드백 전송
                </h4>
              </div>
              <button
                onClick={() => setDirectHintTeam(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pedagogical Scaffolding Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-cyan-300">💡 비계 설정 발문 프리셋 (클릭 시 자동 입력):</label>
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {PEDAGOGICAL_HINT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDirectHintInput(preset)}
                    className="p-2 text-left text-xs bg-slate-800 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-200 rounded-xl border border-slate-700 hover:border-cyan-500/40 transition"
                  >
                    • {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">학생 화면으로 전송할 지도 메시지:</label>
              <textarea
                rows={3}
                value={directHintInput}
                onChange={(e) => setDirectHintInput(e.target.value)}
                placeholder="모둠 화면 상단에 실시간으로 표시될 힌트 메시지를 입력하세요..."
                className="w-full p-3 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDirectHintTeam(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (directHintTeam && directHintInput.trim()) {
                    await sendDirectTeacherHint(directHintTeam.id, directHintInput.trim());
                    setDirectHintTeam(null);
                    setDirectHintInput('');
                    alert(`${directHintTeam.teamName}에 실시간 지시가 전송되었습니다.`);
                  }
                }}
                disabled={!directHintInput.trim()}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 rounded-xl text-xs font-black transition shadow-lg flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>지시 메시지 전송</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Presentation Viewer Modal */}
      {showTeacherPresentation && (() => {
        const pTeam = liveTeams.find((t) => t.id === presentingTeamId) || liveTeams[0];
        if (!pTeam) return null;
        const pInv = investigationsMap[pTeam.id] || { teamId: pTeam.id, updatedAt: Date.now() };
        const pEvList = allEvidence.filter((e) => e.teamId === pTeam.id);
        const pMembers = liveStudents.filter((s) => s.teamId === pTeam.id);

        return (
          <PresentationViewer
            room={liveRoom}
            team={pTeam}
            investigation={pInv}
            evidenceList={pEvList}
            teamMembers={pMembers}
            currentSlideIndex={liveRoom.presentationState?.slideIndex || 0}
            isPresenter={true}
            onSlideChange={async (newIndex) => {
              await updateRoomPresentation(liveRoom.id, {
                active: true,
                teamId: pTeam.id,
                slideIndex: newIndex,
                allowStudentControl: true,
              });
            }}
            onClose={() => setShowTeacherPresentation(false)}
          />
        );
      })()}

    </div>
  );
};
