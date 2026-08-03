import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const authForm = (() => {
  const at = main.indexOf('function renderSupabaseAuthForm(');
  assert.notEqual(at, -1);
  return main.slice(at, main.indexOf('\nfunction renderLocalLoginForm(', at));
})();

// Accepting an invitation with an existing account is exactly the case where someone has
// forgotten their password: they may not have signed in for months, which is often why they
// were invited again. The link was suppressed whenever an invite token was present, so
// "Invalid login credentials" on the join screen was a dead end.

test('forgot password is offered on the invite sign-in, not only the plain one', () => {
  assert.match(authForm, /<button class="auth-text-action" type="button" data-action="set-auth-mode" data-auth-mode="forgot">Forgot password\?<\/button>/);
  // The old form of this line hid it behind the invite check.
  assert.ok(
    !/\$\{inviteToken \? '' : '<button class="auth-text-action"[^']*forgot/.test(authForm),
    'the link must not be conditional on there being no invite',
  );
});

test('the reset form says the invitation survives the detour', () => {
  // Otherwise leaving the sign-in step reads as abandoning the invite.
  assert.match(authForm, /\$\{inviteToken \? `[\s\S]*?Your invitation is still waiting/);
  assert.match(authForm, /Back to sign in and join/, 'the way back names what it returns to');
});

test('the invite token is carried on the URL, so it survives the mode change', () => {
  // set-auth-mode does not navigate, and the token is read from the route each render --
  // which is what makes this safe without threading it through the reset form.
  assert.match(authForm, /const inviteToken = String\(state\.route\?\.params\?\.get\('invite'\) \|\| ''\)\.trim\(\);/);
  const handler = main.slice(main.indexOf("if (action === 'set-auth-mode')"));
  assert.ok(!/navigate\(/.test(handler.slice(0, 400)), 'changing mode must not drop the query string');
});

test('the reset link returns to the host the person is actually on', () => {
  // Unlike the invitation email, this one is built in the browser, so the current origin is
  // the right answer rather than a hard-coded domain.
  assert.match(main, /const redirectTo = `\$\{window\.location\.origin\}\$\{appHref\('\/\?auth=recovery'\)\}`;/);
});

test('the reset response does not reveal whether the account exists', () => {
  // Unchanged, but it sits right next to this work and is worth pinning.
  assert.match(main, /If an account exists for that email, a password reset link is on its way\./);
  assert.match(authForm, /The message is the same whether or not that email has an account\./);
});

test('the note is styled rather than inheriting whatever is nearby', () => {
  assert.match(css, /\.auth-note \{/);
});
