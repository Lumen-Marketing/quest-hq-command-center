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

export function enforceRateLimit(request, response, { namespace, limit, windowMs }) {
  const result = consumeRateLimit({ key: `${namespace}:${clientIp(request)}`, limit, windowMs });
  response.setHeader('X-RateLimit-Limit', String(result.limit));
  response.setHeader('X-RateLimit-Remaining', String(result.remaining));
  response.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
  if (result.allowed) return true;
  response.setHeader('Retry-After', String(result.retryAfterSeconds));
  response.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  return false;
}
