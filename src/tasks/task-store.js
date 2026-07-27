// The single owner of the `tasks` table write path. Owns the whole protocol:
// optimistic apply -> guarded DB write -> rollback on error -> onChange. The
// data client, live-session check, row normalizer, and write-payload builder
// are injected, so production passes the real Supabase client and tests pass a
// fake. The interface is the test surface.
//
// Tenant isolation: `tasks` is multi-tenant. Updates are always scoped by BOTH
// id and workspace_id, matching the guard the host used inline (main.js edit
// modal). setStatus routes through save so it can never bypass that guard.
import { resultError } from '../lib/result.js';

export function createTasks({ db, isLive, normalize, toPayload, onChange }) {
  let tasks = [];

  const indexOf = (id) => tasks.findIndex((t) => t.id === id);
  const put = (task) => {
    const i = indexOf(task.id);
    if (i >= 0) tasks[i] = task;
    else tasks.unshift(task);
  };

  function all() { return tasks; }
  function byId(id) { return tasks.find((t) => t.id === id) || null; }
  function seed(next) { tasks = Array.isArray(next) ? next.slice() : []; }

  async function save(input) {
    const previous = byId(input.id);
    const optimistic = normalize(input);
    const snapshot = tasks.slice();
    put(optimistic); // optimistic apply

    if (!db || !isLive()) {
      onChange(optimistic, previous || null);
      return { ok: true, task: optimistic };
    }

    const exists = !!previous;
    const payload = toPayload(optimistic);
    const query = exists
      ? db.from('tasks').update(payload).eq('id', payload.id).eq('workspace_id', payload.workspace_id).select().single()
      : db.from('tasks').insert(payload).select().single();

    const result = await Promise.resolve(query).catch((error) => ({ error }));
    const error = resultError(result);
    if (error || !result.data) {
      tasks = snapshot; // rollback
      return { ok: false, task: previous || optimistic, error: error || new Error('Task write returned no record.') };
    }

    const saved = normalize(result.data);
    put(saved);
    onChange(saved, previous || null);
    return { ok: true, task: saved };
  }

  return { all, byId, seed, save };
}
