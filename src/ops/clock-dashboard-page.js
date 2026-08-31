// Clock dashboard, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createClockDashboardPage(ctx) {
  const {
    activeTimerForCompany, contractRows, emptyState, formatClock, formatDateTime, formatDuration,
    h, markup, memberName, metricCard, renderOperationsTabs, startOfToday,
    timeEntriesForCompany, totalTimeForCompany, workspaceHeader,
  } = ctx;

  function timeEntryQuality(entry = {}) {
    const durationMs = Math.max(0, Number(entry.duration_ms) || 0);
    if (durationMs < 60 * 1000) return { label: 'Under 1 minute', detail: 'Check or remove this accidental entry.' };
    if (durationMs > 16 * 60 * 60 * 1000) return { label: 'Unusually long', detail: 'Confirm the start and end time.' };
    return null;
  }

  function renderClockDashboardPage(companyId) {
    const entries = timeEntriesForCompany(companyId);
    const active = activeTimerForCompany(companyId);
    const todayStart = startOfToday().getTime();
    const weekStart = todayStart - 6 * 86400000;
    // The banked totals, WITHOUT the running clock. When one is running the live element adds
    // the elapsed time itself every second; adding it here too would count it twice.
    const todayBanked = totalTimeForCompany(companyId, todayStart);
    const weekBanked = totalTimeForCompany(companyId, weekStart);
    const runningMs = active ? Date.now() - Date.parse(active.started_at) : 0;
    const live = (banked) => (active
      ? markup(`<span data-live-clock="${h(active.started_at)}" data-live-base="${h(String(banked))}" data-live-format="duration">${h(formatDuration(banked + runningMs))}</span>`)
      : formatDuration(banked));
    return `
      <section class="tool-page operations-page clock-page">
        ${workspaceHeader('Clock dashboard', 'Your own time in this workspace. A running clock is saved, so it survives a refresh and follows you between devices.', `
          <button class="btn btn-primary" type="button" data-action="${active ? 'clock-out' : 'clock-in'}"><i class="ti ${active ? 'ti-player-stop-filled' : 'ti-player-play-filled'}"></i>${active ? 'Clock out' : 'Clock in'}</button>
        `)}
        ${renderOperationsTabs(companyId, 'clock')}
        <section class="metric-grid operations-metrics">
          ${metricCard('Today', live(todayBanked))}
          ${metricCard('Last 7 days', live(weekBanked))}
          ${metricCard('Entries', entries.length)}
          ${metricCard('Status', active ? 'Clocked in' : 'Off clock')}
        </section>
        <section class="dashboard-grid operations-grid">
          <article class="panel">
            <div class="section-head"><div><h2>Active now</h2><p>Current local clock session.</p></div></div>
            ${active ? contractRows([
              ['User', memberName(active.user_id)],
              ['Started', formatDateTime(active.started_at)],
              ['Task', active.task_title || 'General shift'],
              ['Elapsed', markup(`<span class="clock-elapsed" data-live-clock="${h(active.started_at)}">${h(formatClock(runningMs))}</span>`)],
            ]) : emptyState('You are not clocked in.')}
            ${active && runningMs > 16 * 60 * 60 * 1000 ? '<div class="clock-quality-warning"><i class="ti ti-alert-triangle"></i><span><strong>Unusually long shift</strong><small>Check the start time before clocking out.</small></span></div>' : ''}
          </article>
          <article class="panel span-2">
            <div class="section-head"><div><h2>Recent entries</h2><p>Your saved time records for this workspace.</p></div></div>
            <div class="data-table clock-table">
              <div class="table-head"><span>Entry</span><span>User</span><span>Start</span><span>Duration</span></div>
              ${entries.slice(0, 10).map((entry) => {
                const quality = timeEntryQuality(entry);
                return `
                <div class="table-row ${quality ? 'clock-entry-needs-review' : ''}">
                  <span><strong>${h(entry.task_title || 'General shift')}</strong><small>${h(entry.notes || 'Clock entry')}</small></span>
                  <span>${h(memberName(entry.user_id))}</span>
                  <span>${formatDateTime(entry.started_at)}</span>
                  <span><strong>${formatDuration(entry.duration_ms)}</strong>${quality ? `<small class="clock-quality-label" title="${h(quality.detail)}">${h(quality.label)}</small>` : ''}</span>
                </div>
              `;
              }).join('') || emptyState('No clock entries yet.')}
            </div>
          </article>
        </section>
      </section>
    `;
  }

  return { renderClockDashboardPage };
}
