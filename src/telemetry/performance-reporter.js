let reportCount = 0;

export function sendSlowOperation({
  label = 'Slow operation', durationMs = 0, context = '',
} = {}, state = {}) {
  if (reportCount >= 8) return;
  reportCount += 1;
  try {
    const payload = JSON.stringify({
      kind: 'performance',
      message: String(label).slice(0, 120),
      duration_ms: Math.max(0, Math.min(360000, Math.round(Number(durationMs) || 0))),
      url: `${window.location.origin}${window.location.pathname}`,
      route: String(context).slice(0, 120),
      revision: String(typeof __QUEST_BUILD_SHA__ === 'string' ? __QUEST_BUILD_SHA__ : '').slice(0, 60),
      company_id: String(state.activeCompanyId || '').slice(0, 80),
      workspace_id: String(state.activeWorkspaceId || '').slice(0, 80),
      profile_id: String(state.session?.profile?.id || '').slice(0, 80),
    });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/client-error', new Blob([payload], { type: 'application/json' }));
    else fetch('/api/client-error', { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
  } catch {
    // Performance reporting is diagnostic only and must never affect the page.
  }
}
