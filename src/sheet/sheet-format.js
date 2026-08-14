// What a sheet looks like, and how its shape changes.
//
// "Add this basic tool on the sheet field... I want it to inherit the formula, colour, the cell
// line, text colour, cell colour, and I can also multi-select on the sheet, insert and delete
// rows and columns on the specific row or column, format width and height. It is like a working
// Microsoft Excel file, where I can also export it as an Excel file, or import a spreadsheet."
//
// sheet-model.js is the arithmetic. This is everything else about a cell: how it is painted, how
// many of them are selected, and what happens to the references in a formula when a row is
// inserted above them.
//
// Pure. No DOM, no state. The grid draws what this returns and a test can insert a row and check
// that =SUM(A1:A9) became =SUM(A2:A10) without a browser.

import { MAX_COLS, MAX_ROWS, cellRef, columnName, normalizeSheet, parseRef } from './sheet-model.js';

/**
 * A sheet with its formatting, in the shape the field stores.
 *
 * sheet-model's normalizeSheet owns the cells and the size; this adds everything a cell is
 * PAINTED with. It wraps rather than replaces so the dependency runs one way -- the arithmetic
 * has no business knowing what colour anything is.
 */
export function normalizeSheetFull(input) {
  const base = normalizeSheet(input);
  return {
    ...base,
    styles: normalizeStyles(input?.styles, base.rows, base.cols),
    merges: normalizeMerges(input?.merges, base.rows, base.cols),
    colW: normalizeSizes(input?.colW, base.cols),
    rowH: normalizeSizes(input?.rowH, base.rows),
  };
}

// ---- selections ------------------------------------------------------------------------------

/** A rectangle of cells, held corner to corner and always kept the right way round. */
export function rangeOf(fromRef, toRef) {
  const from = parseRef(fromRef);
  const to = parseRef(toRef || fromRef);
  if (!from || !to) return null;
  return {
    r1: Math.min(from.row, to.row),
    c1: Math.min(from.col, to.col),
    r2: Math.max(from.row, to.row),
    c2: Math.max(from.col, to.col),
  };
}

/** "A1:C4" -> a range. A single "B2" is the 1x1 range, because everything else here takes one. */
export function parseRange(text) {
  const [from, to] = String(text || '').toUpperCase().split(':');
  return rangeOf(from, to || from);
}

export function rangeLabel(range) {
  if (!range) return '';
  const from = cellRef(range.r1, range.c1);
  return range.r1 === range.r2 && range.c1 === range.c2 ? from : `${from}:${cellRef(range.r2, range.c2)}`;
}

/** Every ref inside a range, row by row. */
export function refsIn(range) {
  if (!range) return [];
  const out = [];
  for (let row = range.r1; row <= range.r2; row += 1) {
    for (let col = range.c1; col <= range.c2; col += 1) out.push(cellRef(row, col));
  }
  return out;
}

export const rangeHas = (range, ref) => {
  const at = parseRef(ref);
  return !!(range && at && at.row >= range.r1 && at.row <= range.r2 && at.col >= range.c1 && at.col <= range.c2);
};

export const rangeSize = (range) => (range ? (range.r2 - range.r1 + 1) * (range.c2 - range.c1 + 1) : 0);

/** A whole row or column, clamped to the sheet -- what clicking a header selects. */
export const rowRange = (sheet, row, through = row) => ({
  r1: Math.min(row, through), c1: 0, r2: Math.max(row, through), c2: Math.max(0, sheet.cols - 1),
});
export const colRange = (sheet, col, through = col) => ({
  r1: 0, c1: Math.min(col, through), r2: Math.max(0, sheet.rows - 1), c2: Math.max(col, through),
});

// ---- how a cell is painted -------------------------------------------------------------------

// Kept short on purpose: this map is stored on the record, once per styled cell, and `fontWeight`
// spelled out 400 times is the difference between a field and a payload.
const STYLE_KEYS = ['b', 'i', 'u', 'fg', 'bg', 'ha', 'va', 'wrap', 'ff', 'fs', 'bd', 'bc', 'nf'];
const ALIGN_H = ['left', 'center', 'right'];
const ALIGN_V = ['top', 'middle', 'bottom'];

export const FONTS = ['Arial', 'Calibri', 'Georgia', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'];
export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48];
export const DEFAULT_FONT = 'Arial';
export const DEFAULT_SIZE = 11;

/** The border edges a cell can carry, as a set of letters: t, r, b, l. */
const EDGES = ['t', 'r', 'b', 'l'];
export const BORDER_PRESETS = ['all', 'outer', 'top', 'right', 'bottom', 'left', 'none'];

const hex = (value) => {
  const text = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : '';
};

/** One cell's style, with anything unrecognised dropped rather than stored for ever. */
export function normalizeStyle(input) {
  if (!input || typeof input !== 'object') return null;
  const out = {};
  if (input.b) out.b = 1;
  if (input.i) out.i = 1;
  if (input.u) out.u = 1;
  if (input.wrap) out.wrap = 1;
  const fg = hex(input.fg); if (fg) out.fg = fg;
  const bg = hex(input.bg); if (bg) out.bg = bg;
  const bc = hex(input.bc); if (bc) out.bc = bc;
  if (ALIGN_H.includes(input.ha)) out.ha = input.ha;
  if (ALIGN_V.includes(input.va)) out.va = input.va;
  if (FONTS.includes(input.ff)) out.ff = input.ff;
  const size = Number(input.fs);
  if (Number.isFinite(size) && size >= 6 && size <= 96) out.fs = Math.round(size);
  const bd = String(input.bd || '').toLowerCase().split('').filter((edge) => EDGES.includes(edge));
  if (bd.length) out.bd = [...new Set(bd)].sort().join('');
  if (NUMBER_FORMATS.some((format) => format.code === input.nf) && input.nf !== 'general') out.nf = input.nf;
  return Object.keys(out).length ? out : null;
}

export function normalizeStyles(input, rows, cols) {
  const out = {};
  Object.entries(input || {}).forEach(([ref, value]) => {
    const at = parseRef(ref);
    if (!at || at.row >= rows || at.col >= cols) return;
    const style = normalizeStyle(value);
    if (style) out[cellRef(at.row, at.col)] = style;
  });
  return out;
}

export const styleOf = (sheet, ref) => sheet?.styles?.[ref] || null;

/**
 * Apply a patch to every cell in a range.
 *
 * A key set to null is REMOVED rather than stored as null, so "no fill" and "a fill of nothing"
 * cannot drift apart, and a cell that ends up with no style at all drops out of the map -- an
 * 8,000-cell grid should not carry 8,000 empty objects because somebody pressed bold twice.
 */
export function applyStyle(sheet, range, patch) {
  const styles = { ...(sheet.styles || {}) };
  refsIn(range).forEach((ref) => {
    const next = { ...(styles[ref] || {}) };
    Object.entries(patch || {}).forEach(([key, value]) => {
      if (!STYLE_KEYS.includes(key)) return;
      if (value === null || value === undefined || value === '' || value === false) delete next[key];
      else next[key] = value;
    });
    const clean = normalizeStyle(next);
    if (clean) styles[ref] = clean; else delete styles[ref];
  });
  return styles;
}

/** True when every cell in the range already has this on -- so the button can toggle it off. */
export function styleIsOn(sheet, range, key) {
  const refs = refsIn(range);
  return refs.length > 0 && refs.every((ref) => !!styleOf(sheet, ref)?.[key]);
}

/**
 * Borders, applied the way the Excel button does: to the range as a whole.
 *
 * "Outer" is the four sides of the RANGE, not of every cell in it, which is the difference
 * between boxing a table and drawing a grid.
 */
export function applyBorders(sheet, range, preset) {
  const styles = { ...(sheet.styles || {}) };
  refsIn(range).forEach((ref) => {
    const at = parseRef(ref);
    let edges = '';
    if (preset === 'all') edges = 'blrt';
    else if (preset === 'outer') {
      edges = [
        at.row === range.r1 ? 't' : '', at.row === range.r2 ? 'b' : '',
        at.col === range.c1 ? 'l' : '', at.col === range.c2 ? 'r' : '',
      ].join('');
    } else if (preset === 'none') edges = '';
    else if (EDGE_OF[preset]) {
      // A single side is the side of the RANGE too: "top" on A1:C3 underlines nothing in row 2.
      const wanted = EDGE_OF[preset];
      const onEdge = { t: at.row === range.r1, b: at.row === range.r2, l: at.col === range.c1, r: at.col === range.c2 };
      edges = onEdge[wanted] ? wanted : (styles[ref]?.bd || '');
    }
    const next = { ...(styles[ref] || {}) };
    if (edges) next.bd = [...new Set(edges.split(''))].sort().join('');
    else delete next.bd;
    const clean = normalizeStyle(next);
    if (clean) styles[ref] = clean; else delete styles[ref];
  });
  return styles;
}

const EDGE_OF = { top: 't', right: 'r', bottom: 'b', left: 'l' };

// ---- numbers ---------------------------------------------------------------------------------

// The codes are Excel's own, so exporting is a copy rather than a translation.
export const NUMBER_FORMATS = [
  { code: 'general', label: 'General', excel: '' },
  { code: '0', label: 'Number', excel: '0' },
  { code: '0.00', label: 'Number (2 dp)', excel: '0.00' },
  { code: '#,##0', label: 'Comma', excel: '#,##0' },
  { code: '#,##0.00', label: 'Comma (2 dp)', excel: '#,##0.00' },
  { code: '$#,##0.00', label: 'Currency', excel: '"$"#,##0.00' },
  { code: '0%', label: 'Percent', excel: '0%' },
  { code: '0.00%', label: 'Percent (2 dp)', excel: '0.00%' },
];

const groups = (whole) => whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * A number, written the way its format says.
 *
 * Anything that is not a number is handed back untouched: a format is about presentation, and
 * formatting the word "Total" as currency should not produce $0.00.
 */
export function formatNumber(value, code) {
  if (!code || code === 'general') return value;
  if (typeof value !== 'number' || !Number.isFinite(value)) return value;
  const percent = code.endsWith('%');
  const scaled = percent ? value * 100 : value;
  const decimals = /\.(0+)/.exec(code)?.[1].length || 0;
  const fixed = Math.abs(scaled).toFixed(decimals);
  const [whole, fraction] = fixed.split('.');
  const body = (code.includes('#,##0') ? groups(whole) : whole) + (fraction ? `.${fraction}` : '');
  const sign = scaled < 0 ? '-' : '';
  if (code.startsWith('$')) return `${sign}$${body}`;
  return `${sign}${body}${percent ? '%' : ''}`;
}

// ---- merged cells ----------------------------------------------------------------------------

export function normalizeMerges(input, rows, cols) {
  const out = [];
  const taken = new Set();
  (Array.isArray(input) ? input : []).forEach((text) => {
    const range = parseRange(text);
    if (!range || range.r2 >= rows || range.c2 >= cols) return;
    if (rangeSize(range) < 2) return;
    // Overlapping merges have no meaning and no way to draw, so the first one wins.
    const refs = refsIn(range);
    if (refs.some((ref) => taken.has(ref))) return;
    refs.forEach((ref) => taken.add(ref));
    out.push(rangeLabel(range));
  });
  return out;
}

/** The merge a cell belongs to, if any. */
export function mergeAt(sheet, ref) {
  for (const text of sheet?.merges || []) {
    const range = parseRange(text);
    if (rangeHas(range, ref)) return range;
  }
  return null;
}

/** True for a cell swallowed by a merge -- it is not drawn at all. */
export function isCovered(sheet, ref) {
  const merge = mergeAt(sheet, ref);
  return !!merge && cellRef(merge.r1, merge.c1) !== ref;
}

/** Merge, or unmerge if the selection is already one merge. Excel's button does both. */
export function toggleMerge(sheet, range) {
  if (!range || rangeSize(range) < 2) {
    const single = mergeAt(sheet, cellRef(range?.r1 ?? 0, range?.c1 ?? 0));
    if (!single) return sheet.merges || [];
    return (sheet.merges || []).filter((text) => rangeLabel(parseRange(text)) !== rangeLabel(single));
  }
  const label = rangeLabel(range);
  const existing = (sheet.merges || []).some((text) => text === label);
  if (existing) return (sheet.merges || []).filter((text) => text !== label);
  // Anything already merged inside the new selection is absorbed by it.
  const kept = (sheet.merges || []).filter((text) => !refsIn(parseRange(text)).some((ref) => rangeHas(range, ref)));
  return normalizeMerges([...kept, label], sheet.rows, sheet.cols);
}

// ---- widths and heights ----------------------------------------------------------------------

export const DEFAULT_COL_WIDTH = 104;
export const DEFAULT_ROW_HEIGHT = 26;
const MIN_SIZE = 18;
const MAX_SIZE = 640;

export function normalizeSizes(input, count) {
  const out = {};
  Object.entries(input || {}).forEach(([key, value]) => {
    const at = Number(key);
    const size = Math.round(Number(value));
    if (!Number.isInteger(at) || at < 0 || at >= count) return;
    if (!Number.isFinite(size) || size < MIN_SIZE || size > MAX_SIZE) return;
    out[at] = size;
  });
  return out;
}

export const colWidth = (sheet, col) => sheet?.colW?.[col] || DEFAULT_COL_WIDTH;
export const rowHeight = (sheet, row) => sheet?.rowH?.[row] || DEFAULT_ROW_HEIGHT;

export function setSizes(current, indexes, size) {
  const out = { ...(current || {}) };
  indexes.forEach((at) => {
    if (size === null) delete out[at];
    else out[at] = Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(size)));
  });
  return out;
}

// ---- inserting and deleting ------------------------------------------------------------------

/**
 * Rewrite the references in a formula after rows or columns move.
 *
 * This is the part that makes insert/delete worth having. Without it, inserting a row above a
 * total leaves =SUM(A1:A9) pointing one row short, and the sheet is quietly wrong rather than
 * visibly broken -- which is the worse of the two.
 *
 * Quoted strings are stepped over, so ="A1" is text and stays text.
 */
export function shiftFormula(text, { row = 0, rowBy = 0, col = 0, colBy = 0 } = {}) {
  const source = String(text ?? '');
  if (!source.startsWith('=')) return source;
  let out = '';
  let at = 0;
  while (at < source.length) {
    const character = source[at];
    if (character === '"') {
      const end = source.indexOf('"', at + 1);
      const stop = end === -1 ? source.length : end + 1;
      out += source.slice(at, stop);
      at = stop;
      continue;
    }
    const match = /^([A-Z]+)([0-9]+)/.exec(source.slice(at));
    // A letter run followed by digits is only a reference if what precedes it is not part of a
    // name: SUM1 is a name, and A1 after "(" is a reference.
    const before = out[out.length - 1] || '';
    if (match && !/[A-Za-z0-9_]/.test(before)) {
      const ref = parseRef(match[0]);
      const after = source[at + match[0].length] || '';
      if (ref && !/[A-Za-z0-9_(]/.test(after)) {
        const nextRow = ref.row + (ref.row >= row ? rowBy : 0);
        const nextCol = ref.col + (ref.col >= col ? colBy : 0);
        // A reference to a row that was deleted has nothing left to point at.
        out += (nextRow < 0 || nextCol < 0) ? '#REF!' : cellRef(nextRow, nextCol);
        at += match[0].length;
        continue;
      }
    }
    out += character;
    at += 1;
  }
  return out;
}

const shiftMap = (map, at, by, limit) => {
  const out = {};
  Object.entries(map || {}).forEach(([key, value]) => {
    const index = Number(key);
    const next = index >= at ? index + by : index;
    if (next >= 0 && next < limit) out[next] = value;
  });
  return out;
};

function moveKeyed(source, move) {
  const out = {};
  Object.entries(source || {}).forEach(([ref, value]) => {
    const at = parseRef(ref);
    if (!at) return;
    const moved = move(at);
    if (moved) out[cellRef(moved.row, moved.col)] = value;
  });
  return out;
}

/**
 * Insert or delete rows/columns, moving everything that sits on them.
 *
 * Cells, styles, merges, widths and heights all move together, and every formula on the sheet is
 * rewritten -- including formulas outside the affected rows, which is where a half-done version
 * of this goes wrong.
 */
function reshape(sheet, { axis, at, count, remove }) {
  const rowAxis = axis === 'row';
  const size = rowAxis ? sheet.rows : sheet.cols;
  const max = rowAxis ? MAX_ROWS : MAX_COLS;
  const step = Math.max(1, Math.round(count || 1));
  const start = Math.max(0, Math.min(size - (remove ? 1 : 0), Math.round(at)));
  const moved = remove ? -Math.min(step, size - start) : Math.min(step, max - size);
  if (!moved) return sheet;
  const nextSize = Math.max(1, size + moved);

  // On a delete, the cells being removed go first; on an insert nothing is dropped.
  const gone = (index) => remove && index >= start && index < start - moved;
  const shift = (index) => (index >= start ? index + moved : index);

  const move = (cell) => {
    const index = rowAxis ? cell.row : cell.col;
    if (gone(index)) return null;
    const next = shift(index);
    if (next < 0 || next >= (rowAxis ? nextSize : sheet.cols)) return null;
    if (!rowAxis && next >= nextSize) return null;
    return rowAxis ? { row: next, col: cell.col } : { row: cell.row, col: next };
  };

  const cells = moveKeyed(sheet.cells, move);
  const shiftArgs = rowAxis ? { row: start, rowBy: moved } : { col: start, colBy: moved };
  Object.keys(cells).forEach((ref) => { cells[ref] = shiftFormula(cells[ref], shiftArgs); });

  const merges = (sheet.merges || []).map((text) => {
    const range = parseRange(text);
    if (!range) return null;
    const from = move({ row: range.r1, col: range.c1 });
    const to = move({ row: range.r2, col: range.c2 });
    // A merge with either corner deleted is gone: there is no honest way to guess the rest.
    if (!from || !to) return null;
    return rangeLabel({ r1: from.row, c1: from.col, r2: to.row, c2: to.col });
  }).filter(Boolean);

  return {
    ...sheet,
    rows: rowAxis ? nextSize : sheet.rows,
    cols: rowAxis ? sheet.cols : nextSize,
    cells,
    styles: moveKeyed(sheet.styles, move),
    merges: normalizeMerges(merges, rowAxis ? nextSize : sheet.rows, rowAxis ? sheet.cols : nextSize),
    colW: rowAxis ? { ...(sheet.colW || {}) } : shiftMap(sheet.colW, start, moved, nextSize),
    rowH: rowAxis ? shiftMap(sheet.rowH, start, moved, nextSize) : { ...(sheet.rowH || {}) },
  };
}

export const insertRows = (sheet, at, count = 1) => reshape(sheet, { axis: 'row', at, count, remove: false });
export const deleteRows = (sheet, at, count = 1) => reshape(sheet, { axis: 'row', at, count, remove: true });
export const insertCols = (sheet, at, count = 1) => reshape(sheet, { axis: 'col', at, count, remove: false });
export const deleteCols = (sheet, at, count = 1) => reshape(sheet, { axis: 'col', at, count, remove: true });

/** Empty every cell in a range, leaving its formatting alone -- what Delete does. */
export function clearCells(sheet, range) {
  const cells = { ...(sheet.cells || {}) };
  refsIn(range).forEach((ref) => { delete cells[ref]; });
  return cells;
}

export { columnName, cellRef, parseRef };
