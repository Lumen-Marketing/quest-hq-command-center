// Working out what a "Clear log" would take out of public.wb_data_transfers, and the tombstones
// it leaves in their place.
//
// Split from ./activity-log.js purely to keep it out of the entry chunk. activity-log.js is
// statically imported by main.js -- `clearedActivity` and `matchBuilderWorkspace` are needed on
// paths that run before any click -- and a statically imported module is bundled into the same
// chunk, so anything added there is downloaded by every session. Nothing here is needed until
// somebody opens Configure workspace, so main.js reaches it through `await import(...)` and the
// App Builder modal (already its own lazy chunk) imports it directly.
//
// The rule these functions encode: clearing removes export and import rows and can never remove
// a tombstone. The DELETE policy in 20260909120000 enforces the same thing one level down, so a
// mistake here is a display bug rather than a hole.
//
// The Supabase round trip lives here too, not just the arithmetic. main.js keeps only the four
// lines that decide there is a live session to talk to, because every byte it holds is a byte
// downloaded before anyone has clicked anything.

import { opsWorkspaceId } from './ops-workspace-id.js';

/**
 * The workspace's clearable export and import rows, grouped by the app they belong to.
 *
 * Grouped rather than counted flat because the tombstones are written per app: the Import &
 * Export tab is a tab of ONE app, so a single workspace-level tombstone would leave every one
 * of those tabs reading "Nothing has moved yet" — indistinguishable from an app nobody has ever
 * exported, which is the exact ambiguity the tombstone exists to remove.
 *
 * Tombstones are excluded. They are not transfers, they are not deletable, and counting them
 * would make each clear report the previous ones as though they were new.
 */
export function clearableTransfers(transfers, workspaceId) {
  const wanted = String(workspaceId || '');
  const byApp = new Map();
  // '' is a legacy `ws-<companyId>` document with no workspace row to point at. It must not be
  // read as "rows whose workspace_id is falsy", and certainly not as a wildcard.
  if (!wanted || !Array.isArray(transfers)) return byApp;
  for (const row of transfers) {
    if (String(row?.workspace_id) !== wanted) continue;
    if (row?.direction !== 'export' && row?.direction !== 'import') continue;
    const appId = String(row.app_id || '');
    byApp.set(appId, (byApp.get(appId) || 0) + 1);
  }
  return byApp;
}

/** How many export/import rows a clear would remove across the whole workspace. */
export function clearableTransferCount(transfers, workspaceId) {
  let total = 0;
  for (const count of clearableTransfers(transfers, workspaceId).values()) total += count;
  return total;
}

/**
 * The tombstone rows to insert in place of the rows being deleted.
 *
 * `record_count` carries how many ROWS went for that app, not a record count — the column is
 * reused rather than added to, and the reader labels it by direction so nothing claims that
 * records were removed from the app. `file_name` and `format` stay empty: nothing was
 * transferred, so there is no file and no format to name.
 */
export function clearedTransferRows(transfers, { companyId, workspaceId, actorId }) {
  return [...clearableTransfers(transfers, workspaceId).entries()].map(([appId, removed]) => ({
    company_id: companyId,
    workspace_id: workspaceId,
    app_id: appId,
    direction: 'cleared',
    format: '',
    record_count: removed,
    // Omitted rather than sent as null: the column is a nullable FK to profiles, and a key that
    // is absent is easier to read back than one explicitly set to nothing.
    ...(actorId ? { created_by: actorId } : {}),
  }));
}

/**
 * Delete a workspace's export and import rows, leaving one tombstone per app.
 *
 * Returns how many rows went, or `null` if the database refused. The caller treats null as
 * "clear nothing at all", so a refusal cannot leave the activity array emptied with the transfer
 * rows still standing — which is the very inconsistency this whole change exists to remove,
 * arrived at by a second route.
 *
 * Returns 0 rather than null when there is simply nothing to do: a legacy `ws-<companyId>`
 * document with no workspace row to point at, or a workspace nobody has ever imported to or
 * exported from. Nothing failed in either case.
 *
 * `state` is passed in and mutated on success so the Import & Export tab and the activity feed
 * stop painting rows that are gone, without waiting for a reload.
 */
export async function clearWorkspaceTransfers({ client, state, companyId, workspace, actorId }) {
  const opsId = opsWorkspaceId(workspace?.id);
  if (!opsId) return 0;

  const removed = clearableTransferCount(state.wbTransfers, opsId);
  if (!removed) return 0;

  // The tombstones are written BEFORE the delete. If the insert succeeds and the delete then
  // fails, the log over-reports: it claims a clear that did not happen, and the rows are still
  // there to contradict it — a state somebody can see and correct. The other order fails
  // silently: rows gone, nothing saying why, indistinguishable from an app nobody ever used.
  const wrote = await client.from('wb_data_transfers').insert(clearedTransferRows(state.wbTransfers, {
    companyId, workspaceId: opsId, actorId,
  })).select();
  if (wrote.error) return null;

  // `direction` is named here even though the DELETE policy enforces it anyway. The policy is
  // what makes it true; this is what makes it legible, and it keeps the request honest about
  // what it is asking for rather than asking for everything and relying on being refused.
  const cleared = await client.from('wb_data_transfers').delete()
    .eq('workspace_id', opsId)
    .in('direction', ['export', 'import']);
  if (cleared.error) return null;

  state.wbTransfers = (state.wbTransfers || [])
    .filter((row) => String(row.workspace_id) !== opsId || row.direction === 'cleared')
    .concat(wrote.data || []);
  return removed;
}
