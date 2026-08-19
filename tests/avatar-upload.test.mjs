import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { UPLOAD_POLICIES, validateUpload } from '../src/security/upload-policy.js';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const taskProfile = readFileSync(new URL('../taskmanagement/js/views/ProfileView.js', import.meta.url), 'utf8');

function fakeFile(name, bytes, type = '') {
  const data = Uint8Array.from(bytes);
  return {
    name,
    type,
    size: data.length,
    slice: (start = 0, end = data.length) => ({ arrayBuffer: async () => data.slice(start, end).buffer }),
  };
}
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
const ZIP = [0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0];

test('a phone-sized photo is accepted wherever the picture is re-encoded', async () => {
  // It used to be rejected as an `image` and accepted as an avatar, because only the avatar
  // path re-encoded. Every still photo is fitted to a few megabytes before storage now, so the
  // cap on all three is a decode guard and a 24 MB phone photo is not remarkable to any of them.
  const photo = fakeFile('selfie.png', PNG, 'image/png');
  photo.size = 30 * 1024 * 1024;
  assert.equal((await validateUpload(photo, 'image')).ok, true);
  assert.equal((await validateUpload(photo, 'avatarimage')).ok, true);
  assert.equal((await validateUpload(photo, 'workspaceicon')).ok, true);
  // A policy that stores what it is given keeps a real cap, and it is far smaller.
  assert.equal((await validateUpload(photo, 'document')).ok, false);
});

test('the avatar policy keeps every content check and still guards against a runaway file', async () => {
  assert.equal((await validateUpload(fakeFile('a.png', ZIP, 'image/png'), 'avatarimage')).ok, false);
  assert.equal((await validateUpload(fakeFile('a.png.exe', PNG), 'avatarimage')).ok, false);
  const runaway = fakeFile('huge.png', PNG, 'image/png');
  runaway.size = 200 * 1024 * 1024;
  assert.equal((await validateUpload(runaway, 'avatarimage')).ok, false);
  // The three re-encoding policies share one number, because they are the same judgement:
  // past this the browser is likelier to die decoding than to produce a picture.
  assert.equal(UPLOAD_POLICIES.avatarimage.max, 100 * 1024 * 1024);
  assert.equal(UPLOAD_POLICIES.image.max, UPLOAD_POLICIES.avatarimage.max);
  assert.equal(UPLOAD_POLICIES.workspaceicon.max, UPLOAD_POLICIES.avatarimage.max);
});

test('no byte cap survives in either host avatar path', () => {
  const crop = source.match(/async function prepareProfileAvatarCrop\([\s\S]*?\n\}/)[0];
  const save = source.match(/async function saveProfileAvatar\([\s\S]*?\n\}/)[0];
  for (const [name, fn] of [['prepareProfileAvatarCrop', crop], ['saveProfileAvatar', save]]) {
    assert.doesNotMatch(fn, /2 \* 1024 \* 1024/, `${name} must not reimpose a byte cap`);
    assert.doesNotMatch(fn, /2 MB or smaller/, `${name} must not reimpose a byte cap`);
    assert.match(fn, /validateUpload\(file, 'avatarimage'\)/, `${name} must use the avatar policy`);
  }
});

test('the saved avatar is compressed before it is stored or uploaded', () => {
  const save = source.match(/async function saveProfileAvatar\([\s\S]*?\n\}/)[0];
  assert.match(save, /avatarUrl = await avatarDataUrlFromFile\(file\);/);
  // Extension and content type must follow the compressed output: the ladder can turn a
  // jpg into webp, and a mismatched content type is rejected by the bucket's
  // allowed_mime_types.
  assert.match(save, /const compressed = dataUrlToFile\(avatarUrl, `avatar-\$\{Date\.now\(\)\}`\);/);
  assert.match(save, /avatarFileExtension\(compressed\)/);
  assert.match(save, /contentTypeFor\(compressed\)/);
});

test('avatars target a 512px square well under the bucket 2 MB limit', () => {
  assert.match(source, /const AVATAR_EDGE_PX = 512;/);
  const budget = Number(source.match(/const AVATAR_MAX_DATA_URL = (\d+) \* 1024;/)[1]);
  assert.ok(budget * 1024 < 2 * 1024 * 1024, 'avatar budget must stay under the avatars bucket limit');
});

test('the crop source is bounded so a huge photo does not stall the cropper', () => {
  assert.match(source, /const AVATAR_CROP_SOURCE_PX = 1600;/);
  const fn = source.match(/async function croppableImageFromFile\([\s\S]*?\n\}/)[0];
  assert.match(fn, /Math\.min\(1, AVATAR_CROP_SOURCE_PX \/ Math\.max\(decoded\.width, decoded\.height\)\)/);
  // Must still resolve an <img>: the cropper reads naturalWidth/naturalHeight, which an
  // ImageBitmap does not expose.
  assert.match(fn, /return loadImage\(/);
});

test('the embedded task app also accepts any size and previews the resized blob', () => {
  assert.doesNotMatch(taskProfile, /2 \* 1024 \* 1024/);
  assert.doesNotMatch(taskProfile, /2 MB or smaller/);
  // It already resized on upload; previewing the original meant holding a multi-megabyte
  // data URL just to draw a thumbnail.
  assert.match(taskProfile, /this\._resizeImage\(file, 512\)/);
  assert.match(taskProfile, /URL\.revokeObjectURL\(url\)/);
});
