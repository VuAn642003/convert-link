const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { buildSite } = require('../src/generate');

test('buildSite generates one HTML page per link with OGP tags and redirect', async () => {
  const tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'convert-link-'));
  const distDir = path.join(tempRoot, 'dist');

  const links = [
    {
      slug: 'sp-ao-1',
      title: 'Ao phong sale',
      description: 'Mau ao phong gia tot',
      image: 'https://example.com/images/ao-phong.jpg',
      targetUrl: 'https://shopee.vn/product-1',
    },
  ];

  await buildSite({
    siteUrl: 'https://vuan642003.github.io/convert-link',
    outputDir: distDir,
    links,
  });

  const htmlPath = path.join(distDir, 'sp-ao-1', 'index.html');
  const html = await fs.promises.readFile(htmlPath, 'utf8');

  assert.match(html, /<meta property="og:title" content="Ao phong sale">/);
  assert.match(html, /<meta property="og:description" content="Mau ao phong gia tot">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/example.com\/images\/ao-phong.jpg">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/vuan642003.github.io\/convert-link\/sp-ao-1\/">/);
  assert.match(html, /<meta http-equiv="refresh" content="0;url=https:\/\/shopee.vn\/product-1">/);
  assert.match(html, /window.location.replace\('https:\/\/shopee.vn\/product-1'\)/);
});

test('buildSite generates index page listing all available links', async () => {
  const tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'convert-link-'));
  const distDir = path.join(tempRoot, 'dist');

  await buildSite({
    siteUrl: 'https://vuan642003.github.io/convert-link',
    outputDir: distDir,
    links: [
      {
        slug: 'sp-ao-1',
        title: 'Ao phong sale',
        description: 'Mau ao phong gia tot',
        image: 'https://example.com/images/ao-phong.jpg',
        targetUrl: 'https://shopee.vn/product-1',
      },
      {
        slug: 'sp-giay-2',
        title: 'Giay running sale',
        description: 'Giay running gia tot',
        image: 'https://example.com/images/giay-running.jpg',
        targetUrl: 'https://shopee.vn/product-2',
      },
    ],
  });

  const html = await fs.promises.readFile(path.join(distDir, 'index.html'), 'utf8');

  assert.match(html, /sp-ao-1/);
  assert.match(html, /sp-giay-2/);
  assert.match(html, /https:\/\/vuan642003.github.io\/convert-link\/sp-ao-1\//);
  assert.match(html, /https:\/\/vuan642003.github.io\/convert-link\/sp-giay-2\//);
  assert.match(html, /data-copy-url="https:\/\/vuan642003.github.io\/convert-link\/sp-ao-1\/"/);
  assert.match(html, /<button type="button" class="copy-button">Copy URL<\/button>/);
  assert.match(html, /navigator\.clipboard\.writeText\(url\)/);
  assert.match(html, /button\.textContent = 'Copied!'/);
});
