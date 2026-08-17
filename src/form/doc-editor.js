// The Form field's document builder.
//
// A page you arrange by dragging things onto it, and the preview IS the page: there is no
// settings pane that drives a picture of the result, because that split is what made the older
// proposal builder feel like filling in a form rather than making a document. What is on screen
// is at the millimetre what comes out of the printer.
//
// Fetched on demand -- most records never open one, and none of them should pay for it. Follows
// the Sheet field's arrangement exactly, which is the point: somebody who has opened a sheet
// already knows where the buttons are.
//
// Everything it holds is in doc-model.js, everything it prints is in doc-pdf.js, and everything a
// record's field is worth is in host-values.js. This file is the hands: pointer drags, an
// inspector, a file picker and four export buttons.

import {
  MAX_VERSIONS, MIN_MM, addElement, docFilled, elementText, layerElement, moveElement, normalizeDoc,
  pageMm, removeElement, removeVersion, resizeElement, restoreVersion, saveVersion, setPage,
  styleElement,
} from './doc-model.js';
import { MM_TO_PT, jpegInfo, textWidth, wrapText, writePdf } from './doc-pdf.js';
import { placeableFields, plainFieldText } from './host-values.js';

/** A point in millimetres. Font sizes are chosen in points and drawn in millimetres. */
const PT_TO_MM = 25.4 / 72;

/** How big an uploaded PDF may be. It rides inside the record's own value, so it has a ceiling. */
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]));

const uid = (prefix) => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

const SHAPE_BUTTONS = [
  ['rect', 'ti-square', 'Box'],
  ['ellipse', 'ti-circle', 'Oval'],
  ['line', 'ti-minus', 'Line'],
];

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

/**
 * The whole editor, over a document it reads and writes through two callbacks.
 *
 * Nothing here knows where the document is kept -- a hidden input on a form, a field's starting
 * layout, a record's saved value -- which is what lets the same editor serve all three.
 */
export function openDocEditor({
  name = 'Document',
  readOnly = false,
  hostFields = [],
  hostValues = {},
  helpers = {},
  read,
  write,
  onClose,
}) {
  let doc = normalizeDoc(read(), () => uid('e'));
  let sel = '';
  // Which text element, if any, has the caret in it. Separate from `sel` because selecting a box
  // and typing into it are two different states: one click selects, a double-click starts typing.
  let editing = '';
  let scale = 3;
  let versionsOpen = false;
  let iconsOpen = false;
  let iconList = null;
  let objectUrls = [];

  const fields = placeableFields(hostFields);
  const overlay = document.createElement('div');
  overlay.className = 'fd-overlay';
  overlay.innerHTML = shell();

  const $ = (selector) => overlay.querySelector(selector);
  const stage = () => $('[data-fd-stage]');
  const pageEl = () => $('[data-fd-page]');

  function shell() {
    return `<div class="fd-shell" role="dialog" aria-modal="true" aria-label="Document builder">
      <div class="fd-head">
        <div class="fd-name">
          <i class="ti ti-file-text" aria-hidden="true"></i>
          <input class="fd-title-input" data-fd-title value="${esc(doc.title)}" placeholder="${esc(name)}" maxlength="120" aria-label="Document name" ${readOnly ? 'disabled' : ''} />
        </div>
        <div class="fd-head-acts" data-fd-acts></div>
        <button class="btn fd-close" type="button" data-fd-close>Close</button>
      </div>
      <div class="fd-body">
        <div class="fd-rail" data-fd-rail></div>
        <div class="fd-stage" data-fd-stage><div class="fd-paper"><div class="fd-page" data-fd-page></div></div></div>
        <div class="fd-side" data-fd-side></div>
      </div>
      <div class="fd-status" data-fd-status></div>
      <input type="file" data-fd-image accept="image/png,image/jpeg,image/webp,image/gif" hidden />
      <input type="file" data-fd-pdf accept="application/pdf,.pdf" hidden />
    </div>`;
  }

  function say(message, kind = '') {
    const bar = $('[data-fd-status]');
    if (!bar) return;
    bar.className = `fd-status${kind ? ` ${kind}` : ''}`;
    bar.textContent = message || '';
  }

  const selected = () => doc.elements.find((el) => el.id === sel) || null;

  /** Every change goes through here, so nothing can be saved without being normalized first. */
  function commit(next, { repaint = true } = {}) {
    if (readOnly) return;
    doc = normalizeDoc(next, () => uid('e'));
    write(doc);
    if (repaint) paint();
  }

  // --- what a field element says ----------------------------------------------------------------

  function wordsFor(el) {
    return elementText(el, {
      fields,
      values: hostValues,
      format: (field, raw) => plainFieldText(field, raw, helpers),
    });
  }

  /**
   * A field element with nothing behind it still has to be visible on the page, or somebody
   * laying out a proposal against an empty record has nothing to drag. So the editor shows the
   * field's name in a ghosted style; the PDF and the image show the real thing, which is nothing.
   */
  function previewText(el) {
    const real = wordsFor(el);
    if (real) return { text: real, ghost: false };
    if (el.kind === 'field') {
      const field = fields.find((f) => f.id === el.from);
      return { text: field ? `${field.label}` : 'Pick a field', ghost: true };
    }
    return { text: el.kind === 'text' ? 'Type here' : '', ghost: true };
  }

  // --- painting ---------------------------------------------------------------------------------

  function fitScale() {
    const box = stage();
    if (!box) return;
    const [wMm] = pageMm(doc.page);
    const room = box.clientWidth - 56;
    // Bounded: below about 1.4 px/mm the text is unreadable, and above 5 the page stops fitting
    // on any screen. Between those, the page is as big as the window allows.
    scale = Math.min(5, Math.max(1.4, room / wMm));
  }

  function elementMarkup(el) {
    const px = (mm) => `${(mm * scale).toFixed(2)}px`;
    const box = `left:${px(el.x)};top:${px(el.y)};width:${px(el.w)};height:${px(el.h)};opacity:${el.style.opacity}`;
    const grips = el.id === sel && !readOnly
      ? HANDLES.map((grip) => `<span class="fd-grip fd-grip-${grip}" data-fd-grip="${grip}"></span>`).join('')
      : '';
    const shellClass = `fd-el fd-el-${el.kind}${el.id === sel ? ' sel' : ''}`;
    const common = `class="${shellClass}" data-fd-el="${esc(el.id)}" style="${box}"`;

    if (el.kind === 'shape') {
      const fill = el.style.fill === 'none' ? 'transparent' : el.style.fill;
      const stroke = el.style.stroke === 'none' || !el.style.strokeWidth ? '' : `border:${Math.max(1, el.style.strokeWidth * scale).toFixed(2)}px solid ${el.style.stroke};`;
      if (el.shape === 'line') {
        // Drawn as a centred rule, the same way the PDF draws it.
        const thickness = Math.max(1, el.style.strokeWidth * scale);
        return `<div ${common}><span class="fd-rule" style="background:${el.style.stroke === 'none' ? '#111827' : el.style.stroke};height:${thickness.toFixed(2)}px"></span>${grips}</div>`;
      }
      const radius = el.shape === 'ellipse' ? '50%' : `${(el.style.radius * scale).toFixed(2)}px`;
      return `<div ${common}><span class="fd-shape" style="background:${fill};${stroke}border-radius:${radius}"></span>${grips}</div>`;
    }

    if (el.kind === 'image') {
      const body = el.src
        ? `<img class="fd-img" src="${esc(el.src)}" alt="" draggable="false" />`
        : '<span class="fd-ghost">Pick an image</span>';
      return `<div ${common}>${body}${grips}</div>`;
    }

    if (el.kind === 'icon') {
      // Sized to the shorter side so the glyph stays square inside a box of any proportion.
      const size = Math.max(8, Math.min(el.w, el.h) * scale * 0.92);
      return `<div ${common}><i class="ti ${esc(el.glyph)} fd-icon" data-fd-glyph style="font-size:${size.toFixed(1)}px;color:${el.style.color}"></i>${grips}</div>`;
    }

    // A text element being typed into shows exactly what it holds -- no placeholder, no resolved
    // stand-in -- because anything else would be text somebody has to delete before they can start.
    const { text, ghost } = editing === el.id ? { text: el.text, ghost: false } : previewText(el);
    const style = [
      `font-size:${(el.style.size * PT_TO_MM * scale).toFixed(2)}px`,
      `line-height:${(el.style.size * 1.2 * PT_TO_MM * scale).toFixed(2)}px`,
      `text-align:${el.style.align}`,
      `color:${ghost ? '#9ca3af' : el.style.color}`,
      el.style.bold ? 'font-weight:700' : 'font-weight:400',
      el.style.italic ? 'font-style:italic' : '',
      el.style.underline ? 'text-decoration:underline' : '',
    ].filter(Boolean).join(';');
    // Only a text element is typed into directly. A field element's words belong to the record, so
    // editing them here would be a change that vanishes on the next repaint.
    //
    // `contenteditable` goes on only while this element is the one being edited. Leaving it on
    // permanently is the trap: an editable box swallows the pointer, so a text element could then
    // only be dragged by its handles and never by its middle -- which is how everybody moves things.
    const words = el.kind === 'text' && !readOnly;
    const editable = words ? `data-fd-edit${editing === el.id ? ' contenteditable="plaintext-only"' : ''}` : '';
    return `<div ${common}><div class="fd-text${ghost ? ' ghost' : ''}" ${editable} style="${style}">${esc(text).replace(/\n/g, '<br>')}</div>${grips}</div>`;
  }

  function paintPage() {
    const host = pageEl();
    if (!host) return;
    const [wMm, hMm] = pageMm(doc.page);
    host.style.width = `${(wMm * scale).toFixed(2)}px`;
    host.style.height = `${(hMm * scale).toFixed(2)}px`;
    if (doc.source === 'upload' && doc.upload) {
      // The uploaded PDF is shown as itself rather than as a thumbnail: it IS the document now,
      // and a preview that did not match it would be a lie.
      host.classList.add('uploaded');
      host.innerHTML = `<div class="fd-upload-view"><object data="${esc(blobFor(doc.upload))}" type="application/pdf" class="fd-pdf-view">
        <div class="fd-upload-fallback"><i class="ti ti-file-type-pdf"></i><b>${esc(doc.upload.name)}</b>
        <div class="fd-sub">Your browser will not show a PDF inline. Download it to check it.</div></div></object></div>`;
      return;
    }
    host.classList.remove('uploaded');
    const margin = doc.page.margin * scale;
    host.innerHTML = `<div class="fd-margin" style="inset:${margin.toFixed(2)}px"></div>${doc.elements.map(elementMarkup).join('')}`;
  }

  function railMarkup() {
    if (readOnly) return '<div class="fd-rail-note">You can look at this document but not change it.</div>';
    if (doc.source === 'upload') {
      return `<div class="fd-rail-note"><i class="ti ti-file-type-pdf"></i> This document is the PDF you uploaded. Switch back to <b>Design</b> to lay one out instead.</div>
        <button class="btn btn-sm fd-w" type="button" data-fd-pdf-pick><i class="ti ti-upload"></i>Replace the PDF</button>
        <button class="btn btn-sm danger fd-w" type="button" data-fd-pdf-drop><i class="ti ti-trash"></i>Remove it</button>`;
    }
    const fieldOptions = fields.length
      ? fields.map((field) => `<option value="${esc(field.id)}">${esc(field.label)}</option>`).join('')
      : '<option value="">This app has no fields yet</option>';
    return `
      <div class="fd-group"><div class="fd-group-t">Put on the page</div>
        <button class="btn btn-sm fd-w" type="button" data-fd-add="text"><i class="ti ti-letter-case"></i>Text</button>
        <label class="fd-pick"><span><i class="ti ti-database"></i>A field from this record</span>
          <select class="wb-input" data-fd-add-field><option value="">— Choose a field —</option>${fieldOptions}</select>
        </label>
        <button class="btn btn-sm fd-w" type="button" data-fd-image-pick><i class="ti ti-photo"></i>Image</button>
        <button class="btn btn-sm fd-w" type="button" data-fd-icons><i class="ti ti-star"></i>Icon</button>
        <div class="fd-shapes">${SHAPE_BUTTONS.map(([shape, icon, label]) => `<button class="btn btn-sm" type="button" data-fd-add-shape="${shape}" title="${label}"><i class="ti ${icon}"></i></button>`).join('')}</div>
        ${iconsOpen ? `<div class="fd-icongrid" data-fd-icongrid>${iconGridMarkup()}</div>` : ''}
      </div>
      <div class="fd-group"><div class="fd-group-t">Paper</div>
        <label class="fd-pick"><span>Size</span>
          <select class="wb-input" data-fd-page-size>
            ${['a4', 'letter', 'legal'].map((size) => `<option value="${size}" ${doc.page.size === size ? 'selected' : ''}>${size.toUpperCase()}</option>`).join('')}
          </select>
        </label>
        <label class="fd-check"><input type="checkbox" data-fd-landscape ${doc.page.landscape ? 'checked' : ''}> Landscape</label>
        <label class="fd-pick"><span>Margin guide ${doc.page.margin} mm</span>
          <input type="range" min="0" max="40" step="1" value="${doc.page.margin}" data-fd-margin />
        </label>
      </div>
      <div class="fd-group"><div class="fd-group-t">Instead of a design</div>
        <button class="btn btn-sm fd-w" type="button" data-fd-pdf-pick><i class="ti ti-upload"></i>Upload a PDF</button>
        <div class="fd-sub">Already have the document? Use it as-is and skip the layout.</div>
      </div>`;
  }

  function iconGridMarkup() {
    if (!iconList) return '<div class="fd-sub">Loading icons…</div>';
    return iconList.map((glyph) => `<button type="button" class="fd-iconopt" data-fd-add-icon="${esc(glyph)}" title="${esc(glyph.replace(/^ti-/, '').replace(/-/g, ' '))}"><i class="ti ${esc(glyph)}"></i></button>`).join('');
  }

  function sideMarkup() {
    const el = selected();
    if (!el) {
      return `<div class="fd-side-empty"><i class="ti ti-click"></i>
        <div>Click something on the page to restyle it.</div>
        <div class="fd-sub">Drag to move, drag a corner to resize. Double-click text to type. Arrow keys nudge, Delete removes.</div>
      </div>`;
    }
    const num = (label, key, min, max, step = 1) => `<label class="fd-num"><span>${label}</span><input type="number" class="wb-input" data-fd-geo="${key}" value="${el[key]}" min="${min}" max="${max}" step="${step}" /></label>`;
    const [pw, ph] = pageMm(doc.page);
    const isWords = el.kind === 'text' || el.kind === 'field';
    const swatch = (key, value, label) => `<label class="fd-color"><span>${label}</span>
      <input type="color" data-fd-style="${key}" value="${value === 'none' ? '#ffffff' : value}" />
      ${key !== 'color' ? `<button type="button" class="fd-none ${value === 'none' ? 'on' : ''}" data-fd-none="${key}" title="No ${label.toLowerCase()}">None</button>` : ''}
    </label>`;

    return `<div class="fd-side-head"><b>${esc({
      text: 'Text', field: 'Record field', image: 'Image', icon: 'Icon', shape: 'Shape',
    }[el.kind])}</b>
      <button class="wb-icon-btn danger" type="button" data-fd-del title="Remove" aria-label="Remove this element"><i class="ti ti-trash"></i></button>
    </div>
    <div class="fd-group"><div class="fd-group-t">Position &amp; size <span class="fd-sub">mm</span></div>
      <div class="fd-grid2">${num('X', 'x', 0, pw)}${num('Y', 'y', 0, ph)}${num('Width', 'w', MIN_MM, pw)}${num('Height', 'h', MIN_MM, ph)}</div>
    </div>
    ${isWords ? `<div class="fd-group"><div class="fd-group-t">Type</div>
      <div class="fd-row">
        <label class="fd-num fd-num-sm"><span>Size</span><input type="number" class="wb-input" data-fd-style="size" value="${el.style.size}" min="5" max="96" step="1" /></label>
        <div class="fd-btns">
          <button type="button" class="fd-tog ${el.style.bold ? 'on' : ''}" data-fd-toggle="bold" title="Bold"><b>B</b></button>
          <button type="button" class="fd-tog ${el.style.italic ? 'on' : ''}" data-fd-toggle="italic" title="Italic"><i>I</i></button>
          <button type="button" class="fd-tog ${el.style.underline ? 'on' : ''}" data-fd-toggle="underline" title="Underline"><u>U</u></button>
        </div>
      </div>
      <div class="fd-btns">
        ${[['left', 'ti-align-left'], ['center', 'ti-align-center'], ['right', 'ti-align-right']].map(([align, icon]) => `<button type="button" class="fd-tog ${el.style.align === align ? 'on' : ''}" data-fd-align="${align}" title="Align ${align}"><i class="ti ${icon}"></i></button>`).join('')}
      </div>
      ${swatch('color', el.style.color, 'Colour')}
    </div>` : ''}
    ${el.kind === 'field' ? `<div class="fd-group"><div class="fd-group-t">Which field</div>
      <select class="wb-input" data-fd-from>
        <option value="">— Choose a field —</option>
        ${fields.map((field) => `<option value="${esc(field.id)}" ${el.from === field.id ? 'selected' : ''}>${esc(field.label)}</option>`).join('')}
      </select>
      <label class="fd-check"><input type="checkbox" data-fd-withlabel ${el.withLabel ? 'checked' : ''}> Print the field's name too</label>
      <label class="fd-pick"><span>If it is empty, print</span><input class="wb-input" data-fd-fallback value="${esc(el.fallback)}" placeholder="nothing" /></label>
      <div class="fd-sub">Read from the record every time the document is opened, so it is never out of date.</div>
    </div>` : ''}
    ${el.kind === 'icon' ? `<div class="fd-group"><div class="fd-group-t">Icon</div>
      ${swatch('color', el.style.color, 'Colour')}
      <button class="btn btn-sm fd-w" type="button" data-fd-icons><i class="ti ti-star"></i>Choose a different one</button>
      ${iconsOpen ? `<div class="fd-icongrid">${(iconList || []).map((glyph) => `<button type="button" class="fd-iconopt ${el.glyph === glyph ? 'on' : ''}" data-fd-set-icon="${esc(glyph)}"><i class="ti ${esc(glyph)}"></i></button>`).join('')}</div>` : ''}
    </div>` : ''}
    ${el.kind === 'image' ? `<div class="fd-group"><div class="fd-group-t">Image</div>
      <button class="btn btn-sm fd-w" type="button" data-fd-image-pick><i class="ti ti-photo"></i>${el.src ? 'Replace it' : 'Choose a file'}</button>
      ${el.name ? `<div class="fd-sub">${esc(el.name)}</div>` : ''}
    </div>` : ''}
    ${el.kind === 'shape' ? `<div class="fd-group"><div class="fd-group-t">Shape</div>
      <div class="fd-btns">${SHAPE_BUTTONS.map(([shape, icon, label]) => `<button type="button" class="fd-tog ${el.shape === shape ? 'on' : ''}" data-fd-shape="${shape}" title="${label}"><i class="ti ${icon}"></i></button>`).join('')}</div>
      ${el.shape === 'line' ? '' : swatch('fill', el.style.fill, 'Fill')}
      ${swatch('stroke', el.style.stroke, el.shape === 'line' ? 'Line' : 'Outline')}
      <label class="fd-num"><span>${el.shape === 'line' ? 'Thickness' : 'Outline width'} mm</span><input type="number" class="wb-input" data-fd-style="strokeWidth" value="${el.style.strokeWidth}" min="0" max="20" step="0.2" /></label>
      ${el.shape === 'rect' ? `<label class="fd-num"><span>Corner radius mm</span><input type="number" class="wb-input" data-fd-style="radius" value="${el.style.radius}" min="0" max="40" step="1" /></label>` : ''}
    </div>` : ''}
    <div class="fd-group"><div class="fd-group-t">Layer</div>
      <div class="fd-btns">
        ${[['back', 'ti-arrow-down', 'Send to back'], ['backward', 'ti-chevron-down', 'Back one'], ['forward', 'ti-chevron-up', 'Forward one'], ['front', 'ti-arrow-up', 'Bring to front']].map(([where, icon, label]) => `<button type="button" class="fd-tog" data-fd-layer="${where}" title="${label}"><i class="ti ${icon}"></i></button>`).join('')}
      </div>
    </div>`;
  }

  function actsMarkup() {
    const hasUpload = !!doc.upload;
    return `
      ${hasUpload ? `<div class="fd-seg">
        <button type="button" class="${doc.source === 'design' ? 'on' : ''}" data-fd-source="design">Design</button>
        <button type="button" class="${doc.source === 'upload' ? 'on' : ''}" data-fd-source="upload">Uploaded PDF</button>
      </div>` : ''}
      ${readOnly ? '' : '<button class="btn btn-sm fd-save" type="button" data-fd-save><i class="ti ti-device-floppy"></i>Save</button>'}
      <div class="fd-vwrap">
        <button class="btn btn-sm" type="button" data-fd-versions><i class="ti ti-history"></i>Versions${doc.versions.length ? ` (${doc.versions.length})` : ''}</button>
        ${versionsOpen ? `<div class="fd-vpanel">
          ${readOnly ? '' : '<button class="btn btn-sm fd-w" type="button" data-fd-save-version><i class="ti ti-device-floppy"></i>Save this as a version</button>'}
          ${doc.versions.length ? doc.versions.map((version) => `<div class="fd-vrow">
            <div><b>${esc(version.name)}</b><div class="fd-sub">${esc(version.at ? new Date(version.at).toLocaleString() : '')} · ${version.elements.length} item${version.elements.length === 1 ? '' : 's'}</div></div>
            <div class="fd-vacts">
              <button class="btn btn-sm" type="button" data-fd-restore="${esc(version.id)}">Restore</button>
              ${readOnly ? '' : `<button class="wb-icon-btn danger" type="button" data-fd-vdel="${esc(version.id)}" title="Delete this version"><i class="ti ti-x"></i></button>`}
            </div>
          </div>`).join('') : '<div class="fd-sub">No saved versions yet. Saving one lets you come back to this layout after changing it.</div>'}
        </div>` : ''}
      </div>
      <button class="btn btn-sm" type="button" data-fd-open><i class="ti ti-external-link"></i>Open</button>
      <button class="btn btn-sm" type="button" data-fd-download="pdf"><i class="ti ti-file-type-pdf"></i>PDF</button>
      <button class="btn btn-sm" type="button" data-fd-download="png"><i class="ti ti-photo"></i>Image</button>
      <button class="btn btn-sm btn-primary" type="button" data-fd-email><i class="ti ti-mail"></i>Email</button>`;
  }

  function paint() {
    fitScale();
    paintPage();
    $('[data-fd-rail]').innerHTML = railMarkup();
    $('[data-fd-side]').innerHTML = sideMarkup();
    $('[data-fd-acts]').innerHTML = actsMarkup();
  }

  // --- dragging ---------------------------------------------------------------------------------

  let drag = null;

  overlay.addEventListener('pointerdown', (event) => {
    const host = event.target.closest('[data-fd-el]');
    if (!host) return;
    const id = host.dataset.fdEl;
    // Already typing into this one: the pointer belongs to the caret, not to a drag.
    if (editing === id && event.target.closest('[data-fd-edit]')) return;
    // Selecting and dragging are one gesture, not two. Requiring a click to select and then a
    // second press to move is the single most irritating thing an editor can ask for.
    if (sel !== id || editing) { sel = id; editing = ''; paint(); }
    if (readOnly) return;
    const el = selected();
    if (!el) return;
    const grip = event.target.closest('[data-fd-grip]')?.dataset.fdGrip || '';
    drag = {
      id, grip, startX: event.clientX, startY: event.clientY, from: { ...el }, moved: false,
    };
    // Captured so a fast drag that leaves the page element still tracks -- without this, moving
    // quickly drops the element wherever the pointer happened to leave.
    overlay.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  overlay.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const dxMm = (event.clientX - drag.startX) / scale;
    const dyMm = (event.clientY - drag.startY) / scale;
    if (!drag.moved && Math.abs(dxMm) < 0.3 && Math.abs(dyMm) < 0.3) return;
    drag.moved = true;
    const next = drag.grip
      ? resizeElement({ ...doc, elements: doc.elements.map((el) => (el.id === drag.id ? drag.from : el)) }, drag.id, drag.grip, dxMm, dyMm)
      : moveElement({ ...doc, elements: doc.elements.map((el) => (el.id === drag.id ? drag.from : el)) }, drag.id, drag.from.x + dxMm, drag.from.y + dyMm);
    doc = next;
    // Only the dragged node is touched, not the whole page: a full repaint per pointermove
    // would throw away the caret in a text element and stutter on a long document.
    const node = pageEl()?.querySelector(`[data-fd-el="${CSS.escape(drag.id)}"]`);
    const el = selected();
    if (node && el) {
      node.style.left = `${(el.x * scale).toFixed(2)}px`;
      node.style.top = `${(el.y * scale).toFixed(2)}px`;
      node.style.width = `${(el.w * scale).toFixed(2)}px`;
      node.style.height = `${(el.h * scale).toFixed(2)}px`;
      const glyph = node.querySelector('[data-fd-glyph]');
      if (glyph) glyph.style.fontSize = `${Math.max(8, Math.min(el.w, el.h) * scale * 0.92).toFixed(1)}px`;
    }
  });

  overlay.addEventListener('pointerup', () => {
    if (!drag) return;
    const settled = drag;
    drag = null;
    // A click that never moved is a selection, already handled, and must not write a version of
    // the document identical to the one already stored.
    if (settled.moved) commit(doc);
  });

  // --- keyboard ---------------------------------------------------------------------------------

  const onKey = (event) => {
    if (!overlay.isConnected) return;
    if (event.key === 'Escape') {
      // Escape closes the document, not the record form behind it.
      event.stopPropagation();
      // Escape out of typing first, and only out of the document once the caret is free -- so
      // one keypress cannot both abandon a sentence and close the thing it was in.
      if (editing) { document.activeElement?.blur?.(); return; }
      close();
      return;
    }
    if (readOnly || !sel) return;
    // Delete and the arrow keys belong to the text while it is being typed into.
    if (editing) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      commit(removeElement(doc, sel));
      sel = '';
      paint();
      return;
    }
    const step = event.shiftKey ? 5 : 1;
    const nudge = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
    }[event.key];
    if (!nudge) return;
    event.preventDefault();
    const el = selected();
    commit(moveElement(doc, sel, el.x + nudge[0], el.y + nudge[1]));
  };

  // --- clicks -----------------------------------------------------------------------------------

  overlay.addEventListener('click', async (event) => {
    const hit = (attr) => event.target.closest(`[data-fd-${attr}]`);

    if (hit('close')) { close(); return; }

    // Clicking the paper but not an element clears the selection, which is how every editor
    // behaves and the only way to get the inspector's help text back.
    if (event.target.closest('[data-fd-page]') && !event.target.closest('[data-fd-el]')) {
      if (sel) { sel = ''; paint(); }
      return;
    }

    const add = hit('add');
    if (add) { place({ kind: add.dataset.fdAdd, text: 'New text', w: 80, h: 10 }); return; }

    const shape = hit('add-shape');
    if (shape) {
      const kind = shape.dataset.fdAddShape;
      place({ kind: 'shape', shape: kind, w: kind === 'line' ? 120 : 50, h: kind === 'line' ? 2 : 30 });
      return;
    }

    if (hit('icons')) {
      iconsOpen = !iconsOpen;
      if (iconsOpen && !iconList) {
        // The icon list is 400-odd names in a chunk of its own; fetched only when somebody
        // actually opens the picker.
        try {
          iconList = (await import('../workspace/icon-sets.js')).WB_APP_ICONS;
        } catch { say('The icons could not be loaded.', 'bad'); }
      }
      paint();
      return;
    }

    const addIcon = hit('add-icon');
    if (addIcon) { place({ kind: 'icon', glyph: addIcon.dataset.fdAddIcon, w: 16, h: 16 }); iconsOpen = false; paint(); return; }

    const setIcon = hit('set-icon');
    if (setIcon) { commit(styleElement(doc, sel, { glyph: setIcon.dataset.fdSetIcon })); return; }

    if (hit('image-pick')) { $('[data-fd-image]').click(); return; }
    if (hit('pdf-pick')) { $('[data-fd-pdf]').click(); return; }

    if (hit('pdf-drop')) {
      commit({ ...doc, upload: null, source: 'design' });
      say('The uploaded PDF has been removed. Your design is still here.');
      return;
    }

    const source = hit('source');
    if (source) { commit({ ...doc, source: source.dataset.fdSource }); return; }

    const del = hit('del');
    if (del) { commit(removeElement(doc, sel)); sel = ''; paint(); return; }

    const layer = hit('layer');
    if (layer) { commit(layerElement(doc, sel, layer.dataset.fdLayer)); return; }

    const toggle = hit('toggle');
    if (toggle) {
      const key = toggle.dataset.fdToggle;
      commit(styleElement(doc, sel, { style: { [key]: !selected().style[key] } }));
      return;
    }

    const align = hit('align');
    if (align) { commit(styleElement(doc, sel, { style: { align: align.dataset.fdAlign } })); return; }

    const shapeKind = hit('shape');
    if (shapeKind) { commit(styleElement(doc, sel, { shape: shapeKind.dataset.fdShape })); return; }

    const none = hit('none');
    if (none) { commit(styleElement(doc, sel, { style: { [none.dataset.fdNone]: 'none' } })); return; }

    if (hit('versions')) { versionsOpen = !versionsOpen; paint(); return; }

    if (hit('save')) { keepVersion(''); return; }

    if (hit('save-version')) {
      // Named, because somebody looking at a list of versions is naming one among many. The header
      // button does not ask -- see keepVersion.
      const label = window.prompt('Name this version', `${doc.title || name} — ${new Date().toLocaleDateString()}`);
      if (label == null) return;
      keepVersion(label);
      return;
    }

    const restore = hit('restore');
    if (restore) {
      commit(restoreVersion(doc, restore.dataset.fdRestore));
      versionsOpen = false;
      sel = '';
      paint();
      say('That version is back on the page.');
      return;
    }

    const vdel = hit('vdel');
    if (vdel) { commit(removeVersion(doc, vdel.dataset.fdVdel)); return; }

    const download = hit('download');
    if (download) { await exportDocument(download.dataset.fdDownload, 'download'); return; }
    if (hit('open')) { await exportDocument('pdf', 'open'); return; }
    if (hit('email')) { await emailDocument(); return; }
  });

  /**
   * Keep what is on the page as a version.
   *
   * An unnamed save is stamped with the date and time rather than prompting: the header button is
   * pressed mid-edit, and having to answer a dialog every time is the reason people stop pressing
   * it. Whoever wants a name uses the one in the Versions panel.
   */
  function keepVersion(label) {
    const at = new Date();
    const named = String(label || '').trim() || at.toLocaleString();
    commit(saveVersion(doc, named, at.toISOString(), helpers.who || '', () => uid('v')));
    say(`Saved as a version — "${named}". Versions keeps ${MAX_VERSIONS}.`);
  }

  function place(input) {
    const w = input.w ?? 60;
    const h = input.h ?? 10;
    const next = addElement(doc, { ...input, w, h, ...nextFreeSpot(w, h) }, () => uid('e'));
    sel = next.elements[next.elements.length - 1].id;
    commit(next);
  }

  /** Where a new element lands: inside the margin, stepped so additions do not stack exactly. */
  function nextFreeSpot(w, h) {
    const [pw, ph] = pageMm(doc.page);
    const step = (doc.elements.length % 8) * 5;
    return {
      x: Math.min(pw - w, doc.page.margin + step),
      y: Math.min(ph - h, doc.page.margin + step),
    };
  }

  // --- typing and the inspector's inputs --------------------------------------------------------

  overlay.addEventListener('input', (event) => {
    const target = event.target;

    if (target.matches('[data-fd-title]')) {
      // Written straight through without a repaint: repainting would move the caret to the front
      // of the box on every keystroke.
      commit({ ...doc, title: target.value }, { repaint: false });
      return;
    }

    if (target.matches('[data-fd-margin]')) {
      commit(setPage(doc, { margin: Number(target.value) }));
      return;
    }

    const geo = target.dataset.fdGeo;
    if (geo && sel) {
      const el = selected();
      const value = Number(target.value);
      if (!Number.isFinite(value)) return;
      const next = geo === 'x' || geo === 'y'
        ? moveElement(doc, sel, geo === 'x' ? value : el.x, geo === 'y' ? value : el.y)
        : resizeElement(doc, sel, 'se', geo === 'w' ? value - el.w : 0, geo === 'h' ? value - el.h : 0);
      doc = normalizeDoc(next, () => uid('e'));
      write(doc);
      paintPage();
      return;
    }

    const styleKey = target.dataset.fdStyle;
    if (styleKey && sel) {
      const raw = target.type === 'number' || target.type === 'range' ? Number(target.value) : target.value;
      doc = normalizeDoc(styleElement(doc, sel, { style: { [styleKey]: raw } }), () => uid('e'));
      write(doc);
      paintPage();
      return;
    }

    if (target.matches('[data-fd-fallback]') && sel) {
      doc = normalizeDoc(styleElement(doc, sel, { fallback: target.value }), () => uid('e'));
      write(doc);
      paintPage();
    }
  });

  overlay.addEventListener('change', async (event) => {
    const target = event.target;

    if (target.matches('[data-fd-add-field]')) {
      const from = target.value;
      if (!from) return;
      const field = fields.find((entry) => entry.id === from);
      // Sized to what the value is likely to need: a paragraph field gets a tall box, a number a
      // short one, so a freshly-placed field does not have to be resized before it reads properly.
      const tall = ['textarea', 'location', 'checklist'].includes(field?.type);
      place({ kind: 'field', from, w: tall ? 90 : 70, h: tall ? 24 : 8 });
      target.value = '';
      return;
    }

    if (target.matches('[data-fd-page-size]')) { commit(setPage(doc, { size: target.value })); return; }
    if (target.matches('[data-fd-landscape]')) { commit(setPage(doc, { landscape: target.checked })); return; }
    if (target.matches('[data-fd-from]') && sel) { commit(styleElement(doc, sel, { from: target.value })); return; }
    if (target.matches('[data-fd-withlabel]') && sel) { commit(styleElement(doc, sel, { withLabel: target.checked })); return; }

    if (target.matches('[data-fd-image]')) {
      const file = target.files?.[0];
      target.value = '';
      if (!file) return;
      try {
        const src = await readDataUrl(file);
        const size = await imageSize(src);
        const el = selected();
        if (el && el.kind === 'image') {
          commit(styleElement(doc, sel, { src, name: file.name }));
        } else {
          // Placed at its own proportions rather than in a square box, so a wide logo does not
          // arrive squashed and have to be fixed by hand.
          const w = 50;
          place({ kind: 'image', src, name: file.name, w, h: Math.max(MIN_MM, Math.round((w * size.height) / size.width)) });
        }
      } catch (error) { say(`That image could not be read — ${error.message}`, 'bad'); }
      return;
    }

    if (target.matches('[data-fd-pdf]')) {
      const file = target.files?.[0];
      target.value = '';
      if (!file) return;
      if (file.size > MAX_UPLOAD_BYTES) {
        say(`That PDF is ${(file.size / 1048576).toFixed(1)} MB. It travels inside the record, so keep it under ${MAX_UPLOAD_BYTES / 1048576} MB.`, 'bad');
        return;
      }
      try {
        const src = await readDataUrl(file);
        commit({
          ...doc, upload: { name: file.name, src, at: new Date().toISOString() }, source: 'upload',
        });
        say(`${file.name} is now this document.`);
      } catch (error) { say(`That PDF could not be read — ${error.message}`, 'bad'); }
    }
  });

  // A text element commits when the caret leaves it, not on every keystroke: a repaint mid-word
  // would put the caret back at the start.
  overlay.addEventListener('focusout', (event) => {
    const editor = event.target.closest?.('[data-fd-edit]');
    if (!editor) return;
    const host = editor.closest('[data-fd-el]');
    const id = host?.dataset.fdEl;
    const el = doc.elements.find((entry) => entry.id === id);
    if (!el || el.kind !== 'text') return;
    const typed = editor.innerText.replace(/ /g, ' ').replace(/\n$/, '');
    if (editing === id) editing = '';
    // Repainted even when the words are unchanged: the element has to stop being editable, and
    // an emptied one has to get its placeholder back.
    if (typed === el.text) { paint(); return; }
    commit({ ...doc, elements: doc.elements.map((entry) => (entry.id === id ? { ...entry, text: typed } : entry)) });
  });

  overlay.addEventListener('dblclick', (event) => {
    const host = event.target.closest('[data-fd-el]');
    const el = doc.elements.find((entry) => entry.id === host?.dataset.fdEl);
    if (!el || el.kind !== 'text' || readOnly) return;
    sel = el.id;
    editing = el.id;
    // Repainted first, because the element only becomes editable once `editing` names it -- so
    // the node to put the caret in is the one this paint just made, not the one that was clicked.
    paint();
    pageEl()?.querySelector(`[data-fd-el="${CSS.escape(el.id)}"] [data-fd-edit]`)?.focus();
  });

  // --- exporting ---------------------------------------------------------------------------------

  function blobFor(upload) {
    // Chrome refuses a data: URI in an <object>, so the uploaded PDF is handed over as a blob.
    const [, base64] = String(upload.src).split(',');
    const bytes = Uint8Array.from(atob(base64 || ''), (ch) => ch.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    objectUrls.push(url);
    return url;
  }

  /** An image element's bytes as JPEG, which is the one format a PDF takes as-is. */
  function toJpeg(src, wMm, hMm) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // 200 dpi: past that the file grows faster than anything visible improves.
        const dpi = 200;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round((wMm / 25.4) * dpi));
        canvas.height = Math.max(1, Math.round((hMm / 25.4) * dpi));
        const ctx = canvas.getContext('2d');
        // White behind it: JPEG has no transparency, and a logo with an alpha channel would
        // otherwise come out on black.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(dataUrlBytes(canvas.toDataURL('image/jpeg', 0.9)));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  /** An icon is a glyph in a webfont, so it is drawn onto a canvas and embedded as a picture. */
  function iconJpeg(el) {
    const probe = pageEl()?.querySelector(`[data-fd-el="${CSS.escape(el.id)}"] [data-fd-glyph]`);
    // The glyph itself is in a ::before rule, which is the only place to read it from.
    const content = probe ? window.getComputedStyle(probe, '::before').content : '';
    const glyph = String(content || '').replace(/^["']|["']$/g, '');
    if (!glyph || glyph === 'none') return null;
    const dpi = 200;
    const side = Math.max(1, Math.round((Math.min(el.w, el.h) / 25.4) * dpi));
    const canvas = document.createElement('canvas');
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, side, side);
    ctx.fillStyle = el.style.color;
    ctx.font = `${Math.round(side * 0.86)}px "tabler-icons"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, side / 2, side / 2);
    return dataUrlBytes(canvas.toDataURL('image/jpeg', 0.92));
  }

  function dataUrlBytes(url) {
    const [, base64] = String(url).split(',');
    return Uint8Array.from(atob(base64 || ''), (ch) => ch.charCodeAt(0));
  }

  /** The document as PDF bytes: every element resolved, every picture converted. */
  async function buildPdfBytes() {
    const items = doc.elements.map((el) => ({ ...el, text: wordsFor(el) }));
    const images = [];
    for (const el of doc.elements) {
      if (el.kind !== 'image' && el.kind !== 'icon') continue;
      try {
        // Sequential on purpose: twenty images decoded at once is where a phone runs out of
        // memory, and an export is not a place to be clever.
        // eslint-disable-next-line no-await-in-loop
        const bytes = el.kind === 'icon' ? iconJpeg(el) : await toJpeg(el.src, el.w, el.h);
        if (!bytes) continue;
        const info = jpegInfo(bytes);
        images.push({
          id: el.id, bytes, width: info.width, height: info.height, components: info.components,
        });
      } catch { /* an element that will not convert is left off rather than drawn as a box */ }
    }
    return writePdf({ page: doc.page, items, images, title: doc.title || name });
  }

  /** The document as a picture, drawn with the same wrapping the PDF uses so the two agree. */
  async function buildPngBlob() {
    const [wMm, hMm] = pageMm(doc.page);
    const dpi = 150;
    const px = (mm) => (mm / 25.4) * dpi;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(px(wMm));
    canvas.height = Math.round(px(hMm));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const el of doc.elements) {
      const x = px(el.x);
      const y = px(el.y);
      const w = px(el.w);
      const h = px(el.h);
      ctx.save();
      ctx.globalAlpha = el.style.opacity;
      if (el.kind === 'shape') {
        ctx.beginPath();
        if (el.shape === 'ellipse') ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        else if (el.shape === 'line') { ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); }
        else if (ctx.roundRect) ctx.roundRect(x, y, w, h, px(el.style.radius));
        else ctx.rect(x, y, w, h);
        if (el.style.fill !== 'none' && el.shape !== 'line') { ctx.fillStyle = el.style.fill; ctx.fill(); }
        if (el.style.stroke !== 'none' && el.style.strokeWidth > 0) {
          ctx.strokeStyle = el.style.stroke;
          ctx.lineWidth = Math.max(1, px(el.style.strokeWidth));
          ctx.stroke();
        }
      } else if (el.kind === 'icon') {
        const probe = pageEl()?.querySelector(`[data-fd-el="${CSS.escape(el.id)}"] [data-fd-glyph]`);
        const glyph = String(probe ? window.getComputedStyle(probe, '::before').content : '').replace(/^["']|["']$/g, '');
        if (glyph && glyph !== 'none') {
          ctx.fillStyle = el.style.color;
          ctx.font = `${Math.round(Math.min(w, h) * 0.9)}px "tabler-icons"`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(glyph, x + w / 2, y + h / 2);
        }
      } else if (el.kind === 'image' && el.src) {
        // eslint-disable-next-line no-await-in-loop
        const img = await loadImage(el.src).catch(() => null);
        if (img) ctx.drawImage(img, x, y, w, h);
      } else {
        const text = wordsFor(el);
        if (text.trim()) {
          const sizePx = px(el.style.size * PT_TO_MM);
          ctx.fillStyle = el.style.color;
          ctx.font = `${el.style.italic ? 'italic ' : ''}${el.style.bold ? '700 ' : '400 '}${sizePx.toFixed(1)}px Arial, Helvetica, sans-serif`;
          ctx.textBaseline = 'alphabetic';
          // The PDF's own wrapper, measured in points and scaled here, so a line breaks in the
          // same place in both files. Measuring with the canvas instead would drift.
          const lines = wrapText(text, el.w * MM_TO_PT, el.style.size, el.style.bold);
          const lead = sizePx * 1.2;
          lines.forEach((line, i) => {
            // One ascent below the top edge, then a line at a time -- the same arithmetic the PDF
            // writer does, only counted downwards because that is the way a canvas measures.
            const baseline = y + sizePx * 0.85 + i * lead;
            if (baseline > y + h + sizePx * 0.25) return;
            // Points to pixels at this canvas's resolution.
            const lineWidth = px(textWidth(line, el.style.size, el.style.bold) * PT_TO_MM);
            const offset = el.style.align === 'center' ? (w - lineWidth) / 2 : el.style.align === 'right' ? w - lineWidth : 0;
            ctx.fillText(line, x + Math.max(0, offset), baseline);
            if (el.style.underline) {
              ctx.fillRect(x + Math.max(0, offset), baseline + sizePx * 0.13, lineWidth, Math.max(1, sizePx * 0.06));
            }
          });
        }
      }
      ctx.restore();
    }
    return new Promise((done) => canvas.toBlob(done, 'image/png'));
  }

  function fileName(extension) {
    const base = (doc.title || name || 'Document').replace(/[\\/:*?"<>|]/g, ' ').trim() || 'Document';
    return `${base}.${extension}`;
  }

  function handOver(blob, filename, how) {
    const url = URL.createObjectURL(blob);
    objectUrls.push(url);
    if (how === 'open') {
      // No `noopener`: this window is handed a blob to display, and returning null would leave
      // nothing to report back about a blocked pop-up.
      const win = window.open(url, '_blank');
      if (!win) say('Your browser blocked the new tab. Allow pop-ups for this site, or use the PDF button to download it instead.', 'bad');
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function exportDocument(format, how) {
    try {
      say('Making the file…');
      if (doc.source === 'upload' && doc.upload) {
        // The uploaded PDF is the document, so it is handed over untouched rather than being
        // redrawn from a design it has nothing to do with.
        const bytes = dataUrlBytes(doc.upload.src);
        handOver(new Blob([bytes], { type: 'application/pdf' }), doc.upload.name, how);
        say('');
        return;
      }
      if (format === 'png') {
        const blob = await buildPngBlob();
        handOver(blob, fileName('png'), how);
      } else {
        const bytes = await buildPdfBytes();
        handOver(new Blob([bytes], { type: 'application/pdf' }), fileName('pdf'), how);
      }
      say('');
    } catch (error) {
      say(`That could not be made — ${error.message}`, 'bad');
    }
  }

  /**
   * Send it to the client.
   *
   * A web page cannot put a file into a mail client -- no browser allows it, with or without
   * permission -- so this does the two halves it can: the PDF is downloaded, and a draft is
   * opened addressed to the record's email address with the subject already filled in. Saying so
   * plainly beats a button that looks like it attached something and did not.
   */
  async function emailDocument() {
    await exportDocument('pdf', 'download');
    const to = helpers.emailTo || '';
    const subject = doc.title || name || 'Document';
    const body = `Hi,\n\nPlease find ${subject} attached.\n\nThanks`;
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    say(`${fileName('pdf')} has been downloaded — attach it to the draft that just opened.`);
  }

  function loadImage(src) {
    return new Promise((done, reject) => {
      const img = new Image();
      img.onload = () => done(img);
      img.onerror = () => reject(new Error('the image could not be decoded'));
      img.src = src;
    });
  }

  function imageSize(src) {
    return loadImage(src).then((img) => ({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 }));
  }

  function readDataUrl(file) {
    return new Promise((done, reject) => {
      const reader = new FileReader();
      reader.onload = () => done(String(reader.result || ''));
      reader.onerror = () => reject(new Error('the file could not be read'));
      reader.readAsDataURL(file);
    });
  }

  // --- opening and closing -----------------------------------------------------------------------

  function close() {
    // Every change has already been written through `commit`, so there is nothing to save here.
    // What is left is the object URLs: a blob that is never revoked keeps its bytes for the life
    // of the tab, and an uploaded PDF is measured in megabytes.
    // Persisting per keystroke is what onClose is for: a drag end, a colour and a nudge are each
    // a commit, and wbSave is a network round trip per company. The document is already in memory
    // by then -- write() put it there -- so nothing is lost by saving once.
    try { onClose?.(); } catch { /* closing must not be blocked by a failed save */ }
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls = [];
    overlay.remove();
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onResize);
  }

  const onResize = () => { fitScale(); paintPage(); };

  document.addEventListener('keydown', onKey, true);
  window.addEventListener('resize', onResize);
  document.body.appendChild(overlay);
  paint();
  overlay.tabIndex = -1;
  overlay.focus();
  return overlay;
}

/**
 * Open the document a hidden input on the page is holding.
 *
 * Finding the field, working out which record's values the document should read, and reading its
 * JSON all live here rather than in main.js -- every session that never opens a document would
 * otherwise carry the lookup for one that does.
 */
export function openFor(fieldId, ctx = {}) {
  const {
    state, wbFind, render, formatDate, memberName, wbItemTitle,
  } = ctx;
  const escapeId = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(fieldId) : fieldId;
  const holder = document.querySelector(`[data-f="${escapeId}"]`);
  if (!holder) throw new Error('That form is no longer on the page. Reload and try again.');

  const modal = state?.builderModal || {};
  const found = wbFind ? wbFind(modal.companyId, modal.workspaceId, modal.appId) : {};
  const app = found.app || null;
  const item = modal.editId ? (app?.items || []).find((entry) => entry.id === modal.editId) : null;
  // The draft wins over what is stored: somebody laying out a proposal while editing the record
  // should see what they have just typed, not what was there before.
  const hostValues = { ...(item?.values || {}), ...(modal.draft?.values || {}) };
  const hostFields = (app?.fields || []).filter((field) => field.id !== fieldId);
  const emailField = hostFields.find((field) => field.type === 'email');

  return openDocEditor({
    name: holder.dataset.wbFormTitle || 'Document',
    readOnly: !!holder.disabled,
    hostFields,
    hostValues,
    helpers: {
      formatDate: formatDate || ((value) => String(value ?? '')),
      memberName: memberName || ((id) => String(id ?? '')),
      recordTitle: (id) => {
        if (!wbItemTitle || !app) return String(id ?? '');
        const linked = (app.items || []).find((entry) => entry.id === id);
        return linked ? wbItemTitle(modal.companyId, app, linked) : String(id ?? '');
      },
      emailTo: emailField ? String(hostValues[emailField.id] || '') : '',
      who: state?.session?.profile?.id || '',
    },
    read: () => { try { return JSON.parse(holder.value || '{}'); } catch { return {}; } },
    write: (doc) => {
      holder.value = JSON.stringify(doc);
      // The same two events an ordinary input fires, so whatever is watching the form -- the
      // draft collector, the dirty flag, the save button -- sees this as a normal edit.
      holder.dispatchEvent(new Event('input', { bubbles: true }));
      holder.dispatchEvent(new Event('change', { bubbles: true }));
    },
  });
}

/**
 * Open the document a RECORD holds, addressed by "company|workspace|app|item".
 *
 * The path above reads a hidden input that is on the page. A table row has none, and neither does
 * the record page, so this goes to the record itself and writes back through the app’s own save.
 * Finding the record lives here rather than in main.js: every session that never opens a document
 * from a row would otherwise carry the lookup for one that does.
 */
export function openForRecord(fieldId, seat, ctx = {}) {
  const {
    wbDoc, wbSave, render, can, formatDate, memberName, wbItemTitle,
  } = ctx;
  const [companyId, workspaceId, appId, itemId] = String(seat || '').split('|');
  const workspace = (wbDoc(companyId)?.workspaces || []).find((entry) => entry.id === workspaceId);
  const app = (workspace?.apps || []).find((entry) => entry.id === appId);
  const item = (app?.items || []).find((entry) => entry.id === itemId);
  if (!item) throw new Error('That record is no longer here. Reload and try again.');
  const field = (app.fields || []).find((entry) => entry.id === fieldId);
  const hostFields = (app.fields || []).filter((entry) => entry.id !== fieldId);
  const emailField = hostFields.find((entry) => entry.type === 'email');
  const values = item.values || {};
  const stored = (() => { try { return JSON.parse(values[fieldId] || '{}'); } catch { return {}; } })();
  let dirty = false;

  return openDocEditor({
    name: field?.config?.doc?.title || field?.label || 'Document',
    readOnly: !can('workspaces.manage', companyId),
    hostFields,
    hostValues: values,
    helpers: {
      formatDate: formatDate || ((value) => String(value ?? '')),
      memberName: memberName || ((id) => String(id ?? '')),
      recordTitle: (id) => {
        const linked = (app.items || []).find((entry) => entry.id === id);
        return linked && wbItemTitle ? wbItemTitle(companyId, app, linked) : String(id ?? '');
      },
      emailTo: emailField ? String(values[emailField.id] || '') : '',
    },
    // A record whose document has never been opened starts from the field’s own layout, which is
    // the same fallback the card on the record form uses. Without it, opening from a row would
    // show a blank page for a record that displays a thumbnail one click away.
    read: () => (docFilled(stored) ? stored : (field?.config?.doc || {})),
    write: (doc) => { item.values[fieldId] = JSON.stringify(doc); dirty = true; },
    onClose: () => {
      if (!dirty) return;
      wbSave(companyId);
      render?.();
    },
  });
}

/** Whether a stored value has anything in it, for the card that opens this. */
export { docFilled };
