# Questbase Company Setup Survey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a post-company setup survey that safely generates workspaces, apps, pipeline stages, and non-owner roles, with a non-destructive Settings reset.

**Architecture:** A pure planning model converts answers or blueprints into a versioned plan. A lazy-loaded Settings/onboarding panel edits and applies that plan. Supabase stores cross-device progress and atomically applies validated, tenant-scoped configuration through security-definer RPCs; reset only reopens the survey and never deletes live business records.

**Tech Stack:** Vanilla ES modules, Vite, Node test runner, Supabase Postgres/RLS/RPC, existing Questbase CSS and routing conventions.

## Global Constraints

- Sync from the newest `origin/main` before modifications and once more before delivery.
- Do not add a company-type preset field to account creation.
- Do not add the setup profile to the eager application bootstrap.
- Do not create elevated owner/admin/developer roles from survey input.
- Do not delete companies, memberships, workspaces, customers, quotes, jobs, tasks, messages, files, or app records.
- Do not replace pipeline stages in a workspace containing contacts, quotes, or jobs.
- Keep the new interface and CSS lazy-loaded.
- Use test-first development for every behavior change.

---

### Task 1: Approved design and Windows baseline test

**Files:**
- Create: `docs/superpowers/specs/2026-08-08-company-setup-survey-design.md`
- Create: `docs/superpowers/plans/2026-08-08-company-setup-survey.md`
- Modify: `tests/extracted-module-references.test.mjs:1-20`

**Interfaces:**
- Consumes: the approved questionnaire PDF and current multi-tenant architecture.
- Produces: an executable plan and a cross-platform source-directory path for the existing extraction guard.

- [ ] **Step 1: Keep the reproduced Windows failure as evidence**

Run: `node --test tests/extracted-module-references.test.mjs`

Expected: FAIL with `ENOENT` containing `My%20PC`.

- [ ] **Step 2: Convert the module URL with the Node URL API**

```js
import { fileURLToPath } from 'node:url';

const srcDir = fileURLToPath(new URL('../src/', import.meta.url));
```

- [ ] **Step 3: Verify the focused baseline guard**

Run: `node --test tests/extracted-module-references.test.mjs`

Expected: PASS.

- [ ] **Step 4: Self-review and commit the approved design**

Run: `rg -n "T[B]D|T[O]DO|implement l[a]ter" docs/superpowers/specs/2026-08-08-company-setup-survey-design.md docs/superpowers/plans/2026-08-08-company-setup-survey.md`

Expected: no unresolved placeholder text.

Commit: `docs: record company setup survey design`

### Task 2: Pure setup planning model

**Files:**
- Create: `src/onboarding/company-setup-model.js`
- Create: `tests/company-setup-model.test.mjs`

**Interfaces:**
- Consumes: `answers: { mode, blueprint, goal, industry, layout, teams, tools }`.
- Produces: `normalizeCompanySetupAnswers(input)`, `answersForBlueprint(code)`, `buildCompanySetupPlan(answers)`, `validateCompanySetupPlan(plan)`, and exported blueprint/question constants.
- Plan shape: `{ version: 1, profile, workspaces: [{ key, name, isDefault, pluginIds, pipelineKind, stages }], roles: [{ key, name }], warnings: [] }`.

- [ ] **Step 1: Write failing tests for blank, guided, and blueprint flows**

```js
test('blank setup keeps only Main with no optional apps or roles', () => {
  const plan = buildCompanySetupPlan({ mode: 'blank' });
  assert.deepEqual(plan.workspaces.map(({ name, pluginIds }) => ({ name, pluginIds })), [
    { name: 'Main', pluginIds: [] },
  ]);
  assert.deepEqual(plan.roles, []);
});

test('roofing blueprint creates sales estimating and production without CRM conflicts', () => {
  const plan = buildCompanySetupPlan(answersForBlueprint('roofing'));
  assert.deepEqual(plan.workspaces.map((item) => item.key), ['sales', 'estimating', 'production']);
  assert.equal(plan.workspaces.every((item) => !(item.pluginIds.includes('crm') && item.pluginIds.includes('crm_2'))), true);
});
```

- [ ] **Step 2: Run the focused model tests and confirm the missing module failure**

Run: `node --test tests/company-setup-model.test.mjs`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement normalized choices, seven blueprints, workspace builders, role templates, pipeline profiles, and validation**

```js
export function buildCompanySetupPlan(rawAnswers = {}) {
  const answers = normalizeCompanySetupAnswers(rawAnswers);
  if (answers.mode === 'blank') return blankPlan();
  const workspaces = workspacePlanFor(answers).map((workspace, index) => ({
    ...workspace,
    isDefault: index === 0,
    pluginIds: compatiblePluginsFor(workspace, answers),
    pipelineKind: pipelineKindFor(workspace, answers),
    stages: stagesFor(workspace, answers),
  }));
  return validateCompanySetupPlan({ version: 1, profile: answers.industry, workspaces, roles: rolesFor(answers), warnings: [] });
}
```

- [ ] **Step 4: Add tests for custom deduplication, six-workspace cap, editable-name validation, plugin allowlist, 50-stage cap, and role-key safety**

Run: `node --test tests/company-setup-model.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the model**

Commit: `feat: add company setup planning model`

### Task 3: Tenant-safe Supabase setup state and application

**Files:**
- Create: `supabase/migrations/20260808HHMM_company_setup_survey.sql` using `supabase migration new company_setup_survey`
- Create: `tests/company-setup-migration.test.mjs`

**Interfaces:**
- Consumes: the plan shape from Task 2 and authenticated `auth.uid()`.
- Produces: `public.company_setup_profiles`, `public.apply_company_setup(text,jsonb,jsonb) returns jsonb`, `public.reset_company_setup(text) returns jsonb`, and a default-workspace trigger.

- [ ] **Step 1: Write the migration contract tests first**

```js
test('reset is explicitly non-destructive', () => {
  assert.match(sql, /update\s+public\.company_setup_profiles/i);
  assert.doesNotMatch(resetBody, /delete\s+from|truncate|update\s+public\.(contacts|deals|jobs|tasks|files)/i);
});

test('setup RPCs use fixed search paths and active company admin checks', () => {
  assert.match(sql, /set\s+search_path\s*=\s*''/i);
  assert.match(sql, /app_private\.is_company_admin/i);
});
```

- [ ] **Step 2: Run the contract tests and confirm the missing migration failure**

Run: `node --test tests/company-setup-migration.test.mjs`

Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Create the migration with explicit grants and RLS**

The table has `company_id text primary key references public.companies(id) on delete cascade`, JSONB answers/draft/applied columns, `status` constrained to `draft|applying|applied`, version, reset count, timestamps, and actor profile IDs. Revoke public/anon writes; grant authenticated SELECT; add a SELECT policy using active company membership/admin access. RPC EXECUTE is granted only to authenticated.

- [ ] **Step 4: Add default-workspace trigger and safe backfill**

The trigger inserts `Main` only when no active default exists, then copies baseline pipeline stages. The backfill targets only companies missing an active default. Use conflict-safe inserts and never modify existing company/workspace names or records.

- [ ] **Step 5: Implement atomic validated apply behavior**

Validate payload byte size, version, workspace count 1-6, unique stable keys, names, known plugin IDs, role keys from the server allowlist, and stages 1-50. Reuse the default workspace for the first item; upsert later survey-managed workspaces via IDs stored in the previous applied plan; archive only obsolete survey-managed empty workspaces. Activate desired workspace plugins while preserving their records. Keep CRM variants mutually exclusive. Replace stages only when no contacts, deals, or jobs exist. Upsert non-system role templates from a server permission map and keep removed roles intact.

- [ ] **Step 6: Implement non-destructive reset**

```sql
update public.company_setup_profiles
set answers = '{}'::jsonb,
    draft_plan = '{}'::jsonb,
    status = 'draft',
    reset_count = reset_count + 1,
    reset_at = now(),
    updated_at = now(),
    updated_by = auth.uid()
where company_id = target_company_id;
```

The existing `applied_plan` is retained as the idempotency map, and every business table remains untouched.

- [ ] **Step 7: Run migration tests and tenancy checks**

Run: `node --test tests/company-setup-migration.test.mjs`

Run: `npm.cmd run tenancy:check`

Expected: PASS.

- [ ] **Step 8: Commit the database contract**

Commit: `feat: add safe company setup persistence`

### Task 4: Lazy setup panel and Settings reset

**Files:**
- Create: `src/onboarding/company-setup-panel.js`
- Create: `src/onboarding/company-setup.css`
- Create: `tests/company-setup-panel.test.mjs`
- Modify: `src/main.js` at lazy-module declarations, company creation routes, Settings tabs, render dispatch, and click delegation.

**Interfaces:**
- Consumes: `{ supabase, companyId, company, canManage, onApplied, onNavigate }` and Task 2 exports.
- Produces: `createCompanySetupPanel(context)` returning `{ render(), handleAction(action, target), mount(root), open({ fresh }) }`.
- Database calls: `.from('company_setup_profiles').select(...).eq('company_id', companyId).maybeSingle()`, `.rpc('apply_company_setup', ...)`, `.rpc('reset_company_setup', ...)`.

- [ ] **Step 1: Write static integration tests for lazy loading and onboarding routing**

Assert that `main.js` dynamically imports both setup JS and CSS, renders a `Setup` Settings tab for company admins, redirects a newly created company to `settings?tab=setup`, and no longer renders the account-creation `Company type` select.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node --test tests/company-setup-panel.test.mjs`

Expected: FAIL because the panel and integration do not exist.

- [ ] **Step 3: Implement the panel state machine**

States: loading, entry, guided-question, blueprint-picker, review, applying, applied, reset-confirmation, and error. Persist answers as local panel state until Apply; load an existing profile lazily; retain Review state on apply errors. Render progress and back controls, a persistent Start from scratch action, editable review fields, entitlement/pipeline warnings, and readable success/retry messages.

- [ ] **Step 4: Implement safe reset copy and behavior**

The confirmation must say: `This clears the setup answers and reopens the guide. It does not delete your company, people, workspaces, customers, jobs, tasks, files, or messages.` The confirm action calls only `reset_company_setup`, clears local answers, and returns to entry.

- [ ] **Step 5: Integrate with company creation and Settings**

Add a memoized lazy module loader, a `Setup` Settings tab, click delegation for `company-setup-*`, and post-create navigation. Keep operational workspace preset creation unchanged.

- [ ] **Step 6: Add namespaced responsive CSS and verify static tests**

At widths below 760px, use one-column cards, full-width actions, compact progress labels, and 16px form controls to avoid mobile zoom. No global selectors outside `.company-setup-*` and `[data-company-setup-root]`.

Run: `node --test tests/company-setup-panel.test.mjs tests/company-setup-model.test.mjs tests/extracted-module-references.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit the interface**

Commit: `feat: add guided company setup and safe reset`

### Task 5: Project brain and full verification

**Files:**
- Modify: `.ai/current-state.md`
- Modify: `.ai/architecture.md`
- Modify: `.ai/database/overview.md`
- Modify: `.ai/database/schema.md`
- Modify: `.ai/database/functions.md`
- Modify: `.ai/database/security.md`
- Modify: `.ai/database/relationships.md`
- Modify: `.ai/manifest.json`
- Modify: `.ai/snapshot.json` if the repository refresh command updates it.

**Interfaces:**
- Consumes: implemented migration and UI behavior.
- Produces: canonical documentation of the setup lifecycle, table, RPCs, RLS, reset guarantee, and default-workspace invariant.

- [ ] **Step 1: Update the project brain immediately after schema completion**

Document that setup state is lazy, apply/reset are admin-only RPCs, reset is non-destructive, generated roles are non-elevated, and every company has a default operational workspace.

- [ ] **Step 2: Run focused and full checks**

Run: `npm.cmd test`

Run: `npm.cmd run ai:check`

Run: `npm.cmd run tenancy:check`

Run: `npm.cmd run build`

Expected: all commands exit 0.

- [ ] **Step 3: Review the change set for scope and secrets**

Run: `git diff --check`

Run: `git status --short`

Run: `git diff --stat origin/main...HEAD`

Expected: only setup-survey, baseline-test, migration, and canonical brain changes; no credentials or generated local artifacts.

- [ ] **Step 4: Commit verification documentation**

Commit: `docs: record company setup architecture`

### Task 6: Live migration, merge, deploy, and production verification

**Files:**
- No new source files unless verification exposes a defect.

**Interfaces:**
- Consumes: a green feature branch based on latest `origin/main`.
- Produces: live Supabase schema/functions and a Vercel production deployment from `main`.

- [ ] **Step 1: Fetch and integrate any newly published main changes**

Run: `git fetch origin`

Run: `git rebase origin/main`

Expected: clean rebase; if conflicts exist, preserve both newer main behavior and setup behavior, then rerun full checks.

- [ ] **Step 2: Apply the reviewed migration to the linked Supabase project**

Use the Supabase migration API, then list migrations and run database advisors. Verify the new migration is present and no new security/performance advisor errors were introduced.

- [ ] **Step 3: Run a rollback-only SQL integration exercise**

Within one transaction, create a synthetic company owned by an existing test/admin profile, apply a two-workspace plan twice, assert stable workspace/role counts, reset answers, assert all configured rows remain, and roll back. Return only aggregate assertions, never personal data.

- [ ] **Step 4: Push the reviewed commit to main and allow the Git-connected Vercel deployment**

Confirm `origin/main` did not advance after the final rebase, then push the fast-forward change. Do not use the original dirty checkout for merge operations.

- [ ] **Step 5: Verify production**

Confirm the production deployment is Ready, run `npm.cmd run smoke:prod`, and exercise the signed-in Setup tab: load, review, apply, refresh persistence, reset answers, and verify the company and configured records remain.

- [ ] **Step 6: Report exact delivery evidence**

Include the main commit, Vercel production URL/deployment, migration version, full check results, and the safe-reset behavior in the final handoff.
