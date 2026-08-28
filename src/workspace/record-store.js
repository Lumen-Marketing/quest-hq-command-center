// Where App Builder records actually live.
//
// They used to live inside workspace_builder_state.doc, as `items` arrays nested under each
// app. One jsonb cell per COMPANY held every app, every field and every record, which had two
// consequences. It could not carry permissions -- creating a record, deleting a record and
// renaming an app were all the same UPDATE of the same column, so RLS could only say
// "workspaces.view reads all of it" and "workspaces.manage writes all of it". And it could not
// scale -- the largest document was already 525 kB, read in full on every page load and
// rewritten in full on every record save.
//
// Records are now rows in public.wb_records, gated per operation by
// workspaces.records.view / .create / .edit / .delete.
//
// THE IN-MEMORY SHAPE DOES NOT CHANGE. 139 call sites across 22 files read `app.items`, and
// rewriting them is how this change would have broken the App Builder. They keep reading the
// same objects; this module only moves where those objects are loaded from and saved to. A row
// carries the item verbatim in `data`, so hydrating is a copy rather than a translation.

import { opsWorkspaceId } from './ops-workspace-id.js';

/** The document addresses an app by workspace and id; a row addresses it by the same pair. */
export function appKey(builderWorkspaceId, appId) {
  return `${String(builderWorkspaceId || '')}::${String(appId || '')}`;
}

/**
 * Rows to `app.items` arrays, keyed by app.
 *
 * Ordering is by `created_at` then `id`, so a list looks the same on every load. The document
 * had an implicit array order; a table has none until one is asked for.
 */
export function groupRecordRows(rows) {
  const byApp = new Map();
  const ordered = [...(rows || [])].sort((a, b) => {
    const left = String(a?.created_at || '');
    const right = String(b?.created_at || '');
    if (left !== right) return left < right ? -1 : 1;
    return String(a?.id || '') < String(b?.id || '') ? -1 : 1;
  });
  for (const row of ordered) {
    if (!row?.workspace_id || !row?.app_id) continue;
    const key = appKey(`ws-${row.workspace_id}`, row.app_id);
    if (!byApp.has(key)) byApp.set(key, []);
    // `data` is the item as the browser already knows it. Fall back to a minimal shape so a
    // row written by something else still renders instead of throwing on a missing id.
    const item = row.data && typeof row.data === 'object' ? row.data : {};
    byApp.get(key).push(item.id ? item : { ...item, id: row.id });
  }
  return byApp;
}

/** Every non-linked app in the document, with the ids needed to address its rows. */
function ownedApps(doc) {
  const out = [];
  for (const workspace of (Array.isArray(doc?.workspaces) ? doc.workspaces : [])) {
    for (const app of (Array.isArray(workspace?.apps) ? workspace.apps : [])) {
      // A linked app is a pointer at another workspace's app. Its records belong to the
      // workspace that owns them, and following the pointer here would store them twice.
      if (!app || app.linked) continue;
      out.push({ workspaceId: String(workspace.id || ''), app });
    }
  }
  return out;
}

/**
 * Fill `app.items` from the grouped rows, in place.
 *
 * An app with no rows gets an empty array rather than keeping whatever the document happened to
 * carry. That is the point: after this release the table is the record of record, and leaving
 * stale document items visible would mean reads that no permission check ever saw.
 */
export function hydrateDocRecords(doc, byApp) {
  for (const { workspaceId, app } of ownedApps(doc)) {
    app.items = byApp.get(appKey(workspaceId, app.id)) || [];
  }
  return doc;
}

/**
 * The records currently held in a document, in the shape hydrateDocRecords wants back.
 *
 * Used by the conflict-merge path. Records are no longer part of the document, so they must not
 * take part in merging it: both sides are stripped before the merge and the local records are
 * put back afterwards. Without this the server's (itemless) copy would become the base, and the
 * next diff would read every record in memory as a fresh insert.
 */
export function collectDocRecords(doc) {
  const byApp = new Map();
  for (const { workspaceId, app } of ownedApps(doc)) {
    byApp.set(appKey(workspaceId, app.id), Array.isArray(app.items) ? app.items : []);
  }
  return byApp;
}

/** The document as it is stored now: apps and fields, no records. */
export function stripDocRecords(doc) {
  const copy = doc ? JSON.parse(JSON.stringify(doc)) : doc;
  for (const { app } of ownedApps(copy)) app.items = [];
  return copy;
}

function itemsByIdFor(doc) {
  const map = new Map();
  for (const { workspaceId, app } of ownedApps(doc)) {
    const key = appKey(workspaceId, app.id);
    for (const item of (Array.isArray(app.items) ? app.items : [])) {
      if (item?.id) map.set(String(item.id), { key, workspaceId, appId: String(app.id || ''), item });
    }
  }
  return map;
}

/**
 * What changed between the last synced document and the one in memory.
 *
 * Compared by id rather than by position, so reordering an array is not mistaken for a rewrite,
 * and by serialised value, so an untouched record produces no write at all. An app the caller
 * cannot resolve to a real workspace is skipped entirely -- `opsWorkspaceId` returns '' for a
 * legacy `ws-<companyId>` document that was never adopted, and there is no row to write against.
 */
export function diffDocRecords(baseDoc, nextDoc) {
  const before = itemsByIdFor(baseDoc || { workspaces: [] });
  const after = itemsByIdFor(nextDoc || { workspaces: [] });
  const inserts = [];
  const updates = [];
  const deletes = [];

  for (const [id, entry] of after) {
    if (!opsWorkspaceId(entry.workspaceId)) continue;
    const previous = before.get(id);
    if (!previous) {
      inserts.push(entry);
    } else if (JSON.stringify(previous.item) !== JSON.stringify(entry.item)
      || previous.appId !== entry.appId
      || previous.workspaceId !== entry.workspaceId) {
      updates.push(entry);
    }
  }
  for (const [id, entry] of before) {
    if (!after.has(id) && opsWorkspaceId(entry.workspaceId)) deletes.push(entry);
  }
  return { inserts, updates, deletes };
}

export function recordRow(companyId, entry, actorId) {
  return {
    id: String(entry.item.id),
    company_id: companyId,
    workspace_id: opsWorkspaceId(entry.workspaceId),
    app_id: entry.appId,
    data: entry.item,
    ...(actorId ? { created_by: actorId } : {}),
  };
}

/**
 * Apply a diff to wb_records.
 *
 * Returns the ids the database refused, per operation, rather than throwing. Refusal is an
 * ordinary outcome here: the four policies are exactly what a role without
 * `workspaces.records.delete` is supposed to run into, and the caller needs to be able to say
 * which records did not save rather than failing the whole document write.
 */
export async function persistRecordDiff(client, { companyId, diff, actorId = null }) {
  const refused = { created: [], edited: [], deleted: [] };
  if (!client || !companyId) return refused;

  const upsert = async (entries, bucket) => {
    if (!entries.length) return;
    const rows = entries.map((entry) => recordRow(companyId, entry, actorId));
    const result = await client.from('wb_records').upsert(rows, { onConflict: 'id' }).select('id');
    if (!result.error && (result.data || []).length === rows.length) return;
    // Partial or total refusal. Re-try one at a time so one blocked record does not hide the
    // rest -- a role may hold create and not edit, and the batch would fail as a unit.
    const landed = new Set((result.data || []).map((row) => row.id));
    for (const row of rows) {
      if (landed.has(row.id)) continue;
      const single = await client.from('wb_records').upsert(row, { onConflict: 'id' }).select('id');
      if (single.error || !(single.data || []).length) refused[bucket].push(row.id);
    }
  };

  await upsert(diff.inserts, 'created');
  await upsert(diff.updates, 'edited');

  for (const entry of diff.deletes) {
    const id = String(entry.item.id);
    const result = await client.from('wb_records').delete().eq('id', id).select('id');
    if (result.error || !(result.data || []).length) refused.deleted.push(id);
  }
  return refused;
}

/** One sentence naming what the database would not take, or '' when it took everything. */
export function describeRefusals(refused) {
  const parts = [];
  if (refused.created.length) parts.push(`${refused.created.length} new`);
  if (refused.edited.length) parts.push(`${refused.edited.length} edited`);
  if (refused.deleted.length) parts.push(`${refused.deleted.length} deleted`);
  if (!parts.length) return '';
  return `${parts.join(', ')} record${parts.length === 1 && /^1 /.test(parts[0]) ? '' : 's'} could not be saved -- your role does not allow it.`;
}
