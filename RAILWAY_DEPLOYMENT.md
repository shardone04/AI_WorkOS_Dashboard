# WorkOS Railway 배포 메모

## 실행

```bash
npm start
```

Railway는 Node 프로젝트의 `package.json`을 감지하고 `start` 스크립트를 실행할 수 있습니다. 이 프로젝트는 `server.js`가 `process.env.PORT`를 우선 사용하므로 Railway의 동적 포트에서도 동작합니다.

## Railway Variables

필수는 아니지만, 아래 값을 넣으면 관련 기능이 실제 연동됩니다.

```env
GOOGLE_CLIENT_ID=
ADMIN_PASSCODE=
SLACK_WEBHOOK_URL=
OPENAI_API_KEY=
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
GOOGLE_SHEETS_CSV_URL=
GMAIL_WEBHOOK_URL=
```

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
- `POST /api/transcribe`: OpenAI Audio transcription 또는 데모 전사 반환
- `POST /api/gmail/daily-summary`: Gmail/Apps Script Webhook으로 일일 결산 발송

Gmail 실제 발송 설정은 `docs/gmail-webhook-setup.md`를 참고하세요.

## 참고 문서

- Railway start command: https://docs.railway.com/guides/start-command
- Railway GitHub/quick start: https://docs.railway.com/quick-start
- Railway CLI deploy: https://docs.railway.com/cli/deploying
- OpenAI speech-to-text: https://platform.openai.com/docs/guides/speech-to-text
