// Account, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createCrmAccountModal(ctx) {
  const {
    appHref, can, companyPath, contractRows, crmAccountByKey, emptyState,
    formatDate, h, metricCard, money, priorityPill, renderModalShell,
    taskQueueRow,
  } = ctx;

  function renderCrmAccountModal(companyId, accountKey) {
    const account = crmAccountByKey(companyId, accountKey);
    if (!account) {
      return renderModalShell('CRM', 'Customer account', emptyState('This customer is not visible in the current company view.'));
    }
    const latestJob = account.latestJob;
    const openTasks = account.tasks.filter((task) => task.status !== 'done');
    return renderModalShell('CRM', account.name, `
      <div class="crm-account-modal">
        <section class="crm-modal-summary">
          <div class="section-head">
            <div>
              <h2>${h(account.name)}</h2>
              <p>${h(account.subtitle)}</p>
            </div>
            ${priorityPill(account.priority)}
          </div>
          ${contractRows([
            ['Primary contact', account.primaryContact],
            ['Owner', account.owner],
            ['Current stage', account.stage],
            ['Pipeline value', money(account.estimateTotal)],
            ['Open tasks', String(openTasks.length)],
            ['Last updated', formatDate(account.updatedAt)],
          ])}
        </section>
        <section class="crm-rollup-grid">
          ${metricCard('Jobs', account.jobs.length)}
          ${can('files.view', companyId) ? metricCard('Files', account.fileCount) : ''}
          ${can('forms.view', companyId) ? metricCard('Forms', account.formCount) : ''}
          ${metricCard('Tasks', account.tasks.length)}
        </section>
        <section class="crm-modal-actions">
          ${latestJob ? `<a class="btn btn-primary" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: latestJob.id }, companyId))}" data-router><i class="ti ti-briefcase"></i>Open job</a>` : ''}
          ${latestJob ? `<a class="btn" href="${appHref(companyPath('tasks', { job_id: latestJob.id }, companyId))}" data-router><i class="ti ti-list-check"></i>Tasks</a>` : ''}
          ${latestJob && can('files.view', companyId) ? `<a class="btn" href="${appHref(companyPath('files', { job_id: latestJob.id }, companyId))}" data-router><i class="ti ti-folder"></i>Files</a>` : ''}
          ${latestJob ? `<button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${h(latestJob.id)}"><i class="ti ti-pencil"></i>Edit latest job</button>` : ''}
          <button class="btn" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
        </section>
        <section class="crm-modal-section">
          <div class="section-head"><div><h2>Linked jobs</h2><p>Customer workspaces connected to this account.</p></div></div>
          <div class="data-table crm-linked-jobs">
            <div class="table-head"><span>Job</span><span>Stage</span><span>Owner</span><span>Value</span></div>
            ${account.jobs.map((job) => `
              <a class="table-row" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId))}" data-router>
                <span><strong>${h(job.name)}</strong><small>${h(job.site_address || 'No address')}</small></span>
                <span>${h(job.stage)}</span>
                <span>${h(job.owner_name || 'Unassigned')}</span>
                <span>${money(job.estimate_total)}</span>
              </a>
            `).join('') || emptyState('No linked jobs yet.')}
          </div>
        </section>
        <section class="crm-modal-section">
          <div class="section-head"><div><h2>Follow-ups</h2><p>Open tasks across linked jobs.</p></div></div>
          <div class="queue-list">
            ${openTasks.slice(0, 6).map((task) => taskQueueRow(task)).join('') || emptyState('No open follow-ups for this customer.')}
          </div>
        </section>
      </div>
    `, 'crm-modal');
  }

  return { renderCrmAccountModal };
}
