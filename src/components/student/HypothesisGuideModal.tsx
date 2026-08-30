import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Copy,
  RefreshCw,
  Flame
} from 'lucide-react';
import { TopicItem, Team } from '../../types';

interface HypothesisExample {
  type: 'positive' | 'conditional' | 'critical';
  typeLabel: string;
  badge: string;
  formula: string;
  sentence: string;
  explanation: string;
}

interface HypothesisHintResponse {
  structureGuide: {
    cause: string;
    effect: string;
    condition: string;
  };
  guidingQuestions: string[];
  examples: HypothesisExample[];
  cautionTip: string;
}

interface HypothesisGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  topic?: TopicItem;
  currentHypothesis: string;
  onApplyTemplate: (sentence: string) => void;
}

function getDefaultHintsForTopic(
  topicTitle: string,
  claim: string,
  topic?: TopicItem
): HypothesisHintResponse {
  const shortSubject = (claim || topicTitle || '해당 주장').slice(0, 35);
  const questions = topic?.hintQuestions && topic.hintQuestions.length > 0
    ? topic.hintQuestions
    : [
        `"${shortSubject}" 주장이 언제나 100% 모든 사람에게 사실일까?`,
        '원인과 결과 사이에 어떤 조건(양, 시간, 대상)이 영향을 미칠까?',
        '반대로 생각했을 때 어떤 예외나 부작용이 존재할까?'
      ];

  const primaryKeyword = topic?.keywords?.[0] || '핵심 요인';
  const secondaryKeyword = topic?.keywords?.[1] || '관련 지표';

  return {
    structureGuide: {
      cause: `${primaryKeyword} 관련 행동이나 요인 (예: 규칙적인 섭취, 사용 빈도, 작동 방식)`,
      effect: `${secondaryKeyword} 및 실제 측정 가능한 결과 (예: 집중도 점수, 발생 확률, 안전성)`,
      condition: '성장기 청소년 대상, 사용 환경, 일일 허용 기준 등 적용 범위'
    },
    guidingQuestions: questions,
    examples: [
      {
        type: 'positive',
        typeLabel: '기본 입증형 가설',
        badge: '원인→결과 직접 연결',
        formula: '[원인/행동]을 하면 [예상되는 구체적 결과]가 나타날 것이다.',
        sentence: `"${shortSubject}" 주장의 핵심 원인이 작용할 경우, 대상의 상태나 통계 지표에 유의미한 변화가 나타날 것이다.`,
        explanation: '가장 직관적인 형태로, 원인과 결과의 직접적인 인과관계를 시험해보는 가설입니다.'
      },
      {
        type: 'conditional',
        typeLabel: '조건부/한계 가설',
        badge: '상황별 차이 탐구',
        formula: '[특정 조건]에서는 성립하지만, [다른 조건]에서는 결과가 달라질 것이다.',
        sentence: `"${shortSubject}"은 표준 기준과 일상 조건 내에서는 성립하지만, 대상이나 환경 조건에 따라 결과가 다를 것이다.`,
        explanation: '단순한 참/거짓을 넘어 어떤 조건에서만 유효한지 파고드는 깊이 있는 가설입니다.'
      },
      {
        type: 'critical',
        typeLabel: '비판적 반증 가설',
        badge: '통념/착시 의심',
        formula: '알려진 통념과 달리, 실제로는 [진짜 원인/다른 요인]에 의해 결정될 것이다.',
        sentence: `"${shortSubject}"이라는 대중적 소문과 달리, 공식 통계와 실증 연구에서는 인과관계가 미미할 것이다.`,
        explanation: '소문이나 과장된 광고의 오류를 의심하고 과학적 팩트를 밝혀내려는 가설입니다.'
      }
    ],
    cautionTip: '💡 팁: 위 예시를 그대로 베끼기보다, 우리 모둠의 수사 방향에 맞게 단어를 바꿔서 완성해 보세요!'
  };
}

export const HypothesisGuideModal: React.FC<HypothesisGuideModalProps> = ({
  isOpen,
  onClose,
  team,
  topic,
  currentHypothesis,
  onApplyTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'ai_hints' | 'structure_guide' | 'bad_vs_good'>('ai_hints');
  const [isAiRefining, setIsAiRefining] = useState(false);
  const topicTitle = team.topicTitle || topic?.title || '수사 사건';
  const claim = team.claim || topic?.claim || '의심스러운 주장';

  const [hintData, setHintData] = useState<HypothesisHintResponse>(() =>
    getDefaultHintsForTopic(topicTitle, claim, topic)
  );
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const fetchHypothesisHints = async () => {
    setIsAiRefining(true);
    try {
      const res = await fetch('/api/ai/hypothesis-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle,
          claim,
          background: topic?.background || '',
          keywords: topic?.keywords || [],
          hintQuestions: topic?.hintQuestions || [],
          counterEvidenceClue: topic?.counterEvidenceClue || '',
          currentDraft: currentHypothesis,
        }),
      });

      const data = await res.json();
      if (data.success && data.examples) {
        setHintData(data);
      }
    } catch (err) {
      console.warn('Failed to load hypothesis hints:', err);
    } finally {
      setIsAiRefining(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Set instant default hints immediately
      setHintData(getDefaultHintsForTopic(topicTitle, claim, topic));
      fetchHypothesisHints();
    }
  }, [isOpen, topicTitle, claim]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a182c] border border-cyan-500/40 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0d2242] to-[#0a1930] border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Lightbulb className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  AI 수사 가설 멘토링
                </span>
                <span className="text-[11px] text-slate-400 font-bold">중1 눈높이 가설 나침반</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                가설 작성이 어렵나요? 생각의 실마리를 풀어드릴게요!
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Case Banner */}
        <div className="px-6 py-3 bg-[#061224] border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="text-cyan-400 font-bold shrink-0">🎯 수사 사건:</span>
            <span className="text-white font-semibold truncate">{topicTitle}</span>
            <span className="text-slate-400 truncate hidden sm:inline">({claim})</span>
          </div>
          <button
            onClick={fetchHypothesisHints}
            disabled={isAiRefining}
            className="text-[11px] text-cyan-300 hover:text-cyan-100 flex items-center gap-1 font-bold shrink-0 transition"
          >
            <RefreshCw className={`w-3 h-3 ${isAiRefining ? 'animate-spin' : ''}`} />
            {isAiRefining ? 'AI가 최적화 힌트 생성 중...' : 'AI 힌트 새로고침'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#071529] px-6 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'ai_hints', label: '💡 맞춤형 AI 힌트 & 예시', icon: Sparkles },
            { id: 'structure_guide', label: '📐 가설 3대 공식 & 원리', icon: BookOpen },
            { id: 'bad_vs_good', label: '⚖️ 좋은 가설 vs 아쉬운 가설', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black border-b-2 transition whitespace-nowrap ${
                  active
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-300' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: AI Tailored Hints & Examples */}
          {activeTab === 'ai_hints' && (
            <div className="space-y-6">
              {hintData && (
                <>
                  {/* Step-by-Step Thinking Questions */}
                  <div className="p-4 rounded-2xl bg-[#0e2548] border border-cyan-500/30 space-y-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-400 text-slate-950">
                        생각의 징검다리
                      </span>
                      <h4 className="text-xs font-black text-cyan-200">
                        가설을 쓰기 전, 모둠원들과 함께 아래 3가지 질문을 던져보세요!
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {hintData.guidingQuestions.map((q, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-slate-200 bg-[#07172e] p-3 rounded-xl border border-slate-700/60"
                        >
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-[11px] flex items-center justify-center shrink-0 border border-cyan-500/40">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5 leading-relaxed font-medium">{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3 Scaffolded Hypothesis Examples */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-400" />
                        우리 사건에 맞춘 3가지 가설 유형 예시
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold">
                        ※ 예시를 참고하여 우리 모둠만의 문장으로 변형해 보세요!
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {hintData.examples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-[#091b33] border border-slate-700 hover:border-cyan-500/50 transition space-y-2.5 relative group shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                ex.type === 'positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                ex.type === 'conditional' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}>
                                {ex.typeLabel}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">{ex.badge}</span>
                            </div>

                            <button
                              onClick={() => {
                                onApplyTemplate(ex.sentence);
                                setCopiedIdx(idx);
                                setTimeout(() => {
                                  setCopiedIdx(null);
                                  onClose();
                                }, 600);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[11px] transition flex items-center gap-1.5 shadow"
                            >
                              {copiedIdx === idx ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                                  가설창에 적용됨!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  이 문장으로 시작하기
                                </>
                              )}
                            </button>
                          </div>

                          <div className="p-3 bg-[#050e1c] rounded-xl border border-slate-800 text-xs text-cyan-100 font-semibold leading-relaxed">
                            "{ex.sentence}"
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1">
                            <span>📐 <strong className="text-slate-300">공식:</strong> {ex.formula}</span>
                            <span className="text-slate-400">{ex.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Educational Caveat */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>{hintData.cautionTip}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: Structure Guide */}
          {activeTab === 'structure_guide' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#0f2444] border border-cyan-500/40 space-y-2">
                <h3 className="text-sm font-black text-cyan-200 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-300" />
                  수사 가설의 3대 핵심 기둥 (가설 작성 공식)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  가설은 막연한 추측이나 단순 질문이 아닙니다. <strong>"원인"</strong>과 <strong>"결과"</strong>, 그리고 <strong>"조건"</strong>이 포함되어 있어 실제 증거를 찾아 참/거짓을 따져볼 수 있는 <strong>검증 가능한 예측 문장</strong>이어야 합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#091b33] border border-cyan-500/30 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black text-xs">
                    01
                  </div>
                  <h4 className="text-xs font-black text-cyan-300">원인 (독립변인)</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    어떤 행동, 요인, 조작을 하는가?<br />
                    예: <em>"아침밥을 챙겨 먹으면"</em>, <em>"제로 음료를 매일 마실 경우"</em>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#091b33] border border-emerald-500/30 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-xs">
                    02
                  </div>
                  <h4 className="text-xs font-black text-emerald-300">결과 (종속변인)</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    어떤 구체적인 변화나 현상이 나타나는가?<br />
                    예: <em>"오전 집중력 점수가 상승할 것이다"</em>, <em>"체중 증가에 미치는 영향이 적을 것이다"</em>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#091b33] border border-purple-500/30 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-xs">
                    03
                  </div>
                  <h4 className="text-xs font-black text-purple-300">조건 및 한계</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    어떤 사람, 양, 환경에서 성립하는가?<br />
                    예: <em>"성장기 청소년의 경우"</em>, <em>"일일 섭취 허용량 범위 내에서는"</em>
                  </p>
                </div>
              </div>

              {/* Master Formula Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d2242] to-[#122e56] border border-cyan-400/50 space-y-2">
                <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">
                  ★ 수사 가설 완성 공식 마스터 템플릿
                </span>
                <p className="text-sm font-black text-white leading-relaxed">
                  "[대상/조건]에서 [원인/행동]을 할 경우, [구체적인 결과/현상]이 나타날 것이다. 다만 [예외 조건]에 따라 차이가 있을 것이다."
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Bad vs Good Examples */}
          {activeTab === 'bad_vs_good' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                아래 예시들을 비교해보며, 왜 어떤 문장은 가설로 부족하고 어떤 문장이 훌륭한 가설인지 파악해 보세요.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Example 1 */}
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/30 text-rose-300">
                      ❌ 아쉬운 가설 1 (단순 의문문)
                    </span>
                  </div>
                  <p className="text-xs font-bold text-rose-200">
                    "아침을 먹으면 뇌가 좋아질까?"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <strong>문제점:</strong> 가설은 질문이 아니라 우리가 증거를 통해 검증할 <strong>예측 서술문</strong>이어야 합니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/30 text-emerald-300">
                      ⭕ 좋은 가설 1 (검증 가능 서술문)
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-200">
                    "아침 식사를 규칙적으로 섭취한 학생은 결식한 학생보다 오전 집중력과 인지 검사 점수가 높을 것이다."
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong>장점:</strong> 비교 대상(섭취 vs 결식)과 측정 가능한 결과(오전 집중력 점수)가 명확합니다.
                  </p>
                </div>

                {/* Example 2 */}
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/30 text-rose-300">
                      ❌ 아쉬운 가설 2 (너무 모호한 표현)
                    </span>
                  </div>
                  <p className="text-xs font-bold text-rose-200">
                    "제로 탄산음료는 몸에 매우 나쁠 것이다."
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <strong>문제점:</strong> '몸에 나쁘다'는 표현은 혈당인지, 발암인지, 소화인지 기준이 없어 어떤 증거를 찾아야 할지 모호합니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/30 text-emerald-300">
                      ⭕ 좋은 가설 2 (구체적 지표와 조건)
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-200">
                    "제로 음료의 인공감미료는 일반 설탕과 달리 혈당을 급격히 올리지 않지만, 하루 5캔 이상 과다 섭취 시 장내 미생물에 영향을 줄 것이다."
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong>장점:</strong> 혈당과 장내 미생물이라는 구체적 지표와 '하루 5캔 이상'이라는 조건이 명확합니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#071324] border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-medium">
            💡 우리 모둠만의 가설을 완성하여 팩트 수사를 힘차게 시작해 보세요!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black transition"
          >
            확인 및 작성하러 가기
          </button>
        </div>
      </div>
    </div>
  );
};
