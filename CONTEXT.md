# Quest HQ — Domain & Architecture Context

Domain glossary and the shared architecture vocabulary used when reasoning about
this codebase. Architecture terms follow the deep-module vocabulary: **module,
interface, implementation, depth, seam, adapter, leverage, locality**.

## Domain language

- **Company / Company Workspace** — the top-level tenant. Owns jobs, contacts,
  CRM records, files, forms, finance, settings, dashboards.
- **Job** — the parent container for work; `jobs.id` is the stable identifier
  handed to TaskManagement as `tasks.project_id`.
- **TaskManagement** — the vendored work-execution module (tasks, time,
  notifications). Integrated across one seam: `job.id -> task.project_id`.
- **Plugin** — per-company feature gating (`company_plugins`, presets).
- **Client Portal** — the guest-facing surface where an external client opens a
  tokened link, optionally enters a password, and reviews/annotates documents.
- **Portal Session** — a short-lived signed token minted when a guest opens a
  Client Portal. Carries `portal_id`, `company_id`, `guest_name`, `exp`; signed
  and verified with HMAC-SHA256. Every guest request after `open` presents it.
- **Guest** — an unauthenticated external client acting through a Portal Session
  (never a Supabase auth user).
- **Public Form** — a published form collecting responses from anyone, no session.

## Architecture: the API endpoint module

The Vercel functions under `api/` share one deep seam, `api/_lib/`:

- **`endpoint.js`** — `defineEndpoint(config, handler)`. The interface is a
  config object (`method`, `auth`, `rateLimit`, …) plus the handler's unique
  logic; the implementation owns the whole request pipeline: method check,
  security headers, rate limit, body cap, config guard, auth dispatch,
  single-writer response, error handling. The handler is the only code that
  varies per endpoint.
- **`portal-session.js`** — `signPortalSession` / `verifyPortalSession`. The
  Portal Session seam: HMAC sign/verify + `exp`. `open` signs; the
  `portal-session` auth mode verifies.
- **`supabase-admin.js`** — `createAdminFetch()` returns the admin fetch that
  owns base-URL resolution and the service-key header logic. Injected onto the
  handler context as `ctx.db`, which makes it a real seam: production passes the
  real fetch, tests pass a fake.

`ctx = { req, res, query, body, session?, db }`. Handlers return a plain object
(→ JSON 200), a `fileResponse(...)` (→ raw bytes), a `jsonResponse(status, body)`
(→ explicit status), or throw `HttpError(status, message, extraBody?)`.
