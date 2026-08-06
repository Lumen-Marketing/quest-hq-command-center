// Platform master panel, loaded on demand.
//
// Admin-only: only a Quest developer ever renders this, so keeping it in the entry chunk
// made every other session pay for markup they can never see. Moving it behind a dynamic
// import is the reduction the bundle budget notes call for.
//
// Pure by construction — every shell helper arrives through `ctx`, so this module never
// imports from main.js and cannot form a cycle.

export function createPlatformPanel(ctx) {
  const {
    availableWorkspacePlugins,
    companyColor,
    companyPluginStatus,
    companyDirectoryEmptyState,
    companyDirectoryFilters,
    companyName,
    emptyState,
    filteredPlatformBackupCopies,
    filterCompanyRows,
    h,
    metricCard,
    number,
    paginate,
    platformCompanyRows,
    platformMembersForCompany,
    renderAvatar,
    renderCompanyDirectoryPager,
    renderPlatformBackupCopyRow,
    renderCompanyDirectoryToolbar,
    shortUserId,
    state,
    subscriptionLabelForStatus,
    titleCase,
    workspaceIconSelect,
    workspacePresetSelect,
  } = ctx;

  function renderPlatformMasterPanel(currentCompanyId) {
    const companies = platformCompanyRows();
    const filters = companyDirectoryFilters('platform');
    const matched = filterCompanyRows(companies, filters);
    const view = paginate(matched, filters.page);
    // Metrics deliberately summarise every company, not the filtered page, so the
    // headline numbers hold still while the list is searched.
    const totals = companies.reduce((acc, company) => {
      acc.members += number(company.member_count);
      acc.pending += company.status === 'pending_review' ? 1 : 0;
      acc.active += ['active', 'trialing', 'past_due', 'grace'].includes(company.status) ? 1 : 0;
      acc.suspended += ['suspended', 'archived', 'rejected', 'canceled'].includes(company.status) ? 1 : 0;
      return acc;
    }, { members: 0, pending: 0, active: 0, suspended: 0 });
    return `
      <article class="panel span-3 platform-master-panel">
        <div class="section-head">
          <div>
            <h2>Master panel</h2>
            <p>Platform-owner view of companies, members, and workspace access.</p>
          </div>
          <button class="btn" type="button" data-action="refresh-data"><i class="ti ti-refresh"></i>Refresh</button>
        </div>
        <section class="metric-grid platform-master-metrics">
          ${metricCard('Companies', companies.length)}
          ${metricCard('Active', totals.active)}
          ${metricCard('Pending', totals.pending)}
          ${metricCard('Members', totals.members)}
        </section>
        <form class="platform-workspace-create" data-platform-workspace-create-form>
          <strong>Create company workspace</strong>
          <label>Company workspace name<input name="company_name" placeholder="Customer workspace" required /></label>
          <label>Owner email<input name="owner_email" type="email" placeholder="owner@company.com" /></label>
          ${workspacePresetSelect()}
          ${workspaceIconSelect()}
          <button class="btn btn-primary" type="submit"><i class="ti ti-plus"></i>Create</button>
        </form>
        ${renderCompanyDirectoryToolbar('platform', filters, view)}
        <div class="platform-company-list">
          ${view.rows.map((company) => renderPlatformCompanyRow(company, currentCompanyId)).join('') || companyDirectoryEmptyState(filters)}
        </div>
        ${renderCompanyDirectoryPager('platform', view)}
        ${renderPlatformBackupLedger(currentCompanyId)}
      </article>
    `;
  }

  function renderPlatformBackupLedger(currentCompanyId) {
    const rows = filteredPlatformBackupCopies(currentCompanyId);
    const filters = state.platformBackupFilters || {};
    const companyOptions = [['all', 'All companies']].concat(platformCompanyRows().map((company) => [company.company_id, company.company_name || companyName(company.company_id)]));
    return `
      <section class="platform-backup-ledger">
        <div class="section-head">
          <div>
            <h3>Backup safety copies</h3>
            <p>Master-only ledger of the second backup table. These are separate from the visible workspace backups.</p>
          </div>
        </div>
        <div class="platform-backup-filters">
          <label><span>Company</span><select data-platform-backup-filter="company_id">${companyOptions.map(([value, label]) => `<option value="${h(value)}" ${filters.company_id === value ? 'selected' : ''}>${h(label)}</option>`).join('')}</select></label>
          <label><span>State</span><select data-platform-backup-filter="status">${['all', 'active', 'deleted'].map((value) => `<option value="${value}" ${filters.status === value ? 'selected' : ''}>${h(titleCase(value))}</option>`).join('')}</select></label>
          <label><span>Type</span><select data-platform-backup-filter="kind">${['all', 'manual', 'automatic', 'import', 'restore', 'mirror'].map((value) => `<option value="${value}" ${filters.kind === value ? 'selected' : ''}>${h(titleCase(value))}</option>`).join('')}</select></label>
          <label><span>Search</span><input data-platform-backup-filter="query" value="${h(filters.query || '')}" placeholder="Company, user, backup..." /></label>
        </div>
        <div class="platform-backup-list">
          ${rows.map(renderPlatformBackupCopyRow).join('') || emptyState('No backup safety copies match these filters.')}
        </div>
      </section>
    `;
  }

  function renderPlatformCompanyRow(company, currentCompanyId) {
    const active = ['active', 'trialing', 'past_due', 'grace'].includes(company.status);
    const pending = company.status === 'pending_review';
    const suspended = ['suspended', 'archived', 'rejected', 'canceled'].includes(company.status);
    const isPlatformCompany = company.company_id === 'lumen';
    const members = platformMembersForCompany(company.company_id);
    const statusClass = active ? 'active' : pending ? 'pending' : suspended ? 'muted' : 'hold';
    return `
      <article class="platform-company-card ${pending ? 'pending' : suspended ? 'suspended' : ''}">
        <div class="platform-company-main">
          <span class="company-dot" style="--company-color:${h(company.color || companyColor(company.company_id))}"></span>
          <div>
            <strong>${h(company.company_name || companyName(company.company_id))}${company.company_id === currentCompanyId ? ' / current' : ''}</strong>
            <small>${h(company.company_id)} / Owner: ${h(company.owner_email || company.owner_name || 'No owner yet')}</small>
          </div>
        </div>
        <div class="platform-company-stats">
          <b class="status-pill ${statusClass}">${h(subscriptionLabelForStatus(company.status, company))}</b>
          <span>${h(String(number(company.active_member_count)))} active</span>
          <span>${h(String(number(company.pending_member_count)))} pending</span>
          <span>${h(String(number(company.disabled_member_count)))} disabled</span>
        </div>
        ${renderPlatformPluginStrip(company.company_id)}
        <div class="platform-company-actions">
          <button class="btn btn-primary" type="button" data-action="platform-company-action" data-company-id="${h(company.company_id)}" data-platform-action="approve" ${active ? 'disabled' : ''}>Approve</button>
          <button class="btn" type="button" data-action="platform-company-action" data-company-id="${h(company.company_id)}" data-platform-action="suspend" ${suspended || isPlatformCompany ? 'disabled' : ''}>Suspend</button>
          <button class="btn" type="button" data-action="platform-company-action" data-company-id="${h(company.company_id)}" data-platform-action="reactivate" ${active ? 'disabled' : ''}>Reactivate</button>
          <button class="btn danger" type="button" data-action="platform-company-action" data-company-id="${h(company.company_id)}" data-platform-action="archive" ${isPlatformCompany || ['archived', 'rejected', 'canceled'].includes(company.status) ? 'disabled' : ''}>Archive</button>
        </div>
        <details class="platform-members" ${pending ? 'open' : ''}>
          <summary>${members.length} member${members.length === 1 ? '' : 's'}</summary>
          <div class="platform-member-list">
            ${members.map(renderPlatformMemberRow).join('') || emptyState('No members found for this company.')}
          </div>
        </details>
      </article>
    `;
  }

  function renderPlatformPluginStrip(companyId) {
    // This strip writes the company entitlement, so it reads the company entitlement. It used
    // to read the workspace-level status, which the platform master cannot set for a company
    // they are not a member of -- so the button never changed and the install looked ignored.
    const entitled = (plugin) => companyPluginStatus(companyId, plugin.id) === 'installed';
    const installed = availableWorkspacePlugins().filter(entitled);
    return `
      <details class="platform-plugins">
        <summary>${installed.length}/${availableWorkspacePlugins().length} plugins installed</summary>
        <div class="platform-plugin-list">
          ${availableWorkspacePlugins().map((plugin) => {
            const active = entitled(plugin);
            return `
              <span class="${active ? 'active' : 'muted'}">
                <b>${h(plugin.label)}</b>
                <button class="btn" type="button" data-action="set-company-plugin" data-company-id="${h(companyId)}" data-plugin-id="${h(plugin.id)}" data-status="${active ? 'disabled' : 'installed'}">
                  ${active ? 'Disable' : 'Install'}
                </button>
              </span>
            `;
          }).join('')}
        </div>
      </details>
    `;
  }

  function renderPlatformMemberRow(member) {
    return `
      <article class="platform-member-row ${member.status !== 'active' ? 'muted' : ''}">
        ${renderAvatar({ full_name: member.name, email: member.email }, 'avatar small')}
        <span>
          <strong>${h(member.name || member.email || shortUserId(member.profile_id))}</strong>
          <small>${h(member.email || member.profile_id)} / ${h(member.role_label)} / ${h(titleCase(member.status))}</small>
        </span>
        <b class="status-pill ${member.status === 'active' ? 'active' : member.status === 'pending' ? 'pending' : 'muted'}">${h(titleCase(member.status))}</b>
      </article>
    `;
  }
  return { renderPlatformMasterPanel };
}
