function clean(value) {
  return String(value ?? '').trim();
}

function roleCanEnterEveryWorkspace(role) {
  return ['owner', 'admin', 'developer'].includes(clean(role).toLowerCase());
}

// `position` is the order somebody dragged the rail into, so it outranks everything --
// including is_default, which used to pin the default workspace first and would otherwise
// leave one row that refuses to move.
//
// 0 means a row written before the column existed, or read back from an older cache. Those
// sort last on the old rules rather than all colliding at the front.
function workspaceSort(a, b) {
  const rank = (w) => (Number(w.position) > 0 ? Number(w.position) : Infinity);
  if (rank(a) !== rank(b)) return rank(a) - rank(b);
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

/**
 * Who is in ONE workspace: everybody with an active membership row, plus the company roles
 * that reach every workspace without needing one.
 *
 * This is allowedWorkspaces() read from the other end. That answers "which workspaces may
 * this person enter"; this answers "which people may enter this workspace". Both go through
 * roleCanEnterEveryWorkspace, so the two directions cannot disagree about an owner -- who
 * has no membership row for most workspaces and belongs to all of them.
 *
 * `inherited` is kept on the way out because the caller wants to say WHY somebody is here:
 * an owner listed with no explicit assignment otherwise looks like a bug.
 */
export function workspaceMembers({ workspaceId, memberships = [], users = [] }) {
  const target = clean(workspaceId);
  const explicit = new Set(memberships
    .filter((membership) => (
      clean(membership.workspace_id) === target
      && clean(membership.status || 'active').toLowerCase() === 'active'
    ))
    .map((membership) => clean(membership.profile_id))
    .filter(Boolean));

  return users
    .filter((user) => clean(user.status || 'active').toLowerCase() === 'active')
    .map((user) => ({ ...user, inherited: roleCanEnterEveryWorkspace(user.role) }))
    .filter((user) => user.inherited || explicit.has(clean(user.profile_id)));
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

/**
 * Is a plugin usable in this workspace?
 *
 * The default is opt-in per workspace: a company may be entitled to Finance and still not
 * want it in the Field workspace, so no row means not installed.
 *
 * `companyWide` inverts that for the plugins whose data has no workspace at all. Company
 * Records is one directory every workspace reads; requiring a row per workspace meant the
 * module vanished from every workspace nobody had explicitly installed it in -- which is the
 * exact opposite of what "shared by every workspace" is supposed to mean. An explicit
 * `disabled` row is still honoured, so it can be turned off deliberately.
 *
 * Deliberately a per-plugin flag rather than keying off COMPANY_SHARED: several plugins carry
 * that scope and are still legitimately chosen per workspace, and flipping their default
 * would silently switch them on where somebody had left them out.
 */
export function workspacePluginStatus({ workspaceId, pluginId, workspacePlugins = [], companyEntitled, companyWide = false }) {
  if (!companyEntitled) return 'available';
  const row = workspacePlugins.find((plugin) => (
    clean(plugin.workspace_id) === clean(workspaceId)
    && clean(plugin.plugin_id) === clean(pluginId)
  ));
  if (!row) return companyWide ? 'installed' : 'available';
  return clean(row.status).toLowerCase() === 'disabled' ? 'disabled' : 'installed';
}
