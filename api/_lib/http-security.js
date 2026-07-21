import { isIP } from 'node:net';

export const DEFAULT_APP_ORIGIN = 'https://quest-hq-command-center-gamma.vercel.app';

export class HttpError extends Error {
  // `body` carries extra response fields to merge alongside `{ error }`
  // (e.g. { password_required: true }); optional and backward-compatible.
  constructor(statusCode, message, body = null) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

export function setApiHeaders(response, { cacheControl = 'no-store' } = {}) {
  response.setHeader('Cache-Control', cacheControl);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-site');
}

export function clientIp(request) {
  const forwarded = String(request?.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  const direct = forwarded || String(request?.headers?.['x-real-ip'] || request?.socket?.remoteAddress || '').trim();
  const normalized = direct.replace(/^::ffff:/i, '').replace(/^\[|\]$/g, '');
  return isIP(normalized) ? normalized : 'unknown';
}

export async function readJsonBody(request, { maxBytes = 64 * 1024 } = {}) {
  let raw;
  if (request?.body && typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
    raw = JSON.stringify(request.body);
  } else if (typeof request?.body === 'string' || Buffer.isBuffer(request?.body)) {
    raw = Buffer.isBuffer(request.body) ? request.body.toString('utf8') : request.body;
  } else {
    const chunks = [];
    let size = 0;
    for await (const chunk of request || []) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buffer.length;
      if (size > maxBytes) throw new HttpError(413, 'Request body is too large.');
      chunks.push(buffer);
    }
    raw = Buffer.concat(chunks).toString('utf8');
  }
  if (Buffer.byteLength(raw || '', 'utf8') > maxBytes) throw new HttpError(413, 'Request body is too large.');
  try {
    return JSON.parse(raw || '{}');
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
}

function originFromVercelValue(value) {
  const clean = String(value || '').trim().replace(/^https?:\/\//i, '');
  return clean ? `https://${clean}` : '';
}

export function allowedAppOrigins() {
  const configured = String(process.env.APP_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
  return new Set([
    DEFAULT_APP_ORIGIN,
    ...configured,
    originFromVercelValue(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    originFromVercelValue(process.env.VERCEL_URL),
    originFromVercelValue(process.env.VERCEL_BRANCH_URL),
  ].filter(Boolean).map((value) => {
    try { return new URL(value).origin; } catch { return ''; }
  }).filter(Boolean));
}

export function isAllowedOrigin(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && allowedAppOrigins().has(url.origin);
  } catch {
    return false;
  }
}

export function requireAllowedOrigin(request) {
  const origin = String(request?.headers?.origin || '').trim();
  if (origin && !isAllowedOrigin(origin)) throw new HttpError(403, 'Origin is not allowed.');
  return origin;
}

export function safeReturnUrl(value, request) {
  const requestOrigin = String(request?.headers?.origin || '').trim();
  const fallbackOrigin = isAllowedOrigin(requestOrigin) ? new URL(requestOrigin).origin : DEFAULT_APP_ORIGIN;
  try {
    const url = new URL(String(value || ''), fallbackOrigin);
    if (!isAllowedOrigin(url.origin)) return `${fallbackOrigin}/`;
    const tab = url.searchParams.get('tab');
    url.search = '';
    url.hash = '';
    if (tab === 'billing') url.searchParams.set('tab', tab);
    return url.toString().replace(/\/$/, url.pathname === '/' ? '/' : '');
  } catch {
    return `${fallbackOrigin}/`;
  }
}

export function appendQuery(urlValue, key, value) {
  const url = new URL(urlValue);
  url.searchParams.set(key, value);
  return url.toString();
}
