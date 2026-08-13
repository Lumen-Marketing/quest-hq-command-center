import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createCompanyContactsPage } from '../src/company-contacts/page.js';

// "When the data I input in that field does not exist in the Company Contacts records, or there
// are no records at all, and I still Save it, it will create a record in Company Contacts with
// just what I inputted, so other fields are blank and I will manually edit it."
//
// Somebody filling in a workspace record types a customer who is not in the directory yet.
// Refusing the link leaves the record pointing at nobody; making them stop and open Company
// Contacts loses what they were doing.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const page = readFileSync(join(root, 'src', 'company-contacts', 'page.js'), 'utf8');

const build = ({ canManage = true, writeOk = true } = {}) => {
  const state = { companyContacts: [], companyContactFields: [], companyContactOptions: [] };
  const writes = [];
  const toasts = [];
  const page = createCompanyContactsPage({
    activeCompanyId: () => 'co',
    appHref: (p) => p,
    can: () => canManage,
    canonicalCompanyId: (id) => id || 'co',
    companyContactById: (id) => state.companyContacts.find((c) => c.id === id) || null,
    companyContactChipField: () => null,
    companyContactFieldsFor: () => [],
    companyContactValue: () => '',
    companyContactsFor: (id) => state.companyContacts.filter((c) => c.company_id === (id || 'co')),
    companyPath: (s) => `/${s}`,
    emptyState: () => '',
    createSupabaseClient: () => null,
    h: (v) => String(v ?? ''),
    isLiveSupabaseSession: () => false,
    money: (n) => `$${n}`,
    navigate: () => {},
    normalizeCompanyContact: (input) => ({ ...input }),
    normalizeCompanyContactField: (input) => ({ ...input }),
    render: () => {},
    requirePermission: () => canManage,
    showToast: (message) => toasts.push(message),
    state,
    supabaseRow: (row, cols) => Object.fromEntries(cols.map((c) => [c, row[c]])),
    supabaseWrite: async (table, row) => { writes.push({ table, row }); return { ok: writeOk, data: null }; },
    timeAgo: () => 'now',
    wbDoc: () => ({ workspaces: [] }),
    wbFieldBuilderMarkup: () => '',
    wbFileIcon: () => 'ti-file',
    wbFileValues: () => [],
    wbFmtDuration: () => '',
    wbNameValue: () => '',
    wbOptRow: () => '',
    acceptAttr: () => '',
    fileTypeKind: () => 'doc',
    formatDate: (v) => String(v),
    WB_FIELD_TYPES: {},
    COMPANY_CONTACT_COLS: ['id', 'company_id', 'name', 'field_values', 'updated_at'],
    COMPANY_CONTACT_FIELD_COLS: ['id', 'company_id', 'label', 'type', 'config', 'required', 'hidden', 'position'],
    COMPANY_CONTACT_FIELD_TYPES: ['text'],
  });
  return { page, state, writes, toasts };
};

test('a typed name becomes a contact, every other field blank', async () => {
  const { page, state, writes } = build();
  const contact = await page.createCompanyContactNamed('co', '  Kevin Henderson ');
  assert.equal(contact.name, 'Kevin Henderson', 'trimmed');
  assert.deepEqual(contact.field_values, {}, 'nothing invented — the rest is filled in later');
  assert.equal(writes.length, 1);
  assert.equal(writes[0].table, 'company_contacts');
  assert.equal(state.companyContacts.length, 1, 'and it is in the directory straight away');
});

test('an empty directory is not a special case', () => {
  // "or totally no records" — the first contact a company ever has is made this way.
  const { state } = build();
  assert.deepEqual(state.companyContacts, []);
});

test('an existing contact of the same name is reused, not duplicated', async () => {
  const { page, state, writes } = build();
  state.companyContacts.push({ id: 'cc-1', company_id: 'co', name: 'Kevin Henderson', field_values: {} });
  const contact = await page.createCompanyContactNamed('co', 'kevin henderson');
  assert.equal(contact.id, 'cc-1', 'matched case-insensitively');
  assert.equal(writes.length, 0, 'nothing was written');
  assert.equal(state.companyContacts.length, 1);
});

test('a blank name creates nothing', async () => {
  const { page, writes } = build();
  assert.equal(await page.createCompanyContactNamed('co', '   '), null);
  assert.equal(writes.length, 0);
});

test('somebody who cannot manage contacts creates none', async () => {
  const { page, writes } = build({ canManage: false });
  assert.equal(await page.createCompanyContactNamed('co', 'Kevin Henderson'), null);
  assert.equal(writes.length, 0);
});

test('the new id is written back into the form that is still on screen', async () => {
  const { page, toasts } = build();
  const idField = { value: '' };
  const made = await page.createMissingContacts('co', [{ name: 'Kevin Henderson', idField }]);
  assert.equal(made, true);
  assert.match(idField.value, /^cc-/, 'the record now links to the contact it just made');
  assert.match(toasts[0], /Added Kevin Henderson to Company Contacts/);
});

test('a failed write leaves the link empty rather than inventing one', async () => {
  // The record still saves. Pointing at something that was never stored would be worse.
  const { page } = build({ writeOk: false });
  const idField = { value: '' };
  assert.equal(await page.createMissingContacts('co', [{ name: 'Kevin Henderson', idField }]), true);
  assert.equal(idField.value, '');
});

test('two pending names are created one after another, not in a race', async () => {
  const { page, state } = build();
  const a = { value: '' };
  const b = { value: '' };
  await page.createMissingContacts('co', [{ name: 'Ana Reyes', idField: a }, { name: 'Ben Cruz', idField: b }]);
  assert.equal(state.companyContacts.length, 2);
  assert.notEqual(a.value, b.value);
  // The same name twice must resolve to one contact, which only holds if they run in order.
  const c = { value: '' };
  const d = { value: '' };
  await page.createMissingContacts('co', [{ name: 'Same Person', idField: c }, { name: 'same person', idField: d }]);
  assert.equal(c.value, d.value);
  assert.equal(state.companyContacts.length, 3);
});

test('save creates the missing ones first, then comes back through', () => {
  // The form is untouched in between, so nothing typed into it is lost, and the second pass
  // finds nothing pending — which is what stops it looping.
  // A cheap sync guard stays in the entry bundle: an app with no contact picker never fetches
  // the module. The scan for unlinked names moved into it, beside the write path.
  assert.match(main, /if \(document\.querySelector\('\[data-wb-cc-picker\] \[data-wb-cc-name\]'\)\) \{/);
  assert.match(main, /wbCreateMissingContacts\(companyId\)\s*\r?\n\s*\.then\(\(made\) => \{ if \(made\) wbSubmitModal\(\); \}\)/);
  // A name with no id is the state syncCompanyContactPicker deliberately leaves behind.
  assert.match(page, /entry\.name && entry\.idField && !entry\.idField\.value/);
});
