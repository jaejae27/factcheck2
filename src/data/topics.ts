import { TopicItem } from '../types';

export const FACT_CHECK_TOPICS: TopicItem[] = [
  // =========================================================================
  // 1. KOSIS(국가통계포털) & 빅카인즈(뉴스데이터) 강력 추천 학생 친화 사건들
  // =========================================================================
  {
    id: 'kosis-school-1',
    category: 'school',
    categoryLabel: '🏫 학교생활·통계',
    isTrending: true,
    trendingBadge: '📊 KOSIS·빅카인즈 추천',
    isKosisRecommended: true,
    title: '아침밥을 매일 챙겨 먹는 학생이 안 먹는 학생보다 시험 성적이 10점 이상 높을까?',
    claim: '아침밥을 매일 먹는 청소년은 뇌 활성화로 인해 아침을 거르는 청소년보다 학업 성취도(평균 성적)가 유의미하게 10점 이상 높다.',
    background: '아침식사의 뇌 활성화 효과를 강조하는 뉴스가 많지만, 아침밥을 규칙적으로 챙겨 먹는 학생들의 수면 시간, 가정 생활 습관 등 복합 요인이 작용했을 가능성을 팩트체크합니다.',
    difficulty: 'easy',
    keywords: ['아침식사 결식률', '질병관리청 청소년건강행태조사', '학업성취도 상관관계', '수면시간', '생활습관'],
    hintQuestions: [
      'KOSIS에서 [청소년건강행태조사 - 아침식사 결식률] 통계를 보면 우리나라 중학생의 몇 %가 아침을 거를까?',
      '빅카인즈에서 "아침밥 성적"을 검색했을 때, 단순한 음식 섭취 효과 외에 수면이나 규칙적인 생활 습관이 언급되어 있을까?'
    ],
    suggestedSources: [
      'KOSIS 국가통계포털 (질병관리청 청소년건강행태조사)',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)',
      '한국청소년정책연구원 아동·청소년 건강 및 생활 실태 보고서'
    ],
    counterEvidenceClue: '아침밥 섭취 자체뿐 아니라 규칙적인 수면 시간, 부모님의 관심도, 자기주도 학습 습관이 성적에 더 큰 영향을 미친다는 통계적 반증 분석 존재',
    kosisTip: {
      tableTitle: '질병관리청 『청소년건강행태조사 - 아침식사 결식률 통계』',
      searchKeywords: '청소년건강행태조사 아침식사 결식률',
      description: 'KOSIS(kosis.kr) 검색창에 "청소년건강행태조사"를 검색한 후 [식생활 > 아침식사 결식률] 통계표를 열어 성별·학년별 결식률 추이를 확인하세요.'
    },
    bigkindsTip: {
      query: '아침밥 AND (성적 OR 학업성취도)',
      analysisPoint: '빅카인즈(bigkinds.or.kr)에서 기사를 검색하여 아침식사와 성적 간의 상관관계 보도 및 전문가 반론을 확인하세요.'
    }
  },
  {
    id: 'kosis-sns-1',
    category: 'sns',
    categoryLabel: '📱 SNS·미디어',
    isTrending: true,
    trendingBadge: '📊 KOSIS·빅카인즈 추천',
    isKosisRecommended: true,
    title: '우리나라 청소년의 80% 이상이 스마트폰 중독 상태여서 일상생활이 불가능할까?',
    claim: '스마트폰 보급으로 인해 대한민국 중·고등학생 10명 중 8명(80%)이 치료가 시급한 심각한 스마트폰 과의존 중독 상태이다.',
    background: '자극적인 유튜브와 일부 미디어에서 청소년 스마트폰 중독이 통제 불능 상태라고 보도하지만, 과학기술정보통신부의 공식 전수조사 통계를 확인해 봅니다.',
    difficulty: 'easy',
    keywords: ['스마트폰 과의존 실태조사', '과학기술정보통신부', '한국지능정보사회진흥원(NIA)', '잠재적 위험군', '고위험군'],
    hintQuestions: [
      'KOSIS에서 [스마트폰 과의존 실태조사]를 열었을 때, 청소년(만 10~19세)의 실제 과의존 위험군 비율은 약 몇 %일까?',
      '빅카인즈에서 "청소년 스마트폰 과의존" 기사를 검색하여 고위험군(치료 필요)과 일반 사용자 구분을 확인해 보세요.'
    ],
    suggestedSources: [
      'KOSIS 국가통계포털 (과학기술정보통신부·NIA 스마트폰 과의존 실태조사)',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)',
      '여성가족부 청소년 매체이용 및 유해환경 실태조사'
    ],
    counterEvidenceClue: '공식 통계상 청소년 스마트폰 과의존 위험군(잠재적+고위험군) 비율은 약 40% 수준이며, 치료가 필요한 고위험군은 약 5~6%로 80%라는 수치는 과장된 통계 착시임',
    kosisTip: {
      tableTitle: '과학기술정보통신부 『스마트폰 과의존 실태조사 - 연령대별 과의존 위험군 비율』',
      searchKeywords: '스마트폰 과의존 실태조사 청소년',
      description: 'KOSIS에서 "스마트폰 과의존"을 검색하여 연령별(유아동, 청소년, 성인) 위험군 비율 추이를 확인하세요.'
    },
    bigkindsTip: {
      query: '청소년 AND 스마트폰 AND (과의존 OR 중독)',
      analysisPoint: '빅카인즈에서 최근 3년간 보도량 추이와 주요 키워드(관계도 분석)를 확인하세요.'
    }
  },
  {
    id: 'kosis-health-1',
    category: 'health',
    categoryLabel: '🍔 음식·건강',
    isTrending: true,
    trendingBadge: '🔥 핫이슈 & 통계',
    isKosisRecommended: true,
    title: '시험 기간에 고카페인 에너지음료를 마시면 피로가 사라지고 밤샘 공부에 지장이 없을까?',
    claim: '고카페인 에너지음료는 피로 물질을 완벽히 분해해주므로 시험 기간에 하루 2~3캔씩 마셔도 수면과 심장에 전혀 무리가 없다.',
    background: '중·고등학생들 사이에서 시험 기간 필수템으로 유행하는 에너지음료의 카페인 함량과 수면 방해, 그리고 질병관리청의 청소년 카페인 섭취 실태를 팩트체크합니다.',
    difficulty: 'easy',
    keywords: ['고카페인 에너지음료', '질병관리청 청소년건강행태조사', '식약처 일일 섭취 권고량', '수면 장애', '가슴 두근거림'],
    hintQuestions: [
      'KOSIS [청소년건강행태조사 - 주3회 이상 고카페인 음료 섭취율]을 보면 최근 5년간 학생들의 섭취율은 어떻게 변했을까?',
      '식약처 기준 청소년(체중 50kg)의 1일 카페인 최대 권고량(125mg)과 시판 에너지음료 1캔의 카페인 양을 비교해 보세요.'
    ],
    suggestedSources: [
      'KOSIS 국가통계포털 (질병관리청 청소년건강행태조사)',
      '식품의약품안전처 청소년 고카페인 음료 안전 섭취 가이드',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)'
    ],
    counterEvidenceClue: '카페인은 피로 물질(아데노신)의 결합을 일시적으로 차단할 뿐 피로를 없애지 못하며, 반감기(5~7시간)로 인해 야간 수면 질이 급격히 떨어져 다음 날 집중력이 더 저하됨',
    kosisTip: {
      tableTitle: '질병관리청 『청소년건강행태조사 - 주3회 이상 고카페인 음료 섭취율』',
      searchKeywords: '청소년건강행태조사 고카페인',
      description: 'KOSIS에서 "고카페인" 또는 "청소년건강행태조사"를 검색하여 중·고등학생 섭취율 통계를 확인하세요.'
    },
    bigkindsTip: {
      query: '청소년 AND (에너지음료 OR 고카페인) AND (부작용 OR 수면)',
      analysisPoint: '빅카인즈에서 청소년 고카페인 음료 섭취 관련 언론 보도 및 식약처 경고 기사를 확인하세요.'
    }
  },
  {
    id: 'kosis-health-2',
    category: 'health',
    categoryLabel: '🍔 음식·건강',
    isTrending: true,
    trendingBadge: '🔥 핫이슈 & 팩트체크',
    isKosisRecommended: true,
    title: '제로 탄산음료 속 인공감미료(아스파탐 등)는 설탕보다 몸에 더 해롭고 암을 유발할까?',
    claim: '세계보건기구(WHO)가 아스파탐을 발암 가능 물질로 지정했으므로, 제로 음료를 마시는 것은 일반 설탕 음료를 마시는 것보다 훨씬 위험하다.',
    background: 'WHO 국제암연구소(IARC)의 2B군 발암가능물질 지정 발표 이후 일어난 공포와 식품의약품안전처의 일일섭취허용량(ADI) 기준을 팩트체크합니다.',
    difficulty: 'easy',
    keywords: ['아스파탐', 'WHO IARC 2B군', '식약처 일일섭취허용량(ADI)', '설탕 음료 비교', '비만 당뇨'],
    hintQuestions: [
      'IARC의 2B군 분류(김치, 절임채소, 알로에베라, 휴대폰 전자파와 동급)는 발암의 ‘위험 강도’일까, ‘증거의 축적 수준’일까?',
      '빅카인즈에서 "아스파탐 식약처 팩트체크"를 검색했을 때 청소년이 위험하려면 하루에 제로 음료를 몇 캔 마셔야 할까?'
    ],
    suggestedSources: [
      '식품의약품안전처 아스파탐 위해성 평가 및 안전기준 발표',
      'WHO/FAO 합동 식품첨가물전문가위원회(JECFA) 평가 보고서',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)'
    ],
    counterEvidenceClue: '체중 60kg 기준 하루 55캔 이상 마셔야 허용량을 초과하며, 2B군은 ‘인체 발암 증거가 제한적’인 분류로 설탕 과다섭취로 인한 비만·당뇨 위험보다 위해도가 직접적으로 높지 않음',
    kosisTip: {
      tableTitle: '식품의약품안전처 『식품첨가물 일일섭취허용량(ADI) 평가 데이터』',
      searchKeywords: '식품첨가물 아스파탐 섭취량',
      description: '식약처 공식 보도자료 및 공공데이터포털에서 일일섭취허용량 기준을 확인하세요.'
    },
    bigkindsTip: {
      query: '아스파탐 AND (WHO OR 식약처) AND 팩트체크',
      analysisPoint: '빅카인즈에서 아스파탐 논란 당시 언론사들의 팩트체크 기사 3건을 비교 검색하세요.'
    }
  },
  {
    id: 'kosis-school-2',
    category: 'school',
    categoryLabel: '🏫 학교생활·통계',
    isTrending: true,
    trendingBadge: '📊 KOSIS·빅카인즈 추천',
    isKosisRecommended: true,
    title: '코로나 이후 학교폭력 발생 건수가 역대 최고치로 매년 2배씩 급증했을까?',
    claim: '학교폭력 피해는 대부분 신체 폭행이며, 최근 3년간 전국 학교폭력 발생 건수가 2배 이상 폭증하여 통제 불가능 상태이다.',
    background: '언론의 자극적인 학폭 보도와 실제 교육부의 연례 『학교폭력 실태조사』 공식 통계를 비교하여 피해 유형별(언어폭력, 신체폭력, 사이버폭력) 비중을 객관적으로 분석합니다.',
    difficulty: 'medium',
    keywords: ['학교폭력 실태조사', '교육부 공식 통계', '언어폭력', '사이버폭력', '피해응답률'],
    hintQuestions: [
      'KOSIS에서 [교육부 학교폭력 실태조사]를 보면 피해 유형 중 1위는 신체 폭행일까, 언어폭력일까?',
      '빅카인즈에서 "학교폭력 실태조사 언어폭력"을 검색하여 최근 피해 유형의 변화를 살펴보세요.'
    ],
    suggestedSources: [
      'KOSIS 국가통계포털 (교육부 학교폭력 실태조사 결과)',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)',
      '한국형사·법무정책연구원 청소년 범죄 및 비행 실태'
    ],
    counterEvidenceClue: '공식 통계상 피해 유형 1위는 언어폭력(약 41~42%)이며 신체폭력은 약 15% 수준임. 피해 응답률은 1~2%대로 매년 2배씩 폭증한 것은 아님',
    kosisTip: {
      tableTitle: '교육부 『학교폭력 실태조사 - 피해유형별 비율 및 피해응답률』',
      searchKeywords: '학교폭력 실태조사 피해응답률',
      description: 'KOSIS에서 "학교폭력 실태조사"를 검색하여 초·중·고 학교급별 피해 응답률과 유형별(언어, 신체, 사이버, 집단따돌림) 비율을 확인하세요.'
    },
    bigkindsTip: {
      query: '학교폭력 실태조사 AND (언어폭력 OR 사이버폭력)',
      analysisPoint: '빅카인즈에서 교육부 발표 기사와 유형별 비중 변화를 분석하세요.'
    }
  },
  {
    id: 'kosis-health-3',
    category: 'health',
    categoryLabel: '🍔 음식·건강',
    isTrending: true,
    trendingBadge: '📊 KOSIS·빅카인즈 추천',
    isKosisRecommended: true,
    title: '배달음식과 패스트푸드 급증으로 우리나라 청소년의 절반이 비만 상태일까?',
    claim: '배달앱과 패스트푸드 이용 급증으로 인해 대한민국 중·고등학생 2명 중 1명(50%)이 고도비만 상태이다.',
    background: '청소년 식습관 악화에 대한 우려와 실제 질병관리청 『청소년건강행태조사』 및 『국민건강영양조사』의 공식 비만율 데이터를 비교 분석합니다.',
    difficulty: 'medium',
    keywords: ['청소년 비만율', '질병관리청 청소년건강행태조사', '패스트푸드 섭취율', '과체중 및 비만 기준', '체질량지수(BMI)'],
    hintQuestions: [
      'KOSIS [청소년건강행태조사 - 비만율] 통계를 열었을 때 실제 청소년 비만율은 몇 %로 나타날까?',
      '빅카인즈에서 "청소년 비만율 추이"를 검색하여 남학생과 여학생 간의 차이점도 확인해 보세요.'
    ],
    suggestedSources: [
      'KOSIS 국가통계포털 (질병관리청 청소년건강행태조사)',
      '질병관리청 국민건강영양조사 통계',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)'
    ],
    counterEvidenceClue: '공식 통계상 청소년 비만율은 약 12~14% (과체중 포함 시 약 20% 내외)로, 50%라는 수치는 크게 과장되었으나 최근 10년간 완만한 증가 추세는 사실임',
    kosisTip: {
      tableTitle: '질병관리청 『청소년건강행태조사 - 비만율 추이 (성별·학교급별)』',
      searchKeywords: '청소년건강행태조사 비만율',
      description: 'KOSIS에서 "청소년건강행태조사 비만율"을 검색하여 연도별 추이와 성별 격차를 확인하세요.'
    },
    bigkindsTip: {
      query: '청소년 비만율 AND (패스트푸드 OR 배달음식)',
      analysisPoint: '빅카인즈에서 최근 5년간 청소년 비만 통계 관련 보도 내용을 확인하세요.'
    }
  },
  {
    id: 'kosis-sns-2',
    category: 'sns',
    categoryLabel: '📱 SNS·미디어',
    isTrending: true,
    trendingBadge: '📊 KOSIS·빅카인즈 추천',
    isKosisRecommended: true,
    title: '쇼츠·릴스 등 숏폼 영상을 많이 보면 뇌의 전두엽이 손상되어 긴 글을 절대 못 읽게 될까?',
    claim: '1분 미만의 숏폼 동영상을 매일 보면 뇌 전두엽 기능이 영구적으로 손상되어 3분 이상 글을 못 읽는 팝콘 브레인이 된다.',
    background: '‘팝콘 브레인’ 현상에 대한 경고가 쏟아지는 가운데, 한국언론진흥재단의 청소년 미디어 이용 조사와 의학계의 실제 진단 기준을 교차 검증합니다.',
    difficulty: 'medium',
    keywords: ['숏폼 이용 실태', '한국언론진흥재단 미디어 이용조사', '팝콘 브레인', '주의집중력', '전두엽 뇌과학'],
    hintQuestions: [
      '‘팝콘 브레인’은 정신의학 진단 기준(DSM-5)에 등재된 진짜 공식 질병일까, 아니면 비유적 신조어일까?',
      '빅카인즈에서 "팝콘 브레인 AND 숏폼"을 검색하여 언론 보도의 과장 여부를 확인해 보세요.'
    ],
    suggestedSources: [
      '한국언론진흥재단 어린이·청소년 미디어 이용 조사 보고서',
      '대한신경정신의학회 공식 자문 의견',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)'
    ],
    counterEvidenceClue: '팝콘 브레인은 2011년 미국 워싱턴대 교수가 제안한 비유적 신조어일 뿐 영구적 뇌 손상 질환이 아니며, 주의 집중 훈련과 읽기 습관으로 충분히 회복 가능함',
    kosisTip: {
      tableTitle: '한국언론진흥재단 『어린이·청소년 미디어 이용 조사 - 숏폼 이용 시간 및 빈도』',
      searchKeywords: '어린이 청소년 미디어 이용조사 숏폼',
      description: 'KOSIS 또는 한국언론진흥재단 자료실에서 청소년 숏폼 이용 실태 통계를 확인하세요.'
    },
    bigkindsTip: {
      query: '팝콘브레인 OR (숏폼 AND 주의력결핍)',
      analysisPoint: '빅카인즈에서 팝콘브레인 키워드 뉴스 및 뇌과학자 인터뷰 기사를 검색하세요.'
    }
  },
  {
    id: 'kosis-env-1',
    category: 'env',
    categoryLabel: '🌍 환경·자연',
    isTrending: true,
    trendingBadge: '📊 KOSIS·빅카인즈 추천',
    isKosisRecommended: true,
    title: '지구온난화로 우리나라 여름 폭염일수가 매년 역대 최악으로 경신되고 있을까?',
    claim: '기후변화로 인해 대한민국 여름 폭염일수는 매년 역대 최고치를 깨며 해마다 계속 증가하고 있다.',
    background: '기상청의 1973년 이후 전국 기상관측 공식 통계를 통해 역대 최고 폭염 연도(1994년, 2018년 등)와 최근 연도의 폭염·열대야 일수 추이를 팩트체크합니다.',
    difficulty: 'medium',
    keywords: ['기상청 폭염일수', '열대야일수', '1994년 vs 2018년 폭염', '연평균 기온 상승', '기후통계'],
    hintQuestions: [
      'KOSIS [기상청 - 연도별 폭염일수 및 열대야일수]를 열었을 때, 역대 폭염일수 1위 연도는 언제일까?',
      '빅카인즈에서 "기상청 폭염일수 역대 최고"를 검색하여 시계열 기온 변화를 확인해 보세요.'
    ],
    suggestedSources: [
      'KOSIS 국가통계포털 (기상청 기상관측 연보 - 폭염/열대야 일수)',
      '기상청 기후정보포털 시계열 통계',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)'
    ],
    counterEvidenceClue: '장기적 연평균 기온은 상승 추세이나, 폭염일수는 엘니뇨/라니냐 및 티베트 고기압 등 기압계 배치에 따라 연도별 편차가 큼(역대 최고 폭염은 2018년 31.4일, 1994년 29.6일 순)',
    kosisTip: {
      tableTitle: '기상청 『기상관측통계 - 전국 연도별 폭염일수 및 열대야일수』',
      searchKeywords: '기상청 폭염일수 열대야일수',
      description: 'KOSIS에서 "폭염일수"를 검색하여 1973년~최근까지의 연도별 폭염일수 꺾은선 그래프를 확인하세요.'
    },
    bigkindsTip: {
      query: '기상청 AND (폭염일수 OR 열대야) AND 역대',
      analysisPoint: '빅카인즈에서 역대 폭염 순위와 기상청 분석 기사를 확인하세요.'
    }
  },
  {
    id: 'kosis-school-3',
    category: 'school',
    categoryLabel: '🏫 학교생활·통계',
    isTrending: true,
    trendingBadge: '📊 KOSIS·빅카인즈 추천',
    isKosisRecommended: true,
    title: '등교 시간을 9시로 늦추면 청소년의 수면 시간이 1시간 늘어나 학업 성취도가 급상승할까?',
    claim: '등교 시간을 9시로 늦추면 모든 학생이 1시간 더 잠을 자게 되어 지각이 사라지고 성적이 크게 오른다.',
    background: '경기도교육청 등에서 시작된 ‘9시 등교제’ 시행 전후 학생들의 실제 수면 시간 변화와 취침 시간 지연(취침 시간도 늦어짐) 현상을 통계로 분석합니다.',
    difficulty: 'medium',
    keywords: ['9시 등교제', '청소년 수면시간', '통계청 청소년 통계', '취침시간 지연', '학업만족도'],
    hintQuestions: [
      'KOSIS [청소년 통계 - 평일 평균 수면시간]을 보면 중·고등학생의 평균 수면시간은 몇 시간일까?',
      '빅카인즈에서 "9시 등교 수면시간"을 검색하여 등교가 늦어진 만큼 취침 시간도 늦어졌다는 연구 결과를 찾아보세요.'
    ],
    suggestedSources: [
      'KOSIS 국가통계포털 (여성가족부·통계청 청소년 통계)',
      '경기도교육연구원 9시 등교 효과 분석 보고서',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)'
    ],
    counterEvidenceClue: '9시 등교 초기에는 수면 시간이 약 20~30분 늘어나는 효과가 있었으나, 시간이 지나면서 밤늦게 스마트폰을 사용하며 취침 시간이 함께 늦어져 순수 수면 시간 증가는 10~15분 미만에 그쳤다는 실증 조사 존재',
    kosisTip: {
      tableTitle: '통계청·여성가족부 『청소년 통계 - 평일 평균 수면시간 및 생활시간조사』',
      searchKeywords: '청소년 평일 평균 수면시간',
      description: 'KOSIS에서 "청소년 수면시간"을 검색하여 중학생과 고등학생의 실제 수면시간 분포를 확인하세요.'
    },
    bigkindsTip: {
      query: '9시 등교 AND (수면시간 OR 집중도)',
      analysisPoint: '빅카인즈에서 9시 등교 시행 전후 학생/학부모 설문조사 결과 기사를 비교하세요.'
    }
  },
  {
    id: 'kosis-tech-1',
    category: 'tech',
    categoryLabel: '🤖 AI·기술',
    isTrending: true,
    trendingBadge: '🔥 핫이슈 & 팩트체크',
    isKosisRecommended: true,
    title: '휴대용 손선풍기를 얼굴 가까이 대면 뇌종양을 유발할 치명적 전자파가 나올까?',
    claim: '여름철 휴대용 손선풍기 모터에서는 기준치의 수십 배에 달하는 강력한 전자파가 뿜어져 나와 뇌세포를 파괴한다.',
    background: '매년 여름 되풀이되는 시민단체의 손선풍기 전자파 경고와 과학기술정보통신부·국립전파연구원의 정밀 측정 결과(거리 감쇄 법칙)를 비교 팩트체크합니다.',
    difficulty: 'easy',
    keywords: ['손선풍기 전자파', '국립전파연구원', '과기정통부 실태조사', '거리 역제곱 법칙', '인체보호기준'],
    hintQuestions: [
      '전자파 측정기를 모터에 0cm로 바짝 붙였을 때와 실제 사용하는 5~10cm 거리를 띄웠을 때 수치는 어떻게 달라질까?',
      '빅카인즈에서 "손선풍기 전자파 과기정통부"를 검색하여 공식 검증 결과를 확인해 보세요.'
    ],
    suggestedSources: [
      '과학기술정보통신부 손선풍기 전자파 실태조사 결과 보도자료',
      '국립전파연구원 생활 속 전자파 측정 데이터',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)'
    ],
    counterEvidenceClue: '0cm 초밀착 측정 시 일시적으로 높은 수치가 나올 수 있으나, 전자파는 거리의 제곱에 반비례해 급감하므로 5~10cm만 띄워도 기준치 대비 1~10% 미만의 매우 안전한 수준임',
    kosisTip: {
      tableTitle: '국립전파연구원 『생활 속 가전기기 전자파 측정 결과 공공데이터』',
      searchKeywords: '생활가전 전자파 측정 데이터 국립전파연구원',
      description: '국립전파연구원(rra.go.kr) 또는 공공데이터포털에서 거리별 전자파 측정값을 확인하세요.'
    },
    bigkindsTip: {
      query: '손선풍기 AND 전자파 AND 과기정통부',
      analysisPoint: '빅카인즈에서 시민단체 발표와 정부 반박 검증 기사를 비교 분석하세요.'
    }
  },
  {
    id: 'kosis-current-1',
    category: 'current',
    categoryLabel: '🚨 최신 시의성 이슈',
    isTrending: true,
    trendingBadge: '🔥 2024~2026 핫이슈',
    isKosisRecommended: true,
    title: '전기차는 일반 내연기관(가솔린·디젤) 자동차보다 화재 발생 비율이 통계적으로 훨씬 더 높을까?',
    claim: '리튬 배터리를 탑재한 전기차는 열폭주 위험 때문에 일반 가솔린 자동차보다 등록 대수 대비 화재 발생률이 몇 배나 더 높다.',
    background: '아파트 지하주차장 화재 사건 이후 급속도로 퍼진 ‘전기차 포비아’와 실제 소방청·교통안전공단의 공식 국가화재 통계를 교차 검증합니다.',
    difficulty: 'medium',
    keywords: ['전기차 화재율', '내연기관차 비교 통계', '소방청 국가화재정보시스템', '1만 대당 화재 건수', '배터리 열폭주'],
    hintQuestions: [
      '자동차 1만 대당 화재 발생 건수를 비교했을 때 전기차와 내연기관차 중 어느 쪽이 통계적으로 더 높을까?',
      '빅카인즈에서 "전기차 화재율 내연기관 팩트체크"를 검색하여 소방청 통계를 인용한 보도를 확인해 보세요.'
    ],
    suggestedSources: [
      '소방청 국가화재정보시스템 자동차 유종별 화재 통계',
      '한국교통안전공단 자동차안전연구원 결함 보고서',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)'
    ],
    counterEvidenceClue: '소방청 공식 통계상 자동차 1만 대당 연간 화재 발생 건수는 내연기관차(약 1.8~2.0건)가 전기차(약 1.3~1.4건)보다 비슷하거나 오히려 높음. 다만 전기차 배터리는 열폭주 특성상 진화 시간이 오래 걸려 체감 위험이 큼',
    kosisTip: {
      tableTitle: '소방청 『국가화재정보시스템 - 자동차 유종별(휘발유, 경유, 전기) 화재 발생 현황』',
      searchKeywords: '소방청 자동차 화재 통계 전기차',
      description: 'KOSIS 또는 e-나라지표에서 자동차 등록대수 대비 화재 발생 비율을 확인하세요.'
    },
    bigkindsTip: {
      query: '전기차 화재율 AND 내연기관 AND 소방청',
      analysisPoint: '빅카인즈에서 언론사들의 팩트체크 기사(1만대당 화재율 비교)를 확인하세요.'
    }
  },
  {
    id: 'kosis-current-2',
    category: 'current',
    categoryLabel: '🚨 최신 시의성 이슈',
    isTrending: true,
    trendingBadge: '🔥 2024~2026 핫이슈',
    isKosisRecommended: true,
    title: 'SNS에 올린 사진 1장과 3초 음성만으로 100% 구별 불가능한 딥페이크 사칭 영상이 완성될까?',
    claim: '생성형 AI 기술의 발전으로 일반인의 얼굴 사진 단 한 장과 3초의 일상 음성만 있으면 육안으로 구별 불가능한 딥페이크 사칭 영상이 완성된다.',
    background: '딥페이크 범죄 우려가 커지는 가운데 실제 1장 사진 기반 생성 AI(One-shot AI)의 구현 한계와 디지털 포렌식 식별법을 팩트체크합니다.',
    difficulty: 'medium',
    keywords: ['딥페이크(Deepfake)', '생성형 AI 음성 복제', '영상 워터마크', '한국인터넷진흥원(KISA)', '디지털 포렌식'],
    hintQuestions: [
      '단 한 장의 정면 사진으로 고개를 돌리거나 다양한 표정을 지을 때 AI가 어떤 부자연스러운 왜곡(귀, 머리칼, 눈동자)을 보일까?',
      '빅카인즈에서 "딥페이크 탐지 워터마크"를 검색하여 전문가들이 밝힌 구별법을 찾아보세요.'
    ],
    suggestedSources: [
      '한국인터넷진흥원(KISA) 딥페이크 대응 기술 보고서',
      '경찰청 사이버수사국 디지털포렌식 가이드',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)'
    ],
    counterEvidenceClue: '원샷(단 1장) 기반 합성은 측면 회전 시 블러 현상, 치아/손가락 왜곡, 음성 스펙트로그램 불연속성이 뚜렷하며, 정교한 사칭 영상을 만들려면 수백 장의 고화질 다각도 영상 데이터와 긴 렌더링 시간이 필수적임',
    kosisTip: {
      tableTitle: '한국지능정보사회진흥원(NIA) 『인공지능 윤리 및 역기능 실태조사 통계』',
      searchKeywords: '인공지능 역기능 실태조사 딥페이크',
      description: '공공데이터포털 또는 KISA 자료실에서 딥페이크 탐지 기술 현황을 확인하세요.'
    },
    bigkindsTip: {
      query: '딥페이크 AND (식별 OR 구별법 OR 워터마크)',
      analysisPoint: '빅카인즈에서 딥페이크 관련 뉴스 보도량 추이 및 탐지 기술 기사를 검색하세요.'
    }
  },
  {
    id: 'kosis-school-4',
    category: 'school',
    categoryLabel: '🏫 학교생활·통계',
    isTrending: true,
    trendingBadge: '📊 KOSIS·빅카인즈 추천',
    isKosisRecommended: true,
    title: '초저출산으로 인해 5년 안에 전국 초·중·고등학교의 절반 이상이 즉시 문을 닫을까?',
    claim: '학령인구 감소 속도가 너무 빨라 5년 내에 서울과 지방을 가리지 않고 전국의 학교 50%가 폐교될 것이다.',
    background: '학령인구 감소와 소규모 학교 통폐합에 관한 뉴스를 통계청 장래인구추계 및 교육통계연보를 통해 객관적으로 검증합니다.',
    difficulty: 'hard',
    keywords: ['학령인구 감소', '통계청 장래인구추계', '교육통계연보 학교수', '소규모 학교 통폐합', '폐교 통계'],
    hintQuestions: [
      'KOSIS [장래인구추계 - 학령인구(6~21세)]를 열었을 때 향후 5년~10년간 학생 수 감소율은 몇 %일까?',
      '빅카인즈에서 "학령인구 감소 폐교 현황"을 검색하여 수도권과 지방 간의 차이를 비교해 보세요.'
    ],
    suggestedSources: [
      'KOSIS 국가통계포털 (통계청 장래인구추계, 교육통계연보)',
      '한국교육개발원(KEDI) 교육통계서비스',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)'
    ],
    counterEvidenceClue: '학령인구 감소는 명백한 사실이나, 학급당 학생 수 감축 정책 및 복합화 시설 운영 등으로 5년 내 전국 학교의 50%가 문을 닫는다는 주장은 비현실적인 극단적 과장임',
    kosisTip: {
      tableTitle: '통계청 『장래인구추계 - 학령인구(6~21세) 시계열 데이터』 & 교육통계연보',
      searchKeywords: '장래인구추계 학령인구 교육통계연보',
      description: 'KOSIS에서 "학령인구"를 검색하여 2025~2035년 사이의 연도별 학생 수 추계를 확인하세요.'
    },
    bigkindsTip: {
      query: '학령인구 감소 AND (폐교 OR 통폐합)',
      analysisPoint: '빅카인즈에서 폐교 관련 기사의 지역별 격차(농어촌 vs 대도시)를 분석하세요.'
    }
  },
  {
    id: 'kosis-daily-1',
    category: 'daily',
    categoryLabel: '🔍 생활 속 통계',
    isTrending: false,
    trendingBadge: '📊 KOSIS 추천',
    isKosisRecommended: true,
    title: '우리나라 전체 가구의 70% 이상이 이미 반려동물을 키우고 있을까?',
    claim: '반려동물 열풍으로 대한민국 전체 가구의 70%가 개나 고양이를 키우고 있어 1인 가구 수보다 훨씬 많다.',
    background: '미디어 속 펫팸족 증가 보도와 통계청 인구주택총조사 및 농림축산식품부의 실제 반려동물 양육 가구 비율을 비교합니다.',
    difficulty: 'easy',
    keywords: ['반려동물 양육 가구 비율', '통계청 인구주택총조사', '농림축산식품부 동물복지 실태조사', '반려견 반려묘 통계'],
    hintQuestions: [
      'KOSIS [인구주택총조사 - 반려동물 양육 가구] 통계를 열었을 때 실제 양육 가구 비율은 약 몇 %일까?',
      '빅카인즈에서 "반려동물 양육 가구 비율 통계청"을 검색해 보세요.'
    ],
    suggestedSources: [
      'KOSIS 국가통계포털 (통계청 인구주택총조사 - 반려동물 양육 여부)',
      '농림축산식품부 동물보호에 대한 국민의식조사',
      '빅카인즈 (한국언론진흥재단 뉴스 빅데이터)'
    ],
    counterEvidenceClue: '공식 인구주택총조사 기준 반려동물 양육 가구 비율은 약 25~28% (약 4가구 중 1가구)로, 70%라는 수치는 크게 과장된 수치임',
    kosisTip: {
      tableTitle: '통계청 『인구주택총조사 - 반려동물 양육 가구 비율 (전국 및 시도별)』',
      searchKeywords: '인구주택총조사 반려동물 양육',
      description: 'KOSIS에서 "반려동물"을 검색하여 인구주택총조사 행정통계를 확인하세요.'
    },
    bigkindsTip: {
      query: '반려동물 양육 가구 AND (통계청 OR 농식품부)',
      analysisPoint: '빅카인즈에서 인구총조사 발표 기사를 확인하세요.'
    }
  },

  // =========================================================================
  // 2. 추가 흥미 주제들 (학교생활, SNS, 건강, 환경, 스포츠, 생활)
  // =========================================================================
  {
    id: 'school-paper-vs-tablet',
    category: 'school',
    categoryLabel: '학교생활',
    title: '손글씨로 필기하는 것이 태블릿 타이핑보다 시험 암기력이 2배 이상 높을까?',
    claim: '종이에 손으로 필기할 때 뇌의 기억 중추가 더 활성화되어 디지털 기기 입력보다 암기력이 2배 이상 높다.',
    background: '수기 필기의 장점을 강조하는 논문들이 있지만, 디지털 기기의 검색성·정리 편의성과 학습자 숙련도에 따라 차이가 난다는 의견도 있습니다.',
    difficulty: 'medium',
    keywords: ['손글씨 필기', '디지털 타이핑', '작업기억', '학습효과', '뇌 인지'],
    hintQuestions: ['단순 단어 암기와 복합 개념 이해에서 필기 방식의 효과가 다를까?', '디지털 기기에 익숙한 세대에게도 동일한 결과가 나올까?'],
    suggestedSources: ['Muller & Oppenheimer (2014) The Pen Is Mightier Than the Keyboard 연구', '노르웨이 과학기술대 뇌파 연구', '한국교육학술정보원(KERIS) 리포트', '빅카인즈'],
    counterEvidenceClue: '최신 재현 연구(2021)에서는 필기 속도와 요약 능력이 통제될 경우 손글씨와 타이핑 간 시험 성적 차이가 통계적으로 유의미하지 않다는 결과 존재'
  },
  {
    id: 'school-standing-desk',
    category: 'school',
    categoryLabel: '학교생활',
    title: '스탠딩 책상을 쓰면 졸음이 100% 사라지고 암기 효율이 급상승할까?',
    claim: '서서 공부하면 혈액순환이 개선되어 졸음이 100% 방지되고 암기 효율이 비약적으로 높아진다.',
    background: '교실에 졸음 방지용 키높이 책상이 보급되었으나, 신체 피로도 누적이나 다리 통증 등의 부작용도 보고됩니다.',
    difficulty: 'easy',
    keywords: ['스탠딩 책상', '수업 집중도', '신체 피로도', '자세 교정', '청소년 척추'],
    hintQuestions: ['서 있는 시간의 임계점은 몇 분일까?', '단순 졸음 깸 효과와 깊은 사고력 집중에 차이가 있을까?'],
    suggestedSources: ['대한인간공학회지', '미국 텍사스A&M대 공공보건 연구', '질병관리청 청소년 체격 통계'],
    counterEvidenceClue: '20분 이상 장시간 서 있을 경우 허리와 발목 피로도로 인해 오히려 집중력 저하가 발생하며, 졸음 깸은 일시적 자극에 불과함'
  },
  {
    id: 'sns-darkmode',
    category: 'sns',
    categoryLabel: 'SNS·유튜브',
    title: '스마트폰 다크모드를 켜면 시력 저하와 안구건조증을 완벽히 막을 수 있을까?',
    claim: '다크모드는 블루라이트를 99% 차단하여 어두운 방에서 스마트폰을 봐도 눈이 전혀 나빠지지 않는다.',
    background: '많은 학생들이 눈 보호를 위해 다크모드를 상시 사용하지만, 주변 밝기와의 대비와 난시 환자의 피로도에 관한 반대 사실도 있습니다.',
    difficulty: 'easy',
    keywords: ['다크모드', '블루라이트', '시력 보호', '안구건조증', '빛 번짐', '난시'],
    hintQuestions: ['검은 배경에 흰 글씨를 읽을 때 눈의 동공 크기와 초점 조절 근육에는 어떤 변화가 생길까?', '어두운 방에서 다크모드를 켜는 것과 조명을 켜는 것 중 무엇이 더 중요할까?'],
    suggestedSources: ['대한안과학회 가이드라인', '미국안과학회(AAO) 팩트시트', '삼성·애플 디스플레이 기술 문서'],
    counterEvidenceClue: '밝은 대낮이나 난시가 있는 경우 다크모드 글씨가 더 번져 보여 눈의 피로도가 증가할 수 있으며, 어두운 방에서는 화면 밝기와 상관없이 눈 깜빡임 감소로 안구건조 유발'
  },
  {
    id: 'daily-3sec-rule',
    category: 'daily',
    categoryLabel: '생활 속 궁금증',
    title: '바닥에 떨어진 음식도 3초 안에 주워 먹으면 세균이 전혀 안 묻을까?',
    claim: '바닥에 음식이 닿은 지 3초 미만이면 세균이 음식물 표면으로 이동할 시간이 부족하여 100% 안전하다.',
    background: '전 세계적으로 유명한 ‘3초 법칙’(5-second rule)의 실제 미생물 오염 속도와 수분 함량에 따른 전이 실험 결과를 탐구합니다.',
    difficulty: 'easy',
    keywords: ['3초 법칙', '미국 러트거스대 미생물 연구', '수분 활성도', '바닥 표면 재질', '식중독균(살모넬라/대장균)'],
    hintQuestions: ['음식의 수분기(수박 vs 젤리 vs 마른 빵)에 따라 세균 전이 속도는 어떻게 달라질까?', '바닥의 재질(타일, 카펫, 나무 마루)에 따른 차이는?'],
    suggestedSources: ['Robyn Miranda & Donald Schaffner (Rutgers Univ. 2016) 연구', '미국 미생물학회(ASM) 저널', '식약처 식중독 예방 가이드'],
    counterEvidenceClue: '수분이 많은 음식(수박 등)은 바닥 접촉 0.1초 만에도 90% 이상의 세균이 즉시 전이되며, 3초 미만이라도 살모넬라 등 식중독균은 극소량으로도 감염 유발 가능'
  },
  {
    id: 'daily-gum-7years',
    category: 'daily',
    categoryLabel: '생활 속 궁금증',
    title: '삼킨 껌은 뱃속에서 소화되지 않고 창자에 7년 동안 달라붙어 있을까?',
    claim: '껌의 고무 성분은 위산에 녹지 않아서 삼키면 장폐색을 일으키고 7년간 체내에 남는다.',
    background: '어린 시절 누구나 한 번쯤 들어본 껌 삼킴 괴담의 위장관 소화 메커니즘과 배출 주기를 의학적으로 추적합니다.',
    difficulty: 'easy',
    keywords: ['껌 기초제(검베이스)', '위산 분해', '소화관 연동운동', '이물질 배출 시간', '소아 장폐색 조건'],
    hintQuestions: ['껌의 단맛(당분)과 고무 성분(검베이스)은 소화기관에서 어떻게 처리될까?', '소화되지 않는 음식물 찌꺼기(식이섬유 등)는 며칠 만에 대변으로 배출될까?'],
    suggestedSources: ['미국 소아과학회(AAP) 진료지침', '영국 메디컬 저널(BMJ) 의학 신화 팩트체크', '서울아산병원 소화기내과 정보'],
    counterEvidenceClue: '껌베이스는 위산에 완전히 소화되지는 않지만, 위장관의 자연스러운 연동운동을 통해 다른 음식물과 함께 2~3일 내에 대변으로 정상 배출됨'
  },
  {
    id: 'daily-white-hair',
    category: 'daily',
    categoryLabel: '생활 속 궁금증',
    title: '머리카락(새치)을 뽑으면 그 자리에 2~3가닥이 더 많이 자라날까?',
    claim: '흰머리를 한 번 뽑으면 모낭이 자극받아 주변 모공까지 번져 흰머리가 배로 늘어난다.',
    background: '새치를 뽑지 말라는 통념의 과학적 진실과 모낭 1개당 자라나는 모발의 생물학적 한계를 탐구합니다.',
    difficulty: 'easy',
    keywords: ['모낭 구조', '새치/흰머리 멜라닌 색소', '모발 재생 주기', '견인성 탈모', '피부과 생물학'],
    hintQuestions: ['모낭(모공) 하나에서 나올 수 있는 머리카락의 최대 가닥 수는 정해져 있을까?', '머리를 자꾸 뽑았을 때 발생하는 진짜 부작용(탈모)은?'],
    suggestedSources: ['대한모발학회 가이드라인', '미국 피부과학 저널 모낭 연구', '서울대병원 피부과 의학정보'],
    counterEvidenceClue: '하나의 모낭에서는 최대 1~3가닥의 머리카락만 자라며 뽑는다고 모낭이 증식하지 않음. 단, 계속 뽑으면 모낭이 손상되어 아예 털이 안 나는 견인성 탈모 발생'
  }
];

export const TOPIC_CATEGORIES = [
  { id: 'all', label: '전체 사건' },
  { id: 'kosis_bigkinds', label: '📊 KOSIS & 빅카인즈 추천' },
  { id: 'current', label: '🚨 최신 시의성 이슈' },
  { id: 'school', label: '🏫 학교생활' },
  { id: 'sns', label: '📱 SNS·유튜브' },
  { id: 'tech', label: '🤖 AI·기술' },
  { id: 'health', label: '🍔 음식·건강' },
  { id: 'env', label: '🌍 환경·자연' },
  { id: 'daily', label: '🔍 생활 속 궁금증' },
];

export const MAIN_ROLES = ['team_leader', 'process_officer', 'source_verifier', 'record_officer'] as const;

export const ROLE_DEFINITIONS: Record<string, {
  title: string;
  badge: string;
  icon: string;
  description: string;
  missions: string[];
  color: string;
}> = {
  team_leader: {
    title: '수사팀장(발표)',
    badge: 'LEAD INVESTIGATOR',
    icon: 'Award',
    color: 'indigo',
    description: '수사 방향을 총괄하고 최종 수사 결과와 팩트체크 결론을 대표로 발표·브리핑합니다.',
    missions: [
      '모둠의 전체 수사 계획 및 가설 검증 방향 총괄하기',
      '모둠원이 모은 증거들을 종합하여 최종 결론 브리핑 준비하기',
      '팩트체크 수사보고서 발표 및 타 모둠과의 질의응답 리드하기'
    ]
  },
  process_officer: {
    title: '수사 진행관(진행)',
    badge: 'PROCESS FACILITATOR',
    icon: 'Sliders',
    color: 'amber',
    description: '수사 단계별 시간과 진행 상황을 점검하고 팀원들의 활발한 참여와 협력을 이끕니다.',
    missions: [
      '단계별(가설→질문→증거→검증→판정) 수사 진행 속도 및 누락 점검하기',
      '수사 중 막히는 부분이 생기면 교사 SOS 요청 및 힌트 모둠 공유하기',
      '모둠원 전원이 고르게 증거 수집과 토의에 참여하도록 조율하기'
    ]
  },
  source_verifier: {
    title: '출처 검증관(검증)',
    badge: 'SOURCE VERIFIER',
    icon: 'Search',
    color: 'emerald',
    description: '수집된 자료의 최초 원출처, 공인성, 작성 기관의 신뢰도와 이해관계를 철저히 검증합니다.',
    missions: [
      'KOSIS(국가통계포털)와 빅카인즈(뉴스데이터)의 1차 공인 데이터 직접 조회하기',
      '발표 기관의 신뢰도와 이해관계, 최신성(발행연도) 검증하기',
      '가설을 반박하거나 조건을 제시하는 반증 자료도 함께 검증하기'
    ]
  },
  record_officer: {
    title: '판정 기록관(기록)',
    badge: 'VERDICT RECORDER',
    icon: 'FileText',
    color: 'blue',
    description: '모둠의 핵심 증거 카드, 질문 내용, 합의된 최종 판정 근거를 꼼꼼하게 기록합니다.',
    missions: [
      '수사관들이 확보한 핵심 통계 수치, 조사 결과를 증거 카드로 작성하기',
      '모둠 토의를 통해 도출된 핵심 수사 질문과 답변 내용 기록하기',
      '최종 8단계 판정 기준에 따른 모둠의 판정 근거 및 결정적 이유 명문화하기'
    ]
  },
  // Fallbacks
  briefing_officer: {
    title: '수사팀장(발표)',
    badge: 'LEAD INVESTIGATOR',
    icon: 'Award',
    color: 'indigo',
    description: '수사 방향을 총괄하고 최종 수사 결과와 팩트체크 결론을 대표로 발표·브리핑합니다.',
    missions: [
      '모둠의 전체 수사 계획 및 가설 검증 방향 총괄하기',
      '모둠원이 모은 증거들을 종합하여 최종 결론 브리핑 준비하기',
      '팩트체크 수사보고서 발표 및 타 모둠과의 질의응답 리드하기'
    ]
  },
  counter_investigator: {
    title: '수사 진행관(진행)',
    badge: 'PROCESS FACILITATOR',
    icon: 'Sliders',
    color: 'amber',
    description: '수사 단계별 시간과 진행 상황을 점검하고 팀원들의 활발한 참여와 협력을 이끕니다.',
    missions: [
      '단계별(가설→질문→증거→검증→판정) 수사 진행 속도 및 누락 점검하기',
      '수사 중 막히는 부분이 생기면 교사 SOS 요청 및 힌트 모둠 공유하기',
      '모둠원 전원이 고르게 증거 수집과 토의에 참여하도록 조율하기'
    ]
  },
  source_tracker: {
    title: '출처 검증관(검증)',
    badge: 'SOURCE VERIFIER',
    icon: 'Search',
    color: 'emerald',
    description: '수집된 자료의 최초 원출처, 공인성, 작성 기관의 신뢰도와 이해관계를 철저히 검증합니다.',
    missions: [
      'KOSIS(국가통계포털)와 빅카인즈(뉴스데이터)의 1차 공인 데이터 직접 조회하기',
      '발표 기관의 신뢰도와 이해관계, 최신성(발행연도) 검증하기',
      '가설을 반박하거나 조건을 제시하는 반증 자료도 함께 검증하기'
    ]
  },
  evidence_analyst: {
    title: '판정 기록관(기록)',
    badge: 'VERDICT RECORDER',
    icon: 'FileText',
    color: 'blue',
    description: '모둠의 핵심 증거 카드, 질문 내용, 합의된 최종 판정 근거를 꼼꼼하게 기록합니다.',
    missions: [
      '수사관들이 확보한 핵심 통계 수치, 조사 결과를 증거 카드로 작성하기',
      '모둠 토의를 통해 도출된 핵심 수사 질문과 답변 내용 기록하기',
      '최종 8단계 판정 기준에 따른 모둠의 판정 근거 및 결정적 이유 명문화하기'
    ]
  }
};
