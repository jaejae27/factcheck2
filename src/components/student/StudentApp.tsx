import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Search,
  FileText,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Bot,
  HelpCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  Award,
  Users,
  Eye,
  Sliders,
  RotateCcw,
  Check,
  Send,
  MessageSquare,
  BookOpen,
  Scale,
} from 'lucide-react';
import {
  Room,
  Student,
  Team,
  InvestigationData,
  EvidenceCard,
  StudentRole,
  VerdictType,
  TopicItem,
  PeerReview,
  StudentReflection,
} from '../../types';
import { FACT_CHECK_TOPICS, TOPIC_CATEGORIES, ROLE_DEFINITIONS } from '../../data/topics';
import {
  updateStudentRole,
  updateTeam,
  saveInvestigation,
  addEvidenceCard,
  updateEvidenceCard,
  deleteEvidenceCard,
  sendHelpRequest,
  submitPeerReview,
  submitStudentReflection,
  getPeerReviewsForTeam,
} from '../../lib/db';
import { InterestSurveyModal } from './InterestSurveyModal';
import { EvidenceCardModal } from './EvidenceCardModal';
import { PresentationViewer } from './PresentationViewer';
import { QuickOnboardingModal } from './QuickOnboardingModal';
import { ReportModal } from '../common/ReportExporter';
import { BACKGROUNDS } from '../../assets/backgrounds';
import { Step1CaseIntake } from './steps/Step1CaseIntake';
import { Step2Questions } from './steps/Step2Questions';
import { Step3EvidenceCollection } from './steps/Step3EvidenceCollection';
import { Step4Verification } from './steps/Step4Verification';
import { Step5JointVerdict } from './steps/Step5JointVerdict';
import { Step6BriefingReflection } from './steps/Step6BriefingReflection';

interface StudentAppProps {
  room: Room;
  student: Student;
  team: Team;
  investigation: InvestigationData;
  evidenceList: EvidenceCard[];
  allTeams: Team[];
  allStudents: Student[];
  onExit: () => void;
}

export const StudentApp: React.FC<StudentAppProps> = ({
  room,
  student,
  team,
  investigation,
  evidenceList,
  allTeams,
  allStudents,
  onExit,
}) => {
  // Step state (1 to 12)
  const initialStep = room.activeStep || team.currentStep || 1;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');

  // Quick Onboarding for late-joining students (modal remains off unless opened)
  const [showQuickOnboarding, setShowQuickOnboarding] = useState(false);

  // Reconnection feedback toast
  const [showReconnectBanner, setShowReconnectBanner] = useState(Boolean(student.isReconnected));

  useEffect(() => {
    if (showReconnectBanner) {
      const t = setTimeout(() => setShowReconnectBanner(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showReconnectBanner]);

  // Modals state
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [editingCard, setEditingCard] = useState<EvidenceCard | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLivePresentation, setShowLivePresentation] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpReasonInput, setHelpReasonInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Peer review target & form state
  const [peerTargetTeamId, setPeerTargetTeamId] = useState('');
  const [peerScores, setPeerScores] = useState({
    appropriateSources: 5,
    crossVerification: 5,
    counterEvidenceCheck: 5,
    evidenceBasedVerdict: 5,
    clarityAndUnderstanding: 5,
  });
  const [peerQuestion, setPeerQuestion] = useState('');
  const [peerQuestionCategory, setPeerQuestionCategory] = useState<PeerReview['questionCategory']>('source');
  const [receivedPeerReviews, setReceivedPeerReviews] = useState<PeerReview[]>([]);
  const [peerSubmitted, setPeerSubmitted] = useState(false);

  // Reflection form state
  const [reflectionData, setReflectionData] = useState<Omit<StudentReflection, 'id' | 'submittedAt'>>({
    roomId: room.id,
    studentId: student.id,
    studentName: student.name,
    studentNumber: student.studentNumber,
    teamId: team.id,
    teamNumber: team.teamNumber,
    role: student.role || 'source_tracker',
    bestActivity: '',
    keyEvidenceFound: '',
    beliefChangeLevel: 'little',
    beliefChangeReason: '',
    hardestPart: '',
    futureFactCheckHabit: '',
    selfRatings: {
      roleResponsibility: 5,
      activeInvestigation: 5,
      counterEvidenceOpenness: 5,
      teamCollaboration: 5,
      opinionFlexibility: 5,
    },
    newLearning: '',
    remainingQuestion: '',
  });
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);

  // Local form buffer for auto-saving investigation data with local storage backup
  const [localInv, setLocalInv] = useState<InvestigationData>(() => {
    if (typeof window !== 'undefined' && team?.id) {
      try {
        const localDraftStr = localStorage.getItem(`factlab_inv_${team.id}`);
        if (localDraftStr) {
          const parsed = JSON.parse(localDraftStr);
          if (parsed && (parsed.updatedAt || 0) >= (investigation?.updatedAt || 0)) {
            return { ...investigation, ...parsed };
          }
        }
      } catch (e) {
        console.warn('Failed to load local draft', e);
      }
    }
    return investigation;
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (investigation) {
      setLocalInv((prev) => {
        // Keep local edits if they are newer
        if ((prev.updatedAt || 0) > (investigation.updatedAt || 0)) {
          return prev;
        }
        return investigation;
      });
    }
  }, [investigation]);

  // Flush auto-save on page exit or beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (localInv && team?.id) {
        try {
          localStorage.setItem(`factlab_inv_${team.id}`, JSON.stringify(localInv));
          saveInvestigation(team.id, localInv).catch(() => {});
        } catch (e) {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [localInv, team?.id]);

  // Load received peer reviews when entering step 6
  useEffect(() => {
    if (currentStep >= 5) {
      getPeerReviewsForTeam(room.id, team.id).then(setReceivedPeerReviews);
    }
  }, [currentStep, room.id, team.id]);

  // Trigger celebration on Case Closed
  useEffect(() => {
    if (currentStep === 6 && reflectionSubmitted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [currentStep, reflectionSubmitted]);

  // Auto-Save helper with debounce and local storage backup
  const triggerAutoSave = (updates: Partial<InvestigationData>) => {
    setSaveStatus('saving');
    const merged = { ...localInv, ...updates, updatedAt: Date.now() };
    setLocalInv(merged);

    // Save immediate local draft
    if (typeof window !== 'undefined' && team?.id) {
      try {
        localStorage.setItem(`factlab_inv_${team.id}`, JSON.stringify(merged));
      } catch (e) {
        console.warn('Local draft write failed', e);
      }
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveInvestigation(team.id, updates);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Auto save error:', err);
        setSaveStatus('offline');
      }
    }, 600);
  };

  const handleStepChange = async (newStep: number) => {
    setCurrentStep(newStep);
    const progressPercent = Math.min(100, Math.round((newStep / 6) * 100));
    await updateTeam(team.id, {
      currentStep: newStep,
      progressPercent,
    });
  };

  const handleSelectRole = async (role: StudentRole) => {
    await updateStudentRole(student.id, role, team.id);
  };

  const handleSelectTopic = async (topic: TopicItem) => {
    await updateTeam(team.id, {
      topicId: topic.id,
      topicTitle: topic.title,
      claim: topic.claim,
    });
    triggerAutoSave({
      hypothesis: `"${topic.claim}"라는 주장은 실제 연구와 공식 통계에 비추어 볼 때 타당한가?`,
    });
    setShowSurveyModal(false);
  };

  const handleSendHelp = async () => {
    if (!helpReasonInput.trim()) return;
    await sendHelpRequest(
      room.id,
      team.id,
      team.teamNumber,
      student.id,
      student.name,
      helpReasonInput.trim()
    );
    setHelpReasonInput('');
    setShowHelpModal(false);
  };

  const handlePeerReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!peerTargetTeamId || !peerQuestion.trim()) return;
    const avg = (Object.values(peerScores) as number[]).reduce((a: number, b: number) => a + b, 0) / 5;
    await submitPeerReview({
      roomId: room.id,
      fromTeamId: team.id,
      fromStudentId: student.id,
      fromStudentName: student.name,
      targetTeamId: peerTargetTeamId,
      scores: peerScores,
      averageScore: Number(avg.toFixed(1)),
      peerQuestion: peerQuestion.trim(),
      questionCategory: peerQuestionCategory,
    });
    setPeerSubmitted(true);
  };


  const handleReflectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitStudentReflection({
      ...reflectionData,
      role: student.role || 'source_tracker',
    });
    setReflectionSubmitted(true);
  };

  const teamMembers = allStudents.filter((s) => s.teamId === team.id);
  const currentRoleDef = student.role ? ROLE_DEFINITIONS[student.role] : null;

  // Render Synchronized Presentation Mode if Presentation is active in room or requested
  const isPresentationActive = showLivePresentation || Boolean(room.presentationState?.active);
  const presentingTeam = (room.presentationState?.teamId && allTeams.find((t) => t.id === room.presentationState.teamId)) || team;

  if (isPresentationActive) {
    const isPresenter = student.role === 'briefing_officer' && presentingTeam.id === team.id;
    return (
      <PresentationViewer
        room={room}
        team={presentingTeam}
        investigation={presentingTeam.id === team.id ? localInv : ({} as InvestigationData)}
        evidenceList={presentingTeam.id === team.id ? evidenceList : []}
        teamMembers={allStudents.filter((s) => s.teamId === presentingTeam.id)}
        currentSlideIndex={room.presentationState?.slideIndex || 0}
        isPresenter={isPresenter}
        onClose={() => setShowLivePresentation(false)}
        onStartPeerReview={() => {
          setShowLivePresentation(false);
          handleStepChange(6);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col relative overflow-x-hidden">
      
      {/* Reconnection Success Floating Banner */}
      {showReconnectBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-emerald-950 border border-emerald-400 text-emerald-200 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>✓ 다시 접속했습니다. 이전 수사 기록과 모둠 정보를 안전하게 불러왔습니다.</span>
        </div>
      )}

      {/* Layer 0: Subtle Thematic Watermark (Non-interfering, z-index 0) */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-10"
        style={{ 
          backgroundImage: `url(${
            currentStep >= 3 && currentStep <= 4
              ? BACKGROUNDS.evidenceBoard
              : currentStep >= 5
              ? BACKGROUNDS.briefingHall
              : BACKGROUNDS.portal
          })` 
        }}
      />
      {/* Layer 1: Solid Dark Base Guard (z-index 1) */}
      <div className="fixed inset-0 z-1 bg-[#07111F]/80 pointer-events-none" />

      {/* Layer 10: ACTUAL APPLICATION UI (z-index 10) */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Dossier Navigation */}
        <header className="sticky top-0 z-40 bg-[#0c1a30] border-b border-cyan-500/40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white tracking-tight">
                  {team.teamName} 수사철
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0d2242] text-cyan-200 border border-cyan-500/40">
                  {room.grade}학년 {room.classNumber}반 · {student.studentNumber}번 {student.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                사건: {team.topicTitle || '사건 접수 대기 중'}
              </p>
            </div>
          </div>

          {/* Right Status & Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Save Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b1b36] border border-cyan-500/30 text-[10px] font-bold text-slate-200">
              {saveStatus === 'saving' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  수사일지 기록 중...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  저장 완료
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  오프라인
                </>
              )}
            </div>

            {/* SOS Help Request */}
            <button
              onClick={() => setShowHelpModal(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
                team.helpRequested
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-500/50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-rose-300" />
              <span>{team.helpRequested ? '도움 요청 중...' : '수사 지원 요청'}</span>
            </button>

            <button
              onClick={onExit}
              className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition font-bold"
            >
              나가기
            </button>
          </div>
        </header>

        {/* 6-Step Progress Stepper - Ultra Crisp and Legible */}
        <div className="bg-[#081528] border-b border-cyan-500/20 px-4 sm:px-8 py-2.5 overflow-x-auto select-none shadow-sm">
          <div className="flex items-center gap-2 min-w-max">
            {[
              { step: 1, num: '01', label: '사건 접수' },
              { step: 2, num: '02', label: '수사 질문' },
              { step: 3, num: '03', label: '증거 수집' },
              { step: 4, num: '04', label: '증거 검증' },
              { step: 5, num: '05', label: '합동수사·판정' },
              { step: 6, num: '06', label: '브리핑·성찰' },
            ].map((item) => {
              const isCurrent = currentStep === item.step;
              const isPassed = currentStep > item.step;
              return (
                <button
                  key={item.step}
                  onClick={() => handleStepChange(item.step)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isCurrent
                      ? 'bg-cyan-400 text-slate-950 font-black shadow-md ring-2 ring-cyan-300'
                      : isPassed
                      ? 'bg-[#0e2240] text-cyan-200 border border-cyan-500/40 hover:bg-[#142f56]'
                      : 'bg-[#0a172c] text-slate-200 border border-slate-700/80 hover:text-white hover:bg-[#102444]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isCurrent
                      ? 'bg-slate-950 text-cyan-300'
                      : isPassed
                      ? 'bg-cyan-900 text-cyan-200'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {item.num}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Dossier Content */}
        <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">

          {/* ============================================================ */}
          {/* CANONICAL INVESTIGATION CASE BANNER (Always visible on all steps) */}
          {/* ============================================================ */}
          <div className="bg-gradient-to-b from-[#0f2444] to-[#0a182c] p-5 sm:p-6 rounded-3xl border-2 border-cyan-500/50 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/30 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-400/40 text-[11px] font-black font-mono tracking-wider uppercase">
                  {team.topicId ? `CASE ${team.topicId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}` : `CASE 00${team.teamNumber || 1}`} · TEAM {String(team.teamNumber).padStart(2, '0')}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  우리 모둠의 수사 사건
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-cyan-200 font-bold bg-[#071326] px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                  {student.name} ({currentRoleDef?.title || '수사관'})
                </span>
                {team.helpRequested && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-rose-300 font-bold bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40 animate-pulse">
                    <HelpCircle className="w-3 h-3" />
                    도움 요청 대기 중
                  </span>
                )}
              </div>
            </div>

            {/* Prominent Investigation Topic */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug break-keep drop-shadow">
                “{team.topicTitle || team.claim || '사건 미선택 (STEP 1에서 사건을 접수하세요)'}”
              </h1>
              {team.claim && team.claim !== team.topicTitle && (
                <p className="text-xs sm:text-sm text-cyan-200/90 font-medium leading-relaxed">
                  <span className="font-bold text-cyan-400">의심 주장:</span> {team.claim}
                </p>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* TEACHER DIRECTIVE / HINT BANNER (If present) */}
          {/* ============================================================ */}
          {team.teacherHint && (
            <div className="bg-[#0b2444] border-2 border-cyan-400/70 p-4 rounded-2xl shadow-lg flex items-start gap-3 text-xs animate-in fade-in">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-cyan-300 text-xs tracking-wider uppercase">📡 수사본부 지시 / 피드백 메시지</span>
                  <span className="text-[10px] text-cyan-400 font-mono">실시간</span>
                </div>
                <p className="text-white font-medium leading-relaxed">{team.teacherHint}</p>
              </div>
            </div>
          )}
        
        {/* STEP 1: 사건 접수 & 역할 배정 */}
        {currentStep === 1 && (
          <Step1CaseIntake
            team={team}
            student={student}
            allStudents={allStudents}
            localInv={localInv}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            handleSelectTopic={handleSelectTopic}
            handleSelectRole={handleSelectRole}
            handleStepChange={handleStepChange}
            setShowSurveyModal={setShowSurveyModal}
          />
        )}

        {/* STEP 2: 최초 생각, 수사 질문, 가설 설정 */}
        {currentStep === 2 && (
          <Step2Questions
            team={team}
            topic={FACT_CHECK_TOPICS.find((t) => t.id === team.topicId)}
            localInv={localInv}
            triggerAutoSave={triggerAutoSave}
            handleStepChange={handleStepChange}
            setShowHelpModal={setShowHelpModal}
          />
        )}

        {/* STEP 3: 증거 수집 (Evidence Collection) */}
        {currentStep === 3 && (
          <Step3EvidenceCollection
            team={team}
            localInv={localInv}
            evidenceList={evidenceList}
            triggerAutoSave={triggerAutoSave}
            handleStepChange={handleStepChange}
            setShowEvidenceModal={setShowEvidenceModal}
            setEditingCard={setEditingCard}
            deleteEvidenceCard={deleteEvidenceCard}
          />
        )}

        {/* STEP 4: 증거 검증 (Verification) */}
        {currentStep === 4 && (
          <Step4Verification
            localInv={localInv}
            triggerAutoSave={triggerAutoSave}
            handleStepChange={handleStepChange}
          />
        )}

        {/* STEP 5: 합동수사·판정 (Joint Deliberation & Verdict) */}
        {currentStep === 5 && (
          <Step5JointVerdict
            localInv={localInv}
            triggerAutoSave={triggerAutoSave}
            handleStepChange={handleStepChange}
          />
        )}

        {/* STEP 6: 브리핑·성찰 (Briefing & Reflection) */}
        {currentStep === 6 && (
          <Step6BriefingReflection
            team={team}
            student={student}
            allTeams={allTeams}
            localInv={localInv}
            receivedPeerReviews={receivedPeerReviews}
            peerSubmitted={peerSubmitted}
            peerTargetTeamId={peerTargetTeamId}
            setPeerTargetTeamId={setPeerTargetTeamId}
            peerScores={peerScores}
            setPeerScores={setPeerScores}
            peerQuestionCategory={peerQuestionCategory}
            setPeerQuestionCategory={setPeerQuestionCategory}
            peerQuestion={peerQuestion}
            setPeerQuestion={setPeerQuestion}
            handlePeerReviewSubmit={handlePeerReviewSubmit}
            reflectionSubmitted={reflectionSubmitted}
            reflectionData={reflectionData}
            setReflectionData={setReflectionData}
            handleReflectionSubmit={handleReflectionSubmit}
            handleStepChange={handleStepChange}
            triggerAutoSave={triggerAutoSave}
            setShowLivePresentation={setShowLivePresentation}
            setShowReportModal={setShowReportModal}
          />
        )}

      </main>
      </div>

      {/* MODALS */}
      {showSurveyModal && (
        <InterestSurveyModal
          onSelectTopic={handleSelectTopic}
          onClose={() => setShowSurveyModal(false)}
        />
      )}

      {showEvidenceModal && (
        <EvidenceCardModal
          teamId={team.id}
          roomId={room.id}
          studentId={student.id}
          studentName={student.name}
          studentRole={student.role || 'source_verifier'}
          existingCard={editingCard}
          evidenceNumber={editingCard?.evidenceNumber || evidenceList.length + 1}
          onSave={async (data) => {
            if (editingCard) {
              await updateEvidenceCard(editingCard.id, data);
            } else {
              await addEvidenceCard(data);
            }
          }}
          onClose={() => {
            setShowEvidenceModal(false);
            setEditingCard(null);
          }}
        />
      )}

      {showReportModal && (
        <ReportModal
          room={room}
          team={team}
          investigation={localInv}
          evidenceList={evidenceList}
          teamMembers={teamMembers}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Help Request SOS Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#0a182c] rounded-3xl shadow-2xl p-6 border-2 border-rose-500/50 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <HelpCircle className="w-6 h-6" />
              <h3 className="text-base font-black text-white">수사본부 교사 지원 요청 (SOS)</h3>
            </div>
            <p className="text-xs text-slate-300">
              수사 중 막히는 점이나 선생님의 도움이 필요한 내용을 선택하거나 적어 보내면 교사 관제실로 즉시 전달됩니다.
            </p>

            {/* Quick Preset Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">자주 묻는 질문 빠른 선택:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '무엇을 찾아야 할지 모르겠어요.',
                  '출처를 확인하기 어려워요.',
                  '반대되는 자료를 찾기 어려워요.',
                  '자료를 비교하기 어려워요.',
                  '최종 판단이 어려워요.',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setHelpReasonInput(preset)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#0f274a] hover:bg-cyan-900/60 text-cyan-200 border border-cyan-500/30 transition text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={helpReasonInput}
              onChange={(e) => setHelpReasonInput(e.target.value)}
              placeholder="예: 출처를 찾았는데 원본 논문인지 2차 기사인지 헷갈립니다..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                취소
              </button>
              <button
                onClick={handleSendHelp}
                disabled={!helpReasonInput.trim()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-black transition shadow-md"
              >
                도움 요청 전송
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Onboarding for Late Joining Students */}
      {showQuickOnboarding && (
        <QuickOnboardingModal
          room={room}
          student={student}
          team={team}
          investigation={localInv}
          evidenceList={evidenceList}
          onComplete={() => setShowQuickOnboarding(false)}
        />
      )}

    </div>
  );
};
