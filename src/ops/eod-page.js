// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

export function createEodPage(ctx) {
  const {
    activeSession, can, companyEodReports, companyName, loadEodModule, render, state, eodBody,
  } = ctx;

  function renderEodPage(route, companyId) {
    // A stale editing id would silently reopen an old report the next time the page loads.
    if (state.eodEditingId && !companyEodReports(companyId).some((row) => row.id === state.eodEditingId)) {
      state.eodEditingId = '';
    }
    const body = eodBody();
    if (!body) {
      loadEodModule().then(() => render()).catch(() => null);
      return `<section class="tool-page eod-page"><div class="workspace-head"><div><h1>EOD reports</h1><p>Loading...</p></div></div></section>`;
    }
    return body.renderEodPage({
      companyLabel: companyName(companyId),
      rows: companyEodReports(companyId),
      canManage: can('eod.manage', companyId),
      editingId: state.eodEditingId,
      profileId: activeSession().profile.id,
      h,
      metricCard,
      emptyState,
      titleCase,
    });
  }

  return { renderEodPage };
}
