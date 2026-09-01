import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Flame,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Search,
  LayoutGrid,
  List,
  GraduationCap,
  RotateCcw,
  ShieldAlert,
  Info,
  X,
  PlusCircle,
  FileSearch,
  Check,
  HelpCircle,
  Compass,
  BarChart3,
  Newspaper,
  Database,
  ExternalLink,
} from 'lucide-react';
import { FACT_CHECK_TOPICS, TOPIC_CATEGORIES, ROLE_DEFINITIONS, MAIN_ROLES } from '../../../data/topics';
import { InvestigationData, Student, StudentRole, Team, TopicItem } from '../../../types';

interface Step1CaseIntakeProps {
  team: Team;
  student: Student;
  allStudents: Student[];
  localInv: InvestigationData;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  handleSelectTopic: (topic: TopicItem) => void;
  handleSelectRole: (role: StudentRole) => void;
  handleStepChange: (step: number) => void;
  setShowSurveyModal: (show: boolean) => void;
}

export const Step1CaseIntake: React.FC<Step1CaseIntakeProps> = ({
  team,
  student,
  allStudents,
  selectedCategory,
  setSelectedCategory,
  handleSelectTopic,
  handleSelectRole,
  handleStepChange,
  setShowSurveyModal,
}) => {
  // Modal state for browsing / searching topics
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Student Difficulty Level Filter in Modal ('all' | 'easy' | 'medium' | 'hard')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Search query inside modal
  const [searchQuery, setSearchQuery] = useState('');

  // View style inside modal: 'card' vs 'compact'
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');

  // Custom Topic Form state
  const [showCustomTopicForm, setShowCustomTopicForm] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customClaim, setCustomClaim] = useState('');

  // Open/collapsed state for each category accordion in modal
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    TOPIC_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        initial[cat.id] =
          cat.id === 'current' ||
          (team.topicId
            ? FACT_CHECK_TOPICS.find((t) => t.id === team.topicId)?.category === cat.id
            : false);
      }
    });
    return initial;
  });

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const collapseAll = () => {
    const closed: Record<string, boolean> = {};
    TOPIC_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') closed[cat.id] = false;
    });
    setOpenCategories(closed);
  };

  const expandAll = () => {
    const opened: Record<string, boolean> = {};
    TOPIC_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') opened[cat.id] = true;
    });
    setOpenCategories(opened);
  };

  // Filtered topics inside the search modal
  const filteredTopics = useMemo(() => {
    return FACT_CHECK_TOPICS.filter((t) => {
      if (selectedCategory === 'kosis_bigkinds') {
        if (!t.isKosisRecommended) return false;
      } else if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }
      if (selectedDifficulty !== 'all' && t.difficulty !== selectedDifficulty) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchClaim = t.claim.toLowerCase().includes(query);
        const matchKeywords = t.keywords?.some((k) => k.toLowerCase().includes(query));
        const matchKosis = t.kosisTip && (
          t.kosisTip.tableTitle.toLowerCase().includes(query) ||
          t.kosisTip.searchKeywords.toLowerCase().includes(query) ||
          t.kosisTip.description.toLowerCase().includes(query)
        );
        const matchBigkinds = t.bigkindsTip && (
          t.bigkindsTip.query.toLowerCase().includes(query) ||
          t.bigkindsTip.analysisPoint.toLowerCase().includes(query)
        );
        if (!matchTitle && !matchClaim && !matchKeywords && !matchKosis && !matchBigkinds) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  // Group filtered topics by category for clean accordion rendering
  const categoryGroups = useMemo(() => {
    const validCats = TOPIC_CATEGORIES.filter((c) => c.id !== 'all');
    return validCats
      .map((cat) => {
        let items: TopicItem[] = [];
        if (cat.id === 'kosis_bigkinds') {
          items = filteredTopics.filter((t) => t.isKosisRecommended);
        } else {
          items = filteredTopics.filter((t) => t.category === cat.id);
        }
        return {
          ...cat,
          items,
          easyCount: items.filter((i) => i.difficulty === 'easy').length,
          mediumCount: items.filter((i) => i.difficulty === 'medium').length,
          hardCount: items.filter((i) => i.difficulty === 'hard').length,
        };
      })
      .filter((group) => {
        if (selectedCategory !== 'all') {
          return group.id === selectedCategory;
        }
        if (searchQuery.trim() || selectedDifficulty !== 'all') {
          return group.items.length > 0;
        }
        return group.items.length > 0;
      });
  }, [filteredTopics, selectedCategory, searchQuery, selectedDifficulty]);

  const areAllCollapsed = useMemo(() => {
    return categoryGroups.every((g) => !openCategories[g.id]);
  }, [categoryGroups, openCategories]);

  // Selected topic item details (if any)
  const currentTopicItem = useMemo(() => {
    if (!team.topicId) return null;
    return FACT_CHECK_TOPICS.find((t) => t.id === team.topicId) || null;
  }, [team.topicId]);

  const handleSelectTopicFromModal = (topic: TopicItem) => {
    handleSelectTopic(topic);
    setIsSearchModalOpen(false);
  };

  const handleCustomTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customClaim.trim()) return;

    const customTopic: TopicItem = {
      id: `custom-${Date.now()}`,
      category: 'daily',
      categoryLabel: '✍️ 모둠 직접 제안 사건',
      title: customTitle.trim(),
      claim: customClaim.trim(),
      background: '모둠 수사관들이 직접 발굴하여 제안한 의심 사건입니다.',
      difficulty: 'medium',
      keywords: ['자유탐구', '직접발굴'],
      hintQuestions: ['이 주장을 뒷받침하는 1차 출처는 어디인가?'],
      suggestedSources: ['공공기관 공식 사이트', '학술연구정보서비스(RISS)', '국가통계포털(KOSIS)'],
      counterEvidenceClue: '다양한 시각과 예외 사례를 비교 검토 필요',
    };

    handleSelectTopic(customTopic);
    setShowCustomTopicForm(false);
    setIsSearchModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="step-1-case-intake">
      {/* ========================================================================= */}
      {/* 1. Header Banner */}
      {/* ========================================================================= */}
      <div className="bg-[#0a182c] p-6 rounded-3xl border border-cyan-500/30 shadow-lg space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
            STEP 01 · ROLES & CASE INTAKE
          </span>
          <span className="text-[11px] text-cyan-400 font-bold hidden sm:inline">
            수준 맞춤 팩트수사 시스템
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          01. 수사관 역할 배정 및 사건 접수
        </h2>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          먼저 모둠원 4명의 <strong className="text-cyan-300">전문 수사관 역할</strong>을 분담하고, 우리 모둠의 흥미와 수준에 맞는 <strong className="text-cyan-300">의심 사건</strong>을 접수하세요.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROMINENT CALL-TO-ACTION: 모둠 맞춤 사건 추천 설문 배너 */}
      {/* ========================================================================= */}
      <div className="p-6 bg-gradient-to-r from-[#0d2242] via-[#0e2c56] to-[#122444] rounded-3xl border-2 border-cyan-400/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
        {/* Glow effect in background */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-300/40 text-cyan-300 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>어떤 사건을 수사해야 할지 고민되시나요? (3분 추천 설문)</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            우리 모둠 맞춤 팩트체크 사건 추천받기
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed max-w-xl">
            간단한 5개 문항 설문으로 모둠원들의 <strong className="text-cyan-300">관심 분야(SNS, AI, 건강, 학교)</strong>와 <strong className="text-amber-300">탐구 수준(입문/표준/심화)</strong>을 분석하여 딱 맞는 사건을 추천해 드립니다!
          </p>
        </div>

        <button
          id="btn-recommend-topics"
          onClick={() => setShowSurveyModal(true)}
          className="z-10 w-full md:w-auto px-7 py-4 bg-gradient-to-r from-cyan-400 via-cyan-300 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 text-slate-950 rounded-2xl text-sm font-black transition shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 shrink-0"
        >
          <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
          <span>모둠 맞춤 사건 추천 설문 시작하기</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. STEP 1-A: 수사관 4대 전문 역할 선택 (MOVED TO TOP) */}
      {/* ========================================================================= */}
      <div id="role-assignment-section" className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/90 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <UserCheck className="w-5 h-5 text-cyan-400" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                1. 수사관 4대 전문 역할 분담
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              모둠원 4명이 각자의 수사 전문 임무를 분담하여 협력 수사를 진행합니다. 본인이 맡을 역할을 1개 선택하세요.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {student.role ? (
              <span className="px-3.5 py-1.5 bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                내 역할: {ROLE_DEFINITIONS[student.role]?.title || student.role}
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-950/80 text-amber-300 border border-amber-500/50 rounded-2xl text-xs font-bold animate-pulse">
                ⚠️ 내 역할 미선택 (아래에서 선택)
              </span>
            )}
          </div>
        </div>

        {/* 4 Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MAIN_ROLES.map((rKey) => {
            const rDef = ROLE_DEFINITIONS[rKey];
            const isSelectedByMe = student.role === rKey;
            const assignedStudentId = team.assignedRoles?.[rKey];
            const assignedStudent = allStudents.find((s) => s.id === assignedStudentId);

            return (
              <div
                key={rKey}
                className={`p-5 rounded-3xl border-2 transition flex flex-col justify-between space-y-3.5 shadow-md ${
                  isSelectedByMe
                    ? 'bg-[#0f2a4f] border-cyan-400 ring-2 ring-cyan-400/40'
                    : 'bg-[#061426] border-slate-700/90 hover:border-cyan-500/50 hover:bg-[#091b32]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#040c17] text-cyan-300 border border-cyan-500/40 font-mono">
                      {rDef.badge}
                    </span>
                    {assignedStudent ? (
                      <span className="text-xs font-black text-amber-200 bg-amber-950/80 px-2.5 py-0.5 rounded-xl border border-amber-500/40 flex items-center gap-1">
                        <Check className="w-3 h-3 text-amber-400" />
                        담당: {assignedStudent.name} 수사관
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-800/60 px-2.5 py-0.5 rounded-xl border border-slate-700">
                        미배정
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">{rDef.title}</h4>
                    <p className="text-xs text-slate-300 font-medium mt-0.5 leading-relaxed">
                      {rDef.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-[#030914] border border-slate-800">
                    <span className="text-[11px] font-black text-cyan-300 block">주요 수사 임무:</span>
                    {rDef.missions.map((m, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300 font-medium">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  id={`btn-select-role-${rKey}`}
                  onClick={() => handleSelectRole(rKey)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md ${
                    isSelectedByMe
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                  }`}
                >
                  {isSelectedByMe ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      내가 맡은 역할입니다 (선택됨)
                    </>
                  ) : (
                    '이 역할 맡기'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. STEP 1-B: 수사 대상 의심 사건 접수소 (CLEAN & UNCLUTTERED) */}
      {/* ========================================================================= */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/90 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <FileSearch className="w-5 h-5 text-cyan-400" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                2. 수사 대상 의심 사건 접수
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              인터넷과 미디어에 유포된 의심 정보 중 우리 모둠이 팩트체크할 사건 1건을 선택합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {team.topicTitle ? (
              <span className="px-3.5 py-1.5 bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                사건 접수 완료
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-950/80 text-amber-300 border border-amber-500/50 rounded-2xl text-xs font-bold">
                사건 미선택
              </span>
            )}
          </div>
        </div>

        {/* CASE A: No Topic Selected Yet -> Clean & Action-Oriented Desk */}
        {!team.topicTitle ? (
          <div className="p-8 bg-[#061426] rounded-3xl border-2 border-dashed border-cyan-500/40 text-center space-y-5">
            <div className="inline-flex p-4 rounded-3xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <Compass className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>

            <div className="space-y-1.5 max-w-lg mx-auto">
              <h4 className="text-base font-black text-white">
                아직 접수된 의심 사건이 없습니다
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                총 <strong className="text-cyan-300">{FACT_CHECK_TOPICS.length}개</strong>의 최신 핫이슈, SNS, 인공지능, 건강, 학교생활 사건 목록을 둘러보고 우리 모둠의 탐구 주제를 결정하세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
              {/* PRIMARY CTA: 수사 대상 검색하기 BUTTON */}
              <button
                id="btn-open-topic-search-modal"
                onClick={() => setIsSearchModalOpen(true)}
                className="w-full sm:flex-1 py-3.5 px-6 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-2xl text-xs font-black transition shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 text-slate-950" />
                <span>수사 대상 검색하기 (40+개 사건)</span>
              </button>

              {/* SECONDARY CTA: 맞춤 설문 */}
              <button
                onClick={() => setShowSurveyModal(true)}
                className="w-full sm:w-auto py-3.5 px-5 bg-[#0e274c] hover:bg-[#153460] text-cyan-200 border border-cyan-500/40 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>맞춤 추천 설문</span>
              </button>
            </div>
          </div>
        ) : (
          /* CASE B: Topic is Selected -> Beautiful Highlight Dossier */
          <div className="p-6 bg-gradient-to-br from-[#0e274c] to-[#07172c] rounded-3xl border-2 border-cyan-400 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-slate-950 bg-cyan-400 px-2.5 py-0.5 rounded-lg uppercase tracking-wide font-mono">
                  접수된 수사 사건
                </span>
                {currentTopicItem && (
                  <>
                    <span className="text-[11px] font-bold text-cyan-200 bg-[#061224] px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                      {currentTopicItem.categoryLabel}
                    </span>
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${
                        currentTopicItem.difficulty === 'easy'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : currentTopicItem.difficulty === 'medium'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                          : 'bg-rose-950 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {currentTopicItem.difficulty === 'easy' && '🟢 Lv.1 입문 수사'}
                      {currentTopicItem.difficulty === 'medium' && '🟡 Lv.2 표준 탐구'}
                      {currentTopicItem.difficulty === 'hard' && '🔴 Lv.3 심화 도전'}
                    </span>
                    {currentTopicItem.isTrending && (
                      <span className="text-[11px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-200" />
                        {currentTopicItem.trendingBadge || '핫이슈'}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Change / Search Button */}
              <button
                id="btn-reselect-topic-modal"
                onClick={() => setIsSearchModalOpen(true)}
                className="text-xs font-bold text-cyan-200 hover:text-white bg-[#061224] hover:bg-[#0c2242] px-4 py-2 rounded-xl border border-cyan-500/40 transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>수사 대상 다시 검색 / 변경하기</span>
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg sm:text-xl font-black text-white leading-snug">
                {team.topicTitle}
              </h4>
              <div className="p-3.5 bg-[#040e1c] rounded-2xl border border-slate-700/80">
                <span className="text-[11px] font-black text-cyan-300 block mb-0.5">
                  검증 대상 의심 주장 (Claim):
                </span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  "{team.claim}"
                </p>
              </div>
            </div>

            {/* KOSIS & BigKinds Student Search Guidance Box */}
            {(currentTopicItem?.kosisTip || currentTopicItem?.bigkindsTip) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {currentTopicItem.kosisTip && (
                  <div className="p-3.5 bg-[#051528] rounded-2xl border border-cyan-500/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        KOSIS 국가통계포털 검증 가이드
                      </span>
                      <a
                        href="https://kosis.kr"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-cyan-400 hover:text-cyan-200 underline flex items-center gap-0.5"
                      >
                        kosis.kr 바로가기
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <p><strong className="text-white">추천 통계표:</strong> {currentTopicItem.kosisTip.tableTitle}</p>
                      <p><strong className="text-cyan-300">검색 키워드:</strong> <code className="bg-[#030914] px-1.5 py-0.5 rounded text-cyan-200">{currentTopicItem.kosisTip.searchKeywords}</code></p>
                      <p className="text-slate-400 text-[10px] leading-snug">{currentTopicItem.kosisTip.description}</p>
                    </div>
                  </div>
                )}

                {currentTopicItem.bigkindsTip && (
                  <div className="p-3.5 bg-[#0b1b36] rounded-2xl border border-indigo-500/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                        <Newspaper className="w-4 h-4 text-indigo-400" />
                        빅카인즈 뉴스빅데이터 검증 가이드
                      </span>
                      <a
                        href="https://www.bigkinds.or.kr"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-400 hover:text-indigo-200 underline flex items-center gap-0.5"
                      >
                        bigkinds.or.kr 바로가기
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <p><strong className="text-indigo-300">검색 검색식:</strong> <code className="bg-[#030914] px-1.5 py-0.5 rounded text-indigo-200">{currentTopicItem.bigkindsTip.query}</code></p>
                      <p className="text-slate-400 text-[10px] leading-snug"><strong className="text-white">분석 포인트:</strong> {currentTopicItem.bigkindsTip.analysisPoint}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentTopicItem?.keywords && currentTopicItem.keywords.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400 font-bold">주요 키워드:</span>
                {currentTopicItem.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[10px] text-cyan-300 bg-[#050e1c] px-2 py-0.5 rounded-md border border-cyan-500/30"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. TOPIC SEARCH & SELECTION MODAL (Opened via "수사 대상 검색하기") */}
      {/* ========================================================================= */}
      {isSearchModalOpen && (
        <div
          id="topic-search-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-5xl bg-[#081528] border-2 border-cyan-400 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#0c203b] border-b border-cyan-500/30 flex items-center justify-between gap-4 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    <Search className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-black text-white">
                    수사 대상 의심 사건 검색 및 접수
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  총 <strong className="text-cyan-300">{FACT_CHECK_TOPICS.length}개</strong>의 등록된 사건 중 우리 모둠이 탐구할 사건을 선택하세요.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCustomTopicForm(!showCustomTopicForm)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    showCustomTopicForm
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-[#061224] text-cyan-200 border border-cyan-500/40 hover:bg-[#0d274c]'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>직접 사건 입력</span>
                </button>
                <button
                  id="btn-close-topic-modal"
                  onClick={() => setIsSearchModalOpen(false)}
                  className="p-2 rounded-xl bg-[#061224] text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 transition"
                  title="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Custom Topic Form Drawer (if toggled) */}
            {showCustomTopicForm && (
              <form
                onSubmit={handleCustomTopicSubmit}
                className="p-4 sm:p-5 bg-[#050e1c] border-b border-amber-500/40 space-y-3 shrink-0 animate-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    새로운 의심 사건 직접 제안하기
                  </span>
                  <span className="text-[11px] text-slate-400">
                    * 우리 모둠만의 특별한 팩트체크 주제를 직접 작성합니다.
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="사건 제목 (예: 스마트폰을 충전하면서 쓰면 배터리 수명이 절반으로 줄어들까?)"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0a182c] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <input
                    type="text"
                    required
                    value={customClaim}
                    onChange={(e) => setCustomClaim(e.target.value)}
                    placeholder="검증할 의심 주장 (예: 충전 중 휴대폰 사용은 배터리 열화 속도를 2배 이상 높인다)"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0a182c] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomTopicForm(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-md hover:bg-amber-300"
                  >
                    이 자유 사건으로 접수하기
                  </button>
                </div>
              </form>
            )}

            {/* Filter Controls & Search Bar */}
            <div className="p-4 sm:p-5 bg-[#091a32] border-b border-slate-700/80 space-y-3 shrink-0">
              {/* Row 1: Search Bar & View Mode */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="사건 키워드 검색 (예: 전기차, 제로음료, 딥페이크, 아침밥, 손선풍기...)"
                    className="w-full pl-9 pr-8 py-2.5 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-end shrink-0">
                  <button
                    onClick={areAllCollapsed ? expandAll : collapseAll}
                    className="px-3 py-2 rounded-xl bg-[#061224] hover:bg-[#0c2242] text-cyan-200 hover:text-white border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {areAllCollapsed ? (
                      <>
                        <FolderOpen className="w-3.5 h-3.5 text-cyan-300" />
                        <span>모두 펼치기</span>
                      </>
                    ) : (
                      <>
                        <Folder className="w-3.5 h-3.5 text-slate-300" />
                        <span>모두 접기</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center bg-[#050c18] p-0.5 rounded-xl border border-slate-700">
                    <button
                      onClick={() => setViewMode('card')}
                      className={`p-1.5 rounded-lg text-xs transition ${
                        viewMode === 'card'
                          ? 'bg-cyan-400 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="카드 그리드 보기"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('compact')}
                      className={`p-1.5 rounded-lg text-xs transition ${
                        viewMode === 'compact'
                          ? 'bg-cyan-400 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="컴팩트 목록(1줄) 보기"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Difficulty Level Filter Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-1 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-bold text-slate-300">난이도:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'all', label: '전체 보기', badge: '전체' },
                    { id: 'easy', label: '🟢 입문 (Lv.1)', badge: '기초' },
                    { id: 'medium', label: '🟡 표준 (Lv.2)', badge: '표준' },
                    { id: 'hard', label: '🔴 심화 (Lv.3)', badge: '심화' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setSelectedDifficulty(lvl.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        selectedDifficulty === lvl.id
                          ? lvl.id === 'easy'
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                            : lvl.id === 'medium'
                            ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                            : lvl.id === 'hard'
                            ? 'bg-rose-500 text-white font-black shadow-md'
                            : 'bg-cyan-400 text-slate-950 font-black shadow-md'
                          : 'bg-[#050c18] text-slate-300 border border-slate-700/80 hover:text-white'
                      }`}
                    >
                      <span>{lvl.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {TOPIC_CATEGORIES.map((cat) => {
                  const count =
                    cat.id === 'all'
                      ? FACT_CHECK_TOPICS.filter(
                          (t) => selectedDifficulty === 'all' || t.difficulty === selectedDifficulty
                        ).length
                      : FACT_CHECK_TOPICS.filter(
                          (t) =>
                            t.category === cat.id &&
                            (selectedDifficulty === 'all' || t.difficulty === selectedDifficulty)
                        ).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? 'bg-cyan-400 text-slate-950 font-black'
                          : 'bg-[#050c18] text-slate-300 border border-slate-700/80 hover:bg-[#0e2444] hover:text-white'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 rounded-full ${
                          selectedCategory === cat.id
                            ? 'bg-slate-950/30 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body: Scrollable Topic Groups */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Summary Counter */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  검색 결과: <strong className="text-cyan-300">{filteredTopics.length}</strong>개 사건 표시 중
                </span>
                {(searchQuery || selectedDifficulty !== 'all' || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDifficulty('all');
                      setSelectedCategory('all');
                    }}
                    className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    필터 초기화
                  </button>
                )}
              </div>

              {categoryGroups.length === 0 ? (
                <div className="p-12 text-center bg-[#050c18] rounded-3xl border border-slate-800 space-y-3">
                  <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">조건에 맞는 사건이 없습니다</h4>
                  <p className="text-xs text-slate-400">
                    검색어나 난이도 필터를 변경해 보시거나, 상단의 '맞춤 추천 설문'을 진행해보세요.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDifficulty('all');
                      setSelectedCategory('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition"
                  >
                    모든 사건 다시 보기
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryGroups.map((group) => {
                    const isOpen = openCategories[group.id] ?? false;
                    const hasSelectedTopicInGroup = group.items.some((t) => t.id === team.topicId);

                    return (
                      <div
                        key={group.id}
                        className={`rounded-3xl border transition-all duration-200 overflow-hidden shadow-md ${
                          hasSelectedTopicInGroup
                            ? 'bg-[#091a33] border-cyan-400/70'
                            : 'bg-[#050e1c] border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        {/* Group Accordion Header */}
                        <button
                          onClick={() => toggleCategory(group.id)}
                          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left transition hover:bg-[#0b213e]/50"
                        >
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-xl bg-[#030914] border border-cyan-500/30 text-cyan-300">
                                {isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                              </span>
                              <h4 className="text-sm sm:text-base font-black text-white">
                                {group.label}
                              </h4>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="px-2 py-0.5 rounded-full bg-[#030914] text-cyan-300 font-bold border border-cyan-500/30">
                                {group.items.length}개 사건
                              </span>
                              {group.easyCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/40 hidden sm:inline">
                                  입문 {group.easyCount}
                                </span>
                              )}
                              {group.mediumCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 font-semibold border border-amber-500/40 hidden sm:inline">
                                  표준 {group.mediumCount}
                                </span>
                              )}
                              {group.hardCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 font-semibold border border-rose-500/40 hidden sm:inline">
                                  심화 {group.hardCount}
                                </span>
                              )}
                              {hasSelectedTopicInGroup && (
                                <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black">
                                  ✓ 접수 사건 포함됨
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <span className="text-[11px] hidden sm:inline">
                              {isOpen ? '접어두기' : '펼쳐보기'}
                            </span>
                            <div
                              className={`p-1 rounded-lg bg-[#030914] text-cyan-300 transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </button>

                        {/* Group Accordion Content */}
                        {isOpen && (
                          <div className="p-4 sm:p-5 pt-0 border-t border-slate-800 mt-1">
                            {viewMode === 'card' ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3">
                                {group.items.map((topic) => {
                                  const isSelected = team.topicId === topic.id;

                                  return (
                                    <div
                                      key={topic.id}
                                      className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-3.5 text-left shadow-sm ${
                                        isSelected
                                          ? 'bg-[#0f274a] border-cyan-400 ring-2 ring-cyan-400/40'
                                          : 'bg-[#030914] border-slate-800 hover:border-cyan-500/50 hover:bg-[#071325]'
                                      }`}
                                    >
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-1 flex-wrap">
                                          <div className="flex items-center gap-1">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#0d2242] text-cyan-200 border border-cyan-500/40">
                                              {topic.categoryLabel}
                                            </span>
                                            {topic.isKosisRecommended && (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-600 text-white flex items-center gap-0.5">
                                                <Database className="w-2.5 h-2.5" />
                                                KOSIS·빅카인즈
                                              </span>
                                            )}
                                          </div>
                                          <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                              topic.difficulty === 'easy'
                                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                                : topic.difficulty === 'medium'
                                                ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                                : 'bg-rose-950 text-rose-300 border-rose-500/40'
                                            }`}
                                          >
                                            {topic.difficulty === 'easy' && '🟢 Lv.1 입문'}
                                            {topic.difficulty === 'medium' && '🟡 Lv.2 표준'}
                                            {topic.difficulty === 'hard' && '🔴 Lv.3 심화'}
                                          </span>
                                        </div>

                                        <h4 className="text-sm font-black text-white leading-snug">
                                          {topic.title}
                                        </h4>
                                        <p className="text-xs text-slate-300 line-clamp-2 font-medium leading-relaxed">
                                          "{topic.claim}"
                                        </p>

                                        {/* KOSIS / BigKinds Quick Tips on Card */}
                                        {(topic.kosisTip || topic.bigkindsTip) && (
                                          <div className="space-y-1 pt-1">
                                            {topic.kosisTip && (
                                              <div className="p-1.5 bg-[#051528] rounded-lg border border-cyan-500/30 text-[10px] text-cyan-200 flex items-start gap-1">
                                                <BarChart3 className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                                                <span className="line-clamp-1"><strong>KOSIS:</strong> {topic.kosisTip.tableTitle}</span>
                                              </div>
                                            )}
                                            {topic.bigkindsTip && (
                                              <div className="p-1.5 bg-[#0b1b36] rounded-lg border border-indigo-500/30 text-[10px] text-indigo-200 flex items-start gap-1">
                                                <Newspaper className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                                                <span className="line-clamp-1"><strong>빅카인즈:</strong> {topic.bigkindsTip.query}</span>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {topic.keywords && topic.keywords.length > 0 && (
                                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                            {topic.keywords.slice(0, 3).map((kw, i) => (
                                              <span
                                                key={i}
                                                className="text-[10px] text-slate-400 bg-[#02050a] px-2 py-0.5 rounded-md border border-slate-800"
                                              >
                                                #{kw}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      <button
                                        id={`btn-select-topic-modal-${topic.id}`}
                                        onClick={() => handleSelectTopicFromModal(topic)}
                                        className={`w-full py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm ${
                                          isSelected
                                            ? 'bg-emerald-500 text-slate-950 font-black'
                                            : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                                        }`}
                                      >
                                        {isSelected ? (
                                          <>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                                            우리 모둠이 접수한 사건 (선택됨)
                                          </>
                                        ) : (
                                          '이 사건으로 수사 시작하기'
                                        )}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              /* COMPACT LIST VIEW */
                              <div className="space-y-2 pt-3">
                                {group.items.map((topic) => {
                                  const isSelected = team.topicId === topic.id;

                                  return (
                                    <div
                                      key={topic.id}
                                      className={`p-3.5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-left ${
                                        isSelected
                                          ? 'bg-[#0f274a] border-cyan-400 ring-2 ring-cyan-400/40'
                                          : 'bg-[#030914] border-slate-800 hover:border-cyan-500/50 hover:bg-[#071325]'
                                      }`}
                                    >
                                      <div className="space-y-1 flex-1 pr-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                              topic.difficulty === 'easy'
                                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                                : topic.difficulty === 'medium'
                                                ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                                : 'bg-rose-950 text-rose-300 border-rose-500/40'
                                            }`}
                                          >
                                            {topic.difficulty === 'easy' && '🟢 Lv.1 입문'}
                                            {topic.difficulty === 'medium' && '🟡 Lv.2 표준'}
                                            {topic.difficulty === 'hard' && '🔴 Lv.3 심화'}
                                          </span>
                                          <h4 className="text-xs sm:text-sm font-black text-white">
                                            {topic.title}
                                          </h4>
                                        </div>
                                        <p className="text-[11px] text-slate-300 line-clamp-1">
                                          주장: "{topic.claim}"
                                        </p>
                                      </div>

                                      <button
                                        onClick={() => handleSelectTopicFromModal(topic)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center justify-center gap-1.5 ${
                                          isSelected
                                            ? 'bg-emerald-500 text-slate-950'
                                            : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                                        }`}
                                      >
                                        {isSelected ? '선택됨' : '사건 접수'}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0c203b] border-t border-cyan-500/30 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-300">
                {team.topicTitle
                  ? `현재 선택된 사건: “${team.topicTitle}”`
                  : '사건을 선택하면 자동으로 모둠 사건으로 등록됩니다.'}
              </span>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. Navigation Footer */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-700/80">
        <div className="text-xs text-slate-400">
          {!student.role ? (
            <span className="text-amber-300 font-bold">⚠️ 1단계: 먼저 내 수사관 역할을 선택해주세요.</span>
          ) : !team.topicTitle ? (
            <span className="text-cyan-300 font-bold">💡 2단계: '수사 대상 검색하기' 또는 '추천 설문'으로 사건을 접수해주세요.</span>
          ) : (
            <span className="text-emerald-300 font-bold">✓ 수사관 역할 배정 및 사건 접수 완료! 다음 단계로 이동하세요.</span>
          )}
        </div>

        <button
          id="btn-step-1-next"
          onClick={() => handleStepChange(2)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg"
        >
          <span>다음: 02 수사 질문 작성하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
