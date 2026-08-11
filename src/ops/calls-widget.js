// Calls widget, fetched on first use.
//
// A factory, because every store, permission check and formatter it reads belongs to main.js.

export function createCallsWidget(ctx) {
  const {
    CALLS_WIDGET_RANGE_OPTIONS, appHref, callsBoardMarkup, callsNotConnectedMarkup, can, companyPath,
    dashboardMetricTile, ensureCallsData, ensureCallsPresencePolling, formatDate, h, state,
  } = ctx;

  function renderCallsWidget(companyId) {
    // The widget carries its own date filter (Today / Last 7 days / Last 30 days
    // / a custom From–To range) so the range can be changed here without leaving
    // the dashboard for the Calls page. The live "on a call now" tile stays
    // real-time via presence regardless of range.
    const widgetRange = state.callsWidgetRange || '7d';
    const custom = state.callsWidgetCustom || { from: '', to: '' };
    const customReady = widgetRange === 'custom' && Boolean(custom.from && custom.to);
    const customPending = widgetRange === 'custom' && !customReady;

    // Only a fully-picked custom range has a real key to fetch. While the user is
    // still choosing dates we skip the stats fetch but keep the live board going.
    const rangeKey = widgetRange === 'custom'
      ? (customReady ? `custom:${custom.from}|${custom.to}` : null)
      : widgetRange;

    const rangeLabel = widgetRange === 'custom'
      ? (customReady ? `${formatDate(`${custom.from}T00:00`)} – ${formatDate(`${custom.to}T00:00`)}` : 'Custom range')
      : ((CALLS_WIDGET_RANGE_OPTIONS.find(([id]) => id === widgetRange) || [])[1] || 'Last 7 days');

    if (rangeKey) ensureCallsData(companyId, rangeKey);
    else if (!state.callsPresence.forbidden && !state.callsPresence.notConnected) ensureCallsPresencePolling(companyId);

    if (state.callsStats.unavailable || state.callsPresence.notConnected) return callsNotConnectedMarkup();

    const rows = rangeKey && state.callsStats.key === `${companyId}|${rangeKey}` ? state.callsStats.rows : [];
    const onCall = state.callsPresence.agents.filter((agent) => agent.status === 'on_call').length;
    const available = state.callsPresence.agents.filter((agent) => agent.status === 'available').length;
    const conversations = rows.reduce((total, row) => total + Number(row.conversations || 0), 0);

    const ranked = rows
      .filter((row) => String(row.extension_name || '').trim())
      .slice()
      .sort((a, b) => Number(b.conversations || 0) - Number(a.conversations || 0));

    const noneLabel = widgetRange === 'custom' ? 'in this range' : rangeLabel.toLowerCase();
    const ranking = customPending
      ? `<p class="calls-empty">Pick a start and end date to see conversations.</p>`
      : ranked.length
      ? `<table class="calls-widget-rank"><tbody>${ranked.map((row) => `
          <tr>
            <td class="calls-rank-name">${h(row.extension_name)}</td>
            <td class="calls-rank-sub">${Number(row.total_calls || 0)} calls</td>
            <td class="calls-rank-conv"><b>${Number(row.conversations || 0)}</b> &gt; 60s</td>
          </tr>`).join('')}</tbody></table>`
      : `<p class="calls-empty">No calls over 60 seconds ${h(noneLabel)}.</p>`;

    const ranges = `<nav class="calls-widget-ranges">${CALLS_WIDGET_RANGE_OPTIONS.map(([id, label]) =>
      `<button class="calls-widget-range${id === widgetRange ? ' is-active' : ''}" type="button" data-action="calls-widget-range" data-range="${h(id)}">${h(label)}</button>`).join('')}</nav>`;

    const customPicker = widgetRange === 'custom'
      ? `<div class="calls-widget-custom">
          <label>From <input type="date" data-calls-widget-custom="from" value="${h(custom.from)}"${custom.to ? ` max="${h(custom.to)}"` : ''}></label>
          <label>To <input type="date" data-calls-widget-custom="to" value="${h(custom.to)}"${custom.from ? ` min="${h(custom.from)}"` : ''}></label>
        </div>`
      : '';

    return `
      <div class="calls-widget">
        <div class="calls-widget-filter">
          ${ranges}
          ${customPicker}
        </div>
        <section class="dash-kpis dash-widget-kpis">
          ${dashboardMetricTile('ti-phone', onCall, 'On a call now', `${available} available`)}
          ${dashboardMetricTile('ti-message', conversations, 'Calls > 60s', h(rangeLabel))}
        </section>
        <div class="calls-widget-rank-wrap">
          <div class="calls-widget-rank-head"><span>Who is having real conversations</span><span>${h(rangeLabel)}</span></div>
          ${ranking}
        </div>
        ${state.callsPresence.forbidden ? '' : `<div class="calls-widget-board">${callsBoardMarkup()}</div>`}
        <a class="calls-widget-link" href="${appHref(companyPath('calls', {}, companyId))}" data-router>Open Calls<i class="ti ti-arrow-right" aria-hidden="true"></i></a>
      </div>`;
  }

  return { renderCallsWidget };
}
