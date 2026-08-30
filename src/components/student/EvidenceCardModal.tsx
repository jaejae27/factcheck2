import React, { useState } from 'react';
import { X, Upload, Link2, FileText, CheckCircle, ShieldAlert, Sparkles, Image as ImageIcon } from 'lucide-react';
import { EvidenceCard, StudentRole } from '../../types';
import { uploadEvidenceImage } from '../../lib/db';

interface EvidenceCardModalProps {
  teamId: string;
  roomId: string;
  studentId: string;
  studentName: string;
  studentRole: StudentRole;
  existingCard?: EvidenceCard | null;
  evidenceNumber: number;
  onSave: (cardData: Omit<EvidenceCard, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

export const EvidenceCardModal: React.FC<EvidenceCardModalProps> = ({
  teamId,
  roomId,
  studentId,
  studentName,
  studentRole,
  existingCard,
  evidenceNumber,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(existingCard?.title || '');
  const [sourceType, setSourceType] = useState<EvidenceCard['sourceType']>(existingCard?.sourceType || 'article');
  const [publisher, setPublisher] = useState(existingCard?.publisher || '');
  const [originalSourceUrl, setOriginalSourceUrl] = useState(existingCard?.originalSourceUrl || '');
  const [isOriginalSource, setIsOriginalSource] = useState(existingCard?.isOriginalSource ?? true);
  const [publishDate, setPublishDate] = useState(existingCard?.publishDate || '');
  const [keyContent, setKeyContent] = useState(existingCard?.keyContent || '');
  const [stance, setStance] = useState<EvidenceCard['stance']>(existingCard?.stance || 'supports');
  const [targetSubject, setTargetSubject] = useState(existingCard?.targetSubject || '');
  const [researchMethod, setResearchMethod] = useState(existingCard?.researchMethod || '');
  const [keyMetrics, setKeyMetrics] = useState(existingCard?.keyMetrics || '');
  const [limitations, setLimitations] = useState(existingCard?.limitations || '');
  const [reliabilityReason, setReliabilityReason] = useState(existingCard?.reliabilityReason || '');
  const [imageUrl, setImageUrl] = useState(existingCard?.imageUrl || '');
  const [imageCaption, setImageCaption] = useState(existingCard?.imageCaption || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setErrorMsg('');
      const url = await uploadEvidenceImage(file, teamId);
      setImageUrl(url);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setErrorMsg('이미지 업로드에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !keyContent.trim()) {
      setErrorMsg('자료 제목과 핵심 내용은 반드시 작성해야 합니다.');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        teamId,
        roomId,
        authorStudentId: studentId,
        authorName: studentName,
        authorRole: studentRole,
        evidenceNumber: existingCard?.evidenceNumber || evidenceNumber,
        title: title.trim(),
        sourceType,
        publisher: publisher.trim(),
        originalSourceUrl: originalSourceUrl.trim(),
        isOriginalSource,
        publishDate: publishDate.trim(),
        keyContent: keyContent.trim(),
        stance,
        targetSubject: targetSubject.trim(),
        researchMethod: researchMethod.trim(),
        keyMetrics: keyMetrics.trim(),
        limitations: limitations.trim(),
        reliabilityReason: reliabilityReason.trim(),
        imageUrl: imageUrl || undefined,
        imageCaption: imageCaption.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      console.error('Save card error:', err);
      setErrorMsg('증거 카드 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-800 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {existingCard ? '증거 카드 수정' : `새 증거 카드 #${evidenceNumber} 등록`}
              </h3>
              <p className="text-xs text-slate-500">
                작성자: {studentName} ({studentRole === 'source_tracker' ? '출처 추적관' : studentRole === 'evidence_analyst' ? '증거 분석관' : studentRole === 'counter_investigator' ? '반증 수사관' : '브리핑관'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          
          {/* Stance Selector (가설 지지 / 반박 / 조건) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              이 자료가 우리 가설에 대해 취하는 입장 *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'supports', label: '🟢 가설 지지', desc: '가설이 맞음을 증명' },
                { id: 'refutes', label: '🔴 가설 반박 (반증)', desc: '가설과 다른 사실 증명' },
                { id: 'condition', label: '🔵 조건·예외 제시', desc: '조건에 따라 달라짐' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setStance(opt.id as any)}
                  className={`p-2.5 rounded-xl text-left border-2 transition ${
                    stance === opt.id
                      ? 'border-indigo-600 bg-indigo-50/60 font-bold text-indigo-950'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="text-xs">{opt.label}</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Source Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">자료 제목 또는 논문/기사명 *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2023 청소년 건강행태조사 통계표"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">자료 유형</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="research_paper">🔬 학술 논문/연구</option>
                <option value="gov_agency">🏛️ 정부/공공기관 통계</option>
                <option value="article">📰 언론사 팩트체크 기사</option>
                <option value="expert_interview">👨‍⚕️ 전문가 성명/인터뷰</option>
                <option value="statistic">📊 전문 통계 포털</option>
                <option value="other">📑 기타 공식 자료</option>
              </select>
            </div>
          </div>

          {/* Publisher, Original Source check, URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">작성 기관 또는 작성자 *</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="예: 질병관리청, 하버드 의대 연구팀"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">게시일 또는 발표 연도</label>
              <input
                type="text"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                placeholder="예: 2023.10 또는 2024년"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* URL and IsOriginalSource checkbox */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">원출처 링크 (URL)</label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-indigo-700 font-semibold">
                <input
                  type="checkbox"
                  checked={isOriginalSource}
                  onChange={(e) => setIsOriginalSource(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                직접 발행한 1차 원출처임
              </label>
            </div>
            <div className="relative">
              <Link2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="url"
                value={originalSourceUrl}
                onChange={(e) => setOriginalSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Key Content (Actual What It Says) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              자료가 실제로 말하는 핵심 내용 *
            </label>
            <textarea
              required
              rows={3}
              value={keyContent}
              onChange={(e) => setKeyContent(e.target.value)}
              placeholder="자료에서 확인한 사실을 자신의 말로 요약해 작성하세요. (인터넷 소문이 아니라 실제 자료에 적힌 내용을 적어야 합니다)"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sample, Method, Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">조사 대상 (표본)</label>
              <input
                type="text"
                value={targetSubject}
                onChange={(e) => setTargetSubject(e.target.value)}
                placeholder="예: 중학생 1,200명"
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">조사/실험 방법</label>
              <input
                type="text"
                value={researchMethod}
                onChange={(e) => setResearchMethod(e.target.value)}
                placeholder="예: 4주간 대조군 실험"
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">주요 수치 (통계치)</label>
              <input
                type="text"
                value={keyMetrics}
                onChange={(e) => setKeyMetrics(e.target.value)}
                placeholder="예: 24.5% 감소, p<0.01"
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Limitations and Reliability Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">이 자료의 한계나 빠진 점</label>
              <input
                type="text"
                value={limitations}
                onChange={(e) => setLimitations(e.target.value)}
                placeholder="예: 성인 대상 연구라 청소년에게 바로 적용하기 어려움"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">내가 이 자료를 믿을 만하다고 판단한 이유</label>
              <input
                type="text"
                value={reliabilityReason}
                onChange={(e) => setReliabilityReason(e.target.value)}
                placeholder="예: 국가 공인 통계이며 표본 수가 충분함"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Image Upload / Capture */}
          <div className="p-3.5 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                증거 캡처/사진 첨부 (선택)
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] text-rose-600 hover:underline font-semibold"
                >
                  이미지 삭제
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="space-y-2">
                <img
                  src={imageUrl}
                  alt="Evidence attachment"
                  className="max-h-40 rounded-xl object-contain border border-slate-200 bg-white mx-auto"
                />
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="이 캡처에서 확인하려는 핵심은 무엇인가요?"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  {isUploading ? '업로드 중...' : '사진 선택 또는 캡처 파일 올리기'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                <span className="text-[11px] text-slate-500">그래프, 논문 초록, 공식 보도자료 캡처 등</span>
              </div>
            )}
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
              disabled={isSaving || isUploading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {isSaving ? '저장 중...' : existingCard ? '수정 완료' : '증거 카드 등록'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
