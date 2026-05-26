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
  const { score, status } = calculateHealthScore();
  const dangerProj = projects.filter(p => p.status === 'danger')[0];
  const redKpi     = kpis.find(k => getKpiStatus(k.current, k.target) === 'red');
  const topTask    = getSortedTasks().filter(t => !t.isDone)[0];
  const qaRisk     = risks.find(r => r.category === 'Weakness' && r.urgency >= 8);

  return [
    {
      id: 1,
      targetId: 'briefing-card',
      title: '① AI Daily Briefing',
      body: `오늘의 조직 상태를 AI가 자동 분석한 브리핑입니다.<br>
             현재 상태 <span class="pres-highlight-text">${status}</span> —
             위험 프로젝트, KPI 경고, 긴급 메일 현황을 한 문장으로 요약합니다.<br>
             <br>하단의 <strong>추천 액션 칩</strong>은 우선순위 계산식 기반으로 자동 생성됩니다.`,
      position: 'below'
    },
    {
      id: 2,
      targetId: 'health-widget',
      title: '② Organization Health Score',
      body: `조직 건강 점수 <span class="pres-highlight-text">${score}점</span> — 위험 프로젝트 수, KPI 경고 수,
             지연 업무, 긴급 메일, 팀 과부하 5개 지표를 종합 계산합니다.<br>
             <br>감점/가점 요인이 패널 하단에 상세 표시됩니다.`,
      position: 'left'
    },
    {
      id: 3,
      targetId: dangerProj ? `project-card-${dangerProj.id}` : 'projects-list',
      title: '③ 위험 프로젝트 감지',
      body: dangerProj
        ? `<strong>${dangerProj.name}</strong>이 마감 <span class="pres-highlight-text">${getDdayLabel(dangerProj.deadline)}</span> 상태로
           진행률 ${dangerProj.progress}%에 불과합니다.<br>
           <br>카드 좌측 붉은 라인은 <strong>위험(danger)</strong> 상태를 즉시 식별할 수 있도록 강조됩니다.`
        : '현재 위험 프로젝트가 없는 정상 상태입니다.',
      position: 'right'
    },
    {
      id: 4,
      targetId: 'kpi-grid',
      title: '④ KPI Traffic Light',
      body: redKpi
        ? `<strong>${redKpi.name}</strong>이 현재 <span class="pres-highlight-text">${redKpi.current}${redKpi.unit}</span> —
           목표(${redKpi.target}${redKpi.unit}) 대비 미달입니다.<br>
           <br>신호등 색상이 자동으로 결정되며, 클릭 시 AI 개선 제안이 펼쳐집니다.`
        : '현재 모든 KPI가 목표를 달성 중입니다.',
      position: 'below'
    },
    {
      id: 5,
      targetId: 'swot-matrix',
      title: '⑤ SWOT Risk Matrix',
      body: qaRisk
        ? `<strong>${qaRisk.title}</strong>이 Weakness 영역에 <span class="pres-highlight-text">우선순위 ${calculateRiskPriority(qaRisk)}점</span>으로 분류되었습니다.<br>
           <br>80점 이상 위험 태그는 pulse 애니메이션으로 강조됩니다. 태그 클릭 시 AI 권장 조치 3개가 포함된 상세 모달이 열립니다.`
        : 'SWOT 분석으로 조직의 강점·약점·기회·위협을 한눈에 파악합니다.',
      position: 'below'
    },
    {
      id: 6,
      targetId: 'tasks-list',
      title: '⑥ Priority Task Queue',
      body: topTask
        ? `최우선 업무 <strong>"${topTask.title}"</strong>가 우선순위 점수 <span class="pres-highlight-text">${topTask.priorityScore}점</span>으로 최상단에 배치됩니다.<br>
           <br>긴급도 × 영향도 × 마감점수 × KPI영향도 × 병목점수 공식으로 자동 정렬됩니다.`
        : '모든 업무가 완료된 상태입니다.',
      position: 'below'
    },
    {
      id: 7,
      targetId: 'action-rec-widget',
      title: '⑦ AI 추천 액션',
      body: `AI가 대시보드 전체 데이터를 분석해 <strong>오늘 해야 할 액션 5개</strong>를 자동 생성합니다.<br>
             <br>긴급 업무 → 메일 SLA → 브랜치 위험 → 리소스 과부하 → KPI 경고 순으로 우선순위가 결정됩니다.`,
      position: 'left'
    },
    {
      id: 8,
      targetId: 'telegram-log-widget',
      title: '⑧ Telegram Alert Simulation',
      body: `업무 카드의 <strong>✈️ 전송 버튼</strong>을 누르면 담당자에게 Telegram 긴급 알림이 전송됩니다.<br>
             <br>실제 API 없이도 전송 시뮬레이션이 동작하며, 전송 기록이 <span class="pres-highlight-text">LocalStorage</span>에 저장됩니다.`,
      position: 'left'
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
