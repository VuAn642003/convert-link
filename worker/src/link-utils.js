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

function makeNewLink(input) {
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

  return {
    slug,
    title,
    description,
    image,
    targetUrl,
  };
}

export function addLinkToConfig(config, input) {
  if (!config || !Array.isArray(config.links)) {
    throw new Error('Invalid links.json format');
  }

  const newLink = makeNewLink(input);
  const exists = config.links.some((item) => item.slug === newLink.slug);

  if (exists) {
    throw new Error('Slug already exists');
  }

  return {
    config: {
      ...config,
      links: [newLink, ...config.links],
    },
    link: newLink,
  };
}
