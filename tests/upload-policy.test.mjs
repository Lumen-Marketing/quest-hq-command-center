import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acceptAttr, hasDangerousExtension, UPLOAD_POLICIES, validateUpload } from '../src/security/upload-policy.js';

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
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d, 0, 0, 0];

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

test('ZIP is accepted as a document, and still only as a real archive', async () => {
  // This asserted the opposite until a customer asked for Office files and zips on record
  // file fields: "allow documents file too like excel files word, powerpoint also zip
  // files". A bundle of site photos or a zipped submittal is a normal attachment.
  //
  // Widening the extension list does not widen what can actually get through -- the
  // magic-byte layer still has to see a real archive, which the second half checks.
  const doc = await validateUpload(fakeFile('archive.zip', ZIP, 'application/zip'), 'document');
  assert.equal(doc.ok, true);
  const backup = await validateUpload(fakeFile('backup.zip', ZIP, 'application/zip'), 'backup');
  assert.equal(backup.ok, true);
  // An executable renamed .zip is refused by the bytes, in this policy as in every other.
  const renamed = await validateUpload(fakeFile('malware.zip', [0x4d, 0x5a, 0x90, 0x00], 'application/zip'), 'document');
  assert.equal(renamed.ok, false);
});

test('Layer 2: a MIME type that disagrees with the extension is rejected', async () => {
  const result = await validateUpload(fakeFile('logo.png', PNG, 'application/pdf'), 'image');
  assert.equal(result.ok, false);
});

test('oversize files are rejected', async () => {
  // Past the decode guard, where a browser is likelier to die decoding than to produce a
  // picture. A 99 MB photo is inside it now: it will be re-encoded to a few megabytes.
  const runaway = fakeFile('logo.png', PNG, 'image/png');
  runaway.size = 200 * 1024 * 1024;
  assert.equal((await validateUpload(runaway, 'image')).ok, false);
  const ordinary = fakeFile('logo.png', PNG, 'image/png');
  ordinary.size = 99 * 1024 * 1024;
  assert.equal((await validateUpload(ordinary, 'image')).ok, true);
  // A document is stored as it arrives, so its cap is a real one and much smaller.
  const paper = fakeFile('scope.zip', ZIP, 'application/zip');
  paper.size = 30 * 1024 * 1024;
  assert.equal((await validateUpload(paper, 'document')).ok, false);
});

test('a re-encoding policy takes what a storing one will not', async () => {
  // The icon is drawn to a 192px tile before anything is uploaded, so the source file’s weight
  // decides nothing. The same is now true of any still photo, which is why `image` agrees.
  const photo = fakeFile('logo.png', PNG, 'image/png');
  photo.size = 30 * 1024 * 1024;
  assert.equal((await validateUpload(photo, 'workspaceicon')).ok, true);
  assert.equal((await validateUpload(photo, 'image')).ok, true);
  assert.equal((await validateUpload(photo, 'document')).ok, false, 'a document is stored as it arrives');
  const runaway = fakeFile('logo.png', PNG, 'image/png');
  runaway.size = 200 * 1024 * 1024;
  assert.equal((await validateUpload(runaway, 'workspaceicon')).ok, false);
});

test('the workspace file field is uncapped, and that is deliberate', async () => {
  // `fieldfile` is what src/workspace/file-field.js validates a File field against, and it sets
  // max to Infinity on purpose. The only ceiling left is Supabase's project-wide Global file size
  // limit, which lives in the dashboard; quest-job-files has file_size_limit = NULL so the bucket
  // adds none. If someone later puts a number here, this test is the thing that should stop them.
  assert.equal(UPLOAD_POLICIES.fieldfile.max, Infinity);

  // A size nothing else in this file would let through: 2 GB, four times the old 25 MB cap.
  const plans = fakeFile('site-plans.pdf', PDF, 'application/pdf');
  plans.size = 2 * 1024 * 1024 * 1024;
  assert.equal((await validateUpload(plans, 'fieldfile')).ok, true, 'a 2 GB file is not refused by the app');

  // It is the SIZE cap that is gone, not the other two layers. A 2 GB file with a dangerous
  // extension is still refused, and so is one whose bytes are not what its name claims.
  assert.equal((await validateUpload(fakeFile('invoice.pdf.exe', PDF, 'application/pdf'), 'fieldfile')).ok, false);
  const disguised = fakeFile('plans.pdf', ZIP, 'application/pdf');
  disguised.size = 2 * 1024 * 1024 * 1024;
  assert.equal((await validateUpload(disguised, 'fieldfile')).ok, false, 'ZIP bytes named .pdf are still caught');
  assert.equal((await validateUpload(fakeFile('plans.exe', PDF, 'application/pdf'), 'fieldfile')).ok, false);

  // The type list is `document`'s, unchanged, so the File field never quietly became a free-for-all.
  assert.deepEqual(UPLOAD_POLICIES.fieldfile.exts, UPLOAD_POLICIES.document.exts);
  assert.equal((await validateUpload(fakeFile('page.php', PDF, 'text/plain'), 'fieldfile')).ok, false);

  // `document` itself is untouched, so the Files module, job files, message attachments and the
  // client portal all keep the cap they had.
  assert.equal(UPLOAD_POLICIES.document.max, 25 * 1024 * 1024);
});

test('the workspace icon policy keeps every content check the image policy applies', async () => {
  const disguised = await validateUpload(fakeFile('logo.png', ZIP, 'image/png'), 'workspaceicon');
  assert.equal(disguised.ok, false);
  const executable = await validateUpload(fakeFile('logo.png.exe', PNG), 'workspaceicon');
  assert.equal(executable.ok, false);
});

test('Layer 1: accept attribute advertises the policy extensions and MIME types', () => {
  const accept = acceptAttr('image');
  assert.match(accept, /\.png/);
  assert.match(accept, /image\/png/);
  assert.doesNotMatch(accept, /\.exe/);
});
