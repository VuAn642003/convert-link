const fs = require('node:fs/promises');
const path = require('node:path');

const HIDDEN_OG_TEXT = '\u200B';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsString(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}

function normalizeBaseUrl(siteUrl) {
  return String(siteUrl).replace(/\/+$/, '');
}

function buildPageUrl(siteUrl, slug) {
  return `${normalizeBaseUrl(siteUrl)}/${slug}/`;
}

function renderLinkPage(siteUrl, link) {
  const pageUrl = buildPageUrl(siteUrl, link.slug);
  const finalTitle = String(link.title || '').trim() || HIDDEN_OG_TEXT;
  const finalDescription = String(link.description || '').trim() || HIDDEN_OG_TEXT;

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(finalTitle)}</title>
  <meta name="description" content="${escapeHtml(finalDescription)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(finalTitle)}">
  <meta property="og:description" content="${escapeHtml(finalDescription)}">
  <meta property="og:image" content="${escapeHtml(link.image)}">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(finalTitle)}">
  <meta name="twitter:description" content="${escapeHtml(finalDescription)}">
  <meta name="twitter:image" content="${escapeHtml(link.image)}">
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: Arial, sans-serif;
      background: #f6f7fb;
      color: #111827;
    }
    .loader-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.12);
    }
    .spinner {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid #dbeafe;
      border-top-color: #2563eb;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  </style>
</head>
<body>
  <div class="loader-wrap" aria-label="Dang chuyen huong">
    <div class="spinner" aria-hidden="true"></div>
  </div>
  <script>
    setTimeout(() => {
      window.location.href = '${escapeJsString(link.targetUrl)}';
    }, 180);
  </script>
</body>
</html>
`;
}

function renderIndexPage(siteUrl, links) {
  const items = links
    .map((link) => {
      const pageUrl = buildPageUrl(siteUrl, link.slug);

      return `<li class="link-item" data-copy-url="${escapeHtml(pageUrl)}">
        <img class="link-thumb" src="${escapeHtml(link.image)}" alt="${escapeHtml(link.slug)}">
        <div class="link-meta">
          <p class="link-slug">/${escapeHtml(link.slug)}/</p>
          <p class="link-title">${escapeHtml(link.title)}</p>
          <a class="link-url" href="${escapeHtml(pageUrl)}" target="_blank" rel="noopener">${escapeHtml(pageUrl)}</a>
        </div>
        <button type="button" class="copy-button">Copy URL</button>
      </li>`;
    })
    .join('\n      ');

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Convert Link</title>
  <style>
    :root {
      --bg: #f7fafc;
      --panel: #ffffff;
      --text: #172554;
      --muted: #475569;
      --accent: #0ea5e9;
      --accent-strong: #0284c7;
      --border: #e2e8f0;
      --shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
      --radius: 16px;
    }
    body {
      margin: 0;
      padding: 40px 16px;
      font-family: "Trebuchet MS", "Segoe UI", Tahoma, sans-serif;
      background:
        radial-gradient(circle at 0% 0%, #dbeafe 0%, transparent 40%),
        radial-gradient(circle at 100% 100%, #cffafe 0%, transparent 36%),
        var(--bg);
      color: var(--text);
    }
    main {
      width: min(900px, 100%);
      margin: 0 auto;
      background: var(--panel);
      border-radius: var(--radius);
      padding: 28px;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
    }
    ul {
      padding-left: 0;
      list-style: none;
      margin: 24px 0 0;
      display: grid;
      gap: 12px;
    }
    .link-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      background: #f8fafc;
    }
    .link-thumb {
      width: 72px;
      height: 72px;
      object-fit: cover;
      border-radius: 10px;
      border: 1px solid var(--border);
      flex: 0 0 auto;
      background: #e2e8f0;
    }
    .link-meta {
      min-width: 0;
      flex: 1 1 auto;
    }
    .link-slug {
      margin: 0;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .link-title {
      margin: 2px 0 8px;
      font-weight: 700;
    }
    .link-url {
      color: var(--accent-strong);
      word-break: break-all;
      text-decoration: none;
    }
    .link-url:hover {
      text-decoration: underline;
    }
    .copy-button {
      border: 0;
      border-radius: 10px;
      padding: 10px 14px;
      font-weight: 700;
      background: var(--accent);
      color: #ffffff;
      cursor: pointer;
      white-space: nowrap;
    }
    .copy-button:hover {
      background: var(--accent-strong);
    }
    .copy-button:focus-visible {
      outline: 3px solid #93c5fd;
      outline-offset: 2px;
    }
    @media (max-width: 640px) {
      .link-item {
        flex-direction: column;
        align-items: stretch;
      }
      .link-thumb {
        width: 100%;
        height: 168px;
      }
      .copy-button {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <main>
    <h1>Danh sach link trung gian</h1>
    <p>Moi slug duoi day se tro thanh mot URL co Open Graph rieng.</p>
    <ul>
      ${items}
    </ul>
  </main>
  <script>
    const items = document.querySelectorAll('[data-copy-url]');
    items.forEach((item) => {
      const button = item.querySelector('.copy-button');
      if (!button) {
        return;
      }

      button.addEventListener('click', async () => {
        const url = item.getAttribute('data-copy-url');
        if (!url) {
          return;
        }

        const defaultText = 'Copy URL';

        try {
          await navigator.clipboard.writeText(url);
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = defaultText;
          }, 1200);
        } catch {
          button.textContent = 'Copy failed';
          setTimeout(() => {
            button.textContent = defaultText;
          }, 1200);
        }
      });
    });
  </script>
</body>
</html>
`;
}

async function buildSite({ siteUrl, outputDir, links }) {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  for (const link of links) {
    const dir = path.join(outputDir, link.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'index.html'), renderLinkPage(siteUrl, link), 'utf8');
  }

  await fs.writeFile(path.join(outputDir, 'index.html'), renderIndexPage(siteUrl, links), 'utf8');
}

module.exports = {
  buildSite,
};
