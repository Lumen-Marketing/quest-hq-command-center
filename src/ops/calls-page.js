// Moved out of main.js and fetched on demand: it is behind a click, and nothing that paints
// before the click needs it. The body is unchanged from where it lived.

export function createCallsPage(ctx) {
  const {
    CALLS_RANGE_OPTIONS,
    appHref, callsBoardMarkup, callsNotConnectedMarkup, callsRangeKey, companyPath, emptyState, ensureCallsData, h, timeAgo, state,
  } = ctx;

  function renderCallsPage(route, companyId) {
    const rangeKey = callsRangeKey(route);
    const key = `${companyId}|${rangeKey}`;
    ensureCallsData(companyId, rangeKey);

    const rows = state.callsStats.key === key ? state.callsStats.rows : [];
    const sync = state.callsStats.sync;
    const stale = Number(sync?.consecutive_failures || 0) >= 3;

    const tableMarkup = state.callsStats.unavailable
      ? callsNotConnectedMarkup()
      : rows.length
      ? `<table class="calls-table">
          <thead><tr><th>Name</th><th>Ext</th><th>Total calls</th><th>Calls &gt; 60s</th></tr></thead>
          <tbody>${rows.map((row) => `<tr>
            <td>${h(row.extension_name || 'Unknown')}</td>
            <td>${h(row.extension_number || '')}</td>
            <td>${Number(row.total_calls || 0)}</td>
            <td class="calls-conversations">${Number(row.conversations || 0)}</td>
          </tr>`).join('')}</tbody>
        </table>`
      : emptyState(`No calls in this range. If you expected to see your own, we couldn't match you to a RingCentral extension — ask your admin to check that your RingCentral email matches your Questbase login.`);

    return `
      <section class="calls-page">
        <div class="calls-head">
          <div>
            <h1>Calls</h1>
            <p class="muted">Who is on the phone right now, and how many real conversations each person is having.</p>
          </div>
          <p class="calls-sync${stale ? ' is-stale' : ''}">${sync?.last_sync_at ? `Synced ${h(timeAgo(sync.last_sync_at))}` : 'Not synced yet'}</p>
        </div>

        ${state.callsPresence.forbidden ? '' : `
        <section class="panel calls-live">
          <h2>Right now</h2>
          ${callsBoardMarkup()}
          <p class="calls-note">Durations are measured from when this dashboard first saw the status, so they are accurate to about 15 seconds.</p>
        </section>`}

        <section class="panel calls-conversations-panel">
          <div class="calls-panel-head">
            <h2>Calls over 60 seconds</h2>
            <nav class="calls-ranges">${CALLS_RANGE_OPTIONS.map(([rangeId, label]) =>
              `<a class="calls-range${rangeId === rangeKey ? ' is-active' : ''}" href="${appHref(companyPath('calls', { range: rangeId }, companyId))}" data-router>${h(label)}</a>`).join('')}</nav>
          </div>
          ${tableMarkup}
        </section>
      </section>`;
  }

  return { renderCallsPage };
}
