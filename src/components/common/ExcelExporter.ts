import * as XLSX from 'xlsx';
import {
  Room,
  Student,
  Team,
  InvestigationData,
  EvidenceCard,
  PeerReview,
  TeacherReview,
  StudentReflection,
  TeacherObservation,
  SchoolRecordDraft,
} from '../../types';

export function exportClassroomExcel(params: {
  room: Room;
  students: Student[];
  teams: Team[];
  investigations: Record<string, InvestigationData>;
  evidenceList: EvidenceCard[];
  peerReviews: PeerReview[];
  teacherReviews: TeacherReview[];
  reflections: StudentReflection[];
  observations: TeacherObservation[];
  drafts: SchoolRecordDraft[];
}) {
  const {
    room,
    students,
    teams,
    investigations,
    evidenceList,
    peerReviews,
    teacherReviews,
    reflections,
    observations,
    drafts,
  } = params;

  const wb = XLSX.utils.book_new();

  // Sheet 1: 학생 종합 (Student Comprehensive Overview)
  const studentSheetData = students.map((s) => {
    const team = teams.find((t) => t.id === s.teamId);
    const refl = reflections.find((r) => r.studentId === s.id);
    const obs = observations.find((o) => o.studentId === s.id);
    const draft = drafts.find((d) => d.studentId === s.id);
    const trev = team ? teacherReviews.find((tr) => tr.teamId === team.id) : null;
    const teamEvCount = evidenceList.filter((e) => e.teamId === s.teamId).length;

    return {
      학년: s.grade,
      반: s.classNumber,
      번호: s.studentNumber,
      이름: s.name,
      소속모둠: team ? team.teamName : '미배정',
      역할: s.role || '미선택',
      탐구주제: team?.topicTitle || '',
      모둠진행률: team ? `${team.progressPercent || 0}%` : '0%',
      등록증거수: teamEvCount,
      교사평가점수: trev ? trev.totalScore : '-',
      모둠FACT_SCORE: team?.factScore || '-',
      부문상: team?.awardCategory || '-',
      성찰작성여부: refl ? '완료' : '미작성',
      교사관찰태그: obs?.tags?.join(', ') || '',
      교사메모: obs?.memo || '',
      세특상태: draft?.status || '미생성',
      최종세특: draft?.teacherEdited || draft?.aiDraft || '',
    };
  });
  const ws1 = XLSX.utils.json_to_sheet(studentSheetData);
  XLSX.utils.book_append_sheet(wb, ws1, '학생 종합');

  // Sheet 2: 모둠별 연구 (Team Investigations)
  const teamSheetData = teams.map((t) => {
    const inv = investigations[t.id];
    const trev = teacherReviews.find((tr) => tr.teamId === t.id);
    return {
      모둠번호: t.teamNumber,
      모둠명: t.teamName,
      사건주제: t.topicTitle,
      의심주장: t.claim,
      최초판단: inv?.initialBelief || '',
      최초판단이유: inv?.initialReason || '',
      수사질문: inv?.investigationQuestions?.join(' | ') || '',
      검증가설: inv?.hypothesis || '',
      공통발견: inv?.jointSynthesis?.commonFindings || '',
      차이점_원인: inv?.jointSynthesis?.reasonForConflict || '',
      조건과예외: inv?.jointSynthesis?.missingContextExceptions || '',
      최종판정: inv?.finalVerdict || '',
      결정적근거: inv?.decisiveEvidenceSummary || '',
      판정변화이유: inv?.beliefChangeComparison?.changedReason || '',
      동료질문후_재검토: inv?.peerReviewDeliberation?.action || '',
      교사총점: trev?.totalScore || '-',
      부문상: t.awardCategory || '',
    };
  });
  const ws2 = XLSX.utils.json_to_sheet(teamSheetData);
  XLSX.utils.book_append_sheet(wb, ws2, '모둠별 연구');

  // Sheet 3: 증거 및 출처 (Evidence & Sources)
  const evSheetData = evidenceList.map((e) => {
    const team = teams.find((t) => t.id === e.teamId);
    return {
      증거번호: e.evidenceNumber,
      모둠: team ? team.teamName : '',
      작성자: e.authorName,
      작성자역할: e.authorRole,
      자료제목: e.title,
      출처유형: e.sourceType,
      발행기관_작성자: e.publisher,
      원출처URL: e.originalSourceUrl,
      원출처여부: e.isOriginalSource ? '원출처' : '2차 인용',
      게시일: e.publishDate,
      가설입장: e.stance === 'supports' ? '가설 지지' : e.stance === 'refutes' ? '가설 반박' : '조건 제시',
      조사대상: e.targetSubject,
      조사방법: e.researchMethod,
      핵심내용: e.keyContent,
      주요수치_통계: e.keyMetrics,
      자료의한계: e.limitations,
      신뢰성판단이유: e.reliabilityReason,
    };
  });
  const ws3 = XLSX.utils.json_to_sheet(evSheetData);
  XLSX.utils.book_append_sheet(wb, ws3, '증거 및 출처');

  // Sheet 4: 교사평가 (Teacher Evaluations)
  const teacherEvalData = teacherReviews.map((tr) => {
    const team = teams.find((t) => t.id === tr.teamId);
    return {
      모둠: team ? team.teamName : '',
      사건주제: team?.topicTitle || '',
      검증질문적절성_15점: tr.scores.questionQuality,
      출처와증거의질_20점: tr.scores.evidenceQuality,
      교차검증_비판적사고_25점: tr.scores.criticalCrossCheck,
      근거기반판정_25점: tr.scores.evidenceVerdict,
      보고서및브리핑_15점: tr.scores.reportAndBriefing,
      총점_100점: tr.totalScore,
      교사총평: tr.feedback,
      수여부문상: tr.award || '',
    };
  });
  const ws4 = XLSX.utils.json_to_sheet(teacherEvalData);
  XLSX.utils.book_append_sheet(wb, ws4, '교사평가');

  // Sheet 5: 동료평가 (Peer Reviews)
  const peerEvalData = peerReviews.map((pr) => {
    const targetTeam = teams.find((t) => t.id === pr.targetTeamId);
    return {
      평가작성학생: pr.fromStudentName,
      대상모둠: targetTeam ? targetTeam.teamName : '',
      자료적절성: pr.scores.appropriateSources,
      교차비교: pr.scores.crossVerification,
      반증조건탐색: pr.scores.counterEvidenceCheck,
      근거연결성: pr.scores.evidenceBasedVerdict,
      발표이해도: pr.scores.clarityAndUnderstanding,
      평균평점: pr.averageScore,
      질문유형: pr.questionCategory,
      동료질문: pr.peerQuestion,
    };
  });
  const ws5 = XLSX.utils.json_to_sheet(peerEvalData);
  XLSX.utils.book_append_sheet(wb, ws5, '동료평가');

  // Sheet 6: 개인 성찰 (Student Reflections)
  const reflData = reflections.map((r) => ({
    번호: r.studentNumber,
    이름: r.studentName,
    모둠: `수사 ${r.teamNumber}팀`,
    역할: r.role,
    가장잘한활동: r.bestActivity,
    찾아낸핵심증거: r.keyEvidenceFound,
    생각변화정도: r.beliefChangeLevel === 'much' ? '많이 변화' : r.beliefChangeLevel === 'little' ? '조금 변화' : '거의 변화 없음',
    생각변화이유: r.beliefChangeReason,
    가장어려웠던점: r.hardestPart,
    새롭게알게된점: r.newLearning,
    앞으로의실천: r.futureFactCheckHabit,
    남은질문: r.remainingQuestion,
    자기평가_역할책임: r.selfRatings?.roleResponsibility,
    자기평가_적극탐구: r.selfRatings?.activeInvestigation,
    자기평가_반증수용: r.selfRatings?.counterEvidenceOpenness,
    자기평가_모둠협력: r.selfRatings?.teamCollaboration,
    자기평가_판단수정: r.selfRatings?.opinionFlexibility,
  }));
  const ws6 = XLSX.utils.json_to_sheet(reflData);
  XLSX.utils.book_append_sheet(wb, ws6, '개인 성찰');

  // Sheet 7: 세특 초안 및 확정본 (School Record Drafts)
  const draftData = drafts.map((d) => {
    const student = students.find((s) => s.id === d.studentId);
    return {
      번호: d.studentNumber,
      이름: d.studentName,
      모둠: `수사 ${d.teamNumber}팀`,
      역할: d.role,
      길이옵션: d.lengthOption,
      진행상태: d.status,
      AI초안: d.aiDraft,
      교사최종수정본: d.teacherEdited,
    };
  });
  const ws7 = XLSX.utils.json_to_sheet(draftData);
  XLSX.utils.book_append_sheet(wb, ws7, '세특 초안 및 확정본');

  // Export File
  const filename = `팩트체크수사대_${room.grade}학년_${room.classNumber}반_${room.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_데이터.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportFullClassExcel(
  room: Room,
  teams: Team[],
  students: Student[],
  evidenceList: EvidenceCard[],
  teacherReviews: TeacherReview[],
  peerReviews: PeerReview[],
  reflections: StudentReflection[],
  drafts: SchoolRecordDraft[]
) {
  exportClassroomExcel({
    room,
    students,
    teams,
    investigations: {},
    evidenceList,
    peerReviews,
    teacherReviews,
    reflections,
    observations: [],
    drafts,
  });
}

