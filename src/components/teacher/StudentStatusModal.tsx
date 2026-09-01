import React, { useState } from 'react';
import {
  X,
  Users,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Radio,
  ArrowRight,
  Shield,
  UserPlus,
} from 'lucide-react';
import { Student, Team, Room } from '../../types';
import { updateStudentTeam, updateStudentRole } from '../../lib/db';
import { ROLE_DEFINITIONS } from '../../data/topics';

interface StudentStatusModalProps {
  room: Room;
  students: Student[];
  teams: Team[];
  onClose: () => void;
}

export const StudentStatusModal: React.FC<StudentStatusModalProps> = ({
  room,
  students,
  teams,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unassigned' | 'connected' | 'reconnected'>('all');
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null);

  const now = Date.now();

  // Helper to determine connection status
  const getStatus = (s: Student) => {
    if (!s.teamId) {
      return { label: '모둠 미배정', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', dot: 'bg-amber-400' };
    }
    if (s.isReconnected) {
      return { label: '재접속 완료', color: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30', dot: 'bg-yellow-400 animate-pulse' };
    }
    // If active within last 3 minutes
    const isRecentlyActive = now - (s.lastActive || s.joinedAt) < 3 * 60 * 1000;
    if (isRecentlyActive) {
      return { label: '접속 중', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400' };
    }
    return { label: '대기/활동중', color: 'text-slate-400 bg-slate-800 border-slate-700', dot: 'bg-slate-500' };
  };

  const handleAssignTeam = async (studentId: string, teamId: string) => {
    try {
      await updateStudentTeam(studentId, teamId);
      setAssigningStudentId(null);
    } catch (err) {
      console.error('Error assigning team:', err);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.studentNumber}번`.includes(searchTerm) ||
      `${s.grade}학년 ${s.classNumber}반`.includes(searchTerm);

    if (!matchesSearch) return false;

    if (selectedFilter === 'unassigned') return !s.teamId;
    if (selectedFilter === 'reconnected') return s.isReconnected;
    if (selectedFilter === 'connected') return s.teamId && !s.isReconnected;
    return true;
  });

  const unassignedCount = students.filter((s) => !s.teamId).length;
  const reconnectedCount = students.filter((s) => s.isReconnected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-cyan-500/20 bg-[#091224] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  REAL-TIME ROSTER
                </span>
                <span className="text-xs text-slate-400">
                  {room.grade}학년 {room.classNumber}반
                </span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                수사관 접속 현황 및 모둠 관리
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  {students.length}명 참여 중
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unassigned Warning Banner */}
        {unassignedCount > 0 && (
          <div className="p-3.5 bg-amber-950/50 border-b border-amber-500/40 px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-amber-300">
                수사팀이 배정되지 않은 수사관이 {unassignedCount}명 있습니다. 모둠을 배정해 주세요.
              </span>
            </div>
            <button
              onClick={() => setSelectedFilter('unassigned')}
              className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black shrink-0 hover:bg-amber-400 transition"
            >
              미배정 학생만 보기
            </button>
          </div>
        )}

        {/* Search & Filters */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 px-6">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="수사관 이름, 번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              전체 ({students.length})
            </button>
            <button
              onClick={() => setSelectedFilter('unassigned')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === 'unassigned'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              미배정 ({unassignedCount})
            </button>
            <button
              onClick={() => setSelectedFilter('reconnected')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === 'reconnected'
                  ? 'bg-yellow-400 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              재접속 ({reconnectedCount})
            </button>
          </div>
        </div>

        {/* Student List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              해당 조건의 학생이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredStudents.map((s) => {
                const assignedTeam = teams.find((t) => t.id === s.teamId);
                const status = getStatus(s);
                const isAssigning = assigningStudentId === s.id;

                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-sm text-cyan-300">
                          {s.studentNumber}번
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{s.name}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {s.grade}학년 {s.classNumber}반 {s.studentNumber}번
                          </span>
                        </div>
                      </div>

                      {/* Current Team badge */}
                      {assignedTeam ? (
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono">
                          {assignedTeam.teamName}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold">
                          미배정
                        </span>
                      )}
                    </div>

                    {/* Role & Actions */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        역할: <strong className="text-slate-200">{(s.role && ROLE_DEFINITIONS[s.role]?.title) || s.role || '선택 대기'}</strong>
                      </span>

                      {/* Team Assignment trigger/selector */}
                      {isAssigning ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleAssignTeam(s.id, e.target.value);
                            }}
                            defaultValue=""
                            className="px-2 py-1 rounded-lg bg-slate-800 border border-cyan-500 text-xs text-cyan-300 focus:outline-none"
                          >
                            <option value="" disabled>
                              모둠 선택
                            </option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.teamName}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setAssigningStudentId(null)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningStudentId(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          {s.teamId ? '모둠 변경' : '모둠 배정하기'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#091224] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>* 학생 접속 정보는 Firestore를 통해 실시간으로 자동 갱신됩니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
