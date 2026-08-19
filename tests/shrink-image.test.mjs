import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  IMAGE_UPLOAD_BUDGET_BYTES, renameFor, scaleFor, shrinkForUpload, shrinkImageToBudget,
} from '../src/media/shrink-image.js';

// "lets change the 5mb limit on uploading images and files, lets make it max is 100mb, so if
// exceeds 100mb it will compress to make it below 100mb."
//
// The ladder is RUN here rather than read: an encoder that is asked for six rungs and stops at
// the wrong one, or a scale that returns a zero-width canvas, is the kind of thing a source
// assertion waves straight through.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
// The File / Image field uploader moved out of main.js into its own fetched module, so the
// assertions about the drop zone and the upload path read it there.
const fileField = readFileSync(new URL('../src/workspace/file-field.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const policy = readFileSync(new URL('../src/security/upload-policy.js', import.meta.url), 'utf8');

/** A canvas whose encoder shrinks as quality drops, so the rungs can be told apart. */
function stubDom({ sizeFor } = {}) {
  const asked = [];
  const drawn = [];
  globalThis.document = {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => ({ drawImage: (src, x, y, w, h) => drawn.push({ w, h }) }),
      toDataURL: (type, quality) => {
        asked.push({ type, quality });
        const bytes = sizeFor ? sizeFor(type, quality) : 1000;
        // Length a multiple of 4 so atob accepts it.
        return `data:${type};base64,${'A'.repeat(Math.max(4, Math.ceil(bytes / 4) * 4))}`;
      },
    }),
  };
  globalThis.createImageBitmap = async () => ({ width: 4000, height: 3000, close() {} });
  return { asked, drawn };
}

const fakeFile = (size, name = 'roof.jpg') => ({ size, name, type: 'image/jpeg' });

// ---- the pure parts --------------------------------------------------------------------------

test('an image inside the longest edge is not scaled at all', () => {
  assert.deepEqual(scaleFor(1200, 900, 2560), { width: 1200, height: 900 });
  assert.deepEqual(scaleFor(2560, 100, 2560), { width: 2560, height: 100 });
});

test('an oversized image is scaled by its longest edge, keeping its shape', () => {
  // Pixels are what the file is made of. Dropping quality on an 8000px photo to hit a budget
  // gives a large soft image where a smaller sharp one was wanted.
  const wide = scaleFor(8000, 6000, 2560);
  assert.equal(wide.width, 2560);
  assert.equal(wide.height, 1920, 'the aspect ratio moved');
  const tall = scaleFor(3000, 9000, 2560);
  assert.equal(tall.height, 2560);
  assert.equal(tall.width, 853);
});

test('a scale never returns a zero edge', () => {
  // A canvas of width 0 throws on drawImage in some browsers and encodes to nothing in others.
  const sliver = scaleFor(10000, 1, 2560);
  assert.ok(sliver.width >= 1 && sliver.height >= 1);
});

test('the name says what the file now really is', () => {
  assert.equal(renameFor('roof.jpg', 'image/webp'), 'roof.webp');
  assert.equal(renameFor('roof.HEIC', 'image/jpeg'), 'roof.jpg');
  assert.equal(renameFor('no extension', 'image/webp'), 'no extension.webp');
  assert.equal(renameFor('', 'image/webp'), 'photo.webp');
});

// ---- the decision ----------------------------------------------------------------------------

test('a photo already inside the budget is returned untouched', async () => {
  // Re-encoding something small enough spends quality for nothing and renames a file nobody
  // asked to rename.
  const small = fakeFile(2 * 1024 * 1024);
  assert.equal(await shrinkForUpload(small), small, 'the very same file object');
  assert.equal(await shrinkImageToBudget(small, 8 * 1024 * 1024), small);
});

test('the budget is the one the module owns, not one the caller has to remember', () => {
  assert.equal(IMAGE_UPLOAD_BUDGET_BYTES, 8 * 1024 * 1024);
});

test('a big photo is re-encoded, and stops at the first rung that fits', async () => {
  const { asked } = stubDom({ sizeFor: (type, quality) => (quality > 0.8 ? 20000 : 4000) });
  const out = await shrinkImageToBudget(fakeFile(40 * 1024 * 1024), 8000);
  assert.ok(out.size < 40 * 1024 * 1024, 'it came back no smaller');
  assert.ok(out.size <= 8000);
  // webp 0.86 is over, webp 0.74 fits: two rungs tried and no more.
  assert.equal(asked.length, 2);
  assert.deepEqual(asked.map((a) => a.type), ['image/webp', 'image/webp']);
});

test('it is scaled down before a single rung is tried', async () => {
  const { drawn } = stubDom({ sizeFor: () => 100 });
  await shrinkImageToBudget(fakeFile(40 * 1024 * 1024), 8000);
  // The stub decodes at 4000x3000, so the longest edge is what got capped.
  assert.deepEqual(drawn, [{ w: 2560, h: 1920 }]);
});

test('every rung is tried before giving up, and the smallest is what comes back', async () => {
  // A photograph of noise: nothing fits. Uploading the least-bad attempt beats refusing, and the
  // caller still has the cap to enforce.
  const { asked } = stubDom({ sizeFor: (type, quality) => 50000 - quality * 1000 });
  const out = await shrinkImageToBudget(fakeFile(40 * 1024 * 1024), 100);
  assert.equal(asked.length, 6, 'the ladder stopped early');
  assert.ok(out.size > 100, 'this one genuinely could not fit');
  assert.ok(out.size < 40 * 1024 * 1024, 'but it is still smaller than what came in');
});

// ---- how it is reached -------------------------------------------------------------------------

test('the cap is 100MB, and it is a decode guard rather than a storage limit', () => {
  // One number for the three policies that re-encode before storing, because they are the
  // same judgement: past it the browser is likelier to die decoding than to produce a picture.
  assert.ok(policy.includes("const DECODE_GUARD = 100 * MB;"));
  ['image', 'workspaceicon', 'avatarimage'].forEach((key) => {
    assert.ok(
      policy.includes(`${key}: { exts: ['png', 'jpg', 'jpeg', 'webp', 'gif'], max: DECODE_GUARD`),
      `${key} does not use the shared decode guard`,
    );
  });
  assert.match(policy, /decode guard/);
});

test('a photo is judged as an image whatever field it was dropped on', () => {
  // A File field used the document policy, so a 30MB photo attached to one was refused for
  // being a document. What it is decides, not which field took it.
  assert.ok(fileField.includes("(png|jpe?g|webp)$/i.test(rawFile.name"), 'a photo is no longer recognised by its extension');
  assert.match(fileField, /guardUpload\(rawFile, photo \|\| isImage \? 'image' : 'document', scope\)/);
});

test('a GIF is never re-encoded', () => {
  // Drawing an animated GIF to a canvas returns its first frame. Better to refuse a huge one
  // than to silently flatten it.
  const photo = fileField.match(/const photo = \/([^/]+)\/i/);
  assert.ok(photo, 'the photo test is gone');
  assert.ok(!photo[1].includes('gif'), 'a gif would be flattened to its first frame');
});

test('the shrinker is fetched on demand, not carried by every session', () => {
  // The entry bundle has no room for a canvas and an encode ladder, and most sessions never
  // upload an image at all.
  assert.match(main, /import\('\.\/media\/shrink-image\.js'\)/);
  assert.ok(!/^import .*shrink-image/m.test(main), 'a static import would land it in the entry chunk');
  // A failure uploads the original rather than blocking: the cap is already checked, so the
  // worst case is a bigger file, not a wrong one.
  assert.match(main, /\.catch\(\(error\) => \{ console\.warn\('Image compression failed', error\); return file; \}\)/);
});
