// Account, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createAccountTab(ctx) {
  const {
    appHref, companyPath, contractRows, dealRow, emptyState, h,
    initials, money, pipelineDot, pipelineStageColor, priorityPill, renderActivityTimeline,
    resolvePipelineStage, stageTagPipe,
  } = ctx;

  function renderAccountTab(companyId, account, tab, data) {
    if (tab === 'contacts') {
      return `<section class="panel">
        <div class="section-head"><div><h2>Contacts</h2><p>People at ${h(account.name)}</p></div><button class="btn" type="button" data-action="open-contact-form" data-mode="new" data-account-id="${h(account.id)}"><i class="ti ti-plus"></i>Add contact</button></div>
        <div class="data-table contacts-table">
          <div class="table-head"><span>Name</span><span>Title</span><span>Phone</span><span>Email</span><span>Owner</span><span></span></div>
          ${data.contacts.map((contact) => `
            <button class="table-row" type="button" data-action="open-contact-form" data-mode="edit" data-contact-id="${h(contact.id)}">
              <span class="cell-lead"><span class="account-avatar sm">${h(initials(contact.name))}</span><span><strong>${h(contact.name)}</strong></span></span>
              <span>${h(contact.title || '—')}</span>
              <span>${h(contact.phone || '—')}</span>
              <span>${contact.email ? h(contact.email) : '<span class="muted-dash">—</span>'}</span>
              <span>${h(contact.owner_name || 'Unassigned')}</span>
              <span></span>
            </button>`).join('') || emptyState('No contacts linked to this account yet.')}
        </div>
      </section>`;
    }
    if (tab === 'deals') {
      return `<section class="panel">
        <div class="section-head"><div><h2>Quotes</h2><p>Bottom-of-funnel opportunities for ${h(account.name)}</p></div><button class="btn" type="button" data-action="open-deal-form" data-mode="new" data-account-id="${h(account.id)}"><i class="ti ti-plus"></i>New quote</button></div>
        <div class="data-table deals-table">
          <div class="table-head"><span>Deal</span><span>Stage</span><span>Status</span><span>Value</span><span>Owner</span><span>Close</span></div>
          ${data.deals.map((deal) => dealRow(deal)).join('') || emptyState('No quotes for this account yet.')}
        </div>
      </section>`;
    }
    if (tab === 'jobs') {
      return `<section class="panel">
        <div class="section-head"><div><h2>Jobs</h2><p>Production work for ${h(account.name)}</p></div></div>
        <div class="data-table jobs-table">
          <div class="table-head"><span>Job</span><span>Type</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Value</span></div>
          ${data.jobs.map((job) => `
            <a class="table-row" href="${appHref(companyPath('jobs', { tab: 'profile', job_id: job.id }, companyId))}" data-router>
              <span class="cell-lead">${pipelineDot(pipelineStageColor('jobs', resolvePipelineStage('jobs', job.stage, companyId), companyId))}<span><strong>${h(job.name)}</strong><small>${h(job.site_address || 'No address')}</small></span></span>
              <span>${h(job.job_type || '—')}</span>
              <span>${stageTagPipe('jobs', job.stage, companyId)}</span>
              <span>${priorityPill(job.priority)}</span>
              <span>${h(job.owner_name || 'Unassigned')}</span>
              <span>${money(job.estimate_total)}</span>
            </a>`).join('') || emptyState('No jobs linked to this account yet. Win a deal to create one.')}
        </div>
      </section>`;
    }
    if (tab === 'activity') {
      return `<section class="panel">
        <div class="section-head"><div><h2>Activity</h2></div><button class="btn" type="button" data-action="open-activity-form" data-related-type="account" data-related-id="${h(account.id)}" data-account-id="${h(account.id)}"><i class="ti ti-plus"></i>Log activity</button></div>
        ${renderActivityTimeline('account', account.id)}
      </section>`;
    }
    // overview
    return `
      <section class="crm-detail-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Details</h2></div></div>
          ${contractRows([
            ['Type', account.type],
            ['Industry', account.industry || '—'],
            ['Owner', account.owner_name || 'Unassigned'],
            ['Phone', account.phone || '—'],
            ['Email', account.email || '—'],
            ['Website', account.website || '—'],
            ['Address', account.address || '—'],
            ['Status', account.status],
          ])}
          ${account.notes ? `<p class="crm-notes">${h(account.notes)}</p>` : ''}
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Recent activity</h2></div><button class="btn" type="button" data-action="open-activity-form" data-related-type="account" data-related-id="${h(account.id)}" data-account-id="${h(account.id)}"><i class="ti ti-plus"></i>Log</button></div>
          ${renderActivityTimeline('account', account.id, '', 6)}
        </article>
      </section>
    `;
  }

  return { renderAccountTab };
}
