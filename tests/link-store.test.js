const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { addLink } = require('../src/link-store');

test('addLink writes a new link entry to links.json', async () => {
  const tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'convert-link-store-'));
  const linksPath = path.join(tempRoot, 'links.json');

  await fs.promises.writeFile(
    linksPath,
    JSON.stringify(
      {
        siteUrl: 'https://example.github.io/convert-link',
        links: [],
      },
      null,
      2,
    ),
    'utf8',
  );

  const result = await addLink({
    linksPath,
    input: {
      slug: 'tuong-bat-ma',
      image: 'https://example.com/image.jpg',
      targetUrl: 'https://s.shopee.vn/abcxyz',
      title: '',
      description: '',
    },
  });

  assert.equal(result.slug, 'tuong-bat-ma');

  const saved = JSON.parse(await fs.promises.readFile(linksPath, 'utf8'));
  assert.equal(saved.links.length, 1);
  assert.equal(saved.links[0].slug, 'tuong-bat-ma');
  assert.equal(saved.links[0].image, 'https://example.com/image.jpg');
  assert.equal(saved.links[0].targetUrl, 'https://s.shopee.vn/abcxyz');
});

test('addLink throws if slug already exists', async () => {
  const tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'convert-link-store-'));
  const linksPath = path.join(tempRoot, 'links.json');

  await fs.promises.writeFile(
    linksPath,
    JSON.stringify(
      {
        siteUrl: 'https://example.github.io/convert-link',
        links: [
          {
            slug: 'tuong-bat-ma',
            title: '',
            description: '',
            image: 'https://example.com/image.jpg',
            targetUrl: 'https://s.shopee.vn/abcxyz',
          },
        ],
      },
      null,
      2,
    ),
    'utf8',
  );

  await assert.rejects(
    addLink({
      linksPath,
      input: {
        slug: 'tuong-bat-ma',
        image: 'https://example.com/new.jpg',
        targetUrl: 'https://s.shopee.vn/new',
        title: '',
        description: '',
      },
    }),
    /Slug already exists/,
  );
});

test('addLink validates required fields', async () => {
  const tempRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'convert-link-store-'));
  const linksPath = path.join(tempRoot, 'links.json');

  await fs.promises.writeFile(
    linksPath,
    JSON.stringify(
      {
        siteUrl: 'https://example.github.io/convert-link',
        links: [],
      },
      null,
      2,
    ),
    'utf8',
  );

  await assert.rejects(
    addLink({
      linksPath,
      input: {
        slug: '',
        image: 'https://example.com/image.jpg',
        targetUrl: 'https://s.shopee.vn/abcxyz',
      },
    }),
    /Slug is required/,
  );

  await assert.rejects(
    addLink({
      linksPath,
      input: {
        slug: 'sp-1',
        image: '',
        targetUrl: 'https://s.shopee.vn/abcxyz',
      },
    }),
    /Image URL is required/,
  );

  await assert.rejects(
    addLink({
      linksPath,
      input: {
        slug: 'sp-1',
        image: 'https://example.com/image.jpg',
        targetUrl: '',
      },
    }),
    /Target URL is required/,
  );
});
