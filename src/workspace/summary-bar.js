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
  OPTION_FIELD_TYPES, calcName, computeSummary, formatSummary, functionsForType,
  isNumericType, lineIsEmpty, summaryLabel, summaryLines, summaryLinesForEdit,
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

  const configIn = (line, fieldId) => line.calc?.[fieldId] || { fn: 'none', value: '' };
  const isSet = (config) => !!(config && config.fn && config.fn !== 'none');
  const captionOf = (config) => String(config.label ?? '').trim() || summaryLabel(config);

  /** The "count if" box: the field's own options when it has them, free text when it does not. */
  function valueControl(line, field, config) {
    const current = String(config?.value ?? '');
    const attrs = `data-wb-sum-line="${h(line.id)}" data-wb-sum-val="${h(field.id)}"`;
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

    const cell = (line, field) => {
      const config = configIn(line, field.id);
      const on = isSet(config);
      const answer = on ? formatSummary(valueFor(companyId, workspace, app, field, config, scope.rows)) : '';
      if (!canManage) {
        // A number with no word for what it is means nothing: "1" under Name needs "Count if
        // Roman" beside it.
        return `<td class="wb-sum-cell${on ? ' on' : ''}">${on
          ? `<b class="wb-sum-value">${answer}</b><small class="wb-sum-static">${h(captionOf(config))}</small>`
          : ''}</td>`;
      }
      const choices = functionsForType(field.type)
        .map((fn) => `<option value="${fn.id}"${fn.id === config.fn ? ' selected' : ''}>${h(fn.label)}</option>`)
        .join('');
      return `<td class="wb-sum-cell${on ? ' on' : ''}">
        ${on ? `<b class="wb-sum-value">${answer}</b>` : ''}
        <select class="wb-sum-fn" data-wb-sum-line="${h(line.id)}" data-wb-sum-fn="${h(field.id)}" aria-label="Calculation for ${h(field.label)}">${choices}</select>
        ${config.fn === 'countIf' ? valueControl(line, field, config) : ''}
        ${on ? `<input class="wb-sum-field-edit" data-wb-sum-line="${h(line.id)}" data-wb-sum-label="${h(field.id)}" value="${h(String(config.label ?? ''))}" placeholder="${h(calcName(field, config))}" aria-label="What this calculation is called" spellcheck="false" maxlength="60">` : ''}
      </td>`;
    };

    const lineRow = (line, index) => `<tr>
      <th scope="row" class="wb-sum-line-head">
        ${canManage
          ? `<input class="wb-sum-line-name" data-wb-sum-line-name="${h(line.id)}" value="${h(line.label)}" placeholder="Line ${index + 1}" aria-label="What this line is called" spellcheck="false" maxlength="40">`
          : h(line.label)}
        ${canManage && lines.length > 1 ? `<button type="button" class="wb-sum-drop" data-wb-sum-drop="${h(line.id)}" title="Remove this line" aria-label="Remove this line"><i class="ti ti-x"></i></button>` : ''}
      </th>
      ${fields.map((field) => cell(line, field)).join('')}
    </tr>`;

    return `<section class="wb-sum" data-wb-sum aria-label="${h(summaryTitleOf(app))}">
      <div class="wb-sum-head">
        ${canManage
          ? `<input class="wb-sum-title wb-sum-title-edit" data-wb-sum-title value="${h(summaryTitleOf(app))}" aria-label="What this table of calculations is called" spellcheck="false" maxlength="60">`
          : `<b class="wb-sum-title">${h(summaryTitleOf(app))}</b>`}
        <span class="wb-sum-scope">${scope.selected
          ? `<i class="ti ti-checkbox"></i>${scope.rows.length} selected record${scope.rows.length === 1 ? '' : 's'}`
          : `${scope.rows.length} record${scope.rows.length === 1 ? '' : 's'}`}</span>
        ${canManage ? `<label class="wb-sum-hide"><input type="checkbox" data-wb-sum-hide${app.summaryHideLabel ? ' checked' : ''}> Hide the labels when printing</label>` : ''}
      </div>
      <div class="wb-sum-scroll"><table class="wb-sum-table">
        <thead><tr><th class="wb-sum-corner"></th>${fields.map((field) => `<th title="${h(field.label)}">${h(field.label)}</th>`).join('')}</tr></thead>
        <tbody>${lines.map(lineRow).join('')}</tbody>
      </table></div>
      ${canManage ? '<button type="button" class="btn btn-sm wb-sum-add" data-wb-sum-add><i class="ti ti-plus"></i>Add line</button>' : ''}
    </section>`;
  }

  /**
   * The same table, as rows under the printed data.
   *
   * `tfoot` rows rather than a table of its own, because that is the only way they are
   * guaranteed to sit under the columns they describe: two tables size their columns
   * independently and a total drifts out from under its own heading. The blank row above is the
   * gap that keeps them reading as separate from the data.
   */
  function summaryPrintRows(companyId, workspace, app, cols, rows, ui) {
    const lines = summaryLines(app).filter((line) => !lineIsEmpty(line));
    if (!lines.length) return '';
    const scope = scopeRows(rows, ui);
    const hide = !!app.summaryHideLabel;

    const body = lines.map((line) => {
      const value = (field) => {
        const config = configIn(line, field.id);
        if (!isSet(config)) return '<td></td>';
        return `<td class="wb-sum-print-num">${formatSummary(valueFor(companyId, workspace, app, field, config, scope.rows))}</td>`;
      };
      const caption = (field) => {
        const config = configIn(line, field.id);
        return isSet(config) ? `<td class="wb-sum-print-cap">${h(captionOf(config))}</td>` : '<td></td>';
      };
      const name = h(line.label);
      const values = `<tr class="wb-sum-print-row"><th scope="row">${hide ? '' : name}</th>${cols.map(value).join('')}</tr>`;
      // What each number IS, under it. This is the row the Hide-when-printing tick removes -- a
      // bare "1" under a Name column means nothing without "Count if Roman".
      return hide ? values : `${values}<tr class="wb-sum-print-labels"><td></td>${cols.map(caption).join('')}</tr>`;
    }).join('');

    return `<tfoot><tr class="wb-sum-print-gap"><td colspan="${cols.length + 1}"></td></tr>${body}</tfoot>`;
  }

  return { summaryBar, summaryPrintRows, scopeRows, readerValue };
}
