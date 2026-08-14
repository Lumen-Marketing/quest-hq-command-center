// The grid a Sheet field opens.
//
// Fetched on the first click. It is a full-screen overlay of its own rather than a page in the
// builder's modal system: a spreadsheet wants the whole window, it is opened from a record form
// that must survive underneath it, and nothing else in the app needs to know it exists.
//
// A cell SHOWS what it works out to and EDITS what was typed into it. That is the whole trick
// of a spreadsheet, and getting it the wrong way round -- showing the formula, or editing the
// result -- is what makes a grid feel like a form.
//
// The toolbar is Excel's Home tab, cut down to what a field-sized sheet needs: font, fill and
// text colour, cell lines, alignment, wrapping, merge, number format, and insert/delete/size for
// rows and columns. Everything it does is a call into sheet-format.js, which is pure and tested;
// this file is the wiring.

import {
  MAX_COLS,
  MAX_ROWS,
  SHEET_FUNCTIONS,
  cellRef,
  columnName,
  evaluateSheet,
  parseRef,
  sheetFromRows,
  shownValue,
} from './sheet-model.js';
import {
  BORDER_PRESETS,
  DEFAULT_FONT,
  DEFAULT_SIZE,
  FONTS,
  FONT_SIZES,
  NUMBER_FORMATS,
  applyBorders,
  applyStyle,
  clearCells,
  colRange,
  colWidth,
  fillFrom,
  deleteCols,
  deleteRows,
  formatNumber,
  insertCols,
  insertRows,
  isCovered,
  mergeAt,
  normalizeSheetFull,
  parseRange,
  rangeHas,
  rangeLabel,
  rangeOf,
  rangeSize,
  refsIn,
  rowHeight,
  rowRange,
  setSizes,
  styleIsOn,
  styleOf,
  toggleMerge,
} from './sheet-format.js';

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const icon = (name) => `<i class="ti ${name}" aria-hidden="true"></i>`;

/** A toolbar button. `on` draws it pressed, which is how B/I/U show what the selection already is. */
const tool = (action, name, title, extra = '', badge = '') =>
  `<button type="button" class="sh-tool" data-sh-do="${action}" title="${esc(title)}" aria-label="${esc(title)}"${extra}>${icon(name)}${badge}</button>`;

/**
 * Open the grid over whatever is on screen.
 *
 * `read` hands back the sheet as stored, `write` takes it back when Done is pressed. Nothing is
 * written until then: a spreadsheet somebody is halfway through is not a saved record, and the
 * form underneath still has its own Save.
 */
export function openSheetEditor({ read, write, title = 'Sheet', readOnly = false }) {
  let sheet = normalizeSheetFull(read());
  let anchor = 'A1';
  let sel = rangeOf('A1', 'A1');
  let editing = false;
  let dragging = null;
  // Where a fill drag currently reaches, drawn as a preview until the mouse comes up.
  let fillTo = null;

  const overlay = document.createElement('div');
  overlay.className = 'sh-overlay';
  overlay.innerHTML = `
    <div class="sh-frame" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="sh-bar">
        <b class="sh-title" data-sh-title>${esc(sheet.title || title)}</b>
        <div class="sh-tools">
          ${readOnly ? '' : `<label class="btn btn-sm sh-upload" title="Replace the sheet with a file">
            ${icon('ti-upload')}Import<input type="file" accept=".csv,.xlsx" data-sh-file hidden>
          </label>`}
          <button type="button" class="btn btn-sm" data-sh-export title="Download as an Excel workbook">${icon('ti-file-spreadsheet')}Excel</button>
          <button type="button" class="btn btn-sm" data-sh-print title="Print this sheet">${icon('ti-printer')}Print</button>
          <button type="button" class="btn btn-primary btn-sm" data-sh-done>${readOnly ? 'Close' : 'Done'}</button>
        </div>
      </div>
      ${readOnly ? '' : ribbon()}
      <div class="sh-fbar">
        <div class="sh-ref" data-sh-ref>A1</div>
        <input class="sh-formula" data-sh-formula placeholder="Value, or =SUM(A1:A9)" ${readOnly ? 'disabled' : ''} spellcheck="false" aria-label="Cell contents">
      </div>
      <div class="sh-scroll" data-sh-scroll></div>
      <div class="sh-help"><span data-sh-status></span><span class="sh-fns">${esc(SHEET_FUNCTIONS.join('  '))}</span></div>
    </div>`;

  const gridHost = overlay.querySelector('[data-sh-scroll]');
  const formula = overlay.querySelector('[data-sh-formula]');
  const refLabel = overlay.querySelector('[data-sh-ref]');
  const status = overlay.querySelector('[data-sh-status]');
  const menus = new Map();

  // ---- the toolbar ---------------------------------------------------------------------------

  function ribbon() {
    const option = (value, label, selected) => `<option value="${esc(value)}"${selected ? ' selected' : ''}>${esc(label)}</option>`;
    return `
      <div class="sh-ribbon" data-sh-ribbon>
        <div class="sh-group">
          <select class="sh-font" data-sh-set="ff" aria-label="Font">${FONTS.map((name) => option(name, name)).join('')}</select>
          <select class="sh-size" data-sh-set="fs" aria-label="Font size">${FONT_SIZES.map((size) => option(size, size)).join('')}</select>
          ${tool('grow', 'ti-letter-case-upper', 'Grow font')}
          ${tool('shrink', 'ti-letter-case-lower', 'Shrink font')}
          <span class="sh-sep"></span>
          ${tool('b', 'ti-bold', 'Bold (Ctrl+B)')}
          ${tool('i', 'ti-italic', 'Italic (Ctrl+I)')}
          ${tool('u', 'ti-underline', 'Underline (Ctrl+U)')}
          ${menuButton('borders', 'ti-border-all', 'Cell lines')}
          <label class="sh-tool sh-color" title="Fill colour">${icon('ti-paint')}<input type="color" data-sh-color="bg" value="#ffffff" aria-label="Fill colour"><span class="sh-color-bar" data-sh-bar="bg"></span></label>
          <label class="sh-tool sh-color" title="Text colour">${icon('ti-letter-a')}<input type="color" data-sh-color="fg" value="#000000" aria-label="Text colour"><span class="sh-color-bar" data-sh-bar="fg"></span></label>
          ${tool('clearFormat', 'ti-eraser', 'Clear formatting')}
          <small>Font</small>
        </div>
        <div class="sh-group">
          ${tool('va:top', 'ti-layout-align-top', 'Align top')}
          ${tool('va:middle', 'ti-layout-align-middle', 'Align middle')}
          ${tool('va:bottom', 'ti-layout-align-bottom', 'Align bottom')}
          <span class="sh-sep"></span>
          ${tool('ha:left', 'ti-align-left', 'Align left')}
          ${tool('ha:center', 'ti-align-center', 'Align centre')}
          ${tool('ha:right', 'ti-align-right', 'Align right')}
          ${tool('wrap', 'ti-text-wrap', 'Wrap text')}
          ${tool('merge', 'ti-arrow-autofit-width', 'Merge & centre')}
          <small>Alignment</small>
        </div>
        <div class="sh-group">
          <select class="sh-nf" data-sh-set="nf" aria-label="Number format">${NUMBER_FORMATS.map((format) => option(format.code, format.label)).join('')}</select>
          ${/* Tabler has one decimal glyph, so the two buttons carry the sign that tells them
                apart -- two identical icons side by side is a coin toss. */ ''}
          ${tool('dec+', 'ti-decimal', 'More decimals', '', '<span class="sh-badge">+</span>')}
          ${tool('dec-', 'ti-decimal', 'Fewer decimals', '', '<span class="sh-badge">&minus;</span>')}
          <small>Number</small>
        </div>
        <div class="sh-group">
          ${menuButton('insert', 'ti-table-plus', 'Insert')}
          ${menuButton('delete', 'ti-table-minus', 'Delete')}
          ${menuButton('format', 'ti-ruler-measure', 'Size')}
          <small>Cells</small>
        </div>
      </div>`;
  }

  // A declaration, not a const arrow: ribbon() runs while overlay.innerHTML is being built,
  // which is before this line executes. As a const it was still in its temporal dead zone and
  // the editor threw the moment it opened.
  function menuButton(name, glyph, label) {
    return `<span class="sh-menu-wrap"><button type="button" class="sh-tool sh-has-menu" data-sh-menu="${name}" aria-haspopup="true" aria-expanded="false" title="${esc(label)}">${icon(glyph)}${icon('ti-chevron-down')}</button>${menuBody(name)}</span>`;
  }

  function menuBody(name) {
    const item = (action, label, glyph) => `<button type="button" role="menuitem" data-sh-do="${action}">${glyph ? icon(glyph) : ''}${esc(label)}</button>`;
    const items = {
      borders: BORDER_PRESETS.map((preset) => item(`bd:${preset}`, {
        all: 'All borders', outer: 'Outside box', top: 'Top edge', right: 'Right edge',
        bottom: 'Bottom edge', left: 'Left edge', none: 'No border',
      }[preset], preset === 'none' ? 'ti-border-none' : 'ti-border-all')).join(''),
      insert: [
        item('ins:row:above', 'Row above', 'ti-row-insert-top'),
        item('ins:row:below', 'Row below', 'ti-row-insert-bottom'),
        item('ins:col:left', 'Column left', 'ti-column-insert-left'),
        item('ins:col:right', 'Column right', 'ti-column-insert-right'),
      ].join(''),
      delete: [
        item('del:row', 'Delete rows', 'ti-row-remove'),
        item('del:col', 'Delete columns', 'ti-column-remove'),
        item('del:clear', 'Clear contents', 'ti-eraser'),
      ].join(''),
      format: [
        item('size:row', 'Row height…', 'ti-arrows-vertical'),
        item('size:col', 'Column width…', 'ti-arrows-horizontal'),
        item('size:auto', 'Reset to default', 'ti-refresh'),
      ].join(''),
    };
    return `<div class="sh-menu" data-sh-menu-for="${name}" role="menu" hidden>${items[name] || ''}</div>`;
  }

  /**
   * Put an open menu under its button, in viewport coordinates.
   *
   * It has to be measured after it is shown, because a hidden element has no size, and it has to
   * be told where to go because it is fixed -- which is the only way out of the ribbon's clip.
   */
  function placeMenu(menu, button) {
    const from = button.getBoundingClientRect();
    const size = menu.getBoundingClientRect();
    const gap = 3;
    // Below the button, unless there is more room above -- the ribbon sits at the top of the
    // frame, so below is nearly always right.
    const below = from.bottom + gap;
    const top = (below + size.height > window.innerHeight - 8 && from.top - gap - size.height > 8)
      ? from.top - gap - size.height
      : Math.min(below, Math.max(8, window.innerHeight - 8 - size.height));
    const left = Math.max(8, Math.min(from.left, window.innerWidth - 8 - size.width));
    menu.style.top = `${Math.round(top)}px`;
    menu.style.left = `${Math.round(left)}px`;
  }

  function closeMenus() {
    overlay.querySelectorAll('[data-sh-menu-for]').forEach((menu) => { menu.hidden = true; });
    overlay.querySelectorAll('[data-sh-menu]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
  }

  // ---- drawing -------------------------------------------------------------------------------

  /** The inline style one cell is painted with. */
  function cellStyle(ref) {
    const style = styleOf(sheet, ref);
    if (!style) return '';
    const parts = [];
    if (style.b) parts.push('font-weight:700');
    if (style.i) parts.push('font-style:italic');
    if (style.u) parts.push('text-decoration:underline');
    if (style.fg) parts.push(`color:${style.fg}`);
    if (style.bg) parts.push(`background:${style.bg}`);
    if (style.ff) parts.push(`font-family:${style.ff.includes(' ') ? `'${style.ff}'` : style.ff}`);
    if (style.fs) parts.push(`font-size:${style.fs}px`);
    if (style.ha) parts.push(`text-align:${style.ha}`);
    if (style.va) parts.push(`vertical-align:${style.va === 'middle' ? 'middle' : style.va}`);
    if (style.wrap) parts.push('white-space:pre-wrap');
    if (style.bd) {
      const color = style.bc || '#5b524a';
      const side = { t: 'top', r: 'right', b: 'bottom', l: 'left' };
      style.bd.split('').forEach((edge) => parts.push(`border-${side[edge]}:1px solid ${color}`));
    }
    return parts.join(';');
  }

  function paint() {
    const { values, errors } = evaluateSheet(sheet);
    const widths = Array.from({ length: sheet.cols }, (_, col) => `<col style="width:${colWidth(sheet, col)}px">`).join('');
    const head = Array.from({ length: sheet.cols }, (_, col) =>
      `<th class="sh-colhead" data-sh-col="${col}">${columnName(col)}<span class="sh-grip" data-sh-grip-col="${col}"></span></th>`).join('');

    const body = Array.from({ length: sheet.rows }, (_, row) => {
      const cells = Array.from({ length: sheet.cols }, (_, col) => {
        const ref = cellRef(row, col);
        // A cell swallowed by a merge is not drawn at all -- the anchor spans over it.
        if (isCovered(sheet, ref)) return '';
        const merge = mergeAt(sheet, ref);
        const span = merge
          ? ` colspan="${merge.c2 - merge.c1 + 1}" rowspan="${merge.r2 - merge.r1 + 1}"`
          : '';
        const raw = sheet.cells[ref] || '';
        const format = styleOf(sheet, ref)?.nf;
        const text = errors[ref] ? shownValue(values, errors, ref) : formatNumber(values[ref] ?? shownValue(values, errors, ref), format);
        const classes = [
          errors[ref] ? 'bad' : '',
          raw.startsWith('=') ? 'calc' : '',
          typeof values[ref] === 'number' && !styleOf(sheet, ref)?.ha ? 'num' : '',
          sheet.headerRow && row === 0 ? 'head' : '',
        ].filter(Boolean).join(' ');
        const style = cellStyle(ref);
        return `<td class="${classes}"${span} data-sh-cell="${ref}"${style ? ` style="${esc(style)}"` : ''} title="${esc(errors[ref] || '')}">${esc(text === '' ? '' : text)}</td>`;
      }).join('');
      const height = sheet.rowH?.[row] ? ` style="height:${sheet.rowH[row]}px"` : '';
      return `<tr${height}><th class="sh-rownum" data-sh-row="${row}">${row + 1}<span class="sh-grip" data-sh-grip-row="${row}"></span></th>${cells}</tr>`;
    }).join('');

    gridHost.innerHTML = `<table class="sh-grid"><colgroup><col class="sh-gutter">${widths}</colgroup>`
      + `<thead><tr><th class="sh-corner" data-sh-all></th>${head}</tr></thead><tbody>${body}</tbody></table>`;
    paintSelection();
    syncBar();
  }

  /** Selection is classes, not a repaint: redrawing 8,000 cells to move a box is how a grid stutters. */
  function paintSelection() {
    gridHost.querySelectorAll('.sel, .sel-lead, .fill-preview').forEach((cell) => cell.classList.remove('sel', 'sel-lead', 'fill-preview'));
    gridHost.querySelectorAll('.sh-fill-handle').forEach((node) => node.remove());
    refsIn(sel).forEach((ref) => {
      gridHost.querySelector(`[data-sh-cell="${ref}"]`)?.classList.add('sel');
    });
    gridHost.querySelector(`[data-sh-cell="${anchor}"]`)?.classList.add('sel-lead');
    // The corner you drag to fill, on the bottom-right of the selection the way Excel puts it.
    if (!readOnly) {
      const corner = gridHost.querySelector(`[data-sh-cell="${cellRef(sel.r2, sel.c2)}"]`);
      if (corner) corner.insertAdjacentHTML('beforeend', '<span class="sh-fill-handle" data-sh-fill title="Drag to fill"></span>');
    }
    if (fillTo) refsIn(fillTo).forEach((ref) => {
      if (!rangeHas(sel, ref)) gridHost.querySelector(`[data-sh-cell="${ref}"]`)?.classList.add('fill-preview');
    });
    gridHost.querySelectorAll('.sh-colhead.on, .sh-rownum.on').forEach((head) => head.classList.remove('on'));
    for (let col = sel.c1; col <= sel.c2; col += 1) gridHost.querySelector(`[data-sh-col="${col}"]`)?.classList.add('on');
    for (let row = sel.r1; row <= sel.r2; row += 1) gridHost.querySelector(`[data-sh-row="${row}"]`)?.classList.add('on');
  }

  function syncBar() {
    refLabel.textContent = rangeLabel(sel);
    if (!editing) formula.value = sheet.cells[anchor] || '';
    const style = styleOf(sheet, anchor) || {};
    const set = (selector, value) => { const node = overlay.querySelector(selector); if (node) node.value = value; };
    set('[data-sh-set="ff"]', style.ff || DEFAULT_FONT);
    set('[data-sh-set="fs"]', String(style.fs || DEFAULT_SIZE));
    set('[data-sh-set="nf"]', style.nf || 'general');
    ['b', 'i', 'u', 'wrap'].forEach((key) => {
      overlay.querySelector(`[data-sh-do="${key}"]`)?.classList.toggle('on', styleIsOn(sheet, sel, key));
    });
    ['ha', 'va'].forEach((key) => {
      overlay.querySelectorAll(`[data-sh-do^="${key}:"]`).forEach((button) => {
        button.classList.toggle('on', button.dataset.shDo === `${key}:${style[key]}`);
      });
    });
    const bar = (key, fallback) => {
      const node = overlay.querySelector(`[data-sh-bar="${key}"]`);
      if (node) node.style.background = style[key] || fallback;
    };
    bar('bg', 'transparent');
    bar('fg', '#111111');
    // The pickers open on what the cell already is. Left at their default, the fill picker
    // opened on black and one stray confirm painted the whole selection black.
    const picker = (key, fallback) => {
      const node = overlay.querySelector(`[data-sh-color="${key}"]`);
      if (node) node.value = style[key] || fallback;
    };
    picker('bg', '#ffffff');
    picker('fg', '#000000');
    const count = rangeSize(sel);
    if (status) {
      // Evaluated ONCE. Called per cell this runs the whole sheet for every cell in the
      // selection, which is a select-all away from locking the tab.
      const { values } = count > 1 ? evaluateSheet(sheet) : { values: {} };
      const numbers = count > 1 ? refsIn(sel).map((ref) => values[ref]).filter((value) => typeof value === 'number') : [];
      const sum = numbers.reduce((total, value) => total + value, 0);
      status.textContent = count > 1
        ? `${count} cells${numbers.length ? ` · Sum ${Math.round(sum * 1e6) / 1e6}` : ''}`
        : '';
    }
  }

  // ---- selecting -----------------------------------------------------------------------------

  function select(ref, extend = false) {
    if (!parseRef(ref)) return;
    if (!extend) anchor = ref;
    sel = rangeOf(anchor, ref);
    // A selection that lands on a merged cell takes the whole merge, or the box is drawn around
    // a cell that is not there.
    const merge = mergeAt(sheet, ref);
    if (merge && !extend) sel = merge;
    paintSelection();
    syncBar();
  }

  function selectRange(range) {
    sel = range;
    anchor = cellRef(range.r1, range.c1);
    paintSelection();
    syncBar();
  }

  function commit(ref, raw) {
    const text = String(raw ?? '');
    if (text.trim() === '') delete sheet.cells[ref];
    else sheet.cells[ref] = text;
    paint();
  }

  /**
   * Move the selection, growing the sheet if somebody walks off the edge.
   *
   * Shift+arrow moves the corner AWAY from the anchor, so the box grows and shrinks from the end
   * you are not holding -- the same corner Excel drags.
   */
  function step(dRow, dCol, extend = false) {
    const far = cellRef(
      sel.r1 === anchorRow() ? sel.r2 : sel.r1,
      sel.c1 === anchorCol() ? sel.c2 : sel.c1,
    );
    const at = parseRef(extend ? far : anchor);
    if (!at) return;
    const row = Math.max(0, at.row + dRow);
    const col = Math.max(0, at.col + dCol);
    if (!extend) {
      if (row >= sheet.rows && sheet.rows < MAX_ROWS) { sheet.rows += 1; paint(); }
      if (col >= sheet.cols && sheet.cols < MAX_COLS) { sheet.cols += 1; paint(); }
    }
    if (row >= sheet.rows || col >= sheet.cols) return;
    select(cellRef(row, col), extend);
    gridHost.querySelector(`[data-sh-cell="${cellRef(row, col)}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  const anchorRow = () => parseRef(anchor)?.row ?? 0;
  const anchorCol = () => parseRef(anchor)?.col ?? 0;

  // ---- typing into a cell --------------------------------------------------------------------

  function edit(ref, seed) {
    if (readOnly) return;
    const cell = gridHost.querySelector(`[data-sh-cell="${ref}"]`);
    if (!cell) return;
    editing = true;
    const input = document.createElement('input');
    input.className = 'sh-cell-input';
    input.value = seed === undefined ? (sheet.cells[ref] || '') : seed;
    input.spellcheck = false;
    cell.textContent = '';
    cell.appendChild(input);
    input.focus();
    if (seed === undefined) input.select();

    const finish = (move) => {
      if (!editing) return;
      editing = false;
      commit(ref, input.value);
      select(ref);
      if (move) step(...move);
    };
    input.addEventListener('blur', () => finish(null));
    input.addEventListener('keydown', (event) => {
      // Stopped here, or the grid's own handler sees the same Enter a moment later -- by which
      // point `editing` is already false -- and steps a second time, so one Enter moved two
      // rows down.
      if (['Enter', 'Tab', 'Escape'].includes(event.key)) { event.preventDefault(); event.stopPropagation(); }
      if (event.key === 'Enter') finish([1, 0]);
      else if (event.key === 'Tab') finish([0, event.shiftKey ? -1 : 1]);
      else if (event.key === 'Escape') { editing = false; paint(); select(ref); }
    });
  }

  // ---- what the toolbar does -----------------------------------------------------------------

  function patch(values) {
    sheet.styles = applyStyle(sheet, sel, values);
    paint();
  }

  /** Bold/italic/underline toggle for the WHOLE selection, the way Excel's do. */
  function toggle(key) {
    patch({ [key]: styleIsOn(sheet, sel, key) ? null : 1 });
  }

  /** One step up or down the size list, per cell, so a mixed selection all grows by one. */
  function resize(by) {
    refsIn(sel).forEach((ref) => {
      const current = styleOf(sheet, ref)?.fs || DEFAULT_SIZE;
      const at = FONT_SIZES.indexOf(current);
      const next = at === -1
        ? Math.max(6, Math.min(96, current + by * 2))
        : FONT_SIZES[Math.max(0, Math.min(FONT_SIZES.length - 1, at + by))];
      sheet.styles = applyStyle(sheet, rangeOf(ref, ref), { fs: next });
    });
    paint();
  }

  /** More or fewer decimals, stepping through the formats that have them. */
  function decimals(by) {
    const order = ['0', '0.00'];
    const commas = ['#,##0', '#,##0.00'];
    const percents = ['0%', '0.00%'];
    const current = styleOf(sheet, anchor)?.nf || 'general';
    const family = [order, commas, percents].find((list) => list.includes(current)) || order;
    const at = family.indexOf(current);
    const next = family[Math.max(0, Math.min(family.length - 1, (at === -1 ? 0 : at) + by))];
    patch({ nf: next });
  }

  function askSize(axis) {
    const isRow = axis === 'row';
    const current = isRow ? rowHeight(sheet, sel.r1) : colWidth(sheet, sel.c1);
    const answer = window.prompt(isRow ? 'Row height in pixels' : 'Column width in pixels', String(current));
    if (answer === null) return;
    const size = Number(answer);
    if (!Number.isFinite(size)) return;
    applySize(axis, size);
  }

  function applySize(axis, size) {
    if (axis === 'row') {
      const rows = [];
      for (let row = sel.r1; row <= sel.r2; row += 1) rows.push(row);
      sheet.rowH = setSizes(sheet.rowH, rows, size);
    } else {
      const cols = [];
      for (let col = sel.c1; col <= sel.c2; col += 1) cols.push(col);
      sheet.colW = setSizes(sheet.colW, cols, size);
    }
    paint();
  }

  function run(action) {
    if (readOnly) return;
    const [head, arg, where] = action.split(':');
    if (['b', 'i', 'u', 'wrap'].includes(head)) { toggle(head); return; }
    if (head === 'ha' || head === 'va') {
      patch({ [head]: styleOf(sheet, anchor)?.[head] === arg ? null : arg });
      return;
    }
    if (head === 'bd') { sheet.styles = applyBorders(sheet, sel, arg); paint(); return; }
    if (head === 'grow') { resize(1); return; }
    if (head === 'shrink') { resize(-1); return; }
    if (head === 'clearFormat') { patch(Object.fromEntries(['b', 'i', 'u', 'fg', 'bg', 'ha', 'va', 'wrap', 'ff', 'fs', 'bd', 'bc', 'nf'].map((key) => [key, null]))); return; }
    if (head === 'dec+') { decimals(1); return; }
    if (head === 'dec-') { decimals(-1); return; }
    if (head === 'merge') {
      sheet.merges = toggleMerge(sheet, sel);
      // Merged and centred, because that is what the button is for.
      if (sheet.merges.includes(rangeLabel(sel))) sheet.styles = applyStyle(sheet, rangeOf(cellRef(sel.r1, sel.c1), cellRef(sel.r1, sel.c1)), { ha: 'center', va: 'middle' });
      paint();
      return;
    }
    if (head === 'ins') {
      const count = arg === 'row' ? sel.r2 - sel.r1 + 1 : sel.c2 - sel.c1 + 1;
      if (arg === 'row') sheet = insertRows(sheet, where === 'below' ? sel.r2 + 1 : sel.r1, count);
      else sheet = insertCols(sheet, where === 'right' ? sel.c2 + 1 : sel.c1, count);
      paint();
      return;
    }
    if (head === 'del') {
      if (arg === 'row') sheet = deleteRows(sheet, sel.r1, sel.r2 - sel.r1 + 1);
      else if (arg === 'col') sheet = deleteCols(sheet, sel.c1, sel.c2 - sel.c1 + 1);
      else sheet.cells = clearCells(sheet, sel);
      sel = rangeOf(cellRef(Math.min(sel.r1, sheet.rows - 1), Math.min(sel.c1, sheet.cols - 1)));
      anchor = cellRef(sel.r1, sel.c1);
      paint();
      return;
    }
    if (head === 'size') {
      if (arg === 'auto') { applySize('row', null); applySize('col', null); return; }
      askSize(arg);
    }
  }

  // ---- events --------------------------------------------------------------------------------

  gridHost.addEventListener('mousedown', (event) => {
    if (event.target.matches('input')) return;
    if (editing) return;
    closeMenus();

    if (event.target.closest('[data-sh-fill]')) {
      // The corner handle. The selection stays put; what moves is where it reaches to.
      dragging = { kind: 'fill' };
      fillTo = sel;
      event.preventDefault();
      return;
    }

    const grip = event.target.closest('[data-sh-grip-col],[data-sh-grip-row]');
    if (grip) {
      // Dragging the line between two headers resizes what is before it.
      const isCol = grip.dataset.shGripCol !== undefined;
      const index = Number(isCol ? grip.dataset.shGripCol : grip.dataset.shGripRow);
      const from = isCol ? event.clientX : event.clientY;
      const start = isCol ? colWidth(sheet, index) : rowHeight(sheet, index);
      dragging = { kind: 'size', isCol, index, from, start };
      event.preventDefault();
      return;
    }

    const colHead = event.target.closest('[data-sh-col]');
    if (colHead) {
      const col = Number(colHead.dataset.shCol);
      selectRange(event.shiftKey ? colRange(sheet, Math.min(col, sel.c1), Math.max(col, sel.c2)) : colRange(sheet, col));
      dragging = { kind: 'col', from: col };
      return;
    }
    const rowHead = event.target.closest('[data-sh-row]');
    if (rowHead) {
      const row = Number(rowHead.dataset.shRow);
      selectRange(event.shiftKey ? rowRange(sheet, Math.min(row, sel.r1), Math.max(row, sel.r2)) : rowRange(sheet, row));
      dragging = { kind: 'row', from: row };
      return;
    }
    if (event.target.closest('[data-sh-all]')) {
      selectRange({ r1: 0, c1: 0, r2: sheet.rows - 1, c2: sheet.cols - 1 });
      return;
    }

    const cell = event.target.closest('[data-sh-cell]');
    if (!cell) return;
    select(cell.dataset.shCell, event.shiftKey);
    dragging = { kind: 'cell' };
    event.preventDefault();
  });

  gridHost.addEventListener('mousemove', (event) => {
    if (!dragging) return;
    if (dragging.kind === 'size') {
      const now = dragging.isCol ? event.clientX : event.clientY;
      const next = dragging.start + (now - dragging.from);
      if (dragging.isCol) sheet.colW = setSizes(sheet.colW, [dragging.index], next);
      else sheet.rowH = setSizes(sheet.rowH, [dragging.index], next);
      paint();
      return;
    }
    if (dragging.kind === 'fill') {
      const cell = event.target.closest('[data-sh-cell]');
      const at = cell && parseRef(cell.dataset.shCell);
      if (!at) return;
      // One direction at a time, whichever the pointer has gone furthest in -- a fill that
      // grew both ways at once would have no series to follow.
      const belowBy = at.row - sel.r2;
      const aboveBy = sel.r1 - at.row;
      const rightBy = at.col - sel.c2;
      const leftBy = sel.c1 - at.col;
      const best = Math.max(belowBy, aboveBy, rightBy, leftBy);
      if (best <= 0) { fillTo = sel; paintSelection(); return; }
      if (best === belowBy) fillTo = { ...sel, r2: at.row };
      else if (best === aboveBy) fillTo = { ...sel, r1: at.row };
      else if (best === rightBy) fillTo = { ...sel, c2: at.col };
      else fillTo = { ...sel, c1: at.col };
      paintSelection();
      return;
    }
    if (dragging.kind === 'cell') {
      const cell = event.target.closest('[data-sh-cell]');
      if (cell) select(cell.dataset.shCell, true);
      return;
    }
    if (dragging.kind === 'col') {
      const head = event.target.closest('[data-sh-col]');
      if (head) selectRange(colRange(sheet, dragging.from, Number(head.dataset.shCol)));
      return;
    }
    const head = event.target.closest('[data-sh-row]');
    if (head) selectRange(rowRange(sheet, dragging.from, Number(head.dataset.shRow)));
  });

  // A fixed menu is placed once and does not follow its button, so scrolling the ribbon out from
  // under it would leave it pointing at nothing.
  overlay.querySelector('[data-sh-ribbon]')?.addEventListener('scroll', closeMenus);

  const stopDrag = () => {
    if (dragging?.kind === 'fill' && fillTo && rangeLabel(fillTo) !== rangeLabel(sel)) {
      const filled = fillFrom(sheet, sel, fillTo);
      sheet.cells = filled.cells;
      sheet.styles = filled.styles;
      // The filled range becomes the selection, so it can be dragged on again.
      sel = fillTo;
      anchor = cellRef(sel.r1, sel.c1);
      fillTo = null;
      paint();
    }
    fillTo = null;
    dragging = null;
  };
  document.addEventListener('mouseup', stopDrag);

  gridHost.addEventListener('dblclick', (event) => {
    const cell = event.target.closest('[data-sh-cell]');
    if (cell) edit(cell.dataset.shCell);
  });

  // The formula bar edits the anchor cell, which is the other way in.
  formula.addEventListener('focus', () => { editing = true; });
  formula.addEventListener('blur', () => { if (editing) { editing = false; commit(anchor, formula.value); select(anchor); } });
  formula.addEventListener('keydown', (event) => {
    if (['Enter', 'Escape'].includes(event.key)) { event.preventDefault(); event.stopPropagation(); }
    if (event.key === 'Enter') { editing = false; commit(anchor, formula.value); step(1, 0); }
    if (event.key === 'Escape') { editing = false; syncBar(); formula.blur(); }
  });

  const onGridKey = (event) => {
    if (!overlay.isConnected || editing) return;
    // Anything typed into a real control belongs to that control.
    const target = event.target;
    if (target === formula || (target?.matches && target.matches('input,select,textarea'))) return;
    if ((event.ctrlKey || event.metaKey) && !readOnly) {
      const key = event.key.toLowerCase();
      if (['b', 'i', 'u'].includes(key)) { event.preventDefault(); toggle(key); return; }
      if (key === 'a') { event.preventDefault(); selectRange({ r1: 0, c1: 0, r2: sheet.rows - 1, c2: sheet.cols - 1 }); return; }
    }
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1], Enter: [1, 0] };
    if (moves[event.key]) { event.preventDefault(); step(...moves[event.key], event.shiftKey && event.key !== 'Enter'); return; }
    if (event.key === 'Tab') { event.preventDefault(); step(0, event.shiftKey ? -1 : 1); return; }
    if (event.key === 'Escape') { event.preventDefault(); closeMenus(); close(); return; }
    if (readOnly) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      sheet.cells = clearCells(sheet, sel);
      paint();
      return;
    }
    // Any printable character starts an edit with that character, the way a grid should.
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) { event.preventDefault(); edit(anchor, event.key); }
  };
  document.addEventListener('keydown', onGridKey);

  overlay.addEventListener('click', (event) => {
    const menuButtonEl = event.target.closest('[data-sh-menu]');
    if (menuButtonEl) {
      const name = menuButtonEl.dataset.shMenu;
      const menu = overlay.querySelector(`[data-sh-menu-for="${name}"]`);
      const wasOpen = menu && !menu.hidden;
      closeMenus();
      if (menu && !wasOpen) {
        menu.hidden = false;
        menuButtonEl.setAttribute('aria-expanded', 'true');
        placeMenu(menu, menuButtonEl);
      }
      return;
    }
    const doer = event.target.closest('[data-sh-do]');
    if (doer) { closeMenus(); run(doer.dataset.shDo); return; }
    if (!event.target.closest('.sh-menu')) closeMenus();

    if (event.target.closest('[data-sh-print]')) printSheet();
    if (event.target.closest('[data-sh-export]')) exportWorkbook();
    if (event.target.closest('[data-sh-done]')) close();
    if (event.target === overlay) close();
  });

  overlay.addEventListener('input', (event) => {
    const color = event.target.closest('[data-sh-color]');
    if (color) { patch({ [color.dataset.shColor]: color.value }); return; }
    const setter = event.target.closest('[data-sh-set]');
    if (!setter) return;
    const key = setter.dataset.shSet;
    patch({ [key]: key === 'fs' ? Number(setter.value) : (setter.value === 'general' ? null : setter.value) });
  });

  // ---- printing ------------------------------------------------------------------------------

  /**
   * The last row and column with anything on them.
   *
   * A sheet is 20x8 whether or not anybody filled it in, and printing the grid rather than the
   * content is what makes a spreadsheet print look like a spreadsheet instead of a document.
   */
  function usedBounds() {
    let rows = 0;
    let cols = 0;
    const reach = (ref) => {
      const at = parseRef(ref);
      if (!at) return;
      rows = Math.max(rows, at.row + 1);
      cols = Math.max(cols, at.col + 1);
    };
    Object.keys(sheet.cells || {}).forEach(reach);
    Object.keys(sheet.styles || {}).forEach(reach);
    (sheet.merges || []).forEach((text) => {
      const range = parseRange(text);
      if (!range) return;
      rows = Math.max(rows, range.r2 + 1);
      cols = Math.max(cols, range.c2 + 1);
    });
    return { rows: Math.max(1, Math.min(sheet.rows, rows)), cols: Math.max(1, Math.min(sheet.cols, cols)) };
  }

  /**
   * The sheet as a document: what is on it, and nothing else.
   *
   * Built fresh rather than printed from the grid on screen. The grid carries row numbers,
   * column letters and whatever is selected, and printing those puts an orange header band and
   * a black stripe on the page -- which is what a spreadsheet looks like, not what a document
   * looks like. Like Excel, gridlines are off: the only lines that print are the ones somebody
   * drew.
   */
  function printMarkup() {
    const { values, errors } = evaluateSheet(sheet);
    const size = usedBounds();
    const cols = Array.from({ length: size.cols }, (_, col) => `<col style="width:${colWidth(sheet, col)}px">`).join('');
    const body = Array.from({ length: size.rows }, (_, row) => {
      const cells = Array.from({ length: size.cols }, (_, col) => {
        const ref = cellRef(row, col);
        if (isCovered(sheet, ref)) return '';
        const merge = mergeAt(sheet, ref);
        const span = merge ? ` colspan="${Math.min(merge.c2, size.cols - 1) - merge.c1 + 1}" rowspan="${Math.min(merge.r2, size.rows - 1) - merge.r1 + 1}"` : '';
        const format = styleOf(sheet, ref)?.nf;
        const text = errors[ref]
          ? shownValue(values, errors, ref)
          : formatNumber(values[ref] ?? shownValue(values, errors, ref), format);
        const style = cellStyle(ref);
        const numeric = typeof values[ref] === 'number' && !styleOf(sheet, ref)?.ha ? ' class="num"' : '';
        return `<td${numeric}${span}${style ? ` style="${esc(style)}"` : ''}>${esc(text === '' ? '' : text)}</td>`;
      }).join('');
      const height = sheet.rowH?.[row] ? ` style="height:${sheet.rowH[row]}px"` : '';
      return `<tr${height}>${cells}</tr>`;
    }).join('');
    return `<table class="sh-print-grid"><colgroup>${cols}</colgroup><tbody>${body}</tbody></table>`;
  }

  function printSheet() {
    const host = document.createElement('div');
    host.className = 'sh-print';
    const heading = sheet.title || title;
    host.innerHTML = `${heading ? `<h1>${esc(heading)}</h1>` : ''}${printMarkup()}`;
    document.body.appendChild(host);
    document.body.classList.add('sh-printing');
    try {
      window.print();
    } finally {
      // Removed whatever happened, including the user cancelling the dialog -- a stray copy of
      // the sheet left in the body would print again on the next unrelated Ctrl+P.
      document.body.classList.remove('sh-printing');
      host.remove();
    }
  }

  function say(message) {
    const bar = overlay.querySelector('[data-sh-title]');
    if (bar) bar.textContent = message;
  }

  async function exportWorkbook() {
    try {
      const { writeXlsx } = await import('./sheet-xlsx.js');
      const name = (sheet.title || title || 'Sheet').replace(/[\\/:*?"<>|]/g, ' ').trim() || 'Sheet';
      const blob = await writeXlsx(sheet, evaluateSheet(sheet).values, name);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Revoked on the next tick rather than immediately: the download has to have started.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (error) {
      say(`Could not export — ${error.message}`);
    }
  }

  overlay.addEventListener('change', async (event) => {
    const picker = event.target.closest('[data-sh-file]');
    const file = picker?.files?.[0];
    if (!file) return;
    try {
      if (/\.xlsx$/i.test(file.name)) {
        // The formatting comes with it: fills, text colour, cell lines, alignment, widths,
        // heights, merges and every formula this engine can work out.
        sheet = await (await import('./sheet-xlsx.js')).readXlsxSheet(file, sheet);
      } else {
        const rows = (await import('../data/csv.js')).parseCsvRows(await file.text());
        sheet = normalizeSheetFull(sheetFromRows(rows, sheet));
      }
      anchor = 'A1';
      sel = rangeOf('A1', 'A1');
      paint();
    } catch (error) {
      // Said out loud on the sheet rather than only in the console: somebody who just picked a
      // file needs to know it did not go in.
      say(`Could not read that file — ${error.message}`);
    } finally {
      picker.value = '';
    }
  });

  function close() {
    if (!readOnly) write(normalizeSheetFull(sheet));
    overlay.remove();
    document.removeEventListener('keydown', onEscape, true);
    document.removeEventListener('keydown', onGridKey);
    document.removeEventListener('mouseup', stopDrag);
  }
  const onEscape = (event) => {
    // Escape closes the sheet, not the record form behind it, so it is caught before anything
    // else sees it.
    if (event.key === 'Escape' && !editing && overlay.isConnected) event.stopPropagation();
  };

  document.addEventListener('keydown', onEscape, true);
  document.body.appendChild(overlay);
  paint();
  overlay.tabIndex = -1;
  overlay.focus();
  return overlay;
}

/**
 * Open the sheet held by a hidden input on the page.
 *
 * All of it -- finding the field, reading its JSON, handing the result back -- lives here
 * rather than in main.js, which would otherwise carry it for every session that never opens a
 * sheet.
 */
export function openFor(fieldId, { render }) {
  const holder = document.querySelector(`[data-f="${typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(fieldId) : fieldId}"]`);
  if (!holder) return null;
  return openSheetEditor({
    title: holder.dataset.wbSheetTitle || 'Sheet',
    readOnly: !!holder.disabled,
    read: () => { try { return JSON.parse(holder.value || '{}'); } catch { return {}; } },
    write: (sheet) => {
      holder.value = JSON.stringify(sheet);
      holder.dispatchEvent(new Event('input', { bubbles: true }));
      holder.dispatchEvent(new Event('change', { bubbles: true }));
      render?.();
    },
  });
}
