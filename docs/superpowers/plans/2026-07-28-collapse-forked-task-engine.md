# Collapse the Forked Task Engine — Implementation Plan (main-corrected)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace the two parallel task implementations (host-native in `src/main.js` + the vendored `taskmanagement/` fork) with one deep, host-owned, injectable **Tasks module**, then delete the fork.

**Architecture:** Pure predicates in `src/tasks/task-shape.js`; the write protocol in `src/tasks/task-store.js` as `createTasks(deps)`, injectable (real Supabase client in prod, fake in tests), following the existing `src/lib/result.js` + `src/data/realtime-policy.js` pattern. Strangler cutover; delete the fork last.

**Tech Stack:** ES modules, Vite 7, `@supabase/supabase-js` v2, `node:test` + `node:assert/strict` (`npm test` = `node --test tests/*.mjs`).

## Global Constraints

- `node:test` only; no new deps.
- Injected `db` may be `null` — writes must no-op to a local-only success (mirror `if (client && isLiveSupabaseSession())`).
- **Tenant isolation is load-bearing:** the `tasks` table is multi-tenant (`workspace_id`, 93 refs app-wide). Every task **update** MUST scope `.eq('id', …).eq('workspace_id', payload.workspace_id)`, exactly as `main.js:28046` does today. Dropping it is a tenant-leak regression.
- Single row shape: `normalizeTask` (main.js). Single write shape: `taskPayload` (main.js). `taskPayload` is **not pure** on main (it calls `activeWorkspaceId()`), so it stays in `main.js` and is **injected** as `toPayload`.
- Reuse `src/lib/result.js` (`resultError`).
- Delete `taskmanagement/` only in the final task.
- Commit after every task. Never `--no-verify`.

## Baseline reality (main @ 3f0aa56, main.js = 38,719 lines)

- Pure/movable: `isOpenTask` (33256), `scopeToJob` (inlined `task.project_id === …`).
- Stays in main, injected: `normalizeTask` (34771, stamps `workspace_id` from input), `taskPayload` (35702, defaults `workspace_id`→`activeWorkspaceId()`, also has `deal_id`, `recurrence`).
- Write sites (insert/full-update): 8939, 8996, 9390, 12873, 13080, 28046-28047 (edit modal, compound tenant guard), 32854, 34900, 38377. Status update: 9262. Post-save: `runTaskSaveHooks` (27993).
- Bare field update (NOT a full save): 8238 `client.from('tasks').update({ contact_id }).eq('id', task.id)` inside contact-merge loop — handled explicitly in Task 5.
- `state.tasks` seed/replace sites: 3235, 3592 (demo), 32144 (`replaceCompanyRows`, realtime), 36496.
- Scope-filter read sites: 6848, 7446, 7721, 10623, 34241, 36989.

---

### Task 1: Pure task-shape module — DONE-CRITERIA below

**Files:** Create `src/tasks/task-shape.js`; Test `tests/task-shape.test.mjs`.

**Interfaces produced:**
- `isOpenTask(task) -> boolean` — true unless `status === 'done'`.
- `scopeToJob(task, jobId) -> boolean` — `String(task.project_id) === String(jobId)` and `jobId` truthy.

(`taskPayload` is NOT moved — it stays in main.js, injected as `toPayload`.)

- [ ] **Step 1: failing test** — `tests/task-shape.test.mjs` (see repo; asserts isOpenTask truth table + scopeToJob string coercion + empty jobId false).
- [ ] **Step 2:** `node --test tests/task-shape.test.mjs` → FAIL (module missing).
- [ ] **Step 3:** implement `src/tasks/task-shape.js` (isOpenTask, scopeToJob).
- [ ] **Step 4:** `node --test tests/task-shape.test.mjs` → PASS.
- [ ] **Step 5:** commit `feat(tasks): pure task-shape predicates`.

---

### Task 2: Tasks write store — `save` with tenant guard

**Files:** Create `src/tasks/task-store.js`; Test `tests/task-store.test.mjs`.

**Interfaces:**
- Consumes: `resultError` from `src/lib/result.js`.
- Produces: `createTasks({ db, isLive, normalize, toPayload, onChange }) -> { all, byId, seed, save }`.
  - `save(input)` → `{ ok, task, error? }`: optimistic apply → if `db && isLive()` build `payload = toPayload(optimistic)` → update path `.eq('id', payload.id).eq('workspace_id', payload.workspace_id)` / insert path → `normalize(result.data)` on success, rollback on error.

- [ ] **Step 1: failing test** — fake `db` capturing chained `.eq` calls; fake `toPayload` that stamps `workspace_id: 'ws-1'`; assert: insert on new; update carries **both** `id` and `workspace_id` eq; rollback on forced error; no db touch when `isLive()===false`.
- [ ] **Step 2:** `node --test tests/task-store.test.mjs` → FAIL.
- [ ] **Step 3:** implement store.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** commit `feat(tasks): injectable write store with workspace_id tenant guard`.

---

### Task 3: `setStatus` shares the guarded write path

**Files:** Modify `src/tasks/task-store.js`; Test append.

**Interface:** `setStatus(id, status)` resolves current task, routes `{ ...task, status, updated_at }` through `save` (so the tenant guard + full payload are never bypassed — fixes the bare `.update({status})` at main.js:9262).

- [ ] Step 1 failing test (setStatus writes full payload incl. workspace_id eq; unknown id → no-op fail). Step 2 FAIL. Step 3 implement. Step 4 PASS. Step 5 commit `feat(tasks): setStatus via guarded write`.

---

### CHECKPOINT — re-derive Tasks 4–7 against main topology

Before touching `main.js`, re-derive integration against the real sites listed in **Baseline reality**: how `state.tasks` is backed by `tasksStore.all()` across 4 seed/replace sites (incl. realtime `replaceCompanyRows` at 32144), injection point for `createTasks`, and per-site cutover order. Present to the user at this checkpoint.

### Task 4 (draft): wire store + cut over edit-task modal (28046) — inject `toPayload: taskPayload`, `normalize: normalizeTask`, `onChange: (t,p)=>{ notifyTaskChange(t,p); render(); }`. Keep `runTaskSaveHooks` after save. Verify: tests + build + real click.
### Task 5 (draft): migrate remaining full writes (8939/8996/9390/12873/13080/32854/34900/38377) + status toggle (9262→setStatus). The merge reassign (8238) gets the `workspace_id` guard added and is documented as an intentional bulk-field exception (not a full save).
### Task 6 (draft): repoint scope reads (6848/7446/7721/10623/34241/36989) to `scopeToJob`.
### Task 7 (draft): delete `taskmanagement/` + its `sync-spa-assets.mjs` copy; handle Tabler-icons link in `index.html`. `npm run check`.
