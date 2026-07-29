# Mobile UI Launch Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Questbase's highest-use phone flows fit a 390px viewport, keep every primary action reachable, and preserve the existing desktop design.

**Architecture:** Add one final, narrowly scoped mobile hardening layer to the existing Questbase and vendored TaskManagement stylesheets. The host-app rules constrain grid min-content sizing, keep dashboard widget children inside their cards, enlarge mobile controls, and improve modal ergonomics; TaskManagement receives a 340px-and-up embedded-viewport touch-target pass while retaining its existing narrow-phone fallback. Static regression tests guard the exact containment and target-size contracts.

**Tech Stack:** Vite, vanilla JavaScript, CSS, Node.js test runner.

## Global Constraints

- Do not start a local development or preview server.
- Do not change desktop layout above the existing phone/tablet breakpoints.
- Do not change Supabase schema, tenancy, permissions, or production data.
- Preserve the same-origin TaskManagement iframe boundary.
- Build from the latest `origin/main` and run `npm run check` before delivery.

---

### Task 1: Host-App Mobile Containment Contract

**Files:**
- Create: `tests/mobile-ui-hardening-static.test.mjs`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: Existing `.message-simple-main`, `.calls-widget`, `.modal-panel`, dashboard segmented controls, and appearance-control class names.
- Produces: A `Mobile launch hardening` stylesheet section whose rules are limited to `max-width: 820px` and `max-width: 720px`.

- [ ] **Step 1: Write the failing host-app regression tests**

```js
test('mobile message threads constrain their implicit grid track', () => {
  assert.match(styles, /\/\* Mobile launch hardening \*\//);
  assert.match(styles, /@media \(max-width: 820px\)[\s\S]*\.message-simple-main\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/);
  assert.match(styles, /\.message-simple-main\s*>\s*\.message-composer[\s\S]*max-width:\s*100%;/);
});

test('mobile calls widgets and modals stay within their containing surface', () => {
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.calls-widget\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/);
  assert.match(styles, /\.calls-widget\s*>\s*\*\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%;/);
  assert.match(styles, /\.modal-panel\s*\{[^}]*max-height:\s*calc\(100dvh - 16px\);/);
});

test('phone actions expose comfortable touch targets', () => {
  assert.match(styles, /\.message-simple-sidebar \.message-filter button[\s\S]*min-height:\s*40px;/);
  assert.match(styles, /\.calls-widget-range[\s\S]*min-height:\s*40px;/);
  assert.match(styles, /\.account-accent-swatch[\s\S]*width:\s*40px;[\s\S]*height:\s*40px;/);
});
```

- [ ] **Step 2: Run the host-app tests to verify they fail**

Run: `node --test tests/mobile-ui-hardening-static.test.mjs`

Expected: FAIL because the mobile hardening section and its containment contracts do not exist.

- [ ] **Step 3: Add the minimal host-app mobile rules**

Add a final `Mobile launch hardening` section to `src/styles.css` that:

- gives `.message-simple-main` a `minmax(0, 1fr)` track;
- constrains the thread header, stream, and composer to the card width;
- keeps bubbles and cards shrinkable;
- makes mobile message filters, composer actions, and delete actions easier to tap;
- constrains every Calls widget child and turns the date range into an internal horizontal strip;
- uses a single-column custom date picker on phones;
- sizes dashboard range/view controls and appearance controls for touch;
- uses `100dvh` for the job-form modal and 44px form actions.

- [ ] **Step 4: Run the host-app tests to verify they pass**

Run: `node --test tests/mobile-ui-hardening-static.test.mjs`

Expected: PASS.

### Task 2: Embedded Tasks Touch Targets

**Files:**
- Modify: `tests/mobile-ui-hardening-static.test.mjs`
- Modify: `taskmanagement/css/mobile.css`

**Interfaces:**
- Consumes: Existing `--m-ctl`, head-card, scope segment, control-card, chip-row, and bottom-navigation styles.
- Produces: A `340px <= embedded viewport <= 720px` enhancement that leaves the existing narrow-phone fallback intact.

- [ ] **Step 1: Add a failing TaskManagement touch-target test**

```js
test('embedded Tasks grows primary controls on ordinary phone widths', () => {
  assert.match(taskMobileStyles, /@media \(min-width: 340px\) and \(max-width: 720px\)/);
  assert.match(taskMobileStyles, /--m-ctl:\s*40px;/);
  assert.match(taskMobileStyles, /#scopeSeg button[\s\S]*width:\s*40px;[\s\S]*height:\s*40px;/);
  assert.match(taskMobileStyles, /\.controls-card \.btn[\s\S]*width:\s*40px;[\s\S]*height:\s*40px;/);
});
```

- [ ] **Step 2: Run the TaskManagement test to verify it fails**

Run: `node --test tests/mobile-ui-hardening-static.test.mjs`

Expected: FAIL because ordinary-phone controls remain 32–38px.

- [ ] **Step 3: Add the ordinary-phone sizing layer**

At the end of `taskmanagement/css/mobile.css`, add a `min-width: 340px` and `max-width: 720px` block that sets `--m-ctl: 40px`, grows the scope buttons and dashboard toolbar controls to 40px, and leaves the intentionally scrollable workspace-chip strip unchanged. The lower threshold accounts for Questbase's 24px host gutter around the embedded frame on a 360–390px phone.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test tests/mobile-ui-hardening-static.test.mjs`

Expected: PASS.

### Task 3: Verification and Delivery

**Files:**
- Modify only if a regression is found: `src/styles.css`, `taskmanagement/css/mobile.css`, `tests/mobile-ui-hardening-static.test.mjs`

**Interfaces:**
- Consumes: Built static bundle and the production routes audited at 390×844.
- Produces: A verified GitHub main commit and READY Vercel production deployment.

- [ ] **Step 1: Run focused and full deterministic checks**

Run:

```powershell
node --test tests/mobile-ui-hardening-static.test.mjs
npm.cmd run check
```

Expected: 0 failures and a successful bundle-budget check.

- [ ] **Step 2: Verify the built CSS contracts**

Inspect the generated bundle to confirm the final host and TaskManagement styles are copied into `dist` and that the production smoke route list remains unchanged.

- [ ] **Step 3: Commit the scoped branch**

```powershell
git add src/styles.css taskmanagement/css/mobile.css tests/mobile-ui-hardening-static.test.mjs docs/superpowers/plans/2026-07-30-mobile-ui-launch-hardening.md
git commit -m "fix: harden Questbase mobile layouts"
```

- [ ] **Step 4: Integrate the verified commit into main**

Update local main to `origin/main`, fast-forward or cherry-pick the verified commit without touching unrelated untracked files, then push main.

- [ ] **Step 5: Confirm Vercel and production**

Wait for the Git-backed Vercel deployment to reach READY, confirm its commit matches GitHub main, then run:

```powershell
$expectedRevision = git rev-parse HEAD
npm.cmd run smoke:prod -- --base-url https://www.questbase.io --expect-sha $expectedRevision
```

Expected: every production route and critical asset passes.
