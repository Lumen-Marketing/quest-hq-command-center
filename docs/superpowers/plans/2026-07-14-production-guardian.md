# Production Guardian Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an autonomous GitHub Actions guardian that repeatedly verifies the live Quest HQ deployment and maintains one self-healing incident issue.

**Architecture:** A dedicated workflow checks out `main`, derives its exact SHA, and runs the existing production smoke CLI against the canonical Vercel domain. GitHub Script steps create or update one incident on failure and close it on recovery, after which the workflow propagates the smoke result.

**Tech Stack:** GitHub Actions, Node.js 22, the existing Node test runner, and `scripts/production-smoke.mjs`.

## Global Constraints

- Do not start or depend on a local development server.
- Verify the directly deployed production URL `https://quest-hq-command-center-gamma.vercel.app`.
- Add no application, Vercel, Supabase, or Stripe secrets.
- Limit workflow permissions to `contents: read` and `issues: write`.

---

### Task 1: Build and verify the production guardian

**Files:**
- Create: `tests/production-guardian-static.test.mjs`
- Create: `.github/workflows/production-guardian.yml`

**Interfaces:**
- Consumes: `npm run smoke:prod -- --base-url <url> --expect-sha <sha>`.
- Produces: a scheduled workflow named `Production Guardian` and the incident title `[Production Guardian] Quest HQ production smoke check failing`.

- [ ] **Step 1: Write the failing static test**

Create assertions that read `.github/workflows/production-guardian.yml` and require the six-hour schedule, manual dispatch, least-privilege permissions, `main` checkout, Node 22 setup, locked install, checked-out SHA capture, production smoke command, failure issue creation or reopening, recovery closure, and final non-zero exit.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/production-guardian-static.test.mjs`

Expected: FAIL because `.github/workflows/production-guardian.yml` does not exist.

- [ ] **Step 3: Add the minimal workflow**

Create `.github/workflows/production-guardian.yml` with `schedule` and `workflow_dispatch` triggers. Use `actions/checkout@v5`, `actions/setup-node@v5`, `npm ci`, the existing smoke command, and `actions/github-script@v8` for the idempotent failure/recovery issue lifecycle.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test tests/production-guardian-static.test.mjs`

Expected: one passing test and zero failures.

- [ ] **Step 5: Run the full repository check**

Run: `npm run check`

Expected: all Node tests pass, the Vite production build completes, and the JavaScript bundle budget passes.

- [ ] **Step 6: Validate whitespace and inspect the exact diff**

Run: `git diff --check`

Expected: no output and exit code 0.

Run: `git diff -- .github/workflows/production-guardian.yml tests/production-guardian-static.test.mjs docs/superpowers/specs/2026-07-14-production-guardian-design.md docs/superpowers/plans/2026-07-14-production-guardian.md`

Expected: only the guardian workflow, its contract test, and its documentation.

- [ ] **Step 7: Commit the release**

Run: `git add .github/workflows/production-guardian.yml tests/production-guardian-static.test.mjs docs/superpowers/specs/2026-07-14-production-guardian-design.md docs/superpowers/plans/2026-07-14-production-guardian.md && git commit -m "Add autonomous production guardian"`

Expected: one commit containing the complete guardian update.
