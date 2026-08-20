import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "Lets fix the image field, and how it does displayed... in the record when image is uploaded
// you can view it by tapping or click the image to open in a modal that has buttons Download,
// Open in a newtab and close the modal, if multiple image, it can be view by all images or one
// by one and by clicking the arrow side by side... also you cant display all images on the
// record list."
//
// Two halves. A photo is now a doorway rather than decoration, and a table row stops trying to
// be a gallery: it draws one and says how many more there are.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const viewer = readFileSync(new URL('../src/workspace/image-lightbox.js', import.meta.url), 'utf8');
const recordPage = readFileSync(new URL('../src/workspace/record-page.js', import.meta.url), 'utf8');
// The uploader is its own fetched module now -- extracted in this same change, because the entry
// chunk had 18 bytes of headroom left and a photo viewer does not fit in 18 bytes.
const fileField = readFileSync(new URL('../src/workspace/file-field.js', import.meta.url), 'utf8');
const builderModal = readFileSync(new URL('../src/workspace/builder-modal.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

const imageCell = main.slice(main.indexOf("    case 'image': {"), main.indexOf("    case 'rating'"));

test('a row draws one photo and counts the rest; the record draws them all', () => {
  // The whole point of the second half of the request. Eight photos in a cell pushed every
  // column beside it off the row and still showed each one too small to identify.
  assert.match(imageCell, /const seen = ctx\.detail \? tiles : tiles\.slice\(0, 1\);/);
  assert.match(imageCell, /const rest = shots\.length - seen\.length;/);
  assert.match(imageCell, /wb-img-more/, 'the +N chip that stands for the ones not drawn');
  // And it is still every photo that is READ, so switching a field to multiple never hides any.
  assert.match(imageCell, /wbFileValues\(value\)/);
});

test('the count is a badge ON the photo, not a second circle beside it', () => {
  // A "+2" chip standing next to the thumbnail is another circle the same size, and in a narrow
  // column it wrapped under the first one -- so the thing standing in for "two more photos"
  // looked exactly like one of them. On the corner it costs no width at all.
  assert.match(imageCell, /\$\{more \? ' has-more' : ''\}/);
  assert.match(styles, /\.wb-img-cell\.has-more \{ position: relative; flex-wrap: nowrap; gap: 0; \}/);
  assert.match(styles, /\.wb-img-more \{\s*position: absolute; right: -2px; bottom: -2px;/);
});

test('detail is what separates the record from a row of it', () => {
  // One flag on the context object, set by the two surfaces that show a record whole.
  assert.match(recordPage, /const valueCtx = \{ companyId, workspace, app, values: item\.values, item, canManage: false, detail: true \};/);
  assert.match(builderModal, /values: item\.values, item: null, canManage: false, detail: true,/);
});

test('every thumbnail is a button, which is what stops the click going anywhere else', () => {
  // A table row opens the record on click and a record-page cell opens the inline editor, and
  // both already skip anything interactive. Rendering the photo as a bare <img> would have made
  // "look at this picture" mean "open this record" everywhere it appears.
  assert.match(imageCell, /<button type="button" class="wb-img-shot"/);
  assert.match(imageCell, /data-wb-images="/);
  assert.match(imageCell, /data-wb-img-at="/);
});

test('the photos travel by key, not in the markup', () => {
  // A signed URL is 200-odd characters. Writing the whole gallery into every row -- so that the
  // one photo it draws could still step through the rest -- is a table nobody can scroll.
  assert.match(main, /const WB_IMG_SETS = new Map\(\);/);
  assert.match(main, /function wbImgSetKey\(shots\)/);
  // Emptied at the top of every render, which is when the markup holding the keys is replaced.
  assert.match(main, /wbForgetImgSets\(\); \/\/ the photo sets the last paint registered go with the markup that held them/);
  // A key that has outlived its render still opens the photo that was clicked.
  assert.match(main, /el\.dataset\.wbImgUrl \? \[\{ url: el\.dataset\.wbImgUrl, name: el\.dataset\.wbImgName \|\| 'Photo' \}\] : \[\]/);
});

test('one delegated click owns every photo, wherever it is drawn', () => {
  // Bound once beside the attachment handler rather than per render: the same thumbnail appears
  // in a table cell, on a card, on the record page and in the field editor.
  assert.match(main, /const viewImage = event\.target\.closest\('\[data-wb-images\]'\);/);
  assert.match(main, /if \(viewImage\) \{ event\.preventDefault\(\); event\.stopPropagation\(\); wbOpenImagesFrom\(viewImage\); return; \}/);
});

test('the viewer is fetched on the click that opens it', () => {
  // Nothing that paints before the click needs a lightbox, and the entry bundle has no room for
  // one. A static import would land it in the same chunk.
  assert.match(main, /import\('\.\/workspace\/image-lightbox\.js'\)/);
  assert.ok(!/^import .*image-lightbox/m.test(main), 'a static import would be bundled into the entry chunk');
});

test('the dialog has the three buttons that were asked for', () => {
  assert.match(viewer, /'Download'/);
  assert.match(viewer, /'Open in new tab'/);
  assert.match(viewer, /'Close'/);
  // Download must SAVE. A signed URL opened in place is a navigation, not a file.
  assert.match(viewer, /download=\$\{encodeURIComponent\(\(shot && shot\.name\) \|\| 'photo'\)\}/);
  assert.match(viewer, /download\.setAttribute\('download', shot\.name \|\| 'photo'\);/);
  // A data: or blob: URL has nobody to ask, so the anchor's own attribute carries it.
  assert.match(viewer, /if \(!url \|\| \/\^\(data\|blob\):\/i\.test\(url\)\) return url;/);
});

test('several photos step one by one, and wrap', () => {
  assert.match(viewer, /const prevBtn = arrow\('prev', 'Previous photo', 'ti-chevron-left'\);/);
  assert.match(viewer, /const nextBtn = arrow\('next', 'Next photo', 'ti-chevron-right'\);/);
  // Modulo both ways: past the last of eight the thing you want is the first, not a dead button.
  assert.match(viewer, /const step = \(by\) => \{ at = \(at \+ by \+ list\.length\) % list\.length; all = false; paint\(\); \};/);
  // Keyboard too, and Escape closes.
  assert.match(viewer, /event\.key === 'ArrowRight'/);
  assert.match(viewer, /event\.key === 'ArrowLeft'/);
  assert.match(viewer, /if \(event\.key === 'Escape'\)/);
  // A single photo gets no arrows and no count to read.
  assert.match(viewer, /const many = list\.length > 1;/);
  assert.match(viewer, /if \(many\) stage\.append\(prevBtn\);/);
});

test('all of them at once is a toggle, not a second dialog', () => {
  assert.match(viewer, /let all = false;/);
  assert.match(viewer, /allText\.textContent = all \? 'One at a time' : 'All photos';/);
  assert.match(viewer, /overlay\.classList\.toggle\('is-all', all\);/);
  // Picking one out of the grid drops back to the single view on that photo.
  assert.match(viewer, /tile\.addEventListener\('click', \(\) => \{ at = i; all = false; paint\(\); \}\);/);
  assert.match(styles, /\.wb-lb\.is-all \.wb-lb-stage \{ display: none; \}/);
});

test('the viewer puts back what it borrowed', () => {
  // It draws onto <body>, outside the app's render(), so nothing it does may leak into the page
  // behind it: the key handler, the scroll lock and the focus all come back off on close.
  assert.match(viewer, /document\.removeEventListener\('keydown', onKey, true\);/);
  assert.match(viewer, /document\.documentElement\.classList\.remove\('wb-lb-locked'\);/);
  assert.match(viewer, /if \(returnTo && typeof returnTo\.focus === 'function' && returnTo\.isConnected\) returnTo\.focus\(\);/);
  assert.match(styles, /html\.wb-lb-locked, html\.wb-lb-locked body \{ overflow: hidden; \}/);
});

test('the field editor opens the same viewer', () => {
  // Otherwise there are two answers to "let me see that photo": a lightbox on the record, and a
  // raw browser tab from the field that uploaded it.
  assert.match(fileField, /data-wb-img-open="\$\{shots\.indexOf\(fv\)\}"/);
  assert.match(fileField, /wbShowImages\(readAll\(\)\.filter\(\(one\) => one\.url\), Number\(thumb\.dataset\.wbImgOpen\) \|\| 0\);/);
  // And the single-photo field's View button, which used to leave the record entirely.
  assert.match(fileField, /if \(isImage && viewBtn\) \{/);
  // It reaches the viewer through the same door the record cells use, injected rather than
  // imported -- two modules importing the lightbox is two chunks holding a copy of it.
  assert.match(main, /wbFileValues, wbMirrorFileToDrive, wbReadFileAsDataUrl, wbShowImages,/);
});

test('a filled photo cell still has somewhere to click to edit it', () => {
  // The inline editor opens on a click that skips buttons, and a photo cell is now nothing but
  // buttons -- so without this an image field could be viewed and never changed again.
  assert.match(recordPage, /const change = f\.type === 'image' && shown\.includes\('wb-img-shot'\)/);
  assert.match(recordPage, /wb-img-edit/);
  assert.match(styles, /\.wb-img-edit \{/);
});

test('a tall photo fits between the bars instead of running through them', () => {
  // Measured: a 900x1600 phone photo rendered at its FULL natural size and ran 936px through the
  // footer and off the screen. The stage centred with `display: grid`, whose auto row is sized BY
  // the image -- so the image's own `max-height: 100%` resolved against a height the image was
  // deciding, the browser dropped the circular constraint, and nothing capped it. Landscape shots
  // hid it completely: `max-width` resolves against a definite width, so they were caught by that
  // instead and looked correct.
  const stage = styles.match(/\.wb-lb-stage \{[^}]*\}/)[0];
  assert.match(stage, /display: flex/, 'a grid row cannot resolve the image percentage');
  assert.ok(!/display: grid/.test(stage), 'grid is what broke it');
  assert.match(stage, /min-height: 0/, 'or the flex item refuses to shrink below its content');
  assert.match(stage, /overflow: hidden/, 'the backstop: clip rather than lay a photo over the buttons');
  const img = styles.match(/\.wb-lb-img \{[^}]*\}/)[0];
  assert.match(img, /max-height: 100%/);
  assert.match(img, /height: auto/, 'so a small photo is never blown up to fill the stage');
});

test('the arrows sit beside the picture at every width', () => {
  // They were moved UNDER the photo on a phone, which put both of them on top of it -- 36px over
  // a portrait shot, which is the half somebody is usually trying to see. The stage's horizontal
  // padding is what reserves their lane, so it has to stay wider than they are.
  const phone = styles.match(/@media \(max-width: 640px\) \{\s*\/\* Smaller and tighter[\s\S]*?\n\}/)[0];
  assert.match(phone, /\.wb-lb-stage \{ padding: 10px 48px; \}/);
  assert.match(phone, /\.wb-lb-arrow \{ width: 40px; height: 40px;/);
  assert.ok(!/bottom:/.test(phone), 'an arrow under the picture is an arrow on the picture');
});

test('every class these two draw is styled', () => {
  for (const name of [
    'wb-img-cell', 'wb-img-shot', 'wb-img-more', 'wb-img-edit',
    'wb-lb', 'wb-lb-head', 'wb-lb-titles', 'wb-lb-name', 'wb-lb-count', 'wb-lb-acts',
    'wb-lb-body', 'wb-lb-stage', 'wb-lb-img', 'wb-lb-arrow', 'wb-lb-grid', 'wb-lb-tile',
    'wb-lb-foot',
  ]) {
    assert.ok(styles.includes(`.${name}`), `.${name} has no rule`);
  }
  // Above every modal (240) and the sheet overlay (900), below the toasts (1000) so a failure
  // can still speak over it.
  assert.match(styles, /\.wb-lb \{[\s\S]*?z-index: 950;/);
});
