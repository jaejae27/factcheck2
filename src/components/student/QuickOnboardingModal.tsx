import React from 'react';
import {
  ShieldAlert,
  Radio,
  CheckCircle2,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  Zap,
  BookOpen,
} from 'lucide-react';
import { Room, Student, Team, InvestigationData, EvidenceCard } from '../../types';
import { ROLE_DEFINITIONS } from '../../data/topics';

interface QuickOnboardingModalProps {
  room: Room;
  student: Student;
  team: Team;
  investigation: InvestigationData;
  evidenceList: EvidenceCard[];
  onComplete: () => void;
}

const STEP_NAMES = [
  '01 사건 접수 (사건 선택 & 역할 배정)',
  '02 수사 질문 (최초 판단 & 가설 수립)',
  '03 증거 수집 (증거 계획 & 증거 카드 등록)',
  '04 증거 검증 (교차검증 & 반증·조건 분석)',
  '05 합동수사·판정 (모둠 회의 & 최종 판정)',
  '06 브리핑·성찰 (합동 발표 & 상호평가 & 성찰)',
];

export const QuickOnboardingModal: React.FC<QuickOnboardingModalProps> = ({
  room,
  student,
  team,
  investigation,
  evidenceList,
  onComplete,
}) => {
  const currentStepNum = room.activeStep || team.currentStep || 1;
  const currentStepTitle = STEP_NAMES[currentStepNum - 1] || `STEP ${currentStepNum}`;
  const roleDef = student.role ? ROLE_DEFINITIONS[student.role] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-2xl bg-[#0a182c] border-2 border-cyan-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20 bg-gradient-to-r from-[#071329] to-[#0d1e3d] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 tracking-wider">
                  QUICK ONBOARDING
                </span>
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1 font-mono">
                  <Radio className="w-3.5 h-3.5" /> 실시간 수사 진행 중 합류
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                빠른 수사 준비 및 즉시 합류
              </h2>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Ongoing Step Notice Banner */}
          <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              현재 FACT LAB 진행 단계: STEP {String(currentStepNum).padStart(2, '0')}
            </div>
            <h3 className="text-lg font-black text-white">
              「{currentStepTitle}」
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              늦게 합류해도 괜찮습니다! 이전 단계를 처음부터 다 채우지 않아도 팀원들이 조사한 내용을 확인하고 현재 수사에 즉시 참여할 수 있습니다.
            </p>
          </div>

          {/* Quick 4-Point Investigation Summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              우리 팀({team.teamName})의 핵심 수사 진행 상황
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. 오늘의 사건 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-cyan-400 font-mono block">
                  ① 의뢰된 사건 주제
                </span>
                <p className="text-xs font-bold text-white line-clamp-2">
                  {team.topicTitle ? `"${team.topicTitle}"` : '사건 주제 배정 진행 중'}
                </p>
                {team.claim && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                    주장: "{team.claim}"
                  </p>
                )}
              </div>

              {/* 2. 가설 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-400 font-mono block">
                  ② 우리 팀 수사 가설
                </span>
                <p className="text-xs text-slate-300 line-clamp-3">
                  {investigation.hypothesis || '가설 수립 진행 중이거나 협의 중입니다.'}
                </p>
              </div>

              {/* 3. 내가 맡은 역할 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 font-mono block">
                  ③ 나의 수사관 역할
                </span>
                {roleDef ? (
                  <div className="flex items-center gap-2">
                    <span className="text-base">{roleDef.icon}</span>
                    <div>
                      <span className="text-xs font-bold text-white">{roleDef.title}</span>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{roleDef.description}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-300 font-bold">
                    * 역할 선택 대기 중 (입장 후 자유롭게 선택 가능)
                  </p>
                )}
              </div>

              {/* 4. 확보된 증거 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-400 font-mono block">
                  ④ 확보된 증거 자료
                </span>
                <p className="text-xs font-bold text-white">
                  증거 카드 총 <span className="text-amber-400 text-sm">{evidenceList.length}건</span> 확보
                </p>
                <p className="text-[10px] text-slate-400">
                  {evidenceList.length > 0
                    ? `최근 증거: "${evidenceList[evidenceList.length - 1]?.title}"`
                    : '팀원들과 함께 증거를 수집해 보세요.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 text-center font-mono">
            💡 이전 단계는 언제든지 상단의 단계 탭을 눌러 다시 열람하거나 보완할 수 있습니다.
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-slate-800 bg-[#071329] flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            수사관 식별: <strong className="text-white">{student.name} ({student.studentNumber}번)</strong>
          </div>

          <button
            onClick={onComplete}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <span>현재 수사에 즉시 합류</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
