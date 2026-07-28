# Local Form Draft Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add same-browser automatic draft recovery to Contacts, Jobs, Quotes, and Underwriter without creating incomplete database records.

**Architecture:** A focused `src/drafts/form-drafts.js` module owns serialization, namespaced storage, expiry, restoration, debouncing, flushing, and cleanup. `src/main.js` supplies tenant/user context, marks the four protected forms, displays recovery/status controls, schedules captures from delegated form events, and clears drafts only after existing save paths succeed.

**Tech Stack:** Browser `localStorage`, JavaScript ES modules, Node's built-in test runner, Vite, existing Questbase HTML/CSS utilities.

## Global Constraints

- Do not start a local development or preview server.
- Drafts remain browser-local and never write to Supabase automatically.
- Scope every key by profile, company, workspace, form type, and record id.
- Exclude passwords, files, invite/auth tokens, secrets, and ignored controls.
- Expire drafts after seven days and purge the signing-out user's drafts.
- Keep a draft after validation or server failure; clear it only after confirmed save or explicit discard.
- Cover only Contacts, Jobs, Quotes, and Underwriter in this release.

---

### Task 1: Draft storage and form-control engine

**Files:**
- Create: `src/drafts/form-drafts.js`
- Create: `tests/form-drafts.test.mjs`

**Interfaces:**
- Produces: `createFormDraftContext(input)`, `draftStorageKey(context)`, `serializeDraftControls(controls)`, `restoreDraftControls(controls, values)`, `createDraftStore(options)`, and `createFormDraftManager(options)`.
- `createDraftStore({ storage, now, ttlMs })` returns `{ read, write, remove, purgeProfile }`.
- `createFormDraftManager({ store, delayMs, setTimer, clearTimer })` returns `{ capture, read, restore, clear, flush, flushAll, purgeProfile }`.

- [ ] **Step 1: Write failing behavior tests**

```js
test('serializes editable values without sensitive or file controls', () => {
  const values = serializeDraftControls([
    { name: 'name', type: 'text', value: 'Acme', dataset: {} },
    { name: 'password', type: 'password', value: 'hidden', dataset: {} },
    { name: 'photos', type: 'file', value: 'roof.jpg', dataset: {} },
    { name: 'urgent', type: 'checkbox', checked: true, dataset: {} },
  ]);
  assert.deepEqual(values, {
    name: { kind: 'value', value: 'Acme' },
    urgent: { kind: 'checkbox', checked: true },
  });
});

test('expires stale drafts and isolates every tenant dimension', () => {
  const storage = createMemoryStorage();
  let now = 1_000;
  const store = createDraftStore({ storage, now: () => now, ttlMs: 100 });
  const context = createFormDraftContext({
    profileId: 'person-a',
    companyId: 'company-a',
    workspaceId: 'workspace-a',
    formType: 'job',
    recordId: 'new',
  });
  assert.equal(store.write(context, { name: { kind: 'value', value: 'Roof' } }).ok, true);
  now = 1_101;
  assert.equal(store.read(context).draft, null);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --test tests/form-drafts.test.mjs`

Expected: FAIL because `src/drafts/form-drafts.js` and its exports do not exist.

- [ ] **Step 3: Implement the minimal engine**

Implement versioned keys beginning with `questbase.form-draft.v1`, safe control
serialization/restoration, seven-day storage records, malformed-entry cleanup,
non-throwing storage results, and a timer-injected debounced manager. The
manager must retain captured values after a form leaves the DOM and must support
`flushAll()` for `pagehide`.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `node --test tests/form-drafts.test.mjs`

Expected: all draft-engine tests pass.

- [ ] **Step 5: Commit the engine**

```powershell
git add -- src/drafts/form-drafts.js tests/form-drafts.test.mjs
git commit -m "Add local form draft engine"
```

### Task 2: Integrate the four Questbase workflows

**Files:**
- Modify: `src/main.js`
- Modify: `tests/form-drafts.test.mjs`

**Interfaces:**
- Consumes all Task 1 exports.
- Adds `formDraftContextFromDataset(dataset, profileId)` to `src/drafts/form-drafts.js`.
- Produces browser integration helpers `formDraftContext(form)`, `mountFormDraftRecovery()`, `captureProtectedFormDraft(target)`, `clearProtectedFormDraft(form)`, and `purgeSignedOutFormDrafts(profileId)`.

- [ ] **Step 1: Add failing integration-facing tests**

Extend the test file with a manager-level save lifecycle test:

```js
test('keeps a failed-save draft and removes it only after clear', () => {
  const storage = createMemoryStorage();
  const store = createDraftStore({ storage, now: () => 1_000 });
  const manager = createFormDraftManager({ store, delayMs: 0 });
  const context = contextFor('contact');
  manager.capture(context, [{ name: 'name', type: 'text', value: 'Recovered', dataset: {} }]);
  manager.flush(context);
  assert.equal(manager.read(context).draft.values.name.value, 'Recovered');
  manager.clear(context);
  assert.equal(manager.read(context).draft, null);
});
```

Add a dataset-to-context behavior test:

```js
test('builds a tenant-scoped context from a protected form dataset', () => {
  assert.deepEqual(formDraftContextFromDataset({
    draftCompanyId: 'company-a',
    draftWorkspaceId: 'workspace-a',
    draftType: 'quote',
    draftRecordId: 'quote-a',
  }, 'person-a'), {
    profileId: 'person-a',
    companyId: 'company-a',
    workspaceId: 'workspace-a',
    formType: 'quote',
    recordId: 'quote-a',
  });
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/form-drafts.test.mjs`

Expected: FAIL because the required lifecycle/context behavior is absent.

- [ ] **Step 3: Wire the forms and lifecycle**

In `src/main.js`:

1. Import the draft module.
2. Add `data-draft-form`, `data-draft-type`, `data-draft-record-id`,
   `data-draft-company-id`, and `data-draft-workspace-id` to Contacts, Jobs,
   Quotes, and Underwriter.
3. Mark the Underwriter contact selector `data-draft-ignore`.
4. Render one shared recovery/status strip in each protected form.
5. Mount recovery state after normal application rendering.
6. Capture `input` and `change` events through one delegated path.
7. Restore/discard through existing delegated click handling.
8. Run `syncUnderwritingForm()` after Underwriter restoration.
9. Clear the matching draft in each success branch of `saveContact`,
   `saveJob`, `saveDeal`, and `saveUnderwritingCase`.
10. Preserve drafts on every failed branch.
11. Flush pending drafts on `pagehide`.
12. Purge the current profile's namespace during explicit sign-out.

- [ ] **Step 4: Run focused and full tests**

Run: `node --test tests/form-drafts.test.mjs`

Expected: PASS.

Run: `npm.cmd test`

Expected: all repository tests pass.

- [ ] **Step 5: Commit workflow integration**

```powershell
git add -- src/main.js tests/form-drafts.test.mjs
git commit -m "Protect core forms with local drafts"
```

### Task 3: Make recovery visible and accessible

**Files:**
- Modify: `src/styles.css`
- Modify: `tests/form-drafts.test.mjs`

**Interfaces:**
- Consumes the recovery/status markup from Task 2.
- Produces responsive styles for `.form-draft-strip`, `.form-draft-recovery`, and state variants.

- [ ] **Step 1: Add a failing state-mapping test**

Move status selection into a pure exported `draftStatusView(state, updatedAt)`
function and test its semantic output:

```js
test('reports saving, saved, restored, discarded, and unavailable states', () => {
  assert.equal(draftStatusView('saving').label, 'Saving draft...');
  assert.equal(draftStatusView('saved', 1_000).tone, 'saved');
  assert.equal(draftStatusView('unavailable').tone, 'error');
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/form-drafts.test.mjs`

Expected: FAIL because `draftStatusView` is not implemented.

- [ ] **Step 3: Implement status mapping and styles**

Add compact neutral, saving, success, restored, and error tones. Keep the
strip full-width inside both two-column modal editors and the Underwriter
workbench. Buttons must remain keyboard accessible and stack at narrow widths.

- [ ] **Step 4: Run checks and production build**

Run: `npm.cmd run check`

Expected: tests, project-brain validation, build, and bundle budget pass.

- [ ] **Step 5: Commit presentation**

```powershell
git add -- src/drafts/form-drafts.js src/styles.css tests/form-drafts.test.mjs
git commit -m "Show form draft recovery status"
```

### Task 4: Record, deploy, and verify the release

**Files:**
- Modify: `.ai/context.md`
- Modify: `.ai/current-state.md`
- Modify: `.ai/architecture.md`
- Modify: `.ai/manifest.json`

**Interfaces:**
- Consumes the verified implementation.
- Produces current project-brain state and exact production evidence.

- [ ] **Step 1: Update project state**

Record local form draft recovery as a shipped product behavior, including its
same-browser limit, seven-day expiry, four-form scope, and no-Supabase-write
boundary. Refresh manifest timestamps and repository/deployment revision fields
after the final application commit is known.

- [ ] **Step 2: Validate and commit project state**

Run: `npm.cmd run ai:check`

Expected: project-brain validation passes.

```powershell
git add -- .ai/context.md .ai/current-state.md .ai/architecture.md .ai/manifest.json
git commit -m "Record local draft recovery"
```

- [ ] **Step 3: Run final verification**

Run: `npm.cmd run check`

Expected: all tests and the production build pass.

- [ ] **Step 4: Push the verified branch to main**

Confirm `origin/main` is still the implementation parent, then push the exact
verified HEAD to `main` using the repository's direct-delivery workflow.

- [ ] **Step 5: Verify Vercel and production**

Confirm the Vercel deployment is `READY` for the exact Git SHA. Run:

```powershell
$finalSha = git rev-parse HEAD
npm.cmd run smoke:prod -- --base-url https://www.questbase.io --expect-sha $finalSha
```

Expected: all production routes and entry assets pass.

Use the signed-in browser to verify Contacts, Jobs, Quotes, and Underwriter:
type a non-sensitive draft, close/reopen or navigate/reload, restore it, save,
and confirm no stale recovery prompt remains. Check browser and Vercel runtime
errors before reporting completion.
