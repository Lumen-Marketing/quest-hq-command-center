# Job Record Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Jobs profile panel with a Salesforce-style job record workspace that matches the contact record experience.

**Architecture:** Keep the monolithic Vite app structure and add focused helpers inside `src/main.js` beside the existing contact record implementation. Reuse `.sf-record` styles from `src/styles.css`, adding only small job-specific refinements if the browser check shows layout issues.

**Tech Stack:** Vite, plain JavaScript, CSS, Tabler Icons, Node built-in test runner, Playwright CLI.

---

### Task 1: Add Failing Job Record Coverage

**Files:**
- Create: `tests/job-record-static.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('jobs profile route renders a Salesforce-style job record workspace', () => {
  assert.match(source, /function renderJobRecord\s*\(/);
  assert.match(source, /<div class="sf-record job-record">/);
  assert.match(source, /All Jobs <span class="sf-tab-kind">\| Jobs<\/span>/);
  assert.match(source, /data-action="set-job-stage"/);
  assert.match(source, /data-action="job-mark-next"/);
  assert.match(source, /data-job-note-form/);
  assert.match(source, /data-action="job-quick"/);
  assert.match(source, /data-job-edit=/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/job-record-static.test.mjs`

Expected: FAIL because `renderJobRecord` and the job record hooks do not exist yet.

### Task 2: Implement Job Record Renderer

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Route profile tab to the new renderer**

Change `renderJobPanel()` so `tab === 'profile'` returns `renderJobRecord(companyId, job)`.

- [ ] **Step 2: Add stage guidance and record helpers**

Add `guidanceForJobStage()`, `jobRecordField()`, and a `renderJobRecord()` function near the existing job rendering functions. Use the contact record markup and classes as the pattern.

- [ ] **Step 3: Reuse existing linked modules**

The right column quick actions should point to existing routes for tasks, files, forms, analytics, and finance rather than creating new modules.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/job-record-static.test.mjs`

Expected: PASS.

### Task 3: Add Job Record Interactions

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Add event handling**

Handle `set-job-stage`, `job-mark-next`, `job-quick`, `job-activity-tab`, and `[data-job-edit]`.

- [ ] **Step 2: Add behavior helpers**

Add `setJobStage()`, `markJobNextStage()`, `patchJobField()`, `beginJobInlineEdit()`, `postJobNote()`, `logJobActivity()`, and `jobQuickCreate()`.

- [ ] **Step 3: Wire submit handler**

Handle `[data-job-note-form]` in `onDocumentSubmit()`.

- [ ] **Step 4: Run test and build**

Run: `node --test tests/job-record-static.test.mjs`

Expected: PASS.

Run: `npm run build`

Expected: Vite build exits 0.

### Task 4: Browser Verification

**Files:**
- No source edits unless verification finds a visible issue.

- [ ] **Step 1: Start Vite**

Run: `npm run dev -- --port 5177`

Expected: local app available at `http://127.0.0.1:5177/`.

- [ ] **Step 2: Verify desktop job record**

Run Playwright against `/company/roofing/jobs?tab=profile&job_id=11111111-1111-4111-8111-111111111111`.

Expected: `.sf-record.job-record`, `.sf-stage`, `.sf-three-col`, and `Open Tasks` are visible.

- [ ] **Step 3: Verify mobile job record**

Run the same route at a mobile viewport.

Expected: the record renders without horizontal page overflow beyond intentional stage scrolling.
