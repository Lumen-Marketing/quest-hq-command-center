import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FORM_FIELD_TYPES, PAGE_SIZES, calcProblems, calcValue, fieldValue,
  importableFields, normalizeForm, normalizePage,
} from '../src/form/form-model.js';

// The Form field's model: a small document you design once and fill in per record.
//
// Deliberately NOT the Sheet field. A sheet is a grid of anonymous cells addressed A1..Z99; a
// form is a list of NAMED, TYPED fields with a layout of its own. They share the container
// pattern and nothing of the grid.
//
// Pure, so a formula and a page size are checked without a browser — which is what the Sheet
// field's own history says to do: it shipped broken with 2,973 tests green because nothing
// CALLED the code.

let n = 0;
const id = () => `x${(n += 1)}`;
const form = (fields, values = {}) => {
  const out = normalizeForm({ fields, values }, id);
  Object.entries(values).forEach(([label, value]) => {
    const field = out.fields.find((f) => f.label === label);
    if (field) out.values[field.id] = value;
  });
  return out;
};
const at = (f, label) => f.fields.find((x) => x.label === label);

test('a form is fields, values and a page — not cells', () => {
  const out = normalizeForm({}, id);
  assert.deepEqual(out.fields, []);
  assert.deepEqual(out.values, {});
  assert.equal(out.layout, null, 'null means never arranged, not arranged to be empty');
  // Nothing grid-shaped anywhere in the shape.
  ['rows', 'cols', 'cells', 'merges', 'colW', 'rowH'].forEach((grid) => {
    assert.ok(!(grid in out), `a form must not carry ${grid} — that is the Sheet field`);
  });
});

test('the palette is what a printed document can actually show', () => {
  // Each exclusion has its own reason: a relationship and a rollup resolve against an app a
  // document does not have, a button holds no value, a sheet is a grid.
  ['relationship', 'rollup', 'button', 'sheet', 'company_contact', 'file'].forEach((type) => {
    assert.ok(!FORM_FIELD_TYPES.includes(type), `${type} must not be a form field`);
  });
  ['text', 'number', 'money', 'date', 'calculation'].forEach((type) => {
    assert.ok(FORM_FIELD_TYPES.includes(type));
  });
});

test('an unknown type falls back rather than throwing', () => {
  const out = normalizeForm({ fields: [{ label: 'X', type: 'sheet' }] }, id);
  assert.equal(out.fields[0].type, 'text');
});

// --- where a value comes from ------------------------------------------------------------------

test('a field is typed in here, or read live off the record the form sits on', () => {
  const f = form([
    { label: 'Notes', type: 'text' },
    { label: 'Client', type: 'text', source: 'record', from: 'h-name' },
  ], { Notes: 'by hand' });
  assert.equal(fieldValue(f, at(f, 'Notes')), 'by hand');
  assert.equal(fieldValue(f, at(f, 'Client'), { 'h-name': 'Kim' }), 'Kim');
});

test('a record-sourced field holds no copy, so it cannot go stale', () => {
  // This is the half that makes it different from a standalone form builder: the document reads
  // the record, rather than snapshotting it at the moment somebody filled the form in.
  const f = form([{ label: 'Client', type: 'text', source: 'record', from: 'h-name' }]);
  assert.equal(fieldValue(f, f.fields[0], { 'h-name': 'Kim' }), 'Kim');
  assert.equal(fieldValue(f, f.fields[0], { 'h-name': 'Renamed' }), 'Renamed');
  assert.equal(Object.keys(f.values).length, 0, 'nothing was stored for it');
});

test('a record-sourced field with nothing chosen reads blank, not undefined', () => {
  const f = form([{ label: 'Client', type: 'text', source: 'record' }]);
  assert.equal(fieldValue(f, f.fields[0], { 'h-name': 'Kim' }), '');
});

test('importable host fields are matched on TYPE, and the taken ones are marked', () => {
  // Not on label: the form's field is already named by whoever designed it, and making them
  // rename it to match the app would defeat the point.
  const f = form([{ label: 'Client', type: 'text', source: 'record', from: 'h-name' }]);
  const offer = importableFields(f, [
    { id: 'h-name', label: 'Name', type: 'text' },
    { id: 'h-total', label: 'Total', type: 'money' },
    { id: 'h-rel', label: 'Deal', type: 'relationship' },
    { id: 'h-btn', label: 'Send', type: 'button' },
  ]);
  assert.deepEqual(offer.map((o) => o.id), ['h-name', 'h-total'], 'only what a form can hold');
  assert.equal(offer.find((o) => o.id === 'h-name').taken, true);
  assert.equal(offer.find((o) => o.id === 'h-total').taken, false);
});

test('a value whose field was deleted is dropped, not kept as a ghost', () => {
  const out = normalizeForm({ fields: [{ id: 'keep', label: 'A', type: 'text' }], values: { keep: 1, gone: 2 } }, id);
  assert.deepEqual(out.values, { keep: 1 });
});

// --- calculations ------------------------------------------------------------------------------

test('a calculation adds up the fields it names', () => {
  const f = form([
    { label: 'Qty', type: 'number' },
    { label: 'Rate', type: 'money' },
    { label: 'Total', type: 'calculation', config: { formula: '{Qty} * {Rate}' } },
  ], { Qty: 3, Rate: 125 });
  assert.equal(calcValue(f, at(f, 'Total')), 375);
  assert.deepEqual(calcProblems(f), []);
});

test('a calculation can read a record-sourced number too', () => {
  const f = form([
    { label: 'Hours', type: 'number', source: 'record', from: 'h-hrs' },
    { label: 'Rate', type: 'money' },
    { label: 'Total', type: 'calculation', config: { formula: '{Hours} * {Rate}' } },
  ], { Rate: 50 });
  assert.equal(calcValue(f, at(f, 'Total'), { 'h-hrs': 4 }), 200);
});

test('a formula pointing at another calculation is reported, not silently zero', () => {
  // The one mistake that makes a document look right and compute wrong.
  const f = form([
    { label: 'A', type: 'number' },
    { label: 'B', type: 'calculation', config: { formula: '{A} * 2' } },
    { label: 'C', type: 'calculation', config: { formula: '{B} + 1' } },
  ], { A: 5 });
  assert.equal(calcValue(f, at(f, 'B')), 10);
  const said = calcProblems(f).map((p) => p.why).join(' | ');
  assert.match(said, /\{B\} is itself a calculation, which reads 0/);
});

test('a formula naming something that is not a number, or not there, is reported', () => {
  const f = form([
    { label: 'Note', type: 'text' },
    { label: 'Bad', type: 'calculation', config: { formula: '{Note} + {Missing}' } },
  ]);
  const said = calcProblems(f).map((p) => p.why).join(' | ');
  assert.match(said, /\{Note\} is not a number/);
    assert.match(said, /\{Missing\} is not a field on this form/);
});

test('the grammar refuses anything but numbers and + - * / ( )', () => {
  ['constructor', 'window.alert(1)', '1; return 2', '{Qty}.toString()'].forEach((formula) => {
    const f = form([{ label: 'Qty', type: 'number' }, { label: 'X', type: 'calculation', config: { formula } }], { Qty: 1 });
    assert.equal(calcValue(f, at(f, 'X')), null, `${formula} must not be evaluated`);
    assert.ok(calcProblems(f).length, `${formula} must be reported`);
  });
});

test('the whitelist, not the try/catch, is what refuses a formula', () => {
  // `constructor` throws on its own, so asserting only on that passed even with the whitelist
  // deleted. This is valid JavaScript returning a NUMBER, so the only thing that can refuse it
  // is the character check running before Function() is ever reached.
  const f = form([{ label: 'X', type: 'calculation', config: { formula: '0x10' } }]);
  assert.equal(calcValue(f, at(f, 'X')), null, 'the grammar whitelist is not being applied');
  const g = form([{ label: 'X', type: 'calculation', config: { formula: '(8).toFixed(0)' } }]);
  assert.equal(calcValue(g, at(g, 'X')), null);
});

test('a divide by zero shows nothing rather than Infinity', () => {
  const f = form([
    { label: 'A', type: 'number' }, { label: 'B', type: 'number' },
    { label: 'X', type: 'calculation', config: { formula: '{A} / {B}' } },
  ], { A: 5, B: 0 });
  assert.equal(calcValue(f, at(f, 'X')), null);
});

test('an empty number counts as zero rather than breaking the sum', () => {
  const f = form([
    { label: 'A', type: 'number' }, { label: 'B', type: 'number' },
    { label: 'X', type: 'calculation', config: { formula: '{A} + {B}' } },
  ], { A: 5 });
  assert.equal(calcValue(f, at(f, 'X')), 5);
});

// --- the page it prints onto --------------------------------------------------------------------

test('page setup is bounded, so a margin cannot swallow the page', () => {
  assert.deepEqual(normalizePage({}), { size: 'a4', landscape: false, margin: 12 });
  assert.equal(normalizePage({ margin: 999 }).margin, 40);
  assert.equal(normalizePage({ margin: -5 }).margin, 0);
  assert.equal(normalizePage({ size: 'foolscap' }).size, 'a4', 'an unknown size falls back');
  assert.equal(normalizePage({ size: 'letter', landscape: true }).landscape, true);
  Object.values(PAGE_SIZES).forEach(([w, h]) => assert.ok(w > 0 && h > w, 'portrait dimensions'));
});
