import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};

// Creating an invite waits on a row insert, an audit write and an email provider before
// anything changes on screen. With no feedback the button looked untouched, so it got pressed
// again -- and a second press sends a second invite.

test('the submit button says it is working', () => {
  const body = fn('beginSubmitting');
  assert.match(body, /button\.disabled = true;/);
  assert.match(body, /class="btn-spinner"/);
  assert.match(body, /button\.setAttribute\('aria-busy', 'true'\)/, 'a disabled button alone says nothing to a screen reader');
});

test('the original label is restored, not guessed at', () => {
  // Rebuilding the label from a constant would drift from whatever the button actually said.
  const body = fn('beginSubmitting');
  assert.match(body, /const original = button\.innerHTML;/);
  assert.match(body, /button\.innerHTML = original;/);
});

test('a form with no submit button is handled without the caller checking', () => {
  assert.match(fn('beginSubmitting'), /if \(!button \|\| button\.disabled\) return null;/);
});

test('the busy state is always undone, including on failure', () => {
  // A failed invite that left the button dead would need a page reload to retry.
  const body = fn('saveInvite');
  assert.match(body, /\} finally \{/);
  assert.match(body, /if \(doneSubmitting\) doneSubmitting\(\);/);
  assert.ok(
    body.indexOf('try {') < body.indexOf('await client.from(\'company_invites\').insert'),
    'the network work must be inside the try',
  );
});

test('validation failures do not spin the button', () => {
  // The early returns for a missing email or workspace happen before the busy state starts.
  const body = fn('saveInvite');
  assert.ok(
    body.indexOf("state.sync = { label: 'Invite email is required'") < body.indexOf('beginSubmitting('),
    'validation comes first, so a bad form fails instantly',
  );
});

test('a second submit while one is in flight is refused', () => {
  // Enter in a text field submits a form even when its button is disabled.
  assert.match(fn('saveInvite'), /if \(formNode\?\.querySelector\?\.\('button\[type="submit"\]'\)\?\.disabled\) return;/);
});

test('resending an invite gets the same treatment', () => {
  const handler = main.slice(main.indexOf("if (action === 'send-invite-email')"));
  const body = handler.slice(0, handler.indexOf('\n  }\n'));
  assert.match(body, /if \(node\.disabled\) return;/);
  assert.match(body, /class="btn-spinner"/);
  assert.match(body, /\.finally\(\(\) => \{/, 'restored whether it succeeded or not');
});

test('the spinner is visible on any button colour', () => {
  // It was white-on-transparent, which is invisible on a plain or danger button. The helper
  // is general now, so the spinner has to be too.
  const rule = css.slice(css.indexOf('.btn-spinner {'), css.indexOf('@keyframes btnspin'));
  assert.match(rule, /border: 2px solid currentColor/);
  assert.ok(!/#fff/.test(rule), 'no hard-coded white');
});

test('a working button reads as busy rather than unavailable', () => {
  assert.match(css, /button\[aria-busy="true"\] \{ cursor: progress; opacity: 1; \}/);
});

test('the spinner respects the motion preference', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.btn-spinner \{ animation-duration: 2s; \} \}/);
});
