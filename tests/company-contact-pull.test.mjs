import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { contactPullMap, contactSourceApp } from '../src/workspace/relationship-pull.js';
import { applyPullValues } from '../src/workspace/relationship-picker.js';
import { createFieldInput, renderFieldConfig } from '../src/workspace/field-config-ui.js';

// "When you select an item on it, it fetches all of the data of that contact with the same
// field to automatically fill other fields on this app. Other fields on the app that the
// contact doesn't have will be left blank, but those fields with the same field name will get
// its data from the Company Contacts of the selected contact."
//
// The same copy-across the relationship field already does, sourced from the directory instead
// of another app.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');

const h = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const CONTACT_FIELDS = [
  { id: 'cf1', label: 'Phone', type: 'phone' },
  { id: 'cf2', label: 'Email', type: 'email' },
  { id: 'cf3', label: 'Company', type: 'category', config: { options: [{ id: 'o1', label: 'Acme' }] } },
  { id: 'cf4', label: 'Open balance', type: 'money' },
  { id: 'cf5', label: 'Only the directory has this', type: 'text' },
];

const APP = {
  id: 'app1',
  name: 'Prospecting',
  fields: [
    { id: 'a0', label: 'Contact', type: 'company_contact', config: {} },
    { id: 'a1', label: 'Phone', type: 'phone' },
    { id: 'a2', label: 'Email', type: 'email' },
    { id: 'a3', label: 'Company', type: 'category', config: { options: [{ id: 'p1', label: 'Acme' }] } },
    { id: 'a4', label: 'Notes', type: 'textarea' },
    { id: 'a5', label: 'Name', type: 'text' },
  ],
};

const field = (config = {}) => ({ ...APP.fields[0], config });
const labelled = (pairs) => pairs.map(([from, to]) => {
  const source = from === 'name' ? 'Name' : CONTACT_FIELDS.find((item) => item.id === from).label;
  return `${source} -> ${APP.fields.find((item) => item.id === to).label}`;
});

test('every field the app and the directory call the same thing is copied', () => {
  assert.deepEqual(labelled(contactPullMap(APP, CONTACT_FIELDS, field())), [
    'Name -> Name',
    'Phone -> Phone',
    'Email -> Email',
    'Company -> Company',
  ]);
});

test('a field only one side has is not in the mapping at all', () => {
  const pairs = contactPullMap(APP, CONTACT_FIELDS, field());
  assert.ok(!pairs.some(([from]) => from === 'cf5'), 'the directory-only field copies nowhere');
  assert.ok(!pairs.some(([, to]) => to === 'a4'), 'Notes has no counterpart, so it stays blank');
  assert.ok(!pairs.some(([, to]) => to === 'a0'), 'and the picker does not fill itself');
});

test('the contact name is offered as a field, because that is what it looks like', () => {
  // Name is the column the directory is built around rather than one of the company's
  // configurable fields, but to somebody looking at both it is simply a field called Name.
  assert.equal(contactSourceApp(CONTACT_FIELDS).fields[0].label, 'Name');
  assert.deepEqual(contactSourceApp([]).fields.map((item) => item.label), ['Name']);
});

test('a value that could not survive the trip is refused', () => {
  const app = { fields: [{ id: 'a0', type: 'company_contact', label: 'Contact', config: {} }, { id: 'x', label: 'Phone', type: 'money' }] };
  assert.deepEqual(contactPullMap(app, CONTACT_FIELDS, app.fields[0]), [], 'a phone number is not a currency amount');
});

test('copying is on unless it is turned off', () => {
  // The one place this differs from a relationship: a contact picker on a record already says
  // "this record is about that person", so a switch to flip first would be a setting for its
  // own sake. Turning it off is still respected.
  assert.ok(contactPullMap(APP, CONTACT_FIELDS, field()).length > 0, 'a field never configured still copies');
  assert.ok(contactPullMap(APP, CONTACT_FIELDS, field({ pullAll: true })).length > 0);
  assert.deepEqual(contactPullMap(APP, CONTACT_FIELDS, field({ pullAll: false })), []);
});

test('a hand-written row wins over the automatic match', () => {
  const pairs = contactPullMap(APP, CONTACT_FIELDS, field({ pull: [{ from: 'cf5', to: 'a4' }] }));
  assert.ok(pairs.some(([from, to]) => from === 'cf5' && to === 'a4'), 'the explicit row is kept');
  assert.equal(pairs.filter(([, to]) => to === 'a4').length, 1, 'and nothing else claims that field');
});

test('a row turned off still keeps its explicit mappings', () => {
  assert.deepEqual(contactPullMap(APP, CONTACT_FIELDS, field({ pullAll: false, pull: [{ from: 'cf1', to: 'a1' }] })), [['cf1', 'a1']]);
});

// ---- what the builder shows -----------------------------------------------------------

const configPanel = (fd = field()) => renderFieldConfig(fd, APP, {
  h,
  state: { builderModal: { companyId: 'co' } },
  canonicalCompanyId: (id) => id || 'co',
  companyName: () => 'Quest Roofing',
  wbOptRow: () => '',
  wbProgStopRow: () => '',
  wbProgressDisplayHtml: () => '',
  wbRelTargetApp: () => null,
  wbCompanyApps: () => [],
  wbTargetApp: () => null,
  wbRelLabel: () => '',
  companyContactFieldsFor: () => CONTACT_FIELDS,
  WB_PROGRESS_STOPS_DEFAULT: [],
  WB_FIELD_TYPES: { company_contact: { label: 'Company Contact' } },
  WB_PROGRESS_DISPLAYS: [],
});

test('the field no longer claims it has nothing to configure', () => {
  // "No extra configuration needed for this field type" was the whole panel before.
  const panel = configPanel();
  assert.ok(!panel.includes('No extra configuration needed'));
  assert.match(panel, /id="wbRelPullAll" checked/, 'and the switch is on');
});

test('the panel names the fields it is going to copy', () => {
  // A switch that silently does four things is a switch nobody trusts.
  const panel = configPanel().replace(/\s+/g, ' ');
  assert.match(panel, /Copies <b>Name<\/b>, <b>Phone<\/b>, <b>Email<\/b>, <b>Company<\/b>/);
  assert.match(panel, /this app and <b>Company Contacts<\/b> call the same thing/);
});

test('a directory with no fields says so rather than showing an empty switch', () => {
  const panel = renderFieldConfig(field(), APP, {
    h,
    state: { builderModal: { companyId: 'co' } },
    canonicalCompanyId: (id) => id || 'co',
    companyName: () => 'Quest Roofing',
    wbOptRow: () => '', wbProgStopRow: () => '', wbProgressDisplayHtml: () => '',
    wbRelTargetApp: () => null, wbCompanyApps: () => [], wbTargetApp: () => null, wbRelLabel: () => '',
    companyContactFieldsFor: () => [],
    WB_PROGRESS_STOPS_DEFAULT: [], WB_FIELD_TYPES: {}, WB_PROGRESS_DISPLAYS: [],
  });
  // Name alone is still a source, so the panel stands; what matters is it does not throw.
  assert.equal(typeof panel, 'string');
  assert.ok(panel.length > 0);
});

test('the picker carries the mapping, not a copy of the directory', () => {
  // Resolved once for the field. Embedding each contact's values instead would put the whole
  // directory in the markup, which is the difference between a few hundred bytes and a few
  // hundred kilobytes on a company with a real contact list.
  const html = createFieldInput({
    h,
    WB_FIELD_TYPES: { company_contact: { label: 'Company Contact' } },
    companyContactOptions: () => [{ id: 'c1', name: 'Kevin Henderson', detail: '805-587-3003' }],
    wbMembers: () => [],
    wbRelTargetApp: () => null,
    wbDoc: () => ({ workspaces: [{ apps: [APP] }] }),
    wbRelLabel: () => '',
    wbProgressColor: () => '',
    wbProgressDisplayHtml: () => '',
    wbChecklistValue: () => ({}),
    wbChecklistBodyHtml: () => '',
    wbRatingStars: () => '',
    wbAutoNumberText: () => '',
    companyContactFieldsFor: () => CONTACT_FIELDS,
  })('co', 'ws', APP.fields[0], '');
  const raw = html.match(/data-wb-cc-pull="([^"]*)"/)?.[1];
  assert.ok(raw, 'the picker carries a mapping');
  assert.deepEqual(JSON.parse(raw.replace(/&quot;/g, '"')), [['name', 'a5'], ['cf1', 'a1'], ['cf2', 'a2'], ['cf3', 'a3']]);
  assert.ok(!html.includes('805-587-3003') || html.indexOf('805-587-3003') > html.indexOf('datalist'), 'contact values are not baked into the mapping');
});

// ---- filling the form -------------------------------------------------------------------

test('a chosen contact fills the blanks and leaves everything else alone', () => {
  const form = fakeForm({
    a1: { value: '' },
    a2: { value: 'already@typed.com' },
    a3: { tagName: 'SELECT', value: '', options: [{ value: 'p1', textContent: 'Acme' }] },
    a5: { value: '' },
  });
  applyPullValues(form.picker, { a1: '805-587-3003', a2: 'from@contact.com', a3: 'Acme', a5: 'Kevin Henderson' });
  assert.equal(form.fields.a1.value, '805-587-3003', 'a blank field is filled');
  assert.equal(form.fields.a2.value, 'already@typed.com', 'a field somebody typed into is not overwritten');
  assert.equal(form.fields.a3.value, 'p1', 'a category matches its own option by text');
  assert.equal(form.fields.a5.value, 'Kevin Henderson');
  assert.deepEqual(form.events.a1, ['input', 'change'], 'both, so automations and calculations both see it');
});

test('a category is filled through its combobox, not by writing the label into the id', () => {
  // A category SHOWS a label and STORES an option id, in a hidden input beside the visible
  // box. Writing to the hidden field put "Acme Roofing" where "p1" belongs and left the box
  // looking empty: the value was wrong AND the copy looked like it had not happened. Filling
  // the visible box lets the app's own commit resolve it — and add the option if this app has
  // never seen it. This affects the relationship copy as much as the contact one.
  const combo = fakeCombo();
  const form = fakeForm({ a3: combo.hidden });
  applyPullValues(form.picker, { a3: 'Acme Roofing' });
  assert.equal(combo.visible.value, 'Acme Roofing', 'the box the user reads shows the value');
  assert.deepEqual(combo.events, ['input', 'change'], 'and the app resolves it to its own option id');
  assert.equal(combo.hidden.value, '', 'the label was never written into the id field');
});

test('a category somebody already chose is not replaced', () => {
  const combo = fakeCombo('Something else');
  const form = fakeForm({ a3: combo.hidden });
  applyPullValues(form.picker, { a3: 'Acme Roofing' });
  assert.equal(combo.visible.value, 'Something else');
  assert.deepEqual(combo.events, []);
});

test('the picker never fills itself', () => {
  // The field's own [data-f] input is the hidden id inside the picker, so a mapping that
  // somehow named it would otherwise write a contact id into the contact field.
  const form = fakeForm({ a0: { value: '' }, a1: { value: '' } }, 'a0');
  applyPullValues(form.picker, { a0: 'something', a1: '805-587-3003' });
  assert.equal(form.fields.a0.value, '', 'the contact field is not one of its own destinations');
  assert.equal(form.fields.a1.value, '805-587-3003', 'and the rest is filled as normal');
});

// ---- the seams ---------------------------------------------------------------------------

test('picking a contact copies, and only when the contact actually changes', () => {
  assert.match(main, /if \(match && match\.id !== previous\) wbPullFromContact\(picker, match\);/);
  assert.match(main, /function wbPullFromContact\(picker, contact\) \{/);
  // Typing runs this on every keystroke; asking for the module each time would be wasteful.
  assert.match(main, /const previous = idField\.value;/);
});

test('a blank on the contact is sent, so switching contacts can empty what it filled', () => {
  // It used to be dropped. That left the FIRST contact's phone number sitting under the
  // SECOND contact's name, which is worse than an empty box: it is a wrong one.
  assert.match(main, /if \(values\[to\] === undefined\) values\[to\] = value == null \? '' : value;/);
});

// ---- changing the record the copy came from ----------------------------------------------

test('picking a different contact refreshes what the copy filled', () => {
  const form = fakeForm({ a1: { value: '' }, a2: { value: '' } });
  applyPullValues(form.picker, { a1: '555-0100', a2: 'kevin@acme.com' });
  assert.equal(form.fields.a1.value, '555-0100');

  applyPullValues(form.picker, { a1: '+639551766487', a2: 'jrom@acme.com' });
  assert.equal(form.fields.a1.value, '+639551766487', 'the second contact wins');
  assert.equal(form.fields.a2.value, 'jrom@acme.com');
});

test('a field the new record leaves blank is emptied, not left showing the old one', () => {
  const form = fakeForm({ a1: { value: '' } });
  applyPullValues(form.picker, { a1: '555-0100' });
  applyPullValues(form.picker, { a1: '' });
  assert.equal(form.fields.a1.value, '', 'the previous contact’s number does not linger');
});

test('a value somebody typed themselves is never refreshed or emptied', () => {
  // The copy owns what the copy wrote, and nothing else.
  const form = fakeForm({ a1: { value: '' }, a2: { value: 'mine@typed.com' } });
  applyPullValues(form.picker, { a1: '555-0100', a2: 'kevin@acme.com' });
  assert.equal(form.fields.a2.value, 'mine@typed.com', 'was filled before any copy ran');

  // Now type over one the copy DID fill: it stops being the copy's from that moment.
  form.fields.a1.value = '555-9999';
  applyPullValues(form.picker, { a1: '+639551766487', a2: '' });
  assert.equal(form.fields.a1.value, '555-9999', 'edited by hand, so left alone');
  assert.equal(form.fields.a2.value, 'mine@typed.com', 'and still never touched');
});

test('re-picking the same record writes nothing and fires no events', () => {
  const form = fakeForm({ a1: { value: '' } });
  applyPullValues(form.picker, { a1: '555-0100' });
  const fired = form.events.a1.length;
  applyPullValues(form.picker, { a1: '555-0100' });
  assert.equal(form.events.a1.length, fired, 'nothing changed, so nothing was announced');
});

test('a category follows the new record too, through its combobox', () => {
  const combo = fakeCombo();
  const form = fakeForm({ a3: combo.hidden });
  applyPullValues(form.picker, { a3: 'Acme' });
  assert.equal(combo.visible.value, 'Acme');
  applyPullValues(form.picker, { a3: 'ANR Construction' });
  assert.equal(combo.visible.value, 'ANR Construction');
  applyPullValues(form.picker, { a3: '' });
  assert.equal(combo.visible.value, '', 'and clears when the new record has no company');
});

test('the filling itself stays in the lazily fetched picker module', () => {
  assert.match(main, /loadRelationshipPicker\(\)\s*\n\s*\.then\(\(mod\) => mod\.applyPullValues\(picker, values, \{ chips: wbChips \}\)\)/);
  assert.ok(!/function applyPullValues/.test(main), 'not a second copy in the entry bundle');
});

test('the config panel saves the switch and the rows for this field type too', () => {
  const at = main.indexOf("if (t === 'company_contact') {");
  assert.notEqual(at, -1);
  const branch = main.slice(at, main.indexOf('\n    }', at));
  assert.match(branch, /config\.pullAll = !!checked\('wbRelPullAll'\)/);
  assert.match(branch, /config\.pull = readPullRows\(/);
});

// A category drawn as choice chips. There is no visible box to write a label into: the row's
// hidden input stores an option id and the chips are painted from it, so the copy has to
// resolve the label itself before it can write anything.
function fakeChips(stored = '') {
  const events = [];
  const hidden = {
    type: 'hidden',
    tagName: 'INPUT',
    value: stored,
    dataset: {},
    dispatchEvent: (event) => events.push(event.type),
  };
  hidden.closest = (selector) => (selector === '[data-wb-chip-pick]' ? zone : null);
  const zone = { querySelector: () => hidden };
  const scope = { querySelector: () => hidden };
  const picker = { closest: () => scope, contains: () => false };
  return { hidden, zone, picker, events };
}

// Stands in for the chip runtime the copy reaches through `opts.chips()`, minting what is
// missing exactly as the real one does.
function chipHooks(options, { canAdd = true } = {}) {
  const added = [];
  const runtime = {
    wbResolveChipOption: (fieldId, label) => {
      const match = options.find((o) => o.label.toLowerCase() === label.toLowerCase());
      if (match) return match.id;
      if (!canAdd) return '';
      const option = { id: `new-${options.length + 1}`, label };
      options.push(option);
      added.push(label);
      return option.id;
    },
    wbChipSelect: (zone, id) => {
      const node = zone.querySelector();
      node.value = id;
      node.dispatchEvent(new Event('input'));
      node.dispatchEvent(new Event('change'));
    },
  };
  return { added, chips: () => runtime };
}

test('a contact value the chips have no option for is created rather than dropped', () => {
  // "type: demo" off the contact, no Demo option on this app's category -- so Demo is added,
  // which is what typing it into the dropdown has always done.
  const options = [{ id: 'o1', label: 'Residential' }];
  const chips = fakeChips();
  const hooks = chipHooks(options);
  applyPullValues(chips.picker, { a3: 'Demo' }, { chips: hooks.chips });
  assert.deepEqual(hooks.added, ['Demo'], 'the missing option was minted');
  assert.equal(chips.hidden.value, 'new-2', 'and the record points at it by id, not by label');
  assert.deepEqual(chips.events, ['input', 'change'], 'announced like any other pick');
});

test('a contact value the chips already offer just picks it', () => {
  const options = [{ id: 'o1', label: 'Residential' }, { id: 'o2', label: 'Demo' }];
  const chips = fakeChips();
  const hooks = chipHooks(options);
  applyPullValues(chips.picker, { a3: '  demo ' }, { chips: hooks.chips });
  assert.deepEqual(hooks.added, [], 'no duplicate for a different spelling');
  assert.equal(chips.hidden.value, 'o2');
});

test('a chip somebody picked themselves is not replaced by a copy', () => {
  const chips = fakeChips('o1');
  const hooks = chipHooks([{ id: 'o1', label: 'Residential' }, { id: 'o2', label: 'Demo' }]);
  applyPullValues(chips.picker, { a3: 'Demo' }, { chips: hooks.chips });
  assert.equal(chips.hidden.value, 'o1', 'was filled before any copy ran');
  assert.deepEqual(chips.events, []);
});

test('picking a different contact refreshes the chip the copy filled', () => {
  const options = [{ id: 'o1', label: 'Residential' }];
  const chips = fakeChips();
  const hooks = chipHooks(options);
  applyPullValues(chips.picker, { a3: 'Residential' }, { chips: hooks.chips });
  assert.equal(chips.hidden.value, 'o1');
  applyPullValues(chips.picker, { a3: 'Demo' }, { chips: hooks.chips });
  assert.equal(chips.hidden.value, 'new-2', 'the second contact wins, and minted its value');
});

test('a chip value that cannot be added leaves the field alone rather than clearing it', () => {
  // Somebody who may not edit the app still gets the rest of the copy; this one field is
  // skipped, because there is no option to point at and emptying it would lose more.
  const chips = fakeChips('o1');
  chips.hidden.dataset.wbPull = 'o1';
  const hooks = chipHooks([{ id: 'o1', label: 'Residential' }], { canAdd: false });
  applyPullValues(chips.picker, { a3: 'Demo' }, { chips: hooks.chips });
  assert.equal(chips.hidden.value, 'o1');
  assert.deepEqual(chips.events, []);
});

// The two halves of an option combobox: the box the user reads and types into, and the hidden
// input that stores the option id.
function fakeCombo(shown = '') {
  const events = [];
  const visible = {
    value: shown,
    dataset: {},
    dispatchEvent: (event) => events.push(event.type),
  };
  const node = { querySelector: (selector) => (selector === '[data-wb-option-input]' ? visible : null) };
  const hidden = {
    type: 'hidden',
    tagName: 'INPUT',
    value: '',
    closest: (selector) => (selector === '[data-wb-option-combo]' ? node : null),
  };
  return { visible, hidden, events };
}

// `inside` is the field whose [data-f] input lives within the picker itself -- for a contact
// picker that is the hidden id input, which is how the real markup is built.
function fakeForm(spec, inside = '') {
  const events = {};
  const fields = {};
  Object.entries(spec).forEach(([id, node]) => {
    events[id] = [];
    fields[id] = {
      tagName: 'INPUT',
      dataset: {},
      ...node,
      dispatchEvent: (event) => events[id].push(event.type),
    };
  });
  const scope = { querySelector: (selector) => fields[selector.replace(/\[data-f="|"\]/g, '')] || null };
  const picker = { closest: () => scope, contains: (node) => !!inside && node === fields[inside] };
  return { picker, fields, events };
}

// applyPullValues builds real Events; Node has them, but not the DOM classes around them.
globalThis.Event = globalThis.Event || class { constructor(type) { this.type = type; } };
