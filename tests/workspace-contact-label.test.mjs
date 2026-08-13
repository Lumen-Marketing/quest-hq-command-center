import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// A relationship field showed "cc-00cecde3-1e52-4e2d-b227-690760283ce6" where it should have
// shown a person's name.
//
// The Underwriter app links to a Lead Gen record, and Lead Gen's Show-field is a
// company_contact — which stores the contact's ID. wbNameValue had cases for user, status,
// category, money and number but none for company_contact, so it fell through to
// `String(raw).trim()` and printed the primary key. wbPlainVal (search, sort, CSV) already
// resolved it, which is why the value read correctly everywhere except the label.
//
// The functions are lifted from main.js rather than reimplemented: a copy would pass against
// a formatter the app no longer uses.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');

const cut = (name) => {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}\n', at) + 3);
};

// The directory the id points into, and the two stand-ins the formatters reach for.
const CONTACTS = [{ id: 'cc-00cecde3-1e52-4e2d-b227-690760283ce6', name: 'Roman Juan I Gamboa Eugenio' }];
const harness = `
  const companyContactById = (id) => ${JSON.stringify(CONTACTS)}.find((c) => c.id === id) || null;
  const wbLocateApp = () => ({ companyId: 'co', workspace: null });
  const wbMemberById = () => null;
  const wbRelTargetApp = () => null;
  const wbAutoNumberText = (f, raw) => String(raw);
  ${cut('wbNameValue')}
  ${cut('wbSimpleTitle')}
  ${cut('wbItemTitle')}
  return { wbNameValue, wbSimpleTitle, wbItemTitle };
`;
// eslint-disable-next-line no-new-func
const { wbNameValue, wbSimpleTitle, wbItemTitle } = Function(harness)();

const CONTACT_FIELD = { id: 'f1', type: 'company_contact', label: 'Contact', config: {} };
const TITLE_FIELD = { id: 'f2', type: 'text', label: 'Title', config: {} };
const app = { id: 'a1', fields: [CONTACT_FIELD, TITLE_FIELD], items: [] };

test('a linked record labelled by a company contact shows the name', () => {
  const item = { id: 'i1', values: { f1: CONTACTS[0].id } };
  assert.equal(wbNameValue(app, CONTACT_FIELD, item), 'Roman Juan I Gamboa Eugenio');
  assert.ok(!wbNameValue(app, CONTACT_FIELD, item).startsWith('cc-'), 'never the primary key');
});

test('an unresolvable contact yields nothing, so the caller falls back to the title', () => {
  // A deleted contact must not resurface as an id. Empty here means wbItemTitle moves on to
  // the next field, which is a record title somebody can read.
  const item = { id: 'i1', values: { f1: 'cc-deleted-0000', f2: 'Kevin — re-roof' } };
  assert.equal(wbNameValue(app, CONTACT_FIELD, item), '');
  assert.equal(wbItemTitle(app, item), 'Kevin — re-roof');
});

test('the flattened deep title resolves it too', () => {
  // wbSimpleTitle is what a relationship two hops out falls back to, and it had the same hole.
  const item = { id: 'i1', values: { f1: CONTACTS[0].id } };
  assert.equal(wbSimpleTitle(app, item), 'Roman Juan I Gamboa Eugenio');
});

test('every formatter that renders a company_contact resolves it', () => {
  // wbPlainVal already did; these two are the ones that did not. Named explicitly so a new
  // formatter added later has an obvious precedent to follow.
  ['wbNameValue', 'wbSimpleTitle', 'wbPlainVal'].forEach((name) => {
    assert.match(cut(name), /case 'company_contact':/, `${name} must not print a contact id`);
  });
});
