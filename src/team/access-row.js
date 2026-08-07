// One row of Settings > Users > Access, fetched on demand: the tab is two clicks in and
// nothing that paints before then needs it.
//
// A factory, because every role lookup, permission check and formatter belongs to main.js.

export function createAccessRow(ctx) {
  const {
    companyRoles, h, isLastActiveOwner, isPrimaryOwner, renderAvatar, roleIdForName, state, titleCase,
    workspaceMembershipForProfile,
    userDisplayMeta, userDisplayName,
  } = ctx;

  function renderUserAccessRow(companyId, user, canManageUsers) {
    const roles = companyRoles(companyId);
    const workspaces = state.operationalWorkspaces.filter((workspace) => workspace.company_id === companyId && workspace.status === 'active');
    const selectedRoleId = user.role_id || roleIdForName(companyId, user.role) || roles[0]?.id || '';
    // Two different powers. Changing WHO somebody is in the company -- their role and
    // status -- is refused for the main owner and for the last remaining owner. Assigning
    // WORKSPACES is not: an owner may still place the main owner in a workspace, and the
    // server allows it because nothing about the membership itself changes.
    const isMainOwner = !!user.profile_id && isPrimaryOwner(companyId, user.profile_id);
    const isLastOwner = !!user.profile_id && isLastActiveOwner(companyId, user.profile_id);
    const canEditUser = canManageUsers && !!user.profile_id && !isMainOwner && !isLastOwner;
    const canAssignWorkspaces = canManageUsers && !!user.profile_id;
    const implicitWorkspaceAccess = ['owner', 'admin', 'developer'].includes(String(user.role || '').toLowerCase());
    return `
      <article class="access-user-row ${user.status !== 'active' ? 'muted' : ''}">
        ${renderAvatar({ full_name: userDisplayName(user), email: user.email, avatar_url: user.avatar_url }, 'avatar')}
        <div class="access-user-main">
          <strong>${h(userDisplayName(user))}</strong>
          <span>${h(userDisplayMeta(user))} / ${h(titleCase(user.status))}</span>
          ${isMainOwner ? '<small class="access-note">Main owner of this company - their role and status cannot be changed.</small>'
    : isLastOwner ? '<small class="access-note">Last active Owner - promote another Owner before changing this access.</small>' : ''}
        </div>
        <form class="access-role-form" data-user-role-form>
          <input type="hidden" name="company_id" value="${h(companyId)}" />
          <input type="hidden" name="profile_id" value="${h(user.profile_id)}" />
          <select name="role_id" ${canEditUser ? '' : 'disabled'}>
            ${roles.map((role) => `<option value="${h(role.id)}" ${role.id === selectedRoleId ? 'selected' : ''}>${h(role.name)}</option>`).join('')}
          </select>
          <select name="membership_status" ${canEditUser ? '' : 'disabled'}>
            ${['active', 'pending', 'disabled', 'left'].map((status) => `<option value="${h(status)}" ${status === user.status ? 'selected' : ''}>${h(titleCase(status))}</option>`).join('')}
          </select>
          <div class="workspace-access-grid">
            <strong>Workspace assignments</strong>
            ${workspaces.map((workspace) => {
              const membership = workspaceMembershipForProfile(workspace.id, user.profile_id);
              const enabled = implicitWorkspaceAccess || membership?.status === 'active';
              const workspaceRoleId = membership?.role_id || selectedRoleId;
              // Two different decisions, and they were sharing one flag. Whether somebody is
              // IN a workspace is inherited from an owner/admin/developer company role and
              // cannot be revoked here -- so the checkbox stays locked. What role they hold
              // INSIDE that workspace is a separate choice, and locking it meant an owner
              // could never be given a different role in one workspace.
              const membershipEditable = canAssignWorkspaces && !implicitWorkspaceAccess;
              const workspaceRoleEditable = canAssignWorkspaces;
              return `
                <label class="workspace-access-assignment" data-workspace-assignment>
                  <input type="checkbox" name="workspace_ids" value="${h(workspace.id)}" ${enabled ? 'checked' : ''} ${membershipEditable ? '' : 'disabled'} />
                  ${implicitWorkspaceAccess && enabled ? `<input type="hidden" name="workspace_ids" value="${h(workspace.id)}" />` : ''}
                  <span><b>${h(workspace.name)}</b><small>${h(implicitWorkspaceAccess ? 'Inherited from company role' : workspace.is_default ? 'Default workspace' : 'Explicit assignment')}</small></span>
                  <select name="workspace_role:${h(workspace.id)}" aria-label="${h(workspace.name)} role" ${workspaceRoleEditable ? '' : 'disabled'}>
                    ${roles.map((role) => `<option value="${h(role.id)}" ${role.id === workspaceRoleId ? 'selected' : ''}>${h(role.name)}</option>`).join('')}
                  </select>
                </label>
              `;
            }).join('') || '<span class="form-note">No active workspaces are available.</span>'}
          </div>
          <button class="btn" type="submit" ${canAssignWorkspaces ? '' : 'disabled'}>Save role &amp; workspaces</button>
        </form>
      </article>
    `;
  }

  return { renderUserAccessRow };
}
