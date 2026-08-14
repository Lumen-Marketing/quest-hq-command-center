import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// A record is named by the first field that reads like a name. Some field types hold data that
// is emphatically not one, and a sheet is the worst of them: it stores its entire grid as a JSON
// string, so the activity feed announced
//
//   Added {"rows":39,"cols":24,"cells":{"A3":"Labor Description","B3":"QTY",…
//
// as the record's title, and the unbroken string dragged the whole feed column sideways.
//
// wbNameValue is RUN here rather than read: the bug was a missing `case` in a switch, which a
// source match for the type name would have passed either way.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const at = main.lastIndexOf('function wbNameValue(');
assert.notEqual(at, -1, 'wbNameValue not found');
const body = main.slice(at, main.indexOf('\n}', at) + 2);
const wbNameValue = new Function(
  'wbAutoNumberText', 'companyContactById', 'wbLocateApp', 'wbMemberById', 'wbRelTargetApp',
  'wbSimpleTitle', 'wbRelLabel',
  `${body}; return wbNameValue;`,
)(() => 'A-1', () => null, () => ({}), () => null, () => null, () => '', () => '');

const named = (type, value, config = {}) =>
  wbNameValue({ fields: [] }, { id: 'f1', type, config }, { values: { f1: value } });

const SHEET = JSON.stringify({
  rows: 39, cols: 24,
  cells: { A3: 'Labor Description', B3: 'QTY', C3: 'Unit Price per Square', B4: '65' },
});

test('a sheet never names a record', () => {
  assert.equal(named('sheet', SHEET), '');
  assert.equal(named('sheet', '{}'), '');
});

test('a button never names a record either', () => {
  // It holds its own configuration, which is no more a title than the grid is.
  assert.equal(named('button', '{"op":"push","targetApp":"a1"}'), '');
});

test('the fields that DO name a record still do', () => {
  assert.equal(named('text', 'Roof replacement'), 'Roof replacement');
  assert.equal(named('number', 42, { unit: 'sq' }), '42 sq');
  assert.equal(named('money', 1200, { currency: '$' }), '$1200');
  assert.equal(named('category', 'o1', { options: [{ id: 'o1', label: 'Won' }] }), 'Won');
});

test('the other value-shaped types are still left out', () => {
  // Guarding the whole list, not just the two that were added: this is one switch, and the
  // next field type with a JSON payload belongs in it too.
  ['checklist', 'progress', 'checkbox', 'file', 'image', 'duration', 'calculation', 'rating',
    'tags', 'rollup', 'created_time', 'updated_time'].forEach((type) => {
    assert.equal(named(type, 'anything'), '', `${type} must not name a record`);
  });
});

test('an empty value is empty whatever the type', () => {
  assert.equal(named('text', ''), '');
  assert.equal(named('text', null), '');
  assert.equal(named('relationship', []), '');
});

// ---- and the same blob in a table cell ---------------------------------------------------

// wbNameValue keeps a sheet from NAMING a record. wbPlainVal is the other renderer -- the one
// behind table cells, card fields, search, sort and CSV export -- and it was still printing the
// whole grid into a column. "A spreadsheet must show a label or the file name; if there is no
// file name it just displays Spreadsheet."

const plainAt = main.indexOf('function wbPlainVal(');
assert.notEqual(plainAt, -1, 'wbPlainVal not found');
const plainBody = main.slice(plainAt, main.indexOf('\n}\n', main.indexOf('function wbSheetLabel(')) + 2);
const noop = () => '';
const wbPlainVal = new Function(
  'wbCalcRaw', 'wbRollupValue', 'wbProgressFillPct', 'wbMemberById', 'companyContactLabel',
  'wbRelTargetApp', 'wbRelLabel', 'wbFileValue', 'wbFmtDuration', 'wbChecklistStats', 'wbAutoNumberText',
  `${plainBody}; return wbPlainVal;`,
)(noop, noop, () => null, () => null, noop, () => null, noop, () => null, noop, () => ({}), noop);

const shown = (type, value) => wbPlainVal('c1', null, { fields: [] }, { id: 'f1', type, config: {} }, value, {});

const GRID = JSON.stringify({
  rows: 200, cols: 24,
  cells: { A3: 'Labor Description', B3: 'QTY', C3: 'Unit Price', F3: 'GAF MEASUREMENT' },
});

test('a sheet shows its name, not its contents', () => {
  assert.equal(shown('sheet', JSON.stringify({ title: 'Roof takeoff', cells: { A1: 'x' } })), 'Roof takeoff');
});

test('a sheet with no name is just called Spreadsheet', () => {
  assert.equal(shown('sheet', GRID), 'Spreadsheet');
  assert.equal(shown('sheet', JSON.stringify({ title: '   ', cells: {} })), 'Spreadsheet');
});

test('a value that will not parse still reads as a spreadsheet, not as an error', () => {
  assert.equal(shown('sheet', '{not json'), 'Spreadsheet');
});

test('an empty sheet cell stays empty rather than saying Spreadsheet', () => {
  assert.equal(shown('sheet', ''), '');
  assert.equal(shown('sheet', null), '');
});

test('a button has nothing to show in a column', () => {
  assert.equal(shown('button', '{"op":"push","targetApp":"a1"}'), '');
});

test('the fields that do have a value still show it', () => {
  assert.equal(shown('text', 'Roof job'), 'Roof job');
  assert.equal(shown('money', 1200), '$1200');
  assert.equal(shown('checkbox', true), 'yes');
});

test('an imported file names the sheet after itself', () => {
  // So the column reads "Roof takeoff" rather than "Spreadsheet" for every sheet on the app.
  const editor = readFileSync(new URL('../src/sheet/sheet-editor.js', import.meta.url), 'utf8');
  assert.match(editor, /if \(!String\(sheet\.title \|\| ''\)\.trim\(\)\) \{/);
  assert.match(editor, /sheet\.title = file\.name\.replace\(\/\\\.\[\^\.\]\+\$\/, ''\)/);
});
