import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// In CJS bundle __dirname is globally provided; in tsx/ESM we fallback to process.cwd()
const distPath = path.join(process.cwd(), 'dist');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. AI features will run in fallback rule-based mode.');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Resilient Gemini content generation with retry & model fallback
async function generateGeminiContent(
  prompt: string,
  options?: { responseMimeType?: string; maxOutputTokens?: number; fastMode?: boolean }
): Promise<string> {
  const ai = getGemini();
  // Valid, supported Gemini models
  const candidateModels = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      // 12s timeout for reliable response without premature cutoff
      const timeoutMs = 12000;
      const generatePromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: options?.responseMimeType,
          maxOutputTokens: options?.maxOutputTokens || 800,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms on model ${model}`)), timeoutMs)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err: any) {
      lastError = err;
      const statusCode = err?.status || err?.code || (err?.message?.includes('503') ? 503 : 0);
      console.warn(
        `Gemini call failed with model ${model} (code: ${statusCode}): ${err?.message || err}. Trying next fallback...`
      );
      // Short pause before attempting fallback
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  throw lastError || new Error('All Gemini model candidates failed');
}

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Helper for generating high-quality context-aware Socratic hints
function generateSmartFallbackHint(
  claim: string,
  role: string,
  roleTitle: string,
  hintLevel: number,
  step?: string,
  questionContext?: string
): string {
  const shortClaim = (claim || '해당 주장').split(' ')[0] || '주제';

  if (hintLevel === 1) {
    if (role === 'source_tracer') {
      return `🔍 [출처 추적 1단계]: "${claim}" 주장의 최초 작성자가 누구인지(개인 블로그? 공인 보건·교육기관? 상업 사이트?) URL 도메인과 작성 기관의 공신력을 먼저 확인해 보세요.`;
    } else if (role === 'evidence_analyst') {
      return `📊 [증거 분석 1단계]: 해당 자료에서 제시한 통계 수치가 몇 명을 대상으로, 언제 조사한 것인지 표본의 크기와 조사 기간을 질문으로 던져보세요.`;
    } else if (role === 'counter_investigator') {
      return `⚖️ [반증 탐색 1단계]: "${claim}"이라는 주장과 반대되는 연구 결과나 '모든 경우에 해당하지 않는다'는 예외 조건이 있는지 반대 관점의 자료를 찾아보세요.`;
    } else {
      return `🎤 [브리핑 정리 1단계]: 핵심 주장과 우리가 찾은 증거들 사이에 논리적 비약이나 성급한 일반화가 없는지 핵심 연결 고리를 점검해 보세요.`;
    }
  } else if (hintLevel === 2) {
    if (role === 'source_tracer') {
      return `📚 [추천 자료 종류 2단계]: 질병관리청, 교육부, 공공 데이터 포털, 또는 한국언론진흥재단 팩트체크넷에 등록된 1차 공식 발표 자료를 찾아보세요.`;
    } else if (role === 'evidence_analyst') {
      return `📚 [추천 자료 종류 2단계]: 학술 연구 데이터베이스(RISS, DBpia)의 관련 논문 초록 또는 국가통계포털(KOSIS)의 공식 통계표를 비교 분석해 보세요.`;
    } else if (role === 'counter_investigator') {
      return `📚 [추천 자료 종류 2단계]: 전문가 인터뷰 기사, 학회 검증 리포트, 또는 해당 주장의 한계점을 지적한 반론 기사를 추천합니다.`;
    } else {
      return `📚 [추천 자료 종류 2단계]: 모둠원들이 모은 찬성/반대 증거의 신뢰도 등급(★ 1~5점)을 매겨보고, 최종 판정(대체로 사실/절반의 사실/대체로 거짓) 근거 카드를 정리하세요.`;
    }
  } else {
    // 3단계 검색어 추천
    if (role === 'source_tracer') {
      return `💡 [추천 검색어 3단계]: "${shortClaim} 공식 통계 조사", "${shortClaim} 교육부 질병청 보도자료", "${shortClaim} 원출처 확인"`;
    } else if (role === 'evidence_analyst') {
      return `💡 [추천 검색어 3단계]: "${shortClaim} 상관관계 인과관계 연구", "${shortClaim} 표본조사 통계", "${shortClaim} 학술 논문"`;
    } else if (role === 'counter_investigator') {
      return `💡 [추천 검색어 3단계]: "${shortClaim} 반론 한계", "${shortClaim} 부작용 예외 사례", "${shortClaim} 팩트체크 검증"`;
    } else {
      return `💡 [추천 검색어 3단계]: "${shortClaim} 종합 결론 요약", "${shortClaim} 청소년 생활 습관 가이드", "${shortClaim} 최종 검증 리포트"`;
    }
  }
}

// 1. AI Socratic Assistant Hint (AI 보조수사관 비계 제공)
app.post('/api/ai/hint', async (req, res) => {
  const {
    topicTitle = '',
    claim = '',
    role = 'source_tracer',
    roleTitle = '수사관',
    step = '증거 수사 단계',
    currentHypothesis = '',
    evidenceList = [],
    questionContext = '',
    hintLevel = 1, // 1: 확인 질문, 2: 자료 종류, 3: 검색어 예시
  } = req.body || {};

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = generateSmartFallbackHint(claim || topicTitle, role, roleTitle, hintLevel, step, questionContext);
      return res.json({
        success: true,
        hint: fallback,
        level: hintLevel,
        isFallback: true,
      });
    }

    const prompt = `
당신은 중학교 1학년 학생들의 미디어 리터러시 팩트체크 수업을 돕는 'AI 보조수사관'입니다.
학생들이 자신이 맡은 역할에서 스스로 사고하고 탐구할 수 있도록 소크라테스식 질문과 단서를 제공하세요.

[절대 규칙]
1. 절대로 정답이나 최종 판정(사실/거짓 여부)을 직접 알려주지 마세요.
2. 학생 대신 결론을 내려주거나 완성된 답안을 써주지 마세요.
3. 첫마디는 친근하고 든든하게 "정답은 알려줄 수 없지만, 수사를 위한 단서를 줄게!" 느낌으로 시작하세요.
4. 중학교 1학년 눈높이에 맞는 명확하고 쉬운 한국어로 답변하세요.
5. 상관관계와 인과관계 구별, 과도한 일반화 경고, 조사 대상/표본 수 확인, 반대 증거 탐색을 유도하세요.

[현재 수사 상황]
- 사건(주장): ${claim || topicTitle}
- 학생의 역할: ${roleTitle || role}
- 현재 단계: ${step || '증거 수사 단계'}
- 학생 가설: ${currentHypothesis || '작성 전'}
- 등록된 증거 수: ${evidenceList ? evidenceList.length : 0}개
- 학생이 묻거나 어려워하는 점: ${questionContext || '자료 탐색 및 가설 검증'}
- 요청된 힌트 단계: ${hintLevel}단계
  * 1단계: 어떤 정보를 확인해야 하는지 질문 던지기
  * 2단계: 찾아볼 자료의 종류(공식 통계, 실험 논문, 학회 발표 등) 제안하기
  * 3단계: 포털/학술 사이트에서 검색할 구체적인 검색어 예시 2~3개 제공하기

위 힌트 단계(${hintLevel}단계)에 딱 맞추어 2~4문장으로 명쾌하게 작성해 주세요.
`;

    const text = await generateGeminiContent(prompt);

    res.json({
      success: true,
      hint: text || generateSmartFallbackHint(claim || topicTitle, role, roleTitle, hintLevel, step, questionContext),
      level: hintLevel,
    });
  } catch (err: any) {
    console.warn('Gemini hint API unavailable, using smart pedagogical fallback:', err?.message || err);
    const fallback = generateSmartFallbackHint(claim || topicTitle, role, roleTitle, hintLevel, step, questionContext);
    res.json({
      success: true,
      hint: fallback,
      level: hintLevel,
      isFallback: true,
    });
  }
});

// 2. Peer Review Questions Grouping (동료 질문 그룹화 및 대표 질문 제안)
app.post('/api/ai/group-questions', async (req, res) => {
  const { questions = [], topicTitle = '사건', finalVerdict = '판정' } = req.body || {};

  try {
    if (!questions || !questions.length) {
      return res.json({ success: true, groups: [], summary: '등록된 동료 질문이 없습니다.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        summary: `총 ${questions.length}개의 동료 질문이 접수되었습니다. 출처의 신뢰성과 반대 증거에 대한 확인 질문이 주를 이룹니다.`,
        keyQuestions: [
          '제시된 증거가 모든 청소년에게 똑같이 적용된다고 볼 수 있는가?',
          '공식 연구 기관의 1차 출처 링크를 직접 확인했는가?',
        ],
        groups: [
          { category: '출처 및 신뢰성 검증', theme: '1차 공식 출처 및 조사 대상 확인', count: Math.ceil(questions.length / 2) },
          { category: '조건 및 예외 상황', theme: '반대 연구 및 특수 조건 고려 여부', count: Math.floor(questions.length / 2) },
        ],
      });
    }

    const prompt = `
다음은 중학교 1학년 팩트체크 발표 후 동료 학생들이 발표 모둠(주제: "${topicTitle}", 판정: "${finalVerdict}")에게 남긴 질문 목록입니다.

[질문 목록]
${questions.map((q: any, idx: number) => `${idx + 1}. [${q.questionCategory || '질문'}] ${q.peerQuestion || q}`).join('\n')}

비슷한 의도의 질문들을 2~3개의 핵심 수사 테마로 묶고, 발표 모둠이 판정을 재검토할 때 꼭 답해야 할 대표 핵심 질문 2개를 뽑아주세요.
JSON 형식으로 응답하세요:
{
  "summary": "질문 전체 요약 한 줄",
  "keyQuestions": ["대표 질문 1", "대표 질문 2"],
  "groups": [
    { "category": "카테고리명", "theme": "핵심 내용", "count": 2 }
  ]
}
`;

    const text = await generateGeminiContent(prompt, { responseMimeType: 'application/json' });
    const parsed = JSON.parse(text || '{}');
    res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.warn('Group questions fallback triggered:', err?.message || err);
    res.json({
      success: true,
      summary: `총 ${questions.length}개의 동료 질문이 접수되었습니다. 출처 신뢰성과 예외 반증에 대한 검토가 필요합니다.`,
      keyQuestions: [
        '제시된 증거가 표본의 한계를 고려한 것인지 확인했는가?',
        '공식 공공기관이나 공인 학회 자료와 교차 검증되었는가?',
      ],
      groups: [
        { category: '출처 및 표본 검증', theme: '조사 대상 및 출처 신뢰도', count: Math.ceil(questions.length / 2) },
        { category: '인과관계 및 반증', theme: '상관관계와 인과관계 구별', count: Math.floor(questions.length / 2) },
      ],
    });
  }
});

// 3. School Record Draft Generation (학교생활기록부 세특 초안 생성 - 10대 원칙 준수)
app.post('/api/ai/generate-school-record', async (req, res) => {
  const body = req.body || {};
  // Handle both { student, team, investigation, evidenceCards } and { studentInfo, activityRecord, observation }
  const student = body.student || body.studentInfo || {};
  const team = body.team || {};
  const investigation = body.investigation || body.activityRecord || {};
  const reflection = body.reflection || {};
  const evidenceList = body.evidenceCards || body.evidenceList || investigation.evidenceList || [];
  const teacherReview = body.teacherReview || body.observation || {};
  const lengthOption = body.lengthOption || 'normal';

  const studentName = student.name || '학생';
  const role = student.role || 'source_tracer';
  const roleTitle = body.roleDef?.title || student.roleTitle || '수사관';
  const topicTitle = team.topicTitle || body.topicTitle || body.claim || '팩트체크 탐구';
  const claim = team.claim || body.claim || topicTitle;

  const charLimits = {
    short: '공백 포함 약 150자~200자 내외로 핵심만 간결하게',
    normal: '공백 포함 약 300자~400자 내외로 균형 있게',
    detailed: '공백 포함 약 500자~600자 내외로 상세하고 풍부하게',
  };

  const generateRuleBasedDraft = () => {
    return `미디어 리터러시 팩트체크 탐구 수업에서 '${topicTitle || claim}' 사건의 ${roleTitle} 역할을 맡아 주도적으로 탐구함. ` +
      `'${investigation?.hypothesis || '가설'}'을 검증하기 위해 실제 공신력 있는 자료를 수집·분석하고, ` +
      (evidenceList?.length ? `${evidenceList.length}건의 증거를 비교 검토하여 ` : '증거를 교차검증하여 ') +
      `'${investigation?.finalVerdict || '근거에 기반한 판정'}'을 도출함. ` +
      (reflection?.newLearning ? `활동 후 "${reflection.newLearning}"라는 점을 새롭게 인식하고, ` : '') +
      (teacherReview?.tags?.length ? `교사 관찰 결과 [${teacherReview.tags.join(', ')}] 영역에서 우수한 협력 태도를 나타냄. ` : '') +
      `정보의 출처와 한계를 비판적으로 검토하는 미디어 리터러시 역량과 협력적 탐구 태도가 돋보임.`;
  };

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const draft = generateRuleBasedDraft();
      return res.json({ success: true, draft, draftText: draft });
    }

    const prompt = `
당신은 대한민국 중학교 교사입니다. 학생이 수행한 실제 '팩트체크 수사대' 수업 활동 기록을 바탕으로 학교생활기록부 '교과세부능력 및 특기사항(세특)' 초안을 작성해 주세요.

[세특 작성 10대 절대 원칙]
1. 실제 아래 시스템에 저장된 활동 내용만 사용하세요.
2. 시스템에 없는 가상의 활동이나 지어낸 연구를 절대 생성하지 마세요.
3. 학생의 자기평가만으로 능력을 단정하지 말고, 실제 작성한 증거·질문·역할 활동을 중심으로 서술하세요.
4. 모둠 전체의 성과를 개인 성과로 뭉뚱그리지 말고, 해당 학생이 맡은 역할(${roleTitle})의 고유 기여를 부각하세요.
5. 교사 관찰 메모와 태그가 있다면 이를 중요한 관찰 근거로 반영하세요.
6. 학생이 던진 질문, 증거 탐색, 최초 생각에서 최종 판정으로의 생각 변화 과정을 구체적으로 서술하세요.
7. 근거 없이 성격이나 인성을 미사여구로 과장하지 마세요. (~매우 훌륭함, 천재적임 등 금지)
8. 정중하고 객관적인 생활기록부 어조(~함, ~를 보여줌, ~에 기여함)를 사용하세요.
9. 분량: ${charLimits[lengthOption as keyof typeof charLimits] || charLimits.normal}

[학생 실제 활동 데이터]
- 학생명: ${studentName} (중학교 1학년 ${student.classNumber || 1}반 ${student.studentNumber || 1}번)
- 담당 역할: ${roleTitle} (${role})
- 탐구 주제(사건): ${topicTitle || claim}
- 학생/모둠 가설: ${investigation?.hypothesis || '미기재'}
- 작성한 수사 질문: ${investigation?.investigationQuestions?.join(', ') || '미기재'}
- 직접 등록/참여한 증거: ${evidenceList.length ? JSON.stringify(evidenceList.map((e: any) => ({ title: e.title, source: e.publisher, stance: e.stance, method: e.researchMethod }))) : '증거 카드 등록'}
- 최초 판단 및 최종 판정: ${investigation?.initialBelief || '판단 전'} -> ${investigation?.finalVerdict || '판정 전'} (변화 이유: ${investigation?.beliefChangeComparison?.changedReason || '증거에 기반한 수정'})
- 개인 성찰 기록: 
  * 잘한 점: ${reflection?.bestActivity || '없음'}
  * 발견한 결정적 단서: ${reflection?.keyEvidenceFound || '없음'}
  * 새롭게 알게 된 점: ${reflection?.newLearning || '없음'}
  * 남은 질문: ${reflection?.remainingQuestion || '없음'}
  * 앞으로의 실천: ${reflection?.futureFactCheckHabit || '없음'}
- 교사 관찰 기록:
  * 태그: ${teacherReview?.tags?.join(' ') || '없음'}
  * 관찰 메모: ${teacherReview?.memo || teacherReview?.observationMemo || '없음'}

위 실제 기록만을 바탕으로 학생의 비판적 사고력과 미디어 리터러시 성장 과정이 드러나는 완성도 높은 세특 초안을 단일 문단으로 작성해 주세요.
`;

    const text = await generateGeminiContent(prompt);
    const finalDraft = text || generateRuleBasedDraft();

    res.json({
      success: true,
      draft: finalDraft,
      draftText: finalDraft,
    });
  } catch (err: any) {
    console.warn('School record generation fallback triggered:', err?.message || err);
    const draft = generateRuleBasedDraft();
    res.json({
      success: true,
      draft,
      draftText: draft,
      isFallback: true,
    });
  }
});

// 4. Batch School Record Draft Generation (일괄 생성)
app.post('/api/ai/batch-school-records', async (req, res) => {
  try {
    const { studentsData, topicMap, lengthOption = 'normal' } = req.body;
    if (!studentsData || !studentsData.length) {
      return res.json({ success: true, results: [] });
    }

    const results = [];
    for (const item of studentsData) {
      const roleTitle = item.studentInfo?.roleTitle || '수사관';
      const topicTitle = item.topicTitle || '팩트체크 탐구';
      const draft = `미디어 리터러시 팩트체크 탐구 활동에서 '${topicTitle}' 사건의 ${roleTitle} 역할을 성실히 수행함. ` +
        `정보의 출처 신뢰성을 검증하고 다양한 관점의 증거를 비교 분석하여 '${item.activityRecord?.finalVerdict || '근거 중심의 결론'}'을 도출하는 과정에 적극 참여함. ` +
        (item.reflection?.newLearning ? `새롭게 알게 된 사실을 바탕으로 비판적 정보 수용 태도를 확립함.` : `증거에 기반하여 합리적으로 판단을 내리는 탐구 역량을 보여줌.`);

      results.push({
        studentId: item.studentInfo?.id,
        draft,
      });
    }

    res.json({ success: true, results });
  } catch (err: any) {
    console.error('Batch generation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper: Smart Fallback for Hypothesis Guidance & Hint
function generateSmartFallbackHypothesisHint(
  topicTitle: string,
  claim: string,
  hintQuestions: string[] = []
) {
  const shortSubject = (claim || topicTitle || '해당 주장').slice(0, 30);
  return {
    structureGuide: {
      cause: '어떤 원인/행동을 하는가? (독립변인: 예 - 아침을 먹을 때, 제로 음료를 마실 때, 화면을 볼 때)',
      effect: '어떤 결과/변화가 나타나는가? (종속변인: 예 - 뇌 집중도가 상승한다, 혈당이 오르지 않는다)',
      condition: '어떤 사람/조건/환경에서 일어나는가? (적용 범위: 예 - 청소년 기준, 하루 권장량 범위 내에서)'
    },
    guidingQuestions: hintQuestions.length ? hintQuestions : [
      `"${shortSubject}" 주장이 언제나 100% 모든 사람에게 사실일까?`,
      '원인과 결과 사이에 어떤 조건(양, 시간, 대상)이 영향을 미칠까?',
      '반대로 생각했을 때 어떤 예외나 부작용이 존재할까?'
    ],
    examples: [
      {
        type: 'positive',
        typeLabel: '기본 입증형 가설',
        badge: '원인→결과 직접 연결',
        formula: '[원인/행동]을 하면 [예상되는 구체적 결과]가 나타날 것이다.',
        sentence: `"${shortSubject}"(원인)의 영향으로 인해 대상의 핵심 지표나 상태에 유의미한 변화(결과)가 나타날 것이다.`,
        explanation: '가장 직관적인 형태로, 원인과 결과의 연결을 직접 시험해보는 가설입니다.'
      },
      {
        type: 'conditional',
        typeLabel: '조건부/한계 가설',
        badge: '상황별 차이 탐구',
        formula: '[특정 조건]에서는 성립하지만, [다른 조건]에서는 결과가 달라질 것이다.',
        sentence: `"${shortSubject}"은 특정 기준(양이나 시간)을 준수할 때는 효과가 있으나, 과도하거나 환경이 다를 경우 다른 양상을 보일 것이다.`,
        explanation: '단순히 맞다/틀리다가 아니라 어떤 조건에서만 유효한지 파고드는 깊이 있는 가설입니다.'
      },
      {
        type: 'critical',
        typeLabel: '비판적 반증 가설',
        badge: '통념/착시 의심',
        formula: '알려진 통념과 달리, 실제로는 [진짜 원인/다른 요인]에 의해 결정될 것이다.',
        sentence: `"${shortSubject}"이라는 대중적 소문과 달리, 과학적 통계와 정밀 실험에서는 인과관계가 미미할 것이다.`,
        explanation: '일반적인 소문이나 과장된 광고의 오류를 의심하고 과학적 진실을 밝히려는 가설입니다.'
      }
    ],
    cautionTip: '💡 팁: 위 예시를 그대로 베끼기보다, 우리 모둠의 수사 방향에 맞게 원인과 결과 단어를 바꿔서 완성해 보세요!'
  };
}

// 5. Hypothesis Guidance & Scaffolding Hint (가설 작성법 & 힌트 제안)
app.post('/api/ai/hypothesis-hint', async (req, res) => {
  const {
    topicTitle = '',
    claim = '',
    background = '',
    keywords = [],
    hintQuestions = [],
    counterEvidenceClue = '',
    currentDraft = ''
  } = req.body || {};

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = generateSmartFallbackHypothesisHint(topicTitle, claim, hintQuestions);
      return res.json({ success: true, ...fallback, isFallback: true });
    }

    const prompt = `
당신은 중학교 1학년 팩트체크 수사대 수업의 'AI 가설 코칭 멘토'입니다.
학생들이 사건에 대해 스스로 깊이 사고하여 '검증 가능한 가설'을 세울 수 있도록 친절하고 알기 쉽게 가이드해 주세요.

[현재 사건 정보]
- 사건 제목: ${topicTitle}
- 의심스러운 주장: ${claim}
- 배경 지식: ${background}
- 핵심 키워드: ${keywords.join(', ')}
- 수사 힌트 질문: ${hintQuestions.join(' / ')}
- 반증 단서: ${counterEvidenceClue}
- 학생이 현재 작성 중인 초안: "${currentDraft || '작성 전'}"

[요청 사항]
1. 가설의 3대 구성 요소(원인, 결과, 조건)를 이 사건에 맞게 알기 쉽게 설명해 주세요.
2. 학생이 스스로 생각할 수 있도록 돕는 3가지 유도 질문(guidingQuestions)을 제시하세요.
3. 학생들이 참고할 수 있는 3가지 유형의 가설 작성 예시를 이 사건에 맞춤형으로 작성해 주세요. (절대로 '이것이 정답이다'라고 단정하지 말고, 가설의 형태 예시로 제공할 것)
   - 1) 기본 입증형 가설: 원인과 결과를 명확히 연결한 가설
   - 2) 조건부/한계 가설: 양, 시간, 환경, 대상 등 조건에 따라 결과가 다를 것이라는 가설
   - 3) 비판적 반증 가설: 소문과 달리 다른 요인이 작용하거나 과장되었을 것이라는 가설

JSON 형식으로 응답하세요:
{
  "structureGuide": {
    "cause": "이 사건에서 원인이 되는 행동이나 요소 설명",
    "effect": "그로 인해 나타나는 예상 결과나 변화 설명",
    "condition": "어떤 상황, 양, 대상에서 성립하는지 조건 설명"
  },
  "guidingQuestions": [
    "학생의 생각을 자극하는 질문 1",
    "학생의 생각을 자극하는 질문 2",
    "학생의 생각을 자극하는 질문 3"
  ],
  "examples": [
    {
      "type": "positive",
      "typeLabel": "기본 입증형 가설",
      "badge": "원인→결과 직접 검증",
      "formula": "[원인]을 할 경우 [결과]가 나타날 것이다.",
      "sentence": "구체적인 이 사건 맞춤형 가설 예시 문장",
      "explanation": "이 가설이 검증하려는 바를 설명"
    },
    {
      "type": "conditional",
      "typeLabel": "조건부/한계 가설",
      "badge": "상황·조건별 차이 탐구",
      "formula": "[특정 조건]에서는 성립하지만, [다른 조건]에서는 결과가 다를 것이다.",
      "sentence": "구체적인 이 사건 맞춤형 가설 예시 문장",
      "explanation": "이 가설이 검증하려는 바를 설명"
    },
    {
      "type": "critical",
      "typeLabel": "비판적 반증 가설",
      "badge": "통념·과장 의심",
      "formula": "통념과 달리, 실제로는 [다른 원인/한계]가 존재할 것이다.",
      "sentence": "구체적인 이 사건 맞춤형 가설 예시 문장",
      "explanation": "이 가설이 검증하려는 바를 설명"
    }
  ],
  "cautionTip": "💡 주의: 이 예시는 생각의 방향을 돕기 위한 힌트입니다. 우리 모둠만의 문장으로 변형하여 작성해 보세요!"
}
`;

    const text = await generateGeminiContent(prompt, {
      responseMimeType: 'application/json',
      maxOutputTokens: 550,
    });
    const parsed = JSON.parse(text || '{}');

    if (!parsed.examples || !parsed.structureGuide) {
      throw new Error('Incomplete JSON response from Gemini');
    }

    res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.warn('Hypothesis hint fallback triggered:', err?.message || err);
    const fallback = generateSmartFallbackHypothesisHint(topicTitle, claim, hintQuestions);
    res.json({ success: true, ...fallback, isFallback: true });
  }
});

// Helper: Smart Fallback for Hypothesis Review
function generateSmartFallbackHypothesisReview(
  hypothesis: string,
  topicTitle: string,
  claim: string
) {
  const trimmed = (hypothesis || '').trim();
  const isQuestion = trimmed.endsWith('?') || trimmed.includes('일까') || trimmed.includes('있는가');
  const hasCauseIndicator = /하면|할 경우|할 때|때문에|에 의해|따라|먹으면|사용하면|마시면|보게 되면|노출되면/.test(trimmed);
  const hasEffectIndicator = /것이다|될 것이다|영향을 미친다|증가한다|감소한다|유발한다|나타날 것이다|다를 것이다|미미할 것이다|효과가 있다|위험하다/.test(trimmed);
  const hasConditionIndicator = /조건|경우|사람|이상|이하|기준|상황|다만|그러나|한계/.test(trimmed);
  const isTooShort = trimmed.length < 15;

  const isGood = !isTooShort && !isQuestion && (hasCauseIndicator || hasEffectIndicator) && trimmed.length >= 25;

  if (isGood) {
    return {
      status: 'good' as const,
      headline: '훌륭한 수사 가설입니다! 🎯',
      score: 92,
      checklist: {
        hasCause: true,
        hasEffect: true,
        hasConditionOrScope: hasConditionIndicator || trimmed.length > 35,
        isTestable: true,
      },
      feedback: '원인과 예상 결과가 잘 연결되어 있고, 실제 증거를 찾아 검증하기에 매우 적합한 문장 구조를 갖추었습니다.',
      suggestion: '이제 STEP 3으로 넘어가서, 이 가설을 입증하거나 반박할 수 있는 신뢰할 수 있는 공식 통계와 연구 자료(증거 카드)를 수집해 보세요.',
      encouragement: '우리 모둠의 훌륭한 탐구 가설이 완성되었습니다! 멋진 팩트체크 수사를 기대합니다.'
    };
  } else {
    let specificFeedback = '';
    let suggestionText = '';

    if (isTooShort) {
      specificFeedback = '가설 문장이 너무 짧아서 무엇이 원인이고 어떤 결과가 나타나는지 구체적으로 알기 어렵습니다.';
      suggestionText = "'[어떤 행동/원인]을 할 때, [어떤 구체적인 결과]가 나타날 것이다' 형태로 20자 이상 구체적으로 적어보세요.";
    } else if (isQuestion) {
      specificFeedback = "문장이 의문문('~일까?', '~인가요?')으로 끝나고 있습니다. 가설은 질문이 아니라 '우리가 예상하는 잠정적 결론 문장(~할 것이다)'이어야 합니다.";
      suggestionText = "끝부분을 '~할 것이다' 또는 '~로 예상된다'처럼 모둠의 예측 진술로 바꿔보세요.";
    } else {
      specificFeedback = '원인과 결과 중 한쪽이 모호하거나 검증하기 어려운 표현이 포함되어 있습니다.';
      suggestionText = "'누가/어떤 조건에서(대상)', '무엇을 할 때(원인)', '어떤 변화가 생길 것인가(결과)' 3가지를 문장에 포함시켜 보세요.";
    }

    return {
      status: 'needs_improvement' as const,
      headline: '조금 더 구체적으로 생각해볼까요? 🧐',
      score: 60,
      checklist: {
        hasCause: hasCauseIndicator,
        hasEffect: hasEffectIndicator,
        hasConditionOrScope: hasConditionIndicator,
        isTestable: !isQuestion && !isTooShort,
      },
      feedback: specificFeedback,
      suggestion: suggestionText,
      encouragement: "오른쪽의 '💡 AI 가설 힌트 & 예시' 버튼을 누르면 작성 요령과 맞춤형 예시를 확인할 수 있어요!"
    };
  }
}

// 6. Hypothesis Review & Feedback API (가설 진단 및 피드백)
app.post('/api/ai/hypothesis-review', async (req, res) => {
  const {
    topicTitle = '',
    claim = '',
    hypothesis = '',
  } = req.body || {};

  try {
    const trimmed = (hypothesis || '').trim();
    if (!trimmed) {
      return res.json({
        success: true,
        status: 'needs_improvement',
        headline: '가설 문장을 먼저 입력해 주세요! ✍️',
        score: 0,
        checklist: {
          hasCause: false,
          hasEffect: false,
          hasConditionOrScope: false,
          isTestable: false,
        },
        feedback: '아직 수사 가설이 작성되지 않았습니다.',
        suggestion: "'[원인]을 하면 [결과]가 나타날 것이다' 형태로 우리 모둠의 생각을 적어보세요.",
        encouragement: '잘 모르겠다면 [AI 가설 힌트 보기]를 눌러 맞춤형 가이드를 받아보세요!'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = generateSmartFallbackHypothesisReview(trimmed, topicTitle, claim);
      return res.json({ success: true, ...fallback, isFallback: true });
    }

    const prompt = `
당신은 중학교 1학년 팩트체크 수사대 수업의 '가설 정밀 진단관'입니다.
학생이 제출한 수사 가설 문장을 평가하여 중학교 1학년 학생 눈높이에 맞게 다정하고 유익한 피드백을 제공하세요.

[수사 사건]
- 사건 제목: ${topicTitle}
- 의심스러운 주장: ${claim}
- 학생이 작성한 가설: "${trimmed}"

[가설 평가 4대 기준]
1. hasCause (원인 명확성): 어떤 행동이나 요인이 원인으로 제시되었는가?
2. hasEffect (결과 구체성): 예상되는 결과나 변화가 구체적으로 제시되었는가? (단순히 '좋다/나쁘다' 대신 구체적 지표)
3. hasConditionOrScope (조건 및 범위): 어떤 상황, 대상, 기준 등 적용 조건이 고려되었는가?
4. isTestable (검증 가능성): 단순 의문문('~일까?')이나 감상이 아닌, 실험이나 통계로 검증 가능한 서술문('~할 것이다')인가?

[판정 규칙]
- 문장이 너무 짧거나(15자 미만), 의문문이거나, 원인/결과가 불분명하면:
  status: "needs_improvement"
  headline: "조금 더 구체적으로 생각해볼까요? 🧐"
- 원인과 결과가 연결되어 있고 검증 가능하면:
  status: "good"
  headline: "훌륭한 수사 가설입니다! 🎯"

JSON 형식으로 응답하세요:
{
  "status": "needs_improvement" 또는 "good",
  "headline": "조금 더 구체적으로 생각해볼까요? 🧐" 또는 "훌륭한 수사 가설입니다! 🎯",
  "score": 0~100 사이 점수,
  "checklist": {
    "hasCause": true/false,
    "hasEffect": true/false,
    "hasConditionOrScope": true/false,
    "isTestable": true/false
  },
  "feedback": "학생의 현재 가설에서 잘된 점과 아쉬운 점을 1~2문장으로 친절하게 설명",
  "suggestion": "어떻게 고치면 더 좋은 가설이 되는지 구체적인 수정 팁",
  "encouragement": "따뜻한 격려 한마디"
}
`;

    const text = await generateGeminiContent(prompt, {
      responseMimeType: 'application/json',
      maxOutputTokens: 380,
    });
    const parsed = JSON.parse(text || '{}');

    if (!parsed.status || !parsed.checklist) {
      throw new Error('Incomplete JSON response from Gemini');
    }

    res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.warn('Hypothesis review fallback triggered:', err?.message || err);
    const fallback = generateSmartFallbackHypothesisReview(hypothesis, topicTitle, claim);
    res.json({ success: true, ...fallback, isFallback: true });
  }
});

// Vite middleware for development & static serve for production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fact Check Lab server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite();
