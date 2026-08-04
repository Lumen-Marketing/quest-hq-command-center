// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

export function createWorkdayPage(ctx) {
  const {
    appHref, companyPath, emptyState, h, renderWorkdayManagerView, renderWorkdayModeTabs, renderWorkdayPanel, renderWorkdayQueueItem, workdayManagerMetrics, workdayMetricCard, workdayQueueItems, workdayQueueTone, workspaceHeader, state,
  } = ctx;

  function renderWorkdayPage(companyId) {
    const metrics = workdayManagerMetrics(companyId);
    const items = workdayQueueItems(companyId);
    const active = items.find((item) => item.id === state.selectedWorkdayItemId) || items[0] || null;
    if (active && state.selectedWorkdayItemId !== active.id) state.selectedWorkdayItemId = active.id;
    const urgentItems = items.filter((item) => ['critical', 'warning'].includes(workdayQueueTone(item))).length;
    const ownedItems = items.filter((item) => item.owner && item.owner !== 'Unassigned').length;
    return `
      <section class="workday-page">
        ${workspaceHeader('Workday', 'Daily CRM queue for calls, follow-ups, quotes, jobs, and form responses.', `
          <a class="btn" href="${appHref(companyPath('contacts', {}, companyId))}" data-router><i class="ti ti-id-badge-2"></i>Contacts</a>
          <a class="btn" href="${appHref(companyPath('deals', {}, companyId))}" data-router><i class="ti ti-briefcase"></i>Quotes</a>
          <a class="btn btn-primary" href="${appHref(companyPath('forms', {}, companyId))}" data-router><i class="ti ti-clipboard-list"></i>Forms</a>
        `)}
        ${renderWorkdayModeTabs()}
        ${state.workdayMode === 'manager' ? renderWorkdayManagerView(companyId) : `
          <div class="workday-manager-grid">
            ${workdayMetricCard('Calls today', metrics.callsToday, 'Logged call activity', 'ti-phone-call')}
            ${workdayMetricCard('Touched today', metrics.touchedToday, 'Contacts, quotes, and jobs worked', 'ti-activity')}
            ${workdayMetricCard('Untouched leads', metrics.untouchedLeads, 'Need a first touch', 'ti-user-question')}
            ${workdayMetricCard('Overdue follow-ups', metrics.overdueFollowups, 'Open tasks past due', 'ti-alert-circle')}
            ${workdayMetricCard('No next step', metrics.noNextStep, 'Records missing an open task', 'ti-route')}
            ${workdayMetricCard('Form responses', metrics.formResponsesNeedingAction, 'Need CRM action', 'ti-clipboard-list')}
          </div>
          <div class="workday-shell">
            <section class="workday-queue panel">
              <div class="section-head">
                <div><h2>Command queue</h2><p>${items.length} item${items.length === 1 ? '' : 's'} needing work</p></div>
              </div>
              <div class="workday-queue-summary" aria-label="My Queue summary">
                <span><strong>${h(String(items.length))}</strong><small>Total</small></span>
                <span><strong>${h(String(urgentItems))}</strong><small>Priority</small></span>
                <span><strong>${h(String(ownedItems))}</strong><small>Assigned</small></span>
              </div>
              <div class="workday-queue-list">
                ${items.map((item) => renderWorkdayQueueItem(item, active?.id === item.id)).join('') || emptyState('No urgent Workday items.')}
              </div>
            </section>
            ${renderWorkdayPanel(active, companyId)}
          </div>
        `}
      </section>
    `;
  }

  return { renderWorkdayPage };
}
