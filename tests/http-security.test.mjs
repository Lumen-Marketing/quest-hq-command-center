import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { clientIp, readJsonBody, safeReturnUrl } from '../api/_lib/http-security.js';
import { consumeRateLimit, rateLimitWindowCount, resetRateLimits } from '../api/_lib/rate-limit.js';
import { checkoutIdempotencyKey } from '../api/create-checkout-session.js';
import { normalizeStripeSubscriptionStatus, verifyStripeSignature } from '../api/stripe-webhook.js';

const stripeWebhookSource = readFileSync(new URL('../api/stripe-webhook.js', import.meta.url), 'utf8');

test('bounded JSON parsing rejects oversized pre-parsed and string bodies', async () => {
  await assert.rejects(() => readJsonBody({ body: { value: 'x'.repeat(100) } }, { maxBytes: 32 }), (error) => error.statusCode === 413);
  await assert.rejects(() => readJsonBody({ body: JSON.stringify({ value: 'x'.repeat(100) }) }, { maxBytes: 32 }), (error) => error.statusCode === 413);
  assert.deepEqual(await readJsonBody({ body: '{"ok":true}' }, { maxBytes: 32 }), { ok: true });
});

test('client IP uses the first normalized forwarded address', () => {
  assert.equal(clientIp({ headers: { 'x-forwarded-for': '::ffff:203.0.113.7, 10.0.0.1' } }), '203.0.113.7');
  assert.equal(clientIp({ headers: {}, socket: { remoteAddress: '2001:db8::1' } }), '2001:db8::1');
});

test('rate limiter has deterministic fixed windows and retry metadata', () => {
  resetRateLimits();
  assert.deepEqual(consumeRateLimit({ key: 'submit:ip', limit: 2, windowMs: 1000, now: 100 }), { allowed: true, limit: 2, remaining: 1, retryAfterSeconds: 0, resetAt: 1100 });
  assert.equal(consumeRateLimit({ key: 'submit:ip', limit: 2, windowMs: 1000, now: 200 }).allowed, true);
  const blocked = consumeRateLimit({ key: 'submit:ip', limit: 2, windowMs: 1000, now: 300 });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 1);
  assert.equal(consumeRateLimit({ key: 'submit:ip', limit: 2, windowMs: 1000, now: 1200 }).allowed, true);
});

test('rate limiter bounds its per-instance memory', () => {
  resetRateLimits();
  for (let index = 0; index < 10_100; index += 1) {
    consumeRateLimit({ key: `ip:${index}`, limit: 1, windowMs: 60_000, now: 100 });
  }
  assert.ok(rateLimitWindowCount() <= 10_000);
});

test('Stripe return URLs are restricted to configured Quest HQ origins', () => {
  const request = { headers: { origin: 'https://quest-hq-command-center-gamma.vercel.app' } };
  assert.equal(safeReturnUrl('https://evil.example/phish', request), 'https://quest-hq-command-center-gamma.vercel.app/');
  assert.equal(safeReturnUrl('https://quest-hq-command-center-gamma.vercel.app/company/lumen/settings?tab=billing&next=https://evil.example', request), 'https://quest-hq-command-center-gamma.vercel.app/company/lumen/settings?tab=billing');
});

test('checkout idempotency is stable for the same request and changes for a new request', () => {
  const first = checkoutIdempotencyKey({ companyId: 'lumen', userId: 'user-1', priceId: 'price-1', requestId: 'request-1' });
  assert.equal(first, checkoutIdempotencyKey({ companyId: 'lumen', userId: 'user-1', priceId: 'price-1', requestId: 'request-1' }));
  assert.notEqual(first, checkoutIdempotencyKey({ companyId: 'lumen', userId: 'user-1', priceId: 'price-1', requestId: 'request-2' }));
});

test('Stripe verification accepts any valid v1 signature and rejects stale timestamps', () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  const body = '{"id":"evt_1"}';
  const nowSeconds = 2_000_000_000;
  const signature = crypto.createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET).update(`${nowSeconds}.${body}`).digest('hex');
  assert.doesNotThrow(() => verifyStripeSignature(body, `t=${nowSeconds},v1=bad,v1=${signature}`, { nowMs: nowSeconds * 1000 }));
  assert.throws(() => verifyStripeSignature(body, `t=${nowSeconds - 301},v1=${signature}`, { nowMs: nowSeconds * 1000 }), /timestamp/i);
});

test('Stripe subscription states map to the database access model', () => {
  assert.equal(normalizeStripeSubscriptionStatus('trialing'), 'trialing');
  assert.equal(normalizeStripeSubscriptionStatus('active'), 'active');
  assert.equal(normalizeStripeSubscriptionStatus('past_due'), 'past_due');
  assert.equal(normalizeStripeSubscriptionStatus('canceled'), 'canceled');
  assert.equal(normalizeStripeSubscriptionStatus('unpaid'), 'suspended');
  assert.equal(normalizeStripeSubscriptionStatus('incomplete_expired'), 'suspended');
  assert.equal(normalizeStripeSubscriptionStatus('paused'), 'suspended');
  assert.equal(normalizeStripeSubscriptionStatus('unexpected'), 'incomplete');
});

test('checkout completion retries when Stripe cannot resolve its subscription', () => {
  assert.match(stripeWebhookSource, /object\.object !== 'subscription'[\s\S]*!subscription[\s\S]*throw new Error/);
});
