import React from 'react';
import { ArrowLeft, ArrowRight, FileText, Plus, BarChart3, Newspaper, ExternalLink, Lightbulb, Database } from 'lucide-react';
import { EvidenceCard, InvestigationData, Team } from '../../../types';
import { FACT_CHECK_TOPICS } from '../../../data/topics';

interface Step3EvidenceCollectionProps {
  team: Team;
  localInv: InvestigationData;
  evidenceList: EvidenceCard[];
  triggerAutoSave: (updates: Partial<InvestigationData>) => void;
  handleStepChange: (step: number) => void;
  setShowEvidenceModal: (show: boolean) => void;
  setEditingCard: (card: EvidenceCard | null) => void;
  deleteEvidenceCard: (cardId: string, teamId: string) => Promise<void>;
}

export const Step3EvidenceCollection: React.FC<Step3EvidenceCollectionProps> = ({
  team,
  localInv,
  evidenceList,
  triggerAutoSave,
  handleStepChange,
  setShowEvidenceModal,
  setEditingCard,
  deleteEvidenceCard,
}) => {
  const currentTopic = FACT_CHECK_TOPICS.find((t) => t.id === team.topicId);

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="step-3-evidence">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a182c] p-6 rounded-3xl border border-cyan-500/30 shadow-lg">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            STEP 03 · EVIDENCE COLLECTION
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            03. 증거 수집 계획 & 증거 카드 등록
          </h2>
          <p className="text-xs text-slate-300">
            KOSIS 국가통계와 빅카인즈 뉴스 빅데이터를 활용하여 객관적인 증거를 수집하고 카드로 등록하세요.
          </p>
        </div>
        <button
          id="btn-new-evidence-card"
          onClick={() => {
            setEditingCard(null);
            setShowEvidenceModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
          새 증거 카드 등록
        </button>
      </div>

      {/* KOSIS & BigKinds Investigation Helper Box */}
      <div className="p-6 bg-gradient-to-br from-[#071933] to-[#0c2242] rounded-3xl border-2 border-cyan-500/40 space-y-4 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Database className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-black text-white">
              수사본부 공식 팩트체크 추천 포털 & 검색 가이드
            </h3>
          </div>
          <span className="text-[11px] text-cyan-300 font-bold bg-[#040e1c] px-3 py-1 rounded-xl border border-cyan-500/30">
            중학생 맞춤형 데이터 검색 팁 제공
          </span>
        </div>

        {/* 2 Portal Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* KOSIS Card */}
          <div className="p-4 bg-[#051428] rounded-2xl border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                1. KOSIS 국가통계포털 (공식 통계표)
              </span>
              <a
                href="https://kosis.kr"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-cyan-400 hover:text-white bg-[#030914] px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1 transition"
              >
                kosis.kr 열기
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              통계청, 교육부, 질병관리청(청소년건강행태조사), 과기정통부의 공인 데이터를 검색합니다.
            </p>
            {currentTopic?.kosisTip ? (
              <div className="p-2.5 bg-[#030a14] rounded-xl border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
                <p><strong className="text-white">추천 통계표:</strong> {currentTopic.kosisTip.tableTitle}</p>
                <p><strong className="text-cyan-300">검색어:</strong> <code className="bg-[#081b33] px-1.5 py-0.5 rounded text-cyan-100">{currentTopic.kosisTip.searchKeywords}</code></p>
                <p className="text-[11px] text-slate-400">{currentTopic.kosisTip.description}</p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                * KOSIS 상단 검색창에 조사할 핵심 키워드를 입력하고 [통계표] 탭을 확인하세요.
              </p>
            )}
          </div>

          {/* BigKinds Card */}
          <div className="p-4 bg-[#0a1835] rounded-2xl border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                <Newspaper className="w-4 h-4 text-indigo-400" />
                2. 빅카인즈 (뉴스 빅데이터 팩트체크)
              </span>
              <a
                href="https://www.bigkinds.or.kr"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-indigo-300 hover:text-white bg-[#030914] px-2.5 py-1 rounded-lg border border-indigo-500/30 flex items-center gap-1 transition"
              >
                bigkinds.or.kr 열기
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              한국언론진흥재단 54개 언론사의 보도 추이, 관계도 및 팩트체크 검증 보도를 확인합니다.
            </p>
            {currentTopic?.bigkindsTip ? (
              <div className="p-2.5 bg-[#030a14] rounded-xl border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                <p><strong className="text-indigo-300">검색식:</strong> <code className="bg-[#0b1b36] px-1.5 py-0.5 rounded text-indigo-100">{currentTopic.bigkindsTip.query}</code></p>
                <p className="text-[11px] text-slate-400"><strong className="text-white">분석 포인트:</strong> {currentTopic.bigkindsTip.analysisPoint}</p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                * 빅카인즈 뉴스검색에서 '팩트체크 OR 통계'와 함께 검색하면 정확한 검증 보도를 찾을 수 있습니다.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Part A: Evidence Plan */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-4 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <h3 className="text-sm font-black text-white">증거 탐색 & 검색 전략 계획</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-cyan-300 block">
              조사할 목표 공인 출처 기관 (질병관리청, 교육부, KOSIS, 빅카인즈, 공인 학회 등)
            </label>
            <input
              type="text"
              value={localInv.evidencePlan?.targetSources?.join(', ') || ''}
              onChange={(e) =>
                triggerAutoSave({
                  evidencePlan: {
                    ...localInv.evidencePlan,
                    targetSources: e.target.value.split(',').map((s) => s.trim()),
                  },
                })
              }
              placeholder="예: KOSIS 통계청, 질병관리청 청소년건강행태조사, 빅카인즈 팩트체크 기사"
              className="w-full px-4 py-2.5 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-cyan-300 block">
              포털/학술 사이트 검색 키워드 계획
            </label>
            <input
              type="text"
              value={localInv.evidencePlan?.searchKeywords?.join(', ') || ''}
              onChange={(e) =>
                triggerAutoSave({
                  evidencePlan: {
                    ...localInv.evidencePlan,
                    searchKeywords: e.target.value.split(',').map((s) => s.trim()),
                  },
                })
              }
              placeholder={currentTopic?.kosisTip ? `예: ${currentTopic.kosisTip.searchKeywords}` : '예: 아침식사 학업성취도 상관관계, 청소년 수면시간 인지기능'}
              className="w-full px-4 py-2.5 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Part B: Evidence Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-black text-white">
              확보된 증거 카드 목록 ({evidenceList.length}건)
            </h3>
          </div>
          <span className="text-xs text-slate-400">각 수사관별로 최소 2~4건 이상의 증거 확보 권장</span>
        </div>

        {evidenceList.length === 0 ? (
          <div className="p-12 text-center bg-[#0a182c] rounded-3xl border border-dashed border-slate-700 space-y-3 shadow-md">
            <FileText className="w-10 h-10 text-cyan-400 mx-auto" />
            <p className="text-sm font-black text-white">아직 등록된 증거 카드가 없습니다.</p>
            <p className="text-xs text-slate-300">위 KOSIS와 빅카인즈 팁을 확인하고 첫 번째 증거 카드를 등록해 보세요.</p>
            <button
              onClick={() => setShowEvidenceModal(true)}
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black rounded-xl transition shadow-md"
            >
              첫 증거 카드 작성하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidenceList.map((ev, idx) => (
              <div
                key={ev.id}
                className="p-5 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-3 flex flex-col justify-between shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-xs text-cyan-300">
                      증거 #{idx + 1}. {ev.title}
                    </span>
                    <div className="flex items-center gap-1">
                      {ev.sourceType === 'kosis_stat' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                          📊 KOSIS 통계
                        </span>
                      )}
                      {ev.sourceType === 'bigkinds_news' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                          📰 빅카인즈 뉴스
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          ev.stance === 'supports'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : ev.stance === 'refutes'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {ev.stance === 'supports' ? '가설 지지' : ev.stance === 'refutes' ? '가설 반박' : '조건 제시'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 font-medium leading-relaxed line-clamp-3">
                    {ev.keyContent}
                  </p>

                  <div className="text-[11px] text-slate-300 space-y-0.5 pt-2 border-t border-slate-700/80 font-medium">
                    <p>
                      발행/출처: <span className="text-white font-bold">{ev.publisher || '미기재'}</span>{' '}
                      ({ev.isOriginalSource ? '원출처' : '2차 인용'})
                    </p>
                    {ev.keyMetrics && (
                      <p>
                        주요 통계: <span className="text-emerald-300 font-bold">{ev.keyMetrics}</span>
                      </p>
                    )}
                    <p>
                      작성 수사관: <span className="text-white font-bold">{ev.authorName}</span>
                    </p>
                  </div>

                  {ev.imageUrl && (
                    <img
                      src={ev.imageUrl}
                      alt="증거 캡처"
                      className="max-h-32 rounded-xl object-contain bg-[#050c18] border border-slate-700 mx-auto mt-2"
                    />
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/80">
                  <button
                    onClick={() => {
                      setEditingCard(ev);
                      setShowEvidenceModal(true);
                    }}
                    className="px-3 py-1 text-xs text-cyan-300 hover:text-cyan-200 font-black"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => deleteEvidenceCard(ev.id, team.id)}
                    className="px-3 py-1 text-xs text-rose-300 hover:text-rose-200 font-black"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
        <button
          id="btn-step-3-prev"
          onClick={() => handleStepChange(2)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1c34] border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          이전: 02 수사 질문
        </button>
        <button
          id="btn-step-3-next"
          onClick={() => handleStepChange(4)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg"
        >
          다음: 04 증거 검증으로 이동
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
