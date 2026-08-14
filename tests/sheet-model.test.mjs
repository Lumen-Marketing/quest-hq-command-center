import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  MAX_COLS,
  MAX_ROWS,
  SHEET_FUNCTIONS,
  cellRef,
  columnIndex,
  columnName,
  evaluateSheet,
  normalizeSheet,
  parseRef,
  sheetFromRows,
} from '../src/sheet/sheet-model.js';

// "A field where it opens a spreadsheet where you can use basic functions, add formulas, or
// upload a spreadsheet and adapt its data."
//
// The engine underneath it. Same tokenizer and recursive-descent parser as the takeoff
// calculator, grown up: A1 references, ranges, text, comparisons and a function set.

const run = (cells, size = {}) => evaluateSheet({ rows: 30, cols: 10, cells, ...size });
const at = (cells, ref) => run(cells).values[ref];

// ---- the grid itself ---------------------------------------------------------------------

test('columns count in base 26 with no zero', () => {
  assert.equal(columnName(0), 'A');
  assert.equal(columnName(25), 'Z');
  assert.equal(columnName(26), 'AA');
  assert.equal(columnName(27), 'AB');
  assert.equal(columnIndex('A'), 0);
  assert.equal(columnIndex('AB'), 27);
  assert.equal(cellRef(11, 27), 'AB12');
});

test('a reference is only a reference when it really is one', () => {
  assert.deepEqual(parseRef('B12'), { row: 11, col: 1 });
  assert.deepEqual(parseRef(' ab12 '), { row: 11, col: 27 });
  [null, '', '12', 'A', 'A0', 'A-1', '1A', 'constructor'].forEach((bad) => {
    assert.equal(parseRef(bad), null, JSON.stringify(bad));
  });
});

test('a sheet is trimmed to what a field can reasonably hold', () => {
  const big = normalizeSheet({ rows: 9999, cols: 9999, cells: { A1: 'keep', ZZ9999: 'drop' } });
  assert.equal(big.rows, MAX_ROWS);
  assert.equal(big.cols, MAX_COLS);
  assert.equal(big.cells.A1, 'keep');
  assert.equal(big.cells.ZZ9999, undefined, 'a cell outside the grid is not stored');
  // Empty cells are not stored at all: a 200x40 grid is 8,000 cells and a filled one is a few.
  assert.deepEqual(normalizeSheet({ cells: { A1: '', B2: null } }).cells, {});
});

// ---- what a cell holds -------------------------------------------------------------------

test('a number is a number and everything else is text', () => {
  assert.equal(at({ A1: '65' }, 'A1'), 65);
  assert.equal(at({ A1: '  12.5 ' }, 'A1'), 12.5);
  assert.equal(at({ A1: 'Total SQ' }, 'A1'), 'Total SQ');
  // `values` is sparse on purpose: a 200x40 grid is 8,000 cells and a filled-in one is a few
  // dozen. A cell that was never typed into, and one that was cleared, are the same thing --
  // absent -- and absent means empty.
  assert.equal(at({ A1: '' }, 'A1'), undefined, 'an emptied cell is not stored');
  assert.equal(at({}, 'C7'), undefined);
  assert.equal(at({ A1: '1' }, 'C7') ?? '', '');
});

test('a formula reads the cells it names, through other formulas', () => {
  const cells = { A1: '65', B1: '=A1*1.1', C1: '=B1/10' };
  assert.equal(at(cells, 'B1'), 71.5);
  assert.equal(at(cells, 'C1'), 7.15);
});

// ---- the functions -----------------------------------------------------------------------

test('a range adds up, averages, counts and picks', () => {
  const cells = { A1: '10', A2: '20', A3: '30', A4: 'text' };
  assert.equal(at({ ...cells, B1: '=SUM(A1:A3)' }, 'B1'), 60);
  assert.equal(at({ ...cells, B1: '=AVERAGE(A1:A3)' }, 'B1'), 20);
  assert.equal(at({ ...cells, B1: '=MIN(A1:A3)' }, 'B1'), 10);
  assert.equal(at({ ...cells, B1: '=MAX(A1:A3)' }, 'B1'), 30);
  assert.equal(at({ ...cells, B1: '=COUNT(A1:A4)' }, 'B1'), 3, 'text is not counted');
  assert.equal(at({ ...cells, B1: '=COUNTA(A1:A4)' }, 'B1'), 4, 'but it is present');
});

test('a range can run across as well as down', () => {
  assert.equal(at({ A1: '1', B1: '2', C1: '3', A2: '=SUM(A1:C1)' }, 'A2'), 6);
  assert.equal(at({ A1: '1', B1: '2', A2: '3', B2: '4', D1: '=SUM(A1:B2)' }, 'D1'), 10);
});

test('rounding lands where a person would put it', () => {
  assert.equal(at({ A1: '=ROUNDUP(7.15)' }, 'A1'), 8);
  assert.equal(at({ A1: '=ROUND(2.5)' }, 'A1'), 3);
  assert.equal(at({ A1: '=ROUNDDOWN(2.9)' }, 'A1'), 2);
  assert.equal(at({ A1: '=ROUND(1.2345, 2)' }, 'A1'), 1.23);
  // 528/8 is exactly 66, and 65.99999999999999 in binary. The takeoff calculator was bitten
  // by this; the same guard is here.
  assert.equal(at({ A1: '=ROUNDUP(528/8)' }, 'A1'), 66);
});

test('a percentage is a rate, the way it is typed', () => {
  assert.equal(at({ A1: '=100*8.5%' }, 'A1'), 8.5);
  assert.equal(at({ A1: '9202', B1: '=A1*(1+8.5%)' }, 'B1'), 9984.17);
});

test('IF, and the comparisons it runs on', () => {
  assert.equal(at({ A1: '10', B1: '=IF(A1>5,"over","under")' }, 'B1'), 'over');
  assert.equal(at({ A1: '2', B1: '=IF(A1>5,"over","under")' }, 'B1'), 'under');
  assert.equal(at({ A1: '=IF(1=1,"y","n")' }, 'A1'), 'y');
  assert.equal(at({ A1: '=IF("a"<>"b","y","n")' }, 'A1'), 'y');
  assert.equal(at({ A1: '=AND(1>0, 2>1)' }, 'A1'), true);
  assert.equal(at({ A1: '=OR(1>2, 2>1)' }, 'A1'), true);
  assert.equal(at({ A1: '=NOT(1>2)' }, 'A1'), true);
});

test('text joins and is reshaped', () => {
  assert.equal(at({ A1: 'roof', B1: '=UPPER(A1)' }, 'B1'), 'ROOF');
  assert.equal(at({ A1: 'Roof', B1: '=A1&" job"' }, 'B1'), 'Roof job');
  assert.equal(at({ A1: '=CONCAT("a","b","c")' }, 'A1'), 'abc');
  assert.equal(at({ A1: '=LEN("abcd")' }, 'A1'), 4);
  assert.equal(at({ A1: '=TRIM("  x  ")' }, 'A1'), 'x');
});

test('every function offered is one the engine has', () => {
  SHEET_FUNCTIONS.forEach((name) => {
    const value = at({ A1: `=${name}(1)` }, 'A1');
    assert.notEqual(value, '#ERROR', `${name} is offered but does not work`);
  });
});

// ---- when a formula is wrong -------------------------------------------------------------

test('a loop is caught rather than left spinning', () => {
  const { values, errors } = run({ A1: '=B1', B1: '=A1' });
  assert.ok(Object.values(errors).some((message) => /refers back to itself/.test(message)));
  assert.equal(values.A1 === '#ERROR' || values.B1 === '#ERROR', true);
});

test('a name that is not a cell says so instead of reading as blank', () => {
  // This is the one that matters: reading an unknown name as empty is how "=constructor" or a
  // mistyped "=totl" quietly produces a number that looks perfectly fine.
  const { values, errors } = run({ A1: '=constructor' });
  assert.equal(values.A1, '#ERROR');
  assert.match(errors.A1, /is not a cell or a function/);
  assert.equal(run({ A1: '=totl' }).values.A1, '#ERROR');
});

test('a formula cannot reach outside the arithmetic it is allowed', () => {
  ['=window', '=this', '=[].map', '=1;alert(1)', '=process.exit(1)'].forEach((formula) => {
    assert.equal(at({ A1: formula }, 'A1'), '#ERROR', formula);
  });
});

test('the ordinary mistakes are named, not swallowed', () => {
  assert.match(run({ A1: '=1/0' }).errors.A1, /Division by zero/);
  assert.match(run({ A1: '=SUM(A2:A3' }).errors.A1, /bracket is never closed/);
  assert.match(run({ A1: '=1+' }).errors.A1, /ends too early/);
  assert.match(run({ A1: '="unclosed' }).errors.A1, /quote is never closed/);
  assert.match(run({ A1: '=NOPE(1)' }).errors.A1, /not a function/);
});

test('one broken cell does not take the sheet down with it', () => {
  const { values, errors } = run({ A1: '=1/0', A2: '10', A3: '=A2*2' });
  assert.equal(values.A1, '#ERROR');
  assert.equal(values.A3, 20, 'its neighbours still work out');
  assert.equal(Object.keys(errors).length, 1);
});

// ---- an uploaded file ---------------------------------------------------------------------

test('rows from a file become a sheet the right size', () => {
  const sheet = sheetFromRows([['Name', 'Qty', 'Price'], ['Tile', '8', '120'], ['Trim', '36', '5']]);
  assert.equal(sheet.rows, 3);
  assert.equal(sheet.cols, 3);
  assert.equal(sheet.cells.A1, 'Name');
  assert.equal(sheet.cells.C2, '120');
  assert.equal(sheet.cells.B3, '36');
});

test('an upload replaces what was there rather than merging into it', () => {
  const sheet = sheetFromRows([['new']], { cells: { Z9: 'old' }, title: 'Kept' });
  assert.equal(sheet.cells.Z9, undefined, 'an import is an import');
  assert.equal(sheet.title, 'Kept', 'but the sheet keeps its own settings');
});

test('a ragged or oversized file still lands somewhere sensible', () => {
  const sheet = sheetFromRows([['a'], ['b', 'c', 'd'], []]);
  assert.equal(sheet.cols, 3, 'the widest row sets the width');
  assert.equal(sheet.rows, 3);
  const huge = sheetFromRows(Array.from({ length: MAX_ROWS + 50 }, () => ['x']));
  assert.equal(huge.rows, MAX_ROWS);
});

test('uploaded values are values, and the formulas that made them are not invented', () => {
  // The functions the original file used may not exist here, and a formula that silently means
  // something else is worse than a number that is simply right as of the import.
  const sheet = sheetFromRows([['9984.17']]);
  assert.equal(sheet.cells.A1, '9984.17');
  assert.equal(evaluateSheet(sheet).values.A1, 9984.17);
});

// ---- the spreadsheet this all came from ---------------------------------------------------

test('the takeoff works as a sheet', () => {
  const { values, errors } = run({
    A1: 'Total SQ', B1: '65', C1: '=B1*1.1',
    A2: 'Eagle tile', B2: '=ROUNDUP(C1/10)', C2: '120', D2: '=B2*C2',
    A3: 'Underlayment', B3: '=B1', C3: '55', D3: '=B3*C3',
    A4: 'Material total', D4: '=SUM(D2:D3)',
    A5: 'With tax', D5: '=D4*(1+8.5%)',
  });
  assert.deepEqual(errors, {});
  assert.equal(values.C1, 71.5);
  assert.equal(values.B2, 8, 'ROUNDUP(7.15)');
  assert.equal(values.D2, 960);
  assert.equal(values.D3, 3575);
  assert.equal(values.D4, 4535);
  assert.equal(Math.round(values.D5 * 100) / 100, 4920.47);
});

// ---- the field and its grid ---------------------------------------------------------------

test('a preview shows the worked-out values, not the formulas', async () => {
  const { sheetPreview } = await import('../src/sheet/sheet-model.js');
  const view = sheetPreview({ rows: 5, cols: 3, cells: { A1: 'Item', B1: '8', C1: '=B1*10' } }, 2);
  assert.equal(view.filled, 3);
  assert.deepEqual(view.rows[0], ['Item', '8', '80']);
  assert.equal(sheetPreview({}).filled, 0, 'an empty sheet previews as empty');
});

test('a long decimal is not the arithmetic showing through', async () => {
  const { shownValue } = await import('../src/sheet/sheet-model.js');
  assert.equal(shownValue({ A1: 4920.470000000001 }, {}, 'A1'), '4920.47');
  assert.equal(shownValue({ A1: true }, {}, 'A1'), 'TRUE');
  assert.equal(shownValue({}, { A1: 'boom' }, 'A1'), '#ERROR');
});

test('one keypress moves one cell', async () => {
  // It moved two. The cell's own handler cleared `editing` and then the grid's handler saw the
  // same Enter -- by which point the guard no longer applied -- and stepped again. Caught in a
  // browser, where B2 + Enter landed on B4; the fix is to stop the event where it is handled.
  const editor = readFileSync(new URL('../src/sheet/sheet-editor.js', import.meta.url), 'utf8');
  assert.match(editor, /if \(\['Enter', 'Tab', 'Escape'\]\.includes\(event\.key\)\) \{ event\.preventDefault\(\); event\.stopPropagation\(\); \}/);
  assert.match(editor, /if \(\['Enter', 'Escape'\]\.includes\(event\.key\)\) \{ event\.preventDefault\(\); event\.stopPropagation\(\); \}/);
});

test('the sheet is written back only when the grid is closed', () => {
  // A spreadsheet somebody is halfway through is not a saved record, and the form underneath
  // still has its own Save.
  const editor = readFileSync(new URL('../src/sheet/sheet-editor.js', import.meta.url), 'utf8');
  assert.match(editor, /function close\(\) \{\s*\n\s*if \(!readOnly\) write\(normalizeSheetFull\(sheet\)\);/);
});

test('printing prints the sheet, not the page around it', () => {
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(styles, /@media print/, 'the app had no print rules at all before this');
  // Printing builds its own document and hides everything else. There must be exactly ONE rule
  // deciding what survives: the first version kept the old `:not(.sh-overlay)` rule alongside
  // the new `:not(.sh-print)` one, and between them they hid BOTH -- every page came out blank.
  assert.match(styles, /body\.sh-printing > \*:not\(\.sh-print\) \{ display: none !important; \}/);
  assert.ok(
    !/body\.sh-printing > \*:not\(\.sh-overlay\)/.test(styles),
    'two competing survivors cancel out and print a blank page',
  );
  assert.equal((styles.match(/body\.sh-printing > \*:not\(/g) || []).length, 1);
  // What does print is the built document: the used range, its formatting, and a heading.
  assert.match(styles, /body\.sh-printing \.sh-print \{ display: block/);
  assert.match(styles, /\.sh-print-grid tr \{ break-inside: avoid; \}/);
});
