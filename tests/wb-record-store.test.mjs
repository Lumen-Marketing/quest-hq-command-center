import assert from 'node:assert/strict';
import test from 'node:test';

import {
  appKey, collectDocRecords, describeRefusals, diffDocRecords, groupRecordRows,
  hydrateDocRecords, persistRecordDiff, recordRow, stripDocRecords,
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
  const items = byApp.get(appKey(WS, 'app-1'));
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

test('a linked app is left alone, because its records belong to the workspace that owns them', () => {
  const target = doc([], { extra: [{ id: 'app-2', linked: true, items: ['untouched'] }] });
  hydrateDocRecords(target, new Map());
  assert.deepEqual(target.workspaces[0].apps[1].items, ['untouched']);
  assert.deepEqual(stripDocRecords(target).workspaces[0].apps[1].items, ['untouched']);
});

test('the stored document carries no records', () => {
  const stripped = stripDocRecords(doc([{ id: 'r1', values: { a: 1 } }]));
  assert.deepEqual(stripped.workspaces[0].apps[0].items, []);
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
  const rebuilt = hydrateDocRecords(stripDocRecords(source), collectDocRecords(source));
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
