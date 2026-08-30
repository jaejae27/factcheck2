import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Radio,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Users,
  Search,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { Team, InvestigationData, EvidenceCard, Student, Room } from '../../types';
import { ROLE_DEFINITIONS } from '../../data/topics';
import { BACKGROUNDS } from '../../assets/backgrounds';
import { openPresentationInNewWindow } from '../../lib/popupHelper';

interface PresentationViewerProps {
  room: Room;
  team: Team;
  investigation: InvestigationData;
  evidenceList: EvidenceCard[];
  teamMembers: Student[];
  currentSlideIndex: number;
  isPresenter: boolean; // is current user the briefing officer or teacher
  onSlideChange?: (newIndex: number) => void;
  onClose?: () => void;
  onStartPeerReview?: () => void;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({
  room,
  team,
  investigation,
  evidenceList,
  teamMembers,
  currentSlideIndex = 0,
  isPresenter,
  onSlideChange,
  onClose,
  onStartPeerReview,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalSlides = 8;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < totalSlides - 1 && onSlideChange) {
      onSlideChange(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0 && onSlideChange) {
      onSlideChange(currentSlideIndex - 1);
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'true': return '사실 (TRUE)';
      case 'mostly_true': return '대체로 사실 (MOSTLY TRUE)';
      case 'half_true': return '절반의 사실 (HALF TRUE)';
      case 'conditional': return '조건에 따라 다름 (CONDITIONAL)';
      case 'insufficient_evidence': return '근거 부족 (INSUFFICIENT EVIDENCE)';
      case 'mostly_false': return '대체로 사실 아님 (MOSTLY FALSE)';
      case 'false': return '사실 아님 (FALSE)';
      case 'needs_more_investigation': return '추가 수사 필요 (PENDING)';
      default: return '판정 미완료';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#030712] text-white overflow-hidden select-none relative">
      
      {/* Immersive Forensic Auditorium Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-screen scale-105 pointer-events-none"
        style={{ backgroundImage: `url(${BACKGROUNDS.briefingHall})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#030712]/85 via-[#030712]/75 to-[#030712]/95 pointer-events-none" />
      <div className="absolute inset-0 z-0 radial-vignette pointer-events-none" />
      
      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 bg-[#060e1d] border-b border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            LIVE BRIEFING
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-100">
              {team.teamName} 브리핑: {team.topicTitle || team.claim}
            </h2>
            <p className="text-[11px] text-slate-300">
              {isPresenter ? '당신은 현재 브리핑 진행자입니다 (슬라이드 조작 가능)' : '실시간 발표 중계 수신 중'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs font-black text-cyan-300 bg-[#0f274a] px-3 py-1.5 rounded-xl border border-cyan-500/40">
            SLIDE {currentSlideIndex + 1} / {totalSlides}
          </span>
          <button
            onClick={() => openPresentationInNewWindow(team, investigation, evidenceList, teamMembers, room)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-200 bg-cyan-950/80 hover:bg-cyan-900 rounded-xl border border-cyan-500/40 transition shadow-sm"
            title="독립된 새 창(팝업)으로 띄우기"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">새 창(팝업)</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800/90 hover:bg-slate-700 rounded-xl border border-slate-700 transition shadow-sm"
            title="전체화면 전환"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-300" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />}
            <span className="hidden sm:inline">{isFullscreen ? '창 모드' : '전체화면'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-hidden bg-radial from-slate-900 to-slate-950">
        <div className="w-full max-w-5xl aspect-[16/9] max-h-[80vh] bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all">
          
          {/* Subtle Watermark */}
          <div className="absolute right-8 bottom-6 text-[10px] font-black tracking-widest text-slate-700 uppercase pointer-events-none">
            FACT CHECK LAB · {team.teamName}
          </div>

          {/* SLIDE 1: 사건명 / 연구 질문 */}
          {currentSlideIndex === 0 && (
            <div className="flex-1 flex flex-col justify-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-block px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase bg-indigo-600 text-white w-fit">
                CASE BRIEFING · SLIDE 1
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                "{team.claim || team.topicTitle}"
              </h1>
              <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Search className="w-4 h-4" />
                  우리 수사팀의 핵심 수사 질문:
                </span>
                <p className="text-lg font-semibold text-slate-100">
                  {investigation.investigationQuestions?.length
                    ? investigation.investigationQuestions.join(' / ')
                    : '이 주장을 증명하거나 반박할 수 있는 실제 공인 통계와 연구 자료는 무엇인가?'}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                수사 참여: {teamMembers.map(m => `${m.studentNumber}번 ${m.name}`).join(', ')}
              </p>
            </div>
          )}

          {/* SLIDE 2: 최초 예상과 가설 */}
          {currentSlideIndex === 1 && (
            <div className="flex-1 flex flex-col justify-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-block px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase bg-indigo-600 text-white w-fit">
                HYPOTHESIS & INITIAL VERDICT · SLIDE 2
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                수사 전 최초 생각과 검증 가설
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-amber-400 block">수사 전 최초 판단</span>
                  <div className="text-xl font-black text-white">
                    {investigation.initialBelief === 'true' ? '사실일 것 같다' :
                     investigation.initialBelief === 'false' ? '사실이 아닐 것 같다' :
                     investigation.initialBelief === 'conditional' ? '조건에 따라 다를 것 같다' : '잘 모르겠다'}
                  </div>
                  <p className="text-xs text-slate-300 italic mt-2">
                    "{investigation.initialReason || '경험상 그럴 것 같다고 예상함'}"
                  </p>
                </div>

                <div className="p-6 bg-indigo-950/40 rounded-2xl border border-indigo-500/40 space-y-2">
                  <span className="text-xs font-bold text-indigo-400 block">검증 가능한 가설</span>
                  <p className="text-base font-bold text-indigo-100 leading-relaxed">
                    "{investigation.hypothesis || '공신력 있는 연구와 통계를 통해 주장의 참/거짓 여부를 밝혀낸다.'}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: 우리가 어떻게 수사했는가 */}
          {currentSlideIndex === 2 && (
            <div className="flex-1 flex flex-col justify-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-block px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase bg-indigo-600 text-white w-fit">
                INVESTIGATION METHOD · SLIDE 3
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                역할별 수사 전략 및 방법
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {teamMembers.map((m) => {
                  const roleKey = m.role || 'source_tracker';
                  const roleDef = ROLE_DEFINITIONS[roleKey];
                  return (
                    <div key={m.id} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-center space-y-2">
                      <span className="text-xs font-black text-indigo-400 block">
                        {roleDef?.title || '수사관'}
                      </span>
                      <p className="text-sm font-bold text-white">{m.name}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-3 leading-snug">
                        {roleDef?.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SLIDE 4: 핵심 증거 */}
          {currentSlideIndex === 3 && (
            <div className="flex-1 flex flex-col justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-block px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase bg-indigo-600 text-white w-fit">
                KEY EVIDENCE CARDS · SLIDE 4
              </div>
              <h2 className="text-2xl font-black text-white">
                확보한 핵심 증거 카드 ({evidenceList.length}건)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {evidenceList.slice(0, 4).map((ev, idx) => (
                  <div key={ev.id} className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">증거 #{idx + 1}. {ev.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-200">
                        {ev.publisher || '공식기관'}
                      </span>
                    </div>
                    <p className="text-slate-300 line-clamp-3 leading-relaxed">{ev.keyContent}</p>
                    {ev.keyMetrics && (
                      <p className="text-emerald-400 font-bold text-[11px]">수치: {ev.keyMetrics}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLIDE 5: 서로 다른 증거 비교 */}
          {currentSlideIndex === 4 && (
            <div className="flex-1 flex flex-col justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-block px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase bg-indigo-600 text-white w-fit">
                CROSS-VERIFICATION MATRIX · SLIDE 5
              </div>
              <h2 className="text-2xl font-black text-white">
                서로 다른 자료 및 결과 비교
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 block">공통적으로 나타난 사실</span>
                  <p className="text-slate-200 leading-relaxed">
                    {investigation.jointSynthesis?.commonFindings || '복수의 자료에서 공통적인 경향성을 확인함'}
                  </p>
                </div>
                <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-amber-400 block">결과가 달라진 원인 (조건·대상)</span>
                  <p className="text-slate-200 leading-relaxed">
                    {investigation.jointSynthesis?.reasonForConflict || '조사 대상 연령이나 실험 환경에 따라 통계적 수치에 차이가 나타남'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: 반증·조건·예외 */}
          {currentSlideIndex === 5 && (
            <div className="flex-1 flex flex-col justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-block px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase bg-indigo-600 text-white w-fit">
                COUNTER-EVIDENCE & EXCEPTIONS · SLIDE 6
              </div>
              <h2 className="text-2xl font-black text-white">
                반대 증거 및 놓치기 쉬운 조건·예외
              </h2>
              <div className="p-6 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="font-bold text-rose-400 block text-xs mb-1">⚠️ 최초 예상과 달랐던 반대 증거:</span>
                  <p className="text-slate-200">
                    {investigation.jointSynthesis?.unexpectedEvidence || '단순한 일반화와 다른 예외적 사실을 확인함'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <span className="font-bold text-indigo-300 block text-xs mb-1">🔍 주장에 빠진 맥락과 조건:</span>
                  <p className="text-slate-200">
                    {investigation.jointSynthesis?.missingContextExceptions || '모든 경우에 100% 적용되는 것이 아니라 특정 조건하에서만 성립함'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7: 최종 판정 */}
          {currentSlideIndex === 6 && (
            <div className="flex-1 flex flex-col justify-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-block px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase bg-indigo-600 text-white w-fit">
                FINAL VERDICT · SLIDE 7
              </div>
              
              <div className="p-6 bg-gradient-to-br from-indigo-900/60 to-slate-900 rounded-3xl border-2 border-indigo-500 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/30 pb-3">
                  <span className="text-xs font-bold text-indigo-300">팩트체크 수사대 최종 판정</span>
                  <span className="px-5 py-2 rounded-full font-black text-base bg-indigo-600 text-white shadow-lg">
                    {getVerdictLabel(investigation.finalVerdict)}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <span className="text-xs font-bold text-slate-300 block">판정의 가장 결정적인 근거:</span>
                  <p className="text-slate-100 font-medium text-sm leading-relaxed">
                    {investigation.decisiveEvidenceSummary || '수집된 공인 기관 통계와 반증 분석을 종합하여 판정함.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 8: 생각의 변화와 남은 질문 */}
          {currentSlideIndex === 7 && (
            <div className="flex-1 flex flex-col justify-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-block px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase bg-indigo-600 text-white w-fit">
                REFLECTIVE SYNTHESIS · SLIDE 8
              </div>
              <h2 className="text-2xl font-black text-white">
                수사 후 생각의 변화와 남은 질문
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 block">생각이 변화한 과정</span>
                  <p className="text-slate-200 leading-relaxed">
                    {investigation.beliefChangeComparison?.changedReason || '처음의 막연한 짐작에서 객관적 데이터를 통해 사실의 범위를 명확히 깨달음'}
                  </p>
                </div>
                <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-indigo-400 block">후속 탐구를 위한 남은 질문</span>
                  <p className="text-slate-200 leading-relaxed">
                    {investigation.reportThesis?.futureQuestions || '다른 연령대나 새로운 환경에서도 동일한 결과가 나타날지 추가 수사가 필요함'}
                  </p>
                </div>
              </div>

              {onStartPeerReview && isPresenter && (
                <div className="pt-3 text-center">
                  <button
                    onClick={onStartPeerReview}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition shadow-lg animate-bounce"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    브리핑 종료 & 동료 수사관 평가 시작하기
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Bottom Remote Control Bar (For Presenter / Teacher) */}
      <div className="flex items-center justify-between px-8 py-4 bg-slate-900/90 border-t border-slate-800">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              disabled={!isPresenter}
              onClick={() => onSlideChange && onSlideChange(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlideIndex === idx
                  ? 'w-8 bg-indigo-500'
                  : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              title={`슬라이드 ${idx + 1}`}
            />
          ))}
        </div>

        {isPresenter && (
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold transition border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              이전 슬라이드
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white text-xs font-bold transition shadow-md"
            >
              다음 슬라이드
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
