import React from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  MessageSquare,
  Radio,
  Send,
  Users,
} from 'lucide-react';
import { InvestigationData, PeerReview, Student, Team } from '../../../types';

interface Step6BriefingReflectionProps {
  team: Team;
  student: Student;
  allTeams: Team[];
  localInv: InvestigationData;
  receivedPeerReviews: PeerReview[];
  peerSubmitted: boolean;
  peerTargetTeamId: string;
  setPeerTargetTeamId: (id: string) => void;
  peerScores: {
    appropriateSources: number;
    crossVerification: number;
    counterEvidenceCheck: number;
    evidenceBasedVerdict: number;
    clarityAndUnderstanding: number;
  };
  setPeerScores: (scores: any) => void;
  peerQuestionCategory: 'source' | 'evidence' | 'context' | 'judgment' | 'additional';
  setPeerQuestionCategory: (cat: any) => void;
  peerQuestion: string;
  setPeerQuestion: (q: string) => void;
  handlePeerReviewSubmit: (e: React.FormEvent) => Promise<void>;
  reflectionSubmitted: boolean;
  reflectionData: any;
  setReflectionData: (data: any) => void;
  handleReflectionSubmit: (e: React.FormEvent) => Promise<void>;
  handleStepChange: (step: number) => void;
  triggerAutoSave: (updates: Partial<InvestigationData>) => void;
  setShowLivePresentation: (show: boolean) => void;
  setShowReportModal: (show: boolean) => void;
}

export const Step6BriefingReflection: React.FC<Step6BriefingReflectionProps> = ({
  team,
  student,
  allTeams,
  localInv,
  receivedPeerReviews,
  peerSubmitted,
  peerTargetTeamId,
  setPeerTargetTeamId,
  peerScores,
  setPeerScores,
  peerQuestionCategory,
  setPeerQuestionCategory,
  peerQuestion,
  setPeerQuestion,
  handlePeerReviewSubmit,
  reflectionSubmitted,
  reflectionData,
  setReflectionData,
  handleReflectionSubmit,
  handleStepChange,
  triggerAutoSave,
  setShowLivePresentation,
  setShowReportModal,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="step-6-briefing-reflection">
      {/* Header & Quick Action Buttons */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border-2 border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 text-center sm:text-left">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            STEP 06 · BRIEFING & REFLECTION
          </span>
          <h2 className="text-xl font-black text-white">
            06. 실시간 브리핑 발표 · 동료 평가 · 개인 성찰
          </h2>
          <p className="text-xs text-slate-300">
            수사한 모든 데이터가 자동으로 소논문 보고서와 8장 슬라이드로 완성되었습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-live-presentation-start"
            onClick={() => setShowLivePresentation(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg"
          >
            <Radio className="w-4 h-4" />
            실시간 슬라이드 브리핑
          </button>
          <button
            id="btn-open-report"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0f274a] hover:bg-[#153460] text-cyan-200 border border-cyan-500/40 rounded-2xl text-xs font-bold transition"
          >
            <FileText className="w-4 h-4" />
            수사보고서 열람
          </button>
        </div>
      </div>

      {/* Part A: Peer Review Form */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              동료 모둠 발표 상호 평가 (Peer Review)
            </h3>
            <p className="text-xs text-slate-300">
              다른 수사팀의 브리핑을 듣고 5개 척도와 1개의 심층 질문을 남겨주세요.
            </p>
          </div>
          {peerSubmitted && (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              평가 제출 완료
            </span>
          )}
        </div>

        {!peerSubmitted ? (
          <form onSubmit={handlePeerReviewSubmit} className="space-y-4 pt-2 border-t border-slate-700/80">
            <div className="space-y-1">
              <label className="text-xs font-black text-cyan-300">평가할 대상 모둠 선택</label>
              <select
                value={peerTargetTeamId}
                onChange={(e) => setPeerTargetTeamId(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white"
              >
                <option value="">-- 모둠을 선택하세요 --</option>
                {allTeams
                  .filter((t) => t.id !== team.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamName} ({t.topicTitle || t.claim})
                    </option>
                  ))}
              </select>
            </div>

            {/* 5 Rating items (1-5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'appropriateSources', label: '1. 신뢰할 수 있는 공식 출처를 잘 찾았는가?' },
                { key: 'crossVerification', label: '2. 여러 자료를 교차 검증하여 비교했는가?' },
                { key: 'counterEvidenceCheck', label: '3. 반대 증거나 빠진 조건을 꼼꼼히 확인했는가?' },
                { key: 'evidenceBasedVerdict', label: '4. 최종 판정이 수집된 증거와 논리적으로 연결되는가?' },
                { key: 'clarityAndUnderstanding', label: '5. 발표가 명확하고 전달력이 좋았는가?' },
              ].map((item) => (
                <div key={item.key} className="p-3 bg-[#050c18] rounded-xl border border-slate-700/80 space-y-1.5">
                  <span className="font-bold text-slate-200 block">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        type="button"
                        key={score}
                        onClick={() => setPeerScores({ ...peerScores, [item.key]: score })}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition ${
                          (peerScores as any)[item.key] === score
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-[#0a182c] text-slate-300 border border-slate-700 hover:bg-[#122849]'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Probing Question */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-cyan-300">발표 모둠에게 남길 수사 확인 질문 *</label>
                <select
                  value={peerQuestionCategory}
                  onChange={(e) => setPeerQuestionCategory(e.target.value as any)}
                  className="px-2 py-1 text-[11px] bg-[#050c18] border border-slate-700 rounded-lg text-cyan-200 font-bold"
                >
                  <option value="source">출처 신뢰성 질문</option>
                  <option value="evidence">증거 데이터 질문</option>
                  <option value="context">조건 및 맥락 질문</option>
                  <option value="judgment">최종 판정 근거 질문</option>
                  <option value="additional">기타 추가 질문</option>
                </select>
              </div>
              <input
                type="text"
                required
                value={peerQuestion}
                onChange={(e) => setPeerQuestion(e.target.value)}
                placeholder="예: 청소년과 성인의 실험 결과 차이에 대해 조사한 자료가 더 있는지 궁금합니다."
                className="w-full px-4 py-2.5 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl text-xs font-black transition shadow-md flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4 text-slate-950" />
              동료 평가 및 질문 제출하기
            </button>
          </form>
        ) : (
          <p className="text-xs text-emerald-300 font-bold p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/40">
            ✓ 동료 평가와 질문이 성공적으로 등록되었습니다.
          </p>
        )}
      </div>

      {/* Part B: Received Questions */}
      {receivedPeerReviews.length > 0 && (
        <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-4 shadow-md">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              우리 모둠이 받은 동료 질문 ({receivedPeerReviews.length}건)
            </h3>
            <p className="text-xs text-slate-300">
              동료들의 질문을 검토하고, 판정을 유지할지 수정할지 모둠 토의를 진행하세요.
            </p>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {receivedPeerReviews.map((pr) => (
              <div key={pr.id} className="p-3 bg-[#050c18] rounded-xl border border-slate-700 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <span className="font-bold">작성: {pr.fromStudentName} 수사관</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#0f274a] text-cyan-200 font-bold border border-cyan-500/30">
                    {pr.questionCategory}
                  </span>
                </div>
                <p className="text-slate-100 font-medium">"{pr.peerQuestion}"</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-700/80 space-y-2">
            <label className="text-xs font-black text-cyan-300 block">동료 질문 검토 후 모둠 최종 결정</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'maintain', label: '기존 판정 유지' },
                { id: 'modify', label: '판정 수정' },
                { id: 'needs_more', label: '추가 수사 필요' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    triggerAutoSave({
                      peerReviewDeliberation: {
                        ...localInv.peerReviewDeliberation,
                        action: opt.id as any,
                      },
                    })
                  }
                  className={`p-2 rounded-xl text-xs font-black border transition ${
                    localInv.peerReviewDeliberation?.action === opt.id
                      ? 'bg-cyan-400 border-cyan-300 text-slate-950'
                      : 'bg-[#050c18] border-slate-700 text-slate-300 hover:bg-[#0c1e36] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Part C: Individual Reflection */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              수사관 개인 성찰 일지 (Individual Reflection)
            </h3>
            <p className="text-xs text-slate-300">
              탐구를 마치며 자신의 수사 활동과 미디어 리터러시 성장을 솔직히 돌아보세요.
            </p>
          </div>
          {reflectionSubmitted && (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              성찰 제출 완료
            </span>
          )}
        </div>

        {!reflectionSubmitted ? (
          <form onSubmit={handleReflectionSubmit} className="space-y-4 pt-2 border-t border-slate-700/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-cyan-300">내가 이번 수사에서 가장 잘한 활동 *</label>
                <input
                  type="text"
                  required
                  value={reflectionData.bestActivity}
                  onChange={(e) => setReflectionData({ ...reflectionData, bestActivity: e.target.value })}
                  placeholder="예: 원출처 링크를 끝까지 추적해 1차 공식 보고서를 찾아낸 점"
                  className="w-full px-3.5 py-2 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-cyan-300">내가 발견한 가장 결정적인 증거 *</label>
                <input
                  type="text"
                  required
                  value={reflectionData.keyEvidenceFound}
                  onChange={(e) => setReflectionData({ ...reflectionData, keyEvidenceFound: e.target.value })}
                  placeholder="예: 질병관리청 청소년 건강행태조사의 5개년 추이 통계 그래프"
                  className="w-full px-3.5 py-2 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-cyan-300">수사 과정에서 가장 어려웠던 점 *</label>
                <input
                  type="text"
                  required
                  value={reflectionData.hardestPart}
                  onChange={(e) => setReflectionData({ ...reflectionData, hardestPart: e.target.value })}
                  placeholder="예: 블로그나 기사가 아닌 공인 학회 논문 원문을 분석하는 점"
                  className="w-full px-3.5 py-2 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-cyan-300">새롭게 알게 된 사실이나 배운 점 *</label>
                <input
                  type="text"
                  required
                  value={reflectionData.newLearning}
                  onChange={(e) => setReflectionData({ ...reflectionData, newLearning: e.target.value })}
                  placeholder="예: 두 사건 사이에 상관관계가 있다고 해서 무조건 인과관계는 아니라는 점"
                  className="w-full px-3.5 py-2 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-cyan-300">
                앞으로 인터넷 정보를 볼 때 실천할 나의 팩트체크 습관 *
              </label>
              <input
                type="text"
                required
                value={reflectionData.futureFactCheckHabit}
                onChange={(e) => setReflectionData({ ...reflectionData, futureFactCheckHabit: e.target.value })}
                placeholder="예: 자극적인 썸네일이나 기사 제목만 보고 믿지 않고 최소 2곳 이상의 원출처를 확인하겠다."
                className="w-full px-3.5 py-2 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-cyan-300">이번 탐구 후 아직 풀리지 않은 남은 질문</label>
              <input
                type="text"
                value={reflectionData.remainingQuestion}
                onChange={(e) => setReflectionData({ ...reflectionData, remainingQuestion: e.target.value })}
                placeholder="예: 다른 연령대나 성별에 따라 결과가 다를지 추가로 조사해보고 싶다."
                className="w-full px-3.5 py-2 text-xs bg-[#050c18] border border-slate-700 rounded-xl text-white placeholder-slate-400"
              />
            </div>

            {/* 5 Self-Rating Stars */}
            <div className="p-4 bg-[#050c18] rounded-2xl border border-slate-700/80 space-y-2 text-xs">
              <span className="font-bold text-cyan-300 block">자기평가 (1점~5점)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'roleResponsibility', label: '맡은 역할에 책임을 다했는가?' },
                  { key: 'activeInvestigation', label: '자료를 주도적으로 탐색했는가?' },
                  { key: 'counterEvidenceOpenness', label: '반대 증거를 열린 마음으로 수용했는가?' },
                  { key: 'teamCollaboration', label: '모둠원과 협력하며 토의했는가?' },
                  { key: 'opinionFlexibility', label: '근거에 따라 내 생각을 수정할 수 있었는가?' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          type="button"
                          key={val}
                          onClick={() =>
                            setReflectionData({
                              ...reflectionData,
                              selfRatings: {
                                ...reflectionData.selfRatings,
                                [item.key]: val,
                              },
                            })
                          }
                          className={`w-6 h-6 rounded text-[11px] font-black ${
                            (reflectionData.selfRatings as any)[item.key] === val
                              ? 'bg-cyan-400 text-slate-950'
                              : 'bg-[#0a182c] text-slate-400 hover:bg-[#112644] hover:text-white'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              id="btn-submit-reflection"
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              수사관 개인 성찰 일지 최종 제출하기
            </button>
          </form>
        ) : (
          /* CASE CLOSED Victory Screen */
          <div className="p-8 text-center bg-[#07152b] rounded-3xl border-2 border-emerald-500/50 space-y-4 animate-in zoom-in-95 duration-300 shadow-xl">
            <div className="inline-block p-4 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Award className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-400 text-slate-950">
                CASE CLOSED · 수사 종결
              </span>
              <h3 className="text-2xl font-black text-white mt-2">
                축하합니다! 팩트체크 수사를 성공적으로 완수했습니다.
              </h3>
              <p className="text-xs text-slate-200 max-w-md mx-auto">
                {student.name} 수사관은 근거에 기반하여 진실을 밝혀내고 비판적 사고력을 훌륭히 발휘하였습니다.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowReportModal(true)}
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl text-xs font-black transition shadow-md flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                내 수사보고서 PDF 출력
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
        <button
          id="btn-step-6-prev"
          onClick={() => handleStepChange(5)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1c34] border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          이전: 05 합동수사·판정
        </button>
      </div>
    </div>
  );
};
