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
  MAX_VERSIONS, MIN_MM, addElement, docFilled, elementText, isCropped, layerElement,
  moveElement, normalizeCrop, normalizeDoc, pageMm, removeElement, removeVersion, resizeElement,
  restoreVersion, saveVersion, setPage, shapePoints, styleElement, MAX_SIDES, MIN_SIDES,
} from './doc-model.js';
import { MM_TO_PT, jpegInfo, textWidth, wrapText, writePdf } from './doc-pdf.js';
import { fieldImageUrl, placeableFields, plainFieldText } from './host-values.js';
import { DOC_TEMPLATES, buildTemplate } from './doc-templates.js';

/** A point in millimetres. Font sizes are chosen in points and drawn in millimetres. */
const PT_TO_MM = 25.4 / 72;

/** How big an uploaded PDF may be. It rides inside the record's own value, so it has a ceiling. */
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

/** How far back Undo reaches. Sixty pages of snapshots is an afternoon's work and a few MB. */
const MAX_HISTORY = 60;

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]));

const uid = (prefix) => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

/**
 * Every shape, and what it is called.
 *
 * `sides` is what separates one regular polygon from another -- they are all one kind under the
 * model, so the palette is a list of starting points rather than a list of drawing routines.
 * A circle is an ellipse in a square box, which is what a circle IS; giving it its own kind
 * would be a second name for one shape and a second thing to keep in step.
 */
const SHAPE_BUTTONS = [
  ['rect', 'Box', 0, [50, 30]],
  ['ellipse', 'Oval', 0, [50, 30]],
  ['circle', 'Circle', 0, [40, 40]],
  ['line', 'Line', 0, [120, 2]],
  ['polygon', 'Triangle', 3, [44, 40]],
  ['polygon', 'Diamond', 4, [40, 40]],
  ['polygon', 'Pentagon', 5, [40, 40]],
  ['polygon', 'Hexagon', 6, [40, 40]],
  ['polygon', 'Heptagon', 7, [40, 40]],
  ['polygon', 'Octagon', 8, [40, 40]],
  ['polygon', 'Nonagon', 9, [40, 40]],
  ['polygon', 'Decagon', 10, [40, 40]],
  ['trapezoid', 'Trapezoid', 0, [50, 34]],
  ['right-triangle', 'Right triangle', 0, [44, 40]],
  ['star', 'Star', 0, [40, 40]],
];

/**
 * The palette button's picture: the shape itself, drawn.
 *
 * An icon font was the obvious thing and was the wrong thing -- it has no heptagon, no nonagon,
 * no decagon and no trapezoid, so four of these would have had to borrow a glyph that means
 * something else. Drawing them from the same corner list the document uses costs nothing, adds
 * no icon names for the alternative packs to have to cover, and means the button is a picture of
 * exactly what pressing it puts on the page.
 */
function shapeGlyph(shape, sides) {
  const points = shapePoints(shape === 'circle' ? 'ellipse' : shape, sides);
  const body = points
    ? `<polygon points="${points.map(([x, y]) => `${(x * 20).toFixed(2)},${(y * 20).toFixed(2)}`).join(' ')}" />`
    : {
      line: '<line x1="1" y1="10" x2="19" y2="10" />',
      ellipse: '<ellipse cx="10" cy="10" rx="9.2" ry="6.4" />',
      circle: '<circle cx="10" cy="10" r="8.4" />',
    }[shape] || '<rect x="1.2" y="3.4" width="17.6" height="13.2" rx="1.6" />';
  return `<svg class="fd-glyph" viewBox="0 0 20 20" aria-hidden="true" focusable="false">${body}</svg>`;
}

/** A shape's outline as a CSS clip-path, for the shapes that are a list of corners. */
function clipPathFor(el) {
  const points = shapePoints(el.shape, el.sides);
  if (!points) return '';
  return `clip-path:polygon(${points.map(([x, y]) => `${(x * 100).toFixed(3)}% ${(y * 100).toFixed(3)}%`).join(',')});`;
}

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

/**
 * The four colours anything on the page can be, without opening a colour wheel.
 *
 * Primary and secondary are the app's own accent colours, read from the stylesheet so a company
 * that re-themed the app gets ITS colours here rather than a hard-coded orange. Black and white
 * are not a theme -- they are what text and paper are -- so they are constants.
 */
const FALLBACK_PRESETS = { primary: '#e0552d', secondary: '#1e3a8a' };

export function presetColors(readVar) {
  const hex = (value, fallback) => {
    const raw = String(value || '').trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(raw)) return raw;
    if (/^#[0-9a-f]{3}$/.test(raw)) return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
    // A theme can hold anything in a custom property -- color-mix(), a var() chain, a name --
    // and a document stores a colour it has to be able to PRINT, so anything else is refused.
    return fallback;
  };
  return [
    { key: 'primary', label: 'Primary', color: hex(readVar('--accent'), FALLBACK_PRESETS.primary) },
    { key: 'secondary', label: 'Secondary', color: hex(readVar('--ink-2') || readVar('--amber'), FALLBACK_PRESETS.secondary) },
    { key: 'black', label: 'Black', color: '#111111' },
    { key: 'white', label: 'White', color: '#ffffff' },
  ];
}

/**
 * Where the source picture lands inside the box it is being drawn into.
 *
 * Shared by the screen and by both exports, because a crop that previews one way and prints
 * another is worse than no crop at all. The box here is the UNCROPPED area -- the crop windows
 * it afterwards -- which is what makes the same numbers work in CSS (an oversized <img> behind
 * `overflow: hidden`) and on a canvas.
 */
/**
 * The CSS keyword for a fit.
 *
 * `stretch` is the model's word and it is NOT a CSS value -- the keyword for it is `fill`. An
 * invalid value does not fall back to the default, it is DROPPED, which left the stylesheet's
 * `object-fit: contain` in charge and made Stretch render as Fit with nothing to show for it.
 * The model keeps its own word because "Fill" is already the name of a shape's colour.
 */
export function objectFitFor(fit) {
  return { stretch: 'fill', contain: 'contain', cover: 'cover' }[fit] || 'cover';
}

export function fitRect(fit, srcW, srcH, boxW, boxH) {
  const sw = Math.max(1, Number(srcW) || 1);
  const sh = Math.max(1, Number(srcH) || 1);
  if (fit === 'stretch') return { dx: 0, dy: 0, dw: boxW, dh: boxH };
  const ratio = fit === 'contain'
    ? Math.min(boxW / sw, boxH / sh)
    : Math.max(boxW / sw, boxH / sh);
  const dw = sw * ratio;
  const dh = sh * ratio;
  return { dx: (boxW - dw) / 2, dy: (boxH - dh) / 2, dw, dh };
}

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
  onSave,
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
  // Whether the template list is showing over a page that already has something on it.
  let templatesOpen = false;
  // Which element is having its crop adjusted. Separate from `sel` for the same reason `editing`
  // is: selecting a picture and choosing which part of it shows are two different intentions.
  let cropping = '';
  // Which control opened the file picker: an image element, or a shape being filled with one.
  let shapePicking = false;
  let iconList = null;
  let objectUrls = [];
  // Undo and redo, kept as whole-document snapshots rather than as a log of reversible
  // operations: every change already goes through one function, and a page is small enough
  // that holding sixty of them costs less than the bookkeeping an operation log needs to stay
  // honest about drags, restores and page-size changes all at once.
  let past = [];
  let future = [];
  // What the snapshot on top of `past` is a snapshot of. A burst of one gesture -- typing a
  // name, dragging the size box -- shares a mark and undoes as one step, because an undo per
  // keystroke is an undo nobody can use.
  let lastMark = '';

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

  /**
   * Every change goes through here, so nothing can be saved without being normalized first --
   * and nothing can be made without Undo being able to take it back.
   *
   * `before` is the state to go back TO, which is the current document for everything except a
   * drag: a drag has already moved the element a hundred times by the time it settles, so it
   * hands over the snapshot it took when the pointer went down.
   */
  function commit(next, { repaint = 'all', mark = '', before = doc } = {}) {
    if (readOnly) return;
    remember(before, mark);
    doc = normalizeDoc(next, () => uid('e'));
    write(doc);
    if (repaint === 'all') paint();
    else if (repaint === 'page') { paintPage(); syncHistory(); }
    else syncHistory();
  }

  function remember(before, mark) {
    // A repeat of the same mark adds nothing: the snapshot already on top is the state before
    // this burst began, which is where Undo should land.
    if (!(mark && mark === lastMark && past.length)) {
      past.push(before);
      if (past.length > MAX_HISTORY) past.shift();
    }
    lastMark = mark;
    // Anything new abandons the redo branch, the way every editor does it.
    future = [];
  }

  /** One step along the history, in either direction. */
  function step(from, to) {
    if (readOnly || !from.length) return false;
    to.push(doc);
    doc = normalizeDoc(from.pop(), () => uid('e'));
    // The next change starts a fresh burst, or undoing a title and typing again would fold
    // the two together.
    lastMark = '';
    write(doc);
    // A selection pointing at an element the step removed would leave the inspector
    // describing something that is no longer on the page.
    if (!doc.elements.some((el) => el.id === sel)) sel = '';
    editing = '';
    paint();
    return true;
  }

  const undo = () => step(past, future);
  const redo = () => step(future, past);

  /** The two buttons, after a change that repainted the page but not the header. */
  function syncHistory() {
    const set = (selector, on) => { const button = $(selector); if (button) button.disabled = !on; };
    set('[data-fd-undo]', past.length > 0);
    set('[data-fd-redo]', future.length > 0);
  }

  // --- what a field element says ----------------------------------------------------------------

  function wordsFor(el) {
    // A field element resolving to a PICTURE has no words. Printing "roof.jpg" next to the
    // photo -- or worse, instead of it -- is exactly the thing this stopped doing.
    if (imageFor(el)) return '';
    return elementText(el, {
      fields,
      values: hostValues,
      format: (field, raw) => plainFieldText(field, raw, helpers),
    });
  }

  /**
   * The picture a placed field is holding, if it is holding one.
   *
   * An image field dragged onto a proposal is the house, the damage or the logo: it is put there
   * to be LOOKED at. A filename is the right answer for a list of attachments and the wrong one
   * for a document, so a field that resolves to an image is drawn as one everywhere -- on the
   * page, in the PDF and in the exported picture, from this one function.
   */
  function imageFor(el) {
    if (!el || el.kind !== 'field' || !el.from) return '';
    return fieldPicture(el.from);
  }

  /** The picture a record's image field is holding right now. */
  function fieldPicture(fieldId) {
    const field = fields.find((entry) => entry.id === fieldId);
    return field ? fieldImageUrl(field, hostValues[fieldId]) : '';
  }

  /**
   * Any picture on the page, whatever is carrying it.
   *
   * An image element carries its own file, a shape can be FILLED with one -- uploaded, or read
   * live from the record's image field -- and a placed field resolves to one. Three ways in, one
   * answer, because the screen, the PDF and the exported picture all ask this question.
   */
  function pictureFor(el) {
    if (!el) return '';
    if (el.kind === 'image') return el.src || '';
    if (el.kind === 'shape') return el.src || (el.from ? fieldPicture(el.from) : '');
    return imageFor(el);
  }

  /**
   * The CSS that puts a cropped picture in a box.
   *
   * The <img> is sized to the UNCROPPED area and pulled up and left, with the box clipping it --
   * which is the same composition the exports draw, so what is previewed is what prints.
   */
  function cropStyle(el) {
    const crop = normalizeCrop(el.crop);
    const pct = (n) => `${(n * 100).toFixed(4)}%`;
    return `position:absolute;width:${pct(1 / crop.w)};height:${pct(1 / crop.h)};`
      + `left:-${pct(crop.x / crop.w)};top:-${pct(crop.y / crop.h)};`
      + `object-fit:${objectFitFor(el.fit)}`;
  }

  /**
   * Whether a placed field is drawn as a picture.
   *
   * True the moment it resolves to one, and true for an Image field even on a record that has
   * not got one yet -- an empty Image field is a picture slot, and should read as one while a
   * proposal is being laid out. A FILE field is not: it usually holds a signed scope or a
   * workbook, and only becomes a picture when what it is holding actually is one.
   */
  function drawsAsImage(el) {
    if (!el || el.kind !== 'field' || !el.from) return false;
    if (imageFor(el)) return true;
    return fields.find((entry) => entry.id === el.from)?.type === 'image';
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

  /**
   * The crop window, drawn over the element while its crop is being set.
   *
   * Four corners and a middle: drag the middle to move the window, a corner to resize it. The
   * numbers are fractions of the picture, so the same window means the same thing after the box
   * is resized or the file is replaced with a bigger one.
   */
  function cropMarkup(el) {
    if (cropping !== el.id || readOnly) return '';
    const crop = normalizeCrop(el.crop);
    const pct = (n) => `${(n * 100).toFixed(3)}%`;
    const corners = ['nw', 'ne', 'se', 'sw']
      .map((corner) => `<span class="fd-cropgrip fd-cropgrip-${corner}" data-fd-crop-grip="${corner}"></span>`).join('');
    return `<div class="fd-cropmask" data-fd-crop-mask>
      <div class="fd-cropwin" data-fd-crop-grip="move" style="left:${pct(crop.x)};top:${pct(crop.y)};width:${pct(crop.w)};height:${pct(crop.h)}">${corners}</div>
    </div>`;
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
      // A polygon is clipped rather than drawn: the same corner list the PDF walks, handed to
      // CSS. The picture inside is clipped with it, because clip-path takes the children too.
      const clip = clipPathFor(el);
      // The colour stays UNDER the picture rather than being replaced by it, so a shape whose
      // picture has not loaded (or whose record field is empty) is still a shape, not a hole.
      const picture = pictureFor(el);
      const inside = picture
        ? `<img class="fd-img" src="${esc(picture)}" alt="" draggable="false" style="${cropStyle(el)}" />`
        : '';
      // An outline on a clipped shape is drawn by the clip itself eating half the border, so a
      // polygon takes its stroke as a second, slightly larger shape behind it rather than as a
      // CSS border that would come out half the width it asked for.
      const outline = clip && el.style.stroke !== 'none' && el.style.strokeWidth > 0
        ? `<span class="fd-shape fd-shape-edge" style="background:${el.style.stroke};${clip}"></span>`
        : '';
      const inset = outline ? `inset:${Math.max(1, el.style.strokeWidth * scale).toFixed(2)}px;` : '';
      return `<div ${common}>${outline}<span class="fd-shape" style="background:${fill};${clip ? `${clip}${inset}` : `${stroke}border-radius:${radius}`}">${inside}</span>${cropMarkup(el)}${grips}</div>`;
    }

    // A placed field holding a picture is drawn as the picture, not as its filename. Checked
    // before the text path below, which is the one that used to print "roof.jpg" on a proposal.
    if (drawsAsImage(el)) {
      const src = imageFor(el);
      const field = fields.find((entry) => entry.id === el.from);
      const body = src
        ? `<span class="fd-imgbox"><img class="fd-img" src="${esc(src)}" alt="${esc(field?.label || 'Image')}" draggable="false" style="${cropStyle(el)}" /></span>`
        : `<span class="fd-ghost">${esc(field ? field.label : 'Pick a field')}</span>`;
      return `<div ${common}>${body}${cropMarkup(el)}${grips}</div>`;
    }

    if (el.kind === 'image') {
      const body = el.src
        ? `<span class="fd-imgbox"><img class="fd-img" src="${esc(el.src)}" alt="" draggable="false" style="${cropStyle(el)}" /></span>`
        : '<span class="fd-ghost">Pick an image</span>';
      return `<div ${common}>${body}${cropMarkup(el)}${grips}</div>`;
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

  /**
   * Start from something, or start from nothing.
   *
   * Offered up front while the page is empty -- which is when it is wanted and when it can do no
   * harm -- and behind a toggle afterwards, because replacing a layout somebody has been working
   * on is a decision, not a mis-click. The blank page is not a button here: it is what is already
   * on screen.
   */
  function templatesMarkup() {
    const empty = !doc.elements.length;
    if (!empty && !templatesOpen) {
      return `<div class="fd-group"><button class="btn btn-sm fd-w" type="button" data-fd-templates><i class="ti ti-layout-board-split"></i>Start from a template</button></div>`;
    }
    const cards = DOC_TEMPLATES.map((template) => `<button type="button" class="fd-tpl" data-fd-template="${esc(template.id)}">
      <b>${esc(template.name)}</b><span>${esc(template.hint)}</span>
    </button>`).join('');
    return `<div class="fd-group"><div class="fd-group-t">${empty ? 'Start from' : 'Replace with'}</div>
      <div class="fd-tpls">${cards}</div>
      <div class="fd-sub">${empty
    ? 'Or just start dragging things on -- a blank page is a fine place to begin.'
    : 'This replaces what is on the page. Undo puts it back.'}</div>
      ${empty ? '' : '<button class="btn btn-sm fd-w" type="button" data-fd-templates>Never mind</button>'}
    </div>`;
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
      ${templatesMarkup()}
      <div class="fd-group"><div class="fd-group-t">Put on the page</div>
        <button class="btn btn-sm fd-w" type="button" data-fd-add="text"><i class="ti ti-letter-case"></i>Text</button>
        <label class="fd-pick"><span><i class="ti ti-database"></i>A field from this record</span>
          <select class="wb-input" data-fd-add-field><option value="">— Choose a field —</option>${fieldOptions}</select>
        </label>
        <button class="btn btn-sm fd-w" type="button" data-fd-image-pick><i class="ti ti-photo"></i>Image</button>
        <button class="btn btn-sm fd-w" type="button" data-fd-icons><i class="ti ti-star"></i>Icon</button>
        <div class="fd-shapes">${SHAPE_BUTTONS.map(([shape, label, sides, size]) => `<button class="btn btn-sm" type="button" data-fd-add-shape="${shape}:${sides}:${size[0]}:${size[1]}" title="${esc(label)}" aria-label="${esc(label)}">${shapeGlyph(shape, sides)}</button>`).join('')}</div>
        ${iconsOpen ? `<div class="fd-icongrid" data-fd-icongrid>${iconGridMarkup()}</div>` : ''}
      </div>
      <div class="fd-group"><div class="fd-group-t">Paper</div>
        <label class="fd-pick"><span>Size</span>
          <select class="wb-input" data-fd-page-size>
            ${['a4', 'letter', 'legal'].map((size) => `<option value="${size}" ${doc.page.size === size ? 'selected' : ''}>${size.toUpperCase()}</option>`).join('')}
          </select>
        </label>
        <label class="fd-check"><input type="checkbox" data-fd-landscape ${doc.page.landscape ? 'checked' : ''}> Landscape</label>
        <label class="fd-pick"><span>Margin guide <b data-fd-margin-out>${doc.page.margin}</b> mm</span>
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
    // A field holding a picture has no typography to set. Offering Size, Bold and Colour over
    // an image is three controls that do nothing.
    const isWords = el.kind === 'text' || (el.kind === 'field' && !drawsAsImage(el));
    // Only the fields that can actually hold a picture are offered as a shape's fill.
    const imageFields = fields.filter((field) => ['image', 'file'].includes(field.type));
    // The four presets, then the wheel for anything else. Named rather than shown as four more
    // anonymous chips: "Primary" is a decision somebody can repeat on the next document, and
    // #e0552d is a number they would have to write down.
    const presets = presetColors((name) => {
      try { return window.getComputedStyle(document.documentElement).getPropertyValue(name); } catch { return ''; }
    });
    const swatch = (key, value, label) => `<label class="fd-color"><span>${label}</span>
      <span class="fd-presets">${presets.map((preset) => `<button type="button" class="fd-preset ${value === preset.color ? 'on' : ''}" data-fd-preset="${key}:${preset.color}" title="${esc(preset.label)}" aria-label="${esc(preset.label)}" style="background:${preset.color}"></button>`).join('')}</span>
      <input type="color" data-fd-style="${key}" value="${value === 'none' ? '#ffffff' : value}" title="Any other colour" />
      ${key !== 'color' ? `<button type="button" class="fd-none ${value === 'none' ? 'on' : ''}" data-fd-none="${key}" title="No ${label.toLowerCase()}">None</button>` : ''}
    </label>`;

    // Fit and crop, shared by an image element and a shape being filled with one.
    const pictureControls = (target) => `
      <div class="fd-btns">${[['cover', 'Fill'], ['contain', 'Fit'], ['stretch', 'Stretch']]
    .map(([fit, name]) => `<button type="button" class="fd-tog ${(target.fit || 'cover') === fit ? 'on' : ''}" data-fd-fit="${fit}" title="${name} the box">${name}</button>`).join('')}</div>
      <div class="fd-row">
        <button class="btn btn-sm ${cropping === target.id ? 'btn-primary' : ''}" type="button" data-fd-crop><i class="ti ti-crop"></i>${cropping === target.id ? 'Done cropping' : 'Crop'}</button>
        ${isCropped(target.crop) ? '<button class="btn btn-sm" type="button" data-fd-crop-reset title="Show the whole picture again">Reset</button>' : ''}
      </div>
      ${cropping === target.id ? '<div class="fd-sub">Drag the window to move it, a corner to resize it.</div>' : ''}`;

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
      ${drawsAsImage(el) ? '' : `<label class="fd-check"><input type="checkbox" data-fd-withlabel ${el.withLabel ? 'checked' : ''}> Print the field's name too</label>
      <label class="fd-pick"><span>If it is empty, print</span><input class="wb-input" data-fd-fallback value="${esc(el.fallback)}" placeholder="nothing" /></label>`}
      <div class="fd-sub">Read from the record every time the document is opened, so it is never out of date.</div>
      ${imageFor(el) ? pictureControls(el) : ''}
    </div>` : ''}
    ${el.kind === 'icon' ? `<div class="fd-group"><div class="fd-group-t">Icon</div>
      ${swatch('color', el.style.color, 'Colour')}
      <button class="btn btn-sm fd-w" type="button" data-fd-icons><i class="ti ti-star"></i>Choose a different one</button>
      ${iconsOpen ? `<div class="fd-icongrid">${(iconList || []).map((glyph) => `<button type="button" class="fd-iconopt ${el.glyph === glyph ? 'on' : ''}" data-fd-set-icon="${esc(glyph)}"><i class="ti ${esc(glyph)}"></i></button>`).join('')}</div>` : ''}
    </div>` : ''}
    ${el.kind === 'image' ? `<div class="fd-group"><div class="fd-group-t">Image</div>
      <button class="btn btn-sm fd-w" type="button" data-fd-image-pick><i class="ti ti-photo"></i>${el.src ? 'Replace it' : 'Choose a file'}</button>
      ${el.name ? `<div class="fd-sub">${esc(el.name)}</div>` : ''}
      ${el.src ? pictureControls(el) : ''}
    </div>` : ''}
    ${el.kind === 'shape' ? `<div class="fd-group"><div class="fd-group-t">Shape</div>
      <div class="fd-shapes">${SHAPE_BUTTONS.map(([shape, label, sides]) => `<button type="button" class="btn btn-sm ${el.shape === (shape === 'circle' ? 'ellipse' : shape) && (shape !== 'polygon' || el.sides === sides) ? 'on' : ''}" data-fd-shape="${shape}:${sides}" title="${esc(label)}" aria-label="${esc(label)}">${shapeGlyph(shape, sides)}</button>`).join('')}</div>
      ${el.shape === 'line' ? '' : swatch('fill', el.style.fill, 'Fill')}
      ${swatch('stroke', el.style.stroke, el.shape === 'line' ? 'Line' : 'Outline')}
      ${el.shape === 'line' ? '' : `<div class="fd-group-t fd-sub-t">Or fill it with a picture</div>
        <button class="btn btn-sm fd-w" type="button" data-fd-shape-image><i class="ti ti-photo"></i>${el.src ? 'Replace the picture' : 'Choose a file'}</button>
        <label class="fd-pick"><span>Or a picture from this record</span>
          <select class="wb-input" data-fd-shape-from>
            <option value="">— None —</option>
            ${imageFields.map((field) => `<option value="${esc(field.id)}" ${el.from === field.id ? 'selected' : ''}>${esc(field.label)}</option>`).join('')}
          </select>
        </label>
        ${pictureFor(el) ? `${pictureControls(el)}<button class="btn btn-sm fd-w" type="button" data-fd-shape-image-clear>Remove the picture</button>` : ''}`}
      ${el.shape === 'polygon' ? `<label class="fd-pick"><span>Sides <b data-fd-sides-out>${el.sides}</b></span>
        <input type="range" min="${MIN_SIDES}" max="${MAX_SIDES}" step="1" value="${el.sides}" data-fd-sides />
      </label>` : ''}
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
      ${readOnly ? '' : `<div class="fd-hist">
        <button class="wb-icon-btn" type="button" data-fd-undo title="Undo (Ctrl+Z)" aria-label="Undo" ${past.length ? '' : 'disabled'}><i class="ti ti-arrow-back-up"></i></button>
        <button class="wb-icon-btn" type="button" data-fd-redo title="Redo (Ctrl+Shift+Z)" aria-label="Redo" ${future.length ? '' : 'disabled'}><i class="ti ti-arrow-forward-up"></i></button>
      </div>`}
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
    if (sel !== id || editing) { sel = id; editing = ''; cropping = ''; paint(); }
    if (readOnly) return;
    const el = selected();
    if (!el) return;
    // A crop window sits ON TOP of the element, so its grips are checked first -- otherwise
    // every attempt to move the window would move the element underneath it instead.
    const cropGrip = event.target.closest('[data-fd-crop-grip]')?.dataset.fdCropGrip || '';
    if (cropping === id && cropGrip) {
      const node = event.target.closest('[data-fd-crop-mask]');
      const box = node?.getBoundingClientRect?.() || { width: 1, height: 1 };
      drag = {
        id,
        cropGrip,
        startX: event.clientX,
        startY: event.clientY,
        from: normalizeCrop(el.crop),
        boxW: Math.max(1, box.width),
        boxH: Math.max(1, box.height),
        moved: false,
        pointerId: event.pointerId,
        was: doc,
      };
      return;
    }
    const grip = event.target.closest('[data-fd-grip]')?.dataset.fdGrip || '';
    drag = {
      id,
      grip,
      startX: event.clientX,
      startY: event.clientY,
      from: { ...el },
      moved: false,
      pointerId: event.pointerId,
      // Where Undo goes back to. Taken now, because by the time the pointer lifts the document
      // has been rewritten on every pointermove.
      was: doc,
    };
    // Deliberately NOT captured here, and the default deliberately NOT prevented. A press that
    // turns out to be a click -- or the first half of a double-click -- has to reach the browser
    // as an ordinary one. Capturing the pointer retargets the click AND the dblclick that follow
    // it to the capturing node, and while that node was the overlay, `closest('[data-fd-el]')`
    // found nothing: double-clicking a text box did nothing at all, so nothing could be typed.
    // The capture is taken in pointermove instead, once this is definitely a drag.
  });

  overlay.addEventListener('pointermove', (event) => {
    if (!drag) return;
    if (drag.cropGrip) { cropMove(event); return; }
    const dxMm = (event.clientX - drag.startX) / scale;
    const dyMm = (event.clientY - drag.startY) / scale;
    if (!drag.moved && Math.abs(dxMm) < 0.3 && Math.abs(dyMm) < 0.3) return;
    if (!drag.moved) {
      drag.moved = true;
      // Now that it is a drag and not a click, the pointer is captured -- on the element being
      // dragged, never on the overlay -- so a fast drag that leaves the page still tracks
      // instead of dropping the element wherever the pointer happened to leave.
      const node = pageEl()?.querySelector(`[data-fd-el="${CSS.escape(drag.id)}"]`);
      try { node?.setPointerCapture?.(drag.pointerId); } catch { /* a pointer already gone */ }
      // And only now is the default prevented, which stops the page selecting text under the
      // drag without stopping the click that a press-and-release is.
      event.preventDefault();
    }
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

  /**
   * Dragging the crop window.
   *
   * Everything is in FRACTIONS of the element's box, which is the same rectangle the picture is
   * composed into -- so the numbers can be written straight onto the element with no conversion
   * and no dependence on the zoom.
   */
  function cropMove(event) {
    const dx = (event.clientX - drag.startX) / drag.boxW;
    const dy = (event.clientY - drag.startY) / drag.boxH;
    if (!drag.moved && Math.abs(dx) < 0.004 && Math.abs(dy) < 0.004) return;
    drag.moved = true;
    event.preventDefault();
    const was = drag.from;
    let next;
    if (drag.cropGrip === 'move') {
      // Clamped rather than refused: a window dragged past the edge stops at the edge, the same
      // way an element dragged off the paper does.
      next = {
        x: Math.min(1 - was.w, Math.max(0, was.x + dx)),
        y: Math.min(1 - was.h, Math.max(0, was.y + dy)),
        w: was.w,
        h: was.h,
      };
    } else {
      const west = drag.cropGrip.includes('w');
      const north = drag.cropGrip.includes('n');
      const right = was.x + was.w;
      const bottom = was.y + was.h;
      const x = west ? Math.min(right - 0.05, Math.max(0, was.x + dx)) : was.x;
      const y = north ? Math.min(bottom - 0.05, Math.max(0, was.y + dy)) : was.y;
      next = {
        x,
        y,
        w: west ? right - x : Math.min(1 - was.x, Math.max(0.05, was.w + dx)),
        h: north ? bottom - y : Math.min(1 - was.y, Math.max(0.05, was.h + dy)),
      };
    }
    doc = normalizeDoc({
      ...doc,
      elements: doc.elements.map((entry) => (entry.id === drag.id ? { ...entry, crop: next } : entry)),
    }, () => uid('e'));
    // The window and the picture under it both move, so this repaints the page rather than
    // nudging one node -- a crop is a handful of elements, not a hundred.
    paintPage();
  }

  overlay.addEventListener('pointerup', () => {
    if (!drag) return;
    const settled = drag;
    drag = null;
    // A click that never moved is a selection, already handled, and must not write a version of
    // the document identical to the one already stored.
    if (settled.moved) commit(doc, { before: settled.was, repaint: settled.cropGrip ? 'page' : 'all' });
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
    const tag = document.activeElement?.tagName;
    const inABox = editing || tag === 'INPUT' || tag === 'TEXTAREA';
    if ((event.ctrlKey || event.metaKey) && /^[zy]$/i.test(event.key)) {
      // Inside a box, the browser's own undo is the right one: it is undoing letters, not the
      // document, and taking that away from somebody mid-sentence is worse than not having it.
      if (inABox) return;
      event.preventDefault();
      const forward = event.key.toLowerCase() === 'y' || event.shiftKey;
      if (!(forward ? redo() : undo())) say(`Nothing left to ${forward ? 'redo' : 'undo'}.`);
      return;
    }
    if (readOnly || !sel) return;
    // Delete and the arrow keys belong to the text while it is being typed into.
    if (editing) return;
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

    if (hit('undo')) { if (!undo()) say('Nothing left to undo.'); return; }
    if (hit('redo')) { if (!redo()) say('Nothing left to redo.'); return; }

    // Clicking the paper but not an element clears the selection, which is how every editor
    // behaves and the only way to get the inspector's help text back.
    if (event.target.closest('[data-fd-page]') && !event.target.closest('[data-fd-el]')) {
      if (sel) { sel = ''; cropping = ''; paint(); }
      return;
    }

    if (hit('templates')) { templatesOpen = !templatesOpen; paint(); return; }

    const template = hit('template');
    if (template) {
      const built = buildTemplate(template.dataset.fdTemplate, fields);
      if (!built) return;
      // The page and what is on it, and nothing else: the document's name, its saved versions and
      // any uploaded PDF beside the design are the document's, not the template's.
      commit({ ...doc, page: built.page, elements: built.elements });
      templatesOpen = false;
      sel = '';
      paint();
      say('Template placed. Everything on it can be moved, retyped or deleted — and Undo takes it back.');
      return;
    }

    const add = hit('add');
    if (add) { place({ kind: add.dataset.fdAdd, text: 'New text', w: 80, h: 10 }); return; }

    const shape = hit('add-shape');
    if (shape) {
      // Each button carries its own starting box, because the size that makes a shape
      // recognisable is part of the shape: a line wants to be long and a pentagon wants to be
      // square, and arriving as the wrong rectangle means resizing before you can even see it.
      const [kind, sides, w, h] = String(shape.dataset.fdAddShape).split(':');
      place({
        kind: 'shape',
        shape: kind === 'circle' ? 'ellipse' : kind,
        sides: Number(sides) || 6,
        w: Number(w),
        h: Number(h),
      });
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
    if (shapeKind) {
      const [kind, sides] = String(shapeKind.dataset.fdShape).split(':');
      // A circle is an ellipse in a square box, which is what a circle IS -- so it changes the
      // BOX rather than being a second name for one shape.
      const el = selected();
      const square = kind === 'circle' && el ? { w: Math.min(el.w, el.h), h: Math.min(el.w, el.h) } : {};
      commit(styleElement(doc, sel, {
        shape: kind === 'circle' ? 'ellipse' : kind, sides: Number(sides) || 6, ...square,
      }));
      return;
    }

    const none = hit('none');
    if (none) { commit(styleElement(doc, sel, { style: { [none.dataset.fdNone]: 'none' } })); return; }

    const preset = hit('preset');
    if (preset) {
      const [key, color] = String(preset.dataset.fdPreset).split(':');
      commit(styleElement(doc, sel, { style: { [key]: color } }));
      return;
    }

    const fit = hit('fit');
    if (fit) { commit(styleElement(doc, sel, { fit: fit.dataset.fdFit })); return; }

    if (hit('crop')) {
      // A toggle, and selecting anything else leaves it -- a crop window over an element nobody
      // is looking at any more is a set of handles that do something surprising.
      cropping = cropping === sel ? '' : sel;
      paint();
      return;
    }

    if (hit('crop-reset')) { commit(styleElement(doc, sel, { crop: { x: 0, y: 0, w: 1, h: 1 } })); return; }

    if (hit('shape-image')) { shapePicking = true; $('[data-fd-image]').click(); return; }

    if (hit('shape-image-clear')) {
      // Both halves: an uploaded picture AND a record field, because either could be what is
      // showing and "remove the picture" means the shape goes back to being a colour.
      commit(styleElement(doc, sel, { src: '', from: '' }));
      return;
    }

    if (hit('versions')) { versionsOpen = !versionsOpen; paint(); return; }

    if (hit('save')) { saveNow(); return; }

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
   * Save the document where it lives.
   *
   * This button used to keep a VERSION and nothing else. It read as "saved" and was not: a
   * starting document laid out in a field's panel was still only in a hidden input, and closing
   * the panel took it with it -- press Save, close, reopen, blank page. Keeping a version is a
   * different thing, wanted far less often, and it has its own button inside Versions.
   *
   * Where "where it lives" is belongs to whoever opened the editor, so it says what it managed
   * to do rather than claiming a save it cannot see through.
   */
  function saveNow() {
    if (readOnly) return;
    // Written again first: an inspector box still focused has committed already, but a document
    // whose host input was replaced by a repaint underneath has not.
    write(doc);
    try {
      const said = (onSave ? onSave(doc) : '') || 'Saved.';
      say(said);
      // On the button as well as in the status line. The line lives at the foot of a
      // full-screen modal and is easy to press Save and never see, which reads as a button
      // that did nothing -- and sends people to the Versions panel to save it "properly".
      flashSaved();
    } catch (error) {
      say(`That could not be saved — ${error.message}`, 'bad');
    }
  }

  /** The Save button answers for a moment, then goes back to being a button. */
  function flashSaved() {
    const button = $('[data-fd-save]');
    if (!button) return;
    button.classList.add('ok');
    button.innerHTML = '<i class="ti ti-check"></i>Saved';
    setTimeout(() => {
      // Only if this is still the same button: a repaint in between has already drawn a fresh
      // one, and writing into a detached node would do nothing but look like a leak.
      if (!button.isConnected) return;
      button.classList.remove('ok');
      button.innerHTML = '<i class="ti ti-device-floppy"></i>Save';
    }, 1800);
  }

  /**
   * Keep what is on the page as a version.
   *
   * An unnamed save is stamped with the date and time rather than prompting: having to answer a
   * dialog every time is the reason people stop pressing a button. Whoever wants a name uses the
   * one in the Versions panel.
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
      // of the box on every keystroke. One mark for the whole burst, so a typed name is one undo.
      commit({ ...doc, title: target.value }, { repaint: false, mark: 'title' });
      return;
    }

    if (target.matches('[data-fd-sides]') && sel) {
      // The page only, and its own readout updated by hand: a full repaint rebuilds the rail
      // AND the inspector, which means rebuilding the slider being dragged.
      commit(styleElement(doc, sel, { sides: Number(target.value) }), { repaint: 'page', mark: `sides:${sel}` });
      const out = $('[data-fd-sides-out]');
      if (out) out.textContent = String(selected()?.sides ?? '');
      return;
    }

    if (target.matches('[data-fd-margin]')) {
      // The page only. A full repaint rebuilds the rail, which means rebuilding the slider being
      // dragged -- and a slider replaced under the pointer stops following it after one step.
      commit(setPage(doc, { margin: Number(target.value) }), { repaint: 'page', mark: 'margin' });
      const out = $('[data-fd-margin-out]');
      if (out) out.textContent = String(doc.page.margin);
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
      commit(next, { repaint: 'page', mark: `geo:${geo}:${sel}` });
      return;
    }

    const styleKey = target.dataset.fdStyle;
    if (styleKey && sel) {
      const raw = target.type === 'number' || target.type === 'range' ? Number(target.value) : target.value;
      commit(styleElement(doc, sel, { style: { [styleKey]: raw } }), { repaint: 'page', mark: `style:${styleKey}:${sel}` });
      return;
    }

    if (target.matches('[data-fd-fallback]') && sel) {
      commit(styleElement(doc, sel, { fallback: target.value }), { repaint: 'page', mark: `fallback:${sel}` });
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
      // A picture needs a picture-shaped box. Dropped into the 70x8 strip a line of text gets,
      // an image field arrives as a letterbox slit and has to be resized before it is even
      // recognisable.
      const picture = field?.type === 'image';
      if (picture) place({ kind: 'field', from, w: 60, h: 45 });
      else place({ kind: 'field', from, w: tall ? 90 : 70, h: tall ? 24 : 8 });
      target.value = '';
      return;
    }

    if (target.matches('[data-fd-page-size]')) { commit(setPage(doc, { size: target.value })); return; }
    if (target.matches('[data-fd-landscape]')) { commit(setPage(doc, { landscape: target.checked })); return; }
    if (target.matches('[data-fd-from]') && sel) { commit(styleElement(doc, sel, { from: target.value })); return; }
    if (target.matches('[data-fd-withlabel]') && sel) { commit(styleElement(doc, sel, { withLabel: target.checked })); return; }

    if (target.matches('[data-fd-shape-from]') && sel) {
      commit(styleElement(doc, sel, { from: target.value }));
      return;
    }

    if (target.matches('[data-fd-image]')) {
      const file = target.files?.[0];
      target.value = '';
      const forShape = shapePicking;
      shapePicking = false;
      if (!file) return;
      try {
        const src = await readDataUrl(file);
        if (forShape && sel) { commit(styleElement(doc, sel, { src, name: file.name })); return; }
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
    // A double-click that lands on the paper but not on an element still means the SELECTED
    // one, and this is what made text permanently unwritable-into: the first click of the pair
    // selects, selecting repaints the page, and the node that click landed on is gone by the
    // time the second arrives -- so the browser fires the dblclick at their nearest surviving
    // common ancestor, the paper. A pointer capture taken for a drag retargets it the same way.
    if (!host && !event.target.closest?.('[data-fd-page]')) return;
    const el = doc.elements.find((entry) => entry.id === (host?.dataset.fdEl || sel));
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
  function toJpeg(src, wMm, hMm, el = null) {
    return new Promise((resolve) => {
      const img = new Image();
      // A record's image field holds a link to the file bucket, not the bytes. Reading a
      // cross-origin picture back off a canvas taints it, and the taint throws at toDataURL --
      // so the fetch asks for CORS up front. Storage answers it; anything that does not simply
      // fails to load and the element is left off, which is what the catch below is for.
      if (!String(src || '').startsWith('data:')) img.crossOrigin = 'anonymous';
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
        // The same composition the screen draws: the picture is placed into the UNCROPPED area
        // by `fit`, then the crop windows it. Doing the arithmetic here rather than in the PDF
        // is what keeps the PDF writer free of clipping paths -- the crop is baked into the
        // bytes it embeds.
        const crop = normalizeCrop(el?.crop);
        const uw = canvas.width / crop.w;
        const uh = canvas.height / crop.h;
        const box = fitRect(el?.fit || 'cover', img.naturalWidth || img.width, img.naturalHeight || img.height, uw, uh);
        if (el && shapeClip(ctx, el, canvas.width, canvas.height)) ctx.clip();
        ctx.drawImage(img, box.dx - crop.x * uw, box.dy - crop.y * uh, box.dw, box.dh);
        // A canvas that was tainted anyway throws here rather than returning anything. One
        // picture that will not convert must not take the whole PDF with it.
        try { resolve(dataUrlBytes(canvas.toDataURL('image/jpeg', 0.9))); } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  /**
   * A picture filling a shape is trimmed to that shape.
   *
   * JPEG has no transparency, so the corners outside an oval come out WHITE rather than clear.
   * A document is printed on white paper, which is the one place that is not a compromise -- and
   * it buys a PDF with no clipping paths in it at all.
   *
   * @returns {boolean} whether a path was laid down for the caller to clip to
   */
  function shapeClip(ctx, el, w, h) {
    // Read off `clipShape`, not off `kind`: by the time the exports see it, a filled shape has
    // been handed over AS an image element, and its own outline is what it still has to be
    // trimmed to.
    const shape = el.clipShape || (el.kind === 'shape' ? el.shape : '');
    if (!shape || shape === 'line') return false;
    ctx.beginPath();
    const points = shapePoints(shape, el.sides);
    if (points) points.forEach(([px, py], i) => (i ? ctx.lineTo(px * w, py * h) : ctx.moveTo(px * w, py * h)));
    else if (shape === 'ellipse') ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    else if (ctx.roundRect) ctx.roundRect(0, 0, w, h, ((el.style?.radius || 0) / Math.max(el.w, 0.01)) * w);
    else ctx.rect(0, 0, w, h);
    ctx.closePath();
    return true;
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
    // A field holding a picture is handed to the writer AS an image element. The writer draws
    // by `kind`, so telling it the truth here is all it takes -- no second branch in the PDF.
    // A field resolving to a picture, and a shape FILLED with one, are both handed to the writer
    // as image elements -- the writer draws by `kind`, so telling it the truth here is all it
    // takes. A filled shape keeps its own entry too, drawn underneath, so its outline still
    // prints around the picture.
    const items = [];
    for (const el of doc.elements) {
      const picture = pictureFor(el);
      if (el.kind === 'shape' && picture) {
        items.push({ ...el, text: '' });
        items.push({ ...el, id: `${el.id}~img`, kind: 'image', src: picture, text: '', clipShape: el.shape });
      } else if (el.kind !== 'image' && picture) {
        items.push({ ...el, kind: 'image', src: picture, text: '' });
      } else {
        items.push({ ...el, text: wordsFor(el) });
      }
    }
    const images = [];
    for (const el of items) {
      if (el.kind !== 'image' && el.kind !== 'icon') continue;
      try {
        // Sequential on purpose: twenty images decoded at once is where a phone runs out of
        // memory, and an export is not a place to be clever.
        // eslint-disable-next-line no-await-in-loop
        const bytes = el.kind === 'icon' ? iconJpeg(el) : await toJpeg(el.src, el.w, el.h, el);
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
        const corners = shapePoints(el.shape, el.sides);
        if (corners) {
          corners.forEach(([cx, cy], i) => (i ? ctx.lineTo(x + cx * w, y + cy * h) : ctx.moveTo(x + cx * w, y + cy * h)));
          ctx.closePath();
        } else if (el.shape === 'ellipse') ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        else if (el.shape === 'line') { ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); }
        else if (ctx.roundRect) ctx.roundRect(x, y, w, h, px(el.style.radius));
        else ctx.rect(x, y, w, h);
        if (el.style.fill !== 'none' && el.shape !== 'line') { ctx.fillStyle = el.style.fill; ctx.fill(); }
        // eslint-disable-next-line no-await-in-loop
        const inside = el.shape === 'line' ? null : await loadImage(pictureFor(el)).catch(() => null);
        if (inside) {
          ctx.save();
          ctx.clip();
          drawPicture(ctx, inside, el, x, y, w, h);
          ctx.restore();
        }
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
      } else if ((el.kind === 'image' && el.src) || pictureFor(el)) {
        // eslint-disable-next-line no-await-in-loop
        const img = await loadImage(el.src || pictureFor(el)).catch(() => null);
        if (img) drawPicture(ctx, img, el, x, y, w, h);
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
    // toBlob throws on a tainted canvas rather than calling back, so the failure is turned
    // into a message instead of an unhandled rejection with no page behind it.
    return new Promise((done, fail) => {
      try { canvas.toBlob(done, 'image/png'); } catch { fail(new Error('a picture on the page could not be read back — it may be hosted somewhere that does not allow it')); }
    });
  }

  /**
   * One picture, composed the way the screen composes it.
   *
   * `fit` places the source in the UNCROPPED area, the crop windows it, and the caller has
   * already clipped to whatever shape it belongs in. The same three lines the PDF's own
   * rasteriser runs, so the two exports cannot disagree.
   */
  function drawPicture(ctx, img, el, x, y, w, h) {
    const crop = normalizeCrop(el.crop);
    const uw = w / crop.w;
    const uh = h / crop.h;
    const box = fitRect(el.fit || 'cover', img.naturalWidth || img.width, img.naturalHeight || img.height, uw, uh);
    ctx.save();
    // Clipped to the box even for a plain picture: `cover` deliberately overflows, and without
    // this it would spill across whatever is beside it.
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(img, x + box.dx - crop.x * uw, y + box.dy - crop.y * uh, box.dw, box.dh);
    ctx.restore();
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
      // Same reason as toJpeg: the exported PNG is read back off a canvas, and a picture
      // fetched without CORS taints it.
      if (!String(src || '').startsWith('data:')) img.crossOrigin = 'anonymous';
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
 * The name behind a company-contact id.
 *
 * The contact directory is company-wide and is NOT part of the workspace document, so it is read
 * off the app state the host handed over. Falls back to nothing, which lets the caller try its
 * other resolvers before giving up and printing the id.
 */
function contactNamer(state) {
  return (id) => {
    if (!id) return '';
    const found = (state?.companyContacts || []).find((contact) => contact && contact.id === id);
    return found ? String(found.name || '') : '';
  };
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
    wbSave, wbCollectModalDraft, fieldTypeLabel,
  } = ctx;
  const escapeId = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(fieldId) : fieldId;
  const find = () => document.querySelector(`[data-f="${escapeId}"]`);
  let holder = find();
  if (!holder) throw new Error('That form is no longer on the page. Reload and try again.');
  /**
   * The input the document is kept in, found again every single time it is used.
   *
   * The page underneath can repaint while the builder is open -- a toast does it, a save does
   * it, a refresh does it -- and a repaint replaces this input with a NEW one holding the value
   * from before the builder opened. Holding on to the first node meant every write after that
   * landed on a node nobody reads, and the next open read the stale replacement: which is
   * exactly what "I saved it, closed it, opened it, and it was blank" was.
   */
  const live = () => { const now = find(); if (now) holder = now; return holder; };

  /**
   * Save the document into whatever panel is holding it.
   *
   * Save used to keep a VERSION and nothing else, so a starting document laid out in a field's
   * panel was still only in that hidden input: close the panel and it was gone, which is what
   * "I pressed Save and it came back blank" was.
   *
   * Where the document belongs depends on what it is sitting in. A field's starting document
   * belongs to the field, and a field that already exists can be written to the app from here
   * without closing the panel over it. A record's document is saved with the record, whose own
   * Save button is one click away on the form behind -- half-submitting a form nobody finished
   * would be worse than saying so plainly.
   */
  function saveHost(doc) {
    const open = state?.builderModal;
    if (open?.kind === 'item') return 'Kept on the form — press Save on the record to store it.';
    if (open?.kind !== 'field' || !wbCollectModalDraft || !wbFind || !wbSave) {
      return 'Kept on the panel — press Save there to store it.';
    }
    // The document's name is typed in TWO places -- the box at the top of the builder and the
    // one on the panel behind it -- and the panel's is the one that gets stored. So a name
    // typed in the builder, which is the box that is actually on screen, was collected straight
    // over and lost: press Save, nothing you renamed survived. The builder's wins by being
    // written into the panel's box before it is read back.
    const named = document.getElementById?.('wbFormTitle');
    if (named && doc?.title && named.value !== doc.title) named.value = doc.title;
    // Reads the hidden input, and the rest of the panel with it, back into the draft -- so what
    // was just laid out is what gets stored, and a repaint after this draws the new document
    // rather than the one the panel opened with.
    wbCollectModalDraft();
    const app = wbFind(open.companyId, open.workspaceId, open.appId).app;
    const target = open.collectionId ? (app?.collections || []).find((c) => c.id === open.collectionId) : app;
    const at = open.editId ? (target?.fields || []).findIndex((f) => f.id === open.editId) : -1;
    // A field still being ADDED has nowhere to go yet: putting it on the app now would create a
    // field behind the back of somebody who has not pressed Add field.
    if (at < 0) return `Kept on the panel — press "${open.editId ? 'Save field' : 'Add field'}" to put it on the app.`;
    // The same default the dialog's own Save applies, so the shorter route cannot leave a field
    // nameless.
    open.draft.label = String(open.draft.label || '').trim()
      || `Untitled ${fieldTypeLabel ? fieldTypeLabel(open.draft.type) : open.draft.type} field`;
    target.fields[at] = open.draft;
    wbSave(open.companyId);
    return 'Saved to the field. Every record starts from this layout.';
  }

  /** Closing over a field's panel: redraw it so the thumbnail catches up with the document. */
  function doneHost() {
    // Only the field panel. A record's form is drawn from a draft that does NOT hold what has
    // been typed into it, so repainting one would take the rest of the form down with it.
    if (state?.builderModal?.kind !== 'field' || !wbCollectModalDraft) return;
    wbCollectModalDraft();
    render?.();
  }

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
      contactName: contactNamer(state),
      emailTo: emailField ? String(hostValues[emailField.id] || '') : '',
      who: state?.session?.profile?.id || '',
    },
    read: () => { try { return JSON.parse(live().value || '{}'); } catch { return {}; } },
    write: (doc) => {
      const input = live();
      input.value = JSON.stringify(doc);
      // The same two events an ordinary input fires, so whatever is watching the form -- the
      // draft collector, the dirty flag, the save button -- sees this as a normal edit.
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    onSave: saveHost,
    onClose: doneHost,
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
    wbDoc, wbSave, render, can, formatDate, memberName, wbItemTitle, state,
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
      contactName: contactNamer(state),
      emailTo: emailField ? String(values[emailField.id] || '') : '',
    },
    // A record whose document has never been opened starts from the field’s own layout, which is
    // the same fallback the card on the record form uses. Without it, opening from a row would
    // show a blank page for a record that displays a thumbnail one click away.
    read: () => (docFilled(stored) ? stored : (field?.config?.doc || {})),
    write: (doc) => { item.values[fieldId] = JSON.stringify(doc); dirty = true; },
    // A record's document is saved with the record, and from here that is one call -- so Save
    // means saved, not "kept a version and hoped".
    onSave: () => {
      wbSave(companyId);
      dirty = false;
      render?.();
      return 'Saved to the record.';
    },
    onClose: () => {
      if (!dirty) return;
      wbSave(companyId);
      render?.();
    },
  });
}

/** Whether a stored value has anything in it, for the card that opens this. */
export { docFilled };
