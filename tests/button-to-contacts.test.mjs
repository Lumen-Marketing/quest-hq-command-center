import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isContactsTarget, planPush } from '../src/workspace/button-field.js';
import { createButtonPush } from '../src/workspace/button-push.js';

// "On app builder add a button function to send all data or selected data to move it to the
// Company Contacts, but only the fields that the Company Contacts has. For example Company
// Contacts has only field txt, phone, email, and the data you want to send has txt, phone,
// email, location -- so location is not present in the Company Contacts, therefore it won't be
// included."
//
// The worked example, reproduced below: Prospect (Name, Phone, Email, Location) pressed at
// Company Contacts (Name, Phone, Email) files a contact carrying the first three, and says out
// loud that Location stayed behind.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const PROSPECT = () => ({
  id: 'app-prospect',
  name: 'Prospect',
  fields: [
    { id: 'p-name', label: 'Name', type: 'text', config: {} },
    { id: 'p-phone', label: 'Phone', type: 'phone', config: {} },
    { id: 'p-email', label: 'Email', type: 'email', config: {} },
    { id: 'p-loc', label: 'Location', type: 'location', config: {} },
    { id: 'p-btn', label: 'To contacts', type: 'button', config: {} },
  ],
  items: [{
    id: 'item-1',
    values: {
      'p-name': 'Kevin Henderson',
      'p-phone': '480-555-0100',
      'p-email': 'kevin@example.com',
      'p-loc': '58th Pl, Phoenix AZ',
    },
  }],
});

// The directory as main.js shapes it for a destination: Name is a field here even though it is
// a column in storage, and the list does not grow.
const DIRECTORY = () => ({
  id: 'cc-co1',
  name: 'Company Contacts',
  recordName: 'Contact',
  fixedFields: true,
  fields: [
    { id: 'name', label: 'Name', type: 'text', config: {} },
    { id: 'ccf-phone', label: 'Phone', type: 'phone', config: {} },
    { id: 'ccf-email', label: 'Email', type: 'email', config: {} },
  ],
  items: [],
});

test('a fixed-field target is never grown to fit', () => {
  const plan = planPush(PROSPECT(), DIRECTORY(), { id: 'p-btn', config: {} });
  assert.deepEqual(plan.carry.map((pair) => pair.from.label), ['Name', 'Phone', 'Email']);
  assert.deepEqual(plan.create, [], 'the directory gains no column');
  assert.deepEqual(plan.skipped.map((entry) => entry.field.label), ['Location']);
  assert.match(plan.skipped[0].why, /Company Contacts has no Location/);
});

test('an app target still grows, so the rule is the target\'s and not a new global one', () => {
  const target = DIRECTORY();
  delete target.fixedFields;
  const plan = planPush(PROSPECT(), target, { id: 'p-btn', config: {} });
  assert.deepEqual(plan.create.map((field) => field.label), ['Location']);
  assert.deepEqual(plan.skipped, []);
});

test('"or selected data": the chosen subset still cannot exceed what the directory has', () => {
  // Location ticked as well -- it is a legitimate choice on the record, and it is the DIRECTORY
  // that has nowhere to put it.
  const button = { id: 'p-btn', config: { fields: ['p-name', 'p-email', 'p-loc'] } };
  const plan = planPush(PROSPECT(), DIRECTORY(), button);
  assert.deepEqual(plan.carry.map((pair) => pair.from.label), ['Name', 'Email']);
  assert.deepEqual(plan.skipped.map((entry) => entry.field.label), ['Location']);
});

test('the directory is recognised by its id, wherever it is named', () => {
  assert.equal(isContactsTarget('cc-co1'), true);
  assert.equal(isContactsTarget('app-prospect'), false);
  assert.equal(isContactsTarget(''), false);
  assert.equal(isContactsTarget(undefined), false);
});

// ---- the press ----------------------------------------------------------------------------

const pressed = async ({
  config = {}, item = null, intake = null, canManage = true, sourceApp = null,
} = {}) => {
  const app = sourceApp || PROSPECT();
  const filed = [];
  const logged = [];
  const toasts = [];
  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => canManage,
    wbDoc: () => null,
    wbSave: async () => {},
    wbUid: () => 'u-1',
    showToast: (message) => toasts.push(message),
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: (workspace, entry) => logged.push(entry),
    wbItemTitle: () => 'Untitled record',
    contactsApp: () => DIRECTORY(),
    contactIntake: intake || (async (companyId, payload) => {
      filed.push({ companyId, ...payload });
      return { ok: true, landed: Object.keys(payload.plain).length, reused: false };
    }),
  });
  const button = { id: 'p-btn', config: { targetCompany: 'co1', targetApp: 'cc-co1', ...config } };
  const ok = await push.pressButton('co1', app, button, item || app.items[0], { id: 'ws-1', activity: [] });
  return {
    ok, filed, logged, toasts, app,
  };
};

test('the worked example: three fields cross, Location does not', async () => {
  const { ok, filed } = await pressed();
  assert.equal(ok, true);
  assert.equal(filed.length, 1);
  assert.equal(filed[0].companyId, 'co1');
  // The name is a name, not a field value: the directory keeps it in its own column.
  assert.equal(filed[0].name, 'Kevin Henderson');
  assert.deepEqual(filed[0].plain, {
    'ccf-phone': '480-555-0100',
    'ccf-email': 'kevin@example.com',
  });
  assert.equal('name' in filed[0].plain, false, 'the name never travels as a field value');
});

test('what stayed behind is named in the sending app\'s history', async () => {
  const { logged } = await pressed();
  assert.equal(logged.length, 1);
  assert.match(logged[0].text, /Kevin Henderson/);
  assert.match(logged[0].text, /was added to/);
  // Named rather than counted: "Location" is actionable, "1 field" is not.
  assert.match(logged[0].text, /Location/);
  assert.equal(logged[0].appId, 'app-prospect');
  assert.equal(logged[0].itemId, 'item-1');
});

test('a category crosses as the word it shows, never as its option id', async () => {
  const app = PROSPECT();
  app.fields.push({
    id: 'p-type',
    label: 'Phone',
    type: 'category',
    config: { options: [{ id: 'opt-a', label: 'Homeowner' }] },
  });
  // Two fields both labelled Phone: planPush matches the FIRST, so target the category at a
  // directory field of its own instead.
  app.fields[app.fields.length - 1].label = 'Email';
  app.items[0].values['p-type'] = 'opt-a';
  delete app.items[0].values['p-email'];
  app.fields = app.fields.filter((field) => field.id !== 'p-email');

  const filed = [];
  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: () => null,
    wbSave: async () => {},
    wbUid: () => 'u-1',
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: () => {},
    wbItemTitle: () => 'Untitled record',
    contactsApp: () => DIRECTORY(),
    contactIntake: async (companyId, payload) => { filed.push(payload); return { ok: true, landed: 1 }; },
  });
  await push.pressButton('co1', app, { id: 'p-btn', config: { targetCompany: 'co1', targetApp: 'cc-co1' } }, app.items[0], null);
  assert.equal(filed[0].plain['ccf-email'], 'Homeowner', 'the label, not opt-a');
});

test('a record with no Name field falls back to what the record is called', async () => {
  const app = PROSPECT();
  app.fields = app.fields.filter((field) => field.id !== 'p-name');
  const filed = [];
  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: () => null,
    wbSave: async () => {},
    wbUid: () => 'u-1',
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: () => {},
    wbItemTitle: () => 'The record title',
    contactsApp: () => DIRECTORY(),
    contactIntake: async (companyId, payload) => { filed.push(payload); return { ok: true, landed: 2 }; },
  });
  await push.pressButton('co1', app, { id: 'p-btn', config: { targetCompany: 'co1', targetApp: 'cc-co1' } }, app.items[0], null);
  assert.equal(filed[0].name, 'The record title');
});

test('nothing in common is refused, and nothing is filed', async () => {
  const app = PROSPECT();
  app.fields = [{ id: 'p-loc', label: 'Location', type: 'location', config: {} }];
  let filedAnything = false;
  const toasts = [];
  const push = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: () => null,
    wbSave: async () => {},
    wbUid: () => 'u-1',
    showToast: (message) => toasts.push(message),
    render: () => {},
    canonicalCompanyId: (id) => id,
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: () => {},
    wbItemTitle: () => 'Untitled',
    contactsApp: () => DIRECTORY(),
    contactIntake: async () => { filedAnything = true; return { ok: true, landed: 0 }; },
  });
  const ok = await push.pressButton('co1', app, { id: 'p-btn', config: { targetCompany: 'co1', targetApp: 'cc-co1' } }, app.items[0], null);
  assert.equal(ok, false);
  assert.equal(filedAnything, false);
  assert.match(toasts[0], /no field in common/);
});

test('a refusal on the contacts side is reported and not swallowed', async () => {
  const { ok, toasts, logged } = await pressed({
    intake: async () => ({ ok: false, error: 'Your role cannot add contacts.' }),
  });
  assert.equal(ok, false);
  assert.deepEqual(toasts, ['Your role cannot add contacts.']);
  assert.equal(logged.length, 0, 'nothing is written to history for something that did not happen');
});

// ---- the wiring, asserted against the source ------------------------------------------------

const readSrc = (path) => readFileSync(join(root, path), 'utf8');

test('main.js shapes the directory as a fixed-field destination with Name as a field', () => {
  const src = readSrc('src/main.js');
  assert.match(src, /function wbContactsTargetApp\(companyId\) \{/);
  assert.match(src, /fixedFields: true,/);
  assert.match(src, /\{ id: 'name', label: 'Name', type: 'text', config: \{\} \}, \.\.\.companyContactFieldsFor\(cid\)/);
  // Resolved before the app index is consulted -- the directory is in no builder doc.
  assert.match(src, /if \(\/\^cc-\/\.test\(String\(targetAppId\)\)\) return wbContactsTargetApp\(companyId\);/);
  assert.match(src, /contactsApp: \(companyId\) => wbContactsTargetApp\(companyId\),/);
  assert.match(src, /contactIntake: \(companyId, payload\) => loadCompanyContactsPage\(\)/);
});

// --- the destination picker, rendered rather than grepped ------------------------------------
//
// This was a source-text assertion: it checked the file contained "Company Contacts
// (directory)" and passed. The string was there and the option was still unfindable — it sat
// in a select whose placeholder read "— Select an app —", so the directory looked excluded
// from the one list that held it, and people went hunting in the company dropdown instead.
// A test that greps for a label cannot see which control the label ends up in. This one
// renders the panel and reads the select.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const SOURCE_APP = {
  id: 'app-prospect',
  name: 'Prospects',
  fields: [
    { id: 'p-name', label: 'Prospect', type: 'text', config: {} },
    { id: 'p-phone', label: 'Phone', type: 'phone', config: {} },
    { id: 'p-btn', label: 'Hand off', type: 'button', config: {} },
  ],
  items: [],
};
const OTHER_APP = { id: 'app-leads', name: 'Leads', fields: [], items: [] };

/** The button panel for one config, as the field editor would draw it. */
async function panelFor(config, app = SOURCE_APP) {
  const { renderFieldConfig } = await import('../src/workspace/field-config-ui.js');
  const field = { id: 'p-btn', label: 'Hand off', type: 'button', required: false, config };
  return renderFieldConfig(field, app, {
    h,
    state: {
      builderModal: { companyId: 'quest' },
      workspaceBuilderDocs: { quest: {}, lumen: {} },
    },
    canonicalCompanyId: (id) => id,
    companyName: (id) => ({ quest: 'Quest Roofing', lumen: 'Lumen Marketing' })[id] || id,
    wbCompanyApps: (cid) => (cid === 'quest' ? [{ app: SOURCE_APP }, { app: OTHER_APP }] : []),
    wbTargetApp: (cid, appId) => [SOURCE_APP, OTHER_APP].find((a) => a.id === appId) || null,
    companyContactFieldsFor: () => [],
    WB_FIELD_TYPES: { text: { icon: 'ti-letter-case' }, phone: { icon: 'ti-phone' } },
  });
}

/** The options of one <select>, by id — optgroups flattened, which is what a browser reports. */
function optionsOf(html, id) {
  const open = html.indexOf(`id="${id}"`);
  assert.notEqual(open, -1, `no select with id ${id}`);
  const body = html.slice(open, html.indexOf('</select>', open));
  return [...body.matchAll(/<option value="([^"]*)"([^>]*)>([^<]*)<\/option>/g)]
    .map(([, value, attrs, label]) => ({ value, label: label.trim(), selected: /\sselected/.test(attrs) }));
}

test('the destination picker really offers the directory, in the list that holds the apps', async () => {
  const html = await panelFor({ action: 'push' });
  const options = optionsOf(html, 'wbBtnApp');
  const directory = options.find((o) => o.value === 'cc-quest');

  assert.ok(directory, 'Company Contacts is not an option of the destination select');
  assert.match(directory.label, /Company Contacts/);
  // The placeholder must not describe the list as narrower than it is. "Select an app" is what
  // sent somebody looking for the directory into the company dropdown instead.
  assert.equal(options[0].value, '');
  assert.doesNotMatch(options[0].label, /\bapp\b/i, `the placeholder reads "${options[0].label}", which excludes the directory`);
  // And it is genuinely alongside the apps rather than in some other control.
  assert.ok(options.some((o) => o.value === 'app-leads'), 'the apps are in the same select');
  // The app the button sits on is never a destination — that is a loop.
  assert.ok(!options.some((o) => o.value === 'app-prospect'));
});

test('the directory is offered per company, and follows the company picker', async () => {
  // It is `cc-<companyId>`, so switching the company switches which directory is meant. The
  // company select answers "whose", the destination select answers "what" — which is why the
  // directory belongs in the second one and not the first.
  const html = await panelFor({ action: 'push', targetCompany: 'lumen' });
  assert.ok(optionsOf(html, 'wbBtnApp').some((o) => o.value === 'cc-lumen'));
  assert.ok(!optionsOf(html, 'wbBtnCompany').some((o) => /contact/i.test(o.label)),
    'the company picker lists companies only');
});

test('choosing the directory comes back chosen', async () => {
  const options = optionsOf(await panelFor({ action: 'push', targetApp: 'cc-quest' }), 'wbBtnApp');
  assert.equal(options.find((o) => o.selected)?.value, 'cc-quest');
});

test('a button on a contact card is not offered the directory it already lives in', async () => {
  const html = await panelFor({ action: 'push' }, { ...SOURCE_APP, id: 'cc-quest' });
  assert.ok(!optionsOf(html, 'wbBtnApp').some((o) => /^cc-/.test(o.value)));
});

test('move is offered for the directory, and says what it will do', async () => {
  // It used to be withheld, on the reasoning that a contact cannot be "moved" INTO the
  // directory. Fair as a default, wrong as a rule: an intake app whose rows ARE people has
  // nothing left to do with the row once the person is filed.
  const html = await panelFor({ action: 'move', targetApp: 'cc-quest' });
  const actions = optionsOf(html, 'wbBtnAction');
  assert.ok(actions.some((o) => o.value === 'move'), 'move is not offered for the directory');
  assert.equal(actions.find((o) => o.selected)?.value, 'move', 'the chosen action was rewritten');
  assert.match(html, /this record is then removed from this app/);

  // An app destination is unchanged, and says nothing extra.
  const toApp = await panelFor({ action: 'move', targetApp: 'app-leads' });
  assert.ok(optionsOf(toApp, 'wbBtnAction').some((o) => o.value === 'move'));
  assert.doesNotMatch(toApp, /this record is then removed from this app/);
});

test('the contacts page fills an existing contact in rather than duplicating them', () => {
  const src = readSrc('src/company-contacts/page.js');
  assert.match(src, /async function receiveContactFromApp\(companyId, \{ name = '', plain = \{\} \} = \{\}\)/);
  // Filing somebody new and filling in blanks on somebody already here are different powers
  // since the 20260826090000 split; the old company_contacts.manage bundled both with the
  // power to delete the directory's fields, which is why a worker could not file a lead.
  assert.match(src, /const needed = existing \? 'company_contacts\.edit' : 'company_contacts\.create';/);
  assert.match(src, /if \(!can\(needed, target\)\)/);
  // Additive: a field somebody has already filled in is left alone.
  assert.match(src, /if \(String\(values\[field\.id\] \?\? ''\) !== ''\) return;/);
  assert.match(src, /receiveContactFromApp,/);
});


// --- moving a record into the directory ---------------------------------------------------

test('a move files the contact and then removes the record', async () => {
  const app = PROSPECT();
  const { ok } = await pressed({ config: { action: 'move' }, sourceApp: app });
  assert.equal(ok, true);
  assert.equal(app.items.length, 0, 'the row should be gone once the person is filed');
});

test('a copy leaves the record exactly where it was', async () => {
  const app = PROSPECT();
  await pressed({ config: { action: 'push' }, sourceApp: app });
  assert.equal(app.items.length, 1);
});

test('a contact that could not be filed keeps the record', async () => {
  // Removing it after a failed file would lose it from both places.
  const app = PROSPECT();
  const { ok } = await pressed({
    config: { action: 'move' },
    sourceApp: app,
    intake: async () => ({ ok: false, error: 'nope' }),
  });
  assert.equal(ok, false);
  assert.equal(app.items.length, 1, 'the record was removed despite the contact failing');
});
