// Two limiters, used together.
//
// The in-memory one below is free and instant, and it is what most endpoints need: it throttles
// a chatty client without touching the database. What it cannot do is survive. Counters live in
// module scope, so on Vercel the real ceiling is the configured limit MULTIPLIED by the number
// of live lambda instances, and every cold start resets it to zero.
//
// That is fine for throttling. It is not fine as the only thing between an attacker and a
// portal password, an invite token, a proposal token or an intake passcode. Those endpoints
// also call `consumeDurableRateLimit`, which counts in Postgres and therefore counts once for
// the whole deployment.
//
// The order matters: local first, durable only for requests that already passed locally. An
// attacker pays for the database round trip; ordinary traffic does not.

import crypto from 'node:crypto';
import { clientIp } from './http-security.js';

const windows = new Map();
const MAX_WINDOWS = 10_000;

export function resetRateLimits() {
  windows.clear();
}

export function rateLimitWindowCount() {
  return windows.size;
}

function makeWindowSpace(key, now) {
  if (windows.has(key) || windows.size < MAX_WINDOWS) return;
  for (const [storedKey, entry] of windows) {
    if (now >= entry.resetAt) windows.delete(storedKey);
    if (windows.size < MAX_WINDOWS) return;
  }
  windows.delete(windows.keys().next().value);
}

export function consumeRateLimit({ key, limit, windowMs, now = Date.now() }) {
  makeWindowSpace(key, now);
  const previous = windows.get(key);
  const entry = !previous || now >= previous.resetAt ? { count: 0, resetAt: now + windowMs } : previous;
  entry.count += 1;
  windows.set(key, entry);
  const allowed = entry.count <= limit;
  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    resetAt: entry.resetAt,
  };
}

// The identity a durable window counts against. Hashed before it leaves the process, so the
// table stores no IP address: the digest is enough to count with, and useless for identifying
// anyone. The namespace is inside the hash, so one endpoint's window cannot collide with
// another's.
export function rateLimitBucket(namespace, ip) {
  return crypto.createHash('sha256').update(`${namespace}:${ip}`).digest('hex');
}

/**
 * Count this request in Postgres, across every serverless instance.
 *
 * Fails OPEN on a database error, deliberately. This runs behind the in-memory limiter, which
 * has already applied a per-instance ceiling, so a Supabase blip degrades the protection back
 * to what it was before this existed rather than locking every visitor out of a portal. The
 * alternative — failing closed — turns a database hiccup into an outage of the public surface.
 */
export async function consumeDurableRateLimit(db, { namespace, ip, limit, windowMs }) {
  const body = JSON.stringify({
    p_bucket: rateLimitBucket(namespace, ip),
    p_limit: limit,
    p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
  });
  try {
    const response = await db('/rest/v1/rpc/consume_rate_limit', { method: 'POST', body });
    if (!response?.ok) return null;
    const result = await response.json().catch(() => null);
    if (!result || typeof result.allowed !== 'boolean') return null;
    return {
      allowed: result.allowed,
      limit: Number(result.limit) || limit,
      remaining: Math.max(0, Number(result.remaining) || 0),
      retryAfterSeconds: Math.max(1, Number(result.retry_after_seconds) || 1),
      resetAt: Date.parse(result.reset_at) || Date.now() + windowMs,
    };
  } catch {
    return null;
  }
}

function writeLimitHeaders(response, result) {
  response.setHeader('X-RateLimit-Limit', String(result.limit));
  response.setHeader('X-RateLimit-Remaining', String(result.remaining));
  response.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
}

function refuse(response, result) {
  response.setHeader('Retry-After', String(result.retryAfterSeconds));
  response.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  return false;
}

export function enforceRateLimit(request, response, { namespace, limit, windowMs }) {
  const result = consumeRateLimit({ key: `${namespace}:${clientIp(request)}`, limit, windowMs });
  writeLimitHeaders(response, result);
  if (result.allowed) return true;
  return refuse(response, result);
}

/**
 * enforceRateLimit plus the durable Postgres window, for the handlers that still own their own
 * try/catch instead of going through defineEndpoint. Same local-then-shared order: a request
 * that fails locally never reaches the database.
 *
 * Used by the three public token endpoints — invite lookup, proposal open, proposal respond —
 * where the thing being guessed is a token, and a per-instance counter that resets on every
 * cold start is not a meaningful limit. Delete this alongside those handlers when they move
 * onto defineEndpoint, which already has `rateLimit.durable`.
 */
export async function enforceDurableRateLimit(request, response, { namespace, limit, windowMs, db }) {
  if (!enforceRateLimit(request, response, { namespace, limit, windowMs })) return false;
  const shared = await consumeDurableRateLimit(db, { namespace, ip: clientIp(request), limit, windowMs });
  if (!shared) return true; // database unavailable: keep the local ceiling, do not lock people out
  writeLimitHeaders(response, shared);
  if (shared.allowed) return true;
  return refuse(response, shared);
}
