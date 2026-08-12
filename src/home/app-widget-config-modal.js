// Widget settings, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createAppWidgetConfigModal(ctx) {
  const {
    app, dashboardAppMultiBody, dashboardAppMultiConfig, dashboardAppMultiEligible, dashboardAppReportOptions, dashboardAppResolvedMultiFields,
    dashboardAppResolvedReport, dashboardAppWidgetBody, dashboardAppWidgetConfig, dashboardEmptyNote, dashboardFindApp, field,
    h, number, renderModalShell, state,
  } = ctx;

  function renderDashboardAppWidgetConfigModal(companyId) {
    const appId = state.dashboardConfigAppId || '';
    const found = dashboardFindApp(companyId, appId);
    if (!found) {
      return renderModalShell('Widget report', 'App unavailable', `
        <p class="wb-sub">This app is no longer available.</p>
        <div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Close</button></div>
      `, 'dashboard-app-widget-modal');
    }
    const { app } = found;
    if (state.dashboardConfigMulti) {
      const cfg = dashboardAppMultiConfig(companyId, appId);
      const selected = dashboardAppResolvedMultiFields(app, cfg);
      const eligible = dashboardAppMultiEligible(app);
      const picker = eligible.length ? `
        <div class="dash-report-picker">
          ${eligible.map((f) => {
            const on = selected.includes(f.id);
            const kind = (f.type === 'status' || f.type === 'category') ? 'Breakdown by option' : 'Sum across records';
            return `
              <button type="button" class="dash-report-opt dash-report-check ${on ? 'active' : ''}" data-action="dashboard-app-widget-field" data-widget-app="${h(appId)}" data-field="${h(f.id)}">
                <span class="dro-check"><i class="ti ti-check"></i></span>
                <span class="dro-text"><b>${h(f.label)}</b><small>${h(kind)}</small></span>
              </button>`;
          }).join('')}
        </div>` : '<p class="wb-sub">This app has no status, category, or numeric fields to report on yet.</p>';
      return renderModalShell('Widget fields', `${app.name} — fields`, `
        <div class="dash-modal-summary">
          <div><b>Which fields should this widget show?</b><span>Pick any number — each appears as its own mini report on the ${h(app.name)} card.</span></div>
        </div>
        ${picker}
        <div class="dash-report-preview">
          <div class="dro-preview-label">Live preview</div>
          <article class="panel dash-widget-card"><div class="dash-widget-body">${app.items.length ? dashboardAppMultiBody(app, selected) : dashboardEmptyNote('No records yet — add records to see these reports.')}</div></article>
        </div>
      `, 'dashboard-app-widget-modal');
    }
    const cfg = dashboardAppWidgetConfig(companyId, appId);
    const current = dashboardAppResolvedReport(app, cfg);
    const options = dashboardAppReportOptions(app);
    return renderModalShell('Widget report', `${app.name} widget`, `
      <div class="dash-modal-summary">
        <div><b>What should this widget show?</b><span>Pick the report displayed on the ${h(app.name)} dashboard card.</span></div>
      </div>
      <div class="dash-report-picker">
        ${options.map((o) => `
          <button type="button" class="dash-report-opt ${o.id === current ? 'active' : ''}" data-action="dashboard-app-widget-report" data-widget-app="${h(appId)}" data-report="${h(o.id)}">
            <span class="dro-check"><i class="ti ti-check"></i></span>
            <span class="dro-text"><b>${h(o.label)}</b><small>${h(o.hint)}</small></span>
          </button>`).join('')}
      </div>
      <div class="dash-report-preview">
        <div class="dro-preview-label">Live preview</div>
        <article class="panel dash-widget-card"><div class="dash-widget-body">${app.items.length ? dashboardAppWidgetBody(app, current) : dashboardEmptyNote('No records yet — add records to see this report.')}</div></article>
      </div>
    `, 'dashboard-app-widget-modal');
  }

  return { renderDashboardAppWidgetConfigModal };
}
