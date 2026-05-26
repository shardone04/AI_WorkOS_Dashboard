/* ==============================================
   WorkOS AI Command Center — presentation.js
   Presentation Demo Mode
   - 8단계 자동 하이라이트 + 툴팁
   - ESC / 닫기 버튼으로 종료
   - 각 단계: 대상 요소 spotlight + 설명 카드
============================================== */

/* =============================================
   1. 프레젠테이션 단계 정의
============================================== */

/**
 * 각 step: { targetId, title, body, position }
 * position: 'below' | 'above' | 'right' | 'center'
 */
function buildPresentationSteps() {
  // 런타임 데이터에서 동적으로 문구 생성
  const { status } = generateDailyBriefing();
  const dangerProj = projects.filter(p => p.status === 'danger')[0];
  const redKpi     = kpis.find(k => getKpiStatus(k.current, k.target) === 'red');
  const topTask    = getSortedTasks().filter(t => !t.isDone)[0];
  const unreadMails = mails.filter(m => m.unread && !AppState.repliedMails?.has(m.id)).length;
  const riskSignalCount = (AppState.riskSignals || []).length;

  return [
    {
      id: 1,
      pageKey: 'briefing',
      targetId: 'briefing-card',
      title: '① Overview Command Center',
      body: `최종 제출본은 메뉴별 페이지 방식으로 재구성되었습니다.<br>
             현재 운영 상태는 <span class="pres-highlight-text">${status}</span>,
             경고 신호는 <span class="pres-highlight-text">${riskSignalCount}건</span>입니다.<br>
             <br>Overview는 브리핑, 지식 지도, 포스트잇, 업무 유틸리티, 환율 비용 신호를 한 번에 확인하는 시작 화면입니다.`,
      position: 'below'
    },
    {
      id: 2,
      pageKey: 'briefing',
      targetId: 'neural-map',
      title: '② Command Knowledge Map',
      body: `옵시디언 스타일의 지식 구조도입니다.<br>
             각 노드는 프로젝트, 결산, 리스크, 회의, 커뮤니케이션 기능을 연결해
             메인 화면에서 전체 업무 흐름을 조율하는 역할을 합니다.`,
      position: 'below'
    },
    {
      id: 3,
      pageKey: 'projects',
      targetId: dangerProj ? `project-card-${dangerProj.id}` : 'projects-list',
      title: '③ Projects + Decisions',
      body: dangerProj
        ? `<strong>${dangerProj.name}</strong>이 마감 <span class="pres-highlight-text">${getDdayLabel(dangerProj.deadline)}</span> 상태로
           진행률 ${dangerProj.progress}%에 불과합니다.<br>
           <br>Projects 페이지에는 마일스톤, 카운트다운, 의사결정 로그가 함께 묶여 있어 빈 화면 없이 프로젝트 판단을 이어갈 수 있습니다.`
        : '현재 위험 프로젝트가 없는 정상 상태입니다. Projects 페이지에서는 마일스톤과 결정 로그를 함께 확인합니다.',
      position: 'right'
    },
    {
      id: 4,
      pageKey: 'kpi',
      targetId: 'kpi-grid',
      title: '④ KPI / 결산',
      body: redKpi
        ? `<strong>${redKpi.name}</strong>이 현재 <span class="pres-highlight-text">${redKpi.current}${redKpi.unit}</span> —
           목표(${redKpi.target}${redKpi.unit}) 대비 미달입니다.<br>
           <br>KPI 페이지는 신호등 지표와 일일·주간·월간·분기·연간 결산 분석을 함께 보여줍니다.`
        : '현재 모든 KPI가 목표를 달성 중입니다. 결산 분석은 같은 페이지에서 기간별로 전환됩니다.',
      position: 'below'
    },
    {
      id: 5,
      pageKey: 'risk',
      targetId: 'section-simulation',
      title: '⑤ Risk + Scenario Simulation',
      body: `Risk 페이지는 SWOT, Hot Issue, 시나리오 시뮬레이션을 통합했습니다.<br>
             지연 일수를 조정하면 KPI, 배포 지연, 고객 영향을 한 번에 예측합니다.`,
      position: 'below'
    },
    {
      id: 6,
      pageKey: 'tasks',
      targetId: 'tasks-list',
      title: '⑥ Tasks + Resources',
      body: topTask
        ? `최우선 업무 <strong>"${topTask.title}"</strong>가 우선순위 점수 <span class="pres-highlight-text">${topTask.priorityScore}점</span>으로 최상단에 배치됩니다.<br>
           <br>Tasks 페이지에는 팀 리소스 부하도 함께 배치해 담당자 병목을 바로 확인합니다.`
        : '모든 업무가 완료된 상태입니다. 팀 리소스 부하는 같은 페이지에서 확인합니다.',
      position: 'below'
    },
    {
      id: 7,
      pageKey: 'meeting',
      targetId: 'section-meeting-ai',
      title: '⑦ Meeting Audio AI',
      body: `회의 녹음 파일을 업로드하면 전사와 Meeting Summary.md를 생성합니다.<br>
             MP3, WAV, WEBM뿐 아니라 <span class="pres-highlight-text">M4A</span> 업로드도 지원하도록 반영했습니다.`,
      position: 'below'
    },
    {
      id: 8,
      pageKey: 'expenses',
      targetId: 'section-expense',
      title: '⑧ Expenses + Settlement',
      body: `Shared Expense Dashboard는 Google Sheet 경비 데이터를 동기화하고,
             파스텔 도넛 차트와 기간별 결산 분석으로 보여줍니다.<br>
             일일 결산 메일은 Gmail Webhook 연결 시 실제 발송됩니다.`,
      position: 'below'
    },
    {
      id: 9,
      pageKey: 'comms',
      targetId: 'section-teamchat',
      title: '⑨ Comms + Admin Access',
      body: `메일, 공지, 팀 채팅, Daily Summary Mail은 Comms 메뉴로 통합했습니다.<br>
             읽지 않은 메일은 <span class="pres-highlight-text">${unreadMails}건</span>이며,
             우측 상단 Admin 버튼에서 관리자 로그인과 로그아웃을 처리합니다.`,
      position: 'below'
    }
  ];
}

/* =============================================
   2. 프레젠테이션 상태
============================================== */

const PresState = {
  active:  false,
  current: 0,   // 현재 step index (0-based)
  steps:   [],
  scrollLock: false,
  highlightTimer: null
};

/* =============================================
   3. 초기화
============================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 버튼 클릭
  document.getElementById('presentation-btn')?.addEventListener('click', togglePresentation);

  // 이전 / 다음
  document.getElementById('pres-prev-btn')?.addEventListener('click', () => moveStep(-1));
  document.getElementById('pres-next-btn')?.addEventListener('click', () => moveStep(1));

  // 닫기
  document.getElementById('pres-close-btn')?.addEventListener('click', endPresentation);

  // ESC 키
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && PresState.active) endPresentation();
    if (e.key === 'ArrowRight' && PresState.active) moveStep(1);
    if (e.key === 'ArrowLeft'  && PresState.active) moveStep(-1);
  });
});

/* =============================================
   4. 시작 / 종료
============================================== */

function togglePresentation() {
  PresState.active ? endPresentation() : startPresentation();
}

function startPresentation() {
  clearHighlight();
  PresState.active  = true;
  PresState.current = 0;
  PresState.steps   = buildPresentationSteps();

  const overlay = document.getElementById('presentation-overlay');
  overlay?.classList.remove('hidden');
  overlay?.classList.add('active');

  document.getElementById('presentation-btn')?.classList.add('running');

  // 진행 점 생성
  renderProgressDots();

  // 첫 단계 표시
  showStep(0);

  if (typeof showToast === 'function') {
    showToast('프레젠테이션 시작', '← → 방향키 또는 버튼으로 이동 | ESC 종료', 'info', 3500);
  }
}

function endPresentation() {
  PresState.active = false;

  const overlay = document.getElementById('presentation-overlay');
  overlay?.classList.add('hidden');
  overlay?.classList.remove('active');

  document.getElementById('presentation-btn')?.classList.remove('running');

  // 하이라이트 제거
  clearHighlight();

  // 스크롤 복원
  document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =============================================
   5. 스텝 이동
============================================== */

function moveStep(delta) {
  const next = PresState.current + delta;
  if (next < 0 || next >= PresState.steps.length) {
    if (next >= PresState.steps.length) {
      endPresentation();
      if (typeof showToast === 'function') {
        showToast('프레젠테이션 완료', '모든 핵심 기능 소개가 완료되었습니다! 🎉', 'success', 3000);
      }
    }
    return;
  }
  PresState.current = next;
  showStep(next);
}

/* =============================================
   6. 단계 렌더링
============================================== */

function showStep(index) {
  const step   = PresState.steps[index];
  const total  = PresState.steps.length;
  if (!step) return;

  // 배지 업데이트
  const badge = document.getElementById('pres-step-badge');
  if (badge) badge.textContent = `Step ${index + 1} / ${total}`;

  // 본문 업데이트
  const body = document.getElementById('pres-tooltip-body');
  if (body) {
    body.innerHTML = `
      <div style="font-size:14px;font-weight:800;color:var(--text-main);margin-bottom:8px;">${step.title}</div>
      <div>${step.body}</div>
    `;
  }

  // 이전/다음 버튼 상태
  const prevBtn = document.getElementById('pres-prev-btn');
  const nextBtn = document.getElementById('pres-next-btn');
  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) nextBtn.textContent = index === total - 1 ? '완료 ✓' : '다음 ▶';

  // 점 업데이트
  updateProgressDots(index);

  // 대상 요소 하이라이트
  if (step.pageKey && typeof showDashboardPage === 'function') {
    showDashboardPage(step.pageKey, { instant: true, focus: false });
  }
  highlightTarget(step.targetId, step.position);
}

/* =============================================
   7. 하이라이트 링 & 툴팁 위치
============================================== */

function highlightTarget(targetId, position = 'below') {
  const target  = document.getElementById(targetId);
  const ring    = document.getElementById('pres-highlight-ring');
  const tooltip = document.getElementById('pres-tooltip');
  if (!ring || !tooltip) return;

  clearHighlight();

  if (!target) {
    positionTooltipCenter(tooltip);
    ring.style.display = 'none';
    return;
  }

  // scrollIntoView가 내부 스크롤 컨테이너(main-content)에서도 안정적으로 동작하도록 사용
  target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

  // 스크롤 후 실제 뷰포트 기준 좌표 재계산
  if (PresState.highlightTimer) {
    clearTimeout(PresState.highlightTimer);
    PresState.highlightTimer = null;
  }
  PresState.highlightTimer = setTimeout(() => {
    const rect = target.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const safe = 14;
    const pad = 10;

    // 헤더와 화면 경계를 침범하지 않도록 안전 영역을 둔다.
    const minTop = 72;
    let left = Math.max(safe, rect.left - pad);
    let top = Math.max(minTop, rect.top - pad);
    let right = Math.min(vw - safe, rect.right + pad);
    let bottom = Math.min(vh - safe, rect.bottom + pad);

    // 대상이 너무 크면 화면을 덮는 파란 박스가 되지 않게 제한한다.
    const maxW = vw - safe * 2;
    const maxH = Math.min(vh * 0.64, vh - minTop - safe);
    let width = Math.max(96, Math.min(right - left, maxW));
    let height = Math.max(64, Math.min(bottom - top, maxH));

    if (left + width > vw - safe) left = vw - safe - width;
    if (top + height > vh - safe) top = vh - safe - height;
    left = Math.max(safe, left);
    top = Math.max(minTop, top);

    ring.style.display = 'block';
    ring.style.left = `${Math.round(left)}px`;
    ring.style.top = `${Math.round(top)}px`;
    ring.style.width = `${Math.round(width)}px`;
    ring.style.height = `${Math.round(height)}px`;

    target.classList.add('pres-highlighted');
    positionTooltip(tooltip, { left, top, right: left + width, bottom: top + height, width, height }, position);
    PresState.highlightTimer = null;
  }, 420);
}

function positionTooltip(tooltip, rect, position) {
  const vw      = window.innerWidth;
  const vh      = window.innerHeight;
  const tw      = tooltip.offsetWidth  || 360;
  const th      = tooltip.offsetHeight || 200;
  const margin  = 18;

  let top, left;

  switch (position) {
    case 'below':
      top  = rect.bottom + margin;
      left = rect.left + rect.width / 2 - tw / 2;
      break;
    case 'above':
      top  = rect.top - th - margin;
      left = rect.left + rect.width / 2 - tw / 2;
      break;
    case 'right':
      top  = rect.top + rect.height / 2 - th / 2;
      left = rect.right + margin;
      break;
    case 'left':
      top  = rect.top + rect.height / 2 - th / 2;
      left = rect.left - tw - margin;
      break;
    default:
      positionTooltipCenter(tooltip);
      return;
  }

  // 화면 경계 보정
  left = Math.max(margin, Math.min(left, vw - tw - margin));
  top  = Math.max(margin, Math.min(top,  vh - th - margin));

  // 화면 밖으로 나가면 반대편으로
  if (top < margin && position === 'above') {
    top = rect.bottom + margin;
  }
  if (top + th > vh - margin && position === 'below') {
    top = rect.top - th - margin;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top  = `${top}px`;
}

function positionTooltipCenter(tooltip) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tw = tooltip.offsetWidth  || 360;
  const th = tooltip.offsetHeight || 200;
  tooltip.style.left = `${(vw - tw) / 2}px`;
  tooltip.style.top  = `${(vh - th) / 3}px`;
}

/* =============================================
   8. 하이라이트 제거
============================================== */

function clearHighlight() {
  if (PresState.highlightTimer) {
    clearTimeout(PresState.highlightTimer);
    PresState.highlightTimer = null;
  }
  const ring = document.getElementById('pres-highlight-ring');
  if (ring) {
    ring.style.display = 'none';
    ring.style.width = '0px';
    ring.style.height = '0px';
  }
  document.querySelectorAll('.pres-highlighted').forEach(el => el.classList.remove('pres-highlighted'));
}

/* =============================================
   9. 진행 점 (dots)
============================================== */

function renderProgressDots() {
  const container = document.getElementById('pres-progress-dots');
  if (!container) return;

  container.innerHTML = PresState.steps.map((_, i) =>
    `<div class="pres-dot" id="pres-dot-${i}"></div>`
  ).join('');
}

function updateProgressDots(activeIndex) {
  PresState.steps.forEach((_, i) => {
    const dot = document.getElementById(`pres-dot-${i}`);
    if (!dot) return;
    dot.className = 'pres-dot';
    if (i === activeIndex) dot.classList.add('active');
    else if (i < activeIndex) dot.classList.add('done');
  });
}
