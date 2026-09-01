import React, { useState, useEffect } from 'react';
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
  Check,
  Star,
  HelpCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { InvestigationData, PeerReview, Student, Team } from '../../../types';

interface Step6BriefingReflectionProps {
  team: Team;
  student: Student;
  allTeams: Team[];
  localInv: InvestigationData;
  receivedPeerReviews: PeerReview[];
  mySubmittedMap: Record<string, PeerReview>;
  onSubmitPeerReview: (params: {
    targetTeamId: string;
    scores: {
      appropriateSources: number;
      crossVerification: number;
      counterEvidenceCheck: number;
      evidenceBasedVerdict: number;
      clarityAndUnderstanding: number;
    };
    peerQuestion: string;
    questionCategory: PeerReview['questionCategory'];
    compliment?: string;
  }) => Promise<void>;
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
  mySubmittedMap,
  onSubmitPeerReview,
  reflectionSubmitted,
  reflectionData,
  setReflectionData,
  handleReflectionSubmit,
  handleStepChange,
  triggerAutoSave,
  setShowLivePresentation,
  setShowReportModal,
}) => {
  // Filter out the student's own team: only evaluate other teams
  const otherTeams = allTeams
    .filter((t) => t.id !== team.id)
    .sort((a, b) => a.teamNumber - b.teamNumber);

  // Selected target team for peer review
  const [selectedTargetTeamId, setSelectedTargetTeamId] = useState<string>(() => {
    // Find the first unreviewed team, or fallback to the first other team
    const unreviewed = otherTeams.find((t) => !mySubmittedMap[t.id]);
    return unreviewed ? unreviewed.id : otherTeams[0]?.id || '';
  });

  // Local form state for the currently selected target team
  const [targetScores, setTargetScores] = useState({
    appropriateSources: 5,
    crossVerification: 5,
    counterEvidenceCheck: 5,
    evidenceBasedVerdict: 5,
    clarityAndUnderstanding: 5,
  });
  const [targetQuestion, setTargetQuestion] = useState('');
  const [targetCategory, setTargetCategory] = useState<PeerReview['questionCategory']>('source');
  const [targetCompliment, setTargetCompliment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [justSubmittedTeamId, setJustSubmittedTeamId] = useState<string | null>(null);

  // When selected target team changes, populate form with existing review if available
  useEffect(() => {
    if (!selectedTargetTeamId) {
      if (otherTeams.length > 0) {
        setSelectedTargetTeamId(otherTeams[0].id);
      }
      return;
    }
    const existing = mySubmittedMap[selectedTargetTeamId];
    if (existing) {
      setTargetScores({
        appropriateSources: existing.scores?.appropriateSources || 5,
        crossVerification: existing.scores?.crossVerification || 5,
        counterEvidenceCheck: existing.scores?.counterEvidenceCheck || 5,
        evidenceBasedVerdict: existing.scores?.evidenceBasedVerdict || 5,
        clarityAndUnderstanding: existing.scores?.clarityAndUnderstanding || 5,
      });
      setTargetQuestion(existing.peerQuestion || '');
      setTargetCategory(existing.questionCategory || 'source');
      setTargetCompliment(existing.compliment || '');
    } else {
      // Default reset for new team
      setTargetScores({
        appropriateSources: 5,
        crossVerification: 5,
        counterEvidenceCheck: 5,
        evidenceBasedVerdict: 5,
        clarityAndUnderstanding: 5,
      });
      setTargetQuestion('');
      setTargetCategory('source');
      setTargetCompliment('');
    }
  }, [selectedTargetTeamId, mySubmittedMap, otherTeams]);

  const selectedTeamObj = otherTeams.find((t) => t.id === selectedTargetTeamId) || otherTeams[0];
  const completedCount = otherTeams.filter((t) => mySubmittedMap[t.id]).length;
  const isAllCompleted = otherTeams.length > 0 && completedCount === otherTeams.length;
  const progressPercent = otherTeams.length > 0 ? Math.round((completedCount / otherTeams.length) * 100) : 100;

  const handleReviewFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetTeamId || !targetQuestion.trim()) return;

    setIsSubmittingReview(true);
    try {
      await onSubmitPeerReview({
        targetTeamId: selectedTargetTeamId,
        scores: targetScores,
        peerQuestion: targetQuestion.trim(),
        questionCategory: targetCategory,
        compliment: targetCompliment.trim(),
      });
      setJustSubmittedTeamId(selectedTargetTeamId);
      setTimeout(() => setJustSubmittedTeamId(null), 3000);

      // Automatically find next uncompleted team and suggest it
      const nextUncompleted = otherTeams.find(
        (t) => t.id !== selectedTargetTeamId && !mySubmittedMap[t.id]
      );
      if (nextUncompleted) {
        setSelectedTargetTeamId(nextUncompleted.id);
      }
    } catch (err) {
      console.error('Failed to submit peer review:', err);
      alert('평가 제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="step-6-briefing-reflection">
      {/* Header & Quick Action Buttons */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border-2 border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 text-center sm:text-left">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
            STEP 06 · BRIEFING & PEER EVALUATION
          </span>
          <h2 className="text-xl font-black text-white">
            06. 실시간 브리핑 발표 · 전 모둠 상호 평가 · 개인 성찰
          </h2>
          <p className="text-xs text-slate-300">
            수사 보고서와 발표 슬라이드를 공유하고, <strong className="text-cyan-300">자기 모둠을 제외한 모든 동료 모둠의 발표를 상호 평가</strong>합니다.
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

      {/* ========================================================================= */}
      {/* PART A: 전 모둠 상호 동료 평가 (자기 모둠 제외) */}
      {/* ========================================================================= */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border-2 border-cyan-500/30 space-y-6 shadow-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-base font-black text-white">
                동료 모둠 발표 상호 평가 (Peer Review System)
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              우리 모둠(<span className="text-cyan-400 font-bold">{team.teamName}</span>)을 제외한 <strong className="text-white">모든 수사팀({otherTeams.length}개)</strong>의 발표를 듣고 5개 루브릭 척도와 1개의 질문을 남겨주세요.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 self-start sm:self-auto bg-[#050c18] px-4 py-2 rounded-2xl border border-slate-700">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono block">평가 완료율</span>
              <span className="text-xs font-black text-cyan-300">
                {completedCount} / {otherTeams.length}개 모둠 ({progressPercent}%)
              </span>
            </div>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isAllCompleted ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-cyan-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Celebratory Banner if 100% evaluated */}
        {isAllCompleted && (
          <div className="p-4 bg-emerald-950/80 rounded-2xl border border-emerald-500/50 flex items-center justify-between gap-3 text-xs text-emerald-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <strong className="text-sm font-black text-white block">
                  🎉 모든 동료 모둠({otherTeams.length}개) 상호 평가 완료!
                </strong>
                <span className="text-[11px] text-emerald-300">
                  모든 다른 수사팀에 대한 평가가 등록되었습니다. 필요 시 아래 탭을 눌러 언제든 점수나 질문을 수정할 수 있습니다.
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shrink-0 font-mono">
              ALL DONE 100%
            </span>
          </div>
        )}

        {otherTeams.length === 0 ? (
          <div className="p-8 text-center bg-[#050c18] rounded-2xl border border-slate-800 text-slate-400 text-xs">
            수업방에 등록된 다른 모둠이 없습니다.
          </div>
        ) : (
          <div className="space-y-5">
            {/* OTHER TEAMS SELECTION TABS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">평가할 대상 모둠 선택 (클릭하여 이동):</span>
                <span className="text-[11px] text-slate-400">
                  * 초록색 체크는 평가 완료된 모둠입니다.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {otherTeams.map((t) => {
                  const existingReview = mySubmittedMap[t.id];
                  const isSelected = selectedTargetTeamId === t.id;
                  const isSubmitted = Boolean(existingReview);

                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setSelectedTargetTeamId(t.id)}
                      className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#0f2a4a] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400/50'
                          : isSubmitted
                          ? 'bg-[#061528] border-emerald-500/50 hover:bg-[#0a2038]'
                          : 'bg-[#050c18] border-slate-700/80 hover:border-slate-500 hover:bg-[#081525]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          수사 {t.teamNumber}팀
                        </span>
                        {isSubmitted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/40">
                            <Check className="w-3 h-3" />
                            ★ {existingReview.averageScore}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded-full border border-amber-500/40">
                            미작성
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {t.teamName}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {t.topicTitle || t.claim}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE SELECTED TEAM FORM */}
            {selectedTeamObj && (
              <form onSubmit={handleReviewFormSubmit} className="p-5 sm:p-6 bg-[#050c18] rounded-3xl border border-cyan-500/30 space-y-5 shadow-inner">
                {/* Target Team Banner */}
                <div className="p-4 bg-[#0a182c] rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-mono font-black border border-cyan-500/40">
                        수사 {selectedTeamObj.teamNumber}팀
                      </span>
                      <h4 className="text-sm font-black text-white">
                        {selectedTeamObj.teamName}
                      </h4>
                      {mySubmittedMap[selectedTeamObj.id] && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          평가 제출 완료 (수정 가능)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cyan-200">
                      <strong className="text-cyan-400">의심 주장:</strong> “{selectedTeamObj.claim || selectedTeamObj.topicTitle}”
                    </p>
                  </div>

                  {justSubmittedTeamId === selectedTeamObj.id && (
                    <div className="px-3 py-1.5 bg-emerald-950 border border-emerald-400 text-emerald-200 text-xs font-bold rounded-xl animate-in zoom-in-95 duration-150">
                      ✓ 저장되었습니다!
                    </div>
                  )}
                </div>

                {/* 5-Point Rubric Items (1 to 5 Stars/Numbers) */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-cyan-300 block">
                    5대 수사 평가 루브릭 척도 (1점 ~ 5점 선택)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                      {
                        key: 'appropriateSources',
                        title: '1. 신뢰할 수 있는 1차 공인 출처 추적',
                        desc: '블로그·유튜브 요약이 아닌 공공기관, 학회 논문, 공인 보도 등 공식 1차 출처를 확인했는가?',
                      },
                      {
                        key: 'crossVerification',
                        title: '2. 다각도 교차 검증 비교',
                        desc: '2개 이상의 독립된 출처를 비교하여 데이터와 설명의 일치 여부를 대조했는가?',
                      },
                      {
                        key: 'counterEvidenceCheck',
                        title: '3. 반대 증거 및 예외 조건 탐색',
                        desc: '섣부른 일반화를 피하고 반대 증거나 전제 조건(연령, 실험 환경 등)을 확인했는가?',
                      },
                      {
                        key: 'evidenceBasedVerdict',
                        title: '4. 증거 기반 논리적 판정 타당성',
                        desc: '수집된 증거와 최종 판정문(사실/거짓/조건부)이 논리적으로 자연스럽게 연결되는가?',
                      },
                      {
                        key: 'clarityAndUnderstanding',
                        title: '5. 브리핑 발표 전달력 및 질의 대응',
                        desc: '8장의 슬라이드 내용이 명확하고 발표자의 설명이 핵심을 잘 짚었는가?',
                      },
                    ].map((item) => (
                      <div key={item.key} className="p-3.5 bg-[#0a182c] rounded-2xl border border-slate-700/90 space-y-2">
                        <div>
                          <span className="font-bold text-white block">{item.title}</span>
                          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          {[1, 2, 3, 4, 5].map((score) => {
                            const isChosen = (targetScores as any)[item.key] === score;
                            return (
                              <button
                                type="button"
                                key={score}
                                onClick={() => setTargetScores({ ...targetScores, [item.key]: score })}
                                className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
                                  isChosen
                                    ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)] ring-2 ring-cyan-200'
                                    : 'bg-[#050c18] text-slate-300 border border-slate-700 hover:bg-[#122849] hover:text-white'
                                }`}
                              >
                                {score}점
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Probing Question Category & Input */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-black text-cyan-300">
                      수사 {selectedTeamObj.teamNumber}팀 발표자에게 남길 핵심 확인 질문 *
                    </label>
                    <select
                      value={targetCategory}
                      onChange={(e) => setTargetCategory(e.target.value as any)}
                      className="px-2.5 py-1 text-xs bg-[#0a182c] border border-slate-700 rounded-xl text-cyan-200 font-bold"
                    >
                      <option value="source">🔍 1차 출처 신뢰성 질문</option>
                      <option value="evidence">📊 증거 데이터 및 통계 질문</option>
                      <option value="context">⚙️ 전제 조건 및 맥락 질문</option>
                      <option value="judgment">⚖️ 최종 판정 근거 질문</option>
                      <option value="additional">💬 기타 추가 궁금한 점</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    required
                    value={targetQuestion}
                    onChange={(e) => setTargetQuestion(e.target.value)}
                    placeholder="예: 발표에서 제시한 실험이 청소년 대상인지 성인 대상인지 구체적인 표본 조건이 궁금합니다."
                    className="w-full px-4 py-2.5 text-xs bg-[#0a182c] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {/* Optional Compliment / Praise */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    동료 모둠의 탁월했던 점 / 인상 깊었던 점 (선택)
                  </label>
                  <input
                    type="text"
                    value={targetCompliment}
                    onChange={(e) => setTargetCompliment(e.target.value)}
                    placeholder="예: 반대 증거를 놓치지 않고 꼼꼼하게 찾아서 판정을 논리적으로 내린 점이 매우 멋졌습니다."
                    className="w-full px-4 py-2.5 text-xs bg-[#0a182c] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {/* Submit / Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full sm:flex-1 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>
                      {mySubmittedMap[selectedTeamObj.id]
                        ? `수사 ${selectedTeamObj.teamNumber}팀 평가 수정 및 저장`
                        : `수사 ${selectedTeamObj.teamNumber}팀 평가 제출하기`}
                    </span>
                  </button>

                  {/* Next Uncompleted Team Quick Jump */}
                  {(() => {
                    const nextUncompleted = otherTeams.find(
                      (t) => t.id !== selectedTeamObj.id && !mySubmittedMap[t.id]
                    );
                    if (!nextUncompleted) return null;
                    return (
                      <button
                        type="button"
                        onClick={() => setSelectedTargetTeamId(nextUncompleted.id)}
                        className="w-full sm:w-auto px-5 py-3 bg-[#0a182c] hover:bg-[#122849] text-cyan-300 rounded-2xl text-xs font-bold transition border border-cyan-500/40 flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <span>다음 미완료 모둠 ({nextUncompleted.teamNumber}팀) 평가하기</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    );
                  })()}
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PART B: 우리 모둠이 받은 동료 질문 및 피드백 (Received Reviews) */}
      {/* ========================================================================= */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              우리 모둠이 다른 수사팀들로부터 받은 동료 질문 및 피드백 ({receivedPeerReviews.length}건)
            </h3>
            <p className="text-xs text-slate-300">
              다른 모둠 수사관들이 우리 브리핑을 듣고 남긴 질문을 검토하고, 판정을 유지할지 수정할지 모둠 토의를 진행하세요.
            </p>
          </div>

          {receivedPeerReviews.length > 0 && (
            <div className="px-3.5 py-1.5 rounded-xl bg-[#050c18] border border-slate-700 text-xs">
              <span className="text-slate-400">받은 동료 평균 평점: </span>
              <strong className="text-cyan-300 font-mono font-black">
                ★ {(
                  receivedPeerReviews.reduce((sum, r) => sum + r.averageScore, 0) /
                  receivedPeerReviews.length
                ).toFixed(1)} / 5.0
              </strong>
            </div>
          )}
        </div>

        {receivedPeerReviews.length === 0 ? (
          <div className="p-6 bg-[#050c18] rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
            아직 다른 모둠으로부터 등록된 질문이나 피드백이 없습니다. 다른 모둠들이 브리핑을 듣고 평가를 제출하면 실시간으로 표시됩니다.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {receivedPeerReviews.map((pr) => (
              <div key={pr.id} className="p-3.5 bg-[#050c18] rounded-2xl border border-slate-700 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{pr.fromStudentName} 수사관</span>
                    <span className="px-2 py-0.5 rounded bg-[#0f274a] text-cyan-200 font-bold border border-cyan-500/30 text-[10px]">
                      {pr.questionCategory}
                    </span>
                  </div>
                  <span className="text-amber-400 font-mono font-bold">
                    평점 {pr.averageScore}점
                  </span>
                </div>
                <p className="text-slate-200 font-medium pl-1 border-l-2 border-cyan-400">
                  "{pr.peerQuestion}"
                </p>
                {pr.compliment && (
                  <p className="text-[11px] text-emerald-300 pl-1">
                    ✨ 칭찬: {pr.compliment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Deliberation Buttons */}
        <div className="pt-3 border-t border-slate-700/80 space-y-2">
          <label className="text-xs font-black text-cyan-300 block">
            동료 질문 및 반증 검토 후 모둠 최종 결정
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'maintain', label: '✓ 기존 판정 논리 유지' },
              { id: 'modify', label: '✍️ 동료 질문 반영 판정 수정' },
              { id: 'needs_more', label: '🔍 추가 수사 필요 제기' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  triggerAutoSave({
                    peerReviewDeliberation: {
                      ...localInv.peerReviewDeliberation,
                      action: opt.id as any,
                    },
                  })
                }
                className={`p-2.5 rounded-xl text-xs font-black border transition ${
                  localInv.peerReviewDeliberation?.action === opt.id
                    ? 'bg-cyan-400 border-cyan-300 text-slate-950 shadow-md'
                    : 'bg-[#050c18] border-slate-700 text-slate-300 hover:bg-[#0c1e36] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PART C: 수사관 개인 성찰 일지 (Individual Reflection) */}
      {/* ========================================================================= */}
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
