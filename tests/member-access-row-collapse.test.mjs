import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createAccessRow } from '../src/team/access-row.js';

// A company with a dozen members rendered a dozen open role/status/workspace forms, one under
// the other, each of them the same five selects. Reaching one person meant scrolling past all
// of them. The row now opens on click; nothing about the form itself changed, so every save
// path is untouched.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalised, because a checkout on Windows hands these back with CRLF and a slice looking
// for '\n  }\n' then finds nothing — the same trap c8526be fixed for the sidebar assertion.
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8').replace(/\r\n/g, '\n');
const main = read('src', 'main.js');
const usersPage = read('src', 'team', 'users-page.js');
const styles = read('src', 'styles.css');

const h = (value) => String(value ?? '').replace(/[&<>"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
}[char]));

function rowFor({ expanded = [], user, workspaces = 2 } = {}) {
  const state = {
    operationalWorkspaces: Array.from({ length: workspaces }, (_, index) => ({
      id: `w${index + 1}`, company_id: 'c1', status: 'active', name: `Workspace ${index + 1}`,
    })),
    memberDirectory: { expanded: new Set(expanded) },
  };
  const { renderUserAccessRow } = createAccessRow({
    companyRoles: () => [{ id: 'r1', name: 'Owner' }, { id: 'r2', name: 'Member' }],
    h,
    isLastActiveOwner: () => false,
    isPrimaryOwner: () => false,
    renderAvatar: () => '<span class="avatar"></span>',
    roleIdForName: () => 'r2',
    state,
    titleCase: (value) => value,
    workspaceMembershipForProfile: (workspaceId) => (workspaceId === 'w1' ? { status: 'active', role_id: 'r2' } : null),
    userDisplayMeta: (member) => member.email,
    userDisplayName: (member) => member.name,
    MEMBERSHIP_STATUS_OPTIONS: [['active', 'Active'], ['disabled', 'Suspended']],
    membershipStatusLabel: () => 'Active',
    workspaceAppCoverage: () => null,
  });
  return renderUserAccessRow('c1', user, true);
}

const member = { profile_id: 'p1', name: 'Jane Roe', email: 'jane@example.com', status: 'active', role: 'member' };

test('a member row is shut until it is opened', () => {
  const html = rowFor({ user: member });
  assert.doesNotMatch(html, /class="access-user-row[^"]*is-open/, 'closed is the default');
  assert.match(html, /aria-expanded="false"/);
});

test('opening one row does not open the others', () => {
  const opened = rowFor({ expanded: ['p1'], user: member });
  const other = rowFor({ expanded: ['p1'], user: { ...member, profile_id: 'p2' } });
  assert.match(opened, /class="access-user-row[^"]*is-open/);
  assert.match(opened, /aria-expanded="true"/);
  assert.doesNotMatch(other, /class="access-user-row[^"]*is-open/);
});

test('the whole identity block is the control, and it says what it controls', () => {
  const html = rowFor({ user: member });
  assert.match(html, /<button class="access-user-main" type="button" data-member-expand="p1"/);
  // Both regions it reveals, so a screen reader is told what opening the row does.
  assert.match(html, /aria-controls="access-user-p1-form access-user-p1-actions"/);
  assert.match(html, /<form class="access-role-form" id="access-user-p1-form"/);
  assert.match(html, /<div class="access-user-danger" id="access-user-p1-actions"/);
});

test('a shut row still says what the person is and how far they reach', () => {
  // Closing must not hide the two things a member list is actually scanned for.
  const html = rowFor({ user: member, workspaces: 3 });
  assert.match(html, /class="access-user-summary">Member — 1 of 3 workspaces</);
  // And it is not repeated once the form below is showing the same thing.
  assert.doesNotMatch(rowFor({ expanded: ['p1'], user: member, workspaces: 3 }), /access-user-summary/);
});

test('the form is still rendered when shut, so saving is untouched', () => {
  // Hidden in CSS rather than dropped from the markup: the submit handler, the hidden
  // company/profile inputs and every workspace checkbox stay exactly as they were.
  const html = rowFor({ user: member });
  assert.match(html, /data-user-role-form/);
  assert.match(html, /name="profile_id" value="p1"/);
  assert.match(html, /name="workspace_ids"/);
  assert.match(html, /Save role &amp; workspaces/);
});

test('a membership with no profile yet is keyed by email, so it still collapses', () => {
  const html = rowFor({ user: { profile_id: '', name: 'Pending', email: 'p@example.com', status: 'active', role: 'member' } });
  assert.match(html, /data-member-expand="p@example.com"/);
  // The id has to survive being put in an attribute and pointed at by aria-controls, so the
  // characters an email brings with it are replaced rather than emitted raw.
  assert.match(html, /aria-controls="access-user-p-example-com-form access-user-p-example-com-actions"/);
});

test('a row with nothing to key on has no toggle, and stays open', () => {
  // Better an always-open row than a control that collapses something it can never reopen.
  const html = rowFor({ user: { profile_id: '', name: 'Unknown', email: '', status: 'active', role: 'member' } });
  assert.match(html, /<div class="access-user-main">/, 'no toggle to hang the state on');
  assert.doesNotMatch(html, /data-member-expand/);
  assert.match(html, /class="access-user-row[^"]*is-open/);
});

test('the stylesheet is what hides a shut row', () => {
  assert.match(
    styles,
    /\.access-user-row:not\(\.is-open\) > \.access-role-form,\s*\.access-user-row:not\(\.is-open\) > \.access-user-danger \{\s*display: none;/,
  );
  // The caret turns over, but not for anyone who asked for less motion.
  assert.match(styles, /\.access-user-row\.is-open \.access-user-caret \{\s*transform: rotate\(180deg\);/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\) \{\s*\.access-user-caret \{\s*transition: none;/);
  // Stripping the button chrome strips the focus ring with it.
  assert.match(styles, /button\.access-user-main:focus-visible \{[^}]*outline:/);
});

test('which rows are open survives the re-render that every save causes', () => {
  // Held on state, not on the element: render() rebuilds the list, so a DOM flag would be
  // discarded the moment somebody saved a role — the row would slam shut under them.
  for (const source of [main, usersPage]) {
    assert.match(source, /expanded: new Set\(\)/);
    assert.match(source, /if \(!\(state\.memberDirectory\.expanded instanceof Set\)\) state\.memberDirectory\.expanded = new Set\(\);/);
  }
  const handler = main.slice(main.indexOf("const memberExpand = event.target.closest('[data-member-expand]')"));
  const body = handler.slice(0, handler.indexOf('\n  }\n') + 4);
  assert.match(body, /if \(expanded\.has\(key\)\) expanded\.delete\(key\);/);
  assert.match(body, /else expanded\.add\(key\);/);
  assert.match(body, /render\(\);/);
});
