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
    if (!byApp.has(key)) byApp.set(key, { items: [], trash: [] });
    // `data` is the item as the browser already knows it. Fall back to a minimal shape so a
    // row written by something else still renders instead of throwing on a missing id.
    const item = row.data && typeof row.data === 'object' ? row.data : {};
    const whole = item.id ? item : { ...item, id: row.id };
    if (!row.deleted_at) { byApp.get(key).items.push(whole); continue; }
    // A binned record is the same object with the stamps the bin reads put back on top of it,
    // which is the shape `app.trash` has always held. The stamps live in COLUMNS rather than in
    // `data`, so binning and restoring never rewrite the record itself -- what a person deleted
    // is byte-identical to what they get back.
    byApp.get(key).trash.unshift({
      ...whole,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by || '',
      purgeAfter: row.purge_after || '',
    });
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
    const held = byApp.get(appKey(workspaceId, app.id));
    // Tolerates the pre-bin shape, where the value was the items array itself: a session that
    // loaded before this release and saves after it must not read its own records as trash.
    const grouped = Array.isArray(held) ? { items: held, trash: [] } : (held || { items: [], trash: [] });
    app.items = grouped.items;
    // The bin is the table's rows, plus anything the document still holds that the table does
    // not. A document array tolerates a repeated record id and a primary key cannot, so a
    // handful of bin entries genuinely cannot become rows -- on 2026-09-04, eight of 214: seven
    // sharing an id with another binned record, one sharing an id with a record that is still
    // live. Dropping them because the migration could not take them would destroy exactly the
    // entries nobody has looked at yet.
    //
    // Marked, so the save path can put back what it must keep. The invariant this creates is
    // worth stating plainly: THE DOCUMENT HOLDS ONLY WHAT THE TABLE DOES NOT. It also self-heals
    // -- give a leftover a fresh id and it becomes a row on the next save, and the document
    // empties itself.
    const inTable = new Set(grouped.trash.map((entry) => String(entry.id)));
    const leftover = (Array.isArray(app.trash) ? app.trash : [])
      .filter((entry) => entry?.id && !inTable.has(String(entry.id)))
      .map((entry) => ({ ...entry, unmigrated: true }));
    if (grouped.trash.length || Array.isArray(app.trash)) app.trash = [...grouped.trash, ...leftover];
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
    byApp.set(appKey(workspaceId, app.id), {
      items: Array.isArray(app.items) ? app.items : [],
      // The bin travels with them. It is stripped from the document like the records now, so a
      // merge that put back only the live ones would empty every bin on the first conflict.
      trash: Array.isArray(app.trash) ? app.trash : [],
    });
  }
  return byApp;
}

/**
 * The document as it is stored now: apps and fields, no records.
 *
 * `migratedWorkspaceIds` is the set of builder workspace ids whose records really did move to
 * wb_records. Anything outside it keeps its items, and that is not a nicety -- it is the only
 * thing standing between an unmigrated record and deletion.
 *
 * A document can hold records under a workspace whose row no longer exists: the workspace was
 * deleted and its records stayed behind in the jsonb. `allowedBuilderIds` in builder-core.js
 * already filters those out, so they are invisible in the product, and the backfill
 * deliberately did not import them -- importing would have resurrected invisible data into a
 * live workspace, and the foreign key would refuse them anyway. But invisible is not the same
 * as disposable. Clearing every items array unconditionally would delete on the next ordinary
 * save the one copy of records nothing had rescued. On 2026-08-28 that was 11 records.
 *
 * Called with no set, nothing is stripped. That is the safe default for a caller that cannot
 * say what it migrated.
 */
export function stripDocRecords(doc, migratedWorkspaceIds = null) {
  const copy = doc ? JSON.parse(JSON.stringify(doc)) : doc;
  if (!migratedWorkspaceIds) return copy;
  for (const { workspaceId, app } of ownedApps(copy)) {
    // The bin goes with the records, and for the same reason. Left in the document it was read
    // by anyone with company-level `workspaces.view`, so deleting a record widened who could
    // see it -- the rows carry `deleted_at` now and keep the workspace's own policy.
    //
    // Except what the table could not take. Those stay, because the alternative is destroying
    // them: see hydrateDocRecords for what ends up marked.
    if (migratedWorkspaceIds.has(workspaceId)) {
      app.items = [];
      app.trash = (Array.isArray(app.trash) ? app.trash : []).filter((entry) => entry?.unmigrated);
    }
  }
  return copy;
}

/**
 * The same answer, without the deep clone -- for a caller that reads it and lets go.
 *
 * `stripDocRecords` copied every record in the company in order to blank the arrays holding
 * them, which made it the single largest cost of an ordinary save: 256 ms of a 742 ms save on a
 * 36,000-record document, to produce a payload containing none of what it had just copied.
 *
 * This shares everything it does not replace, so it is only safe where the result is read and
 * dropped -- which is the upload: it goes onto the wire and is forgotten. The deep form stays
 * for the merge path, because there the result is handed to a merger whose output becomes the
 * live document, and a `fields` array shared between the base and the live copy would make the
 * next edit invisible to the next merge.
 */
export function docWithoutRecords(doc, migratedWorkspaceIds = null) {
  if (!doc) return doc;
  const workspaces = Array.isArray(doc.workspaces) ? doc.workspaces : [];
  if (!migratedWorkspaceIds) return { ...doc };
  return {
    ...doc,
    workspaces: workspaces.map((workspace) => {
      const apps = Array.isArray(workspace?.apps) ? workspace.apps : null;
      if (!apps || !migratedWorkspaceIds.has(String(workspace?.id || ''))) return workspace;
      // A linked app is a pointer at another workspace's app; its records belong to the
      // workspace that owns them and are left exactly where `ownedApps` leaves them.
      return {
        ...workspace,
        apps: apps.map((app) => (app && !app.linked
          ? { ...app, items: [], trash: (Array.isArray(app.trash) ? app.trash : []).filter((entry) => entry?.unmigrated) }
          : app)),
      };
    }),
  };
}

/**
 * The builder workspace ids whose records live in wb_records.
 *
 * Derived from the operational workspaces the session can actually see, which is the same list
 * `allowedBuilderIds` is built from -- so a workspace the product cannot reach is never treated
 * as migrated, and its records are left in the document rather than dropped.
 */
export function migratedWorkspaceIdSet(workspaces, companyId) {
  const ids = new Set();
  for (const workspace of (workspaces || [])) {
    if (companyId && workspace?.company_id !== companyId) continue;
    if (workspace?.id) ids.add(`ws-${workspace.id}`);
  }
  return ids;
}

function itemsByIdFor(doc) {
  const map = new Map();
  for (const { workspaceId, app } of ownedApps(doc)) {
    const key = appKey(workspaceId, app.id);
    const seat = (item, trashed) => {
      if (!item?.id) return;
      // The stamps are the bin's, not the record's. They live in columns, so they are lifted
      // off here -- otherwise binning would rewrite `data` and read as an edit of the record
      // itself, and the copy that came back from a restore would differ from the one deleted.
      const { deletedAt, deletedBy, purgeAfter, ...plain } = item;
      map.set(String(item.id), {
        key, workspaceId, appId: String(app.id || ''), item: trashed ? plain : item, trashed,
      });
    };
    for (const item of (Array.isArray(app.items) ? app.items : [])) seat(item, false);
    // A record in the bin has not gone anywhere: its row is still there, wearing a deleted_at.
    // Walking only `items` would read every deletion as a purge and destroy it outright.
    //
    // A leftover is skipped: it has no row of its own, and its id belongs to a different record
    // that does. Seating it would either insert over that record or, once it left the bin, ask
    // the database to delete it.
    for (const item of (Array.isArray(app.trash) ? app.trash : [])) {
      if (!item?.unmigrated) seat(item, true);
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
  return diffRecordsAgainst(recordFingerprints(baseDoc || { workspaces: [] }), nextDoc);
}

/**
 * One record's identity and contents as a single string.
 *
 * Where it lives is part of it, because moving a record between apps is a change the row has to
 * be told about even when not one of its values moved.
 */
function fingerprintOf(entry) {
  return `${entry.workspaceId}\u0000${entry.appId}\u0000${JSON.stringify(entry.item)}`;
}

/**
 * What a document's records look like right now, one string each.
 *
 * Kept INSTEAD of a copy of the document. The base existed only so the next save could ask "did
 * this record change", and answering that never needed the record back -- only whether it still
 * matches. Holding the answer rather than the material removes a whole-document deep clone from
 * every save, and halves the comparison as well: each record is serialised once, on the side
 * that changed, instead of once on each side.
 */
export function recordFingerprints(doc) {
  const map = new Map();
  for (const [id, entry] of itemsByIdFor(doc || { workspaces: [] })) {
    map.set(id, {
      workspaceId: entry.workspaceId,
      appId: entry.appId,
      print: fingerprintOf(entry),
      // Which side of the bin it was on. Binning changes no value, so without this the diff
      // finds nothing to write and a deletion never reaches the database.
      trashed: !!entry.trashed,
    });
  }
  return map;
}

/**
 * What changed since those fingerprints were taken.
 *
 * A deleted record comes back as its id and where it lived, which is all the delete needs -- the
 * values went with the copy that is no longer kept, and nothing downstream asked for them.
 */
export function diffRecordsAgainst(before, nextDoc) {
  const prints = before instanceof Map ? before : new Map();
  const after = itemsByIdFor(nextDoc || { workspaces: [] });
  const inserts = [];
  const updates = [];
  const deletes = [];
  // Four transitions now, not three. A record can move between the list and the bin without any
  // of its values changing, and each direction is its own routine because binning has always
  // needed `workspaces.records.delete` -- expressing it as an ordinary edit would hand that
  // capability to every role allowed to edit.
  const trashes = [];
  const restores = [];
  // The fingerprints of what is being compared, kept as they are worked out. Every one of them
  // is computed here anyway; handing them back saves the caller walking the whole document a
  // second time to build the base for the next save. It is also the more honest base: it
  // describes what this save actually sent, so an edit made while the write was in the air stays
  // pending instead of being marked as already saved by a snapshot taken after it landed.
  const next = new Map();

  for (const [id, entry] of after) {
    const print = fingerprintOf(entry);
    const trashed = !!entry.trashed;
    next.set(id, { workspaceId: entry.workspaceId, appId: entry.appId, print, trashed });
    if (!opsWorkspaceId(entry.workspaceId)) continue;
    const previous = prints.get(id);
    if (!previous) {
      // Created and binned between two saves. The row has to arrive before it can be marked
      // deleted, or the bin would show something the table has never heard of.
      inserts.push(entry);
      if (trashed) trashes.push(entry);
      continue;
    }
    // The values and the side are separate questions, and one save can answer both -- a record
    // edited and then binned before anything was written.
    if (previous.print !== print) updates.push(entry);
    if (previous.trashed !== trashed) (trashed ? trashes : restores).push(entry);
  }
  // Gone from the list AND from the bin, which is now the only thing that means destroy it.
  // Before the bin was rows, every deletion looked like this and every one of them was a purge.
  for (const [id, previous] of prints) {
    if (after.has(id) || !opsWorkspaceId(previous.workspaceId)) continue;
    deletes.push({ workspaceId: previous.workspaceId, appId: previous.appId, item: { id } });
  }
  return { inserts, updates, deletes, trashes, restores, prints: next };
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

  // Into the bin and back out of it. Routines rather than an UPDATE of `deleted_at`, because
  // the update policy asks for `workspaces.records.edit` and binning a record has always
  // needed `workspaces.records.delete`. Writing it as an ordinary edit would have handed the
  // power to empty a list into the bin to every role allowed to correct a typo.
  //
  // Both are batched: one call per save, whatever it moved. They return how many rows they
  // actually touched, so a refusal is a count that does not match rather than an error.
  const move = async (entries, routine, bucket) => {
    if (!entries.length) return;
    const ids = entries.map((entry) => String(entry.item.id));
    const result = await client.rpc(routine, { p_ids: ids });
    if (!result.error && Number(result.data) === ids.length) return;
    // The routine skips what the caller may not touch, so the shortfall IS the refusal. Which
    // specific ids were refused is not worth a second round trip -- the message counts them.
    const moved = result.error ? 0 : Number(result.data) || 0;
    refused[bucket].push(...ids.slice(moved));
  };
  await move(diff.trashes || [], 'wb_trash_records', 'deleted');
  await move(diff.restores || [], 'wb_restore_records', 'created');

  // Destroying a row for good, which is now only ever a purge from the bin or an app being
  // deleted outright. The policy on the table is what gates it, as it always was.
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
