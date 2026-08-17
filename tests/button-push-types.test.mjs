import assert from 'node:assert/strict';
import test from 'node:test';

import { planPush, pushKind, whyNotPushed } from '../src/workspace/button-field.js';
import { canPull } from '../src/workspace/relationship-pull.js';

// "All fields with the same data types — string to string. String to int is prohibited, but
// int to string is allowed." Plus the one conversion a push can do that a copy cannot: a name
// in a text field arriving at a Company Contact field is FILED as a contact.
//
// Until now the push ignored types entirely: it matched on the label and carried the value
// whatever the two fields were, so "Age" as text landed in "Age" as a number and read NaN.

const f = (id, label, type, config = {}) => ({
  id, label, type, config,
});
const app = (name, fields, extra = {}) => ({
  id: `app-${name}`, name, fields, items: [], ...extra,
});
const button = f('b1', 'Send', 'button', {});
const plan = (source, target) => planPush(source, target, button);
const pair = (p, label) => p.carry.find((entry) => entry.from.label === label);
const skip = (p, label) => p.skipped.find((entry) => entry.field.label === label);

// --- the matrix ---------------------------------------------------------------------------------

test('same type always travels', () => {
  ['text', 'number', 'date', 'money', 'checkbox', 'category', 'user', 'company_contact'].forEach((type) => {
    assert.equal(pushKind(f('a', 'X', type), f('b', 'X', type)), 'carry', `${type} → ${type} was refused`);
  });
});

test('a number can become text, and text cannot become a number', () => {
  assert.equal(pushKind(f('a', 'Age', 'number'), f('b', 'Age', 'text')), 'carry');
  assert.equal(pushKind(f('a', 'Age', 'text'), f('b', 'Age', 'number')), null);
  // The same one step wider: money and a rating are numbers, a textarea is text.
  assert.equal(pushKind(f('a', 'V', 'money'), f('b', 'V', 'textarea')), 'carry');
  assert.equal(pushKind(f('a', 'V', 'textarea'), f('b', 'V', 'money')), null);
});

test('a date does not become a number, and a number does not become a date', () => {
  assert.equal(pushKind(f('a', 'D', 'date'), f('b', 'D', 'money')), null);
  assert.equal(pushKind(f('a', 'D', 'money'), f('b', 'D', 'date')), null);
  assert.equal(pushKind(f('a', 'D', 'date'), f('b', 'D', 'text')), 'carry', 'a date reads fine as text');
});

test('nothing can be sent into a field that works itself out', () => {
  ['calculation', 'rollup', 'autonumber', 'created_time', 'updated_time'].forEach((type) => {
    assert.equal(pushKind(f('a', 'X', 'text'), f('b', 'X', type)), null, `${type} accepted a value`);
  });
});

test('the push reuses the copy rule rather than keeping a second table', () => {
  // Two tables drift the first time one is fixed. Everything except the contact mint must
  // agree with canPull exactly.
  const types = ['text', 'textarea', 'number', 'money', 'date', 'category', 'checkbox', 'user'];
  types.forEach((from) => types.forEach((to) => {
    assert.equal(pushKind(f('a', 'X', from), f('b', 'X', to)) === 'carry', canPull(from, to), `${from} → ${to}`);
  }));
});

// --- the plan reports it, rather than surprising anybody ------------------------------------------

test('a label match with an impossible type is skipped, with a reason', () => {
  const source = app('Prospects', [f('p-age', 'Age', 'text'), button]);
  const target = app('Leads', [f('l-age', 'Age', 'number')]);
  const result = plan(source, target);
  assert.equal(pair(result, 'Age'), undefined, 'text was carried into a number field');
  assert.match(skip(result, 'Age').why, /number there and text here/);
});

test('a field the target does not have is cloned, so its type goes with it', () => {
  const source = app('Prospects', [f('p-age', 'Age', 'number'), button]);
  const target = app('Leads', []);
  const result = plan(source, target);
  assert.deepEqual(result.create.map((x) => x.label), ['Age']);
  assert.equal(pair(result, 'Age').kind, 'carry');
});

// --- the contact mint ------------------------------------------------------------------------

test('text landing on a Company Contact field is a contact, not a carry', () => {
  assert.equal(pushKind(f('a', 'Name', 'text'), f('b', 'Name', 'company_contact')), 'contact');
  ['textarea', 'email', 'phone', 'url', 'location'].forEach((type) => {
    assert.equal(pushKind(f('a', 'Name', type), f('b', 'Name', 'company_contact')), 'contact', `${type} refused`);
  });
});

test('a contact still carries to a contact as an id, not as a new contact', () => {
  assert.equal(pushKind(f('a', 'Contact', 'company_contact'), f('b', 'Contact', 'company_contact')), 'carry');
});

test('a number does not become a contact', () => {
  // "Age → Contact" is somebody having named two unrelated fields the same thing, not an
  // instruction to create a person called 42.
  assert.equal(pushKind(f('a', 'X', 'number'), f('b', 'X', 'company_contact')), null);
  assert.equal(pushKind(f('a', 'X', 'date'), f('b', 'X', 'company_contact')), null);
  assert.equal(pushKind(f('a', 'X', 'checkbox'), f('b', 'X', 'company_contact')), null);
});

test('the copy rule is NOT widened — only the push can mint', () => {
  // canPull is used by the relationship copy, which has no way to create a contact. Allowing
  // text there would write the words where an id belongs and render as a broken chip.
  assert.equal(canPull('text', 'company_contact'), false);
});

test("the worked example: Prospects' text Name reaches Leads' contact Name", () => {
  const source = app('Prospects', [
    f('p-name', 'Name', 'text'),
    f('p-age', 'Age', 'number'),
    f('p-phone', 'Phone', 'phone'),
    f('p-email', 'Email', 'email'),
    f('p-loc', 'Location', 'location'),
    button,
  ]);
  const target = app('Leads', [
    f('l-name', 'Name', 'company_contact'),
    f('l-age', 'Age', 'number'),
  ]);
  const result = plan(source, target);

  assert.equal(pair(result, 'Name').kind, 'contact', 'Name should be filed as a contact');
  assert.equal(pair(result, 'Age').kind, 'carry', 'number → number is a plain carry');
  // Phone, Email and Location have no home in Leads, so they are created there as themselves —
  // and they ALSO reach the contact, which the writer does through the directory.
  assert.deepEqual(result.create.map((x) => x.label).sort(), ['Email', 'Location', 'Phone']);
  assert.equal(result.skipped.length, 0);
});

test('the directory does not grow columns, so what it lacks is named', () => {
  // Company Contacts is fixedFields: its list is the company's, arranged once in Settings.
  const source = app('Prospects', [f('p-name', 'Name', 'text'), f('p-x', 'Roof pitch', 'text'), button]);
  const directory = app('Company Contacts', [f('name', 'Name', 'text')], { fixedFields: true });
  const result = plan(source, directory);
  assert.equal(result.create.length, 0);
  assert.match(skip(result, 'Roof pitch').why, /has no Roof pitch/);
});

// --- naming a specific destination -------------------------------------------------------------
//
// "I want to set a specific field to copy or move the data to another field." Without it the
// push matched by label and nothing else, so two apps calling one thing by different names
// could not be joined up at all short of renaming a field.

const mapped = (rows) => ({ id: 'b1', label: 'Send', type: 'button', config: { map: rows } });

test('a mapped pair goes where it was told, not where its name points', () => {
  const source = app('Prospects', [f('p-full', 'Full name', 'text'), button]);
  const target = app('Leads', [f('l-client', 'Client name', 'text')]);
  const result = planPush(source, target, mapped([{ from: 'p-full', to: 'l-client' }]));
  assert.equal(pair(result, 'Full name').to.id, 'l-client');
  assert.equal(pair(result, 'Full name').mapped, true);
  assert.equal(result.create.length, 0, 'it should not also be created as a new column');
});

test('a mapping beats the name match for that field', () => {
  const source = app('Prospects', [f('p-name', 'Name', 'text'), button]);
  const target = app('Leads', [f('l-name', 'Name', 'text'), f('l-alias', 'Alias', 'text')]);
  const result = planPush(source, target, mapped([{ from: 'p-name', to: 'l-alias' }]));
  assert.equal(pair(result, 'Name').to.id, 'l-alias');
});

test('a destination a mapping claimed is not also filled by its namesake', () => {
  // Otherwise which of the two won would depend on the order the fields were dragged into.
  const source = app('Prospects', [
    f('p-name', 'Name', 'text'), f('p-full', 'Full name', 'text'), button,
  ]);
  const target = app('Leads', [f('l-name', 'Name', 'text')]);
  const result = planPush(source, target, mapped([{ from: 'p-full', to: 'l-name' }]));
  assert.equal(pair(result, 'Full name').to.id, 'l-name');
  assert.equal(pair(result, 'Name'), undefined, 'the namesake overwrote the mapped field');
  assert.match(skip(result, 'Name').why, /being filled by a field you mapped/);
});

test('the claim holds whichever order the fields sit in', () => {
  const target = app('Leads', [f('l-name', 'Name', 'text')]);
  const rows = mapped([{ from: 'p-full', to: 'l-name' }]);
  const order = (fields) => planPush(app('P', [...fields, button]), target, rows);
  const a = order([f('p-name', 'Name', 'text'), f('p-full', 'Full name', 'text')]);
  const b = order([f('p-full', 'Full name', 'text'), f('p-name', 'Name', 'text')]);
  assert.equal(pair(a, 'Full name').to.id, 'l-name');
  assert.equal(pair(b, 'Full name').to.id, 'l-name');
});

test('two fields aimed at one destination is reported, not silently last-wins', () => {
  const source = app('Prospects', [f('p-a', 'A', 'text'), f('p-b', 'B', 'text'), button]);
  const target = app('Leads', [f('l-x', 'X', 'text')]);
  const result = planPush(source, target, mapped([
    { from: 'p-a', to: 'l-x' }, { from: 'p-b', to: 'l-x' },
  ]));
  assert.equal(pair(result, 'A').to.id, 'l-x');
  assert.match(skip(result, 'B').why, /already being filled/);
});

test('a mapping still obeys the type rule', () => {
  // Naming a destination is not permission to corrupt it.
  const source = app('Prospects', [f('p-age', 'Age', 'text'), button]);
  const target = app('Leads', [f('l-n', 'Count', 'number')]);
  const result = planPush(source, target, mapped([{ from: 'p-age', to: 'l-n' }]));
  assert.equal(pair(result, 'Age'), undefined);
  assert.match(skip(result, 'Age').why, /cannot become a number/);
});

test('a mapping can aim text at a Company Contact field', () => {
  const source = app('Prospects', [f('p-who', 'Full name', 'text'), button]);
  const target = app('Leads', [f('l-c', 'Contact', 'company_contact')]);
  const result = planPush(source, target, mapped([{ from: 'p-who', to: 'l-c' }]));
  assert.equal(pair(result, 'Full name').kind, 'contact');
});

test('a mapping pointing at a field that has gone is ignored, not fatal', () => {
  const source = app('Prospects', [f('p-name', 'Name', 'text'), button]);
  const target = app('Leads', [f('l-name', 'Name', 'text')]);
  const result = planPush(source, target, mapped([{ from: 'p-name', to: 'deleted-field' }]));
  // Falls back to the name match rather than dropping the field on the floor.
  assert.equal(pair(result, 'Name').to.id, 'l-name');
});

test('half-written and duplicate rows do not break the plan', () => {
  const source = app('Prospects', [f('p-name', 'Name', 'text'), button]);
  const target = app('Leads', [f('l-a', 'A', 'text'), f('l-b', 'B', 'text')]);
  const result = planPush(source, target, mapped([
    { from: '', to: 'l-a' }, { from: 'p-name', to: '' },
    { from: 'p-name', to: 'l-a' }, { from: 'p-name', to: 'l-b' },
  ]));
  // First complete row for a source wins; the rest are noise.
  assert.equal(pair(result, 'Name').to.id, 'l-a');
});

test('no mapping at all leaves the old behaviour exactly as it was', () => {
  const source = app('Prospects', [f('p-name', 'Name', 'text'), button]);
  const target = app('Leads', [f('l-name', 'Name', 'text')]);
  [undefined, [], null].forEach((map) => {
    const result = planPush(source, target, { id: 'b1', config: map === undefined ? {} : { map } });
    assert.equal(pair(result, 'Name').to.id, 'l-name');
    assert.equal(pair(result, 'Name').mapped, undefined);
  });
});
