# Job Center Navigation and Underwriter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved compact Job Center command rail, IBM Plex typography, and Technical Ledger Underwriter in the existing Quest HQ Vite SPA, then deploy through GitHub and Vercel.

**Architecture:** Keep the existing module registry, permission gates, company-scoped routes, pipeline data, Underwriter calculator, and Supabase persistence. Add navigation-only labels and grouping so terminology can match the approved shell without changing module ids or routes, then apply a final scoped CSS layer for the command rail and Underwriter. Static tests protect the generated HTML and CSS contracts.

**Tech Stack:** Vanilla JavaScript, Vite 7, CSS, Node test runner, Supabase client, Vercel static deployment.

## Global Constraints

- Do not run a local development or preview server.
- Desktop sidebar width is exactly 264px.
- Use IBM Plex Sans for interface text and IBM Plex Mono for numeric/metadata roles.
- Keep the existing Underwriter route, permissions, calculations, and `underwriting_cases` persistence.
- Preserve plugin gates, company tenancy, read-only demo behavior, mobile navigation, and planned-module treatment.
- Do not change Supabase schema or RLS.
- Avoid unrelated refactors in `src/main.js` and `src/styles.css`.

---

### Task 1: Lock the approved typography and navigation contract

**Files:**
- Modify: `tests/sidebar-navigation-static.test.mjs`
- Modify: `index.html`
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `MODULE_REGISTRY`, `canViewModule`, `companyPath`, `navItem`, `navItemPipeline`, and the existing sidebar-scope handler.
- Produces: `navigationLabel(moduleId, fallbackLabel) -> string` and approved `NAV_GROUPS` labels used by `renderDeck(route)`.

- [ ] **Step 1: Write the failing navigation and font tests**

Add assertions that require IBM Plex font loading, the six approved group names, the navigation-only aliases, the 264px rail, compact 34px rows, and the orange active state:

```js
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('approved Job Center typography is loaded explicitly', () => {
  assert.match(html, /family=IBM\+Plex\+Sans:wght@400;500;600;700/);
  assert.match(html, /family=IBM\+Plex\+Mono:wght@400;500;600/);
  assert.match(styles, /--font-sans:\s*'IBM Plex Sans'/);
  assert.match(styles, /--font-mono:\s*'IBM Plex Mono'/);
});

test('desktop rail uses stakeholder navigation labels without changing routes', () => {
  assert.match(source, /function navigationLabel\(moduleId, fallbackLabel\)/);
  assert.match(source, /dashboard:\s*'Home'/);
  assert.match(source, /messages:\s*'Inbox'/);
  assert.match(source, /underwriter:\s*'Estimator'/);
  assert.match(source, /analytics:\s*'Reports'/);
  assert.match(source, /users:\s*'People'/);
  assert.match(source, /calendar:\s*'Meetings'/);
  assert.match(source, /\{ label: 'Pipeline', ids: \['contacts'\] \}/);
  assert.match(source, /\{ label: 'Production', ids: \['jobs'\] \}/);
  assert.match(source, /\{ label: 'Tools', ids: \['underwriter', 'proposals'\] \}/);
  assert.match(source, /\{ label: 'Build', ids: \['templates', 'automations'\] \}/);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/sidebar-navigation-static.test.mjs`

Expected: FAIL because IBM Plex loading, aliases, and the approved navigation groups are not present.

- [ ] **Step 3: Implement explicit font loading and navigation-only aliases**

Replace the Google Fonts URL with IBM Plex Sans/Mono and change the final font variables to:

```css
--font-sans: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
```

Add navigation aliases without changing `MODULE_REGISTRY` ids or route labels:

```js
const NAVIGATION_LABELS = {
  dashboard: 'Home',
  messages: 'Inbox',
  underwriter: 'Estimator',
  analytics: 'Reports',
  users: 'People',
  calendar: 'Meetings',
};

function navigationLabel(moduleId, fallbackLabel) {
  return NAVIGATION_LABELS[moduleId] || fallbackLabel;
}
```

Use the alias when rendering ordinary, pipeline, and planned rail rows. Define the approved My work groups while retaining a complete permission-gated Company scope for remaining modules.

- [ ] **Step 4: Apply the approved command-rail CSS**

Append a scoped final layer that keeps `.quest-nav-v2` at 264px, uses a white background and `#E8EAED` divider, keeps rows at 34px with 8px radius, renders the active row with pale orange plus `#ED4E0D`, uses 10.5px uppercase IBM Plex Mono group labels, and preserves the existing collapsed/mobile rules.

- [ ] **Step 5: Run the focused test and verify pass**

Run: `node --test tests/sidebar-navigation-static.test.mjs`

Expected: all sidebar tests PASS.

- [ ] **Step 6: Commit the navigation slice**

```text
git add index.html src/main.js src/styles.css tests/sidebar-navigation-static.test.mjs
git commit -m "Refine Job Center command rail and typography"
```

---

### Task 2: Implement the Technical Ledger Underwriter

**Files:**
- Modify: `tests/job-photos-underwriting-static.test.mjs`
- Modify: `tests/workspace-plugins-static.test.mjs`
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `renderUnderwriterPage(route, companyId)`, `renderUnderwritingResults(result)`, `calculateUnderwriting(draft)`, `renderUnderwriterQueueRow(lead)`, and existing `data-underwriting-*` event hooks.
- Produces: `.underwriter-ledger`, `.underwriter-workbench`, `.underwriter-ledger-queue`, and `.underwriting-results` layout contracts without changing form field names.

- [ ] **Step 1: Write the failing Technical Ledger tests**

Require a compact workbench marker, decision-summary heading, queue directly below the calculator, monospace financial output, and responsive stacking:

```js
test('underwriter uses the approved Technical Ledger hierarchy', () => {
  assert.match(source, /class="tool-page underwriter-page underwriter-ledger"/);
  assert.match(source, /class="panel underwriting-calculator underwriter-workbench"/);
  assert.match(source, /<h3>Decision summary<\/h3>/);
  assert.match(source, /class="panel underwriter-ledger-queue"/);
  assert.match(css, /\.underwriter-workbench\s+form\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(280px, \.42fr\)/);
  assert.match(css, /\.underwriting-results[\s\S]*font-family:\s*var\(--font-mono\)/);
  assert.match(css, /@media \(max-width:\s*900px\)[\s\S]*\.underwriter-workbench form\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});
```

Update the queue test to require a compact table with Contact, Stage, Owner, Pay type, and Value while removing the separate Guidance card from this page.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test tests/job-photos-underwriting-static.test.mjs tests/workspace-plugins-static.test.mjs`

Expected: FAIL because the Technical Ledger markers and layout are absent.

- [ ] **Step 3: Implement the minimal HTML hierarchy**

Add the scoped class names to the existing Underwriter sections, add a small `Decision summary` heading inside the results column, keep every existing field name and event data attribute, and render the queue as the single full-width panel immediately after the calculator. Remove only the separate Guidance panel from the Underwriter page.

- [ ] **Step 4: Implement the scoped workbench CSS**

Use a wide two-column calculator plus 320-360px results column, thin dividers, flat white surfaces, compact 64px summary metrics, aligned mono values, a full-width queue table, and responsive single-column stacking below 900px. Preserve 44px mobile controls and prevent horizontal overflow.

- [ ] **Step 5: Run focused tests and verify pass**

Run: `node --test tests/job-photos-underwriting-static.test.mjs tests/workspace-plugins-static.test.mjs`

Expected: all focused Underwriter tests PASS.

- [ ] **Step 6: Commit the Underwriter slice**

```text
git add src/main.js src/styles.css tests/job-photos-underwriting-static.test.mjs tests/workspace-plugins-static.test.mjs
git commit -m "Build Technical Ledger Underwriter workspace"
```

---

### Task 3: Update durable product context and verify the repository

**Files:**
- Modify: `.ai/context.md`
- Modify: `.ai/current-state.md`
- Modify: `.ai/decisions.md`

**Interfaces:**
- Consumes: the final implemented terminology and UI behavior.
- Produces: project-brain documentation that accurately describes the deployed product.

- [ ] **Step 1: Update the project brain**

Record that the desktop navigation uses the compact Job Center hierarchy, the route id remains `underwriter` while the rail label is `Estimator`, and the Underwriter uses the Technical Ledger layout. Do not record credentials, production rows, or user data.

- [ ] **Step 2: Run deterministic verification**

Run: `npm run check`

Expected: Node tests, AI context validation, Vite build, asset sync, and bundle budget all PASS.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 3: Commit project context**

```text
git add .ai/context.md .ai/current-state.md .ai/decisions.md
git commit -m "Document Job Center shell and Underwriter layout"
```

---

### Task 4: Publish and verify production

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: verified local commits on `main`.
- Produces: updated GitHub `main` and a READY Vercel production deployment for the same commit.

- [ ] **Step 1: Confirm the publication scope**

Run: `git status --short && git log --oneline origin/main..HEAD`

Expected: clean worktree and only the approved design/implementation commits ahead of `origin/main`.

- [ ] **Step 2: Push GitHub**

Run: `git push origin main`

Expected: `main` updates successfully.

- [ ] **Step 3: Verify Vercel deployment**

Use the Vercel project `prj_0MxrYyGIo61QgLNW2M74fvTxlMRV` and confirm the latest production deployment reaches READY for the pushed commit.

- [ ] **Step 4: Run production smoke**

Run: `npm run smoke:prod -- --base-url https://quest-hq-command-center-gamma.vercel.app --expect-sha <pushed-main-sha>`

Expected: configured routes and critical assets pass with the deployed revision matching the pushed SHA.
