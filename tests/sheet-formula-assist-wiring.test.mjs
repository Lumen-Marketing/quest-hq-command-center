import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// The pure half is covered in sheet-formula-assist.test.mjs. This is the half that can rot
// without any of those failing: logic that is correct and never reached.

const editor = readFileSync(new URL('../src/sheet/sheet-editor.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('a click writes a reference only while a formula is being typed', () => {
  // The guard is what keeps ordinary selection working: without `writing`, every click on the
  // grid would try to edit something.
  assert.match(editor, /if \(writing && target && referenceSlotAt\(writing\.value, writing\.selectionStart\)\)/);
  // And the editor must keep focus, or the half-written formula commits on the way past.
  assert.match(editor, /dragging = \{ kind: 'pick' \}/);
});

test('dragging widens the reference to a range', () => {
  assert.match(editor, /if \(dragging\.kind === 'pick'\)/);
  assert.match(editor, /writeReference\(picking\.from, over\.dataset\.shCell\)/);
});

test('the drag replaces one reference rather than trailing them across the sheet', () => {
  // The anchor has to MOVE, to the end of whatever was just written -- held at the caret the
  // gesture began from, every mousemove after the first inserted instead of replacing and left
  // =SUM(A1:C1A1:B1A1 behind. The sequence itself is checked in sheet-formula-assist.test.mjs;
  // this is the half that can rot without any of those failing.
  assert.match(editor, /picked = \{ from: ref, at: writing\.selectionStart \};/);
  assert.match(editor, /pointReference\(writing\.value, picking\.at, fromRef, toRef\)/);
  assert.match(editor, /picking\.at = out\.anchor;/, 'and the returned anchor is kept, or nothing moves');
});

test('the name box counts out the range while it is being dragged', () => {
  // "1R x 5C", the way both spreadsheets read a drag back to you, and gone again when the
  // gesture is -- put back by hand, because syncBar would also refill the formula bar from the
  // cell and the formula bar is usually the thing being typed into.
  assert.match(editor, /\$\{rows\}R x \$\{cols\}C/);
  assert.match(editor, /if \(dragging\?\.kind === 'pick' && refLabel\) refLabel\.textContent = rangeLabel\(sel\);/);
});

test('both editors get the same treatment', () => {
  // The formula bar and the in-cell input. Wiring one and not the other is the obvious way for
  // this to half-work.
  assert.match(editor, /bindFormulaAssist\(formula\);/);
  assert.match(editor, /bindFormulaAssist\(input\);/);
});

test('the suggestion list gets first refusal on the keys it owns', () => {
  // Enter must pick the highlighted name rather than commit the cell, in both editors.
  const hits = [...editor.matchAll(/if \(suggestionKey\(event\)\) \{ event\.preventDefault\(\); event\.stopPropagation\(\); return; \}/g)];
  assert.equal(hits.length, 2, 'formula bar and in-cell input');
  assert.match(editor, /if \(event\.key === 'Enter' \|\| event\.key === 'Tab'\) return acceptSuggestion/);
});

test('clicking a suggestion is taken on mousedown, not click', () => {
  // A click lands after blur, by which point the editor has committed and there is no
  // half-typed name left to complete.
  const box = editor.slice(editor.indexOf("suggestBox.addEventListener('mousedown'"));
  assert.match(box.slice(0, 400), /acceptSuggestion\(hit\.dataset\.shSug\)/);
  assert.doesNotMatch(editor, /suggestBox\.addEventListener\('click'/);
});

test('the reference highlight is its own thing, not the fill preview', () => {
  // fillTo means "where the fill handle would reach". Reusing it would paint the wrong style
  // and leave it behind after the drag, because the fill path is what clears it.
  assert.match(editor, /let pickBoxes = \[\];/);
  assert.match(editor, /pickBoxes\.forEach\(\(box\) => \{/);
  assert.match(editor, /if \(box\) refsIn\(box\)/);
  assert.match(editor, /classList\.add\('ref-pick'\)/);
  assert.match(styles, /\.sh-grid \.ref-pick \{/);
});

test('the marks and the list are cleared when the editor closes', () => {
  const bind = editor.slice(editor.indexOf('function bindFormulaAssist'));
  const body = bind.slice(0, bind.indexOf('\n  }'));
  assert.match(body, /if \(writing === input\) writing = null;/);
  assert.match(body, /hideSuggestions\(\);/);
  assert.match(body, /picked = null;/);
  assert.match(body, /if \(pickBoxes\.length\) \{ pickBoxes = \[\]; paintSelection\(\); \}/);
});

test('the list offers the names the evaluator actually has', () => {
  // Not a second hand-kept list: the same SHEET_FUNCTIONS the strip along the bottom prints.
  assert.match(editor, /matchFunctions\(query, SHEET_FUNCTIONS\)/);
});

test('shift stretches the last reference, ctrl adds another beside it', () => {
  // Excel's two modifiers, on the same pointing. Shift reuses the anchor the last reference
  // started from -- `picked`, not `picking`, because the mouse has been up since.
  const down = editor.slice(editor.indexOf("gridHost.addEventListener('mousedown'"));
  const block = down.slice(0, down.indexOf('if (editing) return;'));
  assert.match(block, /if \(event\.shiftKey && picked\) \{\s*picking = picked;/);
  assert.match(block, /\(event\.ctrlKey \|\| event\.metaKey\) && picked/, 'and cmd on a Mac');
  assert.match(block, /separateReference\(writing\.value, writing\.selectionStart\)/);
  // Ctrl keeps the earlier references lit: it opens a new slot rather than replacing the list.
  assert.match(block, /pickBoxes\.push\(null\);/);
  assert.match(block, /pickBoxes = \[\];/, 'a plain click still starts over');
});

test('typing gives up the anchor shift and ctrl extend from', () => {
  // The caret has moved off whatever was pointed at. Our own writes set .value directly and do
  // not fire input, so this only ever fires for a person typing.
  const bind = editor.slice(editor.indexOf('function bindFormulaAssist'));
  const listener = bind.slice(bind.indexOf("addEventListener('input'"));
  assert.match(listener.slice(0, 300), /picked = null;/);
});
