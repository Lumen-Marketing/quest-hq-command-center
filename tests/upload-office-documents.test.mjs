import assert from 'node:assert/strict';
import test from 'node:test';
import { UPLOAD_POLICIES, acceptAttr, validateUpload } from '../src/security/upload-policy.js';

// "on the file type fields allow documents file too like excel files word, powerpoint also
// zip files." Widening an upload allowlist is a security change, so it is widened at all
// three layers -- picker, extension/MIME agreement, and magic bytes -- not just the picker.

const ZIP = [0x50, 0x4b, 0x03, 0x04];
const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const MZ = [0x4d, 0x5a, 0x90, 0x00]; // a Windows executable

function file(name, type, bytes) {
  const buf = new Uint8Array(2048);
  buf.set(bytes, 0);
  return {
    name,
    type,
    size: 2048,
    arrayBuffer: async () => buf.buffer,
    slice: (a = 0, b = 2048) => ({ arrayBuffer: async () => buf.slice(a, b).buffer }),
  };
}

test('the document policy takes Office files and archives', () => {
  for (const ext of ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip']) {
    assert.ok(UPLOAD_POLICIES.document.exts.includes(ext), `${ext} is not allowed`);
    assert.ok(acceptAttr('document').includes(`.${ext}`), `${ext} is missing from the picker`);
  }
  // The formats that were already there stay.
  for (const ext of ['pdf', 'png', 'jpg', 'csv', 'txt']) {
    assert.ok(UPLOAD_POLICIES.document.exts.includes(ext), `${ext} was dropped`);
  }
});

test('a real Office file is accepted, whatever the browser calls it', async () => {
  // The modern three are zip containers, so Windows often reports them as a zip or as
  // octet-stream rather than the long OOXML type; rejecting those fails on valid files.
  const ok = [
    ['report.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ZIP],
    ['quote.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ZIP],
    ['deck.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ZIP],
    ['anything.docx', 'application/octet-stream', ZIP],
    ['scope.doc', 'application/msword', OLE],
    ['old.xls', 'application/vnd.ms-excel', OLE],
    ['old.ppt', 'application/vnd.ms-powerpoint', OLE],
    ['photos.zip', 'application/zip', ZIP],
  ];
  for (const [name, type, bytes] of ok) {
    const result = await validateUpload(file(name, type, bytes), 'document');
    assert.equal(result.ok, true, `${name} was rejected: ${result.reason}`);
  }
});

test('the magic-byte layer still decides, so a renamed executable gets nowhere', async () => {
  // This is the whole reason the extension list can be widened safely: the bytes never lie.
  for (const [name, type] of [
    ['malware.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['malware.zip', 'application/zip'],
    ['payload.exe', 'application/octet-stream'],
  ]) {
    const result = await validateUpload(file(name, type, MZ), 'document');
    assert.equal(result.ok, false, `${name} was accepted`);
  }
  // A .docx must be a zip container; an OLE compound file wearing that name is not one.
  const wrongContainer = await validateUpload(file('fake.docx', 'application/octet-stream', OLE), 'document');
  assert.equal(wrongContainer.ok, false);
});

test('an Office file uploads as its own type, not as a nameless blob', async () => {
  // Storage checks allowed_mime_types against whatever we SEND. Windows reports .docx/.xlsx
  // as a zip or as octet-stream, so passing the browser's word through meant the bucket had
  // to allow octet-stream for everything -- which would make its allowlist meaningless.
  const { contentTypeFor } = await import('../src/security/upload-policy.js');
  assert.equal(
    contentTypeFor({ name: 'quote.xlsx', type: 'application/octet-stream' }),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  assert.equal(
    contentTypeFor({ name: 'report.docx', type: 'application/zip' }),
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  );
  // A real archive keeps its own type -- the swap only ever makes the type more specific.
  assert.equal(contentTypeFor({ name: 'photos.zip', type: 'application/zip' }), 'application/zip');
  // A correct, specific type is never second-guessed.
  assert.equal(contentTypeFor({ name: 'plan.pdf', type: 'application/pdf' }), 'application/pdf');
  // No type at all still falls back to the extension's canonical one.
  assert.equal(contentTypeFor({ name: 'notes.txt', type: '' }), 'text/plain');
});
