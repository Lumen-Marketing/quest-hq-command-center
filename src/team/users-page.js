// Users, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createUsersPage(ctx) {
  const {
    CONFIG, appHref, can, compactTabs, companyAccessUsers, companyInvites,
    companyPath, companyRoles, contractRows, emptyState, h, metricCard,
    renderAvatar, renderInviteRow, renderJoinRequestRow, renderUserAccessRow, roleForCompany, state,
    titleCase, userDisplayMeta, userDisplayName, workspaceAccessSummaryForUser, workspaceHeader,
  } = ctx;

  function renderUsersPage(route, companyId) {
    const users = companyAccessUsers(companyId);
    const tab = ['members', 'access', 'invites'].includes(route.params.get('tab')) ? route.params.get('tab') : 'members';
    const pendingRequests = state.joinRequests.filter((item) => item.company_id === companyId && item.status === 'pending');
    const canManageUsers = can('users.manage', companyId);
    const activeUsers = users.filter((user) => user.status === 'active');
    const inactiveUsers = users.filter((user) => user.status !== 'active');
    return `
      ${workspaceHeader('Users', 'Company members, roles, workers, and access context.', `
        <button class="btn btn-primary" type="button" data-action="open-invite-form" ${canManageUsers ? '' : 'disabled'}><i class="ti ti-user-plus"></i>Invite user</button>
        <a class="btn" href="${appHref(companyPath('settings', { tab: 'roles' }, companyId))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
        <a class="btn" href="${appHref(companyPath('settings', { tab: 'access' }, companyId))}" data-router><i class="ti ti-settings"></i>Access settings</a>
      `)}
      ${compactTabs('Users sections', [
        [companyPath('users', { tab: 'members' }, companyId), 'Members', tab === 'members'],
        [companyPath('users', { tab: 'access' }, companyId), 'Access', tab === 'access'],
        // Counted in the label: an invitation nobody has accepted and a request nobody has
        // answered are both things waiting on someone here, and a tab you have to open to
        // discover that is a tab you forget to open.
        [companyPath('users', { tab: 'invites' }, companyId), `Invites${companyInvites(companyId).length + pendingRequests.length ? ` (${companyInvites(companyId).length + pendingRequests.length})` : ''}`, tab === 'invites'],
      ])}
      ${tab === 'members' ? `
        <section class="metric-grid operations-metrics">
          ${metricCard('Active users', activeUsers.length)}
          ${metricCard('Pending', users.filter((user) => user.status === 'pending').length + pendingRequests.length)}
          ${metricCard('Disabled/left', inactiveUsers.filter((user) => user.status !== 'pending').length)}
          ${metricCard('Roles', companyRoles(companyId).length)}
        </section>
        <section class="users-grid">
          ${users.map((user) => `
            <article class="user-card ${user.status !== 'active' ? 'muted' : ''}">
              ${renderAvatar({ full_name: userDisplayName(user), email: user.email, avatar_url: user.avatar_url }, 'avatar')}
              <div>
                <strong>${h(userDisplayName(user))}</strong>
                <span>${h(userDisplayMeta(user))}</span>
                <small>${h(user.role_label)} / ${h(titleCase(user.status))}</small>
                <small>${h(workspaceAccessSummaryForUser(companyId, user))}</small>
              </div>
            </article>
          `).join('') || emptyState('No users assigned to this company yet.')}
        </section>
      ` : tab === 'invites' ? `
        <!-- Getting someone in: an invitation goes out, or a request comes in. Two halves of
             one job, which is why they share a tab rather than sitting under Access -- that
             one is about people who are already here. -->
        <section class="dashboard-grid compact-settings-grid">
          <article class="panel span-2">
            <div class="section-head">
              <div><h2>Invites</h2><p>Copy a secure invite code or link for a specific email address.</p></div>
              <button class="btn btn-primary" type="button" data-action="open-invite-form" ${canManageUsers ? '' : 'disabled'}><i class="ti ti-user-plus"></i>Invite</button>
            </div>
            <div class="access-invite-list">
              ${companyInvites(companyId).map((invite) => renderInviteRow(invite, canManageUsers)).join('') || emptyState('No pending invites.')}
            </div>
          </article>
          <article class="panel span-2">
            <div class="section-head"><div><h2>Join requests</h2><p>Approve requests into this company workspace or reject them.</p></div></div>
            <div class="access-request-list">
              ${pendingRequests.map((request) => renderJoinRequestRow(request, canManageUsers)).join('') || emptyState('No pending join requests.')}
            </div>
          </article>
        </section>
      ` : `
      <section class="dashboard-grid compact-settings-grid">
        <article class="panel span-2">
          <div class="section-head">
            <div><h2>Member access</h2><p>Assign roles and confirm each user's company status.</p></div>
          </div>
          <div class="access-user-list">
            ${users.map((user) => renderUserAccessRow(companyId, user, canManageUsers)).join('') || emptyState('No users assigned to this company yet.')}
          </div>
        </article>
        <article class="panel span-2">
          <div class="section-head"><div><h2>Access model</h2><p>Membership is company-scoped; UI hiding is convenience, RLS is the real privacy layer.</p></div></div>
          ${contractRows([
            ['Tenant key', 'company_id on jobs, tasks, files, forms, users, settings'],
            ['Privacy status', CONFIG.questAuthEnabled ? 'Supabase Auth + RLS' : 'Client-filtered demo only'],
            ['Your role', roleForCompany(companyId)],
            ['Can manage users', canManageUsers ? 'Yes' : 'No'],
          ])}
        </article>
      </section>
      `}
    `;
  }

  return { renderUsersPage };
}
