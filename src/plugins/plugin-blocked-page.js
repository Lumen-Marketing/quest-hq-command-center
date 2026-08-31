// The plugin-disabled explanation is only needed when a workspace opens a packaged module
// that is not active. Keep its detailed comparison and actions out of the default app bundle.

export function createPluginBlockedPage(ctx) {
  const {
    activeCompanyId, activeSession, activeWorkspaceId, appHref, can, companyName, companyPath,
    companyPluginStatus, contractRows, h, membershipForProfile, pluginsForModule, roleForCompany,
    subscriptionLabel, subscriptionNeedsReview, titleCase, wbCompanyWorkspacePeek, workspaceHeader,
    workspacePluginStatus,
  } = ctx;

  function renderSubscriptionBlockedPage(companyId) {
    const pendingReview = subscriptionNeedsReview(companyId);
    return `
      ${workspaceHeader(pendingReview ? 'Workspace awaiting approval' : 'Subscription required', pendingReview ? 'Your company workspace is created. Quest needs to approve billing/access before live company data opens.' : 'This company workspace needs an active subscription before paid modules can open.', `
        <button class="btn" type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
        <a class="btn btn-primary" href="${appHref(companyPath('admin', { tab: 'billing' }, companyId))}" data-router><i class="ti ti-credit-card"></i>${pendingReview ? 'Review status' : 'Billing'}</a>
      `)}
      <section class="panel">
        ${contractRows([
          ['Company', companyName(companyId)],
          ['Subscription', subscriptionLabel(companyId)],
          ['Allowed area', 'Settings, profile, and sign out remain available'],
          ['Next step', pendingReview ? 'Quest approval / billing activation' : 'Restore billing access'],
        ])}
      </section>
    `;
  }

  function renderPluginBlockedPage(companyId, moduleMeta) {
    const plugins = pluginsForModule(moduleMeta?.id || '');
    const plugin = plugins[0] || null;
    const workspaceId = activeWorkspaceId();
    const canManagePlugins = can('plugins.manage', companyId);
    const installablePlugins = plugins.filter((item) => !item.comingSoon && companyPluginStatus(companyId, item.id) === 'installed');
    const customJobsApp = moduleMeta?.id === 'jobs'
      ? (wbCompanyWorkspacePeek(companyId)?.apps || []).find((app) => String(app?.name || '').trim().toLowerCase() === 'jobs')
      : null;
    const requestedModuleLabel = moduleMeta?.id === 'jobs' ? 'Quest CRM Jobs' : (moduleMeta?.label || moduleMeta?.id || 'Unknown');
    return `
      ${workspaceHeader(`${plugin?.label || moduleMeta?.label || 'Plugin'} not installed`, 'This workspace has not enabled the plugin required for this module.', `
        <a class="btn" href="${appHref(companyPath('setup', { tab: 'modules' }, companyId))}" data-router><i class="ti ti-plug"></i>${canManagePlugins ? 'Manage modules' : 'View modules'}</a>
        ${customJobsApp && can('workspaces.view', companyId) ? `<a class="btn" href="${appHref(companyPath('workspaces', { app_id: customJobsApp.id }, companyId))}" data-router><i class="ti ti-layout-grid"></i>Open Custom Jobs</a>` : ''}
        ${canManagePlugins ? installablePlugins.map((item) => `<button class="btn btn-primary" type="button" data-action="set-workspace-plugin" data-workspace-id="${h(workspaceId)}" data-plugin-id="${h(item.id)}" data-status="installed"><i class="ti ti-download"></i>Activate ${h(item.label)}</button>`).join('') : ''}
      `)}
      ${customJobsApp ? '<section class="panel"><div class="section-head"><div><h2>Custom Jobs and Quest CRM Jobs are separate</h2><p>Custom Jobs is an app built for this workspace. Quest CRM Jobs is the packaged production module and only opens when Quest CRM is active here.</p></div></div></section>' : ''}
      <section class="panel">
        ${contractRows([
          ['Company', companyName(companyId)],
          ['Requested module', requestedModuleLabel],
          ['Required plugin', plugins.length ? plugins.map((item) => item.label).join(' or ') : 'Unknown'],
          ['Current status', plugins.length ? plugins.map((item) => `${item.label}: ${titleCase(workspacePluginStatus(companyId, item.id, workspaceId).replace('_', ' '))}`).join(' / ') : 'Unavailable'],
          ['Data policy', 'Existing plugin data is preserved while the plugin is disabled'],
        ])}
      </section>
    `;
  }

  function renderPermissionBlockedPage(companyId, permission) {
    return `
      ${workspaceHeader('Access denied', 'Your role does not include the permission required for this module.', `
        <a class="btn" href="${appHref(companyPath('users', { tab: 'roles' }, companyId))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
      `)}
      <section class="panel">
        ${contractRows([
          ['Company', companyName(companyId)],
          ['Required permission', permission],
          ['Your role', roleForCompany(companyId)],
        ])}
      </section>
    `;
  }

  function renderCompanyAccessDeniedPage(companyId) {
    const membership = membershipForProfile(companyId, activeSession().profile.id);
    return `
      ${workspaceHeader('Company access denied', 'This workspace is not in your active company memberships.', `
        <a class="btn" href="${appHref(companyPath('jobs', {}, activeCompanyId()))}" data-router><i class="ti ti-building"></i>Your workspace</a>
        <a class="btn btn-primary" href="${appHref('/login?mode=request')}" data-router><i class="ti ti-user-plus"></i>Request access</a>
      `)}
      <section class="panel">
        ${contractRows([
          ['Requested company', companyName(companyId)],
          ['Access rule', 'Active company membership required'],
          ['Your status', membership?.status ? titleCase(membership.status) : 'No active membership'],
        ])}
      </section>
    `;
  }

  return {
    renderCompanyAccessDeniedPage,
    renderPermissionBlockedPage,
    renderPluginBlockedPage,
    renderSubscriptionBlockedPage,
  };
}
