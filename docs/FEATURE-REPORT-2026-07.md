# Quest HQ Command Center — Feature & Fix Report

**Release window:** June 30 – July 2, 2026
**Author:** Roman Juan Eugenio — Software Engineer
**Environment:** Production (Vercel) · Supabase Postgres (project `rqundirizvojpzhljtdn`)
**Live workspace:** https://clone-quest-hq-command-center.vercel.app
**Repository:** `Lumen-Marketing/quest-hq-command-center`

---

## Executive summary

This release delivers one **new module** and a substantial round of **fixes and feature work**
across three areas of the platform:

1. **Workspace & Platform** — a new Estimating plugin was integrated end‑to‑end into the module,
   navigation, permission, and per‑company plugin systems; production deployment and database
   access‑control gaps were closed.
2. **Client Portal** — the public plan‑review link was restored to working order and significantly
   upgraded: real‑time comments, an in‑canvas comment modal, author‑scoped edit/delete, a
   full‑screen drafting‑team review window, and correct commenter attribution.
3. **Price Book (new)** — a tenant‑scoped vendor cost catalog under Estimating, backed by Supabase
   with row‑level security, covering vendors, materials, per‑vendor pricing, best‑price/stale
   detection, CSV/Excel import, and vendor credit lines.

All changes ship behind existing role/permission and per‑company plugin controls, are covered by
the static test suite (15 suites, green), and are deployed to production.

---

## Table of contents

1. [Workspace & Platform](#1-workspace--platform)
2. [Client Portal](#2-client-portal)
3. [Price Book (new module)](#3-price-book-new-module)
4. [Database migrations](#4-database-migrations)
5. [Testing & verification](#5-testing--verification)
6. [Deployment](#6-deployment)
7. [Known limitations & follow‑ups](#7-known-limitations--follow-ups)
8. [Appendix — file touchpoints](#8-appendix--file-touchpoints)

---

## 1. Workspace & Platform

### 1.1 New plugin integration (Price Book)

The Price Book was added as a first‑class **workspace plugin** rather than a bolt‑on page, so it
inherits the platform's install/permission/subscription gating. Integration points:

- **Plugin registry** (`WORKSPACE_PLUGIN_REGISTRY`) — new `price_book` plugin (module `price-book`),
  requiring `price_book.view` / `price_book.manage`.
- **Module registry** (`MODULE_REGISTRY`) — `price-book` module under the **Estimating** group.
- **Navigation** (`NAV_GROUPS`) — surfaced in the existing **Estimating** sidebar group, alongside
  Finance, Files, Forms, and Client portals.
- **Permissions** (`PERMISSION_REGISTRY`, `permissionPluginIds`) — two new permission keys wired to
  the plugin so the module, its data, and its actions are all consistently gated.
- **Per‑company enablement** (`company_plugins`) — the plugin was installed for both active
  workspaces; the DB allow‑list constraint was extended to accept the new plugin id.

Because owners/developers bypass permission checks at both app and database layers, the module was
usable by workspace owners immediately on install, with no manual role editing required.

### 1.2 Deployment pipeline fix — public links returned "Could not open portal"

**Symptom.** Clients opening a portal link saw a generic *"Could not open portal."* error.

**Root cause (three compounding infra defects).**

1. The SPA rewrite in `vercel.json` (`/:path*` → `/index.html`) was intercepting **`/api/*`**, so
   the client's `fetch('/api/client-portal-open')` received HTML instead of JSON.
2. A local `.vercelignore` excluded the entire `/api` functions directory from CLI deploys.
3. Two Supabase environment variables on the deployment were empty/missing
   (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

**Fix.**

- Rewrite changed to a negative lookahead so API routes bypass the SPA fallback:

  ```json
  { "source": "/((?!api/).*)", "destination": "/index.html" }
  ```
- Removed the `.vercelignore` entry so the serverless functions deploy.
- Set the required environment variables on the deployment.

**Verification.** A `POST /api/client-portal-open` with a bogus token now returns a clean
`404 {"error":"Portal link is invalid or revoked."}` (JSON) instead of HTML — confirming the
function executes and reaches Supabase.

### 1.3 Access‑control fix — deleted records reappeared on refresh

**Symptom.** Deleting a client portal (or plan document) removed it from the UI, but it returned on
the next page load.

**Root cause.** `client_portals` and `client_portal_documents` had `SELECT/INSERT/UPDATE` RLS
policies but **no `DELETE` policy**. Under RLS, a delete with no matching policy is silently
dropped (0 rows affected, no error), so the client cleared local state while the row survived in
the database.

**Fix.** Added manager `DELETE` policies mirroring the existing `UPDATE` predicate
(`price_book`‑style `has_company_permission(..., 'client_portals.manage')`). Deletes now persist.

---

## 2. Client Portal

The client portal is a shared blueprint‑review surface with two faces: the **owner / drafting‑team**
view (authenticated) and the **guest / client** view (public token link). Both are driven by the
same annotation engine.

### 2.1 Real‑time comment sync

Previously, staff and client had to press **Refresh** to see each other's activity. A lightweight
poller (5 s interval, both surfaces) now pulls new markups/comments and re‑renders automatically.

- **Change‑aware:** re‑renders only when the annotation signature (id + last‑change + reply count)
  actually changes — no needless repaints.
- **Non‑disruptive:** suppresses the live re‑render while the user is mid‑draw, placing a pin, or
  typing a reply, so it never steals focus or interrupts a stroke.

### 2.2 Comment pin → modal, with reply

Comment pins were view‑only markers tied to a side panel. Now:

- **Hover** shows a preview tooltip (commenter + text + reply count).
- **Click/tap** opens the full thread in a centered modal — unaffected by canvas zoom — with a reply
  box. A tap is distinguished from a drag (>6 px), so reading a comment never repositions the pin.

*Screenshot: `assets/reports/portal-comment-modal.png` — comment pin opened in modal with reply box.*

```
 ┌─ Comment ─────────────────────────────  ✕ ─┐
 │  ● Andrew (Drafting Team) · 2m ago          │
 │    Please confirm the window dimensions.    │
 │  ● Mr. Abe (Client) · 1m ago                │
 │    Make this 4 feet wider.                  │
 │  ┌───────────────────────────────┐  [ ➤ ]  │
 │  │ Reply…                        │          │
 │  └───────────────────────────────┘          │
 └─────────────────────────────────────────────┘
```

### 2.3 Author‑scoped edit & delete

Each thread message (and the comment itself) now has inline **edit** and **delete** controls, with
correct ownership rules:

- In the **client** view, a client can edit/delete only **their own** comments/replies.
- In the **drafting‑team** view, staff can edit/delete only **their own**.
- The other party's markups are read‑only (controls hidden), enforced in the UI and backstopped in
  the annotations API so a client replying to a staff comment cannot hijack its attribution.

### 2.4 Correct commenter names

Names were recomputed from whichever session was rendering, so client‑authored markups showed the
wrong name in the drafting‑team view. Names are now:

- **Captured at author time** on every markup and reply (stable across views), and
- **Resolved from the portal record** (client name) so the two surfaces agree.

Clients see the drafting team as *"Drafting Team"*; staff see the client's configured name.

### 2.5 Full‑screen drafting‑team review window

Opening a plan from a portal's Documents list now launches a **dedicated full‑screen review window**
(new tab, no dashboard chrome) so the team can review a client's edits on the full canvas. Switching
plans inside that window keeps it full‑screen.

*Screenshot: `assets/reports/portal-fullscreen-review.png` — full‑screen plan review.*

### 2.6 Canvas & tooling polish

- **Plan sits at the top** of the canvas (top‑aligned) rather than vertically centered, so the empty
  space is below the sheet.
- **Redo** — a redo control sits next to undo (`Ctrl+Shift+Z` / `Ctrl+Y`). Undo/redo operate only on
  the current user's own markups and replay in the correct order.

---

## 3. Price Book (new module)

A **tenant‑scoped vendor cost catalog** for estimating, under the Estimating group. Ported from the
`price-book-handoff` specification. **Cost only** — sell price/margin live downstream in the
Estimator and are intentionally never stored here.

### 3.1 Data model

```
pricebook_vendors ──1:N──┐
                          ├── pricebook_vendor_prices ──N:1── pricebook_materials
                          │      (one cost per vendor per material)
v_pricebook_material_best ┘  (view: lowest cost per material — always current)
```

- **Vendors** — name, type (supply house / lumber yard / distributor / manufacturer), account/rep,
  colour, last‑synced, and a **credit line** (see 3.5).
- **Materials** — canonical item (one row per name), category, unit.
- **Vendor prices** — one material's cost at one vendor (SKU, unit cost, updated‑at), unique per
  `(company, vendor, material)`.
- **Best price** — a database view; the lowest cost per material is computed, never stored, so the
  `best` badge stays correct after every edit/import.
- **Stale** — computed, not stored: a price older than 45 days flags amber.

### 3.2 Overview & KPIs

The landing page shows five KPI tiles and a two‑tab layout.

*Screenshot: `assets/reports/pricebook-overview.png`.*

```
┌ VENDORS ┐ ┌ MATERIALS (SKUs) ┐ ┌ LAST IMPORT ┐ ┌ PRICES > 45 DAYS ┐ ┌ ON ACCOUNT ┐
│    8    │ │        47         │ │ Jun 24 · ABC │ │        5         │ │  5 of 8    │
└─────────┘ └───────────────────┘ └──────────────┘ └──────────────────┘ └────────────┘
[ Vendors ]  [ All materials ]
```

- **Vendors** — card grid; each card shows material count, last‑synced (amber if stale), and a
  credit‑line chip. Clicking a card opens that vendor's catalog.
- **All materials** — flat, sortable table across vendors (Material, Category, SKU, Unit, Unit cost,
  Vendor, Updated) with search and category chips; the lowest‑cost row per material carries a green
  **best** badge.

*Screenshot: `assets/reports/pricebook-materials-table.png`.*

### 3.3 CRUD

- Add/edit **vendors** and **materials**.
- **Inline cost editing** — click a cost, edit, press Enter; the row re‑stamps its updated date and
  the best/stale badges recompute.
- Delete rows and vendors (vendor delete cascades its prices).
- Every write persists to Supabase and mirrors to local state for immediate feedback.

### 3.4 Import (CSV / Excel)

A redesigned **Import prices** dialog:

- **Drag‑and‑drop** zone (or click to browse) accepting `.csv .tsv .xlsx .xls`.
- **Excel** files are parsed client‑side (SheetJS, lazily loaded); TSV auto‑detects the tab delimiter.
- **Download CSV template** provides the exact column layout with sample rows.
- **Idempotent** upsert keyed on `(vendor, material)` — re‑importing updates prices, never duplicates,
  and stamps the vendor's last‑synced date.

*Screenshot: `assets/reports/pricebook-import.png`.*

### 3.5 Vendor credit line

Vendors record whether the supplier extends a **credit line** to the subscriber:

- **Credit line with you** — *No credit line — cash / COD* or *On account — credit line open*.
- When **on account**, two fields appear: **Payment terms** (COD / Net 15 / 30 / 45 / 60) and a
  **Credit limit ($)**.
- Surfaced as a chip on the vendor card/detail (green *"On account · Net 30 · $25,000 limit"* vs a
  neutral *"Cash / COD"*), and rolled up into the **On account** KPI (X of Y vendors).

*Screenshot: `assets/reports/pricebook-vendor-credit.png`.*

### 3.6 Search reliability fix

The catalog search re‑rendered the workspace on each keystroke, which dropped input focus (one
character at a time). Focus and caret position are now preserved across re‑render, in both the
All‑materials and vendor‑detail searches.

### 3.7 Security

All three tables are company‑scoped with row‑level security: reads require `price_book.view`, writes
require `price_book.manage`, verified through the platform's `app_private` permission helpers. A
tenant cannot read or modify another tenant's catalog.

---

## 4. Database migrations

All migrations were applied to the live Supabase project and are tracked in
`supabase/migrations/`.

| Migration | Purpose |
|---|---|
| `202607011600_client_portal_delete_policies.sql` | Manager DELETE RLS for `client_portals` + `client_portal_documents` (fixes reappear‑on‑refresh) |
| `202607011800_price_book_module.sql` | Price Book tables, best‑price view, indexes, RLS |
| `202607011810_price_book_plugin_allowlist.sql` | Allow `price_book` in the `company_plugins` allow‑list |
| `202607011820_price_book_vendor_credit_terms.sql` | Initial vendor `credit_terms` column |
| `202607011830_price_book_vendor_credit_line.sql` | Split credit line into `on_account`, `payment_terms`, `credit_limit` (+ backfill) |

---

## 5. Testing & verification

- **Static test suite:** 15 suites, all passing (`node tests/*.test.mjs`), including the
  workspace‑plugins and client‑portal plugin registration/gating tests.
- **Build:** `npm run build` (Vite) green on every deploy.
- **API smoke checks:** client‑portal endpoints verified live to return structured JSON for the
  configured / not‑configured / invalid‑token cases.
- **Database:** RLS policies and new tables/columns verified present via SQL introspection; the
  best‑price view confirmed queryable.

---

## 6. Deployment

- **Platform:** Vercel (SPA + serverless `/api/*` functions), Vite build, output `dist/`.
- **Backend:** Supabase (Postgres + RLS + Storage).
- **Method:** production deploys via the Vercel CLI (`vercel deploy --prod`) from the release branch;
  database changes via tracked migrations.
- **Config note:** the SPA rewrite must continue to exclude `/api/*` (negative lookahead) or the
  serverless functions are shadowed by the SPA fallback.

---

## 7. Known limitations & follow‑ups

- **Real‑time comments** use a 5‑second poll; a WebSocket/Supabase‑Realtime upgrade would reduce
  latency further.
- **Edit/delete permissions** on portal comments are enforced by author *role* (client vs. drafting
  team) in the UI, with a server backstop on attribution; hard per‑individual enforcement is a
  future hardening step.
- **Price Book import** covers CSV/TSV/XLSX; a PDF/vendor‑sheet AI parser and an "import from URL"
  path are out of scope for this release.
- **Estimator / AI quote agent / proposals** (downstream consumers of the Price Book) are not part of
  this release — the Price Book is the catalog they will read from.
- Non‑owner roles need `price_book.view` / `price_book.manage` granted to see/edit the module.

---

## 8. Appendix — file touchpoints

- **Application:** `src/main.js` (module registration, client‑portal engine, Price Book module,
  action/routing/modal wiring), `src/styles.css` (Price Book + portal UI).
- **Serverless:** `api/client-portal-open.js`, `api/client-portal-annotations.js`.
- **Config:** `vercel.json` (rewrite), `.vercelignore` (removed).
- **Database:** `supabase/migrations/2026070116xx–2026070118xx` (see §4).

---

*Prepared by Roman Juan Eugenio, Software Engineer — Quest HQ Command Center. For questions on any
item above, see the linked source files or the migration history in `supabase/migrations/`.*
