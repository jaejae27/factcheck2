import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Plus,
  Trash2,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Flame,
  Search,
  BookOpen,
  RefreshCw,
  FileQuestion,
  FlaskConical,
  Scale,
  Puzzle,
  Building2
} from 'lucide-react';
import { InvestigationData, Team, TopicItem } from '../../../types';
import { HypothesisGuideModal } from '../HypothesisGuideModal';
import { InvestigationQuestionGuideModal, getQuestionTypesForTopic } from '../InvestigationQuestionGuideModal';

interface Step2QuestionsProps {
  team: Team;
  topic?: TopicItem;
  localInv: InvestigationData;
  triggerAutoSave: (updates: Partial<InvestigationData>) => void;
  handleStepChange: (step: number) => void;
  setShowHelpModal: (show: boolean) => void;
}

interface ReviewResult {
  status: 'good' | 'needs_improvement';
  headline: string;
  score: number;
  checklist: {
    hasCause: boolean;
    hasEffect: boolean;
    hasConditionOrScope: boolean;
    isTestable: boolean;
  };
  feedback: string;
  suggestion: string;
  encouragement: string;
}

// Helper for instant local hypothesis evaluation (0ms response)
function evaluateHypothesisLocally(
  hypothesis: string,
  topicTitle: string,
  claim: string
): ReviewResult {
  const trimmed = (hypothesis || '').trim();
  const isQuestion = trimmed.endsWith('?') || trimmed.includes('일까') || trimmed.includes('있는가') || trimmed.includes('맞을까');
  const hasCauseIndicator = /하면|할 경우|할 때|때문에|에 의해|따라|먹으면|사용하면|마시면|보게 되면|노출되면|섭취|착용|가열|충전/.test(trimmed);
  const hasEffectIndicator = /것이다|될 것이다|영향을 미친다|증가한다|감소한다|유발한다|나타날 것이다|다를 것이다|미미할 것이다|효과가 있다|위험하다|높을 것이다|낮을 것이다|차이가 있을 것이다/.test(trimmed);
  const hasConditionIndicator = /조건|경우|사람|이상|이하|기준|상황|다만|그러나|한계|범위|환경|시간|용량/.test(trimmed);
  const isTooShort = trimmed.length < 15;

  const isGood = !isTooShort && !isQuestion && (hasCauseIndicator || hasEffectIndicator) && trimmed.length >= 22;

  if (isGood) {
    return {
      status: 'good',
      headline: '훌륭한 수사 가설입니다! 🎯',
      score: Math.min(98, 85 + (hasConditionIndicator ? 8 : 3) + Math.min(6, Math.floor(trimmed.length / 10))),
      checklist: {
        hasCause: hasCauseIndicator || true,
        hasEffect: hasEffectIndicator || true,
        hasConditionOrScope: hasConditionIndicator || trimmed.length > 32,
        isTestable: true,
      },
      feedback: '원인과 예상 결과가 명확히 연결되어 있으며, 신뢰할 수 있는 데이터나 연구 자료로 검증하기에 매우 훌륭한 문장입니다.',
      suggestion: '이제 STEP 3으로 넘어가서, 이 가설을 입증하거나 반박할 수 있는 신뢰할 수 있는 공식 통계와 연구 자료(증거 카드)를 수집해 보세요.',
      encouragement: '우리 모둠의 훌륭한 탐구 가설이 완성되었습니다! 멋진 팩트체크 수사를 기대합니다.'
    };
  } else {
    let specificFeedback = '';
    let suggestionText = '';

    if (isTooShort) {
      specificFeedback = '가설 문장이 너무 짧아 무엇이 원인이고 어떤 결과가 일어나는지 구체적으로 파악하기 어렵습니다.';
      suggestionText = "'[어떤 원인/행동]을 할 때, [어떤 구체적인 결과]가 나타날 것이다' 형태로 20자 이상 구체적으로 작성해 보세요.";
    } else if (isQuestion) {
      specificFeedback = "문장이 의문문('~일까?', '~인가요?')으로 끝나고 있습니다. 가설은 질문이 아니라 '우리가 예상하는 잠정적 결론 문장(~할 것이다)'이어야 합니다.";
      suggestionText = "끝부분을 '~할 것이다' 또는 '~로 예상된다'처럼 모둠의 예측 진술로 바꿔보세요.";
    } else {
      specificFeedback = '원인과 예상 결과 중 한쪽이 모호하거나 검증하기 어려운 표현이 포함되어 있습니다.';
      suggestionText = "'누가/어떤 조건에서(대상)', '무엇을 할 때(원인)', '어떤 변화가 생길 것인가(결과)' 3가지를 문장에 포함시켜 보세요.";
    }

    return {
      status: 'needs_improvement',
      headline: '조금 더 구체적으로 생각해볼까요? 🧐',
      score: Math.max(35, Math.min(72, trimmed.length * 2)),
      checklist: {
        hasCause: hasCauseIndicator,
        hasEffect: hasEffectIndicator,
        hasConditionOrScope: hasConditionIndicator,
        isTestable: !isQuestion && !isTooShort,
      },
      feedback: specificFeedback,
      suggestion: suggestionText,
      encouragement: "상단의 '💡 잘 모르겠어요 (AI 가설 힌트 & 예시)' 버튼을 누르면 작성 요령과 맞춤형 예시를 확인할 수 있어요!"
    };
  }
}

export const Step2Questions: React.FC<Step2QuestionsProps> = ({
  team,
  topic,
  localInv,
  triggerAutoSave,
  handleStepChange,
  setShowHelpModal,
}) => {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showQuestionGuideModal, setShowQuestionGuideModal] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [showConfirmProceedModal, setShowConfirmProceedModal] = useState(false);

  const topicTitle = team.topicTitle || topic?.title || '수사 사건';
  const claim = team.claim || topic?.claim || '의심스러운 주장';

  // Helper to add a question directly to localInv
  const handleAddQuestion = (questionText: string) => {
    const currentQuestions = localInv.investigationQuestions || [''];
    // If the last element is empty, replace it; otherwise append
    if (currentQuestions.length > 0 && !currentQuestions[currentQuestions.length - 1].trim()) {
      const updated = [...currentQuestions];
      updated[updated.length - 1] = questionText;
      triggerAutoSave({ investigationQuestions: updated });
    } else {
      triggerAutoSave({ investigationQuestions: [...currentQuestions, questionText] });
    }
  };

  // Request AI Diagnosis for Hypothesis (Instant local preview + Fast background AI refinement)
  const handleReviewHypothesis = async (overrideText?: string) => {
    const textToReview = (overrideText !== undefined ? overrideText : localInv.hypothesis || '').trim();
    if (!textToReview) {
      setReviewResult({
        status: 'needs_improvement',
        headline: '가설 문장을 먼저 입력해 주세요! ✍️',
        score: 0,
        checklist: {
          hasCause: false,
          hasEffect: false,
          hasConditionOrScope: false,
          isTestable: false,
        },
        feedback: '아직 수사 가설이 작성되지 않았습니다.',
        suggestion: "'[원인]을 할 경우, [결과]가 나타날 것이다' 형태로 우리 모둠의 생각을 적어보세요.",
        encouragement: "어려우시다면 상단의 '💡 잘 모르겠어요 (AI 힌트 & 예시)' 버튼을 눌러보세요!",
      });
      return;
    }

    // 1. Instant 0ms local assessment to eliminate any waiting lag!
    const instantLocalResult = evaluateHypothesisLocally(textToReview, topicTitle, claim);
    setReviewResult(instantLocalResult);

    // 2. Concurrently fetch AI deep refinement in background
    setIsReviewing(true);
    try {
      const res = await fetch('/api/ai/hypothesis-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle,
          claim,
          hypothesis: textToReview,
        }),
      });
      const data = await res.json();
      if (data.success && data.status) {
        setReviewResult(data);
      }
    } catch (err) {
      console.warn('Hypothesis AI review background error:', err);
    } finally {
      setIsReviewing(false);
    }
  };

  // When next step button is clicked
  const handleNextStep = () => {
    const trimmed = (localInv.hypothesis || '').trim();
    if (!trimmed) {
      handleReviewHypothesis();
      return;
    }

    // Quick instant local check
    const currentEvaluation = reviewResult || evaluateHypothesisLocally(trimmed, topicTitle, claim);
    if (!reviewResult) {
      setReviewResult(currentEvaluation);
    }

    if (currentEvaluation.status === 'needs_improvement') {
      setShowConfirmProceedModal(true);
      return;
    }

    handleStepChange(3);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="step-2-questions">
      {/* Header */}
      <div className="bg-[#0a182c] p-6 rounded-3xl border border-cyan-500/30 space-y-2 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            STEP 02 · QUESTIONS & HYPOTHESIS
          </span>
          <span className="text-[11px] text-cyan-200 font-bold bg-[#0d2242] px-3 py-1 rounded-full border border-cyan-500/30">
            사건: {topicTitle}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          02. 최초 생각 · 수사 질문 · 가설 설정
        </h2>
        <p className="text-xs text-slate-300">
          사건에 대한 최초의 직관적 생각을 기록하고, 핵심 수사 질문과 검증 가능한 가설을 세워보세요.
        </p>
      </div>

      {/* Part A: Initial Belief */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-5 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <h3 className="text-sm font-black text-white">수사 전 최초 생각 및 직관적 심증</h3>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-cyan-300 block">
            수사 전 최초 심증 선택 *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'true', label: '🟢 사실일 것 같다' },
              { id: 'false', label: '🔴 사실이 아닐 것 같다' },
              { id: 'conditional', label: '🟡 조건에 따라 다를 것 같다' },
              { id: 'unknown', label: '⚪ 잘 모르겠다' },
            ].map((opt) => (
              <button
                key={opt.id}
                id={`btn-initial-belief-${opt.id}`}
                onClick={() => triggerAutoSave({ initialBelief: opt.id as any })}
                className={`p-3.5 rounded-2xl text-xs font-black border-2 transition ${
                  localInv.initialBelief === opt.id
                    ? 'border-cyan-400 bg-[#0f274a] text-cyan-200 ring-2 ring-cyan-400/40 shadow-sm'
                    : 'border-slate-700/80 bg-[#071326] text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-cyan-300 block">
            그렇게 생각한 일상 경험이나 이유 *
          </label>
          <textarea
            id="input-initial-reason"
            rows={2}
            value={localInv.initialReason || ''}
            onChange={(e) => triggerAutoSave({ initialReason: e.target.value })}
            placeholder="예: 평소 유튜브나 SNS에서 자주 본 이야기라서 그럴 것이라고 짐작함..."
            className="w-full px-4 py-3 text-xs bg-[#050c18] border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      {/* Part B: Inquiry Questions */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-5 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-black text-white">팩트체크 세부 수사 질문</h3>
          </div>

          {/* Question Guide Modal Trigger */}
          <button
            id="btn-question-guide"
            onClick={() => setShowQuestionGuideModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-200 hover:text-white text-xs font-black border border-cyan-500/40 transition flex items-center gap-1.5 shadow-sm"
          >
            <FileQuestion className="w-4 h-4 text-cyan-300" />
            💡 질문 유형별 작성 가이드 & 형식 예시 (클릭)
          </button>
        </div>

        {/* Quick Question Type Chips for Instant Application */}
        <div className="p-4 bg-[#071526] rounded-2xl border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              5대 수사 질문 유형 템플릿 (클릭하여 빠른 적용)
            </span>
            <span className="text-[11px] text-slate-400">
              궁금한 형식을 누르면 추천 질문 형식을 확인할 수 있습니다.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              {
                id: 'fact',
                icon: Search,
                label: '1. 사실·출처 확인',
                badge: '공식 통계 진위',
                color: 'text-cyan-300',
                border: 'hover:border-cyan-400',
                template: `"${(claim || topicTitle).replace(/["'']/g, '')}" 관련 내용이나 수치가 공식 정부 기관 및 공인 연구소 발표에서도 실제로 확인되는가?`,
              },
              {
                id: 'cause',
                icon: FlaskConical,
                label: '2. 인과·원리 검증',
                badge: '과학적 기전',
                color: 'text-emerald-300',
                border: 'hover:border-emerald-400',
                template: `해당 원인이 그 결과를 직접 일으키는 명확한 과학적·생리학적 메커니즘(작동 원리)이 존재하는가?`,
              },
              {
                id: 'condition',
                icon: Scale,
                label: '3. 조건·용량 한계',
                badge: '기준치·대상',
                color: 'text-amber-300',
                border: 'hover:border-amber-400',
                template: `이 주장은 모든 대상과 상황에 적용되는가, 아니면 특정 고용량/특수 환경 조건에서만 제한적으로 일어나는가?`,
              },
              {
                id: 'counter',
                icon: Puzzle,
                label: '4. 반례·숨은 변수',
                badge: '반대 연구·교란',
                color: 'text-purple-300',
                border: 'hover:border-purple-400',
                template: `이 주장과 정반대로 결론을 내린 반대 연구가 있는가? 결과에 영향을 준 다른 숨겨진 제3의 요인은 없는가?`,
              },
              {
                id: 'source',
                icon: Building2,
                label: '5. 출처·광고 편향',
                badge: '이해관계 충돌',
                color: 'text-rose-300',
                border: 'hover:border-rose-400',
                template: `이 정보를 널리 퍼뜨린 미디어/연구자에게 제품 홍보(광고/스폰서) 등 상업적 이익이나 편향이 있지는 않은가?`,
              },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleAddQuestion(t.template)}
                className={`p-2.5 rounded-xl bg-[#091f3a] border border-slate-700/80 ${t.border} text-left transition flex flex-col justify-between gap-1 group shadow-sm`}
                title="클릭 시 이 유형의 질문 템플릿이 질문 목록에 추가됩니다"
              >
                <div className="flex items-center justify-between">
                  {React.createElement(t.icon, { className: `w-3.5 h-3.5 ${t.color}` })}
                  <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-slate-300 font-semibold">
                    {t.badge}
                  </span>
                </div>
                <span className="text-xs font-black text-white group-hover:text-cyan-200">
                  {t.label}
                </span>
                <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                  <Plus className="w-2.5 h-2.5" /> 템플릿 추가
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Question Inputs */}
        <div className="space-y-3">
          {(localInv.investigationQuestions || ['']).map((q, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-cyan-300">
                  수사 질문 #{idx + 1}
                </label>
                <span className="text-[11px] text-slate-400">
                  {q.trim() ? (
                    q.includes('공식') || q.includes('확인') ? '🔍 사실·출처 확인형' :
                    q.includes('원리') || q.includes('원인') || q.includes('메커니즘') ? '🧪 인과관계 검증형' :
                    q.includes('조건') || q.includes('용량') || q.includes('기준') ? '⚖️ 조건·한계 검증형' :
                    q.includes('반대') || q.includes('다른') || q.includes('요인') ? '🧩 반례·숨은변수형' :
                    q.includes('광고') || q.includes('출처') || q.includes('이익') ? '📊 출처·이해관계형' : '💡 수사 질문'
                  ) : '질문을 입력하세요'}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => {
                    const updated = [...(localInv.investigationQuestions || [])];
                    updated[idx] = e.target.value;
                    triggerAutoSave({ investigationQuestions: updated });
                  }}
                  placeholder="예: 이 주장이 실제 공인된 실험이나 공식 정부 통계에서도 사실로 확인되는가?"
                  className="flex-1 px-4 py-2.5 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                {(localInv.investigationQuestions?.length || 0) > 1 && (
                  <button
                    onClick={() => {
                      const updated = localInv.investigationQuestions.filter((_, i) => i !== idx);
                      triggerAutoSave({ investigationQuestions: updated });
                    }}
                    className="px-3 text-xs text-rose-300 hover:bg-rose-500/20 rounded-xl font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <button
            id="btn-add-question"
            onClick={() => {
              const updated = [...(localInv.investigationQuestions || []), ''];
              triggerAutoSave({ investigationQuestions: updated });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f2444] hover:bg-[#153460] text-cyan-200 text-xs font-bold border border-cyan-500/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            빈 질문 칸 추가하기
          </button>

          <button
            onClick={() => setShowQuestionGuideModal(true)}
            className="text-xs text-cyan-300 hover:text-white flex items-center gap-1 font-bold underline transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            유형별 상세 예시 & 체크리스트 보기
          </button>
        </div>
      </div>

      {/* Part C: Hypothesis & AI Coaching */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-5 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-black text-white">검증 가능한 수사 가설 설정</h3>
          </div>

          {/* "잘 모르겠어요" & AI Hint Button */}
          <button
            id="btn-hypothesis-hints"
            onClick={() => setShowGuideModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 text-amber-200 hover:text-amber-100 text-xs font-black border border-amber-500/40 transition flex items-center gap-1.5 shadow-sm"
          >
            <Lightbulb className="w-4 h-4 text-amber-300 animate-bounce" />
            잘 모르겠어요 💡 (AI 가설 힌트 & 예시)
          </button>
        </div>

        {/* Structure Scaffolding Helper Box */}
        <div className="p-4 bg-[#07172e] rounded-2xl border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              가설 작성 공식 가이드
            </span>
            <span className="text-[11px] text-slate-400">
              스스로 생각하여 3가지 요소를 포함한 문장으로 완성해 보세요!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-[#091f3c] border border-cyan-500/30 space-y-1">
              <span className="px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-black">
                1. 원인 (독립)
              </span>
              <p className="text-[11px] text-slate-300 font-medium">
                "~을 할 때 / ~하면 / ~때문에"
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#091f3c] border border-emerald-500/30 space-y-1">
              <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 text-[10px] font-black">
                2. 결과 (종속)
              </span>
              <p className="text-[11px] text-slate-300 font-medium">
                "~한 변화/효과가 나타날 것이다"
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#091f3c] border border-purple-500/30 space-y-1">
              <span className="px-1.5 py-0.5 rounded bg-purple-400/20 text-purple-300 text-[10px] font-black">
                3. 조건 및 한계
              </span>
              <p className="text-[11px] text-slate-300 font-medium">
                "다만 ~조건에 따라 차이가 있을 것"
              </p>
            </div>
          </div>
        </div>

        {/* Hypothesis Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-cyan-300 block">
              수사팀 가설 문장 *
            </label>
            <span className="text-[11px] text-slate-400">
              현재 {localInv.hypothesis?.length || 0}자
            </span>
          </div>
          <textarea
            id="input-hypothesis"
            rows={3}
            value={localInv.hypothesis || ''}
            onChange={(e) => {
              triggerAutoSave({ hypothesis: e.target.value });
              // Clear previous review when text changes
              if (reviewResult) setReviewResult(null);
            }}
            placeholder="예: 영양 균형 잡힌 아침식사는 오전 뇌 인지 능력 향상에 긍정적인 영향을 미칠 것이나, 수면 시간과 식단 구성에 따라 차이가 있을 것이다."
            className="w-full px-4 py-3 text-xs bg-[#050c18] border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 leading-relaxed"
          />
        </div>

        {/* Action Controls: AI Review & Help */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="btn-review-hypothesis"
              onClick={() => handleReviewHypothesis()}
              disabled={isReviewing}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-200 hover:text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm"
            >
              {isReviewing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  AI가 가설을 진단하는 중...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 text-cyan-300" />
                  🔍 가설 진단 및 AI 피드백 받기
                </>
              )}
            </button>

            <button
              onClick={() => setShowGuideModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-[#0f2444] hover:bg-[#163660] border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              힌트 보기
            </button>
          </div>

          <button
            onClick={() => setShowHelpModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition shrink-0 flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            선생님 지원 요청
          </button>
        </div>

        {/* AI Diagnosis / Review Result Banner */}
        {reviewResult && (
          <div
            className={`p-5 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 duration-300 space-y-3.5 shadow-lg ${
              reviewResult.status === 'good'
                ? 'bg-[#082329] border-emerald-500/50 text-emerald-100'
                : 'bg-[#291816] border-amber-500/50 text-amber-100'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {reviewResult.status === 'good' ? (
                  <div className="p-1.5 rounded-lg bg-emerald-500/30 text-emerald-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-amber-500/30 text-amber-300">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-black text-white">
                    {reviewResult.headline}
                  </h4>
                  <span className="text-[11px] font-semibold opacity-80">
                    {reviewResult.status === 'good'
                      ? '검증 가능한 탄탄한 가설의 형태를 잘 갖추었습니다.'
                      : '아래 팁을 참고하여 조금만 더 구체화해 보세요!'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isReviewing && (
                  <span className="text-[10px] text-cyan-300 font-bold flex items-center gap-1 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full animate-pulse">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    AI 심층 진단 중...
                  </span>
                )}
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-black/30 border border-white/20">
                  완성도 점수: {reviewResult.score}점
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div
                className={`p-2 rounded-xl flex items-center gap-1.5 font-bold ${
                  reviewResult.checklist.hasCause
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                }`}
              >
                {reviewResult.checklist.hasCause ? '✓' : '✗'} 원인(독립) 명확성
              </div>
              <div
                className={`p-2 rounded-xl flex items-center gap-1.5 font-bold ${
                  reviewResult.checklist.hasEffect
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                }`}
              >
                {reviewResult.checklist.hasEffect ? '✓' : '✗'} 결과(종속) 구체성
              </div>
              <div
                className={`p-2 rounded-xl flex items-center gap-1.5 font-bold ${
                  reviewResult.checklist.hasConditionOrScope
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                }`}
              >
                {reviewResult.checklist.hasConditionOrScope ? '✓' : '△'} 조건/범위 고려
              </div>
              <div
                className={`p-2 rounded-xl flex items-center gap-1.5 font-bold ${
                  reviewResult.checklist.isTestable
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                }`}
              >
                {reviewResult.checklist.isTestable ? '✓' : '✗'} 검증 가능 서술문
              </div>
            </div>

            {/* Diagnostic Feedback and Suggestions */}
            <div className="p-3 bg-black/40 rounded-xl space-y-1.5 text-xs">
              <p className="leading-relaxed font-medium">
                <strong className="text-white">📝 AI 피드백:</strong> {reviewResult.feedback}
              </p>
              {reviewResult.suggestion && (
                <p className="text-cyan-200 leading-relaxed font-medium">
                  <strong className="text-cyan-300">💡 수정 제안:</strong> {reviewResult.suggestion}
                </p>
              )}
            </div>

            {/* Encouragement & Helper Button */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-[11px] opacity-90 font-medium">
                {reviewResult.encouragement}
              </span>
              {reviewResult.status === 'needs_improvement' && (
                <button
                  onClick={() => setShowGuideModal(true)}
                  className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  맞춤형 가설 예시 보기
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
        <button
          id="btn-step-2-prev"
          onClick={() => handleStepChange(1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1c34] border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          이전: 01 사건 접수
        </button>
        <button
          id="btn-step-2-next"
          onClick={handleNextStep}
          disabled={isReviewing}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg"
        >
          다음: 03 증거 수집으로 이동
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal: Investigation Question Guide Modal */}
      <InvestigationQuestionGuideModal
        isOpen={showQuestionGuideModal}
        onClose={() => setShowQuestionGuideModal(false)}
        team={team}
        topic={topic}
        onAddQuestion={handleAddQuestion}
      />

      {/* Modal: Hypothesis Guide & AI Hints Modal */}
      <HypothesisGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        team={team}
        topic={topic}
        currentHypothesis={localInv.hypothesis || ''}
        onApplyTemplate={(sentence) => {
          triggerAutoSave({ hypothesis: sentence });
          handleReviewHypothesis(sentence);
        }}
      />

      {/* Modal: Confirm Proceed when hypothesis needs improvement */}
      {showConfirmProceedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a182c] border border-amber-500/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  조금 더 생각해보세요! 🧐
                </h3>
                <p className="text-xs text-amber-200/90 font-medium">
                  현재 가설을 조금 더 다듬으면 더 명확한 수사를 진행할 수 있어요.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#061224] border border-slate-700 text-xs text-slate-300 space-y-1.5">
              <p className="font-semibold text-white">
                💡 AI의 보완 제안:
              </p>
              <p className="text-cyan-200">
                {reviewResult?.suggestion || "'[원인]을 하면 [구체적 결과]가 나타날 것이다' 형태로 보완해 보세요."}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowConfirmProceedModal(false);
                  setShowGuideModal(true);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5"
              >
                <Lightbulb className="w-4 h-4" />
                가설 힌트 보고 수정하기
              </button>
              <button
                onClick={() => {
                  setShowConfirmProceedModal(false);
                  handleStepChange(3);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                그대로 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
