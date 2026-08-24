import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "On the App Builder fields, allow field Image to upload multiple photos."
//
// The File field already had `config.multiple`, and the uploader that mounts both is driven by
// one attribute on the zone. So this is the image field joining machinery that exists, not a
// second gallery -- the interesting part is the places that still assumed exactly one photo.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
// The File / Image field uploader moved out of main.js into its own fetched module, so the
// assertions about the drop zone and the upload path read it there.
const fileField = readFileSync(new URL('../src/workspace/file-field.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const ui = readFileSync(new URL('../src/workspace/field-config-ui.js', import.meta.url), 'utf8');
const styles = (readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../src/workspace/builder.css', import.meta.url), 'utf8'));

test('the choice is offered on an Image field, not only on File', () => {
  assert.match(ui, /if \(t === 'file' \|\| t === 'image'\) \{/);
  // It says photos on an image field. "Multiple files" on a photo field is the kind of
  // wording that makes somebody check whether they picked the right type.
  assert.match(ui, /const noun = t === 'image' \? 'photos' : 'files';/);
  assert.match(ui, /const one = t === 'image' \? 'photo' : 'file';/);
  assert.match(ui, /id="wbFileMode"/);
});

test('what the choice sets is actually stored for an image', () => {
  // Without this the control paints, changes, and is forgotten on save.
  // Read where every type config is read, not inside another type branch, or it would never
  // run for a file field. And only when the control is on screen: a missing element reads as
  // undefined, and the old !!checked(...) turned that into false, resetting a field that was
  // set to multiple whenever the draft was collected before the field UI chunk had arrived.
  assert.match(main, /const mode = val\('wbFileMode'\);/);
  assert.match(main, /if \(mode !== undefined\) m\.draft\.config\.multiple = mode === 'multiple';/);
});

test('the image input takes several files, and the zone says so', () => {
  // `data-wb-file-multi` is what the uploader reads to decide list-or-single, and `multiple` on
  // the input is what lets the OS picker return more than one. Missing either gives a field that
  // looks multiple and behaves single.
  const branch = ui.slice(ui.indexOf("case 'image': input = `"), ui.indexOf("case 'rating':"));
  assert.match(branch, /\$\{f\.config\.multiple \? 'data-wb-file-multi' : ''\}/);
  assert.match(branch, /data-wb-file-input \$\{f\.config\.multiple \? 'multiple' : ''\}/);
  assert.match(branch, /data-wb-file-list/, 'the list the uploader paints into');
  // A single image keeps the preview and the one row of actions it always had.
  assert.match(branch, /data-wb-img-preview/);
  assert.match(branch, /data-wb-file-actions/);
});

test('a photo in the list is shown, not named', () => {
  // The generic row is an icon plus a filename. Eight of those is harder to read than the one
  // picture it replaced, which is the opposite of the point.
  // No per-row class: the <ul> already carries wb-img-list when the field is an image, so the
  // row repeating it was markup paying for what a descendant selector does for nothing.
  assert.match(styles, /\.wb-img-list \.wb-file-row \{/);
  assert.match(fileField, /\$\{isImage && fv\.url\s*\n?\s*\? `<img class="wb-img-thumb"/);
  // The shared label wording stayed generic. Rewording it per type was mine to add and cost
  // more entry-bundle bytes than the ceiling had; the thumbnail is what makes it readable.
});

test('a cell READS every photo, whatever it goes on to draw', () => {
  // This is the one that silently loses data: wbFileValue reads ONE, so a field switched to
  // multiple would render only the first and look like the rest never uploaded.
  //
  // What is DRAWN was cut back afterwards -- a table row shows one photo and a "+3" chip, and
  // only the record itself shows the lot (tests/record-image-viewer.test.mjs). That is a
  // decision about the row; reading only the first photo would still be a bug, because the
  // count and the viewer behind the chip are both built from the full list.
  const cell = main.slice(main.indexOf("    case 'image': {"), main.indexOf("    case 'rating'"));
  assert.match(cell, /wbFileValues\(value\)/, 'wbFileValue would show only the first');
  assert.ok(!/wbFileValue\(value\)/.test(cell), 'the single-value reader must not survive here');
  assert.match(cell, /shots\.map\(/);
  assert.match(cell, /wb-cell-empty/, 'and nothing at all still reads as an em dash');
});

test('every class the gallery uses is styled', () => {
  for (const name of ['wb-img-list', 'wb-img-thumb']) {
    assert.ok(styles.includes(`.${name}`), `.${name} has no rule`);
  }
  // The single-image field stays a circle; a gallery is squares, or faces get cropped.
  assert.match(styles, /\.wb-img-avatar \{[^}]*border-radius: 50%/);
  assert.match(styles, /\.wb-img-list \.wb-file-row \{[^}]*border-radius: 10px/);
});

test('turning it off does not rewrite what is already there', () => {
  // The uploader stores one file as one object and several as an array, so a field switched back
  // to single keeps every photo already attached -- it only stops new ones being added.
  assert.match(fileField, /files\.length === 1 && !multi \? files\[0\] : files/);
  assert.match(ui, /keeps every \S+ already attached/);
});
