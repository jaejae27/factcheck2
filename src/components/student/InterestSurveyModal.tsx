import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Newspaper,
  Database,
  Users,
  AlertTriangle,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { FACT_CHECK_TOPICS, ROLE_DEFINITIONS } from '../../data/topics';
import { TopicItem, InterestSurveyAnswers, Student, Team } from '../../types';

interface InterestSurveyModalProps {
  student?: Student;
  team?: Team;
  allStudents?: Student[];
  onSelectTopic: (topic: TopicItem) => void;
  onClose: () => void;
}

export const InterestSurveyModal: React.FC<InterestSurveyModalProps> = ({
  student,
  team,
  allStudents,
  onSelectTopic,
  onClose,
}) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<InterestSurveyAnswers>({
    favoriteCategory: 'school',
    investigationStyle: 'kosis_first',
    desiredDifficulty: 'easy',
    preferredSourceType: 'kosis_stat',
    teamCuriosity: 'daily_myth',
  });
  const [recommendations, setRecommendations] = useState<TopicItem[]>([]);

  // Confirmation dialog state for topic selection
  const [pendingTopic, setPendingTopic] = useState<TopicItem | null>(null);

  const isTeamLeader = student?.role === 'team_leader';
  const myRoleDef = student?.role ? ROLE_DEFINITIONS[student.role] : null;

  const handleFinishSurvey = () => {
    // Score topics based on survey answers with heavy preference for KOSIS & BigKinds ready topics
    const scored = FACT_CHECK_TOPICS.map((topic) => {
      let score = 0;

      // KOSIS & BigKinds priority
      if (topic.isKosisRecommended) score += 6;
      if (topic.kosisTip) score += 2;
      if (topic.bigkindsTip) score += 2;

      // Category match
      if (topic.category === answers.favoriteCategory) score += 6;

      // Difficulty match
      if (topic.difficulty === answers.desiredDifficulty) score += 4;

      // Style match
      if (answers.investigationStyle === 'kosis_first' && topic.isKosisRecommended) {
        score += 5;
      }
      if (answers.investigationStyle === 'trending_news' && (topic.category === 'current' || topic.isTrending)) {
        score += 4;
      }
      if (
        answers.investigationStyle === 'friends_believe' &&
        (topic.category === 'school' || topic.category === 'daily' || topic.category === 'health')
      ) {
        score += 4;
      }
      if (answers.investigationStyle === 'twist' && topic.difficulty !== 'easy') {
        score += 3;
      }

      // Source preference bonus
      if (answers.preferredSourceType === 'kosis_stat' && topic.kosisTip) {
        score += 4;
      }
      if (answers.preferredSourceType === 'bigkinds_news' && topic.bigkindsTip) {
        score += 4;
      }

      return { topic, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topPicks = scored.slice(0, 4).map((s) => s.topic);
    setRecommendations(topPicks);
    setStep(6); // Results view
  };

  const handleConfirmTopic = () => {
    if (pendingTopic) {
      onSelectTopic(pendingTopic);
      setPendingTopic(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-4 sm:p-7 text-slate-800 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        
        {step < 6 ? (
          <div className="space-y-4 sm:space-y-5 flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    맞춤 팩트수사 사건 추천 설문
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    KOSIS(국가통계)·빅카인즈(뉴스데이터) 검증 맞춤 ({step}/5 문항)
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition shrink-0"
              >
                닫기
              </button>
            </div>

            {/* Question Container */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* Question 1 */}
              {step === 1 && (
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Q1. 우리 모둠이 가장 관심 있는 탐구 분야는 어디인가요?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'school', label: '🏫 학교생활·통계', desc: '아침밥과 성적, 학교폭력 추이, 9시 등교, 학령인구 등', highlight: true },
                      { id: 'health', label: '🍔 음식·건강·음료', desc: '에너지음료 잠깨기, 제로탄산 발암, 청소년 비만율 등', highlight: true },
                      { id: 'sns', label: '📱 SNS·스마트폰', desc: '스마트폰 과의존 80%설, 숏폼 팝콘브레인, 다크모드 등', highlight: true },
                      { id: 'current', label: '🚨 시의성 사회이슈', desc: '전기차 화재율, AI 딥페이크 사칭, 손선풍기 전자파 등' },
                      { id: 'tech', label: '🤖 AI·디지털기술', desc: '손선풍기 전자파, 생성 AI 환각, 배터리 수명 등' },
                      { id: 'env', label: '🌍 환경·기후변화', desc: '여름 폭염일수 역대 최고설, 미세먼지 추이 등' },
                      { id: 'daily', label: '🔍 생활 속 궁금증', desc: '반려동물 가구 70%설, 3초 법칙, 껌 7년 등' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, favoriteCategory: opt.id })}
                        className={`p-3.5 rounded-2xl text-left border-2 transition min-h-[48px] ${
                          answers.favoriteCategory === opt.id
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-sm ring-1 ring-indigo-500'
                            : opt.highlight
                            ? 'border-cyan-200 hover:border-cyan-400 bg-cyan-50/30 text-slate-800'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs sm:text-sm font-bold">{opt.label}</p>
                          {opt.highlight && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-600 text-white uppercase">
                              추천
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 2 */}
              {step === 2 && (
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Q2. 어떤 방식으로 사건을 파헤쳐보고 싶나요?
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      {
                        id: 'kosis_first',
                        label: '📊 KOSIS 국가통계 & 빅카인즈 뉴스로 명확히 밝혀지는 사건',
                        desc: '정부 공식 통계표와 뉴스 보도량을 검색하여 실제 데이터 수치로 검증 (추천)',
                        highlight: true,
                      },
                      {
                        id: 'friends_believe',
                        label: '👥 친구들이 다들 진짜라고 믿고 있는 학교/생활 속 이야기',
                        desc: '아침밥, 에너지음료, 스마트폰 중독 등 친구들의 흔한 편견 바로잡기',
                      },
                      {
                        id: 'trending_news',
                        label: '🚨 뉴스와 SNS를 뜨겁게 달군 화제 사회 이슈',
                        desc: '전기차 화재율, 딥페이크 사칭 등 사회적 논란 팩트체크',
                      },
                      {
                        id: 'twist',
                        label: '⚡ 생각지도 못한 통계의 함정과 반전이 숨어있는 사건',
                        desc: '평균의 함정, 조건과 예외가 숨어있는 탐구',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, investigationStyle: opt.id })}
                        className={`w-full p-3.5 sm:p-4 rounded-2xl text-left border-2 transition min-h-[48px] ${
                          answers.investigationStyle === opt.id
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-sm ring-1 ring-indigo-500'
                            : opt.highlight
                            ? 'border-cyan-300 hover:border-cyan-400 bg-cyan-50/40 text-slate-800'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs sm:text-sm font-bold">{opt.label}</p>
                          {opt.highlight && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-600 text-white">
                              데이터 검증
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 3 */}
              {step === 3 && (
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Q3. 우리 모둠의 수사관 난이도 희망 수준은?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'easy',
                        label: '🟢 입문 난이도',
                        desc: 'KOSIS 통계표와 빅카인즈 기사에서 직관적인 수치를 바로 찾을 수 있는 쉬운 사건 (추천)',
                      },
                      {
                        id: 'medium',
                        label: '🟡 표준 난이도',
                        desc: '2개 이상의 통계표나 기사를 비교하여 조건과 비율을 확인하는 표준 사건',
                      },
                      {
                        id: 'hard',
                        label: '🔴 심화 난이도',
                        desc: '장기 시계열 인구 통계와 다각도 정책 보고서를 교차 검증하는 깊은 사건',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, desiredDifficulty: opt.id })}
                        className={`p-3.5 rounded-2xl text-left border-2 transition min-h-[48px] ${
                          answers.desiredDifficulty === opt.id
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-1 ring-indigo-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-bold">{opt.label}</p>
                        <p className="text-[11px] text-slate-500 font-normal mt-1 leading-snug">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 4 */}
              {step === 4 && (
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Q4. 어떤 검증 도구를 주로 활용하고 싶나요?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'kosis_stat',
                        label: '📊 KOSIS 국가통계포털',
                        desc: '질병관리청(건강행태조사), 교육부, 과기정통부, 통계청 공식 수치',
                      },
                      {
                        id: 'bigkinds_news',
                        label: '📰 빅카인즈 뉴스 빅데이터',
                        desc: '한국언론진흥재단 54개 언론사 보도량 추이, 관계도, 팩트체크 기사',
                      },
                      {
                        id: 'research_stat',
                        label: '🔬 정부·연구소 공인 보고서',
                        desc: '식약처 위해성 평가, 국립전파연구원, 한국인터넷진흥원(KISA)',
                      },
                      {
                        id: 'academic_paper',
                        label: '🧪 의학회·학술 연구 논문',
                        desc: '대한신경정신의학회, 대한안과학회, 대학 연구소',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, preferredSourceType: opt.id })}
                        className={`p-3.5 rounded-2xl text-left border-2 transition min-h-[48px] ${
                          answers.preferredSourceType === opt.id
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-1 ring-indigo-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-bold">{opt.label}</p>
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 5 */}
              {step === 5 && (
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Q5. 오늘 수업에서 모둠원들과 함께 얻고 싶은 가장 큰 보람은?
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { id: 'daily_myth', label: '✨ 통계와 뉴스를 직접 찾아내어 인터넷 소문의 진짜 진위를 밝히기' },
                      { id: 'critical_mind', label: '🧠 가짜뉴스와 과장된 주장에 속지 않는 비판적 데이터 판별력 키우기' },
                      { id: 'current_truth', label: '🚨 친구들과 사회에서 뜨거운 화제 이슈의 진짜 사실을 확인하기' },
                      { id: 'cool_briefing', label: '🎤 명확한 통계 근거를 바탕으로 멋진 팩트체크 발표 브리핑 완료하기' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, teamCuriosity: opt.id })}
                        className={`w-full p-3.5 sm:p-4 rounded-2xl text-left border-2 transition min-h-[48px] ${
                          answers.teamCuriosity === opt.id
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-1 ring-indigo-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-bold">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              <button
                disabled={step === 1}
                onClick={() => setStep((s) => s - 1)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 min-h-[40px]"
              >
                이전 문항
              </button>
              {step < 5 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm min-h-[44px]"
                >
                  다음 문항
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleFinishSurvey}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-md min-h-[44px]"
                >
                  맞춤 사건 추천받기
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results: 4 Recommended Topics with Consensus Coordination Banner */
          <div className="space-y-4 flex flex-col flex-1 overflow-hidden animate-in fade-in duration-200">
            {/* Coordination Banner */}
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl shrink-0 space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>우리 모둠 탐구 사건 합의 및 접수 안내</span>
                </div>
                {myRoleDef && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-indigo-700 rounded-lg border border-indigo-200">
                    내 역할: {myRoleDef.title} {isTeamLeader && '👑(대표)'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-indigo-900 leading-snug">
                모둠원 각자가 설문을 진행하더라도, <strong>모둠원들과 대화하여 1개의 최종 사건으로 합의한 후 접수</strong>하세요.
                접수 시 전원에게 즉시 동기화됩니다.
              </p>
            </div>

            {/* Title */}
            <div className="text-center shrink-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                수사본부 KOSIS & 빅카인즈 맞춤 사건 추천 (4선)
              </h3>
              <p className="text-[11px] text-slate-500">
                원하는 사건을 누르면 모둠 합의 확인 후 공식 수사 사건으로 접수됩니다.
              </p>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
              {recommendations.map((topic) => (
                <div
                  key={topic.id}
                  className="p-3.5 sm:p-4 rounded-2xl border-2 border-indigo-100 hover:border-indigo-600 bg-slate-50 hover:bg-indigo-50/40 transition flex flex-col justify-between space-y-2.5 text-left shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700">
                          {topic.categoryLabel}
                        </span>
                        {topic.isKosisRecommended && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-cyan-600 text-white flex items-center gap-0.5">
                            <Database className="w-2.5 h-2.5" />
                            KOSIS·빅카인즈
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          topic.difficulty === 'easy'
                            ? 'text-emerald-700'
                            : topic.difficulty === 'medium'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {topic.difficulty === 'easy'
                          ? '🟢 입문'
                          : topic.difficulty === 'medium'
                          ? '🟡 표준'
                          : '🔴 심화'}
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                      {topic.title}
                    </h5>

                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      "{topic.claim}"
                    </p>

                    {/* Quick Search Hints */}
                    {topic.kosisTip && (
                      <div className="mt-2 p-1.5 bg-white rounded-xl border border-cyan-200/80 text-[10px] text-cyan-900 flex items-start gap-1">
                        <BarChart3 className="w-3 h-3 text-cyan-600 shrink-0 mt-0.5" />
                        <div className="line-clamp-1">
                          <strong className="font-bold text-cyan-800">KOSIS:</strong> {topic.kosisTip.tableTitle}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPendingTopic(topic)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1 min-h-[38px]"
                  >
                    {isTeamLeader ? '👑 모둠 대표로 이 사건 접수' : '이 사건으로 모둠 접수'}
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center pt-1 shrink-0">
              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-2"
              >
                전체 사건 검색창에서 직접 찾아보기
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Confirmation Modal to ensure Team Consensus */}
      {pendingTopic && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 text-slate-900 shadow-2xl space-y-4 border-2 border-indigo-500">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <ShieldCheck className="w-6 h-6 shrink-0 text-indigo-600" />
              <div>
                <h4 className="text-base font-black text-slate-900 leading-tight">
                  모둠 공식 수사 사건 접수 확인
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {team?.teamName || '우리 모둠'} 전원 동기화
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                선택한 사건
              </span>
              <p className="text-sm font-black text-slate-900">{pendingTopic.title}</p>
              <p className="text-xs text-slate-600 italic leading-snug">"{pendingTopic.claim}"</p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                모둠원들과 합의하셨나요?
              </p>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                접수 버튼을 누르면 <strong>모둠원 전원의 화면에 이 사건이 즉시 적용</strong>됩니다.
                다른 모둠원들과 충분히 상의한 후 접수해 주세요.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setPendingTopic(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 min-h-[40px]"
              >
                다시 상의하기
              </button>
              <button
                onClick={handleConfirmTopic}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 min-h-[40px]"
              >
                <Check className="w-4 h-4" />
                합의 완료! 공식 접수하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
