# Recoverable Deletes and Record History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add same-actor one-click Undo for recent safe deletes and an authorized, database-captured history for Contacts, Quotes, Jobs, and Tasks.

**Architecture:** Extend the existing Recycle Bin with one narrow
`recycle_undo_item` RPC, and create a separate append-only `record_history`
ledger populated by fixed-search-path database triggers. A small browser module
normalizes and describes history data; `src/main.js` lazily queries one record
at a time and exposes History from Contact, Quote, and Job headers.

**Tech Stack:** PostgreSQL/Supabase RLS and triggers, Supabase JavaScript client,
JavaScript ES modules, Node's built-in test runner, Vite, existing Questbase
modal/toast utilities.

## Global constraints

- Do not start a local development or preview server.
- Preserve the existing 30-day Recycle Bin and `settings.manage` restore path.
- Keep authorization on the server; "no permission gates" applies to assistant
  workflow, not product security.
- Never trust company, workspace, source table, actor, permission, or time values
  supplied by the browser.
- Give authenticated clients SELECT-only access to `record_history`.
- Query history on demand by exact company, workspace, type, and record id.
- Do not store contact details, addresses, notes, descriptions, or secrets in
  history changes.
- Use tests first for each behavior change.

---

### Task 1: Pure record-history model

**Files:**
- Create: `src/history/record-history.js`
- Create: `tests/record-history.test.mjs`

**Interfaces:**
- Produces `normalizeRecordHistoryEvent(input)`.
- Produces `recordHistoryFor(events, scope)`.
- Produces `historyFieldLabel(recordType, field)`.
- Produces `describeRecordHistoryEvent(event)`.
- Produces `formatHistoryValue(value)`.

- [ ] **Step 1: Write failing behavior tests**

Cover malformed input normalization, strict company/workspace/type/id filtering,
newest-first sorting, field labels, create/update/delete/restore summaries,
null/boolean/number/array formatting, and safe handling of malformed `changes`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --test tests/record-history.test.mjs`

Expected: FAIL because `src/history/record-history.js` does not exist.

- [ ] **Step 3: Implement the smallest pure module**

Normalize untrusted database rows, allow only supported actions and record
types, derive friendly labels from a fixed map, and return inert strings/data
for the renderer to escape.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `node --test tests/record-history.test.mjs`

Expected: all record-history model tests pass.

- [ ] **Step 5: Commit the model**

```powershell
git add -- src/history/record-history.js tests/record-history.test.mjs
git commit -m "Add record history presentation model"
```

### Task 2: Database ledger, triggers, RLS, and Undo RPC

**Files:**
- Create: `supabase/migrations/<generated>_record_history_and_recent_delete_undo.sql`
- Create: `tests/record-history-migration.test.mjs`
- Modify: `tests/recycle-bin-static.test.mjs`

**Interfaces:**
- Produces `public.record_history`.
- Produces `app_private.capture_record_history()`.
- Produces four history triggers on `contacts`, `deals`, `jobs`, and `tasks`.
- Produces `public.recycle_undo_item(p_item_id text)`.

- [ ] **Step 1: Generate the migration filename with the Supabase CLI**

Run: `npx supabase migration new record_history_and_recent_delete_undo`

- [ ] **Step 2: Write failing migration contract tests**

Assert append-only grants, enabled RLS, workspace membership and per-type view
permissions, fixed search paths, trigger coverage, whitelisted change capture,
and Undo's actor/time/source/manage-permission checks.

- [ ] **Step 3: Run focused tests and verify RED**

Run:
`node --test tests/record-history-migration.test.mjs tests/recycle-bin-static.test.mjs`

Expected: FAIL because the generated migration does not implement the contract.

- [ ] **Step 4: Implement the migration**

Create the append-only ledger and indexes, the SELECT policy, a trigger-only
capture function with explicit whitelists, all four triggers, and the actor-only
Undo RPC. Revoke unsafe defaults and grant only required access.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:
`node --test tests/record-history-migration.test.mjs tests/recycle-bin-static.test.mjs`

Expected: all migration and Recycle Bin contract tests pass.

- [ ] **Step 6: Commit the database contract**

```powershell
git add -- supabase/migrations tests/record-history-migration.test.mjs tests/recycle-bin-static.test.mjs
git commit -m "Add secure record history and recent delete undo"
```

### Task 3: Actionable toast and same-actor Undo

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Modify: `tests/recycle-bin-static.test.mjs`

**Interfaces:**
- Extends `showToast(message, mode, title, options)` with a validated action
  descriptor and configurable duration.
- Produces `undoRecycleDelete(itemId)`.
- Handles `data-action="undo-recycle-delete"`.

- [ ] **Step 1: Add failing browser-integration contracts**

Assert toast action rendering, delegated Undo handling, use of the returned
Recycle Bin id, the `recycle_undo_item` RPC, a ten-second toast, local fallback,
and the absence of a client-side `settings.manage` check in the Undo function.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/recycle-bin-static.test.mjs`

Expected: FAIL on the new Undo assertions.

- [ ] **Step 3: Implement actionable toast and Undo**

Keep toast actions as escaped data attributes rather than callbacks. Disable
the clicked button while the request runs, use the server-returned Recycle Bin
row, restore local state only after success, and leave silent/batch deletes
unchanged.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/recycle-bin-static.test.mjs`

Expected: all Recycle Bin integration contracts pass.

- [ ] **Step 5: Commit Undo integration**

```powershell
git add -- src/main.js src/styles.css tests/recycle-bin-static.test.mjs
git commit -m "Offer immediate undo after safe deletes"
```

### Task 4: On-demand record history UI

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Create: `tests/record-history-static.test.mjs`

**Interfaces:**
- Adds `state.recordHistory`.
- Produces `openRecordHistory(input)`, `loadRecordHistory(input)`, and
  `renderRecordHistoryModal()`.
- Handles `data-action="open-record-history"`.

- [ ] **Step 1: Write failing UI contracts**

Assert History actions on Contact, Quote, and Job headers, the modal route,
exact company/workspace/type/id filters, descending order with limit 50,
loading/empty/error states, lazy import of the model, escaped values, and no
global startup query.

- [ ] **Step 2: Run focused tests and verify RED**

Run:
`node --test tests/record-history.test.mjs tests/record-history-static.test.mjs`

Expected: model tests pass and new UI contracts fail.

- [ ] **Step 3: Implement the UI**

Add header actions, delegated opening, a body-safe modal, on-demand Supabase
query, actor resolution, readable change rows, and responsive styling.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:
`node --test tests/record-history.test.mjs tests/record-history-static.test.mjs`

Expected: all history tests pass.

- [ ] **Step 5: Commit the UI**

```powershell
git add -- src/main.js src/styles.css tests/record-history-static.test.mjs
git commit -m "Show workspace-scoped record history"
```

### Task 5: Apply and verify Supabase migration

**Files:**
- Modify: `.ai/context/database-map.md`
- Modify: `.ai/current-state.md`
- Modify: `.ai/manifest.json`

- [ ] **Step 1: Run the complete pre-migration release gate**

Run: `npm.cmd run check`

Expected: tests, context validation, build, asset sync, and bundle budget pass.

- [ ] **Step 2: Review live metadata and migration diff**

Confirm target objects do not already exist, all referenced columns and helper
functions exist, and the migration does not alter unrelated live objects.

- [ ] **Step 3: Apply the forward-only migration**

Use the connected Supabase project to apply the generated SQL exactly once.

- [ ] **Step 4: Verify database behavior and security**

Inspect table, policy, trigger, function, and grant metadata. Run Supabase
security and performance advisors and address feature-caused findings.

- [ ] **Step 5: Refresh the project brain**

Update the database map, current state, and manifest with metadata only; never
include production row data or secrets.

- [ ] **Step 6: Run the complete post-migration release gate**

Run: `npm.cmd run check`

Expected: the full release gate remains green.

- [ ] **Step 7: Commit live-state documentation**

```powershell
git add -- .ai/context/database-map.md .ai/current-state.md .ai/manifest.json
git commit -m "Record live recoverability architecture"
```

### Task 6: Publish and production verification

**Files:**
- Modify only if verification finds an in-scope defect.

- [ ] **Step 1: Review final branch scope**

Run:

```powershell
git status --short
git diff --check origin/main...HEAD
git log --oneline origin/main..HEAD
```

- [ ] **Step 2: Push the verified commits to GitHub `main`**

Confirm remote `main` has not moved, then fast-forward/push the intended commit
range without including unrelated work.

- [ ] **Step 3: Deploy the exact GitHub commit to Vercel**

Wait for the Questbase production deployment to reach READY and verify that the
deployed commit matches GitHub `main`.

- [ ] **Step 4: Run production smoke and signed-in verification**

Run the repository production smoke against `https://www.questbase.io`, then
verify History opens within the active workspace and a disposable same-actor
delete can be undone without browser errors. Clean up any test data.

- [ ] **Step 5: Record final production truth**

Update `.ai/current-state.md` and `.ai/manifest.json` with the exact GitHub SHA,
Vercel deployment id, verification results, and remaining scope, then commit and
push the documentation-only update.

- [ ] **Step 6: Verify final parity**

Confirm local HEAD, GitHub `main`, Vercel production source SHA, and project
brain all identify the same released implementation.
