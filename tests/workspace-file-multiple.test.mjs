import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
// The File / Image field uploader moved out of main.js into its own fetched module, so the
// assertions about the drop zone and the upload path read it there.
const fileField = readFileSync(new URL('../src/workspace/file-field.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const fieldUi = readFileSync(new URL('../src/workspace/field-config-ui.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

// wbFileValue / wbFileValues are plain functions of their input, so they are rebuilt here
// from source rather than imported (main.js cannot load outside a browser).
const build = () => {
  const single = main.match(/function wbFileValue\(val\) \{[\s\S]*?\n\}/)[0];
  const many = main.match(/function wbFileValues\(val\) \{[\s\S]*?\n\}/)[0];
  // eslint-disable-next-line no-new-func
  return new Function(`${single}; ${many}; return { wbFileValue, wbFileValues };`)();
};
const { wbFileValues } = build();

test('a field that has always held one file still reads', () => {
  // Every file attached before this exists as a single object or a JSON string. Reading only
  // arrays would have made all of them vanish the moment the field was set to multiple.
  assert.deepEqual(wbFileValues({ name: 'plan.pdf', url: 'https://x/plan.pdf' }).map((f) => f.name), ['plan.pdf']);
  assert.deepEqual(wbFileValues('{"name":"plan.pdf","url":"https://x/p"}').map((f) => f.name), ['plan.pdf']);
});

test('a plain URL string still resolves to a named file', () => {
  const [f] = wbFileValues('https://example.com/files/8f14e45f-ea1a-4e5c-9c1e-1c1c1c1c1c1c-site%20plan.pdf');
  assert.equal(f.name, 'site plan.pdf', 'the uuid prefix is stripped and the name decoded');
});

test('an array of files reads as all of them, in order', () => {
  const out = wbFileValues([
    { name: 'a.pdf', url: 'https://x/a' },
    { name: 'b.pdf', url: 'https://x/b' },
  ]);
  assert.deepEqual(out.map((f) => f.name), ['a.pdf', 'b.pdf']);
});

test('a JSON array string reads too, because that is how it is stored', () => {
  const out = wbFileValues('[{"name":"a.pdf","url":"u"},{"name":"b.pdf","url":"u"}]');
  assert.deepEqual(out.map((f) => f.name), ['a.pdf', 'b.pdf']);
});

test('empty and junk yield no files rather than throwing', () => {
  assert.deepEqual(wbFileValues(''), []);
  assert.deepEqual(wbFileValues(null), []);
  assert.deepEqual(wbFileValues([]), []);
  assert.deepEqual(wbFileValues('[not json'), [{ name: '[not json', url: '' }], 'a broken array falls back to treating it as one name');
  assert.deepEqual(wbFileValues([null, { name: 'ok.pdf' }]).map((f) => f.name), ['ok.pdf']);
});

// ---- the field ------------------------------------------------------------------------------

test('the file field asks how many, in two named options, and saves the answer', () => {
  // A switch labelled "Allow multiple files" named what ON meant and left OFF to be inferred.
  // The question has two answers, and the Display style control above it is already written
  // that way.
  assert.match(fieldUi, /id="wbFileMode"/);
  assert.match(fieldUi, /<option value="single"/);
  assert.match(fieldUi, /<option value="multiple"/);
  // Single is what a field with no config says, so an existing field keeps behaving as it did.
  assert.match(fieldUi, /const multiple = !!fd\.config\.multiple;/);
  // Read where every type config is read, not inside another type branch, or it would never
  // run for a file field. And only when the control is on screen: a missing element reads as
  // undefined, and the old !!checked(...) turned that into false, resetting a field that was
  // set to multiple whenever the draft was collected before the field UI chunk had arrived.
  assert.match(main, /const mode = val\('wbFileMode'\);/);
  assert.match(main, /if \(mode !== undefined\) m\.draft\.config\.multiple = mode === 'multiple';/);
});

test('the input only accepts several when the field says so', () => {
  assert.match(fieldUi, /data-wb-file-input \$\{f\.config\.multiple \? 'multiple' : ''\}/);
  assert.match(fieldUi, /data-wb-file \$\{f\.config\.multiple \? 'data-wb-file-multi' : ''\}/);
});

test('uploads append rather than replace', () => {
  // Dropping three files must end with three. Assigning would leave the last one only.
  assert.match(fileField, /if \(multi\) writeAll\(\[\.\.\.readAll\(\), attached\]\);/);
});

test('several files upload one at a time, not in parallel', () => {
  // They share one progress bar; racing drives it backwards.
  assert.match(fileField, /for \(const file of \(multi \? picked : picked\.slice\(0, 1\)\)\) await upload\(file\);/);
});

test('a single file still stores as a single object', () => {
  // So turning multiple on and off again does not rewrite records that only ever had one.
  assert.match(fileField, /files\.length === 1 && !multi \? files\[0\] : files/);
});

test('each attached file can be removed on its own', () => {
  assert.match(fileField, /data-wb-file-drop-one="\$\{i\}"/);
  assert.match(fileField, /readAll\(\)\.filter\(\(_, i\) => i !== Number\(btn\.dataset\.wbFileDropOne\)\)/);
});

test('the cell shows every attached file, not just the first', () => {
  assert.match(main, /const list = wbFileValues\(value\);/);
  assert.match(css, /\.wb-file-cells \{/);
  assert.match(css, /\.wb-file-row \{/);
});

test('the single-file remove button is optional now', () => {
  // A multiple field renders a list instead of that one row of actions, so the binding has to
  // tolerate its absence or every multi field throws on mount.
  assert.match(fileField, /if \(removeBtn\) removeBtn\.onclick = /);
});
