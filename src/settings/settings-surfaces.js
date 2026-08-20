import { SETUP_TABS, normalizeSettingsSurfaceTab, settingsSurfaceTabs } from './navigation-model.js';
import { createCompanyDirectoryView } from '../platform/company-directory-view.js';

export function createSettingsSurfaces(ctx) {
  const {
    activeWorkspace, appHref, availableWorkspacePlugins, can, companyAccessUsers,
    billingMode, companyAuditEvents, companyName, companyPath, companySubscription, compactTabs,
    companyDirectoryFilters, contractRows, emptyState,
    filterCompanyRows, formatDate, h, isPluginInstalled, isQuestDeveloper, navigationLabel,
    paginate, profileById, renderAvatar,
    questAuthEnabled, renderAppearanceControls, renderBackupsSettings,
    renderCompanySetupSettings, renderHandoffReviewPanel, renderPlatformMasterPanel,
    renderPluginsSettings, renderRecycleBinSettings, renderWorkspaceSettingsSurface,
    roleForCompany, shortUserId, state, subscriptionAllowsCompany, subscriptionLabel,
    subscriptionLabelForStatus, subscriptionNeedsReview, titleCase, workspaceHeader,
    workspaceReviewRows,
  } = ctx;
  const {
    companyDirectoryEmptyState, renderCompanyDirectoryPager, renderCompanyDirectoryToolbar,
  } = createCompanyDirectoryView({ emptyState, h });

  function surfaceTabs(section, tabs, activeTab, companyId) {
    return compactTabs(`${navigationLabel(section, titleCase(section))} sections`, tabs.map(({ id, label }) => [
      companyPath(section, { tab: id }, companyId), label, activeTab === id,
    ]));
  }

  function renderPipelines(companyId) {
    const canManageCrm = can('crm.manage', companyId);
    const canManageJobs = can('jobs.manage', companyId);
    return `
      <article class="panel span-3 setup-pipeline-surface">
        <div class="section-head">
          <div><h2>Pipelines</h2><p>Packaged Quest CRM stages and custom Workspace Builder pipelines are managed from their real records.</p></div>
          <a class="btn btn-primary" href="${appHref(companyPath('workspaces', {}, companyId))}" data-router><i class="ti ti-layout-grid-add"></i>Open Workspace Builder</a>
        </div>
        <div class="setup-action-grid">
          <button class="btn" type="button" data-action="open-stage-manager" data-module="contacts" ${canManageCrm ? '' : 'disabled'}><i class="ti ti-address-book"></i>Contact stages</button>
          <button class="btn" type="button" data-action="open-stage-manager" data-module="deals" ${canManageCrm ? '' : 'disabled'}><i class="ti ti-briefcase"></i>Quote stages</button>
          <button class="btn" type="button" data-action="open-stage-manager" data-module="jobs" ${canManageJobs ? '' : 'disabled'}><i class="ti ti-hammer"></i>Job stages</button>
        </div>
        <p class="form-note">Quest CRM keeps its ready-made lifecycle. Regular CRM and Workspace Builder apps stay customizable per workspace.</p>
      </article>
    `;
  }

  function renderIntegrations(companyId) {
    const callsEnabled = isPluginInstalled(companyId, 'calls');
    const messagesEnabled = isPluginInstalled(companyId, 'messages');
    return `
      <article class="panel span-2">
        <div class="section-head"><div><h2>Integration entry points</h2><p>These statuses show module availability, not vendor connection health. Secrets remain on the server.</p></div></div>
        ${contractRows([
          ['Cloud data', state.sync.mode === 'live' ? 'Connected' : state.sync.label],
          ['RingCentral calls', callsEnabled ? 'Module enabled — verify in Calls' : 'Module not enabled'],
          ['Company messaging', messagesEnabled ? 'Module enabled' : 'Module not enabled'],
          ['SMS readiness', 'Checked on each contact before sending'],
        ])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Verify each connection</h2><p>Open the module to verify credentials, phone numbers, webhooks, and live traffic before launch.</p></div></div>
        <div class="form-actions">
          <a class="btn btn-primary" href="${appHref(companyPath('setup', { tab: 'modules' }, companyId))}" data-router>Open Modules</a>
          ${callsEnabled ? `<a class="btn" href="${appHref(companyPath('calls', {}, companyId))}" data-router>Open Calls</a>` : ''}
        </div>
      </article>
    `;
  }

  function renderLaunchCheck(companyId) {
    const workspace = activeWorkspace();
    const installed = availableWorkspacePlugins().filter((plugin) => isPluginInstalled(companyId, plugin.id)).length;
    const activePeople = companyAccessUsers(companyId).filter((user) => user.status === 'active').length;
    const checks = [
      ['Company profile', Boolean(companyName(companyId)), companyName(companyId) || 'Company name required'],
      ['Active workspace', Boolean(workspace), workspace?.name || 'Create or select a workspace'],
      ['Live data connection', state.sync.mode === 'live', state.sync.mode === 'live' ? 'Connected' : state.sync.label],
      ['Workspace modules', installed > 0, `${installed} enabled`],
      ['People access', activePeople > 0, `${activePeople} active`],
    ];
    const ready = checks.filter(([, passed]) => passed).length;
    return `
      <article class="panel span-3 setup-launch-check">
        <div class="section-head"><div><h2>Workspace Setup Check</h2><p>${ready} of ${checks.length} workspace setup checks are passing.</p></div></div>
        <div class="launch-check-list">
          ${checks.map(([label, passed, detail]) => `<div class="launch-check-row ${passed ? 'passed' : 'attention'}"><i class="ti ${passed ? 'ti-circle-check-filled' : 'ti-alert-circle'}"></i><span><strong>${h(label)}</strong><small>${h(detail)}</small></span><b>${passed ? 'Ready' : 'Check'}</b></div>`).join('')}
        </div>
        <p class="form-note">This is not full public-launch clearance. Verify billing, email delivery, payment setup, and each external integration separately.</p>
      </article>
    `;
  }

  function renderSetupPage(route, companyId) {
    const tab = normalizeSettingsSurfaceTab('setup', route.params.get('tab'));
    return `
      ${workspaceHeader('Setup', 'Configure company identity, workspaces, modules, pipelines, and launch readiness.', '')}
      ${surfaceTabs('setup', SETUP_TABS, tab, companyId)}
      <section class="dashboard-grid compact-settings-grid settings-surface settings-surface-setup">
        ${tab === 'company-profile' ? renderWorkspaceSettingsSurface('renderCompanyProfileSettings', companyId) : ''}
        ${tab === 'company-brand' ? `
          <article class="panel span-3">
            <div class="section-head"><div><h2>Company Brand</h2><p>Preview with your personal appearance, then save it as the default for members who have not chosen their own.</p></div></div>
            <div class="theme-toggle-row">${renderAppearanceControls()}</div>
          </article>
        ` : ''}
        ${tab === 'workspaces' ? `${renderWorkspaceSettingsSurface('renderWorkspaceDirectorySettings', companyId)}${renderCompanySetupSettings(companyId, route)}` : ''}
        ${tab === 'modules' ? renderPluginsSettings(companyId) : ''}
        ${tab === 'pipelines' ? renderPipelines(companyId) : ''}
        ${tab === 'handoffs' ? (can('crm.manage', companyId) ? renderHandoffReviewPanel(companyId) : `
          <article class="panel span-3"><div class="section-head"><div><h2>Handoffs</h2><p>Your role can view company setup but cannot review or change CRM handoffs.</p></div></div>
            ${contractRows([['Required permission', 'crm.manage'], ['Your role', roleForCompany(companyId)]])}
          </article>
        `) : ''}
        ${tab === 'integrations' ? renderIntegrations(companyId) : ''}
        ${tab === 'launch-check' ? renderLaunchCheck(companyId) : ''}
      </section>
    `;
  }

  function renderAuditHistory(companyId) {
    const events = companyAuditEvents(companyId).slice(0, 50);
    return `
      <article class="panel span-3">
        <div class="section-head"><div><h2>Audit History</h2><p>Recent access, role, membership, and company administration changes.</p></div></div>
        <div class="access-audit-list">${events.map(renderAuditEventRow).join('') || emptyState('No audit events yet.')}</div>
      </article>
    `;
  }

  function renderAuditEventRow(event) {
    const profile = profileById(event.actor_profile_id);
    const actor = profile?.full_name || profile?.email || shortUserId(event.actor_profile_id || 'system');
    return `
      <article class="access-audit-row">
        ${renderAvatar({ full_name: actor, email: profile?.email || '' }, 'avatar small')}
        <span>
          <strong>${h(titleCase(String(event.event_type || 'access.event').replace(/[._-]+/g, ' ')))}</strong>
          <small>${h(actor)} / ${formatDate(event.created_at)}</small>
        </span>
      </article>
    `;
  }

  function renderWorkspaceReviewRow(review, currentCompanyId) {
    const active = ['active', 'trialing', 'past_due', 'grace'].includes(review.status);
    const isCurrent = review.company_id === currentCompanyId;
    return `
      <article class="workspace-review-row ${review.status === 'pending_review' ? 'pending' : ''}">
        <span>
          <strong>${h(review.company_name || companyName(review.company_id))}${isCurrent ? ' / current' : ''}</strong>
          <small>${h(review.company_id)} / ${h(review.owner_email || 'No owner email')} / ${formatDate(review.created_at)}</small>
        </span>
        <b class="status-pill ${active ? 'active' : review.status === 'pending_review' ? 'pending' : 'muted'}">${h(subscriptionLabelForStatus(review.status, review))}</b>
        <div class="workspace-review-actions">
          <button class="btn btn-primary" type="button" data-action="review-workspace" data-company-id="${h(review.company_id)}" data-status="active" ${active ? 'disabled' : ''}>Approve</button>
          <button class="btn" type="button" data-action="review-workspace" data-company-id="${h(review.company_id)}" data-status="pending_review" ${review.status === 'pending_review' ? 'disabled' : ''}>Pending</button>
          <button class="btn" type="button" data-action="review-workspace" data-company-id="${h(review.company_id)}" data-status="suspended" ${review.status === 'suspended' ? 'disabled' : ''}>Suspend</button>
          <button class="btn" type="button" data-action="review-workspace" data-company-id="${h(review.company_id)}" data-status="rejected" ${review.status === 'rejected' ? 'disabled' : ''}>Reject</button>
        </div>
      </article>
    `;
  }

  function renderWorkspaceApprovalConsole(companyId) {
    const reviews = workspaceReviewRows();
    const pending = reviews.filter((review) => review.status === 'pending_review').length;
    const filters = companyDirectoryFilters('review');
    const matched = filterCompanyRows(reviews, filters);
    const view = paginate(matched, filters.page);
    return `
      <article class="panel span-3">
        <div class="section-head">
          <div><h2>Quest approval console</h2><p>${pending} workspace${pending === 1 ? '' : 's'} waiting for manual activation.</p></div>
        </div>
        ${renderCompanyDirectoryToolbar('review', filters, view)}
        <div class="approval-console-list">
          ${view.rows.map((review) => renderWorkspaceReviewRow(review, companyId)).join('') || companyDirectoryEmptyState(filters)}
        </div>
        ${renderCompanyDirectoryPager('review', view)}
      </article>
    `;
  }

  function renderBilling(companyId) {
    const subscription = companySubscription(companyId);
    const pendingReview = subscriptionNeedsReview(companyId);
    const manualBilling = billingMode === 'manual';
    const canManageBilling = can('billing.manage', companyId);
    const buttonLabel = manualBilling ? 'Manual approval' : pendingReview ? 'Billing pending' : 'Start subscription';
    return `
      <article class="panel">
        <div class="section-head">
          <div><h2>${pendingReview ? 'Workspace awaiting approval' : 'Subscription'}</h2><p>${manualBilling ? 'Manual approval is active for launch week. Lumen activates workspaces after review.' : pendingReview ? 'Quest needs to approve billing/access before live company data opens.' : '$300/month company workspace billing gate.'}</p></div>
          <button class="btn btn-primary" type="button" data-action="start-checkout" ${pendingReview || manualBilling || !canManageBilling ? 'disabled' : ''}${canManageBilling ? '' : ' title="billing.manage permission required"'}><i class="ti ti-credit-card"></i>${buttonLabel}</button>
        </div>
        ${contractRows([
          ['Plan', '$300/month company workspace'],
          ['Status', subscriptionLabel(companyId)],
          ['Billing mode', manualBilling ? 'Manual approval' : 'Stripe checkout'],
          ['Stripe customer', subscription?.stripe_customer_id || 'Not connected'],
          ['Approval', pendingReview || manualBilling ? 'Waiting for Lumen review' : 'Ready'],
          ['Renewal / trial', subscription?.current_period_end || subscription?.trial_ends_at ? formatDate(subscription.current_period_end || subscription.trial_ends_at) : 'Pending'],
        ])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules open only after approval or an active billing state.</p></div></div>
        ${contractRows([
          ['Workspace access', subscriptionAllowsCompany(companyId) ? 'Allowed' : 'Suspended'],
          ['Finance/files privacy', questAuthEnabled ? 'Requires Auth + RLS' : 'Demo only'],
          ['Seat billing', 'Tracked later; not charged in v1'],
        ])}
      </article>
      ${isQuestDeveloper() ? renderWorkspaceApprovalConsole(companyId) : ''}
    `;
  }

  function renderAdminPage(route, companyId) {
    const capabilities = {
      isDeveloper: isQuestDeveloper(),
      can: (permission) => can(permission, companyId),
    };
    const tabs = settingsSurfaceTabs('admin', capabilities);
    const tab = normalizeSettingsSurfaceTab('admin', route.params.get('tab'), capabilities);
    if (!tab) {
      return `
        ${workspaceHeader('Admin', 'Billing, recovery, audit history, and technical diagnostics.', '')}
        <section class="dashboard-grid compact-settings-grid settings-surface settings-surface-admin">
          <article class="panel span-3"><div class="section-head"><div><h2>Admin access required</h2><p>Your role does not have permission to open any administration area.</p></div></div></article>
        </section>
      `;
    }
    return `
      ${workspaceHeader('Admin', 'Billing, recovery, audit history, and technical diagnostics.', '')}
      ${surfaceTabs('admin', tabs, tab, companyId)}
      <section class="dashboard-grid compact-settings-grid settings-surface settings-surface-admin">
        ${tab === 'billing' ? renderBilling(companyId) : ''}
        ${tab === 'data-recovery' ? `<div class="settings-recovery-stack span-3">${renderBackupsSettings(companyId)}${renderRecycleBinSettings(companyId)}</div>` : ''}
        ${tab === 'audit-history' ? renderAuditHistory(companyId) : ''}
        ${tab === 'diagnostics' ? renderWorkspaceSettingsSurface('renderDiagnosticsSettings', companyId) : ''}
        ${tab === 'platform' && isQuestDeveloper() ? renderPlatformMasterPanel(companyId) : ''}
      </section>
    `;
  }

  return { renderSetupPage, renderAdminPage };
}
