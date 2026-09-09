// Server-prepared App Builder transfer-log clears. A browser cache is useful for rendering,
// but is not an authority for a destructive count: the preview RPC snapshots exact row ids.

import { opsWorkspaceId } from './ops-workspace-id.js';

export function clearableTransfers(transfers, workspaceId) {
  const wanted = String(workspaceId || '');
  const byApp = new Map();
  if (!wanted || !Array.isArray(transfers)) return byApp;
  for (const row of transfers) {
    if (String(row?.workspace_id) !== wanted) continue;
    if (row?.direction !== 'export' && row?.direction !== 'import') continue;
    const appId = String(row.app_id || '');
    byApp.set(appId, (byApp.get(appId) || 0) + 1);
  }
  return byApp;
}

export function clearableTransferCount(transfers, workspaceId) {
  let total = 0;
  for (const count of clearableTransfers(transfers, workspaceId).values()) total += count;
  return total;
}

function localPreview(state, workspace) {
  const workspaceId = opsWorkspaceId(workspace?.id);
  const rows = (state.wbTransfers || []).filter((row) => (
    String(row.workspace_id) === workspaceId
    && (row.direction === 'export' || row.direction === 'import')
  ));
  const perApp = {};
  rows.forEach((row) => { perApp[String(row.app_id || '')] = (perApp[String(row.app_id || '')] || 0) + 1; });
  return {
    request_id: 'local', transfer_count: rows.length, per_app: perApp, expires_at: null,
    // Demo data has no server to snapshot. Keep ids only so newer local rows survive.
    snapshot_ids: rows.map((row) => row.id).filter(Boolean), local: true,
  };
}

/** Prepare an immutable server snapshot. No table select/insert/delete happens in the browser. */
export async function previewWorkspaceTransferClear({ client, liveSession = false, state, workspace }) {
  // A live session without a usable client is not a demo. Falling back to cached rows here
  // would turn a database authorization/outage failure into an unsafe local clear preview.
  if (liveSession && !client) throw new Error('The live transfer log is unavailable. Try again.');
  if (!client) return localPreview(state, workspace);
  const workspaceId = opsWorkspaceId(workspace?.id);
  if (!workspaceId) {
    if (liveSession) throw new Error('This workspace cannot clear a live transfer log.');
    return localPreview(state, workspace);
  }
  const { data, error } = await client.rpc('preview_wb_transfer_clear', { p_workspace_id: workspaceId });
  if (error) throw new Error(error.message || 'Could not prepare the transfer-log clear.');
  if (!data || !data.request_id || !Number.isFinite(Number(data.transfer_count))) {
    throw new Error('The transfer-log preview was incomplete. Try again.');
  }
  return data;
}

/** Consume one snapshot. Repeating the request id returns its stored result safely. */
export async function clearWorkspaceTransfers({ client, liveSession = false, state, workspace, preview, isCurrentContext = () => true }) {
  if (!preview) throw new Error('Prepare the transfer-log clear before confirming it.');
  if (!isCurrentContext()) throw new Error('This clear action is no longer active. No cached transfer rows were changed.');
  let result;
  if (liveSession && (!client || preview.local)) {
    throw new Error('The live transfer log is unavailable. Preview it again before clearing.');
  }
  if (preview.local || !client) {
    const ids = new Set(preview.snapshot_ids || []);
    const now = new Date().toISOString();
    const tombstones = Object.entries(preview.per_app || {}).map(([app_id, removed]) => ({
      id: `local-clear-${app_id}-${Date.now()}`, workspace_id: opsWorkspaceId(workspace?.id), app_id,
      direction: 'cleared', format: '', file_name: '', record_count: removed, created_at: now,
    }));
    result = { request_id: preview.request_id, removed: ids.size, removed_ids: [...ids], tombstones, local: true };
  } else {
    const { data, error } = await client.rpc('clear_wb_transfer_log', { p_request_id: preview.request_id });
    if (error) throw new Error(error.message || 'The transfer log could not be cleared.');
    if (!data || !Number.isFinite(Number(data.removed)) || !Array.isArray(data.tombstones)) {
      throw new Error('The transfer-log clear returned an incomplete result.');
    }
    result = data;
  }

  // The RPC may have taken long enough for logout, a company switch or modal replacement. Do
  // not let its response mutate the cache that now belongs to that newer context.
  if (!isCurrentContext()) throw new Error('This clear action is no longer active. No cached transfer rows were changed.');

  // Only server-deleted ids leave the cache. New arrivals after preview remain visible.
  const removed = new Set(result.removed_ids || []);
  const known = new Set((state.wbTransfers || []).map((row) => row.id));
  state.wbTransfers = (state.wbTransfers || []).filter((row) => !removed.has(row.id))
    .concat((result.tombstones || []).filter((row) => row?.id && !known.has(row.id)));
  return result;
}
