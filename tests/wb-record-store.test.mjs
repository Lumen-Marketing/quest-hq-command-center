import assert from 'node:assert/strict';
import test from 'node:test';

import {
  appKey, collectDocRecords, describeRefusals, diffDocRecords, diffRecordsAgainst,
  docWithoutRecords, groupRecordRows, hydrateDocRecords, migratedWorkspaceIdSet,
  persistRecordDiff, recordFingerprints, recordRow, stripDocRecords,
} from '../src/workspace/record-store.js';

// Records used to live inside workspace_builder_state.doc, one jsonb cell per company holding
// every app, every field and every record. That shape could not carry a permission: creating a
// record, deleting one and renaming an app were the same UPDATE of the same column, so RLS
// could only say "workspaces.view reads all of it" / "workspaces.manage writes all of it".
// They are rows in public.wb_records now, one policy per operation.
//
// The in-memory shape is unchanged on purpose -- 139 call sites read `app.items`. These tests
// hold that boundary: rows in, the same item objects out.

const WS = 'ws-2c4a7f18-0f4c-4a5a-9d31-9b6b2f1a1c00';
const OTHER_WS = 'ws-9a1b3c55-1111-2222-3333-444455556666';

const doc = (items, { workspaceId = WS, appId = 'app-1', extra = [] } = {}) => ({
  workspaces: [
    { id: workspaceId, apps: [{ id: appId, items }, ...extra] },
  ],
});

test('rows become items keyed by workspace and app, in a stable order', () => {
  const byApp = groupRecordRows([
    { id: 'r2', workspace_id: '2c4a7f18-0f4c-4a5a-9d31-9b6b2f1a1c00', app_id: 'app-1', created_at: '2026-02-01', data: { id: 'r2', values: { a: 2 } } },
    { id: 'r1', workspace_id: '2c4a7f18-0f4c-4a5a-9d31-9b6b2f1a1c00', app_id: 'app-1', created_at: '2026-01-01', data: { id: 'r1', values: { a: 1 } } },
  ]);
  const { items } = byApp.get(appKey(WS, 'app-1'));
  assert.deepEqual(items.map((item) => item.id), ['r1', 'r2'], 'oldest first, so a list looks the same on every load');
  // The item object crosses verbatim: this is what keeps the 139 read sites working.
  assert.deepEqual(items[0], { id: 'r1', values: { a: 1 } });
});

test('hydrating clears an app the table has no rows for', () => {
  // The table is the record of record after this change. Leaving stale document items visible
  // would be reads that no permission check ever saw.
  const target = doc([{ id: 'stale', values: {} }]);
  hydrateDocRecords(target, new Map());
  assert.deepEqual(target.workspaces[0].apps[0].items, []);
});

const MIGRATED = migratedWorkspaceIdSet([{ id: '2c4a7f18-0f4c-4a5a-9d31-9b6b2f1a1c00', company_id: 'lumen' }], 'lumen');

test('a linked app is left alone, because its records belong to the workspace that owns them', () => {
  const target = doc([], { extra: [{ id: 'app-2', linked: true, items: ['untouched'] }] });
  hydrateDocRecords(target, new Map());
  assert.deepEqual(target.workspaces[0].apps[1].items, ['untouched']);
  assert.deepEqual(stripDocRecords(target, MIGRATED).workspaces[0].apps[1].items, ['untouched']);
});

test('the stored document carries no records for a migrated workspace', () => {
  const stripped = stripDocRecords(doc([{ id: 'r1', values: { a: 1 } }]), MIGRATED);
  assert.deepEqual(stripped.workspaces[0].apps[0].items, []);
});

test('records under a workspace that no longer exists are NOT stripped', () => {
  // A document can hold records under a deleted workspace. They are invisible in the product
  // (allowedBuilderIds filters them) and the backfill deliberately did not import them, so the
  // document is the only copy. Clearing every items array unconditionally would have deleted
  // them on the next ordinary save -- 11 real records, in one live company.
  const orphaned = doc([{ id: 'ghost', values: { a: 1 } }], { workspaceId: OTHER_WS });
  const stripped = stripDocRecords(orphaned, MIGRATED);
  assert.deepEqual(stripped.workspaces[0].apps[0].items, [{ id: 'ghost', values: { a: 1 } }]);
});

test('with no migrated set, nothing is stripped at all', () => {
  // The safe default for a caller that cannot say what it migrated.
  const stripped = stripDocRecords(doc([{ id: 'r1', values: {} }]));
  assert.deepEqual(stripped.workspaces[0].apps[0].items, [{ id: 'r1', values: {} }]);
});

test('the migrated set is built from workspaces the session can actually see', () => {
  const ids = migratedWorkspaceIdSet(
    [{ id: 'aaa', company_id: 'lumen' }, { id: 'bbb', company_id: 'other' }],
    'lumen',
  );
  assert.deepEqual([...ids], ['ws-aaa'], 'a workspace in another company is not ours to strip');
});

test('the diff reports creates, edits and deletes by id, not by position', () => {
  const base = doc([{ id: 'a', values: { n: 1 } }, { id: 'b', values: { n: 2 } }]);
  const next = doc([{ id: 'b', values: { n: 2 } }, { id: 'a', values: { n: 99 } }, { id: 'c', values: {} }]);
  const diff = diffDocRecords(base, next);
  assert.deepEqual(diff.inserts.map((e) => e.item.id), ['c']);
  assert.deepEqual(diff.updates.map((e) => e.item.id), ['a'], 'b only moved, so it is not a write');
  assert.deepEqual(diff.deletes.map((e) => e.item.id), []);
});

test('removing a record is a delete, and an untouched document writes nothing', () => {
  const base = doc([{ id: 'a', values: {} }, { id: 'b', values: {} }]);
  assert.deepEqual(diffDocRecords(base, doc([{ id: 'a', values: {} }])).deletes.map((e) => e.item.id), ['b']);
  const quiet = diffDocRecords(base, doc([{ id: 'a', values: {} }, { id: 'b', values: {} }]));
  assert.deepEqual([quiet.inserts.length, quiet.updates.length, quiet.deletes.length], [0, 0, 0]);
});

test('a record moved between apps is an update carrying its new app', () => {
  const base = doc([{ id: 'a', values: {} }]);
  const next = { workspaces: [{ id: WS, apps: [{ id: 'app-1', items: [] }, { id: 'app-2', items: [{ id: 'a', values: {} }] }] }] };
  const diff = diffDocRecords(base, next);
  assert.equal(diff.updates.length, 1);
  assert.equal(diff.updates[0].appId, 'app-2');
  assert.equal(diff.deletes.length, 0, 'it moved, it was not deleted');
});

test('a legacy ws-<companyId> document is skipped rather than sent to Postgres', () => {
  // opsWorkspaceId returns '' for it: there is no workspace row to write against, and the
  // column is a uuid. Skipping beats handing the database something it will only reject.
  const diff = diffDocRecords(doc([], { workspaceId: 'ws-lumen' }), doc([{ id: 'a', values: {} }], { workspaceId: 'ws-lumen' }));
  assert.deepEqual([diff.inserts.length, diff.updates.length, diff.deletes.length], [0, 0, 0]);
});

test('a row carries the resolved workspace uuid, not the builder id', () => {
  const row = recordRow('lumen', { workspaceId: WS, appId: 'app-1', item: { id: 'a' } }, 'profile-1');
  assert.equal(row.workspace_id, '2c4a7f18-0f4c-4a5a-9d31-9b6b2f1a1c00');
  assert.equal(row.company_id, 'lumen');
  assert.deepEqual(row.data, { id: 'a' });
});

test('collectDocRecords round-trips through hydrate, so a merge keeps its records', () => {
  const source = doc([{ id: 'a', values: { n: 1 } }]);
  const rebuilt = hydrateDocRecords(stripDocRecords(source, MIGRATED), collectDocRecords(source));
  assert.deepEqual(rebuilt.workspaces[0].apps[0].items, [{ id: 'a', values: { n: 1 } }]);
});

test('a refused record is named rather than failing the whole save', () => {
  // Refusal is an ordinary outcome: it is exactly what a role without
  // workspaces.records.delete is supposed to run into.
  const calls = [];
  const client = {
    from() {
      return {
        upsert(rows) {
          const list = Array.isArray(rows) ? rows : [rows];
          calls.push({ op: 'upsert', ids: list.map((r) => r.id) });
          return {
            select: async () => ({
              // The batch lands only partly: 'b' is refused by policy.
              data: list.filter((r) => r.id !== 'b').map((r) => ({ id: r.id })),
              error: null,
            }),
          };
        },
        delete() {
          return { eq: (_col, id) => ({ select: async () => { calls.push({ op: 'delete', ids: [id] }); return { data: [], error: null }; } }) };
        },
      };
    },
  };

  return persistRecordDiff(client, {
    companyId: 'lumen',
    diff: {
      inserts: [
        { workspaceId: WS, appId: 'app-1', item: { id: 'a' } },
        { workspaceId: WS, appId: 'app-1', item: { id: 'b' } },
      ],
      updates: [],
      deletes: [{ workspaceId: OTHER_WS, appId: 'app-1', item: { id: 'z' } }],
    },
  }).then((refused) => {
    assert.deepEqual(refused.created, ['b'], 'the refused insert is reported by id');
    assert.deepEqual(refused.deleted, ['z'], 'a delete that removed no row was refused');
    // The batch is retried per row so one blocked record cannot hide the rest.
    assert.ok(calls.some((c) => c.op === 'upsert' && c.ids.length === 1 && c.ids[0] === 'b'));
    assert.match(describeRefusals(refused), /could not be saved/);
  });
});

test('nothing refused says nothing', () => {
  assert.equal(describeRefusals({ created: [], edited: [], deleted: [] }), '');
});

// ---- what one save costs ----------------------------------------------------------------------
//
// An ordinary save used to make four whole-document passes: stringify everything into
// localStorage, stringify both sides of every record to diff them, deep-clone everything to
// blank the arrays it had just copied, and deep-clone everything again to keep as the base.
// Cost scaled with everything the company owned rather than with what changed. Two of the four
// are gone; these hold them gone, and hold the behaviour they replaced identical.

test('the stored document shares what it does not replace, instead of copying every record', () => {
  const items = [{ id: 'r1', values: { a: 1 } }];
  const source = doc(items);
  const migrated = new Set([WS]);
  const out = docWithoutRecords(source, migrated);

  assert.deepEqual(out.workspaces[0].apps[0].items, [], 'the records still do not travel');
  assert.notEqual(out, source, 'and the caller cannot write through it to the live document');
  assert.notEqual(out.workspaces[0].apps[0], source.workspaces[0].apps[0]);
  // The point of it: the records themselves were never copied to produce a payload holding none.
  assert.equal(source.workspaces[0].apps[0].items, items, 'the live document is untouched');
});

test('the cheap form and the deep form agree on what is stored', () => {
  const source = doc([{ id: 'r1', values: { a: 1 } }], {
    extra: [{ id: 'app-2', linked: true, items: [{ id: 'r9', values: {} }] }],
  });
  const migrated = new Set([WS]);
  assert.deepEqual(docWithoutRecords(source, migrated), stripDocRecords(source, migrated));
  assert.deepEqual(docWithoutRecords(source, null), stripDocRecords(source, null));
});

test('a linked app keeps its records in the cheap form too', () => {
  const source = doc([], { extra: [{ id: 'app-2', linked: true, items: [{ id: 'r9', values: {} }] }] });
  const out = docWithoutRecords(source, new Set([WS]));
  assert.deepEqual(out.workspaces[0].apps[1].items, [{ id: 'r9', values: {} }]);
});

test('fingerprints answer the only question the base was ever asked', () => {
  const before = doc([{ id: 'r1', values: { a: 1 } }, { id: 'r2', values: { a: 2 } }]);
  const prints = recordFingerprints(before);
  const after = doc([{ id: 'r1', values: { a: 99 } }, { id: 'r3', values: { a: 3 } }]);

  const diff = diffRecordsAgainst(prints, after);
  assert.deepEqual(diff.inserts.map((e) => e.item.id), ['r3']);
  assert.deepEqual(diff.updates.map((e) => e.item.id), ['r1']);
  assert.deepEqual(diff.deletes.map((e) => e.item.id), ['r2']);
  // A delete needs its id and where it lived, which is all persistRecordDiff reads.
  assert.equal(diff.deletes[0].workspaceId, WS);
});

test('the fingerprint diff and the document diff give the same answer', () => {
  const before = doc([{ id: 'r1', values: { a: 1 } }, { id: 'r2', values: { a: 2 } }]);
  const after = doc([{ id: 'r1', values: { a: 1 } }, { id: 'r2', values: { a: 22 } }]);
  const viaDoc = diffDocRecords(before, after);
  const viaPrints = diffRecordsAgainst(recordFingerprints(before), after);
  assert.deepEqual(viaPrints.inserts, viaDoc.inserts);
  assert.deepEqual(viaPrints.updates, viaDoc.updates);
  assert.deepEqual(viaPrints.deletes.map((e) => e.item.id), viaDoc.deletes.map((e) => e.item.id));
});

test('a record moved between apps is still an update, on the fingerprints too', () => {
  // Where a record lives is part of its fingerprint, or a move that changed no value would
  // never be written and the row would keep pointing at the app it left.
  const before = doc([{ id: 'r1', values: { a: 1 } }], { appId: 'app-1' });
  const after = doc([{ id: 'r1', values: { a: 1 } }], { appId: 'app-2' });
  const diff = diffRecordsAgainst(recordFingerprints(before), after);
  assert.deepEqual(diff.updates.map((e) => e.appId), ['app-2']);
});

test('the diff hands back the fingerprints of what it just compared', () => {
  // So the caller does not walk the whole document again to build the next base. They describe
  // what this save SENT, which is why an edit made while the write was in the air stays pending.
  const before = doc([{ id: 'r1', values: { a: 1 } }]);
  const after = doc([{ id: 'r1', values: { a: 2 } }]);
  const diff = diffRecordsAgainst(recordFingerprints(before), after);
  assert.ok(diff.prints instanceof Map);
  assert.deepEqual(diffRecordsAgainst(diff.prints, after), {
    inserts: [], updates: [], deletes: [], trashes: [], restores: [], prints: diff.prints,
  }, 'feeding them straight back reports nothing left to write');
});

// ---- the bin is rows now ------------------------------------------------------------------------
//
// Deleted records used to stay in `app.trash` inside the company document, whose select policy is
// company-level -- so DELETING a record widened who could read it. They are rows wearing a
// `deleted_at` now, which keeps the workspace's own policy and gives the 30-day sweep something
// it can actually see.

const binned = (items, trash) => ({
  workspaces: [{ id: WS, apps: [{ id: 'app-1', items, trash }] }],
});

test('a row with deleted_at hydrates into the bin, not the list', () => {
  const byApp = groupRecordRows([
    { id: 'live', workspace_id: '2c4a7f18-0f4c-4a5a-9d31-9b6b2f1a1c00', app_id: 'app-1', created_at: '2026-01-01', data: { id: 'live', values: {} } },
    {
      id: 'gone',
      workspace_id: '2c4a7f18-0f4c-4a5a-9d31-9b6b2f1a1c00',
      app_id: 'app-1',
      created_at: '2026-01-02',
      data: { id: 'gone', values: { a: 1 } },
      deleted_at: '2026-09-01T10:00:00.000Z',
      deleted_by: 'p1',
      purge_after: '2026-10-01T10:00:00.000Z',
    },
  ]);
  const held = byApp.get(appKey(WS, 'app-1'));
  assert.deepEqual(held.items.map((i) => i.id), ['live']);
  assert.deepEqual(held.trash.map((i) => i.id), ['gone']);
  // The bin has always read these off the entry, so the columns are put back on top of the item.
  assert.equal(held.trash[0].deletedAt, '2026-09-01T10:00:00.000Z');
  assert.equal(held.trash[0].deletedBy, 'p1');
  assert.equal(held.trash[0].purgeAfter, '2026-10-01T10:00:00.000Z');

  const target = binned([], []);
  hydrateDocRecords(target, byApp);
  assert.deepEqual(target.workspaces[0].apps[0].items.map((i) => i.id), ['live']);
  assert.deepEqual(target.workspaces[0].apps[0].trash.map((i) => i.id), ['gone']);
});

test('binning a record is a trash, not a delete', () => {
  // The whole point. Before the bin was rows, a record leaving `items` was gone from the diff's
  // point of view and the row was destroyed -- there was nothing left for a restore to find.
  const before = recordFingerprints(binned([{ id: 'r1', values: { a: 1 } }], []));
  const after = binned([], [{ id: 'r1', values: { a: 1 }, deletedAt: '2026-09-04', deletedBy: 'p1' }]);
  const diff = diffRecordsAgainst(before, after);
  assert.deepEqual(diff.trashes.map((e) => e.item.id), ['r1']);
  assert.deepEqual(diff.deletes, [], 'nothing is destroyed');
  assert.deepEqual(diff.updates, [], 'and the record itself did not change');
});

test('the bin stamps are the bin\'s, not the record\'s', () => {
  // They live in columns. If they rode in `data`, binning would rewrite the record and read as
  // an edit, and what came back from a restore would not be what was deleted.
  const live = binned([{ id: 'r1', values: { a: 1 } }], []);
  const inBin = binned([], [{ id: 'r1', values: { a: 1 }, deletedAt: '2026-09-04', deletedBy: 'p1', purgeAfter: '2026-10-04' }]);
  const [livePrint] = [...recordFingerprints(live).values()];
  const [binPrint] = [...recordFingerprints(inBin).values()];
  assert.equal(livePrint.print, binPrint.print, 'the same record either side of the bin');
  assert.equal(livePrint.trashed, false);
  assert.equal(binPrint.trashed, true);
});

test('restoring is its own write, and purging is the only destroy left', () => {
  const inBin = recordFingerprints(binned([], [{ id: 'r1', values: {}, deletedAt: '2026-09-04' }]));

  const back = diffRecordsAgainst(inBin, binned([{ id: 'r1', values: {} }], []));
  assert.deepEqual(back.restores.map((e) => e.item.id), ['r1']);
  assert.deepEqual(back.deletes, []);

  const purged = diffRecordsAgainst(inBin, binned([], []));
  assert.deepEqual(purged.deletes.map((e) => e.item.id), ['r1'], 'gone from both is a purge');
  assert.deepEqual(purged.restores, []);
});

test('a record created and binned between two saves arrives before it is marked deleted', () => {
  // Otherwise the bin holds something the table has never heard of, and the restore fails.
  const diff = diffRecordsAgainst(new Map(), binned([], [{ id: 'r1', values: {}, deletedAt: '2026-09-04' }]));
  assert.deepEqual(diff.inserts.map((e) => e.item.id), ['r1']);
  assert.deepEqual(diff.trashes.map((e) => e.item.id), ['r1']);
});

test('the stored document carries no bin either', () => {
  // The boundary fix: the bin is what was crossing it.
  const source = binned([{ id: 'r1', values: {} }], [{ id: 'r2', values: {}, deletedAt: '2026-09-04' }]);
  for (const stripped of [stripDocRecords(source, MIGRATED), docWithoutRecords(source, MIGRATED)]) {
    assert.deepEqual(stripped.workspaces[0].apps[0].items, []);
    assert.deepEqual(stripped.workspaces[0].apps[0].trash, []);
  }
  assert.equal(source.workspaces[0].apps[0].trash.length, 1, 'and the live document keeps it');
});

test('a merge puts the bin back with the records', () => {
  // Both are stripped before merging and re-hydrated after. Collecting only the live ones would
  // empty every bin on the first save conflict.
  const source = binned([{ id: 'r1', values: {} }], [{ id: 'r2', values: {}, deletedAt: '2026-09-04' }]);
  const rebuilt = hydrateDocRecords(stripDocRecords(source, MIGRATED), collectDocRecords(source));
  assert.deepEqual(rebuilt.workspaces[0].apps[0].items.map((i) => i.id), ['r1']);
  assert.deepEqual(rebuilt.workspaces[0].apps[0].trash.map((i) => i.id), ['r2']);
});

// ---- what the table could not take --------------------------------------------------------------
//
// A document array tolerates a repeated record id; a primary key cannot. On 2026-09-04 the live
// bins held 214 entries under 207 distinct ids -- six ids repeated, and not all for the same
// reason: some were one record deleted, restored, edited and deleted again inside half an hour,
// others were genuinely different records in different apps that shared an id because a Button
// move carried it across. One more id belonged to a record that is still live.
//
// Eight entries therefore cannot become rows. Dropping them on the strength of that would destroy
// exactly the entries nobody has looked at yet, so the document keeps them and only them.

test('a bin entry the table has no row for stays in the document', () => {
  const doc = { workspaces: [{ id: WS, apps: [{ id: 'app-1', items: [], trash: [{ id: 'orphan', values: { a: 1 } }] }] }] };
  hydrateDocRecords(doc, new Map());
  const [kept] = doc.workspaces[0].apps[0].trash;
  assert.equal(kept.id, 'orphan');
  assert.equal(kept.unmigrated, true, 'marked, so the save path knows to put it back');
});

test('and survives the strip that empties the rest of the bin', () => {
  // The invariant: the document holds only what the table does not.
  const doc = { workspaces: [{ id: WS, apps: [{ id: 'app-1', items: [], trash: [{ id: 'orphan', values: {} }] }] }] };
  hydrateDocRecords(doc, new Map());
  doc.workspaces[0].apps[0].trash.push({ id: 'has-a-row', values: {}, deletedAt: '2026-09-04' });

  for (const stripped of [stripDocRecords(doc, MIGRATED), docWithoutRecords(doc, MIGRATED)]) {
    assert.deepEqual(
      stripped.workspaces[0].apps[0].trash.map((e) => e.id),
      ['orphan'],
      'the one with a row goes, the one without stays',
    );
  }
});

test('a leftover is never diffed, so it cannot overwrite the record that owns its id', () => {
  // Its id belongs to a different record that does have a row. Seating it would insert over that
  // record, and once it left the bin it would ask the database to delete it.
  const doc = { workspaces: [{ id: WS, apps: [{ id: 'app-1', items: [], trash: [] }] }] };
  hydrateDocRecords(doc, new Map());
  doc.workspaces[0].apps[0].trash = [{ id: 'shared', values: { which: 'leftover' }, unmigrated: true }];

  const diff = diffRecordsAgainst(new Map(), doc);
  assert.deepEqual([diff.inserts.length, diff.updates.length, diff.trashes.length], [0, 0, 0]);
  assert.deepEqual(recordFingerprints(doc).size, 0, 'it is not part of the record set at all');
});

test('giving a leftover a fresh id is all it takes to migrate it', () => {
  // The invariant self-heals, which is what makes the eight a decision rather than a blocker.
  const doc = { workspaces: [{ id: WS, apps: [{ id: 'app-1', items: [], trash: [{ id: 'orphan', values: {}, unmigrated: true }] }] }] };
  doc.workspaces[0].apps[0].trash = [{ id: 'orphan-2', values: {}, deletedAt: '2026-09-04' }];
  const diff = diffRecordsAgainst(new Map(), doc);
  assert.deepEqual(diff.inserts.map((e) => e.item.id), ['orphan-2']);
  assert.deepEqual(diff.trashes.map((e) => e.item.id), ['orphan-2'], 'and it arrives already binned');
});
