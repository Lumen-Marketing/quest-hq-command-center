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

// The card is shut until asked for, so every test about what is INSIDE it opens it first.
// Collapsing is covered on its own below.
const ALL = { sel: new Set(), sumShown: true };

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
  const html = bar.summaryBar('co', {}, app, ROWS, { sel: new Set(['r1']), sumShown: true }, false);
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
  assert.match(bar.summaryBar('co', {}, empty, ROWS, ALL, true), /data-wb-sum-open/, 'a line to choose in');
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

// ---- words in a cell instead of an answer ------------------------------------------------------

test('a custom-text cell takes typed words and does not ask for a name as well', () => {
  const app = appWith(line({ who: { fn: 'text', value: 'TOTAL DUE' } }));
  const html = bar.summaryBar('co', {}, app, ROWS, ALL, true);
  assert.match(html, /placeholder="Text to show"/, 'a box to type the words in');
  assert.match(html, />TOTAL DUE</, 'and the words are what the cell shows');
  // The name box names the caption under a number. Typed words ARE the cell, so naming them
  // would be asking for the same thing twice.
  assert.doesNotMatch(html, /wb-sum-field-edit/);
  assert.match(html, /wb-sum-value-text/, 'and they are not set as a figure');
});

test('custom text is typed even in a column that has its own options', () => {
  // "Count if" is asked in the column's own words, so a category offers its options. The words a
  // label wants -- TOTAL DUE -- are nothing the column has ever contained.
  const counting = bar.summaryBar('co', {}, appWith(line({ sex: { fn: 'countIf' } })), ROWS, ALL, true);
  assert.match(counting, /<option value="Male"/, 'count if offers the options');
  const labelling = bar.summaryBar('co', {}, appWith(line({ sex: { fn: 'text' } })), ROWS, ALL, true);
  assert.doesNotMatch(labelling, /<option value="Male"/);
  assert.match(labelling, /placeholder="Text to show"/);
});

test('custom text that was never typed shows nothing, not a dash', () => {
  // A dash means the rows had no answer to give. Words nobody typed were never asked of them.
  const html = bar.summaryBar('co', {}, appWith(line({ who: { fn: 'text', value: '' } })), ROWS, ALL, false);
  assert.doesNotMatch(html, /—/);
});

test('a line that only says words still counts as a line worth printing', () => {
  assert.equal(lineIsEmpty({ calc: { who: { fn: 'text', value: 'TOTAL' } } }), false);
  const app = appWith(line({ who: { fn: 'text', value: 'TOTAL DUE' }, amt: { fn: 'sum' } }));
  const html = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL);
  assert.match(html, /<td class="wb-sum-print-text">TOTAL DUE<\/td>/, 'words read from the left');
  assert.match(html, /<td class="wb-sum-print-num">4000<\/td>/, 'figures still to the right');
});

test('typed words are escaped wherever they are shown', () => {
  // They are the one thing in this table a person types that ends up rendered as-is.
  const real = createSummaryBar({
    h: (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
    wbPlainVal: plain,
  });
  const app = appWith(line({ who: { fn: 'text', value: '<img src=x onerror=alert(1)>' } }));
  for (const html of [
    real.summaryBar('co', {}, app, ROWS, ALL, false),
    real.summaryBar('co', {}, app, ROWS, ALL, true),
    real.summaryPrintTable('co', {}, app, FIELDS, ROWS, ALL),
  ]) assert.doesNotMatch(html, /<img/);
});

test('changing the choice clears the word typed for the old one', () => {
  // Two choices take a word now, so "Male" typed for a count-if must not survive into a label.
  const block = main.slice(main.indexOf("bind('[data-wb-sum-fn]'"));
  assert.match(block.slice(0, 600), /entry\.value = '';/);
  assert.doesNotMatch(block.slice(0, 600), /!== 'countIf'/);
});

// ---- an unasked column keeps quiet ------------------------------------------------------------

test('a column asked nothing is a way in, and nothing else', () => {
  // Fifteen columns meant fifteen dropdowns, which read as fifteen unanswered questions. The
  // picker is not hidden in the cell, it is not in the cell: it belongs to the editor now.
  const html = bar.summaryBar('co', {}, appWith(line({ amt: { fn: 'sum' } })), ROWS, ALL, true);
  const cells = html.split('<td class="wb-sum-cell');

  const asked = cells.find((cell) => cell.startsWith(' on"'));
  assert.ok(asked, 'the summed column is marked as answered');
  assert.doesNotMatch(asked, /wb-sum-open/, 'an answered cell needs no way in -- it kept its controls');
  assert.match(asked, /data-wb-sum-fn/);

  const unasked = cells.filter((cell) => cell.startsWith('">'));
  assert.equal(unasked.length, 2, 'the other two columns were asked nothing');
  for (const cell of unasked) {
    assert.doesNotMatch(cell, /<select/, 'no picker to squeeze into the column');
    // Reachable without a mouse, and it says what it opens rather than "button".
    assert.match(cell, /aria-label="Add a calculation for /);
    assert.match(cell, /data-wb-sum-open="line-1::/, 'and it names the cell it opens');
  }
});

test('a reader gets neither the picker nor the way in', () => {
  const html = bar.summaryBar('co', {}, appWith(line({ amt: { fn: 'sum' } })), ROWS, ALL, false);
  assert.doesNotMatch(html, /wb-sum-open/);
  assert.doesNotMatch(html, /wb-sum-fn/);
});

test('opening an editor is view state, not a class on a node', () => {
  // Choosing a function saves and re-renders. A DOM toggle would be wiped by the very action the
  // editor exists to carry out, closing itself before the value or the name could be typed.
  const block = main.slice(main.indexOf('const openSummaryEditor'));
  const handler = block.slice(0, block.indexOf("bind('[data-wb-sum-val]"));
  assert.match(handler, /ui\.sumOpen = key;/);
  assert.match(handler, /render\(\);/);
  assert.match(handler, /\.wb-sum-editor \.wb-sum-fn'\)\?\.focus\(\)/, 'the cursor starts in it');
  assert.match(handler, /data-wb-sum-close\]', \(\) => openSummaryEditor\(''\)/, 'and Done closes it');
  // Not carried across a refresh: it is a question being asked, not an answer given.
  assert.doesNotMatch(main.slice(main.indexOf('function wbRememberItemsUI'), main.indexOf('function wbRememberItemsUI') + 400), /sumOpen/);
});

// ---- the editor that spans the card ------------------------------------------------------------

const openAt = (key) => ({ sel: new Set(), sumShown: true, sumOpen: key });

test('the open cell hands its controls to a row spanning every column', () => {
  const html = bar.summaryBar('co', {}, appWith(line({})), ROWS, openAt('line-1::who'), true);
  // One cell per field plus the line-name head: the editor has to reach across all of them.
  assert.match(html, /<td class="wb-sum-editor" colspan="4">/);
  assert.match(html, /wb-sum-editor-for">Name</, 'and it says which column it is for');
  assert.match(html, /data-wb-sum-fn="who"/, 'the picker moved into it');
  assert.match(html, /data-wb-sum-close/, 'with a way out');
  // Not in both places at once: two ways to change one thing, side by side.
  assert.equal((html.match(/data-wb-sum-fn="who"/g) || []).length, 1);
  assert.match(html, /<td class="wb-sum-cell wb-sum-cell-editing">/, 'and the cell itself went quiet');
});

test('the editor keeps up as the calculation is filled in', () => {
  // The point of surviving the re-render: pick Custom text and the box to type it in is there,
  // on the same line, rather than back in the 132px column.
  const app = appWith(line({ who: { fn: 'text', value: 'TOTAL DUE' } }));
  const html = bar.summaryBar('co', {}, app, ROWS, openAt('line-1::who'), true);
  const editor = html.slice(html.indexOf('wb-sum-editor"'));
  assert.match(editor, /placeholder="Text to show"/);
  assert.match(editor, /value="TOTAL DUE"/);
  assert.doesNotMatch(editor, /wb-sum-field-edit/, 'and typed words still ask for no name');
});

test('one editor at a time, and never on a cell that is not there', () => {
  const app = appWith(line({}), line({}, { id: 'line-2' }));
  const html = bar.summaryBar('co', {}, app, ROWS, openAt('line-2::amt'), true);
  assert.equal((html.match(/wb-sum-editor"/g) || []).length, 1, 'only the line that was opened');
  assert.match(html, /wb-sum-editor-for">Allowance</);
  // A key naming a field that has since been deleted opens nothing rather than throwing.
  const stale = bar.summaryBar('co', {}, app, ROWS, openAt('line-1::gone'), true);
  assert.doesNotMatch(stale, /wb-sum-editor"/);
});

test('a reader never gets an editor, whatever the view state says', () => {
  const app = appWith(line({ amt: { fn: 'sum' } }));
  const html = bar.summaryBar('co', {}, app, ROWS, openAt('line-1::amt'), false);
  assert.doesNotMatch(html, /wb-sum-editor/);
  assert.match(html, />4000</, 'just the answer');
});

// ---- shut until asked for ----------------------------------------------------------------------

test('the card is shut on arrival, and says what is behind it', () => {
  const app = appWith(line({ amt: { fn: 'sum' } }));
  const html = bar.summaryBar('co', {}, app, ROWS, { sel: new Set() }, true);
  assert.match(html, /wb-sum-shut/);
  assert.match(html, /aria-expanded="false"/);
  // A collapsed card with no name is a mystery drawer, and the count is the reason to open it.
  assert.match(html, /Calculations/, 'the heading stays');
  assert.match(html, /2 records/);
  // Nothing of the table itself, for a manager or a reader.
  assert.doesNotMatch(html, /wb-sum-table/);
  assert.doesNotMatch(html, /data-wb-sum-add/);
  assert.doesNotMatch(html, />4000</);
  assert.doesNotMatch(bar.summaryBar('co', {}, app, ROWS, { sel: new Set() }, false), /wb-sum-table/);
});

test('opening it gives the table back, with a way to shut it again', () => {
  const app = appWith(line({ amt: { fn: 'sum' } }));
  const html = bar.summaryBar('co', {}, app, ROWS, ALL, true);
  assert.doesNotMatch(html, /wb-sum-shut/);
  assert.match(html, /wb-sum-table/);
  assert.match(html, />4000</);
  assert.match(html, /data-wb-sum-toggle[^>]*aria-expanded="true"/);
  // The name is still editable once open; collapsed it was only a label.
  assert.match(html, /data-wb-sum-title/);
});

test('a shut card still prints, because printing is not looking at the screen', () => {
  // The tick that hides labels is a print decision. Collapsing is a screen one, and a total left
  // off a printout because a card was folded away would be a number that quietly went missing.
  const app = appWith(line({ amt: { fn: 'sum' } }));
  const printed = bar.summaryPrintTable('co', {}, app, FIELDS, ROWS, { sel: new Set() });
  assert.match(printed, /4000/);
});

test('shutting the card puts away the cell editor with it', () => {
  const block = main.slice(main.indexOf("bind('[data-wb-sum-toggle]'"));
  const handler = block.slice(0, block.indexOf("bind('", 1));
  assert.match(handler, /ui\.sumShown = !ui\.sumShown;/);
  assert.match(handler, /if \(!ui\.sumShown\) ui\.sumOpen = '';/);
});

test('being open is not remembered across a refresh', () => {
  // A card that remembers being open is a card that quietly stops being hidden.
  const remember = main.slice(main.indexOf('function wbRememberItemsUI'));
  assert.doesNotMatch(remember.slice(0, 400), /sumShown/);
  assert.match(main, /sumShown: false,/, 'and it starts shut');
});
