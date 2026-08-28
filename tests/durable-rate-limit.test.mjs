import assert from 'node:assert/strict';
import test from 'node:test';

import portalOpenHandler from '../api/client-portal-open.js';
import {
  consumeDurableRateLimit, rateLimitBucket, resetRateLimits,
} from '../api/_lib/rate-limit.js';

// The in-memory limiter counts per serverless instance and resets on every cold start, so on
// the endpoints where a secret is being guessed — a portal password, an invite token, a
// proposal token, an intake passcode — it is not a meaningful ceiling. Those now also count in
// Postgres, which counts once for the whole deployment.

const originalEnv = { ...process.env };
test.beforeEach(() => {
  resetRateLimits();
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.CLIENT_PORTAL_SESSION_SECRET = 'test-session-secret';
});
test.afterEach(() => { process.env = { ...originalEnv }; });

function res() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(key, value) { this.headers[key.toLowerCase()] = value; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

const req = (payload, ip = '203.0.113.7') => ({
  method: 'POST',
  headers: { host: 'localhost', 'x-forwarded-for': ip },
  url: '/api/client-portal-open',
  async *[Symbol.asyncIterator]() { yield Buffer.from(JSON.stringify(payload)); },
});

test('the bucket is a hash, so no IP address reaches the database', () => {
  const bucket = rateLimitBucket('client-portal-open', '203.0.113.7');
  assert.match(bucket, /^[0-9a-f]{64}$/);
  assert.doesNotMatch(bucket, /203\.0\.113\.7/);
  // Namespaced, so one endpoint's window cannot collide with another's for the same visitor.
  assert.notEqual(bucket, rateLimitBucket('wb-intake-open', '203.0.113.7'));
});

test('a refusal from the shared counter stops the request even when the local one is fresh', async () => {
  // The exact shape a cold start produces: this instance has seen nothing, but the deployment
  // as a whole has already spent the window.
  const db = async (path) => {
    if (path === '/rest/v1/rpc/consume_rate_limit') {
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            allowed: false, count: 11, limit: 10, remaining: 0,
            reset_at: new Date(Date.now() + 300_000).toISOString(), retry_after_seconds: 300,
          };
        },
      };
    }
    throw new Error(`the handler must not run: ${path}`);
  };

  const response = res();
  await portalOpenHandler(req({ token: 'guess-1' }), response, { db });

  assert.equal(response.statusCode, 429);
  assert.deepEqual(response.json(), { error: 'Too many requests. Please try again shortly.' });
  assert.equal(response.headers['retry-after'], '300');
  assert.equal(response.headers['x-ratelimit-remaining'], '0');
});

test('an unreachable counter fails open rather than closing the portal', async () => {
  // Behind the local limiter, so failing open degrades to the protection that existed before
  // the durable window — not to nothing. Failing closed would turn a database blip into an
  // outage of every public portal.
  const calls = [];
  const db = async (path, options = {}) => {
    calls.push(path);
    if (path === '/rest/v1/rpc/consume_rate_limit') return { ok: false, status: 500, async json() { return {}; } };
    if (path.includes('client_portals?')) return { ok: true, status: 200, async json() { return []; } };
    return { ok: true, status: 200, async json() { return []; } };
  };

  const response = res();
  await portalOpenHandler(req({ token: 'unknown-token' }), response, { db });

  assert.ok(calls.includes('/rest/v1/rpc/consume_rate_limit'), 'the shared counter should be consulted');
  // 404 is the portal lookup answering — proof the request was allowed through the limiter.
  assert.equal(response.statusCode, 404);
});

test('the shared counter is not consulted once the local one has already refused', async () => {
  let rpcCalls = 0;
  const db = async (path) => {
    if (path === '/rest/v1/rpc/consume_rate_limit') {
      rpcCalls += 1;
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            allowed: true, count: 1, limit: 10, remaining: 9,
            reset_at: new Date(Date.now() + 600_000).toISOString(), retry_after_seconds: 1,
          };
        },
      };
    }
    return { ok: true, status: 200, async json() { return []; } };
  };

  // The portal-open window is ten per ten minutes. The eleventh is refused locally, and that
  // refusal must cost nothing: an attacker pays for the round trip, the database does not.
  for (let attempt = 0; attempt < 11; attempt += 1) {
    await portalOpenHandler(req({ token: `guess-${attempt}` }), res(), { db });
  }

  assert.equal(rpcCalls, 10, 'the eleventh request must be refused before reaching the database');
});

test('consumeDurableRateLimit reports null on a malformed answer instead of guessing', async () => {
  const db = async () => ({ ok: true, status: 200, async json() { return { unexpected: true }; } });
  const result = await consumeDurableRateLimit(db, {
    namespace: 'client-portal-open', ip: '203.0.113.7', limit: 10, windowMs: 600_000,
  });
  assert.equal(result, null);
});
