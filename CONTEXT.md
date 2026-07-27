# Quest HQ — Domain & Architecture Context

Domain glossary and the shared architecture vocabulary used when reasoning about
this codebase. Architecture terms follow the deep-module vocabulary: **module,
interface, implementation, depth, seam, adapter, leverage, locality**.

## Domain language

- **Company / Company Workspace** — the top-level tenant. Owns jobs, contacts,
  CRM records, files, forms, finance, settings, dashboards.
- **Job** — the parent container for work; `jobs.id` is the stable identifier
  task execution scopes by, as `tasks.project_id`.
- **Tasks surface** — how a Job's tasks are rendered. Flag-gated by
  `VITE_NATIVE_TASKS_MODULE` (`CONFIG.nativeTasksModule`, default **off**):
  `renderTasksPage` routes to `renderNativeTasksPage` when on, else
  `renderEmbeddedTasksPage`. This flag is the migration mechanism from embed to
  native — a deliberate strangler, not an accident.
  - **Embedded (default)** — the vendored **TaskManagement** app under
    `taskmanagement/`, run in an iframe with `?embed=1&project_id=<job.id>`,
    session shared same-origin against the same Supabase project. Requires a real
    Supabase session (demo/local render a sign-in notice instead).
  - **Native (flag on)** — the host's own task UI (board/table/detail/forms)
    writing directly to `tasks`, workspace-scoped.
- **Tasks store** (`src/tasks/task-store.js`) — the injectable write engine for
  the **native** path. Owns the write protocol (optimistic apply → guarded
  insert/update → rollback → `onChange`); updates are scoped by both `id` and
  `workspace_id` (tenant guard). `normalizeTask` / `taskPayload` (main.js) are
  injected, so there is one row shape and one write shape; the `db` client is
  injected too, so the interface is the test surface. Pure predicates in
  `src/tasks/task-shape.js` (`isOpenTask`, `scopeToJob`). Built but not yet
  wired into `main.js`. See ADR-0001.
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
- **`supabase-storage.js`** — `createStorageClient()` returns a supabase-js
  client for the Storage operations `ctx.db` cannot express (signed upload and
  download URLs). Base URL and key come from `supabase-admin.js`, so the two
  can never disagree about env resolution. Only the two public-form file
  endpoints use it, via `ctx.storage || createStorageClient()` — a real
  default in production, a fake in tests.
- **`form-files.js`** — the Public Form file bucket name, size cap and upload
  allowlists, shared by the three form endpoints. Holds three separate gates:
  an allowed-MIME set (ZIP-based Office formats deliberately excluded), an
  allowed-extension set, and a dangerous-extension blocklist checked against
  every dot-segment of the raw filename, so `invoice.pdf.exe` and `logo.svg`
  are rejected on this public, unauthenticated path.

`ctx = { req, res, query, body, session?, db }`. Handlers return a plain object
(→ JSON 200), a `fileResponse(...)` (→ raw bytes), a `jsonResponse(status, body)`
(→ explicit status), or throw `HttpError(status, message, extraBody?)`.
