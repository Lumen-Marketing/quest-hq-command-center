// Pure task predicates shared by the host UI and the Tasks write store.
// Dependency-free by design so both sides agree on one definition and the
// predicates are testable in isolation. The `tasks` row write shape lives in
// main.js (`taskPayload`) because it resolves the active workspace; it is
// injected into the store rather than duplicated here.

export function isOpenTask(task) {
  return task.status !== 'done';
}

export function scopeToJob(task, jobId) {
  return !!jobId && String(task.project_id || '') === String(jobId);
}
