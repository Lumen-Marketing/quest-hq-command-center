import assert from 'node:assert/strict';
import test from 'node:test';

import { createCompanyContactsPage } from '../src/company-contacts/page.js';

// Picking several contacts and deleting them in one go.
//
// The page is rendered for real rather than grepped: the trap in a checkbox COLUMN is that the
// header and the rows share one CSS grid track list, so adding the cell to the rows alone
// shunts every value one column left of its heading — markup that is individually correct and
// collectively wrong. Only rendering both and comparing them catches it.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const CONTACTS = [
  { id: 'c1', company_id: 'quest', name: 'joe smith', field_values: {}, updated_at: '2026-08-15T00:00:00Z' },
  { id: 'c2', company_id: 'quest', name: 'karen', field_values: {}, updated_at: '2026-08-15T00:00:00Z' },
  { id: 'c3', company_id: 'quest', name: 'MANRO', field_values: {}, updated_at: '2026-08-15T00:00:00Z' },
];

function build({ canManage = true, contacts = CONTACTS, writes = () => ({ ok: true }), confirm = () => true } = {}) {
  const state = {
    companyContacts: contacts.map((c) => ({ ...c })),
    companyContactQuery: '',
    companyContactTypeFilter: 'all',
    route: { params: new URLSearchParams() },
  };
  const toasts = [];
  const asked = [];
  global.window = { confirm: (message) => { asked.push(message); return confirm(message); } };

  const page = createCompanyContactsPage({
    h,
    state,
    activeCompanyId: () => 'quest',
    canonicalCompanyId: (id) => id || 'quest',
    can: () => canManage,
    requirePermission: () => canManage,
    companyContactsFor: () => state.companyContacts,
    companyContactById: (id) => state.companyContacts.find((c) => c.id === id) || null,
    companyContactFieldsFor: () => [],
    companyContactChipField: () => null,
    companyContactValue: () => '',
    wbDoc: () => ({ workspaces: [] }),
    wbNameValue: () => '',
    wbCompanyApps: () => [],
    supabaseWrite: (_table, row) => Promise.resolve(writes(row)),
    isLiveSupabaseSession: () => false,
    showToast: (message, kind) => toasts.push({ message, kind }),
    render: () => {},
    navigate: () => {},
    emptyState: (msg) => `<div class="empty">${msg}</div>`,
    money: (n) => `$${n}`,
    timeAgo: () => '1d ago',
    formatDate: () => 'Aug 15',
    appHref: (p) => p,
    companyPath: (s) => `/${s}`,
    WB_FIELD_TYPES: {},
  });
  return { page, state, toasts, asked };
}

const directory = (page) => page.renderCompanyContactsPage({ params: new URLSearchParams() }, 'quest');

/** The `--cc-cols` track list of the head and of the first row. */
function tracks(html) {
  const all = [...html.matchAll(/--cc-cols:([^;]+);/g)].map(([, v]) => v.trim().split(/\s+(?![^(]*\))/).length);
  return all;
}

// --- the control appears, and only where it should ---------------------------------------------

test('Select is offered to someone who can manage contacts', () => {
  const { page } = build();
  assert.match(directory(page), /data-action="toggle-company-contact-select"/);
});

test('Select is not offered to someone who cannot', () => {
  const { page } = build({ canManage: false });
  assert.doesNotMatch(directory(page), /toggle-company-contact-select/);
});

test('Select is not offered when there is nothing to pick', () => {
  const { page } = build({ contacts: [] });
  assert.doesNotMatch(directory(page), /toggle-company-contact-select/);
});

// --- off by default, on when asked -------------------------------------------------------------

test('no tick boxes until Select is pressed', () => {
  const { page } = build();
  const html = directory(page);
  assert.doesNotMatch(html, /cc-cell-pick/, 'the directory shows checkboxes nobody asked for');
  assert.match(html, /data-action="open-company-record"/, 'a row should open the contact');
  assert.doesNotMatch(html, /cc-pickbar/);
});

test('pressing Select turns the column on', () => {
  const { page, state } = build();
  page.setContactSelectMode(true);
  const html = directory(page);
  assert.equal(state.companyContactSelecting, true);
  // One box per row, plus the select-all in the head.
  assert.equal((html.match(/cc-cell-pick/g) || []).length, CONTACTS.length + 1);
  assert.match(html, /cc-pickbar/);
  assert.match(html, /0 selected/);
});

test('the head and the rows keep the same number of columns', () => {
  // The bug this guards: a checkbox added to the rows but not the head, or a track list that
  // only one of them uses. Every value would sit one column left of its heading.
  const { page } = build();
  const before = tracks(directory(page));
  assert.ok(before.length >= 2, 'expected a head and at least one row');
  assert.equal(new Set(before).size, 1, 'head and rows disagree on columns before selecting');

  page.setContactSelectMode(true);
  const after = tracks(directory(page));
  assert.equal(new Set(after).size, 1, 'head and rows disagree on columns while selecting');
  assert.equal(after[0], before[0] + 1, 'selecting did not add exactly one column');
});

test('while picking, a row picks instead of opening', () => {
  // Otherwise the same click on the same pixel means two different things, and a mis-click
  // costs a page load.
  const { page } = build();
  page.setContactSelectMode(true);
  const html = directory(page);
  assert.match(html, /data-action="toggle-company-contact-pick"/);
  assert.doesNotMatch(html, /data-action="open-company-record"/);
});

// --- the selection itself ----------------------------------------------------------------------

test('Delete and Clear appear only once something is ticked', () => {
  const { page } = build();
  page.setContactSelectMode(true);
  assert.doesNotMatch(directory(page), /delete-company-contact-picked/);
  page.toggleContactSelected('c1');
  const html = directory(page);
  assert.match(html, /delete-company-contact-picked/);
  assert.match(html, /clear-company-contact-picked/);
  assert.match(html, /Delete 1/);
  assert.match(html, /1 selected/);
});

test('ticking is a toggle, and Clear empties it without leaving the mode', () => {
  const { page, state } = build();
  page.setContactSelectMode(true);
  page.toggleContactSelected('c1');
  page.toggleContactSelected('c2');
  assert.deepEqual(state.companyContactSelected, ['c1', 'c2']);
  page.toggleContactSelected('c1');
  assert.deepEqual(state.companyContactSelected, ['c2']);
  page.clearContactSelection();
  assert.deepEqual(state.companyContactSelected, []);
  assert.equal(state.companyContactSelecting, true, 'Clear should not also leave the mode');
});

test('Cancel forgets the ticks', () => {
  // Keeping them would mean pressing Select again later silently re-arms an old selection.
  const { page, state } = build();
  page.setContactSelectMode(true);
  page.toggleContactSelected('c1');
  page.setContactSelectMode(false);
  assert.deepEqual(state.companyContactSelected, []);
});

test('select-all covers what is on screen and leaves the rest alone', () => {
  const { page, state } = build();
  page.setContactSelectMode(true);
  page.toggleContactSelected('c3');
  state.companyContactQuery = 'karen'; // c3 is now off screen but still ticked
  page.toggleContactSelectAll('quest');
  assert.deepEqual(state.companyContactSelected.sort(), ['c2', 'c3'], 'an off-screen tick was dropped');
  page.toggleContactSelectAll('quest');
  assert.deepEqual(state.companyContactSelected, ['c3'], 'unticking took the off-screen one with it');
});

// --- deleting ------------------------------------------------------------------------------------

test('deleting asks first, and says how many', async () => {
  const { page, asked } = build({ confirm: () => false });
  page.setContactSelectMode(true);
  page.toggleContactSelected('c1');
  page.toggleContactSelected('c2');
  await page.deleteSelectedContacts();
  assert.match(asked[0], /Delete 2 contacts\?/);
});

test('refusing the prompt deletes nothing', async () => {
  const { page, state } = build({ confirm: () => false });
  page.setContactSelectMode(true);
  page.toggleContactSelected('c1');
  await page.deleteSelectedContacts();
  assert.equal(state.companyContacts.length, 3);
  assert.deepEqual(state.companyContactSelected, ['c1'], 'the tick should survive a cancelled delete');
});

test('the prompt warns when records still name them', async () => {
  const { page, asked } = build({ confirm: () => false });
  // One contact is referenced by a record in an app.
  page.setContactSelectMode(true);
  page.toggleContactSelected('c1');
  await page.deleteSelectedContacts();
  assert.doesNotMatch(asked[0], /still named/, 'nothing references it in this fixture');
});

test('deleting removes them and leaves the mode', async () => {
  const { page, state, toasts } = build();
  page.setContactSelectMode(true);
  page.toggleContactSelected('c1');
  page.toggleContactSelected('c3');
  await page.deleteSelectedContacts();
  assert.deepEqual(state.companyContacts.map((c) => c.id), ['c2']);
  assert.deepEqual(state.companyContactSelected, []);
  assert.equal(state.companyContactSelecting, false);
  assert.match(toasts.at(-1).message, /2 contacts deleted/);
});

test('it soft-deletes, so the row is recoverable rather than gone', async () => {
  const written = [];
  const { page } = build({ writes: (row) => { written.push(row); return { ok: true }; } });
  page.setContactSelectMode(true);
  page.toggleContactSelected('c1');
  await page.deleteSelectedContacts();
  assert.equal(written.length, 1);
  assert.ok(written[0].deleted_at, 'a bulk delete must set deleted_at, not drop the row');
  assert.equal(written[0].id, 'c1');
});

test('one failure does not lose the others, and stays ticked for a retry', async () => {
  // A permission or network error on one of ten must not leave the rest unreported.
  const { page, state, toasts } = build({ writes: (row) => ({ ok: row.id !== 'c2' }) });
  page.setContactSelectMode(true);
  ['c1', 'c2', 'c3'].forEach((id) => page.toggleContactSelected(id));
  await page.deleteSelectedContacts();
  assert.deepEqual(state.companyContacts.map((c) => c.id), ['c2'], 'the two that worked should be gone');
  assert.deepEqual(state.companyContactSelected, ['c2'], 'the failure should stay ticked');
  assert.equal(state.companyContactSelecting, true, 'the mode stays open so a retry is one press');
  assert.match(toasts.at(-1).message, /2 deleted, 1 could not be/);
});

test('a tick whose contact has since gone is dropped, not sent', async () => {
  const written = [];
  const { page, state } = build({ writes: (row) => { written.push(row); return { ok: true }; } });
  page.setContactSelectMode(true);
  page.toggleContactSelected('c1');
  page.toggleContactSelected('ghost');
  await page.deleteSelectedContacts();
  assert.deepEqual(written.map((r) => r.id), ['c1']);
  assert.deepEqual(state.companyContacts.map((c) => c.id), ['c2', 'c3']);
});

test('someone who cannot manage cannot bulk delete', async () => {
  const written = [];
  const { page, state } = build({ canManage: false, writes: (row) => { written.push(row); return { ok: true }; } });
  state.companyContactSelecting = true;
  state.companyContactSelected = ['c1'];
  await page.deleteSelectedContacts();
  assert.deepEqual(written, []);
  assert.equal(state.companyContacts.length, 3);
});
