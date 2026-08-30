import React from 'react';
import { Shield, Radio, Users, Clock, ArrowLeft } from 'lucide-react';
import { Room, Student } from '../../types';

interface WaitingTeamAssignmentProps {
  room: Room;
  student: Student;
  onExit: () => void;
}

export const WaitingTeamAssignment: React.FC<WaitingTeamAssignmentProps> = ({
  room,
  student,
  onExit,
}) => {
  return (
    <div className="min-h-screen bg-[#040814] flex flex-col items-center justify-center p-4 sm:p-6 text-white select-none">
      <div className="w-full max-w-md bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Radar Icon Animation */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping opacity-75" />
          <div className="absolute inset-2 rounded-full border border-cyan-400/20 animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Radio className="w-8 h-8 text-cyan-400 animate-spin duration-3000" />
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> 수사팀 배정 대기 중
          </span>
          <h2 className="text-2xl font-black text-white">수사본부에서 팀을 확인하고 있습니다</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            담당 선생님(본부장)께서 수사 모둠을 배정하면 화면이 자동으로 수사 워크스테이션으로 전환됩니다. 잠시만 기다려 주세요.
          </p>
        </div>

        {/* Student Identification Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>수사본부: {room.grade}학년 {room.classNumber}반</span>
            <span>코드: {room.roomCode}</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-mono font-black text-cyan-300">
              {student.studentNumber}
            </div>
            <div>
              <span className="text-base font-bold text-white block">{student.name} 수사관</span>
              <span className="text-[11px] text-slate-400">식별 ID: {student.id}</span>
            </div>
          </div>
        </div>

        {/* Exit / Change Info Button */}
        <button
          onClick={onExit}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          로그인 화면으로 돌아가기
        </button>
      </div>
    </div>
  );
};
