import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { InvestigationData, VerdictType } from '../../../types';

interface Step5JointVerdictProps {
  localInv: InvestigationData;
  triggerAutoSave: (updates: Partial<InvestigationData>) => void;
  handleStepChange: (step: number) => void;
}

export const Step5JointVerdict: React.FC<Step5JointVerdictProps> = ({
  localInv,
  triggerAutoSave,
  handleStepChange,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="step-5-joint-verdict">
      {/* Header */}
      <div className="bg-[#0a182c] p-6 rounded-3xl border border-cyan-500/30 space-y-1 shadow-lg">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
          STEP 05 · JOINT DELIBERATION & VERDICT
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          05. 합동 수사 종합 토의 & 최종 팩트체크 판정
        </h2>
        <p className="text-xs text-slate-300">
          모든 수사관의 증거와 반증을 종합 토의하여 과도한 일반화를 방지하고, 8단계 표준 판정 중 가장 합당한 결론을 확정하세요.
        </p>
      </div>

      {/* Part A: Joint Consensus Discussion */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-4 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <h3 className="text-sm font-black text-white">
            수사본부 모둠 합동 수사 종합 토의
          </h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-cyan-300 block">
            현재 확보한 증거로 주장할 수 있는 사실의 명확한 범위 (과도한 일반화 방지) *
          </label>
          <textarea
            rows={3}
            value={localInv.jointSynthesis?.warrantScope || ''}
            onChange={(e) =>
              triggerAutoSave({
                jointSynthesis: {
                  ...localInv.jointSynthesis,
                  warrantScope: e.target.value,
                },
              })
            }
            placeholder="예: '아침밥을 먹으면 누구나 성적이 오른다'는 거짓이나, '균형 잡힌 영양 식사는 오전 학습 집중력 유지에 도움을 준다'는 사실이다."
            className="w-full px-4 py-3 text-xs bg-[#050c18] border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      {/* Part B: Final 8-Level Verdict */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-5 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <h3 className="text-sm font-black text-white">
            수사대 최종 판정 선택 (8대 표준 판정)
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-cyan-300 block">
            최종 팩트체크 판정 등급 선택 *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'true', label: '🟢 사실' },
              { id: 'mostly_true', label: '🟢 대체로 사실' },
              { id: 'half_true', label: '🟡 절반의 사실' },
              { id: 'conditional', label: '🔵 조건에 따라 다름' },
              { id: 'insufficient_evidence', label: '⚪ 근거 부족' },
              { id: 'mostly_false', label: '🔴 대체로 사실 아님' },
              { id: 'false', label: '🔴 사실 아님' },
              { id: 'needs_more_investigation', label: '🟣 추가 수사 필요' },
            ].map((v) => (
              <button
                key={v.id}
                id={`btn-verdict-${v.id}`}
                onClick={() => triggerAutoSave({ finalVerdict: v.id as VerdictType })}
                className={`p-3 rounded-2xl text-xs font-black border-2 transition ${
                  localInv.finalVerdict === v.id
                    ? 'border-cyan-400 bg-[#0f274a] text-cyan-200 ring-2 ring-cyan-400/40'
                    : 'border-slate-700/80 bg-[#071326] text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-cyan-300 block">
            이 판정을 내린 가장 결정적인 근거 (핵심 증거 요약) *
          </label>
          <textarea
            id="input-decisive-summary"
            rows={3}
            value={localInv.decisiveEvidenceSummary || ''}
            onChange={(e) => triggerAutoSave({ decisiveEvidenceSummary: e.target.value })}
            placeholder="예: 공인 통계에서 아침식사 집단의 학업성취도가 15% 높았으나, 영양 구성과 수면 시간이 통제되지 않았으므로 '조건에 따라 다름'으로 최종 판정함."
            className="w-full px-4 py-3 text-xs bg-[#050c18] border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-cyan-300 block">
            수사 전 최초 생각과 비교하여 바뀐 점과 그 이유
          </label>
          <textarea
            rows={2}
            value={localInv.beliefChangeComparison?.changedReason || ''}
            onChange={(e) =>
              triggerAutoSave({
                beliefChangeComparison: {
                  initial: localInv.initialBelief,
                  final: localInv.finalVerdict,
                  changedReason: e.target.value,
                },
              })
            }
            placeholder="예: 처음에는 무조건 사실이라고 믿었으나, 반대 논문과 통계를 직접 분석해보며 식단의 영양 구성과 수면이 핵심 변인임을 알게 됨."
            className="w-full px-4 py-2.5 text-xs bg-[#050c18] border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
        <button
          id="btn-step-5-prev"
          onClick={() => handleStepChange(4)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1c34] border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          이전: 04 증거 검증
        </button>
        <button
          id="btn-step-5-next"
          onClick={() => handleStepChange(6)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg"
        >
          다음: 06 브리핑·성찰로 이동
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
