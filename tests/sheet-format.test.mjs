import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BORDER_PRESETS,
  NUMBER_FORMATS,
  applyBorders,
  applyStyle,
  clearCells,
  colRange,
  colWidth,
  deleteCols,
  deleteRows,
  fillFrom,
  formatNumber,
  insertCols,
  insertRows,
  isCovered,
  mergeAt,
  normalizeMerges,
  normalizeSheetFull,
  normalizeStyle,
  offsetFormula,
  parseRange,
  rangeHas,
  rangeLabel,
  rangeOf,
  refsIn,
  rowHeight,
  rowRange,
  setSizes,
  shiftFormula,
  styleIsOn,
  toggleMerge,
} from '../src/sheet/sheet-format.js';
import { evaluateSheet } from '../src/sheet/sheet-model.js';

// "I can multi-select on the sheet, insert and delete rows and columns on the specific row or
// column, format width and height... it inherits the formula, colour, the cell line, text colour,
// cell colour."

const sheet = (extra = {}) => normalizeSheetFull({
  rows: 10,
  cols: 6,
  cells: { A1: 'Item', B1: '10', B2: '20', B3: '=SUM(B1:B2)', C3: '=B3*2' },
  ...extra,
});

// ---- selecting more than one cell ------------------------------------------------------------

test('a selection is a rectangle, however it was dragged', () => {
  // Dragging up and to the left has to give the same range as dragging down and to the right.
  assert.deepEqual(rangeOf('C4', 'A1'), { r1: 0, c1: 0, r2: 3, c2: 2 });
  assert.deepEqual(rangeOf('A1', 'C4'), rangeOf('C4', 'A1'));
  assert.equal(rangeLabel(rangeOf('A1', 'C4')), 'A1:C4');
  assert.equal(rangeLabel(rangeOf('B2', 'B2')), 'B2', 'one cell is named as one cell');
  assert.equal(rangeOf('nonsense', 'A1'), null);
});

test('a range lists its cells row by row, and knows what is in it', () => {
  assert.deepEqual(refsIn(parseRange('A1:B2')), ['A1', 'B1', 'A2', 'B2']);
  assert.equal(refsIn(parseRange('B2')).length, 1);
  assert.ok(rangeHas(parseRange('A1:C3'), 'B2'));
  assert.ok(!rangeHas(parseRange('A1:C3'), 'D2'));
});

test('a header click takes the whole row or column', () => {
  const subject = sheet();
  assert.equal(rangeLabel(rowRange(subject, 2)), 'A3:F3');
  assert.equal(rangeLabel(colRange(subject, 1)), 'B1:B10');
  assert.equal(rangeLabel(rowRange(subject, 1, 3)), 'A2:F4', 'dragging across headers');
});

// ---- what a cell is painted with -------------------------------------------------------------

test('only real formatting is stored, and nonsense is dropped rather than kept', () => {
  const style = normalizeStyle({
    b: true, i: 1, fg: '#FF0000', bg: 'red', ha: 'middle', va: 'middle', fs: 900, ff: 'Comic Sans', bd: 'txq',
  });
  assert.deepEqual(style, { b: 1, i: 1, fg: '#ff0000', va: 'middle', bd: 't' });
  assert.equal(normalizeStyle({}), null, 'a cell with no formatting is not stored at all');
  assert.equal(normalizeStyle({ bg: 'nope' }), null);
});

test('bold applies to every cell in the selection and toggles off again', () => {
  let subject = sheet();
  subject.styles = applyStyle(subject, parseRange('A1:B2'), { b: 1 });
  assert.ok(styleIsOn(subject, parseRange('A1:B2'), 'b'));
  assert.ok(!styleIsOn(subject, parseRange('A1:C1'), 'b'), 'C1 was never in the selection');
  subject.styles = applyStyle(subject, parseRange('A1:B2'), { b: null });
  assert.deepEqual(subject.styles, {}, 'unbolding leaves no empty shells behind');
});

test('colours, font and alignment all survive a round trip through the field', () => {
  let subject = sheet();
  subject.styles = applyStyle(subject, parseRange('A1'), {
    fg: '#ffffff', bg: '#e0552d', ff: 'Georgia', fs: 18, ha: 'center', va: 'middle', wrap: 1, nf: '0.00',
  });
  const stored = JSON.parse(JSON.stringify(subject));
  const back = normalizeSheetFull(stored);
  assert.deepEqual(back.styles.A1, {
    bg: '#e0552d', ff: 'Georgia', fg: '#ffffff', fs: 18, ha: 'center', nf: '0.00', va: 'middle', wrap: 1,
  });
});

test('outer borders box the selection; all borders draw the grid inside it', () => {
  assert.deepEqual(BORDER_PRESETS, ['all', 'outer', 'top', 'right', 'bottom', 'left', 'none']);
  let subject = sheet();
  subject.styles = applyBorders(subject, parseRange('A1:C3'), 'outer');
  assert.equal(subject.styles.B2, undefined, 'the middle of a boxed range has no lines');
  assert.equal(subject.styles.A1.bd, 'lt', 'the top-left corner has two');
  assert.equal(subject.styles.B1.bd, 't');
  assert.equal(subject.styles.C3.bd, 'br');

  subject.styles = applyBorders(subject, parseRange('A1:C3'), 'all');
  assert.equal(subject.styles.B2.bd, 'blrt', 'every cell is boxed');

  subject.styles = applyBorders(subject, parseRange('A1:C3'), 'none');
  assert.deepEqual(subject.styles, {}, 'and clearing them leaves nothing behind');
});

test('a single edge is an edge of the selection, not of every cell in it', () => {
  let subject = sheet();
  subject.styles = applyBorders(subject, parseRange('A1:A3'), 'bottom');
  assert.equal(subject.styles.A1, undefined);
  assert.equal(subject.styles.A3.bd, 'b', 'only the last row is underlined');
});

// ---- numbers ---------------------------------------------------------------------------------

test('a number format changes how a number reads, and leaves words alone', () => {
  assert.equal(formatNumber(1234.5, '#,##0.00'), '1,234.50');
  assert.equal(formatNumber(1234.5, '#,##0'), '1,235');
  assert.equal(formatNumber(0.125, '0%'), '13%');
  assert.equal(formatNumber(0.125, '0.00%'), '12.50%');
  assert.equal(formatNumber(-99.5, '$#,##0.00'), '-$99.50');
  assert.equal(formatNumber(42, 'general'), 42);
  // Formatting the word "Total" as currency must not produce $0.00.
  assert.equal(formatNumber('Total', '$#,##0.00'), 'Total');
  assert.equal(formatNumber('', '0.00'), '');
});

test('every offered format carries the Excel code it exports as', () => {
  NUMBER_FORMATS.forEach((format) => {
    assert.equal(typeof format.excel, 'string', `${format.code} has no Excel code`);
    assert.ok(format.label, `${format.code} has no label`);
  });
  assert.equal(NUMBER_FORMATS[0].code, 'general');
});

// ---- merging ---------------------------------------------------------------------------------

test('merging covers the cells it swallowed, and merging again undoes it', () => {
  let subject = sheet();
  subject.merges = toggleMerge(subject, parseRange('A1:C1'));
  assert.deepEqual(subject.merges, ['A1:C1']);
  assert.equal(rangeLabel(mergeAt(subject, 'B1')), 'A1:C1');
  assert.ok(isCovered(subject, 'B1'), 'B1 is not drawn');
  assert.ok(!isCovered(subject, 'A1'), 'the anchor still is');
  subject.merges = toggleMerge(subject, parseRange('A1:C1'));
  assert.deepEqual(subject.merges, []);
});

test('two merges cannot claim the same cell', () => {
  // There is no way to draw an overlap, so the first one keeps the cells.
  assert.deepEqual(normalizeMerges(['A1:C1', 'B1:D1'], 10, 6), ['A1:C1']);
  assert.deepEqual(normalizeMerges(['A1'], 10, 6), [], 'one cell is not a merge');
  assert.deepEqual(normalizeMerges(['A1:Z99'], 10, 6), [], 'and a merge cannot leave the sheet');
});

// ---- inserting and deleting ------------------------------------------------------------------

test('a formula follows the cells it points at when a row is inserted above them', () => {
  // The whole reason insert is worth having. Without this the sheet is quietly wrong, which is
  // worse than visibly broken.
  assert.equal(shiftFormula('=SUM(A1:A9)', { row: 0, rowBy: 1 }), '=SUM(A2:A10)');
  assert.equal(shiftFormula('=B3*2', { row: 5, rowBy: 1 }), '=B3*2', 'below the insert, nothing moves');
  assert.equal(shiftFormula('=SUM(A1:A9)', { col: 0, colBy: 2 }), '=SUM(C1:C9)');
  assert.equal(shiftFormula('10', { row: 0, rowBy: 1 }), '10', 'a value is not a formula');
});

test('the rewriter does not mistake a name or a string for a reference', () => {
  assert.equal(shiftFormula('="A1"', { row: 0, rowBy: 1 }), '="A1"', 'quoted text is text');
  assert.equal(shiftFormula('=SUM(B1:B2)', { row: 0, rowBy: 1 }), '=SUM(B2:B3)');
  // A letter run followed by "(" is a function, not a reference to a column called LOG.
  assert.equal(shiftFormula('=MAX(A1,A2)', { row: 0, rowBy: 1 }), '=MAX(A2,A3)');
});

test('a reference to a deleted row says so rather than pointing somewhere else', () => {
  // Still a formula, and now one that visibly refuses to compute rather than silently adding
  // up whatever moved into that cell.
  assert.equal(shiftFormula('=A1+1', { row: 0, rowBy: -1 }), '=#REF!+1');
  assert.equal(shiftFormula('=A2+1', { row: 0, rowBy: -1 }), '=A1+1', 'what survived still points right');
  assert.ok(evaluateSheet(normalizeSheetFull({ rows: 2, cols: 2, cells: { A1: '=#REF!+1' } })).errors.A1);
});

test('inserting a row moves the cells, the formatting, the merges and the heights with it', () => {
  let subject = sheet({ merges: ['A1:C1'], rowH: { 1: 40 }, colW: { 2: 200 } });
  subject.styles = applyStyle(subject, parseRange('B2'), { bg: '#ffff00' });
  const after = insertRows(subject, 0, 1);

  assert.equal(after.rows, 11);
  assert.equal(after.cells.A2, 'Item', 'the content moved down one');
  assert.equal(after.cells.B4, '=SUM(B2:B3)', 'and its formula came with it');
  assert.equal(after.cells.C4, '=B4*2', 'including a formula pointing at another formula');
  assert.equal(after.styles.B3?.bg, '#ffff00', 'the fill moved with its cell');
  assert.deepEqual(after.merges, ['A2:C2']);
  assert.equal(rowHeight(after, 2), 40, 'the tall row is still the tall row');
  assert.equal(colWidth(after, 2), 200, 'and the columns were not touched');
});

test('deleting a row takes its cells away and closes the gap', () => {
  const after = deleteRows(sheet(), 0, 1);
  assert.equal(after.rows, 9);
  assert.equal(after.cells.A1, undefined, 'the deleted row is gone');
  assert.equal(after.cells.B1, '20', 'what was below moved up');
  assert.equal(after.cells.B2, '=SUM(#REF!:B1)', 'and a formula that lost a corner says so');
});

test('the sheet still computes after a row is inserted', () => {
  // The references being right on paper is not the same as the sheet still adding up.
  const after = insertRows(sheet(), 0, 1);
  const { values } = evaluateSheet(after);
  assert.equal(values.B4, 30, '=SUM(B2:B3) over 10 and 20');
  assert.equal(values.C4, 60);
});

test('inserting a column moves widths, not heights', () => {
  const subject = sheet({ colW: { 1: 200 }, rowH: { 3: 44 } });
  const after = insertCols(subject, 0, 1);
  assert.equal(after.cols, 7);
  assert.equal(after.cells.B1, 'Item');
  assert.equal(after.cells.C3, '=SUM(C1:C2)');
  assert.equal(colWidth(after, 2), 200);
  assert.equal(rowHeight(after, 3), 44);
});

test('deleting a column closes the gap and drops what was on it', () => {
  const after = deleteCols(sheet(), 0, 1);
  assert.equal(after.cols, 5);
  assert.equal(after.cells.A1, '10', 'column B is now column A');
  assert.equal(after.cells.A3, '=SUM(A1:A2)');
});

test('a sheet cannot be shrunk out of existence or grown past its cap', () => {
  const one = deleteRows(normalizeSheetFull({ rows: 1, cols: 1 }), 0, 5);
  assert.ok(one.rows >= 1, 'a sheet always has a row');
  const big = insertRows(normalizeSheetFull({ rows: 200, cols: 4 }), 0, 10);
  assert.equal(big.rows, 200, 'and never more than the cap');
});

// ---- sizes and clearing ----------------------------------------------------------------------

test('a column keeps the width it was dragged to, within reason', () => {
  const subject = sheet();
  assert.equal(colWidth(subject, 0), 104, 'the default when nothing was set');
  const wide = setSizes(subject.colW, [0, 1], 220);
  assert.equal(wide[0], 220);
  assert.equal(setSizes({}, [0], 5)[0], 18, 'too narrow to click is clamped');
  assert.equal(setSizes({}, [0], 9999)[0], 640);
  assert.deepEqual(setSizes({ 0: 220 }, [0], null), {}, 'and it can be put back');
});

test('Delete empties the cells and leaves the formatting alone', () => {
  let subject = sheet();
  subject.styles = applyStyle(subject, parseRange('B1:B2'), { bg: '#ffff00' });
  const cells = clearCells(subject, parseRange('B1:B2'));
  assert.equal(cells.B1, undefined);
  assert.equal(cells.B3, '=SUM(B1:B2)', 'the formula is still there, now adding nothing');
  assert.equal(subject.styles.B1.bg, '#ffff00');
});

// ---- dragging the corner ---------------------------------------------------------------------

test('one number repeats, two carry their step', () => {
  // Excel's rule, and the one people are surprised by if you get it wrong: a single 5 dragged
  // down is five 5s, not 5, 6, 7.
  const one = fillFrom(sheet({ cells: { A1: '5' } }), parseRange('A1'), parseRange('A1:A4'));
  assert.deepEqual(['A2', 'A3', 'A4'].map((r) => one.cells[r]), ['5', '5', '5']);
  const two = fillFrom(sheet({ cells: { A1: '1', A2: '3' } }), parseRange('A1:A2'), parseRange('A1:A6'));
  assert.deepEqual(['A3', 'A4', 'A5', 'A6'].map((r) => two.cells[r]), ['5', '7', '9', '11']);
});

test('a label ending in a number counts up', () => {
  const out = fillFrom(sheet({ cells: { A1: 'Item 1' } }), parseRange('A1'), parseRange('A1:A4'));
  assert.deepEqual(['A2', 'A3', 'A4'].map((r) => out.cells[r]), ['Item 2', 'Item 3', 'Item 4']);
});

test('a formula moves its references with it', () => {
  const out = fillFrom(sheet({ cells: { A1: '2', B1: '3', C1: '=A1*B1' } }), parseRange('C1'), parseRange('C1:C3'));
  assert.equal(out.cells.C2, '=A2*B2');
  assert.equal(out.cells.C3, '=A3*B3');
});

test('anything else repeats in order', () => {
  const out = fillFrom(sheet({ cells: { A1: 'Mon', B1: 'Tue' } }), parseRange('A1:B1'), parseRange('A1:F1'));
  assert.deepEqual(['C1', 'D1', 'E1', 'F1'].map((r) => out.cells[r]), ['Mon', 'Tue', 'Mon', 'Tue']);
});

test('dragging up continues away from the seed, not back towards it', () => {
  const out = fillFrom(sheet({ cells: { A5: '10', A6: '20' } }), parseRange('A5:A6'), parseRange('A3:A6'));
  assert.deepEqual(['A4', 'A3'].map((r) => out.cells[r]), ['0', '-10']);
});

test('the formatting comes along, because a filled row that loses its borders looks broken', () => {
  let subject = sheet({ cells: { A1: '1' } });
  subject.styles = applyStyle(subject, parseRange('A1'), { bg: '#ffff00', b: 1 });
  const out = fillFrom(subject, parseRange('A1'), parseRange('A1:A3'));
  assert.equal(out.styles.A2.bg, '#ffff00');
  assert.equal(out.styles.A3.b, 1);
});

test('a fill that goes nowhere changes nothing', () => {
  const before = sheet({ cells: { A1: '1' } });
  const out = fillFrom(before, parseRange('A1'), parseRange('A1'));
  assert.deepEqual(out.cells, before.cells);
});

test('offsetFormula moves every reference, unlike the insert-time one', () => {
  // shiftFormula moves what sits past a point; this moves all of it, which is what copying a
  // formula into another cell means.
  assert.equal(offsetFormula('=SUM(A1:A3)+B1', 2, 1), '=SUM(B3:B5)+C3');
  assert.equal(offsetFormula('="A1"', 1, 0), '="A1"', 'quoted text is text');
  assert.equal(offsetFormula('12', 1, 0), '12');
  assert.equal(offsetFormula('=A1', -5, 0), '=#REF!', 'off the top of the sheet');
});

test('formatting survives being stored but a cell outside the sheet does not', () => {
  const back = normalizeSheetFull({
    rows: 3, cols: 3, styles: { A1: { b: 1 }, Z99: { b: 1 } }, colW: { 0: 150, 9: 150 }, rowH: { 0: 40 },
  });
  assert.deepEqual(Object.keys(back.styles), ['A1']);
  assert.deepEqual(back.colW, { 0: 150 });
  assert.deepEqual(back.rowH, { 0: 40 });
});
