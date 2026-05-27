# WorkOS Railway 배포 메모

## 실행

```bash
npm start
```

Railway는 Node 프로젝트의 `package.json`을 감지하고 `start` 스크립트를 실행할 수 있습니다. 이 프로젝트는 `server.js`가 `process.env.PORT`를 우선 사용하므로 Railway의 동적 포트에서도 동작합니다.

## Railway Variables

Railway에서 실제 AI 연동을 보여주려면 `ANTHROPIC_API_KEY` 또는 `OPENAI_API_KEY`를 넣습니다. 둘 다 비워도 앱 자체는 실행되고 기본/데모 응답으로 동작합니다.

```env
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-5
OPENAI_API_KEY=
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
```

아래 값들은 선택입니다. 공란이면 대시보드가 기본/임의 설정으로 자동 동작합니다.

```env
GOOGLE_CLIENT_ID=
ADMIN_PASSCODE=
SLACK_WEBHOOK_URL=
GOOGLE_SHEETS_CSV_URL=
GMAIL_WEBHOOK_URL=
```

- `GOOGLE_CLIENT_ID` 공란: Google Demo User 로그인으로 동작
- `ADMIN_PASSCODE` 공란: 기본 관리자 비밀번호 `ADMIN-2026` 사용
- `ANTHROPIC_API_KEY` 공란: 업무 AI/AI 변호사는 로컬 규칙 기반 응답 사용. 사용자가 우측 `AI Copilot` 상단에 자신의 Claude API 키를 직접 입력할 수도 있음
- `OPENAI_API_KEY` 공란: Meeting Audio AI는 실제 전사 대신 데모 전사 사용
- `SLACK_WEBHOOK_URL` 공란: Slack 전송 대신 로컬 팀 채팅/데모 상태로 동작
- `GOOGLE_SHEETS_CSV_URL` 공란: 서버 내장 공동 경비 샘플 데이터 사용
- `GMAIL_WEBHOOK_URL` 공란: 일일 결산 미리보기/복사는 가능, 실제 메일 발송만 비활성

사용자가 자신의 Claude API 키를 쓰고 싶다면 우측 `AI Copilot` 상단의 `Claude API` 입력칸에 직접 넣을 수 있습니다. 이 값은 GitHub나 Railway 환경변수에 저장되지 않고, 해당 브라우저 세션에서 업무 AI/AI 변호사 요청을 보낼 때만 서버로 전달됩니다.

## 샘플 데이터 파일

공유 드라이브 업로드용 샘플 파일은 `sample-data/`에 있습니다.

- `sample-data/workos_shared_expenses.xlsx`: Google Drive에 업로드할 원본 엑셀 파일
- `sample-data/workos_shared_expenses.csv`: Shared Expense Dashboard가 바로 읽을 수 있는 CSV
- `sample-data/workos_team_members.csv`: 관리자/팀원 시연 데이터
- `sample-data/workos_calendar_events.csv`: 캘린더 시연 데이터
- `sample-data/workos_daily_summary_payload.json`: Gmail Webhook 테스트 payload

Google Sheets로 실제 연동하려면 `workos_shared_expenses.xlsx`를 Google Drive에 업로드한 뒤 `Shared_Expenses` 탭을 CSV로 웹에 게시하고, 그 공개 CSV URL을 Railway의 `GOOGLE_SHEETS_CSV_URL`에 넣습니다. 이 값이 없어도 `/api/google-sheet`는 서버 내장 샘플 데이터를 반환하므로 처음 접속한 사용자도 빈 화면을 보지 않습니다.

## 제출

1. `workOS` 폴더를 GitHub 저장소에 업로드합니다.
2. Railway에서 GitHub 저장소를 연결합니다.
3. Variables에 필요한 키를 입력합니다.
4. 배포가 완료되면 생성된 Railway public URL을 제출 텍스트 파일에 적습니다.

## API 경로

- `GET /api/config`: 활성화된 연동 상태 확인
- `POST /api/admin/login`: 관리자 비밀번호 확인
- `POST /api/slack/message`: Slack Webhook 메시지 전송
- `GET /api/google-sheet`: Google Sheet CSV 또는 샘플 경비 데이터 반환
- `POST /api/claude/chat`: Claude Messages API 또는 로컬 규칙 기반 응답 반환
- `POST /api/transcribe`: OpenAI Audio transcription 또는 데모 전사 반환
- `POST /api/gmail/daily-summary`: Gmail/Apps Script Webhook으로 일일 결산 발송

Gmail 실제 발송 설정은 `docs/gmail-webhook-setup.md`를 참고하세요.

## 참고 문서

- Railway start command: https://docs.railway.com/guides/start-command
- Railway GitHub/quick start: https://docs.railway.com/quick-start
- Railway CLI deploy: https://docs.railway.com/cli/deploying
- Claude Messages API: https://platform.claude.com/docs/en/build-with-claude/working-with-messages
- OpenAI speech-to-text: https://platform.openai.com/docs/guides/speech-to-text
