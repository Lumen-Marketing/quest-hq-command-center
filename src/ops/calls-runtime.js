const CALLS_RANGE_OPTIONS = [
  ['today', 'Today'],
  ['7d', 'Last 7 days'],
  ['30d', 'Last 30 days'],
];
const CALLS_WIDGET_RANGE_OPTIONS = [...CALLS_RANGE_OPTIONS, ['custom', 'Custom']];
const CALLS_STATUS_LABELS = {
  on_call: 'On call',
  ringing: 'Ringing',
  dnd: 'Do not disturb',
  offline: 'Offline',
  busy: 'Busy',
  available: 'Available',
};
const CALLS_PRESENCE_POLL_MS = 15000;

export function createCallsRuntime(ctx) {
  const {
    activeCompanyId,
    activeSession,
    createSupabaseClient,
    emptyState,
    h,
    render,
    state,
  } = ctx;
  const fetchImpl = ctx.fetchImpl || globalThis.fetch;
  const documentRef = ctx.documentRef || globalThis.document;
  const queueMicrotaskImpl = ctx.queueMicrotaskImpl || globalThis.queueMicrotask;
  const setIntervalImpl = ctx.setIntervalImpl || globalThis.setInterval;
  const clearIntervalImpl = ctx.clearIntervalImpl || globalThis.clearInterval;

  let callsPresenceTimer = null;
  let callsVisibilityBound = false;

  function callsRangeKey(route) {
    const requested = String(route?.params?.get?.('range') || 'today');
    return CALLS_RANGE_OPTIONS.some(([key]) => key === requested) ? requested : 'today';
  }

  function callsRangeBounds(rangeKey) {
    if (typeof rangeKey === 'string' && rangeKey.startsWith('custom:')) {
      const [fromStr, toStr] = rangeKey.slice(7).split('|');
      const from = new Date(`${fromStr}T00:00:00`);
      const to = new Date(`${toStr}T23:59:59.999`);
      return { from: from.toISOString(), to: to.toISOString() };
    }
    const to = new Date();
    const from = new Date(to);
    if (rangeKey === '7d') from.setDate(from.getDate() - 7);
    else if (rangeKey === '30d') from.setDate(from.getDate() - 30);
    else from.setHours(0, 0, 0, 0);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  function callsDurationLabel(sinceIso) {
    const started = new Date(sinceIso).getTime();
    if (!Number.isFinite(started)) return '—';
    const seconds = Math.max(0, Math.floor((Date.now() - started) / 1000));
    const pad = (value) => String(value).padStart(2, '0');
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours ? `${hours}:${pad(minutes)}:${pad(seconds % 60)}` : `${minutes}:${pad(seconds % 60)}`;
  }

  function callsSurfaceVisible() {
    return state.route?.section === 'calls' || state.route?.section === 'dashboard';
  }

  function repaintVisibleSurface() {
    if (callsSurfaceVisible()) render();
  }

  async function loadCallsStats(companyId, rangeKey) {
    const key = `${companyId}|${rangeKey}`;
    const client = createSupabaseClient();
    if (!client) {
      state.callsStats = { key, rows: [], sync: null, unavailable: true };
      repaintVisibleSurface();
      return;
    }

    const bounds = callsRangeBounds(rangeKey);
    const [stats, sync] = await Promise.all([
      client.rpc('ringcentral_conversation_stats', { p_company_id: companyId, p_from: bounds.from, p_to: bounds.to }),
      client.from('ringcentral_sync_state').select('last_sync_at,consecutive_failures').eq('company_id', companyId).maybeSingle(),
    ]);
    state.callsStats = {
      key,
      rows: stats.error ? [] : (stats.data || []),
      sync: sync.error ? null : sync.data,
      unavailable: Boolean(stats.error),
    };
    repaintVisibleSurface();
  }

  async function loadCallsPresence(companyId) {
    const idle = { agents: [], error: '', forbidden: false, notConnected: false };
    const token = activeSession()?.access_token;
    if (!token) {
      state.callsPresence = { ...idle, notConnected: true };
      stopCallsPresencePolling();
      repaintVisibleSurface();
      return;
    }

    try {
      const response = await fetchImpl(`/api/ringcentral-presence?company_id=${encodeURIComponent(companyId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const isJson = String(response.headers.get('content-type') || '').includes('application/json');

      if (response.status === 403) {
        state.callsPresence = { ...idle, forbidden: true };
        stopCallsPresencePolling();
      } else if (response.status === 503 || !isJson) {
        state.callsPresence = { ...idle, notConnected: true };
        stopCallsPresencePolling();
      } else if (!response.ok) {
        state.callsPresence = { ...idle, error: 'Can\'t reach RingCentral right now.' };
      } else {
        const payload = await response.json();
        state.callsPresence = { ...idle, agents: payload.agents || [] };
      }
    } catch {
      state.callsPresence = { ...idle, error: 'Can\'t reach RingCentral right now.' };
    }
    repaintVisibleSurface();
  }

  function stopCallsPresencePolling() {
    if (callsPresenceTimer) clearIntervalImpl(callsPresenceTimer);
    callsPresenceTimer = null;
  }

  function ensureCallsPresencePolling(companyId) {
    if (callsPresenceTimer) return;
    callsPresenceTimer = setIntervalImpl(() => {
      if (!callsSurfaceVisible()) { stopCallsPresencePolling(); return; }
      if (documentRef?.hidden || state.callsPresence.forbidden || state.callsPresence.notConnected) return;
      loadCallsPresence(companyId).catch(() => {});
    }, CALLS_PRESENCE_POLL_MS);
    loadCallsPresence(companyId).catch(() => {});
    if (!callsVisibilityBound && documentRef?.addEventListener) {
      callsVisibilityBound = true;
      documentRef.addEventListener('visibilitychange', () => {
        if (documentRef.hidden || !callsSurfaceVisible() || !callsPresenceTimer) return;
        if (state.callsPresence.forbidden || state.callsPresence.notConnected) return;
        loadCallsPresence(activeCompanyId()).catch(() => {});
      });
    }
  }

  function ensureCallsData(companyId, rangeKey = 'today') {
    const key = `${companyId}|${rangeKey}`;
    if (state.callsStats.key !== key) queueMicrotaskImpl(() => loadCallsStats(companyId, rangeKey).catch(() => {}));
    if (state.callsPresence.forbidden || state.callsPresence.notConnected) return;
    ensureCallsPresencePolling(companyId);
  }

  function callsNotConnectedMarkup() {
    return emptyState(`RingCentral isn't connected yet. Once the migration is applied and the RingCentral credentials are set, live status and conversation counts appear here.`);
  }

  function callsBoardMarkup() {
    const { agents, error, notConnected } = state.callsPresence;
    if (notConnected) return '<p class="calls-empty">Not connected to RingCentral yet.</p>';
    if (error) return `<p class="calls-empty">${h(error)}</p>`;
    if (!agents.length) return '<p class="calls-empty">Loading live status…</p>';

    const rank = { on_call: 0, ringing: 1, busy: 2, dnd: 3, available: 4, offline: 5 };
    const ordered = [...agents].sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9));
    return `<table class="calls-board"><tbody>${ordered.map((agent) => `
      <tr>
        <td class="calls-board-name">${h(agent.name || 'Unknown')}</td>
        <td class="calls-board-ext">${h(agent.extension_number || '')}</td>
        <td><span class="calls-status-dot calls-status-${h(agent.status)}"></span>${h(CALLS_STATUS_LABELS[agent.status] || agent.status)}</td>
        <td class="calls-board-since">${h(callsDurationLabel(agent.since))}</td>
      </tr>`).join('')}</tbody></table>`;
  }

  return {
    CALLS_RANGE_OPTIONS,
    CALLS_WIDGET_RANGE_OPTIONS,
    callsBoardMarkup,
    callsNotConnectedMarkup,
    callsRangeBounds,
    callsRangeKey,
    ensureCallsData,
    ensureCallsPresencePolling,
    isWidgetRange: (range) => CALLS_WIDGET_RANGE_OPTIONS.some(([id]) => id === range),
    loadCallsPresence,
    loadCallsStats,
    stopCallsPresencePolling,
  };
}
