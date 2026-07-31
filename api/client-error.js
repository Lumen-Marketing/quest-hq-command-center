import { setApiHeaders } from './_lib/http-security.js';
import { enforceRateLimit } from './_lib/rate-limit.js';

// Receives uncaught browser errors so a broken release is visible in the server logs
// instead of only in each visitor's console.
//
// This exists because a startup crash shipped to production and was found by a user
// reporting a blank page, not by us. Every automated gate had passed, because none of
// them ran the bundle in a browser.
//
// Best-effort telemetry, modelled on csp-report.js: it never errors, never blocks, and
// always answers 204. Deliberately no database — errors go to stdout, where Vercel's
// runtime logs already collect and retain them. That keeps this endpoint free of a new
// table, new RLS surface, and a new write path reachable from an unauthenticated page.
//
// PRIVACY: only identifiers and structural context are accepted. No email, no name, no
// field values, no tokens. URLs are stripped of query strings and fragments before
// logging, because invite/recovery links carry secrets in exactly those places.

const MAX = { message: 500, stack: 2000, url: 300, id: 80, revision: 60, route: 120 };

const text = (value, limit) => String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, limit);

// Keep origin + path; drop query and hash, which can carry invite or recovery tokens.
function safeUrl(value) {
  const raw = text(value, 2000);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`.slice(0, MAX.url);
  } catch {
    return raw.split(/[?#]/)[0].slice(0, MAX.url);
  }
}

// A stack can embed the same secrets a URL can, so scrub every URL it contains.
function safeStack(value) {
  return text(value, MAX.stack).replace(/https?:\/\/[^\s)]+/g, (match) => safeUrl(match));
}

export default async function handler(req, res) {
  setApiHeaders(res, { cacheControl: 'no-store' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();
  // One broken render can fire errors in a tight loop; cap hard so a single bad session
  // cannot flood the logs or the rate limiter for everyone else.
  if (!enforceRateLimit(req, res, { namespace: 'client-error', limit: 30, windowMs: 60 * 1000 })) return;

  try {
    let raw = '';
    if (typeof req.body === 'string') raw = req.body;
    else if (req.body && typeof req.body === 'object') raw = JSON.stringify(req.body);
    else { for await (const chunk of req) { raw += chunk; if (raw.length > 16 * 1024) break; } }

    const body = JSON.parse(raw || '{}') || {};
    const entry = {
      kind: body.kind === 'unhandledrejection' ? 'unhandledrejection' : 'error',
      message: text(body.message, MAX.message) || '(no message)',
      stack: safeStack(body.stack),
      at: safeUrl(body.url),
      // Structural only: which screen, not what was on it.
      route: text(body.route, MAX.route),
      revision: text(body.revision, MAX.revision),
      // Tenant identifiers, never names or emails — enough to tell whether a fault is
      // one tenant's data or everyone's.
      company: text(body.company_id, MAX.id),
      workspace: text(body.workspace_id, MAX.id),
      profile: text(body.profile_id, MAX.id),
    };
    console.error('[client-error]', JSON.stringify(entry));
  } catch {
    // Ignore malformed reports — never error on a best-effort telemetry endpoint.
  }
  return res.status(204).end();
}
