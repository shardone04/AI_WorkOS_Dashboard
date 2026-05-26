/* ==============================================
   WorkOS AI Command Center — data.js
   전체 Mock 데이터 정의
   Section Map:
   1.  projects
   2.  tasks
   3.  kpis
   4.  risks (SWOT)
   5.  mails
   6.  announcements
   7.  calendarEvents
   8.  exchangeRates
   9.  branches
   10. resources
   11. decisionLogs
   12. hotIssues
   13. countdownTargets
   14. urgentKeywords
============================================== */

/* =============================================
   1. Projects
============================================== */
const projects = [
  {
    id: 1,
    name: "AI 고객응대 챗봇",
    team: "AI Lab",
    progress: 72,
    deadline: "2026-05-28",
    currentStage: "QA 테스트",
    nextStage: "베타 배포",
    owner: "지윤",
    status: "warning",
    description: "자연어 처리 기반 고객 응대 AI 챗봇 개발 프로젝트. LLM 파인튜닝 및 RAG 파이프라인 구성 완료, 현재 QA 단계.",
    budget: 120000000,
    budgetUsed: 89000000
  },
  {
    id: 2,
    name: "결제 시스템 고도화",
    team: "Backend Team",
    progress: 58,
    deadline: "2026-05-20",
    currentStage: "통합 테스트",
    nextStage: "Release Candidate",
    owner: "Backend Lead",
    status: "danger",
    description: "PG사 멀티 연동 및 정산 자동화 고도화. 현재 통합 테스트 단계에서 결제 오류 케이스 처리 중.",
    budget: 85000000,
    budgetUsed: 71000000
  },
  {
    id: 3,
    name: "모바일 앱 리뉴얼",
    team: "Frontend Team",
    progress: 91,
    deadline: "2026-06-10",
    currentStage: "UI 검수",
    nextStage: "스토어 배포",
    owner: "소연",
    status: "normal",
    description: "iOS/Android 앱 전면 리디자인. 디자인 시스템 적용 완료, 현재 QA 및 접근성 검수 진행 중.",
    budget: 60000000,
    budgetUsed: 54000000
  },
  {
    id: 4,
    name: "데이터 파이프라인 구축",
    team: "Data Team",
    progress: 44,
    deadline: "2026-05-24",
    currentStage: "ETL 개발",
    nextStage: "데이터 검증",
    owner: "재훈",
    status: "danger",
    description: "실시간 이벤트 스트리밍 및 데이터 웨어하우스 구축. Kafka 연동 중 파티션 설계 이슈 발생.",
    budget: 75000000,
    budgetUsed: 38000000
  },
  {
    id: 5,
    name: "보안 인증 고도화",
    team: "Security Team",
    progress: 83,
    deadline: "2026-06-05",
    currentStage: "취약점 점검",
    nextStage: "배포 승인",
    owner: "민준",
    status: "normal",
    description: "OAuth 2.0 / PKCE 적용 및 2FA 강제화. 현재 외부 보안 감사 진행 중.",
    budget: 40000000,
    budgetUsed: 35000000
  }
];

/* =============================================
   2. Tasks
============================================== */
const tasks = [
  {
    id: 1,
    title: "결제 모듈 QA 완료",
    owner: "Backend Team",
    dueDate: "2026-05-19",
    urgency: 9,
    impact: 8,
    kpiImpact: 7,
    bottleneckScore: 9,
    status: "in-progress",
    projectId: 2,
    relatedKpi: "일정 준수율"
  },
  {
    id: 2,
    title: "고객사 A 긴급 메일 답변",
    owner: "CS Team",
    dueDate: "2026-05-17",
    urgency: 10,
    impact: 7,
    kpiImpact: 8,
    bottleneckScore: 5,
    status: "pending",
    projectId: 1,
    relatedKpi: "고객 응답 시간"
  },
  {
    id: 3,
    title: "release/v1.3 브랜치 충돌 해소",
    owner: "DevOps",
    dueDate: "2026-05-18",
    urgency: 8,
    impact: 9,
    kpiImpact: 6,
    bottleneckScore: 7,
    status: "in-progress",
    projectId: 2,
    relatedKpi: "서비스 안정성"
  },
  {
    id: 4,
    title: "데이터 파이프라인 ETL 설계 검토",
    owner: "Data Team",
    dueDate: "2026-05-20",
    urgency: 7,
    impact: 8,
    kpiImpact: 5,
    bottleneckScore: 8,
    status: "in-progress",
    projectId: 4,
    relatedKpi: "프로젝트 완료율"
  },
  {
    id: 5,
    title: "모바일 앱 접근성 테스트",
    owner: "QA Team",
    dueDate: "2026-05-22",
    urgency: 5,
    impact: 6,
    kpiImpact: 4,
    bottleneckScore: 3,
    status: "in-progress",
    projectId: 3,
    relatedKpi: "사용자 만족도"
  },
  {
    id: 6,
    title: "보안 취약점 패치 배포",
    owner: "Security Team",
    dueDate: "2026-05-21",
    urgency: 8,
    impact: 9,
    kpiImpact: 7,
    bottleneckScore: 4,
    status: "pending",
    projectId: 5,
    relatedKpi: "서비스 안정성"
  },
  {
    id: 7,
    title: "전사 배포 점검 체크리스트 완성",
    owner: "PM",
    dueDate: "2026-05-17",
    urgency: 6,
    impact: 5,
    kpiImpact: 4,
    bottleneckScore: 2,
    status: "done",
    projectId: null,
    relatedKpi: null
  },
  {
    id: 8,
    title: "QA 인력 재배정 요청서 작성",
    owner: "PM",
    dueDate: "2026-05-18",
    urgency: 7,
    impact: 7,
    kpiImpact: 6,
    bottleneckScore: 6,
    status: "pending",
    projectId: 2,
    relatedKpi: "일정 준수율"
  }
];

/* =============================================
   3. KPIs
============================================== */
const kpis = [
  {
    id: 1,
    name: "일정 준수율",
    current: 78,
    target: 90,
    unit: "%",
    trend: -4,
    description: "마감일 이내 완료된 업무 비율. 이번 주 QA 병목으로 하락 중.",
    aiSuggestion: "QA 단계에서 4개 업무가 정체 중입니다. QA Support Team으로 업무 1건 재배정 시 약 6%p 개선 예상됩니다."
  },
  {
    id: 2,
    name: "고객 응답 시간",
    current: 82,
    target: 95,
    unit: "%",
    trend: -6,
    description: "SLA 기준 내 고객 메일/문의 응답 비율. 고객사 A 긴급 건 미처리 포함.",
    aiSuggestion: "고객사 A 긴급 메일(SLA 3시간 남음)이 미답변 상태입니다. 즉시 처리 시 KPI가 목표치에 근접합니다."
  },
  {
    id: 3,
    name: "버그 해결률",
    current: 91,
    target: 90,
    unit: "%",
    trend: 3,
    description: "접수된 버그 대비 해결 완료 비율. 이번 주 Backend 팀 성과로 목표 초과 달성.",
    aiSuggestion: "현재 목표를 초과 달성 중입니다. 결제 모듈 QA에서 신규 버그 발생 시 재하락할 수 있으니 모니터링을 권장합니다."
  },
  {
    id: 4,
    name: "매출 목표 달성률",
    current: 85,
    target: 100,
    unit: "%",
    trend: 2,
    description: "이번 달 매출 목표 대비 실제 매출 달성 비율.",
    aiSuggestion: "결제 시스템 고도화 완료 시 전환율 개선이 예상되어 달성률 상승 여지가 있습니다."
  },
  {
    id: 5,
    name: "프로젝트 완료율",
    current: 61,
    target: 80,
    unit: "%",
    trend: -8,
    description: "이번 분기 목표 완료 프로젝트 수 대비 실제 완료 비율.",
    aiSuggestion: "데이터 파이프라인 프로젝트의 ETL 병목이 완료율을 끌어내리고 있습니다. 리소스 재배치를 권장합니다."
  },
  {
    id: 6,
    name: "팀 업무 처리율",
    current: 74,
    target: 85,
    unit: "%",
    trend: -3,
    description: "배정된 업무 대비 기한 내 처리 완료 비율.",
    aiSuggestion: "Backend Team 과부하(92%)가 처리율 저하의 주요 원인입니다. 업무 재분배 필요."
  },
  {
    id: 7,
    name: "서비스 안정성",
    current: 99.2,
    target: 99.5,
    unit: "%",
    trend: -0.1,
    description: "서비스 가동률(Uptime). release 브랜치 충돌 위험으로 소폭 하락.",
    aiSuggestion: "release/v1.3 브랜치 충돌 해소 후 hotfix 배포 시 99.5% 회복 가능합니다."
  },
  {
    id: 8,
    name: "사용자 만족도",
    current: 88,
    target: 90,
    unit: "%",
    trend: 1,
    description: "월간 사용자 만족도 설문 응답 기반. 모바일 앱 개선으로 소폭 상승 중.",
    aiSuggestion: "모바일 앱 리뉴얼 배포 완료 시 추가 상승이 예측됩니다."
  }
];

/* =============================================
   4. Risks (SWOT)
============================================== */
const risks = [
  /* Weakness */
  {
    id: 1,
    title: "결제 QA 병목",
    category: "Weakness",
    urgency: 9,
    impact: 8,
    dueInDays: 2,
    kpiImpact: 7,
    bottleneckScore: 9,
    detail: "결제 모듈 통합 테스트 단계에서 엣지 케이스 처리 지연. Backend Team 과부하로 해소 난항."
  },
  {
    id: 2,
    title: "데이터 ETL 설계 미완성",
    category: "Weakness",
    urgency: 7,
    impact: 8,
    dueInDays: 5,
    kpiImpact: 5,
    bottleneckScore: 8,
    detail: "Kafka 파티션 전략 미확정으로 ETL 파이프라인 개발 진행 불가. 아키텍처 리뷰 일정 필요."
  },
  {
    id: 3,
    title: "Backend Team 과부하",
    category: "Weakness",
    urgency: 8,
    impact: 7,
    dueInDays: 0,
    kpiImpact: 6,
    bottleneckScore: 9,
    detail: "Backend Team 업무 부하 92%. 긴급 업무 4건 동시 진행 중."
  },
  /* Threat */
  {
    id: 4,
    title: "환율 상승 → 해외 결제 비용",
    category: "Threat",
    urgency: 6,
    impact: 7,
    dueInDays: 10,
    kpiImpact: 5,
    bottleneckScore: 3,
    detail: "USD/KRW 0.8% 상승으로 해외 PG 수수료 증가. 월 예산 약 320만원 초과 예상."
  },
  {
    id: 5,
    title: "경쟁사 AI 챗봇 출시",
    category: "Threat",
    urgency: 7,
    impact: 8,
    dueInDays: 14,
    kpiImpact: 6,
    bottleneckScore: 2,
    detail: "경쟁사 B가 유사 AI 챗봇을 이달 말 출시 예정. 베타 배포 일정 앞당기기 필요."
  },
  {
    id: 6,
    title: "release 브랜치 충돌 위험",
    category: "Threat",
    urgency: 8,
    impact: 9,
    dueInDays: 1,
    kpiImpact: 7,
    bottleneckScore: 7,
    detail: "release/v1.3에 feature/payment와 feature/auth 동시 병합 시 충돌 84% 확률 예측."
  },
  /* Strength */
  {
    id: 7,
    title: "버그 해결률 목표 초과",
    category: "Strength",
    urgency: 2,
    impact: 6,
    dueInDays: 999,
    kpiImpact: 5,
    bottleneckScore: 1,
    detail: "이번 주 버그 해결률 91%로 목표(90%) 초과. QA 프로세스 개선 효과."
  },
  {
    id: 8,
    title: "모바일 앱 91% 완료",
    category: "Strength",
    urgency: 1,
    impact: 7,
    dueInDays: 999,
    kpiImpact: 5,
    bottleneckScore: 1,
    detail: "모바일 앱 리뉴얼 91% 진행률로 순항 중. 예정보다 3일 빠른 완료 예상."
  },
  /* Opportunity */
  {
    id: 9,
    title: "AI 챗봇 시장 확장",
    category: "Opportunity",
    urgency: 5,
    impact: 9,
    dueInDays: 30,
    kpiImpact: 7,
    bottleneckScore: 1,
    detail: "B2B AI 챗봇 수요 급증. 베타 배포 완료 시 신규 고객사 3곳 계약 가능성."
  },
  {
    id: 10,
    title: "정부 AI 지원사업 신청",
    category: "Opportunity",
    urgency: 4,
    impact: 8,
    dueInDays: 21,
    kpiImpact: 4,
    bottleneckScore: 1,
    detail: "중소기업 AI 전환 지원사업 공모 접수 중. 최대 5천만원 지원 가능."
  }
];

/* =============================================
   5. Mails
============================================== */
const mails = [
  {
    id: 1,
    from: "client-a@bigcorp.com",
    fromName: "고객사 A (이진수 팀장)",
    subject: "결제 오류 긴급 확인 요청",
    receivedAt: "2026-05-17 09:30",
    unread: true,
    priority: "high",
    summary: "어제부터 결제 완료 후 영수증 미발송 오류 발생. 긴급 대응 요청. SLA 내 처리 필요.",
    slaHoursLeft: 3,
    keywords: ["긴급", "결제", "오류"]
  },
  {
    id: 2,
    from: "partner-b@techfirm.io",
    fromName: "파트너 B (박준혁 대표)",
    subject: "API 연동 계약 갱신 건",
    receivedAt: "2026-05-17 10:15",
    unread: true,
    priority: "medium",
    summary: "기존 API 계약 6월 만료 예정. 갱신 조건 협의 요청.",
    slaHoursLeft: 24,
    keywords: ["계약"]
  },
  {
    id: 3,
    from: "hr@company.com",
    fromName: "인사팀",
    subject: "5월 급여 지급 안내",
    receivedAt: "2026-05-16 16:00",
    unread: false,
    priority: "low",
    summary: "5월 급여 5/25 지급 예정. 공제 내역 확인 바람.",
    slaHoursLeft: null,
    keywords: []
  },
  {
    id: 4,
    from: "cso@company.com",
    fromName: "보안팀 (CSO)",
    subject: "긴급 보안 패치 배포 승인 요청",
    receivedAt: "2026-05-17 11:45",
    unread: true,
    priority: "high",
    summary: "CVE-2026-1042 취약점 패치. 금일 18시 이전 배포 승인 필요. 미승인 시 보안 인증 리스크 발생.",
    slaHoursLeft: 6,
    keywords: ["긴급", "보안", "마감"]
  },
  {
    id: 5,
    from: "client-c@startup.kr",
    fromName: "고객사 C (김민서 CTO)",
    subject: "AI 챗봇 베타 신청 문의",
    receivedAt: "2026-05-17 08:00",
    unread: true,
    priority: "medium",
    summary: "AI 챗봇 베타 프로그램 참여 의사 표명. 데모 일정 요청.",
    slaHoursLeft: 48,
    keywords: []
  },
  {
    id: 6,
    from: "ceo@company.com",
    fromName: "대표이사",
    subject: "[전사] 이번 주 핵심 목표 공유",
    receivedAt: "2026-05-17 07:30",
    unread: false,
    priority: "medium",
    summary: "결제 시스템 안정화 및 AI 챗봇 베타 배포가 이번 주 최우선 과제. 전 팀 집중 요청.",
    slaHoursLeft: null,
    keywords: ["대표"]
  }
];

/* =============================================
   6. Announcements
============================================== */
const announcements = [
  {
    id: 1,
    title: "이번 주 금요일 전사 배포 점검",
    category: "배포",
    important: true,
    pinned: true,
    date: "2026-05-17",
    read: false,
    content: "5/23(금) 22:00~24:00 전사 서버 배포 점검이 예정되어 있습니다. 해당 시간 서비스 일시 중단될 수 있으니 팀별 준비 바랍니다. 배포 전 체크리스트는 DevOps 팀에서 공유 예정.",
    relevantToday: true
  },
  {
    id: 2,
    title: "개인정보 처리 방침 개정 안내",
    category: "정책",
    important: true,
    pinned: false,
    date: "2026-05-15",
    read: false,
    content: "개인정보보호법 개정에 따른 내부 처리 방침 업데이트. 6/1부터 시행. 법무팀 검토 완료. 전 직원 교육 예정.",
    relevantToday: false
  },
  {
    id: 3,
    title: "신규 입사자 온보딩 교육 일정",
    category: "교육",
    important: false,
    pinned: false,
    date: "2026-05-14",
    read: true,
    content: "5/19(월) 10:00 신규 입사자 3명 온보딩 교육. 사무실 A동 2층 세미나실. 각 팀 대표자 참석 바람.",
    relevantToday: false
  },
  {
    id: 4,
    title: "5월 20일 임시 휴무 안내",
    category: "휴무",
    important: true,
    pinned: true,
    date: "2026-05-13",
    read: false,
    content: "창립기념일로 인해 5/20(수)은 전사 임시 휴무입니다. 긴급 상황 시 당직 담당자(010-XXXX-XXXX)로 연락.",
    relevantToday: false
  },
  {
    id: 5,
    title: "클라우드 비용 최적화 TF 구성",
    category: "정책",
    important: false,
    pinned: false,
    date: "2026-05-16",
    read: false,
    content: "AWS 월 비용 18% 초과로 비용 최적화 TF 구성. 팀별 리소스 사용 현황 5/24까지 제출 요망.",
    relevantToday: false
  }
];

/* =============================================
   7. Calendar Events
============================================== */
const calendarEvents = [
  {
    id: 1,
    title: "고객사 A 주간 보고",
    date: "2026-05-17",
    time: "14:00",
    type: "meeting",
    relatedProject: "AI 고객응대 챗봇",
    description: "주간 진행 현황 보고 및 결제 오류 대응 논의"
  },
  {
    id: 2,
    title: "결제 시스템 통합 테스트 마감",
    date: "2026-05-19",
    time: "18:00",
    type: "deadline",
    relatedProject: "결제 시스템 고도화",
    description: "통합 테스트 완료 및 QA 결과 제출 마감"
  },
  {
    id: 3,
    title: "전사 배포 점검",
    date: "2026-05-23",
    time: "22:00",
    type: "deploy",
    relatedProject: "전체",
    description: "금요일 밤 전사 배포 점검 윈도우"
  },
  {
    id: 4,
    title: "임시 휴무 (창립기념일)",
    date: "2026-05-20",
    time: null,
    type: "holiday",
    relatedProject: null,
    description: "전사 임시 휴무"
  },
  {
    id: 5,
    title: "데이터 파이프라인 아키텍처 리뷰",
    date: "2026-05-18",
    time: "10:00",
    type: "meeting",
    relatedProject: "데이터 파이프라인 구축",
    description: "ETL 설계 검토 및 Kafka 파티션 전략 결정"
  },
  {
    id: 6,
    title: "모바일 앱 최종 QA",
    date: "2026-05-21",
    time: "09:00",
    type: "deadline",
    relatedProject: "모바일 앱 리뉴얼",
    description: "스토어 배포 전 최종 QA 완료 기한"
  },
  {
    id: 7,
    title: "AI 챗봇 베타 데모",
    date: "2026-05-22",
    time: "15:00",
    type: "meeting",
    relatedProject: "AI 고객응대 챗봇",
    description: "고객사 C 대상 베타 데모 시연"
  },
  {
    id: 8,
    title: "전사 월간 회의",
    date: "2026-05-17",
    time: "16:00",
    type: "meeting",
    relatedProject: null,
    description: "5월 KPI 중간 점검 및 리스크 대응 논의"
  }
];

/* =============================================
   8. Exchange Rates
============================================== */
const exchangeRates = [
  {
    currency: "USD/KRW",
    rate: 1372.5,
    change: 0.8,
    prevRate: 1361.6,
    flag: "🇺🇸",
    budgetImpact: "해외 PG 결제 비용 월 +320만원 예상",
    alertThreshold: 0.5
  },
  {
    currency: "JPY/KRW",
    rate: 8.92,
    change: -0.3,
    prevRate: 8.95,
    flag: "🇯🇵",
    budgetImpact: "일본 서버 임차료 약 -15만원 절감",
    alertThreshold: 0.5
  },
  {
    currency: "EUR/KRW",
    rate: 1491.2,
    change: 0.4,
    prevRate: 1485.2,
    flag: "🇪🇺",
    budgetImpact: "EU 파트너 결제 비용 월 +80만원 예상",
    alertThreshold: 0.5
  },
  {
    currency: "CNY/KRW",
    rate: 189.3,
    change: -0.1,
    prevRate: 189.5,
    flag: "🇨🇳",
    budgetImpact: "중국 클라우드 비용 소폭 절감",
    alertThreshold: 0.5
  }
];

/* =============================================
   9. Branches
============================================== */
const branches = [
  {
    name: "main",
    type: "main",
    prCount: 0,
    conflictRisk: "low",
    lastCommit: "v1.2.1 hotfix",
    commitCount: 1,
    status: "stable"
  },
  {
    name: "develop",
    type: "develop",
    prCount: 3,
    conflictRisk: "medium",
    lastCommit: "feat: auth flow update",
    commitCount: 14,
    status: "active"
  },
  {
    name: "feature/payment",
    type: "feature",
    prCount: 1,
    conflictRisk: "high",
    lastCommit: "fix: PG timeout handling",
    commitCount: 7,
    status: "review"
  },
  {
    name: "feature/ai-chatbot",
    type: "feature",
    prCount: 0,
    conflictRisk: "low",
    lastCommit: "feat: RAG pipeline v2",
    commitCount: 23,
    status: "active"
  },
  {
    name: "release/v1.3",
    type: "release",
    prCount: 2,
    conflictRisk: "high",
    lastCommit: "chore: version bump",
    commitCount: 4,
    status: "warning"
  },
  {
    name: "hotfix/login-timeout",
    type: "hotfix",
    prCount: 1,
    conflictRisk: "low",
    lastCommit: "fix: session timeout 30m",
    commitCount: 2,
    status: "urgent"
  }
];

const branchMergeRecommendation = [
  "feature/payment → develop 먼저 병합 (QA 통과 후)",
  "hotfix/login-timeout → main 직접 반영 후 develop cherry-pick",
  "QA 완료 확인 후 release/v1.3 생성 및 staging 배포",
  "feature/ai-chatbot은 베타 배포 일정에 맞춰 다음 스프린트에 병합"
];

/* =============================================
   10. Resources (Team / Person Load)
============================================== */
const resources = [
  {
    name: "Backend Team",
    activeTasks: 9,
    urgentTasks: 4,
    meetingsThisWeek: 6,
    load: 92,
    aiNote: "QA Support Team으로 테스트 업무 1건 재배정 시 병목 점수 9 → 6으로 감소 예상"
  },
  {
    name: "AI Lab",
    activeTasks: 6,
    urgentTasks: 2,
    meetingsThisWeek: 4,
    load: 74,
    aiNote: "현재 업무량 적정 수준. 결제 QA 지원 여력 있음."
  },
  {
    name: "Frontend Team",
    activeTasks: 5,
    urgentTasks: 1,
    meetingsThisWeek: 3,
    load: 68,
    aiNote: "앱 리뉴얼 막바지 단계. 다음 주부터 여유 확보 예정."
  },
  {
    name: "Data Team",
    activeTasks: 7,
    urgentTasks: 3,
    meetingsThisWeek: 5,
    load: 87,
    aiNote: "ETL 병목으로 과부하 진입. 아키텍처 결정 지연이 원인. 리뷰 일정 앞당김 권장."
  },
  {
    name: "QA Team",
    activeTasks: 4,
    urgentTasks: 2,
    meetingsThisWeek: 2,
    load: 79,
    aiNote: "결제 모듈 QA 우선 집중 권장. 접근성 테스트는 일정 조정 가능."
  },
  {
    name: "Security Team",
    activeTasks: 3,
    urgentTasks: 2,
    meetingsThisWeek: 2,
    load: 81,
    aiNote: "취약점 패치 배포 승인 대기 중. 금일 18시 데드라인 준수 필요."
  },
  {
    name: "DevOps",
    activeTasks: 5,
    urgentTasks: 3,
    meetingsThisWeek: 4,
    load: 95,
    aiNote: "위험 수준 과부하. release 브랜치 충돌 해소 최우선. 배포 점검 준비 병행으로 부하 집중."
  },
  {
    name: "CS Team",
    activeTasks: 8,
    urgentTasks: 3,
    meetingsThisWeek: 3,
    load: 76,
    aiNote: "고객사 A 긴급 메일 미처리 상태. 즉시 대응 후 SLA 회복 필요."
  }
];

/* =============================================
   11. Decision Logs
============================================== */
const decisionLogs = [
  {
    id: 1,
    date: "2026-05-17",
    title: "결제 모듈 배포 2일 연기",
    reason: "QA 미완료 및 고객 영향도 높음. 안정성 확보 우선.",
    participants: ["PM", "Backend Lead", "QA"],
    relatedRisk: "결제 QA 병목",
    aiSummary: "안정성 우선 결정. QA 완료 후 5/20 배포 재시도 예정."
  },
  {
    id: 2,
    date: "2026-05-16",
    title: "release/v1.3 병합 순서 조정",
    reason: "feature/payment와 feature/auth 동시 병합 시 충돌 위험 84%. 순차 병합으로 변경.",
    participants: ["DevOps", "Backend Lead", "Tech Lead"],
    relatedRisk: "release 브랜치 충돌 위험",
    aiSummary: "충돌 위험 사전 차단. feature/payment 먼저 병합 후 QA 완료 확인 단계 추가."
  },
  {
    id: 3,
    date: "2026-05-15",
    title: "Data Team ETL 아키텍처 리뷰 일정 확정",
    reason: "Kafka 파티션 전략 미확정으로 개발 블로킹 발생. 5/18 긴급 리뷰 소집.",
    participants: ["CTO", "Data Team Lead", "DevOps"],
    relatedRisk: "데이터 ETL 설계 미완성",
    aiSummary: "블로킹 요인 해소를 위한 의사결정 가속화. 리뷰 결과에 따라 일정 재수립."
  },
  {
    id: 4,
    date: "2026-05-14",
    title: "고객사 A SLA 기준 조정 검토 보류",
    reason: "SLA 완화 시 서비스 신뢰도 저하 우려. 기존 기준 유지 후 CS 인력 보강으로 대응.",
    participants: ["COO", "CS Team Lead", "PM"],
    relatedRisk: "고객 응답 시간 KPI 하락",
    aiSummary: "단기 보완책(인력 보강) 채택. 장기적으로는 자동 응답 시스템 도입 검토 예정."
  },
  {
    id: 5,
    date: "2026-05-13",
    title: "모바일 앱 스토어 배포 일정 1주 앞당김",
    reason: "경쟁사 유사 앱 출시 임박. 시장 선점을 위해 리뉴얼 배포 일정 조정.",
    participants: ["CPO", "Frontend Lead", "QA"],
    relatedRisk: "경쟁사 AI 챗봇 출시",
    aiSummary: "시장 대응 우선 결정. QA 리소스 집중 투입으로 일정 준수 목표."
  }
];

/* =============================================
   12. Hot Issues
============================================== */
const hotIssues = [
  {
    id: 1,
    title: "고객 결제 오류 — 영수증 미발송",
    severity: "critical",
    trend: "상승",
    impactScore: 95,
    relatedProject: "결제 시스템 고도화",
    prediction: "해결 지연 시 고객사 A 계약 해지 위험, 매출 영향 약 2.4억원",
    tags: ["결제", "고객", "긴급"]
  },
  {
    id: 2,
    title: "release/v1.3 병합 충돌 위험",
    severity: "high",
    trend: "상승",
    impactScore: 82,
    relatedProject: "결제 시스템 고도화",
    prediction: "병합 지연 시 배포 일정 3일 이상 추가 지연 예상",
    tags: ["브랜치", "DevOps"]
  },
  {
    id: 3,
    title: "Backend Team 업무 과부하 (92%)",
    severity: "high",
    trend: "지속",
    impactScore: 78,
    relatedProject: "결제 시스템 고도화",
    prediction: "미해소 시 이번 주 내 번아웃 위험, QA 일정 추가 지연",
    tags: ["리소스", "팀"]
  },
  {
    id: 4,
    title: "CVE-2026-1042 보안 취약점 미패치",
    severity: "high",
    trend: "신규",
    impactScore: 74,
    relatedProject: "보안 인증 고도화",
    prediction: "오늘 18시 이후 미패치 시 보안 인증 유지 불가 위험",
    tags: ["보안", "긴급"]
  },
  {
    id: 5,
    title: "USD/KRW 환율 0.8% 급등",
    severity: "medium",
    trend: "상승",
    impactScore: 56,
    relatedProject: null,
    prediction: "지속 시 이번 달 해외 결제 예산 약 400만원 초과",
    tags: ["환율", "예산"]
  },
  {
    id: 6,
    title: "데이터 파이프라인 개발 블로킹",
    severity: "medium",
    trend: "지속",
    impactScore: 61,
    relatedProject: "데이터 파이프라인 구축",
    prediction: "5/18 리뷰 결정 지연 시 6월 분기 목표 달성 불가",
    tags: ["개발", "일정"]
  }
];

/* =============================================
   13. Countdown Targets
============================================== */
const countdownTargets = [
  {
    id: 1,
    label: "최종 발표",
    targetDate: "2026-06-12T10:00:00",
    color: "cyan",
    icon: "🎓"
  },
  {
    id: 2,
    label: "AI 챗봇 베타 배포",
    targetDate: "2026-05-28T18:00:00",
    color: "purple",
    icon: "🤖"
  },
  {
    id: 3,
    label: "결제 시스템 마감",
    targetDate: "2026-05-20T18:00:00",
    color: "danger",
    icon: "💳"
  },
  {
    id: 4,
    label: "전사 배포 점검",
    targetDate: "2026-05-23T22:00:00",
    color: "warning",
    icon: "🚀"
  }
];

/* =============================================
   14. Urgent Keywords (메일 하이라이트용)
============================================== */
const urgentKeywords = [
  "긴급", "장애", "계약", "환불", "오류", "대표", "마감", "클레임",
  "보안", "취약점", "결제", "에러", "중단", "실패"
];

/* =============================================
   15. Mitigation Plans (시나리오 시뮬레이션용)
   key: projectId or riskId (string)
============================================== */
const mitigationPlans = {
  // Project 1 — AI 고객응대 챗봇
  "project-1": {
    title: "AI 고객응대 챗봇 — AI 완화 플랜",
    actions: [
      "QA 테스트 케이스를 critical / non-critical로 분리하여 critical만 우선 완료 처리",
      "LLM 응답 품질 모니터링 자동화 스크립트 도입으로 수동 QA 비중 30% 축소",
      "베타 배포 범위를 내부 사용자 50명으로 제한 → 안정성 확인 후 외부 고객사로 확대",
      "고객사 C 데모 일정(5/22)에 맞춰 핵심 기능 3개만 선배포하는 Minimum Viable Demo 전략 채택"
    ]
  },
  // Project 2 — 결제 시스템 고도화
  "project-2": {
    title: "결제 시스템 고도화 — AI 완화 플랜",
    actions: [
      "QA Support Team에 엣지 케이스 테스트 1건 즉시 재배정 (Backend Team 과부하 해소)",
      "영수증 미발송 버그 핫픽스를 독립 PR로 분리하여 금일 18시 이전 배포",
      "release/v1.3 병합 전 feature/payment ↔ feature/auth 충돌 여부 CI에서 자동 감지 설정",
      "통합 테스트 마감(5/19)을 유지하되, 미통과 항목은 P2로 분류하여 다음 스프린트 이관"
    ]
  },
  // Project 3 — 모바일 앱 리뉴얼
  "project-3": {
    title: "모바일 앱 리뉴얼 — AI 완화 플랜",
    actions: [
      "접근성 검수 항목 중 WCAG AA 필수 항목만 선별하여 5/21 QA 내 완료 집중",
      "스토어 배포 전 내부 TestFlight / 내부 테스트 트랙으로 100명 베타 배포 실시",
      "경쟁사 대응을 위해 스토어 출시일을 5/26(기존 6/10)으로 2주 앞당기는 일정 재검토",
      "배포 후 사용자 만족도 인앱 설문(NPS) 자동 발송 설정하여 KPI 즉시 추적"
    ]
  },
  // Project 4 — 데이터 파이프라인 구축
  "project-4": {
    title: "데이터 파이프라인 구축 — AI 완화 플랜",
    actions: [
      "5/18 아키텍처 리뷰에서 Kafka 파티션 수를 12로 확정하고 ETL 개발 즉시 재개",
      "CTO 결정 전 임시 파티션 설정(6개)으로 병렬 개발 진행하여 블로킹 해소",
      "ETL 1차 마일스톤을 '기본 수집 파이프라인 완료'로 축소 → 5/24 내 달성 가능",
      "데이터 검증 단계에 자동화 테스트 스위트 도입으로 수동 검증 공수 40% 절감"
    ]
  },
  // Project 5 — 보안 인증 고도화
  "project-5": {
    title: "보안 인증 고도화 — AI 완화 플랜",
    actions: [
      "CVE-2026-1042 패치 PM 승인을 오늘 16시로 앞당겨 18시 마감 전 배포 완료",
      "2FA 강제화 적용 대상을 관리자 계정으로 한정하여 1차 배포 범위 축소",
      "외부 보안 감사 결과 Critical 항목만 즉시 처리, Medium 이하는 다음 스프린트 반영",
      "PKCE 적용 후 OAuth 토큰 갱신 자동화 테스트를 CI 파이프라인에 포함"
    ]
  },
  // Risk 1 — 결제 QA 병목
  "risk-1": {
    title: "결제 QA 병목 — AI 완화 플랜",
    actions: [
      "QA Support Team 즉시 투입 (업무 재배정 PM 승인 금일 내 처리)",
      "테스트 케이스 Priority Matrix 작성 → P0만 금주 통과 목표",
      "자동화 회귀 테스트 스크립트로 반복 테스트 60% 대체",
      "Backend Lead 미팅 주 3→5회로 증가, 일일 블로커 제거 스탠드업 실시"
    ]
  },
  // Risk 2 — ETL 설계 미완성
  "risk-2": {
    title: "데이터 ETL 설계 미완성 — AI 완화 플랜",
    actions: [
      "5/18 아키텍처 리뷰 전 CTO와 사전 미팅으로 파티션 전략 후보 2개로 압축",
      "임시 설계(파티션 6개)로 병렬 개발 진행, 최종 결정 후 마이그레이션 스크립트 준비",
      "Kafka 설정값을 Infrastructure as Code(Terraform)로 관리하여 변경 시 자동 배포",
      "ETL 일정 버퍼 3일 추가 확보 — 데이터 검증 단계 자동화로 상쇄"
    ]
  },
  // Risk 3 — Backend Team 과부하
  "risk-3": {
    title: "Backend Team 과부하 — AI 완화 플랜",
    actions: [
      "영수증 발송 버그 수정을 AI Lab Backend 엔지니어 1명이 지원 (즉시 가능)",
      "이번 주 신규 업무 접수 중단, 긴급 4건만 집중 처리 후 주말 완료 목표",
      "회의 6건 중 3건 비동기(Notion 문서)로 전환하여 집중 개발 시간 확보",
      "Sprint 다음 주부터 Backend Team 업무 총량 30% 감축 계획 수립"
    ]
  },
  // Risk 6 — release 브랜치 충돌
  "risk-6": {
    title: "release 브랜치 충돌 위험 — AI 완화 플랜",
    actions: [
      "feature/payment PR 먼저 병합 → CI 통과 확인 후 feature/auth 병합 (순차 처리)",
      "충돌 예상 파일 목록을 Git diff로 사전 추출하여 양 팀이 오늘 중 충돌 수동 해소",
      "release/v1.3 브랜치에 Branch Protection Rule 설정 — 리뷰어 2명 승인 필수",
      "Merge 후 즉시 Staging 환경 스모크 테스트 자동 실행 설정"
    ]
  }
};

/* =============================================
   16. Meeting Prep Data (캘린더 AI 미팅 준비용)
   key: calendarEvent.id (number)
============================================== */
const meetingPrepData = {
  // Event 1 — 고객사 A 주간 보고
  1: {
    relatedKpis: ["고객 응답 시간", "일정 준수율", "서비스 안정성"],
    relatedMailIds: [1, 6],
    expectedQuestions: [
      "영수증 미발송 버그는 언제 해결됩니까? 이번 주 안에 가능한가요?",
      "결제 오류가 재발하지 않으려면 어떤 조치를 취하고 있나요?",
      "AI 챗봇 프로젝트 진행률이 72%인데, 베타 배포 일정은 확정인가요?",
      "SLA 기준을 지속적으로 충족할 수 있는 체계가 마련되어 있나요?"
    ],
    talkingPoints: [
      "결제 오류 핫픽스 금일 배포 예정 — 구체적 일정 공유",
      "고객 응답 시간 KPI 현황(82%) 및 개선 계획 브리핑",
      "AI 챗봇 QA 현황 및 5/28 베타 배포 일정 재확인"
    ]
  },
  // Event 2 — 결제 시스템 통합 테스트 마감
  2: {
    relatedKpis: ["일정 준수율", "서비스 안정성", "버그 해결률"],
    relatedMailIds: [1, 4],
    expectedQuestions: [
      "통합 테스트에서 미통과한 케이스는 몇 건이며 모두 P0인가요?",
      "5/19 마감 준수가 어렵다면 배포 일정은 얼마나 밀릴 예정인가요?",
      "QA Team 리소스 79% 과부하 상황에서 추가 지원 계획이 있나요?",
      "release/v1.3 병합 순서가 이번 마감에 영향을 주나요?"
    ],
    talkingPoints: [
      "엣지 케이스 목록 및 P0/P1 분류 현황 공유",
      "Backend Team 과부하 → QA 지원 인력 재배정 계획",
      "병합 충돌 위험 대응 현황 (순차 병합 계획)"
    ]
  },
  // Event 3 — 전사 배포 점검
  3: {
    relatedKpis: ["서비스 안정성", "프로젝트 완료율"],
    relatedMailIds: [4, 6],
    expectedQuestions: [
      "배포 점검 중 서비스 중단 시간은 최대 얼마나 예상되나요?",
      "롤백 플랜이 준비되어 있나요?",
      "이번 배포에 포함될 기능 목록과 영향 범위는 무엇인가요?",
      "보안 패치(CVE-2026-1042)도 이번 배포에 포함되나요?"
    ],
    talkingPoints: [
      "배포 체크리스트 완료 현황 및 롤백 절차",
      "서비스 중단 예상 시간 및 사용자 공지 계획",
      "당직 담당자 연락처 및 비상 대응 프로세스"
    ]
  },
  // Event 5 — 데이터 파이프라인 아키텍처 리뷰
  5: {
    relatedKpis: ["프로젝트 완료율", "팀 업무 처리율"],
    relatedMailIds: [6],
    expectedQuestions: [
      "Kafka 파티션을 12개로 설정한 근거가 무엇인가요?",
      "현재 ETL 블로킹의 근본 원인이 설계 결정 지연 하나뿐인가요?",
      "임시 설계(파티션 6개)로 병렬 개발을 진행할 경우 마이그레이션 비용은 어느 정도인가요?",
      "5/24 데이터 검증 단계 마감에 맞추려면 오늘 어떤 결정이 필수인가요?"
    ],
    talkingPoints: [
      "파티션 후보 2개(6개 vs 12개) 장단점 비교표",
      "ETL 병목이 프로젝트 완료율 KPI에 미치는 영향 수치 제시",
      "리뷰 이후 즉시 개발 재개 가능한 체크리스트 준비"
    ]
  },
  // Event 7 — AI 챗봇 베타 데모
  7: {
    relatedKpis: ["사용자 만족도", "매출 목표 달성률", "고객 응답 시간"],
    relatedMailIds: [5, 6],
    expectedQuestions: [
      "현재 챗봇이 처리 가능한 문의 유형과 범위는 어디까지인가요?",
      "RAG 파이프라인의 응답 정확도는 몇 %이며 어떻게 측정하나요?",
      "베타 기간 중 오류 발생 시 SLA는 어떻게 되나요?",
      "정식 출시 일정과 가격 정책은 언제 확정되나요?"
    ],
    talkingPoints: [
      "핵심 기능 3가지 라이브 데모 (시나리오 시트 준비)",
      "RAG 정확도 92% 및 응답 속도 1.2초 평균 지표 공유",
      "베타 참여 조건 및 온보딩 프로세스 안내"
    ]
  },
  // Event 8 — 전사 월간 회의
  8: {
    relatedKpis: ["일정 준수율", "고객 응답 시간", "프로젝트 완료율", "팀 업무 처리율"],
    relatedMailIds: [6, 1],
    expectedQuestions: [
      "이번 달 KPI 목표 대비 실적이 가장 낮은 항목은 무엇이고 원인은 무엇인가요?",
      "위험 프로젝트 2개(결제, 데이터 파이프라인)의 만회 계획이 현실적인가요?",
      "Backend Team 과부하가 계속된다면 외부 채용이나 외주를 고려하고 있나요?",
      "이번 주 핵심 목표(결제 안정화 + AI 챗봇 베타) 달성 가능성은 몇 %로 보나요?"
    ],
    talkingPoints: [
      "5개 KPI 신호등 현황 요약 (빨강 2개 중점 대응 계획)",
      "위험 프로젝트 만회 계획 및 리소스 재배치 안",
      "이번 주 핵심 액션 5개 및 담당자 지정 현황"
    ]
  }
};
