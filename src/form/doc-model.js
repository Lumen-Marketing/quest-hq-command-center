// The Form field's document: a page you arrange by hand, printed to PDF or to an image.
//
// This is the half of the Form field the earlier model does not describe. form-model.js knows
// about NAMED FIELDS and what they are worth; this knows about a PAGE and where things sit on
// it. They are separate on purpose: a proposal is a layout whose text happens to come from a
// record, so the arithmetic and the geometry have no business in one file.
//
// Everything is in MILLIMETRES on the page, never in pixels or in percentages:
//   - a millimetre is what the paper is measured in, so an element 20 mm from the top edge is
//     20 mm from the top edge of the printout, at any zoom and on any screen;
//   - a percentage would move things when the page size changed, which is exactly what somebody
//     switching A4 to Letter does not want.
// The editor scales mm to screen pixels for display only, and the PDF writer scales mm to
// points. Neither ever writes a pixel back into the document.
//
// Pure: shapes, clamping and text resolution, no DOM. The point is that a page can be laid out,
// checked and exported in a test -- the Sheet field shipped broken with 2,973 tests green
// because nothing called the code, and this file exists to be called.

import { PAGE_SIZES, normalizePage } from './form-model.js';

/** What can sit on the page. */
export const ELEMENT_KINDS = ['text', 'field', 'image', 'icon', 'shape'];

/** The shapes worth having: a box, an oval, and a rule. */
export const SHAPE_KINDS = ['rect', 'ellipse', 'line', 'polygon', 'trapezoid', 'right-triangle', 'star'];

/** How many sides a regular polygon may have. Three is a triangle; past ten it reads as a circle. */
export const MIN_SIDES = 3;
export const MAX_SIDES = 10;

/**
 * A shape as a list of corners, in fractions of its own box.
 *
 * Everything with straight edges is ONE drawing problem -- a path through some points -- so
 * rather than a branch per shape in the editor, in the PDF writer and on the export canvas,
 * each of them names its corners here and the three renderers all walk the same list. A regular
 * polygon is generated rather than tabulated, which is what makes "3 to 10 sides" a number
 * somebody drags instead of eight more entries.
 *
 * Inscribed in the box rather than kept regular, so a hexagon stretched into a wide box becomes
 * a wide hexagon -- which is what dragging a corner in a drawing tool has always meant.
 *
 * @returns {Array<[number, number]>|null} null for the shapes that are not polygons at all
 */
export function shapePoints(shape, sides = 6) {
  if (shape === 'rect' || shape === 'ellipse' || shape === 'line') return null;
  if (shape === 'trapezoid') return [[0.2, 0], [0.8, 0], [1, 1], [0, 1]];
  if (shape === 'right-triangle') return [[0, 0], [0, 1], [1, 1]];
  if (shape === 'star') {
    // Five points, which is what "a star" means to everyone who is not an astronomer.
    return Array.from({ length: 10 }, (_, i) => {
      const reach = i % 2 ? 0.21 : 0.5;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      return [0.5 + reach * Math.cos(angle), 0.5 + reach * Math.sin(angle)];
    });
  }
  const n = Math.min(MAX_SIDES, Math.max(MIN_SIDES, Math.round(Number(sides) || 6)));
  // First corner at the top, so a triangle points up and a pentagon sits the way one is drawn.
  return Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle)];
  });
}

export const TEXT_ALIGN = ['left', 'center', 'right'];

/** Where a document's content comes from. A designed page, or a PDF somebody already had. */
export const DOC_SOURCES = ['design', 'upload'];

/** How a picture sits in a box it does not share proportions with. */
export const IMAGE_FITS = ['cover', 'contain', 'stretch'];

/**
 * Which part of a picture shows, as fractions of the picture itself.
 *
 * Fractions rather than pixels so a crop survives the file being re-uploaded at another size,
 * and so the same numbers mean the same thing on screen, in the PDF and in the exported image.
 * The whole picture is { x: 0, y: 0, w: 1, h: 1 }, which is what "not cropped" is stored as --
 * there is no separate flag to get out of step with the numbers.
 */
export function normalizeCrop(raw) {
  const box = raw && typeof raw === 'object' ? raw : {};
  const frac = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback;
  };
  const x = frac(box.x, 0);
  const y = frac(box.y, 0);
  // A zero-width crop shows nothing at all, so the minimum is a twentieth of the picture --
  // small enough for any real crop and large enough that a stray drag cannot erase the image.
  const w = Math.min(1 - x, Math.max(0.05, frac(box.w, 1)));
  const h = Math.min(1 - y, Math.max(0.05, frac(box.h, 1)));
  return {
    x: round(x * 10000) / 10000,
    y: round(y * 10000) / 10000,
    w: round(w * 10000) / 10000,
    h: round(h * 10000) / 10000,
  };
}

/** Whether a crop actually takes anything off. */
export const isCropped = (crop) => {
  const c = normalizeCrop(crop);
  return c.x > 0 || c.y > 0 || c.w < 1 || c.h < 1;
};

/** Nothing smaller than this can be grabbed with a mouse, so nothing may be made smaller. */
export const MIN_MM = 4;

/** Enough history to undo a bad afternoon; not enough to bloat the record it lives in. */
export const MAX_VERSIONS = 20;

const str = (v) => String(v ?? '').trim();
const num = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
const bool = (v) => v === true || v === 'true' || v === 1;
const round = (v) => Math.round(v * 100) / 100;

/** A colour is interpolated into markup and into a PDF, so only real ones get through. */
export function normalizeColor(input, fallback = '#111111') {
  const raw = str(input).toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(raw)) return raw;
  if (/^#[0-9a-f]{3}$/.test(raw)) return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
  // 'none' is a real answer for a fill: a box with an outline and nothing inside it.
  if (raw === 'none') return 'none';
  return fallback;
}

/** #rrggbb as three 0..1 channels, which is what a PDF content stream wants. */
export function colorChannels(color) {
  const hex = normalizeColor(color, '#000000');
  if (hex === 'none') return null;
  return [1, 3, 5].map((i) => round(parseInt(hex.slice(i, i + 2), 16) / 255));
}

/** The page in millimetres, the way it will actually be printed. */
export function pageMm(page) {
  const p = normalizePage(page);
  const [w, h] = PAGE_SIZES[p.size];
  return p.landscape ? [h, w] : [w, h];
}

function normalizeStyle(raw) {
  return {
    // Points, the unit a font is chosen in everywhere else in the world.
    size: Math.min(96, Math.max(5, num(raw.size, 11))),
    bold: bool(raw.bold),
    italic: bool(raw.italic),
    underline: bool(raw.underline),
    align: TEXT_ALIGN.includes(raw.align) ? raw.align : 'left',
    color: normalizeColor(raw.color, '#111111'),
    // 'none' is the common answer for text and the uncommon one for a shape, so each kind
    // supplies its own default rather than sharing one here.
    fill: normalizeColor(raw.fill, 'none'),
    stroke: normalizeColor(raw.stroke, 'none'),
    strokeWidth: Math.min(20, Math.max(0, num(raw.strokeWidth, 0))),
    radius: Math.min(40, Math.max(0, num(raw.radius, 0))),
    opacity: Math.min(1, Math.max(0.05, num(raw.opacity, 1))),
  };
}

/**
 * One thing on the page.
 *
 * A `field` element is the reason this is not a drawing program: it holds `from` -- the HOST
 * record's field id -- and reads that value live, so a proposal laid out in March still shows
 * today's address. It stores no copy of the value, which is what stops a document going stale.
 */
export function normalizeElement(input, makeId = (() => `e${Math.random().toString(36).slice(2, 8)}`)) {
  const raw = input && typeof input === 'object' ? input : {};
  const kind = ELEMENT_KINDS.includes(raw.kind) ? raw.kind : 'text';
  const style = normalizeStyle(raw.style && typeof raw.style === 'object' ? raw.style : {});
  const el = {
    id: str(raw.id) || makeId(),
    kind,
    x: round(Math.max(0, num(raw.x, 10))),
    y: round(Math.max(0, num(raw.y, 10))),
    w: round(Math.max(MIN_MM, num(raw.w, 60))),
    h: round(Math.max(MIN_MM, num(raw.h, 10))),
    style,
  };
  if (kind === 'text') el.text = String(raw.text ?? '');
  if (kind === 'field') {
    el.from = str(raw.from);
    // OFF by default. A placed field prints the VALUE -- "Acme Roofing", not "Client: Acme
    // Roofing" -- because a document says what it says in its own words, and whoever wanted a
    // heading has already typed one above the box. The checkbox is still there for the cases
    // that read better with it, and a document that stored `true` keeps it.
    el.withLabel = raw.withLabel === true;
    el.fallback = String(raw.fallback ?? '');
  }
  // How a picture fills its box, and which part of it shows. On EVERY kind that can draw one --
  // a placed image, a shape filled with one, and a record field pointing at one. Leaving it off
  // the field was a silent bug of the worst shape: the button wrote the value, normalising threw
  // it straight back away, and nothing anywhere said no.
  if (kind === 'image' || kind === 'shape' || kind === 'field') {
    el.fit = IMAGE_FITS.includes(raw.fit) ? raw.fit : 'cover';
    el.crop = normalizeCrop(raw.crop);
  }
  if (kind === 'image') {
    el.src = str(raw.src);
    el.name = str(raw.name);
  }
  if (kind === 'icon') {
    // A Tabler class name, the same vocabulary every other icon picker in the app speaks.
    el.glyph = /^ti-[a-z0-9-]+$/.test(str(raw.glyph)) ? str(raw.glyph) : 'ti-star';
    el.style.color = normalizeColor(raw.style?.color, '#e0552d');
  }
  if (kind === 'shape') {
    el.shape = SHAPE_KINDS.includes(raw.shape) ? raw.shape : 'rect';
    el.sides = Math.min(MAX_SIDES, Math.max(MIN_SIDES, Math.round(num(raw.sides, 6))));
    // A shape can be filled with a PICTURE instead of a colour: an uploaded one in `src`, or a
    // live one from the record's own image field in `from`. The colour stays underneath either
    // way, so a shape whose picture has not arrived yet is still a shape and not a hole.
    el.src = str(raw.src);
    el.from = str(raw.from);
    el.style.fill = normalizeColor(raw.style?.fill, el.shape === 'line' ? 'none' : '#e5e7eb');
    el.style.stroke = normalizeColor(raw.style?.stroke, '#111111');
    el.style.strokeWidth = Math.min(20, Math.max(el.shape === 'line' ? 0.2 : 0, num(raw.style?.strokeWidth, el.shape === 'line' ? 0.6 : 0)));
  }
  return el;
}

function normalizeVersion(raw, makeId) {
  const v = raw && typeof raw === 'object' ? raw : {};
  return {
    id: str(v.id) || makeId(),
    name: str(v.name) || 'Saved version',
    at: str(v.at),
    by: str(v.by),
    title: str(v.title),
    page: normalizePage(v.page),
    elements: (Array.isArray(v.elements) ? v.elements : []).map((e) => normalizeElement(e, makeId)),
  };
}

/**
 * A whole document: the page, what is on it, what was saved before, and an uploaded PDF.
 *
 * `upload` sits beside the design rather than replacing it, because somebody who uploads a
 * signed PDF this month may still want the layout they built last month. `source` says which
 * one is the document right now; both survive either way.
 */
export function normalizeDoc(input, makeId = (() => `e${Math.random().toString(36).slice(2, 8)}`)) {
  const raw = input && typeof input === 'object' ? input : {};
  const upload = raw.upload && typeof raw.upload === 'object' && str(raw.upload.src)
    ? { name: str(raw.upload.name) || 'Document.pdf', src: str(raw.upload.src), at: str(raw.upload.at) }
    : null;
  return {
    title: str(raw.title),
    page: normalizePage(raw.page),
    elements: (Array.isArray(raw.elements) ? raw.elements : []).map((e) => normalizeElement(e, makeId)),
    versions: (Array.isArray(raw.versions) ? raw.versions : []).slice(0, MAX_VERSIONS).map((v) => normalizeVersion(v, makeId)),
    upload,
    // An upload that has been removed cannot leave the document pointing at it.
    source: DOC_SOURCES.includes(raw.source) && !(raw.source === 'upload' && !upload) ? raw.source : 'design',
  };
}

/** Is there anything to show? Used to pick "Open form" over "Start the document". */
export function docFilled(doc) {
  const d = normalizeDoc(doc);
  return !!(d.upload || d.elements.length);
}

/**
 * Keep an element on the paper.
 *
 * Clamped rather than refused: dragging past the edge should stop at the edge, which is what
 * every other editor does. An element bigger than the page is shrunk to it, so a document can
 * never hold something that cannot be printed.
 */
export function clampElement(el, page) {
  const [pw, ph] = pageMm(page);
  const w = round(Math.min(pw, Math.max(MIN_MM, el.w)));
  const h = round(Math.min(ph, Math.max(MIN_MM, el.h)));
  return {
    ...el,
    w,
    h,
    x: round(Math.min(pw - w, Math.max(0, el.x))),
    y: round(Math.min(ph - h, Math.max(0, el.y))),
  };
}

/** Put an element somewhere. */
export function moveElement(doc, id, x, y) {
  return {
    ...doc,
    elements: doc.elements.map((el) => (el.id === id ? clampElement({ ...el, x: num(x, el.x), y: num(y, el.y) }, doc.page) : el)),
  };
}

/**
 * Resize an element by dragging one of its eight handles.
 *
 * Dragging the top or left edge moves the opposite edge nowhere, which means x and y change as
 * w and h do -- getting that wrong makes a box appear to jump when grabbed by its top-left
 * corner, and it is the single most noticeable bug in an editor like this.
 */
export function resizeElement(doc, id, handle, dxMm, dyMm) {
  const grip = String(handle || 'se');
  return {
    ...doc,
    elements: doc.elements.map((el) => {
      if (el.id !== id) return el;
      const next = { ...el };
      if (grip.includes('e')) next.w = el.w + dxMm;
      if (grip.includes('s')) next.h = el.h + dyMm;
      if (grip.includes('w')) { next.w = el.w - dxMm; next.x = el.x + dxMm; }
      if (grip.includes('n')) { next.h = el.h - dyMm; next.y = el.y + dyMm; }
      // A drag that would invert the box stops at the minimum, and the moving edge stops with
      // it -- otherwise the box walks across the page while staying the same size.
      if (next.w < MIN_MM) { next.x = grip.includes('w') ? el.x + el.w - MIN_MM : el.x; next.w = MIN_MM; }
      if (next.h < MIN_MM) { next.y = grip.includes('n') ? el.y + el.h - MIN_MM : el.y; next.h = MIN_MM; }
      return clampElement(next, doc.page);
    }),
  };
}

/** Restyle an element. Given as a patch so the inspector can send one property at a time. */
export function styleElement(doc, id, patch) {
  return {
    ...doc,
    elements: doc.elements.map((el) => (el.id === id
      ? normalizeElement({ ...el, ...patch, style: { ...el.style, ...(patch.style || {}) } })
      : el)),
  };
}

/** Front, back, forward, backward. Order in the array IS paint order, so this is a reorder. */
export function layerElement(doc, id, where) {
  const from = doc.elements.findIndex((el) => el.id === id);
  if (from < 0) return doc;
  const to = {
    front: doc.elements.length - 1,
    back: 0,
    forward: Math.min(doc.elements.length - 1, from + 1),
    backward: Math.max(0, from - 1),
  }[String(where)];
  if (to == null || to === from) return doc;
  const elements = [...doc.elements];
  elements.splice(to, 0, ...elements.splice(from, 1));
  return { ...doc, elements };
}

export function addElement(doc, input, makeId) {
  const el = clampElement(normalizeElement(input, makeId), doc.page);
  return { ...doc, elements: [...doc.elements, el] };
}

export function removeElement(doc, id) {
  return { ...doc, elements: doc.elements.filter((el) => el.id !== id) };
}

/**
 * Changing the page size has to bring the contents with it.
 *
 * Anything now hanging off the edge is pulled back on, because a silently-cropped element is
 * worse than a moved one: it prints as nothing and nobody knows why.
 */
export function setPage(doc, patch) {
  const page = normalizePage({ ...doc.page, ...patch });
  return { ...doc, page, elements: doc.elements.map((el) => clampElement(el, page)) };
}

/**
 * Save what is on the page as a version.
 *
 * A snapshot of the design only -- versions never nest, so a document cannot grow by squaring
 * every time somebody presses Save.
 */
export function saveVersion(doc, name, at, by, makeId = (() => `v${Math.random().toString(36).slice(2, 8)}`)) {
  const version = normalizeVersion({
    id: makeId(), name: str(name) || 'Saved version', at, by, title: doc.title, page: doc.page, elements: doc.elements,
  }, makeId);
  // Newest first: a list of versions is read from the top, and the one just saved is the one
  // being looked for.
  return { ...doc, versions: [version, ...doc.versions].slice(0, MAX_VERSIONS) };
}

/** Put a saved version back on the page, keeping the version list itself intact. */
export function restoreVersion(doc, versionId) {
  const version = doc.versions.find((v) => v.id === versionId);
  if (!version) return doc;
  return {
    ...doc, title: version.title || doc.title, page: version.page, elements: version.elements.map((el) => ({ ...el })),
  };
}

export function removeVersion(doc, versionId) {
  return { ...doc, versions: doc.versions.filter((v) => v.id !== versionId) };
}

/**
 * The words an element actually prints.
 *
 * A field element is resolved here rather than in the editor so the preview, the PDF and the
 * image all say the same thing -- three renderers reading one function is the only way they
 * stay in agreement.
 */
export function elementText(el, { values = {}, fields = [], format } = {}) {
  if (!el) return '';
  if (el.kind === 'text') return String(el.text ?? '');
  if (el.kind !== 'field') return '';
  const field = fields.find((f) => f && f.id === el.from);
  const raw = values[el.from];
  const shown = format ? format(field, raw) : (raw == null ? '' : String(raw));
  const body = str(shown) || str(el.fallback);
  if (!el.withLabel) return body;
  const label = str(field?.label);
  // A label with nothing after it is noise on a proposal, so the whole element goes quiet.
  if (!label) return body;
  return body ? `${label}: ${body}` : '';
}

/** Which host fields a document is reading, so a field the record lost can be pointed out. */
export function docFieldRefs(doc) {
  return normalizeDoc(doc).elements.filter((el) => el.kind === 'field' && el.from).map((el) => el.from);
}

/** A default box for a newly-added element, placed where it will be seen and not overlap. */
export function nextSpot(doc, w, h) {
  const [pw, ph] = pageMm(doc.page);
  const margin = normalizePage(doc.page).margin;
  const step = 6;
  const used = doc.elements.length;
  return {
    x: round(Math.min(pw - w, margin + (used % 6) * step)),
    y: round(Math.min(ph - h, margin + (used % 6) * step + Math.floor(used / 6) * step)),
  };
}
