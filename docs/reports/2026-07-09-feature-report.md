# Change Report

**Report generated:**
| Time zone | Date & time |
| --- | --- |
| 🇵🇭 Philippines (PHT, UTC+8) | Thursday, July 9, 2026 — 11:11 AM |
| 🇺🇸 Arizona (MST, UTC−7) | Wednesday, July 8, 2026 — 8:11 PM |

**Project:** Quest HQ Command Center
**Scope:** `src/main.js`, `src/styles.css` — **671 insertions, 16 deletions** across 2 files

---

## Summary

Five feature areas were completed today: workspace apps can now appear as live dashboard widgets, dashboard cards are drag-reorderable, the app-builder icon and color pickers got a major upgrade, and the calendar supports click-to-add events. Two review-driven fixes were folded in.

---

## ✨ Added features

### 1. Workspace apps as dashboard widgets
Every app built in the Workspace App Builder can now be pinned to the dashboard via **Add widget → Workspace apps**.

- **Single-report widget** (`app:<id>`): shows one of — recent records, a count breakdown by a status/category field, or a numeric total of a number/money/calculation field.
- **Multi-field widget** (`app:<id> — fields`): a wide card showing several field reports side by side (breakdown bars for status/category fields, total tiles for numeric fields).
- **Per-widget configuration:** a ⚙ button (in Customize mode) opens a picker — radio choice for the single widget, multi-select checkboxes for the multi widget — each with a **live preview**.
- Config persists per app, per company (`localStorage`); a smart auto-default is used until the user chooses.
- Stale/removed apps drop out safely; nothing breaks if an app is deleted.

### 2. Dashboard drag-to-reorder
- While **Customize** is on, widget cards are **draggable** to reorder (with a grip cue, hover highlight, and drop-target indicator).
- Order **saves immediately on drop**; the existing move-left/right buttons remain for keyboard users.

### 3. Calendar click-to-add events
- Clicking any day cell in **Month** or **Week** view opens the **New event** form **pre-filled to that date** (defaults to a 9:00–10:00 AM slot).
- Each day shows a hover **+** button and a highlight to cue that it's clickable.
- Gated by the `calendar.manage` permission (view-only roles see no add affordance).
- Clicking an existing event pill still opens that event (not the add form).

---

## 🔧 Updated / improved features

### 4. App-builder icon picker
- Icon set expanded from **12 → ~115** curated Tabler icons (all validated against the bundled Tabler font).
- Added a **live search box** to the app-creation icon grid (filters as you type); grid is scrollable.

### 5. Custom color option
- Added a **custom-color swatch** (opens the native OS color picker) after the preset swatches in:
  - Add app modal
  - Create/Edit workspace modal
  - App Settings color row
- Custom colors persist everywhere the app icon renders.

---

## 🐛 Fixes (from review)

- **Multi-field widget empty selection:** a `touched` flag now distinguishes an explicit empty selection from "never edited," so unchecking all fields no longer snaps back to the defaults.
- **Dashboard load efficiency:** `dashboardAppWidgets` now skips the workspace-builder state fetch unless the `workspaces` module is installed for the company — keeps other companies' dashboards lean and avoids an unnecessary Supabase round-trip.

---

## ✅ Verification

- `node --check src/main.js` — passes
- `vite build` — passes (production bundle builds clean)
- Drag-and-drop and modal interactions verified by code review (not exercised headlessly)
