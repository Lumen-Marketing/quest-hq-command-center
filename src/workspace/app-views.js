// Dashboard and Calendar for any App Builder app.
//
// Both are read-only views over records the app already holds, built from the app's own
// fields rather than a new configuration surface: the status field is the pipeline, a money
// or number field is the total, a date field is the calendar. An app that has none of those
// gets an empty state that says which field to add, not a broken chart.
//
// Fetched on demand — you have to click the tab, and nothing else needs them to paint.

import { boardColumns } from './pipeline-core.js';
import { memosByDay } from './calendar-memos.js';
import { addDays, iso, monthGrid, mondayIndex, startOfWeek } from '../jobs/job-calendar.js';
import {
  dashboardFor, metricValue, numberFields, optionFields, widgetMeta, widgetRecords,
} from './dashboard-widgets.js';

/** Month is the default: it is the view you can orient yourself in without scrolling. */
export const CAL_VIEWS = ['month', 'week', 'day'];
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Fields that can put a record on a calendar. */
export function dateFields(app) {
  return (app?.fields || []).filter((f) => f.type === 'date');
}

/**
 * Records placed on a day by ANY of several date fields.
 *
 * A job with a start date and a due date belongs on both days, and which field put it there
 * is what the pill has to say -- otherwise the same record appears twice with no explanation.
 * Picking one field and ignoring the rest made the calendar quietly incomplete: the dates
 * were in the app, just not on the screen.
 */
export function recordsByDates(app, fields) {
  const list = (fields || []).filter(Boolean);
  const byDay = new Map();
  const placed = new Set();
  for (const item of app?.items || []) {
    for (const field of list) {
      const raw = String(item.values?.[field.id] ?? '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) continue;
      if (!byDay.has(raw)) byDay.set(raw, []);
      byDay.get(raw).push({ item, field });
      placed.add(item.id);
    }
  }
  // Undated counts RECORDS with no date in any of these fields, not empty field values --
  // otherwise an app with three date fields reports three times the misses it has.
  const undated = (app?.items || []).filter((it) => !placed.has(it.id)).length;
  return { byDay, undated };
}

/**
 * The same for a single field. Kept for the dashboard's mini calendar, which shows one.
 *
 * A record with no date is not placed rather than dropped: the calendar reports how many are
 * missing one, so a month that looks empty can be told apart from a month nobody has dated.
 */
export function recordsByDay(app, field) {
  const byDay = new Map();
  let undated = 0;
  for (const item of app?.items || []) {
    const raw = String(item.values?.[field?.id] ?? '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) { undated += 1; continue; }
    if (!byDay.has(raw)) byDay.set(raw, []);
    byDay.get(raw).push(item);
  }
  return { byDay, undated };
}

export function createAppViews(ctx) {
  const {
    h, can, money, emptyState, appHref, companyPath, wbItemTitle, wbTimeAgo, wbModalShell,
  } = ctx;

  const itemHref = (companyId, app, item) => appHref(companyPath('workspaces', {
    app_id: app.id, tab: 'items', item_id: item.id,
  }, companyId));

  // ---- Dashboard --------------------------------------------------------------------------

  /**
   * The dashboard, as whatever arrangement the app carries.
   *
   * Customise mode adds a row of controls to each widget rather than a separate editor: the
   * thing you are moving is the thing you are looking at, and a preview that lives somewhere
   * else is a second thing to keep in step.
   */
  function renderAppDashboard(companyId, app, manageMode = false) {
    const widgets = dashboardFor(app);
    const canManage = can('workspaces.manage', companyId);
    const editing = manageMode && canManage;
    const todayIso = iso(new Date());

    if (!widgets.length) {
      return `${dashControls(canManage, editing)}<div class="wb-empty"><i class="ti ti-layout-dashboard"></i><h3>This dashboard is empty</h3><p>Add a card to start building it.</p></div>`;
    }

    const body = widgets.map((widget, i) => {
      const meta = widgetMeta(widget.type);
      const controls = editing ? `
        <div class="wb-w-tools">
          <span class="wb-w-grip" title="Drag to reorder" aria-hidden="true"><i class="ti ti-grip-vertical"></i></span>
          <button class="wb-w-btn" type="button" data-wb-dash-move="${h(widget.id)}:up" ${i === 0 ? 'disabled' : ''} title="Move earlier" aria-label="Move earlier"><i class="ti ti-chevron-left"></i></button>
          <button class="wb-w-btn" type="button" data-wb-dash-move="${h(widget.id)}:down" ${i === widgets.length - 1 ? 'disabled' : ''} title="Move later" aria-label="Move later"><i class="ti ti-chevron-right"></i></button>
          <span class="wb-w-sizes" role="group" aria-label="Width">
            ${[1, 2, 3, 4].map((n) => `<button class="wb-w-size ${widget.size === n ? 'on' : ''}" type="button" data-wb-dash-size="${h(widget.id)}:${n}" title="${n} column${n === 1 ? '' : 's'}" aria-pressed="${widget.size === n}">${n}</button>`).join('')}
          </span>
          ${meta?.config ? `<button class="wb-w-btn" type="button" data-wb-dash-config="${h(widget.id)}" title="Settings" aria-label="Settings"><i class="ti ti-settings"></i></button>` : ''}
          <button class="wb-w-btn danger" type="button" data-wb-dash-remove="${h(widget.id)}" title="Remove" aria-label="Remove"><i class="ti ti-x"></i></button>
        </div>` : '';
      return `<section class="wb-w wb-w-${h(widget.type)} ${editing ? 'editing' : ''}" style="--w-span:${widget.size}" data-wb-dash-id="${h(widget.id)}" ${editing ? 'draggable="true"' : ''}>
        ${controls}
        ${widgetBody(companyId, app, widget, todayIso)}
      </section>`;
    }).join('');

    return `${dashControls(canManage, editing)}<div class="wb-dash-grid" data-wb-dash-grid>${body}</div>`;
  }

  function dashControls(canManage, editing) {
    if (!canManage) return '';
    return `<div class="wb-dash-controls">
      <button class="btn btn-sm ${editing ? 'btn-primary' : ''}" type="button" data-wb-dash-manage>${editing ? '<i class="ti ti-check"></i>Done' : '<i class="ti ti-adjustments"></i>Customize'}</button>
      ${editing ? '<button class="btn btn-sm" type="button" data-wb-dash-add><i class="ti ti-plus"></i>Add card</button><button class="btn btn-sm" type="button" data-wb-dash-reset><i class="ti ti-rotate"></i>Reset</button>' : ''}
    </div>`;
  }

  /** One widget's contents. Everything it needs comes from the app; nothing is stored twice. */
  function widgetBody(companyId, app, widget, todayIso) {
    const cfg = widget.config || {};
    const fieldById = (id) => (app.fields || []).find((f) => f.id === id) || null;

    if (widget.type === 'clock') {
      // The date is rendered; the time is filled in by a ticking script, because markup
      // written once cannot show a clock.
      return `<div class="wb-w-clock">
        <span class="wb-w-label">${h(new Date().toLocaleDateString(undefined, { weekday: 'long' }))}</span>
        <strong data-wb-clock>--:--</strong>
        <span class="wb-w-caption">${h(new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }))}</span>
      </div>`;
    }

    if (widget.type === 'note') {
      const text = String(cfg.text || '').trim();
      return `<div class="wb-w-note">${text ? h(text) : emptyState('Add a note in this card’s settings.')}</div>`;
    }

    if (widget.type === 'metric') {
      const m = metricValue(app, cfg, todayIso);
      return `<div class="wb-w-metric">
        <span class="wb-w-label">${h(m.label)}</span>
        <strong>${m.money ? h(money(m.value)) : h(String(m.value))}</strong>
        <span class="wb-w-caption">${h(m.caption)}</span>
      </div>`;
    }

    if (widget.type === 'stages') {
      const field = fieldById(cfg.fieldId) || optionFields(app)[0] || null;
      if (!field) return widgetSetup('Add a Status or Category field, and its options become the bars here.');
      const sum = numberFields(app).find((f) => f.id === cfg.sumId) || null;
      const columns = boardColumns(app.items || [], field, sum);
      const total = (app.items || []).length;
      return `<h3 class="wb-w-title">By ${h(field.label)}</h3>
        <div class="wb-dash-bars">${columns.map((col) => `
          <div class="wb-dash-bar">
            <span class="wb-dash-bar-name"><i style="background:${h(col.color)}"></i>${h(col.label)}</span>
            <span class="wb-dash-bar-track"><span style="width:${total ? Math.round((col.count / total) * 100) : 0}%;background:${h(col.color)}"></span></span>
            <span class="wb-dash-bar-n">${h(String(col.count))}${col.total != null && sum ? ` · ${h(money(col.total))}` : ''}</span>
          </div>`).join('')}</div>`;
    }

    if (widget.type === 'calendar') {
      const field = fieldById(cfg.fieldId) || dateFields(app)[0] || null;
      if (!field) return widgetSetup('Add a Date field, and this shows the month with its records on it.');
      const anchor = new Date();
      const { byDay } = recordsByDay(app, field);
      return `<h3 class="wb-w-title">${h(anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }))} · ${h(field.label)}</h3>
        <div class="wb-cal-grid wb-cal-mini">
          ${DOW.map((d) => `<span class="wb-cal-dow">${d[0]}</span>`).join('')}
          ${monthGrid(anchor).flat().map((day) => {
    const key = iso(day);
    const n = (byDay.get(key) || []).length;
    return `<div class="wb-cal-day ${day.getMonth() !== anchor.getMonth() ? 'dim' : ''} ${key === todayIso ? 'today' : ''}">
              <span class="wb-cal-num">${day.getDate()}</span>
              ${n ? `<a class="wb-cal-count" href="${appHref(companyPath('workspaces', { app_id: app.id, tab: 'calendar', view: 'day', on: key, field: field.id }, companyId))}" data-router style="background:${h(app.color)}">${n}</a>` : ''}
            </div>`;
  }).join('')}
        </div>`;
    }

    // records and recent are the same list with a different question behind it.
    const isRecent = widget.type === 'recent';
    const field = isRecent ? null : fieldById(cfg.fieldId);
    const { rows, total } = widgetRecords(app, isRecent ? { limit: cfg.limit } : cfg);
    const chosen = field && cfg.value
      ? (field.config?.options || []).find((o) => o.id === cfg.value)
      : null;
    const title = isRecent
      ? 'Recently active'
      : `${field ? h(field.label) : 'Records'}${chosen ? ` · ${h(chosen.label)}` : ''}`;
    return `<h3 class="wb-w-title">${title}<span class="wb-w-count">${h(String(total))}</span></h3>
      ${rows.length ? `<ul class="wb-dash-recent">${rows.map((item) => `
        <li>
          <a href="${itemHref(companyId, app, item)}" data-router>${h(wbItemTitle(app, item)) || 'Untitled'}</a>
          <span>${h(wbTimeAgo(item.lastActivityAt || item.updatedAt || item.createdAt || ''))}</span>
        </li>`).join('')}</ul>` : emptyState('Nothing matches this card yet.')}`;
  }

  const widgetSetup = (message) => `<div class="wb-w-setup"><i class="ti ti-settings"></i><span>${message}</span></div>`;

  // ---- Calendar ---------------------------------------------------------------------------

  function renderAppCalendar(companyId, app, anchorIso, fieldId, viewMode) {
    const candidates = dateFields(app);
    const canManage = can('workspaces.manage', companyId);
    // The calendar renders whether or not the app has a date field yet. Replacing it with an
    // empty state hid the whole feature behind a setup step, so you could not see what you
    // were being asked to set up. With no field it draws the month you are on, empty, and
    // says what to add above it.
    const view = CAL_VIEWS.includes(viewMode) ? viewMode : 'month';
    // 'all' is the default and the useful one: every dated record on the calendar, whichever
    // field carries its date. Narrowing to one field is a filter you choose, not the starting
    // point -- starting there hid records that were already dated.
    const chosen = candidates.find((f) => f.id === fieldId) || null;
    const field = chosen;
    const active = chosen ? [chosen] : candidates;
    const anchor = /^\d{4}-\d{2}-\d{2}$/.test(String(anchorIso || '')) ? new Date(`${anchorIso}T12:00:00`) : new Date();
    const { byDay, undated } = recordsByDates(app, active);
    const memoDays = memosByDay(app);
    const todayIso = iso(new Date());
    const link = (params) => appHref(companyPath('workspaces', {
      app_id: app.id, tab: 'calendar', ...(field ? { field: field.id } : {}), ...params,
    }, companyId));

    // Step by whatever the view shows. A "next" that jumps a month while you are looking at
    // a week is the kind of thing you only notice after losing your place.
    const step = (delta) => {
      const next = new Date(anchor);
      if (view === 'month') next.setMonth(next.getMonth() + delta);
      else return iso(addDays(anchor, delta * (view === 'week' ? 7 : 1)));
      return iso(next);
    };

    // With several date fields in play the same record lands on more than one day, so the
    // pill names the field that put it there. With one field that would be noise, so it is
    // only shown when it actually disambiguates.
    const many = active.length > 1;
    const pill = ({ item, field: on }) => `<a class="wb-cal-pill" href="${itemHref(companyId, app, item)}" data-router style="border-left-color:${h(app.color)}" title="${h(wbItemTitle(app, item))}${on ? ` — ${h(on.label)}` : ''}">${many && on ? `<b class="wb-cal-why">${h(on.label)}</b>` : ''}${h(wbItemTitle(app, item)) || 'Untitled'}</a>`;
    const memoPill = (memo) => `<button type="button" class="wb-cal-memo ${memo.done ? 'done' : ''}" data-wb-memo-open="${h(memo.id)}" title="${h(memo.note || memo.title)}">
      <i class="ti ti-${memo.remindMinutes == null ? 'note' : 'bell'}"></i>${memo.time ? `<b>${h(memo.time)}</b>` : ''}${h(memo.title)}
    </button>`;
    const dayCell = (day, { dim = false, cap = 0 } = {}) => {
      const key = iso(day);
      const items = byDay.get(key) || [];
      const memos = memoDays.get(key) || [];
      const shown = cap ? items.slice(0, cap) : items;
      return `<div class="wb-cal-day ${dim ? 'dim' : ''} ${key === todayIso ? 'today' : ''}">
        <span class="wb-cal-num">${day.getDate()}</span>
        ${canManage ? `<button type="button" class="wb-cal-add" data-wb-memo-new="${h(key)}" title="Add a memo on ${h(key)}" aria-label="Add a memo on ${h(key)}"><i class="ti ti-plus"></i></button>` : ''}
        ${memos.map(memoPill).join('')}
        ${shown.map(pill).join('')}
        ${cap && items.length > cap ? `<a class="wb-cal-more" href="${link({ view: 'day', on: key })}" data-router>+${items.length - cap} more</a>` : ''}
      </div>`;
    };

    let label = '';
    let grid = '';
    if (view === 'month') {
      label = anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      grid = `<div class="wb-cal-grid">
        ${DOW.map((d) => `<span class="wb-cal-dow">${d}</span>`).join('')}
        ${monthGrid(anchor).flat().map((day) => dayCell(day, { dim: day.getMonth() !== anchor.getMonth(), cap: 3 })).join('')}
      </div>`;
    } else if (view === 'week') {
      const start = startOfWeek(anchor);
      const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
      const end = days[6];
      // Built by parts rather than by passing a partial option set to toLocaleDateString:
      // asking for { day, year } produced "2026 (day: 9)", because dropping the month leaves
      // the formatter to invent a shape for what is left.
      const md = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      label = start.getFullYear() !== end.getFullYear()
        ? `${md(start)}, ${start.getFullYear()} – ${md(end)}, ${end.getFullYear()}`
        : start.getMonth() === end.getMonth()
          ? `${md(start)} – ${end.getDate()}, ${end.getFullYear()}`
          : `${md(start)} – ${md(end)}, ${end.getFullYear()}`;
      // No cap in week view: there is room, and the reason to leave the month is to see
      // everything on a day rather than "+4 more".
      grid = `<div class="wb-cal-grid wb-cal-week">
        ${days.map((day, i) => `<span class="wb-cal-dow">${DOW[i]} ${day.getDate()}</span>`).join('')}
        ${days.map((day) => dayCell(day)).join('')}
      </div>`;
    } else {
      const key = iso(anchor);
      const items = byDay.get(key) || [];
      const memos = memoDays.get(key) || [];
      label = anchor.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      grid = `<div class="wb-cal-single ${key === todayIso ? 'today' : ''}">
        ${canManage ? `<button class="btn btn-sm" type="button" data-wb-memo-new="${h(key)}"><i class="ti ti-plus"></i>Add memo</button>` : ''}
        ${memos.length ? `<ul class="wb-cal-daylist">${memos.map((m) => `<li>${memoPill(m)}</li>`).join('')}</ul>` : ''}
        ${items.length
    ? `<ul class="wb-cal-daylist">${items.map((entry) => `<li>${pill(entry)}</li>`).join('')}</ul>`
    : memos.length ? '' : emptyState(field ? `Nothing is set to ${h(field.label.toLowerCase())} on this day.` : 'Nothing on this day yet.')}
      </div>`;
    }

    return `
      <div class="wb-cal">
        <div class="wb-cal-head">
          <h3>${h(label)}</h3>
          <div class="wb-cal-nav">
            <a class="btn btn-sm" href="${link({ view, on: step(-1) })}" data-router aria-label="Previous ${view}"><i class="ti ti-chevron-left"></i></a>
            <a class="btn btn-sm" href="${link({ view })}" data-router>Today</a>
            <a class="btn btn-sm" href="${link({ view, on: step(1) })}" data-router aria-label="Next ${view}"><i class="ti ti-chevron-right"></i></a>
          </div>
          <div class="wb-cal-views" role="group" aria-label="Calendar view">
            ${CAL_VIEWS.map((mode) => `<a class="wb-cal-view ${view === mode ? 'on' : ''}" href="${link({ view: mode, ...(anchorIso ? { on: anchorIso } : {}) })}" data-router aria-current="${view === mode ? 'page' : 'false'}">${mode[0].toUpperCase()}${mode.slice(1)}</a>`).join('')}
          </div>
          ${candidates.length > 1 ? `<label class="wb-chip-manage" title="Which date field the calendar uses">
            <select class="wb-chip-select" data-wb-cal-field aria-label="Calendar date field">
              <option value="" ${chosen ? '' : 'selected'}>All dates</option>
              ${candidates.map((f) => `<option value="${h(f.id)}" ${chosen && f.id === chosen.id ? 'selected' : ''}>By ${h(f.label)}</option>`).join('')}
            </select></label>` : candidates.length === 1 ? `<span class="wb-cal-by">By ${h(candidates[0].label)}</span>` : ''}
        </div>
        ${candidates.length ? '' : `<p class="wb-cal-setup">
          <i class="ti ti-calendar"></i>
          <span>This app has no <b>Date</b> field yet, so nothing can be placed on the calendar.</span>
          ${can('workspaces.manage', companyId) ? `<a class="btn btn-sm btn-primary" href="${appHref(companyPath('workspaces', { app_id: app.id, tab: 'fields' }, companyId))}" data-router><i class="ti ti-plus"></i>Add field</a>` : ''}
        </p>`}
        ${grid}
        ${field && undated ? `<p class="wb-cal-undated">${undated} record${undated === 1 ? '' : 's'} ${undated === 1 ? 'has' : 'have'} no <b>${h(field.label)}</b> yet, so ${undated === 1 ? 'it is' : 'they are'} not shown here.</p>` : ''}
      </div>`;
  }


  /**
   * The two dialogs the customiser opens.
   *
   * They live here rather than in main.js's modal renderer because they only ever open from
   * the dashboard tab, which has already fetched this module. Putting them in the eager
   * renderer taxed every page load for markup almost nobody opens.
   */
  function renderDashModal(m) {
  if (m.kind === 'dash-add') {
    return wbModalShell('Add card', 'wb-modal-wide',
      '<div class="wb-modal-ic" style="background:#2563eb"><i class="ti ti-layout-dashboard"></i></div><h3>Add a card</h3>',
      `<div class="wb-catalog">${m.options.map((opt) => `
        <button class="wb-catalog-item ${opt.supported ? '' : 'blocked'}" type="button" ${opt.supported ? `data-wb-dash-pick="${h(opt.type)}"` : 'disabled'}>
          <i class="ti ${h(opt.icon)}"></i>
          <span><b>${h(opt.label)}</b><small>${opt.supported ? h(opt.desc) : h(opt.blocked)}</small></span>
        </button>`).join('')}</div>`,
      '<button class="btn" data-action="wb-modal-close">Close</button>');
  }
  if (m.kind === 'dash-config') {
    const w = m.widget;
    const cfg = w.config || {};
    const pick = (name, label, list, selected, allowNone = '') => `<div class="wb-field"><label>${h(label)}</label>
      <select class="wb-input" data-wb-dashcfg="${h(name)}">
        ${allowNone ? `<option value="">${h(allowNone)}</option>` : ''}
        ${list.map((o) => `<option value="${h(o.id)}" ${String(selected) === String(o.id) ? 'selected' : ''}>${h(o.label)}</option>`).join('')}
      </select></div>`;
    let fields = '';
    if (w.type === 'metric') {
      fields = `${pick('metric', 'Show', [
    { id: 'count', label: 'Number of records' },
    { id: 'sum', label: 'Total of a number field' },
    { id: 'added', label: 'Added in the last seven days' },
    { id: 'touched', label: 'Edited in the last seven days' },
  ], cfg.metric || 'count')}
        ${pick('fieldId', 'Field to total', m.numberFields, cfg.fieldId, m.numberFields.length ? 'Pick a field' : 'No number fields — add one to the app or a sub-item list')}`;
    } else if (w.type === 'stages') {
      fields = `${pick('fieldId', 'Group by', m.optionFields, cfg.fieldId)}
        ${pick('sumId', 'Also total (optional)', m.numberFields, cfg.sumId, 'Count only')}`;
    } else if (w.type === 'calendar') {
      fields = pick('fieldId', 'Date field', m.dateFields, cfg.fieldId);
    } else if (w.type === 'note') {
      fields = `<div class="wb-field"><label>Text</label><textarea class="wb-input" data-wb-dashcfg="text" rows="3">${h(cfg.text || '')}</textarea></div>`;
    } else if (w.type === 'recent') {
      fields = `<div class="wb-field"><label>How many</label><input class="wb-input" type="number" min="1" max="50" data-wb-dashcfg="limit" value="${h(String(cfg.limit || 6))}"></div>`;
    } else {
      // records: pick the field, then optionally one of its values -- "jobs at QC" is the
      // whole point of this card.
      const chosen = m.optionFields.find((f) => f.id === cfg.fieldId);
      fields = `${pick('fieldId', 'Filter by', m.optionFields, cfg.fieldId, 'No filter — all records')}
        ${chosen ? pick('value', 'Showing', chosen.options.map((o) => ({ id: o.id, label: o.label })), cfg.value, 'Any value') : ''}
        <div class="wb-field"><label>How many</label><input class="wb-input" type="number" min="1" max="50" data-wb-dashcfg="limit" value="${h(String(cfg.limit || 6))}"></div>`;
    }
    return wbModalShell('Card settings', '',
      `<div class="wb-modal-ic" style="background:#2563eb"><i class="ti ti-settings"></i></div><h3>${h(w.type === 'metric' ? 'Number' : w.type)} card</h3>`,
      fields,
      '<button class="btn" data-action="wb-modal-close">Cancel</button><button class="btn btn-primary" data-wb-dashcfg-save><i class="ti ti-check"></i>Save</button>');
  }
    return '';
  }

  return { renderAppDashboard, renderAppCalendar, renderDashModal, mondayIndex };
}
