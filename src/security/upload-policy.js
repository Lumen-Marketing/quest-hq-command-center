// Shared file-upload security policy — "Abe's" 3-layer defense.
//
//   Layer 1  the file picker's `accept` attribute (acceptAttr) — a UX nicety,
//            trivially bypassed with DevTools, so it is never trusted alone.
//   Layer 2  extension + MIME allowlist — if it merely *looks* wrong on the
//            surface (wrong type/extension), drop it instantly.
//   Layer 3  magic-byte inspection — read the real bytes and confirm the
//            signature matches the claimed type. The binary data never lies,
//            so `malware.zip` renamed to `photo.jpg` is caught here.
//
// This is the CLIENT gate (and defense-in-depth). The non-bypassable backstops
// live in the Supabase bucket config (allowed_mime_types / file_size_limit) and
// the api/ endpoints — see supabase/migrations and api/_lib.

const KB = 1024;
const MB = 1024 * KB;

// Byte signatures per logical type. Each entry lists acceptable signatures; a
// signature may be anchored at an `offset` (default 0). WEBP requires BOTH the
// RIFF prefix and the WEBP tag at offset 8.
export const FILE_SIGNATURES = {
  png: [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  jpeg: [{ bytes: [0xff, 0xd8, 0xff] }],
  gif: [{ bytes: [0x47, 0x49, 0x46, 0x38] }],
  webp: [{ bytes: [0x52, 0x49, 0x46, 0x46] }, { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }],
  pdf: [{ bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }],
  zip: [{ bytes: [0x50, 0x4b, 0x03, 0x04] }, { bytes: [0x50, 0x4b, 0x05, 0x06] }, { bytes: [0x50, 0x4b, 0x07, 0x08] }],
  // OLE2 compound file: the container the pre-2007 Office formats use (.doc/.xls/.ppt).
  // Modern .docx/.xlsx/.pptx are zip containers instead and verify against `zip` above.
  ole: [{ bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }],
  // ISO base media: 'ftyp' at offset 4, which is how .mp4, .m4v, .m4a and .mov all begin --
  // including the fragmented mp4 a phone's MediaRecorder writes.
  isobmff: [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }],
  // Matroska / WebM, the container Chrome and Android record into.
  ebml: [{ bytes: [0x1a, 0x45, 0xdf, 0xa3] }],
};

// Which signature an extension must satisfy. `text` types carry no binary
// signature — they are verified as "not binary" instead.
const EXT_SIGNATURE = {
  png: 'png', jpg: 'jpeg', jpeg: 'jpeg', gif: 'gif', webp: 'webp',
  pdf: 'pdf', zip: 'zip', csv: 'text', tsv: 'text', txt: 'text',
  // An .xlsx is a zip container, so it must carry the zip signature. An encrypted workbook
  // is an OLE compound file instead and is rejected here rather than deeper in the parser.
  // The other two modern Office formats are the same container, so they verify the same way.
  xlsx: 'zip', docx: 'zip', pptx: 'zip',
  // The pre-2007 formats are OLE compound files.
  doc: 'ole', xls: 'ole', ppt: 'ole',
  // Video. mp4 and webm are shared with the voice-note policy, and both signatures hold for
  // what a browser's MediaRecorder writes, so verifying them tightens that path too.
  mp4: 'isobmff', m4v: 'isobmff', mov: 'isobmff', webm: 'ebml',
};

// Canonical MIME allowlist per extension (Layer 2 — extension and MIME must
// agree). An empty string tolerates browsers/OSes that report no MIME type.
const EXT_MIME = {
  png: ['image/png'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  gif: ['image/gif'],
  webp: ['image/webp'],
  pdf: ['application/pdf'],
  zip: ['application/zip', 'application/x-zip-compressed', 'application/x-zip', ''],
  csv: ['text/csv', 'text/plain', 'application/vnd.ms-excel', ''],
  tsv: ['text/tab-separated-values', 'text/plain', ''],
  txt: ['text/plain', ''],
  xlsx: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-zip-compressed', 'application/octet-stream', '',
  ],
  // The remaining Office formats. The modern three are zip containers, so Windows and some
  // browsers report them as a zip or as octet-stream rather than the long OOXML type --
  // rejecting those would fail on machines where the file is perfectly valid. The magic-byte
  // layer is what actually decides; this layer only rules out the obviously wrong.
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip', 'application/x-zip-compressed', 'application/octet-stream', '',
  ],
  pptx: [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-zip-compressed', 'application/octet-stream', '',
  ],
  doc: ['application/msword', 'application/octet-stream', ''],
  xls: ['application/vnd.ms-excel', 'application/octet-stream', ''],
  ppt: ['application/vnd.ms-powerpoint', 'application/octet-stream', ''],
  // Only the two video extensions nothing else already accepts. .mp4 and .webm are deliberately
  // absent: a browser recording reports them WITH a codec suffix ("audio/webm;codecs=opus"),
  // which is not a member of any list you could write, so listing them here would refuse every
  // voice note. Their bytes are checked instead, which a codec suffix cannot dress up.
  mov: ['video/quicktime', 'video/mp4', 'application/octet-stream', ''],
  m4v: ['video/x-m4v', 'video/mp4', 'application/octet-stream', ''],
};

/**
 * What a policy that re-encodes before storing allows through the door.
 *
 * Three of the policies below hand the file to a canvas and upload the result: an icon becomes a
 * 192px tile, an avatar a 512px square, and any other still photo is fitted to a few megabytes by
 * src/media/shrink-image.js. For those, the source file's weight decides nothing about what
 * storage receives, so the cap is not a storage limit at all -- it is the point past which the
 * browser is likelier to die decoding than to produce a picture.
 *
 * One number for all three, because they are the same judgement. A policy that stores what it is
 * given keeps a real cap, and those are much smaller.
 */
const DECODE_GUARD = 100 * MB;

// Per-context upload policies: the extension allowlist and a hard size cap.
export const UPLOAD_POLICIES = {
  // A phone camera produces 8-15 MB a shot and a DSLR several times that, so the old 5 MB cap was
  // refusing ordinary photos of a roof. A still photo is now re-encoded to a few megabytes before
  // anything is stored, so this is a decode guard rather than a storage limit.
  //
  // A GIF is deliberately still bound by it: drawing an animated one to a canvas returns its
  // first frame, so it is never re-encoded and its real size is what would reach storage.
  image: { exts: ['png', 'jpg', 'jpeg', 'webp', 'gif'], max: DECODE_GUARD, label: 'image' },
  // Dashboard image tiles upload to Storage, so they allow larger files.
  tileimage: { exts: ['png', 'jpg', 'jpeg', 'webp', 'gif'], max: 25 * MB, label: 'image' },
  // Workspace/company icons are re-encoded to a 192px tile before anything is
  // stored, so the source file's weight is irrelevant — take whatever the camera
  // produced and let the client compress it. The cap is only a decode guard: past
  // this size the browser is likelier to die decoding than to produce an icon.
  workspaceicon: { exts: ['png', 'jpg', 'jpeg', 'webp', 'gif'], max: DECODE_GUARD, label: 'image' },
  // Profile pictures are re-encoded to a 512px square before upload, so the source
  // file's weight is irrelevant here too. Same decode-guard reasoning as above.
  avatarimage: { exts: ['png', 'jpg', 'jpeg', 'webp', 'gif'], max: DECODE_GUARD, label: 'image' },
  // Voice notes recorded in the browser. The container is whatever MediaRecorder chose --
  // webm on Chrome and Android, mp4/m4a on Safari -- so all of them are allowed or the
  // feature silently fails on half the phones on site. 40MB is roughly an hour of Opus,
  // far past any job walk.
  audio: { exts: ['webm', 'm4a', 'mp4', 'ogg', 'oga', 'mp3', 'wav'], max: 40 * MB, label: 'audio' },
  // Office documents and archives belong here: a file field on a record is where a quote
  // workbook, a scope-of-work document, a deck or a bundle of photos actually gets attached.
  // Every one of these still has to clear the extension/MIME agreement AND its magic bytes,
  // so widening the list does not widen what a renamed executable can do.
  document: {
    exts: [
      'pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'txt', 'csv',
      'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip',
    ],
    max: 25 * MB,
    label: 'document',
  },
  // The Workspace App Builder File field, and the same field Company Contacts renders. It takes
  // `document`'s type list unchanged -- an allowed extension, a MIME that agrees with it, and
  // matching magic bytes are all still required -- and carries NO size cap.
  //
  // That is a deliberate instruction rather than an oversight, so the reasoning is recorded here
  // instead of being left to be re-derived: a file field is where a set of plans, a photo set or a
  // walkthrough video actually gets attached, and a cap there refuses the work instead of trimming
  // it. The one ceiling left is not ours to set. `quest-job-files` has file_size_limit = NULL
  // (migration 20260926103000), which storage resolves as "this bucket imposes no limit", so what
  // remains is only the project-wide Global file size limit in the Supabase dashboard. Set that as
  // high as the plan allows.
  //
  // What it gives up, stated plainly: file_size_limit was the only NON-BYPASSABLE cap on size. This
  // bucket also backs Company Drive, job files and message attachments, so those lose that
  // backstop as well -- they keep their own client-side caps, which a caller talking straight to the
  // Storage API has no reason to honour. On a 1 GB Free-plan quota that makes filling the project's
  // disk cheap for one member with `files.manage`, so this is a trade, not a free win.
  fieldfile: {
    exts: [
      'pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'txt', 'csv',
      'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip',
    ],
    max: Infinity,
    label: 'file',
  },
  // What the image/media button on a comment takes: something you look at or play, as opposed
  // to something you open in another program. Bigger than `document` because a phone clip of a
  // roof is measured in tens of megabytes and refusing it is refusing the feature.
  media: {
    exts: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm', 'mov', 'm4v'],
    max: 50 * MB,
    label: 'image or video',
  },
  csv: { exts: ['csv', 'tsv', 'txt'], max: 10 * MB, label: 'spreadsheet' },
  // .xlsx is a zip, so it stays a kind of its own rather than widening 'csv' -- the
  // dangerous-extension backstop should keep treating archives with suspicion by default.
  xlsx: { exts: ['xlsx'], max: 10 * MB, label: 'Excel workbook' },
  backup: { exts: ['zip'], max: 50 * MB, label: 'backup archive' },
  formfile: { exts: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'csv'], max: 15 * MB, label: 'file' },
};

// Extensions that must never be accepted, regardless of context — a backstop in
// case a policy is ever widened by mistake. Includes script/executable and
// active-content types (SVG can carry script → XSS).
export const DANGEROUS_EXTS = new Set([
  'exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'pif', 'sh', 'bash', 'zsh', 'ps1', 'psm1',
  'vbs', 'vbe', 'js', 'mjs', 'cjs', 'jse', 'wsf', 'wsh', 'jar', 'app', 'apk', 'dmg',
  'deb', 'rpm', 'html', 'htm', 'xhtml', 'shtml', 'svg', 'php', 'phtml', 'php3', 'php4',
  'php5', 'asp', 'aspx', 'jsp', 'jspx', 'py', 'rb', 'pl', 'cgi', 'dll', 'so', 'dylib',
  'bin', 'lnk', 'reg', 'hta', 'cpl', 'gadget', 'inf', 'ins', 'msc', 'msp',
]);

export function fileExtension(name) {
  const clean = String(name || '').toLowerCase().trim();
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1) : '';
}

// Catch the double-extension trick (invoice.pdf.exe) by scanning EVERY trailing
// dotted segment, not just the last one.
export function hasDangerousExtension(name) {
  return String(name || '').toLowerCase().split('.').slice(1).some((part) => DANGEROUS_EXTS.has(part.trim()));
}

// Make a storage-safe filename: strip path separators / traversal, collapse odd
// characters, cap length. Never returns an empty string.
export function sanitizeFilename(name) {
  const cleaned = String(name || 'upload')
    .normalize('NFKD')
    .replace(/[\\/]+/g, '-')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 120);
  return cleaned || 'upload';
}

// Layer 1: the `accept` attribute for a given policy (extensions + MIME types).
export function acceptAttr(policyKey) {
  const policy = UPLOAD_POLICIES[policyKey];
  if (!policy) return '';
  const exts = policy.exts.map((ext) => `.${ext}`);
  const mimes = [...new Set(policy.exts.flatMap((ext) => (EXT_MIME[ext] || []).filter(Boolean)))];
  return [...exts, ...mimes].join(',');
}

// The Content-Type to declare when uploading. Prefer the browser's value, but
// fall back to the canonical MIME for the file's extension so it still satisfies
// a bucket's `allowed_mime_types` (never a bare application/octet-stream, which
// a locked-down bucket would reject).
// Types that say "some binary" rather than what the file is. An .xlsx is a zip container, so
// Windows and several browsers report one of these for it -- and Storage's allowed_mime_types
// is checked against whatever we send, so passing that through means the bucket has to allow
// octet-stream for everything, which would make its allowlist meaningless.
const GENERIC_MIMES = new Set(['application/octet-stream', 'application/zip', 'application/x-zip-compressed', 'application/x-zip']);

export function contentTypeFor(file) {
  const declared = String((file && file.type) || '').toLowerCase();
  const canonical = (EXT_MIME[fileExtension(file && file.name)] || []).find(Boolean);
  // The extension's own type wins over a generic one, so a .docx uploads as a Word document
  // rather than as a nameless blob. A real .zip has zip as its canonical type, so it is
  // unaffected -- the swap only ever makes the type MORE specific, never less.
  if (declared && (!GENERIC_MIMES.has(declared) || !canonical || GENERIC_MIMES.has(canonical))) return declared;
  return canonical || declared || 'application/octet-stream';
}

function bytesMatch(head, sig) {
  const at = sig.offset || 0;
  for (let i = 0; i < sig.bytes.length; i += 1) {
    if (head[at + i] !== sig.bytes[i]) return false;
  }
  return true;
}

function looksBinary(head, len) {
  for (let i = 0; i < len; i += 1) if (head[i] === 0) return true; // NUL byte ⇒ not text
  return false;
}

// The full three-layer check for a File. Returns { ok, reason }. Reads only the
// first 512 bytes for the magic-byte (Layer 3) verification.
export async function validateUpload(file, policyKey) {
  const policy = UPLOAD_POLICIES[policyKey];
  if (!policy) return { ok: false, reason: 'No upload policy is configured for this field.' };
  if (!file || typeof file.size !== 'number') return { ok: false, reason: 'No file was selected.' };
  if (file.size <= 0) return { ok: false, reason: 'The file is empty.' };
  if (file.size > policy.max) return { ok: false, reason: `That file is too large — the limit is ${Math.round(policy.max / MB)} MB.` };
  // Backstop: dangerous / double extensions are rejected outright.
  if (hasDangerousExtension(file.name)) return { ok: false, reason: 'That file type is blocked for security reasons.' };
  // Layer 2a: extension allowlist.
  const ext = fileExtension(file.name);
  if (!ext || !policy.exts.includes(ext)) {
    return { ok: false, reason: `Only ${policy.exts.map((e) => e.toUpperCase()).join(', ')} files are allowed here.` };
  }
  // Layer 2b: MIME must agree with the extension (when the browser provides one).
  const mime = String(file.type || '').toLowerCase();
  const allowedMimes = EXT_MIME[ext] || [];
  if (mime && allowedMimes.length && !allowedMimes.includes(mime)) {
    return { ok: false, reason: 'The file’s type does not match its extension.' };
  }
  // Layer 3: the bytes never lie.
  let head;
  try {
    head = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  } catch {
    return { ok: false, reason: 'The file could not be read for validation.' };
  }
  const sigKey = EXT_SIGNATURE[ext];
  if (sigKey === 'text') {
    if (looksBinary(head, Math.min(head.length, 512))) {
      return { ok: false, reason: 'This does not look like a plain text / CSV file.' };
    }
  } else if (sigKey && FILE_SIGNATURES[sigKey]) {
    const sigs = FILE_SIGNATURES[sigKey];
    const matched = sigKey === 'webp' ? sigs.every((s) => bytesMatch(head, s)) : sigs.some((s) => bytesMatch(head, s));
    if (!matched) {
      return { ok: false, reason: 'The file’s contents don’t match its type — it may be renamed or corrupted.' };
    }
  }
  return { ok: true, reason: '' };
}
