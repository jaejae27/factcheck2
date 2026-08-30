import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, Sliders, Shield } from 'lucide-react';
import { Room, DifficultyMode } from '../../types';
import { FACT_CHECK_TOPICS } from '../../data/topics';

interface CreateRoomModalProps {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  onCreate: (roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'roomCode' | 'presentationState'>) => Promise<void>;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  teacherId,
  teacherName,
  teacherEmail,
  onCreate,
  onClose,
}) => {
  const [title, setTitle] = useState('미디어 리터러시 팩트체크 수사대');
  const [grade, setGrade] = useState(1);
  const [classNumber, setClassNumber] = useState(1);
  const [period, setPeriod] = useState(1);
  const [teamCount, setTeamCount] = useState(6);
  const [membersPerTeam, setMembersPerTeam] = useState(4);
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>('standard');
  const [peerReviewEnabled, setPeerReviewEnabled] = useState(true);
  const [teacherReviewEnabled, setTeacherReviewEnabled] = useState(true);
  const [teacherWeight, setTeacherWeight] = useState(70);
  const [peerWeight, setPeerWeight] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onCreate({
        teacherId,
        teacherName,
        teacherEmail,
        title: title.trim(),
        grade,
        classNumber,
        period,
        teamCount,
        membersPerTeam,
        difficultyMode,
        activeStep: 1,
        status: 'active',
        peerReviewEnabled,
        teacherReviewEnabled,
        teacherWeight,
        peerWeight,
      });
      onClose();
    } catch (err) {
      console.error('Error creating room:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-800 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">새 수사본부(수업방) 개설</h3>
              <p className="text-xs text-slate-500">중학교 1학년 학급 및 수사 모둠 환경 설정</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">수업/수사본부 명칭 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 1학년 3반 팩트체크 탐구 수업"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">학년</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value={1}>중학교 1학년</option>
                <option value={2}>중학교 2학년</option>
                <option value={3}>중학교 3학년</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">학급(반)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={classNumber}
                onChange={(e) => setClassNumber(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">차시</label>
              <input
                type="number"
                min={1}
                max={10}
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">모둠 수 (팀)</label>
              <select
                value={teamCount}
                onChange={(e) => setTeamCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n}개 모둠</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">모둠당 권장 인원</label>
              <select
                value={membersPerTeam}
                onChange={(e) => setMembersPerTeam(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                {[2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}명 (4역할 권장)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">수사 난이도 모드</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'quick', label: '⚡ 빠른 수사', desc: '1~2차시 압축' },
                { id: 'standard', label: '🔍 본격 수사', desc: '3~4차시 정석' },
                { id: 'deep_counter', label: '💥 반전 수사', desc: '반증·통계 심화' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setDifficultyMode(m.id as any)}
                  className={`p-2.5 rounded-xl text-left border-2 transition ${
                    difficultyMode === m.id
                      ? 'border-indigo-600 bg-indigo-50/60 font-bold text-indigo-950'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="text-xs">{m.label}</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Evaluation Weights */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">
              FACT SCORE 산출 가중치 설정 (교사 {teacherWeight}% / 동료 {peerWeight}%)
            </span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={50}
                max={90}
                step={5}
                value={teacherWeight}
                onChange={(e) => {
                  const tw = Number(e.target.value);
                  setTeacherWeight(tw);
                  setPeerWeight(100 - tw);
                }}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-xs font-bold text-indigo-700">{teacherWeight} : {peerWeight}</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {isSubmitting ? '수업방 생성 중...' : '수사본부 개설하기'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
