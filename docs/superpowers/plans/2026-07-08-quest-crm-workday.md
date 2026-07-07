# Quest CRM Workday Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily Quest CRM Workday page that gives reps one-click CRM actions and gives managers shift-level visibility.

**Architecture:** Add a `workday` company route under Quest CRM, backed by derived state from contacts, quotes, jobs, tasks, activities, and form responses. Reuse existing Supabase-backed save functions and docked activity composers so the page is functional rather than decorative.

**Tech Stack:** Vite single-page app, vanilla JavaScript in `src/main.js`, CSS in `src/styles.css`, Supabase through the existing client wrappers, Node static tests.

## Global Constraints

- Current `main` remains the source of truth.
- No new database tables for this pass.
- No destructive database work.
- Do not start a local dev server.
- Existing Contacts, Quotes, Jobs, Forms, Tasks, Proposals, and Activity behavior must keep working.

---

### Task 1: Static Workday Contract

**Files:**
- Create: `tests/workday-crm-static.test.mjs`

**Interfaces:**
- Consumes: existing `src/main.js` and `src/styles.css`.
- Produces: a failing test contract for route, queue, manager metrics, quick actions, next-step prompt, and responsive styling.

- [x] **Step 1: Write the failing test**

Run: `node --test tests/workday-crm-static.test.mjs`

Expected: FAIL because Workday does not exist yet.

### Task 2: Route, Queue, and Manager Metrics

**Files:**
- Modify: `src/main.js`

**Interfaces:**
- Produces:
  - `workdayManagerMetrics(companyId): object`
  - `workdayQueueItems(companyId): Array<object>`
  - `renderWorkdayPage(companyId): string`
  - `renderWorkdayPanel(item, companyId): string`

- [x] **Step 1: Add Workday to Quest CRM routing and navigation**
- [x] **Step 2: Derive queue rows from overdue tasks, due tasks, untouched contacts, hot quotes, jobs, and unhandled form responses**
- [x] **Step 3: Render manager metrics and selected queue record panel**
- [x] **Step 4: Run the Workday static test**

### Task 3: One-Click Actions and Next Step Prompt

**Files:**
- Modify: `src/main.js`

**Interfaces:**
- Produces:
  - `workdayOpenRecord(itemId): void`
  - `workdayQuickAction(itemId, kind): void`
  - `openWorkdayNextStepPrompt(context): void`
  - `renderWorkdayNextStepModal(): string`
  - `createWorkdayFollowupTask(context, fields): Promise<void>`

- [x] **Step 1: Wire queue and panel actions through existing CRM composers/builders**
- [x] **Step 2: Show next-step prompt after call, email, or note activity is logged**
- [x] **Step 3: Create follow-up tasks or route to quote/job/proposal from the prompt**
- [x] **Step 4: Run the Workday static test**

### Task 4: Styling and Verification

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Produces: responsive Workday layout and dark-theme compatible cards/buttons.

- [x] **Step 1: Add Workday page, metric, queue, panel, and action-grid CSS**
- [x] **Step 2: Run `node --test tests/*.mjs`**
- [x] **Step 3: Run `npm run build`**
- [ ] **Step 4: Deploy and run production smoke**
