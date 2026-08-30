import React, { useRef, useState, useEffect } from 'react';
import { Printer, Download, X, Award, FileText, CheckCircle2, ShieldAlert, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { Team, InvestigationData, EvidenceCard, Student, Room } from '../../types';
import { ROLE_DEFINITIONS } from '../../data/topics';
import { openReportInNewWindow } from '../../lib/popupHelper';

interface ReportExporterProps {
  room: Room;
  team: Team;
  investigation: InvestigationData;
  evidenceList: EvidenceCard[];
  teamMembers: Student[];
  onClose: () => void;
  showStudentNames?: boolean;
}

export const ReportModal: React.FC<ReportExporterProps> = ({
  room,
  team,
  investigation,
  evidenceList,
  teamMembers,
  onClose,
  showStudentNames = true,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  const handleOpenPopup = () => {
    openReportInNewWindow(team, investigation, evidenceList, teamMembers, room);
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
      case 'needs_more_investigation': return '추가 수사 필요 (PENDING INVESTIGATION)';
      default: return '판정 미완료';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 overflow-y-auto ${isFullscreen ? 'p-0' : 'p-3 sm:p-6'}`}>
      <div className={`relative w-full bg-white shadow-2xl flex flex-col overflow-hidden text-slate-800 transition-all duration-200 ${
        isFullscreen ? 'h-full max-h-screen rounded-none' : 'max-w-4xl max-h-[92vh] rounded-3xl border border-slate-200'
      }`}>
        
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {team.teamName} 팩트체크 소논문형 수사보고서
              </h2>
              <p className="text-xs text-slate-500">{room.title} · {room.grade}학년 {room.classNumber}반</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenPopup}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition shadow-sm"
              title="독립된 새 창(팝업)으로 띄우기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>새 창(팝업)</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition shadow-sm"
              title="전체화면 전환"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-slate-600" /> : <Maximize2 className="w-4 h-4 text-slate-600" />}
              <span className="hidden sm:inline">{isFullscreen ? '창 모드' : '전체화면'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>인쇄 / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-8 bg-white print:p-0 print:m-0">
          
          {/* Header Badge */}
          <div className="text-center border-b-2 border-slate-900 pb-6 space-y-3">
            <div className="inline-block px-3 py-1 text-xs font-black tracking-widest uppercase bg-slate-900 text-white rounded">
              FACT CHECK RESEARCH INVESTIGATION REPORT
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {investigation.reportThesis?.researchTitle || `${team.topicTitle || team.claim}에 대한 팩트체크 수사 보고`}
            </h1>
            <p className="text-sm font-medium text-slate-600">
              {room.grade}학년 {room.classNumber}반 · {team.teamName} · 수사 완료일: {new Date(team.lastActive).toLocaleDateString('ko-KR')}
            </p>
          </div>

          {/* Section 1: 사건 개요 및 연구 질문 */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
              1. 사건 개요 및 연구 질문
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-500">검증 대상 의심 주장</span>
                <p className="font-bold text-slate-900 mt-1 text-base">{team.claim || team.topicTitle}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500">최초 수사 질문</span>
                <p className="font-medium text-slate-800 mt-1 text-sm">
                  {investigation.investigationQuestions?.length
                    ? investigation.investigationQuestions.join(', ')
                    : '이 주장이 사실인지 확인하기 위해 원출처와 통계적 근거를 조사함'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: 최초 판단 및 가설 설정 */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
              2. 최초 판단 및 가설 설정
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">수사 전 최초 생각:</span>
                <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 text-xs">
                  {investigation.initialBelief === 'true' ? '사실일 것 같다' :
                   investigation.initialBelief === 'false' ? '사실이 아닐 것 같다' :
                   investigation.initialBelief === 'conditional' ? '조건에 따라 다를 것 같다' : '잘 모르겠다'}
                </span>
                {investigation.initialReason && (
                  <span className="text-slate-600">({investigation.initialReason})</span>
                )}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500">수사팀 검증 가설:</span>
                <p className="font-medium text-slate-900 mt-0.5 italic">
                  "{investigation.hypothesis || '주장의 실제 사실 여부와 인과관계를 검증한다.'}"
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: 역할 분담 및 수사원 */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
              3. 수사관 역할 분담
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {teamMembers.map((member) => {
                const roleKey = member.role || 'source_tracker';
                const roleDef = ROLE_DEFINITIONS[roleKey];
                return (
                  <div key={member.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-xs font-bold text-indigo-600 uppercase block">
                      {roleDef?.title || '수사관'}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 block mt-1">
                      {showStudentNames ? `${member.studentNumber}번 ${member.name}` : `수사관 ${member.studentNumber}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: 주요 증거 목록 */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
              4. 수집된 핵심 증거 및 출처 ({evidenceList.length}건)
            </h3>
            {evidenceList.length === 0 ? (
              <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                수집된 증거 카드가 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {evidenceList.map((ev, idx) => (
                  <div key={ev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <span className="font-bold text-sm text-slate-900">
                        증거 #{idx + 1}. {ev.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          ev.stance === 'supports' ? 'bg-emerald-100 text-emerald-800' :
                          ev.stance === 'refutes' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ev.stance === 'supports' ? '가설 지지' : ev.stance === 'refutes' ? '가설 반박' : '조건 제시'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                          {ev.isOriginalSource ? '원출처' : '2차 인용'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                      <div><span className="font-semibold text-slate-500">발행/작성:</span> {ev.publisher || '미기재'}</div>
                      <div><span className="font-semibold text-slate-500">게시일:</span> {ev.publishDate || '미기재'}</div>
                      <div><span className="font-semibold text-slate-500">조사대상:</span> {ev.targetSubject || '전체'}</div>
                      <div><span className="font-semibold text-slate-500">조사방법:</span> {ev.researchMethod || '문헌/통계'}</div>
                    </div>

                    <div className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 text-xs leading-relaxed">
                      <span className="font-bold text-slate-700 block mb-0.5">핵심 내용 및 데이터:</span>
                      {ev.keyContent}
                      {ev.keyMetrics && <p className="mt-1 text-indigo-700 font-semibold">주요 수치: {ev.keyMetrics}</p>}
                    </div>

                    {ev.limitations && (
                      <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 text-xs">
                        ⚠️ 자료의 한계: {ev.limitations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: 교차검증 및 반증·예외 분석 */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
              5. 교차검증 및 반증·조건 분석 (합동 수사 결과)
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs leading-relaxed">
              <div>
                <span className="font-bold text-slate-800 block text-xs mb-1">① 여러 자료에서 공통적으로 확인된 사실:</span>
                <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                  {investigation.jointSynthesis?.commonFindings || '자료 간 공통 사실을 정리함'}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-xs mb-1">② 서로 다른 결과가 나타난 원인 및 조건 차이:</span>
                <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                  {investigation.jointSynthesis?.reasonForConflict || '조사 대상 연령과 실험 조건에 따라 결과의 차이가 발생함'}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-xs mb-1">③ 빠진 맥락 및 예외 조건:</span>
                <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                  {investigation.jointSynthesis?.missingContextExceptions || '과도한 일반화를 경계하고 세부적인 적용 조건을 분석함'}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-xs mb-1">④ 현재 확보한 증거로 주장할 수 있는 범위:</span>
                <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                  {investigation.jointSynthesis?.warrantScope || '모든 상황에 무조건 적용하기보다는 특정 조건하에서 유효함을 확인'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 6: 최종 판정 및 결정적 근거 */}
          <div className="space-y-3 border-2 border-indigo-600 p-6 rounded-2xl bg-indigo-50/50">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-3">
              <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                6. 팩트체크 최종 판정 (FINAL VERDICT)
              </h3>
              <span className="px-4 py-1.5 rounded-full font-black text-sm bg-indigo-600 text-white shadow-sm">
                {getVerdictLabel(investigation.finalVerdict)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 block text-xs">판정의 가장 결정적인 근거:</span>
              <p className="text-slate-900 bg-white p-3 rounded-xl border border-indigo-200 font-medium text-sm leading-relaxed">
                {investigation.decisiveEvidenceSummary || '수집된 공인 기관 통계 및 반대 증거 분석을 종합하여 판정함.'}
              </p>
            </div>

            {investigation.beliefChangeComparison?.changedReason && (
              <div className="pt-2 text-xs text-indigo-900">
                <span className="font-bold">최초 생각과의 비교: </span>
                {investigation.beliefChangeComparison.changedReason}
              </div>
            )}
          </div>

          {/* Section 7: 한계 및 후속 연구 과제 */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
              7. 연구의 한계 및 후속 수사 과제
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <p>
                <span className="font-semibold text-slate-900">수사의 한계: </span>
                {investigation.reportThesis?.limitations || '제한된 수업 시간 내에 공개된 문헌 자료 위주로 조사하여 장기적인 실험 데이터를 직접 측정하지 못함'}
              </p>
              <p>
                <span className="font-semibold text-slate-900">남은 질문: </span>
                {investigation.reportThesis?.futureQuestions || '한국 중학생을 직접 대상으로 한 최신 대규모 표본 연구가 추가로 필요함'}
              </p>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-8 border-t border-slate-300 text-center text-xs text-slate-500">
            <p className="font-semibold text-slate-700">
              "좋은 팩트체커는 모든 것을 의심하는 사람이 아니라, 확인할 방법을 알고 근거에 따라 판단을 바꿀 수 있는 사람입니다."
            </p>
            <p className="mt-1">팩트체크 수사본부 (FACT CHECK INVESTIGATION LAB)</p>
          </div>

        </div>

      </div>
    </div>
  );
};
