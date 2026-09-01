// The calculation strip under a list, and the table it becomes on paper.
//
// Native `select` and `input` rather than the builder's own menus, deliberately. The controls
// here are "pick one of fifteen" and "type a word", which is exactly what those two elements
// are; a bespoke menu would be more code, worse with a keyboard, and no better to use.
//
// The arithmetic is not here -- it is in ./summary.js, which is pure and tested on its own.
// This file decides what a column's values ARE (an option id is not what the reader sees) and
// what the strip looks like.

import {
  OPTION_FIELD_TYPES, activeSummaries, calcName, computeSummary, formatSummary, functionsForType,
  isNumericType, summaryLabel,
} from './summary.js';

/**
 * What the strip is called.
 *
 * "Calculations" is only ever a default. What a team is actually totalling has a name of its own
 * -- Totals, Job costs, This month -- and the heading is the one place to say it, on screen and
 * on the printout. A blank falls back rather than leaving an unlabelled row of numbers.
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
    // everything beats showing a row of dashes.
    return only.length ? { rows: only, selected: true } : { rows, selected: false };
  }

  function valueFor(companyId, workspace, app, field, config, rows) {
    const cells = rows.map((item) => readerValue(companyId, workspace, app, field, item));
    return computeSummary(config, cells, { display: (value) => value });
  }

  /** The "count if" box: the field's own options when it has them, free text when it does not. */
  function valueControl(field, config) {
    const current = String(config?.value ?? '');
    if (OPTION_FIELD_TYPES.has(field.type)) {
      const options = Array.isArray(field.config?.options) ? field.config.options : [];
      return `<select class="wb-sum-val" data-wb-sum-val="${h(field.id)}" aria-label="Value to count">
        <option value="">Pick a value…</option>
        ${options.map((option) => `<option value="${h(option.label)}"${String(option.label) === current ? ' selected' : ''}>${h(option.label)}</option>`).join('')}
      </select>`;
    }
    return `<input class="wb-sum-val" data-wb-sum-val="${h(field.id)}" value="${h(current)}" placeholder="Value to count" aria-label="Value to count">`;
  }

  /**
   * The strip itself.
   *
   * Every field gets a cell, whether or not it has been asked a question, because the picker IS
   * the way to ask one -- hiding it behind an "add" step would mean two clicks to answer "what
   * is the total of this column".
   */
  function summaryBar(companyId, workspace, app, rows, ui, canManage) {
    const fields = Array.isArray(app.fields) ? app.fields : [];
    if (!fields.length) return '';
    const scope = scopeRows(rows, ui);
    const summary = app.summary && typeof app.summary === 'object' ? app.summary : {};

    const cell = (field) => {
      const config = summary[field.id] || { fn: 'none' };
      const answer = config.fn && config.fn !== 'none'
        ? formatSummary(valueFor(companyId, workspace, app, field, config, scope.rows))
        : '';
      const choices = functionsForType(field.type)
        .map((fn) => `<option value="${fn.id}"${fn.id === config.fn ? ' selected' : ''}>${h(fn.label)}</option>`)
        .join('');
      // The name is editable only once the column has been asked something. A row of editable
      // names above fifteen "None"s would read as fifteen calculations that are not there.
      const named = canManage && config.fn && config.fn !== 'none'
        ? `<input class="wb-sum-field wb-sum-field-edit" data-wb-sum-label="${h(field.id)}" value="${h(calcName(field, config))}" aria-label="What this calculation is called" spellcheck="false" maxlength="60" placeholder="${h(field.label)}">`
        : `<small class="wb-sum-field" title="${h(field.label)}">${h(calcName(field, config))}</small>`;
      return `<div class="wb-sum-cell${answer ? ' on' : ''}">
        ${named}
        <b class="wb-sum-value">${answer || '—'}</b>
        ${canManage ? `<select class="wb-sum-fn" data-wb-sum-fn="${h(field.id)}" aria-label="Calculation for ${h(field.label)}">${choices}</select>` : `<small class="wb-sum-static">${h(summaryLabel(config))}</small>`}
        ${canManage && config.fn === 'countIf' ? valueControl(field, config) : ''}
      </div>`;
    };

    return `<section class="wb-sum" data-wb-sum aria-label="${h(summaryTitleOf(app))}">
      <div class="wb-sum-head">
        ${canManage
          ? `<input class="wb-sum-title wb-sum-title-edit" data-wb-sum-title value="${h(summaryTitleOf(app))}" aria-label="What this row of calculations is called" spellcheck="false" maxlength="60">`
          : `<b class="wb-sum-title">${h(summaryTitleOf(app))}</b>`}
        <span class="wb-sum-scope">${scope.selected
          ? `<i class="ti ti-checkbox"></i>${scope.rows.length} selected record${scope.rows.length === 1 ? '' : 's'}`
          : `${scope.rows.length} record${scope.rows.length === 1 ? '' : 's'}`}</span>
        ${canManage ? `<label class="wb-sum-hide"><input type="checkbox" data-wb-sum-hide${app.summaryHideLabel ? ' checked' : ''}> Hide this label when printing</label>` : ''}
      </div>
      <div class="wb-sum-grid">${fields.map(cell).join('')}</div>
    </section>`;
  }

  /**
   * The same answers as a table of their own, for print.
   *
   * A table rather than the on-screen strip because paper has no scroll: the strip is a row that
   * runs off the side of the page, while a table of one row per calculation reads down. Only the
   * columns that were asked something appear -- printing fifteen dashes helps nobody.
   */
  function summaryPrintTable(companyId, workspace, app, rows, ui) {
    const active = activeSummaries(app.fields, app.summary);
    if (!active.length) return '';
    const scope = scopeRows(rows, ui);
    const body = active.map(({ field, config }) => `<tr>
      <td>${h(calcName(field, config))}</td>
      <td>${h(summaryLabel(config))}</td>
      <td class="wb-sum-print-num">${formatSummary(valueFor(companyId, workspace, app, field, config, scope.rows))}</td>
    </tr>`).join('');
    return `<table class="wb-sum-print">
      ${app.summaryHideLabel ? '' : `<caption>${h(summaryTitleOf(app))} — ${h(scope.selected ? `${scope.rows.length} selected records` : `${scope.rows.length} records`)}</caption>`}
      <thead><tr><th>Label</th><th>Calculation</th><th>Value</th></tr></thead>
      <tbody>${body}</tbody>
    </table>`;
  }

  return { summaryBar, summaryPrintTable, scopeRows, readerValue };
}
