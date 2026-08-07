// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

// h, metricCard, emptyState and titleCase are handed straight through to the inner page.
// They were used below without ever being received -- a ReferenceError the moment this
// rendered, and because the screen is fetched behind a "Loading..." placeholder the throw
// simply left that placeholder on screen.
export function createEodPage(ctx) {
  const {
    activeSession, can, companyEodReports, companyName, loadEodModule, render, state, eodBody,
    h, metricCard, emptyState, titleCase,
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
