import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const storeSource = readFileSync(
  new URL('../taskmanagement/js/services/SupabaseDataStore.js', import.meta.url),
  'utf8',
);

function createStore() {
  const App = {};
  const context = { App, console, window: { App } };
  vm.runInNewContext(storeSource, context, { filename: 'SupabaseDataStore.js' });
  return new App.SupabaseDataStore({
    supabase: {},
    currentUser: 'member-1',
    role: 'member',
    workspaceId: 'workspace-1',
  });
}

function task(overrides = {}) {
  return {
    id: 'task-1',
    title: 'Original title',
    description: 'Original description',
    priority: 'medium',
    watchers: ['member-1'],
    subtasks: [],
    activity: [],
    ...overrides,
  };
}

test('task conflict merge keeps a remote edit to a different field', () => {
  const store = createStore();
  const base = task();
  store._rememberTaskBase(base);

  const local = task({ title: 'My revised title' });
  const server = task({ description: 'Description changed by another user' });
  const merged = store._mergeConflict(server, local);

  assert.equal(merged.title, 'My revised title');
  assert.equal(merged.description, 'Description changed by another user');
  assert.equal(merged.priority, 'medium');
});

test('task conflict merge keeps the local value when both users edit the same field', () => {
  const store = createStore();
  const base = task();
  store._rememberTaskBase(base);

  const local = task({ title: 'My title' });
  const server = task({ title: 'Their title', priority: 'urgent' });
  const merged = store._mergeConflict(server, local);

  assert.equal(merged.title, 'My title');
  assert.equal(merged.priority, 'urgent');
});
