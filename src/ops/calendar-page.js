// Calendar, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createCalendarPage(ctx) {
  const {
    CALENDAR_FILTER_TYPES, calendarItems, calendarItemsThisWeek, calendarRangeLabel, can,
    emptyState, ensureDomainLoaded, filteredCalendarItems, h, isoDate, metricCard, questLoader,
    renderCalendarAgendaItem, renderCalendarList, renderCalendarMonth, renderCalendarWeek,
    renderOperationsTabs, state, titleCase, workspaceHeader,
  } = ctx;

  function renderCalendarPage(route, companyId) {
    // Jobs are fetched on demand and the calendar reads them twice: to offer a job to link an
    // event to, and to place job dates on the grid. Without this the dropdown held only
    // "No linked job" for anyone who opened Calendar without visiting Jobs first -- which is
    // exactly the reported "I cant link jobs".
    if (!ensureDomainLoaded('production')) return questLoader('Loading calendar');
    const items = filteredCalendarItems(companyId);
    const allItems = calendarItems(companyId);
    const todayItems = items.filter((item) => item.dateKey === isoDate(0));
    const mineItems = allItems.filter((item) => item.mine);
    const sourceCount = allItems.filter((item) => item.source !== 'manual').length;
    const canCreate = can('calendar.manage', companyId);
    return `
      <section class="tool-page operations-page calendar-page">
        ${workspaceHeader('Calendar', 'Company schedule built from tasks, approvals, finance due dates, time context, and manual events.', `
          <button class="btn btn-primary" type="button" data-action="open-calendar-event-form"><i class="ti ti-calendar-plus"></i>New event</button>
        `)}
        ${renderOperationsTabs(companyId, 'calendar')}
        <section class="metric-grid operations-metrics calendar-metrics">
          ${metricCard('Today', todayItems.length)}
          ${metricCard('This week', calendarItemsThisWeek(items).length)}
          ${metricCard('Mine', mineItems.length)}
          ${metricCard('From modules', sourceCount)}
        </section>
        <section class="workspace-toolbar calendar-toolbar">
          <div class="segmented" role="group" aria-label="Calendar scope">
            <button class="${state.calendarScope === 'company' ? 'active' : ''}" type="button" data-action="set-calendar-scope" data-scope="company"><i class="ti ti-building"></i>Company</button>
            <button class="${state.calendarScope === 'me' ? 'active' : ''}" type="button" data-action="set-calendar-scope" data-scope="me"><i class="ti ti-user"></i>Me</button>
          </div>
          <div class="segmented" role="group" aria-label="Calendar view">
            ${['month', 'week', 'list'].map((view) => `<button class="${state.calendarView === view ? 'active' : ''}" type="button" data-action="set-calendar-view" data-view="${h(view)}">${h(titleCase(view))}</button>`).join('')}
          </div>
          <label class="wide-control">
            <span>Search</span>
            <input data-calendar-search value="${h(state.calendarQuery)}" placeholder="Find events, jobs, tasks, or people" />
          </label>
          <label>
            <span>Type</span>
            <select data-calendar-type-filter>
              <option value="all">All types</option>
              ${CALENDAR_FILTER_TYPES.map((type) => `<option value="${h(type)}" ${state.calendarTypeFilter === type ? 'selected' : ''}>${h(type)}</option>`).join('')}
            </select>
          </label>
        </section>
        <section class="calendar-nav">
          <div>
            <button class="btn" type="button" data-action="calendar-prev" aria-label="Previous month"><i class="ti ti-chevron-left" aria-hidden="true"></i></button>
            <button class="btn" type="button" data-action="calendar-today">Today</button>
            <button class="btn" type="button" data-action="calendar-next" aria-label="Next month"><i class="ti ti-chevron-right" aria-hidden="true"></i></button>
          </div>
          <strong>${h(calendarRangeLabel())}</strong>
        </section>
        <section class="calendar-shell">
          <article class="panel calendar-main">
            ${state.calendarView === 'month' ? renderCalendarMonth(companyId, items) : ''}
            ${state.calendarView === 'week' ? renderCalendarWeek(companyId, items) : ''}
            ${state.calendarView === 'list' ? renderCalendarList(companyId, items) : ''}
          </article>
          <aside class="panel calendar-agenda">
            <div class="section-head"><div><h2>Agenda</h2><p>Next events that match this view.</p></div></div>
            <div class="calendar-agenda-list">
              ${items.slice(0, 9).map(renderCalendarAgendaItem).join('') || emptyState('No calendar items match this view.')}
            </div>
          </aside>
        </section>
        ${!canCreate ? `<p class="small-note">Your role can view the calendar. Manual company events require calendar manage permission.</p>` : ''}
      </section>
    `;
  }

  return { renderCalendarPage };
}
