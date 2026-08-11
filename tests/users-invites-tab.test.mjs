import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// The Users page is a fetched module now; same surface, read as one.
const main = (readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/team/users-page.js', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// LAST occurrence: main.js keeps a loader shim of the same name, and the real body is in the
// fetched module appended after it. The old end-marker lived in main.js too, so bound the
// slice on the module's own closing instead.
const usersPage = (() => {
  const at = main.lastIndexOf('function renderUsersPage(');
  assert.notEqual(at, -1);
  const end = main.indexOf('\n  }', at);
  return main.slice(at, end === -1 ? undefined : end);
})();

// --- the tab ---------------------------------------------------------------------------

test('Users has three tabs, and the new one is routable', () => {
  assert.match(usersPage, /\['members', 'access', 'invites'\]\.includes\(route\.params\.get\('tab'\)\)/);
  assert.match(usersPage, /companyPath\('users', \{ tab: 'invites' \}, companyId\)/);
});

test('an unknown tab still falls back to members', () => {
  assert.match(usersPage, /: 'members';/);
});

test('the tab says how many things are waiting', () => {
  // An invitation nobody has accepted and a request nobody has answered are both waiting on
  // someone here; a tab you must open to discover that is a tab you forget to open.
  assert.match(usersPage, /`Invites\$\{companyInvites\(companyId\)\.length \+ pendingRequests\.length \? ` \(\$\{companyInvites\(companyId\)\.length \+ pendingRequests\.length\}\)` : ''\}`/);
});

test('invites and join requests moved off the Access tab', () => {
  const invitesTab = usersPage.slice(usersPage.indexOf("tab === 'invites' ?"), usersPage.indexOf('` : `\n    <section class="dashboard-grid compact-settings-grid">'));
  assert.match(invitesTab, /<h2>Invites<\/h2>/);
  assert.match(invitesTab, /<h2>Join requests<\/h2>/);
  // Access keeps member roles and the access model, and nothing about getting people in.
  const accessTab = usersPage.slice(usersPage.lastIndexOf('<section class="dashboard-grid compact-settings-grid">'));
  assert.match(accessTab, /<h2>Member access<\/h2>/);
  assert.match(accessTab, /<h2>Access model<\/h2>/);
  assert.ok(!/<h2>Invites<\/h2>/.test(accessTab), 'Invites must not still be on Access');
  assert.ok(!/<h2>Join requests<\/h2>/.test(accessTab), 'Join requests must not still be on Access');
});

test('the Invite button still lives with the invites', () => {
  const invitesTab = usersPage.slice(usersPage.indexOf("tab === 'invites' ?"));
  assert.match(invitesTab.slice(0, 1400), /data-action="open-invite-form"/);
});

// --- the member row -----------------------------------------------------------------------

test('no select is given a height its own padding cannot fit', () => {
  // height: 32px against the base select's 10px padding and inherited 15px text sliced the
  // chosen role through the middle, so nobody could read which role was set.
  const rule = css.match(/\.workspace-access-assignment select \{[^}]*\}/)[0];
  // line-height is fine; a fixed box height is not.
  assert.ok(!/\n\s*height:/.test(rule), 'size it by padding and let the height follow');
  assert.match(rule, /padding: 6px 8px/);
  assert.match(rule, /font-size: 13px/);
});

test('the member row stacks instead of squeezing the controls into a third', () => {
  // Side by side, the controls were four rows tall against a two-line name: a block of empty
  // row under every member, and the selects crushed.
  const rule = css.slice(css.indexOf('.access-user-row {'));
  const body = rule.slice(0, rule.indexOf('}'));
  assert.match(body, /grid-template-columns: 42px minmax\(0, 1fr\);/);
  assert.match(css, /\.access-role-form \{ grid-area: 2 \/ 2; \}/);
});

test('the email is readable rather than tiny bold grey', () => {
  // Matched by its full selector group: ".access-user-main span," alone also appears in the
  // earlier ellipsis rule, and slicing from there reads the wrong body.
  const rule = css.match(/\.access-user-main span,\n\.access-request-row span,\n\.access-invite-row span \{[^}]*\}/)[0];
  assert.match(rule, /color: var\(--ink-2\)/);
  assert.ok(!/font-weight: 800/.test(rule), 'bold at 12px in muted grey is the worst of both');
});

test('the last-owner warning wraps and reads as a warning', () => {
  const rule = css.slice(css.indexOf('.access-note {'));
  const body = rule.slice(0, rule.indexOf('}'));
  assert.match(body, /white-space: normal/, 'it is a full sentence, not a truncated label');
  assert.match(body, /background: color-mix/);
});

test('the role control is capped rather than stretched across the panel', () => {
  // The layout rule, not the one-line `.access-role-form { grid-area: 2 / 2; }` placement.
  const rule = css.match(/\.access-role-form \{\n  display: grid;[\s\S]*?\n\}/)[0];
  assert.match(rule, /grid-template-columns: minmax\(0, 340px\) 118px;/);
  assert.match(rule, /justify-content: start/);
});
