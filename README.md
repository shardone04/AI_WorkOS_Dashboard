# 🖥️ AI WorkOS Dashboard

<div align="center">

![WorkOS Banner](https://img.shields.io/badge/WorkOS-AI%20Command%20Center-00e5ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNVYzbC0xMCA1TDIgM3YxNHoiLz48L3N2Zz4=)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Claude API](https://img.shields.io/badge/Claude_API-Sonnet_4.5-d97706?style=for-the-badge&logo=anthropic&logoColor=white)
![Railway](https://img.shields.io/badge/Deployed_on-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

**기업 운영을 위한 AI 기반 통합 대시보드**  
Claude AI · Google OAuth · 실시간 데이터 · 팀 협업 도구를 하나의 화면에서

[🚀 라이브 데모](https://aiworkosdashboard-production.up.railway.app) · [📋 기능 소개](#-주요-기능) · [⚙️ 설치 방법](#️-설치-및-실행)

</div>

---

## 📌 프로젝트 소개

AI WorkOS Dashboard는 기업 운영에 필요한 모든 도구를 하나의 인터페이스로 통합한 **AI 기반 업무 지원 플랫폼**입니다.  
Claude AI를 핵심 엔진으로 사용하여 업무 분석, 맛집 추천, 회의 요약 등 다양한 기능을 실시간으로 제공합니다.

---

## ✨ 주요 기능

### 🤖 AI 기능 (Claude API)
| 기능 | 설명 |
|------|------|
| **AI Copilot** | 대시보드 데이터 기반 업무 인사이트 및 액션 플랜 제안 |
| **AI 변호사** | 한국 법률 기반 업무 법률 상담 (실제 법률 조언 아님) |
| **Meeting AI** | 회의 내용 입력 시 Claude가 Markdown 회의록 자동 생성 |
| **맛집 추천** | 위치·카테고리 기반 Claude AI 맛집 3곳 추천 |

### 📊 대시보드
| 기능 | 설명 |
|------|------|
| **Overview** | KPI 요약, 환율 모니터, 팀 현황 한눈에 확인 |
| **Projects** | 프로젝트 진행률, 마감 D-day, 의사결정 로그 |
| **Risk & Issues** | 리스크 매트릭스, 시나리오 시뮬레이션 |
| **Shared Expense** | Google Sheets 연동 공동 경비 관리 |
| **KPI / 결산** | 목표 대비 실적, 일일·월간 결산 트렌드 |

### 🔗 외부 서비스 연동
- **Google OAuth 2.0** — 실제 Google 계정 로그인
- **Slack Webhook** — 팀 채팅 메시지 실시간 전송
- **Google Sheets** — 경비 데이터 실시간 동기화
- **Gmail Automation** — 일일 결산 메일 자동 발송 (Apps Script)

### 🛠️ 기타 도구
- 힐링 플레이어, 포스트잇 보드, Presentation Demo 모드
- 다크 / 라이트 테마 전환
- 관리자 콘솔 (팀원 권한 관리)

---

## 🚀 설치 및 실행

### 로컬 실행

```bash
# 저장소 클론
git clone https://github.com/shardone04/AI_WorkOS_Dashboard.git
cd AI_WorkOS_Dashboard

# 의존성 설치
npm install

# 서버 실행
npm start
# → http://localhost:3000
```

### 환경변수 설정 (선택)

`.env` 파일 또는 Railway Variables에 설정합니다. **없어도 Demo 모드로 동작합니다.**

```env
# AI (필수 권장)
ANTHROPIC_API_KEY=sk-ant-...       # Claude AI 전 기능 활성화

# 선택 사항
GOOGLE_CLIENT_ID=...               # Google OAuth 로그인
OPENAI_API_KEY=sk-...              # 회의 음성 전사 (현재 미사용)
SLACK_WEBHOOK_URL=https://...      # Slack 메시지 전송
GOOGLE_SHEETS_CSV_URL=https://...  # 경비 데이터 실시간 연동
GMAIL_WEBHOOK_URL=https://...      # 일일 결산 메일 발송
ADMIN_PASSCODE=your-password       # 관리자 비밀번호 (기본값: ADMIN-2026)
```

---

## 🌐 Railway 배포

1. [railway.app](https://railway.app) → **Deploy from GitHub repo** → 이 저장소 선택
2. **Variables** 탭에 `ANTHROPIC_API_KEY` 입력
3. **Settings → Networking → Generate Domain** 으로 공개 URL 발급
4. Google OAuth 사용 시: Google Cloud Console에서 해당 URL을 **승인된 JavaScript 원본**에 추가

---

## 🗂️ 프로젝트 구조

```
workOS/
├── server.js            # Node.js HTTP 서버 + API 엔드포인트
├── index.html           # 단일 페이지 앱 (SPA)
├── css/
│   └── style.css        # 전체 스타일 (다크/라이트 테마)
├── js/
│   ├── integrations.js  # 메인 통합 로직 (Google Auth, API 연동)
│   ├── chatbot.js       # AI Copilot 챗봇
│   ├── lawyer.js        # AI 변호사
│   ├── dashboard.js     # 대시보드 렌더링
│   ├── data.js          # 샘플 데이터
│   ├── presentation.js  # 프레젠테이션 데모 모드
│   └── riskEngine.js    # 리스크 분석 엔진
├── apps-script/
│   └── gmail-webhook.gs # Gmail 자동화 Apps Script
└── sample-data/         # 샘플 CSV / Excel 파일
```

---

## 🔌 API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/api/health` | 서버 상태 확인 |
| `GET` | `/api/config` | 활성화된 기능 목록 |
| `POST` | `/api/claude/chat` | AI Copilot / AI 변호사 |
| `POST` | `/api/claude/lunch` | Claude AI 맛집 추천 |
| `POST` | `/api/claude/meeting-summary` | Claude AI 회의 요약 |
| `GET` | `/api/google-sheet` | Google Sheets 경비 데이터 |
| `POST` | `/api/slack/message` | Slack 메시지 전송 |
| `POST` | `/api/gmail/daily-summary` | Gmail 일일 결산 발송 |

---

## 🛡️ 보안 참고사항

- API 키는 브라우저 세션(`sessionStorage`)에만 저장되며 서버 로그에 기록되지 않습니다
- Google OAuth 토큰은 프론트엔드에서 처리되며 서버에 저장되지 않습니다
- 관리자 비밀번호는 환경변수로 관리하세요

---

## 👩‍💻 개발자

**사지윤** · 한국외국어대학교  
AI 데이터 분석과 시각화 수업 프로젝트 (2026)

---

<div align="center">
  Built with ❤️ using <strong>Claude AI</strong> · <strong>Node.js</strong> · <strong>Vanilla JS</strong>
</div>
