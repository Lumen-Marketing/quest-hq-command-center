import { ADMIN_TABS, SETUP_TABS, normalizeSettingsSurfaceTab } from './navigation-model.js';

export function createSettingsSurfaces(ctx) {
  const {
    activeWorkspace, appHref, availableWorkspacePlugins, can, companyAccessUsers,
    companyAuditEvents, companyName, companyPath, compactTabs, contractRows, emptyState, h,
    isPluginInstalled, isQuestDeveloper, navigationLabel, renderAdminAuditEventRow,
    renderAppearanceControls, renderBackupsSettings, renderBillingSettings,
    renderCompanySetupSettings, renderHandoffReviewPanel, renderPlatformMasterPanel,
    renderPluginsSettings, renderRecycleBinSettings, renderWorkspaceSettingsSurface,
    roleForCompany, state, titleCase, workspaceHeader,
  } = ctx;

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
        <div class="section-head"><div><h2>Integrations</h2><p>Connection entry points and their current module availability. Secrets remain on the server.</p></div></div>
        ${contractRows([
          ['Cloud data', state.sync.mode === 'live' ? 'Connected' : state.sync.label],
          ['RingCentral calls', callsEnabled ? 'Module enabled — verify in Calls' : 'Module not enabled'],
          ['Company messaging', messagesEnabled ? 'Module enabled' : 'Module not enabled'],
          ['SMS readiness', 'Checked on each contact before sending'],
        ])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Manage connection surfaces</h2><p>Enable the workspace module first, then finish its connection from that module.</p></div></div>
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
        <div class="section-head"><div><h2>Launch Check</h2><p>${ready} of ${checks.length} workspace readiness checks are passing.</p></div></div>
        <div class="launch-check-list">
          ${checks.map(([label, passed, detail]) => `<div class="launch-check-row ${passed ? 'passed' : 'attention'}"><i class="ti ${passed ? 'ti-circle-check-filled' : 'ti-alert-circle'}"></i><span><strong>${h(label)}</strong><small>${h(detail)}</small></span><b>${passed ? 'Ready' : 'Check'}</b></div>`).join('')}
        </div>
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
        <div class="access-audit-list">${events.map(renderAdminAuditEventRow).join('') || emptyState('No audit events yet.')}</div>
      </article>
    `;
  }

  function renderAdminPage(route, companyId) {
    const tabs = ADMIN_TABS.filter((item) => !item.developerOnly || isQuestDeveloper());
    const tab = normalizeSettingsSurfaceTab('admin', route.params.get('tab'), { isDeveloper: isQuestDeveloper() });
    return `
      ${workspaceHeader('Admin', 'Billing, recovery, audit history, and technical diagnostics.', '')}
      ${surfaceTabs('admin', tabs, tab, companyId)}
      <section class="dashboard-grid compact-settings-grid settings-surface settings-surface-admin">
        ${tab === 'billing' ? renderBillingSettings(companyId) : ''}
        ${tab === 'data-recovery' ? `<div class="settings-recovery-stack span-3">${renderBackupsSettings(companyId)}${renderRecycleBinSettings(companyId)}</div>` : ''}
        ${tab === 'audit-history' ? renderAuditHistory(companyId) : ''}
        ${tab === 'diagnostics' ? renderWorkspaceSettingsSurface('renderDiagnosticsSettings', companyId) : ''}
        ${tab === 'platform' && isQuestDeveloper() ? renderPlatformMasterPanel(companyId) : ''}
      </section>
    `;
  }

  return { renderSetupPage, renderAdminPage };
}
