const fs = require('node:fs/promises');

function normalizeValue(value) {
  return String(value || '').trim();
}

function validateUrl(value, fieldName) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('invalid protocol');
    }
  } catch {
    throw new Error(`${fieldName} must be a valid URL`);
  }
}

function validateSlug(slug) {
  if (!slug) {
    throw new Error('Slug is required');
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Slug must contain only lowercase letters, numbers, and dashes');
  }
}

async function addLink({ linksPath, input }) {
  const slug = normalizeValue(input.slug);
  const image = normalizeValue(input.image);
  const targetUrl = normalizeValue(input.targetUrl);
  const title = normalizeValue(input.title);
  const description = normalizeValue(input.description);

  validateSlug(slug);

  if (!image) {
    throw new Error('Image URL is required');
  }

  if (!targetUrl) {
    throw new Error('Target URL is required');
  }

  validateUrl(image, 'Image URL');
  validateUrl(targetUrl, 'Target URL');

  const raw = await fs.readFile(linksPath, 'utf8');
  const parsed = JSON.parse(raw);

  const exists = parsed.links.some((item) => item.slug === slug);
  if (exists) {
    throw new Error('Slug already exists');
  }

  const newLink = {
    slug,
    title,
    description,
    image,
    targetUrl,
  };

  parsed.links.unshift(newLink);
  await fs.writeFile(linksPath, JSON.stringify(parsed, null, 2) + '\n', 'utf8');

  return newLink;
}

module.exports = {
  addLink,
};
