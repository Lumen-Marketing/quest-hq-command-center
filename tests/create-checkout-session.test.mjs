import assert from 'node:assert/strict';
import test from 'node:test';
import handler, { checkoutIdempotencyKey } from '../api/create-checkout-session.js';
import { resetRateLimits } from '../api/_lib/rate-limit.js';

const originalEnv = { ...process.env };
test.beforeEach(() => { resetRateLimits(); });
test.afterEach(() => { process.env = { ...originalEnv }; });

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

function req(body, headers = { authorization: 'Bearer t' }) {
  return { method: 'POST', url: '/api/create-checkout-session', headers: { host: 'app.example.com', ...headers }, body };
}

function baseEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
  process.env.STRIPE_SECRET_KEY = 'sk_test';
  process.env.STRIPE_PRICE_ID = 'price_1';
}

function makeDb(role = 'owner') {
  return async (path) => {
    if (path.startsWith('/rest/v1/company_memberships?')) {
      return { ok: true, async json() { return role ? [{ role }] : []; } };
    }
    return { ok: true, async json() { return []; } };
  };
}

const getUser = async () => ({ id: 'u1', email: 'owner@example.com' });
const VALID = { company_id: 'co1', request_id: 'req-abcdefgh' };

function stripeOk() {
  const calls = [];
  return {
    calls,
    fetch: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, status: 200, async json() { return { url: 'https://checkout.stripe.com/s/1' }; } };
    },
  };
}

test('happy path: returns the Stripe checkout URL', async () => {
  baseEnv();
  const stripe = stripeOk();
  const r = res();
  await handler(req(VALID), r, { db: makeDb('owner'), getUser, stripeFetch: stripe.fetch });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { url: 'https://checkout.stripe.com/s/1' });
  assert.equal(stripe.calls.length, 1);
  assert.equal(stripe.calls[0].options.headers['Idempotency-Key'].length, 64);
});

test('rejects a disallowed origin before authenticating', async () => {
  baseEnv();
  const stripe = stripeOk();
  const r = res();
  await handler(req(VALID, { authorization: 'Bearer t', origin: 'https://evil.example' }), r,
    { db: makeDb('owner'), getUser, stripeFetch: stripe.fetch });
  assert.equal(r.statusCode, 403);
  assert.equal(stripe.calls.length, 0);
});

test('requires authentication', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID), r, { db: makeDb('owner'), getUser: async () => null, stripeFetch: stripeOk().fetch });
  assert.equal(r.statusCode, 401);
});

test('rejects a member without billing permission', async () => {
  baseEnv();
  const stripe = stripeOk();
  const r = res();
  await handler(req(VALID), r, { db: makeDb('member'), getUser, stripeFetch: stripe.fetch });
  assert.equal(r.statusCode, 403);
  assert.equal(r.json().error, 'Owner/Admin billing permission required.');
  assert.equal(stripe.calls.length, 0, 'Stripe must not be called without permission');
});

test('rejects a non-member', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID), r, { db: makeDb(null), getUser, stripeFetch: stripeOk().fetch });
  assert.equal(r.statusCode, 403);
});

test('requires a stable request_id', async () => {
  baseEnv();
  const r = res();
  await handler(req({ company_id: 'co1', request_id: 'short' }), r,
    { db: makeDb('owner'), getUser, stripeFetch: stripeOk().fetch });
  assert.equal(r.statusCode, 400);
  assert.equal(r.json().error, 'A stable request_id is required.');
});

test('requires a company_id', async () => {
  baseEnv();
  const r = res();
  await handler(req({ request_id: 'req-abcdefgh' }), r,
    { db: makeDb('owner'), getUser, stripeFetch: stripeOk().fetch });
  assert.equal(r.statusCode, 400);
});

test('passes a Stripe failure status through', async () => {
  baseEnv();
  const stripeFetch = async () => ({ ok: false, status: 402, async json() { return { error: { message: 'Card declined.' } }; } });
  const r = res();
  await handler(req(VALID), r, { db: makeDb('owner'), getUser, stripeFetch });
  assert.equal(r.statusCode, 402);
  assert.equal(r.json().error, 'Card declined.');
});

test('returns 501 when Stripe is not configured', async () => {
  baseEnv();
  delete process.env.STRIPE_SECRET_KEY;
  const r = res();
  await handler(req(VALID), r, { db: makeDb('owner'), getUser, stripeFetch: stripeOk().fetch });
  assert.equal(r.statusCode, 501);
  assert.equal(r.json().error, 'Billing is not configured yet.');
});

test('rate limits repeated checkout attempts', async () => {
  baseEnv();
  const stripe = stripeOk();
  let last;
  for (let i = 0; i < 12; i += 1) {
    last = res();
    await handler(req(VALID), last, { db: makeDb('owner'), getUser, stripeFetch: stripe.fetch });
  }
  assert.equal(last.statusCode, 429);
});

test('checkoutIdempotencyKey is stable and still exported', () => {
  const args = { companyId: 'co1', userId: 'u1', priceId: 'price_1', requestId: 'req-abcdefgh' };
  assert.equal(checkoutIdempotencyKey(args), checkoutIdempotencyKey(args));
  assert.equal(checkoutIdempotencyKey(args).length, 64);
});
