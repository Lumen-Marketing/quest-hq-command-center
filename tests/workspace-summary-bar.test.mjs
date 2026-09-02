import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { createSummaryBar, printColgroup, summaryTitleOf } from '../src/workspace/summary-bar.js';
import {
  calcName, lineIsEmpty, summaryColName, summaryLines, summaryLinesForEdit,
} from '../src/workspace/summary.js';

// The arithmetic is covered in workspace-summary.test.mjs. This is the part that decides what a
// column's values ARE (an option id is not what the reader sees), what a selection does, and the
// shape the table takes on screen and on paper.

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

const FIELDS = [
  { id: 'amt', label: 'Allowance', type: 'number' },
  { id: 'sex', label: 'Sex', type: 'category', config: { options: [{ id: 'm', label: 'Male' }, { id: 'f', label: 'Female' }] } },
  { id: 'who', label: 'Name', type: 'text' },
];
const ROWS = [
  { id: 'r1', values: { amt: 3000, sex: 'm', who: 'Roman' } },
  { id: 'r2', values: { amt: 1000, sex: 'f', who: 'Juan' } },
];
const line = (calc, over = {}) => ({ id: 'line-1', label: '', calc, ...over });
const appWith = (...lines) => ({ name: 'calc', fields: FIELDS, summaryRows: lines });

const ALL = { sel: new Set() };

// ---- what a column's values mean ---------------------------------------------------------------

test('a number stays a number; everything else becomes what the reader sees', () => {
  // The arithmetic wants 3000, not "$3,000.00". Count if wants "Male", not the id `m`.
  assert.equal(bar.readerValue('co', {}, appWith(), FIELDS[0], ROWS[0]), 3000);
  assert.equal(bar.readerValue('co', {}, appWith(), FIELDS[1], ROWS[0]), 'Male');
});

test('a tags cell reads as its labels, so one row can match several counts', () => {
  const field = { id: 't', label: 'Tags', type: 'tags', config: { options: [{ id: 'a', label: 'Roofing' }, { id: 'b', label: 'Urgent' }] } };
  assert.deepEqual(bar.readerValue('co', {}, appWith(), field, { values: { t: ['a', 'b'] } }), ['Roofing', 'Urgent']);
});

// ---- the table on screen -----------------------------------------------------------------------

test('the answers sit under the columns they describe', () => {
  const app = appWith(line({ amt: { fn: 'sum' }, sex: { fn: 'countIf', value: 'Male' } }));
  const html = bar.summaryBar('co', {}, app, ROWS, ALL, false);
  assert.match(html, /<th title="Allowance">Allowance<\/th>/);
  assert.match(html, />4000</, 'the allowances add up');
  assert.match(html, />1</, 'one of them is Male');
});

test('a column asked nothing is an empty cell', () => {
  const app = appWith(line({ amt: { fn: 'sum' } }));
  const html = bar.summaryBar('co', {}, app, ROWS, ALL, false);
  const cells = html.match(/<td class="wb-sum-cell[^"]*">[\s\S]*?<\/td>/g) || [];
  assert.equal(cells.length, 3, 'one cell per field');
  assert.ok(cells.some((cell) => cell.replace(/<[^>]+>/g, '').trim() === ''), 'and the unasked ones are blank');
});

test('ticking records narrows every line to those records', () => {
  const app = appWith(line({ amt: { fn: 'sum' } }));
  const html = bar.summaryBar('co', {}, app, ROWS, { sel: new Set(['r1']) }, false);
  assert.match(html, />3000</, 'only the ticked allowance');
  assert.match(html, /1 selected record</);
});

test('a selection that survives no filter falls back to everything', () => {
  // A table of dashes is a worse answer than the whole list.
  const scope = bar.scopeRows(ROWS, { sel: new Set(['gone']) });
  assert.equal(scope.selected, false);
  assert.equal(scope.rows.length, 2);
});

test('more than one line, so a column can be asked two things', () => {
  // A Sum and an Average of the same money were mutually exclusive when there was one line.
  const app = appWith(
    line({ amt: { fn: 'sum' } }, { id: 'l1', label: 'Totals' }),
    line({ amt: { fn: 'average' } }, { id: 'l2', label: 'Averages' }),
  );
  const html = bar.summaryBar('co', {}, app, ROWS, ALL, false);
  assert.match(html, /Totals/);
  assert.match(html, /Averages/);
  assert.match(html, />4000</);
  assert.match(html, />2000</);
});

test('a manager always gets a line to start in; a reader is shown only finished ones', () => {
  const empty = appWith();
  assert.match(bar.summaryBar('co', {}, empty, ROWS, ALL, true), /data-wb-sum-fn/, 'a line to choose in');
  assert.equal(bar.summaryBar('co', {}, empty, ROWS, ALL, false), '', 'and nothing published until it says something');
});

test('a reader gets the numbers and what they mean, never a control', () => {
  const app = appWith(line({ sex: { fn: 'countIf', value: 'Male' } }));
  const html = bar.summaryBar('co', {}, app, ROWS, ALL, false);
  assert.doesNotMatch(html, /<select|<input/);
  // "1" under a Name column means nothing without the words beside it.
  assert.match(html, /Count if Male/);
});

test('the remove button appears only when there is more than one line', () => {
  const one = appWith(line({ amt: { fn: 'sum' } }));
  assert.doesNotMatch(bar.summaryBar('co', {}, one, ROWS, ALL, true), /data-wb-sum-drop/);
  const two = appWith(line({ amt: { fn: 'sum' } }, { id: 'l1' }), line({}, { id: 'l2' }));
  assert.match(bar.summaryBar('co', {}, two, ROWS, ALL, true), /data-wb-sum-drop="l2"/);
});

test('an app with no fields shows no table at all', () => {
  assert.equal(bar.summaryBar('co', {}, { fields: [] }, [], ALL, true), '');
});

// ---- naming ------------------------------------------------------------------------------------

test('the heading is a default, not a fixed word', () => {
  assert.equal(summaryTitleOf({}), 'Calculations');
  assert.equal(summaryTitleOf({ summaryTitle: 'Job costs' }), 'Job costs');
  assert.equal(summaryTitleOf({ summaryTitle: '   ' }), 'Calculations', 'blank falls back');
});

test('a calculation is named after its field until somebody says otherwise', () => {
  assert.equal(calcName({ label: 'Allowance' }, {}), 'Allowance');
  assert.equal(calcName({ label: 'Allowance' }, { label: 'Total paid' }), 'Total paid');
  assert.equal(calcName({ label: 'Allowance' }, { label: '  ' }), 'Allowance', 'blank falls back');
});

// ---- the older one-line shape ------------------------------------------------------------------

test('an app set up before lines existed keeps its totals', () => {
  // `summary` was a single unnamed line. It is read as exactly that rather than discarded.
  const legacy = { fields: FIELDS, summary: { amt: { fn: 'sum' } } };
  const lines = summaryLines(legacy);
  assert.equal(lines.length, 1);
  assert.deepEqual(lines[0].calc, { amt: { fn: 'sum' } });
  assert.match(bar.summaryBar('co', {}, legacy, ROWS, ALL, false), />4000</);
});

test('an empty line is one nobody has asked anything of', () => {
  assert.equal(lineIsEmpty({ calc: {} }), true);
  assert.equal(lineIsEmpty({ calc: { amt: { fn: 'none' } } }), true);
  assert.equal(lineIsEmpty({ calc: { amt: { fn: 'sum' } } }), false);
  assert.equal(summaryLinesForEdit({}).length, 1, 'and there is always one to start in');
});

// ---- printing ----------------------------------------------------------------------------------

test('the totals print as a table of their own, aligned but not merged', () => {
  // Both halves matter. Merged into the data it aligned but read as more data; separate and
  // left alone it read as separate but drifted, because each table sizes columns to its own
  // contents. The same colgroup on both is what buys separation without drift.
  const app = appWith(line({ amt: { fn: 'sum' }, who: { fn: 'countIf', value: 'Roman' } }, { label: 'Totals' }));
  const html = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL);
  assert.match(html, /^<table class="wb-print-table wb-sum-print-table">/, 'its own table');
  assert.doesNotMatch(html, /colspan|rowspan/, 'and not one merged cell in it');
  assert.match(html, /<colgroup>/, 'the shared widths are what keep it aligned');
  assert.match(html, /<th scope="row">Totals<\/th>/);
});

test('a printed row has one cell per column, blank where nothing was asked', () => {
  const app = appWith(line({ amt: { fn: 'sum' } }));
  const html = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL);
  const row = /<tr class="wb-sum-print-row[^"]*">([\s\S]*?)<\/tr>/.exec(html)[1];
  const cells = row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/g);
  assert.equal(cells.length, FIELDS.length + 1, 'the row label plus every column');
  assert.match(cells[1], />4000</, 'the answer under its own column');
  assert.equal(cells[2].replace(/<[^>]+>/g, ''), '', 'and the rest are blank');
});

test('a line nobody named prints with a blank name, not an invented one', () => {
  // "Line 2" is a position, not a name. Printing it puts a word in the reader's hands that
  // nobody chose and that says nothing about what the row totals.
  const app = appWith(line({ amt: { fn: 'sum' } }, { id: 'l1' }), line({ amt: { fn: 'average' } }, { id: 'l2' }));
  const html = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL);
  assert.doesNotMatch(html, /Line 1|Line 2/);
  assert.match(html, /<th scope="row"><\/th>/, 'the cell is there, it is just empty');
  assert.match(html, />4000</, 'and the totals are unaffected');
});

test('an unnamed line is blank on screen too, and named only where it was named', () => {
  const app = appWith(line({ amt: { fn: 'sum' } }, { id: 'l1' }), line({ amt: { fn: 'average' } }, { id: 'l2', label: 'Averages' }));
  const html = bar.summaryBar('co', {}, app, ROWS, ALL, false);
  assert.doesNotMatch(html, /Line 1|Line 2/);
  assert.match(html, /Averages/);
});

test('the manager still sees which line is which, as a placeholder', () => {
  // Greyed-out hint text in the box is not a value: it names the position without printing it.
  const app = appWith(line({}, { id: 'l1' }), line({}, { id: 'l2' }));
  const html = bar.summaryBar('co', {}, app, ROWS, ALL, true);
  assert.match(html, /placeholder="Line 1"/);
  assert.match(html, /placeholder="Line 2"/);
});

test('each line prints as its own row', () => {
  const app = appWith(
    line({ amt: { fn: 'sum' } }, { id: 'l1', label: 'Totals' }),
    line({ amt: { fn: 'average' } }, { id: 'l2', label: 'Averages' }),
  );
  const html = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL);
  assert.equal((html.match(/wb-sum-print-row/g) || []).length, 2);
  assert.match(html, /Totals/);
  assert.match(html, /Averages/);
});

test('what each number is prints under it', () => {
  const app = appWith(line({ who: { fn: 'countIf', value: 'Roman' } }));
  const html = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL);
  assert.match(html, /Count if Roman/, 'a bare 1 under Name would mean nothing');
});

test('a renamed calculation prints under its own name', () => {
  const app = appWith(line({ amt: { fn: 'sum', label: 'Total paid' } }));
  const html = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL);
  assert.match(html, /Total paid/);
  assert.doesNotMatch(html, />Sum</);
});

test('hiding the labels removes the words and keeps the numbers', () => {
  const app = { ...appWith(line({ amt: { fn: 'sum' } }, { label: 'Totals' })), summaryHideLabel: true };
  const html = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL);
  assert.doesNotMatch(html, /Totals/);
  assert.doesNotMatch(html, /wb-sum-print-labels/);
  assert.doesNotMatch(html, /<thead>/, 'a column heading is a label');
  assert.match(html, />4000</);
});

test('nothing configured prints nothing', () => {
  assert.equal(bar.summaryPrintTable('co', {}, appWith(), FIELDS, ROWS, ALL), '');
  assert.equal(bar.summaryPrintTable('co', {}, appWith(line({ amt: { fn: 'none' } })), FIELDS, ROWS, ALL), '');
});

test('a selected print totals the selection', () => {
  const app = appWith(line({ amt: { fn: 'sum' } }));
  const html = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, { sel: new Set(['r1']) });
  assert.match(html, />3000</);
});

// ---- wiring ------------------------------------------------------------------------------------

test('the table renders below the list and above the footer', () => {
  assert.match(items, /<div id="wbItemsList">\$\{listBody\}<\/div>\s*\n\s*\$\{summary\}/);
});

test('the printed data table and the totals table are told the same widths', () => {
  // A shared colgroup is the whole mechanism. Without it on BOTH tables they drift apart, which
  // is why the totals could not simply be lifted out of the data table on their own.
  assert.ok(io.includes('<table class="wb-print-table">${printColgroup(cols.length)}'));
  assert.ok(io.includes('</tbody></table>${totals}'), 'the totals follow the data table, outside it');
  assert.ok(io.includes('table-layout:fixed'), 'fixed layout is what makes the widths bind');
  assert.ok(!io.includes('summaryPrintRows'), 'the tfoot builder is gone, not merely unused');
});

test('the lines survive a reload', () => {
  // normalizeWorkspaceBuilderDoc drops everything it does not name.
  assert.match(main, /Array\.isArray\(app\.summaryRows\) \? \{ summaryRows: app\.summaryRows \} : \{\}/);
  assert.match(main, /\{ summary: app\.summary \}/, 'and the older one-line shape is still read');
});

test('editing migrates the older shape once, rather than keeping both', () => {
  const block = main.slice(main.indexOf('const summaryLinesOf ='));
  assert.match(block.slice(0, 900), /delete target\.summary;/);
});

test('the last line cannot be removed', () => {
  // One empty line is where the next calculation gets made; a table with no rows offers nowhere
  // to start again.
  const block = main.slice(main.indexOf("bind('[data-wb-sum-drop]'"));
  assert.match(block.slice(0, 700), /if \(lines\.length <= 1\) return;/);
});

test('only a manager may change any of it', () => {
  const block = main.slice(main.indexOf('const summaryApp = ()'));
  assert.match(block.slice(0, 400), /if \(!can\('workspaces\.manage', companyId\)\) return null;/);
});

// ---- the column headings -----------------------------------------------------------------------

test('a column heading defaults to the field, and can be called something else here', () => {
  // The calculation table asks a different question from the list above it: a column the list
  // calls "Allowance" may be "Paid this month" once it is being totalled.
  assert.equal(summaryColName({}, FIELDS[0]), 'Allowance');
  assert.equal(summaryColName({ summaryCols: { amt: 'Paid this month' } }, FIELDS[0]), 'Paid this month');
  assert.equal(summaryColName({ summaryCols: { amt: '   ' } }, FIELDS[0]), 'Allowance', 'blank falls back');
});

test('renaming a heading changes the calculation table and nothing else', () => {
  const app = { ...appWith(line({ amt: { fn: 'sum' } })), summaryCols: { amt: 'Paid this month' } };
  assert.match(bar.summaryBar('co', {}, app, ROWS, ALL, false), /Paid this month/);
  assert.equal(app.fields[0].label, 'Allowance', 'the field itself is untouched');
});

test('a manager edits the heading in place; a reader just reads it', () => {
  const app = appWith(line({ amt: { fn: 'sum' } }));
  assert.match(bar.summaryBar('co', {}, app, ROWS, ALL, true), /data-wb-sum-col="amt"/);
  assert.doesNotMatch(bar.summaryBar('co', {}, app, ROWS, ALL, false), /data-wb-sum-col/);
});

test('the printed table says what it is and what its columns are', () => {
  // Merged into the data it could borrow both; standing on its own it cannot.
  const app = { ...appWith(line({ amt: { fn: 'sum' } })), summaryTitle: 'Job costs', summaryCols: { amt: 'Paid' } };
  const html = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL);
  assert.match(html, /<caption>Job costs<\/caption>/);
  assert.match(html, /<th>Paid<\/th>/);
});

test('the heading rename survives a reload', () => {
  assert.ok(main.includes('{ summaryCols: app.summaryCols }'), 'the normalizer drops what it does not name');
});

test('clearing a heading removes the override rather than storing the field name', () => {
  const block = main.slice(main.indexOf("bind('[data-wb-sum-col]'"));
  assert.match(block.slice(0, 800), /else delete target\.summaryCols\[el\.dataset\.wbSumCol\];/);
  assert.match(block.slice(0, 800), /if \(!Object\.keys\(target\.summaryCols\)\.length\) delete target\.summaryCols;/);
});

// ---- what keeps the two printed tables aligned --------------------------------------------------

test('the columns are given explicit shares that add up', () => {
  const group = printColgroup(3);
  const widths = [...group.matchAll(/width:([\d.]+)%/g)].map((m) => Number(m[1]));
  assert.equal(widths.length, 4, 'the row-label column plus every field');
  assert.equal(Math.round(widths.reduce((total, w) => total + w, 0)), 100);
  assert.equal(widths[1], widths[2], 'and the field columns share equally');
});

test('one field, and no fields, still produce a usable colgroup', () => {
  assert.match(printColgroup(1), /^<colgroup><col style="width:6%"><col style="width:94\.0000%"><\/colgroup>$/);
  assert.doesNotMatch(printColgroup(0), /NaN|Infinity/);
});

// ---- what the hide-labels tick does and does not reach -------------------------------------------

test('the table keeps its name when the labels are hidden', () => {
  // Hiding the name left a block of numbers under no heading at all, which is a puzzle rather
  // than a tidier table. A name identifies the table; it does not label anything in it.
  const app = { ...appWith(line({ amt: { fn: 'sum' } })), summaryTitle: 'Total', summaryHideLabel: true };
  const html = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL);
  assert.match(html, /<caption>Total<\/caption>/);
  assert.doesNotMatch(html, /wb-sum-print-labels/, 'the labels themselves still go');
});

test('the default name prints too, so the table is never unheaded', () => {
  const app = { ...appWith(line({ amt: { fn: 'sum' } })), summaryHideLabel: true };
  assert.match(bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL), /<caption>Calculations<\/caption>/);
});

test('a row gives up its bottom border only when a caption row closes it', () => {
  // The rule that joins a value to its caption was stripping the bottom edge off every row.
  // With the captions hidden there was nothing underneath to close the table, so the last line
  // had no border and the whole thing read as unfinished.
  const app = appWith(line({ amt: { fn: 'sum' } }));
  const shown = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL);
  assert.match(shown, /class="wb-sum-print-row wb-sum-paired"/);

  const hidden = bar.summaryPrintTable('co', {}, { ...app, summaryHideLabel: true }, FIELDS, ROWS, ALL);
  assert.doesNotMatch(hidden, /wb-sum-paired/, 'nothing to pair with, so it keeps its own edge');
});

test('the print stylesheet only strips the border from a paired row', () => {
  assert.ok(io.includes('.wb-sum-paired td, .wb-sum-paired th { border-bottom:none !important; }'));
  assert.ok(!io.includes('.wb-sum-print-row td, .wb-sum-print-row th { border-bottom:none'),
    'the unscoped rule is gone, not merely overridden');
  assert.ok(io.includes('.wb-sum-print-table caption'), 'and the name is styled for paper');
});
