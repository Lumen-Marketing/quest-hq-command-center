import assert from 'node:assert/strict';
import test from 'node:test';

import { createTasks } from '../src/tasks/task-store.js';

// Minimal fake of the supabase-js query builder for the `tasks` table.
// Records every op + payload + the accumulated .eq() guards so tests can assert
// the tenant-scoped update guard is present.
function fakeDb({ failOn = null } = {}) {
  const calls = [];
  const makeBuilder = (op, payload) => {
    const eq = {};
    const builder = {
      eq(col, val) { eq[col] = val; return this; },
      select() { return this; },
      single() {
        calls.push({ op, payload, eq });
        if (failOn === op) return Promise.resolve({ data: null, error: { message: `boom-${op}` } });
        return Promise.resolve({ data: { ...payload, updated_at: 'server-ts' }, error: null });
      },
    };
    return builder;
  };
  return {
    calls,
    from(table) {
      assert.equal(table, 'tasks');
      return {
        insert: (payload) => makeBuilder('insert', payload),
        update: (payload) => makeBuilder('update', payload),
      };
    },
  };
}

// normalize keeps a workspace_id straight through; store never invents one.
const normalize = (row) => ({ status: 'todo', project_id: '', workspace_id: '', ...row });
// toPayload mirrors main.js taskPayload: it resolves the active workspace.
const toPayload = (task) => ({ ...task, workspace_id: task.workspace_id || 'ws-active' });

test('save inserts a new task, applies optimistically, fires onChange once', async () => {
  const changes = [];
  const db = fakeDb();
  const store = createTasks({ db, isLive: () => true, normalize, toPayload, onChange: (t, p) => changes.push([t.id, p]) });
  const res = await store.save({ id: 't1', title: 'New' });
  assert.equal(res.ok, true);
  assert.equal(db.calls[0].op, 'insert');
  assert.equal(store.byId('t1').updated_at, 'server-ts'); // re-normalized from server row
  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0], ['t1', null]);
});

test('save updates an existing task scoped by BOTH id and workspace_id', async () => {
  const db = fakeDb();
  const store = createTasks({ db, isLive: () => true, normalize, toPayload, onChange() {} });
  store.seed([{ id: 't1', title: 'Old', workspace_id: 'ws-7' }].map(normalize));
  const res = await store.save({ id: 't1', title: 'Edited', workspace_id: 'ws-7' });
  assert.equal(res.ok, true);
  assert.equal(db.calls[0].op, 'update');
  assert.equal(db.calls[0].eq.id, 't1');
  assert.equal(db.calls[0].eq.workspace_id, 'ws-7'); // tenant guard present
  assert.equal(store.byId('t1').title, 'Edited');
});

test('a DB error rolls the optimistic apply back to the previous list', async () => {
  const db = fakeDb({ failOn: 'update' });
  const store = createTasks({ db, isLive: () => true, normalize, toPayload, onChange() {} });
  store.seed([{ id: 't1', title: 'Old', workspace_id: 'ws-7' }].map(normalize));
  const res = await store.save({ id: 't1', title: 'Edited', workspace_id: 'ws-7' });
  assert.equal(res.ok, false);
  assert.equal(store.byId('t1').title, 'Old'); // rolled back
});

test('with no live session the store stays local and never touches db', async () => {
  const db = fakeDb();
  const store = createTasks({ db, isLive: () => false, normalize, toPayload, onChange() {} });
  const res = await store.save({ id: 't1', title: 'Local' });
  assert.equal(res.ok, true);
  assert.equal(store.byId('t1').title, 'Local');
  assert.equal(db.calls.length, 0);
});

test('a null db keeps the store local-only', async () => {
  const store = createTasks({ db: null, isLive: () => true, normalize, toPayload, onChange() {} });
  const res = await store.save({ id: 't1', title: 'Local' });
  assert.equal(res.ok, true);
  assert.equal(store.byId('t1').title, 'Local');
});

test('setStatus routes through the guarded write (full payload + tenant eq, no bare update)', async () => {
  const db = fakeDb();
  const store = createTasks({ db, isLive: () => true, normalize, toPayload, onChange() {} });
  store.seed([{ id: 't1', title: 'X', status: 'todo', workspace_id: 'ws-7' }].map(normalize));
  const res = await store.setStatus('t1', 'done');
  assert.equal(res.ok, true);
  assert.equal(store.byId('t1').status, 'done');
  assert.equal(db.calls[0].op, 'update');
  assert.equal('title' in db.calls[0].payload, true);   // full payload, not a bare { status }
  assert.equal(db.calls[0].payload.status, 'done');
  assert.equal(db.calls[0].eq.workspace_id, 'ws-7');     // tenant guard preserved
});

test('setStatus on an unknown id is a no-op failure', async () => {
  const db = fakeDb();
  const store = createTasks({ db, isLive: () => true, normalize, toPayload, onChange() {} });
  const res = await store.setStatus('missing', 'done');
  assert.equal(res.ok, false);
  assert.equal(db.calls.length, 0);
});
