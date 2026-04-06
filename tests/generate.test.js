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
  assert.doesNotMatch(html, /http-equiv="refresh"/);
  assert.match(html, /<div class="spinner" aria-hidden="true"><\/div>/);
  assert.doesNotMatch(html, /<h1>/);
  assert.doesNotMatch(html, /<p>/);
  assert.match(html, /setTimeout\(\(\) => \{/);
  assert.match(html, /}, 180\);/);
  assert.match(html, /window.location.href = 'https:\/\/shopee.vn\/product-1'/);
});

test('buildSite fills fallback og title and description when empty', async () => {
  const tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'convert-link-'));
  const distDir = path.join(tempRoot, 'dist');

  await buildSite({
    siteUrl: 'https://vuan642003.github.io/convert-link',
    outputDir: distDir,
    links: [
      {
        slug: 'tuong-bat-ma',
        title: '',
        description: '',
        image: 'https://example.com/images/tuong.jpg',
        targetUrl: 'https://s.shopee.vn/AAD0BAKv8S',
      },
    ],
  });

  const html = await fs.promises.readFile(path.join(distDir, 'tuong-bat-ma', 'index.html'), 'utf8');

  assert.ok(html.includes('<meta property="og:title" content="\u200b">'));
  assert.ok(html.includes('<meta property="og:description" content="\u200b">'));
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
  assert.match(html, /<img class="link-thumb" src="https:\/\/example.com\/images\/ao-phong.jpg" alt="sp-ao-1">/);
  assert.match(html, /<button type="button" class="copy-button">Copy URL<\/button>/);
  assert.match(html, /navigator\.clipboard\.writeText\(url\)/);
  assert.match(html, /button\.textContent = 'Copied!'/);
});
