export type DifficultyMode = 'quick' | 'standard' | 'deep_counter'; // 빠른 수사, 본격 수사, 반전 수사

export type StudentRole = 
  | 'team_leader' // 수사팀장(발표)
  | 'process_officer' // 수사 진행관(진행)
  | 'source_verifier' // 출처 검증관(검증)
  | 'record_officer' // 판정 기록관(기록)
  | 'source_tracker' // legacy fallback
  | 'evidence_analyst'
  | 'counter_investigator'
  | 'briefing_officer';

export interface RoleDefinition {
  id: StudentRole;
  title: string;
  badge: string;
  icon: string;
  description: string;
  missions: string[];
  color: string;
}

export type VerdictType = 
  | 'true' 
  | 'mostly_true' 
  | 'half_true' 
  | 'conditional' 
  | 'insufficient_evidence' 
  | 'mostly_false' 
  | 'false' 
  | 'needs_more_investigation';

export interface TopicItem {
  id: string;
  category: 'current' | 'school' | 'sns' | 'tech' | 'health' | 'env' | 'sports' | 'daily';
  categoryLabel: string;
  title: string;
  claim: string; // 의심스러운 주장
  background: string;
  difficulty: 'easy' | 'medium' | 'hard';
  keywords: string[];
  hintQuestions: string[];
  suggestedSources: string[];
  counterEvidenceClue: string;
  isTrending?: boolean;
  trendingBadge?: string;
  isKosisRecommended?: boolean;
  kosisTip?: {
    tableTitle: string;
    searchKeywords: string;
    description: string;
  };
  bigkindsTip?: {
    query: string;
    analysisPoint: string;
  };
}

export interface InterestSurveyAnswers {
  favoriteCategory: string;
  investigationStyle: string;
  desiredDifficulty: string;
  preferredSourceType: string;
  teamCuriosity: string;
}

export interface Room {
  id: string;
  roomCode: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  title: string;
  grade: number; // 중1 (1)
  classNumber: number;
  period: number; // 수업 차시
  teamCount: number;
  membersPerTeam: number;
  difficultyMode: DifficultyMode;
  allowedTopicIds?: string[];
  activeStep: number;
  status: 'active' | 'presenting' | 'reviewing' | 'closed';
  lockJoin?: boolean; // 교사가 학생 추가 입장을 잠글 수 있음
  navigationMode?: 'TEACHER_CONTROLLED' | 'FREE_EXPLORATION';
  peerReviewEnabled: boolean;
  teacherReviewEnabled: boolean;
  teacherWeight: number; // 기본 70
  peerWeight: number;    // 기본 30
  presentationState?: {
    active: boolean;
    teamId: string | null;
    slideIndex: number;
    allowStudentControl?: boolean;
    startedAt?: string;
  };
  createdAt: number;
  updatedAt: number;
}


export interface Student {
  id: string;
  roomId: string;
  grade: number;
  classNumber: number;
  studentNumber: number;
  name: string;
  teamId: string;
  role: StudentRole | null;
  joinedAt: number;
  lastActive: number;
  isReconnected?: boolean;
}

export interface Team {
  id: string;
  roomId: string;
  teamNumber: number;
  teamName: string;
  topicId: string;
  topicTitle: string;
  claim: string;
  assignedRoles: { [role in StudentRole]?: string }; // role -> studentId
  currentStep: number;
  progressPercent: number;
  evidenceCount: number;
  hasCounterEvidence: boolean;
  helpRequested: boolean;
  helpReason?: string;
  helpStatus?: 'pending' | 'resolved';
  teacherHint?: string;
  lastActive: number;
  factScore?: number;
  awardCategory?: string;
}

export interface InvestigationData {
  teamId: string;
  roomId: string;
  initialBelief: 'true' | 'false' | 'conditional' | 'unknown' | '';
  initialReason: string;
  investigationQuestions: string[];
  hypothesis: string;
  evidencePlan: {
    neededDataTypes: string[];
    targetSources: string[];
    searchKeywords: string[];
  };
  jointSynthesis: {
    commonFindings: string;
    conflictingFindings: string;
    reasonForConflict: string;
    conditionDifferences: string;
    unexpectedEvidence: string;
    missingContextExceptions: string;
    warrantScope: string; // 현재 확보한 증거로 어디까지 말할 수 있는가?
  };
  finalVerdict: VerdictType | '';
  decisiveEvidenceSummary: string;
  beliefChangeComparison: {
    initial: string;
    final: string;
    changedReason: string;
  };
  reportThesis: {
    researchTitle: string;
    limitations: string;
    futureQuestions: string;
  };
  peerReviewDeliberation: {
    action: 'maintain' | 'modify' | 'needs_more' | '';
    modifiedVerdict?: VerdictType | '';
    modificationReason: string;
  };
  updatedAt: number;
}

export interface EvidenceCard {
  id: string;
  teamId: string;
  roomId: string;
  authorStudentId?: string;
  authorName?: string;
  authorRole?: StudentRole;
  studentId?: string;
  studentName?: string;
  studentRole?: StudentRole;
  evidenceNumber: number;
  title: string;
  sourceType?: 'article' | 'research_paper' | 'gov_agency' | 'expert_interview' | 'statistic' | 'kosis_stat' | 'bigkinds_news' | 'other';
  publisher: string;
  author?: string;
  sourceUrl?: string;
  originalSourceUrl?: string;
  isOriginalSource: boolean;
  publishedDate?: string;
  publishDate?: string;
  keyContent: string;
  stance: 'supports' | 'refutes' | 'condition'; // 가설 지지 / 반박 / 조건 제시
  targetSubject?: string; // 조사 대상 (예: 10대 청소년 500명)
  researchMethod?: string; // 조사 방법 (예: 설문조사, 실험)
  keyMetrics?: string; // 중요한 수치나 통계
  limitations?: string; // 자료의 한계
  reliabilityReason?: string; // 믿을 만한 이유
  verificationChecklist?: {
    hasOriginalPublisher?: boolean;
    hasPrimaryData?: boolean;
    hasRecentDate?: boolean;
    crossCheckedWithOtherSource?: boolean;
  };
  imageUrl?: string;
  imageCaption?: string;
  createdAt?: number;
}


export interface HelpRequest {
  id: string;
  roomId: string;
  teamId: string;
  teamNumber: number;
  studentId: string;
  studentName: string;
  reason: string;
  status: 'pending' | 'resolved';
  teacherReply?: string;
  createdAt: number;
  resolvedAt?: number;
}

export interface PeerReview {
  id: string;
  roomId: string;
  fromTeamId: string;
  fromStudentId: string;
  fromStudentName: string;
  targetTeamId: string;
  scores: {
    appropriateSources: number; // 1-5
    crossVerification: number;  // 1-5
    counterEvidenceCheck: number; // 1-5
    evidenceBasedVerdict: number; // 1-5
    clarityAndUnderstanding: number; // 1-5
  };
  averageScore: number;
  peerQuestion: string;
  questionCategory: 'source' | 'evidence' | 'context' | 'judgment' | 'additional';
  compliment?: string;
  createdAt: number;
}

export interface TeacherReview {
  id: string;
  roomId: string;
  teamId: string;
  teacherId?: string;
  scores: {
    questionQuality?: number;      // 15점 만점
    evidenceQuality?: number;      // 20점 만점
    criticalCrossCheck?: number;   // 25점 만점
    evidenceVerdict?: number;      // 25점 만점
    reportAndBriefing?: number;    // 15점 만점
    appropriateSources?: number;
    crossVerification?: number;
    counterEvidenceCheck?: number;
    evidenceBasedVerdict?: number;
    clarityAndUnderstanding?: number;
    [key: string]: number | undefined;
  };
  totalScore: number; // 100점 만점
  feedback: string;
  award?: string;
  recommendedBadge?: string;
  createdAt: number;
}


export interface StudentReflection {
  id: string;
  roomId: string;
  studentId: string;
  studentName: string;
  studentNumber: number;
  teamId: string;
  teamNumber: number;
  role: StudentRole;
  bestActivity: string;
  keyEvidenceFound: string;
  beliefChangeLevel: 'much' | 'little' | 'none';
  beliefChangeReason: string;
  hardestPart: string;
  futureFactCheckHabit: string;
  selfRatings: {
    roleResponsibility: number; // 1-5
    activeInvestigation: number; // 1-5
    counterEvidenceOpenness: number; // 1-5
    teamCollaboration: number; // 1-5
    opinionFlexibility: number; // 1-5
  };
  newLearning: string;
  remainingQuestion: string;
  submittedAt: number;
}

export interface TeacherObservation {
  id: string;
  roomId: string;
  studentId: string;
  tags: string[]; // e.g. #출처추적, #교차검증, #비판적사고
  memo: string;
  competencyLevels: {
    sourceCheck: 'strength' | 'stable' | 'partial' | 'needs_guidance';
    crossCheck: 'strength' | 'stable' | 'partial' | 'needs_guidance';
    counterEvidence: 'strength' | 'stable' | 'partial' | 'needs_guidance';
    evidenceJudgment: 'strength' | 'stable' | 'partial' | 'needs_guidance';
    questionGen: 'strength' | 'stable' | 'partial' | 'needs_guidance';
    collaboration: 'strength' | 'stable' | 'partial' | 'needs_guidance';
    reflectionMod: 'strength' | 'stable' | 'partial' | 'needs_guidance';
  };
  updatedAt: number;
}

export interface SchoolRecordDraft {
  id: string;
  roomId: string;
  studentId: string;
  studentName: string;
  studentNumber: number;
  teamId?: string;
  teamNumber: number;
  role: StudentRole;
  topicTitle?: string;
  draftText?: string;
  aiDraft?: string;
  teacherEdited?: string;
  status?: 'not_generated' | 'draft' | 'editing' | 'confirmed';
  lengthOption?: 'short' | 'normal' | 'detailed';
  evaluatedCompetencies?: string[];
  byteCount?: number;
  isConfirmedByTeacher?: boolean;
  generatedAt?: number;
  confirmedAt?: number;
}


export interface StudentAnalyticsSummary {
  student: Student;
  team?: Team;
  investigation?: InvestigationData;
  evidenceList: EvidenceCard[];
  reflection?: StudentReflection;
  observation?: TeacherObservation;
  recordDraft?: SchoolRecordDraft;
  activityCompletionRate: number;
  hasAskedQuestion: boolean;
  helpRequestCount: number;
  factScore: number;
}
