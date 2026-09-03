// The calculation table under a list, and the rows it becomes on paper.
//
// A TABLE, not a strip. Its columns are the app's own columns, so a total sits under the column
// it describes, and its rows are calculation LINES -- so one column can be asked two things (a
// Sum and an Average of the same money) and a reader can add a line for each. The first version
// was a strip of one answer per column, which made those mutually exclusive and, on paper,
// printed a list the reader had to match back up against the data by name.
//
// Native `select` and `input` rather than the builder's own menus, deliberately. The controls
// here are "pick one of fifteen" and "type a word", which is exactly what those two elements are.
//
// The arithmetic is not here -- it is in ./summary.js, which is pure and tested on its own.

import {
  OPTION_FIELD_TYPES, calcName, calcNeedsValue, computeSummary, formatSummary, functionsForType,
  isNumericType, isTextCalc, lineIsEmpty, summaryColName, summaryLabel, summaryLines,
  summaryLinesForEdit,
} from './summary.js';

/**
 * What the table is called.
 *
 * "Calculations" is only ever a default. What a team is actually totalling has a name of its own
 * -- Totals, Job costs, This month -- and the heading is the one place to say it, on screen and
 * on the printout. A blank falls back rather than leaving an unlabelled block of numbers.
 */
export function summaryTitleOf(app) {
  const given = String(app?.summaryTitle ?? '').trim();
  return given || 'Calculations';
}

/**
 * The column widths the printed data table and the printed calculation table BOTH use.
 *
 * Two tables only line up if they are told the same widths; left to themselves each sizes its
 * columns to its own contents, and a total ends up under the wrong heading. Percentages rather
 * than pixels so it holds at any paper size, and a narrow first column because it carries a row
 * number or a line name, never a value.
 */
export function printColgroup(fieldCount) {
  const rest = Math.max(fieldCount, 1);
  const width = ((100 - 6) / rest).toFixed(4);
  const body = Array.from({ length: rest }, () => `<col style="width:${width}%">`).join('');
  return `<colgroup><col style="width:6%">${body}</colgroup>`;
}

export function createSummaryBar(ctx) {
  const { h, wbPlainVal } = ctx;

  /**
   * What a field's cell means for counting purposes.
   *
   * Numbers stay raw, because the arithmetic wants the number and not "$1,200.00". Everything
   * else becomes what the reader sees, so "count if Male" is asked in the word on screen rather
   * than the option id underneath it, which nobody has ever seen.
   */
  function readerValue(companyId, workspace, app, field, item) {
    const raw = item?.values?.[field.id];
    if (isNumericType(field.type)) return raw;
    if (field.type === 'tags') {
      const ids = Array.isArray(raw) ? raw : [];
      const options = Array.isArray(field.config?.options) ? field.config.options : [];
      return ids.map((id) => options.find((option) => String(option.id) === String(id))?.label ?? id);
    }
    return wbPlainVal(companyId, workspace, app, field, raw, item?.values || {});
  }

  /** The rows a calculation covers: the ticked ones when any are ticked, otherwise all of them. */
  function scopeRows(rows, ui) {
    const picked = ui?.sel;
    if (!picked || !picked.size) return { rows, selected: false };
    const only = rows.filter((item) => picked.has(item.id));
    // A selection that survives no filter is not a selection worth honouring -- falling back to
    // everything beats showing a table of dashes.
    return only.length ? { rows: only, selected: true } : { rows, selected: false };
  }

  function valueFor(companyId, workspace, app, field, config, rows) {
    const cells = rows.map((item) => readerValue(companyId, workspace, app, field, item));
    return computeSummary(config, cells, { display: (value) => value });
  }

  /**
   * What the cell shows, as text.
   *
   * Custom text that was never typed shows nothing rather than a dash. The dash means "the rows
   * had no answer to give", and words nobody typed were never asked of the rows at all -- an
   * unfinished cell should look unfinished, not like a failed sum.
   */
  function answerFor(companyId, workspace, app, field, config, rows) {
    const value = valueFor(companyId, workspace, app, field, config, rows);
    if (isTextCalc(config)) return value === null ? '' : String(value);
    return formatSummary(value);
  }

  const configIn = (line, fieldId) => line.calc?.[fieldId] || { fn: 'none', value: '' };
  const isSet = (config) => !!(config && config.fn && config.fn !== 'none');
  const captionOf = (config) => String(config.label ?? '').trim() || summaryLabel(config);

  /** Which cell is being edited, as one string, because it is one cell across the whole card. */
  const openKey = (line, field) => `${line.id}::${field.id}`;

  /** The picker itself, shared by the cell and the editor so there is one control, drawn twice. */
  const pickerFor = (line, field, config) => {
    const choices = functionsForType(field.type)
      .map((fn) => `<option value="${fn.id}"${fn.id === config.fn ? ' selected' : ''}>${h(fn.label)}</option>`)
      .join('');
    return `<select class="wb-sum-fn" data-wb-sum-line="${h(line.id)}" data-wb-sum-fn="${h(field.id)}" aria-label="Calculation for ${h(field.label)}">${choices}</select>`;
  };

  const nameBox = (line, field, config) => `<input class="wb-sum-field-edit" data-wb-sum-line="${h(line.id)}" data-wb-sum-label="${h(field.id)}" value="${h(String(config.label ?? ''))}" placeholder="${h(calcName(field, config))}" aria-label="What this calculation is called" spellcheck="false" maxlength="60">`;

  /**
   * The box beside the choice.
   *
   * "Count if" is asked in the column's own words, so an option field offers its options. Custom
   * text is always typed: the words wanted there are "TOTAL DUE", which is nothing the column
   * has ever contained, so offering its values would be offering the wrong list.
   */
  function valueControl(line, field, config) {
    const current = String(config?.value ?? '');
    const attrs = `data-wb-sum-line="${h(line.id)}" data-wb-sum-val="${h(field.id)}"`;
    if (isTextCalc(config)) {
      return `<input class="wb-sum-val wb-sum-text" ${attrs} value="${h(current)}" placeholder="Text to show" aria-label="Text to show" maxlength="60">`;
    }
    if (OPTION_FIELD_TYPES.has(field.type)) {
      const options = Array.isArray(field.config?.options) ? field.config.options : [];
      return `<select class="wb-sum-val" ${attrs} aria-label="Value to count">
        <option value="">Pick a value…</option>
        ${options.map((option) => `<option value="${h(option.label)}"${String(option.label) === current ? ' selected' : ''}>${h(option.label)}</option>`).join('')}
      </select>`;
    }
    return `<input class="wb-sum-val" ${attrs} value="${h(current)}" placeholder="Value to count" aria-label="Value to count">`;
  }

  /**
   * The table.
   *
   * Every field is a column and every line is a row, which is the same shape the printout has --
   * so what is set up here is what comes out, rather than two layouts to reconcile. A column
   * asked nothing is an empty cell, on screen and on paper.
   */
  function summaryBar(companyId, workspace, app, rows, ui, canManage) {
    const fields = Array.isArray(app.fields) ? app.fields : [];
    if (!fields.length) return '';
    // A manager always gets one line to make the first choice in; a reader is shown only lines
    // that actually say something, so an unfinished one is never published as a row of blanks.
    const lines = canManage
      ? summaryLinesForEdit(app)
      : summaryLines(app).filter((line) => !lineIsEmpty(line));
    if (!lines.length) return '';
    const scope = scopeRows(rows, ui);

    // Which cell is open is a manager's question, and only ever one at a time: two editors both
    // spanning the card would be a stack of forms where the answers used to be.
    const openOn = canManage ? String(ui?.sumOpen || '') : '';

    const cell = (line, field) => {
      const config = configIn(line, field.id);
      const on = isSet(config);
      const answer = on ? answerFor(companyId, workspace, app, field, config, scope.rows) : '';
      // Typed words are not a figure to line up in a column of figures.
      const valueClass = `wb-sum-value${isTextCalc(config) ? ' wb-sum-value-text' : ''}`;
      if (!canManage) {
        // A number with no word for what it is means nothing: "1" under Name needs "Count if
        // Roman" beside it. Custom text is the exception -- it is already words.
        const caption = captionOf(config);
        return `<td class="wb-sum-cell${on ? ' on' : ''}">${on
          ? `<b class="${valueClass}">${h(answer)}</b>${caption ? `<small class="wb-sum-static">${h(caption)}</small>` : ''}`
          : ''}</td>`;
      }
      // A column asked nothing shows nothing. Fifteen columns meant fifteen dropdowns, which
      // read as fifteen unanswered questions and made a row of answers look like a form to fill
      // in. A button rather than a click handler on the cell: it is the thing that has to be
      // reachable by keyboard, and a bare td is not. The same button closes the editor again --
      // whatever opened a thing is where a hand goes back to to shut it, and leaving Done as the
      // only way out makes opening a cell to look at it a decision you have to undo.
      const editing = openKey(line, field) === openOn;
      const opener = `<button type="button" class="wb-sum-open" data-wb-sum-open="${h(openKey(line, field))}" aria-expanded="${editing}" title="${editing ? 'Close' : 'Add a calculation'}" aria-label="${editing ? 'Close the editor for' : 'Add a calculation for'} ${h(field.label)}"><i class="ti ti-plus"></i></button>`;
      // The cell being edited hands its controls down to the editor row, which spans the card.
      // Holding them in both places at once would be two ways to change one thing, side by side.
      if (editing) {
        return `<td class="wb-sum-cell${on ? ' on' : ''} wb-sum-cell-editing">${on ? `<b class="${valueClass}">${h(answer)}</b>` : ''}${opener}</td>`;
      }
      if (!on) return `<td class="wb-sum-cell">${opener}</td>`;
      // The name box is what the caption under the number says. Custom text has no caption to
      // name -- the typed words are the cell -- so naming them would be asking for the same
      // thing twice in one cell.
      return `<td class="wb-sum-cell on">
        <b class="${valueClass}">${h(answer)}</b>
        ${pickerFor(line, field, config)}
        ${calcNeedsValue(config) ? valueControl(line, field, config) : ''}
        ${isTextCalc(config) ? '' : nameBox(line, field, config)}
      </td>`;
    };

    /**
     * The editor for one cell, spanning the whole card.
     *
     * A picker squeezed into a 132px column is a control you have to aim at, and what it asks --
     * which calculation, counting what, called what -- is a sentence. A sentence wants a line.
     * It sits directly under the line it belongs to and names the column it is for, because
     * spanning the card costs it the one thing a cell had for free: position.
     */
    const editorRow = (line) => {
      const field = fields.find((one) => openKey(line, one) === openOn);
      if (!field) return '';
      const config = configIn(line, field.id);
      // The controls sit in a div rather than being flexed onto the td directly: a table cell
      // told to be a flex container is a fight with the table's own layout in some engines.
      return `<tr class="wb-sum-editor-row"><td class="wb-sum-editor" colspan="${fields.length + 1}">
        <div class="wb-sum-editor-in">
          <b class="wb-sum-editor-for">${h(summaryColName(app, field))}</b>
          ${pickerFor(line, field, config)}
          ${calcNeedsValue(config) ? valueControl(line, field, config) : ''}
          ${isSet(config) && !isTextCalc(config) ? nameBox(line, field, config) : ''}
          <button type="button" class="btn btn-sm wb-sum-editor-done" data-wb-sum-close>Done</button>
        </div>
      </td></tr>`;
    };

    const lineRow = (line, index) => `<tr>
      <th scope="row" class="wb-sum-line-head">
        ${canManage
          ? `<input class="wb-sum-line-name" data-wb-sum-line-name="${h(line.id)}" value="${h(line.label)}" placeholder="Line ${index + 1}" aria-label="What this line is called" spellcheck="false" maxlength="40">`
          : h(line.label)}
        ${canManage && lines.length > 1 ? `<button type="button" class="wb-sum-drop" data-wb-sum-drop="${h(line.id)}" title="Remove this line" aria-label="Remove this line"><i class="ti ti-x"></i></button>` : ''}
      </th>
      ${fields.map((field) => cell(line, field)).join('')}
    </tr>${canManage ? editorRow(line) : ''}`;

    // Shut until asked for. The calculations are a footnote to the list, not the reason anybody
    // opened it, and a card of pickers and totals sitting open under every list is a permanent
    // interruption between the records and the bottom of the page. The heading stays visible so
    // it is obvious what is behind it -- a collapsed card with no name is a mystery drawer.
    //
    // Not saved: a card the reader has to close on every visit is nagging, and a card that
    // remembers being open is a card that quietly stops being hidden. Open for as long as it is
    // being used, shut again next time.
    const shown = !!ui?.sumShown;
    const title = summaryTitleOf(app);
    const count = `${scope.rows.length} record${scope.rows.length === 1 ? '' : 's'}`;
    if (!shown) {
      // Collapsed, the whole heading is the button. There is nothing else on the row to click,
      // and a chevron alone is a small target for something this easy to want.
      return `<section class="wb-sum wb-sum-shut" data-wb-sum aria-label="${h(title)}">
        <button type="button" class="wb-sum-head wb-sum-toggle" data-wb-sum-toggle aria-expanded="false" aria-controls="wbSumBody">
          <i class="ti ti-chevron-right"></i>
          <b class="wb-sum-title">${h(title)}</b>
          <span class="wb-sum-scope">${scope.selected ? `<i class="ti ti-checkbox"></i>${count} selected` : count}</span>
        </button>
      </section>`;
    }

    return `<section class="wb-sum" data-wb-sum aria-label="${h(title)}">
      <div class="wb-sum-head">
        <button type="button" class="wb-sum-toggle wb-sum-toggle-open" data-wb-sum-toggle aria-expanded="true" aria-controls="wbSumBody" aria-label="Hide the calculations" title="Hide the calculations"><i class="ti ti-chevron-down"></i></button>
        ${canManage
          ? `<input class="wb-sum-title wb-sum-title-edit" data-wb-sum-title value="${h(title)}" aria-label="What this table of calculations is called" spellcheck="false" maxlength="60">`
          : `<b class="wb-sum-title">${h(title)}</b>`}
        <span class="wb-sum-scope">${scope.selected
          ? `<i class="ti ti-checkbox"></i>${scope.rows.length} selected record${scope.rows.length === 1 ? '' : 's'}`
          : count}</span>
        ${canManage ? `<label class="wb-sum-hide"><input type="checkbox" data-wb-sum-hide${app.summaryHideLabel ? ' checked' : ''}> Hide the labels when printing</label>` : ''}
      </div>
      <div id="wbSumBody">
      <div class="wb-sum-scroll"><table class="wb-sum-table">
        <thead><tr><th class="wb-sum-corner"></th>${fields.map((field) => `<th title="${h(field.label)}">${canManage
          ? `<input class="wb-sum-col-name" data-wb-sum-col="${h(field.id)}" value="${h(summaryColName(app, field))}" aria-label="What this column is called here" spellcheck="false" maxlength="60">`
          : h(summaryColName(app, field))}</th>`).join('')}</tr></thead>
        <tbody>${lines.map(lineRow).join('')}</tbody>
      </table></div>
      ${canManage ? '<button type="button" class="btn btn-sm wb-sum-add" data-wb-sum-add><i class="ti ti-plus"></i>Add line</button>' : ''}
      </div>
    </section>`;
  }

  /**
   * The same table, printed as a table of its own.
   *
   * It has to be BOTH separate and aligned. Rows in the data table's `tfoot` aligned but read as
   * more data; a table of its own read as separate but drifted, because two tables size their
   * columns to their own contents and a total slides out from under its heading. `printColgroup`
   * is what settles it: both tables are given the same fixed column widths, so they line up
   * without being the same table. Nothing is merged -- no cell spans another.
   */
  function summaryPrintTable(companyId, workspace, app, cols, rows, ui) {
    const lines = summaryLines(app).filter((line) => !lineIsEmpty(line));
    if (!lines.length) return '';
    const scope = scopeRows(rows, ui);
    const hide = !!app.summaryHideLabel;

    const body = lines.map((line) => {
      const value = (field) => {
        const config = configIn(line, field.id);
        if (!isSet(config)) return '<td></td>';
        // Words read from the left like every other word on the page; only figures want the
        // right edge, where they line up against the figures above them.
        const cls = isTextCalc(config) ? 'wb-sum-print-text' : 'wb-sum-print-num';
        return `<td class="${cls}">${h(answerFor(companyId, workspace, app, field, config, scope.rows))}</td>`;
      };
      const caption = (field) => {
        const config = configIn(line, field.id);
        return isSet(config) ? `<td class="wb-sum-print-cap">${h(captionOf(config))}</td>` : '<td></td>';
      };
      // An unnamed line prints blank. "Line 2" is a position, not a name.
      // `wb-sum-paired` is what drops the rule between a value and its caption. Without the
      // caption there is nothing to join, so the row keeps its own border -- otherwise the last
      // line of the table has no bottom edge and it reads as unfinished.
      const values = `<tr class="wb-sum-print-row${hide ? '' : ' wb-sum-paired'}"><th scope="row">${hide ? '' : h(line.label)}</th>${cols.map(value).join('')}</tr>`;
      // What each number IS, under it. This is the row the Hide-when-printing tick removes -- a
      // bare "1" under a Name column means nothing without "Count if Roman".
      return hide ? values : `${values}<tr class="wb-sum-print-labels"><td></td>${cols.map(caption).join('')}</tr>`;
    }).join('');

    // The table's NAME always prints. It identifies the table rather than labelling anything in
    // it, and a block of numbers under no heading at all is a puzzle -- which is what hiding it
    // produced. The tick is "hide the labels when printing", and it does exactly that: the column
    // headings, the per-calculation captions and the line names, which are the labels.
    const head = `<caption>${h(summaryTitleOf(app))}</caption>${hide ? '' : `<thead><tr><th></th>${
      cols.map((field) => `<th>${h(summaryColName(app, field))}</th>`).join('')}</tr></thead>`}`;
    return `<table class="wb-print-table wb-sum-print-table">${printColgroup(cols.length)}${head}<tbody>${body}</tbody></table>`;
  }

  return { summaryBar, summaryPrintTable, scopeRows, readerValue };
}
