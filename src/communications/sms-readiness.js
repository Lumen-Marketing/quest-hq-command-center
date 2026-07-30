const SMS_READINESS_MESSAGES = Object.freeze({
  ready: 'SMS is ready.',
  provider_unconfigured: 'SMS provider setup is incomplete.',
  backend_unavailable: 'Workspace-safe SMS routing is not available yet.',
  storage_unavailable: 'Workspace-safe SMS storage is not available yet.',
  workspace_required: 'Assign this contact to a workspace before using SMS.',
  workspace_unavailable: 'This contact workspace is not active.',
  number_unassigned: 'No active SMS number is assigned to this workspace.',
  unavailable: 'SMS is unavailable right now.',
});

const KNOWN_STATUSES = new Set(Object.keys(SMS_READINESS_MESSAGES));

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeSmsReadiness(payload) {
  const requestedStatus = text(payload?.status);
  const verifiedReady = requestedStatus === 'ready' && payload?.ready === true;
  const status = verifiedReady
    ? 'ready'
    : (requestedStatus !== 'ready' && KNOWN_STATUSES.has(requestedStatus)
      ? requestedStatus
      : 'unavailable');

  return {
    ready: status === 'ready',
    status,
    message: text(payload?.message) || SMS_READINESS_MESSAGES[status],
    workspaceId: text(payload?.workspace_id) || null,
  };
}

export function smsUiCapabilities(payload) {
  const readiness = normalizeSmsReadiness(payload);
  return {
    ...readiness,
    canMountThread: readiness.ready,
    canMountComposer: readiness.ready,
  };
}
