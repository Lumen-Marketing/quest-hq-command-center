# Client Portal Plan Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the public customer portal PDF review screen with real comment notes, clearer customer tools, and safer no-reload controls.

**Architecture:** Keep the existing single-page Vite app and Vercel API surface. Extend the current `src/main.js` client portal section in place, storing comment notes as normal client portal annotations with typed payloads and existing session/document/page fields.

**Tech Stack:** Vanilla JavaScript, Vite, Supabase-backed Vercel APIs, PDF.js, jsPDF, existing static Node tests.

---

### Task 1: Public Portal State And Static Tests

**Files:**
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\src\main.js`
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\tests\client-portal-plugin-static.test.mjs`

- [ ] **Step 1: Add static expectations for comments, swatches, zoom, undo, and no remount**

Add assertions that the public portal source contains `client-portal-comment-submit`, `client-portal-swatch`, `client-portal-zoom-in`, `client-portal-undo`, and that the tool action block still calls `updateClientPortalToolSelection` without `render()`.

- [ ] **Step 2: Run the static test and verify it fails before implementation**

Run: `node --test tests/client-portal-plugin-static.test.mjs`

Expected: FAIL because the new comment-note controls and handlers are not present yet.

### Task 2: Customer-Simple Layout And Controls

**Files:**
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\src\main.js`
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\src\styles.css`

- [ ] **Step 1: Replace the raw public toolbar with grouped icon controls**

Render tool buttons for pan, pen, line, arrow, rectangle, comment, stamp, and measure. Add swatches, stroke buttons, zoom in/out, fit, undo, save, and export controls.

- [ ] **Step 2: Add comments/layers/pages side panel tabs**

Render comment cards from annotations where `payload.type === 'comment'`, with note text escaped through `h()`, page number, guest name, timestamp, and open/resolved state.

- [ ] **Step 3: Add responsive CSS**

Keep the customer workspace full-screen on desktop, with scrollable side rails, stable icon buttons, comment cards, swatches, stroke buttons, and selected states. On mobile, stack the rails and viewer vertically.

### Task 3: Comment Notes And Annotation Behavior

**Files:**
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\src\main.js`

- [ ] **Step 1: Add comment draft state helpers**

Use `state.clientPortalPendingComment` to hold the clicked document/page/x/y location and `state.clientPortalSelectedAnnotationId` to highlight selected notes.

- [ ] **Step 2: Add customer comment creation**

When the comment tool is active and the customer clicks the plan, open a sidebar note editor instead of using `window.prompt`. On submit, create a `comment` annotation with `payload.text`, `payload.status = 'open'`, and normalized coordinates.

- [ ] **Step 3: Add note selection and resolve/reopen**

Clicking a comment card selects the matching annotation and redraws the overlay. Resolve/reopen updates `payload.status` locally and saves through the existing annotation endpoint.

### Task 4: Viewer Controls

**Files:**
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\src\main.js`

- [ ] **Step 1: Add zoom state without remounting on tool clicks**

Store `state.clientPortalZoom` and rerender only when zoom buttons, fit, document selection, or page selection require it.

- [ ] **Step 2: Add undo**

Remove the latest annotation for the current document and page, update local storage, redraw the overlay, and save when the user presses Save.

- [ ] **Step 3: Improve drawing output**

Draw numbered comment pins, selected pin highlight, arrowheads, rectangle, line, freehand placeholder line, stamp labels, and measurement labels.

### Task 5: Export, Verification, Deploy

**Files:**
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\src\main.js`

- [ ] **Step 1: Add comment summary page to export**

After the marked plan page, add a jsPDF summary page containing escaped plain text comment details.

- [ ] **Step 2: Run tests and build**

Run:

```powershell
node --test tests/*.mjs
npm run build
```

Expected: all tests pass and Vite build completes.

- [ ] **Step 3: Commit and deploy**

Run:

```powershell
git status -sb
git add src/main.js src/styles.css tests/client-portal-plugin-static.test.mjs docs/superpowers/plans/2026-07-01-client-portal-plan-review.md
git commit -m "Upgrade client portal plan review tools"
git push
vercel --prod
```

Expected: GitHub main receives the commit and Vercel production deployment completes.

- [ ] **Step 4: Browser QA**

Use the in-app browser against the deployed public portal. Verify: PDF opens, selecting tools does not reload the PDF, comment note creation shows a pin and sidebar note, save works, reload keeps the note, undo works, and export downloads a PDF with a comment summary.
