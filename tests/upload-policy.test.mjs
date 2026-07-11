import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acceptAttr, hasDangerousExtension, validateUpload } from '../src/security/upload-policy.js';

// A minimal File-like stub: validateUpload only needs name/type/size and a
// slice(...).arrayBuffer() that yields the leading bytes for the magic check.
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

test('a real PNG passes the image policy', async () => {
  const result = await validateUpload(fakeFile('logo.png', PNG, 'image/png'), 'image');
  assert.equal(result.ok, true);
});

test('Layer 3: ZIP bytes renamed to photo.jpg are caught by the magic-byte check', async () => {
  const result = await validateUpload(fakeFile('photo.jpg', ZIP, 'image/jpeg'), 'image');
  assert.equal(result.ok, false);
});

test('double-extension executable (invoice.pdf.exe) is blocked outright', async () => {
  assert.equal(hasDangerousExtension('invoice.pdf.exe'), true);
  const result = await validateUpload(fakeFile('invoice.pdf.exe', PNG), 'document');
  assert.equal(result.ok, false);
});

test('ZIP is rejected in the document policy but accepted for backups', async () => {
  const doc = await validateUpload(fakeFile('archive.zip', ZIP, 'application/zip'), 'document');
  assert.equal(doc.ok, false);
  const backup = await validateUpload(fakeFile('backup.zip', ZIP, 'application/zip'), 'backup');
  assert.equal(backup.ok, true);
});

test('Layer 2: a MIME type that disagrees with the extension is rejected', async () => {
  const result = await validateUpload(fakeFile('logo.png', PNG, 'application/pdf'), 'image');
  assert.equal(result.ok, false);
});

test('oversize files are rejected', async () => {
  const file = fakeFile('logo.png', PNG, 'image/png');
  file.size = 99 * 1024 * 1024;
  const result = await validateUpload(file, 'image');
  assert.equal(result.ok, false);
});

test('Layer 1: accept attribute advertises the policy extensions and MIME types', () => {
  const accept = acceptAttr('image');
  assert.match(accept, /\.png/);
  assert.match(accept, /image\/png/);
  assert.doesNotMatch(accept, /\.exe/);
});
