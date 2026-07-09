import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PASSWORD_MIN_LENGTH, passwordPolicy, passwordRequirements } from '../src/auth/password-policy.js';

const app = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('password policy requires length and a balanced character mix', () => {
  assert.equal(PASSWORD_MIN_LENGTH, 12);
  assert.equal(passwordPolicy('short').valid, false);
  assert.equal(passwordPolicy('alllowercasebutlong').valid, false);
  assert.equal(passwordPolicy('Roofing-Quest-2026').valid, true);
  assert.ok(passwordRequirements().length >= 4);
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
