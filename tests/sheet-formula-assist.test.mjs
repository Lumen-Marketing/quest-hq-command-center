import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyFunction, functionQueryAt, insertReference, matchFunctions, pointReference, rangeReference,
  referenceSlotAt, separateReference,
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

// ---- ctrl-click: and this one as well -----------------------------------------------------------

test('a second reference is separated from the first, not written over it', () => {
  // The whole point of the modifier. A plain click REPLACES what was just written, which is what
  // stops `=A1B2`; ctrl means keep it and add another, so a separator has to go in between.
  const out = separateReference('=SUM(A1', 7);
  assert.equal(out.text, '=SUM(A1,');
  assert.equal(out.caret, 8, 'and the caret waits past the comma for the next one');
  assert.equal(out.changed, true);
});

test('a range can be added to as easily as a cell', () => {
  const out = separateReference('=SUM(A1:B2', 10);
  assert.equal(out.text, '=SUM(A1:B2,');
  assert.equal(out.caret, 11);
});

test('the reference and the separator make a formula that still parses', () => {
  // Written end to end the way the editor does it: point, ctrl-point, and the result is what a
  // person would have typed.
  let { text, caret } = insertReference('=SUM(', 5, 'A1');
  ({ text, caret } = separateReference(text, caret));
  ({ text, caret } = insertReference(text, caret, 'C3'));
  assert.equal(text, '=SUM(A1,C3');
  assert.equal(caret, 10);
});

test('there is nothing to separate from on open ground', () => {
  // A comma with nothing before it is a broken formula, not the start of a list. Ctrl-clicking
  // there has to fall back to being the ordinary click it otherwise is.
  assert.equal(separateReference('=SUM(', 5).changed, false);
  assert.equal(separateReference('=', 1).changed, false);
  assert.equal(separateReference('=A1+', 4).changed, false);
});

test('it refuses anything that is not a formula, and anything mid-name', () => {
  assert.equal(separateReference('A1', 2).changed, false, 'plain text is not a formula');
  assert.equal(separateReference('', 0).changed, false);
  // Letters with no digits after them are a name being typed, not a reference.
  assert.equal(separateReference('=SUM', 4).changed, false);
  // And a name a reference is only the TAIL of is left alone: the `A` in front means `LOG10`
  // here is five letters of something longer, not column LOG row 10.
  assert.equal(separateReference('=ALOG10', 7).changed, false);
});

test('LOG10 on its own is a cell, not the function, and that is not a bug', () => {
  // Column LOG, row 10. It reads as a reference because that is what it is until a `(` says
  // otherwise -- the same call every spreadsheet makes, and the same one `referenceSlotAt` was
  // already making before ctrl-click existed.
  assert.deepEqual(referenceSlotAt('=LOG10', 6), { start: 1, end: 6 });
  assert.equal(separateReference('=LOG10', 6).text, '=LOG10,');
});

test('shift builds the range from the anchor, in the order a spreadsheet writes it', () => {
  // The same call the drag makes: the modifier only decides which anchor is handed in.
  assert.equal(rangeReference('B2', 'D5'), 'B2:D5');
  assert.equal(rangeReference('D5', 'B2'), 'D5:B2', 'backwards is still what was pointed at');
  assert.equal(rangeReference('B2', 'B2'), 'B2', 'and a range of one cell is just the cell');
});

// ---- pointing, as a sequence -------------------------------------------------------------------
//
// The gestures shipped broken and every test passed, because the tests beside them asked whether
// the source said the right words. A drag is not one edit, it is a run of them, and only the
// SECOND step can show that the anchor is stale. So these replay whole gestures and read the
// formula that comes out. Which gesture calls what is the wiring test's half; this is the
// arithmetic underneath it.

/**
 * Point at cells the way the mouse delivers it, and hand back the finished formula.
 *
 * `{ ref }` is a click, `{ ref, shift }` and `{ ref, ctrl }` are the modified ones, and
 * `{ drag }` is a cell the pointer crossed with the button still down.
 */
function point(steps, start = '=SUM(') {
  let text = start;
  let caret = start.length;
  let picked = null;
  let picking = null;
  const write = (from, to) => {
    const out = pointReference(text, picking.at, from, to);
    if (!out.changed) return;
    text = out.text;
    caret = out.caret;
    picking.at = out.anchor;
  };
  for (const step of steps) {
    if (step.drag) { if (picking) write(picking.from, step.drag); continue; }
    if (step.shift && picked) {
      picking = picked;
    } else if (step.ctrl && picked) {
      const apart = separateReference(text, caret);
      if (apart.changed) { text = apart.text; caret = apart.caret; }
      picked = { from: step.ref, at: caret };
      picking = picked;
    } else {
      picked = { from: step.ref, at: caret };
      picking = picked;
    }
    write(picking.from, step.ref);
  }
  return text;
}

test('a drag rewrites one reference wider instead of trailing them across the formula', () => {
  // What this used to produce, cell by cell: =SUM(A1, then =SUM(A1:B1A1, then =SUM(A1:C1A1:B1A1.
  // The caret was in the right place the whole time; it was the anchor the next write started
  // from that never moved off the opening bracket.
  assert.equal(point([{ ref: 'A1' }, { drag: 'B1' }, { drag: 'C1' }]), '=SUM(A1:C1');
  assert.equal(point([{ ref: 'A1' }, { drag: 'B2' }, { drag: 'A1' }]), '=SUM(A1', 'and back to one cell');
});

test('shift stretches the last reference from where it started', () => {
  assert.equal(point([{ ref: 'A1' }, { ref: 'C1', shift: true }]), '=SUM(A1:C1');
  // Shift again reaches further from the SAME anchor, rather than from the last cell shifted to.
  assert.equal(point([{ ref: 'A1' }, { ref: 'C1', shift: true }, { ref: 'E1', shift: true }]), '=SUM(A1:E1');
});

test('ctrl leaves the reference alone and starts another beside it', () => {
  assert.equal(point([{ ref: 'A1' }, { ref: 'C3', ctrl: true }]), '=SUM(A1,C3');
  // And the new one drags out like any other, which is the case that stayed broken longest:
  // the comma had put the anchor somewhere the drag then wrote over from.
  assert.equal(point([{ ref: 'A1' }, { ref: 'C3', ctrl: true }, { drag: 'D4' }]), '=SUM(A1,C3:D4');
  assert.equal(point([{ ref: 'A1' }, { ref: 'C3', ctrl: true }, { ref: 'E5', shift: true }]), '=SUM(A1,C3:E5');
});

test('the formula in the screenshot, built by the gestures that build it', () => {
  // Three ctrl-clicks and a drag, which is how somebody actually writes =SUM(H1,G1,F1,A1:E1).
  // Unclosed, because the editor deliberately never types the bracket back at you.
  assert.equal(
    point([{ ref: 'H1' }, { ref: 'G1', ctrl: true }, { ref: 'F1', ctrl: true }, { ref: 'A1', ctrl: true }, { drag: 'E1' }]),
    '=SUM(H1,G1,F1,A1:E1',
  );
});

test('a plain click still replaces the reference before it', () => {
  // The oldest of the three, and the reason the anchor exists at all: without it a second click
  // leaves =A1B2, which is not a formula.
  assert.equal(point([{ ref: 'A1' }, { ref: 'B2' }]), '=SUM(B2');
  assert.equal(point([{ ref: 'A1' }, { ref: 'B2' }], '='), '=B2');
});

test('the anchor it hands back is where the next reference replaces from', () => {
  const first = pointReference('=SUM(', 5, 'A1', 'A1');
  assert.deepEqual(
    { text: first.text, caret: first.caret, anchor: first.anchor },
    { text: '=SUM(A1', caret: 7, anchor: 7 },
  );
  // Handed straight back in, the next one replaces rather than lands beside it.
  assert.equal(pointReference(first.text, first.anchor, 'A1', 'C1').text, '=SUM(A1:C1');
  // Handed the caret the gesture began at, it does not -- which is the defect, stated once.
  assert.equal(pointReference(first.text, 5, 'A1', 'C1').text, '=SUM(A1:C1A1');
});

test('pointing at a cell where a reference may not go changes nothing, and moves nothing', () => {
  const out = pointReference('=SUM', 4, 'A1', 'A1');
  assert.deepEqual({ text: out.text, anchor: out.anchor, changed: out.changed }, { text: '=SUM', anchor: 4, changed: false });
  assert.equal(pointReference('plain text', 5, 'A1', 'A1').changed, false, 'and it is not a formula at all');
});
