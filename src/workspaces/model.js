function clean(value) {
  return String(value ?? '').trim();
}

function roleCanEnterEveryWorkspace(role) {
  return ['owner', 'admin', 'developer'].includes(clean(role).toLowerCase());
}

function workspaceSort(a, b) {
  if (!!a.is_default !== !!b.is_default) return a.is_default ? -1 : 1;
  return clean(a.name).localeCompare(clean(b.name)) || clean(a.id).localeCompare(clean(b.id));
}

export function allowedWorkspaces({ companyId, workspaces = [], memberships = [], profileId, companyRole }) {
  const targetCompany = clean(companyId);
  const targetProfile = clean(profileId);
  const active = workspaces.filter((workspace) => (
    clean(workspace.company_id) === targetCompany
    && clean(workspace.status || 'active').toLowerCase() === 'active'
  ));

  if (roleCanEnterEveryWorkspace(companyRole)) return active.slice().sort(workspaceSort);

  const allowedIds = new Set(memberships
    .filter((membership) => (
      clean(membership.profile_id) === targetProfile
      && clean(membership.status || 'active').toLowerCase() === 'active'
    ))
    .map((membership) => clean(membership.workspace_id))
    .filter(Boolean));

  return active.filter((workspace) => allowedIds.has(clean(workspace.id))).sort(workspaceSort);
}

export function workspaceForRoute({
  companyId,
  workspaceParam,
  storedWorkspaceId,
  workspaces = [],
  memberships = [],
  profileId,
  companyRole,
}) {
  const allowed = allowedWorkspaces({ companyId, workspaces, memberships, profileId, companyRole });
  const requested = clean(workspaceParam);
  const stored = clean(storedWorkspaceId);
  const match = (candidate) => allowed.find((workspace) => (
    clean(workspace.id) === candidate || clean(workspace.slug).toLowerCase() === candidate.toLowerCase()
  ));
  return match(requested) || match(stored) || allowed.find((workspace) => workspace.is_default) || allowed[0] || null;
}

export function recordBelongsToWorkspace(record, workspaceId, defaultWorkspaceId = '') {
  const target = clean(workspaceId);
  if (!target) return false;
  const recordWorkspace = clean(record?.workspace_id);
  return recordWorkspace ? recordWorkspace === target : target === clean(defaultWorkspaceId);
}

export function workspacePluginStatus({ workspaceId, pluginId, workspacePlugins = [], companyEntitled }) {
  if (!companyEntitled) return 'available';
  const row = workspacePlugins.find((plugin) => (
    clean(plugin.workspace_id) === clean(workspaceId)
    && clean(plugin.plugin_id) === clean(pluginId)
  ));
  if (!row) return 'available';
  return clean(row.status).toLowerCase() === 'disabled' ? 'disabled' : 'installed';
}
