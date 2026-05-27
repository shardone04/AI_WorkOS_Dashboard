/* ==============================================
   WorkOS Final Submission Integrations
   - Google login shell
   - Admin/team visibility console
   - Slack-style team chat
   - Meeting audio transcription + concise MD summary
   - Google Sheet expense sync + settlement analytics
   - Post-it board, lunch recommendation, healing player
   - Railway/API integration status
============================================== */

const FinalRuntime = {
  config: {
    googleClientId: '',
    features: {
      slack: false,
      openai: false,
      anthropic: false,
      googleSheets: false,
      gmail: false,
      railway: false
    }
  },
  currentUser: null,
  isAdmin: false,
  userClaudeApiKey: '',
  meetingOpenAiApiKey: '',
  expenseRows: [],
  expenseChart: null,
  settlementChart: null,
  audio: {
    ctx: null,
    nodes: [],
    playing: false
  }
};

window.FinalRuntime = FinalRuntime;

const teamMembers = [
  { id: 'admin', name: '사지윤', role: 'Ops Manager', team: 'PMO', status: 'online' },
  { id: 'soyeon', name: '김소연', role: 'Frontend Lead', team: 'Frontend', status: 'online' },
  { id: 'jaehoon', name: '박재훈', role: 'Data Engineer', team: 'Data', status: 'busy' },
  { id: 'minjun', name: '이민준', role: 'Security Lead', team: 'Security', status: 'online' },
  { id: 'backend', name: 'Backend Lead', role: 'API Owner', team: 'Backend', status: 'busy' },
  { id: 'qa', name: 'QA Manager', role: 'Quality Owner', team: 'QA', status: 'online' },
  { id: 'devops', name: 'DevOps Lead', role: 'Release Owner', team: 'DevOps', status: 'busy' },
  { id: 'cs', name: 'CS Manager', role: 'SLA Owner', team: 'CS', status: 'away' },
  { id: 'finance', name: 'Finance Keeper', role: 'Expense Owner', team: 'Finance', status: 'online' },
  { id: 'hr', name: 'HR Partner', role: 'People Ops', team: 'HR', status: 'online' }
];

const dashboardBoards = [
  { id: 'overview', label: 'Overview', owner: 'admin' },
  { id: 'projects', label: 'Projects', owner: 'admin' },
  { id: 'kpi', label: 'KPI / 결산', owner: 'finance' },
  { id: 'meeting', label: 'Meeting AI', owner: 'admin' },
  { id: 'expense', label: 'Shared Expenses', owner: 'finance' },
  { id: 'risk', label: 'Risk & Issues', owner: 'devops' }
];

const knowledgeMapMenus = {
  briefing: {
    label: 'Overview',
    page: 'briefing',
    tasks: [
      'AI 브리핑과 핵심 지표를 먼저 확인',
      '포스트잇과 환율 알림으로 오늘 운영 흐름 점검',
      '팀 공지와 진행 상태를 한 화면에서 정렬'
    ]
  },
  projects: {
    label: 'Projects',
    page: 'projects',
    tasks: [
      '프로젝트 진행률과 마감 D-day 확인',
      '의사결정 로그로 병목 이슈 추적',
      '담당자별 다음 액션을 빠르게 배정'
    ]
  },
  risk: {
    label: 'Risk',
    page: 'risk',
    tasks: [
      '핫이슈와 리스크 매트릭스 우선순위 확인',
      '시나리오 시뮬레이션으로 지연 영향 예측',
      '긴급 알림 전송 전 위험 근거 점검'
    ]
  },
  comms: {
    label: 'Comms',
    page: 'comms',
    tasks: [
      '업무 메일과 팀 채팅을 함께 확인',
      'Gmail 자동화 초안과 발송 상태 점검',
      '조직 뉴스피드에서 공유 필요 이슈 선별'
    ]
  },
  meeting: {
    label: 'Meeting AI',
    page: 'meeting',
    tasks: [
      'mp3 또는 m4a 회의 음성 업로드',
      '결정사항 중심으로 회의 요약 MD 생성',
      '회의 전 준비 질문과 관련 KPI 확인'
    ]
  },
  expenses: {
    label: 'Expenses',
    page: 'expenses',
    tasks: [
      '공동 경비 카테고리와 담당자별 지출 확인',
      'Google Sheet 경비 데이터 동기화',
      '정산 분석에서 일일/월간 결산 흐름 점검'
    ]
  },
  kpi: {
    label: 'KPI',
    page: 'kpi',
    tasks: [
      '목표 대비 실적과 경고 지표 확인',
      '일일·주간·월간 결산 추세 점검',
      '정산 지표와 운영 KPI를 연결해 해석'
    ]
  }
};

const sampleExpenses = [
  { date: '2026-05-20', category: '식비', item: '팀 점심 회의', amount: 128000, owner: '사지윤', method: '법인카드' },
  { date: '2026-05-20', category: '소모품', item: '화이트보드 마커', amount: 26000, owner: 'HR Partner', method: '공동경비' },
  { date: '2026-05-21', category: '교육', item: 'AI 분석 강의 수강권', amount: 180000, owner: '김소연', method: '계좌이체' },
  { date: '2026-05-22', category: '자격', item: '보안 인증 응시료', amount: 95000, owner: '이민준', method: '법인카드' },
  { date: '2026-05-23', category: '교통', item: '고객사 방문 택시', amount: 42000, owner: 'CS Manager', method: '개인정산' },
  { date: '2026-05-24', category: '클라우드', item: '테스트 서버 증설', amount: 360000, owner: 'DevOps Lead', method: '법인카드' },
  { date: '2026-05-25', category: '식비', item: '배포 야근 식대', amount: 214000, owner: 'Backend Lead', method: '공동경비' },
  { date: '2026-05-26', category: '소모품', item: '회의실 케이블 세트', amount: 58000, owner: '박재훈', method: '공동경비' },
  { date: '2026-05-27', category: '교육', item: '데이터 시각화 워크숍', amount: 240000, owner: '사지윤', method: '법인카드' },
  { date: '2026-05-27', category: '식비', item: 'PMO 데일리 스탠드업 간식', amount: 48000, owner: '김소연', method: '공동경비' },
  { date: '2026-05-28', category: '클라우드', item: 'Railway 테스트 크레딧', amount: 72000, owner: 'DevOps Lead', method: '법인카드' },
  { date: '2026-05-28', category: '소모품', item: '회의실 HDMI 허브', amount: 39000, owner: '박재훈', method: '공동경비' },
  { date: '2026-05-29', category: '교통', item: '외부 미팅 왕복 택시', amount: 56000, owner: 'CS Manager', method: '개인정산' },
  { date: '2026-05-30', category: '자격', item: '개인정보보호 교육 수료증', amount: 120000, owner: '이민준', method: '계좌이체' },
  { date: '2026-05-31', category: '식비', item: '월말 결산 회의 식대', amount: 176000, owner: 'Finance Keeper', method: '공동경비' },
  { date: '2026-06-01', category: '교육', item: 'OpenAI API 실습 세션', amount: 210000, owner: '김소연', method: '법인카드' },
  { date: '2026-06-01', category: '클라우드', item: '로그 저장소 증설', amount: 94000, owner: 'Backend Lead', method: '법인카드' },
  { date: '2026-06-02', category: '소모품', item: '포스트잇 및 라벨지', amount: 31000, owner: 'HR Partner', method: '공동경비' }
];

const lunchOptions = [
  { category: '중식', name: '홍콩반점 외대점', distance: '0.4km', note: '짜장/짬뽕 빠른 회전' },
  { category: '중식', name: '동문 중화요리', distance: '0.8km', note: '탕수육 세트 공유 가능' },
  { category: '중식', name: '샹하이반점 회기', distance: '1.4km', note: '회의 후 이동 동선 적당' },
  { category: '한식', name: '외대앞 순두부', distance: '0.3km', note: '가성비 점심' },
  { category: '한식', name: '회기 제육상회', distance: '1.1km', note: '10명 단체석 가능' },
  { category: '일식', name: '스시하루 외대', distance: '0.7km', note: '조용한 미팅 식사' },
  { category: '분식', name: '문방구 떡볶이', distance: '0.2km', note: '빠른 점심' }
];

document.addEventListener('DOMContentLoaded', () => {
  initFinalIntegrations();
});

async function initFinalIntegrations() {
  FinalRuntime.config = await loadIntegrationConfig();
  const _savedUser = loadFromLocalStorage('currentUser');
  // 데모 유저는 복원하지 않음 — 항상 실제 Google 로그인 요구
  FinalRuntime.currentUser = (_savedUser && _savedUser.provider !== 'google-demo') ? _savedUser : null;
  FinalRuntime.isAdmin = isAdminSessionActive();

  initGoogleAuth();
  initUserApiKeyPanel();
  initNeuralMap();
  initPostits();
  initWorkUtilities();
  initTeamChat();
  initMeetingAi();
  initExpenseDashboard();
  initSettlementAnalytics();
  initGmailAutomation();
  initAdminConsole();
  initThemeSensitiveRerender();
  renderIntegrationStatus();
  updateHeaderIdentity();
}

function initThemeSensitiveRerender() {
  new MutationObserver(() => {
    window.requestAnimationFrame(() => {
      renderKnowledgeMapCanvas();
      renderExpenseChart(FinalRuntime.expenseRows.length ? FinalRuntime.expenseRows : sampleExpenses);
      renderSettlementAnalytics();
    });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

async function loadIntegrationConfig() {
  const fallback = {
    googleClientId: '',
    features: {
      slack: false,
      openai: false,
      anthropic: false,
      googleSheets: false,
      gmail: false,
      railway: location.protocol.startsWith('http')
    }
  };

  if (!location.protocol.startsWith('http')) return fallback;

  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    if (!res.ok) throw new Error('config not available');
    return await res.json();
  } catch (error) {
    return fallback;
  }
}

async function apiPost(path, payload) {
  if (!location.protocol.startsWith('http')) throw new Error('서버 모드가 아닙니다.');
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'API 요청 실패');
  return data;
}

function copyText(text, successTitle = '복사 완료') {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => showToast(successTitle, '클립보드에 복사되었습니다.', 'success'))
      .catch(() => fallbackCopy(text, successTitle));
  }
  fallbackCopy(text, successTitle);
}

function fallbackCopy(text, successTitle) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  showToast(successTitle, '클립보드에 복사되었습니다.', 'success');
}

/* =============================================
   User API Key
============================================== */

const USER_CLAUDE_KEY_SESSION = 'workosUserClaudeApiKey';

function getUserClaudeApiKey() {
  try {
    return sessionStorage.getItem(USER_CLAUDE_KEY_SESSION) || '';
  } catch (error) {
    return FinalRuntime.userClaudeApiKey || '';
  }
}

function setUserClaudeApiKey(value) {
  const key = String(value || '').trim();
  FinalRuntime.userClaudeApiKey = key;
  try {
    if (key) sessionStorage.setItem(USER_CLAUDE_KEY_SESSION, key);
    else sessionStorage.removeItem(USER_CLAUDE_KEY_SESSION);
  } catch (error) {
    // Session storage may be blocked; keep the key only in memory for this page.
  }
}

function updateUserApiKeyStatus() {
  const status = document.getElementById('user-api-status');
  const input = document.getElementById('user-claude-api-key');
  const userKey = getUserClaudeApiKey();
  if (input && userKey && input.value !== userKey) input.value = userKey;
  if (!status) return;

  if (userKey) {
    status.textContent = 'User Claude';
    status.className = 'user-api-status is-user';
  } else if (FinalRuntime.config.features.anthropic) {
    status.textContent = 'Railway';
    status.className = 'user-api-status is-server';
  } else {
    status.textContent = 'Demo';
    status.className = 'user-api-status';
  }
}

function initUserApiKeyPanel() {
  const input = document.getElementById('user-claude-api-key');
  const saveBtn = document.getElementById('user-api-save-btn');
  const clearBtn = document.getElementById('user-api-clear-btn');
  if (!input || !saveBtn || !clearBtn) return;

  const savedKey = getUserClaudeApiKey();
  if (savedKey) input.value = savedKey;

  const applyKey = () => {
    const nextKey = input.value.trim();
    if (!nextKey) {
      setUserClaudeApiKey('');
      updateUserApiKeyStatus();
      renderIntegrationStatus();
      showToast('Claude API 키', '사용자 키를 비웠습니다. Railway Claude 키 또는 로컬 응답으로 동작합니다.', 'info');
      return;
    }

    setUserClaudeApiKey(nextKey);
    updateUserApiKeyStatus();
    renderIntegrationStatus();
    showToast('Claude API 키 적용', '이 브라우저 세션에서 업무 AI와 AI 변호사에 사용자 Claude 키를 우선 사용합니다.', 'success');
  };

  saveBtn.addEventListener('click', applyKey);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') applyKey();
  });
  clearBtn.addEventListener('click', () => {
    input.value = '';
    setUserClaudeApiKey('');
    updateUserApiKeyStatus();
    renderIntegrationStatus();
    showToast('Claude API 키 삭제', '브라우저 세션에서 사용자 Claude 키를 삭제했습니다.', 'info');
  });

  updateUserApiKeyStatus();
}

const MEETING_OPENAI_KEY_SESSION = 'workosMeetingOpenAiApiKey';

function getMeetingOpenAiApiKey() {
  try {
    return sessionStorage.getItem(MEETING_OPENAI_KEY_SESSION) || '';
  } catch (error) {
    return FinalRuntime.meetingOpenAiApiKey || '';
  }
}

function setMeetingOpenAiApiKey(value) {
  const key = String(value || '').trim();
  FinalRuntime.meetingOpenAiApiKey = key;
  try {
    if (key) sessionStorage.setItem(MEETING_OPENAI_KEY_SESSION, key);
    else sessionStorage.removeItem(MEETING_OPENAI_KEY_SESSION);
  } catch (error) {
    // Keep it only in memory if the browser blocks session storage.
  }
}

function updateMeetingOpenAiKeyStatus() {
  const status = document.getElementById('meeting-openai-status');
  if (!status) return;
  const hasKey = Boolean(getUserClaudeApiKey()) || FinalRuntime.config.features.anthropic;
  status.textContent = hasKey ? 'Claude AI' : 'Demo';
  status.className = hasKey ? 'user-api-status active' : 'user-api-status';
}

function initMeetingOpenAiKeyPanel() {
  const input = document.getElementById('meeting-openai-api-key');
  const saveBtn = document.getElementById('meeting-openai-save-btn');
  const clearBtn = document.getElementById('meeting-openai-clear-btn');
  if (!input || !saveBtn || !clearBtn) return;

  const savedKey = getMeetingOpenAiApiKey();
  if (savedKey) input.value = savedKey;

  const applyKey = () => {
    const nextKey = input.value.trim();
    if (!nextKey) {
      setMeetingOpenAiApiKey('');
      updateMeetingOpenAiKeyStatus();
      renderIntegrationStatus();
      showToast('OpenAI 전사 키', '사용자 키를 비웠습니다. Railway 키 또는 데모 전사로 동작합니다.', 'info');
      return;
    }

    if (/^sk-ant-/i.test(nextKey)) {
      showToast('OpenAI 전사 키 필요', 'Claude 키는 Copilot용입니다. Meeting Audio에는 OpenAI 키를 입력하세요.', 'warning');
      return;
    }

    setMeetingOpenAiApiKey(nextKey);
    updateMeetingOpenAiKeyStatus();
    renderIntegrationStatus();
    showToast('OpenAI 전사 키 적용', '이 브라우저 세션에서 Meeting Audio AI 전사에 사용자 OpenAI 키를 우선 사용합니다.', 'success');
  };

  saveBtn.addEventListener('click', applyKey);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') applyKey();
  });
  clearBtn.addEventListener('click', () => {
    input.value = '';
    setMeetingOpenAiApiKey('');
    updateMeetingOpenAiKeyStatus();
    renderIntegrationStatus();
    showToast('OpenAI 전사 키 삭제', '브라우저 세션에서 Meeting Audio OpenAI 키를 삭제했습니다.', 'info');
  });

  updateMeetingOpenAiKeyStatus();
}

/* =============================================
   Google Login
============================================== */



function waitForGoogle(cb, tries = 0) {
  if (window.google?.accounts?.oauth2) { cb(); return; }
  if (tries > 30) {
    showToast('Google 로그인', 'Google 라이브러리 로딩 실패. 새로고침 후 시도하세요.', 'error');
    return;
  }
  setTimeout(() => waitForGoogle(cb, tries + 1), 100);
}

function initGoogleAuth() {
  const btn = document.getElementById('google-auth-btn');
  if (!btn) return;
  btn.addEventListener('click', () => waitForGoogle(doGoogleOAuth));
  updateHeaderIdentity();
}

function doGoogleOAuth() {
  const clientId = (FinalRuntime.config.googleClientId || '').trim();
  if (!clientId) {
    showToast('Google 로그인', 'GOOGLE_CLIENT_ID가 설정되지 않았습니다.', 'error', 4000);
    return;
  }
  google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'openid email profile',
    callback: async resp => {
      if (resp.error) {
        showToast('Google 로그인 실패', resp.error_description || resp.error, 'error');
        return;
      }
      try {
        const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: 'Bearer ' + resp.access_token }
        });
        const p = await r.json();
        FinalRuntime.currentUser = {
          name:     p.name    || p.email || 'Google User',
          email:    p.email   || '',
          picture:  p.picture || '',
          provider: 'google'
        };
        saveToLocalStorage('currentUser', FinalRuntime.currentUser);
        updateHeaderIdentity();
        showToast('로그인 완료', FinalRuntime.currentUser.name + ' 계정으로 접속했습니다.', 'success');
      } catch (err) {
        showToast('Google 로그인 실패', '사용자 정보를 가져오지 못했습니다.', 'error');
      }
    }
  }).requestAccessToken({ prompt: 'consent' });
}



// Legacy One-Tap credential handler (kept for compatibility)
function handleGoogleCredential(response) {
  const profile = decodeJwt(response.credential);
  FinalRuntime.currentUser = {
    name: profile.name || profile.email || 'Google User',
    email: profile.email || '',
    picture: profile.picture || '',
    provider: 'google'
  };
  saveToLocalStorage('currentUser', FinalRuntime.currentUser);
  updateHeaderIdentity();
  showToast('Google 로그인 완료', `${FinalRuntime.currentUser.name} 계정으로 접속했습니다.`, 'success');
}

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(payload).split('').map(c =>
      `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`
    ).join('')));
  } catch (error) {
    return {};
  }
}

function updateHeaderIdentity() {
  const user        = FinalRuntime.currentUser;
  const googleBtn   = document.getElementById('google-auth-btn');
  const profileArea = document.getElementById('user-profile-btn');

  if (user) {
    // ── 로그인 완료: 버튼 숨기고 프로필 표시 ──
    if (googleBtn)   { googleBtn.style.display = 'none'; googleBtn.classList.add('google-auth-hidden'); }
    if (profileArea) { profileArea.style.display = 'flex'; profileArea.classList.remove('google-auth-hidden'); }
    const avatar = profileArea?.querySelector('.avatar');
    const name   = profileArea?.querySelector('.user-name');
    const role   = profileArea?.querySelector('.user-role');
    const initials = (user.name || user.email || 'GU').slice(0, 2).toUpperCase();
    if (avatar) avatar.textContent = initials;
    if (name)   name.textContent   = user.name || user.email;
    if (role)   role.textContent   = user.provider === 'google' ? 'Google Verified' : 'Ops Manager';
  } else {
    // ── 미로그인: 버튼 표시, 프로필 숨기기 ──
    if (googleBtn)   googleBtn.style.display   = '';
    if (profileArea) profileArea.style.display = 'none';
  }
}


/* =============================================
   Neural Map
============================================== */

function initNeuralMap() {
  document.querySelectorAll('[data-page-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.pageTarget;
      if (typeof showDashboardPage === 'function') showDashboardPage(page);
    });
  });
  renderKnowledgeMapCanvas();
  initKnowledgeMapTooltip();
  window.addEventListener('resize', () => window.requestAnimationFrame(renderKnowledgeMapCanvas));
  new MutationObserver(() => window.requestAnimationFrame(renderKnowledgeMapCanvas))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  return () => {
    value = value * 16807 % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function getKnowledgeTask(menuKey, index = 0) {
  const menu = knowledgeMapMenus[menuKey] || knowledgeMapMenus.briefing;
  return menu.tasks[index % menu.tasks.length];
}

function getKnowledgeTooltipMarkup(node) {
  const menu = knowledgeMapMenus[node.menuKey] || knowledgeMapMenus.briefing;
  return `
    <strong>${escHtml(menu.label)}</strong>
    <span>${escHtml(node.task || getKnowledgeTask(node.menuKey, node.taskIndex || 0))}</span>
  `;
}

function findKnowledgeMapNode(canvas, x, y) {
  const nodes = canvas._knowledgeMapNodes || [];
  let nearest = null;
  let nearestDistance = Infinity;

  nodes.forEach(node => {
    const dx = node.x - x;
    const dy = node.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const hitRadius = node.hub ? 16 : Math.max(8, node.radius + 7);
    if (distance <= hitRadius && distance < nearestDistance) {
      nearest = node;
      nearestDistance = distance;
    }
  });

  return nearest;
}

function initKnowledgeMapTooltip() {
  const canvas = document.getElementById('knowledge-map-canvas');
  const wrap = document.getElementById('neural-map');
  const tooltip = document.getElementById('knowledge-map-tooltip');
  if (!canvas || !wrap || !tooltip || canvas.dataset.tooltipReady === 'true') return;

  const hideTooltip = () => {
    tooltip.hidden = true;
    delete tooltip.dataset.menu;
    tooltip.classList.remove('is-below');
    canvas.classList.remove('is-hovering-node');
  };

  const moveTooltip = event => {
    const canvasRect = canvas.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    const node = findKnowledgeMapNode(canvas, x, y);

    if (!node) {
      hideTooltip();
      return;
    }

    tooltip.innerHTML = getKnowledgeTooltipMarkup(node);
    tooltip.dataset.menu = node.menuKey;
    tooltip.hidden = false;
    canvas.classList.add('is-hovering-node');

    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipHalf = tooltipRect.width / 2;
    const left = Math.min(
      wrapRect.width - tooltipHalf - 10,
      Math.max(tooltipHalf + 10, node.x)
    );
    const placeBelow = node.y < tooltipRect.height + 24;

    tooltip.classList.toggle('is-below', placeBelow);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${placeBelow ? node.y + 16 : node.y - 10}px`;
  };

  canvas.addEventListener('mousemove', moveTooltip);
  canvas.addEventListener('mouseleave', hideTooltip);
  canvas.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect();
    const node = findKnowledgeMapNode(canvas, event.clientX - rect.left, event.clientY - rect.top);
    const page = knowledgeMapMenus[node?.menuKey]?.page;
    if (page && typeof showDashboardPage === 'function') showDashboardPage(page);
  });
  canvas.dataset.tooltipReady = 'true';
}

function renderKnowledgeMapCanvas() {
  const canvas = document.getElementById('knowledge-map-canvas');
  const wrap = document.getElementById('neural-map');
  if (!canvas || !wrap) return;

  const rect = wrap.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(720, Math.floor(rect.width));
  const height = Math.max(420, Math.floor(rect.height));
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const styles = getComputedStyle(document.documentElement);
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const rand = seededRandom(2050);
  const cx = width * 0.52;
  const cy = height * 0.56;
  const menuKeys = ['projects', 'risk', 'comms', 'meeting', 'expenses', 'kpi', 'briefing'];

  const nodes = [];
  const addNode = (x, y, radius, group = 'core', hub = false, menuKey = group, taskIndex = nodes.length) => {
    const resolvedMenu = knowledgeMapMenus[menuKey] ? menuKey : 'briefing';
    nodes.push({
      x,
      y,
      radius,
      group,
      hub,
      menuKey: resolvedMenu,
      taskIndex,
      task: getKnowledgeTask(resolvedMenu, taskIndex)
    });
    return nodes[nodes.length - 1];
  };

  const core = addNode(cx, cy, 8, 'core', true, 'briefing');
  const hubs = [
    addNode(width * 0.32, height * 0.43, 5.5, 'projects', true, 'projects'),
    addNode(width * 0.63, height * 0.44, 5.5, 'risk', true, 'risk'),
    addNode(width * 0.50, height * 0.78, 5, 'meeting', true, 'meeting'),
    addNode(width * 0.78, height * 0.60, 5, 'team', true, 'comms'),
    addNode(width * 0.36, height * 0.74, 5, 'expense', true, 'expenses'),
    addNode(width * 0.69, height * 0.23, 5.5, 'kpi', true, 'kpi')
  ];

  for (let i = 0; i < 220; i += 1) {
    const angle = rand() * Math.PI * 2;
    const dist = Math.pow(rand(), 0.58) * Math.min(width, height) * 0.44;
    const noise = (rand() - 0.5) * 46;
    const menuKey = menuKeys[Math.floor(rand() * menuKeys.length)];
    addNode(
      cx + Math.cos(angle) * dist + noise,
      cy + Math.sin(angle) * dist + noise,
      rand() > 0.9 ? 2.4 : 1.65,
      rand() > 0.78 ? 'purple' : 'white',
      false,
      menuKey,
      i
    );
  }

  hubs.forEach((hub, hubIndex) => {
    const count = 38 + hubIndex * 3;
    for (let i = 0; i < count; i += 1) {
      const angle = rand() * Math.PI * 2;
      const dist = 18 + rand() * 82;
      addNode(
        hub.x + Math.cos(angle) * dist,
        hub.y + Math.sin(angle) * dist,
        rand() > 0.82 ? 2.5 : 1.7,
        hubIndex % 2 ? 'purple' : 'white',
        false,
        hub.menuKey,
        i
      );
    }
  });

  for (let i = 0; i < 80; i += 1) {
    const side = i % 4;
    const x = side === 0 ? width * 0.08 + rand() * 80 : side === 1 ? width * 0.9 - rand() * 80 : rand() * width;
    const y = side === 2 ? height * 0.08 + rand() * 80 : side === 3 ? height * 0.9 - rand() * 80 : rand() * height;
    const menuKey = menuKeys[Math.floor(rand() * menuKeys.length)];
    addNode(x, y, 1.55, rand() > 0.86 ? 'purple' : 'white', false, menuKey, i);
  }

  canvas._knowledgeMapNodes = nodes;
  canvas.dataset.nodeCount = String(nodes.length);

  const lineColor = isLight ? 'rgba(98, 132, 198, 0.32)' : 'rgba(151, 176, 230, 0.34)';
  const hubLineColor = isLight ? 'rgba(113, 93, 171, 0.36)' : 'rgba(172, 152, 226, 0.35)';
  const white = isLight ? '#445062' : '#f8f7ef';
  const purple = styles.getPropertyValue('--accent-purple').trim() || '#bba7e8';

  ctx.lineWidth = 0.75;
  nodes.forEach((node, i) => {
    const nearest = [];
    for (let j = i + 1; j < nodes.length; j += 1) {
      const other = nodes[j];
      const dx = other.x - node.x;
      const dy = other.y - node.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 74) nearest.push({ other, d });
    }
    nearest.sort((a, b) => a.d - b.d).slice(0, node.hub ? 14 : 2).forEach(({ other, d }) => {
      ctx.strokeStyle = node.hub || other.hub ? hubLineColor : lineColor;
      ctx.globalAlpha = Math.max(0.16, 1 - d / 86);
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(other.x, other.y);
      ctx.stroke();
    });
  });

  hubs.forEach(hub => {
    ctx.strokeStyle = hubLineColor;
    ctx.globalAlpha = 0.42;
    ctx.beginPath();
    ctx.moveTo(core.x, core.y);
    ctx.lineTo(hub.x, hub.y);
    ctx.stroke();
  });

  ctx.globalAlpha = 1;
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.fillStyle = node.group === 'purple' || ['kpi', 'meeting', 'expense'].includes(node.group) ? purple : white;
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* =============================================
   Post-it Board
============================================== */

function initPostits() {
  document.getElementById('postit-add-btn')?.addEventListener('click', addPostit);
  document.getElementById('postit-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addPostit();
  });
  document.getElementById('postit-period')?.addEventListener('change', renderPostits);
  renderPostits();
}

function getPostits() {
  const saved = loadFromLocalStorage('postits');
  if (saved?.length) return saved;
  return [
    { id: 1, text: '결제 QA 병목은 오늘 16시 전에 담당자 확정', period: 'daily', color: 'cyan', author: '사지윤', createdAt: '2026-05-26' },
    { id: 2, text: '공동 경비 Google Sheet 링크 확인', period: 'weekly', color: 'yellow', author: 'Finance Keeper', createdAt: '2026-05-26' },
    { id: 3, text: '회의록은 결정사항 3개 이하로 요약', period: 'daily', color: 'green', author: 'PMO', createdAt: '2026-05-26' }
  ];
}

function addPostit() {
  const input = document.getElementById('postit-input');
  const period = document.getElementById('postit-period')?.value || 'daily';
  const color = document.getElementById('postit-color')?.value || 'cyan';
  const text = input?.value.trim();
  if (!text) {
    showToast('포스트잇', '메모 내용을 입력하세요.', 'warning');
    return;
  }

  const notes = getPostits();
  notes.unshift({
    id: Date.now(),
    text,
    period,
    color,
    author: FinalRuntime.currentUser?.name || '관리자',
    createdAt: new Date().toISOString().slice(0, 10)
  });
  saveToLocalStorage('postits', notes);
  input.value = '';
  renderPostits();
  showToast('포스트잇 추가', '팀 보드에 메모를 붙였습니다.', 'success');
}

function deletePostit(noteId) {
  const notes = getPostits().filter(n => n.id !== noteId);
  saveToLocalStorage('postits', notes);
  renderPostits();
}

function renderPostits() {
  const board = document.getElementById('postit-board');
  if (!board) return;
  const period = document.getElementById('postit-period')?.value || 'daily';
  const notes = getPostits().filter(n => n.period === period);

  if (!notes.length) {
    board.innerHTML = '<p class="muted-text">이 기간의 포스트잇이 없습니다.</p>';
    return;
  }

  board.innerHTML = notes.map(n => `
    <div class="postit-note ${escHtml(n.color)}">
      <button class="postit-delete" onclick="deletePostit(${n.id})" aria-label="포스트잇 삭제">×</button>
      ${escHtml(n.text)}
      <small>${escHtml(n.author)} · ${escHtml(n.createdAt)}</small>
    </div>
  `).join('');
}

/* =============================================
   Healing Player + Lunch Recommender
============================================== */

function initWorkUtilities() {
  document.getElementById('music-toggle-btn')?.addEventListener('click', toggleHealingPlayer);
  document.getElementById('music-volume')?.addEventListener('input', updateHealingVolume);
  document.getElementById('music-mode')?.addEventListener('change', () => {
    if (FinalRuntime.audio.playing) {
      stopHealingPlayer();
      startHealingPlayer();
    }
  });

  document.getElementById('lunch-pick-btn')?.addEventListener('click', renderLunchRecommendation);
  updateLunchApiStatus();
  renderLunchRecommendation();
}

function toggleHealingPlayer() {
  FinalRuntime.audio.playing ? stopHealingPlayer() : startHealingPlayer();
}

function startHealingPlayer() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    showToast('Healing Player', '이 브라우저에서 Web Audio API를 사용할 수 없습니다.', 'error');
    return;
  }

  const ctx = FinalRuntime.audio.ctx || new AudioCtx();
  FinalRuntime.audio.ctx = ctx;
  const volume = Number(document.getElementById('music-volume')?.value || 35) / 100;
  const mode = document.getElementById('music-mode')?.value || 'focus';
  const base = mode === 'rain' ? 174 : mode === 'cafe' ? 146 : 220;

  const master = ctx.createGain();
  master.gain.value = volume * 0.08;
  master.connect(ctx.destination);

  const nodes = [base, base * 1.5, base * 2].map((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = idx === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    gain.gain.value = idx === 0 ? 0.7 : 0.28;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    return osc;
  });

  FinalRuntime.audio.nodes = [master, ...nodes];
  FinalRuntime.audio.playing = true;
  const btn = document.getElementById('music-toggle-btn');
  if (btn) btn.textContent = '정지';
}

function stopHealingPlayer() {
  FinalRuntime.audio.nodes.forEach(node => {
    try {
      if (typeof node.stop === 'function') node.stop();
      if (typeof node.disconnect === 'function') node.disconnect();
    } catch (error) {
      // Already stopped.
    }
  });
  FinalRuntime.audio.nodes = [];
  FinalRuntime.audio.playing = false;
  const btn = document.getElementById('music-toggle-btn');
  if (btn) btn.textContent = '재생';
}

function updateHealingVolume() {
  const master = FinalRuntime.audio.nodes[0];
  if (master?.gain) {
    master.gain.value = Number(document.getElementById('music-volume')?.value || 35) / 100 * 0.08;
  }
}

function updateLunchApiStatus() {
  const status = document.getElementById('lunch-api-status');
  if (!status) return;
  const hasKey = Boolean(getUserClaudeApiKey()) || FinalRuntime.config.features.anthropic;
  status.textContent = hasKey ? 'Claude AI' : 'Demo';
  status.className = hasKey ? 'user-api-status active' : 'user-api-status';
}

async function renderLunchRecommendation() {
  const category = document.getElementById('lunch-category')?.value || '중식';
  const location = document.getElementById('lunch-location')?.value || '동대문구 외대앞';
  const result = document.getElementById('lunch-result');
  const btn = document.getElementById('lunch-pick-btn');
  if (!result) return;

  result.innerHTML = '<div style="padding:8px;opacity:0.6;font-size:0.8rem;">Claude AI 추천 중…</div>';
  if (btn) btn.disabled = true;

  try {
    const res = await fetch('/api/claude/lunch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userClaudeApiKey: getUserClaudeApiKey(),
        location,
        category
      })
    });
    const data = await res.json();
    const places = Array.isArray(data.places) ? data.places : [];
    const source = data.usedClaude ? 'Claude AI' : 'Demo';

    updateLunchApiStatus();

    if (!places.length) {
      result.innerHTML = '<div style="padding:8px;opacity:0.6;font-size:0.8rem;">추천 결과를 가져오지 못했습니다.</div>';
      return;
    }

    result.innerHTML = places.map((p, idx) => {
      const text = `[점심 추천] ${location} ${category}: ${p.name} (${p.distance}) - ${p.note}`;
      return `
        <div class="lunch-card">
          <div>
            <div class="lunch-card-title">${idx + 1}. ${escHtml(p.name)}</div>
            <div class="lunch-card-meta">${escHtml(p.distance)} · ${escHtml(p.note)}</div>
          </div>
          <button class="btn btn--ghost btn--sm" data-lunch-copy="${escHtml(text)}">복사</button>
        </div>
      `;
    }).join('') + `<div style="font-size:0.7rem;opacity:0.5;margin-top:4px;text-align:right;">via ${source}</div>`;

    result.querySelectorAll('[data-lunch-copy]').forEach(b => {
      b.addEventListener('click', () => copyText(b.dataset.lunchCopy, '점심 추천 복사'));
    });
  } catch (error) {
    const picks = lunchOptions.filter(x => x.category === category).slice(0, 3);
    result.innerHTML = picks.map((p, idx) => {
      const text = `[점심 추천] ${location} ${category}: ${p.name} (${p.distance}) - ${p.note}`;
      return `
        <div class="lunch-card">
          <div>
            <div class="lunch-card-title">${idx + 1}. ${escHtml(p.name)}</div>
            <div class="lunch-card-meta">${escHtml(p.distance)} · ${escHtml(p.note)}</div>
          </div>
          <button class="btn btn--ghost btn--sm" data-lunch-copy="${escHtml(text)}">복사</button>
        </div>
      `;
    }).join('') + '<div style="font-size:0.7rem;opacity:0.5;margin-top:4px;text-align:right;">via Demo</div>';

    result.querySelectorAll('[data-lunch-copy]').forEach(b => {
      b.addEventListener('click', () => copyText(b.dataset.lunchCopy, '점심 추천 복사'));
    });
  } finally {
    if (btn) btn.disabled = false;
  }
}

/* =============================================
   Team Chat + Slack Bridge
============================================== */

function initTeamChat() {
  const sendBtn = document.getElementById('teamchat-send-btn');
  const input = document.getElementById('teamchat-input');

  sendBtn?.addEventListener('click', sendTeamChatMessage);
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendTeamChatMessage();
  });

  renderTeamPresence();
  renderTeamChat();
  updateSlackStatus();
}

function getTeamChatMessages() {
  const saved = loadFromLocalStorage('teamChatMessages');
  if (saved?.length) return saved;
  return [
    { id: 1, author: '사지윤', channel: '#ops-dashboard', text: '최종 제출본은 페이지형 메뉴로 재구성합니다.', time: '09:20', own: true },
    { id: 2, author: 'Finance Keeper', channel: '#finance-shared', text: '공동 경비 Sheet 샘플 데이터를 연결했습니다.', time: '09:32', own: false },
    { id: 3, author: 'DevOps Lead', channel: '#project-risk', text: 'Railway 배포 환경변수 목록 확인 필요.', time: '09:41', own: false }
  ];
}

function renderTeamChat() {
  const container = document.getElementById('teamchat-messages');
  if (!container) return;

  const messages = getTeamChatMessages();
  container.innerHTML = messages.map(m => `
    <div class="teamchat-message ${m.own ? 'own' : ''}">
      <div class="teamchat-meta">${escHtml(m.channel)} · ${escHtml(m.author)} · ${escHtml(m.time)}</div>
      <div class="teamchat-text">${escHtml(m.text)}</div>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

async function sendTeamChatMessage() {
  const input = document.getElementById('teamchat-input');
  const channel = document.getElementById('teamchat-channel')?.value || '#ops-dashboard';
  const text = input?.value.trim();
  if (!text) return;

  const messages = getTeamChatMessages();
  const entry = {
    id: Date.now(),
    author: FinalRuntime.currentUser?.name || '관리자',
    channel,
    text,
    time: getTimeString(),
    own: true
  };
  messages.push(entry);
  saveToLocalStorage('teamChatMessages', messages);
  input.value = '';
  renderTeamChat();

  try {
    const result = await apiPost('/api/slack/message', { channel, text, author: entry.author });
    showToast('Slack 전송', result.sent ? 'Slack Webhook으로 메시지를 전송했습니다.' : 'Slack 미설정 상태라 로컬 메시지로 저장했습니다.', result.sent ? 'success' : 'info');
  } catch (error) {
    showToast('팀 채팅 저장', '서버 연결 없이 로컬 채팅으로 저장했습니다.', 'info');
  }
}

function renderTeamPresence() {
  const list = document.getElementById('team-presence-list');
  if (!list) return;
  list.innerHTML = teamMembers.map(m => `
    <div class="presence-item">
      <div class="presence-avatar">${escHtml(m.name.slice(0, 2))}</div>
      <div>
        <div class="presence-name">${escHtml(m.name)}</div>
        <div class="presence-role">${escHtml(m.team)} · ${escHtml(m.role)}</div>
      </div>
      <span class="presence-status" style="background:${m.status === 'busy' ? 'var(--warning)' : m.status === 'away' ? 'var(--text-muted)' : 'var(--success)'}"></span>
    </div>
  `).join('');
}

function updateSlackStatus() {
  const badge = document.getElementById('slack-status-badge');
  if (!badge) return;
  badge.className = FinalRuntime.config.features.slack ? 'badge badge--success' : 'badge badge--muted';
  badge.textContent = FinalRuntime.config.features.slack ? 'Slack 연결' : 'Slack 미설정';
}

/* =============================================
   Meeting AI
============================================== */

function initMeetingAi() {
  document.getElementById('meeting-transcribe-btn')?.addEventListener('click', transcribeMeetingAudio);
  document.getElementById('meeting-summary-btn')?.addEventListener('click', renderMeetingSummary);
  document.getElementById('meeting-copy-md-btn')?.addEventListener('click', () => {
    copyText(getMeetingSummaryMarkdown(), '회의 요약 MD 복사');
  });
  document.getElementById('meeting-download-md-btn')?.addEventListener('click', saveMeetingMarkdown);

  const defaultTranscript = '전사 월간 회의. 결제 시스템 QA 병목은 Backend Lead와 QA Manager가 오늘 중 테스트 범위를 P0로 재분류한다. 데이터 파이프라인은 5월 28일까지 Kafka 파티션 전략을 12개 기준으로 확정한다. 공동 경비 Google Sheet는 Finance Keeper가 관리하고 매일 18시에 결산 요약을 공유한다.';
  const transcript = loadFromLocalStorage('meetingTranscript') || defaultTranscript;
  const el = document.getElementById('meeting-transcript');
  if (el) el.value = transcript;
  renderMeetingSummary();
}

async function transcribeMeetingAudio() {
  const fileInput = document.getElementById('meeting-audio-file');
  const status = document.getElementById('transcription-status');
  const file = fileInput?.files?.[0];
  const transcriptEl = document.getElementById('meeting-transcript');

  if (!file) {
    showToast('회의 노트 분석', '파일을 선택하거나 아래 텍스트 영역에 회의 내용을 직접 입력하세요.', 'info');
    return;
  }

  if (status) { status.className = 'badge badge--warning'; status.textContent = 'Claude 분석 중'; }

  // Claude는 오디오를 직접 전사할 수 없으므로 파일명 기반 템플릿 생성
  const fallback = buildFallbackTranscript(file.name);
  if (transcriptEl && !transcriptEl.value.trim()) {
    transcriptEl.value = fallback;
    saveToLocalStorage('meetingTranscript', fallback);
  }

  await renderMeetingSummary();
  if (status) { status.className = 'badge badge--success'; status.textContent = 'Claude 요약 완료'; }
  showToast('회의 AI 분석', '내용을 직접 입력하거나 수정 후 "요약 생성" 버튼으로 Claude AI 요약을 생성하세요.', 'info', 3500);
}

function getAudioMimeType(file) {
  const name = (file?.name || '').toLowerCase();
  if (file?.type) return file.type;
  if (name.endsWith('.m4a')) return 'audio/mp4';
  if (name.endsWith('.mp4')) return 'audio/mp4';
  if (name.endsWith('.wav')) return 'audio/wav';
  if (name.endsWith('.webm')) return 'audio/webm';
  return 'audio/mpeg';
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function buildFallbackTranscript(fileName) {
  return `${fileName} 회의 녹음 전사 데모. 결제 QA 병목은 오늘 중 담당자를 확정한다. 공동 경비는 Google Sheet 기준으로 매일 업데이트한다. Slack 채널에는 주요 결정사항만 공유한다. 다음 회의 전까지 관리자 페이지에서 팀원별 공개 범위를 설정한다.`;
}

async function renderMeetingSummary() {
  const output = document.getElementById('meeting-summary-output');
  const status = document.getElementById('transcription-status');
  if (!output) return;

  const transcript = document.getElementById('meeting-transcript')?.value.trim() || '';
  if (!transcript) { output.textContent = '회의 내용을 입력하거나 파일을 업로드하면 요약이 생성됩니다.'; return; }

  const hasKey = Boolean(getUserClaudeApiKey()) || FinalRuntime.config.features.anthropic;
  if (!hasKey) {
    // 키 없으면 규칙 기반 요약
    output.textContent = getMeetingSummaryMarkdown();
    if (status) { status.className = 'badge badge--muted'; status.textContent = '규칙 기반 요약'; }
    return;
  }

  output.innerHTML = '<span style="opacity:0.6;font-size:0.8rem">Claude AI 요약 생성 중…</span>';
  if (status) { status.className = 'badge badge--warning'; status.textContent = '요약 중'; }

  try {
    const res = await fetch('/api/claude/meeting-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userClaudeApiKey: getUserClaudeApiKey(), transcript })
    });
    const data = await res.json();
    if (data.markdown) {
      output.textContent = data.markdown;
      saveToLocalStorage('meetingTranscript', transcript);
      if (status) { status.className = 'badge badge--success'; status.textContent = 'Claude AI 요약'; }
    } else {
      output.textContent = getMeetingSummaryMarkdown();
      if (status) { status.className = 'badge badge--muted'; status.textContent = '규칙 기반 요약'; }
    }
  } catch (err) {
    output.textContent = getMeetingSummaryMarkdown();
    if (status) { status.className = 'badge badge--muted'; status.textContent = '규칙 기반 요약'; }
  }
}

function getMeetingSummaryMarkdown() {
  const transcript = document.getElementById('meeting-transcript')?.value.trim() || '';
  saveToLocalStorage('meetingTranscript', transcript);
  const sentences = transcript
    .split(/[.!?\n。]/)
    .map(s => s.trim())
    .filter(Boolean);
  const decisions = sentences.filter(s => /확정|결정|공유|설정|재분류|연결|관리/.test(s)).slice(0, 3);
  const actions = sentences.filter(s => /한다|필요|담당|까지|전까지|업데이트|전송/.test(s)).slice(0, 4);
  const summary = sentences.slice(0, 3);

  return [
    '# 회의 요약',
    '',
    `- 작성일: ${new Date().toISOString().slice(0, 10)}`,
    `- 참석 범위: ${teamMembers.slice(0, 5).map(m => m.name).join(', ')}`,
    '',
    '## 핵심 요약',
    ...summary.map(s => `- ${s}`),
    '',
    '## 결정 사항',
    ...(decisions.length ? decisions : ['결정 사항은 회의 후 관리자 콘솔에서 확정']).map(s => `- ${s}`),
    '',
    '## 액션 아이템',
    ...(actions.length ? actions : ['다음 회의 전까지 담당자별 업무 상태 갱신']).map((s, i) => `- [ ] ${s}${i === 0 ? ' (담당: PMO)' : ''}`),
    '',
    '## 공유 채널',
    '- Slack: #ops-dashboard',
    '- Daily Mail: 일일 결산 발송 대상'
  ].join('\n');
}

function saveMeetingMarkdown() {
  const blob = new Blob([getMeetingSummaryMarkdown()], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meeting-summary-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Meeting Summary.md', '회의 요약 MD 파일을 저장했습니다.', 'success');
}

/* =============================================
   Expense + Settlement
============================================== */

function initExpenseDashboard() {
  FinalRuntime.expenseRows = loadFromLocalStorage('expenseRows') || sampleExpenses;
  document.getElementById('expense-sync-btn')?.addEventListener('click', syncExpenseSheet);
  renderExpenseDashboard();
}

async function syncExpenseSheet() {
  const input = document.getElementById('sheet-url-input');
  const status = document.getElementById('expense-sync-status');
  const url = input?.value.trim();
  if (status) {
    status.className = 'badge badge--warning';
    status.textContent = '동기화 중';
  }

  try {
    const query = url ? `?url=${encodeURIComponent(url)}` : '';
    const res = await fetch(`/api/google-sheet${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('sheet fetch failed');
    const data = await res.json();
    FinalRuntime.expenseRows = normalizeExpenseRows(data.rows || []);
    saveToLocalStorage('expenseRows', FinalRuntime.expenseRows);
    if (status) {
      status.className = data.live ? 'badge badge--success' : 'badge badge--muted';
      status.textContent = data.live ? 'Sheet 연결' : '샘플 데이터';
    }
    renderExpenseDashboard();
    renderSettlementAnalytics();
    showToast('공동 경비 동기화', data.live ? 'Google Sheet 데이터를 반영했습니다.' : '샘플 데이터를 반영했습니다.', data.live ? 'success' : 'info');
  } catch (error) {
    FinalRuntime.expenseRows = sampleExpenses;
    saveToLocalStorage('expenseRows', FinalRuntime.expenseRows);
    if (status) {
      status.className = 'badge badge--muted';
      status.textContent = '샘플 데이터';
    }
    renderExpenseDashboard();
    renderSettlementAnalytics();
    showToast('공동 경비', '서버 또는 Sheet 링크가 없어 샘플 데이터를 표시합니다.', 'info');
  }
}

function normalizeExpenseRows(rows) {
  return rows.map((row, idx) => ({
    date: row.date || row.날짜 || sampleExpenses[idx % sampleExpenses.length].date,
    category: row.category || row.항목 || row.분류 || '기타',
    item: row.item || row.내용 || row.description || '공동 경비',
    amount: Number(row.amount || row.금액 || 0),
    owner: row.owner || row.담당자 || '미지정',
    method: row.method || row.결제수단 || '공동경비'
  })).filter(row => row.amount > 0);
}

function renderExpenseDashboard() {
  const rows = FinalRuntime.expenseRows.length ? FinalRuntime.expenseRows : sampleExpenses;
  renderExpenseKpis(rows);
  renderExpenseTable(rows);
  renderExpenseChart(rows);
}

function renderExpenseKpis(rows) {
  const el = document.getElementById('expense-kpis');
  if (!el) return;
  const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const byCategory = aggregateBy(rows, 'category');
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0] || ['기타', 0];
  const owners = new Set(rows.map(r => r.owner)).size;
  const avg = rows.length ? Math.round(total / rows.length) : 0;
  const kpis = [
    ['총 경비', formatWon(total)],
    ['최대 항목', `${topCategory[0]} ${formatWon(topCategory[1])}`],
    ['담당 인원', `${owners}명`],
    ['건당 평균', formatWon(avg)]
  ];
  el.innerHTML = kpis.map(([label, value]) => `
    <div class="expense-kpi">
      <div class="expense-kpi-label">${escHtml(label)}</div>
      <div class="expense-kpi-value">${escHtml(value)}</div>
    </div>
  `).join('');
}

function renderExpenseTable(rows) {
  const el = document.getElementById('expense-table');
  if (!el) return;
  el.innerHTML = `
    <table class="data-table">
      <thead>
        <tr><th>날짜</th><th>항목</th><th>내용</th><th>담당</th><th>금액</th><th>결제</th></tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${escHtml(r.date)}</td>
            <td>${escHtml(r.category)}</td>
            <td>${escHtml(r.item)}</td>
            <td>${escHtml(r.owner)}</td>
            <td>${formatWon(r.amount)}</td>
            <td>${escHtml(r.method)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderExpenseChart(rows) {
  const canvas = document.getElementById('expense-category-chart');
  if (!canvas) return;
  const grouped = aggregateBy(rows, 'category');
  const labels = Object.keys(grouped);
  const values = Object.values(grouped);
  const pastelPalette = ['#9ADBE8', '#BBA7E8', '#F5D98B', '#A8DDB5', '#F4BD8A', '#F1A3A8', '#9EB7EE'];

  if (typeof Chart === 'undefined') {
    drawFallbackExpenseDoughnut(canvas, labels, values, pastelPalette);
    return;
  }

  if (FinalRuntime.expenseChart) FinalRuntime.expenseChart.destroy();
  FinalRuntime.expenseChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: pastelPalette,
        borderColor: 'rgba(255,255,255,0.55)',
        borderWidth: 2,
        hoverOffset: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-sub') } }
      }
    }
  });
}

function drawFallbackExpenseDoughnut(canvas, labels, values, colors) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.parentElement?.getBoundingClientRect();
  const cssWidth = Math.max(260, Math.round(rect?.width || 320));
  const cssHeight = Math.max(240, Math.round(rect?.height || 280));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const total = values.reduce((sum, value) => sum + Number(value || 0), 0) || 1;
  const cx = Math.round(cssWidth * 0.42);
  const cy = Math.round(cssHeight * 0.46);
  const radius = Math.min(cssWidth, cssHeight) * 0.28;
  const inner = radius * 0.58;
  let start = -Math.PI / 2;

  values.forEach((value, index) => {
    const angle = (Number(value || 0) / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    start += angle;
  });

  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim() || '#f5f2ea';
  ctx.font = '800 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(formatWon(total).replace('₩', ''), cx, cy + 4);

  ctx.textAlign = 'left';
  ctx.font = '700 11px Inter, sans-serif';
  const legendX = Math.min(cssWidth - 130, cx + radius + 28);
  const legendY = 36;
  labels.slice(0, 7).forEach((label, index) => {
    const y = legendY + index * 24;
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(legendX, y - 9, 12, 12);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-sub').trim() || '#c7d0df';
    ctx.fillText(label, legendX + 18, y);
  });
}

function initSettlementAnalytics() {
  document.querySelectorAll('.period-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSettlementAnalytics(btn.dataset.period);
    });
  });
  renderSettlementAnalytics('daily');
}

function renderSettlementAnalytics(period = document.querySelector('.period-tab.active')?.dataset.period || 'daily') {
  const rows = FinalRuntime.expenseRows.length ? FinalRuntime.expenseRows : sampleExpenses;
  const summary = document.getElementById('settlement-summary');
  if (!summary) return;

  const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const overdue = getSortedTasks().filter(t => getDaysLeft(t.dueDate) <= 0 && !t.isDone).length;
  const riskSignals = AppState.riskSignals?.length || 0;
  const labelMap = { daily: '일일', weekly: '주간', monthly: '월간', quarterly: '분기', yearly: '연간' };
  const multiplier = { daily: 1, weekly: 5, monthly: 21, quarterly: 63, yearly: 252 }[period] || 1;

  summary.innerHTML = `
    <div class="settlement-line"><span>결산 기간</span><strong>${labelMap[period]}</strong></div>
    <div class="settlement-line"><span>예상 누적 경비</span><strong>${formatWon(total * multiplier)}</strong></div>
    <div class="settlement-line"><span>운영 경고 신호</span><strong>${riskSignals}건</strong></div>
    <div class="settlement-line"><span>지연 업무</span><strong>${overdue}건</strong></div>
    <div class="settlement-line"><span>자동 메일 상태</span><strong>${FinalRuntime.config.features.gmail ? 'Gmail Webhook 연결' : 'Webhook 미설정'}</strong></div>
  `;

  renderSettlementChart(rows, multiplier);
}

function renderSettlementChart(rows, multiplier) {
  const canvas = document.getElementById('settlement-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  if (FinalRuntime.settlementChart) FinalRuntime.settlementChart.destroy();

  const grouped = aggregateBy(rows, 'category');
  FinalRuntime.settlementChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: Object.keys(grouped),
      datasets: [{
        label: '예상 경비',
        data: Object.values(grouped).map(v => v * multiplier),
        backgroundColor: '#22D3EE88',
        borderColor: '#22D3EE',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-sub') } },
        y: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-sub'), callback: v => `${Math.round(v / 10000)}만` } }
      }
    }
  });
}

function aggregateBy(rows, key) {
  return rows.reduce((acc, row) => {
    const k = row[key] || '기타';
    acc[k] = (acc[k] || 0) + Number(row.amount || 0);
    return acc;
  }, {});
}

function formatWon(value) {
  return `${Math.round(Number(value || 0)).toLocaleString('ko-KR')}원`;
}

/* =============================================
   Gmail Automation
============================================== */

function initGmailAutomation() {
  document.getElementById('daily-mail-preview-btn')?.addEventListener('click', renderDailyMailPreview);
  document.getElementById('daily-mail-send-btn')?.addEventListener('click', sendDailySummaryMail);
  updateGmailStatus();
  renderDailyMailPreview();
}

function buildDailyMailBody() {
  const topTasks = getSortedTasks().filter(t => !t.isDone).slice(0, 3);
  const expenseTotal = (FinalRuntime.expenseRows.length ? FinalRuntime.expenseRows : sampleExpenses)
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const urgentMails = mails.filter(m => m.unread && m.priority === 'high' && !AppState.repliedMails?.has(m.id)).length;
  const dangerProjects = projects.filter(p => p.status === 'danger').length;

  return [
    `[WorkOS 일일 결산] ${new Date().toISOString().slice(0, 10)}`,
    '',
    `운영 경고 신호: 위험 프로젝트 ${dangerProjects}건 / 긴급 메일 ${urgentMails}건 / KPI 경고 ${countKpiAlerts()}건`,
    `공동 경비 누적: ${formatWon(expenseTotal)}`,
    '',
    '우선 처리 업무',
    ...topTasks.map((t, i) => `${i + 1}. ${t.title} / ${t.owner} / ${getDdayLabel(t.dueDate)}`),
    '',
    '핵심 리스크',
    ...AppState.riskSignals.slice(0, 3).map(s => `- ${s.text}`),
    '',
    '공유 채널: WorkOS Dashboard, Slack #ops-dashboard'
  ].join('\n');
}

function renderDailyMailPreview() {
  const preview = document.getElementById('daily-mail-preview');
  if (preview) preview.textContent = buildDailyMailBody();
}

async function sendDailySummaryMail() {
  const to = document.getElementById('daily-mail-to')?.value.trim();
  const body = buildDailyMailBody();
  if (!to) {
    showToast('일일 결산 메일', '수신 메일 주소를 입력하세요.', 'warning');
    return;
  }

  try {
    const result = await apiPost('/api/gmail/daily-summary', {
      to,
      subject: `[WorkOS] 일일 결산 ${new Date().toISOString().slice(0, 10)}`,
      body
    });
    showToast('일일 결산 메일', result.sent ? 'Gmail Webhook으로 발송했습니다.' : 'Webhook 미설정 상태입니다.', result.sent ? 'success' : 'info');
  } catch (error) {
    await copyText(body, '일일 결산 본문 복사');
    showToast('메일 발송 대기', 'Gmail Webhook 미설정으로 본문을 복사했습니다.', 'info');
  }
}

function updateGmailStatus() {
  const badge = document.getElementById('gmail-status-badge');
  if (!badge) return;
  badge.className = FinalRuntime.config.features.gmail ? 'badge badge--success' : 'badge badge--muted';
  badge.textContent = FinalRuntime.config.features.gmail ? 'Gmail 연결' : 'Gmail 미설정';
}

/* =============================================
   Admin Console
============================================== */

function initAdminConsole() {
  document.getElementById('admin-entry-btn')?.addEventListener('click', () => {
    FinalRuntime.isAdmin ? openAdminSessionModal() : openAdminLoginModal();
  });
  document.getElementById('admin-logout-btn')?.addEventListener('click', logoutAdmin);
  renderAdminConsole();
}

function openAdminSessionModal() {
  openModal(`
    <div class="modal-title">관리자 세션</div>
    <div class="modal-body">
      <div class="admin-login-hint" style="margin-bottom:14px;">현재 관리자 권한이 활성화되어 있습니다.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button id="admin-open-console-btn" class="btn btn--primary">Admin Console 열기</button>
        <button id="admin-session-logout-btn" class="btn btn--danger">로그아웃</button>
        <button class="btn btn--ghost" onclick="closeModal()">취소</button>
      </div>
    </div>
  `);

  setTimeout(() => {
    document.getElementById('admin-open-console-btn')?.addEventListener('click', () => {
      closeModal();
      showDashboardPage('admin');
    });
    document.getElementById('admin-session-logout-btn')?.addEventListener('click', logoutAdmin);
  }, 30);
}

function openAdminLoginModal() {
  if (FinalRuntime.isAdmin) {
    showDashboardPage('admin');
    return;
  }

  openModal(`
    <div class="modal-title">관리자 로그인</div>
    <div class="modal-body">
      <div class="form-group" style="margin-bottom:12px;">
        <label for="admin-password-input">관리자 비밀번호</label>
        <input id="admin-password-input" class="form-input" type="password" placeholder="관리자 비밀번호 입력" autocomplete="current-password" />
      </div>
      <div class="admin-login-hint" style="margin-bottom:14px;">데모 기본값: ADMIN-2026</div>
      <div style="display:flex;gap:8px;">
        <button id="admin-login-btn" class="btn btn--primary">로그인</button>
        <button class="btn btn--ghost" onclick="closeModal()">취소</button>
      </div>
    </div>
  `);

  setTimeout(() => {
    const input = document.getElementById('admin-password-input');
    const btn = document.getElementById('admin-login-btn');
    input?.focus();
    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter') loginAdmin();
    });
    btn?.addEventListener('click', loginAdmin);
  }, 30);
}

function isAdminSessionActive() {
  const session = loadFromLocalStorage('adminSession');
  return Boolean(session?.until && Date.now() < session.until);
}

async function loginAdmin() {
  const input = document.getElementById('admin-password-input');
  const password = input?.value || '';
  let ok = password === 'ADMIN-2026';

  try {
    const result = await apiPost('/api/admin/login', { password });
    ok = Boolean(result.ok);
  } catch (error) {
    ok = password === 'ADMIN-2026';
  }

  if (!ok) {
    showToast('관리자 로그인 실패', '비밀번호를 확인하세요.', 'error');
    return;
  }

  FinalRuntime.isAdmin = true;
  saveToLocalStorage('adminSession', { until: Date.now() + 1000 * 60 * 60 * 2 });
  if (input) input.value = '';
  closeModal();
  renderAdminConsole();
  showDashboardPage('admin');
  showToast('관리자 로그인', '관리자 콘솔이 활성화되었습니다.', 'success');
}

function logoutAdmin() {
  FinalRuntime.isAdmin = false;
  removeFromLocalStorage('adminSession');
  closeModal();
  renderAdminConsole();
  showDashboardPage('briefing');
  showToast('관리자 로그아웃', '관리자 메뉴를 다시 숨겼습니다.', 'info');
}

function getAccessSettings() {
  const saved = loadFromLocalStorage('accessSettings');
  if (saved) return saved;
  return {
    members: Object.fromEntries(teamMembers.map(m => [m.id, m.id === 'admin' ? 'admin' : 'team'])),
    boards: Object.fromEntries(dashboardBoards.map(b => [b.id, { visibility: b.id === 'overview' ? 'public' : 'team', owner: b.owner }]))
  };
}

function saveAccessSettings(settings) {
  saveToLocalStorage('accessSettings', settings);
}

function renderAdminConsole() {
  const status = document.getElementById('admin-status-badge');
  const consoleCard = document.getElementById('admin-console-card');
  const navItem = document.querySelector('.admin-nav-item');
  const entryBtn = document.getElementById('admin-entry-btn');

  if (status) {
    status.className = FinalRuntime.isAdmin ? 'badge badge--success' : 'badge badge--warning';
    status.textContent = FinalRuntime.isAdmin ? '활성' : '잠김';
  }

  navItem?.classList.toggle('is-admin-hidden', !FinalRuntime.isAdmin);
  navItem?.setAttribute('aria-hidden', String(!FinalRuntime.isAdmin));
  if (entryBtn) {
    entryBtn.classList.toggle('admin-entry-active', FinalRuntime.isAdmin);
    entryBtn.innerHTML = FinalRuntime.isAdmin
      ? '<span>🛡️</span> <span class="admin-entry-label">Admin</span>'
      : '<span>🛡️</span> <span class="admin-entry-label">Admin</span>';
    entryBtn.title = FinalRuntime.isAdmin ? '관리자 콘솔 / 로그아웃' : '관리자 로그인';
  }

  consoleCard?.classList.toggle('hidden', !FinalRuntime.isAdmin);
  if (FinalRuntime.isAdmin) {
    renderAdminTeamGrid();
    renderAdminAccessMatrix();
  }
}

function renderAdminTeamGrid() {
  const grid = document.getElementById('admin-team-grid');
  if (!grid) return;
  const settings = getAccessSettings();
  grid.innerHTML = teamMembers.map(member => `
    <div class="member-card">
      <div class="member-card-top">
        <div>
          <div class="member-name">${escHtml(member.name)}</div>
          <div class="member-role">${escHtml(member.team)} · ${escHtml(member.role)}</div>
        </div>
        <span class="badge ${member.status === 'busy' ? 'badge--warning' : member.status === 'away' ? 'badge--muted' : 'badge--success'}">${escHtml(member.status)}</span>
      </div>
      <select class="form-select access-select" data-member-access="${escHtml(member.id)}">
        <option value="admin" ${settings.members[member.id] === 'admin' ? 'selected' : ''}>관리자</option>
        <option value="team" ${settings.members[member.id] === 'team' ? 'selected' : ''}>팀 공개 보드</option>
        <option value="private" ${settings.members[member.id] === 'private' ? 'selected' : ''}>개인 전용 보드</option>
      </select>
    </div>
  `).join('');

  grid.querySelectorAll('[data-member-access]').forEach(select => {
    select.addEventListener('change', () => {
      const next = getAccessSettings();
      next.members[select.dataset.memberAccess] = select.value;
      saveAccessSettings(next);
      showToast('권한 변경', '팀원 접근 범위를 저장했습니다.', 'success', 1800);
    });
  });
}

function renderAdminAccessMatrix() {
  const el = document.getElementById('admin-access-matrix');
  if (!el) return;
  const settings = getAccessSettings();
  el.innerHTML = `
    <table class="data-table">
      <thead><tr><th>보드</th><th>공개 범위</th><th>담당자</th><th>상태</th></tr></thead>
      <tbody>
        ${dashboardBoards.map(board => {
          const item = settings.boards[board.id] || { visibility: 'team', owner: board.owner };
          return `
            <tr>
              <td>${escHtml(board.label)}</td>
              <td>
                <select class="form-select compact-select" data-board-visibility="${escHtml(board.id)}">
                  <option value="public" ${item.visibility === 'public' ? 'selected' : ''}>전체 공개</option>
                  <option value="team" ${item.visibility === 'team' ? 'selected' : ''}>팀 공개</option>
                  <option value="private" ${item.visibility === 'private' ? 'selected' : ''}>담당자 전용</option>
                </select>
              </td>
              <td>${escHtml(teamMembers.find(m => m.id === item.owner)?.name || item.owner)}</td>
              <td><span class="badge ${item.visibility === 'public' ? 'badge--success' : item.visibility === 'team' ? 'badge--blue' : 'badge--warning'}">${escHtml(item.visibility)}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  el.querySelectorAll('[data-board-visibility]').forEach(select => {
    select.addEventListener('change', () => {
      const next = getAccessSettings();
      const board = next.boards[select.dataset.boardVisibility];
      board.visibility = select.value;
      saveAccessSettings(next);
      renderAdminAccessMatrix();
      showToast('보드 공개 설정', '대시보드 공개 범위를 저장했습니다.', 'success', 1800);
    });
  });
}

/* =============================================
   Integration Status
============================================== */

function renderIntegrationStatus() {
  const grid = document.getElementById('integration-grid');
  const badge = document.getElementById('api-health-badge');
  if (!grid) return;

  const hasUserClaudeKey = Boolean(getUserClaudeApiKey());
  const hasMeetingOpenAiKey = Boolean(getMeetingOpenAiApiKey());
  const cards = [
    ['Google Login', 'GOOGLE_CLIENT_ID', Boolean(FinalRuntime.config.googleClientId), 'Google Identity Services'],
    ['Slack Chat', 'SLACK_WEBHOOK_URL', FinalRuntime.config.features.slack, '팀 채팅 메시지 Webhook 전송'],
    ['Claude Copilot', hasUserClaudeKey ? 'User Claude Key (session)' : 'ANTHROPIC_API_KEY', FinalRuntime.config.features.anthropic || hasUserClaudeKey, '업무 AI / AI 변호사 응답'],
    ['OpenAI Meeting AI', hasMeetingOpenAiKey ? 'User OpenAI Key (session)' : 'OPENAI_API_KEY', FinalRuntime.config.features.openai || hasMeetingOpenAiKey, 'Audio transcription / gpt-4o-mini-transcribe'],
    ['Google Sheet Expense', 'GOOGLE_SHEETS_CSV_URL', FinalRuntime.config.features.googleSheets, '공동 경비 CSV 동기화'],
    ['Daily Gmail', 'GMAIL_WEBHOOK_URL', FinalRuntime.config.features.gmail, 'Apps Script 또는 Gmail 발송 Webhook'],
    ['Railway Deploy', 'PORT', FinalRuntime.config.features.railway, 'Node 정적 서버 + API 프록시']
  ];

  grid.innerHTML = cards.map(([title, env, ready, desc]) => `
    <div class="integration-card">
      <div class="integration-card-title">
        <span>${escHtml(title)}</span>
        <span class="badge ${ready ? 'badge--success' : 'badge--muted'}">${ready ? 'Ready' : 'Setup'}</span>
      </div>
      <div class="muted-text" style="margin-bottom:10px;">${escHtml(desc)}</div>
      <code>${escHtml(env)}</code>
    </div>
  `).join('');

  if (badge) {
    const readyCount = cards.filter(c => c[2]).length;
    badge.className = readyCount >= 4 ? 'badge badge--success' : readyCount > 0 ? 'badge badge--warning' : 'badge badge--muted';
    badge.textContent = `${readyCount}/${cards.length} 연결`;
  }
}
