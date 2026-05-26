/* ==============================================
   WorkOS AI Command Center — lawyer.js
   AI 변호사 (Korean Legal AI Assistant)
   Section Map:
   1.  탭 전환 & 초기화
   2.  메시지 렌더링
   3.  사용자 입력 처리
   4.  Typing animation
   5.  Rule-Based 법률 응답 엔진 (12+ 패턴)
   6.  법령 검색 모달 (Korean Law MCP 시뮬레이션)
   7.  법령 데이터베이스 (핵심 조문)
   8.  채팅 기록 LocalStorage
============================================== */

/* =============================================
   1. 탭 전환 & 초기화
============================================== */

const LawyerState = {
  history:     [],
  initialized: false
};

document.addEventListener('DOMContentLoaded', () => {
  initTabSwitch();
  initLawyerInputs();
});

function initTabSwitch() {
  document.querySelectorAll('.ai-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.ai-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.ai-tab-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('tab-panel-' + tab);
      if (panel) panel.classList.add('active');
      if (tab === 'lawyer' && !LawyerState.initialized) initLawyer();
    });
  });
}

function initLawyer() {
  LawyerState.initialized = true;
  const saved = loadFromLocalStorage('lawyerHistory') || [];
  LawyerState.history = saved;

  if (saved.length === 0) {
    appendLawyerBot(
      '안녕하세요! 저는 **WorkOS AI 변호사**입니다. ⚖️\n\n' +
      '행정업무 관련 법률 궁금증을 도와드립니다.\n\n' +
      '**주요 상담 분야:**\n' +
      '1. 근로기준법 (초과근무·연차·해고)\n' +
      '2. 개인정보보호법 (데이터 처리)\n' +
      '3. 전자문서법 (전자결재 효력)\n' +
      '4. 직장 내 괴롭힘 금지\n' +
      '5. 계약 및 용역 협약\n\n' +
      '아래 빠른 질문을 눌러보거나 직접 입력해보세요!',
      null, false
    );
  } else {
    saved.forEach(msg => {
      if (msg.role === 'user') appendLawyerUser(msg.text, false);
      else appendLawyerBot(msg.text, msg.evidence, false);
    });
    scrollLawyerToBottom();
  }
}

function initLawyerInputs() {
  const input   = document.getElementById('lawyer-input');
  const sendBtn = document.getElementById('lawyer-send-btn');
  sendBtn?.addEventListener('click', handleLawyerSend);
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleLawyerSend(); }
  });
  document.querySelectorAll('.chip--law').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.lq;
      const inp = document.getElementById('lawyer-input');
      if (q && inp) { inp.value = q; handleLawyerSend(); }
    });
  });
}

/* =============================================
   2. 메시지 렌더링
============================================== */

function appendLawyerUser(text, save = true) {
  const container = document.getElementById('lawyer-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.innerHTML = '<div class="chat-bubble">' + escHtml(text) + '</div>';
  container.appendChild(div);
  scrollLawyerToBottom();
  if (save) { LawyerState.history.push({ role: 'user', text }); saveLawyerHistory(); }
}

function appendLawyerBot(text, evidence, save) {
  if (save === undefined) save = true;
  const container = document.getElementById('lawyer-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'chat-msg bot lawyer-bot';
  div.innerHTML =
    '<div class="chat-bubble lawyer-bubble">' + formatLawyerText(text) + '</div>' +
    (evidence ? renderLawCitationCard(evidence) : '');
  container.appendChild(div);
  scrollLawyerToBottom();
  if (save) { LawyerState.history.push({ role: 'bot', text, evidence }); saveLawyerHistory(); }
}

function formatLawyerText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/^(\d+\.)/gm, '<span style="color:var(--law-gold);font-weight:700;">$1</span>');
}

function scrollLawyerToBottom() {
  const c = document.getElementById('lawyer-messages');
  if (c) c.scrollTop = c.scrollHeight;
}

function renderLawCitationCard(citation) {
  if (!citation || typeof citation !== 'object') return '';
  const items = Object.entries(citation).map(function(e) {
    return '<div class="law-cite-row">' +
      '<span class="law-cite-key">' + escHtml(e[0]) + '</span>' +
      '<span class="law-cite-val">' + escHtml(String(e[1])) + '</span>' +
      '</div>';
  }).join('');
  return '<div class="law-cite-card">' +
    '<div class="law-cite-header">' +
      '<span class="law-cite-icon">⚖️</span>' +
      '<span class="law-cite-title">법령 근거</span>' +
      '<span class="law-cite-badge">법제처</span>' +
    '</div>' +
    '<div class="law-cite-body">' + items + '</div>' +
    '</div>';
}

/* =============================================
   3. 사용자 입력 처리
============================================== */

function handleLawyerSend() {
  const input = document.getElementById('lawyer-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  appendLawyerUser(text);
  showLawyerTyping();
  const delay = 700 + Math.random() * 600;
  setTimeout(function() {
    hideLawyerTyping();
    const res = getLawyerResponse(text);
    appendLawyerBot(res.response, res.citation);
  }, delay);
}

/* =============================================
   4. Typing Animation
============================================== */

function showLawyerTyping() {
  const container = document.getElementById('lawyer-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'chat-msg bot lawyer-bot';
  div.id = 'lawyer-typing';
  div.innerHTML = '<div class="chat-bubble lawyer-bubble">' +
    '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>' +
    '</div>';
  container.appendChild(div);
  scrollLawyerToBottom();
}

function hideLawyerTyping() {
  const el = document.getElementById('lawyer-typing');
  if (el) el.remove();
}

/* =============================================
   5. Rule-Based 법률 응답 엔진
============================================== */

function getLawyerResponse(text) {
  const q = text.toLowerCase();
  if (/초과근무|연장근로|야근|overtime|추가 근무/.test(q))        return responseOvertimePay();
  if (/연차|연차유급|휴가|annual leave/.test(q))                   return responseAnnualLeave();
  if (/해고|징계|면직|정리해고|권고사직/.test(q))                  return responseDismissal();
  if (/개인정보|privacy|동의|정보보호|pipa/.test(q))               return responsePrivacy();
  if (/전자결재|전자서명|전자문서|디지털 서명/.test(q))            return responseElectronicApproval();
  if (/괴롭힘|갑질|harassment|따돌림|폭언/.test(q))               return responseWorkplaceHarassment();
  if (/계약|용역|협약|계약서|외주|위탁|조달/.test(q))             return responseContract();
  if (/임금|급여|수당|월급|최저임금|wage/.test(q))                return responseWage();
  if (/산재|산업재해|업무상 재해/.test(q))                         return responseIndustrialAccident();
  if (/공문서|행정절차|처분|이의신청|행정심판/.test(q))            return responseAdminProcedure();
  if (/저작권|copyright|저작물|지식재산/.test(q))                 return responseCopyright();
  if (/비밀|기밀|보안|nda|정보유출/.test(q))                      return responseSecrecy();
  if (/법령|법 찾아|조문|검색/.test(q))                           return responseLawSearch();
  return responseFallback(text);
}

/* =============================================
   6. 개별 응답 함수 (법령 데이터베이스)
============================================== */

function responseOvertimePay() {
  return {
    response:
      '**연장근로(초과근무) 수당 규정** — 근로기준법 제56조\n\n' +
      '1. **연장근로**: 1일 8h·주 40h 초과 시 통상임금의 **50% 가산** 지급 의무\n' +
      '2. **야간근로**: 오후 10시~오전 6시 근무 시 50% 가산\n' +
      '3. **휴일근로**: 8시간 이내 50%, 8시간 초과 100% 가산\n\n' +
      '**사용자 의무사항**:\n' +
      '- 연장근로는 주 12시간 한도 (근로기준법 제53조)\n' +
      '- 근로자 동의 없이 강제 연장 불가\n' +
      '- 위반 시 2년↓ 징역 또는 2천만원↓ 벌금\n\n' +
      '**실무 팁**: 포괄임금제 적용 시에도 실제 연장근로 시간이 포괄 범위 초과 시 추가 지급 필요',
    citation: {
      '적용 법령': '근로기준법',
      '핵심 조문': '제56조 (연장·야간 및 휴일 근로)',
      '가산율': '연장/야간/휴일 각 50% (휴일 8h 초과 100%)',
      '위반 제재': '2년↓ 징역 또는 2천만원↓ 벌금',
      '시행일': '1953.05.10 (최종 개정 2021.11.19)'
    }
  };
}

function responseAnnualLeave() {
  return {
    response:
      '**연차 유급휴가 규정** — 근로기준법 제60조\n\n' +
      '**1년 미만 근로자**:\n' +
      '- 1개월 개근 시 1일 유급휴가 발생\n\n' +
      '**1년 이상 근로자**:\n' +
      '- 1년간 80% 이상 출근 시 **15일** 유급휴가\n' +
      '- 3년 이상 근속 시 매 2년마다 **1일 추가** (최대 25일)\n\n' +
      '**계산 공식**: 15일 + Math.floor((근속연수 - 1) / 2)\n\n' +
      '**미사용 시**: 연차 사용 촉진 조치 없으면 **연차미사용수당** 지급 의무\n' +
      '수당 = 통상임금 × 미사용 일수',
    citation: {
      '적용 법령': '근로기준법',
      '핵심 조문': '제60조 (연차 유급휴가)',
      '기본 발생': '1년 80% 이상 출근 시 15일',
      '추가 발생': '3년 이상 근속 시 매 2년마다 1일 (최대 25일)',
      '미사용 수당': '통상임금 × 미사용 일수'
    }
  };
}

function responseDismissal() {
  return {
    response:
      '**해고 및 징계 관련 규정** — 근로기준법 제23조\n\n' +
      '**정당한 해고 요건** (모두 충족):\n' +
      '1. **정당한 이유** — 업무 능력 미달, 중대 규율 위반 등\n' +
      '2. **30일 전 서면 예고** 또는 30일분 통상임금 지급\n' +
      '3. **서면 통지** — 해고 사유·시기 명시\n\n' +
      '**부당해고 구제절차**:\n' +
      '- 해고일로부터 **3개월 이내** 노동위원회에 구제신청\n' +
      '- 원직 복직 또는 해고기간 임금 상당액 지급 명령 가능\n\n' +
      '**절대 금지**: 육아휴직·산전후휴가 기간 중, 업무상 재해 치료기간 중 해고',
    citation: {
      '적용 법령': '근로기준법',
      '핵심 조문': '제23조 (해고 등의 제한), 제26조 (해고 예고)',
      '예고 기간': '해고 30일 전 서면 예고 또는 30일분 임금',
      '구제 기간': '해고일로부터 3개월 이내 노동위원회 신청',
      '부당해고 구제': '원직 복직 또는 임금 상당액 지급'
    }
  };
}

function responsePrivacy() {
  return {
    response:
      '**개인정보보호법 주요 의무사항**\n\n' +
      '**수집·이용 원칙** (제15조):\n' +
      '1. 정보주체 동의 획득\n' +
      '2. 수집 목적·항목·보유기간 고지 의무\n' +
      '3. **최소 수집 원칙** — 목적에 필요한 최소한만\n\n' +
      '**직원 개인정보 처리 시 주의사항**:\n' +
      '- CCTV: 사전 안내판 필수, 30일 이상 보관 금지\n' +
      '- 업무 메일 모니터링: 개인정보 영향평가 필요\n' +
      '- 퇴직자 정보: 고용 관계 종료 후 5년 보관 후 파기\n\n' +
      '**위반 제재**:\n' +
      '- 법정 과징금: 위반행위 관련 매출액의 3% 이하\n' +
      '- 형사벌칙: 5년↓ 징역 또는 5천만원↓ 벌금',
    citation: {
      '적용 법령': '개인정보 보호법',
      '핵심 조문': '제15조 (개인정보의 수집·이용)',
      '최소 수집': '목적 달성에 필요한 최소한의 개인정보만',
      '보유기간': '수집 목적 달성 후 지체 없이 파기',
      '과징금': '위반행위 관련 매출액의 3% 이하'
    }
  };
}

function responseElectronicApproval() {
  return {
    response:
      '**전자결재·전자문서 법적 효력**\n\n' +
      '**전자문서의 법적 효력** (전자문서법 제4조):\n' +
      '- 서면 문서와 동일한 법적 효력 인정\n' +
      '- 전자적 형태만으로 작성·전달·보관 가능\n\n' +
      '**전자서명 요건** (전자서명법 제3조):\n' +
      '1. 서명자 신원 확인 가능\n' +
      '2. 서명 후 내용 변조 여부 확인 가능\n\n' +
      '**행정기관 전자결재** (전자정부법 제18조):\n' +
      '- 업무 처리는 전자문서로 하는 것이 원칙\n' +
      '- 전자이미지서명, 행정전자서명 모두 유효\n\n' +
      '**보존기간**: 문서 유형별 1~30년 (공공기록물 관리법)',
    citation: {
      '적용 법령': '전자문서 및 전자거래 기본법, 전자서명법',
      '핵심 조문': '전자문서법 제4조, 전자서명법 제3조',
      '법적 효력': '서면 문서와 동등한 효력',
      '행정전자서명': '전자정부법 제18조에 따라 공식 인정',
      '보존 의무': '공공기록물 관리에 관한 법률 적용'
    }
  };
}

function responseWorkplaceHarassment() {
  return {
    response:
      '**직장 내 괴롭힘 금지 규정** — 근로기준법 제76조의2\n\n' +
      '**직장 내 괴롭힘 정의**:\n' +
      '직위·관계 우위를 이용해 업무상 적정 범위를 넘어\n' +
      '신체적·정신적 고통을 주거나 근무환경을 악화시키는 행위\n\n' +
      '**회사 의무** (제76조의3):\n' +
      '1. 신고 접수 즉시 사실 확인 조사 개시\n' +
      '2. 피해자 보호 조치 (배치 전환, 유급휴가 등)\n' +
      '3. 가해자 징계·전보 등 적절 조치\n' +
      '4. **비밀 유지 의무** — 조사 내용 제3자 누설 금지\n\n' +
      '**불이익 처우 금지**: 신고를 이유로 해고 시 **3년↓ 징역 또는 3천만원↓ 벌금**\n\n' +
      '**신고처**: 관할 고용노동청, 국가인권위원회',
    citation: {
      '적용 법령': '근로기준법',
      '핵심 조문': '제76조의2 (직장 내 괴롭힘의 금지)',
      '조사 의무': '신고 즉시 사실 확인 조사 개시',
      '피해자 보호': '유급휴가 부여, 배치 전환 등 즉시 보호 조치',
      '불이익 제재': '3년↓ 징역 또는 3천만원↓ 벌금'
    }
  };
}

function responseContract() {
  return {
    response:
      '**용역·외주 계약 검토 핵심 포인트**\n\n' +
      '**필수 기재 사항** (국가계약법·민법):\n' +
      '1. 계약 당사자, 목적물, 계약금액 명시\n' +
      '2. 이행 기간 및 납품 조건\n' +
      '3. **지체상금 조항**: 계약금액 × 지체일수 × 1/1000\n' +
      '4. 계약 해지 조건 및 절차\n' +
      '5. 손해배상 및 분쟁 해결 조항\n\n' +
      '**공공기관 계약 주의사항**:\n' +
      '- 입찰 공고 기간 준수 (7일 이상)\n' +
      '- 하도급 계약 시 대금 직불제 활용\n\n' +
      '**전자계약**: 조달청 나라장터 전자계약 시 법적 효력 동일',
    citation: {
      '적용 법령': '국가를 당사자로 하는 계약에 관한 법률',
      '핵심 조문': '제12조 (계약서의 작성 및 계약 보증금)',
      '지체상금율': '계약금액 × 지체일수 × 1/1000',
      '공공입찰': '입찰공고 7일 이상 전 공고 의무',
      '분쟁 해결': '조달청 계약분쟁조정위원회 신청 가능'
    }
  };
}

function responseWage() {
  return {
    response:
      '**임금·수당 관련 규정**\n\n' +
      '**2026년 최저임금**: 시간당 **10,030원**\n' +
      '(월 환산: 10,030 × 209시간 = 2,096,270원)\n\n' +
      '**임금 지급 원칙** (근로기준법 제43조):\n' +
      '1. **통화 지급**: 현금 또는 지정 계좌 이체\n' +
      '2. **직접 지급**: 본인에게 직접\n' +
      '3. **전액 지급**: 법령·단체협약 근거 없이 공제 불가\n' +
      '4. **정기 지급**: 매월 1회 이상 일정 날짜\n\n' +
      '**임금체불 시 구제방법**:\n' +
      '- 관할 고용노동청 진정 → 체불 사업주 형사처벌\n' +
      '- 임금채권보장법에 따른 체당금 지급 신청 가능',
    citation: {
      '적용 법령': '근로기준법, 최저임금법',
      '2026 최저임금': '10,030원/시간 (월 2,096,270원)',
      '핵심 조문': '근로기준법 제43조 (임금 지급)',
      '체불 처벌': '3년↓ 징역 또는 3천만원↓ 벌금',
      '구제 신청': '관할 고용노동청 진정 또는 소액 심판'
    }
  };
}

function responseIndustrialAccident() {
  return {
    response:
      '**산업재해 처리 절차** — 산업재해보상보험법\n\n' +
      '**산재 인정 요건**:\n' +
      '- 업무수행 중 또는 업무에 기인한 부상·질병·사망\n' +
      '- 출퇴근 재해도 산재 인정 (2018.01 이후)\n\n' +
      '**처리 절차**:\n' +
      '1. 즉시 의료기관 응급처치\n' +
      '2. 사업주에게 산재 발생 보고\n' +
      '3. **요양급여 신청**: 근로복지공단 (치료비 전액)\n' +
      '4. **휴업급여**: 평균임금의 **70%** (요양 기간 중)\n' +
      '5. 장해가 남은 경우: 장해보상 연금/일시금\n\n' +
      '**사업주 의무**: 산재 발생 즉시 고용노동부 신고\n' +
      '은폐 시 1,500만원 이하 과태료',
    citation: {
      '적용 법령': '산업재해보상보험법',
      '핵심 조문': '제40조 (요양급여), 제52조 (휴업급여)',
      '요양급여': '업무상 재해 치료비 전액 지급',
      '휴업급여': '평균임금의 70% (요양 기간 중)',
      '신고 기한': '산재 발생 즉시 (1일 이내) 고용부 신고'
    }
  };
}

function responseAdminProcedure() {
  return {
    response:
      '**행정절차법 주요 원칙**\n\n' +
      '**처분 절차** (행정절차법 제21조·제23조):\n' +
      '1. **사전 통지**: 처분 전 당사자에게 의견 제출 기회 부여\n' +
      '2. **이유 제시**: 처분 이유를 구체적으로 기재한 서면 통지\n' +
      '3. **청문**: 중대한 이해관계 있는 경우 청문 실시\n\n' +
      '**행정심판 청구** (행정심판법 제27조):\n' +
      '- 처분이 있음을 안 날부터 **90일 이내** 청구\n' +
      '- 처분이 있은 날부터 **180일 이내** 청구\n\n' +
      '**행정소송** (행정소송법 제20조):\n' +
      '- 처분을 안 날부터 **90일 이내**, 처분일부터 **1년 이내** 제소',
    citation: {
      '적용 법령': '행정절차법, 행정심판법, 행정소송법',
      '핵심 조문': '행정절차법 제21조 (처분의 사전 통지)',
      '행정심판': '처분 안 날부터 90일 이내',
      '행정소송': '처분 안 날부터 90일, 처분일부터 1년 이내',
      '이유 제시': '처분 서면에 구체적 이유 기재 의무'
    }
  };
}

function responseCopyright() {
  return {
    response:
      '**업무상 저작물 귀속** — 저작권법 제9조\n\n' +
      '**업무상 저작물이란**:\n' +
      '법인·단체 기획하에 법인 명의로 공표한 저작물\n\n' +
      '**저작권 귀속 원칙**:\n' +
      '- 업무상 작성한 문서·보고서·PPT 등: **법인(회사)에 귀속**\n' +
      '- 근로계약서에 별도 규정 없으면 법 원칙 적용\n\n' +
      '**예외 — 직원 개인 귀속**:\n' +
      '1. 업무와 무관한 개인 창작물\n' +
      '2. 취업규칙·계약에서 달리 정한 경우\n\n' +
      '**AI 생성 결과물**:\n' +
      '- AI 단독 생성물은 저작권 보호 대상 아님\n' +
      '- 인간의 창작적 기여가 있는 경우에만 저작권 발생',
    citation: {
      '적용 법령': '저작권법',
      '핵심 조문': '제9조 (업무상 저작물의 저작자)',
      '귀속 원칙': '법인 기획·명의 공표 시 법인에 저작권 귀속',
      '보호 기간': '공표 후 70년',
      'AI 생성물': '인간 창작 기여 없으면 저작권 보호 불인정'
    }
  };
}

function responseSecrecy() {
  return {
    response:
      '**업무상 비밀·기밀 보호 규정**\n\n' +
      '**영업비밀 정의** (부정경쟁방지법 제2조):\n' +
      '비밀 유지 노력 + 경제적 유용성 + 공연히 알려지지 않은 정보\n\n' +
      '**직원 의무사항**:\n' +
      '1. 재직 중: 취업규칙·근로계약의 비밀유지의무 준수\n' +
      '2. **퇴직 후**: 3년간 경업금지 및 비밀유지 의무\n' +
      '3. 영업비밀 침해 시 **10년↓ 징역 또는 5억원↓ 벌금**\n\n' +
      '**회사 보호 조치**:\n' +
      '- 문서에 대외비/Confidential 표시\n' +
      '- 접근 권한 관리(로그 기록)\n' +
      '- 퇴직자 NDA 체결 및 반납 확인',
    citation: {
      '적용 법령': '부정경쟁방지 및 영업비밀 보호에 관한 법률',
      '핵심 조문': '제2조 (정의), 제18조 (벌칙)',
      '퇴직 후 의무': '3년간 경업금지·비밀유지 의무',
      '형사 처벌': '10년↓ 징역 또는 5억원↓ 벌금',
      '민사 구제': '손해배상·비밀침해금지 청구 가능'
    }
  };
}

function responseLawSearch() {
  return {
    response:
      '**법령 검색 방법 안내**\n\n' +
      '**무료 법령 검색 서비스**:\n' +
      '1. **법제처 국가법령정보센터**: law.go.kr\n' +
      '2. **대법원 판례 검색**: supreme.court.go.kr\n' +
      '3. **고용노동부**: moel.go.kr\n\n' +
      '**상단의 "📖 법령 검색" 버튼**을 눌러 키워드로 직접 검색할 수 있습니다.\n\n' +
      '어떤 법령을 찾으시나요? 더 구체적인 키워드를 알려주시면 안내해 드리겠습니다.',
    citation: null
  };
}

function responseFallback(text) {
  return {
    response:
      '"**' + escHtml(text) + '**" 관련 법률 정보를 검토했습니다.\n\n' +
      '더 정확한 법령 안내를 위해 아래 항목 중 하나를 선택하거나\n' +
      '구체적인 질문을 입력해 주세요:\n\n' +
      '• 초과근무 및 수당 문의\n' +
      '• 연차·휴가 관련 질문\n' +
      '• 해고·징계 관련 문의\n' +
      '• 개인정보보호법 관련\n' +
      '• 계약·용역 검토 요청\n\n' +
      '또는 **"📖 법령 검색"** 버튼으로 원하는 법령을 직접 찾아보세요.',
    citation: null
  };
}

/* =============================================
   7. 법령 검색 모달 (Korean Law MCP 시뮬레이션)
============================================== */

const LAW_DB = [
  {
    law: '근로기준법', article: '제50조', title: '근로시간',
    content: '1주간 근로시간은 휴게시간을 제외하고 40시간을 초과할 수 없다. 1일 근로시간은 휴게시간을 제외하고 8시간을 초과할 수 없다.',
    tags: ['근로시간', '8시간', '40시간', '주40시간']
  },
  {
    law: '근로기준법', article: '제56조', title: '연장·야간 및 휴일 근로',
    content: '사용자는 연장근로·야간근로(오후 10시부터 오전 6시 사이) 및 휴일근로에 대하여 통상임금의 100분의 50 이상을 가산하여 근로자에게 지급하여야 한다.',
    tags: ['연장근로', '야근', '초과수당', '50%가산', '야간수당']
  },
  {
    law: '근로기준법', article: '제60조', title: '연차 유급휴가',
    content: '사용자는 1년간 80퍼센트 이상 출근한 근로자에게 15일의 유급휴가를 주어야 한다. 3년 이상 계속 근로한 근로자에게는 최초 1년을 초과하는 계속 근로 연수 매 2년에 대하여 1일을 가산한 유급휴가를 주어야 한다.',
    tags: ['연차', '유급휴가', '15일', '연차계산']
  },
  {
    law: '근로기준법', article: '제23조', title: '해고 등의 제한',
    content: '사용자는 근로자에게 정당한 이유 없이 해고, 휴직, 정직, 전직, 감봉, 그 밖의 징벌을 하지 못한다.',
    tags: ['해고', '정당한이유', '징계', '부당해고']
  },
  {
    law: '근로기준법', article: '제76조의2', title: '직장 내 괴롭힘의 금지',
    content: '사용자 또는 근로자는 직장에서의 지위 또는 관계 등의 우위를 이용하여 업무상 적정 범위를 넘어 다른 근로자에게 신체적·정신적 고통을 주거나 근무환경을 악화시키는 행위를 하여서는 아니 된다.',
    tags: ['직장내괴롭힘', '갑질', '따돌림', '폭언', 'harassment']
  },
  {
    law: '개인정보 보호법', article: '제15조', title: '개인정보의 수집·이용',
    content: '개인정보처리자는 정보주체의 동의를 받은 경우, 법률에 특별한 규정이 있는 경우 등에 해당하는 경우에만 개인정보를 수집할 수 있으며, 그 수집 목적의 범위에서 이용할 수 있다.',
    tags: ['개인정보', '수집', '동의', 'PIPA', '개인정보보호']
  },
  {
    law: '개인정보 보호법', article: '제29조', title: '안전조치 의무',
    content: '개인정보처리자는 개인정보가 분실·도난·유출·위조·변조 또는 훼손되지 아니하도록 내부 관리계획 수립, 접속기록 보관 등 안전성 확보에 필요한 기술적·관리적 및 물리적 조치를 하여야 한다.',
    tags: ['개인정보', '보안', '안전조치', '데이터보호']
  },
  {
    law: '전자문서 및 전자거래 기본법', article: '제4조', title: '전자문서의 효력',
    content: '전자문서는 다른 법률에 특별한 규정이 있는 경우를 제외하고는 전자적 형태로 되어 있다는 이유만으로 문서로서의 효력이 부인되지 아니한다.',
    tags: ['전자문서', '전자결재', '전자서명', '법적효력']
  },
  {
    law: '최저임금법', article: '제6조', title: '최저임금의 효력',
    content: '사용자는 최저임금의 적용을 받는 근로자에게 최저임금액 이상의 임금을 지급하여야 한다. (2026년 최저임금: 시간당 10,030원)',
    tags: ['최저임금', '임금', '급여', '2026년최저임금']
  },
  {
    law: '산업재해보상보험법', article: '제40조', title: '요양급여',
    content: '근로자가 업무상의 사유로 부상을 당하거나 질병에 걸린 경우에는 그 근로자에게 요양으로 지급한다. 요양급여는 의료기관에서 요양을 하게 한다.',
    tags: ['산재', '산업재해', '요양급여', '업무상재해']
  },
  {
    law: '행정절차법', article: '제21조', title: '처분의 사전 통지',
    content: '행정청은 당사자에게 의무를 부과하거나 권익을 제한하는 처분을 하는 경우에는 미리 처분의 제목, 당사자의 성명과 주소, 처분하려는 원인이 되는 사실과 처분의 내용 및 법적 근거, 의견 제출 기한을 당사자 등에게 통지하여야 한다.',
    tags: ['행정절차', '처분', '사전통지', '행정청']
  },
  {
    law: '부정경쟁방지 및 영업비밀 보호에 관한 법률', article: '제2조', title: '정의',
    content: '영업비밀이란 공연히 알려져 있지 아니하고 독립된 경제적 가치를 가지는 것으로서 비밀로 관리된 생산방법, 판매방법, 그 밖에 영업 활동에 유용한 기술상 또는 경영상의 정보를 말한다.',
    tags: ['영업비밀', '기밀', 'NDA', '비밀유지', '보안']
  }
];

function openLawSearchModal() {
  const modal = document.getElementById('law-search-modal');
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(function() { document.getElementById('law-search-input')?.focus(); }, 100);
  }
}

function closeLawSearchModal() {
  document.getElementById('law-search-modal')?.classList.add('hidden');
}

function runLawSearch() {
  const input  = document.getElementById('law-search-input');
  const result = document.getElementById('law-search-result');
  if (!input || !result) return;
  const query = input.value.trim().toLowerCase();
  if (!query) return;

  const matches = LAW_DB.filter(function(e) {
    return e.law.toLowerCase().includes(query) ||
      e.article.toLowerCase().includes(query) ||
      e.title.toLowerCase().includes(query) ||
      e.content.toLowerCase().includes(query) ||
      e.tags.some(function(t) { return t.toLowerCase().includes(query); });
  });

  if (matches.length === 0) {
    result.innerHTML =
      '<div style="text-align:center;padding:20px;color:var(--text-muted);">' +
      '<div style="font-size:24px;margin-bottom:8px;">🔍</div>' +
      '<p>"' + escHtml(query) + '"에 해당하는 법령을 찾지 못했습니다.</p>' +
      '<p style="font-size:11px;margin-top:4px;">법제처 국가법령정보센터에서 직접 검색해 보세요.</p>' +
      '<a href="https://www.law.go.kr" target="_blank" class="btn btn--ghost btn--sm" style="margin-top:12px;display:inline-block;">' +
      '법제처에서 검색 →</a></div>';
    return;
  }

  result.innerHTML = matches.map(function(m) {
    var safeArticle = escHtml(m.article);
    var safeTitle = escHtml(m.title);
    var safeLaw = escHtml(m.law);
    var safeContent = escHtml(m.content);
    var tagHtml = m.tags.slice(0, 4).map(function(t) {
      return '<span class="law-tag">#' + escHtml(t) + '</span>';
    }).join('');
    var chatText = safeLaw + ' ' + safeArticle + ' ' + safeTitle;
    return '<div class="law-result-item" onclick="insertLawToChat(\'' + chatText.replace(/'/g, "\\'") + '\')">' +
      '<div class="law-result-header">' +
        '<span class="law-result-law">' + safeLaw + '</span>' +
        '<span class="law-result-article">' + safeArticle + '</span>' +
        '<span class="law-result-title">' + safeTitle + '</span>' +
      '</div>' +
      '<div class="law-result-content">' + safeContent + '</div>' +
      '<div class="law-result-tags">' + tagHtml + '</div>' +
      '</div>';
  }).join('');
}

function insertLawToChat(lawText) {
  closeLawSearchModal();
  var inp = document.getElementById('lawyer-input');
  if (inp) {
    inp.value = lawText + '에 대해 자세히 설명해줘';
    handleLawyerSend();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('law-search-input')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') runLawSearch();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.getElementById('law-search-modal')?.classList.add('hidden');
    }
  });
});

/* =============================================
   8. 채팅 기록 LocalStorage
============================================== */

function saveLawyerHistory() {
  if (LawyerState.history.length > 40) {
    LawyerState.history = LawyerState.history.slice(-40);
  }
  saveToLocalStorage('lawyerHistory', LawyerState.history);
}

function clearLawyerHistory() {
  LawyerState.history = [];
  removeFromLocalStorage('lawyerHistory');
  var container = document.getElementById('lawyer-messages');
  if (container) container.innerHTML = '';
  appendLawyerBot('대화 기록이 초기화되었습니다. 법률 질문을 다시 입력해보세요! ⚖️', null, false);
  if (typeof showToast === 'function') {
    showToast('초기화 완료', 'AI 변호사 대화 기록이 삭제되었습니다.', 'info', 2000);
  }
}