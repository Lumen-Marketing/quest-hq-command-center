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
  // picking.at is the caret as it was when the drag began, so every mousemove rewrites the
  // same span.
  assert.match(editor, /picking = \{ from: target\.dataset\.shCell, at: writing\.selectionStart \}/);
  assert.match(editor, /insertReference\(writing\.value, picking\.at, ref\)/);
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
  assert.match(editor, /let pickBox = null;/);
  assert.match(editor, /if \(pickBox\) refsIn\(pickBox\)/);
  assert.match(editor, /classList\.add\('ref-pick'\)/);
  assert.match(styles, /\.sh-grid \.ref-pick \{/);
});

test('the marks and the list are cleared when the editor closes', () => {
  const bind = editor.slice(editor.indexOf('function bindFormulaAssist'));
  const body = bind.slice(0, bind.indexOf('\n  }'));
  assert.match(body, /if \(writing === input\) writing = null;/);
  assert.match(body, /hideSuggestions\(\);/);
  assert.match(body, /if \(pickBox\) \{ pickBox = null; paintSelection\(\); \}/);
});

test('the list offers the names the evaluator actually has', () => {
  // Not a second hand-kept list: the same SHEET_FUNCTIONS the strip along the bottom prints.
  assert.match(editor, /matchFunctions\(query, SHEET_FUNCTIONS\)/);
});
