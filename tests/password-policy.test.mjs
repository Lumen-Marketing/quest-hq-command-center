import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  PASSWORD_MIN_LENGTH,
  passwordBreachCount,
  passwordPolicy,
  passwordPolicyAsync,
  passwordRequirements,
} from '../src/auth/password-policy.js';

const app = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

// SHA-1("Roofing-Quest-2026") — split the way the k-anonymity API expects.
const KNOWN = { password: 'Roofing-Quest-2026' };
const sha1 = async (text) => {
  const d = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};

/** Stub HIBP: serves `suffixes` for any prefix, and records what was requested. */
function stubHibp(suffixes, { status = 200 } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: status === 200,
      status,
      text: async () => suffixes.join('\n'),
    };
  };
  return { fetchImpl, calls };
}

test('password policy requires length and a balanced character mix', () => {
  assert.equal(PASSWORD_MIN_LENGTH, 12);
  assert.equal(passwordPolicy('short').valid, false);
  assert.equal(passwordPolicy('alllowercasebutlong').valid, false);
  assert.equal(passwordPolicy('Roofing-Quest-2026').valid, true);
  assert.ok(passwordRequirements().length >= 4);
});

test('breach check sends only the 5-char hash prefix, never the password', async () => {
  const hash = await sha1(KNOWN.password);
  const { fetchImpl, calls } = stubHibp([]);

  await passwordBreachCount(KNOWN.password, fetchImpl);

  assert.equal(calls.length, 1);
  const { url, init } = calls[0];
  assert.ok(url.endsWith(hash.slice(0, 5)), 'request must be the 5-char prefix');
  assert.ok(!url.includes(KNOWN.password), 'password must never appear in the request');
  assert.ok(!url.includes(hash.slice(5)), 'hash suffix must never leave the client');
  assert.equal(init.headers['Add-Padding'], 'true', 'padding hides the response size');
});

test('a password present in the corpus is reported with its count', async () => {
  const hash = await sha1(KNOWN.password);
  const { fetchImpl } = stubHibp([`${hash.slice(5)}:4213`, 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:9']);

  assert.equal(await passwordBreachCount(KNOWN.password, fetchImpl), 4213);

  const policy = await passwordPolicyAsync(KNOWN.password, { fetchImpl });
  assert.equal(policy.valid, false);
  assert.equal(policy.breached, true);
  assert.match(policy.issues[0], /known data breach/i);
});

test('padding entries (count 0) are not treated as breaches', async () => {
  const hash = await sha1(KNOWN.password);
  // HIBP's Add-Padding filler uses a count of 0; it must not read as "breached".
  const { fetchImpl } = stubHibp([`${hash.slice(5)}:0`]);

  assert.equal(await passwordBreachCount(KNOWN.password, fetchImpl), 0);
  const policy = await passwordPolicyAsync(KNOWN.password, { fetchImpl });
  assert.equal(policy.valid, true);
  assert.equal(policy.breached, false);
});

test('a clean password passes and is marked as actually checked', async () => {
  const { fetchImpl } = stubHibp(['ABCDEF0123456789ABCDEF0123456789ABC:12']);
  const policy = await passwordPolicyAsync(KNOWN.password, { fetchImpl });

  assert.equal(policy.valid, true);
  assert.equal(policy.breached, false);
  assert.equal(policy.checked, true);
});

test('breach check FAILS OPEN when the API is unreachable', async () => {
  // A third-party outage must not block signup. Local rules still apply.
  const down = async () => { throw new Error('ENOTFOUND api.pwnedpasswords.com'); };

  const good = await passwordPolicyAsync(KNOWN.password, { fetchImpl: down });
  assert.equal(good.valid, true, 'a locally-valid password is accepted when HIBP is down');
  assert.equal(good.checked, false, 'but we record that it was never verified');

  const weak = await passwordPolicyAsync('short', { fetchImpl: down });
  assert.equal(weak.valid, false, 'local rules are never skipped, outage or not');
});

test('an HTTP error from the API also fails open, not closed', async () => {
  const { fetchImpl } = stubHibp([], { status: 503 });
  const policy = await passwordPolicyAsync(KNOWN.password, { fetchImpl });
  assert.equal(policy.valid, true);
  assert.equal(policy.checked, false);
});

test('weak passwords short-circuit before any network call is made', async () => {
  const { fetchImpl, calls } = stubHibp([]);
  const policy = await passwordPolicyAsync('short', { fetchImpl });

  assert.equal(policy.valid, false);
  assert.equal(calls.length, 0, 'must not call HIBP for a password that already failed local rules');
});

test('signup and password recovery both enforce the breach check', () => {
  assert.match(app, /await passwordPolicyAsync\(password\)/);
  assert.match(app, /Checking password against known breaches/);
});

test('auth UI supports neutral recovery request and recovery-link password update', () => {
  assert.match(app, /PASSWORD_RECOVERY/);
  assert.match(app, /resetPasswordForEmail/);
  assert.match(app, /If an account exists for that email, a password reset link is on its way\./);
  assert.match(app, /data-auth-forgot-form/);
  assert.match(app, /data-auth-update-password-form/);
  assert.match(app, /auth\.updateUser/);
});

test('password inputs expose show and hide controls', () => {
  assert.match(app, /data-action="toggle-password"/);
  assert.match(app, /aria-label="Show password"/);
});
