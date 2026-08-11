import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Deleting an app said "App deleted." for four seconds while the page navigated away, and a
// refused delete wrote one line under three fields with nothing to say which was wrong.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const modal = readFileSync(join(root, 'src', 'workspace', 'builder-modal.js'), 'utf8');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8');

const confirmBody = () => {
  const at = main.indexOf('async function wbConfirmDeleteApp()');
  assert.notEqual(at, -1);
  return main.slice(at, main.indexOf('\n}', at));
};

test('the confirmation names the app and is held long enough to read', () => {
  // The dialog closes and the page navigates at the same moment, and the person who did it is
  // excluded from the bell notification everyone else in the workspace gets.
  const body = confirmBody();
  assert.match(body, /showToast\(`"\$\{appName\}" was deleted, with its records, fields, reports and automations\.`/);
  assert.match(body, /'App deleted', \{ duration: 7000 \}/);
});

test('the notification does not link to the app it says was removed', () => {
  const fn = main.slice(main.indexOf('function wbNotifyWorkspace('));
  const body = fn.slice(0, fn.indexOf('\n}'));
  assert.match(body, /options\.appGone\s*[\r\n]+\s*\? companyPath\('workspaces', \{ workspace_id: workspace\.id \}, companyId\)/);
  // Both delete paths pass it.
  assert.equal((main.match(/\{ appGone: true \}/g) || []).length, 2);
});

test('every refusal is announced, not only written', () => {
  const body = confirmBody();
  assert.match(body, /const refuse = \(message, field\) => \{/);
  assert.match(body, /showToast\(message, 'local', 'App not deleted'\);/);
  for (const reason of [
    /Type "\$\{String\(m\.appName \|\| ''\)\.trim\(\)\}" exactly to confirm\./,
    /Enter your password in both fields\./,
    /The two passwords do not match\./,
    /That password is not correct\. The app was not deleted\./,
  ]) assert.match(body, reason);
  // Nothing sets the error silently any more.
  assert.ok(!/m\.error = '[^']*'; render\(\);/.test(body), 'a silent refusal is what this replaced');
});

test('the refusal points at the box that is wrong', () => {
  assert.match(confirmBody(), /m\.errorField = field;/);
  assert.match(modal, /id="wbDelAppName"[^>]*aria-invalid="\$\{m\.errorField === 'name' \? 'true' : 'false'\}"/);
  assert.match(modal, /id="wbDelAppPw1"[^>]*aria-invalid="\$\{m\.errorField === 'password' \? 'true' : 'false'\}"/);
  assert.match(modal, /<div class="wb-form-error" role="alert">/, 'a refusal should be announced to a screen reader');
  assert.match(styles, /\.wb-input\.is-invalid \{/);
});

test('each confirm defines the refuse it calls', () => {
  // A patch landed the calls in wbConfirmDeleteWorkspace while the helper was only defined in
  // wbConfirmDeleteApp -- a ReferenceError the moment somebody mistyped a password, and one
  // no static assertion about the strings would have caught.
  for (const name of ['wbConfirmDeleteApp', 'wbConfirmDeleteWorkspace']) {
    const at = main.indexOf(`async function ${name}()`);
    assert.notEqual(at, -1, `${name} not found`);
    const body = main.slice(at, main.indexOf('\n}', at));
    if (!body.includes('refuse(')) continue;
    assert.match(body, /const refuse = \(message, field\) => \{/, `${name} calls refuse without defining it`);
  }
});

test('the workspace delete says the workspace was not deleted, not the app', () => {
  const at = main.indexOf('async function wbConfirmDeleteWorkspace()');
  const body = main.slice(at, main.indexOf('\n}', at));
  assert.match(body, /The workspace was not deleted\./);
  assert.ok(!/The app was not deleted\./.test(body), 'copied wording from the wrong dialog');
});
