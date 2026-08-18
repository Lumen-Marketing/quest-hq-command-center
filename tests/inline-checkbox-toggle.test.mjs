import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "I can't toggle the button."
//
// A Yes/No on a record page went through the click-to-edit path: the first click replaced a
// static "No" with a switch that ALSO read No, so nothing appeared to happen — and clicking
// away committed the value it already had. The history recorded it exactly: "Changed Something
// to bid — no → no". One press has to mean one change.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// The inline editor moved out of main.js into the record page's own module, which is where it
// was only ever reachable from. wbReadFieldInput did NOT move -- the modal reads its markup with
// the same function -- so the two halves of this are read from two files.
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const recordPage = readFileSync(join(root, 'src', 'workspace', 'record-page.js'), 'utf8').replace(/\r\n/g, '\n');

const openBody = () => {
  const at = recordPage.indexOf('const open = (retried = false) => {');
  assert.notEqual(at, -1, 'the inline editor has moved');
  return recordPage.slice(at, recordPage.indexOf('\n      };', at));
};

test('opening the editor on a Yes/No flips it', () => {
  const body = openBody();
  assert.match(body, /if \(field\.type === 'checkbox'\) input\.checked = !input\.checked;/);
});

test('it flips only after the input exists, and only for a checkbox', () => {
  const body = openBody();
  const focusAt = body.indexOf('input.focus()');
  const flipAt = body.indexOf("field.type === 'checkbox'");
  assert.ok(focusAt !== -1 && flipAt > focusAt, 'the flip must happen once the editor is rendered');
  // Every other type keeps its value untouched when the editor opens.
  assert.doesNotMatch(body, /input\.checked = true;/);
  assert.doesNotMatch(body, /input\.value = ''/);
});

test('the commit still reads the box rather than a stored value', () => {
  // wbReadFieldInput is what turns the flipped box into the saved value.
  assert.match(main, /if \(f\.type === 'checkbox'\) return el\.checked;/);
});

test('the record page renders a checkbox the editor can flip', () => {
  // wbRenderFieldInput must emit a real [data-f] checkbox, or the flip has nothing to act on
  // and wbReadFieldInput falls back to ''.
  const ui = readFileSync(join(root, 'src', 'workspace', 'field-config-ui.js'), 'utf8');
  assert.match(ui, /case 'checkbox': input = `<label class="wb-switch"><input type="checkbox" data-f="\$\{h\(f\.id\)\}"/);
});
