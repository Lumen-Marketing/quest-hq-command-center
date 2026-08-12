// Dashboard, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createCompanyDashboard(ctx) {
  const {
    DASHBOARD_RANGE_OPTIONS, activeSession, appHref, canViewModule, companyMessageUnreadCount, companyName,
    companyPath, dashboardActivityItems, dashboardContext, dashboardRepOptions, dashboardVisibleRoleViews, dashboardWidgetLayout,
    dashboardWidgetRegistry, dayPart, emptyState, field, firstName, h,
    homeNextTasks, homeUnreadMessages, isLaunchHiddenDashboardWidget, moduleById, renderAvatar, renderCompanySwitch,
    renderDashboardWidgetCard, renderEmptyWorkspacePrompt, renderHomeActivity, renderHomeMessage, renderHomeNextTask, renderPilotLaunchChecklist,
    state,
  } = ctx;

  function renderCompanyDashboard(companyId) {
    const messagesModule = moduleById('messages');
    const showMessages = messagesModule && canViewModule(messagesModule, companyId);
    const unreadMessages = showMessages ? companyMessageUnreadCount(companyId) : 0;
    const recentActivity = dashboardActivityItems(companyId, 5);
    const roleViews = dashboardVisibleRoleViews(companyId);
    const role = roleViews.some(([id]) => id === state.dashboardRole) ? state.dashboardRole : roleViews[0]?.[0] || 'exec';
    state.dashboardRole = role;
    const ctx = dashboardContext(companyId);
    const registry = dashboardWidgetRegistry(companyId, ctx);
    const layout = dashboardWidgetLayout(companyId, role).filter((id) => registry[id] && !isLaunchHiddenDashboardWidget(registry[id]));
    const repOptions = dashboardRepOptions(companyId);
    if (!repOptions.some((rep) => rep.id === state.dashboardRep)) state.dashboardRep = 'all';
    const activeRep = repOptions.find((rep) => rep.id === state.dashboardRep) || repOptions[0];
    const activeRange = DASHBOARD_RANGE_OPTIONS.find(([id]) => id === state.dashboardRange) || DASHBOARD_RANGE_OPTIONS[1];

    return `
      <section class="home-cockpit dash">
        ${renderEmptyWorkspacePrompt(companyId)}
        <div class="home-hero">
          <div>
            <h1>Good ${h(dayPart())}, <span>${h(firstName(activeSession().profile.full_name) || 'Quest Admin')}</span></h1>
            <p>A complete operating overview of ${h(companyName(companyId) || 'your workspace')} today.</p>
          </div>
          <div class="home-hero-actions">
            ${renderCompanySwitch(companyId, 'home-company-switch')}
            <button class="icon-button" type="button" data-action="toggle-notifications" aria-label="Open notifications">
              <i class="ti ti-bell"></i>
              ${unreadMessages ? `<b>${h(String(Math.min(unreadMessages, 99)))}</b>` : ''}
            </button>
            ${renderAvatar(activeSession().profile, 'avatar')}
          </div>
        </div>

        ${renderPilotLaunchChecklist(companyId)}

        <section class="dash-commandbar">
          <div class="dash-role-tabs">
            ${roleViews.map(([id, label]) => `<button class="${role === id ? 'active' : ''}" type="button" data-action="dashboard-role" data-role="${id}">${h(label)}</button>`).join('')}
            ${state.dashboardCustomize ? `<button class="dash-manage-view" type="button" data-action="dashboard-manage-views"><i class="ti ti-settings"></i>Views</button>` : ''}
          </div>
          <div class="dash-command-actions">
            <button class="btn" type="button" data-action="dashboard-toggle-tray"><i class="ti ti-plus"></i>Add widget</button>
            <button class="btn ${state.dashboardCustomize ? 'btn-primary' : ''}" type="button" data-action="dashboard-toggle-customize"><i class="ti ti-pencil"></i>${state.dashboardCustomize ? 'Done' : 'Customize'}</button>
          </div>
        </section>

        <section class="dash-filter-bar">
          <div class="dash-filter-field">
            <label>Rep</label>
            <select data-dashboard-rep>
              ${repOptions.map((rep) => `<option value="${h(rep.id)}" ${rep.id === activeRep.id ? 'selected' : ''}>${h(rep.name)}</option>`).join('')}
            </select>
          </div>
          <div class="dash-filter-field dash-filter-range">
            <label>Range</label>
            <div class="dash-range-seg">
              ${DASHBOARD_RANGE_OPTIONS.map(([id, label]) => `<button class="${state.dashboardRange === id ? 'active' : ''}" type="button" data-action="dashboard-range" data-range="${id}">${h(label)}</button>`).join('')}
            </div>
          </div>
        </section>

        ${state.dashboardCustomize ? `
          <section class="dash-edit-banner">
            <i class="ti ti-layout-dashboard"></i>
            <div><b>Customizing ${h(activeRange[1].toLowerCase())} dashboard</b><span>Reorder cards, remove noise, or manage the visible views for this workspace.</span></div>
            <button class="btn" type="button" data-action="dashboard-reset-layout"><i class="ti ti-rotate"></i>Reset layout</button>
          </section>
        ` : ''}

        <section class="dash-widget-grid ${state.dashboardCustomize ? 'editing' : ''}">
          ${layout.map((id, index) => renderDashboardWidgetCard(registry[id], id, index, layout.length)).join('') || emptyState('No widgets in this dashboard view. Use Add widget to restore one.')}
        </section>

        <section class="dash-lists">
          <article class="panel home-activity-panel">
            <div class="section-head">
              <div><h2>Recent activity</h2><p>Latest company work and inbox events.</p></div>
              <button class="btn" type="button" data-action="open-dashboard-activity">All activity</button>
            </div>
            <div class="home-activity-list">
              ${recentActivity.map(renderHomeActivity).join('') || emptyState('No recent activity yet.')}
            </div>
          </article>
          <div class="dash-lists-right">
            <article class="panel home-next-panel">
              <div class="section-head">
                <div><h2>Next tasks</h2><p>Your cleanest path through today.</p></div>
                <a href="${appHref(companyPath('tasks', {}, companyId))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
              </div>
              <div class="home-next-list">
                ${homeNextTasks(companyId).map(renderHomeNextTask).join('') || emptyState('No open tasks.')}
              </div>
            </article>
            ${showMessages ? `<article class="panel home-message-panel">
              <div class="section-head">
                <div><h2>Unread messages</h2><p>Conversations needing attention.</p></div>
                <a href="${appHref(companyPath('messages', {}, companyId))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
              </div>
              <div class="home-message-list">
                ${homeUnreadMessages(companyId).map(renderHomeMessage).join('') || emptyState('No unread messages.')}
              </div>
            </article>` : ''}
          </div>
        </section>
      </section>
    `;
  }

  return { renderCompanyDashboard };
}
