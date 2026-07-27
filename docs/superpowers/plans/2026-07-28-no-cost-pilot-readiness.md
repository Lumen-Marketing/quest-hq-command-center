# No-Cost Pilot Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the launch-readiness work Questbase can ship before banking,
payment-provider, DNS, and dedicated-mailbox decisions are available.

**Architecture:** Preserve the current company/workspace/auth/billing model.
Derive onboarding progress from already-loaded state, expose the existing
Supabase support endpoint through the main shell, and keep manual billing as the
safe provider-independent gate. No database migration is required.

**Tech Stack:** Vite, browser JavaScript, Node test runner, Supabase Edge
Functions, Vercel Git deployment.

## Global Constraints

- Do not start a local application or preview server.
- Do not change TaskManagement tenancy or create a second task model.
- Do not add database state for first-run onboarding.
- Do not commit secrets, bank details, production rows, or auth-user records.
- Preserve manual company approval and invite-only worker access.
- Use tests first for every production behavior change.

---

### Task 1: Reconcile the latest-main Contacts launch test

**Files:**
- Modify: `tests/lead-quote-crm-static.test.mjs`

**Interfaces:**
- Consumes: `renderContactFieldGroupsSidebar(companyId)` and the current Contacts
  table layout from `src/main.js`.
- Produces: a test that protects the active sidebar filter experience instead
  of the removed duplicate toolbar filter.

- [ ] **Step 1: Confirm the existing failure**

Run:

```powershell
node --test tests/lead-quote-crm-static.test.mjs
```

Expected: FAIL because `renderContactTable` no longer calls
`renderContactFilterBar(companyId)`.

- [ ] **Step 2: Update the assertion to the current behavior**

Assert that the Contacts page composes `renderContactFieldGroupsSidebar` beside
the table and that the sidebar exposes real `set-contact-filter` and
`clear-contact-filters` actions. Remove assertions that require the retired
duplicate toolbar control.

- [ ] **Step 3: Verify the focused test**

Run:

```powershell
node --test tests/lead-quote-crm-static.test.mjs
```

Expected: PASS.

### Task 2: Add derived pilot onboarding and a safe worker landing

**Files:**
- Create: `src/launch/pilot-readiness.js`
- Create: `tests/pilot-readiness.test.mjs`
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Modify: `tests/company-invite-launch.test.mjs`

**Interfaces:**
- Consumes: counts and flags already available in the browser state.
- Produces:
  `buildPilotChecklist({ hasWorkspace, installedPluginCount, activeMemberCount,
  pendingInviteCount, customerRecordCount, taskCount })` returning `{ steps,
  completed, total, done }`.

- [ ] **Step 1: Write failing helper tests**

Cover these literal behaviors:

```js
assert.deepEqual(
  buildPilotChecklist({
    hasWorkspace: true,
    installedPluginCount: 2,
    activeMemberCount: 1,
    pendingInviteCount: 0,
    customerRecordCount: 0,
    taskCount: 0,
  }).steps.map((step) => step.complete),
  [true, true, false, false, false],
);
```

Also cover a pending invite satisfying the teammate step and all five steps
producing `done: true`.

- [ ] **Step 2: Run the helper test and observe RED**

Run:

```powershell
node --test tests/pilot-readiness.test.mjs
```

Expected: FAIL because `src/launch/pilot-readiness.js` does not exist.

- [ ] **Step 3: Implement the pure helper**

Return stable step ids for `workspace`, `apps`, `team`, `customer`, and `task`.
Each step carries a short label and completion boolean. Compute `completed`,
`total`, and `done` without browser globals.

- [ ] **Step 4: Verify helper GREEN**

Run:

```powershell
node --test tests/pilot-readiness.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Write failing browser-composition assertions**

Extend the invite test to require `acceptCompanyInvite` to navigate to
`companyPath('dashboard', {}, companyId)`. Add a focused static test requiring
the dashboard to call the pure checklist helper and render links for workspace
settings, access/invites, Contacts, and Tasks.

- [ ] **Step 6: Run and observe RED**

Run:

```powershell
node --test tests/company-invite-launch.test.mjs tests/pilot-readiness.test.mjs
```

Expected: FAIL on the existing Jobs redirect and missing dashboard checklist.

- [ ] **Step 7: Implement owner checklist and worker redirect**

Import the helper in `src/main.js`. Render the checklist only for users who can
manage company/workspace setup and only while it is incomplete. Derive progress
from the active operational workspace, active workspace plugins, company
members/invites, Contacts/Jobs, and Tasks. Redirect accepted invites to the
dashboard.

- [ ] **Step 8: Add responsive checklist styling and verify GREEN**

Run:

```powershell
node --test tests/company-invite-launch.test.mjs tests/pilot-readiness.test.mjs
```

Expected: PASS.

### Task 3: Expose and harden Questbase support

**Files:**
- Create: `supabase/functions/report-problem/cors.js`
- Create: `tests/report-problem-launch.test.mjs`
- Modify: `supabase/functions/report-problem/index.ts`
- Modify: `supabase/functions/report-problem/README.md`
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Modify: `.env.example`

**Interfaces:**
- Consumes: the current Supabase session and the deployed `report-problem`
  function.
- Produces:
  `corsHeadersForOrigin(origin, configuredOrigins)` and an account-menu support
  modal that invokes `report-problem`.

- [ ] **Step 1: Record the live CORS failure**

Send an OPTIONS request with origin `https://www.questbase.io`.

Expected: HTTP 200 with no `Access-Control-Allow-Origin` header.

- [ ] **Step 2: Write failing tests**

Test that the CORS helper allows all three production origins, accepts extra
configured origins, and rejects an unrelated origin. Test that the main shell
contains a Help & support action, bounded report fields, `functions.invoke(
'report-problem')`, and a support-email fallback.

- [ ] **Step 3: Run and observe RED**

Run:

```powershell
node --test tests/report-problem-launch.test.mjs
```

Expected: FAIL because the helper and main-shell support surface do not exist.

- [ ] **Step 4: Implement CORS and support UI**

Use these built-in origins:

```js
[
  'https://quest-hq-command-center-gamma.vercel.app',
  'https://questbase.io',
  'https://www.questbase.io',
]
```

The modal sends `{ type, description, context }`. On success it closes and
shows a confirmation. On error it remains open, displays the error, and keeps
the existing email fallback visible.

- [ ] **Step 5: Verify local GREEN**

Run:

```powershell
node --test tests/report-problem-launch.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Deploy and verify the Edge Function**

Deploy `report-problem` with custom JWT validation unchanged. Repeat the
production-origin OPTIONS request.

Expected: HTTP 200 with
`Access-Control-Allow-Origin: https://www.questbase.io`.

### Task 4: Finish provider-independent email and payment preparation

**Files:**
- Modify: `supabase/functions/send-company-invite/index.ts`
- Create: `supabase/functions/send-company-invite/README.md`
- Create: `docs/operations/pilot-onboarding-rehearsal.md`
- Create: `docs/operations/provider-handoff.md`
- Modify: `docs/qa/production-checklist.md`
- Modify: `.ai/current-state.md`
- Modify: `.ai/operations.md`
- Modify: `.ai/known-issues.md`
- Modify: `.ai/manifest.json`

**Interfaces:**
- Consumes: existing Resend variables and manual billing mode.
- Produces: multipart invite content, a repeatable owner/worker rehearsal, and
  a non-secret owner/provider handoff.

- [ ] **Step 1: Write the invite regression assertion**

Require the Resend payload to include a plain-text alternative derived
server-side.

- [ ] **Step 2: Run and observe RED**

Run:

```powershell
node --test tests/company-invite-launch.test.mjs
```

Expected: FAIL because the payload currently includes HTML only.

- [ ] **Step 3: Add the text alternative and setup guide**

Keep recipient, subject, role, workspace names, and invite URL server-derived.
Document the exact non-secret variables and the free-provider setup boundary.

- [ ] **Step 4: Write operations documents**

The rehearsal must cover owner registration/manual review, owner setup,
worker invite/acceptance, permission checks, support submission, and sign-out.
The provider handoff must list business identity, bank entry, statement
descriptor, pricing, support contacts, legal URLs, webhook details, and the
rule that secrets are entered only in providers.

- [ ] **Step 5: Update the canonical project brain**

Record the live function versions and remaining external owner actions. Do not
copy secret values or production rows.

- [ ] **Step 6: Verify focused tests**

Run:

```powershell
node --test tests/company-invite-launch.test.mjs tests/launch-readiness-static.test.mjs tests/report-problem-launch.test.mjs tests/pilot-readiness.test.mjs
```

Expected: PASS.

### Task 5: Full verification and direct publication

**Files:**
- All files changed by Tasks 1-4.

**Interfaces:**
- Consumes: the complete candidate revision.
- Produces: one verified GitHub `main` revision and its matching Vercel
  production deployment.

- [ ] **Step 1: Verify the repository**

Run:

```powershell
npm.cmd run check
git diff --check
```

Expected: all tests pass, project-brain validation passes, build succeeds, and
the diff has no whitespace errors.

- [ ] **Step 2: Review and commit only scoped changes**

Inspect `git status -sb` and `git diff --stat`, then commit the launch-readiness
files without staging unrelated work.

- [ ] **Step 3: Reconcile and push**

Fetch `origin/main`; require a fast-forward-compatible history. Push the
verified candidate directly to `main`, matching the repository's direct
delivery workflow.

- [ ] **Step 4: Verify Vercel production**

Wait for the deployment for the exact commit to become READY. Check build
errors and recent production runtime errors.

- [ ] **Step 5: Run production smoke and browser checks**

Run the production smoke against `https://www.questbase.io` with the exact
expected commit. Verify the owner dashboard checklist, account-menu support
modal, manual billing copy, and existing invite fallback in the deployed app.

