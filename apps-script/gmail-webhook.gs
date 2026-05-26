function doPost(e) {
  const payload = JSON.parse(e.postData.contents || "{}");
  const to = payload.to;
  const subject = payload.subject || "[WorkOS] 일일 결산";
  const body = payload.body || "";

  if (!to) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "missing_to" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  GmailApp.sendEmail(to, subject, body, {
    name: "WorkOS AI Command Center"
  });

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, sentTo: to }))
    .setMimeType(ContentService.MimeType.JSON);
}
