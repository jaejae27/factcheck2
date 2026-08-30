import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle, Flame, AlertTriangle } from 'lucide-react';
import { FACT_CHECK_TOPICS } from '../../data/topics';
import { TopicItem, InterestSurveyAnswers } from '../../types';

interface InterestSurveyModalProps {
  onSelectTopic: (topic: TopicItem) => void;
  onClose: () => void;
}

export const InterestSurveyModal: React.FC<InterestSurveyModalProps> = ({ onSelectTopic, onClose }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<InterestSurveyAnswers>({
    favoriteCategory: 'current',
    investigationStyle: 'trending_news',
    desiredDifficulty: 'easy',
    preferredSourceType: 'research_stat',
    teamCuriosity: 'daily_myth',
  });
  const [recommendations, setRecommendations] = useState<TopicItem[]>([]);

  const handleFinishSurvey = () => {
    // Score topics based on survey answers
    const scored = FACT_CHECK_TOPICS.map((topic) => {
      let score = 0;
      
      // Category match
      if (topic.category === answers.favoriteCategory) score += 6;
      
      // Difficulty match
      if (topic.difficulty === answers.desiredDifficulty) score += 3;
      
      // Style match
      if (answers.investigationStyle === 'trending_news' && (topic.category === 'current' || topic.isTrending)) {
        score += 5;
      }
      if (answers.investigationStyle === 'twist' && topic.difficulty === 'hard') {
        score += 3;
      }
      if (answers.investigationStyle === 'internet_rumor' && (topic.category === 'sns' || topic.category === 'tech')) {
        score += 3;
      }
      if (answers.investigationStyle === 'friends_believe' && (topic.category === 'school' || topic.category === 'daily')) {
        score += 3;
      }

      // Source preference bonus
      if (answers.preferredSourceType === 'research_stat') {
        if (topic.suggestedSources.some(s => s.includes('통계') || s.includes('소방청') || s.includes('대검찰청') || s.includes('식약처') || s.includes('질병관리청') || s.includes('KISA'))) {
          score += 2;
        }
      }

      return { topic, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topPicks = scored.slice(0, 4).map((s) => s.topic);
    setRecommendations(topPicks);
    setStep(6); // Results view
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-800 overflow-hidden">
        
        {step < 6 ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">맞춤 팩트수사 사건 추천 설문</h3>
                  <p className="text-xs text-slate-500">중1 수사관을 위한 5문항 관심도 진단 ({step}/5)</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                직접 고르기
              </button>
            </div>

            {/* Question 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  Q1. 우리 모둠이 가장 관심 있는 탐구 분야는 어디인가요?
                </h4>
                <div className="grid grid-cols-2 gap-2.5 max-h-[48vh] overflow-y-auto pr-1">
                  {[
                    { id: 'current', label: '🚨 최신 시의성 & 사회이슈', desc: '딥페이크 사칭, 전기차 화재, 촉법소년, 제로감미료 등', highlight: true },
                    { id: 'school', label: '🏫 학교생활 & 공부', desc: '아침밥, 스마트폰 금지, 모차르트 효과 등' },
                    { id: 'sns', label: '📱 SNS·유튜브·미디어', desc: '숏폼 팝콘브레인, 다크모드, AI 환각 등' },
                    { id: 'tech', label: '🤖 AI & 최신 기술', desc: 'AI 탐지기, 손선풍기 전자파, 배터리 충전 등' },
                    { id: 'health', label: '🍔 음식 & 건강', desc: '제로음료, 야식, 탄산 직후 양치 등' },
                    { id: 'env', label: '🌍 환경 & 자연', desc: '동해안 상어 출몰, 종이빨대, 선풍기 괴담 등' },
                    { id: 'sports', label: '⚽ 스포츠 & 연예', desc: '땀복 운동, E스포츠, 관절 꺾기 등' },
                    { id: 'daily', label: '🔍 생활 속 궁금증', desc: '3초 법칙, 껌 7년, 새치 뽑기 등' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers({ ...answers, favoriteCategory: opt.id })}
                      className={`p-3.5 rounded-2xl text-left border-2 transition ${
                        answers.favoriteCategory === opt.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-sm'
                          : opt.highlight
                            ? 'border-rose-200 hover:border-rose-300 bg-rose-50/40 text-slate-800'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">{opt.label}</p>
                        {opt.highlight && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500 text-white uppercase">HOT</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  Q2. 어떤 유형의 사건을 파헤쳐보고 싶나요?
                </h4>
                <div className="space-y-2.5">
                  {[
                    { id: 'trending_news', label: '🚨 최근 뉴스 속보와 커뮤니티를 달군 뜨거운 시의성 이슈', desc: '전기차 화재, 딥페이크 사칭, 촉법소년 등 실제 사회적 논란 팩트체크', highlight: true },
                    { id: 'friends_believe', label: '👥 친구들이 다들 진짜라고 믿고 있는 이야기', desc: '흔히 퍼진 생활 속 통념이 맞는지 과학적으로 검증' },
                    { id: 'internet_rumor', label: '🌐 인터넷과 유튜브에서 자주 보는 자극적인 소문', desc: '알고리즘이 퍼뜨린 과장된 주장의 실체 추적' },
                    { id: 'twist', label: '⚡ 생각지도 못한 반전 결과가 숨어있을 것 같은 사건', desc: '조건과 예외, 통계 착시를 집요하게 찾는 사건' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers({ ...answers, investigationStyle: opt.id })}
                      className={`w-full p-4 rounded-2xl text-left border-2 transition ${
                        answers.investigationStyle === opt.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold shadow-sm'
                          : opt.highlight
                            ? 'border-rose-200 hover:border-rose-300 bg-rose-50/30 text-slate-800'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">{opt.label}</p>
                        {opt.highlight && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500 text-white">시의성 추천</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  Q3. 우리 모둠이 도전하고 싶은 수사 난이도는?
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'easy', label: '🟢 기본 수사', desc: '명확한 팩트와 실험 자료가 잘 나와 있는 쉬운 사건' },
                    { id: 'medium', label: '🟡 표준 수사', desc: '조건과 조사 대상에 따라 결과가 달라지는 탐구 사건' },
                    { id: 'hard', label: '🔴 심화 수사', desc: '복잡한 공식 통계와 연구 교차 검증이 필요한 깊은 사건' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers({ ...answers, desiredDifficulty: opt.id })}
                      className={`p-4 rounded-2xl text-left border-2 transition ${
                        answers.desiredDifficulty === opt.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <p className="text-sm font-bold">{opt.label}</p>
                      <p className="text-xs text-slate-500 font-normal mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 4 */}
            {step === 4 && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  Q4. 수사할 때 어떤 공신력 있는 자료를 주로 파헤쳐보고 싶나요?
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'research_stat', label: '📊 정부 기관 공식 통계 & 보고서', desc: '소방청, 대검찰청, 식약처, KISA, 질병관리청 데이터' },
                    { id: 'academic_paper', label: '🔬 대학 및 연구소 실험 논문', desc: '네이처, 하버드, 국내 학술 연구소 발표 논문' },
                    { id: 'expert_interview', label: '👨‍⚕️ 학회·의사 전문 감정 및 지침', desc: '의학회, 안과학회, 인간공학회 가이드' },
                    { id: 'comparison_cases', label: '📑 국내외 언론사 팩트체크 검증 보도', desc: '한국언론진흥재단 및 방송사 팩트체크 기사' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers({ ...answers, preferredSourceType: opt.id })}
                      className={`p-3.5 rounded-2xl text-left border-2 transition ${
                        answers.preferredSourceType === opt.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <p className="text-sm font-bold">{opt.label}</p>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 5 */}
            {step === 5 && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  Q5. 오늘 수업에서 모둠원들과 함께 얻고 싶은 가장 큰 보람은?
                </h4>
                <div className="space-y-2.5">
                  {[
                    { id: 'current_truth', label: '🚨 뉴스와 SNS에 퍼진 뜨거운 화제 이슈의 진짜 팩트를 밝혀내기' },
                    { id: 'daily_myth', label: '✨ 일상 속 잘못된 상식을 바로잡아 친구들에게 알려주기' },
                    { id: 'critical_mind', label: '🧠 인터넷 정보의 진짜 원출처를 끝까지 추적하는 탐정 실력 키우기' },
                    { id: 'cool_briefing', label: '🎤 완벽한 근거로 동료 수사관들을 감탄시키는 멋진 브리핑 진행' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers({ ...answers, teamCuriosity: opt.id })}
                      className={`w-full p-4 rounded-2xl text-left border-2 transition ${
                        answers.teamCuriosity === opt.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <p className="text-sm font-bold">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={step === 1}
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30"
              >
                이전 문항
              </button>
              {step < 5 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  다음 문항
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleFinishSurvey}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-md"
                >
                  맞춤 사건 추천받기
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results: 3~4 Recommended Topics */
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <span className="inline-block p-2 rounded-2xl bg-indigo-100 text-indigo-700 mb-1">
                <Sparkles className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-black text-slate-900">
                수사본부 알고리즘 맞춤 사건 추천 완료!
              </h3>
              <p className="text-xs text-slate-500">
                우리 모둠의 관심사와 수사 성향에 딱 맞는 4대 사건 파일입니다. 하나를 선택해 수사를 개시하세요.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
              {recommendations.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between space-y-3 text-left shadow-sm ${
                    topic.isTrending
                      ? 'border-rose-300 hover:border-rose-500 bg-rose-50/30 hover:bg-rose-50/60'
                      : 'border-slate-200 hover:border-indigo-600 bg-slate-50 hover:bg-indigo-50/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700">
                          {topic.categoryLabel}
                        </span>
                        {topic.isTrending && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500 text-white flex items-center gap-0.5">
                            <Flame className="w-3 h-3" />
                            {topic.trendingBadge || '핫이슈'}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold ${
                        topic.difficulty === 'easy' ? 'text-emerald-700' :
                        topic.difficulty === 'medium' ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {topic.difficulty === 'easy' ? '🟢 기본' : topic.difficulty === 'medium' ? '🟡 표준' : '🔴 심화'}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm leading-snug">
                      {topic.title}
                    </h5>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      "{topic.claim}"
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectTopic(topic)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1"
                  >
                    이 사건 접수하기
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-2"
              >
                전체 사건 목록에서 직접 선택하기
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
