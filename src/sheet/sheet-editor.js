// The grid a Sheet field opens.
//
// Fetched on the first click. It is a full-screen overlay of its own rather than a page in the
// builder's modal system: a spreadsheet wants the whole window, it is opened from a record form
// that must survive underneath it, and nothing else in the app needs to know it exists.
//
// A cell SHOWS what it works out to and EDITS what was typed into it. That is the whole trick
// of a spreadsheet, and getting it the wrong way round -- showing the formula, or editing the
// result -- is what makes a grid feel like a form.

import {
  MAX_COLS,
  MAX_ROWS,
  SHEET_FUNCTIONS,
  cellRef,
  columnName,
  evaluateSheet,
  normalizeSheet,
  parseRef,
  sheetFromRows,
  shownValue,
} from './sheet-model.js';

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Open the grid over whatever is on screen.
 *
 * `read` hands back the sheet as stored, `write` takes it back when Done is pressed. Nothing is
 * written until then: a spreadsheet somebody is halfway through is not a saved record, and the
 * form underneath still has its own Save.
 */
export function openSheetEditor({ read, write, title = 'Sheet', readOnly = false }) {
  let sheet = normalizeSheet(read());
  let selected = 'A1';
  let editing = false;

  const overlay = document.createElement('div');
  overlay.className = 'sh-overlay';
  overlay.innerHTML = `
    <div class="sh-frame" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="sh-bar">
        <b class="sh-title">${esc(sheet.title || title)}</b>
        <div class="sh-ref" data-sh-ref>A1</div>
        <input class="sh-formula" data-sh-formula placeholder="Value, or =SUM(A1:A9)" ${readOnly ? 'disabled' : ''} spellcheck="false" aria-label="Cell contents">
        <div class="sh-tools">
          ${readOnly ? '' : `
            <button type="button" class="btn btn-sm" data-sh-add-row title="Add a row"><i class="ti ti-plus"></i>Row</button>
            <button type="button" class="btn btn-sm" data-sh-add-col title="Add a column"><i class="ti ti-plus"></i>Column</button>
            <label class="btn btn-sm sh-upload" title="Replace the sheet with a file">
              <i class="ti ti-upload"></i>Upload<input type="file" accept=".csv,.xlsx" data-sh-file hidden>
            </label>`}
          <button type="button" class="btn btn-sm" data-sh-print title="Print this sheet"><i class="ti ti-printer"></i>Print</button>
          <button type="button" class="btn btn-primary btn-sm" data-sh-done>${readOnly ? 'Close' : 'Done'}</button>
        </div>
      </div>
      <div class="sh-scroll" data-sh-scroll></div>
      <div class="sh-help">${esc(SHEET_FUNCTIONS.join('  '))}</div>
    </div>`;

  const gridHost = overlay.querySelector('[data-sh-scroll]');
  const formula = overlay.querySelector('[data-sh-formula]');
  const refLabel = overlay.querySelector('[data-sh-ref]');

  function paint() {
    const { values, errors } = evaluateSheet(sheet);
    const head = ['<th class="sh-corner"></th>']
      .concat(Array.from({ length: sheet.cols }, (_, col) => `<th>${columnName(col)}</th>`))
      .join('');
    const body = Array.from({ length: sheet.rows }, (_, row) => {
      const cells = Array.from({ length: sheet.cols }, (_, col) => {
        const ref = cellRef(row, col);
        const raw = sheet.cells[ref] || '';
        const text = shownValue(values, errors, ref);
        const classes = [
          ref === selected ? 'sel' : '',
          errors[ref] ? 'bad' : '',
          raw.startsWith('=') ? 'calc' : '',
          typeof values[ref] === 'number' ? 'num' : '',
          sheet.headerRow && row === 0 ? 'head' : '',
        ].filter(Boolean).join(' ');
        return `<td class="${classes}" data-sh-cell="${ref}" title="${esc(errors[ref] || '')}">${esc(text)}</td>`;
      }).join('');
      return `<tr><th class="sh-rownum">${row + 1}</th>${cells}</tr>`;
    }).join('');
    gridHost.innerHTML = `<table class="sh-grid"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    syncBar();
  }

  function syncBar() {
    refLabel.textContent = selected;
    if (!editing) formula.value = sheet.cells[selected] || '';
  }

  function select(ref) {
    if (!parseRef(ref)) return;
    selected = ref;
    gridHost.querySelectorAll('.sel').forEach((cell) => cell.classList.remove('sel'));
    gridHost.querySelector(`[data-sh-cell="${ref}"]`)?.classList.add('sel');
    syncBar();
  }

  function commit(ref, raw) {
    const text = String(raw ?? '');
    if (text.trim() === '') delete sheet.cells[ref];
    else sheet.cells[ref] = text;
    paint();
  }

  /** Move the selection, growing the sheet if somebody walks off the edge. */
  function step(dRow, dCol) {
    const at = parseRef(selected);
    if (!at) return;
    const row = Math.max(0, at.row + dRow);
    const col = Math.max(0, at.col + dCol);
    if (row >= sheet.rows && sheet.rows < MAX_ROWS) sheet.rows += 1;
    if (col >= sheet.cols && sheet.cols < MAX_COLS) sheet.cols += 1;
    if (row >= sheet.rows || col >= sheet.cols) return;
    paint();
    select(cellRef(row, col));
    gridHost.querySelector(`[data-sh-cell="${selected}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  // ---- typing into a cell ----
  // The box that appears over a cell holds the RAW text, which is the formula if there is one.
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

  gridHost.addEventListener('mousedown', (event) => {
    const cell = event.target.closest('[data-sh-cell]');
    if (!cell || event.target.matches('input')) return;
    if (editing) return;
    select(cell.dataset.shCell);
  });
  gridHost.addEventListener('dblclick', (event) => {
    const cell = event.target.closest('[data-sh-cell]');
    if (cell) edit(cell.dataset.shCell);
  });

  // The formula bar edits the selected cell, which is the other way in.
  formula.addEventListener('focus', () => { editing = true; });
  formula.addEventListener('blur', () => { if (editing) { editing = false; commit(selected, formula.value); select(selected); } });
  formula.addEventListener('keydown', (event) => {
    if (['Enter', 'Escape'].includes(event.key)) { event.preventDefault(); event.stopPropagation(); }
    if (event.key === 'Enter') { editing = false; commit(selected, formula.value); step(1, 0); }
    if (event.key === 'Escape') { editing = false; syncBar(); formula.blur(); }
  });

  overlay.addEventListener('keydown', (event) => {
    if (editing || event.target === formula) return;
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1], Enter: [1, 0] };
    if (moves[event.key]) { event.preventDefault(); step(...moves[event.key]); return; }
    if (event.key === 'Tab') { event.preventDefault(); step(0, event.shiftKey ? -1 : 1); return; }
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (readOnly) return;
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); commit(selected, ''); select(selected); return; }
    // Any printable character starts an edit with that character, the way a grid should.
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) { event.preventDefault(); edit(selected, event.key); }
  });

  overlay.addEventListener('click', (event) => {
    if (event.target.closest('[data-sh-add-row]') && sheet.rows < MAX_ROWS) { sheet.rows += 1; paint(); }
    if (event.target.closest('[data-sh-add-col]') && sheet.cols < MAX_COLS) { sheet.cols += 1; paint(); }
    if (event.target.closest('[data-sh-print]')) {
      // Printing prints the SHEET. The class is on the document so the page's own furniture --
      // sidebar, topbar, the record form underneath -- can be told to stay out of the way.
      document.body.classList.add('sh-printing');
      window.print();
      document.body.classList.remove('sh-printing');
    }
    if (event.target.closest('[data-sh-done]')) close();
    if (event.target === overlay) close();
  });

  overlay.addEventListener('change', async (event) => {
    const picker = event.target.closest('[data-sh-file]');
    const file = picker?.files?.[0];
    if (!file) return;
    try {
      const rows = /\.xlsx$/i.test(file.name)
        ? await (await import('../data/xlsx-read.js')).readXlsxRows(file)
        : (await import('../data/csv.js')).parseCsvRows(await file.text());
      sheet = sheetFromRows(rows, sheet);
      selected = 'A1';
      paint();
    } catch (error) {
      // Said out loud on the sheet rather than only in the console: somebody who just picked a
      // file needs to know it did not go in.
      const bar = overlay.querySelector('.sh-title');
      if (bar) bar.textContent = `Could not read that file — ${error.message}`;
    } finally {
      picker.value = '';
    }
  });

  function close() {
    if (!readOnly) write(normalizeSheet(sheet));
    overlay.remove();
    document.removeEventListener('keydown', onEscape, true);
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
