import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyFunction, functionQueryAt, insertReference, matchFunctions, rangeReference, referenceSlotAt,
} from '../src/sheet/formula-assist.js';
import { SHEET_FUNCTIONS } from '../src/sheet/sheet-model.js';

// Writing a formula used to mean knowing things the editor could have shown you: a reference
// typed from memory after reading the row and column off the headers, and a function name
// copied by hand out of a strip of grey text along the bottom.

// ---- where a clicked cell may land ------------------------------------------------------------

test('a click only writes a reference into a formula', () => {
  // A plain value is not a formula, and hijacking a click there would break ordinary selection.
  assert.equal(referenceSlotAt('123', 3), null);
  assert.equal(referenceSlotAt('', 0), null);
  assert.ok(referenceSlotAt('=', 1));
});

test('a reference goes where a value is expected', () => {
  for (const text of ['=', '=SUM(', '=SUM(A1,', '=1+', '=1*', '=A1:', '=SUM(A1) + ']) {
    assert.ok(referenceSlotAt(text, text.length), `${text} should accept a reference`);
  }
});

test('a reference does not go in the middle of a name', () => {
  // `A1` after `SUM` is a typo, not a reference. Rewriting it would be worse than leaving it.
  assert.equal(referenceSlotAt('=SUM', 4), null);
  assert.equal(referenceSlotAt('=ROUND', 6), null);
});

test('clicking twice replaces, it does not concatenate', () => {
  // The Excel behaviour: click A1, change your mind, click B2, and you have =B2.
  const first = insertReference('=', 1, 'A1');
  assert.equal(first.text, '=A1');
  const second = insertReference(first.text, first.caret, 'B2');
  assert.equal(second.text, '=B2', 'the second click replaces the first reference');
  assert.equal(second.caret, 3);
});

test('a name that is also a valid reference is treated as one', () => {
  // `=LOG10` is genuinely ambiguous: LOG10 is a function elsewhere AND a real cell -- column
  // LOG, row 10. Excel reads it as the cell, and so does this. It costs nothing here because
  // no name in SHEET_FUNCTIONS ends in a digit, so the ambiguity never arises in practice.
  assert.deepEqual(referenceSlotAt('=LOG10', 6), { start: 1, end: 6 });
  assert.ok(
    SHEET_FUNCTIONS.every((name) => !/\d$/.test(name)),
    'if a function ending in a digit is ever added, this rule needs revisiting',
  );
});

test('inserting keeps whatever follows the caret', () => {
  const out = insertReference('=SUM(,B9)', 5, 'A1');
  assert.equal(out.text, '=SUM(A1,B9)');
  assert.equal(out.caret, 7);
});

test('a reference that is not one is refused', () => {
  const out = insertReference('=', 1, 'not-a-ref');
  assert.equal(out.changed, false);
  assert.equal(out.text, '=');
});

test('a dragged range is written the way a spreadsheet writes it', () => {
  assert.equal(rangeReference('A1', 'B4'), 'A1:B4');
  assert.equal(rangeReference('A1', 'A1'), 'A1', 'one cell is not a range');
  assert.equal(insertReference('=SUM(', 5, 'A1:B4').text, '=SUM(A1:B4');
});

// ---- suggesting a function --------------------------------------------------------------------

test('typing = then letters is a query', () => {
  assert.equal(functionQueryAt('=SU', 3), 'SU');
  assert.equal(functionQueryAt('=su', 3), 'su');
  assert.equal(functionQueryAt('=SUM(A1)+AV', 11), 'AV', 'after an operator too');
});

test('a reference is not a function query', () => {
  // Offering ABS while somebody types A1 is noise on top of the thing being typed.
  assert.equal(functionQueryAt('=SUM(A1', 7), '');
  assert.equal(functionQueryAt('=A1', 3), '');
  assert.equal(functionQueryAt('123', 3), '', 'and a plain value suggests nothing');
});

test('prefix matches come before merely containing ones', () => {
  const hits = matchFunctions('OU', SHEET_FUNCTIONS);
  assert.ok(hits.length, 'ROUND family should match');
  assert.ok(hits.every((name) => name.toUpperCase().includes('OU')));
  const round = matchFunctions('ROUND', SHEET_FUNCTIONS);
  assert.equal(round[0], 'ROUND', 'the exact prefix leads');
  assert.ok(round.includes('ROUNDUP') && round.includes('ROUNDDOWN'));
});

test('an empty query offers nothing', () => {
  assert.deepEqual(matchFunctions('', SHEET_FUNCTIONS), []);
});

test('accepting a suggestion opens the bracket and stops', () => {
  // The closing bracket is deliberately NOT typed: one the editor added is one the caret has to
  // be moved past, and every argument typed in between fights it.
  const out = applyFunction('=SU', 3, 'SUM');
  assert.equal(out.text, '=SUM(');
  assert.equal(out.caret, 5);
});

test('accepting keeps what was after the caret', () => {
  const out = applyFunction('=SU+1', 3, 'SUM');
  assert.equal(out.text, '=SUM(+1');
  assert.equal(out.caret, 5);
});

test('every suggested name is one the engine can actually evaluate', () => {
  // The strip along the bottom of the editor and the evaluator read the same list, so a name
  // offered here is never one that errors when it runs.
  for (const name of matchFunctions('S', SHEET_FUNCTIONS)) {
    assert.ok(SHEET_FUNCTIONS.includes(name));
  }
});
