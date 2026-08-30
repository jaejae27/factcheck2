import { Room, Team, InvestigationData, EvidenceCard, Student } from '../types';
import { ROLE_DEFINITIONS } from '../data/topics';

// Helper to escape HTML string
function escapeHtml(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getVerdictBadge(verdict: string | undefined): { label: string; bg: string; text: string } {
  switch (verdict) {
    case 'true': return { label: '🟢 사실 (TRUE)', bg: '#052e16', text: '#86efac' };
    case 'mostly_true': return { label: '🟢 대체로 사실 (MOSTLY TRUE)', bg: '#064e3b', text: '#6ee7b7' };
    case 'half_true': return { label: '🟡 절반의 사실 (HALF TRUE)', bg: '#451a03', text: '#fcd34d' };
    case 'conditional': return { label: '🔵 조건에 따라 다름 (CONDITIONAL)', bg: '#172554', text: '#93c5fd' };
    case 'insufficient_evidence': return { label: '⚪ 근거 부족 (INSUFFICIENT)', bg: '#1e293b', text: '#cbd5e1' };
    case 'mostly_false': return { label: '🔴 대체로 사실 아님 (MOSTLY FALSE)', bg: '#4c0519', text: '#fda4af' };
    case 'false': return { label: '🔴 사실 아님 (FALSE)', bg: '#450a0a', text: '#fca5a5' };
    case 'needs_more_investigation': return { label: '🟣 추가 수사 필요 (PENDING)', bg: '#3b0764', text: '#d8b4fe' };
    default: return { label: '판정 미완료', bg: '#0f172a', text: '#94a3b8' };
  }
}

// 1. POPUP: 자동생성 소논문형 수사보고서 새 창 열기
export function openReportInNewWindow(
  team: Team,
  investigation: InvestigationData,
  evidenceList: EvidenceCard[],
  teamMembers: Student[],
  room: Room
) {
  const popup = window.open(
    '',
    `report_${team.id}_${Date.now()}`,
    'width=1100,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
  );

  if (!popup) {
    alert('브라우저 팝업 차단이 설정되어 있습니다. 팝업 허용을 활성화해주세요.');
    return;
  }

  const verdict = getVerdictBadge(investigation.finalVerdict);

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(team.teamName)} - 팩트체크 수사보고서</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; color: black !important; padding: 0 !important; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 antialiased min-h-screen p-4 sm:p-8">
  <div class="max-w-4xl mx-auto space-y-4">
    
    <!-- Top Action Bar (No Print) -->
    <div class="no-print bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="px-2.5 py-1 rounded bg-indigo-500 text-xs font-black">새 창 팝업 모드</span>
        <h2 class="text-sm sm:text-base font-bold">${escapeHtml(team.teamName)} 팩트체크 소논문형 수사보고서</h2>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="window.print()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow transition cursor-pointer">
          🖨️ 인쇄 / PDF 저장
        </button>
        <button onclick="toggleFullscreen()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer">
          ⛶ 전체화면
        </button>
        <button onclick="window.close()" class="px-3 py-2 bg-rose-900/60 hover:bg-rose-900 text-rose-200 rounded-xl text-xs font-bold transition cursor-pointer">
          ✕ 창 닫기
        </button>
      </div>
    </div>

    <!-- Paper Report Container -->
    <div class="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-12 space-y-8">
      
      <!-- Title Header -->
      <div class="text-center border-b-2 border-slate-900 pb-6 space-y-3">
        <div class="inline-block px-3 py-1 text-xs font-black tracking-widest uppercase bg-slate-900 text-white rounded">
          FACT CHECK RESEARCH INVESTIGATION REPORT
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          ${escapeHtml(investigation.reportThesis?.researchTitle || `${team.topicTitle || team.claim}에 대한 팩트체크 수사 보고`)}
        </h1>
        <p class="text-sm font-medium text-slate-600">
          ${escapeHtml(room.grade)}학년 ${escapeHtml(room.classNumber)}반 · ${escapeHtml(team.teamName)} · 수사일: ${new Date().toLocaleDateString('ko-KR')}
        </p>
      </div>

      <!-- Section 1: 사건 개요 및 의심 주장 -->
      <div class="space-y-3">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
          1. 사건 개요 및 검증 대상
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span class="text-xs font-semibold text-slate-500 block">검증 대상 의심 주장</span>
            <p class="font-bold text-slate-900 mt-1 text-base">${escapeHtml(team.claim || team.topicTitle || '의심 주장 미입력')}</p>
          </div>
          <div>
            <span class="text-xs font-semibold text-slate-500 block">핵심 수사 질문</span>
            <p class="font-medium text-slate-800 mt-1 text-sm">
              ${investigation.investigationQuestions && investigation.investigationQuestions.length > 0
                ? investigation.investigationQuestions.map(q => `• ${escapeHtml(q)}`).join('<br/>')
                : '공인 출처와 통계적 인과관계를 중심으로 검증 수행'}
            </p>
          </div>
        </div>
      </div>

      <!-- Section 2: 최초 판단 및 수사 가설 -->
      <div class="space-y-3">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
          2. 최초 판단 및 가설 설정
        </h3>
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-500">수사 전 최초 생각:</span>
            <span class="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 text-xs">
              ${investigation.initialBelief === 'true' ? '사실일 것 같다' :
                investigation.initialBelief === 'false' ? '사실이 아닐 것 같다' :
                investigation.initialBelief === 'conditional' ? '조건에 따라 다를 것 같다' : '미정'}
            </span>
            ${investigation.initialReason ? `<span class="text-slate-600">(${escapeHtml(investigation.initialReason)})</span>` : ''}
          </div>
          <div>
            <span class="text-xs font-semibold text-slate-500 block">수사팀 검증 가설:</span>
            <p class="font-medium text-slate-900 mt-0.5 italic">
              "${escapeHtml(investigation.hypothesis || '주장의 실제 사실 여부와 인과관계를 검증한다.')}"
            </p>
          </div>
        </div>
      </div>

      <!-- Section 3: 수사관 역할 분담 -->
      <div class="space-y-3">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
          3. 수사관 역할 분담
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          ${teamMembers.map(m => {
            const roleDef = m.role ? ROLE_DEFINITIONS[m.role] : null;
            return `
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span class="text-xs font-bold text-indigo-600 uppercase block">${escapeHtml(roleDef?.title || '수사관')}</span>
                <span class="text-sm font-semibold text-slate-800 block mt-1">${escapeHtml(m.studentNumber)}번 ${escapeHtml(m.name)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Section 4: 증거 카드 목록 -->
      <div class="space-y-3">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
          4. 수집된 핵심 증거 및 출처 (${evidenceList.length}건)
        </h3>
        ${evidenceList.length === 0 ? `
          <p class="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
            수집된 증거 카드가 없습니다.
          </p>
        ` : `
          <div class="space-y-3">
            ${evidenceList.map((ev, idx) => `
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <span class="font-bold text-sm text-slate-900">증거 #${idx + 1}. ${escapeHtml(ev.title)}</span>
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded font-bold ${
                      ev.stance === 'supports' ? 'bg-emerald-100 text-emerald-800' :
                      ev.stance === 'refutes' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }">
                      ${ev.stance === 'supports' ? '가설 지지' : ev.stance === 'refutes' ? '가설 반박' : '조건 제시'}
                    </span>
                    <span class="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                      ${ev.isOriginalSource ? '1차 원출처' : '2차 인용'}
                    </span>
                  </div>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                  <div><span class="font-semibold text-slate-500">발행/출처:</span> ${escapeHtml(ev.publisher || '미기재')}</div>
                  <div><span class="font-semibold text-slate-500">작성일:</span> ${escapeHtml(ev.publishDate || '미기재')}</div>
                  <div><span class="font-semibold text-slate-500">조사대상:</span> ${escapeHtml(ev.targetSubject || '전체')}</div>
                  <div><span class="font-semibold text-slate-500">방법:</span> ${escapeHtml(ev.researchMethod || '통계/문헌')}</div>
                </div>
                <div class="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 text-xs leading-relaxed">
                  <span class="font-bold text-slate-700 block mb-0.5">핵심 내용 및 데이터:</span>
                  ${escapeHtml(ev.keyContent)}
                  ${ev.keyMetrics ? `<p class="mt-1 text-indigo-700 font-semibold">주요 수치: ${escapeHtml(ev.keyMetrics)}</p>` : ''}
                </div>
                ${ev.limitations ? `
                  <p class="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 text-xs">
                    ⚠️ 자료의 한계: ${escapeHtml(ev.limitations)}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Section 5: 교차검증 분석 -->
      <div class="space-y-3">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
          5. 교차검증 및 반증·예외 분석 (합동 수사 결과)
        </h3>
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs leading-relaxed">
          <div>
            <span class="font-bold text-slate-800 block text-xs mb-1">① 여러 자료에서 공통적으로 확인된 사실:</span>
            <p class="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
              ${escapeHtml(investigation.jointSynthesis?.commonFindings || '자료 간 공통 사실을 종합 검증함')}
            </p>
          </div>
          <div>
            <span class="font-bold text-slate-800 block text-xs mb-1">② 서로 다른 결과가 나타난 원인 및 조건 차이:</span>
            <p class="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
              ${escapeHtml(investigation.jointSynthesis?.reasonForConflict || '조사 대상 및 조건에 따른 차이점 분석 완료')}
            </p>
          </div>
          <div>
            <span class="font-bold text-slate-800 block text-xs mb-1">③ 빠진 맥락 및 예외 조건:</span>
            <p class="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
              ${escapeHtml(investigation.jointSynthesis?.missingContextExceptions || '과도한 일반화를 방지하기 위한 예외 검토')}
            </p>
          </div>
          <div>
            <span class="font-bold text-slate-800 block text-xs mb-1">④ 현재 확보한 증거로 주장할 수 있는 범위:</span>
            <p class="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
              ${escapeHtml(investigation.jointSynthesis?.warrantScope || '확보된 증거의 신뢰 범위 내에서 판단 확정')}
            </p>
          </div>
        </div>
      </div>

      <!-- Section 6: 최종 판정 -->
      <div class="space-y-3 border-2 border-indigo-600 p-6 rounded-2xl bg-indigo-50/50">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-3">
          <h3 class="text-lg font-black text-indigo-950 flex items-center gap-2">
            6. 팩트체크 최종 판정 (FINAL VERDICT)
          </h3>
          <span class="px-4 py-1.5 rounded-full font-black text-sm text-white shadow-sm" style="background-color: ${verdict.bg}; color: ${verdict.text}">
            ${verdict.label}
          </span>
        </div>
        <div class="space-y-2 text-xs">
          <span class="font-bold text-slate-800 block text-xs">판정의 가장 결정적인 근거:</span>
          <p class="text-slate-900 bg-white p-3 rounded-xl border border-indigo-200 font-medium text-sm leading-relaxed">
            ${escapeHtml(investigation.decisiveEvidenceSummary || '수집된 공인 기관 통계 및 반대 증거 분석을 종합하여 판정함.')}
          </p>
        </div>
        ${investigation.beliefChangeComparison?.changedReason ? `
          <div class="pt-2 text-xs text-indigo-900">
            <span class="font-bold">최초 생각과의 비교: </span>
            ${escapeHtml(investigation.beliefChangeComparison.changedReason)}
          </div>
        ` : ''}
      </div>

      <!-- Footer Signature -->
      <div class="pt-8 border-t border-slate-300 text-center text-xs text-slate-500">
        <p class="font-semibold text-slate-700">
          "좋은 팩트체커는 모든 것을 의심하는 사람이 아니라, 확인할 방법을 알고 근거에 따라 판단을 바꿀 수 있는 사람입니다."
        </p>
        <p class="mt-1">팩트체크 수사본부 (FACT CHECK INVESTIGATION LAB)</p>
      </div>

    </div>
  </div>

  <script>
    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  </script>
</body>
</html>`;

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}

// 2. POPUP: 자동생성 8장 브리핑 슬라이드 새 창 열기 (대화면/전체화면 프레젠테이션)
export function openPresentationInNewWindow(
  team: Team,
  investigation: InvestigationData,
  evidenceList: EvidenceCard[],
  teamMembers: Student[],
  room: Room
) {
  const popup = window.open(
    '',
    `presentation_${team.id}_${Date.now()}`,
    'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no'
  );

  if (!popup) {
    alert('브라우저 팝업 차단이 설정되어 있습니다. 팝업 허용을 활성화해주세요.');
    return;
  }

  const verdict = getVerdictBadge(investigation.finalVerdict);
  const supportEvs = evidenceList.filter(e => e.stance === 'supports');
  const counterEvs = evidenceList.filter(e => e.stance === 'refutes' || e.stance === 'condition');

  const slidesData = [
    // Slide 1: Cover / Case Title
    `
      <div class="flex-1 flex flex-col justify-center space-y-6 text-center animate-fade">
        <div class="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black tracking-widest uppercase mx-auto">
          SLIDE 01 · CASE BRIEFING
        </div>
        <div class="space-y-3 max-w-3xl mx-auto">
          <span class="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">사건 수사 보고서</span>
          <h1 class="text-3xl sm:text-4xl font-black text-white leading-tight">
            "${escapeHtml(team.topicTitle || team.claim || '사건 미선택')}"
          </h1>
          <p class="text-sm text-slate-300">
            ${escapeHtml(room.grade)}학년 ${escapeHtml(room.classNumber)}반 · <strong>${escapeHtml(team.teamName)}</strong> 수사대
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2 pt-4">
          ${teamMembers.map(m => `
            <span class="px-3 py-1 rounded-xl bg-[#0f274a] text-cyan-200 text-xs font-bold border border-cyan-500/30">
              ${escapeHtml(m.studentNumber)}번 ${escapeHtml(m.name)} (${escapeHtml(m.role ? ROLE_DEFINITIONS[m.role]?.title.slice(0,4) : '수사관')})
            </span>
          `).join('')}
        </div>
      </div>
    `,

    // Slide 2: Claim & Hypothesis
    `
      <div class="flex-1 flex flex-col justify-between space-y-6 animate-fade">
        <div class="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <div>
            <span class="text-[10px] font-black uppercase text-cyan-400 font-mono tracking-widest">SLIDE 02</span>
            <h2 class="text-2xl font-black text-white">검증 대상 주장 & 수사 가설</h2>
          </div>
          <span class="text-xs font-bold text-slate-400">사건 가설 수립</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
          <div class="p-6 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-3">
            <span class="text-xs font-bold text-rose-400 uppercase flex items-center gap-2">⚠️ 검증 대상 의심 주장</span>
            <p class="text-lg font-bold text-white leading-relaxed">
              "${escapeHtml(team.claim || team.topicTitle || '의심 주장')}"
            </p>
            <div class="pt-2 text-xs text-slate-400">
              수사 전 최초 생각: <strong class="text-amber-300">${escapeHtml(investigation.initialBelief || '미정')}</strong>
            </div>
          </div>
          <div class="p-6 bg-slate-950/80 rounded-3xl border border-cyan-500/30 space-y-3">
            <span class="text-xs font-bold text-cyan-400 uppercase flex items-center gap-2">🔬 수사대 검증 가설</span>
            <p class="text-lg font-bold text-cyan-200 leading-relaxed italic">
              "${escapeHtml(investigation.hypothesis || '가설 수립 중')}"
            </p>
            <div class="pt-2 text-xs text-slate-400">
              최초 수사 질문: ${escapeHtml(investigation.investigationQuestions?.[0] || '출처 및 통계적 인과관계 검증')}
            </div>
          </div>
        </div>
      </div>
    `,

    // Slide 3: Evidence Search Strategy
    `
      <div class="flex-1 flex flex-col justify-between space-y-6 animate-fade">
        <div class="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <div>
            <span class="text-[10px] font-black uppercase text-cyan-400 font-mono tracking-widest">SLIDE 03</span>
            <h2 class="text-2xl font-black text-white">공인 출처 및 증거 탐색 전략</h2>
          </div>
          <span class="text-xs font-bold text-slate-400">출처 신뢰성</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 my-auto">
          <div class="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <span class="text-xs font-bold text-cyan-300">🔎 총 수집 증거</span>
            <p class="text-3xl font-black text-white">${evidenceList.length}건</p>
            <p class="text-xs text-slate-400">등록된 팩트체크 증거 카드</p>
          </div>
          <div class="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <span class="text-xs font-bold text-emerald-400">🏛️ 1차 공인 원출처</span>
            <p class="text-3xl font-black text-emerald-300">${evidenceList.filter(e => e.isOriginalSource).length}건</p>
            <p class="text-xs text-slate-400">정부/공공기관/연구논문 원문</p>
          </div>
          <div class="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <span class="text-xs font-bold text-indigo-400">⚖️ 반증·조건 증거</span>
            <p class="text-3xl font-black text-indigo-300">${counterEvs.length}건</p>
            <p class="text-xs text-slate-400">반대 근거 및 예외 조건</p>
          </div>
        </div>
      </div>
    `,

    // Slide 4: Key Supporting Evidence
    `
      <div class="flex-1 flex flex-col justify-between space-y-4 animate-fade">
        <div class="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div>
            <span class="text-[10px] font-black uppercase text-cyan-400 font-mono tracking-widest">SLIDE 04</span>
            <h2 class="text-2xl font-black text-white">핵심 지지 증거 및 공인 데이터</h2>
          </div>
          <span class="text-xs font-bold text-emerald-400">가설 지지 증거</span>
        </div>
        <div class="space-y-3 overflow-y-auto max-h-[55vh] pr-2 my-auto">
          ${supportEvs.length === 0 ? `
            <div class="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 text-sm">
              가설을 지지하는 증거가 등록되지 않았습니다.
            </div>
          ` : supportEvs.map((ev, i) => `
            <div class="p-4 bg-slate-950/90 rounded-2xl border border-emerald-500/40 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-sm text-emerald-300">증거 ${i + 1}. ${escapeHtml(ev.title)}</span>
                <span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">${escapeHtml(ev.publisher || '공인출처')}</span>
              </div>
              <p class="text-slate-200 text-xs leading-relaxed">${escapeHtml(ev.keyContent)}</p>
              ${ev.keyMetrics ? `<p class="text-cyan-300 font-semibold text-xs">📊 주요 데이터: ${escapeHtml(ev.keyMetrics)}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `,

    // Slide 5: Counter Evidence & Missing Context
    `
      <div class="flex-1 flex flex-col justify-between space-y-4 animate-fade">
        <div class="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div>
            <span class="text-[10px] font-black uppercase text-cyan-400 font-mono tracking-widest">SLIDE 05</span>
            <h2 class="text-2xl font-black text-white">반대 증거 & 빠진 맥락 (반증 탐색)</h2>
          </div>
          <span class="text-xs font-bold text-rose-400">반증 검토</span>
        </div>
        <div class="space-y-3 overflow-y-auto max-h-[55vh] pr-2 my-auto">
          ${counterEvs.length === 0 ? `
            <div class="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 text-sm">
              반대 증거나 예외 조건 카드가 등록되지 않았습니다.
            </div>
          ` : counterEvs.map((ev, i) => `
            <div class="p-4 bg-slate-950/90 rounded-2xl border border-rose-500/40 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-sm text-rose-300">반증 ${i + 1}. ${escapeHtml(ev.title)}</span>
                <span class="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-bold">${escapeHtml(ev.publisher || '반증출처')}</span>
              </div>
              <p class="text-slate-200 text-xs leading-relaxed">${escapeHtml(ev.keyContent)}</p>
              ${ev.limitations ? `<p class="text-amber-300 text-xs">⚠️ 주의사항: ${escapeHtml(ev.limitations)}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `,

    // Slide 6: Cross Verification & Synthesis
    `
      <div class="flex-1 flex flex-col justify-between space-y-4 animate-fade">
        <div class="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div>
            <span class="text-[10px] font-black uppercase text-cyan-400 font-mono tracking-widest">SLIDE 06</span>
            <h2 class="text-2xl font-black text-white">모둠 합동 교차검증 종합</h2>
          </div>
          <span class="text-xs font-bold text-cyan-400">교차검증</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto text-xs">
          <div class="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
            <span class="font-bold text-cyan-300 block">① 공통적으로 확인된 사실</span>
            <p class="text-slate-200 bg-slate-900/90 p-3 rounded-xl border border-slate-800">${escapeHtml(investigation.jointSynthesis?.commonFindings || '자료 간 공통 사실')}</p>
          </div>
          <div class="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
            <span class="font-bold text-amber-300 block">② 충돌 지점 및 원인 분석</span>
            <p class="text-slate-200 bg-slate-900/90 p-3 rounded-xl border border-slate-800">${escapeHtml(investigation.jointSynthesis?.reasonForConflict || '조사 대상 및 조건에 따른 차이')}</p>
          </div>
          <div class="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 md:col-span-2">
            <span class="font-bold text-indigo-300 block">③ 확보한 증거로 말할 수 있는 사실의 범위</span>
            <p class="text-slate-200 bg-slate-900/90 p-3 rounded-xl border border-slate-800">${escapeHtml(investigation.jointSynthesis?.warrantScope || '과도한 일반화 방지 및 타당한 결론 범위 확정')}</p>
          </div>
        </div>
      </div>
    `,

    // Slide 7: Final Verdict & Decisive Reason
    `
      <div class="flex-1 flex flex-col justify-between space-y-4 animate-fade">
        <div class="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div>
            <span class="text-[10px] font-black uppercase text-cyan-400 font-mono tracking-widest">SLIDE 07</span>
            <h2 class="text-2xl font-black text-white">팩트체크 수사대 최종 판정</h2>
          </div>
          <span class="text-xs font-bold text-cyan-300">최종 결론</span>
        </div>
        <div class="p-8 bg-slate-950/90 rounded-3xl border-2 border-cyan-500/50 space-y-5 my-auto text-center">
          <div class="inline-block px-6 py-2 rounded-full text-lg font-black shadow-lg" style="background-color: ${verdict.bg}; color: ${verdict.text}">
            최종 판정: ${verdict.label}
          </div>
          <div class="space-y-2 max-w-2xl mx-auto text-left">
            <span class="text-xs font-bold text-cyan-300 block text-center">가장 결정적인 판정 근거</span>
            <p class="text-sm sm:text-base font-bold text-white bg-slate-900 p-4 rounded-2xl border border-cyan-500/30 leading-relaxed text-center">
              "${escapeHtml(investigation.decisiveEvidenceSummary || '수집된 공인 통계 및 교차 검증을 바탕으로 최종 판정함.')}"
            </p>
          </div>
        </div>
      </div>
    `,

    // Slide 8: Q&A / Case Closed
    `
      <div class="flex-1 flex flex-col justify-center space-y-6 text-center animate-fade">
        <div class="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-2xl mx-auto">
          🎙️
        </div>
        <div class="space-y-2">
          <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black uppercase border border-cyan-500/40">
            SLIDE 08 · Q&A & PEER DELIBERATION
          </span>
          <h2 class="text-3xl font-black text-white">동료 질문 질의응답 및 상호평가</h2>
          <p class="text-sm text-slate-300 max-w-md mx-auto">
            다른 수사팀은 출처 신뢰성, 증거 데이터, 조건 맥락에 대해 질문을 남겨주세요.
          </p>
        </div>
        <div class="pt-4">
          <span class="text-xs font-mono text-slate-400">FACT CHECK INVESTIGATION LAB · PRESENTATION COMPLETE</span>
        </div>
      </div>
    `
  ];

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(team.teamName)} - 실시간 브리핑 슬라이드</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
    .animate-fade { animation: fadeIn 0.25s ease-out forwards; }
  </style>
</head>
<body class="bg-[#030712] text-white antialiased min-h-screen flex flex-col justify-between overflow-hidden select-none">
  
  <!-- Header Bar -->
  <div class="flex items-center justify-between px-6 py-3 bg-[#060e1d] border-b border-cyan-500/30">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black animate-pulse">
        ● LIVE BRIEFING
      </div>
      <div>
        <h2 class="text-sm font-black text-slate-100">${escapeHtml(team.teamName)}: ${escapeHtml(team.topicTitle || team.claim)}</h2>
        <p class="text-[11px] text-slate-300">독립 브라우저 팝업 대화면 모드</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span id="slideCounter" class="text-xs font-black text-cyan-300 bg-[#0f274a] px-3 py-1.5 rounded-xl border border-cyan-500/40">
        SLIDE 1 / ${slidesData.length}
      </span>
      <button onclick="toggleFullscreen()" class="px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition cursor-pointer">
        ⛶ 전체화면
      </button>
      <button onclick="window.close()" class="px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900 rounded-xl border border-rose-800 transition cursor-pointer">
        ✕ 닫기
      </button>
    </div>
  </div>

  <!-- Slide Stage Canvas -->
  <div class="flex-1 flex items-center justify-center p-4 sm:p-8">
    <div id="slideContainer" class="w-full max-w-5xl aspect-[16/9] max-h-[82vh] bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all">
      <!-- Injected by JS -->
    </div>
  </div>

  <!-- Bottom Navigation -->
  <div class="px-6 py-3 bg-[#060e1d] border-t border-cyan-500/30 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <button id="prevBtn" onclick="prevSlide()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition disabled:opacity-30 cursor-pointer">
        ← 이전 슬라이드
      </button>
      <button id="nextBtn" onclick="nextSlide()" class="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl text-xs font-black transition disabled:opacity-30 shadow cursor-pointer">
        다음 슬라이드 →
      </button>
    </div>
    <div class="flex items-center gap-1.5">
      ${slidesData.map((_, idx) => `
        <button onclick="goToSlide(${idx})" class="dot-btn w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-500 transition cursor-pointer" data-index="${idx}"></button>
      `).join('')}
    </div>
  </div>

  <script>
    const slides = ${JSON.stringify(slidesData)};
    let currentIndex = 0;

    function renderSlide() {
      document.getElementById('slideContainer').innerHTML = slides[currentIndex];
      document.getElementById('slideCounter').innerText = 'SLIDE ' + (currentIndex + 1) + ' / ' + slides.length;
      document.getElementById('prevBtn').disabled = (currentIndex === 0);
      document.getElementById('nextBtn').disabled = (currentIndex === slides.length - 1);
      
      document.querySelectorAll('.dot-btn').forEach((btn, idx) => {
        if (idx === currentIndex) {
          btn.className = 'dot-btn w-6 h-3 rounded-full bg-cyan-400 transition';
        } else {
          btn.className = 'dot-btn w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-500 transition';
        }
      });
    }

    function nextSlide() {
      if (currentIndex < slides.length - 1) {
        currentIndex++;
        renderSlide();
      }
    }

    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        renderSlide();
      }
    }

    function goToSlide(idx) {
      currentIndex = idx;
      renderSlide();
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    // Keyboard support (Arrow keys & Space)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });

    renderSlide();
  </script>
</body>
</html>`;

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}
