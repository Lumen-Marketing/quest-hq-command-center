# Workspace Sidebar Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hidden/compact company switcher with a persistent, screenshot-matched workspace list in the Command Center sidebar.

**Architecture:** Keep `companies` and `company_memberships` as the existing workspace/access model. Render that data as a sidebar list in deck mode and reuse `setActiveCompany()` for switching, pipeline reload, and route preservation; no schema change is required.

**Tech Stack:** Vite SPA, vanilla JavaScript templates, CSS, Node test runner.

## Global Constraints

- Change only `Lumen-Marketing/quest-hq-command-center`; never touch TaskManagement.
- Do not start a local development or preview server.
- Preserve all existing tenant, membership, permission, pipeline, and plugin behavior.
- Preserve the untracked `docs/design/audits/` files.

---

### Task 1: Lock the sidebar workspace contract

**Files:**
- Create: `tests/workspace-sidebar-navigation-static.test.mjs`

**Interfaces:**
- Consumes: `src/main.js` and `src/styles.css` as text fixtures.
- Produces: a regression contract for `workspace-rail`, `workspace-rail-item`, `workspace-rail-actions`, active workspace semantics, and existing switch behavior.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('sidebar exposes a persistent accessible workspace list', () => {
  assert.match(source, /class="workspace-rail"/);
  assert.match(source, /class="workspace-rail-item \$\{company\.id === companyId \? 'active' : ''\}"/);
  assert.match(source, /aria-current="\$\{company\.id === companyId \? 'true' : 'false'\}"/);
  assert.match(source, /data-action="select-workspace"/);
  assert.match(source, /data-company-id="\$\{h\(company\.id\)\}"/);
  assert.match(styles, /\.workspace-rail-item\.active/);
});

test('sidebar exposes create and manage workspace actions', () => {
  assert.match(source, /workspace-rail-actions/);
  assert.match(source, />Create workspace</);
  assert.match(source, />Manage workspaces</);
  assert.match(source, /companyPath\('settings', \{ tab: 'company', focus: 'create-workspace' \}, companyId\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/workspace-sidebar-navigation-static.test.mjs`

Expected: FAIL because `workspace-rail` markup and styles do not exist.

### Task 2: Implement the persistent workspace rail

**Files:**
- Modify: `src/main.js` in `renderCompanySwitch()`.
- Modify: `src/styles.css` near the current `.company-card` and `.workspace-menu-*` rules.
- Test: `tests/workspace-sidebar-navigation-static.test.mjs`

**Interfaces:**
- Consumes: `allowedCompanies()`, `workspaceIconMarkup()`, `companyLabel()`, `roleForCompany()`, `companyPath()`, and the existing `select-workspace` action.
- Produces: deck-mode `workspace-rail` markup with active workspace selection and settings actions.

- [ ] **Step 1: Render deck mode as a persistent list**

In deck mode, output a `workspace-rail` section, one `workspace-rail-item` button per allowed company, and a `workspace-rail-actions` footer. Keep non-deck rendering unchanged.

- [ ] **Step 2: Add screenshot-matched styles**

Add compact white workspace rows, active warm highlight, subdued icons, cyan marker dots for non-active workspaces, compact create/manage links, and collapsed-sidebar rules that retain only the active icon.

- [ ] **Step 3: Run focused tests**

Run: `node --test tests/workspace-sidebar-navigation-static.test.mjs tests/workspace-creation-static.test.mjs tests/sidebar-navigation-static.test.mjs`

Expected: PASS.

### Task 3: Refresh project context and verify delivery

**Files:**
- Modify: `.ai/current-state.md`
- Modify: `.ai/decisions.md`
- Modify: `.ai/manifest.json`

**Interfaces:**
- Consumes: the final verified commit and deployment metadata.
- Produces: current project-brain documentation for the sidebar workspace behavior and production revision.

- [ ] **Step 1: Document the workspace rail behavior**

Record that the command rail visibly lists membership-scoped workspaces, switches through `setActiveCompany()`, and exposes create/manage settings actions.

- [ ] **Step 2: Run the complete local verification**

Run: `npm run check`

Expected: all tests, AI context checks, and production build pass.

- [ ] **Step 3: Commit and push**

Commit the scoped files to `main`, push to `origin/main`, and preserve unrelated untracked audit files.

- [ ] **Step 4: Verify production**

Wait for Vercel to deploy the pushed commit, run the production smoke command with the expected SHA, and inspect the deployed sidebar in the browser.

