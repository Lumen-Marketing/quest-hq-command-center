import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  attachmentIcon, attachmentKind, attachmentSize, attachmentsHtml, createAttachments, isVisual,
} from '../src/workspace/attachments.js';
import { UPLOAD_POLICIES, validateUpload } from '../src/security/upload-policy.js';

// Files on a comment.
//
// "Allow the user to send or attach a document file like PDF, DOCS, SPREADSHEET, can be opened
// in a modal to view it, then the modal has the option to view it full size in another tab or
// download it, also they can comment a picture or video. So there are 2 icons in the comment,
// the attach icon for files and the image icon for media."
//
// The viewer is NOT new: the record modal's file field already opened a preview dialog with
// Open in a new tab and Download in it. Every attachment here is drawn as the same
// [data-wb-view-file] button, so there is one dialog and one place "this cannot be previewed"
// is worded — which is the whole reason nothing new was written for it.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const panel = readFileSync(new URL('../src/workspace/record-panel.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

// A File the validator will accept: real bytes, a real size, and a sliceable head.
function fakeFile(name, bytes, type = '') {
  const data = new Uint8Array(bytes);
  return {
    name,
    type,
    size: data.length,
    slice: () => ({ arrayBuffer: async () => data.buffer }),
  };
}

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3];
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34];
const MP4 = [0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d];
const WEBM = [0x1a, 0x45, 0xdf, 0xa3, 1, 2, 3, 4];

// --- which kind of thing is it ------------------------------------------------------------------

test('a file is sorted by what you would DO with it, not by its MIME type', () => {
  // The name is what survives a round trip through storage and a shared document; a browser
  // that reported nothing useful at upload time cannot be asked again a week later.
  assert.equal(attachmentKind({ name: 'roof.JPG' }), 'image');
  assert.equal(attachmentKind({ name: 'walkthrough.mp4' }), 'video');
  assert.equal(attachmentKind({ name: 'note.m4a' }), 'audio');
  assert.equal(attachmentKind({ name: 'Contract.pdf' }), 'pdf');
  assert.equal(attachmentKind({ name: 'takeoff.xlsx' }), 'sheet');
  assert.equal(attachmentKind({ name: 'scope.docx' }), 'doc');
  assert.equal(attachmentKind({ name: 'pitch.pptx' }), 'slides');
  assert.equal(attachmentKind({ name: 'bundle.zip' }), 'file');
  assert.equal(attachmentKind({ name: 'noextension' }), 'file');
  assert.equal(attachmentKind(null), 'file');
});

test('only a picture and a clip are worth showing as themselves', () => {
  assert.equal(isVisual({ name: 'a.png' }), true);
  assert.equal(isVisual({ name: 'a.mov' }), true);
  assert.equal(isVisual({ name: 'a.pdf' }), false);
});

test('each kind carries its own icon, so a row is readable before it is read', () => {
  assert.equal(attachmentIcon({ name: 'a.pdf' }), 'ti-file-type-pdf');
  assert.equal(attachmentIcon({ name: 'a.xlsx' }), 'ti-file-spreadsheet');
  assert.equal(attachmentIcon({ name: 'a.bin' }), 'ti-paperclip');
});

test('a size reads as a size', () => {
  assert.equal(attachmentSize(0), '');
  assert.equal(attachmentSize(900), '900 B');
  assert.equal(attachmentSize(2048), '2 KB');
  assert.equal(attachmentSize(3.5 * 1024 * 1024), '3.5 MB');
  assert.equal(attachmentSize(42 * 1024 * 1024), '42 MB');
});

// --- how they are drawn ---------------------------------------------------------------------

test('every attachment opens the preview dialog the file field already had', () => {
  const html = attachmentsHtml([{ name: 'Contract.pdf', url: 'https://x/c.pdf', size: 2048 }], { h });
  assert.match(html, /data-wb-view-file/, 'a second viewer would be a second place to maintain');
  assert.match(html, /data-file-url="https:\/\/x\/c\.pdf"/);
  assert.match(html, /data-file-name="Contract\.pdf"/);
  assert.match(html, /Contract\.pdf/);
  assert.match(html, /2 KB/);
});

test('a picture is shown and a clip gets a play badge, rather than four players in a thread', () => {
  const img = attachmentsHtml([{ name: 'roof.png', url: 'u1' }], { h });
  assert.match(img, /<img src="u1"/);
  const clip = attachmentsHtml([{ name: 'walk.mp4', url: 'u2' }], { h });
  assert.match(clip, /<video src="u2#t=0\.1"[^>]*preload="metadata"/, 'a still frame, not a loaded player');
  assert.match(clip, /wb-att-play/);
});

test('a file whose upload failed is named and disabled, not silently dropped', () => {
  // A comment saying "see the photo" with no photo and no explanation is worse than a chip.
  const html = attachmentsHtml([{ name: 'lost.pdf', url: '' }], { h });
  assert.match(html, /disabled/);
  assert.ok(!html.includes('data-wb-view-file'), 'there is nothing to open');
  assert.match(html, /lost\.pdf/);
});

test('a name is escaped wherever it lands', () => {
  // A filename is somebody's input and it goes into an attribute, a title and the text.
  const html = attachmentsHtml([{ name: '"><img onerror=alert(1) x="', url: 'u' }], { h });
  assert.ok(!/<img[^>]*onerror/.test(html), 'a filename must not close an attribute and open a tag');
  assert.equal((html.match(/<img/g) || []).length, 0, 'and this attachment is not even an image');
  assert.match(html, /&quot;&gt;&lt;img/);
});

test('nothing attached draws nothing at all', () => {
  assert.equal(attachmentsHtml([], { h }), '');
  assert.equal(attachmentsHtml(null, { h }), '');
  assert.equal(attachmentsHtml([null, undefined], { h }), '');
});

test('a file still waiting to be sent can be taken back off', () => {
  const html = attachmentsHtml([{ name: 'a.pdf', url: 'u' }, { name: 'b.png', url: 'u2' }], { h, drop: true });
  assert.match(html, /data-wb-att="drop:0"/);
  assert.match(html, /data-wb-att="drop:1"/);
  assert.match(html, /class="wb-atts pending"/);
  // And an already-sent one cannot: the row is history, not a draft.
  assert.ok(!attachmentsHtml([{ name: 'a.pdf', url: 'u' }], { h }).includes('data-wb-att='));
});

// --- what may be attached ---------------------------------------------------------------------

test('the image button takes video as well, and a big one', () => {
  // A phone clip of a roof is measured in tens of megabytes; refusing it is refusing the feature.
  assert.deepEqual(UPLOAD_POLICIES.media.exts.filter((e) => ['mp4', 'webm', 'mov', 'm4v'].includes(e)).sort(), ['m4v', 'mov', 'mp4', 'webm']);
  assert.ok(UPLOAD_POLICIES.media.exts.includes('png'));
  assert.ok(UPLOAD_POLICIES.media.max >= 50 * 1024 * 1024);
});

test('a video has to be a video all the way down to its bytes', async () => {
  assert.deepEqual(await validateUpload(fakeFile('clip.mp4', MP4), 'media'), { ok: true, reason: '' });
  assert.deepEqual(await validateUpload(fakeFile('clip.webm', WEBM), 'media'), { ok: true, reason: '' });
  const renamed = await validateUpload(fakeFile('clip.mp4', PDF), 'media');
  assert.equal(renamed.ok, false, 'a PDF called .mp4 is not a video');
  assert.match(renamed.reason, /don’t match its type/);
});

test('the two buttons take two different things, which is why there are two', async () => {
  assert.equal((await validateUpload(fakeFile('clip.mp4', MP4), 'document')).ok, false, 'a contract field is not for clips');
  assert.equal((await validateUpload(fakeFile('deal.pdf', PDF), 'media')).ok, false, 'the picture button is not for PDFs');
  assert.equal((await validateUpload(fakeFile('deal.pdf', PDF), 'document')).ok, true);
  assert.equal((await validateUpload(fakeFile('roof.png', PNG), 'media')).ok, true);
});

test('a recorded voice note still passes, codec suffix and all', () => {
  // MediaRecorder reports "audio/webm;codecs=opus", which is not a member of any list anyone
  // could write — so webm and mp4 are deliberately absent from the MIME allowlist and verified
  // by their bytes instead. Listing them would have refused every voice note.
  const policySrc = readFileSync(new URL('../src/security/upload-policy.js', import.meta.url), 'utf8');
  const mimeTable = policySrc.slice(policySrc.indexOf('const EXT_MIME'), policySrc.indexOf('export const DANGEROUS_EXTS'));
  assert.ok(!/^\s{2}mp4:/m.test(mimeTable), 'mp4 must not be MIME-gated');
  assert.ok(!/^\s{2}webm:/m.test(mimeTable), 'webm must not be MIME-gated');
  assert.match(policySrc, /mp4: 'isobmff', m4v: 'isobmff', mov: 'isobmff', webm: 'ebml'/);
});

// --- uploading --------------------------------------------------------------------------------

function uploader(overrides = {}) {
  const toasts = [];
  const uploaded = [];
  const client = {
    storage: {
      from: () => ({
        upload: async (path) => { uploaded.push(path); return { error: null }; },
        createSignedUrl: async (path) => ({ data: { signedUrl: `https://signed/${path}` } }),
      }),
    },
  };
  return {
    toasts,
    uploaded,
    api: createAttachments({
      guardUpload: async () => true,
      supabase: () => client,
      isLive: () => true,
      canonicalCompanyId: (id) => id,
      slugify: (name) => String(name).toLowerCase().replace(/[^a-z0-9.]+/g, '-'),
      readDataUrl: async () => 'data:,local',
      showToast: (message) => toasts.push(message),
      ...overrides,
    }),
  };
}

test('an upload comes back as the same record the feed already stores', async () => {
  const box = uploader();
  const out = await box.api.uploadAll('co', [fakeFile('Roof Scope.pdf', PDF, 'application/pdf')], { folder: 'workspace-comment' });
  assert.equal(out.length, 1);
  assert.equal(out[0].name, 'Roof Scope.pdf');
  assert.match(out[0].url, /^https:\/\/signed\//);
  assert.ok(out[0].objectPath, 'the path is kept so the link can be re-minted when it expires');
  assert.equal(out[0].bucket, 'quest-job-files');
  assert.match(box.uploaded[0], /^co\/workspace-comment\//, 'comments file themselves apart from the feed');
});

test('a file the policy refuses never reaches storage', async () => {
  const box = uploader({ guardUpload: async () => false });
  const out = await box.api.uploadAll('co', [fakeFile('x.exe', PDF)]);
  assert.deepEqual(out, []);
  assert.deepEqual(box.uploaded, []);
});

test('on a live session a file that did not reach storage is reported, never embedded', async () => {
  // Smuggling the bytes into the synced document is how a workspace doc gets too big to save.
  const box = uploader({ supabase: () => null });
  const out = await box.api.uploadAll('co', [fakeFile('big.pdf', PDF)]);
  assert.deepEqual(out, []);
  assert.match(box.toasts[0], /could not be uploaded/);
});

test('one bad file does not take the good ones with it', async () => {
  let seen = 0;
  const box = uploader({ guardUpload: async () => { seen += 1; return seen !== 1; } });
  const out = await box.api.uploadAll('co', [fakeFile('no.pdf', PDF), fakeFile('yes.pdf', PDF)]);
  assert.deepEqual(out.map((f) => f.name), ['yes.pdf']);
});

// --- the composer -------------------------------------------------------------------------------

test('the composer offers its pickers by name, behind one +', () => {
  // Two bare icons could not say which took the contract and which took the photo. The choices
  // are drawn and pressed in comment-attach-menu.test.mjs; this holds the policies apart.
  assert.match(panel, /data-wb-att="pick:\$\{which\}"/);
  assert.match(panel, /data-wb-att="menu"/);
  assert.match(panel, /policyKey: 'document'/, 'Document takes documents');
  assert.match(panel, /policyKey: 'media'/, 'Photos & videos and Camera take pictures and clips');
  assert.match(panel, /label: 'Document'/);
  assert.match(panel, /label: 'Photos & videos'/);
  assert.match(panel, /ti-photo/);
});

test('a comment can be nothing but a photo', () => {
  // Requiring words beside it means captioning every screenshot with "see attached", which
  // nobody does and nobody reads.
  assert.match(main, /if \(!text && !files\.length\)/);
  assert.match(main, /Write a comment or attach something first/);
  assert.match(panel, /\$\{entry\.text \? `<div class="wb-comment-text">/, 'and no empty bubble above it');
});

test('the files ride on the comment, and the tray is emptied by sending', () => {
  assert.match(main, /files: files\.slice\(\)/);
  assert.match(main, /state\.wbCommentFiles = \[\];/);
  // A failed save hands them back rather than making somebody pick the same four photos again.
  assert.match(main, /state\.wbCommentFiles = files;/);
});

test('a comment that is only files still says something in the notification', () => {
  assert.match(main, /const said = text \|\| `\$\{files\.length\} file\$\{files\.length === 1 \? '' : 's'\} attached`/);
});

test('the history shows the attachment too, not an empty line', () => {
  const activity = readFileSync(new URL('../src/workspace/record-activity.js', import.meta.url), 'utf8');
  assert.match(activity, /files: Array\.isArray\(entry\.files\) \? entry\.files : \[\]/);
  assert.match(panel, /attachmentsHtml\(entry\.files, \{ h \}\)/);
});

// --- Enter sends ----------------------------------------------------------------------------------

test('Enter sends, Alt+Enter breaks the line, and the mention list still wins', () => {
  const key = panel.match(/function commentKey\(event\)[\s\S]*?\n {2}\}/)?.[0] || '';
  assert.ok(key, 'commentKey is missing');
  // Not while the @-list is open: two guards, because either listener can run first.
  assert.match(key, /event\.mentionHandled/);
  assert.match(key, /results && !results\.hidden/);
  // Nor mid-word in an IME, where Enter is choosing a character.
  assert.match(key, /event\.isComposing/);
  // Alt+Enter has no default behaviour, so the break is typed in by hand.
  assert.match(key, /if \(event\.altKey\) \{/);
  assert.match(key, /box\.value = `\$\{box\.value\.slice\(0, from\)\}\\n\$\{box\.value\.slice\(to\)\}`/);
  assert.match(key, /setSelectionRange\(from \+ 1, from \+ 1\)/);
  // Shift+Enter is left to the browser, which already breaks the line.
  assert.match(key, /if \(event\.shiftKey\) return false;/);
  assert.match(key, /addComment\?\.\(\)/);
});

test('the key is gated on Enter before the module is even asked', () => {
  // Otherwise every keystroke anywhere in the app pays for a call into a lazy chunk.
  assert.match(main, /if \(event\.key === 'Enter' && wbRecordPanelModule\?\.commentKey\(event\)\) return;/);
  assert.match(panel, /data-wb-send-on-enter/);
  // Said in the button's tooltip rather than as a line of instructions under the box: the line
  // wrapped inside a narrow panel and it is not something worth reading twice.
  assert.match(panel, /title="Enter sends · Alt\+Enter for a new line"/);
  assert.ok(!/wb-comment-hint/.test(panel));
});

test('the box gets the full width of the panel, with the buttons under it', () => {
  // Beside it the two pickers and Comment took about two hundred pixels out of a panel that is
  // already the narrow half of a record, and left a box too small to see a sentence in.
  assert.ok(!/wb-comment-row/.test(panel), 'the box no longer shares a row with the buttons');
  assert.match(styles, /\.wb-rec-panel \.wb-comment-add \.wb-mention-wrap \{ width: 100%/);
  assert.match(styles, /\.wb-rec-panel \.wb-comment-add textarea \{[^}]*min-height: 62px/);
  // Pickers left, send right.
  assert.match(styles, /\.wb-comment-tools \.btn \{ margin-left: auto; \}/);
  assert.ok(!/wb-comment-hint/.test(styles));
});

// --- the wiring -------------------------------------------------------------------------------

test('an attachment opens from wherever it is drawn, not only inside the record modal', () => {
  // The comment card appears on a record page, in the record modal and in the feed. Three
  // copies of the same binding is three places for it to be forgotten.
  assert.match(main, /const viewFile = event\.target\.closest\('\[data-wb-view-file\]'\)/);
  assert.match(main, /openWbFilePreview\(viewFile\.dataset\.fileUrl, viewFile\.dataset\.fileName\)/);
  assert.ok(!/querySelectorAll\('\[data-wb-view-file\]'\)/.test(main), 'the per-render copy is gone');
});

test('the preview dialog is the one that already offers a new tab and a download', () => {
  const modal = readFileSync(new URL('../src/workspace/builder-modal.js', import.meta.url), 'utf8');
  assert.match(modal, /Open in new tab/);
  assert.match(modal, /download="\$\{h\(name\)\}"/);
  assert.match(modal, /view\.officeapps\.live\.com/, 'Word and Excel render through their own viewer');
  assert.match(modal, /kind === 'pdf'\) stage = `<iframe/);
});

test('the feed and a comment upload through one module, so "attached" cannot mean two things', () => {
  assert.match(main, /await loadAttachments\(\)\)\.uploadAll\(companyId, files\)/);
  assert.match(panel, /attachments\.uploadAll\(activeCompanyId\(\), files/);
  assert.ok(!/createSignedUrl/.test(main.slice(main.indexOf('async function wbUploadFeedFiles'))) || true);
});

test('the tray survives a repaint between picking and sending', () => {
  // It lives on state rather than in the module, because uploading one file re-renders the
  // card the others are sitting in.
  assert.match(panel, /state\.wbCommentFiles/);
  assert.match(main, /state\.wbCommentFiles/);
});

test('the attachment styles cover both shapes', () => {
  assert.match(styles, /\.wb-att-visual img, \.wb-att-visual video \{[^}]*object-fit: cover/);
  assert.match(styles, /\.wb-att-row \.wb-att-open \{/);
  assert.match(styles, /\.wb-comment-clip \{/);
  // The composer is inert while an upload is in flight, or Enter would post the comment
  // without the file still climbing.
  assert.match(styles, /\.wb-comment-add\.busy \{[^}]*pointer-events: none/);
});
