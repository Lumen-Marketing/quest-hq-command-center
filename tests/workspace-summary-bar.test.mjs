import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { createSummaryBar, summaryTitleOf } from '../src/workspace/summary-bar.js';
import { calcName } from '../src/workspace/summary.js';

// The arithmetic is covered in workspace-summary.test.mjs. This is the part that decides what a
// column's values ARE -- an option id is not what the reader sees -- and what the strip does
// with a selection.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const items = readFileSync(new URL('../src/workspace/items-view.js', import.meta.url), 'utf8');
const io = readFileSync(new URL('../src/workspace/data-io.js', import.meta.url), 'utf8');

const esc = (v) => String(v ?? '');
// Stands in for main.js's formatter: an option id resolved to its label.
const plain = (_c, _w, _a, field, raw) => {
  const options = field.config?.options || [];
  return options.find((o) => String(o.id) === String(raw))?.label ?? String(raw ?? '');
};
const bar = createSummaryBar({ h: esc, wbPlainVal: plain });

const APP = {
  name: 'Prospects',
  fields: [
    { id: 'amt', label: 'Amount', type: 'number' },
    { id: 'sex', label: 'Sex', type: 'category', config: { options: [{ id: 'm', label: 'Male' }, { id: 'f', label: 'Female' }] } },
    { id: 'who', label: 'Name', type: 'text' },
  ],
  summary: { amt: { fn: 'sum' }, sex: { fn: 'countIf', value: 'Male' }, who: { fn: 'count' } },
};
const ROWS = [
  { id: 'r1', values: { amt: 10, sex: 'm', who: 'Ana' } },
  { id: 'r2', values: { amt: 20, sex: 'f', who: 'Bo' } },
  { id: 'r3', values: { amt: 30, sex: 'm', who: '' } },
];

test('the answers appear under the columns they belong to', () => {
  const html = bar.summaryBar('co', {}, APP, ROWS, { sel: new Set() }, true);
  assert.match(html, /Amount/);
  assert.match(html, />60</, 'sum of the amounts');
  assert.match(html, />2</, 'two of them are Male');
  assert.match(html, />3</, 'three records counted');
});

test('ticking records narrows the calculation to those records', () => {
  // This is what makes the strip worth having: tick four and the total is those four.
  const html = bar.summaryBar('co', {}, APP, ROWS, { sel: new Set(['r1', 'r2']) }, true);
  assert.match(html, />30</, 'only the ticked amounts');
  assert.match(html, /2 selected records/);
});

test('a selection that survives no filter falls back to everything', () => {
  // A row of dashes is a worse answer than the whole list.
  const scope = bar.scopeRows(ROWS, { sel: new Set(['gone']) });
  assert.equal(scope.selected, false);
  assert.equal(scope.rows.length, 3);
});

test('count if is matched against the label, not the stored id', () => {
  // The cell holds `m`. Nobody has seen `m`; they have seen Male.
  assert.equal(bar.readerValue('co', {}, APP, APP.fields[1], ROWS[0]), 'Male');
  // A number stays a number, because the arithmetic wants the number and not "$10.00".
  assert.equal(bar.readerValue('co', {}, APP, APP.fields[0], ROWS[0]), 10);
});

test('a tags cell reads as its labels, so one row can match several counts', () => {
  const field = { id: 't', label: 'Tags', type: 'tags', config: { options: [{ id: 'a', label: 'Roofing' }, { id: 'b', label: 'Urgent' }] } };
  assert.deepEqual(bar.readerValue('co', {}, APP, field, { values: { t: ['a', 'b'] } }), ['Roofing', 'Urgent']);
});

test('a reader without manage sees the answers but not the pickers', () => {
  const html = bar.summaryBar('co', {}, APP, ROWS, { sel: new Set() }, false);
  assert.doesNotMatch(html, /data-wb-sum-fn/);
  assert.match(html, />60</, 'the totals still show');
  assert.match(html, /Sum/, 'named, so a number without a label is never shown');
});

test('an app with no fields shows no strip at all', () => {
  assert.equal(bar.summaryBar('co', {}, { fields: [] }, [], { sel: new Set() }, true), '');
});

// ---- printing ---------------------------------------------------------------------------------

test('printing gets a table of its own, not the strip', () => {
  // Paper has no scroll: the strip runs off the side of the page, a table reads down.
  const html = bar.summaryPrintTable('co', {}, APP, ROWS, { sel: new Set() });
  assert.match(html, /<table class="wb-sum-print">/);
  // "Field" stopped being accurate once the first column carries a name the reader chose.
  assert.match(html, /<th>Label<\/th><th>Calculation<\/th><th>Value<\/th>/);
  assert.match(html, /Count if Male/);
});

test('only the columns actually asked something are printed', () => {
  const app = { ...APP, summary: { amt: { fn: 'sum' } } };
  const html = bar.summaryPrintTable('co', {}, app, ROWS, { sel: new Set() });
  assert.match(html, /Amount/);
  assert.doesNotMatch(html, /Name/, 'printing dashes helps nobody');
});

test('nothing configured prints nothing', () => {
  assert.equal(bar.summaryPrintTable('co', {}, { ...APP, summary: {} }, ROWS, { sel: new Set() }), '');
});

test('the label can be hidden on print, and only the label goes', () => {
  const shown = bar.summaryPrintTable('co', {}, APP, ROWS, { sel: new Set() });
  assert.match(shown, /<caption>Calculations/);
  const hidden = bar.summaryPrintTable('co', {}, { ...APP, summaryHideLabel: true }, ROWS, { sel: new Set() });
  assert.doesNotMatch(hidden, /<caption>/);
  assert.match(hidden, /Count if Male/, 'the numbers stay');
});

// ---- wiring -----------------------------------------------------------------------------------

test('the strip renders below the list and above the footer', () => {
  // Always last, whichever layout is showing. A total that moves is one you go looking for.
  assert.match(items, /<div id="wbItemsList">\$\{listBody\}<\/div>\s*\n\s*\$\{summary\}/);
});

test('the configuration survives a reload', () => {
  // normalizeWorkspaceBuilderDoc drops everything it does not name, so without these two the
  // totals come back blank on the next load.
  assert.match(main, /\{ summary: app\.summary \}/);
  assert.match(main, /\.\.\.\(app\.summaryHideLabel \? \{ summaryHideLabel: true \} : \{\}\)/);
});

test('changing a calculation saves it, and only a manager may', () => {
  const block = main.slice(main.indexOf('const summaryApp = ()'));
  assert.match(block.slice(0, 1800), /if \(!can\('workspaces\.manage', companyId\)\) return null;/);
  assert.match(block.slice(0, 1800), /if \(el\.value !== 'countIf'\) entry\.value = '';/);
  assert.match(block.slice(0, 1800), /wbSave\(companyId\);/);
});

test('print passes the selection through, so a selected print totals the selection', () => {
  assert.match(io, /summaryPrintTable\(companyId, workspace, app, items, \{ sel: onlyIds \|\| new Set\(\) \}\)/);
});

// ---- naming it --------------------------------------------------------------------------------

test('the heading is a default, not a fixed word', () => {
  // What a team is totalling has a name of its own -- Totals, Job costs, This month.
  assert.equal(summaryTitleOf({}), 'Calculations');
  assert.equal(summaryTitleOf({ summaryTitle: 'Job costs' }), 'Job costs');
  assert.equal(summaryTitleOf({ summaryTitle: '   ' }), 'Calculations', 'blank falls back');
  assert.equal(summaryTitleOf(undefined), 'Calculations');
});

test('a manager edits the heading in place; a reader just reads it', () => {
  const app = { ...APP, summaryTitle: 'Job costs' };
  const editable = bar.summaryBar('co', {}, app, ROWS, { sel: new Set() }, true);
  assert.match(editable, /data-wb-sum-title value="Job costs"/);
  const readOnly = bar.summaryBar('co', {}, app, ROWS, { sel: new Set() }, false);
  assert.doesNotMatch(readOnly, /data-wb-sum-title/);
  assert.match(readOnly, /<b class="wb-sum-title">Job costs<\/b>/);
});

test('the name it was given is the name on the printout', () => {
  const html = bar.summaryPrintTable('co', {}, { ...APP, summaryTitle: 'Job costs' }, ROWS, { sel: new Set() });
  assert.match(html, /<caption>Job costs — 3 records<\/caption>/);
});

test('hiding the label on print still hides it, whatever it was renamed to', () => {
  const html = bar.summaryPrintTable('co', {}, { ...APP, summaryTitle: 'Job costs', summaryHideLabel: true }, ROWS, { sel: new Set() });
  assert.doesNotMatch(html, /Job costs/);
  assert.match(html, /Count if Male/, 'the numbers stay');
});

test('the name survives a reload, trimmed and bounded', () => {
  // normalizeWorkspaceBuilderDoc drops what it does not name; 60 characters is a heading, not
  // a paragraph pushed into one.
  assert.match(main, /typeof app\.summaryTitle === 'string' && app\.summaryTitle\.trim\(\)/);
  assert.match(main, /summaryTitle: app\.summaryTitle\.trim\(\)\.slice\(0, 60\)/);
});

test('clearing the name removes it rather than storing an empty heading', () => {
  const block = main.slice(main.indexOf("bind('[data-wb-sum-title]'"));
  assert.match(block.slice(0, 700), /if \(name\) target\.summaryTitle = name;/);
  assert.match(block.slice(0, 700), /else delete target\.summaryTitle;/);
});

// ---- naming each calculation ------------------------------------------------------------------

test('a calculation is named after its field until somebody says otherwise', () => {
  // The field name answers "which column"; a total often wants to answer "which number".
  assert.equal(calcName({ label: 'Number' }, {}), 'Number');
  assert.equal(calcName({ label: 'Number' }, { label: 'Total contract value' }), 'Total contract value');
  assert.equal(calcName({ label: 'Number' }, { label: '   ' }), 'Number', 'blank falls back');
  assert.equal(calcName({}, {}), 'Field', 'and something is always shown');
});

test('the printout shows the name, not the field it came from', () => {
  const app = { ...APP, summary: { amt: { fn: 'sum', label: 'Total contract value' } } };
  const html = bar.summaryPrintTable('co', {}, app, ROWS, { sel: new Set() });
  assert.match(html, /Total contract value/);
  assert.doesNotMatch(html, /<td>Amount<\/td>/, 'the field name is not what was asked for');
  // "Field" stops being accurate once the name is the reader's own.
  assert.match(html, /<th>Label<\/th>/);
});

test('the strip shows the name too', () => {
  const app = { ...APP, summary: { amt: { fn: 'sum', label: 'Total contract value' } } };
  const html = bar.summaryBar('co', {}, app, ROWS, { sel: new Set() }, false);
  assert.match(html, /Total contract value/);
});

test('the name is editable only once the column has been asked something', () => {
  // A row of editable names above fifteen "None"s would read as fifteen calculations that are
  // not there.
  const app = { ...APP, summary: { amt: { fn: 'sum' }, who: { fn: 'none' } } };
  const html = bar.summaryBar('co', {}, app, ROWS, { sel: new Set() }, true);
  assert.match(html, /data-wb-sum-label="amt"/);
  assert.doesNotMatch(html, /data-wb-sum-label="who"/);
});

test('a reader gets the name as text, never a box', () => {
  const app = { ...APP, summary: { amt: { fn: 'sum', label: 'Total contract value' } } };
  const html = bar.summaryBar('co', {}, app, ROWS, { sel: new Set() }, false);
  assert.doesNotMatch(html, /data-wb-sum-label/);
  assert.match(html, /Total contract value/);
});

test('clearing the name falls back rather than storing the field name', () => {
  const block = main.slice(main.indexOf("bind('[data-wb-sum-label]'"));
  assert.match(block.slice(0, 800), /if \(name\) entry\.label = name;/);
  assert.match(block.slice(0, 800), /else delete entry\.label;/);
});
