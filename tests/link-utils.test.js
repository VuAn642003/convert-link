const test = require('node:test');
const assert = require('node:assert/strict');

const { addLinkToConfig } = require('../src/link-utils');

test('addLinkToConfig inserts new link at top', () => {
  const original = {
    siteUrl: 'https://example.github.io/convert-link',
    links: [
      {
        slug: 'old-link',
        title: '',
        description: '',
        image: 'https://example.com/old.jpg',
        targetUrl: 'https://s.shopee.vn/old',
      },
    ],
  };

  const result = addLinkToConfig(original, {
    slug: 'new-link',
    image: 'https://example.com/new.jpg',
    targetUrl: 'https://s.shopee.vn/new',
    title: '',
    description: '',
  });

  assert.equal(result.link.slug, 'new-link');
  assert.equal(result.config.links.length, 2);
  assert.equal(result.config.links[0].slug, 'new-link');
  assert.equal(result.config.links[1].slug, 'old-link');
});

test('addLinkToConfig throws for duplicate slug', () => {
  const original = {
    siteUrl: 'https://example.github.io/convert-link',
    links: [
      {
        slug: 'same-slug',
        title: '',
        description: '',
        image: 'https://example.com/old.jpg',
        targetUrl: 'https://s.shopee.vn/old',
      },
    ],
  };

  assert.throws(
    () => {
      addLinkToConfig(original, {
        slug: 'same-slug',
        image: 'https://example.com/new.jpg',
        targetUrl: 'https://s.shopee.vn/new',
      });
    },
    /Slug already exists/,
  );
});
