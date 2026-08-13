import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { contactUsage, itemTitle } from '../src/company-contacts/model.js';

// An Underwriter case read as "Case -ff7" on the contact card.
//
// itemTitle took the app's first TEXT field, and an Underwriter case has no text in it — its
// Case #, Contact, Decision and Priced on are all filled, and none of them is text. So it fell
// through to recordName + the id's tail, which names nothing.
//
// It now walks every field in the order the app arranges them, which is the same answer the App
// Builder gives a record everywhere else.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const page = readFileSync(join(root, 'src', 'company-contacts', 'page.js'), 'utf8');

// The App Builder's own formatter, lifted rather than reimplemented: a copy would pass against
// a renderer the app no longer uses.
const cut = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}\n', at) + 3);
};
const wbNameValue = Function(`
  const wbLocateApp = () => ({ companyId: 'co', workspace: null });
  const wbMemberById = (companyId, id) => ({ id, name: 'Ana Reyes' });
  const wbRelTargetApp = () => null;
  const wbAutoNumberText = (field, raw) => (raw ? \`\${field.config.prefix || ''}\${String(raw).padStart(field.config.padding || 0, '0')}\` : '');
  const companyContactById = (id) => (id === 'cc-1' ? { id, name: 'Roman Juan I Gamboa Eugenio' } : null);
  ${cut('wbNameValue')}
  return wbNameValue;
`)();

// The Underwriter app as shipped: no text field carries anything.
const UNDERWRITER = {
  id: 'app-uw',
  name: 'Underwriter',
  recordName: 'Case',
  fields: [
    { id: 'f-case', type: 'autonumber', label: 'Case #', config: { prefix: 'UW-', padding: 4 } },
    { id: 'f-contact', type: 'company_contact', label: 'Contact', config: {} },
    { id: 'f-decision', type: 'status', label: 'Decision', config: { options: [{ id: 'd1', label: 'Draft', color: '#64748b' }] } },
    { id: 'f-priced', type: 'date', label: 'Priced on', config: {} },
    { id: 'f-notes', type: 'textarea', label: 'Decision notes', config: {} },
  ],
  items: [],
};
const CASE = {
  id: 'wb-abc-ff7',
  values: { 'f-case': 1, 'f-contact': 'cc-1', 'f-decision': 'd1', 'f-priced': '2026-08-14' },
};

test('a record is named by its first filled field, not by its id', () => {
  const title = itemTitle(UNDERWRITER, CASE, { nameValue: wbNameValue, contactId: 'cc-1' });
  assert.equal(title, 'UW-0001');
  assert.ok(!/ff7/.test(title), 'the id tail names nothing');
});

test('the link back to this contact is skipped', () => {
  // Every row would otherwise read as the name of the person whose card you are on — the one
  // thing the reader already knows.
  const noCase = { ...UNDERWRITER, fields: UNDERWRITER.fields.filter((f) => f.id !== 'f-case') };
  assert.equal(itemTitle(noCase, CASE, { nameValue: wbNameValue, contactId: 'cc-1' }), 'Draft');
  // A contact field pointing at somebody ELSE is real information and is kept.
  const other = { ...CASE, values: { ...CASE.values, 'f-contact': 'cc-1' } };
  const someoneElse = { id: 'x', values: { 'f-contact': 'cc-1' } };
  assert.equal(itemTitle(noCase, someoneElse, { nameValue: wbNameValue, contactId: 'cc-2' }), 'Roman Juan I Gamboa Eugenio');
  assert.equal(itemTitle(noCase, other, { nameValue: wbNameValue, contactId: 'cc-1' }), 'Draft');
});

test('a text field still wins when it comes first, as it always did', () => {
  const leadGen = {
    name: 'Lead Gen',
    fields: [
      { id: 'l-title', type: 'text', label: 'Title', config: {} },
      { id: 'l-stage', type: 'status', label: 'Stage', config: { options: [{ id: 's1', label: 'Nurturing' }] } },
    ],
  };
  const item = { id: 'i1', values: { 'l-title': 'Tile Roofing', 'l-stage': 's1' } };
  assert.equal(itemTitle(leadGen, item, { nameValue: wbNameValue }), 'Tile Roofing');
});

test('without a formatter only self-describing fields count', () => {
  // The model stays usable on its own. A status stores an option id and a user stores a member
  // id — printing either is a key, which is the bug this whole area keeps producing.
  const app = {
    fields: [
      { id: 'a', type: 'status', label: 'Stage', config: { options: [{ id: 's1', label: 'Nurturing' }] } },
      { id: 'b', type: 'user', label: 'Owner', config: {} },
      { id: 'c', type: 'text', label: 'Title', config: {} },
    ],
  };
  assert.equal(itemTitle(app, { id: 'i', values: { a: 's1', b: 'u1', c: 'Re-roof' } }), 'Re-roof');
  assert.ok(!/s1|u1/.test(itemTitle(app, { id: 'i', values: { a: 's1', b: 'u1', c: 'Re-roof' } })));
});

test('a record with nothing in it still says which record it is', () => {
  const title = itemTitle(UNDERWRITER, { id: 'wb-zz-9c4', values: {} }, { nameValue: wbNameValue });
  assert.equal(title, 'Case 9c4', 'the id tail is the only thing telling two empty records apart');
});

test('the page hands the App Builder formatter to the model', () => {
  // Without it the card would name records differently from every other screen.
  assert.match(page, /contactUsage\(doc, contact\.id, \{ nameValue: wbNameValue \}\)/);
  assert.match(main, /wbFmtDuration, wbNameValue, wbOptRow,/, 'and main.js passes it through ctx');
});

test('usage names every record it returns', () => {
  const doc = { workspaces: [{ id: 'ws-1', name: 'Under Writing', apps: [{ ...UNDERWRITER, items: [CASE] }] }] };
  const [use] = contactUsage(doc, 'cc-1', { nameValue: wbNameValue });
  assert.equal(use.items[0].title, 'UW-0001');
  // And still works with no formatter supplied, falling back to self-describing fields.
  const [plain] = contactUsage(doc, 'cc-1');
  assert.equal(plain.items[0].title, '2026-08-14', 'the date is the first self-describing value');
});
