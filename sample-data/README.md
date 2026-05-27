# WorkOS AI Sample Data

Railway 배포 후 임의 사용자가 대시보드를 열었을 때 연동 테스트에 사용할 수 있는 샘플 파일입니다.

## 파일 구성

- `workos_shared_expenses.xlsx`: Google Drive에 업로드할 원본 엑셀 파일
- `workos_shared_expenses.csv`: Shared Expense Dashboard가 바로 읽을 수 있는 공개 CSV
- `workos_team_members.csv`: 관리자/팀원 권한 시연용 팀원 데이터
- `workos_calendar_events.csv`: 캘린더 시연용 일정 데이터
- `workos_postits.json`: 포스트잇 보드 초기 데이터 예시
- `workos_daily_summary_payload.json`: Gmail Webhook 발송 테스트 payload 예시
- `workos_meeting_transcript_sample.md`: Meeting AI 요약 테스트용 텍스트
- `*.png`: 엑셀 각 시트의 렌더링 검증용 미리보기 이미지

## Google Sheet 연동 방법

1. `workos_shared_expenses.xlsx`를 Google Drive에 업로드합니다.
2. Google Sheets로 엽니다.
3. `Shared_Expenses` 탭을 기준으로 `파일 > 공유 > 웹에 게시`를 선택합니다.
4. 형식을 `쉼표로 구분된 값(.csv)`으로 선택해 공개 CSV URL을 복사합니다.
5. Railway Variables에 아래 값을 등록합니다.

```text
GOOGLE_SHEETS_CSV_URL=복사한_공개_CSV_URL
```

또는 대시보드의 `Expenses > Google Sheet CSV 공개 링크` 입력칸에 같은 URL을 넣고 `동기화`를 누르면 됩니다.

## Railway 기본 동작

`GOOGLE_SHEETS_CSV_URL`이 비어 있어도 서버가 내부 샘플 경비 데이터를 반환하므로 화면은 비어 있지 않습니다. 공개 CSV URL을 연결하면 `Sheet 연결` 상태로 바뀌고 실제 CSV 데이터가 차트와 결산에 반영됩니다.
