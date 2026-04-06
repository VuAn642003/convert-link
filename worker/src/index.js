import { addLinkToConfig } from './link-utils.js';

function jsonResponse(status, body, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  });
}

function getCorsHeaders(origin, allowedOrigin) {
  const isAllowed = origin === allowedOrigin;
  return {
    'Access-Control-Allow-Origin': isAllowed ? allowedOrigin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
    Vary: 'Origin',
  };
}

function toBase64(content) {
  const bytes = new TextEncoder().encode(content);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(content) {
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function getLinksFile(env) {
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/links.json?ref=${env.GITHUB_BRANCH}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'convert-link-worker',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub read failed: ${response.status}`);
  }

  return response.json();
}

async function updateLinksFile(env, payload) {
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/links.json`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'convert-link-worker',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub write failed: ${response.status} ${text}`);
  }

  return response.json();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = getCorsHeaders(origin, env.ALLOWED_ORIGIN);

    if (origin && origin !== env.ALLOWED_ORIGIN) {
      return jsonResponse(403, { error: 'Origin not allowed' }, corsHeaders);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse(200, { ok: true }, corsHeaders);
    }

    if (url.pathname !== '/create-link') {
      return jsonResponse(404, { error: 'Not found' }, corsHeaders);
    }

    if (request.method !== 'POST') {
      return jsonResponse(405, { error: 'Method not allowed' }, corsHeaders);
    }

    const adminKey = request.headers.get('x-admin-key');
    if (!adminKey || adminKey !== env.ADMIN_KEY) {
      return jsonResponse(401, { error: 'Unauthorized' }, corsHeaders);
    }

    try {
      const input = await request.json();
      const existingFile = await getLinksFile(env);
      const content = fromBase64(existingFile.content.replace(/\n/g, ''));
      const parsed = JSON.parse(content);

      const { config, link } = addLinkToConfig(parsed, input);
      const updatedContent = JSON.stringify(config, null, 2) + '\n';

      const commit = await updateLinksFile(env, {
        message: `feat: add redirect link ${link.slug}`,
        content: toBase64(updatedContent),
        sha: existingFile.sha,
        branch: env.GITHUB_BRANCH,
      });

      const baseUrl = String(env.SITE_URL || '').replace(/\/+$/, '');
      const newUrl = `${baseUrl}/${link.slug}/`;

      return jsonResponse(
        200,
        {
          ok: true,
          slug: link.slug,
          url: newUrl,
          commitUrl: commit.commit?.html_url || '',
          message: 'Link added. GitHub Actions will deploy shortly.',
        },
        corsHeaders,
      );
    } catch (error) {
      return jsonResponse(400, { error: error.message || 'Bad request' }, corsHeaders);
    }
  },
};
