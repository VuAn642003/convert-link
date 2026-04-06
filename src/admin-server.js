const http = require('node:http');
const path = require('node:path');

const { addLink } = require('./link-store');
const { buildSite } = require('./generate');

const linksPath = path.resolve(__dirname, '..', 'links.json');
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'dist');
const port = Number(process.env.PORT || 8787);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getFormHtml({ error = '', success = '', saved = null } = {}) {
  const messageError = error ? `<p class="msg error">${escapeHtml(error)}</p>` : '';
  const messageSuccess = success ? `<p class="msg success">${escapeHtml(success)}</p>` : '';
  const createdUrl = saved ? `<p class="created">URL moi: <a href="${escapeHtml(saved)}" target="_blank" rel="noopener">${escapeHtml(saved)}</a></p>` : '';

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Create Link</title>
  <style>
    :root {
      --bg: #f8fafc;
      --panel: #ffffff;
      --text: #0f172a;
      --muted: #475569;
      --line: #cbd5e1;
      --accent: #0284c7;
      --danger: #b91c1c;
      --success: #0f766e;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Trebuchet MS", "Segoe UI", sans-serif;
      color: var(--text);
      background: linear-gradient(150deg, #eff6ff 0%, var(--bg) 60%);
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 20px;
    }
    main {
      width: min(760px, 100%);
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: 0 20px 50px rgba(2, 132, 199, 0.12);
      padding: 24px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 1.6rem;
    }
    .lead {
      margin: 0 0 20px;
      color: var(--muted);
    }
    form {
      display: grid;
      gap: 14px;
    }
    label {
      display: grid;
      gap: 6px;
      font-weight: 700;
      font-size: 0.95rem;
    }
    input, textarea {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px 12px;
      font: inherit;
    }
    textarea {
      min-height: 90px;
      resize: vertical;
    }
    .row {
      display: grid;
      gap: 14px;
      grid-template-columns: 1fr 1fr;
    }
    .hint {
      margin: 0;
      color: var(--muted);
      font-size: 0.85rem;
      font-weight: 400;
    }
    button {
      border: 0;
      border-radius: 10px;
      padding: 12px 16px;
      font: inherit;
      font-weight: 700;
      background: var(--accent);
      color: #fff;
      cursor: pointer;
      width: fit-content;
    }
    .msg {
      border-radius: 10px;
      padding: 10px 12px;
      margin: 0 0 14px;
      font-weight: 700;
    }
    .error {
      color: var(--danger);
      background: #fee2e2;
      border: 1px solid #fecaca;
    }
    .success {
      color: var(--success);
      background: #ccfbf1;
      border: 1px solid #99f6e4;
    }
    .created {
      margin: 0 0 14px;
      font-weight: 700;
    }
    .created a {
      color: var(--accent);
    }
    @media (max-width: 640px) {
      .row { grid-template-columns: 1fr; }
      button { width: 100%; }
    }
  </style>
</head>
<body>
  <main>
    <h1>Them link trung gian</h1>
    <p class="lead">Nhap slug, URL anh va target URL. Form se cap nhat <code>links.json</code> va build lai site ngay.</p>
    ${messageError}
    ${messageSuccess}
    ${createdUrl}
    <form method="post" action="/create">
      <label>
        Slug *
        <input name="slug" required placeholder="tuong-bat-ma" pattern="[a-z0-9-]+">
        <span class="hint">Chi dung chu thuong, so, dau gach ngang.</span>
      </label>

      <label>
        URL anh (og:image) *
        <input name="image" required type="url" placeholder="https://...">
      </label>

      <label>
        Target URL (Shopee) *
        <input name="targetUrl" required type="url" placeholder="https://s.shopee.vn/...">
      </label>

      <div class="row">
        <label>
          Title (optional)
          <input name="title" placeholder="De trong de an toi da">
        </label>
        <label>
          Description (optional)
          <input name="description" placeholder="De trong de an toi da">
        </label>
      </div>

      <button type="submit">Tao link</button>
    </form>
  </main>
</body>
</html>`;
}

function parseForm(body) {
  const entries = new URLSearchParams(body);
  return {
    slug: entries.get('slug') || '',
    image: entries.get('image') || '',
    targetUrl: entries.get('targetUrl') || '',
    title: entries.get('title') || '',
    description: entries.get('description') || '',
  };
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function readConfig() {
  const fs = require('node:fs/promises');
  const raw = await fs.readFile(linksPath, 'utf8');
  return JSON.parse(raw);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    sendHtml(res, 200, getFormHtml());
    return;
  }

  if (req.method === 'POST' && req.url === '/create') {
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      const input = parseForm(Buffer.concat(chunks).toString('utf8'));
      const newLink = await addLink({ linksPath, input });
      const config = await readConfig();

      await buildSite({
        siteUrl: config.siteUrl,
        outputDir,
        links: config.links,
      });

      const createdUrl = `${String(config.siteUrl).replace(/\/+$/, '')}/${newLink.slug}/`;
      sendHtml(
        res,
        200,
        getFormHtml({
          success: 'Tao link thanh cong. Nho commit va push len GitHub.',
          saved: createdUrl,
        }),
      );
      return;
    } catch (error) {
      sendHtml(res, 400, getFormHtml({ error: error.message || 'Co loi xay ra' }));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, () => {
  console.log(`Admin form running at http://localhost:${port}`);
});
