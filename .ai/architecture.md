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
- A vendored TaskManagement runtime copied into the production bundle during build.

## Request and data flow

Browser route -> company/session reconciliation -> permission and subscription checks -> module renderer -> Supabase query/RPC or a narrowly scoped Vercel Function.

Public flows such as client portals, public forms, and proposals go through token-aware API handlers. Server handlers use deployment-only credentials and must validate method, input, tenant scope, and authorization before accessing Supabase.

## Routing

The SPA supports:

- Public home and login.
- Company routes scoped by company id and module section.
- Public client portal, proposal, and form routes.
- Legacy route rewrites retained for compatibility.
- TaskManagement embed/full-view handoff with project_id and return_url.

## Important source areas

| Area | Source |
| --- | --- |
| Browser application and module renderers | [src/main.js](../src/main.js) |
| Global interface styling | [src/styles.css](../src/styles.css) |
| Underwriting calculation rules | [src/underwriting/calculator.js](../src/underwriting/calculator.js) |
| Password, upload, realtime policy helpers | [src](../src) |
| Serverless API handlers | [api](../api) |
| Database history and authorization | [Supabase migrations](../supabase/migrations) |
| Build, SPA fallback, scheduled endpoint | [vercel.json](../vercel.json) |
| CI and production monitoring | [.github/workflows](../.github/workflows) |
| Machine-readable live catalog | [database/snapshot.json](database/snapshot.json) |

## Architectural invariants

- Company id is the tenant boundary on business records.
- Browser access uses the publishable/anon key and relies on RLS.
- Service credentials never enter Vite client variables.
- Destructive business operations use safe-delete/recycle-bin or atomic RPCs where defined.
- Database mutations preserve the repository migration history.
- Public-token endpoints expose the minimum required record fields.
- TaskManagement owns task execution behavior; Quest HQ owns the surrounding business context.
- Job photos remain private `job_files`/`quest-job-files` records scoped by company and job; there is no parallel photo datastore.
- Underwriting inputs are durable per-company, per-contact records protected by Underwriter permissions and RLS.

