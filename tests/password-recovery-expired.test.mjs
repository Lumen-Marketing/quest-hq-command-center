import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// The auth forms are their own fetched-on-demand module now; the whole file is them.
const authForm = readFileSync(new URL('../src/ui/auth-form.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// Comments stripped: the block carries a note explaining the old wording, and asserting that
// the wording is gone would otherwise match the explanation of why it went.
const recovery = authForm
  .slice(authForm.indexOf("if (state.authMode === 'recovery')"), authForm.indexOf("if (state.authMode === 'register')"))
  .replace(/^\s*\/\/[^\n]*$/gm, '');

// A Supabase reset link is single-use. Production logs showed the shape exactly:
//   /recover  user_recovery_requested + mail.send
//   /verify   login                              <- first click worked
//   /verify   403 "One-time token not found"     <- second click
//   /verify   403 "One-time token not found"     <- third click
// The screen claimed "Your recovery link has been verified" for all of them, because it read
// that from ?auth=recovery in the URL rather than from a session. The only sign anything was
// wrong was "Auth session missing!" after typing a new password twice.

test('the recovery screen checks for the session the link was meant to create', () => {
  assert.match(recovery, /if \(!isLiveSupabaseSession\(\)\) \{/);
  assert.ok(
    recovery.indexOf('isLiveSupabaseSession()') < recovery.indexOf('data-auth-update-password-form'),
    'the check must come before the form is offered',
  );
});

test('an expired link says so instead of claiming it was verified', () => {
  const expired = recovery.slice(0, recovery.indexOf('<form'));
  assert.match(expired, /This reset link has expired/);
  assert.match(expired, /Reset links work once/);
  assert.ok(!/has been verified/.test(expired), 'the expired branch must not claim verification');
});

test('and offers the way out rather than a dead end', () => {
  const expired = recovery.slice(0, recovery.indexOf('<form'));
  assert.match(expired, /data-auth-mode="forgot">Send a new reset link/);
  assert.match(expired, /data-auth-mode="signin">Back to sign in/);
  // No form, so nothing to submit into a session that does not exist.
  assert.ok(!/<form/.test(expired), 'an unusable form is worse than no form');
});

test('a valid link still gets the password form', () => {
  // The regression to avoid: a recovery session is a real session, so this must not send
  // someone with a working link to the expired screen.
  assert.match(recovery, /data-auth-update-password-form/);
  assert.match(recovery, /Your recovery link has been verified/);
  assert.match(main, /function isLiveSupabaseSession\(\) \{\n  return state\.session\?\.auth === 'supabase' && !isReadOnlyDemo\(\);/);
});

test('the recovery event sets the session before it re-renders', () => {
  // Otherwise the check above would race the session and show "expired" on a good link.
  const handler = main.slice(main.indexOf("if (event === 'PASSWORD_RECOVERY')"));
  const body = handler.slice(0, handler.indexOf('return;'));
  assert.match(body, /setSupabaseSession\(session \|\| null\)\.finally\(\(\) => navigate\('\/\?auth=recovery', \{ replace: true \}\)\)/);
});

test('the reset request itself is unchanged and still non-enumerating', () => {
  assert.match(main, /If an account exists for that email, a password reset link is on its way\./);
});
