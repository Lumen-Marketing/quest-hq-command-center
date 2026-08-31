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
- Lazy-loaded pilot-readiness, support-reporting, Help Center page/styles, and help-index modules keep first-run and support behavior outside the primary browser bundle until needed.
- A lazy-loaded company-search index maps only permission-allowed Contacts, Quotes, Jobs, Tasks, Files, and Proposals into workspace-aware command-palette routes.
- A lazy-loaded local form-draft engine protects unsaved Contact, Job, Quote, and Underwriter input without adding those recovery copies to the primary browser bundle.
- A lazy-loaded record-history presenter reads the workspace-scoped `record_history` ledger only when a Contact, Quote, or Job history dialog is opened.
- A lazy-loaded workspace-setup modal turns owner answers or a selected blueprint into an editable app/pipeline/role plan for exactly one selected operational workspace; the pure planning model, broad searchable work-type catalog, Supabase controller, and Setup > Workspaces launcher remain separate.
- Setup and Admin page composition is lazy-loaded from `src/settings/settings-surfaces.js`; it reuses the existing company, workspace, plugin, role, billing, backup, recycle, audit, and diagnostics renderers rather than creating parallel stores or writes.
- A vendored TaskManagement runtime copied into the production bundle during build, now surfaced in-shell as the Tasks module via a same-origin `<iframe>` (see the X-Frame-Options and service-worker decisions) rather than a separate app the user is handed off to.
- Content-hashed Vite assets are immutable at the CDN/browser layer. The copied Tasks runtime adds the deployment revision to script/style/vendor URLs before applying the same policy; its HTML and environment JSON remain revalidated.
- Workspace Builder styling is a route-loaded chunk. The shared shell loads it through a retryable singleton before rendering Builder markup, so other routes do not parse Builder-only CSS.
- The authenticated startup query plan lives in `src/data/initial-data-queries.js`: independent reads start together, including Automations, and each read plus the pre-shell profile lookup has a 15-second ceiling so one stalled request cannot hold the workspace loader indefinitely.
- The embedded Tasks runtime retries its same-origin Supabase SDK once when the original deferred script request fails, then presents its existing terminal auth error if recovery also fails.

## Request and data flow

Browser route -> company/session reconciliation -> operational-workspace reconciliation -> Help Center or permission/subscription/plugin checks -> module renderer -> Supabase query/RPC or a narrowly scoped Vercel Function.

The route reconciliation step canonicalizes stale or inaccessible company/workspace identifiers against the signed-in member's allowed tenant set before any company module renders.

The tenancy hierarchy is `profile -> company membership -> company -> operational workspace -> workspace membership/role/plugins -> workspace-owned records`. A company is the customer, billing, and top-level security tenant. Operational workspaces are configurable child environments inside that company; they are not separate customer accounts.

Company-owner onboarding follows `company creation -> guaranteed blank default Main workspace -> required Setup modal for Main -> answers or blueprint -> editable review -> apply_workspace_setup`. Every later operational-workspace creation opens the same required modal for that new workspace. The required version has no Cancel, close control, backdrop exit, or Escape exit; applying a plan or using Start from scratch is its valid completion path. Setup > Workspaces is a launcher for the same modal in a cancellable mode. Its work-type question searches a broad catalog that maps back to the existing bounded server plan families. Drafts, applied plans, reset history, and an optimistic mutation revision are keyed by `workspace_id`; apply changes only the selected workspace and a retry reuses the server-recorded role ids. Reset clears that workspace's questions and draft only, deliberately preserving its applied configuration, every tenant/business record, and every sibling workspace.

Public flows such as client portals, public forms, and proposals go through token-aware API handlers. Server handlers use deployment-only credentials and must validate method, input, tenant scope, and authorization before accessing Supabase.

Worker onboarding follows one bounded path: a company manager selects a non-elevated role and one or more operational workspaces, the browser inserts a pending `company_invites` row, and the `send-company-invite` Supabase Edge Function derives and sends the recipient-specific message. Acceptance runs through `accept_company_invite`, which verifies the signed-in email and invite state, creates the company membership, clears stale custom-role assignments, inserts only a verified non-elevated role, and creates the selected `workspace_memberships`. Legacy invites without workspace selections fall back to the company default workspace.

## Routing

The SPA supports:

- Public home and login.
- Company routes scoped by company id and module section, with the selected operational workspace carried as `?workspace=<uuid>`.
- The signed-in `/company/:companyId/help` route remains available after tenant reconciliation even when subscription or workspace-plugin gates block business modules. Its articles are filtered against the real module, plugin, subscription, and permission checks before they are shown.
- Public client portal, proposal, and form routes.
- Legacy route rewrites retained for compatibility.
- The Tasks module defaults to a same-origin iframe of the vendored Task app inside the command-center shell. The host passes a required `workspace_id`, optional `project_id`, and same-origin `return_url`; business context remains linked through `project_id`, `contact_id`, and `deal_id`. The feature-flagged native Tasks surface uses the same workspace boundary and per-person visibility model.
- Realtime refreshes continue loading host data while an embedded Tasks frame is active, but skip the host's full-shell render when that frame is already mounted. This preserves the live TaskManagement document and its in-progress UI state; normal navigation, native Tasks, and non-Tasks routes keep the standard render path.

## Important source areas

| Area | Source |
| --- | --- |
| Browser application and module renderers | [src/main.js](../src/main.js) |
| Global interface styling | [src/styles.css](../src/styles.css) |
| Underwriting margin rules | [src/underwriting/calculator.js](../src/underwriting/calculator.js) |
| GAF takeoff formulas, defaults and formula language | [src/underwriting/takeoff.js](../src/underwriting/takeoff.js) |
| Takeoff card rendering and editing | [src/underwriting/takeoff-card.js](../src/underwriting/takeoff-card.js) |
| Operational workspace selection and isolation rules | [src/workspaces/model.js](../src/workspaces/model.js) |
| Funnel next-action selection and record matching | [src/crm/next-action.js](../src/crm/next-action.js) |
| Password, upload, realtime policy helpers | [src](../src) |
| Shared CSV parser | [src/data/csv.js](../src/data/csv.js) |
| Authenticated startup query plan and timeout | [src/data/initial-data-queries.js](../src/data/initial-data-queries.js) |
| Workspace Builder route stylesheet and loader | [src/workspace/builder.css](../src/workspace/builder.css), [src/workspace/builder-style-loader.js](../src/workspace/builder-style-loader.js) |
| Copied Tasks asset versioning and SDK recovery | [scripts/sync-spa-assets.mjs](../scripts/sync-spa-assets.mjs), [taskmanagement/js/sdk-loader.js](../taskmanagement/js/sdk-loader.js) |
| Imported/persisted color validation | [src/security/color.js](../src/security/color.js) |
| First-run launch checklist | [src/launch/pilot-readiness.js](../src/launch/pilot-readiness.js) |
| Workspace setup planner and blueprints | [src/onboarding/company-setup-model.js](../src/onboarding/company-setup-model.js) |
| Workspace setup UI/controller | [src/onboarding/company-setup-panel.js](../src/onboarding/company-setup-panel.js) |
| Setup/Admin route composition and information architecture | [src/settings/settings-surfaces.js](../src/settings/settings-surfaces.js), [src/settings/navigation-model.js](../src/settings/navigation-model.js) |
| In-product support reporting | [src/support/reporting.js](../src/support/reporting.js) |
| Grounded Help Center catalog and filtering | [src/assistant/help-index.js](../src/assistant/help-index.js) |
| Lazy Help Center page and responsive styles | [src/help](../src/help) |
| Same-browser operational form recovery | [src/drafts/form-drafts.js](../src/drafts/form-drafts.js) |
| Shared business-record history presentation | [src/history/record-history.js](../src/history/record-history.js) |
| Permission-scoped company search mapping | [src/company-search.js](../src/company-search.js) |
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
- Workspace setup plans are bounded and server-validated: exactly one target workspace, known apps, mutually exclusive CRM variants, unique stage names, at most fifty stages, and only predefined non-elevated role templates.
- Applying workspace setup is atomic and idempotent. It changes only the target workspace, never re-enables or claims a company-disabled entitlement, preserves manually installed apps and their configuration, blocks an unmanaged CRM/Quest CRM conflict rather than activating both, and preserves populated pipelines. Draft, apply, and reset use optimistic revisions so stale tabs cannot overwrite newer choices.
- Resetting workspace setup never deletes or rolls back the company, memberships, sibling workspaces, applied configuration, plugins, roles, customers, jobs, tasks, files, or messages; it only reopens that workspace's questionnaire.
- Uploaded operational-workspace icons are validated and stored with the workspace. Default changes use one authorized, company-scoped database transaction; the browser updates only after that transaction succeeds.
- Owners, admins, and developers inherit access to every active workspace in their company. Workers and other members require explicit active workspace membership and use that workspace's assigned role.
- Invites never grant Owner, Admin, or Developer. Those promotions happen only after onboarding through the owner-guarded member-access path.
- Invite email callers cannot choose the recipient, subject, HTML, token, company, role, or workspace names; the Edge Function derives them from the tenant-scoped invite.
- Company plugins are entitlements; workspace plugins control activation and configuration independently inside each child workspace.
- Plugin catalog entries also disclose whether their current records are workspace-private, company-shared, or hybrid; activation alone does not change the underlying data boundary.
- Linked CRM, quote, job, task, file, proposal, and underwriting records must share a workspace. Database constraint triggers enforce this independently of the browser.
- Contact-to-quote graduation is a single authenticated RPC keyed by a client request UUID. The transaction locks the contact and returns all linked records so retries cannot create duplicate quotes.
- Contact SMS does not mount its thread or composer until a server readiness response proves tenant access, provider setup, workspace-safe storage/number assignment, and a complete code-level workspace-routing contract.
- Browser access uses the publishable/anon key and relies on RLS.
- Service credentials never enter Vite client variables.
- Terminal company lifecycle uses an expand/contract projection: `company_subscriptions.status` keeps the legacy `canceled` value for every terminal row, while nullable `terminal_status` distinguishes `archived`, `rejected`, and Stripe `canceled`. Legacy RPCs expose the safe legacy projection; lifecycle-v2 RPCs and current clients expose `coalesce(terminal_status, status)`. A non-null terminal status always blocks subscription access, including when a stale grace date remains.
- Destructive business operations use safe-delete/recycle-bin or atomic RPCs where defined.
- Database mutations preserve the repository migration history.
- Public-token endpoints expose the minimum required record fields.
- TaskManagement owns task execution behavior; Quest HQ owns the surrounding business context.
- The host resolves an allowed operational workspace before loading TaskManagement. The vendored store writes that id on every task row and filters task list, refresh, refetch, update, delete, and purge operations by it. Missing hosted workspace context fails closed before any task data loads.
- The flag-on native surface's writes consolidate into an injectable write store, src/tasks/task-store.js, with pure predicates in src/tasks/task-shape.js. It owns the write protocol (optimistic apply, guarded insert/update, rollback, onChange), scopes every update by `id` + `workspace_id`, and reuses the single `normalizeTask` / `taskPayload` shape by injection. Built and unit-tested; not yet wired into src/main.js (see ADR-0001).
- Funnel "What's next" fields select from open tasks: contacts through `contact_id`, quotes/deals through tenant-scoped `deal_id`, and jobs through `project_id`.
- **Company Contacts** (`company_contacts`, `company_contact_fields`) is a company-scoped directory with deliberately no `workspace_id`: one person seen the same way from every workspace. Read is any active company member; writes use granular create/edit/delete/field-management permissions, with `company_contacts.manage` retained as the legacy everything-grant. It is a separate object from `contacts`, which is workspace-private and belongs to the CRM plugin's own pipeline. A company is expected to use one or the other — a company building its pipeline from App Builder apps uses Company Contacts and leaves the packaged CRM out. Running both as first-class produces two of every customer.
- The contact form is **customer-defined**. `company_contact_fields` holds a per-company list (label, type, config, required, position); the values live in `company_contacts.field_values`, a jsonb map keyed by field id. Only `name` stays a real column — it is the title in every list, link and search result, so it must not be deletable. The eleven types are the App Builder basics: text, long text, number, money, phone, email, location, file, category, yes/no, date, validated by a CHECK constraint as well as in the browser, because an unknown type renders as nothing.
- Directory columns, the chip filter, card layout and search all read the field list rather than named columns. The chips follow the **first category field**, whatever the company called it; a second set of chips would be two answers to the same question. A category field carries its own option list in `config.options`, so two category fields keep separate vocabularies — the shared `company_contact_options` table it replaced could not.
- Removing a field soft-deletes its definition through the audited 30-day Recycle Bin. Active reads stop collecting and displaying it while values already stored under its id stay in `field_values`; restoring the definition with its original id brings those values back into view.
- The App Builder `company_contact` field type stores a contact id and displays the name, pointing out of the workspace at that directory — as opposed to `relationship`, which points at another app inside one workspace. A field type absent from `WB_FIELD_TYPES` is silently rewritten to `text` by `normalizeWorkspaceBuilderDoc`, so registering the type is what makes it survive a reload.
- A `category` field chooses its **display style** (`config.display`): `dropdown`, a type-ahead that searches, or `chips`, every option on screen for one-click picking. Anything but `chips` reads as the dropdown, so fields built before the choice existed keep the control they had. Both write the option **id** into the same hidden `[data-f]` input, so saving, automations, filters and the table cannot tell which style drew the field. Chips run from `src/workspace/chip-field.js`, inside the lazily fetched `field-config-ui` chunk that draws them — `wbRenderFieldInput` renders nothing until that module arrives, so a chip on screen proves the runtime is loaded and `src/main.js` keeps only the event routing.
- A category value the field has never seen is **added rather than refused**, through one shared `wbMintOption` (`src/workspace/option-mint.js`). Three routes reach it: typing into the dropdown, the chips' "+ Other" box, and a copy from a company contact or linked record whose value this app has no option for. Sharing it is what stops "roofing" and "Roofing" becoming two options with two colours; minting is gated on `workspaces.manage`, because adding an option changes the app for everybody, not just the record being edited.
- A copy carries a category as its **label**, since an option id means nothing on the source's side. The dropdown resolves it through its visible box; chips have no such box, so `applyPullValues` resolves the label to an id *before* comparing against what is already there — comparing labels would make every copy look like a change and overwrite a value somebody picked themselves.
- "Active with us" and "Open balance" are queries over the App Builder document, never columns on the contact. The whole company's workspaces, apps, fields and items already live in one `workspace_builder_state` row, so the rollup is an in-memory scan (`src/company-contacts/model.js`) rather than a query per workspace. Linked apps are skipped: a linked app is a pointer at another workspace's app, and counting it reports the same record twice.
- Open balance comes from the field a Company Contact field **nominates** (`config.balanceFieldId`), not from summing every money field on the app. An app routinely carries contract value, collected and change-order totals; adding them produces a number that means nothing. Only the first contact field that nominates one is used, so two contact fields on one app cannot count the same money twice.
- Job photos remain private `job_files`/`quest-job-files` records scoped by company and job; there is no parallel photo datastore.
- Underwriting inputs are durable per-workspace, per-contact records protected by Underwriter permissions and workspace RLS.
- Company search indexes only records already loaded for operational workspaces the signed-in user may enter, applies each target workspace's plugin and permission checks, and carries that workspace into navigation.
- Search ranking may use labeled record metadata, but result explanations contain only a matched
  field already visible to that user. The command matcher and company record index are lazy-loaded
  together on first Search use.
- Role preview changes the effective browser identity for all visible company and platform
  surfaces, including developer-only bypasses. The real authenticated identity remains unchanged,
  and every privileged write is still re-authorized by the server/database.
- Client performance reports are bounded structural telemetry: operation label, duration, route,
  revision, and opaque tenant/profile identifiers. They exclude query strings, fragments, record
  values, names, email addresses, and file paths, and reporting is loaded only after a slow event.
- Help Center content is curated and grounded in shipped Questbase behavior rather than generated at request time. A topic tied to a module is visible only when the current role can open that module in the selected operational workspace; manage-only tutorials also require their named permission. The separate Knowledge Base remains customer-authored company SOP content.
- Local form drafts are recovery copies, not business records. Their storage keys include profile, company, operational workspace, form type, and record id; they expire after seven days, exclude sensitive/file fields, clear after a successful real save or explicit discard, and purge for the signing-out profile. Job, Quote, CRM Contact, Underwriter and **Company Contact** forms are protected. A Company Contact is company-scoped, so its draft is keyed to the sentinel workspace `company` rather than to whichever workspace happened to be open — otherwise switching workspace would hide a half-typed contact from the person who came back for it.
- Writing a draft stays in the entry bundle (it runs on every keystroke and a fetch there would stall typing); **restoring or discarding** one is fetched on the click, in `src/drafts/draft-recovery.js`, because it drags the whole dependent-address chain (country → province → city → barangay) with it. The mutable module holders it needs are passed as getters, not values — they are null until their own fetch lands.
- **A render must never interrupt typing.** `render()` rebuilds the page from state, and a half-filled form lives in the DOM, not in state, so any refresh the user did not ask for is held off by one shared predicate (`renderWouldInterrupt`, over `shouldDeferRealtimeRefresh`) and retried. The realtime refresh always did this; the presence feed did not, so a colleague opening the app in another tab wiped whatever was being typed — a loss nothing the typist did could explain, which is why it read as random. On the deferred path the new presence set is deliberately *not* committed, so the retry still sees a change to apply.
- Shared record history is append-only and workspace-scoped. Database triggers capture only whitelisted business fields for Contacts, Quotes, Jobs, and Tasks; readers still require current workspace membership plus the module's view permission. Immediate Undo is same-actor, time-limited, source-allowlisted, and server-authorized, while the 30-day Recycle Bin remains the durable recovery path.
- RingCentral data is company-scoped and carries no `workspace_id`: a phone account belongs to the whole company and its calls do not belong to any single operational workspace. All `ringcentral_*` tables are service-role write only; every browser-facing policy is select. Non-admin members are matched to their own calls by `auth.jwt() ->> 'email'`, so no extension-to-member mapping table exists.
- RingCentral credentials live only in Vercel environment variables. `ringcentral_accounts.credential_key` names the variable; the JWT itself is never stored in Postgres and never reaches the browser.
- RingCentral is an optional integration. An authorized company with no active account receives a successful presence response with `connected: false`; database and credential failures remain errors, while a provider failure may return the deliberately stale stored snapshot. Calls presence state and its poller are company-keyed: only the explicit disconnected response is terminal, transient failures remain retryable, and a company switch resets the surface before loading the new account.

