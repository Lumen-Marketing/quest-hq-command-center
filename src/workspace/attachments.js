// Files hung on a comment or on a feed post: getting them up, and drawing them.
//
// One module for both because they are one thing. The workspace feed could already carry an
// attachment and a comment could not, and the two halves of that -- upload to the shared bucket
// on a live session, embed a small data URL on a local one -- are the same halves either way.
//
// Fetched on demand. Only an open record or the feed composer has anything to attach, and the
// markup for a media grid is not something a session that never opens one should carry.
//
// What is stored on a comment is what the feed already stores on a post:
//   { name, url, objectPath, bucket, size, mime }
// `url` is a signed link good for a week; `objectPath` is what it can be re-minted from, which
// is why the link is never the only thing kept.

import { contentTypeFor } from '../security/upload-policy.js';

/** A week. The same life the file field and the feed give their links. */
const SIGNED_FOR = 604800;

/** Past this, a local/demo session refuses rather than pushing bytes into localStorage. */
const LOCAL_MAX = 2 * 1024 * 1024;

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'm4v']);
const AUDIO_EXTS = new Set(['mp3', 'm4a', 'wav', 'ogg', 'oga']);
const SHEET_EXTS = new Set(['xls', 'xlsx', 'csv', 'tsv']);
const DOC_EXTS = new Set(['doc', 'docx', 'txt', 'rtf']);
const SLIDE_EXTS = new Set(['ppt', 'pptx']);

const extOf = (name) => {
  const clean = String(name || '').toLowerCase();
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1) : '';
};

/**
 * What kind of thing this is, for deciding how to DRAW it.
 *
 * Read off the name rather than the MIME type: the name is what survives a round trip through
 * storage and a shared document, and a browser that reported nothing useful at upload time
 * cannot be asked again later.
 */
export function attachmentKind(file) {
  const ext = extOf(file && file.name);
  if (IMAGE_EXTS.has(ext)) return 'image';
  if (VIDEO_EXTS.has(ext)) return 'video';
  if (AUDIO_EXTS.has(ext)) return 'audio';
  if (ext === 'pdf') return 'pdf';
  if (SHEET_EXTS.has(ext)) return 'sheet';
  if (SLIDE_EXTS.has(ext)) return 'slides';
  if (DOC_EXTS.has(ext)) return 'doc';
  return 'file';
}

/** Whether it is worth showing as itself rather than as a row with a name on it. */
export const isVisual = (file) => ['image', 'video'].includes(attachmentKind(file));

export function attachmentIcon(file) {
  return {
    image: 'ti-photo',
    video: 'ti-video',
    audio: 'ti-music',
    pdf: 'ti-file-type-pdf',
    sheet: 'ti-file-spreadsheet',
    slides: 'ti-presentation',
    doc: 'ti-file-text',
    file: 'ti-paperclip',
  }[attachmentKind(file)];
}

/** A size somebody can read. Rounded hard: nobody needs three decimals of a photo. */
export function attachmentSize(bytes) {
  const n = Number(bytes) || 0;
  if (n <= 0) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

/**
 * The files on one comment.
 *
 * Every tile is a `[data-wb-view-file]`, which is the attribute the record modal already used
 * for a file field -- so opening one goes to the SAME preview dialog, with its own Open in a
 * new tab and Download. A second viewer would be a second place for "this cannot be shown"
 * to be worded differently.
 *
 * @param {Array} files    what is attached
 * @param {object} options { h, drop } -- `drop` adds the remove button a pending file needs
 */
export function attachmentsHtml(files, { h, drop = false } = {}) {
  const list = (Array.isArray(files) ? files : []).filter(Boolean);
  if (!list.length) return '';
  const esc = h || ((v) => String(v ?? ''));
  const tiles = list.map((file, i) => {
    const name = String(file.name || 'File');
    const url = String(file.url || '');
    const kind = attachmentKind(file);
    const size = attachmentSize(file.size);
    // A file whose upload failed has no link. It is still named -- a comment saying "see the
    // photo" with no photo and no explanation is worse than a chip that says it did not arrive.
    const open = url
      ? `data-wb-view-file data-file-url="${esc(url)}" data-file-name="${esc(name)}"`
      : 'disabled title="This file is not available"';
    const remove = drop
      ? `<button type="button" class="wb-att-drop" data-wb-att="drop:${i}" title="Remove ${esc(name)}" aria-label="Remove ${esc(name)}"><i class="ti ti-x"></i></button>`
      : '';
    if (kind === 'image' && url) {
      return `<div class="wb-att wb-att-visual">
        <button type="button" class="wb-att-open" ${open}><img src="${esc(url)}" alt="${esc(name)}" loading="lazy" /></button>
        ${remove}</div>`;
    }
    if (kind === 'video' && url) {
      // A still frame rather than a player: the tile is a doorway to the viewer, and four
      // half-loaded players in a comment thread is what makes a record feel broken.
      return `<div class="wb-att wb-att-visual">
        <button type="button" class="wb-att-open" ${open}>
          <video src="${esc(url)}#t=0.1" preload="metadata" muted playsinline></video>
          <span class="wb-att-play"><i class="ti ti-player-play-filled"></i></span>
        </button>${remove}</div>`;
    }
    return `<div class="wb-att wb-att-row">
      <button type="button" class="wb-att-open" ${open}>
        <i class="ti ${attachmentIcon(file)}" aria-hidden="true"></i>
        <span class="wb-att-name" title="${esc(name)}">${esc(name)}</span>
        ${size ? `<span class="wb-att-size">${esc(size)}</span>` : ''}
      </button>${remove}</div>`;
  }).join('');
  return `<div class="wb-atts${drop ? ' pending' : ''}">${tiles}</div>`;
}

/**
 * Put files up.
 *
 * Lifted out of main.js, where the feed's copy lived, so the comment composer and the feed
 * composer cannot drift apart about what "attached" means -- and so the entry bundle stops
 * carrying an uploader for a thing most sessions never do.
 */
export function createAttachments(ctx) {
  const {
    guardUpload, supabase, isLive, canonicalCompanyId, slugify, readDataUrl, showToast,
  } = ctx;

  /**
   * @param {string} companyId
   * @param {Iterable} files
   * @param {object} options { policyKey, folder, scope } -- which allowlist, where in the
   *        bucket, and whose toast it is
   */
  async function uploadAll(companyId, files, options = {}) {
    const { policyKey = 'document', folder = 'workspace-feed', scope = 'Workspaces' } = options;
    const client = supabase();
    const live = isLive();
    const out = [];
    for (const file of [...(files || [])]) {
      // eslint-disable-next-line no-await-in-loop
      if (!(await guardUpload(file, policyKey, scope))) continue;
      let url = '';
      let objectPath = '';
      if (client) {
        try {
          const path = `${canonicalCompanyId(companyId)}/${folder}/${crypto.randomUUID()}-${slugify(file.name)}`;
          // eslint-disable-next-line no-await-in-loop
          const up = await client.storage.from('quest-job-files').upload(path, file, { cacheControl: '3600', contentType: contentTypeFor(file) });
          if (!up.error) {
            objectPath = path;
            // eslint-disable-next-line no-await-in-loop
            const signed = await client.storage.from('quest-job-files').createSignedUrl(path, SIGNED_FOR);
            if (signed.data?.signedUrl) url = signed.data.signedUrl;
          }
        } catch (error) { console.warn('Attachment upload failed', error); }
      }
      // On a live session the bytes never go into the synced document: a file that did not
      // reach storage is a failure to report, not something to smuggle into the record.
      if (live && !objectPath) { showToast(`"${file.name}" could not be uploaded.`, 'error', scope); continue; }
      // eslint-disable-next-line no-await-in-loop
      if (!url && !live && file.size <= LOCAL_MAX) url = await readDataUrl(file);
      if (!url && !objectPath) { showToast(`"${file.name}" is too large to attach — link it by URL instead.`, 'error', scope); continue; }
      out.push({
        name: file.name, url, objectPath, bucket: 'quest-job-files', size: file.size, mime: contentTypeFor(file),
      });
    }
    return out;
  }

  return { uploadAll };
}
