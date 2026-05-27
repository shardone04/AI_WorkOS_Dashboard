/* ==============================================
   WorkOS AI Command Center — chatbot.js
   AI Work Chatbot (Rule-Based)
   Section Map:
   1.  초기화
   2.  메시지 렌더링
   3.  사용자 입력 처리
   4.  Typing animation
   5.  Rule-Based 응답 엔진 (7+ 패턴)
   6.  응답 생성 함수
   7.  Contextual Evidence 태그
   8.  추천 질문 칩
   9.  Chat history LocalStorage
============================================== */

/* =============================================
   1. 초기화
============================================== */

document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});

function initChatbot() {
  const input   = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const chips   = document.querySelectorAll('.chip');

  // 대화 기록 복원
  const saved = loadFromLocalStorage('chatHistory') || [];
  AppState.chatHistory = saved;

  if (saved.length === 0) {
    // 최초 인사말
    appendBotMessage(
      '안녕하세요! 저는 WorkOS AI Assistant입니다. 오늘의 업무 현황을 분석하고 도움을 드릴 수 있습니다. 아래 추천 질문을 눌러보세요!',
      null,
      false
    );
  } else {
    // 저장된 기록 복원
    saved.forEach(msg => {
      if (msg.role === 'user') {
        appendUserMessage(msg.text, false);
      } else {
        appendBotMessage(msg.text, msg.evidence, false);
      }
    });
    scrollChatToBottom();
  }

  // 전송 이벤트
  sendBtn?.addEventListener('click', handleUserSend);
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserSend();
    }
  });

  // 추천 질문 칩
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.q;
      if (q && input) {
        input.value = q;
        handleUserSend();
      }
    });
  });
}

/* =============================================
   2. 메시지 렌더링
============================================== */

function appendUserMessage(text, save = true) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.innerHTML = `<div class="chat-bubble">${escHtml(text)}</div>`;
  container.appendChild(div);
  scrollChatToBottom();

  if (save) {
    AppState.chatHistory.push({ role: 'user', text });
    saveChatHistory();
  }
}

function appendBotMessage(text, evidence = null, save = true) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = `
    <div class="chat-bubble">${formatBotText(text)}</div>
    ${evidence ? renderEvidenceCard(evidence) : ''}
  `;
  container.appendChild(div);
  scrollChatToBottom();

  if (save) {
    AppState.chatHistory.push({ role: 'bot', text, evidence });
    saveChatHistory();
  }
}

function renderEvidenceCard(evidence) {
  // evidence가 객체면 structured card로, 문자열이면 plain 표시
  if (typeof evidence === 'object' && evidence !== null) {
    const entries = Object.entries(evidence);
    const items = entries.map(([k, v]) => {
      const val  = String(v);
      const cls  = /위험|danger|critical|🔴/i.test(val) ? 'danger'
                 : /경고|warning|yellow|🟡/i.test(val)  ? 'warning'
                 : /정상|완료|green|✅|🟢/i.test(val)   ? 'success'
                 : '';
      return `
        <div class="evidence-item">
          <span class="evidence-label">${escHtml(k)}</span>
          <span class="evidence-value${cls ? ' ' + cls : ''}">${escHtml(val)}</span>
        </div>`;
    }).join('');
    return `
      <div class="evidence-card">
        <div class="evidence-card-title">📎 AI 분석 근거</div>
        <div class="evidence-grid">${items}</div>
      </div>`;
  }
  // 문자열 fallback (로컬스토리지에서 복원된 이전 형식)
  return `<div class="chat-evidence">📎 근거: ${escHtml(String(evidence))}</div>`;
}

/** 봇 메시지 내 마크다운-lite 포맷 처리 */
function formatBotText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/^(\d+\.)/gm, '<span style="color:var(--accent-cyan);font-weight:700;">$1</span>');
}

function scrollChatToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) container.scrollTop = container.scrollHeight;
}

/* =============================================
   3. 사용자 입력 처리
============================================== */

async function handleUserSend() {
  const input = document.getElementById('chat-input');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  appendUserMessage(text);
  showTypingIndicator();

  const minimumDelay = new Promise(resolve => setTimeout(resolve, 450));
  try {
    const claudeResult = await requestClaudeChat(text, 'work');
    await minimumDelay;
    removeTypingIndicator();
    if (claudeResult?.usedClaude && claudeResult.text) {
      appendBotMessage(claudeResult.text, buildClaudeEvidence(claudeResult));
      return;
    }
  } catch (error) {
    await minimumDelay;
    removeTypingIndicator();
  }

  const { response, evidence } = getBotResponse(text);
  appendBotMessage(response, evidence);
}

async function requestClaudeChat(message, mode = 'work') {
  if (!location.protocol.startsWith('http')) return null;
  if (typeof apiPost !== 'function') return null;

  const userClaudeApiKey = typeof getUserClaudeApiKey === 'function' ? getUserClaudeApiKey() : '';
  const hasServerClaude = Boolean(window.FinalRuntime?.config?.features?.anthropic);
  if (!userClaudeApiKey && !hasServerClaude) return null;

  const result = await apiPost('/api/claude/chat', {
    mode,
    message,
    context: buildClaudeDashboardContext(message),
    ...(userClaudeApiKey ? { userClaudeApiKey } : {})
  });

  return result?.usedClaude ? result : null;
}

function buildClaudeEvidence(result) {
  return buildEvidence({
    '응답 엔진': result.keySource === 'user' ? 'User Claude API' : 'Railway Claude API',
    '모델': result.model || 'Claude',
    'Fallback': 'Rule-based 응답 가능'
  });
}

function buildClaudeDashboardContext(message) {
  const sortedTasks = typeof getSortedTasks === 'function' ? getSortedTasks() : [];
  const kpiList = typeof getKpisWithStatus === 'function' ? getKpisWithStatus() : [];
  const projectList = Array.isArray(projects) ? projects : [];
  const mailList = Array.isArray(mails) ? mails : [];
  const resourceList = Array.isArray(resources) ? resources : [];
  const riskList = Array.isArray(risks) ? risks : [];
  const expenseRows = window.FinalRuntime?.expenseRows?.length ? window.FinalRuntime.expenseRows : [];
  const repliedMails = typeof AppState !== 'undefined' ? AppState.repliedMails : null;

  return {
    question: message,
    date: new Date().toISOString().slice(0, 10),
    projects: projectList.map(p => ({
      name: p.name,
      team: p.team,
      status: p.status,
      progress: p.progress,
      deadline: p.deadline,
      currentStage: p.currentStage,
      nextStage: p.nextStage
    })).slice(0, 8),
    urgentTasks: sortedTasks
      .filter(t => !t.isDone)
      .slice(0, 8)
      .map(t => ({
        title: t.title,
        owner: t.owner,
        dueDate: t.dueDate,
        urgency: t.urgency,
        impact: t.impact,
        priorityScore: t.priorityScore || (typeof calculatePriority === 'function' ? calculatePriority(t) : undefined),
        bottleneckScore: t.bottleneckScore
      })),
    kpiAlerts: kpiList
      .filter(k => k.status && k.status !== 'green')
      .map(k => ({
        name: k.name,
        current: k.current,
        target: k.target,
        unit: k.unit,
        status: k.status,
        aiSuggestion: k.aiSuggestion
      })),
    urgentMails: mailList
      .filter(m => m.unread && m.priority === 'high' && !repliedMails?.has(m.id))
      .map(m => ({
        subject: m.subject,
        from: m.fromName || m.from,
        slaHoursLeft: m.slaHoursLeft,
        summary: m.summary
      }))
      .slice(0, 5),
    resourceLoad: resourceList
      .map(r => ({
        name: r.name,
        load: r.load,
        activeTasks: r.activeTasks,
        urgentTasks: r.urgentTasks,
        aiNote: r.aiNote
      }))
      .slice(0, 8),
    topRisks: riskList
      .map(r => ({
        title: r.title,
        category: r.category,
        severity: r.severity,
        detail: r.detail,
        bottleneckScore: r.bottleneckScore
      }))
      .slice(0, 6),
    expenseSample: expenseRows.slice(0, 8)
  };
}

/* =============================================
   4. Typing Animation
============================================== */

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="chat-bubble typing-indicator">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  container.appendChild(div);
  scrollChatToBottom();
}

function removeTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

/* =============================================
   5. Rule-Based 응답 엔진
============================================== */

/**
 * 사용자 메시지를 분석해 응답과 근거를 반환
 * @param {string} message
 * @returns {{ response: string, evidence: string|null }}
 */
function getBotResponse(message) {
  const t = message.toLowerCase();

  /* ── 패턴 1: 급한 업무 / 우선순위 ── */
  if (includes(t, ['급한', '우선순위', '긴급', '먼저', '빠른', '중요한'])) {
    return getTopPriorityTasksResponse();
  }

  /* ── 패턴 2: KPI / 성과 ── */
  if (includes(t, ['kpi', '성과', '지표', '달성', '준수율', '목표'])) {
    return getKpiWarningResponse();
  }

  /* ── 패턴 3: 메일 / 고객 ── */
  if (includes(t, ['메일', '고객', '이메일', '답변', 'sla', '미처리'])) {
    return getMailSummaryResponse();
  }

  /* ── 패턴 4: 회의 / 체크리스트 ── */
  if (includes(t, ['회의', '체크리스트', '준비', '미팅', '보고'])) {
    return getMeetingChecklistResponse();
  }

  /* ── 패턴 5: 텔레그램 / 알림 전송 ── */
  if (includes(t, ['텔레그램', '알림', '전송', 'telegram', '보내'])) {
    return getTelegramResponse();
  }

  /* ── 패턴 6: 병목 / 이번 주 / 지연 ── */
  if (includes(t, ['병목', '지연', '이번 주', '블로킹', '막힌', '느린'])) {
    return getBottleneckResponse();
  }

  /* ── 패턴 7: 위험 프로젝트 / 프로젝트 요약 ── */
  if (includes(t, ['프로젝트', '위험', '상태', '진행률', '마감', '배포'])) {
    return getDangerProjectsResponse();
  }

  /* ── 패턴 8: 운영 상태 ── */
  if (includes(t, ['건강', '점수', '조직', '상태', '전체'])) {
    return getHealthScoreResponse();
  }

  /* ── 패턴 9: 환율 / 예산 ── */
  if (includes(t, ['환율', '예산', '비용', '달러', 'usd', '환전'])) {
    return getExchangeRateResponse();
  }

  /* ── 패턴 10: 브랜치 / 개발 / 배포 ── */
  if (includes(t, ['브랜치', '병합', '머지', 'merge', 'git', '충돌', '개발'])) {
    return getBranchResponse();
  }

  /* ── 패턴 11: 리소스 / 팀 과부하 ── */
  if (includes(t, ['리소스', '과부하', '팀', '재배정', '인력', '부하'])) {
    return getResourceResponse();
  }

  /* ── 패턴 12: 안녕 / 인사 ── */
  if (includes(t, ['안녕', '안녕하세요', 'hi', 'hello', '반가워', '처음'])) {
    return {
      response: '안녕하세요! 저는 **WorkOS AI Assistant**입니다. 현재 대시보드 데이터를 실시간으로 분석하고 있습니다.\n\n오늘의 업무 현황을 요약하면:\n1. 진행 중 프로젝트 **' + projects.filter(p=>p.status!=='done').length + '개**\n2. 긴급 미처리 업무 **' + getSortedTasks().filter(t=>t.urgency>=8&&!t.isDone).length + '건**\n3. 미처리 긴급 메일 **' + mails.filter(m=>m.unread&&m.priority==='high').length + '건**\n\n무엇을 도와드릴까요?',
      evidence: null
    };
  }

  /* ── 패턴 13: 도움말 / 기능 ── */
  if (includes(t, ['도움', '기능', '뭐', '어떤', '할 수', '사용법'])) {
    return {
      response: '저는 다음과 같은 질문에 답변할 수 있습니다:\n\n1. **"오늘 가장 급한 업무"** — 우선순위 업무 분석\n2. **"KPI 경고 원인"** — 성과 지표 분석\n3. **"고객 메일 요약"** — 메일 현황 및 SLA\n4. **"위험 프로젝트"** — 프로젝트 상태 요약\n5. **"회의 체크리스트"** — AI 회의 준비 지원\n6. **"텔레그램 알림"** — 긴급 알림 전송\n7. **"병목 업무"** — 지연 원인 분석\n8. **"전체 운영 상태"** — 경고 신호 요약',
      evidence: null
    };
  }

  /* ── 기본 응답 ── */
  return getDefaultResponse(message);
}

/** 문자열 배열 중 하나라도 포함되면 true */
function includes(text, keywords) {
  return keywords.some(kw => text.includes(kw));
}

/* =============================================
   6. 응답 생성 함수
============================================== */

/** 패턴 1: 우선순위 업무 */
function getTopPriorityTasksResponse() {
  const top = getSortedTasks().filter(t => !t.isDone).slice(0, 3);
  if (top.length === 0) {
    return { response: '🎉 현재 모든 긴급 업무가 완료되었습니다! 다음 마일스톤을 확인해 보세요.', evidence: null };
  }

  const lines = top.map((t, i) => {
    const dday = getDdayLabel(t.dueDate);
    return `${i + 1}. **${t.title}**\n   담당: ${t.owner} | ${dday} | 우선순위 ${t.priorityScore}점`;
  }).join('\n\n');

  const topTask = top[0];
  const evidence = buildEvidence({
    '마감': getDdayLabel(topTask.dueDate),
    '긴급도': `${topTask.urgency}/10`,
    '영향도': `${topTask.impact}/10`,
    '우선순위': `${topTask.priorityScore}점`
  });

  return {
    response: `현재 가장 시급한 업무 **TOP ${top.length}**입니다:\n\n${lines}\n\n✈️ 우측 패널에서 Telegram 긴급 알림을 전송할 수 있습니다.`,
    evidence
  };
}

/** 패턴 2: KPI 경고 */
function getKpiWarningResponse() {
  const kpisWithStatus = getKpisWithStatus();
  const redList    = kpisWithStatus.filter(k => k.status === 'red');
  const yellowList = kpisWithStatus.filter(k => k.status === 'yellow');

  if (redList.length === 0 && yellowList.length === 0) {
    return { response: '✅ 현재 모든 KPI가 목표치를 달성하고 있습니다! 유지하세요.', evidence: null };
  }

  let response = '';
  if (redList.length > 0) {
    response += `🔴 **위험 KPI (${redList.length}건)**:\n`;
    redList.forEach(k => {
      const gap = Math.round(k.target - k.current);
      response += `• **${k.name}**: ${k.current}${k.unit} / 목표 ${k.target}${k.unit} (${gap}${k.unit} 미달)\n`;
      response += `  💡 ${k.aiSuggestion}\n\n`;
    });
  }
  if (yellowList.length > 0) {
    response += `🟡 **주의 KPI (${yellowList.length}건)**:\n`;
    yellowList.forEach(k => {
      response += `• **${k.name}**: ${k.current}${k.unit} / 목표 ${k.target}${k.unit} (추세 ${k.trend > 0 ? '↑' : '↓'}${Math.abs(k.trend)}${k.unit})\n`;
    });
  }

  const worstKpi = redList[0] || yellowList[0];
  const evidence = buildEvidence({
    'KPI 경고 수': `${redList.length + yellowList.length}건`,
    '최우선 KPI': worstKpi.name,
    '현재값': `${worstKpi.current}${worstKpi.unit}`,
    '목표값': `${worstKpi.target}${worstKpi.unit}`
  });

  return { response, evidence };
}

/** 패턴 3: 메일 요약 */
function getMailSummaryResponse() {
  const urgent  = mails.filter(m => m.unread && m.priority === 'high' && !AppState.repliedMails?.has(m.id));
  const unread  = mails.filter(m => m.unread && !AppState.repliedMails?.has(m.id));

  if (urgent.length === 0 && unread.length === 0) {
    return { response: '📬 현재 미처리 긴급 메일이 없습니다. 모든 메일이 처리된 상태입니다.', evidence: null };
  }

  let response = `📧 **메일 현황 요약**\n\n`;
  response += `• 전체 미읽음: **${unread.length}건**\n`;
  response += `• 긴급 미처리: **${urgent.length}건**\n\n`;

  if (urgent.length > 0) {
    response += `🚨 **즉시 처리 필요:**\n`;
    urgent.forEach((m, i) => {
      const sla = m.slaHoursLeft ? ` (SLA **${m.slaHoursLeft}시간** 남음)` : '';
      response += `${i + 1}. **"${m.subject}"**\n   발신: ${m.fromName || m.from}${sla}\n   요약: ${m.summary}\n\n`;
    });
  }

  const mostUrgent = urgent[0] || unread[0];
  const evidence = buildEvidence({
    '미읽음 수': `${unread.length}건`,
    '긴급 미처리': `${urgent.length}건`,
    '최우선 메일 SLA': mostUrgent?.slaHoursLeft ? `${mostUrgent.slaHoursLeft}시간` : '없음'
  });

  return { response, evidence };
}

/** 패턴 4: 회의 체크리스트 */
function getMeetingChecklistResponse() {
  const today      = new Date().toISOString().slice(0, 10);
  const todayMtgs  = calendarEvents.filter(e => e.type === 'meeting' && e.date === today);
  const redKpis    = getKpisWithStatus().filter(k => k.status !== 'green').slice(0, 2);
  const topTask    = getSortedTasks().find(t => !t.isDone);
  const urgentMail = mails.find(m => m.unread && m.priority === 'high' && !AppState.repliedMails?.has(m.id));

  let response = '';

  if (todayMtgs.length > 0) {
    response += `📅 **오늘 회의 (${todayMtgs.length}건)**:\n`;
    todayMtgs.forEach(m => { response += `• ${m.time || '시간 미정'} — ${m.title}\n`; });
    response += '\n';
  }

  response += `📋 **AI 회의 전 체크리스트**:\n\n`;

  let idx = 1;
  if (redKpis.length > 0) {
    redKpis.forEach(k => {
      response += `${idx++}. KPI **[${k.name}]** 현황 공유 — 현재 ${k.current}${k.unit} / 목표 ${k.target}${k.unit}\n`;
    });
  }
  if (topTask) {
    response += `${idx++}. 긴급 업무 **[${topTask.title}]** 진행 상태 보고 (${getDdayLabel(topTask.dueDate)})\n`;
  }
  if (urgentMail) {
    response += `${idx++}. 긴급 메일 **"${urgentMail.subject}"** 답변 여부 확인 (SLA ${urgentMail.slaHoursLeft}h)\n`;
  }
  response += `${idx++}. 이전 회의 액션 아이템 이행 여부 확인\n`;
  response += `${idx++}. 다음 마일스톤 일정 조율\n`;

  const evidence = buildEvidence({
    '오늘 회의': `${todayMtgs.length}건`,
    'KPI 경고': `${redKpis.length}건`,
    '긴급 메일': urgentMail ? '1건' : '없음'
  });

  return { response, evidence };
}

/** 패턴 5: Telegram 알림 */
function getTelegramResponse() {
  const top = getSortedTasks().filter(t => !t.isDone)[0];
  if (!top) {
    return { response: '현재 전송할 긴급 업무가 없습니다. 모든 업무가 완료된 상태입니다!', evidence: null };
  }

  // 실제 전송 시뮬레이션
  sendTelegramAlert('task', top.id);

  const evidence = buildEvidence({
    '전송 업무': top.title,
    '담당자': top.owner,
    '우선순위': `${top.priorityScore}점`,
    '마감': getDdayLabel(top.dueDate)
  });

  return {
    response: `✈️ **Telegram 알림이 전송되었습니다.**\n\n**전송 내용:**\n• 업무: ${top.title}\n• 담당: ${top.owner}\n• 마감: ${getDdayLabel(top.dueDate)}\n• 우선순위: ${top.priorityScore}점\n\n우측 패널 "Telegram 전송 로그"에서 전송 기록을 확인하세요.`,
    evidence
  };
}

/** 패턴 6: 병목 업무 */
function getBottleneckResponse() {
  const sorted = getSortedTasks().filter(t => !t.isDone && t.bottleneckScore >= 7);
  const highLoad = resources.filter(r => r.load >= 85).sort((a, b) => b.load - a.load);

  let response = '⚠️ **이번 주 병목 분석**:\n\n';

  if (sorted.length > 0) {
    response += `**병목 업무 (상위 ${Math.min(3, sorted.length)}건)**:\n`;
    sorted.slice(0, 3).forEach((t, i) => {
      response += `${i + 1}. **${t.title}** — 병목 점수 ${t.bottleneckScore}/10\n`;
      response += `   담당: ${t.owner} | ${getDdayLabel(t.dueDate)}\n\n`;
    });
  }

  if (highLoad.length > 0) {
    response += `**과부하 팀 (주요 원인)**:\n`;
    highLoad.slice(0, 3).forEach(r => {
      response += `• **${r.name}**: 업무 부하 ${r.load}%\n`;
      response += `  → ${r.aiNote}\n\n`;
    });
  }

  const topBottleneck = sorted[0];
  const evidence = buildEvidence({
    '병목 업무 수': `${sorted.length}건`,
    '최고 병목 점수': topBottleneck ? `${topBottleneck.bottleneckScore}/10` : 'N/A',
    '과부하 팀': `${highLoad.length}개`,
    '최고 부하': highLoad[0] ? `${highLoad[0].name} ${highLoad[0].load}%` : 'N/A'
  });

  return { response, evidence };
}

/** 패턴 7: 위험 프로젝트 */
function getDangerProjectsResponse() {
  const danger  = projects.filter(p => p.status === 'danger');
  const warning = projects.filter(p => p.status === 'warning');

  if (danger.length === 0 && warning.length === 0) {
    return { response: '✅ 현재 모든 프로젝트가 정상 진행 중입니다!', evidence: null };
  }

  let response = '📁 **프로젝트 위험 현황**:\n\n';

  if (danger.length > 0) {
    response += `🔴 **위험 (${danger.length}건)**:\n`;
    danger.forEach(p => {
      const relatedTeam = resources.find(r => r.name === p.team);
      const loadInfo = relatedTeam ? ` | 팀 부하 ${relatedTeam.load}%` : '';
      response += `• **${p.name}** (${p.team})\n`;
      response += `  진행률 ${p.progress}% | ${getDdayLabel(p.deadline)}${loadInfo}\n`;
      response += `  현재: ${p.currentStage} → 다음: ${p.nextStage}\n\n`;
    });
  }

  if (warning.length > 0) {
    response += `🟡 **주의 (${warning.length}건)**:\n`;
    warning.forEach(p => {
      response += `• **${p.name}** — 진행률 ${p.progress}% | ${getDdayLabel(p.deadline)}\n`;
    });
  }

  const evidence = buildEvidence({
    '위험 프로젝트': `${danger.length}건`,
    '주의 프로젝트': `${warning.length}건`,
    '최우선 대응': danger[0]?.name || warning[0]?.name || 'N/A'
  });

  return { response, evidence };
}

/** 패턴 8: 운영 상태 */
function getHealthScoreResponse() {
  const dangerProjects = projects.filter(p => p.status === 'danger').length;
  const warningProjects = projects.filter(p => p.status === 'warning').length;
  const urgentMails = mails.filter(m => m.unread && m.priority === 'high' && !AppState.repliedMails?.has(m.id)).length;
  const overloaded = resources.filter(r => r.load >= 90).length;
  const kpiAlerts = countKpiAlerts();

  let response = '📡 **전체 운영 상태 요약**\n\n';
  response += `• 위험 프로젝트: ${dangerProjects}건 / 주의 프로젝트: ${warningProjects}건\n`;
  response += `• KPI 경고: ${kpiAlerts}건\n`;
  response += `• 긴급 미처리 메일: ${urgentMails}건\n`;
  response += `• 리소스 과부하 팀: ${overloaded}개\n`;
  response += '\n**AI 권장 조치**:\n';
  response += '1. 위험 프로젝트와 KPI 경고를 Risk 메뉴에서 먼저 확인\n';
  response += '2. Comms 메뉴에서 긴급 메일 SLA 처리\n';
  response += '3. Tasks 메뉴에서 담당자 과부하 재배정 검토\n';

  const evidence = buildEvidence({
    '위험 프로젝트': `${dangerProjects}건`,
    'KPI 경고': `${kpiAlerts}건`,
    '긴급 메일': `${urgentMails}건`,
    '과부하 팀': `${overloaded}개`
  });

  return { response, evidence };
}

/** 패턴 9: 환율 */
function getExchangeRateResponse() {
  let response = '💱 **환율 현황 및 예산 영향**:\n\n';
  exchangeRates.forEach(e => {
    const dir   = e.change > 0 ? '▲ 상승' : '▼ 하락';
    const alert = Math.abs(e.change) >= e.alertThreshold ? ' ⚠️ 예산 영향 발생' : '';
    response += `• **${e.flag} ${e.currency}**: ${e.rate.toLocaleString()}원 (${dir} ${Math.abs(e.change)}%)${alert}\n`;
    response += `  → ${e.budgetImpact}\n\n`;
  });

  const usd = exchangeRates.find(e => e.currency === 'USD/KRW');
  const evidence = buildEvidence({
    'USD/KRW': usd ? `${usd.rate.toLocaleString()}원` : 'N/A',
    'USD 변동': usd ? `${usd.change > 0 ? '+' : ''}${usd.change}%` : 'N/A',
    '예산 영향': '확인 필요'
  });

  return { response, evidence };
}

/** 패턴 10: 브랜치 */
function getBranchResponse() {
  const highRisk = branches.filter(b => b.conflictRisk === 'high');
  let response = '🌿 **브랜치 현황 분석**:\n\n';

  if (highRisk.length > 0) {
    response += `🔴 **충돌 위험 브랜치 (${highRisk.length}건)**:\n`;
    highRisk.forEach(b => {
      response += `• **${b.name}** — PR ${b.prCount}건 대기 중\n`;
      response += `  최근: ${b.lastCommit}\n\n`;
    });
  }

  response += `**AI 병합 권장 순서**:\n`;
  branchMergeRecommendation.forEach((r, i) => {
    response += `${i + 1}. ${r}\n`;
  });

  const evidence = buildEvidence({
    '충돌 위험 브랜치': `${highRisk.length}건`,
    '전체 PR 대기': `${branches.reduce((s, b) => s + b.prCount, 0)}건`,
    '긴급 브랜치': branches.find(b=>b.status==='urgent')?.name || '없음'
  });

  return { response, evidence };
}

/** 패턴 11: 리소스 */
function getResourceResponse() {
  const overloaded = resources.filter(r => r.load >= 80).sort((a, b) => b.load - a.load);
  let response = '👥 **팀 리소스 현황**:\n\n';

  if (overloaded.length > 0) {
    response += `**과부하 팀 (${overloaded.length}개)**:\n`;
    overloaded.slice(0, 4).forEach(r => {
      const icon = r.load >= 95 ? '🔴' : '🟡';
      response += `${icon} **${r.name}**: ${r.load}%\n`;
      response += `  활성 ${r.activeTasks}건 | 긴급 ${r.urgentTasks}건\n`;
      response += `  💡 ${r.aiNote}\n\n`;
    });
  } else {
    response += '✅ 현재 모든 팀의 업무 부하가 적정 수준(80% 미만)입니다.\n\n';
  }

  const most = overloaded[0];
  const evidence = buildEvidence({
    '과부하 팀': `${overloaded.length}개`,
    '최고 부하': most ? `${most.name} ${most.load}%` : '없음',
    '재배정 권장': most?.aiNote?.slice(0, 30) + '...' || '없음'
  });

  return { response, evidence };
}

/** 기본 응답 */
function getDefaultResponse(originalMsg) {
  const kpiAlerts  = countKpiAlerts();
  const urgentTasks = getSortedTasks().filter(t => !t.isDone && t.urgency >= 8).length;
  const urgentMails = mails.filter(m => m.unread && m.priority === 'high' && !AppState.repliedMails?.has(m.id)).length;

  return {
    response: `현재 대시보드 데이터를 기준으로 분석 중입니다.\n\n현재 주요 현황:\n• 긴급 업무 **${urgentTasks}건** 대기\n• KPI 경고 **${kpiAlerts}건** 발생\n• 긴급 메일 **${urgentMails}건** 미처리\n\n프로젝트, KPI, 메일, 일정, 리소스 중 어떤 항목을 확인할까요?\n추천 질문을 눌러보세요!`,
    evidence: null
  };
}

/* =============================================
   7. Contextual Evidence 태그
============================================== */

/**
 * 근거 객체를 가독성 있는 문자열로 변환
 * @param {Object} obj - { 라벨: 값, ... }
 * @returns {string}
 */
function buildEvidence(obj) {
  return obj; // object passed directly to renderEvidenceCard
}

/* =============================================
   8. 채팅 초기화 버튼 (추가 기능)
============================================== */

/** 대화 기록 초기화 */
function clearChatHistory() {
  AppState.chatHistory = [];
  removeFromLocalStorage('chatHistory');
  const container = document.getElementById('chat-messages');
  if (container) container.innerHTML = '';
  appendBotMessage('대화 기록이 초기화되었습니다. 새롭게 시작해볼까요?', null, false);
  showToast('초기화 완료', '챗봇 대화 기록이 삭제되었습니다.', 'info', 2000);
}

/* =============================================
   9. Chat History LocalStorage
============================================== */

function saveChatHistory() {
  // 최근 40개 메시지만 유지 (메모리 절약)
  if (AppState.chatHistory.length > 40) {
    AppState.chatHistory = AppState.chatHistory.slice(-40);
  }
  saveToLocalStorage('chatHistory', AppState.chatHistory);
}
