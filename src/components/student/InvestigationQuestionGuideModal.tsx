import React, { useState } from 'react';
import {
  X,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Plus,
  ArrowRight,
  BookOpen,
  Search,
  Scale,
  FlaskConical,
  Puzzle,
  Building2,
  FileQuestion,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { TopicItem, Team } from '../../types';

export interface QuestionTypeDefinition {
  id: string;
  name: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  bgColor: string;
  tagColor: string;
  purpose: string;
  formula: string;
  structure: {
    part1: string;
    part2: string;
    part3: string;
  };
  generalExample: string;
  topicSpecificQuestions: string[];
  tips: string;
}

interface InvestigationQuestionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  topic?: TopicItem;
  onAddQuestion: (question: string) => void;
}

export function getQuestionTypesForTopic(topicTitle: string, claim: string, topic?: TopicItem): QuestionTypeDefinition[] {
  const shortClaim = (claim || topicTitle || '의심스러운 주장').replace(/["'']/g, '');
  const kw1 = topic?.keywords?.[0] || '핵심 요인';
  const kw2 = topic?.keywords?.[1] || '결과 지표';

  return [
    {
      id: 'fact_verification',
      name: '1. 사실 및 공식 출처 확인형',
      badge: '출처·수치 팩트체크',
      icon: Search,
      color: 'text-cyan-300',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-950/40',
      tagColor: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40',
      purpose: '주장 속의 핵심 수치, 사건 발생 사실, 인용된 연구가 실제 신뢰할 수 있는 공식 기관에 존재하는지 확인합니다.',
      formula: `"[주장된 내용/수치]는 [전문 공공기관/통계청/학술 연구]에서도 실제로 사실로 확인되는가?"`,
      structure: {
        part1: '검증할 주장/수치',
        part2: '신뢰할 공공/전문 출처',
        part3: '실제 일치 여부 확인',
      },
      generalExample: '인터넷에 유포된 통계 수치가 국가통계포털(KOSIS)이나 식약처 공식 발표 자료와 일치하는가?',
      topicSpecificQuestions: [
        `"${shortClaim}" 주장의 근거가 된 연구나 보도는 신뢰할 수 있는 공인 기관(학회, 정부 부처 등)의 자료인가?`,
        `주장에 언급된 ${kw1} 관련 수치나 통계가 공식 기관의 1차 발표 자료에서도 동일하게 확인되는가?`,
      ],
      tips: '인터넷 블로그나 SNS 글 대신, 정부 부처(식약처, 질병청), 공공연구소, 대학 학술 논문의 1차 원문 출처를 묻는 질문을 던져보세요.',
    },
    {
      id: 'causality_mechanism',
      name: '2. 인과관계 및 과학적 원리 규명형',
      badge: '과학적 기전·원인 분석',
      icon: FlaskConical,
      color: 'text-emerald-300',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-950/40',
      tagColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
      purpose: '단순한 우연의 일치나 시간상 전후 관계(상관관계)가 아니라, 과학적/의학적 원리에 의해 직접 일어난 인과관계인지 밝힙니다.',
      formula: `"[원인 행동]이 [결과 현상]을 직접 유발하는 구체적인 과학적/생리학적 메커니즘은 무엇인가?"`,
      structure: {
        part1: '원인 행동 및 변인',
        part2: '발생한 변화/결과',
        part3: '직접적 작동 원리(기전)',
      },
      generalExample: 'A를 섭취한 후 B 증상이 나타났을 때, A 속의 어떤 성분이 체내에서 B를 직접 일으키는가?',
      topicSpecificQuestions: [
        `${kw1}이(가) ${kw2}에 직접적인 변화를 일으키는 명확한 과학적·생리학적 원리는 무엇인가?`,
        `단순히 두 사건이 우연히 동시에 일어난 것(상관관계)인가, 아니면 실제 직접적인 인과관계인가?`,
      ],
      tips: '"~했더니 ~되었다"는 전후 관계를 무조건 원인으로 단정하지 않고, 중간 연결 메커니즘이 과학적으로 입증되었는지 파고드세요.',
    },
    {
      id: 'condition_threshold',
      name: '3. 조건·용량 및 한계 검증형',
      badge: '적용 범위·기준치 분석',
      icon: Scale,
      color: 'text-amber-300',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-950/40',
      tagColor: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
      purpose: '모든 사람/모든 상황에 100% 일어나는 일반화인지, 특정 용량·연령·환경 조건에서만 제한적으로 나타나는지 한계를 규명합니다.',
      formula: `"[이 현상/위험]은 [어떤 특정 대상/용량/사용 환경]에서만 나타나는가? 일반적인 일상 조건에서도 동일한가?"`,
      structure: {
        part1: '해당 현상이나 위험',
        part2: '특정 조건 및 기준치',
        part3: '일상적 일반화 가능성',
      },
      generalExample: '실험실에서 쥐에게 극단적인 고용량을 투여했을 때의 결과를 일상적인 인간 섭취량에도 그대로 적용할 수 있는가?',
      topicSpecificQuestions: [
        `"${shortClaim}" 현상은 일상적인 정상 사용/섭취 범위에서도 발생하는가, 아니면 극단적인 조건에서만 발생하는가?`,
        `성장기 청소년, 성인, 특정 질환자 등 대상의 연령과 건강 상태에 따라 결과가 다르게 나타나는가?`,
      ],
      tips: '"독성은 용량이 결정한다(모든 물질은 과하면 유해하다)"는 원칙을 기억하며, 1일 섭취 허용량이나 안전 기준치를 확인하는 질문을 던지세요.',
    },
    {
      id: 'counterexample_confounder',
      name: '4. 반례 및 제3의 숨은 변수 탐색형',
      badge: '반대 연구·교란요인 추적',
      icon: Puzzle,
      color: 'text-purple-300',
      borderColor: 'border-purple-500/40',
      bgColor: 'bg-purple-950/40',
      tagColor: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
      purpose: '주장을 반박하는 반대 연구 결과가 있는지 확인하고, 결과에 진짜 영향을 준 제3의 숨겨진 원인(교란 변수)이 없는지 검토합니다.',
      formula: `"[주장과 반대되는 연구 결과나 반례]는 없는가? [다른 제3의 요인]이 결과에 더 큰 영향을 준 것은 아닌가?"`,
      structure: {
        part1: '반대 사례나 반례',
        part2: '제3의 숨겨진 변수',
        part3: '대안적 원인 검토',
      },
      generalExample: '성적이 오른 것이 특정한 학습 음료 때문인가, 아니면 공부 시간 증가나 수면 습관 등 다른 요인 때문인가?',
      topicSpecificQuestions: [
        `이 주장과 정반대의 결론을 내린 국내외 연구 논문이나 학회 반론 자료는 존재하는가?`,
        `${kw2}에 영향을 준 진짜 원인이 ${kw1} 외에 다른 환경적·심리적 요인은 없었는가?`,
      ],
      tips: '확증 편향(자신의 생각과 일치하는 자료만 찾는 오류)을 깨기 위해, 반대 의견이나 예외 사례를 적극적으로 찾는 질문을 던져야 합니다.',
    },
    {
      id: 'source_bias',
      name: '5. 출처의 이해관계 및 신뢰성 검증형',
      badge: '광고·편향·스폰서 확인',
      icon: Building2,
      color: 'text-rose-300',
      borderColor: 'border-rose-500/40',
      bgColor: 'bg-rose-950/40',
      tagColor: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
      purpose: '정보를 알리고 퍼뜨린 주체가 상업적 광고(마케팅), 유튜브 조회수 유도, 특정 이익 집단의 후원을 받았는지 점검합니다.',
      formula: `"[이 정보/연구]를 작성하거나 발표한 주체에게 [상업적 마케팅 이익이나 편향]이 얽혀 있지는 않은가?"`,
      structure: {
        part1: '정보 발표/전달자',
        part2: '상업적/조회수 목적',
        part3: '연구비 지원 및 이해상충',
      },
      generalExample: '이 건강 효능을 주장하는 기사나 영상이 특정 제조 업체의 유료 광고(PPL/협찬)는 아닌가?',
      topicSpecificQuestions: [
        `이 주장을 강하게 퍼뜨린 미디어/인플루언서에게 상품 판매나 조회수 유도 등 상업적 목적이 있는가?`,
        `해당 연구의 연구비를 지원한 기업이나 단체가 결과에 영향을 미쳤을 가능성(이해관계 상충)은 없는가?`,
      ],
      tips: '정보의 배후에 있는 작성자(저자)의 전문성과 연구비 후원 출처를 확인하여 정보의 객관성을 평가하세요.',
    },
  ];
}

export const InvestigationQuestionGuideModal: React.FC<InvestigationQuestionGuideModalProps> = ({
  isOpen,
  onClose,
  team,
  topic,
  onAddQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'types' | 'checklist' | 'comparison'>('types');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('fact_verification');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const topicTitle = team.topicTitle || topic?.title || '수사 사건';
  const claim = team.claim || topic?.claim || '의심스러운 주장';
  const questionTypes = getQuestionTypesForTopic(topicTitle, claim, topic);
  const selectedType = questionTypes.find((t) => t.id === selectedTypeId) || questionTypes[0];

  const handleApply = (questionText: string, idKey: string) => {
    onAddQuestion(questionText);
    setCopiedIndex(idKey);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#071325] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0a1f3c] via-[#08182f] to-[#0a1f3c] border-b border-cyan-500/30 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                팩트체크 수사 질문 가이드
              </span>
              <span className="text-xs text-slate-300 font-bold">
                사건: {topicTitle}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-cyan-400" />
              어떤 질문을 던져야 할까요? 5대 수사 질문 유형 & 형식 예시
            </h3>
            <p className="text-xs text-slate-300">
              날카로운 팩트체크 수사는 '좋은 질문'에서 시작됩니다. 질문의 목적에 맞는 형식을 골라 우리 모둠의 질문을 완성해 보세요.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-6 pt-3 bg-[#050e1c] border-b border-slate-700/60 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('types')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'types'
                ? 'bg-[#0a1e3a] text-cyan-300 border-t border-x border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            5대 수사 질문 유형 & 형식 예시
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'bg-[#0a1e3a] text-cyan-300 border-t border-x border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            좋은 질문 vs 아쉬운 질문 비교
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-[#0a1e3a] text-cyan-300 border-t border-x border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            질문 완성도 자가 점검표
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#061120]">
          {/* TAB 1: 5 Question Types & Formats */}
          {activeTab === 'types' && (
            <div className="space-y-6">
              {/* Type Selection Pills */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  궁금한 질문 유형을 선택해 보세요:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {questionTypes.map((t) => {
                    const IconComponent = t.icon;
                    const isSelected = selectedTypeId === t.id;

                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTypeId(t.id)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                          isSelected
                            ? `${t.bgColor} ${t.borderColor} ring-2 ring-cyan-400/40 shadow-md`
                            : 'bg-[#08182e] border-slate-700/80 hover:bg-[#0d2340] hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <IconComponent className={`w-4 h-4 ${t.color}`} />
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${t.tagColor}`}>
                            {t.badge}
                          </span>
                        </div>
                        <span className={`text-xs font-black line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {t.name.split('. ')[1] || t.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Type Detailed Guide Card */}
              <div className={`p-5 sm:p-6 rounded-3xl border ${selectedType.borderColor} ${selectedType.bgColor} space-y-5 shadow-xl`}>
                {/* Header & Purpose */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-black/40 border border-white/10 text-cyan-300">
                        {React.createElement(selectedType.icon, { className: `w-5 h-5 ${selectedType.color}` })}
                      </span>
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-white">
                          {selectedType.name}
                        </h4>
                        <span className={`text-[11px] font-bold ${selectedType.color}`}>
                          핵심 목표: {selectedType.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed bg-black/30 p-3 rounded-2xl border border-white/10">
                    🎯 <strong>질문하는 이유:</strong> {selectedType.purpose}
                  </p>
                </div>

                {/* Question Formula / Template */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    표준 질문 공식 (템플릿 형식)
                  </span>
                  <div className="p-4 bg-[#050f1d] rounded-2xl border border-cyan-500/40 text-cyan-100 font-bold text-xs sm:text-sm leading-relaxed shadow-inner">
                    {selectedType.formula}
                  </div>

                  {/* Structure Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 space-y-1">
                      <span className="text-[10px] font-black text-cyan-300">요소 1</span>
                      <p className="text-xs text-slate-200 font-medium">{selectedType.structure.part1}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 space-y-1">
                      <span className="text-[10px] font-black text-emerald-300">요소 2</span>
                      <p className="text-xs text-slate-200 font-medium">{selectedType.structure.part2}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 space-y-1">
                      <span className="text-[10px] font-black text-amber-300">요소 3</span>
                      <p className="text-xs text-slate-200 font-medium">{selectedType.structure.part3}</p>
                    </div>
                  </div>
                </div>

                {/* Topic Specific Example Questions (Click to Add) */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      '{topicTitle}' 사건 맞춤 추천 질문 예시
                    </span>
                    <span className="text-[11px] text-slate-300">
                      클릭하여 내 수사 질문에 바로 추가하세요!
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedType.topicSpecificQuestions.map((qText, idx) => {
                      const itemKey = `${selectedType.id}-${idx}`;
                      const isApplied = copiedIndex === itemKey;

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-[#071526] border border-cyan-500/30 hover:border-cyan-400/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md group"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/40">
                              Q{idx + 1}
                            </span>
                            <p className="text-xs text-white font-medium leading-relaxed">
                              "{qText}"
                            </p>
                          </div>

                          <button
                            onClick={() => handleApply(qText, itemKey)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center justify-center gap-1.5 shadow-sm ${
                              isApplied
                                ? 'bg-emerald-500 text-slate-950 font-black'
                                : 'bg-cyan-500/20 hover:bg-cyan-400 hover:text-slate-950 text-cyan-200 border border-cyan-500/40'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                질문에 추가됨!
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                이 질문 추가하기
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Practical Advice Tip */}
                <div className="p-3 bg-cyan-950/60 rounded-2xl border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>💡 수사관 작성 팁:</strong> {selectedType.tips}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Good vs Bad Comparison */}
          {activeTab === 'comparison' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#0a1e3a] rounded-2xl border border-cyan-500/30 space-y-1">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  팩트체크 수사 질문: 좋은 질문 vs 아쉬운 질문
                </h4>
                <p className="text-xs text-slate-300">
                  단순한 '예/아니오' 질문이나 감정적 질문은 증거를 찾기 어렵습니다. 구체적인 조건과 지표를 담아 질문하세요!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bad Questions */}
                <div className="p-5 rounded-3xl bg-[#1c0d12] border border-rose-500/40 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black text-xs">
                      ❌ 피해야 할 아쉬운 질문
                    </span>
                    <span className="text-xs text-rose-200 font-bold">자료 검색이 어려움</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-black/40 rounded-2xl border border-rose-500/20 space-y-1">
                      <p className="font-bold text-rose-300">"제로음료 몸에 진짜 나쁜가요?"</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        ⚠️ <strong>문제점:</strong> '몸에 나쁘다'의 기준이 너무 막연하고, 어떤 성분을 얼마나 먹었는지 조건이 빠져 있습니다.
                      </p>
                    </div>

                    <div className="p-3 bg-black/40 rounded-2xl border border-rose-500/20 space-y-1">
                      <p className="font-bold text-rose-300">"전기차가 내연기관차보다 더 위험하죠?"</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        ⚠️ <strong>문제점:</strong> 자신의 선입견이나 결론을 정해두고 묻는 유도 질문이며, 객관적 화재 통계 비교가 어렵습니다.
                      </p>
                    </div>

                    <div className="p-3 bg-black/40 rounded-2xl border border-rose-500/20 space-y-1">
                      <p className="font-bold text-rose-300">"유튜브 보니까 다들 맞다던데요?"</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        ⚠️ <strong>문제점:</strong> 다수의 소문이나 개인 의견에 의존하여 공인된 1차 출처나 연구를 검증하지 못합니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Good Questions */}
                <div className="p-5 rounded-3xl bg-[#09221d] border border-emerald-500/40 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs">
                      ⭕ 훌륭한 팩트체크 수사 질문
                    </span>
                    <span className="text-xs text-emerald-200 font-bold">명확한 데이터 검증 가능</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-black/40 rounded-2xl border border-emerald-500/20 space-y-1.5">
                      <p className="font-bold text-emerald-300">
                        "제로음료의 감미료(아스파탐 등)를 식약처 1일 허용량 내로 섭취할 때 인슐린이나 장내 미생물에 미치는 영향은?"
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        ✨ <strong>장점:</strong> 구체적인 성분명, 섭취 허용량 기준, 측정 가능한 신체 지표가 명시되어 명확한 논문 검색이 가능합니다.
                      </p>
                    </div>

                    <div className="p-3 bg-black/40 rounded-2xl border border-emerald-500/20 space-y-1.5">
                      <p className="font-bold text-emerald-300">
                        "소방청 통계상 등록 대수 1만 대당 차량 화재 발생 비율은 전기차와 내연기관차 중 어디가 더 높은가?"
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        ✨ <strong>장점:</strong> 공인된 기관(소방청)과 공정한 비교 기준(1만 대당 비율)을 설정하여 객관적 사실을 규명할 수 있습니다.
                      </p>
                    </div>

                    <div className="p-3 bg-black/40 rounded-2xl border border-emerald-500/20 space-y-1.5">
                      <p className="font-bold text-emerald-300">
                        "이 주장을 보도한 기사에서 인용한 실험은 동물을 대상으로 한 것인가, 사람 대상 임상 시험인가?"
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        ✨ <strong>장점:</strong> 실험 대상의 한계를 짚어 과장된 일반화 오류를 날카롭게 지적할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Question Quality Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#0a1e3a] rounded-2xl border border-cyan-500/30 space-y-1">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  우리 모둠 수사 질문 자가진단 체크리스트
                </h4>
                <p className="text-xs text-slate-300">
                  작성한 수사 질문이 팩트체크 수사에 적합한지 아래 4가지 항목을 하나씩 점검해 보세요.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: '1. 검증 가능한 1차 출처나 데이터가 존재하는가?',
                    desc: '개인의 주관적 느낌이나 감상이 아니라, 통계청 자료, 식약처 공문, 학술 논문 등으로 증명할 수 있는 질문이어야 합니다.',
                    example: '추천 형식: "~는 공인된 연구나 국가 기관 통계에서 실제로 확인되는가?"',
                  },
                  {
                    title: '2. 질문에 구체적인 대상이나 조건이 명시되었는가?',
                    desc: '누구에게(청소년/성인), 어느 정도의 양(용량/시간)으로, 어떤 상황에서 일어나는지 구체적 조건이 들어가야 합니다.',
                    example: '추천 형식: "일상적인 정상 사용 조건(기준치 이내)에서도 동일하게 유해한가?"',
                  },
                  {
                    title: '3. 원인과 결과를 분명하게 구분하였는가?',
                    desc: '우연히 두 사건이 함께 일어난 것(상관관계)과 진짜 원인이 되어 발생한 것(인과관계)을 따져보는 질문이어야 합니다.',
                    example: '추천 형식: "A가 B의 진짜 직접적인 원인인가, 아니면 C라는 제3의 요인이 작용한 것인가?"',
                  },
                  {
                    title: '4. 반대 의견이나 예외 가능성을 열어두었는가?',
                    desc: '내 생각과 반대되는 연구 결과나 반례가 존재하는지 확인하는 질문을 통해 확증 편향을 방지해야 합니다.',
                    example: '추천 형식: "이 주장과 정반대로 결론을 내린 반대 연구나 공식 반론은 없는가?"',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#08182c] border border-slate-700/80 space-y-2 hover:border-cyan-500/40 transition"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/40">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-xs sm:text-sm font-black text-white">
                          {item.title}
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.desc}
                        </p>
                        <p className="text-[11px] text-cyan-300 font-bold bg-[#040e1b] px-3 py-1.5 rounded-xl border border-cyan-500/30 inline-block mt-1">
                          💡 {item.example}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#050e1b] border-t border-slate-700/80 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400 hidden sm:inline">
            질문 유형을 조합하여 다각적인 팩트체크 수사를 진행하세요.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md"
          >
            확인 및 질문 작성 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};
