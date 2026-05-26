/* ==============================================
   WorkOS AI Command Center — dashboard.js
   렌더링 1부: 초기화 + 핵심 섹션
   Section Map:
   1.  앱 초기화 (DOMContentLoaded)
   2.  Toast 시스템
   3.  Modal 시스템
   4.  Count-Up 애니메이션
   5.  AI Daily Briefing
   6.  Executive Summary Cards
   7.  Project Milestone Tracker
   8.  Countdown Timers
   9.  KPI Traffic Light
   10. SWOT Risk Matrix
   11. Health Score 위젯
   12. Action Recommendations
   13. Alert 위젯
   14. 테마 토글
   15. Sidebar / Copilot 토글
   16. Command Palette
   17. 전역 검색 연결
   18. 네비게이션 스크롤
============================================== */

/* =============================================
   1. 앱 초기화
============================================== */
document.addEventListener('DOMContentLoaded', () => {
  // LocalStorage → AppState 복원
  restoreAppState();

  // 클록 시작
  startClock();

  // 렌더링 (순서 중요: engine 계산 → DOM 삽입)
  renderBriefing();
  renderSummaryCards();
  renderProjects();
  renderCountdowns();
  renderKpis();
  renderRisks();
  renderHealthWidget();
  renderActionRecommendations();
  renderAlerts();
  renderTelegramLogs();

  // 2부 함수들 (dashboard.js 2부에서 정의)
  renderTasks();
  renderCalendar();
  renderMails();
  renderAnnouncements();
  renderHotIssues();
  renderBranchModel();
  renderExchangeRates();
  renderResourceLoad();
  renderDecisionLog();
  initSimulation();

  // UI 이벤트 연결
  initThemeToggle();
  initSidebarToggle();
  initCopilotToggle();
  initUserProfile();
  initCommandPalette();
  initNavScroll();
  initModalClose();
  initNotifBtn();
  updateOrgBadge();
  updateNotifCount();
  initRadarChart();

  // 매 30초마다 건강점수·알림 갱신
  setInterval(() => {
    AppState.healthData = calculateHealthScore();
    AppState.riskSignals = generateRiskSignals();
    updateOrgBadge();
    updateNotifCount();
    renderHealthWidget();
    renderAlerts();
  }, 30000);
});

/* =============================================
   2. Toast 시스템
============================================== */

/**
 * 화면 우하단에 토스트 메시지 표시
 * @param {string} title  - 굵게 표시할 제목
 * @param {string} msg    - 본문 메시지
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration - ms (기본 4000)
 */
function showToast(title, msg = '', type = 'info', duration = 4000) {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: '💡' };
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '💡'}</span>
    <div class="toast-body">
      <div class="toast-title">${escHtml(title)}</div>
      ${msg ? `<div class="toast-msg">${escHtml(msg)}</div>` : ''}
    </div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* =============================================
   3. Modal 시스템
============================================== */

function openModal(html) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;
  content.innerHTML = html;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

function initModalClose() {
  // modal-close button removed; close via ESC / overlay click
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

/* =============================================
   4. Count-Up 애니메이션
============================================== */

/**
 * 숫자를 0에서 target까지 애니메이션
 * @param {HTMLElement} el
 * @param {number} target
 * @param {number} duration - ms
 * @param {string} suffix
 */
function countUp(el, target, duration = 1200, suffix = '') {
  if (!el) return;
  const startTime = performance.now();
  const isFloat = !Number.isInteger(target);
  const decimals = isFloat ? 1 : 0;

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutQuart
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = target * eased;
    el.textContent = current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* =============================================
   5. AI Daily Briefing
============================================== */

function renderBriefing() {
  const card = document.getElementById('briefing-card');
  if (!card) return;

  const { status, statusLabel, text, actions, healthScore } = generateDailyBriefing();

  // 테두리 색상
  const borderColor = status === 'Critical' ? 'var(--danger)'
    : status === 'Warning' ? 'var(--warning)'
    : 'var(--accent-cyan)';

  const scoreColor = status === 'Critical' ? 'var(--danger)'
    : status === 'Warning' ? 'var(--warning)'
    : 'var(--success)';

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일 AI 브리핑`;

  card.style.borderColor = borderColor;
  card.innerHTML = `
    <div class="briefing-orb">🤖</div>
    <div class="briefing-body">
      <div class="briefing-date">${dateStr}</div>
      <p class="briefing-text">${text}</p>
      <div class="briefing-actions">
        ${actions.map((a, i) => `
          <button class="briefing-action-chip" onclick="scrollToSection('section-tasks')">
            ${i + 1}. ${escHtml(a)}
          </button>
        `).join('')}
      </div>
    </div>
    <div class="briefing-score-box">
      <div class="briefing-score-num" id="briefing-score-num" style="color:${scoreColor}">0</div>
      <div class="briefing-score-label">Health Score</div>
      <div class="badge ${status === 'Critical' ? 'badge--danger' : status === 'Warning' ? 'badge--warning' : 'badge--success'}" style="margin-top:6px;">
        ${status}
      </div>
    </div>
  `;

  // count-up 애니메이션
  countUp(document.getElementById('briefing-score-num'), healthScore, 1400);
}

/* =============================================
   6. Executive Summary Cards
============================================== */

function renderSummaryCards() {
  const container = document.getElementById('summary-cards');
  if (!container) return;

  const sortedTasks    = getSortedTasks(); // isDone 반영된 배열
  const dangerProjects = projects.filter(p => p.status === 'danger').length;
  const activeProjects = projects.filter(p => p.status !== 'done').length;
  const todayDeadlines = sortedTasks.filter(t => getDaysLeft(t.dueDate) <= 0 && !t.isDone).length;
  const unreadMails    = mails.filter(m => m.unread && !AppState.repliedMails?.has(m.id)).length;
  const kpiAlerts      = countKpiAlerts();
  const todayMeetings  = calendarEvents.filter(e =>
    e.type === 'meeting' && e.date === new Date().toISOString().slice(0, 10)
  ).length;
  const { score } = calculateHealthScore();
  const aiActions = generateActionRecommendations().length;

  const cardDefs = [
    {
      icon: '📁', label: '진행 중 프로젝트',
      value: activeProjects, delta: '+0', deltaType: 'neutral',
      color: 'var(--accent-blue)', section: 'section-projects'
    },
    {
      icon: '🔴', label: '위험 프로젝트',
      value: dangerProjects, delta: dangerProjects > 0 ? `+${dangerProjects}` : '0', deltaType: dangerProjects > 0 ? 'down' : 'neutral',
      color: 'var(--danger)', section: 'section-projects'
    },
    {
      icon: '⏰', label: '오늘 마감 업무',
      value: todayDeadlines, delta: todayDeadlines > 0 ? '긴급' : '없음', deltaType: todayDeadlines > 0 ? 'down' : 'neutral',
      color: todayDeadlines > 0 ? 'var(--danger)' : 'var(--success)', section: 'section-tasks'
    },
    {
      icon: '📧', label: '읽지 않은 메일',
      value: unreadMails, delta: unreadMails > 0 ? `${mails.filter(m=>m.unread&&m.priority==='high'&&!AppState.repliedMails?.has(m.id)).length}건 긴급` : '없음', deltaType: unreadMails > 0 ? 'down' : 'neutral',
      color: unreadMails > 0 ? 'var(--warning)' : 'var(--success)', section: 'section-mail'
    },
    {
      icon: '📊', label: 'KPI 경고',
      value: kpiAlerts, delta: kpiAlerts > 0 ? '조치 필요' : '정상', deltaType: kpiAlerts > 0 ? 'down' : 'neutral',
      color: kpiAlerts > 0 ? 'var(--warning)' : 'var(--success)', section: 'section-kpi'
    },
    {
      icon: '📅', label: '오늘 회의',
      value: todayMeetings, delta: todayMeetings > 0 ? `${todayMeetings}건` : '없음', deltaType: 'neutral',
      color: 'var(--accent-cyan)', section: 'section-calendar'
    },
    {
      icon: '⚡', label: 'AI 추천 액션',
      value: aiActions, delta: '지금 확인', deltaType: 'up',
      color: 'var(--accent-purple)', section: 'section-tasks'
    },
    {
      icon: '💚', label: '조직 건강 점수',
      value: score, delta: score >= 72 ? '안정' : score >= 50 ? '주의' : '위험', deltaType: score >= 72 ? 'up' : 'down',
      color: score >= 72 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)',
      suffix: '',  section: 'section-briefing'
    }
  ];

  container.innerHTML = cardDefs.map((c, i) => `
    <div class="summary-card card glass" onclick="scrollToSection('${c.section}')" style="cursor:pointer;" title="${c.label} 섹션으로 이동">
      <div class="summary-card-icon" style="background:${c.color}22; color:${c.color}">${c.icon}</div>
      <div class="summary-card-label">${c.label}</div>
      <div class="summary-card-value" id="summary-val-${i}" style="color:${c.color}">0</div>
      <div class="summary-card-delta delta--${c.deltaType}">${c.delta}</div>
    </div>
  `).join('');

  // count-up
  cardDefs.forEach((c, i) => {
    countUp(document.getElementById(`summary-val-${i}`), c.value, 1000 + i * 120);
  });
}

/* =============================================
   7. Project Milestone Tracker
============================================== */

function renderProjects() {
  const container = document.getElementById('projects-list');
  const dangerCount = document.getElementById('projects-danger-count');
  if (!container) return;

  const danger = projects.filter(p => p.status === 'danger').length;
  if (dangerCount) {
    dangerCount.textContent = danger > 0 ? `🔴 위험 ${danger}건` : '';
    dangerCount.className = danger > 0 ? 'badge badge--danger' : '';
  }

  // 위험 → 주의 → 정상 순 정렬
  const statusOrder = { danger: 0, warning: 1, normal: 2 };
  const sorted = [...projects].sort((a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3));

  container.innerHTML = sorted.map(p => {
    const daysLeft  = getDaysLeft(p.deadline);
    const dday      = getDdayLabel(p.deadline);
    const isDanger  = p.status === 'danger';
    const isWarning = p.status === 'warning';
    const accentClass = isDanger ? 'danger-accent' : isWarning ? 'warning-accent' : '';
    const fillClass   = isDanger ? 'danger-fill'  : isWarning ? 'warning-fill'  : '';
    const statusBadge = isDanger
      ? '<span class="badge badge--danger">위험</span>'
      : isWarning
        ? '<span class="badge badge--warning">주의</span>'
        : '<span class="badge badge--success">정상</span>';
    const ddayBadge = daysLeft <= 3
      ? `<span class="badge badge--danger">${dday}</span>`
      : daysLeft <= 7
        ? `<span class="badge badge--warning">${dday}</span>`
        : `<span class="badge badge--muted">${dday}</span>`;

    const budgetPct = p.budget ? Math.round((p.budgetUsed / p.budget) * 100) : 0;

    return `
      <div class="project-card card glass ${accentClass}" id="project-card-${p.id}">
        <div class="project-card-top">
          <div>
            <div class="project-name">${escHtml(p.name)}</div>
            <div class="project-team">${escHtml(p.team)}</div>
          </div>
          ${statusBadge}
        </div>

        <div class="project-meta">
          <div class="project-meta-item">👤 <span class="project-owner">${escHtml(p.owner)}</span></div>
          <div class="project-meta-item">📅 ${ddayBadge}</div>
          <div class="project-meta-item">💰 예산 ${budgetPct}%</div>
        </div>

        <div class="progress-wrap">
          <div class="progress-label">
            <span>진행률</span>
            <span id="proj-pct-${p.id}">0%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${fillClass}" id="proj-bar-${p.id}" style="width:0%"></div>
          </div>
        </div>

        <div class="project-stages">
          <span class="stage-chip">현재: ${escHtml(p.currentStage)}</span>
          <span class="stage-chip next">다음: ${escHtml(p.nextStage)}</span>
        </div>

        <div style="display:flex; gap:6px; margin-top:4px; flex-wrap:wrap;">
          <button class="project-ai-btn" onclick="showProjectAiAnalysis(${p.id})">
            🤖 AI 원인 분석
          </button>
          <button class="project-ai-btn" style="background:rgba(34,211,238,0.06);border-color:rgba(34,211,238,0.2);color:var(--accent-cyan);"
            onclick="openModal(getProjectDetailHtml(${p.id}))">
            📋 상세 보기
          </button>
        </div>
      </div>
    `;
  }).join('');

  // progress bar 애니메이션
  requestAnimationFrame(() => {
    sorted.forEach(p => {
      const bar = document.getElementById(`proj-bar-${p.id}`);
      const pct = document.getElementById(`proj-pct-${p.id}`);
      if (bar) bar.style.width = p.progress + '%';
      if (pct) countUp(pct, p.progress, 1100, '%');
    });
  });
}

/**
 * 프로젝트 AI 원인 분석 모달 열기
 */
function showProjectAiAnalysis(projectId) {
  const p = projects.find(x => x.id === projectId);
  if (!p) return;

  const daysLeft = getDaysLeft(p.deadline);
  const relatedRisks = risks.filter(r => r.dueInDays <= 7 && (r.category === 'Weakness' || r.category === 'Threat')).slice(0, 2);
  const relatedTeam  = resources.find(r => r.name === p.team);
  const loadNote     = relatedTeam ? `${relatedTeam.name}의 현재 업무 부하는 <strong>${relatedTeam.load}%</strong>입니다.` : '';

  const html = `
    <div class="modal-title">🤖 AI 원인 분석 — ${escHtml(p.name)}</div>
    <div class="modal-body">
      <div class="modal-section-title">현황 요약</div>
      <p>현재 진행률 <strong>${p.progress}%</strong>, 마감까지 <strong>${daysLeft <= 0 ? '기한 초과' : daysLeft + '일'}</strong> 남았습니다.
      현재 단계는 <strong>${escHtml(p.currentStage)}</strong>이며, 다음 단계 <strong>${escHtml(p.nextStage)}</strong>로 전환이 필요합니다.</p>

      ${loadNote ? `
      <div class="modal-section-title">팀 부하 분석</div>
      <p>${loadNote} ${relatedTeam && relatedTeam.load >= 80 ? '과부하 상태로 병목 위험이 존재합니다.' : '적정 수준입니다.'}</p>
      ` : ''}

      ${relatedRisks.length > 0 ? `
      <div class="modal-section-title">연관 리스크</div>
      <ul style="list-style:disc; padding-left:16px; color:var(--text-sub); font-size:13px; line-height:1.8;">
        ${relatedRisks.map(r => `<li>${escHtml(r.title)} (우선순위 ${calculateRiskPriority(r)}점)</li>`).join('')}
      </ul>
      ` : ''}

      <div class="modal-section-title">AI 권장 조치</div>
      <p>${relatedTeam && relatedTeam.load >= 90
        ? `${escHtml(relatedTeam.name)} 업무 일부를 다른 팀으로 재배정하고, ${escHtml(p.currentStage)} 단계를 최우선으로 집중하세요.`
        : `현재 단계(${escHtml(p.currentStage)})를 이번 주 내 완료하고 다음 단계(${escHtml(p.nextStage)})로 신속히 전환하세요.`}
      </p>

      <div style="margin-top:12px; display:flex; gap:8px;">
        <button class="btn btn--primary btn--sm" onclick="sendTelegramAlert('project', ${p.id}); closeModal();">✈️ 팀에게 알림 전송</button>
        <button class="btn btn--ghost btn--sm" onclick="closeModal()">닫기</button>
      </div>
    </div>
  `;
  openModal(html);
}

/**
 * 프로젝트 상세 정보 HTML 반환
 */
function getProjectDetailHtml(projectId) {
  const p = projects.find(x => x.id === projectId);
  if (!p) return '<p>데이터 없음</p>';
  const budgetPct = Math.round((p.budgetUsed / p.budget) * 100);

  return `
    <div class="modal-title">📁 ${escHtml(p.name)}</div>
    <div class="modal-body">
      <div class="modal-section-title">프로젝트 개요</div>
      <p>${escHtml(p.description)}</p>

      <div class="modal-section-title">진행 현황</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
        <div><span style="color:var(--text-muted);font-size:11px;">팀</span><br><strong>${escHtml(p.team)}</strong></div>
        <div><span style="color:var(--text-muted);font-size:11px;">담당자</span><br><strong>${escHtml(p.owner)}</strong></div>
        <div><span style="color:var(--text-muted);font-size:11px;">진행률</span><br><strong>${p.progress}%</strong></div>
        <div><span style="color:var(--text-muted);font-size:11px;">마감</span><br><strong>${p.deadline} (${getDdayLabel(p.deadline)})</strong></div>
        <div><span style="color:var(--text-muted);font-size:11px;">예산 집행</span><br><strong>${budgetPct}% (${(p.budgetUsed/1000000).toFixed(0)}M / ${(p.budget/1000000).toFixed(0)}M)</strong></div>
        <div><span style="color:var(--text-muted);font-size:11px;">현재 단계</span><br><strong>${escHtml(p.currentStage)}</strong></div>
      </div>
      <div style="margin-top:12px;">
        <button class="btn btn--ghost btn--sm" onclick="closeModal()">닫기</button>
      </div>
    </div>
  `;
}

/* =============================================
   8. Countdown Timers
============================================== */

let countdownIntervals = [];

function renderCountdowns() {
  const container = document.getElementById('countdown-list');
  if (!container) return;

  // 기존 interval 정리
  countdownIntervals.forEach(clearInterval);
  countdownIntervals = [];

  container.innerHTML = countdownTargets.map(ct => `
    <div class="countdown-card card glass">
      <div class="countdown-event">${ct.icon} ${escHtml(ct.label)}</div>
      <div class="countdown-digits" id="cd-digits-${ct.id}">
        <div class="cd-unit"><div class="cd-num" id="cd-d-${ct.id}">--</div><div class="cd-label">일</div></div>
        <div class="cd-sep">:</div>
        <div class="cd-unit"><div class="cd-num" id="cd-h-${ct.id}">--</div><div class="cd-label">시</div></div>
        <div class="cd-sep">:</div>
        <div class="cd-unit"><div class="cd-num" id="cd-m-${ct.id}">--</div><div class="cd-label">분</div></div>
        <div class="cd-sep">:</div>
        <div class="cd-unit"><div class="cd-num" id="cd-s-${ct.id}">--</div><div class="cd-label">초</div></div>
      </div>
      <div class="countdown-name">${escHtml(ct.label)}</div>
    </div>
  `).join('');

  // 각 타이머 tick
  countdownTargets.forEach(ct => {
    const tick = () => {
      const now     = new Date();
      const target  = new Date(ct.targetDate);
      const diff    = target - now;

      const dEl = document.getElementById(`cd-d-${ct.id}`);
      const hEl = document.getElementById(`cd-h-${ct.id}`);
      const mEl = document.getElementById(`cd-m-${ct.id}`);
      const sEl = document.getElementById(`cd-s-${ct.id}`);
      if (!dEl) return;

      if (diff <= 0) {
        [dEl, hEl, mEl, sEl].forEach(el => { el.textContent = '00'; el.classList.add('urgent'); });
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const d  = Math.floor(totalSec / 86400);
      const h  = Math.floor((totalSec % 86400) / 3600);
      const m  = Math.floor((totalSec % 3600) / 60);
      const s  = totalSec % 60;
      const urgent = diff < 86400000; // 24시간 미만

      const fmt = n => String(n).padStart(2, '0');
      dEl.textContent = fmt(d);
      hEl.textContent = fmt(h);
      mEl.textContent = fmt(m);
      sEl.textContent = fmt(s);

      [dEl, hEl, mEl, sEl].forEach(el => el.classList.toggle('urgent', urgent));
    };

    tick();
    countdownIntervals.push(setInterval(tick, 1000));
  });
}

/* =============================================
   9. KPI Traffic Light
============================================== */

function renderKpis() {
  const container = document.getElementById('kpi-grid');
  const alertEl   = document.getElementById('kpi-alert-count');
  if (!container) return;

  const kpisWithStatus = getKpisWithStatus();
  const alertCount = kpisWithStatus.filter(k => k.status !== 'green').length;

  if (alertEl) {
    alertEl.textContent  = alertCount > 0 ? `⚠️ 경고 ${alertCount}건` : '';
    alertEl.className    = alertCount > 0 ? 'badge badge--warning' : '';
  }

  container.innerHTML = kpisWithStatus.map(k => {
    const trendArrow = k.trend > 0 ? '▲' : k.trend < 0 ? '▼' : '—';
    const trendClass = k.trend > 0 ? 'up' : k.trend < 0 ? 'down' : '';
    const fillWidth  = Math.min(100, Math.round((k.current / k.target) * 100));

    return `
      <div class="kpi-card card glass" onclick="toggleKpiDetail(this)">
        <div class="kpi-card-top">
          <div class="kpi-light ${k.status}"></div>
          <div class="kpi-name">${escHtml(k.name)}</div>
          <div class="kpi-trend ${trendClass}">${trendArrow} ${Math.abs(k.trend)}${k.unit}</div>
        </div>

        <div class="kpi-values">
          <span>현재 <strong class="kpi-current" style="color:${k.status === 'green' ? 'var(--success)' : k.status === 'yellow' ? 'var(--warning)' : 'var(--danger)'}">${k.current}${k.unit}</strong></span>
          <span>목표 <strong>${k.target}${k.unit}</strong></span>
        </div>

        <div class="progress-bar-bg" style="height:5px;">
          <div class="progress-bar-fill ${k.status === 'red' ? 'danger-fill' : k.status === 'yellow' ? 'warning-fill' : ''}"
            style="width:${fillWidth}%; transition: width 1.2s ease;"></div>
        </div>

        <div class="kpi-detail">
          <p style="margin-bottom:8px;">${escHtml(k.description)}</p>
          ${k.status !== 'green' ? `
            <div style="padding:8px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:6px;font-size:11px;color:var(--accent-purple);">
              🤖 ${escHtml(k.aiSuggestion)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function toggleKpiDetail(card) {
  const detail = card.querySelector('.kpi-detail');
  if (!detail) return;
  const willOpen = !detail.classList.contains('open');
  detail.classList.toggle('open', willOpen);
  card.classList.toggle('expanded', willOpen);
  if (willOpen) showToast('KPI 상세 분석', '선택한 KPI의 AI 개선 제안을 펼쳤습니다.', 'info', 1800);
}

/* =============================================
   10. SWOT Risk Matrix
============================================== */

function renderRisks() {
  const matrix     = document.getElementById('swot-matrix');
  const signalList = document.getElementById('risk-signal-list');
  if (!matrix) return;

  const categories = ['Strength', 'Weakness', 'Opportunity', 'Threat'];
  const catMap = { Strength: 'S', Weakness: 'W', Opportunity: 'O', Threat: 'T' };
  const catLabel = { Strength: '💪 강점', Weakness: '⚡ 약점', Opportunity: '🌱 기회', Threat: '🔥 위협' };

  matrix.innerHTML = categories.map(cat => {
    const items = risks.filter(r => r.category === cat);
    const key   = catMap[cat];

    return `
      <div class="swot-cell ${key}">
        <div class="swot-cell-title">${catLabel[cat]}</div>
        <div class="swot-tags">
          ${items.map(r => {
            const score    = calculateRiskPriority(r);
            const isPulse  = score >= 80;
            const tagColor = cat === 'Weakness' || cat === 'Threat'
              ? (score >= 80 ? 'var(--danger)' : score >= 60 ? 'var(--warning)' : 'var(--text-muted)')
              : (cat === 'Strength' ? 'var(--success)' : 'var(--accent-blue)');

            return `
              <div class="risk-tag ${isPulse ? 'pulse-tag' : ''}"
                style="border-color:${tagColor}33; color:${tagColor};"
                onclick="showRiskDetail(${r.id})"
                title="${escHtml(r.title)} — 클릭하여 상세 보기">
                ${escHtml(r.title)}
                <span class="risk-score">${score}점</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  // Risk Signal Stream
  if (signalList) {
    const signals = AppState.riskSignals;
    if (signals.length === 0) {
      signalList.innerHTML = '<p class="muted-text" style="padding:8px;">현재 감지된 신호 없음</p>';
      return;
    }
    signalList.innerHTML = signals.map((s, i) => `
      <div class="risk-signal-item" style="animation-delay:${i * 0.05}s">
        <span class="risk-signal-time">${s.time}</span>
        <span class="risk-signal-text">${escHtml(s.text)}</span>
      </div>
    `).join('');
  }
}

/**
 * 리스크 상세 모달 열기
 */
function showRiskDetail(riskId) {
  const r = risks.find(x => x.id === riskId);
  if (!r) return;
  const score    = calculateRiskPriority(r);
  const isNeg    = r.category === 'Weakness' || r.category === 'Threat';
  const badgeCls = isNeg ? 'badge--danger' : 'badge--success';

  // AI 권장 조치 — mitigationPlans에 있으면 사용, 없으면 동적 생성
  const planKey  = `risk-${r.id}`;
  const plan     = typeof mitigationPlans !== 'undefined' && mitigationPlans[planKey];
  const aiActions = plan
    ? plan.actions.slice(0, 3)
    : [
        `긴급도 ${r.urgency}/10 — 즉각적인 담당 팀 에스컬레이션 필요`,
        `영향도 ${r.impact}/10 — 연관 프로젝트 일정 재검토 및 버퍼 확보 권장`,
        `병목 점수 ${r.bottleneckScore}/10 — 의존 업무 블로킹 여부 즉시 확인 후 재배정`
      ];

  openModal(`
    <div class="modal-title">
      ⚠️ ${escHtml(r.title)}
      <span class="badge ${badgeCls}" style="margin-left:8px;">${r.category}</span>
    </div>
    <div class="modal-body">
      <div class="modal-section-title">상세 분석</div>
      <p style="font-size:13px;color:var(--text-sub);line-height:1.6;margin-bottom:14px;">${escHtml(r.detail)}</p>

      <div class="modal-section-title">리스크 지표</div>
      <div class="risk-modal-metrics">
        ${[
          ['긴급도', r.urgency],
          ['영향도', r.impact],
          ['KPI 영향', r.kpiImpact],
          ['병목 점수', r.bottleneckScore],
          ['마감', r.dueInDays <= 999 ? `D-${r.dueInDays}` : '—'],
          ['우선순위', `${score}점`]
        ].map(([l, v]) => `
          <div class="risk-metric-box">
            <div class="risk-metric-label">${l}</div>
            <div class="risk-metric-val">${v}</div>
          </div>
        `).join('')}
      </div>

      <div class="modal-section-title" style="margin-top:14px;">🤖 AI 권장 조치</div>
      <div class="risk-ai-actions">
        ${aiActions.map((a, i) => `
          <div class="risk-ai-action-item">
            <span class="risk-ai-action-num">${i + 1}</span>
            <span>${escHtml(a)}</span>
          </div>
        `).join('')}
      </div>

      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
        <button class="btn btn--danger btn--sm" onclick="sendTelegramAlert('risk', ${r.id}); closeModal();">✈️ Telegram 긴급 알림</button>
        <button class="btn btn--primary btn--sm" onclick="recordRiskDecision(${r.id}); closeModal();">📝 결정 로그 기록</button>
        <button class="btn btn--ghost btn--sm" onclick="closeModal()">닫기</button>
      </div>
    </div>
  `);
}

function recordRiskDecision(riskId) {
  const r = risks.find(x => x.id === riskId);
  if (!r) return;
  const logs = loadFromLocalStorage('decisionLogs') || [];
  const now  = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  logs.unshift({
    id: Date.now(),
    date: dateStr,
    title: `[AI 자동기록] ${r.title} 리스크 검토`,
    reason: r.detail,
    participants: ['AI System', 'Dashboard User'],
    relatedRisk: r.title,
    aiSummary: `우선순위 점수 ${calculateRiskPriority(r)}점 리스크에 대한 검토 완료. 후속 조치 이행 필요.`
  });
  saveToLocalStorage('decisionLogs', logs);
  showToast('결정 로그 기록', `"${r.title}" 검토 내용이 결정 로그에 저장되었습니다.`, 'success');
  if (typeof renderDecisionLog === 'function') renderDecisionLog();
}

/* =============================================
   11. Health Score 위젯 (우측 패널)
============================================== */

function renderHealthWidget() {
  const scoreEl   = document.getElementById('health-score-value');
  const barEl     = document.getElementById('health-bar');
  const statusEl  = document.getElementById('health-status-badge');
  const factorsEl = document.getElementById('health-factors');

  // 사이드바 미니
  const miniScore = document.getElementById('sidebar-health-score');
  const miniBar   = document.getElementById('sidebar-health-bar');

  const { score, status, factors } = AppState.healthData || calculateHealthScore();

  if (scoreEl) countUp(scoreEl, score, 1500);
  if (barEl)   barEl.style.width = score + '%';
  if (miniScore) countUp(miniScore, score, 1200);
  if (miniBar)   miniBar.style.width = score + '%';

  if (statusEl) {
    statusEl.className = `badge ${status === 'Critical' ? 'badge--danger' : status === 'Warning' ? 'badge--warning' : 'badge--success'}`;
    statusEl.textContent = status;
  }

  if (factorsEl && factors) {
    factorsEl.innerHTML = Object.entries(factors).map(([name, f]) => `
      <div class="health-factor-row">
        <span>${name}</span>
        <span class="health-factor-val ${f.level}">${typeof f.value === 'number' ? f.value + '건' : f.value}</span>
      </div>
    `).join('');
  }
}

/* =============================================
   12. Action Recommendations
============================================== */

function renderActionRecommendations() {
  const list = document.getElementById('action-rec-list');
  if (!list) return;

  const recs = generateActionRecommendations();
  list.innerHTML = recs.map((r, i) => `
    <li class="action-rec-item" onclick="scrollToSection('section-tasks')">
      <span class="action-num">${i + 1}</span>
      <span>${escHtml(r)}</span>
    </li>
  `).join('');
}

/* =============================================
   13. Alert 위젯
============================================== */

function renderAlerts() {
  const list = document.getElementById('alert-list');
  if (!list) return;

  const alerts = [];

  // 위험 프로젝트
  projects.filter(p => p.status === 'danger').forEach(p => {
    alerts.push({ type: 'danger', text: `[${p.name}] 위험 — D-${getDaysLeft(p.deadline)}` });
  });

  // 긴급 메일
  mails.filter(m => m.unread && m.priority === 'high' && !AppState.repliedMails?.has(m.id)).forEach(m => {
    alerts.push({ type: 'danger', text: `긴급 메일 — SLA ${m.slaHoursLeft}h 남음` });
  });

  // KPI yellow/red
  kpis.filter(k => getKpiStatus(k.current, k.target) !== 'green').slice(0, 2).forEach(k => {
    const st = getKpiStatus(k.current, k.target);
    alerts.push({ type: st === 'red' ? 'danger' : 'warning', text: `KPI [${k.name}] ${k.current}${k.unit} / 목표 ${k.target}${k.unit}` });
  });

  // 과부하 팀
  resources.filter(r => r.load >= 90).forEach(r => {
    alerts.push({ type: 'warning', text: `[${r.name}] 업무 과부하 ${r.load}%` });
  });

  if (alerts.length === 0) {
    list.innerHTML = '<p class="muted-text">현재 위험 알림 없음</p>';
    return;
  }

  list.innerHTML = alerts.slice(0, 5).map(a => `
    <div class="alert-item ${a.type}">
      <span>${a.type === 'danger' ? '🔴' : '🟡'}</span>
      <span>${escHtml(a.text)}</span>
    </div>
  `).join('');
}

/* =============================================
   13-B. 알림 버튼
============================================== */

function initNotifBtn() {
  document.getElementById('notif-btn')?.addEventListener('click', () => {
    const urgent = mails.filter(m => m.unread && !AppState.repliedMails?.has(m.id) && m.priority === 'high');
    if (urgent.length > 0) {
      scrollToSection('section-mail');
      showToast('긴급 메일', `미처리 긴급 메일 ${urgent.length}건이 있습니다.`, 'warning');
    } else {
      showToast('알림', '처리되지 않은 긴급 알림이 없습니다.', 'info', 2000);
    }
  });
}

/* =============================================
   14. 테마 토글
============================================== */

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', AppState.theme);
    btn.textContent = AppState.theme === 'dark' ? '🌙' : '☀️';
    saveToLocalStorage('theme', AppState.theme);
    if (typeof initRadarChart === 'function') setTimeout(initRadarChart, 80);
    if (typeof initExchangeOverviewChart === 'function') setTimeout(initExchangeOverviewChart, 90);
    showToast('테마 변경', `${AppState.theme === 'dark' ? '다크' : '라이트'} 모드로 전환했습니다.`, 'info', 2000);
  });
}

/* =============================================
   15. Sidebar / Copilot 토글
============================================== */

function initSidebarToggle() {
  const btn     = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    // 모바일
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
    } else {
      sidebar.classList.toggle('collapsed');
      AppState.sidebarCollapsed = sidebar.classList.contains('collapsed');
    }
  });

  // 모바일에서 사이드바 외부 클릭 시 닫기
  document.addEventListener('click', e => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && e.target !== btn) {
        sidebar.classList.remove('open');
      }
    }
  });
}

function initCopilotToggle() {
  const btn        = document.getElementById('copilot-toggle');
  const panel      = document.getElementById('copilot-panel');
  const reopenTab  = document.getElementById('copilot-reopen-tab');
  if (!btn || !panel) return;

  function setCollapsed(collapsed) {
    panel.classList.toggle('collapsed', collapsed);
    btn.textContent = collapsed ? '▶' : '◀';
    if (reopenTab) reopenTab.style.display = collapsed ? 'flex' : 'none';
    AppState.copilotCollapsed = collapsed;
  }

  btn.addEventListener('click', () => setCollapsed(!panel.classList.contains('collapsed')));
  if (reopenTab) reopenTab.addEventListener('click', () => setCollapsed(false));
}

function initUserProfile() {
  const profileBtn = document.getElementById('user-profile-btn');
  if (!profileBtn) return;
  profileBtn.addEventListener('click', () => {
    openModal(`
      <div class="modal-title">시스템 관리자</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">
        <div><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">이름</div><div style="font-weight:700">관리자</div></div>
        <div><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">역할</div><div style="font-weight:700">Ops Manager</div></div>
        <div><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">접속 시간</div><div style="font-weight:700">${new Date().toLocaleString('ko-KR')}</div></div>
        <div><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">시스템 버전</div><div style="font-weight:700">WorkOS v2.4.1</div></div>
        <div><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">환경</div><div style="font-weight:700">Production</div></div>
        <div><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">마지막 동기화</div><div style="font-weight:700">방금 전</div></div>
      </div>
      <div style="padding:10px 12px;background:rgba(2,132,199,0.06);border:1px solid rgba(2,132,199,0.18);border-radius:6px;font-size:12px;color:var(--text-sub);">
        ⚙️ 설정 변경은 시스템 관리자에게 문의하세요.
      </div>
      <div style="margin-top:14px;">
        <button class="btn btn--primary" onclick="closeModal()" style="width:100%">닫기</button>
      </div>
    `);
  });
}

/* =============================================
   16. Command Palette
============================================== */

function initCommandPalette() {
  const overlay   = document.getElementById('command-palette-overlay');
  const input     = document.getElementById('cmd-input');
  const results   = document.getElementById('cmd-results');
  const searchBar = document.getElementById('global-search');
  if (!overlay || !input) return;

  const openPalette = () => {
    overlay.classList.remove('hidden');
    setTimeout(() => input.focus(), 50);
    renderCmdResults('');
  };

  const closePalette = () => overlay.classList.add('hidden');

  // ⌘K 또는 Ctrl+K
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('hidden') ? openPalette() : closePalette();
    }
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closePalette();
  });

  // 전역 검색창 클릭 → 팔레트 열기
  searchBar?.addEventListener('click', openPalette);
  searchBar?.addEventListener('keydown', e => { if (e.key === 'Enter') openPalette(); });

  // 팔레트 입력
  input.addEventListener('input', () => renderCmdResults(input.value));

  // 오버레이 클릭 → 닫기
  overlay.addEventListener('click', e => { if (e.target === overlay) closePalette(); });
}

function renderCmdResults(query) {
  const results = document.getElementById('cmd-results');
  if (!results) return;

  const q = query.trim().toLowerCase();

  // 검색 소스 정의
  const sources = [
    ...projects.map(p  => ({ type: '프로젝트', icon: '📁', text: p.name,    action: () => { scrollToSection('section-projects'); } })),
    ...tasks.map(t     => ({ type: '업무',     icon: '✅', text: t.title,   action: () => { scrollToSection('section-tasks');    } })),
    ...kpis.map(k      => ({ type: 'KPI',      icon: '📊', text: k.name,    action: () => { scrollToSection('section-kpi');      } })),
    ...mails.map(m     => ({ type: '메일',     icon: '📧', text: m.subject, action: () => { scrollToSection('section-mail');     } })),
    ...hotIssues.map(h => ({ type: '이슈',     icon: '🔥', text: h.title,   action: () => { scrollToSection('section-hotissue');} })),
    ...risks.filter(r => r.category === 'Weakness' || r.category === 'Threat')
            .map(r  => ({ type: '리스크',  icon: '⚠️', text: r.title,   action: () => { scrollToSection('section-risk');     } })),
  ];

  const filtered = q
    ? sources.filter(s => s.text.toLowerCase().includes(q) || s.type.includes(q))
    : sources.slice(0, 8);

  if (filtered.length === 0) {
    results.innerHTML = `<div class="cmd-empty">🔍 "${escHtml(query)}"에 대한 결과가 없습니다.</div>`;
    return;
  }

  // 타입별 그룹핑
  const grouped = {};
  filtered.forEach(item => {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type].push(item);
  });

  // 전역 임시 맵에 액션 저장 (onclick 인라인 함수 직렬화 회피)
  window._cmdActions = window._cmdActions || {};
  let actionIndex = 0;

  results.innerHTML = Object.entries(grouped).map(([type, items]) => `
    <div class="cmd-result-group-title">${type}</div>
    ${items.map(item => {
      const key = `cmd_${actionIndex++}`;
      window._cmdActions[key] = item.action;
      return `
        <div class="cmd-result-item" data-cmd-key="${key}">
          <span class="cmd-result-icon">${item.icon}</span>
          <span class="cmd-result-text">${escHtml(item.text)}</span>
          <span class="cmd-result-type">${type}</span>
        </div>
      `;
    }).join('')}
  `).join('');

  // 클릭 이벤트 위임
  results.querySelectorAll('.cmd-result-item').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.cmdKey;
      if (window._cmdActions[key]) window._cmdActions[key]();
      document.getElementById('command-palette-overlay')?.classList.add('hidden');
    });
  });
}

/* =============================================
   17. Telegram 알림 전송 시뮬레이션
============================================== */

/**
 * task 또는 risk 정보를 Telegram 알림으로 시뮬레이션 전송
 * @param {'task'|'risk'|'project'} type
 * @param {number} id
 */
function sendTelegramAlert(type, id) {
  let msg = '';

  if (type === 'task') {
    const t = [...tasks, ...AppState.customTasks].find(x => x.id === id);
    if (!t) return;
    const score = calculatePriority(t);
    msg = `[긴급 업무 알림]\n${t.title}\n담당: ${t.owner}\n마감: ${t.dueDate} (${getDdayLabel(t.dueDate)})\n우선순위: ${score}점`;
  } else if (type === 'risk') {
    const r = risks.find(x => x.id === id);
    if (!r) return;
    const score = calculateRiskPriority(r);
    msg = `[리스크 알림]\n${r.title}\n카테고리: ${r.category}\n우선순위: ${score}점\n상세: ${r.detail.slice(0, 60)}...`;
  } else if (type === 'project') {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    msg = `[프로젝트 긴급 알림]\n${p.name} — ${p.status.toUpperCase()}\n팀: ${p.team} / 담당: ${p.owner}\n진행률: ${p.progress}% / 마감: ${getDdayLabel(p.deadline)}`;
  }

  if (!msg) return;

  const logEntry = {
    time: getTimeString(),
    msg: msg.replace(/\n/g, ' | ')
  };

  AppState.telegramLogs.unshift(logEntry);
  if (AppState.telegramLogs.length > 10) AppState.telegramLogs.pop();
  saveToLocalStorage('telegramLogs', AppState.telegramLogs);
  renderTelegramLogs();
  const tgWidget = document.getElementById('telegram-log-widget');
  tgWidget?.classList.add('section-flash');
  setTimeout(() => tgWidget?.classList.remove('section-flash'), 1200);

  showToast('✈️ Telegram 전송', '오른쪽 Telegram 로그에 전송 기록이 추가되었습니다.', 'success');
}

function renderTelegramLogs() {
  const list = document.getElementById('telegram-log-list');
  if (!list) return;

  if (AppState.telegramLogs.length === 0) {
    list.innerHTML = '<p class="muted-text">아직 전송된 알림이 없습니다.</p>';
    return;
  }
  list.innerHTML = AppState.telegramLogs.map(l => `
    <div class="tg-log-item">
      <strong>${l.time}</strong> ${escHtml(l.msg)}
    </div>
  `).join('');
}

/* =============================================
   18. 페이지형 네비게이션
============================================== */

const DashboardPageMap = {
  briefing: ['section-briefing', 'section-summary', 'section-neural-map', 'section-postits', 'section-work-utilities', 'section-exchange'],
  projects: ['section-projects', 'section-countdown', 'section-decision'],
  tasks: ['section-tasks', 'section-resource'],
  calendar: ['section-calendar'],
  kpi: ['section-kpi', 'section-settlement'],
  risk: ['section-risk', 'section-hotissue', 'section-simulation'],
  comms: ['section-mail', 'section-feed', 'section-teamchat', 'section-gmail-automation'],
  meeting: ['section-meeting-ai'],
  expenses: ['section-expense', 'section-settlement'],
  admin: ['section-admin', 'section-branch', 'section-integrations'],
  mail: ['section-mail', 'section-feed', 'section-teamchat', 'section-gmail-automation'],
  feed: ['section-mail', 'section-feed', 'section-teamchat', 'section-gmail-automation'],
  teamchat: ['section-mail', 'section-feed', 'section-teamchat', 'section-gmail-automation'],
  postits: ['section-briefing', 'section-summary', 'section-neural-map', 'section-postits', 'section-work-utilities', 'section-exchange'],
  branch: ['section-admin', 'section-branch', 'section-integrations'],
  exchange: ['section-briefing', 'section-summary', 'section-neural-map', 'section-postits', 'section-work-utilities', 'section-exchange'],
  resource: ['section-tasks', 'section-resource'],
  integrations: ['section-admin', 'section-branch', 'section-integrations'],
  simulation: ['section-risk', 'section-hotissue', 'section-simulation']
};

function getPageKeyForSection(sectionId) {
  const entries = Object.entries(DashboardPageMap);
  const exact = entries.find(([, ids]) => ids.includes(sectionId));
  return exact ? exact[0] : 'briefing';
}

function showDashboardPage(pageKey = 'briefing', options = {}) {
  const adminOnlyPages = new Set(['admin', 'branch', 'integrations']);
  if (adminOnlyPages.has(pageKey) && !window.FinalRuntime?.isAdmin) {
    if (typeof openAdminLoginModal === 'function') openAdminLoginModal();
    pageKey = 'briefing';
  }

  const pageSections = DashboardPageMap[pageKey] || DashboardPageMap.briefing;
  const allSections = document.querySelectorAll('#main-content > .section');
  const main = document.getElementById('main-content');

  allSections.forEach(section => {
    const isVisible = pageSections.includes(section.id);
    section.classList.toggle('is-page-hidden', !isVisible);
    section.setAttribute('aria-hidden', String(!isVisible));
  });

  updateNavActive(pageKey);
  if (main && options.keepScroll !== true) main.scrollTo({ top: 0, behavior: options.instant ? 'auto' : 'smooth' });

  const firstVisible = pageSections
    .map(id => document.getElementById(id))
    .find(Boolean);
  if (firstVisible && options.focus !== false) {
    firstVisible.setAttribute('tabindex', '-1');
    firstVisible.focus({ preventScroll: true });
  }

  if (window.history && options.replaceHash !== false) {
    const hash = `#page-${pageKey}`;
    if (window.location.hash !== hash) history.replaceState(null, '', hash);
  }
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  const pageKey = getPageKeyForSection(sectionId);
  showDashboardPage(pageKey);
}

function initNavScroll() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const sectionKey = item.dataset.section;
      // chatbot은 우측 패널에 위치 — 패널을 열고 스크롤
      if (sectionKey === 'chatbot') {
        const panel = document.getElementById('copilot-panel');
        const btn   = document.getElementById('copilot-toggle');
        if (panel?.classList.contains('collapsed')) {
          panel.classList.remove('collapsed');
          if (btn) btn.textContent = '▶';
        }
        document.getElementById('section-chatbot')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('chat-input')?.focus();
      } else if (sectionKey) {
        showDashboardPage(sectionKey);
      }
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar')?.classList.remove('open');
      }
    });
  });

  const hashPage = window.location.hash?.replace('#page-', '');
  const initialPage = DashboardPageMap[hashPage] ? hashPage : 'briefing';
  showDashboardPage(initialPage, { instant: true, focus: false, replaceHash: false });
}

/* =============================================
   유틸리티
============================================== */

/** HTML 특수문자 이스케이프 */
function escHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ==============================================
   dashboard.js — 렌더링 2부
   Section Map:
   19. Priority Task Queue (todo)
   20. Calendar Scheduler
   21. Company Mail Monitor
   22. Organization News Feed
   23. Hot Issue Radar
   24. Branch Model Viewer
   25. Exchange Rate Monitor
   26. Resource Load Monitor
   27. Decision Log
   28. Scenario Simulation
============================================== */

/* =============================================
   19. Priority Task Queue
============================================== */

function renderTasks(filter) {
  const container = document.getElementById('tasks-list');
  if (!container) return;

  const activeFilter = filter || AppState.taskFilter || 'all';
  const searchQuery  = (document.getElementById('task-search')?.value || '').toLowerCase();

  // base 데이터: 내장 + 커스텀 합산, priorityScore 계산
  const doneIds = loadFromLocalStorage('todoStatus') || [];
  const allTasks = [
    ...tasks.map(t => ({ ...t, isCustom: false })),
    ...AppState.customTasks.map(t => ({ ...t, isCustom: true }))
  ].map(t => ({
    ...t,
    priorityScore: calculatePriority(t),
    isDone: doneIds.includes(t.id)
  })).sort((a, b) => b.priorityScore - a.priorityScore);

  // 필터 적용
  let filtered = allTasks;
  if (activeFilter === 'urgent')      filtered = allTasks.filter(t => t.urgency >= 8 && !t.isDone);
  else if (activeFilter === 'in-progress') filtered = allTasks.filter(t => t.status === 'in-progress');
  else if (activeFilter === 'done')   filtered = allTasks.filter(t => t.isDone);

  // 검색 적용
  if (searchQuery) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(searchQuery) ||
      (t.owner || '').toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p class="muted-text" style="padding:16px;text-align:center;">해당 조건의 업무가 없습니다.</p>';
    return;
  }

  container.innerHTML = filtered.map((t, idx) => {
    const daysLeft   = getDaysLeft(t.dueDate);
    const dday       = getDdayLabel(t.dueDate);
    const isTopThree = idx < 3 && !t.isDone;
    const scoreClass = t.priorityScore >= 75 ? '' : t.priorityScore >= 50 ? 'medium' : 'low';
    const effectiveStatus = t.isDone ? 'done' : t.status;
    const statusMap  = { 'in-progress': '진행 중', pending: '대기', done: '완료' };
    const statusBadgeClass = effectiveStatus === 'in-progress' ? 'badge--blue' : effectiveStatus === 'done' ? 'badge--success' : 'badge--warning';

    const ddayColor = daysLeft <= 0 ? 'var(--danger)' : daysLeft <= 2 ? 'var(--danger)' : daysLeft <= 5 ? 'var(--warning)' : 'var(--text-muted)';

    return `
      <div class="task-item ${isTopThree ? 'top-priority' : ''} ${t.isDone ? 'done' : ''}" id="task-item-${t.id}" data-id="${t.id}">
        <input
          type="checkbox"
          class="task-checkbox"
          ${t.isDone ? 'checked' : ''}
          onchange="toggleTaskDone(${t.id}, this.checked)"
          aria-label="${escHtml(t.title)} 완료 체크"
        />
        <div class="task-info">
          <div class="task-title">${escHtml(t.title)}</div>
          <div class="task-meta">
            <span class="task-meta-item">👤 ${escHtml(t.owner || '-')}</span>
            <span class="task-meta-item" style="color:${ddayColor};">📅 ${dday}</span>
            <span class="badge ${statusBadgeClass}" style="font-size:9px;">${statusMap[effectiveStatus] || effectiveStatus}</span>
            ${t.relatedKpi ? `<span class="task-meta-item" style="color:var(--accent-purple);">📊 ${escHtml(t.relatedKpi)}</span>` : ''}
          </div>
        </div>
        <span class="task-score ${scoreClass}">${t.priorityScore}점</span>
        <button class="task-tg-btn" onclick="sendTelegramAlert('task', ${t.id})" title="Telegram 알림 전송">✈️ 전송</button>
        ${t.isCustom ? `<button class="task-del-btn" onclick="deleteCustomTask(${t.id})" title="삭제">🗑</button>` : ''}
      </div>
    `;
  }).join('');

  // 필터 버튼 활성화
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === activeFilter);
  });
}

/** 업무 완료 토글 + LocalStorage 저장 */
function toggleTaskDone(taskId, isDone) {
  let doneIds = loadFromLocalStorage('todoStatus') || [];
  if (isDone) {
    if (!doneIds.includes(taskId)) doneIds.push(taskId);
  } else {
    doneIds = doneIds.filter(id => id !== taskId);
  }
  saveToLocalStorage('todoStatus', doneIds);
  AppState.completedTaskIds = new Set(doneIds);

  // 실제 업무 객체에도 상태를 반영해 화면의 배지/요약/추천 액션이 즉시 달라지게 한다.
  const target = [...tasks, ...AppState.customTasks].find(t => t.id === taskId);
  if (target) target.status = isDone ? 'done' : (target.status === 'done' ? 'in-progress' : target.status);

  AppState.healthData = calculateHealthScore();
  AppState.riskSignals = generateRiskSignals();
  renderTasks();
  renderSummaryCards();
  renderHealthWidget();
  renderActionRecommendations();
  renderAlerts();
  updateOrgBadge();
  updateNotifCount();

  showToast(isDone ? '업무 완료 처리' : '업무 진행 상태 복원',
    isDone ? '완료 배지, 건강 점수, 추천 액션이 즉시 갱신되었습니다.' : '업무가 다시 진행 목록에 반영되었습니다.',
    isDone ? 'success' : 'info', 2600);
}

/** 커스텀 업무 삭제 */
function deleteCustomTask(taskId) {
  AppState.customTasks = AppState.customTasks.filter(t => t.id !== taskId);
  saveToLocalStorage('customTasks', AppState.customTasks);
  renderTasks();
  showToast('업무 삭제', '업무가 삭제되었습니다.', 'info', 2000);
}

/** 업무 추가 모달 */
function showAddTaskModal() {
  openModal(`
    <div class="modal-title">➕ 새 업무 추가</div>
    <div class="modal-body">
      <div class="form-group" style="margin-bottom:12px;">
        <label>업무명 *</label>
        <input type="text" id="new-task-title" class="form-input" placeholder="업무 제목 입력" />
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>담당자</label>
        <input type="text" id="new-task-owner" class="form-input" placeholder="담당자 이름" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
        <div class="form-group">
          <label>마감일</label>
          <input type="date" id="new-task-due" class="form-input" />
        </div>
        <div class="form-group">
          <label>긴급도 (1~10)</label>
          <input type="number" id="new-task-urgency" class="form-input" min="1" max="10" value="5" />
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div class="form-group">
          <label>영향도 (1~10)</label>
          <input type="number" id="new-task-impact" class="form-input" min="1" max="10" value="5" />
        </div>
        <div class="form-group">
          <label>상태</label>
          <select id="new-task-status" class="form-select">
            <option value="pending">대기</option>
            <option value="in-progress">진행 중</option>
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn--primary" onclick="submitNewTask()">추가</button>
        <button class="btn btn--ghost" onclick="closeModal()">취소</button>
      </div>
    </div>
  `);
}

function submitNewTask() {
  const title   = document.getElementById('new-task-title')?.value.trim();
  const owner   = document.getElementById('new-task-owner')?.value.trim() || '미지정';
  const dueDate = document.getElementById('new-task-due')?.value || '';
  const urgency = parseInt(document.getElementById('new-task-urgency')?.value || '5');
  const impact  = parseInt(document.getElementById('new-task-impact')?.value  || '5');
  const status  = document.getElementById('new-task-status')?.value || 'pending';

  if (!title) { showToast('입력 오류', '업무명을 입력하세요.', 'error'); return; }

  const newTask = {
    id: Date.now(),
    title, owner, dueDate, urgency, impact,
    kpiImpact: 5, bottleneckScore: 3,
    status, projectId: null, relatedKpi: null, isCustom: true
  };

  AppState.customTasks.unshift(newTask);
  saveToLocalStorage('customTasks', AppState.customTasks);
  closeModal();
  renderTasks();
  showToast('업무 추가', `"${title}" 업무가 추가되었습니다.`, 'success');
}

// 필터 버튼 이벤트 위임
document.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn[data-filter]');
  if (btn) {
    AppState.taskFilter = btn.dataset.filter;
    renderTasks();
  }
  // 업무 추가 버튼
  if (e.target.id === 'add-task-btn') showAddTaskModal();
});

// 업무 검색 실시간 필터
document.addEventListener('input', e => {
  if (e.target.id === 'task-search') renderTasks();
});

/* =============================================
   20. Calendar Scheduler
============================================== */

function renderCalendar() {
  renderMiniCalendar();
  renderTodayEvents();

  // 일정 추가 버튼
  document.getElementById('add-event-btn')?.addEventListener('click', showAddEventModal);
}

function renderMiniCalendar() {
  const cal = document.getElementById('mini-calendar');
  if (!cal) return;

  const year  = AppState.calYear;
  const month = AppState.calMonth;
  const today = new Date();

  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 이벤트가 있는 날짜 Set
  const allEvents = [
    ...calendarEvents,
    ...(loadFromLocalStorage('calendarEvents') || [])
  ];
  const eventDates = new Set(
    allEvents
      .filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(e => new Date(e.date).getDate())
  );

  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const weekDays   = ['일','월','화','수','목','금','토'];

  cal.innerHTML = `
    <div class="cal-header">
      <button class="cal-nav" onclick="changeCalMonth(-1)">‹</button>
      <span class="cal-month">${year}년 ${monthNames[month]}</span>
      <button class="cal-nav" onclick="changeCalMonth(1)">›</button>
    </div>
    <div class="cal-weekdays">
      ${weekDays.map(d => `<div>${d}</div>`).join('')}
    </div>
    <div class="cal-days">
      ${Array(firstDay).fill('<div class="cal-day other-month"></div>').join('')}
      ${Array.from({ length: daysInMonth }, (_, i) => {
        const day  = i + 1;
        const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const hasEvent   = eventDates.has(day);
        const dateStr    = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const isSelected = AppState.selectedDate === dateStr;
        return `
          <div class="cal-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''} ${isSelected ? 'selected' : ''}"
            onclick="selectCalDate('${dateStr}')">${day}</div>
        `;
      }).join('')}
    </div>
  `;
}

function changeCalMonth(delta) {
  AppState.calMonth += delta;
  if (AppState.calMonth < 0)  { AppState.calMonth = 11; AppState.calYear--; }
  if (AppState.calMonth > 11) { AppState.calMonth = 0;  AppState.calYear++; }
  renderMiniCalendar();
}

function selectCalDate(dateStr) {
  AppState.selectedDate = dateStr;
  renderMiniCalendar();
  renderTodayEvents(dateStr);
}

function renderTodayEvents(dateOverride) {
  const container = document.getElementById('today-events');
  if (!container) return;

  const targetDate = dateOverride || new Date().toISOString().slice(0, 10);
  const allEvents  = [
    ...calendarEvents,
    ...(loadFromLocalStorage('calendarEvents') || [])
  ].filter(e => e.date === targetDate)
   .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

  if (allEvents.length === 0) {
    container.innerHTML = '<p class="muted-text" style="padding:12px 0;">이 날 일정이 없습니다.</p>';
    return;
  }

  container.innerHTML = allEvents.map(ev => {
    const typeMap = { meeting: '회의', deadline: '마감', deploy: '배포', holiday: '휴무' };
    return `
      <div class="event-item type-${ev.type}" onclick="showEventDetail(${ev.id})">
        <div class="event-time">${ev.time || '종일'}</div>
        <div>
          <div class="event-title">${escHtml(ev.title)}</div>
          <div class="event-project">
            <span class="badge badge--${ev.type === 'deadline' ? 'danger' : ev.type === 'deploy' ? 'purple' : ev.type === 'holiday' ? 'success' : 'blue'}" style="font-size:9px;">${typeMap[ev.type] || ev.type}</span>
            ${ev.relatedProject ? `<span style="color:var(--text-muted);font-size:11px;margin-left:4px;">${escHtml(ev.relatedProject)}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function showEventDetail(eventId) {
  const ev = [...calendarEvents, ...(loadFromLocalStorage('calendarEvents') || [])]
    .find(e => e.id === eventId);
  if (!ev) return;

  const prep = typeof meetingPrepData !== 'undefined' ? meetingPrepData[ev.id] : null;

  // AI 미팅 준비 카드 (meeting 유형 + meetingPrepData 있을 때 우선, 없으면 기본 체크리스트)
  let meetingPrepHtml = '';
  if (ev.type === 'meeting') {
    if (prep) {
      const prepKpis  = kpis.filter(k => prep.relatedKpis.includes(k.name));
      const prepMails = mails.filter(m => prep.relatedMailIds.includes(m.id));

      meetingPrepHtml = `
        <div class="meeting-prep-card">
          <div class="meeting-prep-title">🤖 AI 미팅 준비 브리핑</div>

          ${prepKpis.length > 0 ? `
          <div class="meeting-prep-section">
            <div class="meeting-prep-section-label">관련 KPI 현황</div>
            <ul class="meeting-prep-list">
              ${prepKpis.map(k => {
                const st = getKpiStatus(k.current, k.target);
                const icon = st === 'red' ? '🔴' : st === 'yellow' ? '🟡' : '🟢';
                return `<li class="meeting-prep-item">${icon} <strong>${escHtml(k.name)}</strong> — ${k.current}${k.unit} / 목표 ${k.target}${k.unit}</li>`;
              }).join('')}
            </ul>
          </div>` : ''}

          ${prepMails.length > 0 ? `
          <div class="meeting-prep-section">
            <div class="meeting-prep-section-label">연관 메일</div>
            <ul class="meeting-prep-list">
              ${prepMails.map(m => `
                <li class="meeting-prep-item">
                  ✉️ <strong>${escHtml(m.fromName)}</strong> — ${escHtml(m.subject)}
                  ${m.slaHoursLeft ? `<span style="color:var(--danger);font-size:10px;margin-left:4px;">SLA ${m.slaHoursLeft}h</span>` : ''}
                </li>`).join('')}
            </ul>
          </div>` : ''}

          <div class="meeting-prep-section">
            <div class="meeting-prep-section-label">예상 질문</div>
            <ul class="meeting-prep-list">
              ${prep.expectedQuestions.map(q => `<li class="meeting-prep-item">❓ ${escHtml(q)}</li>`).join('')}
            </ul>
          </div>

          ${prep.talkingPoints ? `
          <div class="meeting-prep-section">
            <div class="meeting-prep-section-label">핵심 발표 포인트</div>
            <ul class="meeting-prep-list">
              ${prep.talkingPoints.map(p => `<li class="meeting-prep-item">💡 ${escHtml(p)}</li>`).join('')}
            </ul>
          </div>` : ''}
        </div>
      `;
    } else {
      // 기본 동적 체크리스트
      const relKpis    = kpis.filter(k => getKpiStatus(k.current, k.target) !== 'green').slice(0, 2);
      const urgentTask = getSortedTasks().find(t => !t.isDone);
      meetingPrepHtml = `
        <div class="meeting-prep-card">
          <div class="meeting-prep-title">🤖 AI 회의 전 체크리스트</div>
          <ul class="meeting-prep-list">
            ${relKpis.map(k => `<li class="meeting-prep-item">✅ KPI [${escHtml(k.name)}] — ${k.current}${k.unit} (목표 ${k.target}${k.unit})</li>`).join('')}
            ${urgentTask ? `<li class="meeting-prep-item">✅ 긴급 업무 [${escHtml(urgentTask.title)}] 진행 상태 보고</li>` : ''}
            <li class="meeting-prep-item">✅ 전주 액션 아이템 이행 여부 확인</li>
            <li class="meeting-prep-item">✅ 미결 메일 답변 여부 점검</li>
          </ul>
        </div>
      `;
    }
  }

  openModal(`
    <div class="modal-title">📅 ${escHtml(ev.title)}</div>
    <div class="modal-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
        <div><span style="color:var(--text-muted);font-size:11px;">날짜</span><br><strong>${ev.date}</strong></div>
        <div><span style="color:var(--text-muted);font-size:11px;">시간</span><br><strong>${ev.time || '종일'}</strong></div>
        ${ev.relatedProject ? `<div style="grid-column:1/-1;"><span style="color:var(--text-muted);font-size:11px;">관련 프로젝트</span><br><strong>${escHtml(ev.relatedProject)}</strong></div>` : ''}
      </div>
      <p style="font-size:13px;color:var(--text-sub);margin-bottom:14px;">${escHtml(ev.description || '')}</p>
      ${meetingPrepHtml}
      <div style="margin-top:12px;">
        <button class="btn btn--ghost btn--sm" onclick="closeModal()">닫기</button>
      </div>
    </div>
  `);
}

function showAddEventModal() {
  openModal(`
    <div class="modal-title">📅 일정 추가</div>
    <div class="modal-body">
      <div class="form-group" style="margin-bottom:10px;">
        <label>제목 *</label>
        <input type="text" id="ev-title" class="form-input" placeholder="일정 제목" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <div class="form-group">
          <label>날짜 *</label>
          <input type="date" id="ev-date" class="form-input" />
        </div>
        <div class="form-group">
          <label>시간</label>
          <input type="time" id="ev-time" class="form-input" />
        </div>
      </div>
      <div class="form-group" style="margin-bottom:10px;">
        <label>유형</label>
        <select id="ev-type" class="form-select">
          <option value="meeting">회의</option>
          <option value="deadline">마감</option>
          <option value="deploy">배포</option>
          <option value="holiday">휴무</option>
        </select>
      </div>
      <div class="form-group" style="margin-bottom:14px;">
        <label>관련 프로젝트</label>
        <input type="text" id="ev-project" class="form-input" placeholder="프로젝트명 (선택)" />
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn--primary" onclick="submitNewEvent()">추가</button>
        <button class="btn btn--ghost" onclick="closeModal()">취소</button>
      </div>
    </div>
  `);
}

function submitNewEvent() {
  const title   = document.getElementById('ev-title')?.value.trim();
  const date    = document.getElementById('ev-date')?.value;
  const time    = document.getElementById('ev-time')?.value;
  const type    = document.getElementById('ev-type')?.value;
  const project = document.getElementById('ev-project')?.value.trim();

  if (!title || !date) { showToast('입력 오류', '제목과 날짜를 입력하세요.', 'error'); return; }

  const saved = loadFromLocalStorage('calendarEvents') || [];
  saved.push({ id: Date.now(), title, date, time: time || null, type, relatedProject: project || null, description: '' });
  saveToLocalStorage('calendarEvents', saved);
  closeModal();
  renderCalendar();
  showToast('일정 추가', `"${title}" 일정이 추가되었습니다.`, 'success');
}

/* =============================================
   21. Company Mail Monitor
============================================== */

function renderMails() {
  const container  = document.getElementById('mail-list');
  const countEl    = document.getElementById('unread-mail-count');
  if (!container) return;

  const unreadCount = mails.filter(m => !AppState.repliedMails?.has(m.id) && m.unread).length;
  if (countEl) {
    countEl.textContent = unreadCount > 0 ? `📬 미읽음 ${unreadCount}건` : '';
    countEl.className   = unreadCount > 0 ? 'badge badge--danger' : '';
  }

  container.innerHTML = mails.map(m => {
    const isRead     = AppState.readMails.has(m.id);
    const isReplied  = AppState.repliedMails?.has(m.id);
    const isUnread   = m.unread && !isRead && !isReplied;
    const isHighPri  = m.priority === 'high' && !isReplied;
    const slaClass   = m.slaHoursLeft && m.slaHoursLeft <= 4 ? 'urgent' : '';

    // 긴급 키워드 하이라이트
    let subject = escHtml(m.subject);
    urgentKeywords.forEach(kw => {
      subject = subject.replace(new RegExp(kw, 'g'), `<span class="mail-keyword">${kw}</span>`);
    });

    return `
      <div class="mail-item ${isUnread ? 'unread' : ''} ${isHighPri ? 'priority-high' : ''} ${isReplied ? 'replied' : ''}"
        onclick="openMailDetail(${m.id})">
        <div class="mail-unread-dot" style="opacity:${isUnread ? 1 : 0};"></div>
        <div class="mail-info">
          <div class="mail-from">From: ${escHtml(m.fromName || m.from)}</div>
          <div class="mail-subject">${subject}</div>
          <div class="mail-summary">${escHtml(m.summary)}</div>
        </div>
        <div class="mail-meta">
          <span class="mail-time">${m.receivedAt.split(' ')[1]}</span>
          ${isReplied ? '<span class="badge badge--success" style="font-size:9px;">답변완료</span>' : (isHighPri ? '<span class="badge badge--danger" style="font-size:9px;">긴급</span>' : '')}
          ${isReplied ? '<span class="mail-sla resolved">완료</span>' : (m.slaHoursLeft
            ? `<span class="mail-sla ${slaClass}">SLA ${m.slaHoursLeft}h</span>`
            : '')}
        </div>
      </div>
    `;
  }).join('');
}

function openMailDetail(mailId) {
  const m = mails.find(x => x.id === mailId);
  if (!m) return;
  const isReplied = AppState.repliedMails?.has(mailId);

  // 읽음 처리
  AppState.readMails.add(mailId);
  saveToLocalStorage('readMails', [...AppState.readMails]);
  updateNotifCount();
  renderMails();

  openModal(`
    <div class="modal-title">📧 ${escHtml(m.subject)}</div>
    <div class="modal-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
        <div><span style="color:var(--text-muted);font-size:11px;">발신자</span><br><strong>${escHtml(m.fromName || m.from)}</strong></div>
        <div><span style="color:var(--text-muted);font-size:11px;">수신 시각</span><br><strong>${m.receivedAt}</strong></div>
        ${m.slaHoursLeft ? `<div><span style="color:var(--text-muted);font-size:11px;">SLA 잔여</span><br><strong style="color:${m.slaHoursLeft<=3?'var(--danger)':'var(--warning)'};">${m.slaHoursLeft}시간</strong></div>` : ''}
        <div><span style="color:var(--text-muted);font-size:11px;">우선순위</span><br>
          <span class="badge ${isReplied ? 'badge--success' : (m.priority==='high'?'badge--danger':m.priority==='medium'?'badge--warning':'badge--muted')}">${isReplied ? '답변완료' : m.priority}</span>
        </div>
      </div>

      <div class="modal-section-title">🤖 AI 요약</div>
      <div style="padding:10px;background:rgba(34,211,238,.06);border:1px solid rgba(34,211,238,.2);border-radius:6px;font-size:13px;color:var(--text-sub);margin-bottom:14px;">
        ${escHtml(m.summary)}
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${m.priority === 'high' && !isReplied ? `<button class="btn btn--danger btn--sm" onclick="sendTelegramAlert('task', 2); closeModal();">✈️ 긴급 알림 전송</button>` : ''}
        ${isReplied ? '<button class="btn btn--ghost btn--sm" disabled>✅ 이미 답변 완료</button>' : `<button class="btn btn--primary btn--sm" onclick="markMailReplied(${mailId})">✅ 답변 완료로 처리</button>`}
        <button class="btn btn--ghost btn--sm" onclick="closeModal()">닫기</button>
      </div>
    </div>
  `);
}


/** 메일을 답변 완료 상태로 전환하고 관련 지표를 즉시 갱신 */
function markMailReplied(mailId) {
  const m = mails.find(x => x.id === mailId);
  if (!m) return;

  if (!AppState.repliedMails) AppState.repliedMails = new Set();
  AppState.repliedMails.add(mailId);
  AppState.readMails.add(mailId);
  // 실제 데이터 객체도 변경해 같은 세션에서 긴급/미읽음 계산과 UI가 확실히 달라지게 한다.
  m.unread = false;
  m.priority = m.priority === 'high' ? 'resolved' : m.priority;
  m.slaHoursLeft = 0;

  saveToLocalStorage('repliedMails', [...AppState.repliedMails]);
  saveToLocalStorage('readMails', [...AppState.readMails]);

  // 답변 완료는 업무 리스크와 알림 수치에 직접 반영되도록 주요 위젯 재렌더링
  AppState.healthData = calculateHealthScore();
  AppState.riskSignals = generateRiskSignals();

  renderMails();
  renderSummaryCards();
  renderHealthWidget();
  renderActionRecommendations();
  renderAlerts();
  renderTelegramLogs();
  updateOrgBadge();
  updateNotifCount();

  // 사용자가 버튼을 눌렀을 때 무엇이 바뀌었는지 즉시 보이도록 메일 섹션을 짧게 강조
  document.getElementById('section-mail')?.classList.add('section-flash');
  setTimeout(() => document.getElementById('section-mail')?.classList.remove('section-flash'), 1200);

  closeModal();
  showToast('메일 처리 완료', `"${m.subject}" 메일을 답변 완료로 표시했습니다.`, 'success', 2800);
}

/* =============================================
   22. Organization News Feed
============================================== */

function renderAnnouncements(filter) {
  const container = document.getElementById('feed-list');
  if (!container) return;

  const activeFilter = filter || AppState.feedFilter || 'all';

  let filtered = announcements;
  if (activeFilter !== 'all') {
    filtered = announcements.filter(a => a.category === activeFilter);
  }

  // 핀 → 중요 → 날짜 순 정렬
  filtered = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.important !== b.important) return a.important ? -1 : 1;
    return new Date(b.date) - new Date(a.date);
  });

  container.innerHTML = filtered.map(a => {
    const isRead  = AppState.readAnnouncements.has(a.id);
    const catIcon = { 배포:'🚀', 정책:'📜', 교육:'📚', 휴무:'🌴' }[a.category] || '📢';

    return `
      <div class="feed-item ${a.pinned ? 'pinned' : ''}" onclick="openAnnouncementDetail(${a.id})">
        <div class="feed-icon">${catIcon}</div>
        <div class="feed-info">
          <div class="feed-title">${isRead ? '' : '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent-cyan);margin-right:5px;vertical-align:middle;"></span>'}${escHtml(a.title)}</div>
          <div class="feed-date">${a.date}</div>
          <div class="feed-badges">
            ${a.pinned    ? '<span class="badge badge--purple" style="font-size:9px;">📌 고정</span>' : ''}
            ${a.important ? '<span class="badge badge--warning" style="font-size:9px;">⭐ 중요</span>' : ''}
            <span class="badge badge--muted" style="font-size:9px;">${a.category}</span>
            ${a.relevantToday ? '<span class="relevant-badge">Relevant to Today</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 피드 필터 버튼 활성화
  document.querySelectorAll('.filter-btn[data-feed-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.feedFilter === activeFilter);
  });
}

function openAnnouncementDetail(annId) {
  const a = announcements.find(x => x.id === annId);
  if (!a) return;
  AppState.readAnnouncements.add(annId);
  saveToLocalStorage('readAnnouncements', [...AppState.readAnnouncements]);
  renderAnnouncements();

  openModal(`
    <div class="modal-title">${escHtml(a.title)}</div>
    <div class="modal-body">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
        <span class="badge badge--muted">${a.category}</span>
        ${a.important ? '<span class="badge badge--warning">⭐ 중요</span>' : ''}
        ${a.pinned    ? '<span class="badge badge--purple">📌 고정</span>' : ''}
        <span class="badge badge--muted">${a.date}</span>
      </div>
      <p style="font-size:13px;color:var(--text-sub);line-height:1.7;">${escHtml(a.content)}</p>
      <div style="margin-top:14px;">
        <button class="btn btn--ghost btn--sm" onclick="closeModal()">닫기</button>
      </div>
    </div>
  `);
}

// 피드 필터 이벤트 위임
document.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn[data-feed-filter]');
  if (btn) {
    AppState.feedFilter = btn.dataset.feedFilter;
    renderAnnouncements();
  }
});

/* =============================================
   23. Hot Issue Radar
============================================== */

function renderHotIssues() {
  const container = document.getElementById('hotissue-list');
  if (!container) return;

  const sorted = [...hotIssues].sort((a, b) => b.impactScore - a.impactScore);

  container.innerHTML = sorted.map((h, i) => {
    const isTop      = i === 0;
    const sevColor   = h.severity === 'critical' ? 'var(--danger)' : h.severity === 'high' ? 'var(--warning)' : 'var(--text-muted)';
    const sevBadge   = h.severity === 'critical'
      ? '<span class="badge badge--danger">Critical</span>'
      : h.severity === 'high'
        ? '<span class="badge badge--warning">High</span>'
        : '<span class="badge badge--muted">Medium</span>';
    const trendBadge = h.trend === '상승'
      ? '<span class="badge badge--danger" style="font-size:9px;">↑ 상승</span>'
      : h.trend === '신규'
        ? '<span class="badge badge--purple" style="font-size:9px;">NEW</span>'
        : '<span class="badge badge--muted" style="font-size:9px;">→ 지속</span>';

    return `
      <div class="hotissue-item ${isTop ? 'top' : ''}" onclick="showHotIssueDetail(${h.id})">
        <div class="hotissue-rank" style="color:${sevColor}">${i + 1}</div>
        <div class="hotissue-info">
          <div class="hotissue-title">${escHtml(h.title)}</div>
          <div class="hotissue-prediction">⚠️ ${escHtml(h.prediction)}</div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px;">
            ${sevBadge} ${trendBadge}
            ${h.tags.map(t => `<span class="badge badge--muted" style="font-size:9px;">${escHtml(t)}</span>`).join('')}
          </div>
        </div>
        <div class="hotissue-meta">
          <div class="impact-score" style="color:${sevColor}">${h.impactScore}</div>
          <div style="font-size:9px;color:var(--text-muted);">영향도</div>
        </div>
      </div>
    `;
  }).join('');
}

function showHotIssueDetail(issueId) {
  const h = hotIssues.find(x => x.id === issueId);
  if (!h) return;
  openModal(`
    <div class="modal-title">🔥 ${escHtml(h.title)}</div>
    <div class="modal-body">
      <div class="modal-section-title">미해결 시 예측 영향</div>
      <div style="padding:10px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:6px;font-size:13px;color:#FDA4A4;margin-bottom:14px;">
        ${escHtml(h.prediction)}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
        <div><span style="color:var(--text-muted);font-size:11px;">심각도</span><br><strong>${h.severity}</strong></div>
        <div><span style="color:var(--text-muted);font-size:11px;">추세</span><br><strong>${h.trend}</strong></div>
        <div><span style="color:var(--text-muted);font-size:11px;">영향도 점수</span><br><strong>${h.impactScore}</strong></div>
        ${h.relatedProject ? `<div><span style="color:var(--text-muted);font-size:11px;">관련 프로젝트</span><br><strong>${escHtml(h.relatedProject)}</strong></div>` : ''}
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn--danger btn--sm" onclick="sendTelegramAlert('risk', 1); closeModal();">✈️ 긴급 알림</button>
        <button class="btn btn--ghost btn--sm" onclick="closeModal()">닫기</button>
      </div>
    </div>
  `);
}

/* =============================================
   24. Branch Model Viewer
============================================== */

function renderBranchModel() {
  const graph = document.getElementById('branch-graph');
  const aiRec = document.getElementById('branch-ai-rec');
  const releaseBoard = document.getElementById('branch-release-board');
  if (!graph) return;

  const typeClass = {
    main: 'branch-line-main', develop: 'branch-line-develop',
    feature: 'branch-line-feature', release: 'branch-line-release',
    hotfix: 'branch-line-hotfix'
  };
  const riskBadge = risk => risk === 'high'
    ? '<span class="badge badge--danger" style="font-size:9px;">충돌위험</span>'
    : risk === 'medium'
      ? '<span class="badge badge--warning" style="font-size:9px;">주의</span>'
      : '<span class="badge badge--success" style="font-size:9px;">안전</span>';

  const statusBadge = s => ({
    stable: '<span class="badge badge--success" style="font-size:9px;">stable</span>',
    active: '<span class="badge badge--blue"    style="font-size:9px;">active</span>',
    review: '<span class="badge badge--purple"  style="font-size:9px;">review</span>',
    warning:'<span class="badge badge--warning" style="font-size:9px;">warning</span>',
    urgent: '<span class="badge badge--danger"  style="font-size:9px;">urgent</span>',
  }[s] || '');

  graph.innerHTML = `
    <div style="margin-bottom:12px;font-size:11px;color:var(--text-muted);">Git Branch Overview</div>
    ${branches.map(b => `
      <div class="branch-row">
        <span class="branch-name ${typeClass[b.type] || ''}">${b.name}</span>
        <span class="branch-graph-line" style="font-family:monospace;color:${b.conflictRisk==='high'?'var(--danger)':b.conflictRisk==='medium'?'var(--warning)':'var(--success)'};">
          ${b.type === 'main'    ? '───────●───────────────●────' :
            b.type === 'develop' ? '──●──●──●──●──●──' :
            b.type === 'release' ? '──────────●──●──' :
            b.type === 'hotfix'  ? '──●──●' :
            '──●──●──●'}
        </span>
        <div class="branch-meta">
          ${riskBadge(b.conflictRisk)}
          ${statusBadge(b.status)}
          ${b.prCount > 0 ? `<span class="badge badge--muted" style="font-size:9px;">PR ${b.prCount}</span>` : ''}
        </div>
      </div>
      <div style="font-size:10px;color:var(--text-muted);padding-left:108px;margin-bottom:6px;">${escHtml(b.lastCommit)}</div>
    `).join('')}
  `;

  if (aiRec) {
    aiRec.innerHTML = `
      <div class="branch-ai-title">🤖 AI Merge Recommendation</div>
      <div class="branch-rec-list">
        ${branchMergeRecommendation.map((r, i) => `
          <div class="branch-rec-item">
            <span class="branch-rec-num">${i + 1}.</span>
            <span>${escHtml(r)}</span>
          </div>
        `).join('')}
      </div>
      <button class="btn btn--ghost btn--sm" style="width:100%;margin-top:10px;"
        onclick="sendTelegramAlert('risk', 6); showToast('DevOps 알림', 'Merge 권장사항이 DevOps팀에 전송되었습니다.', 'info');">
        ✈️ DevOps팀에 전송
      </button>
    `;
  }

  if (releaseBoard) {
    const highRisk = branches.filter(b => b.conflictRisk === 'high').length;
    const activePrs = branches.reduce((sum, b) => sum + Number(b.prCount || 0), 0);
    releaseBoard.innerHTML = `
      <div class="branch-release-card card glass">
        <div class="utility-panel-title">Admin Release Controls</div>
        <div class="branch-release-metrics">
          <div><span>Open PR</span><strong>${activePrs}</strong></div>
          <div><span>Conflict Risk</span><strong>${highRisk}</strong></div>
          <div><span>Deploy Lane</span><strong>staging</strong></div>
          <div><span>Owner</span><strong>DevOps</strong></div>
        </div>
      </div>
      <div class="branch-release-card card glass">
        <div class="utility-panel-title">Merge Gate Checklist</div>
        <div class="workspace-checks compact">
          <label><input type="checkbox" checked /> feature/payment QA 통과 후 병합</label>
          <label><input type="checkbox" checked /> hotfix/login-timeout main 반영</label>
          <label><input type="checkbox" /> release/v1.3 staging smoke test</label>
          <label><input type="checkbox" /> AI chatbot 베타 일정 재확인</label>
        </div>
      </div>
    `;
  }
}

/* =============================================
   25. Exchange Rate Monitor
============================================== */

function renderExchangeRates() {
  const container = document.getElementById('exchange-grid');
  const overviewList = document.getElementById('overview-exchange-list');
  const overviewAlert = document.getElementById('overview-exchange-alert');

  const exchangeMarkup = exchangeRates.map(e => {
    const isUp   = e.change > 0;
    const isAlert= Math.abs(e.change) >= e.alertThreshold;
    const dir    = isUp ? '▲' : '▼';
    const cls    = isUp ? 'up' : 'down';

    return `
      <div class="exchange-card card glass ${isAlert && isUp ? 'warning-accent' : ''}">
        <div class="exchange-pair">${e.flag} ${e.currency}</div>
        <div class="exchange-rate" id="ex-rate-${e.currency.replace('/','_')}">${e.rate.toLocaleString()}</div>
        <div class="exchange-change ${cls}">
          ${dir} ${Math.abs(e.change)}%
          ${isAlert ? '<span class="badge badge--warning" style="font-size:9px;margin-left:4px;">예산 영향</span>' : ''}
        </div>
        <div class="exchange-note">${escHtml(e.budgetImpact)}</div>
      </div>
    `;
  }).join('');

  if (container) {
    container.innerHTML = exchangeMarkup;
  }

  // Overview 상단에는 핵심 통화 3개만 압축해서 보여준다.
  if (overviewList) {
    const overviewRates = exchangeRates.slice(0, 3);
    overviewList.innerHTML = overviewRates.map(e => {
      const isUp = e.change > 0;
      const cls = isUp ? 'up' : 'down';
      const dir = isUp ? '▲' : '▼';
      const isAlert = Math.abs(e.change) >= e.alertThreshold;
      return `
        <button class="overview-exchange-item" type="button" onclick="focusExchangeCard(this)" title="환율 영향 상세 확인">
          <span class="overview-exchange-pair">${e.flag} ${escHtml(e.currency)}</span>
          <strong class="overview-exchange-rate">${e.rate.toLocaleString()}</strong>
          <span class="overview-exchange-change ${cls}">${dir} ${Math.abs(e.change)}%</span>
          <span class="overview-exchange-impact">${escHtml(e.budgetImpact)}</span>
        </button>
      `;
    }).join('');
  }

  if (overviewAlert) {
    const alertRates = exchangeRates.filter(e => Math.abs(e.change) >= e.alertThreshold);
    if (alertRates.length) {
      const top = alertRates[0];
      overviewAlert.className = 'badge badge--warning';
      overviewAlert.textContent = `${top.currency} 예산 영향 감지`;
    } else {
      overviewAlert.className = 'badge badge--success';
      overviewAlert.textContent = '환율 리스크 안정';
    }
  }

  initExchangeOverviewChart();
}


function focusExchangeCard(button) {
  const card = button?.closest('.overview-exchange-card');
  if (card) {
    card.classList.remove('exchange-focus-flash');
    void card.offsetWidth;
    card.classList.add('exchange-focus-flash');
  }
  const pair = button?.querySelector('.overview-exchange-pair')?.textContent?.trim() || '선택한 통화';
  showToast('환율 상세', `${pair} 예산 영향은 선택한 환율 카드 하단의 영향 문구에 표시됩니다.`, 'info');
}

function getExchangePercentHistory(rate) {
  const history = getExchangeHistory(rate).map(Number);
  const base = history[0] || Number(rate.prevRate || rate.rate || 1);
  return history.map(v => Number((((v - base) / base) * 100).toFixed(2)));
}

function getExchangeHistory(rate) {
  if (Array.isArray(rate.history) && rate.history.length >= 2) return rate.history;
  const base = Number(rate.prevRate || rate.rate || 0);
  const latest = Number(rate.rate || base);
  const mid = (base + latest) / 2;
  const spread = Math.max(Math.abs(latest - base), latest * 0.002);
  return [
    base - spread * 0.35,
    base + spread * 0.15,
    mid - spread * 0.18,
    mid + spread * 0.08,
    latest - spread * 0.22,
    latest - spread * 0.08,
    latest
  ].map(v => Number(v.toFixed(latest > 100 ? 1 : 2)));
}

function initExchangeOverviewChart() {
  const canvas = document.getElementById('overview-exchange-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (canvas._chartInstance) {
    canvas._chartInstance.destroy();
  }

  const styles = getComputedStyle(document.documentElement);
  const textColor = styles.getPropertyValue('--text-sub').trim() || '#64748b';
  const gridColor = styles.getPropertyValue('--border-soft').trim() || 'rgba(148,163,184,.22)';
  const mainTextColor = styles.getPropertyValue('--text-main').trim() || '#0f172a';
  const cyan = styles.getPropertyValue('--accent-cyan').trim() || '#0891b2';
  const blue = styles.getPropertyValue('--accent-blue').trim() || '#2563eb';
  const warning = styles.getPropertyValue('--warning').trim() || '#d97706';
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';

  const visibleRates = exchangeRates.slice(0, 3);
  const colors = [cyan, blue, warning];

  canvas._chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', '오늘'],
      datasets: visibleRates.map((rate, idx) => ({
        label: rate.currency,
        data: getExchangePercentHistory(rate),
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length] + '22',
        tension: 0.38,
        borderWidth: 2,
        pointRadius: 2.5,
        pointHoverRadius: 5,
        fill: false
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        title: {
          display: true,
          text: '7일 변동률 비교 · 기준일 = 0%',
          color: mainTextColor,
          font: { size: 12, weight: '700' },
          padding: { bottom: 8 }
        },
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: textColor,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            font: { size: 10, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: isLight ? 'rgba(255,255,255,.97)' : 'rgba(8,19,29,.97)',
          titleColor: mainTextColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)}% 변동`
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 10 } }
        },
        y: {
          grid: { color: gridColor },
          suggestedMin: -0.8,
          suggestedMax: 1.4,
          ticks: {
            color: textColor,
            font: { size: 10 },
            callback: value => `${Number(value).toFixed(1)}%`
          }
        }
      }
    }
  });
}

/* =============================================
   26. Resource Load Monitor
============================================== */

function renderResourceLoad() {
  const container = document.getElementById('resource-list');
  if (!container) return;

  const sorted = [...resources].sort((a, b) => b.load - a.load);

  container.innerHTML = sorted.map(r => {
    const isDanger  = r.load >= 95;
    const isWarning = r.load >= 80 && r.load < 95;
    const fillCls   = isDanger ? 'danger' : isWarning ? 'warning' : '';
    const textColor = isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--success)';

    return `
      <div class="resource-item">
        <div class="resource-name">${escHtml(r.name)}</div>
        <div class="resource-bar-wrap">
          <div class="resource-bar-bg">
            <div class="resource-bar-fill ${fillCls}" id="res-bar-${r.name.replace(/\s/g,'_')}" style="width:0%"></div>
          </div>
          ${r.aiNote ? `<div class="resource-ai-note">🤖 ${escHtml(r.aiNote)}</div>` : ''}
        </div>
        <div class="resource-pct" style="color:${textColor};" id="res-pct-${r.name.replace(/\s/g,'_')}">0%</div>
        <div class="resource-stats">
          활성 ${r.activeTasks}건 | 긴급 ${r.urgentTasks}건 | 회의 ${r.meetingsThisWeek}회
        </div>
      </div>
    `;
  }).join('');

  // 바 애니메이션
  requestAnimationFrame(() => {
    sorted.forEach(r => {
      const key = r.name.replace(/\s/g, '_');
      const bar = document.getElementById(`res-bar-${key}`);
      const pct = document.getElementById(`res-pct-${key}`);
      if (bar) bar.style.width = r.load + '%';
      if (pct) countUp(pct, r.load, 1000, '%');
    });
  });
}

/* =============================================
   27. Decision Log
============================================== */

function renderDecisionLog() {
  const container = document.getElementById('decision-timeline');
  if (!container) return;

  const sorted = [...decisionLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

  // AI 반복 문제 요약
  const repeatedIssue = '이번 주 의사결정의 공통 원인: QA 병목 및 리소스 과부하가 다수 결정에 영향을 미쳤습니다. 팀 역량 재배분이 반복적으로 권장되고 있습니다.';

  container.innerHTML = `
    <div style="padding:10px 14px;background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.2);border-radius:8px;font-size:12px;color:var(--accent-purple);margin-bottom:16px;display:flex;gap:8px;">
      <span>🤖</span><span>${escHtml(repeatedIssue)}</span>
    </div>
    ${sorted.map(d => `
      <div class="decision-item">
        <div class="decision-dot"></div>
        <div class="decision-card card glass">
          <div class="decision-date">${d.date}</div>
          <div class="decision-title">${escHtml(d.title)}</div>
          <div class="decision-reason">${escHtml(d.reason)}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
            <div class="decision-participants">
              ${d.participants.map(p => `<span class="participant-chip">${escHtml(p)}</span>`).join('')}
            </div>
            ${d.relatedRisk ? `<span class="badge badge--warning" style="font-size:9px;">🔗 ${escHtml(d.relatedRisk)}</span>` : ''}
          </div>
          <div style="margin-top:8px;font-size:11px;color:var(--accent-cyan);">🤖 ${escHtml(d.aiSummary)}</div>
        </div>
      </div>
    `).join('')}
  `;
}

/* =============================================
   28. Scenario Simulation
============================================== */

function initSimulation() {
  const select   = document.getElementById('sim-task-select');
  const slider   = document.getElementById('sim-delay-input');
  const valueEl  = document.getElementById('sim-delay-value');
  const runBtn   = document.getElementById('sim-run-btn');
  if (!select) return;

  // 태스크 옵션 채우기
  select.innerHTML = tasks
    .filter(t => t.status !== 'done')
    .map(t => `<option value="${t.id}">${escHtml(t.title)} (우선순위 ${calculatePriority(t)}점)</option>`)
    .join('');

  // 슬라이더 실시간 값 표시
  slider?.addEventListener('input', () => {
    if (valueEl) valueEl.textContent = slider.value;
  });

  // 시뮬레이션 실행
  runBtn?.addEventListener('click', () => {
    const taskId   = parseInt(select.value, 10);
    const delayDays= parseInt(slider?.value || '3', 10);
    runSimulation(taskId, delayDays);
  });
}

function runSimulation(taskId, delayDays) {
  const result = simulateDelay(taskId, delayDays);
  const el     = document.getElementById('sim-result');
  if (!result || !el) return;

  el.classList.remove('hidden');

  const kpiArrow    = result.newKpi < result.currentKpi ? '↓' : '↑';
  const healthArrow = result.newHealth < result.currentHealth ? '↓' : '↑';

  // AI 완화 플랜 — projectId 또는 taskId 기반 조회
  const task = (typeof tasks !== 'undefined' ? tasks : []).find(t => t.id === taskId);
  const planKey = task && task.projectId
    ? `project-${task.projectId}`
    : `risk-1`;
  const plan = typeof mitigationPlans !== 'undefined' ? mitigationPlans[planKey] : null;

  el.innerHTML = `
    <div class="sim-result-title">
      📊 "${escHtml(result.taskTitle)}" — ${delayDays}일 지연 시나리오
    </div>

    <div class="ba-container">
      <div class="ba-grid">
        <div class="ba-column before">
          <div class="ba-col-title">현재 (Before)</div>
          <div class="ba-row">
            <span class="ba-row-label">일정 준수율 KPI</span>
            <span class="ba-row-val">${result.currentKpi}%</span>
          </div>
          <div class="ba-row">
            <span class="ba-row-label">우선순위 점수</span>
            <span class="ba-row-val">${result.currentPriority}점</span>
          </div>
          <div class="ba-row">
            <span class="ba-row-label">조직 건강 점수</span>
            <span class="ba-row-val">${result.currentHealth}</span>
          </div>
          <div class="ba-row">
            <span class="ba-row-label">배포 추가 지연</span>
            <span class="ba-row-val">0일</span>
          </div>
        </div>

        <div class="ba-column after">
          <div class="ba-col-title">${delayDays}일 지연 후 (After)</div>
          <div class="ba-row">
            <span class="ba-row-label">일정 준수율 KPI</span>
            <span class="ba-row-val">${result.newKpi}% ${kpiArrow}</span>
          </div>
          <div class="ba-row">
            <span class="ba-row-label">우선순위 점수</span>
            <span class="ba-row-val">${result.newPriority}점</span>
          </div>
          <div class="ba-row">
            <span class="ba-row-label">조직 건강 점수</span>
            <span class="ba-row-val">${result.newHealth} ${healthArrow}</span>
          </div>
          <div class="ba-row">
            <span class="ba-row-label">배포 추가 지연</span>
            <span class="ba-row-val">${result.deployDelay > 0 ? `+${result.deployDelay}일` : '없음'}</span>
          </div>
        </div>
      </div>

      <div class="ba-row" style="margin-top:8px;">
        <span class="ba-row-label">고객 영향</span>
        <span style="font-size:12px;color:var(--text-sub);">${escHtml(result.customerImpact)}</span>
      </div>
      ${result.chainTasks.length > 0 ? `
      <div class="ba-row" style="margin-top:4px;">
        <span class="ba-row-label">연쇄 영향 업무</span>
        <span style="font-size:11px;color:var(--text-muted);">${result.chainTasks.map(t => `• ${escHtml(t)}`).join('  ')}</span>
      </div>` : ''}
    </div>

    ${plan ? `
    <div class="mitigation-plan">
      <div class="mitigation-title">🤖 ${escHtml(plan.title)}</div>
      <ul class="mitigation-list">
        ${plan.actions.map(a => `<li class="mitigation-item">${escHtml(a)}</li>`).join('')}
      </ul>
    </div>` : ''}

    ${result.recommendTelegram ? `
      <div style="margin-top:10px;padding:10px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:6px;font-size:12px;color:#FDA4A4;display:flex;align-items:center;gap:8px;">
        <span>⚠️</span>
        <span>우선순위 ${result.newPriority}점 — Telegram 긴급 알림 권장</span>
        <button class="btn btn--danger btn--sm" style="margin-left:auto;" onclick="sendTelegramAlert('task', ${taskId});">✈️ 전송</button>
      </div>
    ` : ''}
  `;

  showToast('시뮬레이션 완료', `${delayDays}일 지연 시 KPI ${result.kpiDrop}%p 하락 예측`, 'warning');
}

/* =============================================
   Risk Radar Chart (Chart.js)
   6축: 일정 위험 / KPI 위험 / 고객 영향 / 개발 병목 / 리소스 과부하 / 외부 변수
============================================== */

function initRadarChart() {
  const canvas = document.getElementById('risk-radar-chart');
  if (!canvas) return;
  if (typeof Chart === 'undefined') return;

  // 이미 초기화된 경우 파괴 후 재생성
  if (canvas._chartInstance) {
    canvas._chartInstance.destroy();
  }

  // 6축 데이터 계산
  const dangerProjects = projects.filter(p => p.status === 'danger').length;
  const warningProjects = projects.filter(p => p.status === 'warning').length;
  const scheduleRisk = Math.min(100, (dangerProjects * 30 + warningProjects * 15));

  const kpiRed    = kpis.filter(k => getKpiStatus(k.current, k.target) === 'red').length;
  const kpiYellow = kpis.filter(k => getKpiStatus(k.current, k.target) === 'yellow').length;
  const kpiRisk   = Math.min(100, kpiRed * 20 + kpiYellow * 8);

  const urgentMails = mails.filter(m => m.priority === 'high' && m.unread).length;
  const customerRisk = Math.min(100, urgentMails * 25 + (dangerProjects > 0 ? 20 : 0));

  const sortedTasks = getSortedTasks();
  const overdueTasks  = sortedTasks.filter(t => getDaysLeft(t.dueDate) <= 0 && !t.isDone).length;
  const highBottleneck = risks.filter(r => r.bottleneckScore >= 8).length;
  const devBottleneck  = Math.min(100, overdueTasks * 15 + highBottleneck * 12);

  const overloaded = resources.filter(r => r.load >= 85).length;
  const critical   = resources.filter(r => r.load >= 95).length;
  const resourceRisk = Math.min(100, overloaded * 10 + critical * 20);

  const alertExchange = exchangeRates.filter(e => Math.abs(e.change) >= e.alertThreshold).length;
  const threatRisks   = risks.filter(r => r.category === 'Threat' && r.urgency >= 6).length;
  const externalRisk  = Math.min(100, alertExchange * 15 + threatRisks * 18);

  const data = [scheduleRisk, kpiRisk, customerRisk, devBottleneck, resourceRisk, externalRisk];

  const styles = getComputedStyle(document.documentElement);
  const accentColor = styles.getPropertyValue('--accent-cyan').trim() || '#22d3ee';
  const textColor = styles.getPropertyValue('--text-sub').trim() || '#94a3b8';
  const mainTextColor = styles.getPropertyValue('--text-main').trim() || '#f1f5f9';
  const dangerColor = styles.getPropertyValue('--danger').trim() || '#ef4444';
  const warningColor = styles.getPropertyValue('--warning').trim() || '#eab308';
  const gridColor = styles.getPropertyValue('--border-soft').trim() || 'rgba(148,163,184,0.18)';
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';

  const chart = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: ['일정 위험', 'KPI 위험', '고객 영향', '개발 병목', '리소스 과부하', '외부 변수'],
      datasets: [{
        label: '조직 위험 지수',
        data,
        backgroundColor: isLight ? 'rgba(180, 35, 42, 0.08)' : 'rgba(255, 92, 100, 0.14)',
        borderColor: dangerColor,
        borderWidth: 2,
        pointBackgroundColor: data.map(v =>
          v >= 60 ? dangerColor : v >= 35 ? warningColor : accentColor
        ),
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 25,
            color: textColor,
            font: { size: 9 },
            backdropColor: 'transparent'
          },
          grid: { color: gridColor },
          angleLines: { color: gridColor },
          pointLabels: {
            color: textColor,
            font: { size: 11, weight: '600' }
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: '7일 변동률 비교 · 기준일 = 0%',
          color: mainTextColor,
          font: { size: 12, weight: '700' },
          padding: { bottom: 8 }
        },
        legend: { display: false },
        tooltip: {
          backgroundColor: isLight ? 'rgba(255,255,255,0.96)' : 'rgba(8,19,29,0.96)',
          titleColor: mainTextColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          callbacks: {
            label: ctx => ` 위험도 ${ctx.raw}점`
          }
        }
      }
    }
  });

  canvas._chartInstance = chart;
}
