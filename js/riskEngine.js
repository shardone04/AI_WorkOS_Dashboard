/* ==============================================
   WorkOS AI Command Center — riskEngine.js
   모든 계산 로직 담당. data.js 이후 로드.
   Section Map:
   1.  날짜 유틸리티
   2.  Priority Score 계산
   3.  KPI Status 판단
   4.  Risk Signal Stream 생성
   5.  Scenario Simulation
   6.  AI Daily Briefing 텍스트 생성
   7.  AI Action Recommendations 생성
   8.  LocalStorage 유틸리티
   9.  전역 상태 초기화
============================================== */

/* =============================================
   1. 날짜 유틸리티
============================================== */

/**
 * 날짜 문자열 → 오늘 기준 D-day 반환 (양수=남은 일수, 음수=초과)
 */
function getDaysLeft(dateString) {
  if (!dateString) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

/**
 * 마감일 기반 0~10 점수 반환 (임박할수록 높음)
 */
function getDeadlineScore(dateString) {
  const days = getDaysLeft(dateString);
  if (days < 0)  return 10; // 이미 초과
  if (days <= 1) return 10;
  if (days <= 3) return 8;
  if (days <= 7) return 6;
  if (days <= 14) return 4;
  if (days <= 30) return 2;
  return 1;
}

/**
 * D-day 문자열 표현 반환
 */
function getDdayLabel(dateString) {
  const days = getDaysLeft(dateString);
  if (days === 0)  return 'D-Day';
  if (days > 0)    return `D-${days}`;
  return `D+${Math.abs(days)}`;
}

/**
 * 현재 날짜/시간을 한국어 포맷으로 반환
 */
function getKoreanDateTime() {
  const now = new Date();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const w = weekdays[now.getDay()];
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${y}.${m}.${d} (${w}) ${hh}:${mm}:${ss}`;
}

/**
 * "HH:MM" 문자열 반환
 */
function getTimeString() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/* =============================================
   2. Priority Score 계산
============================================== */

/**
 * task 또는 risk 객체로부터 우선순위 점수(0~100) 계산
 * 공식: urgency*0.3 + impact*0.3 + deadlineScore*0.2 + kpiImpact*0.1 + bottleneckScore*0.1
 */
function calculatePriority(item) {
  const urgency        = (item.urgency        || 0) * 10; // /10 스케일 → *10 = /100 아님, 원점수 0~10
  const impact         = (item.impact         || 0) * 10;
  const deadlineScore  = getDeadlineScore(item.dueDate || item.dueInDaysRef) * 10;
  const kpiImpact      = (item.kpiImpact      || 0) * 10;
  const bottleneck     = (item.bottleneckScore || 0) * 10;

  const score =
    urgency       * 0.30 +
    impact        * 0.30 +
    deadlineScore * 0.20 +
    kpiImpact     * 0.10 +
    bottleneck    * 0.10;

  return Math.round(Math.min(100, score));
}

/**
 * risk 객체용 priority score (dueInDays 기반)
 */
function calculateRiskPriority(risk) {
  const urgency   = risk.urgency        * 10;
  const impact    = risk.impact         * 10;
  const kpi       = risk.kpiImpact      * 10;
  const bottle    = risk.bottleneckScore* 10;

  // dueInDays → deadlineScore 변환
  let ds = 1;
  if (risk.dueInDays < 0)  ds = 10;
  else if (risk.dueInDays <= 1)  ds = 10;
  else if (risk.dueInDays <= 3)  ds = 8;
  else if (risk.dueInDays <= 7)  ds = 6;
  else if (risk.dueInDays <= 14) ds = 4;
  else if (risk.dueInDays <= 30) ds = 2;
  const deadline = ds * 10;

  const score =
    urgency  * 0.30 +
    impact   * 0.30 +
    deadline * 0.20 +
    kpi      * 0.10 +
    bottle   * 0.10;

  return Math.round(Math.min(100, score));
}

/**
 * task 배열을 priorityScore 내림차순으로 정렬하여 반환
 */
function getSortedTasks() {
  // LocalStorage에서 완료 상태 복원
  const doneIds = loadFromLocalStorage('todoStatus') || [];
  return tasks
    .map(t => ({
      ...t,
      priorityScore: calculatePriority(t),
      isDone: doneIds.includes(t.id)
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

/* =============================================
   3. KPI Status 판단
============================================== */

/**
 * current / target 비율로 green/yellow/red 반환
 */
function getKpiStatus(current, target) {
  if (!target) return 'green';
  const ratio = current / target;
  if (ratio >= 0.95) return 'green';
  if (ratio >= 0.80) return 'yellow';
  return 'red';
}

/**
 * kpis 배열에 status 필드를 추가하여 반환
 */
function getKpisWithStatus() {
  return kpis.map(k => ({
    ...k,
    status: getKpiStatus(k.current, k.target)
  }));
}

/**
 * KPI 경고(yellow+red) 수 반환
 */
function countKpiAlerts() {
  return kpis.filter(k => getKpiStatus(k.current, k.target) !== 'green').length;
}

/* =============================================
   4. Risk Signal Stream 생성
============================================== */

/**
 * 현재 데이터 기반으로 실시간 위험 신호 로그 배열 생성
 * @returns {Array<{time: string, text: string, level: string}>}
 */
function generateRiskSignals() {
  const signals = [];
  const now = new Date();

  const addSignal = (minutesAgo, text, level = 'warning') => {
    const t = new Date(now - minutesAgo * 60000);
    const hh = String(t.getHours()).padStart(2, '0');
    const mm = String(t.getMinutes()).padStart(2, '0');
    signals.push({ time: `${hh}:${mm}`, text, level });
  };

  // 프로젝트 기반 신호
  projects.forEach(p => {
    const days = getDaysLeft(p.deadline);
    if (p.status === 'danger' && days <= 5) {
      addSignal(Math.floor(Math.random() * 60) + 10, `[${p.name}] 마감 D-${days} 위험 상태 감지`, 'danger');
    } else if (p.status === 'warning') {
      addSignal(Math.floor(Math.random() * 90) + 20, `[${p.name}] 진행률 ${p.progress}% — 주의 상태`, 'warning');
    }
  });

  // KPI 기반 신호
  kpis.forEach(k => {
    const st = getKpiStatus(k.current, k.target);
    if (st === 'red') {
      addSignal(Math.floor(Math.random() * 120) + 30, `KPI [${k.name}] Red 전환 — 목표 대비 ${Math.round((1 - k.current/k.target)*100)}% 미달`, 'danger');
    } else if (st === 'yellow') {
      addSignal(Math.floor(Math.random() * 150) + 40, `KPI [${k.name}] Yellow 경보 — 추세 ${k.trend > 0 ? '↑' : '↓'}${Math.abs(k.trend)}%`, 'warning');
    }
  });

  // 메일 기반 신호
  mails.filter(m => m.unread && !AppState.repliedMails?.has(m.id) && m.priority === 'high').forEach(m => {
    addSignal(Math.floor(Math.random() * 60) + 5, `긴급 메일 수신 — ${m.fromName}: "${m.subject}"`, 'danger');
  });

  // 브랜치 기반 신호
  branches.filter(b => b.conflictRisk === 'high').forEach(b => {
    addSignal(Math.floor(Math.random() * 80) + 15, `[${b.name}] 병합 충돌 위험 HIGH — PR ${b.prCount}건 대기 중`, 'danger');
  });

  // 리소스 과부하 신호
  resources.filter(r => r.load >= 90).forEach(r => {
    addSignal(Math.floor(Math.random() * 100) + 20, `[${r.name}] 업무 부하 ${r.load}% — 위험 수준`, 'danger');
  });

  // 환율 신호
  exchangeRates.filter(e => Math.abs(e.change) >= e.alertThreshold).forEach(e => {
    const dir = e.change > 0 ? '상승' : '하락';
    addSignal(Math.floor(Math.random() * 200) + 60, `환율 [${e.currency}] ${dir} ${Math.abs(e.change)}% — 예산 영향 발생`, 'warning');
  });

  // 시간순(최신 → 오래된) 정렬
  signals.sort((a, b) => b.time.localeCompare(a.time));

  // 최대 12개 반환
  return signals.slice(0, 12);
}

/* =============================================
   6. Scenario Simulation
============================================== */

/**
 * 특정 업무가 지연될 때 조직에 미치는 영향 계산
 * @param {number} taskId - tasks 배열의 id
 * @param {number} delayDays - 지연 일수
 * @returns {object} 시뮬레이션 결과
 */
function simulateDelay(taskId, delayDays) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  const days = parseInt(delayDays, 10);

  // 관련 프로젝트 찾기
  const relatedProject = task.projectId
    ? projects.find(p => p.id === task.projectId)
    : null;

  // KPI 영향 계산 (일정 준수율 기준)
  const scheduleKpi = kpis.find(k => k.name === '일정 준수율');
  const currentScheduleKpi = scheduleKpi ? scheduleKpi.current : 78;
  const kpiDrop = Math.round(days * 2.3);
  const newKpi = Math.max(0, currentScheduleKpi - kpiDrop);

  // 우선순위 점수 상승
  const currentPriority = calculatePriority(task);
  const newPriority = Math.min(100, currentPriority + days * 2);

  // 프로젝트 배포 지연 예측 (일수)
  const deployDelay = relatedProject ? Math.round(days * 0.7) : 0;

  // 고객 영향
  const customerImpact = task.kpiImpact >= 7
    ? `고객사 SLA 위반 위험 — ${task.owner} 담당 업무 ${days}일 지연 시 고객 응대 품질 저하`
    : '직접적 고객 영향 낮음';

  // 연쇄 영향 업무 찾기 (같은 프로젝트 내 다른 업무)
  const chainTasks = tasks
    .filter(t => t.id !== taskId && t.projectId === task.projectId && !t.isDone)
    .slice(0, 2)
    .map(t => t.title);

  // Telegram 알림 권장 여부
  const recommendTelegram = newPriority >= 85 || days >= 3;

  return {
    taskTitle: task.title,
    taskOwner: task.owner,
    delayDays: days,
    currentPriority,
    newPriority,
    currentKpi: currentScheduleKpi,
    newKpi,
    kpiDrop,
    deployDelay,
    customerImpact,
    chainTasks,
    recommendTelegram,
    relatedProjectName: relatedProject ? relatedProject.name : '없음'
  };
}

/* =============================================
   7. AI Daily Briefing 텍스트 생성
============================================== */

/**
 * 현재 데이터를 분석해 브리핑 텍스트 및 추천 액션 생성
 * @returns {{ status: string, statusLabel: string, signalCount: number }}
 */
function calculateOperationalStatus() {
  const dangerProjects = projects.filter(p => p.status === 'danger').length;
  const warningProjects = projects.filter(p => p.status === 'warning').length;
  const kpiAlerts = countKpiAlerts();
  const urgentMails = mails.filter(m => m.unread && !AppState.repliedMails?.has(m.id) && m.priority === 'high').length;
  const overloadedTeams = resources.filter(r => r.load >= 90).length;
  const signalCount = dangerProjects + warningProjects + kpiAlerts + urgentMails + overloadedTeams;

  let status = 'Stable';
  if (dangerProjects > 0 || urgentMails >= 2 || overloadedTeams > 0) status = 'Critical';
  else if (warningProjects > 0 || kpiAlerts > 0 || urgentMails > 0) status = 'Warning';

  const statusLabel = status === 'Critical' ? '🔴 위험' : status === 'Warning' ? '🟡 주의' : '🟢 안정';
  return { status, statusLabel, signalCount };
}

/**
 * 현재 데이터를 분석해 브리핑 텍스트 및 추천 액션 생성
 * @returns {{ status: string, statusLabel: string, text: string, actions: string[], signalCount: number }}
 */
function generateDailyBriefing() {
  const { status, statusLabel, signalCount } = calculateOperationalStatus();
  const dangerProjects  = projects.filter(p => p.status === 'danger');
  const warningProjects = projects.filter(p => p.status === 'warning');
  const kpiAlerts       = countKpiAlerts();
  const urgentMails     = mails.filter(m => m.unread && !AppState.repliedMails?.has(m.id) && m.priority === 'high');
  const sortedTasks     = getSortedTasks();
  const topTasks        = sortedTasks.filter(t => !t.isDone).slice(0, 3);
  const overloadedTeams = resources.filter(r => r.load >= 90);

  // 브리핑 본문 구성
  let text = `오늘 조직 상태는 <strong>'${statusLabel}'</strong>입니다. `;

  if (dangerProjects.length > 0) {
    text += `<strong>${dangerProjects.map(p => p.name).join(', ')}</strong> 프로젝트가 위험 상태이며, `;
  }
  if (warningProjects.length > 0) {
    text += `<strong>${warningProjects.length}개</strong> 프로젝트가 주의 단계입니다. `;
  }
  if (kpiAlerts > 0) {
    const redKpis = kpis.filter(k => getKpiStatus(k.current, k.target) === 'red').map(k => k.name);
    text += `KPI <strong>${redKpis.length > 0 ? redKpis.join(', ') : ''}${redKpis.length > 0 ? ' 등 ' : ''}${kpiAlerts}개</strong>가 목표치 미달입니다. `;
  }
  if (overloadedTeams.length > 0) {
    text += `<strong>${overloadedTeams.map(r => r.name).join(', ')}</strong>의 업무 부하가 ${overloadedTeams.map(r => r.load+'%').join(', ')}로 과부하 상태입니다. `;
  }
  if (urgentMails.length > 0) {
    text += `긴급 미처리 메일 <strong>${urgentMails.length}건</strong>이 SLA 내 답변을 기다리고 있습니다.`;
  }

  // 추천 액션 3개 (우선순위 상위 업무 기반)
  const actions = topTasks.map(t => {
    const days = getDaysLeft(t.dueDate);
    const dday = days <= 0 ? '기한 초과' : `D-${days}`;
    return `${t.title} — ${t.owner} (${dday}, 우선순위 ${t.priorityScore}점)`;
  });

  if (actions.length === 0) {
    actions.push('모든 긴급 업무가 완료되었습니다. 다음 마일스톤을 확인하세요.');
  }

  return { status, statusLabel, text, actions, signalCount };
}

/* =============================================
   8. AI Action Recommendations 생성
============================================== */

/**
 * 오늘의 추천 액션 3~5개 생성
 * @returns {string[]}
 */
function generateActionRecommendations() {
  const recs = [];
  const sortedTasks = getSortedTasks().filter(t => !t.isDone);

  // ① 최우선 업무
  if (sortedTasks.length > 0) {
    const top = sortedTasks[0];
    recs.push(`[긴급] ${top.title} — ${top.owner} 즉시 처리 (우선순위 ${top.priorityScore}점)`);
  }

  // ② 긴급 메일 처리
  const urgentMail = mails.find(m => m.unread && m.priority === 'high' && m.slaHoursLeft);
  if (urgentMail) {
    recs.push(`[메일] ${urgentMail.fromName} 답변 — SLA ${urgentMail.slaHoursLeft}시간 이내`);
  }

  // ③ 브랜치 충돌 위험
  const highRiskBranch = branches.find(b => b.conflictRisk === 'high');
  if (highRiskBranch) {
    recs.push(`[브랜치] ${highRiskBranch.name} 충돌 위험 해소 — DevOps 긴급 확인`);
  }

  // ④ 과부하 팀 재배정
  const mostLoaded = resources.sort((a, b) => b.load - a.load)[0];
  if (mostLoaded && mostLoaded.load >= 90) {
    recs.push(`[리소스] ${mostLoaded.name} 업무 재배정 검토 (현재 ${mostLoaded.load}%)`);
  }

  // ⑤ KPI red 항목
  const redKpi = kpis.find(k => getKpiStatus(k.current, k.target) === 'red');
  if (redKpi) {
    recs.push(`[KPI] ${redKpi.name} 개선 조치 — 현재 ${redKpi.current}${redKpi.unit} / 목표 ${redKpi.target}${redKpi.unit}`);
  }

  return recs.slice(0, 5);
}

/* =============================================
   9. LocalStorage 유틸리티
============================================== */

function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(`workos_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage 저장 실패:', e);
  }
}

function loadFromLocalStorage(key) {
  try {
    const raw = localStorage.getItem(`workos_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('LocalStorage 읽기 실패:', e);
    return null;
  }
}

function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(`workos_${key}`);
  } catch (e) {
    console.warn('LocalStorage 삭제 실패:', e);
  }
}

/* =============================================
   10. 전역 상태 초기화 및 노출
============================================== */

/**
 * 앱 전체에서 공유하는 런타임 상태
 */
const AppState = {
  // 현재 활성 탭 필터
  taskFilter: 'all',
  feedFilter: 'all',

  // 캘린더 현재 표시 년월
  calYear:  new Date().getFullYear(),
  calMonth: new Date().getMonth(),

  // 선택된 캘린더 날짜
  selectedDate: null,

  // 사용자 추가 커스텀 태스크 (LocalStorage 연동)
  customTasks: [],

  // 챗봇 대화 기록
  chatHistory: [],

  // Telegram 전송 로그
  telegramLogs: [],

  // 읽은/답변 완료 메일 ID 목록
  readMails: new Set(),
  repliedMails: new Set(),

  // 읽은 공지 ID 목록
  readAnnouncements: new Set(),

  // 현재 테마
  theme: 'dark',

  // 실시간 리스크 신호
  riskSignals: [],

  // 사이드바 collapse 상태
  sidebarCollapsed: false,
  copilotCollapsed: false,
};

/**
 * LocalStorage에서 영구 저장 데이터를 복원하여 AppState에 반영
 */
function restoreAppState() {
  // 테마
  // 이번 제출본은 첫 진입 기본값을 반드시 다크모드로 둔다.
  // 이전 테스트에서 localStorage에 light가 남아 있으면 첫 화면이 밝게 열리는 문제가 있어,
  // 디자인 버전 키가 없을 때 한 번만 dark로 초기화한다. 이후 사용자가 토글한 값은 유지된다.
  const THEME_VERSION_KEY = 'workosThemeDefaultApplied_v3';
  if (!localStorage.getItem(THEME_VERSION_KEY)) {
    saveToLocalStorage('theme', 'dark');
    localStorage.setItem(THEME_VERSION_KEY, 'true');
  }
  const savedTheme = loadFromLocalStorage('theme') || 'dark';
  AppState.theme = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

  // Todo 완료 상태
  const todoStatus = loadFromLocalStorage('todoStatus') || [];
  AppState.completedTaskIds = new Set(todoStatus);

  // 커스텀 태스크
  AppState.customTasks = loadFromLocalStorage('customTasks') || [];

  // 읽은 메일
  const readMails = loadFromLocalStorage('readMails') || [];
  AppState.readMails = new Set(readMails);

  // 읽은 공지
  const readAnn = loadFromLocalStorage('readAnnouncements') || [];
  AppState.readAnnouncements = new Set(readAnn);

  // 답변 완료 메일
  const repliedMails = loadFromLocalStorage('repliedMails') || [];
  AppState.repliedMails = new Set(repliedMails);

  // Telegram 로그
  AppState.telegramLogs = loadFromLocalStorage('telegramLogs') || [];

  // 챗봇 대화 기록
  AppState.chatHistory = loadFromLocalStorage('chatHistory') || [];

  // 리스크 신호 생성
  AppState.riskSignals = generateRiskSignals();

}

/**
 * 조직 상태 배지 업데이트 (header)
 */
function updateOrgBadge() {
  const badge   = document.getElementById('org-status-badge');
  const badgeText = document.getElementById('org-badge-text');
  if (!badge) return;

  const { status } = calculateOperationalStatus();
  badge.className = 'org-badge';
  if (status === 'Critical') {
    badge.classList.add('org-badge--critical');
    badgeText.textContent = 'Critical';
  } else if (status === 'Warning') {
    badge.classList.add('org-badge--warning');
    badgeText.textContent = 'Warning';
  } else {
    badge.classList.add('org-badge--stable');
    badgeText.textContent = 'Stable';
  }
}

/**
 * 알림 카운트 배지 업데이트
 */
function updateNotifCount() {
  const urgentUnread = mails.filter(m => m.unread && !AppState.repliedMails?.has(m.id) && m.priority === 'high').length;
  const el = document.getElementById('notif-count');
  if (el) {
    el.textContent = urgentUnread;
    el.style.display = urgentUnread > 0 ? 'flex' : 'none';
  }

  // 사이드바 메일 배지
  const mailBadge = document.getElementById('nav-mail-count');
  const unreadTotal = mails.filter(m => m.unread && !AppState.repliedMails?.has(m.id)).length;
  if (mailBadge) {
    mailBadge.textContent = unreadTotal || '';
    mailBadge.style.display = unreadTotal > 0 ? 'flex' : 'none';
  }
}

/**
 * 헤더 날짜/시간 실시간 업데이트
 */
function startClock() {
  const el = document.getElementById('header-datetime');
  if (!el) return;
  const tick = () => { el.textContent = getKoreanDateTime(); };
  tick();
  setInterval(tick, 1000);
}

/**
 * 사이드바 네비게이션 활성 상태 업데이트
 */
function updateNavActive(sectionId) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === sectionId);
  });
}
