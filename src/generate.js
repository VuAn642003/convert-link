const fs = require('node:fs/promises');
const path = require('node:path');

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

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(link.title)}</title>
  <meta name="description" content="${escapeHtml(link.description)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(link.title)}">
  <meta property="og:description" content="${escapeHtml(link.description)}">
  <meta property="og:image" content="${escapeHtml(link.image)}">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(link.title)}">
  <meta name="twitter:description" content="${escapeHtml(link.description)}">
  <meta name="twitter:image" content="${escapeHtml(link.image)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(link.targetUrl)}">
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
    main {
      width: min(560px, calc(100% - 32px));
      padding: 24px;
      border-radius: 16px;
      background: #ffffff;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
      text-align: center;
    }
    a {
      color: #2563eb;
    }
  </style>
</head>
<body>
  <main>
    <h1>Dang chuyen huong...</h1>
    <p>Neu trinh duyet khong tu dong mo, hay bam vao link ben duoi.</p>
    <p><a href="${escapeHtml(link.targetUrl)}" rel="nofollow noopener">Mo link Shopee</a></p>
  </main>
  <script>
    window.location.replace('${escapeJsString(link.targetUrl)}');
  </script>
</body>
</html>
`;
}

function renderIndexPage(siteUrl, links) {
  const items = links
    .map((link) => {
      const pageUrl = buildPageUrl(siteUrl, link.slug);

      return `<li><a href="${escapeHtml(pageUrl)}">${escapeHtml(link.slug)}</a> - ${escapeHtml(link.title)}</li>`;
    })
    .join('\n      ');

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Convert Link</title>
  <style>
    body {
      margin: 0;
      padding: 40px 16px;
      font-family: Arial, sans-serif;
      background: #f6f7fb;
      color: #111827;
    }
    main {
      width: min(900px, 100%);
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
    }
    ul {
      padding-left: 20px;
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
