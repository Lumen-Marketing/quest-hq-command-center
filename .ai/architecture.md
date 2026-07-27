# Architecture

## Runtime shape

Quest HQ is a Vite single-page application deployed on Vercel. The browser app is concentrated in [src/main.js](../src/main.js) and [src/styles.css](../src/styles.css). Vercel serves static assets from dist and rewrites non-API routes to index.html through [vercel.json](../vercel.json).

The app uses:

- Supabase Auth for sessions.
- Supabase Postgres for tenant data, RLS, RPCs, and cataloged cron work.
- Supabase Realtime for live collaboration and notifications.
- Supabase Storage for private and controlled-upload files.
- Vercel Functions under [api](../api) for privileged or public-token flows.
- Stripe checkout and webhook APIs through server-side functions.
- Lazy-loaded Leaflet and PDF.js; JSZip is used for archive/export behavior.
- Lazy-loaded pilot-readiness, support-reporting, and help-index modules keep first-run and support behavior outside the primary browser bundle until needed.
- A vendored TaskManagement runtime copied into the production bundle during build, now surfaced in-shell as the Tasks module via a same-origin `<iframe>` (see the X-Frame-Options and service-worker decisions) rather than a separate app the user is handed off to.

## Request and data flow

Browser route -> company/session reconciliation -> operational-workspace reconciliation -> permission, subscription, and plugin checks -> module renderer -> Supabase query/RPC or a narrowly scoped Vercel Function.

The tenancy hierarchy is `profile -> company membership -> company -> operational workspace -> workspace membership/role/plugins -> workspace-owned records`. A company is the customer, billing, and top-level security tenant. Operational workspaces are configurable child environments inside that company; they are not separate customer accounts.

Public flows such as client portals, public forms, and proposals go through token-aware API handlers. Server handlers use deployment-only credentials and must validate method, input, tenant scope, and authorization before accessing Supabase.

Worker onboarding follows one bounded path: a company manager selects a non-elevated role and one or more operational workspaces, the browser inserts a pending `company_invites` row, and the `send-company-invite` Supabase Edge Function derives and sends the recipient-specific message. Acceptance runs through `accept_company_invite`, which verifies the signed-in email and invite state, creates the company membership, clears stale custom-role assignments, inserts only a verified non-elevated role, and creates the selected `workspace_memberships`. Legacy invites without workspace selections fall back to the company default workspace.

## Routing

The SPA supports:

- Public home and login.
- Company routes scoped by company id and module section, with the selected operational workspace carried as `?workspace=<uuid>`.
- Public client portal, proposal, and form routes.
- Legacy route rewrites retained for compatibility.
- The Tasks module defaults to a same-origin iframe of the vendored Task app inside the command-center shell. The host passes a required `workspace_id`, optional `project_id`, and same-origin `return_url`; business context remains linked through `project_id`, `contact_id`, and `deal_id`. The feature-flagged native Tasks surface uses the same workspace boundary and per-person visibility model.

## Important source areas

| Area | Source |
| --- | --- |
| Browser application and module renderers | [src/main.js](../src/main.js) |
| Global interface styling | [src/styles.css](../src/styles.css) |
| Underwriting calculation rules | [src/underwriting/calculator.js](../src/underwriting/calculator.js) |
| Operational workspace selection and isolation rules | [src/workspaces/model.js](../src/workspaces/model.js) |
| Funnel next-action selection and record matching | [src/crm/next-action.js](../src/crm/next-action.js) |
| Password, upload, realtime policy helpers | [src](../src) |
| Shared CSV parser | [src/data/csv.js](../src/data/csv.js) |
| Imported/persisted color validation | [src/security/color.js](../src/security/color.js) |
| First-run launch checklist | [src/launch/pilot-readiness.js](../src/launch/pilot-readiness.js) |
| In-product support reporting | [src/support/reporting.js](../src/support/reporting.js) |
| Serverless API handlers | [api](../api) |
| Supabase Edge Functions | [supabase/functions](../supabase/functions) |
| RingCentral access (token exchange, paging, normalisation) | [api/_lib/ringcentral.js](../api/_lib/ringcentral.js) |
| Browser bearer token to company-admin identity | [api/_lib/user-auth.js](../api/_lib/user-auth.js) |
| Database history and authorization | [Supabase migrations](../supabase/migrations) |
| Build, SPA fallback, scheduled endpoint | [vercel.json](../vercel.json) |
| CI and production monitoring | [.github/workflows](../.github/workflows) |
| Machine-readable live catalog | [database/snapshot.json](database/snapshot.json) |

## Architectural invariants

- Company id remains the customer/billing/security tenant boundary; `workspace_id` is the operational data boundary for CRM, pipelines, underwriting, files, jobs, proposals, and tasks.
- Every company has one non-archivable default operational workspace. Existing company data was backfilled into it.
- Owners, admins, and developers inherit access to every active workspace in their company. Workers and other members require explicit active workspace membership and use that workspace's assigned role.
- Invites never grant Owner, Admin, or Developer. Those promotions happen only after onboarding through the owner-guarded member-access path.
- Invite email callers cannot choose the recipient, subject, HTML, token, company, role, or workspace names; the Edge Function derives them from the tenant-scoped invite.
- Company plugins are entitlements; workspace plugins control activation and configuration independently inside each child workspace.
- Linked CRM, quote, job, task, file, proposal, and underwriting records must share a workspace. Database constraint triggers enforce this independently of the browser.
- Browser access uses the publishable/anon key and relies on RLS.
- Service credentials never enter Vite client variables.
- Destructive business operations use safe-delete/recycle-bin or atomic RPCs where defined.
- Database mutations preserve the repository migration history.
- Public-token endpoints expose the minimum required record fields.
- TaskManagement owns task execution behavior; Quest HQ owns the surrounding business context.
- The host resolves an allowed operational workspace before loading TaskManagement. The vendored store writes that id on every task row and filters task list, refresh, refetch, update, delete, and purge operations by it. Missing hosted workspace context fails closed before any task data loads.
- The flag-on native surface's writes consolidate into an injectable write store, src/tasks/task-store.js, with pure predicates in src/tasks/task-shape.js. It owns the write protocol (optimistic apply, guarded insert/update, rollback, onChange), scopes every update by `id` + `workspace_id`, and reuses the single `normalizeTask` / `taskPayload` shape by injection. Built and unit-tested; not yet wired into src/main.js (see ADR-0001).
- Funnel "What's next" fields select from open tasks: contacts through `contact_id`, quotes/deals through tenant-scoped `deal_id`, and jobs through `project_id`.
- Job photos remain private `job_files`/`quest-job-files` records scoped by company and job; there is no parallel photo datastore.
- Underwriting inputs are durable per-workspace, per-contact records protected by Underwriter permissions and workspace RLS.
- RingCentral data is company-scoped and carries no `workspace_id`: a phone account belongs to the whole company and its calls do not belong to any single operational workspace. All `ringcentral_*` tables are service-role write only; every browser-facing policy is select. Non-admin members are matched to their own calls by `auth.jwt() ->> 'email'`, so no extension-to-member mapping table exists.
- RingCentral credentials live only in Vercel environment variables. `ringcentral_accounts.credential_key` names the variable; the JWT itself is never stored in Postgres and never reaches the browser.

