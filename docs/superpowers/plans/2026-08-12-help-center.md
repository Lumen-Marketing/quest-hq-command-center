# Questbase Help Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a permission-aware, searchable in-app Help Center reached from a `?` top-navigation link, the mobile More sheet, and the account menu.

**Architecture:** Keep `src/assistant/help-index.js` as the sole product-help catalog. Add pure catalog filtering plus a lazy-loaded page module and page-scoped CSS. Wire one company-scoped `help` route before subscription/plugin blocking, and reuse the existing support controller for problem reports.

**Tech Stack:** Vite SPA, ES modules, Node test runner, HTML templates, CSS, existing Questbase router and permission/plugin helpers.

## Global Constraints

- Start from `origin/main` revision `eec640c27d7d4d8fa03efcf57e90682a806cc715` or a newer safely reconciled main revision.
- Do not start a local development or preview server.
- Do not add a database migration, Supabase query, API, external documentation service, or AI-generated help.
- Preserve company and operational-workspace context on every Help Center and destination URL.
- Keep the command palette and floating guide backward compatible with `searchHelp(query)`.
- Hide module-specific help when the existing module/plugin/permission checks deny access; keep general help visible.
- Lazy-load the page and its CSS so the primary bundle budget is not consumed by documentation UI.
- Deliver through the repository's direct-to-main Git/Vercel workflow and verify the exact production SHA.

---

### Task 1: Help catalog metadata and permission filtering

**Files:**
- Modify: `src/assistant/help-index.js`
- Modify: `tests/help-index.test.mjs`

**Interfaces:**
- Consumes: existing `HELP_TOPICS` and `searchHelp(query)`.
- Produces: `HELP_CATEGORIES`, enriched topic metadata, `helpTopicById(id)`, and `filterHelpTopics({ query, category, canOpenModule })`.

- [ ] **Step 1: Write failing catalog tests**

Add tests that require every topic to have a valid `category`, `kind`, and bounded `readingMinutes`; require declared routes to contain a section and label; require general topics to survive denied module access; require module topics to be removed; and require `searchHelp()` to retain its current ranking behavior.

```js
test('help center filters inaccessible module topics but keeps general guidance', () => {
  const result = filterHelpTopics({ canOpenModule: () => false });
  assert.ok(result.some((topic) => topic.id === 'navigate-questbase'));
  assert.ok(!result.some((topic) => topic.id === 'contacts'));
});

test('help center filters by category and natural-language query', () => {
  const result = filterHelpTopics({
    query: 'invite a worker',
    category: 'team-access',
    canOpenModule: () => true,
  });
  assert.equal(result[0].id, 'invite-team');
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/help-index.test.mjs`

Expected: FAIL because `filterHelpTopics`, metadata, and the new topics do not exist.

- [ ] **Step 3: Implement catalog metadata and high-friction guides**

Export these exact categories:

```js
export const HELP_CATEGORIES = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'daily-work', label: 'Daily work' },
  { id: 'workspace-setup', label: 'Workspace setup' },
  { id: 'team-access', label: 'Team and access' },
  { id: 'account-help', label: 'Account help' },
];
```

Add complete tutorials for `navigate-questbase`, `workspace-setup`, `invite-team`, `roles-permissions`, `workspace-plugins`, and `task-setup-back`. Enrich the existing topics with category/kind/reading time, module ids, destination routes, and accurate structured guides where needed.

Implement the pure selectors without changing `searchHelp(query)`:

```js
export function helpTopicById(id) {
  return HELP_TOPICS.find((topic) => topic.id === String(id || '')) || null;
}

export function filterHelpTopics({ query = '', category = '', canOpenModule = () => true } = {}) {
  return searchHelp(query).filter((topic) => {
    if (category && topic.category !== category) return false;
    return !topic.moduleId || canOpenModule(topic.moduleId);
  });
}
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node --test tests/help-index.test.mjs`

Expected: all help-index tests pass with zero failures.

- [ ] **Step 5: Commit the catalog work**

```powershell
git add -- src/assistant/help-index.js tests/help-index.test.mjs
git commit -m "feat(help): expand the grounded help catalog"
```

### Task 2: Lazy Help Center page and responsive styling

**Files:**
- Create: `src/help/help-center-page.js`
- Create: `src/help/help-center.css`
- Create: `tests/help-center-page.test.mjs`

**Interfaces:**
- Consumes: `HELP_CATEGORIES`, `HELP_TOPICS`, `filterHelpTopics`, and `helpTopicById` from `src/assistant/help-index.js`.
- Produces: `createHelpCenterPage(ctx)` with `renderHelpCenterPage(route, companyId)`.

- [ ] **Step 1: Write failing page tests**

Test the factory with real catalog data and small HTML helper functions. Assert the browse page has a labelled search form and live result count, denied topics disappear, a selected tutorial renders an ordered list and module action, an unknown topic renders the unavailable notice, and support actions reuse `data-action="open-support"` plus the configured mail address.

```js
const page = createHelpCenterPage({
  h: (value) => String(value),
  appHref: (value) => value,
  companyPath: (section, params, companyId) => `/company/${companyId}/${section}?${new URLSearchParams(params)}`,
  canOpenModule: (moduleId) => moduleId !== 'settings',
  supportEmail: 'support@example.test',
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/help-center-page.test.mjs`

Expected: FAIL because `src/help/help-center-page.js` does not exist.

- [ ] **Step 3: Implement the lazy page module**

Create a factory that:

- reads `q`, `category`, and `topic` from `route.params`;
- filters category ids against `HELP_CATEGORIES`;
- filters topics with the injected `canOpenModule(moduleId, companyId)`;
- builds every link with the injected `companyPath` and `appHref`;
- renders quick starts, categories, cards, tutorial detail, unknown-topic notice, zero-results state, and support panel;
- uses semantic headings, `role="search"`, `role="status"`, `aria-current`, and ordered steps;
- imports `./help-center.css` at module scope so Vite emits page-scoped lazy CSS.

Export only `createHelpCenterPage` plus pure presentational helpers that tests genuinely need.

- [ ] **Step 4: Add responsive page-scoped CSS**

Style `.help-center-page` and its descendants using existing CSS variables. Desktop uses a wide content column, quick-start grid, scrollable category pills, two-column card grid, and readable article sheet. At `max-width: 760px`, cards become one column, article actions stack, touch targets remain at least 44px, and category pills scroll horizontally.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `node --test tests/help-center-page.test.mjs tests/help-index.test.mjs`

Expected: all focused tests pass with zero failures.

- [ ] **Step 6: Commit the page module**

```powershell
git add -- src/help/help-center-page.js src/help/help-center.css tests/help-center-page.test.mjs
git commit -m "feat(help): add the searchable Help Center page"
```

### Task 3: Route, navigation, and existing-support integration

**Files:**
- Modify: `src/main.js`
- Create: `tests/help-center-static.test.mjs`
- Modify: `tests/report-problem-launch.test.mjs`

**Interfaces:**
- Consumes: `createHelpCenterPage(ctx)` and the existing `MODULE_REGISTRY`, `companyPath`, `canViewModule`, router, shell, mobile More sheet, and support controller.
- Produces: a valid `help` route and three visible navigation entry points.

- [ ] **Step 1: Write failing shell and route tests**

Assert all of the following source-level contracts:

```js
assert.match(main, /id: 'help'[^}]*label: 'Help Center'[^}]*status: 'live'/);
assert.match(main, /import\('\.\/help\/help-center-page\.js'\)/);
assert.match(main, /route\.section === 'help'\) return renderHelpCenterPage/);
assert.match(main, /aria-label="Open Help Center"/);
assert.match(main, /class="more-sheet-item[^\"]*"[^>]*>[^]*Help Center/);
assert.match(main, /<a[^>]*>[^]*Help Center<\/a>/);
```

Also assert the `help` renderer is checked before `subscriptionAllowsCompany`, the top-bar control is a real `data-router` link, and the support report remains reachable from the page.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test tests/help-center-static.test.mjs tests/report-problem-launch.test.mjs`

Expected: FAIL because the route and links have not been wired.

- [ ] **Step 3: Wire the lazy renderer and utility route**

Add a `help` registry entry with no business permission and do not add it to a workspace plugin. Implement the existing lazy page pattern:

```js
let renderHelpCenterPageModule = null;
let renderHelpCenterPagePending = null;

function renderHelpCenterPage(route, companyId) {
  if (renderHelpCenterPageModule) return renderHelpCenterPageModule.renderHelpCenterPage(route, companyId);
  loadRenderHelpCenterPage().then(() => render()).catch((error) => {
    renderHelpCenterPageError = error?.message || 'Help Center could not be loaded.';
    render();
  });
  return questLoader('Loading Help Center…');
}
```

Inject `h`, `appHref`, `companyPath`, `supportEmail`, and a `canOpenModule` callback that resolves the existing registry entry and calls `canViewModule`. Render `help` immediately after company access validation and before subscription/plugin/permission blocking.

- [ ] **Step 4: Add desktop, mobile, and account entry points**

- Desktop: add `<a class="btn help-center-trigger" ... aria-label="Open Help Center" title="Help Center">` before the command button.
- Mobile: prepend a standalone Help Center link to `.mobile-more-scroll`, outside plugin-derived groups.
- Account: replace the support-opening button with a `data-router` Help Center link.
- Keep `open-support` in the safe-action list because the page's Report a problem button still uses the existing controller.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `node --test tests/help-center-static.test.mjs tests/help-center-page.test.mjs tests/help-index.test.mjs tests/report-problem-launch.test.mjs`

Expected: all focused tests pass with zero failures.

- [ ] **Step 6: Commit route and navigation integration**

```powershell
git add -- src/main.js tests/help-center-static.test.mjs tests/report-problem-launch.test.mjs
git commit -m "feat(help): link Help Center throughout the shell"
```

### Task 4: Project brain, full verification, direct delivery, and production QA

**Files:**
- Modify: `.ai/context.md`
- Modify: `.ai/current-state.md`
- Modify: `.ai/architecture.md`
- Modify: `.ai/decisions.md`

**Interfaces:**
- Consumes: the completed Help Center feature.
- Produces: current project documentation, verified GitHub `main`, Vercel production deployment, and signed-in production evidence.

- [ ] **Step 1: Update canonical project context**

Record that Help Center is a lazy, grounded, permission-aware product-help route using `HELP_TOPICS`, distinct from customer Knowledge Base content, reachable from desktop/mobile/account navigation, and backed by the existing support report flow.

- [ ] **Step 2: Run focused and full verification**

Run:

```powershell
node --test tests/help-center-static.test.mjs tests/help-center-page.test.mjs tests/help-index.test.mjs tests/report-problem-launch.test.mjs
npm.cmd run check
git diff --check
```

Expected: zero test failures, valid AI context, tenancy check success, successful production build, bundle budget pass, top-level boot pass, and no whitespace errors.

- [ ] **Step 3: Commit documentation and final verified state**

```powershell
git add -- .ai/context.md .ai/current-state.md .ai/architecture.md .ai/decisions.md
git commit -m "docs: record the in-app Help Center"
```

- [ ] **Step 4: Reconcile with the latest remote main**

Fetch `origin/main`. If it advanced, rebase the feature branch on it without force-pushing or overwriting coworker work, resolve only scoped conflicts, and rerun `npm.cmd run check`.

- [ ] **Step 5: Merge and push through the direct-delivery workflow**

Fast-forward or merge the verified feature commits into `main`, push `main` to GitHub, and record the resulting exact SHA. Do not deploy an uncommitted working tree.

- [ ] **Step 6: Verify Vercel production and signed-in behavior**

- Wait for the Git deployment tied to the exact pushed SHA to become READY.
- Capture `$deployedSha = (git rev-parse HEAD).Trim()` after pushing, then run `npm.cmd run smoke:prod -- --base-url https://www.questbase.io --expect-sha $deployedSha`.
- Verify signed-in production desktop `?` entry, Help Center search, one tutorial, direct module jump, Report a problem modal, account-menu link, and a narrow/mobile rendering entry.
- Confirm no production browser-console errors and no relevant Vercel runtime errors.
