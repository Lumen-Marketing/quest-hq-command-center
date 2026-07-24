# Modular Quest Landing Page Implementation Plan

> **For Codex:** Execute this plan in the isolated `feat/modular-quest-landing` worktree. Do not start a local server; validate through deterministic checks and a Vercel preview.

**Goal:** Replace the command center's public marketing surface with the approved `modular-quest` direction while preserving the existing Questbase authentication, workspace creation, invite, session, and authenticated application behavior.

**Architecture:** Keep the existing Vite SPA and `renderLandingPage()` entry point. Port the approved landing markup into that renderer using landing-specific class names, import the approved Questbase logo and interior product reference as bundled assets, and route all conversion actions through the existing `open-auth-modal` action. Add one safe DOM-only action for the interactive workspace preview; no database, tenancy, or authenticated-shell changes are required.

**Tech Stack:** Vite, vanilla JavaScript template rendering, CSS, Node test runner, Vercel.

---

### Task 1: Lock the selected direction and live-auth contract with tests

**Files:**
- Create: `tests/modular-quest-landing-static.test.mjs`
- Read: `src/main.js`
- Read: `src/styles.css`

**Steps:**
1. Add static regression assertions for the Questbase brand, approved hero copy, responsive product preview, and landing sections.
2. Assert that Business login opens `signin`, Start workspace opens `register`, and Join by invite opens `invite`.
3. Assert that the obsolete early-access email form and old Quest HQ hero copy are absent.
4. Run the new test and confirm it fails before implementation.

### Task 2: Port the approved visual and assets

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Add: `src/assets/questbase-modular-logo.png`
- Add: `src/assets/questbase-interior-jobs.png`

**Steps:**
1. Import the approved logo and product screenshot through Vite.
2. Replace only `renderLandingPage()` marketing markup with the `modular-quest` structure.
3. Preserve the existing auth-modal rendering and session-aware Open workspace action.
4. Replace mock waitlist CTAs with real Business login, Start workspace, and Join by invite actions.
5. Add an interactive workspace-preview action and mark it read-only/safe.
6. Port the selected responsive CSS under a `qb-landing-*` namespace so authenticated app styles remain isolated.

### Task 3: Update canonical product state

**Files:**
- Modify: `.ai/context.md`
- Modify: `.ai/current-state.md`
- Modify: `.ai/decisions.md`

**Steps:**
1. Record Questbase as the market-facing product name while retaining internal repository/runtime identifiers.
2. Record the selected public landing direction and the decision to connect it to existing auth rather than a waitlist.
3. Avoid changing database or authenticated-shell architecture documentation.

### Task 4: Verify behavior and visual fidelity

**Files:**
- Create: `design-qa.md`

**Steps:**
1. Run the focused landing-page test.
2. Run `npm test`, `npm run ai:check`, `npm run build`, and `npm run check`.
3. Push the verified feature branch and inspect its Vercel preview without running a local server.
4. Exercise Business login, Start workspace, Join by invite, See how it works, and workspace-preview tabs.
5. Capture desktop and mobile screenshots.
6. Compare the deployed implementation against the selected source reference in one side-by-side image.
7. Fix material visual or interaction differences, rerun checks, and write `design-qa.md` with `final result: passed`.

### Task 5: Publish the verified implementation

**Files:**
- Commit all scoped files on `feat/modular-quest-landing`.

**Steps:**
1. Confirm the diff contains no authenticated-shell, database, or unrelated branch work.
2. Commit with a focused message and push the feature branch to GitHub.
3. Report the GitHub branch and verified Vercel preview URL; do not merge to production without explicit direction.
