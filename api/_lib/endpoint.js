// The API endpoint module. `defineEndpoint(config, handler)` is the whole
// interface: a config object plus the handler's unique logic. Everything
// invariant across endpoints — method check, security headers, rate limit,
// body cap, config guard, auth dispatch, response writing, error handling —
// lives in the implementation here, so no handler re-declares it.
//
// The wrapper is the single writer: it is the only code that calls
// `response.end()`, so security headers can never be skipped. Responses are
// written Node-native (statusCode/setHeader/end) rather than via Vercel's
// `res.status().json()` sugar, so a plain mock response is enough to test with.

import {
  setApiHeaders,
  requireAllowedOrigin,
  readJsonBody,
  clientIp,
  HttpError,
} from './http-security.js';
import { consumeRateLimit } from './rate-limit.js';
import { verifyPortalSession, portalSessionStillValid } from './portal-session.js';
import { createAdminFetch, isSupabaseConfigured } from './supabase-admin.js';

const DEFAULT_BODY_LIMIT = 256 * 1024;
const METHODS_WITH_BODY = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

// Handler return descriptors -------------------------------------------------

export class FileResponse {
  constructor({ buffer, contentType, fileName, cacheControl = 'private, no-store' }) {
    this.buffer = buffer;
    this.contentType = contentType;
    this.fileName = fileName;
    this.cacheControl = cacheControl;
  }
}
export const fileResponse = (opts) => new FileResponse(opts);

export class JsonResponse {
  constructor(status, body) {
    this.status = status;
    this.body = body;
  }
}
export const jsonResponse = (status, body) => new JsonResponse(status, body);

// Response writing (Node-native, single writer) ------------------------------

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function dispositionFileName(fileName) {
  const clean = String(fileName || 'download').replace(/[\r\n"]/g, '').slice(0, 180) || 'download';
  return `inline; filename="${clean}"; filename*=UTF-8''${encodeURIComponent(clean)}`;
}

function sendFile(res, file) {
  res.statusCode = 200;
  res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
  res.setHeader('Content-Length', String(file.buffer.length));
  res.setHeader('Content-Disposition', dispositionFileName(file.fileName));
  res.setHeader('Cache-Control', file.cacheControl);
  res.end(file.buffer);
}

// Request helpers ------------------------------------------------------------

function methodsOf(config) {
  const method = config.method || 'POST';
  return Array.isArray(method) ? method : [method];
}

function queryFrom(req) {
  if (req.query && typeof req.query === 'object') return req.query;
  try {
    const url = new URL(req.url, `https://${req.headers?.host || 'localhost'}`);
    return Object.fromEntries(url.searchParams.entries());
  } catch {
    return {};
  }
}

async function readBody(req, maxBytes) {
  if (!METHODS_WITH_BODY.has(req.method)) return {};
  try {
    return await readJsonBody(req, { maxBytes });
  } catch (error) {
    // Oversized bodies are a real failure; malformed JSON stays lenient (an
    // empty body, matching the original handlers) so auth still returns 401.
    if (error instanceof HttpError && error.statusCode === 413) throw error;
    return {};
  }
}

// The wrapper ----------------------------------------------------------------

export function defineEndpoint(config, handler) {
  const methods = methodsOf(config);
  const {
    rateLimit,
    auth = 'none',
    requireOrigin = false,
    cacheControl = 'no-store',
    notConfiguredStatus = 501,
    notConfiguredMessage = 'This endpoint is not configured.',
    bodyLimitBytes = DEFAULT_BODY_LIMIT,
  } = config;

  // `overrides` is the injection seam: Vercel calls (req, res); tests may pass
  // { db } to substitute a fake admin fetch and exercise logic past auth.
  return async function endpoint(req, res, overrides = {}) {
    try {
      setApiHeaders(res, { cacheControl });

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }
      if (!methods.includes(req.method)) {
        return sendJson(res, 405, { error: 'Method not allowed.' });
      }
      if (!isSupabaseConfigured()) {
        return sendJson(res, notConfiguredStatus, { error: notConfiguredMessage });
      }

      if (rateLimit) {
        const result = consumeRateLimit({
          key: `${rateLimit.namespace}:${clientIp(req)}`,
          limit: rateLimit.limit,
          windowMs: rateLimit.windowMs,
        });
        res.setHeader('X-RateLimit-Limit', String(result.limit));
        res.setHeader('X-RateLimit-Remaining', String(result.remaining));
        res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
        if (!result.allowed) {
          res.setHeader('Retry-After', String(result.retryAfterSeconds));
          return sendJson(res, 429, { error: 'Too many requests. Please try again shortly.' });
        }
      }

      if (requireOrigin) requireAllowedOrigin(req); // throws HttpError(403)

      const query = queryFrom(req);
      const body = await readBody(req, bodyLimitBytes);

      const ctx = { req, res, query, body, ...overrides, db: overrides.db || createAdminFetch() };

      if (auth === 'portal-session') {
        const session = verifyPortalSession(body.session || query.session);
        if (!session) return sendJson(res, 401, { error: 'Portal session expired.' });
        // Signature and expiry are not the whole question — the portal has to still be open.
        // Doing this here rather than in each handler is the point: it is one place, and a new
        // portal endpoint cannot forget it.
        if (!(await portalSessionStillValid(ctx.db, session))) {
          return sendJson(res, 401, { error: 'This portal link is no longer active.' });
        }
        ctx.session = session;
      }

      const out = await handler(ctx);

      if (out instanceof FileResponse) return sendFile(res, out);
      if (out instanceof JsonResponse) return sendJson(res, out.status, out.body);
      return sendJson(res, 200, out == null ? {} : out);
    } catch (error) {
      if (error instanceof HttpError) {
        const payload = error.body ? { error: error.message, ...error.body } : { error: error.message };
        return sendJson(res, error.statusCode, payload);
      }
      return sendJson(res, 500, { error: 'Request failed.' });
    }
  };
}
