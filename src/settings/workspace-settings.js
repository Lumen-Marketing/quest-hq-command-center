// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

export function createWorkspaceSettings(ctx) {
  const {
    activeWorkspace, activeWorkspaceId, availableWorkspacePlugins, canManageOperationalWorkspaces, companyById, companyJobs, companyName, contractRows, emptyState, field, h, isPluginInstalled, normalizeCompany, titleCase, workspaceIconDraft, workspaceIconMarkup, workspaceIconOption, workspaceMemberCount, workspaceRoleLabel, state, isCompanyOwner,
  } = ctx;

  function settingsContext(companyId) {
    const company = companyById(companyId) || normalizeCompany({ id: companyId });
    const iconDraft = workspaceIconDraft(companyId);
    const canManage = canManageOperationalWorkspaces(companyId);
    const workspace = activeWorkspace();
    const companyWorkspaces = state.operationalWorkspaces
      .filter((item) => item.company_id === companyId)
      .sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.name.localeCompare(b.name));
    const connectionMode = state.sync.mode === 'live' ? 'live' : state.sync.mode === 'loading' ? 'loading' : 'local';
    const connectionLabel = connectionMode === 'live' ? 'Live database' : connectionMode === 'loading' ? 'Checking connection' : 'Local fallback';
    const connectionDescription = connectionMode === 'live'
      ? 'Company and workspace changes are saving to the live database.'
      : connectionMode === 'loading'
        ? 'Questbase is checking the workspace data connection.'
        : 'This company account is using local fallback data. Changes may not persist for the team.';
    return { company, iconDraft, canManage, workspace, companyWorkspaces, connectionMode, connectionLabel, connectionDescription };
  }

  function renderCompanyProfileSettings(companyId) {
    const { company, iconDraft, canManage } = settingsContext(companyId);
    return `
        <article class="panel span-2 settings-company-profile">
          <div class="section-head"><div><h2>Company account</h2><p>The customer, billing, and security boundary above every operational workspace.</p></div></div>
          <form class="workspace-settings-form" data-workspace-settings-form>
            <input type="hidden" name="company_id" value="${h(companyId)}" />
            <input type="hidden" name="icon_key" value="${h(iconDraft.icon_key)}" />
            <input type="hidden" name="icon_image" value="${h(iconDraft.icon_image)}" />
            <input type="hidden" name="icon_color" value="${h(iconDraft.icon_color)}" />
            <input type="hidden" name="icon_pack" value="${h(iconDraft.icon_pack)}" />
            ${field('Company name', 'workspace_name', companyName(companyId), true, 'text', 'workspace-name-field')}
            <div class="workspace-icon-section">
              <span>Company logo</span>
              <div class="workspace-icon-current">
                ${workspaceIconMarkup({ ...company, icon_key: iconDraft.icon_key, icon_image: iconDraft.icon_image, icon_color: iconDraft.icon_color, icon_pack: iconDraft.icon_pack }, 'large')}
                <div>
                  <strong>${h(iconDraft.icon_image ? 'Uploaded icon' : workspaceIconOption(iconDraft.icon_key).label)}</strong>
                  <small>${h(iconDraft.icon_image ? 'Custom image for this company account.' : 'Built-in icon from the Quest library.')}</small>
                </div>
                <button class="btn" type="button" data-action="open-workspace-icon-modal" ${canManage ? '' : 'disabled'}><i class="ti ti-photo-edit"></i>Change icon</button>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" type="submit" ${canManage ? '' : 'disabled'}><i class="ti ti-device-floppy"></i>Save company</button>
            </div>
          </form>
        </article>
        <article class="panel settings-scope-note">
          <div class="section-head"><div><h2>Company scope</h2><p>Shared company details are used across every workspace.</p></div></div>
          ${contractRows([
            ['Company', companyName(companyId)],
            ['Company ID', companyId],
            ['Scope', 'All workspaces'],
          ])}
        </article>
    `;
  }

  function renderWorkspaceDirectorySettings(companyId) {
    const { companyWorkspaces, canManage, workspace } = settingsContext(companyId);
    return `
        <article class="panel">
          <div class="section-head">
            <div><h2>Workspace directory</h2><p>${companyWorkspaces.length} operational workspace${companyWorkspaces.length === 1 ? '' : 's'} under this company account. Click one to configure it.</p></div>
            <button class="btn btn-primary" type="button" data-action="open-create-operational-workspace-modal" ${canManage ? '' : 'disabled'}><i class="ti ti-plus"></i>Create workspace</button>
          </div>
          <div class="operational-workspace-directory">
            ${companyWorkspaces.map((item) => {
              const isActive = item.id === activeWorkspaceId();
              const memberLabel = `${workspaceMemberCount(item.id)} assigned`;
              return `
              <div class="operational-workspace-row ${isActive ? 'active' : ''} ${item.status === 'archived' ? 'muted' : ''}">
                <button class="ows-open" type="button" data-action="open-edit-operational-workspace-modal" data-workspace-id="${h(item.id)}" aria-label="Configure ${h(item.name)}">
                  ${workspaceIconMarkup(item)}
                  <span class="ows-open-text"><strong>${h(item.name)}</strong><small>${item.is_default ? '<span class="ows-default-flag">Default</span>' : h(titleCase(item.status))} · ${h(memberLabel)}</small></span>
                  <i class="ti ti-settings ows-open-hint" aria-hidden="true"></i>
                </button>
                <div class="ows-actions">
                  ${isActive
                    ? '<span class="ows-tag open"><i class="ti ti-check" aria-hidden="true"></i>Open</span>'
                    : `<button class="btn ows-action" type="button" data-action="select-workspace" data-workspace-id="${h(item.id)}" ${item.status === 'archived' ? 'disabled' : ''}><i class="ti ti-arrow-right"></i>Open</button>`}
                  ${item.is_default
                    ? '<span class="ows-tag default"><i class="ti ti-star-filled" aria-hidden="true"></i>Default</span>'
                    : `<button class="btn ows-action" type="button" data-action="set-default-workspace" data-workspace-id="${h(item.id)}" ${canManage && item.status !== 'archived' ? '' : 'disabled'}><i class="ti ti-star"></i>Set default</button>`}
                  ${item.is_default || !isCompanyOwner(companyId) ? '' : `<button class="btn ows-action danger" type="button" data-action="delete-operational-workspace" data-workspace-id="${h(item.id)}"><i class="ti ti-trash"></i>Delete</button>`}
                </div>
              </div>
            `;
            }).join('') || emptyState('No workspaces have been created.')}
          </div>
        </article>
        <article class="panel settings-workspace-identity">
          <div class="section-head">
            <div><h2>Selected workspace</h2><p>Workspace name, icon, membership and setup stay scoped to this workspace.</p></div>
          </div>
          ${workspace ? `
            <div class="workspace-icon-current">
              ${workspaceIconMarkup(workspace, 'large')}
              <div><strong>${h(workspace.name)}</strong><small>${h(workspaceRoleLabel(workspace.id))} · ${h(String(workspaceMemberCount(workspace.id)))} assigned</small></div>
              <button class="btn" type="button" data-action="open-edit-operational-workspace-modal" data-workspace-id="${h(workspace.id)}" ${canManage ? '' : 'disabled'}><i class="ti ti-adjustments"></i>Edit workspace</button>
            </div>
          ` : emptyState('Select a workspace to manage its identity.')}
        </article>
    `;
  }

  function renderDiagnosticsSettings(companyId) {
    const { workspace, connectionMode, connectionLabel, connectionDescription } = settingsContext(companyId);
    return `
        <article class="panel settings-workspace-data-card">
          <div class="section-head"><div><h2>Workspace diagnostics</h2><p>Identifiers and record counts for support and troubleshooting.</p></div></div>
          ${contractRows([
            ['Company ID', companyId],
            ['Workspace ID', workspace?.id || 'Not assigned'],
            ['Workspace role', workspace ? workspaceRoleLabel(workspace.id) : 'No access'],
            ['Visible jobs', companyJobs(companyId).length],
            ['Installed plugins', availableWorkspacePlugins().filter((plugin) => isPluginInstalled(companyId, plugin.id)).length],
          ])}
        </article>
        <article class="panel settings-connection-card">
          <div class="section-head"><div><h2>Data connection</h2><p>Health check for where workspace changes are being saved.</p></div></div>
          <div class="settings-connection-status">
            <span class="sync-pill ${h(connectionMode)}" data-sync-state><i class="ti ti-database"></i>${h(connectionLabel)}</span>
            <p>${h(connectionDescription)}</p>
          </div>
          ${contractRows([
            ['Company account', companyName(companyId)],
            ['Workspace', workspace?.name || 'Not assigned'],
            ['Current status', state.sync.label],
            ['Storage mode', connectionMode === 'live' ? 'Quest cloud database' : connectionMode === 'loading' ? 'Checking' : 'This browser only'],
          ])}
        </article>
    `;
  }

  // Kept for old imports while bookmarks are redirected to the new surfaces.
  function renderWorkspaceSettings(companyId) {
    return `${renderCompanyProfileSettings(companyId)}${renderWorkspaceDirectorySettings(companyId)}${renderDiagnosticsSettings(companyId)}`;
  }

  return { renderWorkspaceSettings, renderCompanyProfileSettings, renderWorkspaceDirectorySettings, renderDiagnosticsSettings };
}
