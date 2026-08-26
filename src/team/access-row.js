// One row of Settings > Users > Access, fetched on demand: the tab is two clicks in and
// nothing that paints before then needs it.
//
// A factory, because every role lookup, permission check and formatter belongs to main.js.

export function createAccessRow(ctx) {
  const {
    companyRoles, h, isLastActiveOwner, isPrimaryOwner, renderAvatar, roleIdForName, state, titleCase,
    workspaceMembershipForProfile,
    userDisplayMeta, userDisplayName,
    MEMBERSHIP_STATUS_OPTIONS, membershipStatusLabel,
    workspaceAppCoverage,
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

    // A dozen members meant a dozen open role/status/workspace forms stacked down the page,
    // every one of them the same five selects, so reaching anybody meant scrolling past
    // everybody. Identity stays on screen; the controls open on click.
    //
    // Which rows are open lives on state, not in the DOM: saving re-renders the page, and an
    // open/closed flag held on the element would be thrown away every time somebody saved.
    // Keyed by profile id, falling back to email for a membership that has no profile yet.
    const toggleKey = user.profile_id || user.email || '';
    const expandedIds = state.memberDirectory?.expanded;
    const isOpen = !toggleKey || (expandedIds instanceof Set && expandedIds.has(toggleKey));
    const domId = `access-user-${String(toggleKey).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

    // One line, so a shut row is a list row. Everything somebody scans a member list for --
    // who, whether they are active, what they are, and how much they reach -- reads left to
    // right without opening anything.
    const assignedCount = workspaces.filter((workspace) => implicitWorkspaceAccess
      || workspaceMembershipForProfile(workspace.id, user.profile_id)?.status === 'active').length;
    const roleLabel = roles.find((role) => role.id === selectedRoleId)?.name
      || user.role_label || titleCase(user.role || 'Member');
    const meta = [
      userDisplayMeta(user),
      membershipStatusLabel(user.status),
      roleLabel,
      workspaces.length ? `${assignedCount} of ${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'}` : '',
    ].filter(Boolean).join(' · ');

    // The notices explain why the CONTROLS below are restricted, so they belong with the
    // controls. On the shut row they were three lines of prose on top of a list entry, which
    // is what stopped it reading as a list at all.
    const notes = `${isMainOwner ? '<small class="access-note">Main owner of this company - their role and status cannot be changed.</small>'
    : isLastOwner ? '<small class="access-note">Last active Owner - promote another Owner before changing this access.</small>' : ''}`
      + `${user.status === 'disabled' ? '<small class="access-note">Suspended. They keep their account and everything they did, and can reach nothing here until they are set back to Active.</small>' : ''}`;

    const identity = `
          <strong>${h(userDisplayName(user))}</strong>
          <span>${h(meta)}</span>`;

    return `
      <article class="access-user-row ${user.status !== 'active' ? 'muted' : ''} ${isOpen ? 'is-open' : ''}">
        ${renderAvatar({ full_name: userDisplayName(user), email: user.email, avatar_url: user.avatar_url }, 'avatar')}
        ${toggleKey ? `
        <button class="access-user-main" type="button" data-member-expand="${h(toggleKey)}"
          aria-expanded="${isOpen ? 'true' : 'false'}" aria-controls="${h(domId)}-notes ${h(domId)}-form ${h(domId)}-actions">
          ${identity}
          <i class="ti ti-chevron-down access-user-caret" aria-hidden="true"></i>
        </button>` : `<div class="access-user-main">${identity}</div>`}
        <div class="access-user-notes" id="${h(domId)}-notes">${notes}</div>
        <form class="access-role-form" id="${h(domId)}-form" data-user-role-form>
          <input type="hidden" name="company_id" value="${h(companyId)}" />
          <input type="hidden" name="profile_id" value="${h(user.profile_id)}" />
          <select name="role_id" ${canEditUser ? '' : 'disabled'}>
            ${roles.map((role) => `<option value="${h(role.id)}" ${role.id === selectedRoleId ? 'selected' : ''}>${h(role.name)}</option>`).join('')}
          </select>
          <select name="membership_status" ${canEditUser ? '' : 'disabled'}>
            ${MEMBERSHIP_STATUS_OPTIONS.map(([status, label]) => `<option value="${h(status)}" ${status === user.status ? 'selected' : ''}>${h(label)}</option>`).join('')}
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
                  ${(() => {
    // What this person can actually OPEN in this workspace. A seat that reaches half the
    // apps installed there looks identical to a working one until somebody signs in: a live
    // worker could open 7 of 14, and nothing anywhere said so.
    const coverage = enabled ? workspaceAppCoverage(companyId, workspace.id, user.profile_id) : null;
    const note = implicitWorkspaceAccess ? 'Inherited from company role'
      : workspace.is_default ? 'Default workspace' : 'Explicit assignment';
    return `<span><b>${h(workspace.name)}</b><small>${h(note)}</small>${coverage?.summary
      ? `<small class="workspace-access-coverage ${coverage.closed.length ? 'is-partial' : ''}" title="${h(coverage.closed.length ? `Cannot open: ${coverage.closed.join(', ')}` : '')}">${h(coverage.summary)}</small>`
      : ''}</span>`;
  })()}
                  <select name="workspace_role:${h(workspace.id)}" aria-label="${h(workspace.name)} role" ${workspaceRoleEditable ? '' : 'disabled'}>
                    ${roles.map((role) => `<option value="${h(role.id)}" ${role.id === workspaceRoleId ? 'selected' : ''}>${h(role.name)}</option>`).join('')}
                  </select>
                </label>
              `;
            }).join('') || '<span class="form-note">No active workspaces are available.</span>'}
          </div>
          <button class="btn" type="submit" ${canAssignWorkspaces ? '' : 'disabled'}>Save role &amp; workspaces</button>
        </form>
        <div class="access-user-danger" id="${h(domId)}-actions">
          ${user.status === 'disabled' ? `
            <button class="btn" type="button" data-action="reactivate-company-member" data-company-id="${h(companyId)}" data-profile-id="${h(user.profile_id)}" ${canEditUser ? '' : 'disabled'}>
              <i class="ti ti-player-play"></i>Reactivate
            </button>
          ` : `
            <button class="btn" type="button" data-action="suspend-company-member" data-company-id="${h(companyId)}" data-profile-id="${h(user.profile_id)}" ${canEditUser ? '' : 'disabled'}>
              <i class="ti ti-player-pause"></i>Suspend
            </button>
          `}
          <button class="btn danger" type="button" data-action="remove-company-member" data-company-id="${h(companyId)}" data-profile-id="${h(user.profile_id)}" ${canEditUser ? '' : 'disabled'}>
            <i class="ti ti-user-minus"></i>Remove
          </button>
        </div>
      </article>
    `;
  }

  return { renderUserAccessRow };
}
