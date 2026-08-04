import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
// The forms that call the buttons moved to their own fetched-on-demand module; the button
// builder itself stayed in main.js.
const authForm = readFileSync(new URL('../src/ui/auth-form.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};

// Joining by invitation had no social option: the buttons were rendered only when there was
// no invite token, so the one flow where a brand-new person creates an account was also the
// one flow that forced them to invent a password.

test('social sign-in is offered on both invite forms', () => {
  const calls = [...authForm.matchAll(/renderAuthOAuthButtons\(inviteToken \? \(inviteLookupForToken\(inviteToken\)\?\.email \|\| ''\) : ''\)/g)];
  assert.equal(calls.length, 2, 'sign-in and create-account both need it');
  assert.ok(!/inviteToken \? '' : renderAuthOAuthButtons/.test(authForm), 'the old suppression must be gone');
});

test('the invite rides along through the provider redirect', () => {
  // The provider sends the browser away and back; anything not in redirectTo is gone by
  // then, and the person would return signed in with no invitation to accept.
  const body = fn('startOAuthSignIn');
  assert.match(body, /const inviteToken = String\(state\.route\?\.params\?\.get\('invite'\) \|\| ''\)\.trim\(\);/);
  assert.match(body, /\$\{inviteToken \? `\?invite=\$\{encodeURIComponent\(inviteToken\)\}` : ''\}/);
});

test('returning with a session and an invite accepts it', () => {
  // There is no button left to press: the auth modal belongs to the signed-out page they
  // have just left.
  const body = fn('acceptInviteFromUrl');
  assert.match(body, /if \(!isLiveSupabaseSession\(\)\) return false;/);
  assert.match(body, /acceptCompanyInvite\(token\)/);
  assert.match(main, /if \(session && acceptInviteFromUrl\(\)\) return;/, 'wired into the auth state change');
  assert.match(main, /if \(!acceptInviteFromUrl\(\)\) render\(\);/, 'and into the boot path, which can land first');
});

test('it does not try twice for one sign-in', () => {
  // onAuthStateChange can fire more than once, and the second accept raises "already an
  // active company member" -- an error message for something that worked.
  const body = fn('acceptInviteFromUrl');
  assert.match(body, /if \(!token \|\| token === invitePickedUp\) return false;/);
  assert.match(body, /invitePickedUp = token;/);
  // A genuine failure has to be retryable, so the guard is released on error.
  assert.match(body, /invitePickedUp = '';/);
});

test('a failure is shown rather than swallowed', () => {
  // The usual cause is signing in with a different account than the one invited.
  assert.match(fn('acceptInviteFromUrl'), /state\.loginError = error\?\.message \|\| 'Unable to accept invite\.'/);
});

test('the invited address is named before an account is chosen', () => {
  // The database refuses a mismatch with "Invite was sent to a different email address",
  // which is a poor way to find out you picked the wrong Google profile.
  const body = fn('renderAuthOAuthButtons');
  assert.match(body, /function renderAuthOAuthButtons\(invitedEmail = ''\)/);
  assert.match(body, /the invitation is tied to that address/);
  assert.match(css, /\.auth-sso-note \{/);
});

test('no providers configured still renders nothing', () => {
  // Apple is deliberately hidden until enrolment; an empty group would leave a stray divider.
  assert.match(fn('renderAuthOAuthButtons'), /if \(!providers\.length\) return '';/);
});
