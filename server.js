const http = require('node:http');
const path = require('node:path');
const { readFile } = require('node:fs/promises');

const root = __dirname;
const port = Number(process.env.PORT || 3000);

const sampleExpenses = [
  { date: '2026-05-20', category: '식비', item: '팀 점심 회의', amount: 128000, owner: '사지윤', method: '법인카드' },
  { date: '2026-05-20', category: '소모품', item: '화이트보드 마커', amount: 26000, owner: 'HR Partner', method: '공동경비' },
  { date: '2026-05-21', category: '교육', item: 'AI 분석 강의 수강권', amount: 180000, owner: '김소연', method: '계좌이체' },
  { date: '2026-05-22', category: '자격', item: '보안 인증 응시료', amount: 95000, owner: '이민준', method: '법인카드' },
  { date: '2026-05-23', category: '교통', item: '고객사 방문 택시', amount: 42000, owner: 'CS Manager', method: '개인정산' },
  { date: '2026-05-24', category: '클라우드', item: '테스트 서버 증설', amount: 360000, owner: 'DevOps Lead', method: '법인카드' },
  { date: '2026-05-25', category: '식비', item: '배포 야근 식대', amount: 214000, owner: 'Backend Lead', method: '공동경비' },
  { date: '2026-05-26', category: '소모품', item: '회의실 케이블 세트', amount: 58000, owner: '박재훈', method: '공동경비' }
];

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }

    await serveStatic(url.pathname, res);
  } catch (error) {
    sendJson(res, 500, { error: 'server_error' });
  }
});

server.listen(port, () => {
  console.log(`WorkOS dashboard listening on http://localhost:${port}`);
});

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true, time: new Date().toISOString() });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/config') {
    sendJson(res, 200, {
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      features: {
        slack: Boolean(process.env.SLACK_WEBHOOK_URL),
        openai: Boolean(process.env.OPENAI_API_KEY),
        googleSheets: Boolean(process.env.GOOGLE_SHEETS_CSV_URL),
        gmail: Boolean(process.env.GMAIL_WEBHOOK_URL),
        railway: Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.PORT)
      }
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/login') {
    const body = await readJson(req);
    const expected = process.env.ADMIN_PASSCODE || process.env.WORKOS_ADMIN_PASSWORD || 'ADMIN-2026';
    sendJson(res, 200, { ok: body.password === expected });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/slack/message') {
    const body = await readJson(req);
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) {
      sendJson(res, 200, { sent: false, reason: 'missing_slack_webhook' });
      return;
    }

    const slackRes = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[${body.channel || '#ops-dashboard'}] ${body.author || 'WorkOS'}: ${body.text || ''}`
      })
    });
    sendJson(res, 200, { sent: slackRes.ok });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/google-sheet') {
    const sheetUrl = url.searchParams.get('url') || process.env.GOOGLE_SHEETS_CSV_URL;
    if (!sheetUrl) {
      sendJson(res, 200, { live: false, rows: sampleExpenses });
      return;
    }

    try {
      const sheetRes = await fetch(sheetUrl);
      if (!sheetRes.ok) throw new Error('sheet_fetch_failed');
      const csv = await sheetRes.text();
      sendJson(res, 200, { live: true, rows: parseCsv(csv) });
    } catch (error) {
      sendJson(res, 200, { live: false, rows: sampleExpenses });
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/transcribe') {
    const body = await readJson(req, 28 * 1024 * 1024);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || !body.audioBase64) {
      sendJson(res, 200, { usedOpenAI: false, text: fallbackTranscript(body.fileName) });
      return;
    }

    try {
      const buffer = Buffer.from(body.audioBase64, 'base64');
      const form = new FormData();
      const blob = new Blob([buffer], { type: body.mimeType || 'audio/mpeg' });
      form.append('file', blob, body.fileName || 'meeting-audio.mp3');
      form.append('model', process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe');
      form.append('response_format', 'json');

      const aiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form
      });

      if (!aiRes.ok) throw new Error(await aiRes.text());
      const data = await aiRes.json();
      sendJson(res, 200, { usedOpenAI: true, text: data.text || '' });
    } catch (error) {
      sendJson(res, 200, { usedOpenAI: false, text: fallbackTranscript(body.fileName) });
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/gmail/daily-summary') {
    const body = await readJson(req);
    const webhook = process.env.GMAIL_WEBHOOK_URL;
    if (!webhook) {
      sendJson(res, 200, { sent: false, reason: 'missing_gmail_webhook' });
      return;
    }

    const mailRes = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: body.to,
        subject: body.subject,
        body: body.body
      })
    });
    sendJson(res, 200, { sent: mailRes.ok });
    return;
  }

  sendJson(res, 404, { error: 'not_found' });
}

async function serveStatic(pathname, res) {
  const safePath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(root, safePath));

  if (!filePath.startsWith(root)) {
    sendJson(res, 403, { error: 'forbidden' });
    return;
  }

  try {
    const file = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(file);
  } catch (error) {
    const file = await readFile(path.join(root, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(file);
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJson(req, maxBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (Buffer.byteLength(raw) > maxBytes) {
        reject(new Error('payload_too_large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function parseCsv(csv) {
  const rows = [];
  let cell = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  if (!rows.length) return [];

  const headers = rows.shift().map(h => h.trim());
  return rows.map(cols => Object.fromEntries(headers.map((h, i) => [h, (cols[i] || '').trim()])));
}

function fallbackTranscript(fileName = 'meeting-audio') {
  return `${fileName} 회의 녹음 전사 데모. 결제 QA 병목은 오늘 중 담당자를 확정한다. 공동 경비는 Google Sheet 기준으로 매일 업데이트한다. Slack 채널에는 주요 결정사항만 공유한다. 다음 회의 전까지 관리자 페이지에서 팀원별 공개 범위를 설정한다.`;
}
