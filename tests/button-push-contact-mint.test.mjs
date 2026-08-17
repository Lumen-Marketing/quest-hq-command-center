import assert from 'node:assert/strict';
import test from 'node:test';

import { createButtonPush } from '../src/workspace/button-push.js';

// "Prospects has Name (text) and Age (number); Leads has Name (Company Contact) and Age
// (number). When I send it, the text becomes a Company Contact — it saves to Company Contacts,
// and if the record has Phone, Location, Email, those go too."
//
// Pressed for real through createButtonPush, because the interesting part is not the plan but
// what actually lands in the target record: an id, not a name.

const f = (id, label, type, config = {}) => ({
  id, label, type, config, required: false, hidden: false,
});

const PROSPECT = () => ({
  id: 'app-prospect',
  name: 'Prospects',
  fields: [
    f('p-name', 'Name', 'text'),
    f('p-age', 'Age', 'number'),
    f('p-phone', 'Phone', 'phone'),
    f('p-email', 'Email', 'email'),
    f('p-loc', 'Location', 'location'),
    f('p-btn', 'Send', 'button', {}),
  ],
  items: [{
    id: 'item-1',
    values: {
      'p-name': 'Kevin Henderson',
      'p-age': 41,
      'p-phone': '480-555-0100',
      'p-email': 'kevin@example.com',
      'p-loc': '58th Pl, Phoenix AZ',
    },
  }],
});

const LEADS = () => ({
  id: 'app-leads',
  name: 'Leads',
  fields: [f('l-name', 'Name', 'company_contact'), f('l-age', 'Age', 'number')],
  items: [],
});

/** Company Contacts as the push sees it: a fixed list the company arranged. */
const DIRECTORY = () => ({
  id: 'cc-co1',
  name: 'Company Contacts',
  fixedFields: true,
  fields: [
    f('name', 'Name', 'text'),
    f('cc-phone', 'Phone', 'phone'),
    f('cc-email', 'Email', 'email'),
    f('cc-loc', 'Location', 'location'),
  ],
  items: [],
});

async function press({
  source = PROSPECT(), target = LEADS(), intake = null, config = {}, log = null,
} = {}) {
  const filed = [];
  const toasts = [];
  let n = 0;
  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: () => ({ workspaces: [{ id: 'ws-2', name: 'Sales', apps: [target] }] }),
    wbSave: async () => {},
    wbUid: () => `u${(n += 1)}`,
    showToast: (message) => toasts.push(message),
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: (ws, entry) => { if (log) log(ws, entry); },
    wbItemTitle: () => 'Untitled record',
    contactsApp: () => DIRECTORY(),
    contactIntake: intake || (async (companyId, payload) => {
      filed.push({ companyId, ...payload });
      return { ok: true, reused: false, contact: { id: 'contact-99', name: payload.name } };
    }),
  });
  const button = { id: 'p-btn', config: { targetCompany: 'co1', targetApp: 'app-leads', ...config } };
  const ok = await push.pressButton('co1', source, button, source.items[0], { id: 'ws-1', activity: [] });
  return {
    ok, filed, toasts, target, arrived: target.items[0],
  };
}

test('the text name arrives as a contact id, not as words', async () => {
  const { ok, arrived } = await press();
  assert.equal(ok, true);
  assert.ok(arrived, 'nothing was added to Leads');
  assert.equal(arrived.values['l-name'], 'contact-99', 'the Company Contact field should hold an id');
  assert.notEqual(arrived.values['l-name'], 'Kevin Henderson', 'a name where an id belongs renders as a broken chip');
});

test('the contact is filed with the rest of the record, not just the name', async () => {
  const { filed } = await press();
  assert.equal(filed.length, 1);
  assert.equal(filed[0].name, 'Kevin Henderson');
  assert.equal(filed[0].companyId, 'co1');
  // Phone, Email and Location all exist in the directory, so all three travel with them.
  assert.deepEqual(filed[0].plain, {
    'cc-phone': '480-555-0100',
    'cc-email': 'kevin@example.com',
    'cc-loc': '58th Pl, Phoenix AZ',
  });
});

test('a field the directory has no home for stays out of the contact', async () => {
  // Age is not a contact detail, and Company Contacts does not have it.
  const { filed } = await press();
  assert.ok(!Object.values(filed[0].plain).includes(41));
  assert.equal(Object.keys(filed[0].plain).length, 3);
});

test('number to number still carries straight across', async () => {
  const { arrived } = await press();
  assert.equal(arrived.values['l-age'], 41);
});

test('text into a number field is refused rather than landing as NaN', async () => {
  const source = PROSPECT();
  source.fields.find((x) => x.id === 'p-age').type = 'text';
  source.items[0].values['p-age'] = 'forty one';
  const { arrived } = await press({ source });
  assert.equal(arrived.values['l-age'], undefined, 'text was written into a number field');
  assert.equal(arrived.values['l-name'], 'contact-99', 'the rest of the push still went');
});

test('a record with no name files no contact, and leaves the field empty', async () => {
  const source = PROSPECT();
  source.items[0].values['p-name'] = '';
  const { filed, arrived } = await press({ source });
  assert.equal(filed.length, 0, 'an empty name should not create a contact');
  assert.equal(arrived.values['l-name'], undefined);
});

test('a contact that cannot be filed says so, and the record still goes', async () => {
  // Losing the link is bad; a move that stopped here would leave the record nowhere at all.
  const { ok, arrived, toasts } = await press({
    intake: async () => ({ ok: false, error: 'Your role cannot add contacts.' }),
  });
  assert.equal(ok, true);
  assert.ok(arrived, 'the record was dropped because the contact failed');
  assert.equal(arrived.values['l-name'], undefined);
  assert.ok(toasts.some((t) => /could not be filed in Company Contacts/.test(t)), toasts.join(' | '));
});

test('the contact field is not also grown as a text column', async () => {
  // The target HAS a Name field, so nothing should be created; a second "Name" of a different
  // type would be two fields with one name, which is what the label match exists to prevent.
  const { target } = await press();
  assert.deepEqual(target.fields.filter((x) => x.label === 'Name').map((x) => x.type), ['company_contact']);
});

test('Phone, Email and Location are also created on the target itself', async () => {
  // They travel twice on purpose: onto the contact, because that is where a phone number
  // belongs, and onto the record, because Leads had no such column and the push grows it.
  const { target } = await press();
  const labels = target.fields.map((x) => x.label);
  ['Phone', 'Email', 'Location'].forEach((label) => assert.ok(labels.includes(label), `${label} missing`));
});

// --- the contact's details reach it even when the labels differ ---------------------------------
//
// "app1 has name(text), no.(phone) → app2 has contacts(company contact), no.(phone) … result:
// app2 contacts: Roman, no.: 555-123-4567 — and it is also saved as a company contact so it
// has a contact card now."
//
// The label match alone was too strict for the card: an app calling its phone field "no." and
// the directory calling its own "Phone" mean the same thing, and there is exactly one place a
// phone number can go on a contact.

const ODD_LABELS = () => ({
  id: 'app-1',
  name: 'App 1',
  fields: [f('a-name', 'name', 'text'), f('a-no', 'no.', 'phone'), f('a-btn', 'Send', 'button')],
  items: [{ id: 'i1', values: { 'a-name': 'Roman', 'a-no': '555-123-4567' } }],
});
const ODD_TARGET = () => ({
  id: 'app-leads',
  name: 'App 2',
  fields: [f('b-contact', 'contacts', 'company_contact'), f('b-no', 'no.', 'phone')],
  items: [],
});

test('a phone reaches the contact card though the app calls it "no."', async () => {
  const { filed, arrived } = await press({
    source: ODD_LABELS(),
    target: ODD_TARGET(),
    config: { map: [{ from: 'a-name', to: 'b-contact' }] },
  });
  assert.equal(arrived.values['b-contact'], 'contact-99', 'the contact field holds the id');
  assert.equal(arrived.values['b-no'], '555-123-4567', 'no. → no. is a plain carry');
  assert.equal(filed[0].name, 'Roman');
  assert.deepEqual(filed[0].plain, { 'cc-phone': '555-123-4567' }, 'the number did not reach the card');
});

test('an ambiguous source is left alone rather than guessed', async () => {
  // Two phone fields with values and one place to put them is a real choice; picking one would
  // be worse than leaving it, because the wrong number on a contact card is worse than none.
  const source = ODD_LABELS();
  source.fields.splice(2, 0, f('a-alt', 'alt no.', 'phone'));
  source.items[0].values['a-alt'] = '555-999-0000';
  const { filed } = await press({
    source, target: ODD_TARGET(), config: { map: [{ from: 'a-name', to: 'b-contact' }] },
  });
  assert.deepEqual(filed[0].plain, {}, 'it guessed between two phone numbers');
});

test('a label match still wins over the type fallback', async () => {
  const source = ODD_LABELS();
  source.fields.splice(2, 0, f('a-phone', 'Phone', 'phone'));
  source.items[0].values['a-phone'] = '480-000-1111';
  const { filed } = await press({
    source, target: ODD_TARGET(), config: { map: [{ from: 'a-name', to: 'b-contact' }] },
  });
  assert.equal(filed[0].plain['cc-phone'], '480-000-1111', 'the field actually called Phone should win');
});

test('the fallback never overwrites what the label match already placed', async () => {
  // The subtle case: the field the directory matched by NAME is a text field, and a different
  // field of the real type also has a value. Without the guard the second silently replaces
  // the first, so the contact ends up with a number nobody chose.
  const source = ODD_LABELS();
  source.fields.splice(1, 0, f('a-phone', 'Phone', 'text'));
  source.items[0].values['a-phone'] = 'ext. 42';
  const { filed } = await press({
    source, target: ODD_TARGET(), config: { map: [{ from: 'a-name', to: 'b-contact' }] },
  });
  assert.equal(filed[0].plain['cc-phone'], 'ext. 42', 'the type fallback overwrote the label match');
});

test('creating the contact is written into the record’s history', async () => {
  // "Since I converted it to Company Contacts, it technically also has an activity that I
  // created a contact, then moved here into the current app."
  const logged = [];
  const source = ODD_LABELS();
  const target = ODD_TARGET();
  const { arrived } = await press({
    source, target, config: { map: [{ from: 'a-name', to: 'b-contact' }] }, log: (ws, e) => logged.push(e),
  });
  const mine = logged.filter((e) => e.itemId === arrived.id);
  assert.equal(mine.length, 2, mine.map((e) => e.text).join(' | '));
  // Order: the person was filed, then the record landed. The log is newest-first, so the
  // earlier event is written first.
  assert.match(mine[0].text, /was added to <b>Company Contacts<\/b> and linked as <b>contacts<\/b>/);
  assert.match(mine[1].text, /arrived from/);
});

test('reusing an existing contact says so rather than claiming a new one', async () => {
  const logged = [];
  await press({
    source: ODD_LABELS(),
    target: ODD_TARGET(),
    config: { map: [{ from: 'a-name', to: 'b-contact' }] },
    log: (ws, e) => logged.push(e),
    intake: async () => ({ ok: true, reused: true, contact: { id: 'contact-99' } }),
  });
  assert.ok(logged.some((e) => /was already in <b>Company Contacts<\/b>/.test(e.text)), logged.map((e) => e.text).join(' | '));
});

test('no contact means no contact entry', async () => {
  const logged = [];
  const source = ODD_LABELS();
  source.items[0].values['a-name'] = '';
  await press({
    source, target: ODD_TARGET(), config: { map: [{ from: 'a-name', to: 'b-contact' }] }, log: (ws, e) => logged.push(e),
  });
  assert.ok(!logged.some((e) => /Company Contacts/.test(e.text)), 'logged a contact that was never created');
});

test('a field the target did not have is added at the END of its list', async () => {
  // The target app's own shape is the one its people know. Putting an arrival at the top
  // reorders the form underneath everybody already using it.
  const target = LEADS();
  const before = target.fields.map((x) => x.label);
  await press({ target });
  const after = target.fields.map((x) => x.label);
  assert.deepEqual(after.slice(0, before.length), before, 'the existing fields moved');
  assert.deepEqual(after.slice(before.length), ['Phone', 'Email', 'Location'], after.join(', '));
});

test('several arrivals keep the order they had at home', async () => {
  const target = LEADS();
  await press({ target });
  const added = target.fields.map((x) => x.label).slice(2);
  const home = PROSPECT().fields.filter((x) => added.includes(x.label)).map((x) => x.label);
  assert.deepEqual(added, home);
});

test('the Contact field minted when pushing FROM a contact card also goes last', async () => {
  // Pressed on a contact card, the push adds a Company Contact field to the target if it has
  // none, so the arrival shows on the card that produced it. That one was still prepending.
  const target = {
    id: 'app-leads', name: 'Leads', fields: [f('l-x', 'Scope', 'text')], items: [],
  };
  const source = {
    id: 'app-src',
    name: 'Source',
    fields: [f('s-x', 'Scope', 'text'), f('s-btn', 'Send', 'button')],
    items: [{ id: 's1', values: { 's-x': 'Re-roof' } }],
  };
  let n = 0;
  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: () => ({ workspaces: [{ id: 'ws', apps: [target] }] }),
    wbSave: async () => {},
    wbUid: () => `u${(n += 1)}`,
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: () => {},
    wbItemTitle: () => 'Re-roof',
    state: {},
    contactsApp: () => DIRECTORY(),
    contactIntake: async () => ({ ok: true, contact: { id: 'c1' } }),
  });
  await push.pressButton('co1', source, {
    id: 's-btn', config: { targetCompany: 'co1', targetApp: 'app-leads' },
  }, source.items[0], { id: 'ws1', activity: [] }, { contactId: 'kim-1', contactName: 'kim' });

  const labels = target.fields.map((x) => x.label);
  assert.equal(labels[0], 'Scope', 'the target’s own field was pushed down');
  assert.equal(labels[labels.length - 1], 'Contact', labels.join(', '));
});
