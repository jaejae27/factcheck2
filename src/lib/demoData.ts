import { createRoom, updateTeam, saveInvestigation, addEvidenceCard, submitTeacherReview, submitPeerReview, submitStudentReflection, saveSchoolRecordDraft } from './db';
import { Room } from '../types';

export async function createInteractiveDemoRoom(): Promise<{ room: Room; teacherId: string }> {
  const teacherId = 'demo_teacher_' + Math.random().toString(36).substring(2, 6);
  const teacherName = '김수사';
  const teacherEmail = 'detective_teacher@school.kr';

  const { room } = await createRoom({
    teacherId,
    teacherName,
    teacherEmail,
    title: '중1 팩트체크 수사대 탐구 (공개 시연)',
    grade: 1,
    classNumber: 3,
    period: 2,
    teamCount: 4,
    membersPerTeam: 4,
    difficultyMode: 'standard',
    activeStep: 7,
    status: 'active',
    peerReviewEnabled: true,
    teacherReviewEnabled: true,
    teacherWeight: 70,
    peerWeight: 30,
  });

  const team1Id = `${room.id}_team_1`;
  const team2Id = `${room.id}_team_2`;
  const team3Id = `${room.id}_team_3`;
  const team4Id = `${room.id}_team_4`;

  // Seed Team 1: 아침밥과 성적
  await updateTeam(team1Id, {
    topicId: 'breakfast_grades',
    topicTitle: '아침밥을 먹으면 시험 성적이 오른다?',
    claim: '아침밥을 매일 먹는 학생은 그렇지 않은 학생보다 성적이 10점 이상 높다.',
    currentStep: 8,
    progressPercent: 70,
    evidenceCount: 3,
    hasCounterEvidence: true,
  });

  await saveInvestigation(team1Id, {
    initialBelief: 'true',
    initialReason: '부모님과 선생님이 늘 아침을 먹어야 머리가 잘 돌아간다고 하셨기 때문',
    investigationQuestions: [
      '아침식사 섭취율과 학업성취도의 통계적 상관관계는 실제로 얼마인가?',
      '단순히 밥을 먹어서 성적이 오른 것인가, 규칙적인 수면과 생활습관이 성적에 영향을 준 것인가?',
    ],
    hypothesis: '아침식사 섭취 자체보다는 규칙적인 생활습관과 영양 균형이 오전 집중도에 더 중요한 영향을 미칠 것이다.',
    jointSynthesis: {
      commonFindings: '질병관리청과 교육부 자료 모두에서 아침식사 학생의 평균 성적이 높게 나타남.',
      conflictingFindings: '혈당 급락 사례 및 수면 부족 시 인지능력 향상 효과 미미.',
      reasonForConflict: '일부 실험에서는 설탕 위주의 시리얼 섭취 시 오히려 급격한 혈당 저하로 집중력이 떨어짐.',
      conditionDifferences: '단순당 위주 식단과 균형잡힌 복합 탄수화물·단백질 식단의 차이, 수면시간 차이.',
      unexpectedEvidence: '단순한 칼로리 섭취가 아니라 단백질과 복합 탄수화물 비율이 집중력 지속의 핵심 조건임.',
      missingContextExceptions: '아침을 먹더라도 수면시간이 5시간 미만인 경우 집중력 향상 효과가 전혀 관찰되지 않음.',
      warrantScope: '균형 잡힌 아침식사는 오전 뇌 활동에 도움을 주지만, 10점 이상의 성적 향상은 생활습관 전반의 복합적 결과임.',
    },

    finalVerdict: 'conditional',
    decisiveEvidenceSummary: '질병관리청 청소년건강조사 통계 및 서울대 의대 연구 논문 종합 결과, 영양 구성과 충분한 수면이 결합되어야 유의미하므로 "조건에 따라 다름"으로 최종 판정함.',
    beliefChangeComparison: {
      initial: '사실',
      final: '조건에 따라 다름',
      changedReason: '처음에는 무조건 밥만 먹으면 성적이 오르는 줄 알았으나, 반대 연구와 수면시간 통제 변수를 보며 식사의 영양 구성과 생활 리듬이 진짜 원인임을 알게 됨.',
    },
  });

  // Add 3 sample evidence cards for Team 1
  await addEvidenceCard({
    roomId: room.id,
    teamId: team1Id,
    studentId: `${room.id}_s_1_3_1`,
    studentName: '이지우',
    studentRole: 'source_tracker',
    evidenceNumber: 1,
    title: '2023 청소년 건강행태조사 통계표',
    sourceUrl: 'https://knhanes.kdca.go.kr',
    publisher: '질병관리청',
    author: '질병관리청 만성질환관리국',
    publishedDate: '2023-11-15',
    isOriginalSource: true,
    stance: 'supports',
    keyContent: '전국 중·고등학생 5만 명 대상 조사 결과, 주 5일 이상 아침식사를 섭취하는 학생군의 평균 내신 상위 비율이 비섭취군 대비 14.8%p 높게 집계됨.',
    keyMetrics: '아침식사군 상위성적 비율 42.3% vs 결식군 27.5%',
    verificationChecklist: {
      hasOriginalPublisher: true,
      hasPrimaryData: true,
      hasRecentDate: true,
      crossCheckedWithOtherSource: true,
    },
  });

  await addEvidenceCard({
    roomId: room.id,
    teamId: team1Id,
    studentId: `${room.id}_s_1_3_2`,
    studentName: '박준서',
    studentRole: 'counter_investigator',
    evidenceNumber: 2,
    title: '혈당 스파이크와 청소년 인지능력 상관성 연구',
    sourceUrl: 'https://doi.org/10.1016/sample-pediatrics',
    publisher: '대한소아청소년과학회지',
    author: '김영희 외 연구팀',
    publishedDate: '2022-08-10',
    isOriginalSource: true,
    stance: 'refutes',
    keyContent: '단순당 위주의 아침식사(빵, 주스 등)를 한 집단은 식후 90분 시점에 급격한 인슐린 분비로 혈당이 급락하여 오히려 2~3교시 졸음과 집중력 저하가 발생함.',
    keyMetrics: '단순당 섭취군 2교시 집중도 테스트 점수 22% 감소',
    verificationChecklist: {
      hasOriginalPublisher: true,
      hasPrimaryData: true,
      hasRecentDate: true,
      crossCheckedWithOtherSource: true,
    },
  });

  // Seed Team 2: AI 탐지기
  await updateTeam(team2Id, {
    topicId: 'ai_detector_100',
    topicTitle: 'AI 글 탐지기는 생성형 AI 글을 100% 잡아낸다?',
    claim: '온라인 AI 판별기에 문장을 넣으면 생성형 AI가 쓴 글을 100% 정확하게 가려낼 수 있다.',
    currentStep: 6,
    progressPercent: 50,
    evidenceCount: 2,
  });

  // Seed Team 3: SNS와 우울증
  await updateTeam(team3Id, {
    topicId: 'sns_depression',
    topicTitle: 'SNS를 많이 할수록 청소년 우울증에 걸린다?',
    claim: 'SNS 하루 이용시간이 3시간 이상인 청소년은 우울증에 걸릴 확률이 2배 높아진다.',
    currentStep: 7,
    progressPercent: 60,
    evidenceCount: 2,
  });

  // Seed Team 4: 비타민C와 감기
  await updateTeam(team4Id, {
    topicId: 'vitaminc_cold',
    topicTitle: '비타민C를 매일 많이 먹으면 감기에 절대 안 걸린다?',
    claim: '비타민C를 매일 고용량으로 섭취하면 감기 바이러스 감염을 100% 예방할 수 있다.',
    currentStep: 5,
    progressPercent: 40,
    evidenceCount: 1,
  });

  // Add sample reflection
  await submitStudentReflection({
    roomId: room.id,
    studentId: `${room.id}_s_1_3_1`,
    studentName: '이지우',
    studentNumber: 1,
    teamId: team1Id,
    teamNumber: 1,
    role: 'source_tracker',
    bestActivity: '포털 뉴스 기사에 적힌 출처를 보고 질병관리청 원본 통계표 PDF를 직접 다운받아 확인한 점',
    keyEvidenceFound: '질병관리청 2023 청소년 건강행태조사 원문 통계표',
    beliefChangeLevel: 'much',
    beliefChangeReason: '처음에는 무조건 밥만 먹으면 성적이 오르는 줄 알았으나, 단순당 섭취 시 혈당 스파이크가 올 수 있다는 반대 논문을 보며 균형 잡힌 영양이 핵심임을 깨달음.',
    hardestPart: '학술 논문 초록의 의학 전문용어를 이해하는 과정이 조금 어려웠음',
    futureFactCheckHabit: '앞으로 유튜브나 숏폼에서 자극적인 건강 정보를 보면 1차 공인 학회나 정부 통계를 먼저 검색해 보겠다.',
    selfRatings: {
      roleResponsibility: 5,
      activeInvestigation: 5,
      counterEvidenceOpenness: 5,
      teamCollaboration: 4,
      opinionFlexibility: 5,
    },
    newLearning: '통계적 상관관계가 존재한다고 해서 그것이 바로 인과관계는 아니라는 점',
    remainingQuestion: '초등학생이나 고등학생을 대상으로 했을 때도 동일한 결과가 나타나는지 궁금함',
  });

  // Add sample School Record
  await saveSchoolRecordDraft({
    roomId: room.id,
    studentId: `${room.id}_s_1_3_1`,
    studentName: '이지우',
    studentNumber: 1,
    teamId: team1Id,
    teamNumber: 1,
    role: 'source_tracker',
    topicTitle: '아침밥과 학업성취도 상관성 팩트체크',
    draftText: '미디어 리터러시 팩트체크 수사대 프로젝트에서 출처추적관 역할을 맡아 ‘아침식사와 성적 상관관계’ 사건을 주도적으로 탐구함. 2차 언론 보도에 의존하지 않고 질병관리청 1차 통계 원본을 직접 추적하여 객관적 데이터를 확보하였으며, 단순당 섭취 시 발생하는 반대 증거(혈당 스파이크 연구)를 동료들과 교차 검증하여 ‘조건에 따라 다름’이라는 다각적 결론을 도출함. 자료의 공신력을 꼼꼼히 판별하고 상관관계와 인과관계를 구별하는 뛰어난 비판적 사고력과 정보 분석 역량을 보여줌.',
    evaluatedCompetencies: ['출처 추적 능력', '원문 데이터 판별력', '비판적 사고력', '협력적 탐구 태도'],
    byteCount: 382,
    isConfirmedByTeacher: true,
  });

  return { room, teacherId };
}
