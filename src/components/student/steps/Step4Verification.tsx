import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { InvestigationData } from '../../../types';

interface Step4VerificationProps {
  localInv: InvestigationData;
  triggerAutoSave: (updates: Partial<InvestigationData>) => void;
  handleStepChange: (step: number) => void;
}

export const Step4Verification: React.FC<Step4VerificationProps> = ({
  localInv,
  triggerAutoSave,
  handleStepChange,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="step-4-verification">
      {/* Header */}
      <div className="bg-[#0a182c] p-6 rounded-3xl border border-cyan-500/30 space-y-1 shadow-lg">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
          STEP 04 · CROSS-VERIFICATION & COUNTER-EVIDENCE
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          04. 증거 교차 검증 & 반증·예외 탐색
        </h2>
        <p className="text-xs text-slate-300">
          수집한 여러 자료를 맞비교하여 일치하는 점과 충돌하는 지점을 분석하고, 가설과 반대되는 반증과 예외 조건을 밝혀내세요.
        </p>
      </div>

      {/* Part A: Cross-Verification Matrix */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-4 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <h3 className="text-sm font-black text-white">다각적 자료 교차 검증</h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-cyan-300 block">
            여러 자료에서 공통적으로 확인된 사실 *
          </label>
          <textarea
            rows={3}
            value={localInv.jointSynthesis?.commonFindings || ''}
            onChange={(e) =>
              triggerAutoSave({
                jointSynthesis: {
                  ...localInv.jointSynthesis,
                  commonFindings: e.target.value,
                },
              })
            }
            placeholder="예: 청소년의 아침식사 유무와 오전 인지 집중도 사이에 유의미한 양의 상관관계가 있다는 점은 국내외 3편의 연구에서 일관되게 확인됨."
            className="w-full px-4 py-3 text-xs bg-[#050c18] border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-cyan-300 block">
            자료마다 결과가 다르거나 충돌하는 지점 및 원인 분석 *
          </label>
          <textarea
            rows={3}
            value={localInv.jointSynthesis?.reasonForConflict || ''}
            onChange={(e) =>
              triggerAutoSave({
                jointSynthesis: {
                  ...localInv.jointSynthesis,
                  reasonForConflict: e.target.value,
                },
              })
            }
            placeholder="예: 단기 1회성 실험에서는 큰 차이가 없었으나, 1년 이상 장기 추적 연구에서는 수면 패턴과 결합되어 성적 격차가 통계적으로 유의미하게 벌어짐."
            className="w-full px-4 py-3 text-xs bg-[#050c18] border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      {/* Part B: Counter-Evidence & Exceptions */}
      <div className="p-6 bg-[#0a182c] rounded-3xl border border-slate-700/80 space-y-4 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <h3 className="text-sm font-black text-white">반대 증거(반증) 및 숨겨진 조건·예외</h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-rose-300 block">
            ⚠️ 우리 가설과 정반대되는 반대 증거(반증) *
          </label>
          <textarea
            rows={3}
            value={localInv.jointSynthesis?.unexpectedEvidence || ''}
            onChange={(e) =>
              triggerAutoSave({
                jointSynthesis: {
                  ...localInv.jointSynthesis,
                  unexpectedEvidence: e.target.value,
                },
              })
            }
            placeholder="예: 당류가 과다한 빵/시리얼 위주의 아침식사는 급격한 혈당 스파이크 후 급락으로 오히려 2교시 이후 졸음과 집중력 저하를 유발한다는 논문 발견."
            className="w-full px-4 py-3 text-xs bg-[#050c18] border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-cyan-300 block">
            🔍 주장에 빠져 있는 맥락과 예외 조건 *
          </label>
          <textarea
            rows={3}
            value={localInv.jointSynthesis?.missingContextExceptions || ''}
            onChange={(e) =>
              triggerAutoSave({
                jointSynthesis: {
                  ...localInv.jointSynthesis,
                  missingContextExceptions: e.target.value,
                },
              })
            }
            placeholder="예: 단순한 섭취 여부보다 단백질/식이섬유 균형 및 충분한 수면(7시간 이상)이 뒷받침될 때에만 긍정적 효과가 성립함."
            className="w-full px-4 py-3 text-xs bg-[#050c18] border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700/80">
        <button
          id="btn-step-4-prev"
          onClick={() => handleStepChange(3)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1c34] border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          이전: 03 증거 수집
        </button>
        <button
          id="btn-step-4-next"
          onClick={() => handleStepChange(5)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg"
        >
          다음: 05 합동수사·판정으로 이동
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
