// Time, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createTimePage(ctx) {
  const {
    activeTimerForCompany, appHref, companyName, companyPath, contractRows, emptyState,
    formatDate, h, jobById, memberName, metricCard, renderOperationsTabs,
    taskQueueRow, taskStatusPill, taskTypeLabel, timeSummary, workspaceHeader,
  } = ctx;

  function renderTimePage(companyId) {
    const summary = timeSummary(companyId);
    const active = activeTimerForCompany(companyId);
    return `
      <section class="tool-page operations-page">
        ${workspaceHeader('My time', "A compact personal work queue built from this company's tasks.", `
          <a class="btn" href="${appHref(companyPath('tasks', {}, companyId))}" data-router><i class="ti ti-list-check"></i>Open tasks</a>
          <button class="btn btn-primary" type="button" data-action="${active ? 'clock-out' : 'clock-in'}"><i class="ti ${active ? 'ti-player-stop-filled' : 'ti-player-play-filled'}"></i>${active ? 'Clock out' : 'Clock in'}</button>
        `)}
        ${renderOperationsTabs(companyId, 'time')}
        <section class="metric-grid operations-metrics">
          ${metricCard('Due today', summary.dueToday.length)}
          ${metricCard('Overdue', summary.overdue.length)}
          ${metricCard('Open work', summary.open.length)}
          ${metricCard('In review', summary.review.length)}
        </section>
        <section class="dashboard-grid operations-grid">
          <article class="panel span-2">
            <div class="section-head"><div><h2>Today</h2><p>Due now, overdue, and highest priority work.</p></div></div>
            <div class="queue-list">
              ${summary.focus.slice(0, 8).map((task) => taskQueueRow(task)).join('') || emptyState('No time-sensitive tasks for this company.')}
            </div>
          </article>
          <article class="panel">
            <div class="section-head"><div><h2>Workload</h2><p>Simple task-based time view.</p></div></div>
            ${contractRows([
              ['Company', companyName(companyId)],
              ['Assigned to you', String(summary.assignedToMe.length)],
              ['Due this week', String(summary.thisWeek.length)],
              ['Completed', String(summary.done.length)],
            ])}
          </article>
        <article class="panel span-2">
            <div class="section-head"><div><h2>This week</h2><p>Upcoming task commitments.</p></div></div>
            <div class="data-table operations-table">
              <div class="table-head"><span>Task</span><span>Job</span><span>Owner</span><span>Due</span><span>Status</span></div>
              ${summary.thisWeek.slice(0, 8).map((task) => `
                <a class="table-row" href="${appHref(companyPath('tasks', { ...(task.project_id ? { job_id: task.project_id } : {}), task_id: task.id }, companyId))}" data-router>
                  <span><strong>${h(task.title)}</strong><small>${h(task.description || taskTypeLabel(task.type))}</small></span>
                  <span>${h(jobById(task.project_id)?.name || 'Company task')}</span>
                  <span>${h(memberName(task.assignee_id))}</span>
                  <span>${formatDate(task.due)}</span>
                  <span>${taskStatusPill(task.status)}</span>
                </a>
              `).join('') || emptyState('No upcoming tasks this week.')}
            </div>
          </article>
        </section>
      </section>
    `;
  }

  return { renderTimePage };
}
