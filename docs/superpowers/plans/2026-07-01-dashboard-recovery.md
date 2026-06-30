# Dashboard Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the dashboard framework from the team handoff: role views, rep/range filters, add-widget tray, customize mode, reorder/remove, and the high-value real-data widgets.

**Architecture:** Keep the existing vanilla JavaScript/Vite app. Add a dashboard widget registry and local per-browser layout persistence first, using existing app data helpers for READY widgets and locked placeholders for widgets that need new tables or integrations.

**Tech Stack:** Vanilla JavaScript, CSS, Vite, existing static Node tests.

---

### Task 1: Dashboard Framework

**Files:**
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\src\main.js`
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\tests\dashboard-static.test.mjs`

- [x] Add static test expectations for `DASHBOARD_WIDGET_GROUPS`, `DASHBOARD_WIDGET_DEFAULTS`, rep/range controls, add-widget, customize, remove, and reorder actions.
- [x] Add state for active role view, rep filter, range filter, customize mode, tray open state, and layout persistence key.

### Task 2: Real-Data Widgets

**Files:**
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\src\main.js`

- [x] Implement widget registry with real-data widgets for activity totals, leaderboard, sales funnel, jobs by stage, revenue/receivables, average ticket, revenue growth, backlog, goal pacing, pipeline coverage, DSO, concentration, service mix, and task/status equivalents where needed.
- [x] Implement locked widgets for missing data sources with clear "Needs data source" labels.

### Task 3: Controls And Customization

**Files:**
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\src\main.js`
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\src\styles.css`

- [x] Render role tabs, rep select, date range segmented controls, context label, add-widget tray, customize button, remove buttons, and move/reorder buttons.
- [x] Persist layouts in local storage per company and role view.
- [x] Add CSS matching the handoff density and controls.

### Task 4: Verify And Deploy

**Files:**
- Modify: `C:\Users\Joshua\Desktop\Quest roofing\Lumen Command Center\tests\dashboard-static.test.mjs`

- [x] Run `node --test tests/*.mjs`.
- [x] Run `npm run build`.
- [ ] Commit, push to GitHub, deploy with `npx vercel --prod --yes`, and browser QA the dashboard.
