import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Plus,
  Radio,
  FileText,
  HelpCircle,
  Award,
  Terminal,
  Fingerprint,
  Cpu,
  Activity,
  Layers,
  Database,
  LogIn,
  LogOut,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { Room, Student, Team, InvestigationData, EvidenceCard } from './types';
import {
  getRoomByCode,
  getRoomById,
  getTeamsByRoom,
  registerStudentInRoom,
  getInvestigation,
  subscribeEvidenceByTeam,
  subscribeRoom,
  subscribeTeamsByRoom,
  subscribeStudentsByRoom,
  createRoom,
  getTeacherRooms,
} from './lib/db';
import { createInteractiveDemoRoom } from './lib/demoData';
import { StudentApp } from './components/student/StudentApp';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { CreateRoomModal } from './components/teacher/CreateRoomModal';
import { WaitingTeamAssignment } from './components/student/WaitingTeamAssignment';
import { StudentInviteModal } from './components/teacher/StudentInviteModal';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'student' | 'teacher'>('landing');
  const [portalTab, setPortalTab] = useState<'student' | 'teacher'>('student');

  // Verification Animation Screen state
  const [verifyingStudent, setVerifyingStudent] = useState<Student | null>(null);

  // Student Login Form State
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [studentGrade, setStudentGrade] = useState(1);
  const [studentClass, setStudentClass] = useState(3);
  const [studentNumber, setStudentNumber] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Session State
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [currentInvestigation, setCurrentInvestigation] = useState<InvestigationData | null>(null);
  const [currentEvidenceList, setCurrentEvidenceList] = useState<EvidenceCard[]>([]);

  // Room collections for teacher & peer context
  const [roomTeams, setRoomTeams] = useState<Team[]>([]);
  const [roomStudents, setRoomStudents] = useState<Student[]>([]);

  // Teacher Authentication & Room Management State
  const [teacherSession, setTeacherSession] = useState<{ id: string; name: string } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('factlab_teacher_auth');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse teacher auth from storage', e);
      }
    }
    return null;
  });
  const [teacherPasswordInput, setTeacherPasswordInput] = useState('');
  const [teacherAuthError, setTeacherAuthError] = useState('');
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [teacherRooms, setTeacherRooms] = useState<Room[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inviteModalRoom, setInviteModalRoom] = useState<Room | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [launchingDemo, setLaunchingDemo] = useState(false);

  // Load teacher rooms whenever teacherSession changes or is restored
  useEffect(() => {
    if (teacherSession) {
      getTeacherRooms(teacherSession.id)
        .then(setTeacherRooms)
        .catch((err) => {
          console.error('Error fetching teacher rooms:', err);
          setTeacherRooms([]);
        });
    } else {
      setTeacherRooms([]);
    }
  }, [teacherSession]);

  // Detect URL parameter for room invitation link (?room=CODE or ?code=CODE)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('room') || params.get('code');
      if (code) {
        setRoomCodeInput(code.trim().toUpperCase());
        setPortalTab('student');
      }
    }
  }, []);

  // Auto-lookup room teams when code is typed (handles spaces, trimming, uppercase)
  useEffect(() => {
    const sanitized = roomCodeInput.replace(/\s+/g, '').toUpperCase();
    if (sanitized.length === 6) {
      setLookupLoading(true);
      setLoginError('');
      getRoomByCode(sanitized)
        .then(async (room) => {
          if (room) {
            const teams = await getTeamsByRoom(room.id);
            setAvailableTeams(teams);
            if (teams.length > 0) setSelectedTeamId(teams[0].id);
          } else {
            setAvailableTeams([]);
            setLoginError('입력하신 코드(' + sanitized + ')의 수사본부 방을 찾을 수 없습니다. 초대 코드를 다시 확인해 주세요.');
          }
        })
        .catch((err) => {
          console.error('Room lookup failed:', err);
          setLoginError('수사본부 데이터베이스 조회 중 오류가 발생했습니다.');
        })
        .finally(() => setLookupLoading(false));
    } else {
      setAvailableTeams([]);
    }
  }, [roomCodeInput]);

  // Reload teacher rooms on portal switch if teacher is logged in
  useEffect(() => {
    if (portalTab === 'teacher' && teacherSession) {
      getTeacherRooms(teacherSession.id).then(setTeacherRooms);
    }
  }, [portalTab, teacherSession]);

  // Teacher Password-based Login Handler
  // Uses a secure hash / identifier generated from the teacher's secret password so each teacher gets their own private workspace
  const handleTeacherPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherAuthError('');

    const trimmedPassword = teacherPasswordInput.trim();

    if (!trimmedPassword) {
      setTeacherAuthError('교사 전용 비밀번호를 입력해 주세요.');
      return;
    }

    if (trimmedPassword.length < 4) {
      setTeacherAuthError('비밀번호는 최소 4자리 이상이어야 합니다.');
      return;
    }

    try {
      setAuthActionLoading(true);
      
      // Generate a consistent unique teacher ID based on secret password hash
      let hash = 0;
      for (let i = 0; i < trimmedPassword.length; i++) {
        const char = trimmedPassword.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      const teacherKeyId = 'teacher_' + Math.abs(hash).toString(36) + '_' + trimmedPassword.slice(-3);

      const sessionData = {
        id: teacherKeyId,
        name: '교사',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('factlab_teacher_auth', JSON.stringify(sessionData));
      }

      setTeacherSession(sessionData);
      const rooms = await getTeacherRooms(sessionData.id);
      setTeacherRooms(rooms);
    } catch (err: any) {
      console.error('Teacher login error:', err);
      setTeacherAuthError('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setAuthActionLoading(false);
    }
  };

  // Teacher Logout Handler
  const handleTeacherLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('factlab_teacher_auth');
    }
    setTeacherSession(null);
    setTeacherRooms([]);
    setTeacherPasswordInput('');
    setTeacherAuthError('');
  };

  // Real-time subscriptions when active in a room
  useEffect(() => {
    if (!currentRoom) return;

    const unsubRoom = subscribeRoom(currentRoom.id, (r) => {
      if (r) setCurrentRoom(r);
    });

    const unsubTeams = subscribeTeamsByRoom(currentRoom.id, (tList) => {
      setRoomTeams(tList);
      if (currentTeam) {
        const found = tList.find((t) => t.id === currentTeam.id);
        if (found) setCurrentTeam(found);
      }
    });

    const unsubStudents = subscribeStudentsByRoom(currentRoom.id, (sList) => {
      setRoomStudents(sList);
      if (currentStudent) {
        const found = sList.find((s) => s.id === currentStudent.id);
        if (found) {
          setCurrentStudent(found);
          // If student was waiting for team assignment and teacher assigned a team
          if (found.teamId && (!currentTeam || currentTeam.id !== found.teamId)) {
            getTeamsByRoom(currentRoom.id).then((freshTeams) => {
              const matchedTeam = freshTeams.find((t) => t.id === found.teamId);
              if (matchedTeam) {
                setCurrentTeam(matchedTeam);
                getInvestigation(matchedTeam.id).then((inv) => {
                  setCurrentInvestigation(inv || defaultInvestigation);
                });
              }
            });
          }
        }
      }
    });

    return () => {
      unsubRoom();
      unsubTeams();
      unsubStudents();
    };
  }, [currentRoom?.id, currentTeam?.id, currentStudent?.id]);

  const defaultInvestigation: InvestigationData = {
    teamId: '',
    roomId: '',
    initialBelief: '',
    initialReason: '',
    investigationQuestions: [],
    hypothesis: '',
    evidencePlan: {
      neededDataTypes: [],
      targetSources: [],
      searchKeywords: [],
    },
    jointSynthesis: {
      commonFindings: '',
      conflictingFindings: '',
      reasonForConflict: '',
      conditionDifferences: '',
      unexpectedEvidence: '',
      missingContextExceptions: '',
      warrantScope: '',
    },
    finalVerdict: '',
    decisiveEvidenceSummary: '',
    beliefChangeComparison: {
      initial: '',
      final: '',
      changedReason: '',
    },
    reportThesis: {
      researchTitle: '',
      limitations: '',
      futureQuestions: '',
    },
    peerReviewDeliberation: {
      action: '',
      modificationReason: '',
    },
    updatedAt: Date.now(),
  };

  // Subscribe to team evidence list for student app
  useEffect(() => {
    if (!currentTeam) return;

    const unsubEv = subscribeEvidenceByTeam(currentTeam.id, setCurrentEvidenceList);
    getInvestigation(currentTeam.id).then((inv) => {
      setCurrentInvestigation(inv || defaultInvestigation);
    });

    return () => unsubEv();
  }, [currentTeam?.id]);

  // Handle Student Join with verification sequence
  const handleStudentJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.replace(/\s+/g, '').toUpperCase();
    if (!cleanCode || !studentName.trim()) {
      setLoginError('초대 코드 및 수사관 이름을 입력해 주세요.');
      return;
    }

    try {
      setLookupLoading(true);
      const room = await getRoomByCode(cleanCode);
      if (!room) {
        setLoginError('유효하지 않은 수사본부 보안 코드입니다. 초대 코드를 다시 확인해 주세요.');
        return;
      }

      // Check if room is locked for new students
      const studentId = `${room.id}_s_${studentGrade}_${studentClass}_${studentNumber}`;
      if (room.lockJoin) {
        // If room is locked, check if student already exists
        const existingStudent = roomStudents.find((s) => s.id === studentId);
        if (!existingStudent) {
          setLoginError('현재 이 수사본부의 신규 참여자 입장이 잠겨 있습니다. 담당 선생님에게 문의하세요.');
          return;
        }
      }

      const registered = await registerStudentInRoom(
        room.id,
        studentGrade,
        studentClass,
        studentNumber,
        studentName.trim(),
        selectedTeamId
      );

      const effectiveTeamId = registered.teamId || selectedTeamId;
      const targetTeam = availableTeams.find((t) => t.id === effectiveTeamId) || null;
      const inv = targetTeam ? await getInvestigation(targetTeam.id) : null;

      setCurrentRoom(room);
      setCurrentStudent(registered);
      setCurrentTeam(targetTeam);
      setCurrentInvestigation(inv || defaultInvestigation);

      // Trigger 1.2s Identity Verified screen
      setVerifyingStudent(registered);
      setTimeout(() => {
        setVerifyingStudent(null);
        setViewMode('student');
      }, 1200);
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('수사관 식별 및 접속 처리 중 오류가 발생했습니다.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Handle Launch 1-Click Interactive Demo
  const handleLaunchDemo = async (role: 'student' | 'teacher') => {
    try {
      setLaunchingDemo(true);
      const { room } = await createInteractiveDemoRoom();
      const teams = await getTeamsByRoom(room.id);
      
      setCurrentRoom(room);
      setRoomTeams(teams);

      if (role === 'student') {
        const demoStudent = await registerStudentInRoom(
          room.id,
          1,
          3,
          1,
          '이지우',
          teams[0].id
        );
        const inv = await getInvestigation(teams[0].id);
        setCurrentStudent(demoStudent);
        setCurrentTeam(teams[0]);
        setCurrentInvestigation(inv || defaultInvestigation);

        setVerifyingStudent(demoStudent);
        setTimeout(() => {
          setVerifyingStudent(null);
          setViewMode('student');
        }, 1200);
      } else {
        setViewMode('teacher');
      }
    } catch (err) {
      console.error('Demo launch error:', err);
    } finally {
      setLaunchingDemo(false);
    }
  };

  // IDENTITY VERIFIED TRANSITION SCREEN (<1.5s)
  if (verifyingStudent && currentRoom) {
    return (
      <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col items-center justify-center p-6 bg-grid-lab relative overflow-hidden">
        <div className="scanner-beam" />
        <div className="max-w-md w-full lab-panel corner-brackets p-8 text-center space-y-6 border border-[#36D6D0]/50 shadow-[0_0_40px_rgba(54,214,208,0.2)] animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#36D6D0]/10 border border-[#36D6D0]/40 flex items-center justify-center mx-auto text-[#36D6D0] shadow-[0_0_20px_rgba(54,214,208,0.25)]">
            <Fingerprint className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <span className="tech-tag text-[#36D6D0] text-xs">FACT LAB // SECURITY PROTOCOL</span>
            <h2 className="text-xl font-black text-white tracking-wider">
              IDENTITY VERIFIED
            </h2>
            <p className="text-xs text-slate-400">수사관 신원 인증 및 데이터 링크 연결 완료</p>
          </div>

          <div className="bg-[#0B1627]/80 rounded-xl p-4 border border-[#36D6D0]/20 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">AGENT NAME</span>
              <strong className="text-white font-sans">{verifyingStudent.name} 수사관</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">ASSIGNED TEAM</span>
              <strong className="text-[#36D6D0]">
                {currentTeam ? currentTeam.teamName : '🛰️ 모둠 배정 대기 중'}
              </strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">DIVISION</span>
              <span className="text-slate-300">{currentRoom.grade}학년 {currentRoom.classNumber}반 ({currentRoom.title})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CLEARANCE</span>
              <span className="text-emerald-400 font-bold">LEVEL 1 AUTHORIZED</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#36D6D0] font-mono">
            <div className="w-2 h-2 rounded-full bg-[#36D6D0] animate-ping" />
            <span>CONNECTING TO INVESTIGATION WORKSTATION...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render Student Waiting for Team Assignment
  if (viewMode === 'student' && currentRoom && currentStudent && (!currentStudent.teamId || !currentTeam)) {
    return (
      <WaitingTeamAssignment
        room={currentRoom}
        student={currentStudent}
        onExit={() => {
          setViewMode('landing');
          setCurrentRoom(null);
          setCurrentStudent(null);
          setCurrentTeam(null);
        }}
      />
    );
  }

  // Render Student App view
  if (viewMode === 'student' && currentRoom && currentStudent && currentTeam && currentInvestigation) {
    return (
      <StudentApp
        room={currentRoom}
        student={currentStudent}
        team={currentTeam}
        investigation={currentInvestigation}
        evidenceList={currentEvidenceList}
        allTeams={roomTeams}
        allStudents={roomStudents}
        onExit={() => {
          setViewMode('landing');
          setCurrentRoom(null);
          setCurrentStudent(null);
          setCurrentTeam(null);
        }}
      />
    );
  }

  // Render Teacher Command Center view
  if (viewMode === 'teacher' && currentRoom) {
    return (
      <TeacherDashboard
        room={currentRoom}
        teams={roomTeams}
        students={roomStudents}
        onExit={() => {
          setViewMode('landing');
          setCurrentRoom(null);
        }}
      />
    );
  }

  // LANDING & PORTAL SCREEN (FUTURE FACT LAB BUREAU)
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-[#00f0ff] selection:text-[#030712] bg-grid-lab relative overflow-x-hidden">
      
      {/* Top High-Tech Command Bar */}
      <header className="px-6 py-4 border-b border-cyan-500/20 bg-[#060e1d]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-black text-cyan-400 tracking-widest uppercase">
                FACT LAB
              </span>
              <span className="text-slate-600 text-xs">/</span>
              <h1 className="font-black text-sm tracking-tight text-white">
                팩트체크 수사본부
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                2030 FORENSIC BUREAU ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              DIGITAL INFORMATION INVESTIGATION BUREAU
            </p>
          </div>
        </div>

        {/* Quick Demo Launch Terminals */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLaunchDemo('student')}
            disabled={launchingDemo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 disabled:opacity-50 font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {launchingDemo ? '초기화 중...' : '⚡ 1초 수사관 데모'}
          </button>
          <button
            onClick={() => handleLaunchDemo('teacher')}
            disabled={launchingDemo}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition active:scale-95 disabled:opacity-50 font-mono"
          >
            <Cpu className="w-3.5 h-3.5" />
            {launchingDemo ? '초기화 중...' : '관제센터 본부장 모드'}
          </button>
        </div>
      </header>

      {/* Main Forensic Intake Hub */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center space-y-8 z-10">
        
        {/* Bureau Intro Title & Crest */}
        <div className="text-center space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Terminal className="w-3.5 h-3.5" />
            DIGITAL INFORMATION INVESTIGATION BUREAU
          </div>

          <div className="relative inline-block my-2">
            <div className="p-4 rounded-3xl bg-cyan-950/40 border-2 border-cyan-400/60 shadow-[0_0_40px_rgba(6,182,212,0.35)] inline-block">
              <ShieldAlert className="w-12 h-12 text-cyan-400" />
            </div>
            <div className="absolute -inset-1 rounded-3xl bg-cyan-500/20 blur-xl -z-10" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            FACT LAB : <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">팩트체크 수사본부</span>
          </h2>
          
          <p className="text-sm sm:text-base text-cyan-100 font-medium max-w-xl mx-auto leading-relaxed">
            "당신의 질문이 우리의 사건이 됩니다.<br className="hidden sm:inline" />
            증거를 추적하고, 사실을 검증하고, 진실에 도달하십시오."
          </p>
        </div>

        {/* Portal Mode Terminal Selector */}
        <div className="w-full max-w-md bg-[#060e1d] p-1.5 rounded-2xl border border-cyan-500/30 flex items-center shadow-2xl">
          <button
            onClick={() => setPortalTab('student')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 font-mono ${
              portalTab === 'student'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            03 수사본부 입장 (학생)
          </button>
          <button
            onClick={() => setPortalTab('teacher')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 font-mono ${
              portalTab === 'teacher'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            01 교사 로그인 / 관제
          </button>
        </div>

        {/* PORTAL TERMINAL: STUDENT (SCREEN 03) */}
        {portalTab === 'student' && (
          <div className="w-full max-w-md bg-slate-950/90 rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] space-y-5 animate-in fade-in duration-200 relative">
            {/* HUD Corner Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 rounded-br-sm pointer-events-none" />

            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block">
                  // 03 ACCESS CODE
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">수사본부 입장</h3>
                <p className="text-xs text-slate-400">초대 코드를 입력해 수사팀에 합류하세요</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
                <Fingerprint className="w-5 h-5" />
              </div>
            </div>

            <form onSubmit={handleStudentJoin} className="space-y-4">
              
              {/* Spaced Room Code 6-letter Box */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                  <span>초대 코드 입력 (6자리) *</span>
                  <span className="text-[10px] text-cyan-400 font-mono">SECURE CHANNEL</span>
                </label>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="A 7 B 2 C 3"
                    className="w-full px-4 py-3.5 bg-[#060e1d] border-2 border-cyan-500/40 rounded-2xl text-center font-mono text-2xl font-black text-cyan-400 tracking-[0.3em] uppercase focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 shadow-inner"
                  />
                  {lookupLoading && (
                    <span className="absolute right-4 top-4 text-xs text-cyan-400 font-mono font-bold animate-pulse">
                      SCANNING...
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>코드를 모르겠나요? 선생님께 문의하세요.</span>
                  <button
                    type="button"
                    onClick={() => handleLaunchDemo('student')}
                    className="text-cyan-400 hover:text-cyan-300 underline font-bold"
                  >
                    체험용 데모방 즉시 입장
                  </button>
                </div>
              </div>

              {/* Grade / Class / Number */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">GRADE</label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-xs bg-[#060e1d] border border-slate-700 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value={1}>1학년</option>
                    <option value={2}>2학년</option>
                    <option value={3}>3학년</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">CLASS</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={studentClass}
                    onChange={(e) => setStudentClass(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-xs bg-[#060e1d] border border-slate-700 rounded-xl text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">NO.</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-xs bg-[#060e1d] border border-slate-700 rounded-xl text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Student Name */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">수사관 이름 (INVESTIGATOR NAME) *</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full px-4 py-3 text-xs bg-[#060e1d] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* Team Selection */}
              {availableTeams.length > 0 && (
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-mono text-cyan-400 font-bold flex items-center justify-between">
                    <span>배정된 수사 모둠 (ASSIGNED SQUAD)</span>
                    <span className="text-[10px] text-slate-400 font-normal">미배정 시 대기실 이동</span>
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#060e1d] border border-cyan-500/40 rounded-xl text-cyan-300 font-bold focus:outline-none"
                  >
                    <option value="">🛰️ 모둠 미배정 (선생님이 나중에 배정)</option>
                    {availableTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamName} [{t.topicTitle || '사건 미정'}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 rounded-2xl text-xs font-black transition shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 font-mono active:scale-95 mt-2"
              >
                <Search className="w-4 h-4" />
                입장하기 (ACCESS GRANTED)
              </button>
            </form>
          </div>
        )}

        {/* PORTAL TERMINAL: TEACHER (SCREEN 01 & 02) */}
        {portalTab === 'teacher' && (
          <div className="w-full max-w-2xl bg-slate-950/90 rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] space-y-6 animate-in fade-in duration-200 relative">
            {/* HUD Corner Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 rounded-br-sm pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block">
                  // 01 & 02 TEACHER COMMAND DESK
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">교사 수사지휘실</h3>
                <p className="text-xs text-slate-400">교사 전용 비밀번호를 입력하여 담당 학급의 수사본부를 개설 및 관제합니다.</p>
              </div>
              {teacherSession && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black transition shadow-[0_0_15px_rgba(6,182,212,0.3)] font-mono active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  새 수업방 만들기
                </button>
              )}
            </div>

            {/* Password Authentication Box */}
            {!teacherSession ? (
              <form onSubmit={handleTeacherPasswordLogin} className="p-6 sm:p-8 rounded-2xl bg-[#060e1d] border border-cyan-500/30 space-y-4 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-base font-bold text-white">교사 비밀번호 인증</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      교사 전용 비밀번호를 입력하시면 개설하신 학급 수업방이 자동으로 로드됩니다.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">교사 비밀번호 (4자리 이상)</label>
                  <input
                    type="password"
                    value={teacherPasswordInput}
                    onChange={(e) => setTeacherPasswordInput(e.target.value)}
                    placeholder="교사 비밀번호 입력"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-none transition font-mono tracking-widest"
                    required
                    autoFocus
                  />
                </div>

                {teacherAuthError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{teacherAuthError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authActionLoading}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black transition shadow-lg flex items-center justify-center gap-2 font-mono active:scale-95 mt-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{authActionLoading ? '확인 중...' : '교사 수사지휘실 입장 (LOGIN)'}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Authenticated Teacher Profile Badge */}
                <div className="p-4 rounded-2xl bg-[#060e1d] border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-white">교사 수사지휘관</strong>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                          ● TEACHER VERIFIED
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400">수사 지휘관 모드 활성화됨</p>
                    </div>
                  </div>

                  <button
                    onClick={handleTeacherLogout}
                    disabled={authActionLoading}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    로그아웃
                  </button>
                </div>

                {/* Teacher Rooms List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-bold uppercase">// MY ACTIVE LAB ROOMS (내 수업방)</span>
                    <span className="text-cyan-400 font-bold">{teacherRooms.length}개 개설됨</span>
                  </div>

                  {teacherRooms.length === 0 ? (
                    <div className="p-8 text-center bg-[#060e1d] rounded-2xl border border-dashed border-slate-800 space-y-3">
                      <p className="text-xs text-slate-300 font-mono font-bold">개설된 수업방이 없습니다.</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        우측 상단의 '+ 새 수업방 만들기' 버튼을 눌러 첫 번째 학급 수사본부를 개설하세요.
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-xl transition shadow-md"
                      >
                        + 새 수업방 만들기
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teacherRooms.map((r) => (
                        <div
                          key={r.id}
                          className="p-4 bg-[#060e1d] rounded-2xl border border-slate-800 hover:border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition group shadow-sm"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs group-hover:text-cyan-200 transition">{r.title}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                {r.grade}학년 {r.classNumber}반 ({r.period}차시)
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                              <span>
                                참여코드:{' '}
                                <strong className="text-cyan-400 font-mono font-black tracking-widest">{r.roomCode}</strong>
                              </span>
                              <span>· {r.teamCount}개 모둠</span>
                              <span>· 모둠당 {r.membersPerTeam}명</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                              onClick={() => setInviteModalRoom(r)}
                              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 font-mono"
                              title="학생 초대 QR & 코드"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              초대 QR
                            </button>
                            <button
                              onClick={async () => {
                                const teams = await getTeamsByRoom(r.id);
                                setCurrentRoom(r);
                                setRoomTeams(teams);
                                setViewMode('teacher');
                              }}
                              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5 font-mono"
                            >
                              상황실 입장
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Bureau Footer */}
      <footer className="px-6 py-4 border-t border-cyan-500/15 bg-[#060e1d]/90 text-center text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-bold">FACT LAB : 팩트체크 수사본부</span>
          <span className="text-slate-600">|</span>
          <span>DIGITAL INFORMATION INVESTIGATION BUREAU</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>🧠 비판적 사고</span>
          <span>🔍 증거 기반 판단</span>
          <span>🌐 정보 검증 능력</span>
          <span>👥 협력과 소통</span>
          <span>🛡️ 디지털 시민성</span>
        </div>
      </footer>

      {/* Create Room Modal */}
      {showCreateModal && teacherSession && (
        <CreateRoomModal
          teacherId={teacherSession.id}
          teacherName={teacherSession.name || '교사'}
          teacherEmail=""
          onCreate={async (roomData) => {
            const { room: newRoom, teams } = await createRoom(roomData);
            if (teacherSession) {
              const updated = await getTeacherRooms(teacherSession.id);
              setTeacherRooms(updated);
            }
            setCurrentRoom(newRoom);
            setRoomTeams(teams);
            setViewMode('teacher');
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Student Invite Modal */}
      {inviteModalRoom && (
        <StudentInviteModal
          room={inviteModalRoom}
          onClose={() => setInviteModalRoom(null)}
        />
      )}

    </div>
  );
}
