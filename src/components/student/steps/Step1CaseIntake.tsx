import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Flame,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Folder,
  FolderOpen,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  GraduationCap,
  RotateCcw,
  ShieldAlert,
  Info
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
  // Student Difficulty Level Filter ('all' | 'easy' | 'medium' | 'hard')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // View style: 'card' (detailed grid) vs 'compact' (collapsed single-line rows)
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');

  // Open/collapsed state for each category accordion
  // Default: if category was selected, that category is open; otherwise open first or active
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    // Open 'current' by default as trending, rest collapsed by default
    TOPIC_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        initial[cat.id] = cat.id === 'current' || (team.topicId ? FACT_CHECK_TOPICS.find(t => t.id === team.topicId)?.category === cat.id : false);
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

  // Filtered topics based on search, category tab, and difficulty level
  const filteredTopics = useMemo(() => {
    return FACT_CHECK_TOPICS.filter((t) => {
      // Category filter (if not 'all')
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }
      // Difficulty level filter (if not 'all')
      if (selectedDifficulty !== 'all' && t.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchClaim = t.claim.toLowerCase().includes(query);
        const matchKeywords = t.keywords?.some((k) => k.toLowerCase().includes(query));
        if (!matchTitle && !matchClaim && !matchKeywords) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  // Group filtered topics by category for clean accordion rendering
  const categoryGroups = useMemo(() => {
    const validCats = TOPIC_CATEGORIES.filter((c) => c.id !== 'all');
    return validCats.map((cat) => {
      const items = filteredTopics.filter((t) => t.category === cat.id);
      return {
        ...cat,
        items,
        easyCount: items.filter((i) => i.difficulty === 'easy').length,
        mediumCount: items.filter((i) => i.difficulty === 'medium').length,
        hardCount: items.filter((i) => i.difficulty === 'hard').length,
      };
    }).filter((group) => {
      // If a specific category tab is selected, only show that group
      if (selectedCategory !== 'all') {
        return group.id === selectedCategory;
      }
      // If searching, only show groups with matching items
      if (searchQuery.trim() || selectedDifficulty !== 'all') {
        return group.items.length > 0;
      }
      return true;
    });
  }, [filteredTopics, selectedCategory, searchQuery, selectedDifficulty]);

  const areAllCollapsed = useMemo(() => {
    return categoryGroups.every((g) => !openCategories[g.id]);
  }, [categoryGroups, openCategories]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="step-1-case-intake">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a182c] p-6 rounded-3xl border border-cyan-500/30 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              STEP 01 · CASE INTAKE & ROLES
            </span>
            <span className="text-[11px] text-cyan-400 font-bold hidden sm:inline">
              수준 맞춤 팩트수사 시스템
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            01. 사건 접수 및 수사관 역할 배정
          </h2>
          <p className="text-xs text-slate-300">
            우리 모둠의 수준과 관심사에 맞는 의심 사건을 접수하고, 4명의 전문 수사관 역할을 배정하세요.
          </p>
        </div>
        <button
          id="btn-recommend-topics"
          onClick={() => setShowSurveyModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 hover:text-white rounded-2xl text-xs font-black transition shadow-lg shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          모둠 맞춤 사건 추천 설문
        </button>
      </div>

      {/* Part A: Topic Selection & Level Adjustment */}
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-base font-black text-white">
              수사 대상 의심 사건 접수소
            </h3>
            <span className="text-xs text-slate-400">
              (총 {FACT_CHECK_TOPICS.length}개 사건 등록됨)
            </span>
          </div>

          {team.topicTitle ? (
            <span className="px-3.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              사건 접수 완료
            </span>
          ) : (
            <span className="text-xs text-amber-300 bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/40 font-bold">
              탐구할 사건 1개를 선택해주세요
            </span>
          )}
        </div>

        {/* Selected Topic Highlight Banner */}
        {team.topicTitle && (
          <div className="p-5 bg-gradient-to-r from-[#0f274a] to-[#0a1e3a] rounded-3xl border-2 border-cyan-400/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-950 bg-cyan-400 px-2 py-0.5 rounded-md uppercase tracking-wide">
                  우리 모둠 접수 사건
                </span>
                {team.topicId && (
                  <span className="text-[11px] font-bold text-cyan-200">
                    {FACT_CHECK_TOPICS.find((t) => t.id === team.topicId)?.difficulty === 'easy' && '🟢 입문 수사'}
                    {FACT_CHECK_TOPICS.find((t) => t.id === team.topicId)?.difficulty === 'medium' && '🟡 표준 수사'}
                    {FACT_CHECK_TOPICS.find((t) => t.id === team.topicId)?.difficulty === 'hard' && '🔴 심화 수사'}
                  </span>
                )}
              </div>
              <h4 className="text-base sm:text-lg font-black text-white">{team.topicTitle}</h4>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                "{team.claim}"
              </p>
            </div>
            <a
              href="#role-assignment-section"
              className="text-xs font-black text-cyan-200 bg-[#061224] hover:bg-[#0c2242] px-4 py-2.5 rounded-xl border border-cyan-500/50 shrink-0 text-center transition flex items-center justify-center gap-1"
            >
              하단 수사관 역할 배정으로 이동 ↓
            </a>
          </div>
        )}

        {/* Level Selector & Control Bar */}
        <div className="p-4 bg-[#0a182c] rounded-3xl border border-slate-700/90 space-y-3.5 shadow-md">
          {/* Level Selection Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/70 pb-3.5">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black text-white">학생 난이도 맞춤 조절:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'all', label: '전체 난이도', badge: '전체 보기', color: 'slate' },
                { id: 'easy', label: '🟢 입문 (Lv.1)', badge: '기초·직관적', color: 'emerald' },
                { id: 'medium', label: '🟡 표준 (Lv.2)', badge: '중급·탐구형', color: 'amber' },
                { id: 'hard', label: '🔴 심화 (Lv.3)', badge: '심화·반전팩트', color: 'rose' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  id={`btn-level-filter-${lvl.id}`}
                  onClick={() => setSelectedDifficulty(lvl.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between sm:justify-center gap-1.5 ${
                    selectedDifficulty === lvl.id
                      ? lvl.id === 'easy'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md ring-2 ring-emerald-400/40'
                        : lvl.id === 'medium'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-400/40'
                        : lvl.id === 'hard'
                        ? 'bg-rose-500 text-white font-black shadow-md ring-2 ring-rose-400/40'
                        : 'bg-cyan-400 text-slate-950 font-black shadow-md ring-2 ring-cyan-400/40'
                      : 'bg-[#071426] text-slate-300 border border-slate-700/80 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  <span>{lvl.label}</span>
                  <span className="text-[10px] opacity-80 hidden lg:inline">({lvl.badge})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Level Guidance Banner */}
          <div className="text-xs text-slate-300 bg-[#071325] p-3 rounded-2xl border border-cyan-500/20 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              {selectedDifficulty === 'all' && (
                <p className="leading-relaxed">
                  <strong className="text-cyan-300">💡 전체 사건 탐색 모드:</strong> 중학교 1학년 눈높이에 맞춘 입문 사건부터 깊이 있는 논쟁을 다루는 심화 사건까지 자유롭게 둘러볼 수 있습니다.
                </p>
              )}
              {selectedDifficulty === 'easy' && (
                <p className="leading-relaxed">
                  <strong className="text-emerald-300">🟢 입문 (Lv.1 기초 수사):</strong> 팩트체크를 처음 접하는 모둠에게 추천합니다. 단일 원인-결과 관계가 명확하며, 직관적인 일상 실험 및 공식 기관 자료로 손쉽게 판정할 수 있습니다.
                </p>
              )}
              {selectedDifficulty === 'medium' && (
                <p className="leading-relaxed">
                  <strong className="text-amber-300">🟡 표준 (Lv.2 표준 탐구):</strong> 표준 중1 탐구 역량에 적합합니다. 상황, 대상, 기준치에 따라 결과가 달라지는 조건부 팩트와 일상 미디어 통념을 다룹니다.
                </p>
              )}
              {selectedDifficulty === 'hard' && (
                <p className="leading-relaxed">
                  <strong className="text-rose-300">🔴 심화 (Lv.3 심화 도전):</strong> 깊이 있는 탐구를 원하는 모둠을 위한 사건입니다. 대중적 인식과 정반대되는 통계 착시, 사회적 찬반 쟁점 및 전문 연구 논문 분석이 포함됩니다.
                </p>
              )}
            </div>
          </div>

          {/* Search Bar & Folding Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="사건 키워드 검색 (예: 전기차, 제로음료, 딥페이크, 아침밥, 손선풍기...)"
                className="w-full pl-9 pr-8 py-2 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
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

            {/* View Mode & Folding Action Buttons */}
            <div className="flex items-center gap-2 justify-end shrink-0">
              {/* Fold / Unfold All Categories */}
              <button
                onClick={areAllCollapsed ? expandAll : collapseAll}
                className="px-3 py-2 rounded-xl bg-[#0e223f] hover:bg-[#163660] text-cyan-200 hover:text-white border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5"
                title={areAllCollapsed ? '모든 카테고리 펼치기' : '모든 카테고리 접어두기'}
              >
                {areAllCollapsed ? (
                  <>
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-300" />
                    <span>모두 펼치기</span>
                  </>
                ) : (
                  <>
                    <Folder className="w-3.5 h-3.5 text-slate-300" />
                    <span>모두 접어두기</span>
                  </>
                )}
              </button>

              {/* View Mode Toggle (Card Grid vs Compact List) */}
              <div className="flex items-center bg-[#071325] p-0.5 rounded-xl border border-slate-700">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    viewMode === 'card'
                      ? 'bg-cyan-500/30 text-cyan-200 font-bold'
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
                      ? 'bg-cyan-500/30 text-cyan-200 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="컴팩트 목록(1줄) 보기"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {TOPIC_CATEGORIES.map((cat) => {
            const count = cat.id === 'all'
              ? FACT_CHECK_TOPICS.filter((t) => selectedDifficulty === 'all' || t.difficulty === selectedDifficulty).length
              : FACT_CHECK_TOPICS.filter((t) => t.category === cat.id && (selectedDifficulty === 'all' || t.difficulty === selectedDifficulty)).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-400 text-slate-950 font-black shadow-sm'
                    : 'bg-[#0a182c] text-slate-300 border border-slate-700/80 hover:bg-[#102444] hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900/30 text-slate-950 font-black'
                    : 'bg-[#050d18] text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result summary indicator */}
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

        {/* Collapsible Category Accordions */}
        {categoryGroups.length === 0 ? (
          <div className="p-12 text-center bg-[#0a182c] rounded-3xl border border-slate-700 space-y-3">
            <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
            <h4 className="text-base font-bold text-white">조건에 맞는 사건이 없습니다</h4>
            <p className="text-xs text-slate-400">
              검색어나 난이도 필터를 변경해 보시거나, 맞춤 사건 추천 설문을 진행해보세요.
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
                      ? 'bg-[#0a1a33] border-cyan-400/60'
                      : 'bg-[#0a182c] border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  {/* Category Accordion Header (Click to Fold/Unfold) */}
                  <button
                    onClick={() => toggleCategory(group.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left transition hover:bg-[#0e2344]/50"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-[#061224] border border-cyan-500/30 text-cyan-300">
                          {isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-white">
                          {group.label}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-[#071325] text-cyan-300 font-bold border border-cyan-500/30">
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
                            ✓ 모둠 접수 사건 포함
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <span className="text-[11px] hidden sm:inline">
                        {isOpen ? '접어두기' : '사건 목록 펼치기'}
                      </span>
                      <div className={`p-1 rounded-lg bg-[#071325] text-cyan-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Accordion Content: Topic Items when open */}
                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-700/60 mt-1">
                      {viewMode === 'card' ? (
                        /* CARD VIEW */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3">
                          {group.items.map((topic) => {
                            const isSelected = team.topicId === topic.id;

                            return (
                              <div
                                key={topic.id}
                                className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-3.5 text-left shadow-sm ${
                                  isSelected
                                    ? 'bg-[#0f274a] border-cyan-400 shadow-md ring-2 ring-cyan-400/40'
                                    : 'bg-[#071426] border-slate-700/80 hover:border-cyan-500/50 hover:bg-[#0c1f3a]'
                                }`}
                              >
                                <div className="space-y-2">
                                  {/* Badges */}
                                  <div className="flex items-center justify-between gap-1 flex-wrap">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#0d2242] text-cyan-200 border border-cyan-500/40">
                                        {topic.categoryLabel}
                                      </span>
                                      {topic.isTrending && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/90 text-white border border-rose-400/50 flex items-center gap-0.5 shadow-sm">
                                          <Flame className="w-3 h-3 text-amber-200" />
                                          {topic.trendingBadge || '핫이슈'}
                                        </span>
                                      )}
                                    </div>

                                    {/* Level Badge with detail */}
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                      topic.difficulty === 'easy'
                                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                        : topic.difficulty === 'medium'
                                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                        : 'bg-rose-950 text-rose-300 border-rose-500/40'
                                    }`}>
                                      {topic.difficulty === 'easy' && '🟢 Lv.1 입문 수사'}
                                      {topic.difficulty === 'medium' && '🟡 Lv.2 표준 탐구'}
                                      {topic.difficulty === 'hard' && '🔴 Lv.3 심화 도전'}
                                    </span>
                                  </div>

                                  <h4 className="text-sm font-black text-white leading-snug">
                                    {topic.title}
                                  </h4>
                                  <p className="text-xs text-slate-300 line-clamp-2 font-medium leading-relaxed">
                                    "{topic.claim}"
                                  </p>

                                  {/* Keywords tags */}
                                  {topic.keywords && topic.keywords.length > 0 && (
                                    <div className="flex items-center gap-1 flex-wrap pt-1">
                                      {topic.keywords.slice(0, 3).map((kw, i) => (
                                        <span
                                          key={i}
                                          className="text-[10px] text-slate-400 bg-[#050b14] px-2 py-0.5 rounded-md border border-slate-800"
                                        >
                                          #{kw}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <button
                                  id={`btn-select-topic-${topic.id}`}
                                  onClick={() => handleSelectTopic(topic)}
                                  className={`w-full py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm ${
                                    isSelected
                                      ? 'bg-cyan-400 text-slate-950 shadow-md ring-2 ring-cyan-300'
                                      : 'bg-[#122849] hover:bg-cyan-500 hover:text-slate-950 text-cyan-200 border border-cyan-500/30'
                                  }`}
                                >
                                  {isSelected ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                                      우리 모둠이 접수한 사건
                                    </>
                                  ) : (
                                    '이 사건으로 수사 시작'
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* COMPACT 1-LINE LIST VIEW */
                        <div className="space-y-2 pt-3">
                          {group.items.map((topic) => {
                            const isSelected = team.topicId === topic.id;

                            return (
                              <div
                                key={topic.id}
                                className={`p-3.5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-left ${
                                  isSelected
                                    ? 'bg-[#0f274a] border-cyan-400 ring-2 ring-cyan-400/40'
                                    : 'bg-[#071426] border-slate-700/80 hover:border-cyan-500/50 hover:bg-[#0c1f3a]'
                                }`}
                              >
                                <div className="space-y-1 flex-1 pr-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                      topic.difficulty === 'easy'
                                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                        : topic.difficulty === 'medium'
                                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                        : 'bg-rose-950 text-rose-300 border-rose-500/40'
                                    }`}>
                                      {topic.difficulty === 'easy' && '🟢 Lv.1 입문'}
                                      {topic.difficulty === 'medium' && '🟡 Lv.2 표준'}
                                      {topic.difficulty === 'hard' && '🔴 Lv.3 심화'}
                                    </span>
                                    {topic.isTrending && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white flex items-center gap-0.5">
                                        <Flame className="w-2.5 h-2.5 text-amber-200" />
                                        핫이슈
                                      </span>
                                    )}
                                    <h4 className="text-xs sm:text-sm font-black text-white">
                                      {topic.title}
                                    </h4>
                                  </div>
                                  <p className="text-[11px] text-slate-300 line-clamp-1">
                                    주장: "{topic.claim}"
                                  </p>
                                </div>

                                <button
                                  id={`btn-select-topic-compact-${topic.id}`}
                                  onClick={() => handleSelectTopic(topic)}
                                  className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center justify-center gap-1.5 ${
                                    isSelected
                                      ? 'bg-cyan-400 text-slate-950'
                                      : 'bg-[#122849] hover:bg-cyan-500 hover:text-slate-950 text-cyan-200 border border-cyan-500/30'
                                  }`}
                                >
                                  {isSelected ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      접수 완료
                                    </>
                                  ) : (
                                    '사건 접수'
                                  )}
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

      {/* Part B: Role Assignment */}
      <div id="role-assignment-section" className="space-y-4 pt-6 border-t border-slate-700/80">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              수사관 4대 전문 역할 선택
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              모둠원 4명이 각자의 수사 전문 임무를 분담하여 협력 수사를 진행합니다.
            </p>
          </div>
          {student.role && (
            <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/50 rounded-full text-xs font-black">
              내 역할: {ROLE_DEFINITIONS[student.role]?.title || student.role}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MAIN_ROLES.map((rKey) => {
            const rDef = ROLE_DEFINITIONS[rKey];
            const isSelectedByMe = student.role === rKey;
            const assignedStudentId = team.assignedRoles?.[rKey];
            const assignedStudent = allStudents.find((s) => s.id === assignedStudentId);

            return (
              <div
                key={rKey}
                className={`p-5 rounded-3xl border-2 transition flex flex-col justify-between space-y-3.5 shadow-xl ${
                  isSelectedByMe
                    ? 'bg-[#0e274c] border-cyan-400 ring-4 ring-cyan-400/20'
                    : 'bg-[#0c1c34] border-slate-700 hover:border-cyan-500/60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-[#061224] text-cyan-300 border border-cyan-500/50">
                      {rDef.badge}
                    </span>
                    {assignedStudent && (
                      <span className="text-xs font-black text-amber-200 bg-[#1c1605] px-2.5 py-1 rounded-lg border border-amber-500/50">
                        담당: {assignedStudent.name}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">{rDef.title}</h4>
                    <p className="text-xs text-slate-200 font-medium mt-0.5 leading-relaxed">{rDef.description}</p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-[#061224] border border-slate-700/80">
                    <span className="text-[11px] font-black text-cyan-300 block">핵심 임무:</span>
                    {rDef.missions.map((m, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-200 font-medium">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  id={`btn-select-role-${rKey}`}
                  onClick={() => handleSelectRole(rKey)}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md ${
                    isSelectedByMe
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                      : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                  }`}
                >
                  {isSelectedByMe ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      내가 맡은 역할입니다
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

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
        <div className="text-xs text-slate-400">
          {!team.topicTitle ? (
            <span className="text-amber-300 font-bold">⚠️ 먼저 상단에서 수사할 사건을 접수해주세요.</span>
          ) : !student.role ? (
            <span className="text-cyan-300 font-bold">💡 담당할 수사관 역할을 선택해주세요.</span>
          ) : (
            <span className="text-emerald-300 font-bold">✓ 사건 접수 및 역할 배정 완료! 다음 단계로 이동하세요.</span>
          )}
        </div>

        <button
          id="btn-step-1-next"
          onClick={() => handleStepChange(2)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg"
        >
          다음: 02 수사 질문 작성하기
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

