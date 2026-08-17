import assert from 'node:assert/strict';
import test from 'node:test';

import { placeableFields, plainFieldText } from '../src/form/host-values.js';

// A record's fields as plain words, for a printed document.
//
// The app renders values as HTML -- a coloured chip for a stage, a row of stars for a rating -- and
// none of that survives being put in a PDF. Stripping the tags would be worse than useless: a
// stage chip carries its label in an attribute and a rating carries no number at all. So this is
// the text half, and these are the cases where "just print the raw value" gets it wrong.

const say = (field, raw, helpers) => plainFieldText(field, raw, helpers);
const f = (type, config = {}) => ({ id: 'x', type, label: 'X', config });

test('an empty value is empty, whatever the type', () => {
  ['text', 'money', 'date', 'category', 'user', 'rating'].forEach((type) => {
    assert.equal(say(f(type), null), '');
    assert.equal(say(f(type), ''), '');
  });
});

test('money is money, not a number', () => {
  assert.equal(say(f('money'), 42500), '$42,500.00');
  assert.equal(say(f('money'), '1234.5'), '$1,234.50');
  assert.equal(say(f('money', { currency: 'EUR' }), 1000), '€1,000.00');
  assert.equal(say(f('money'), 'not a number'), '', 'rubbish prints as nothing, not as $NaN');
});

test('a number keeps its thousands separators and the decimals the field asked for', () => {
  assert.equal(say(f('number'), 1234567), '1,234,567');
  assert.equal(say(f('number', { decimals: 2 }), 3.14159), '3.14');
  assert.equal(say(f('number', { decimals: 0 }), 3.7), '4');
  assert.equal(say(f('calculation'), 12.5), '12.5');
});

test('a progress, a rating and a duration read as words rather than as widgets', () => {
  assert.equal(say(f('progress'), 63.4), '63%');
  // Written out: a row of star characters depends on a font the PDF has not got.
  assert.equal(say(f('rating'), 4), '4 / 5');
  assert.equal(say(f('rating'), 9), '5 / 5', 'clamped rather than printing 9 / 5');
  assert.equal(say(f('duration'), 90), '1h 30m');
  assert.equal(say(f('duration'), 45), '45m');
  assert.equal(say(f('duration'), 120), '2h', 'not "2h 0m"');
});

test('a yes/no says Yes or No — but only once somebody has been asked', () => {
  assert.equal(say(f('checkbox'), true), 'Yes');
  assert.equal(say(f('checkbox'), 'true'), 'Yes');
  // An unchecked box is stored as false, which is a real No.
  assert.equal(say(f('checkbox'), false), 'No');
  assert.equal(say(f('checkbox'), 'false'), 'No');
  // Never set at all is the different case, and prints nothing: "no" and "not asked" must not read
  // the same on a document somebody signs.
  assert.equal(say(f('checkbox'), undefined), '');
  assert.equal(say(f('checkbox'), null), '');
});

test('a stage or a category prints its label, not the id it is stored as', () => {
  // This is the one that makes a proposal look broken: the raw value is something like "o2".
  const options = [{ id: 'o1', label: 'Estimate Sent' }, { id: 'o2', label: 'Won' }];
  assert.equal(say(f('status', { options }), 'o2'), 'Won');
  assert.equal(say(f('category', { options }), 'o1'), 'Estimate Sent');
  // An option somebody deleted shows the raw value: whoever reads the document needs to see that
  // there IS something there.
  assert.equal(say(f('status', { options }), 'o9'), 'o9');
});

test('a multi-select prints every label, comma separated', () => {
  const options = [{ id: 'a', label: 'Roof' }, { id: 'b', label: 'Gutters' }, { id: 'c', label: 'Siding' }];
  assert.equal(say(f('tags', { options }), ['a', 'c']), 'Roof, Siding');
  assert.equal(say(f('tags', { options }), []), '');
});

test('people and linked records are resolved by whoever knows their names', () => {
  const helpers = {
    memberName: (id) => ({ u1: 'Kim Alvarez', u2: 'Sam Reed' }[id] || ''),
    recordTitle: (id) => ({ r1: 'Acme Roofing' }[id] || ''),
  };
  assert.equal(say(f('user'), ['u1', 'u2'], helpers), 'Kim Alvarez, Sam Reed');
  assert.equal(say(f('user'), 'u1', helpers), 'Kim Alvarez', 'a single assignment is not an array');
  assert.equal(say(f('relationship'), ['r1'], helpers), 'Acme Roofing');
  assert.equal(say(f('company_contact'), 'r1', helpers), 'Acme Roofing');
  // Nobody by that id: nothing, rather than the id leaking onto a client's proposal.
  assert.equal(say(f('user'), ['gone'], helpers), '');
});

test('a date is written the way the rest of the app writes dates', () => {
  // Not reimplemented here: the company's format lives in one place and this borrows it.
  assert.equal(say(f('date'), '2026-08-17', { formatDate: () => 'Aug 17, 2026' }), 'Aug 17, 2026');
});

test('an address prints the address, whether it was typed or picked off a map', () => {
  assert.equal(say(f('location'), '12 Mill Rd'), '12 Mill Rd');
  assert.equal(say(f('location'), { address: '12 Mill Rd', lat: 1, lng: 2 }), '12 Mill Rd');
  assert.equal(say(f('location'), { label: 'Site B' }), 'Site B');
});

test('a checklist prints how far along it is', () => {
  const steps = [{ text: 'Tear off', done: true }, { text: 'Deck', done: true }, { text: 'Shingles' }];
  assert.equal(say(f('checklist'), steps), '2 of 3 done');
  assert.equal(say(f('checklist'), { steps }), '2 of 3 done');
  assert.equal(say(f('checklist'), []), '');
});

test('files and images print their names', () => {
  assert.equal(say(f('file'), [{ name: 'permit.pdf' }, { name: 'photo.jpg' }]), 'permit.pdf, photo.jpg');
  assert.equal(say(f('image'), { name: 'logo.png' }), 'logo.png');
});

test('a sheet or a form inside a record prints its name, being a document of its own', () => {
  assert.equal(say(f('sheet'), JSON.stringify({ title: 'Roof takeoff' })), 'Roof takeoff');
  assert.equal(say(f('form'), { title: 'Change order' }), 'Change order');
  assert.equal(say(f('sheet'), '{{{ broken'), '', 'unparseable is empty, not a crash');
});

test('an unknown type still prints something rather than [object Object]', () => {
  assert.equal(say(f('some_future_type'), 'plain'), 'plain');
  assert.equal(say(f('some_future_type'), { label: 'From an object' }), 'From an object');
  assert.ok(!say(f('some_future_type'), { nothing: 1 }).includes('object'));
});

test('a missing field definition does not throw', () => {
  assert.equal(plainFieldText(null, 'value'), 'value');
  assert.equal(plainFieldText(undefined, ''), '');
});

// --- what may be placed ----------------------------------------------------------------------------

test('everything with words in it can go on a page — a button and a form cannot', () => {
  // Wider than form-model's importable list on purpose: an element on a page is just text, so a
  // rollup or a relationship prints perfectly well even though a FORM FIELD could not hold one.
  const fields = [
    f('text'), f('money'), f('rollup'), f('relationship'), f('user'), f('sheet'),
    { id: 'b', type: 'button', label: 'Send', config: {} },
    { id: 'n', type: 'form', label: 'Nested', config: {} },
  ];
  const out = placeableFields(fields).map((field) => field.type);
  assert.ok(out.includes('rollup') && out.includes('relationship'), 'both print as text');
  assert.ok(!out.includes('button'), 'a button holds no value');
  assert.ok(!out.includes('form'), 'a document inside a document');
  assert.deepEqual(placeableFields(null), []);
});
