// Users, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

import * as memberDirectory from './member-directory.js';
import { PEOPLE_ACCESS_TABS, normalizeSettingsSurfaceTab } from '../settings/navigation-model.js';

export function createUsersPage(ctx) {
  const {
    CONFIG, appHref, can, compactTabs, companyAccessUsers, companyInvites,
    companyPath, companyRoles, contractRows, emptyState, h, isProtectedOwner, metricCard,
    renderAvatar, renderInviteRow, renderJoinRequestRow, renderRolesSettings, renderUserAccessRow, roleForCompany, state,
    titleCase, userDisplayMeta, userDisplayName, workspaceAccessSummaryForUser, workspaceHeader,
  } = ctx;

  // The state these controls read. Kept on state rather than in the DOM so a re-render --
  // which every save causes -- does not throw the filter away mid-task.
  function ui() {
    state.memberDirectory = state.memberDirectory || { view: 'list', query: '', role: '', sort: 'name', selected: new Set(), expanded: new Set() };
    if (!(state.memberDirectory.selected instanceof Set)) state.memberDirectory.selected = new Set();
    // Which member rows are open. Same reason as the filter above: a save re-renders the page.
    if (!(state.memberDirectory.expanded instanceof Set)) state.memberDirectory.expanded = new Set();
    return state.memberDirectory;
  }

  function visibleMembers(users) {
    const d = ui();
    return memberDirectory.filterSortMembers({ users, query: d.query, role: d.role, sort: d.sort });
  }

  function memberDirectoryToolbar(companyId, users, canManageUsers) {
    const d = ui();
    const shown = visibleMembers(users);
    const roles = memberDirectory.memberRoleOptions(users);
    const { eligible, blocked } = memberDirectory.assignableSelection({
      selected: d.selected,
      visible: shown,
      isProtected: (user) => isProtectedOwner(companyId, user),
    });
    const view = (id, icon, label) => `<button class="btn btn-sm ${d.view === id ? 'btn-primary' : ''}" type="button" data-member-view="${h(id)}" aria-pressed="${d.view === id}" title="${h(label)}"><i class="ti ${icon}"></i>${h(label)}</button>`;

    return `
      <div class="member-toolbar">
        <div class="member-search">
          <i class="ti ti-search" aria-hidden="true"></i>
          <input class="wb-input" type="search" data-member-search value="${h(d.query)}" placeholder="Search name, email or role" aria-label="Search members" />
        </div>
        <label class="member-filter"><span>Role</span>
          <select data-member-role aria-label="Filter by role">
            <option value="">All roles (${users.length})</option>
            ${roles.map((role) => `<option value="${h(role.label)}" ${d.role.toLowerCase() === role.key ? 'selected' : ''}>${h(role.label)} (${role.count})</option>`).join('')}
          </select>
        </label>
        <label class="member-filter"><span>Sort</span>
          <select data-member-sort aria-label="Sort members">
            ${[['name', 'Name'], ['role', 'Role'], ['status', 'Status']].map(([id, label]) => `<option value="${id}" ${d.sort === id ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        <div class="member-views" role="group" aria-label="View">
          ${view('list', 'ti-list', 'List')}${view('cards', 'ti-layout-grid', 'Cards')}${view('tags', 'ti-tag', 'Tags')}
        </div>
      </div>
      ${shown.length !== users.length ? `<p class="member-count">${shown.length} of ${users.length} members</p>` : ''}
      ${canManageUsers ? `
        <div class="member-bulk${d.selected.size ? ' on' : ''}">
          <label class="member-check">
            <input type="checkbox" data-member-all ${shown.length && shown.every((u) => d.selected.has(u.profile_id)) ? 'checked' : ''} />
            <span>${d.selected.size ? `${d.selected.size} selected` : 'Select all'}</span>
          </label>
          ${d.selected.size ? `
            <select data-member-bulk-role aria-label="Role to assign">
              <option value="">Assign role…</option>
              ${companyRoles(companyId).map((role) => `<option value="${h(role.id)}">${h(role.name)}</option>`).join('')}
            </select>
            <button class="btn btn-sm btn-primary" type="button" data-member-bulk-apply ${eligible.length ? '' : 'disabled'}><i class="ti ti-check"></i>Apply to ${eligible.length}</button>
            <button class="btn btn-sm" type="button" data-member-clear>Clear</button>
            ${blocked.length ? `<span class="form-note">${blocked.length} skipped — the main owner cannot be reassigned.</span>` : ''}
          ` : ''}
        </div>` : ''}
    `;
  }

  function memberDirectoryBody(companyId, users, canManageUsers) {
    const d = ui();
    const shown = visibleMembers(users);
    if (!users.length) return emptyState('No users assigned to this company yet.');
    if (!shown.length) return emptyState('No members match that search.');

    const box = (user) => (canManageUsers && user.profile_id
      ? `<label class="member-check member-pick"><input type="checkbox" data-member-pick="${h(user.profile_id)}" ${d.selected.has(user.profile_id) ? 'checked' : ''} aria-label="Select ${h(userDisplayName(user))}" /></label>`
      : '');

    // Tags and cards are summaries: they say who somebody is and let you select them, and
    // send you to List to change anything. Repeating the full role/workspace form in three
    // shapes would be three places for the same save to go wrong.
    if (d.view === 'tags') {
      return `<div class="member-tags">${shown.map((user) => `
        <span class="member-tag ${d.selected.has(user.profile_id) ? 'on' : ''}">
          ${box(user)}${renderAvatar(user, 'avatar member-tag-avatar')}
          <b>${h(userDisplayName(user))}</b><em>${h(user.role_label || titleCase(user.role || 'Member'))}</em>
        </span>`).join('')}</div>`;
    }
    if (d.view === 'cards') {
      return `<div class="member-cards">${shown.map((user) => `
        <article class="member-card ${d.selected.has(user.profile_id) ? 'on' : ''}">
          <div class="member-card-head">${box(user)}${renderAvatar(user, 'avatar member-card-avatar')}
            <div><b>${h(userDisplayName(user))}</b><span>${h(user.email || '')}</span></div>
          </div>
          <div class="member-card-meta">
            <span class="member-role-chip">${h(user.role_label || titleCase(user.role || 'Member'))}</span>
            <span class="member-status is-${h(user.status || 'active')}">${h(titleCase(user.status || 'active'))}</span>
          </div>
          <div class="member-card-ws">${h(workspaceAccessSummaryForUser(companyId, user))}</div>
        </article>`).join('')}</div>`;
    }
    return `<div class="access-user-list">${shown.map((user) => `
      <div class="member-row">${box(user)}<div class="member-row-body">${renderUserAccessRow(companyId, user, canManageUsers)}</div></div>`).join('')}</div>`;
  }

  function renderUsersPage(route, companyId) {
    const users = companyAccessUsers(companyId);
    const tab = normalizeSettingsSurfaceTab('people', route.params.get('tab'));
    const pendingRequests = state.joinRequests.filter((item) => item.company_id === companyId && item.status === 'pending');
    const canManageUsers = can('users.manage', companyId);
    const activeUsers = users.filter((user) => user.status === 'active');
    const inactiveUsers = users.filter((user) => user.status !== 'active');
    return `
      ${workspaceHeader('People & Access', 'Members, roles, invitations, and company access in one place.', `
        <button class="btn btn-primary" type="button" data-action="open-invite-form" ${canManageUsers ? '' : 'disabled'}><i class="ti ti-user-plus"></i>Invite user</button>
      `)}
      ${compactTabs('People and access sections', PEOPLE_ACCESS_TABS.map(({ id, label }) => [
        companyPath('users', { tab: id }, companyId),
        id === 'invites' && companyInvites(companyId).length + pendingRequests.length
          ? `${label} (${companyInvites(companyId).length + pendingRequests.length})`
          : label,
        tab === id,
      ]))}
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
      ` : tab === 'roles' ? `
        <section class="dashboard-grid compact-settings-grid people-roles-surface">
          ${renderRolesSettings(companyId)}
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
          ${memberDirectoryToolbar(companyId, users, canManageUsers)}
          ${memberDirectoryBody(companyId, users, canManageUsers)}
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
