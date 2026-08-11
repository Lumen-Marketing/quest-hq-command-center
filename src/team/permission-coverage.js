// Two questions the product could not answer about a role, and could not answer about a
// person, until this existed.
//
//   1. Does this permission set make sense on its own?
//      26 of the 47 permission keys are useless without a `.view` sibling: `crm.manage`
//      without `crm.view`, `roles.manage` without `roles.view`. A live role holds
//      messages.send, messages.manage_groups AND messages.delete_own but not messages.view --
//      so it cannot open Messages at all, and nothing ever said so.
//
//   2. Does it match the workspaces this person is actually in?
//      A worker in one live workspace can open 7 of the 14 apps installed there. The other
//      seven are icons that lead nowhere. Owners never see this because they pass every check
//      by rank, which is why it survived every QA pass.
//
// Pure functions over data that is handed in, so both answers can be tested directly rather
// than inferred from a rendered string.

/**
 * The permission each key silently depends on.
 *
 * Derived, not hand-listed: anything that is not a `.view` needs the `.view` of its own group,
 * when the catalogue actually defines one. A hand-written table would drift the moment a
 * permission was added.
 */
export function buildPermissionDependencies(permissionKeys) {
  const keys = new Set(permissionKeys);
  const dependencies = new Map();
  for (const key of keys) {
    const [group, action] = [key.slice(0, key.indexOf('.')), key.slice(key.indexOf('.') + 1)];
    if (!group || !action || action === 'view') continue;
    const view = `${group}.view`;
    if (keys.has(view)) dependencies.set(key, view);
  }
  // Reading the team calendar still needs the calendar itself.
  if (keys.has('calendar.view_team') && keys.has('calendar.view')) {
    dependencies.set('calendar.view_team', 'calendar.view');
  }
  return dependencies;
}

/**
 * Permissions in this set that cannot do anything, because the one they rest on is missing.
 *
 * Returns [{ key, requires }], ordered by the granted key so the message is stable.
 */
export function unreachablePermissions(selected, dependencies) {
  const held = new Set(selected);
  const gaps = [];
  for (const key of [...held].sort()) {
    const requires = dependencies.get(key);
    if (requires && !held.has(requires)) gaps.push({ key, requires });
  }
  return gaps;
}

/**
 * Which of a workspace's installed apps a permission set can actually open.
 *
 * An app is openable when the role holds the gate of at least ONE of its modules -- opening
 * Reporting through Analytics alone is still opening Reporting. `plugins` maps a plugin id to
 * the permissions its modules gate on.
 */
export function appCoverage(installedPluginIds, permissionsByPlugin, selected) {
  const held = new Set(selected);
  const open = [];
  const closed = [];
  for (const pluginId of installedPluginIds) {
    const gates = permissionsByPlugin.get(pluginId) || [];
    // An app that gates on nothing is open to everyone in the workspace.
    if (!gates.length || gates.some((gate) => held.has(gate))) open.push(pluginId);
    else closed.push(pluginId);
  }
  return { open, closed, total: installedPluginIds.length };
}

export function coverageSummary(coverage) {
  if (!coverage.total) return '';
  if (!coverage.closed.length) return `Opens all ${coverage.total} apps here`;
  return `Opens ${coverage.open.length} of ${coverage.total} apps here`;
}
