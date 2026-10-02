// Settings > Plugins, fetched on demand: it is two clicks in, and nothing that paints before
// then needs it. Moved out of main.js to keep the entry chunk inside its budget.
//
// A factory, because every catalogue, permission and status helper belongs to main.js.

export function createPluginsPanel(ctx) {
  const {
    LAUNCH_HIDE_FUTURE_MODULES, MODULE_REGISTRY, WORKSPACE_PLUGIN_PRESETS,
    WORKSPACE_PLUGIN_PRESET_LABELS, WORKSPACE_PLUGIN_REGISTRY,
    activeWorkspace, activeWorkspaceId, availableWorkspacePlugins, can,
    canManageOperationalWorkspaces, companyPluginStatus, conflictingPluginIds, emptyState, h,
    isPluginInstalled, pluginById, pluginDataScopeDetails, pluginPrerequisiteNote,
    pluginStatusLabel, titleCase, workspacePluginStatus,
  } = ctx;

  function renderPluginsSettings(companyId) {
    const workspaceId = activeWorkspaceId();
    const workspace = activeWorkspace();
    const canManagePlugins = can('plugins.manage', companyId);
    const installedCount = availableWorkspacePlugins().filter((plugin) => isPluginInstalled(companyId, plugin.id, workspaceId)).length;
    // Plugins are switched on per workspace, so a company with no workspace row has nowhere to
    // switch them on -- which read as "you are not allowed", when the actual answer is "make a
    // workspace first". Owners were stuck on this with no way forward from the page.
    if (!workspace) {
      const canAddWorkspace = canManageOperationalWorkspaces(companyId);
      return `<article class="panel span-3 plugins-settings-panel">
        <div class="section-head">
          <div><h2>Modules</h2><p>Modules are switched on inside a workspace, and this company has none yet.</p></div>
          ${canAddWorkspace ? '<button class="btn btn-primary" type="button" data-action="open-create-operational-workspace-modal"><i class="ti ti-plus"></i>Create a workspace</button>' : ''}
        </div>
        ${emptyState(canAddWorkspace ? 'Create one and the modules below can be switched on.' : 'Ask an owner to create one.')}
      </article>`;
    }
    return `
      <article class="panel span-3 plugins-settings-panel">
        <div class="section-head">
          <div><h2>${h(workspace.name)} modules</h2><p>${installedCount} active module${installedCount === 1 ? '' : 's'} in this workspace. Company entitlements set what can be activated here.</p></div>
        </div>
        <div class="plugin-preset-row">
          ${Object.entries(WORKSPACE_PLUGIN_PRESETS).map(([presetCode, pluginIds]) => `
            <button class="btn" type="button" data-action="apply-workspace-plugin-preset" data-workspace-id="${h(workspaceId)}" data-preset-code="${h(presetCode)}" ${canManagePlugins ? '' : 'disabled'}>
              <i class="ti ti-layout-grid-add"></i>${h(WORKSPACE_PLUGIN_PRESET_LABELS[presetCode] || titleCase(presetCode))}
              <small>${pluginIds.length} modules</small>
            </button>
          `).join('')}
        </div>
        <div class="plugin-card-grid">
          ${WORKSPACE_PLUGIN_REGISTRY.map((plugin) => renderPluginCard(companyId, workspaceId, plugin, canManagePlugins)).join('')}
        </div>
      </article>
    `;
  }

  function renderPluginCard(companyId, workspaceId, plugin, canManagePlugins) {
    // 'installed' is the only value that permits an install. 'disabled' is a platform decision to
    // withhold, and a MISSING ROW is nobody having decided yet.
    //
    // The old comment here claimed the missing-row case meant the company could decide for itself,
    // and drew a bright Activate button for it. setWorkspacePlugin did not agree: it refuses
    // anything that is not already 'installed', so the click answered "This company account is not
    // entitled to that plugin." A card that offers a button the handler will refuse is worse than
    // one that says why. Both now read entitlement the same way.
    //
    // This was reachable without anyone doing anything wrong. 'calls' was added to the catalog
    // after the presets were written and is in none of them, so a company seeded from any preset
    // had no company_plugins row for it at all.
    const entitlement = companyPluginStatus(companyId, plugin.id);
    const entitled = entitlement === 'installed';
    // Deliberately 'not installed' rather than 'equals disabled': a missing row is exactly the
    // case that used to draw a button which could not work.
    const withheld = !entitled;
    const status = workspacePluginStatus(companyId, plugin.id, workspaceId);
    plugin.status = status;
    if (LAUNCH_HIDE_FUTURE_MODULES && plugin.status === 'coming_soon') return '';
    const installed = status === 'installed';
    const disabled = status === 'disabled';
    // A workspace that has genuinely turned it off is a normal Re-enable, entitlement or not --
    // the row exists and says 'disabled', so this is a company turning its own module back on.
    const available = status === 'available' && !withheld;
    const unavailable = status === 'available' && withheld;
    const comingSoon = status === 'coming_soon';
    const prerequisiteNote = pluginPrerequisiteNote(companyId, plugin);
    const conflictIds = conflictingPluginIds(companyId, plugin.id, 'installed');
    const conflictLabels = conflictIds.map((conflictId) => pluginById(conflictId)?.label || conflictId).join(', ');
    const moduleLabels = plugin.module_ids
      .map((moduleId) => MODULE_REGISTRY.find((module) => module.id === moduleId)?.label || titleCase(moduleId))
      .join(', ');
    const scope = pluginDataScopeDetails(plugin.dataScope);
    return `
      <article class="plugin-card ${installed ? 'installed' : disabled ? 'disabled' : comingSoon ? 'coming-soon' : unavailable ? 'unavailable' : 'available'}">
        <div class="plugin-card-icon"><i class="ti ${h(plugin.icon)}"></i></div>
        <div class="plugin-card-copy">
          <strong>${h(plugin.label)}</strong>
          <span>${h(plugin.summary)}</span>
          <small>${h(moduleLabels)}</small>
          <small class="plugin-scope-badge ${h(plugin.dataScope)}"><i class="ti ti-database" aria-hidden="true"></i>${h(scope.label)}</small>
          <small class="plugin-scope-description">${h(scope.description)}</small>
          ${unavailable ? `<small class="plugin-card-note">${entitlement === 'disabled' ? 'Turned off for your company by Quest.' : 'Not yet enabled for your company. Ask Quest to turn it on.'}</small>` : ''}
          ${prerequisiteNote ? `<small class="plugin-card-note">${h(prerequisiteNote)}</small>` : ''}
          ${conflictLabels && !installed ? `<small class="plugin-card-note warning">Installing ${h(plugin.label)} disables ${h(conflictLabels)}.</small>` : ''}
        </div>
        <b class="status-pill ${installed ? 'active' : comingSoon || unavailable ? 'muted' : disabled ? 'pending' : ''}">${h(unavailable ? 'Withheld' : pluginStatusLabel(status))}</b>
        <div class="plugin-card-actions">
          ${installed ? `<button class="btn" type="button" data-action="set-workspace-plugin" data-workspace-id="${h(workspaceId)}" data-plugin-id="${h(plugin.id)}" data-status="disabled" ${canManagePlugins ? '' : 'disabled'}><i class="ti ti-power"></i>Disable</button>` : ''}
          ${available || disabled ? `<button class="btn btn-primary" type="button" data-action="set-workspace-plugin" data-workspace-id="${h(workspaceId)}" data-plugin-id="${h(plugin.id)}" data-status="installed" ${canManagePlugins ? '' : 'disabled'}><i class="ti ti-download"></i>${disabled ? 'Re-enable' : 'Activate'}</button>` : ''}
          ${unavailable ? `<button class="btn" type="button" disabled><i class="ti ti-lock"></i>${entitlement === 'disabled' ? 'Turned off by Quest' : 'Not enabled yet'}</button>` : ''}
          ${comingSoon ? '<button class="btn" type="button" disabled><i class="ti ti-clock"></i>Coming soon</button>' : ''}
        </div>
      </article>
    `;
  }

  return { renderPluginsSettings };
}
