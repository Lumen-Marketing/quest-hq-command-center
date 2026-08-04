// Dashboard and Calendar for any App Builder app.
//
// Both are read-only views over records the app already holds, built from the app's own
// fields rather than a new configuration surface: the status field is the pipeline, a money
// or number field is the total, a date field is the calendar. An app that has none of those
// gets an empty state that says which field to add, not a broken chart.
//
// Fetched on demand — you have to click the tab, and nothing else needs them to paint.

import { boardColumns, pipelineField, stagesOf, summaryField } from './pipeline-core.js';
import { addDays, iso, monthGrid, mondayIndex, startOfWeek } from '../jobs/job-calendar.js';

/** Month is the default: it is the view you can orient yourself in without scrolling. */
export const CAL_VIEWS = ['month', 'week', 'day'];
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Fields that can put a record on a calendar. */
export function dateFields(app) {
  return (app?.fields || []).filter((f) => f.type === 'date');
}

/**
 * Records grouped by the day they fall on.
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
  const { h, can, money, emptyState, appHref, companyPath, wbItemTitle, wbTimeAgo } = ctx;

  const itemHref = (companyId, app, item) => appHref(companyPath('workspaces', {
    app_id: app.id, tab: 'items', item_id: item.id,
  }, companyId));

  // ---- Dashboard --------------------------------------------------------------------------

  function renderAppDashboard(companyId, app) {
    if (!app.items.length) {
      return `<div class="wb-empty"><i class="ti ti-chart-donut"></i><h3>Nothing to summarise yet</h3><p>Add a few records and this fills in on its own.</p></div>`;
    }
    const field = pipelineField(app);
    const sum = summaryField(app);
    const columns = field ? boardColumns(app.items, field, sum) : [];
    const total = app.items.length;
    const grandTotal = sum ? app.items.reduce((n, it) => n + (Number(it.values?.[sum.id]) || 0), 0) : null;

    const tiles = [
      { label: 'Records', value: String(total), caption: field ? `across ${columns.length} ${columns.length === 1 ? 'stage' : 'stages'}` : 'no stages set up' },
      ...(sum ? [{ label: sum.label, value: money(grandTotal), caption: `total across ${total} ${total === 1 ? 'record' : 'records'}` }] : []),
      { label: 'Added this week', value: String(addedSince(app, 7)), caption: 'in the last seven days' },
      { label: 'Touched this week', value: String(touchedSince(app, 7)), caption: 'edited in the last seven days' },
    ];

    // Newest first, which is what "what has been happening" means on a record list.
    const recent = [...app.items]
      .sort((a, b) => String(b.lastActivityAt || b.updatedAt || b.createdAt || '')
        .localeCompare(String(a.lastActivityAt || a.updatedAt || a.createdAt || '')))
      .slice(0, 6);

    return `
      <div class="wb-dash">
        <div class="wb-dash-tiles">
          ${tiles.map((tile) => `
            <div class="wb-dash-tile">
              <span class="wb-dash-label">${h(tile.label)}</span>
              <strong>${h(tile.value)}</strong>
              <span class="wb-dash-caption">${h(tile.caption)}</span>
            </div>`).join('')}
        </div>
        <div class="wb-dash-panels">
          <article class="panel wb-dash-panel">
            <h3>By ${h(field ? field.label : 'stage')}</h3>
            ${field ? `<div class="wb-dash-bars">${columns.map((col) => `
              <div class="wb-dash-bar">
                <span class="wb-dash-bar-name"><i style="background:${h(col.color)}"></i>${h(col.label)}</span>
                <span class="wb-dash-bar-track"><span style="width:${total ? Math.round((col.count / total) * 100) : 0}%;background:${h(col.color)}"></span></span>
                <span class="wb-dash-bar-n">${h(String(col.count))}${col.total != null && sum ? ` · ${h(money(col.total))}` : ''}</span>
              </div>`).join('')}</div>`
    : emptyState('Add a Status field and its options become the stages here, on the board, and in the sidebar.')}
          </article>
          <article class="panel wb-dash-panel">
            <h3>Recently active</h3>
            <ul class="wb-dash-recent">
              ${recent.map((item) => `
                <li>
                  <a href="${itemHref(companyId, app, item)}" data-router>${h(wbItemTitle(app, item)) || 'Untitled'}</a>
                  <span>${h(wbTimeAgo(item.lastActivityAt || item.updatedAt || item.createdAt || ''))}</span>
                </li>`).join('')}
            </ul>
          </article>
        </div>
      </div>`;
  }

  const daysAgoIso = (n) => iso(addDays(new Date(), -n));
  const addedSince = (app, days) => app.items.filter((it) => String(it.createdAt || '').slice(0, 10) >= daysAgoIso(days)).length;
  const touchedSince = (app, days) => app.items.filter((it) => String(it.lastActivityAt || it.updatedAt || '').slice(0, 10) >= daysAgoIso(days)).length;

  // ---- Calendar ---------------------------------------------------------------------------

  function renderAppCalendar(companyId, app, anchorIso, fieldId, viewMode) {
    const candidates = dateFields(app);
    if (!candidates.length) {
      return `<div class="wb-empty"><i class="ti ti-calendar"></i><h3>No date field yet</h3><p>Add a Date field to this app and its records appear on a calendar.</p>${can('workspaces.manage', companyId) ? '<div class="wb-empty-acts"><a class="btn btn-primary" href="' + appHref(companyPath('workspaces', { app_id: app.id, tab: 'fields' }, companyId)) + '" data-router><i class="ti ti-plus"></i>Add field</a></div>' : ''}</div>`;
    }
    const view = CAL_VIEWS.includes(viewMode) ? viewMode : 'month';
    const field = candidates.find((f) => f.id === fieldId) || candidates[0];
    const anchor = /^\d{4}-\d{2}-\d{2}$/.test(String(anchorIso || '')) ? new Date(`${anchorIso}T12:00:00`) : new Date();
    const { byDay, undated } = recordsByDay(app, field);
    const todayIso = iso(new Date());
    const link = (params) => appHref(companyPath('workspaces', {
      app_id: app.id, tab: 'calendar', field: field.id, ...params,
    }, companyId));

    // Step by whatever the view shows. A "next" that jumps a month while you are looking at
    // a week is the kind of thing you only notice after losing your place.
    const step = (delta) => {
      const next = new Date(anchor);
      if (view === 'month') next.setMonth(next.getMonth() + delta);
      else return iso(addDays(anchor, delta * (view === 'week' ? 7 : 1)));
      return iso(next);
    };

    const pill = (item) => `<a class="wb-cal-pill" href="${itemHref(companyId, app, item)}" data-router style="border-left-color:${h(app.color)}" title="${h(wbItemTitle(app, item))}">${h(wbItemTitle(app, item)) || 'Untitled'}</a>`;
    const dayCell = (day, { dim = false, cap = 0 } = {}) => {
      const key = iso(day);
      const items = byDay.get(key) || [];
      const shown = cap ? items.slice(0, cap) : items;
      return `<div class="wb-cal-day ${dim ? 'dim' : ''} ${key === todayIso ? 'today' : ''}">
        <span class="wb-cal-num">${day.getDate()}</span>
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
      const items = byDay.get(iso(anchor)) || [];
      label = anchor.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      grid = `<div class="wb-cal-single ${iso(anchor) === todayIso ? 'today' : ''}">
        ${items.length
    ? `<ul class="wb-cal-daylist">${items.map((item) => `<li>${pill(item)}</li>`).join('')}</ul>`
    : emptyState(`Nothing is set to ${h(field.label.toLowerCase())} on this day.`)}
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
              ${candidates.map((f) => `<option value="${h(f.id)}" ${f.id === field.id ? 'selected' : ''}>By ${h(f.label)}</option>`).join('')}
            </select></label>` : `<span class="wb-cal-by">By ${h(field.label)}</span>`}
        </div>
        ${grid}
        ${undated ? `<p class="wb-cal-undated">${undated} record${undated === 1 ? '' : 's'} ${undated === 1 ? 'has' : 'have'} no <b>${h(field.label)}</b> yet, so ${undated === 1 ? 'it is' : 'they are'} not shown here.</p>` : ''}
      </div>`;
  }

  return { renderAppDashboard, renderAppCalendar, mondayIndex };
}
