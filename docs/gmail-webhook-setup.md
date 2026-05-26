# Gmail Webhook 설정 방법

WorkOS의 `Daily Summary Mail`은 `GMAIL_WEBHOOK_URL`이 설정되어 있으면 실제 Gmail로 발송됩니다. 가장 쉬운 방식은 Google Apps Script를 Web App으로 배포하고, 그 URL을 Railway 환경변수에 넣는 것입니다.

## 1. Apps Script 만들기

1. https://script.google.com 접속
2. 새 프로젝트 생성
3. `apps-script/gmail-webhook.gs` 내용을 `Code.gs`에 붙여넣기
4. 저장

## 2. Web App 배포

1. 우측 상단 `배포` 클릭
2. `새 배포` 선택
3. 유형에서 `웹 앱` 선택
4. 실행 사용자: `나`
5. 액세스 권한: `모든 사용자`
6. 배포 후 권한 승인
7. 생성된 Web App URL 복사

## 3. Railway 환경변수 입력

Railway 프로젝트의 Variables에 아래 값을 추가합니다.

```env
GMAIL_WEBHOOK_URL=https://script.google.com/macros/s/여기에_배포_URL/exec
```

배포가 다시 끝난 뒤 대시보드에서 `Daily Summary Mail` 메뉴로 가서 수신자 이메일을 입력하고 `일일 결산 발송`을 누르면 실제 메일이 발송됩니다.

## 현재 복사만 되는 이유

`GMAIL_WEBHOOK_URL`이 비어 있으면 서버가 실제 발송을 하지 않고, 대시보드가 본문을 클립보드로 복사하는 안전 폴백으로 동작합니다. Railway Variables에 Web App URL을 넣으면 복사 대신 발송으로 바뀝니다.

## 참고

- Apps Script Web Apps: https://developers.google.com/apps-script/guides/web
- GmailApp `sendEmail`: https://developers.google.com/apps-script/reference/gmail/gmail-app#sendEmail(String,String,String,Object)
