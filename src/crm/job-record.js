// The job record page -- the Salesforce-style detail view behind opening a job.
//
// Fetched on demand. You have to pick a job to get here, and the jobs list, pipeline and
// dashboard all paint without it.
//
// A factory: everything it needs belongs to main.js, and passing them once keeps the module
// from reaching back into it. The body is unchanged from where it lived there.

export function createJobRecord(ctx) {
  const {
    h, can, state, emptyState, pipelineStages, resolvePipelineStage, guidanceForJobStage,
    activitiesFor, filteredActivitiesFor, accountById, contactById, companyContacts, dealById, appHref, companyPath,
    activeWorkspaceId, money, renderActivityFilterBar, sfFeedItem, renderSfTaskRow,
  } = ctx;

  function renderJobRecord(companyId, job) {
    if (!job) return emptyState('Create a job to see the record workspace.');
    const stages = pipelineStages('jobs', companyId);
    const currentStage = resolvePipelineStage('jobs', job.stage, companyId);
    const ci = stages.findIndex((stage) => stage.name === currentStage);
    const currentIndex = ci >= 0 ? ci : 0;
    const g = guidanceForJobStage(currentStage);
    const activeTab = state.jobActivityTab || 'Note';
    const totalFeed = activitiesFor('job', job.id);
    const feed = filteredActivitiesFor('job', job.id);
    const tasks = state.tasks
      .filter((task) => task.project_id === job.id)
      .sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0) || String(a.due).localeCompare(String(b.due)));
    const linkedAccount = accountById(job.account_id);
    const account = linkedAccount?.company_id === companyId ? linkedAccount : null;
    const clientNames = [job.contact_name, job.client_name].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean);
    const linkedContact = contactById(job.contact_id);
    const contact = (linkedContact?.company_id === companyId ? linkedContact : null)
      || companyContacts(companyId).find((item) => clientNames.includes(String(item.name || '').trim().toLowerCase()));
    const deal = dealById(job.deal_id);
    const showCrm = can('crm.view', companyId);
    const fieldRow = (label, content, editKey = '') => `
      <div class="sf-field">
        <div class="sf-field-label">
          ${h(label)}
          ${editKey
            ? `<button class="sf-pencil" type="button" data-job-edit="${h(editKey)}" data-job-id="${h(job.id)}" aria-label="Edit ${h(label)}"><i class="ti ti-pencil"></i></button>`
            : `<button class="sf-pencil" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${h(job.id)}" aria-label="Edit ${h(label)}"><i class="ti ti-pencil"></i></button>`}
        </div>
        <div class="sf-field-value">${content}</div>
      </div>
    `;
    const ed = (key, opts = {}) => {
      const display = (job[key] === '' || job[key] == null) ? '-' : job[key];
      const cls = ['sf-edit', opts.blue ? 'blue' : '', opts.mono ? 'mono' : ''].filter(Boolean).join(' ');
      return `<span class="${cls}" data-job-edit="${h(key)}" data-job-id="${h(job.id)}" title="Click to edit">${h(String(display))}</span>`;
    };
    const clientLink = showCrm && contact
      ? `<a class="link-button" href="${appHref(companyPath('contacts', { contact_id: contact.id }, companyId))}" data-router>${h(job.client_name || contact.name)}</a>`
      : showCrm && account
        ? `<button class="link-button" type="button" data-action="open-account" data-account-id="${h(account.id)}">${h(job.client_name || account.name)}</button>`
        : ed('client_name', { blue: true });
    const tradeLink = `<a class="link-button" href="${appHref(companyPath('jobs', { tab: 'list', trade: job.job_type || 'Unassigned' }, companyId))}" data-router>${h(job.job_type || 'Unassigned')}</a>`;
    const stageLink = `<a class="link-button" href="${appHref(companyPath('jobs', { tab: 'pipeline', stage: currentStage }, companyId))}" data-router>${h(currentStage)}</a>`;
    const headerActions = [
      ['New Task', 'ti-checkbox'],
      ...(can('files.view', companyId) ? [['Photos', 'ti-camera']] : []),
      ['Log a Call', 'ti-phone'],
      ['New Estimate', 'ti-calculator'],
      ['Proposal', 'ti-file-text'],
      ['Add Note', 'ti-note'],
      ...(can('files.view', companyId) ? [['Open Files', 'ti-folder']] : []),
      ['Edit', 'ti-pencil'],
    ];
    const activityTabs = [['Note', 'ti-note'], ['New Task', 'ti-checkbox'], ['New Event', 'ti-calendar'], ['Log a Call', 'ti-phone']];
    const quickTiles = [
      ['Task', 'ti-checkbox'],
      ...(can('files.view', companyId) ? [['Photos', 'ti-camera']] : []),
      ['Estimate', 'ti-calculator'],
      ['Proposal', 'ti-file-text'],
      ...(can('files.view', companyId) ? [['Files', 'ti-folder']] : []),
      ...(can('forms.view', companyId) ? [['Form', 'ti-clipboard-list']] : []),
      ...(can('finance.view', companyId) ? [['Invoice', 'ti-receipt-dollar']] : []),
      ['Note', 'ti-note'],
      ...(can('team.view', companyId) ? [['Analytics', 'ti-chart-bar']] : []),
    ];

    return `
      <div class="sf-record job-record">
        <div class="sf-object-tabs">
          <a class="sf-object-tab" href="${appHref(companyPath('dashboard', {}, companyId))}" data-router>Dashboard</a>
          <a class="sf-object-tab" href="${appHref(companyPath('jobs', {}, companyId))}" data-router>All Jobs <span class="sf-tab-kind">| Jobs</span></a>
          <span class="sf-object-tab on">${h(job.name)} <span class="sf-tab-kind">| Job</span></span>
        </div>

        <div class="sf-record-head">
          <span class="sf-record-icon"><i class="ti ti-briefcase"></i></span>
          <div><div class="sf-record-label">Job</div><div class="sf-record-name">${h(job.name)}</div></div>
          <div class="sf-actions">
            <button class="sf-btn" type="button" data-action="open-record-history" data-record-type="job" data-record-id="${h(job.id)}" data-record-label="${h(job.name)}" data-company-id="${h(job.company_id || companyId)}" data-workspace-id="${h(job.workspace_id || activeWorkspaceId())}"><i class="ti ti-history"></i>History</button>
            ${headerActions.map(([label, ico]) => label === 'Edit'
              ? `<button class="sf-btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${h(job.id)}"><i class="ti ${ico}"></i>${label}</button>`
              : label === 'Photos'
                ? `<button class="sf-btn" type="button" data-action="open-job-photos" data-job-id="${h(job.id)}"><i class="ti ${ico}"></i>${label}</button>`
                : `<button class="sf-btn" type="button" data-action="job-quick" data-kind="${h(label)}" data-job-id="${h(job.id)}"><i class="ti ${ico}"></i>${label}</button>`).join('')}
          </div>
        </div>

        <div class="sf-path-wrap">
          <div class="sf-path-row">
            <div class="sf-stage-track">
              ${stages.map((stage, i) => {
                const cls = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'future';
                return `<button class="sf-stage ${cls}" type="button" data-action="set-job-stage" data-job-id="${h(job.id)}" data-stage="${h(stage.name)}" title="Move to ${h(stage.name)}">${i < currentIndex ? '<i class="ti ti-check"></i>' : h(stage.name)}</button>`;
              }).join('')}
            </div>
            <button class="sf-mark-btn" type="button" data-action="job-mark-next" data-job-id="${h(job.id)}">Mark as Current Stage</button>
          </div>
          <div class="sf-guidance">
            <div class="sf-guidance-label">Guidance for Success</div>
            <div class="sf-guidance-title">${h(g.t)}</div>
            <div class="sf-guidance-lines">${g.b.map((line) => `<div>- ${h(line)}</div>`).join('')}</div>
          </div>
        </div>

        <div class="sf-three-col">
          <div class="sf-col">
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-id-badge-2"></i>Job Details</div><div class="sf-card-body">
              ${fieldRow('Client', clientLink, 'client_name')}
              ${fieldRow('Contact', ed('contact_name', { blue: true }), 'contact_name')}
              ${fieldRow('Site Address', `${ed('site_address')}${job.site_address ? `<button class="sf-field-action" type="button" data-action="open-location-picker" data-location-kind="job" data-location-id="${h(job.id)}" data-location-field="site_address" data-address="${h(job.site_address)}"><i class="ti ti-map-pin"></i>Map pin</button>` : ''}`, 'site_address')}
              ${fieldRow('Job Type', tradeLink, 'job_type')}
              ${fieldRow('Owner', ed('owner_name', { blue: true }), 'owner_name')}
              ${fieldRow('Priority', `<span class="sf-pill sf-edit" data-job-edit="priority" data-job-id="${h(job.id)}" title="Click to edit">${h(job.priority || 'Medium')}</span>`, 'priority')}
            </div></div>
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-clipboard-data"></i>Status</div><div class="sf-card-body">
              ${fieldRow('Stage', stageLink, 'stage')}
              ${fieldRow('Estimate Total', `<span class="sf-money"><span class="sf-edit mono" data-job-edit="estimate_total" data-job-id="${h(job.id)}" title="Click to edit">${money(job.estimate_total || 0)}</span></span>`, 'estimate_total')}
              ${fieldRow('Invoice Total', `<span class="sf-money"><span class="sf-edit mono" data-job-edit="invoice_total" data-job-id="${h(job.id)}" title="Click to edit">${money(job.invoice_total || 0)}</span></span>`, 'invoice_total')}
              ${fieldRow('Account', account ? (showCrm ? `<button class="link-button" type="button" data-action="open-account" data-account-id="${h(account.id)}">${h(account.name)}</button>` : `<span>${h(account.name)}</span>`) : '<span>-</span>')}
              ${fieldRow('Deal', deal ? (showCrm ? `<button class="link-button" type="button" data-action="open-deal" data-deal-id="${h(deal.id)}">${h(deal.name)}</button>` : `<span>${h(deal.name)}</span>`) : '<span>-</span>')}
            </div></div>
          </div>

          <div class="sf-col">
            <div class="sf-card">
              <div class="sf-activity-tabs">${activityTabs.map(([label, ico]) => `<button class="sf-activity-tab ${activeTab === label ? 'active' : ''}" type="button" data-action="open-docked-activity" data-related-type="job" data-related-id="${h(job.id)}" data-kind="${h(label)}" data-tab="${h(label)}"><i class="ti ${ico}"></i>${label}</button>`).join('')}</div>
              <form class="sf-note-box" data-job-note-form autocomplete="off">
                <input type="hidden" name="job_id" value="${h(job.id)}" />
                <input name="body" placeholder="Write a note or @mention..." />
                <span class="sf-note-tools"><i class="ti ti-paperclip"></i><i class="ti ti-at"></i></span>
                <button class="sf-btn" type="submit">Post</button>
              </form>
              ${renderActivityFilterBar(totalFeed.length, feed.length)}
              <div class="sf-feed">
                ${feed.length ? feed.map((a) => sfFeedItem(a)).join('') : `<div class="sf-feed-empty">${totalFeed.length ? 'No activity matches this filter.' : 'No job activity yet. Log a note, call, or meeting.'}</div>`}
              </div>
            </div>
          </div>

          <div class="sf-col">
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-bolt"></i>Quick Create</div>
              <div class="sf-quick-grid">${quickTiles.map(([label, ico]) => label === 'Photos'
                ? `<button class="sf-quick-tile" type="button" data-action="open-job-photos" data-job-id="${h(job.id)}"><i class="ti ${ico}"></i><span>${h(label)}</span></button>`
                : `<button class="sf-quick-tile" type="button" data-action="job-quick" data-kind="${h(label)}" data-job-id="${h(job.id)}"><i class="ti ${ico}"></i><span>${h(label)}</span></button>`).join('')}</div>
            </div>
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-apps"></i>Linked Workspace</div>
              <div class="sf-quick-grid">
                <a class="sf-quick-tile" href="${appHref(companyPath('tasks', { job_id: job.id }, companyId))}" data-router><i class="ti ti-checkbox"></i><span>Open Tasks</span></a>
                ${can('files.view', companyId) ? `<a class="sf-quick-tile" href="${appHref(companyPath('files', { folder: 'jobs', job_id: job.id }, companyId))}" data-router><i class="ti ti-folder"></i><span>Files</span></a>` : ''}
                ${can('forms.view', companyId) ? `<a class="sf-quick-tile" href="${appHref(companyPath('forms', { job_id: job.id }, companyId))}" data-router><i class="ti ti-clipboard-list"></i><span>Forms</span></a>` : ''}
                ${can('team.view', companyId) ? `<a class="sf-quick-tile" href="${appHref(companyPath('analytics', { job_id: job.id }, companyId))}" data-router><i class="ti ti-chart-bar"></i><span>Analytics</span></a>` : ''}
              </div>
            </div>
            <div class="sf-card"><div class="sf-card-head"><i class="ti ti-checkbox"></i>Open Tasks<span class="sf-connect"><i class="ti ti-plug"></i>Connect</span></div>
              <div class="sf-tasks">
                ${tasks.map((task) => renderSfTaskRow(task, { checkMode: 'open' })).join('') || '<div class="sf-task-empty">No tasks yet.</div>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return { renderJobRecord };
}
