# Architecture & Maintainability Audit — Quest HQ

**Date:** 2026-10-01
**Scope:** `src/` (231 files), `api/` (41 files), `taskmanagement/` (vendored, 92 JS files),
`supabase/` (~190 migrations), `tests/` (~370 files), build config
**Companion:** security findings are tracked separately and are **not** in this document.

---

## Summary

This is a codebase with unusually honest engineering *writing about itself* and much weaker
engineering *in its structure*. `scripts/bundle-budget-lib.mjs` documents six successive budget
raises with the measurement that forced each one. `.gitattributes` explains a CRLF test failure
that only reproduced on Windows. `scripts/check-bundle-boots.mjs:84-88` admits the check was once
decorative. `.ai/known-issues.md:52-67` documents that `styles.css` was pinned to CRLF by two
commits with no surviving reason.

That is a team that measures and records. The measurement is sound. It has been pointed at gzip
bytes for a long time, which optimises for the wrong thing.

The bundle gate that blocks work measures minified output. The problems that actually cost money
are the untestable dispatcher, the untestable state object, and the task-write path that skips its
own tenant guard.

---

## Measurements

| Metric | Value |
|---|---|
| `src/main.js` | 2.3 MB, **48,035 lines** |
| Top-level functions in `main.js` | **2,298** (1,970 + 328 async) |
| `state.*` references | **2,852** |
| `state` object | ~200 keys, lines 2533–2912 |
| `src/styles.css` | 845 KB, 35,376 lines |
| `!important` in `styles.css` | **32** (low, for the size) |
| `catch` clauses in `main.js` | **119** (one per ~404 lines) |
| Static imports in `main.js` | 30 |
| Dynamic imports | 155 |
| `window.X =` assignments in `src/` | **0** |
| Emitted build chunks | 185 |
| Test files | ~370 |
| TODO / FIXME / HACK / XXX | **0** |

Decomposition is real and measured, not aspirational — but `main.js` is the application, and the
~180 extracted modules are a fringe.

---

## Top 10 problems, by business impact

### 1. Task writes bypass the tested, tenant-guarded store

`main.js:12681-12688` lets any Owner/Admin flip the app to the native task surface with
`?task_ui=native`. That path writes via `saveTask` (`main.js:36104`), **not**
`src/tasks/task-store.js` — the module that scopes every update by `id` **and** `workspace_id`
and rolls back on failure.

The guard exists. It is unit-tested. It is not on the path a customer can reach with a URL
parameter.

Verified: `src/tasks/task-store.js` and `src/tasks/task-shape.js` are imported **only** by
`tests/task-store.test.mjs:4` and `tests/task-shape.test.mjs:4`. No `src/` file imports them. The
*rendering* half of the native path is wired (`main.js:12681` gates `renderTasksPage` →
`renderNativeTasksPage`).

**Fix:** either delete the URL opt-in, or route the native path through `createTasks`.

### 2. A single 2,940-line click dispatcher is the sole entry point for the App Builder

`handleAction`, `main.js:28454-31393`. A flat `if (action === '…')` chain. Every workspace-app
action, button, tile, modal and DnD gesture routes through it.

It cannot be moved — `bundle-budget-lib.mjs:39-47` measures the App Builder modal's transitive
closure at **1,512 declarations, 1.46 MB, "essentially the whole application"**, because the
modal calls `render()` and `render()` reaches everything. It cannot be tested: it needs a DOM,
`state`, and ~50 collaborators. It is the merge-conflict magnet for every builder feature.

`.ai/current-state.md:2081` already identifies it and gets the fix right: *"a dispatcher — extract
**branches**, not the whole thing."* The problem is not its length; it is that it is the only place
many behaviours are reachable from.

**Highest-value single refactor in the repo.**

### 3. Two observability systems with a hole between them

The vendored fork has Sentry (`taskmanagement/js/observability.js`). The host has `sendBeacon`
logging to Vercel stdout (`main.js:47975-48027`).

`main.js:48016` listens on `window`, which **does not catch errors inside the iframe**. An error in
the default task surface — the product's core execution workflow — is invisible to the host's
telemetry. The iframe boundary means the host cannot see frame errors at all.

**Fix:** forward `frameElement.contentWindow.onerror`, or drop the fork's Sentry for the host's.

### 4. Three `timeAgo` implementations with different thresholds and long-range behaviour

- `main.js:47744` `timeAgo` — 45s threshold, falls through to `formatDate` at 7 days
- `main.js:14260` `wbTimeAgo` — 60s threshold, `"<n>d ago"` forever
- `main.js:22644` `cpTimeAgo` — 60s threshold, falls through to `formatDate`

At 8 days, a workspace activity row says "Aug 20" and a client-portal comment says "8d ago". In
the 45–60s window one says "just now" and the others say "0m ago".

Also three byte formatters with different rounding (`main.js:45737`, `main.js:47814`,
`src/workspace/attachments.js:72`) — a 9.5 MB file reads "9.5 MB" in the drive and "10 MB" on a
comment attachment.

Cheapest items on this list to fix.

### 5. Sunday-start and Monday-start weeks in the same product

- `main.js:39205` `startOfWeekDate` — `getDay()` subtraction → **week starts Sunday**
- `src/company-contacts/timeline.js:32` `startOfWeek` — `(getDay() + 6) % 7` → **Monday**, with the
  comment *"Weeks run Monday to Sunday, which is how a work week is read."*

A work-week date range that differs by one day between the calendar and a contact card. This is a
correctness bug, not a style issue.

### 6. Every write failure is a toast

119 try/catches across 48,035 lines is fine as density. The problem is coverage of the write path.

`persistJob` (11199), `saveContact` (12018), `saveTask` (36104), `saveDeal` (41036),
`saveAccount` (41015), `saveFinanceInvoice` (37855) — each has a try/catch, and each catch calls
`showToast` and sets `state.sync`. **A failed write is a toast.** No retry, no queue, no error
surface a user can revisit.

`notifySyncFailure` (`main.js:40716`) exists for the workspace builder — the one place that got
real treatment.

The repo has already lived through a "ten-night purge outage" (commit `8a1aec2`) that this class
of gap hid.

**Fix:** a failed-write queue the user can revisit.

### 7. `state` is a ~200-key mutable object, mutated in place from 2,852 call sites

No reducer, no immutability, no ownership. `state` is destructured *by reference* into ~113
factory modules which then write to it. Every `render()` is a full re-render, so correctness
depends on mutation ordering across 48,000 lines with no test that can observe it.

This is why the test suite reads source as text instead of calling code.

### 8. The 113-entry hand-maintained `FACTORY_MODULES` list is a coupling manifest nobody can maintain

`tests/extracted-module-references.test.mjs:163-275`. It encodes 113 module→factory→parent
triples, including three forwarded-context entries, to catch one real bug.

The test asserting the list is complete (`:277`) exists because *"hand-maintained lists rot."* It
is a second monolith, in test form.

**Fix:** derive the list by parsing `create*(ctx)` out of the modules at test time.

### 9. Zero TODO/FIXME markers; all debt lives in `.ai/` prose

Not findable by tooling, invisible to a new hire reading code, and `.ai/current-state.md` is
2,600+ lines of append-only history.

Code that says `// this is a mess, see .ai/current-state.md §2026-08-16` would at least be
findable. Absence of markers in a 48,000-line file is not a sign of cleanliness.

### 10. The vendored fork is 92 files with its own auth, its own observability, and a dev-server shim

`vite.config.js:18-50` is a 33-line Vite plugin that exists because the fork's Supabase SDK and
`env.json` are build-generated and 404 in dev — producing an error that hides a plain 404
(`sdk-loader` retries and reports the retry). Tasks then stops on *"Auth service is unavailable"*
while the same commit is fine in production.

Same-origin session sharing means host and fork must always resolve the **same** Supabase
project, or the embedded app loops on the host login forever.

This fork is the default task surface, has no upstream pin, and no tests.

---

## Module boundaries and coupling

The pattern is a giant context-injection object, and it is deliberate.

```js
export function createCompanyContactsPage(ctx) {
  const { activeCompanyId, appHref, can, …, wbRenderFieldInput, … } = ctx;  // ~50 keys
}
```

`src/company-contacts/page.js:48-64` destructures ~50 keys. `main.js:39545-39559` supplies them
in a hand-maintained 15-line object literal.

**This is a service locator with 50-100 parameters.**

The genuinely decoupled modules are the pure ones: `src/workspace/builder-core.js` (154 lines,
zero imports), `src/company-contacts/model.js` (321 lines, no DOM/state/Supabase),
`src/company-contacts/timeline.js`, `src/tasks/task-store.js`, `src/data/*`, `src/security/*`.
These are the good parts of the graph, and a minority.

**Zero `window.` assignments in `src/` is genuinely clean** — the only repo-wide hit is a
`matchMedia` *read* in `topbar-drag.js:13`. That is worth keeping.

There are ~300 module-level `let xModule = null; let xPending = null;` lazy-loader pairs. Every one
is mutable module-level state.

---

## Duplication

| Concern | Implementations | Divergence |
|---|---|---|
| Relative time | 3 (`main.js:47744`, `:14260`, `:22644`) | different thresholds, different long-range |
| Byte formatting | 3 (2 in main.js, 1 in `attachments.js`) | different rounding |
| File-type detection | 2 (`main.js:46662`, `attachments.js:23`) | one uses MIME+ext, one ext only — `.svg` is `image` in one, `file` in the other |
| Initials | 4 (`main.js:7603`, `:13850`, `:23676`, `:24646`) | different fallbacks |
| Week start | 2 | **Sunday vs Monday** |
| Modal shells | 3 (`main.js:19605`, `:26240`, `:26419`) | different signatures, same job |
| Permission checks | 1 real (`main.js:41876` `can`) + 12 local re-derivations | each correct alone; a 13th is the risk |

`src/company-contacts/page.js:35-37` imports `conditionMet, linkIsSafe, planSet, resolveHref,
setValueFor` from `../workspace/button-field.js` and documents the choice: *"A contact reuses them
rather than owning a second copy."* That is the right answer and the exception, not the rule.

`src/crm/contact-editor.js:37-50` and `main.js:11410-11980` (the `qc-*` runtime) are two halves of
one form split across a module boundary by accident, not design.

---

## Build and config

`vite.config.js` is 92 lines and mostly good. `manifest: true` is required by the budget script.
`manualChunks` (`:69-83`) splits only `workspace-runtime` and `vendor-supabase` — **two chunks**.
`__QUEST_BUILD_SHA__` falls back to a high-entropy hex placeholder (`:63`), with a comment
explaining why `'development'` was wrong: it measured ~33 gzip bytes light and "let the
bundle-budget gate pass locally and then fail the deploy." A real bug found and fixed properly.

**What the gates enforce** — `scripts/bundle-budget-lib.mjs:116-135`:

| Limit | Value | Note |
|---|---|---|
| `entryJs` | 356 KB gzip | 6 documented raises: 340→342→344→346→348→352→356 |
| `initialJs` | 440 KB gzip | entry + static import closure |
| `entryCss` | 110 KB gzip | |
| tolerance | 64 bytes | zlib patch-version differences |

`check-bundle-boots.mjs` is the more interesting gate: it builds a ~60-line fake DOM, `import()`s
the real built entry chunk, and **fails the build on a top-level throw**. The header comment
records that a blank production page shipped from a TDZ error where *"every static check passed —
syntax, tests, bundle budget — because none of them execute the bundle."*

**Gaps.** No per-route or per-chunk budget — `handleAction`'s 2,940 lines are invisible to the
gate. The budget measures gzip of minified output; `bundle-budget-lib.mjs:67-70` records that
14 KB of raw source bought 1,825 gzip bytes, so the budget rewards DOM-binding code
disproportionately. The file knows this and says so.

`vercel.json` is well-built: 3 crons, real CSP plus report-only with `report-uri /api/csp-report`,
immutable caching scoped to hashed assets and `/taskmanagement/`, `no-cache` for `sw.js`, and a
rewrite that excludes `api/`, `assets/`, `taskmanagement/`, `icons/`, `downloads/`.

---

## CSS health

**The CR corruption is fixed and guarded.** Three tests assert zero CR bytes
(`tests/shell-sidebar-column.test.mjs:29-33`, `tests/task-embed-stabilization.test.mjs:70-72`),
both verified by mutation. `.gitattributes:18-35` pins `*.js *.css *.mjs text eol=lf` explicitly
rather than relying on `text=auto`. The doubled-CR damage was stripped in `30b2c5c`. No residual
damage found.

`!important` count of 32 is unusually low. Notable clusters: `:8867-8879` (8 on one selector
group, a specificity war already lost) and two separate `prefers-reduced-motion` blocks at
`:22517-22520` and `:25867-25868`.

`tests/css-class-collisions.test.mjs` exists because two components both shipped `wb-pick`, and
*"the later rule won — so the grid of checkboxes inherited `position: absolute; left: 0; right: 0`
… and landed as a full-width white card across the bottom of the window."* The test now
enumerates four hardcoded class names. It is a **narrow regression test for one specific bug**,
not a general collision detector.

Inline styles are pervasive in template literals (`style="color:${meta.color}"` at `:16773`).

---

## What's working well

Worth protecting during any refactor:

- **The observability story is the strongest area, built the hard way.** `main.js:47975-48027`:
  global `error` + `unhandledrejection` handlers, production-only, `REPORT_LIMIT = 5` per page
  load with dedup, identifiers only (no names, emails, or field values), `sendBeacon` with a
  `fetch(keepalive)` fallback, and every failure of the reporter itself swallowed. The comment
  records why: *"a startup crash reached production and was found by a user seeing a blank page,
  not by any gate."*
- **`api/client-error.js`** is careful: rate-limited, strips query strings and fragments from URLs
  *"because invite/recovery links carry secrets in exactly those places"*, scrubs URLs from stack
  traces, truncates every field, and always answers 204. No database, deliberately.
- **Pure functions are well factored** where they exist — `operationalHealth()` (added 2026-09-23)
  takes `today` and `dateKey` as injectable parameters specifically so tests can pin both.
- **Comments explain reasoning, not mechanics.** The uncapped-file-upload policy comment
  (`src/security/upload-policy.js`) states plainly what the change gives up and names the two
  mitigations that were considered and declined. That is the standard to match.

---

## Suggested sequence

**This week — correctness, small diffs:**

1. Week start (Sunday vs Monday) — #5. Real bug, one-line fix each.
2. Consolidate the three `timeAgo` and three byte formatters — #4.
3. Route the native task path through `task-store.js`, or remove the `?task_ui=native` opt-in — #1.
   This one is both a correctness fix and a data-isolation fix.

**This month — the two structural blockers:**

4. Add a failed-write queue — #6.
5. Derive `FACTORY_MODULES` at test time instead of hand-maintaining it — #8.
6. Forward iframe errors into the host reporter — #3.

**This quarter — the real refactor:**

7. Extract `handleAction` branches, starting with the App Builder ones, and inject dependencies
   so the closure stops being the whole application — #2. This is what unblocks everything else,
   and the bundle budget file already names it as the durable fix.
8. Move `state` behind a store with explicit ownership — #7.
