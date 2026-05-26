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

## 참고 문서

- Railway start command: https://docs.railway.com/guides/start-command
- Railway GitHub/quick start: https://docs.railway.com/quick-start
- Railway CLI deploy: https://docs.railway.com/cli/deploying
- OpenAI speech-to-text: https://platform.openai.com/docs/guides/speech-to-text
