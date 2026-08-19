// The File and Image field's uploader: the drop zone, the thumbnails, the progress bar, and
// what happens to the bytes.
//
// Moved out of main.js and fetched on demand. Nothing that paints before a field EDITOR is on
// screen needs any of it -- a table, a card and a read-only record all draw a stored file
// without it -- and the entry chunk had run out of room to keep carrying it.
//
// The body is unchanged from where it lived; what is new is that its dependencies arrive
// through ctx instead of being reached for. tests/file-field-extraction.test.mjs checks that
// every main.js name this file uses is one of them, because a missed one is a ReferenceError
// nobody sees until they try to attach something.

import { contentTypeFor } from '../security/upload-policy.js';

export function createFileField(ctx) {
  const {
    activeCompanyId, canonicalCompanyId, createSupabaseClient, fileTypeKind, guardUpload, h,
    isLiveSupabaseSession, showToast, shrinkUpload, slugify, wbFileIcon, wbFileValue,
    wbFileValues, wbMirrorFileToDrive, wbReadFileAsDataUrl, wbShowImages,
  } = ctx;

  function mountFileFields(overlay) {
    overlay.querySelectorAll('[data-wb-file]').forEach((zone) => {
      if (zone.dataset.bound) return;
      zone.dataset.bound = '1';
      const hidden = zone.querySelector('input[data-f]');
      const fileInput = zone.querySelector('[data-wb-file-input]');
      const openBtn = zone.querySelector('[data-wb-file-open]');
      const actions = zone.querySelector('[data-wb-file-actions]');
      const viewBtn = zone.querySelector('[data-wb-file-view]');
      const downloadBtn = zone.querySelector('[data-wb-file-download]');
      const removeBtn = zone.querySelector('[data-wb-file-remove]');
      const progress = zone.querySelector('[data-wb-file-progress]');
      const bar = zone.querySelector('[data-wb-file-bar]');
      const ico = zone.querySelector('[data-wb-file-ico]');
      const label = zone.querySelector('[data-wb-file-label]');
      const isImage = zone.hasAttribute('data-wb-image');
      const preview = zone.querySelector('[data-wb-img-preview]');
      const multi = zone.hasAttribute('data-wb-file-multi');
      // Company Contacts renders this same field, so the zone carries whose it is rather than
      // the uploader assuming an App Builder record is open behind it.
      const scope = zone.dataset.wbFileScope || 'Workspaces';
      const driveLabels = zone.dataset.wbFileDrive ? JSON.parse(zone.dataset.wbFileDrive) : null;
      // "Uploads to this workspace" is a lie on a contact, which every workspace shares.
      const hint = zone.dataset.wbFileHint || 'Uploads to this workspace';
      const list = zone.querySelector('[data-wb-file-list]');
      const readAll = () => wbFileValues(hidden.value);
      const writeAll = (files) => {
        // One file still stores as one object, so switching a field to multiple and back does
        // not rewrite records that only ever had one.
        hidden.value = files.length ? JSON.stringify(files.length === 1 && !multi ? files[0] : files) : '';
        hidden.dispatchEvent(new Event('input', { bubbles: true }));
        paint();
      };
      const paintList = () => {
        const files = readAll();
        label.innerHTML = files.length
          ? `<strong>Add another</strong><small>${files.length} attached</small>`
          : '<strong>Click or drop files</strong><small>Several at once is fine</small>';
        openBtn.classList.toggle('has-file', files.length > 0);
        // A photo is its own label. Showing a generic file glyph beside eight filenames is the
        // one arrangement that makes a gallery harder to read than a single picture was.
        // Which photo of the gallery each row is, skipping rows whose upload left no picture --
        // the viewer steps through what can be seen, so it must be numbered the same way.
        const shots = files.filter((one) => one.url);
        list.innerHTML = files.map((fv, i) => `<li class="wb-file-row">
        ${isImage && fv.url
    ? `<img class="wb-img-thumb" src="${h(fv.url)}" alt="${h(fv.name || 'photo')}" loading="lazy" data-wb-img-open="${shots.indexOf(fv)}" title="View ${h(fv.name || 'photo')}">`
    : `<i class="ti ${h(wbFileIcon(fileTypeKind({ file_name: fv.name })))}" aria-hidden="true"></i>`}
        <span class="wb-file-row-name" title="${h(fv.name)}">${h(fv.name)}</span>
        ${fv.url ? `<a class="btn btn-mini" href="${h(fv.url)}" target="_blank" rel="noreferrer" title="View"><i class="ti ti-eye"></i></a>` : ''}
        <button type="button" class="btn btn-mini danger" data-wb-file-drop-one="${i}" title="Remove ${h(fv.name)}" aria-label="Remove ${h(fv.name)}"><i class="ti ti-x"></i></button>
      </li>`).join('');
        list.querySelectorAll('[data-wb-file-drop-one]').forEach((btn) => {
          btn.onclick = () => writeAll(readAll().filter((_, i) => i !== Number(btn.dataset.wbFileDropOne)));
        });
        // The thumbnail is the way in to the photo. Without this the only way to see a picture
        // full size while the field was open was the eye button beside it, which opens a raw tab
        // and leaves the record -- and on a phone that is a trip you do not come back from.
        list.querySelectorAll('[data-wb-img-open]').forEach((thumb) => {
          thumb.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            wbShowImages(readAll().filter((one) => one.url), Number(thumb.dataset.wbImgOpen) || 0);
          };
        });
      };
      const paint = () => {
        if (multi) { paintList(); return; }
        const fv = wbFileValue(hidden.value);
        if (fv) {
          if (isImage && preview) preview.innerHTML = fv.url ? `<img src="${h(fv.url)}" alt="${h(fv.name || 'image')}">` : '<i class="ti ti-photo"></i>';
          else if (ico) ico.className = 'ti ti-file-check';
          label.innerHTML = `<strong>${h(fv.name || (isImage ? 'Image' : 'Attached file'))}</strong><small>Click to replace</small>`;
          openBtn.classList.add('has-file');
          if (fv.url) {
            actions.hidden = false;
            viewBtn.hidden = false; viewBtn.href = fv.url;
            if (downloadBtn) { downloadBtn.hidden = false; downloadBtn.href = fv.url; downloadBtn.setAttribute('download', fv.name || 'file'); }
          } else {
            actions.hidden = false;
            viewBtn.hidden = true; if (downloadBtn) downloadBtn.hidden = true;
          }
        } else {
          if (isImage && preview) preview.innerHTML = '<i class="ti ti-photo"></i>';
          else if (ico) ico.className = 'ti ti-cloud-upload';
          label.innerHTML = isImage ? '<strong>Click or drop an image</strong><small>Shown as a circular avatar</small>' : `<strong>Click or drop a file</strong><small>${h(hint)}</small>`;
          openBtn.classList.remove('has-file');
          actions.hidden = true;
        }
      };
      // On a single-photo field, View opens the viewer rather than a raw tab. The dialog carries
      // Open in a new tab and Download on it, so nothing is lost -- and looking at the photo you
      // just attached should not mean leaving the record you attached it to.
      if (isImage && viewBtn) {
        viewBtn.onclick = (event) => {
          const fv = wbFileValue(hidden.value);
          if (!fv || !fv.url) return;
          event.preventDefault();
          event.stopPropagation();
          wbShowImages([fv], 0);
        };
      }
      const upload = async (rawFile) => {
        if (!rawFile) return;
        const photo = /.(png|jpe?g|webp)$/i.test(rawFile.name || '');
        if (!(await guardUpload(rawFile, photo || isImage ? 'image' : 'document', scope))) return;
        const file = photo ? await shrinkUpload(rawFile) : rawFile;
        openBtn.disabled = true;
        progress.hidden = false;
        bar.style.width = '20%';
        const companyId = activeCompanyId();
        const client = createSupabaseClient();
        const live = isLiveSupabaseSession();
        let url = '';
        let objectPath = '';
        let uploadError = null;
        if (client) {
          try {
            const path = `${canonicalCompanyId(companyId)}/workspace/${crypto.randomUUID()}-${slugify(file.name)}`;
            const up = await client.storage.from('quest-job-files').upload(path, file, { cacheControl: '3600', contentType: contentTypeFor(file) });
            bar.style.width = '70%';
            if (!up.error) {
              objectPath = path;
              // Short-lived signed URL for immediate viewing. We persist object_path
              // (below) so links can be re-minted on demand instead of storing a
              // year-long bearer token inside the shared workspace doc.
              const signed = await client.storage.from('quest-job-files').createSignedUrl(path, 604800);
              if (signed.data?.signedUrl) url = signed.data.signedUrl;
            } else { uploadError = up.error; }
          } catch (error) { uploadError = error; console.warn('Workspace file upload failed', error); }
        }
        const stop = () => { openBtn.disabled = false; progress.hidden = true; bar.style.width = '0%'; };
        // On a live session, never embed file bytes into the synced doc and never
        // present an un-stored file as attached — surface the failure and stop.
        if (live && !objectPath) {
          stop();
          showToast(uploadError?.message || 'Upload failed — the file was not attached. Please try again.', 'error', 'Upload failed');
          return;
        }
        // Local/demo only: embed a small data URL for preview. This never syncs to
        // the shared server doc; cap size to protect localStorage.
        if (!url && !live && file.size <= 2 * 1024 * 1024) { bar.style.width = '85%'; url = await wbReadFileAsDataUrl(file); }
        if (!url && !objectPath) {
          stop();
          showToast('File is too large to attach here — link it by URL instead.', 'error', scope);
          return;
        }
        bar.style.width = '100%';
        const attached = { name: file.name, url, path: objectPath };
        // Appended, not assigned: dropping three files at once must end with three, and each
        // upload finishes on its own schedule.
        if (multi) writeAll([...readAll(), attached]);
        else {
          hidden.value = JSON.stringify(attached);
          hidden.dispatchEvent(new Event('input', { bubbles: true }));
          paint();
        }
        openBtn.disabled = false;
        setTimeout(() => { progress.hidden = true; bar.style.width = '0%'; }, 400);
        // Mirror the upload into Company Drive under App > (App) > (Field).
        const mirrored = objectPath ? wbMirrorFileToDrive(file, objectPath, companyId, hidden.getAttribute('data-f'), driveLabels) : '';
        showToast(mirrored ? `File attached and saved to Company Drive → ${mirrored}.` : 'File attached.', live ? 'live' : 'local', scope);
      };
      // One at a time rather than in parallel: each upload owns the progress bar, and three
      // racing each other drive it backwards.
      const uploadAll = async (files) => {
        const picked = [...(files || [])];
        for (const file of (multi ? picked : picked.slice(0, 1))) await upload(file);
      };
      openBtn.onclick = () => fileInput.click();
      if (removeBtn) removeBtn.onclick = () => { hidden.value = ''; hidden.dispatchEvent(new Event('input', { bubbles: true })); fileInput.value = ''; paint(); };
      fileInput.onchange = () => { uploadAll(fileInput.files); fileInput.value = ''; };
      zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragging'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
      zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('dragging'); uploadAll(e.dataTransfer?.files); });
      paint();
    });
  }

  return { mountFileFields };
}
