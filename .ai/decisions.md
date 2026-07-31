# Durable decisions

## Vendor-neutral project brain

The canonical context lives in .ai rather than a vendor-specific instruction file. Vendor adapters only point to .ai/README.md. This keeps AI handoffs and future human handoffs consistent across tools.

## Direct deployment workflow

The operating workflow does not use local servers. Tests and builds may run locally, but behavior is accepted against the directly deployed Vercel environment after merge.

## Questbase is the market-facing product name

The public product is branded Questbase.io. The repository, deployment project, storage keys, package metadata, and some internal compatibility labels may retain Quest HQ identifiers until a separately verified migration changes them. Public landing and authentication surfaces should use Questbase; do not rename internal identifiers casually because they participate in routes, caches, deployment history, and integrations.

## The public landing converts into real account flows

The approved Modular Quest landing direction is the public visual source of truth. Its product preview is an illustrative, read-only interaction, while every conversion action uses the existing authentication lanes: Business login maps to sign-in, Start workspace maps to company-workspace registration, Join by invite maps to invite access, and an authenticated session receives Open workspace. Questbase does not collect a fake early-access form when the actual account flows are available.

## Company accounts contain configurable operational workspaces

A company is the market customer, subscription, and outer security tenant. The desktop rail groups operational child workspaces under that company account. Workspace switching preserves the company route and carries the child workspace as a query parameter. Owners, admins, and developers inherit every active child workspace; regular workers require explicit workspace memberships and can receive a different role per workspace. Creating or archiving an operational workspace never creates or deletes the company account.

## Worker invites are non-elevated and workspace-explicit

An invite may assign a regular/custom role and one or more active operational workspaces, but it can never confer Owner, Admin, or Developer. Acceptance clears stale custom-role assignments and reinserts only a role proven non-elevated and company-scoped. Existing active members cannot use a second invite to mutate their access. Elevated promotion remains a separate, owner-guarded action after the teammate joins.

Invite delivery is durable state, not the source of access truth. The database invite remains valid when the email provider is unavailable, records `not_sent`, `sent`, or `failed`, and always exposes the manual link fallback. The mail endpoint accepts only an invite id and derives every message field server-side so it cannot become an arbitrary mail relay.

## Plugin entitlement and activation are separate

`company_plugins` records what a customer's plan is entitled to use. `workspace_plugins` records which entitled plugins are active and how they are configured in one operational workspace. This keeps the system customizable without hardcoding one pipeline or app layout for every market customer.

## Plugin activation does not imply one data boundary

Every plugin declares a customer-visible data scope: workspace-private, company-shared, or hybrid. The label describes the current storage and permission model; it does not pretend every enabled app is isolated to one workspace. Changing a declaration requires reviewing the plugin's tables, APIs, RLS, and navigation behavior together.

## Contact-to-quote conversion is atomic and request-idempotent

Live Contacts-to-Quotes conversion uses one workspace-authorized database transaction. A browser-generated request UUID makes network retries return the same account, site, quote, and activity. The explicit Create another Quote action generates a new UUID because multiple intentional quotes for one contact remain supported.

## Incomplete SMS infrastructure must stay invisible

The contact SMS surface is fail-closed. Provider keys and workspace-looking tables are insufficient: the readiness endpoint also requires a code-level workspace SMS backend contract. That contract remains closed until outbound selection, inbound routing, persistence, and schema are upgraded together, preventing a partial rollout from exposing the wrong company's or workspace's number.

## Tenant URLs are reconciled before rendering

A requested company and operational workspace must both belong to the signed-in user's allowed tenant set. Stale or inaccessible identifiers are replaced with the first allowed company and its stored/default allowed workspace; users with no company access remain in the no-access state. The URL, active state, navigation, and loaded records therefore resolve to the same tenant.

## Supabase is production data truth

Repository migrations explain intended history; the live Supabase catalog determines the current production shape. Database documentation is a metadata-only snapshot and must be refreshed after database changes.

## Tenant isolation is layered

Company and workspace columns, both membership layers, role/permission tables, field/resource controls, RLS policies, server endpoint checks, and plugin/subscription gates are all part of access control. Removing one layer requires explicit security review.

## Atomic and recoverable mutations

Where live routines provide atomic mutations or safe-delete/recycle-bin behavior, callers must use them rather than recreating multi-step client mutations.

## Task system boundary

Task rendering is flag-gated by `VITE_NATIVE_TASKS_MODULE` (`CONFIG.nativeTasksModule`, default off). The vendored TaskManagement app, embedded as a same-origin iframe, is the default surface; a host-native Tasks surface is the flag-on path. The flag is a deliberate strangler migration from embed to native, not an ad-hoc fork.

There is exactly one task model and one row shape: `normalizeTask` / `taskPayload` in src/main.js. Neither surface may define a second. Quest HQ links business containers to tasks through `jobs.id -> tasks.project_id`, plus `contact_id` and tenant-scoped `deal_id`.

Per ADR-0001 (docs/adr/0001-task-write-protocol-task-specific.md), the native path's writes consolidate into a task-specific, injectable write store, src/tasks/task-store.js. It reuses the single shape, scopes every update by `id` + `workspace_id`, and injects its data client so the interface is the test surface. It is built and unit-tested but not yet wired into main.js. We do not generalise it into a cross-entity `Records.save`, and we do not delete the vendored fork while the flag governs the default surface.

## Funnel next actions are tasks

Contacts, Quotes/Deals, and Jobs do not maintain a parallel next-step field. Their "What's next" value is the earliest scheduled open task. Contacts link through `tasks.contact_id`, jobs through `tasks.project_id`, and quotes through the tenant-safe composite relationship `tasks(company_id, deal_id)` to `deals(company_id, id)`. Legacy contact-linked quote tasks are used only when one active quote makes the match unambiguous.

## Production Guardian

A scheduled GitHub workflow verifies the deployed production revision, routes, and critical assets. It opens or recovers an incident issue automatically so production drift does not depend on a human noticing it.

## Job photos reuse the file system

Direct job-card photo capture writes image bytes to the existing private `quest-job-files` bucket and metadata to `job_files`. Photo category and caption use existing file metadata, keeping storage policy, signed previews, Drive visibility, and recycle behavior consistent.

## Underwriting cases are shared records

Calculator drafts are stored in `underwriting_cases` with one current case per company/contact. Browser-only persistence was rejected because underwriting decisions need to survive devices and be visible to other authorized team members.

## Local form drafts are recovery copies, not shared records

Contacts, Jobs, Quotes, and the Underwriter keep an expiring same-browser copy while a user types. The key is scoped by profile, company, operational workspace, form type, and record id so one tenant or worker cannot recover another context's input. Passwords, tokens, secrets, credentials, API keys, file controls, and explicitly ignored controls are never captured. A real save clears the copy only after the server/local write succeeds; validation and server failures preserve it. Signing out purges that profile's copies. The database remains the source of truth, and saved underwriting cases remain shared `underwriting_cases` records.

## Sidebar scopes organize navigation without bypassing access rules

The desktop command rail separates daily modules into My work and administrative/tooling modules into Company. Both scopes are derived from the existing module registry, installed-plugin checks, and permission gates; the mobile More sheet continues to expose the complete allowed module set.

## Job Center navigation uses stakeholder language at the presentation layer

The desktop rail groups daily work as Work, Pipeline, Production, Tools, Review, and Build, with user-facing aliases such as Home, Inbox, Estimator, Reports, People, and Meetings. Internal module IDs, registry labels, routes, plugin entitlements, and permission names remain unchanged so the information-architecture redesign does not fork authorization or data behavior. The rail and dense estimator screens use IBM Plex Sans for interface copy and IBM Plex Mono for labels and numeric data.

## Underwriter is a decision workbench, not a guidance dashboard

The Underwriter keeps its existing calculator, tenant-scoped saved cases, stage filtering, and queue data, but presents them as one Technical Ledger workbench: metrics and stage chips first, estimator inputs beside a decision summary, then a full-width estimate queue. The separate generic Guidance card was removed because it competed with the primary pricing decision and duplicated context already expressed by the calculator results.

## Android ships as an installable PWA, not a native wrapper

Installability comes from a manifest, icons, and a service worker, so the app installs to an Android home screen on phone and tablet and runs standalone. A Capacitor shell was rejected for now: the app makes thirteen relative `/api/...` calls that resolve against the page origin, and a native webview origin (`capacitor://localhost`) would break every one of them, while the CSP delivered as Vercel headers would have to move into a meta tag and Supabase auth redirects would need custom-scheme or App Links handling. The PWA keeps the real origin, so those calls and headers work unchanged. If a Play Store listing is wanted, the next step is a Trusted Web Activity wrapping this same PWA, which also keeps the origin — Capacitor is only worth its cost for genuine native needs such as camera or FCM push.

## The service worker is scoped to what it cannot get wrong

Navigations are network-first with the cached shell as an offline-only fallback, so a deploy is never shadowed by the cache. Only content-hashed `/assets/` files are cache-first, which is safe because a changed file is a changed URL. The API, and every cross-origin request, is not cached at all: storing authenticated responses in the Cache API would leave one user's data on the device for the next session, which is a privacy bug rather than a performance win.

## Recurring tasks roll forward on completion

A task can carry a recurrence rule (stored in tasks.recurrence as a compact
string like weekly:2 or monthly:3; null = one-off). When such a task is
completed via the normal gestures -- the row checkbox or a dashboard tile --
the app clones it forward to its next occurrence (data/recurrence.js does the
pure date math, anchoring each next date to the previous due date so the
weekday/day-of-month is preserved and month-ends clamp). Completing by setting
Status=done in the edit form intentionally does not spawn, to avoid double
navigation on that path; the checkbox is the primary gesture. The command bar
also understands cadence phrases ("every 6 months", "every friday") and
pre-fills the Repeat control. reminder_at, previously stored but unused, is now
carried forward with the series by the same day gap.

## Company automations are trigger → action rules on CRM objects

The Automations module (previously a planned stub) runs company-scoped rules
when a CRM record changes: "when a deal reaches Won, create a kickoff task".
The matching engine is pure (src/data/automations.js, 13 tests) and mirrors the
App Builder automation engine's key property -- a state trigger fires on the
TRANSITION into the target (after matches, before did not), so it runs once on
entry, never on every save. Rules live in a company-scoped `automations` table:
any member may read them (every client evaluates them locally when a record
mutates), but managing them is gated on settings.manage. Rules run from the
single choke points -- persistDeal, setContactStage, task completion -- so they
fire regardless of which UI drove the change. Automation-created tasks go
through the normal task path as the acting user, subject to their tasks.manage
permission: no privilege escalation, and the task silently isn't created if the
user cannot create tasks. This is distinct from App Builder automations, which
act on workspace-app items rather than CRM records.

## Contact duplicates are detected purely and merged by reassigning references

"Find duplicates" on the Contacts page groups likely-duplicate contacts with a
pure engine (src/data/dedupe.js, 9 tests): union-find over shared email, shared
phone (by last 10 digits), or normalized full name. Email/phone groups are
"strong"; a name-only group is flagged weak so the user reviews before merging.
Merging keeps a chosen survivor, fills only its BLANK fields from the others
(first non-empty wins), moves every foreign reference (deals.primary_contact_id,
tasks.contact_id, contact activities) onto the survivor, then recycles the
duplicates via recycleDeleteRecord in a new silent mode (no per-item toast,
modal-close, or redirect, so batch callers drive the UI). No migration -- it
reuses existing tables.

## Cross-workspace relationships are safe because the RLS-gated load is the guard

A Relationship field may target an app in another workspace -- i.e. another
company the user belongs to -- via config.targetCompany (default: the field's own
company, so existing links are unchanged). This needs no RPC and no migration:
the client already loads workspace_builder_state with no company filter, and that
table's SELECT policy is is_company_member AND subscription_allows_access AND
has_company_permission('workspaces.view'). So state.workspaceBuilderDocs only ever
holds companies the viewer may see. Resolution (wbRelTargetApp -> wbTargetApp ->
wbDoc(targetCompany)) reads only from those loaded docs, so a viewer who is not a
member of the linked company has no doc for it, resolves to null, and the field
shows "No access". The field can never render data the browser was not already
permitted to load -- the tenant boundary is enforced at load time, not by the
render code, so a missed UI guard degrades to a blank, never a leak. The config's
Workspace picker only appears when more than one company doc is loaded.

## Social sign-on is unified and provider-gated

The auth screen offers "Continue with Google/Apple" above the email form, on both
the register and sign-in forms (hidden on invite-token flows). One provider button
both registers a new user and signs in a returning one -- Supabase's
signInWithOAuth resolves which. No new session plumbing: initializeAuth() already
picks up the session on the redirect back. The redirect returns to "/", so the
home route now routes an authenticated Supabase session into the app (workspace or
the no-company screen) instead of rendering marketing -- without this an
OAuth-authenticated user was parked on the landing page and thought signup failed.
A brand-new OAuth user has an auth.users row but no company (email signup provisions
one via the client-side create_company_workspace RPC, which OAuth skips), so they
correctly land on renderNoCompanyAccess to create a workspace.

Which buttons render is controlled by VITE_OAUTH_PROVIDERS (default google,apple).
Google is live and configured in the Supabase dashboard. Apple is intentionally
NOT shown in production: VITE_OAUTH_PROVIDERS is set to "google" on Vercel prod
because Apple needs a paid Apple Developer account that is not yet enrolled, and an
unconfigured provider button yields a raw "provider is not enabled" error. When
Apple is enrolled and configured, set VITE_OAUTH_PROVIDERS back to "google,apple"
and redeploy. Provider credentials live only in the Supabase dashboard, never in
the repo.

## No sensitive project-brain content

The project brain records catalog metadata, architecture, decisions, and state—not credentials, user identities, row payloads, storage objects, or private operational content.


## RingCentral sync uses a rolling window, not sync tokens

RingCentral's `call-log-sync` API issues a `syncToken` for incremental pulls, which looks
like the obvious choice and was the original design. Two things ruled it out. The token is
rejected outright whenever more than 250 records change between runs ("max sync record
number limit is exceeded"), so a full-sync fallback has to be written and tested for a
path that only fires under load — exactly when it is least welcome. And the documented
sync endpoint is extension-scoped, meaning one request per person rather than one for the
company.

The job instead re-fetches a rolling three-day window of the company call log and upserts
on `(company_id, call_id)`, with a 90-day window the first time a company syncs. Re-seeing
already-stored calls costs nothing because the unique constraint turns a duplicate into an
update, and because the window is far longer than the 15-minute interval, a missed or
failed run needs no recovery logic at all — the next run covers it. `ringcentral_sync_state`
therefore holds no token, only `last_sync_at`, `backfilled_through`, `consecutive_failures`
and `last_error`.

## RingCentral users are matched to their own calls by email, with no mapping table

Non-admin members see only calls handled by the extension whose email matches their login
email, compared lowercased in the RLS policy. The alternative — a table linking RingCentral
extensions to company members, plus an admin screen to maintain it — buys accuracy for
mismatched addresses at the cost of a permanent upkeep burden every time someone joins or
leaves. For a single company whose RingCentral and Command Center accounts use the same
addresses, the mapping table is pure overhead.

The failure mode is visible rather than silent: a member whose addresses do not match sees
an explicit "we couldn't match you to a RingCentral extension" message, not an empty table
that reads as "you made no calls".

## Live phone status is polled, not subscribed, and does not use Live Reports

RingCentral supports push subscriptions for presence events, but they require a public
webhook, subscription renewal, and per-extension subscription management, and they fail
silently when a subscription lapses. One cached call to the account presence endpoint every
15 seconds returns every extension in a single request and cannot drift out of sync. At
this headcount the poll is not worth engineering around.

The board also does not depend on RingCentral's Live Reports add-on. Live Reports
aggregates agent states into a bar chart — "4 available" — and cannot answer "which
person is on a call right now", which is the entire point of the board. The Presence API
provides the underlying per-extension data directly.

## The Calls module reuses team.view rather than introducing calls.view

A new permission string would have to be seeded into `role_permissions` for every role
before anyone could open the module, and the only access distinction the feature needs —
admin versus member on the live board — is enforced server-side in the presence endpoint.
Reusing `team.view` required widening `app_private.permission_plugin_ids` (and its browser
mirror) so `team.view` resolves to both `reporting` and `calls`; without that, a workspace
with Calls installed but Reporting uninstalled would have been locked out of its own module.

## X-Frame-Options is SAMEORIGIN, not DENY, so the task module can be framed

The Tasks module is embedded as a same-origin `<iframe class="taskapp-frame"
src="/taskmanagement/app.html">` (src/main.js). A site-wide `X-Frame-Options: DENY`
header in vercel.json blocked that frame in the browser, so Tasks rendered as an empty
grey box in production while working in local dev (which serves none of the vercel.json
headers). SAMEORIGIN allows the app to frame its own pages while still blocking any
cross-origin site from framing Command Center, preserving the clickjacking guard.
The CSP is unaffected: it stays strict and Report-Only on purpose (its `frame-ancestors`
and `wasm` violations are being collected deliberately, per tests/security-headers.test.mjs),
so this fix is the enforced X-Frame-Options header only. Enforced by that same test.

## The service worker never mediates the /taskmanagement/ task frame

The Tasks iframe kept being refused with "X-Frame-Options: deny" for returning users even
after that header was relaxed to SAMEORIGIN (above). The live network response was correct;
the DENY copy came from the shell service worker. It cached `/` while the header was still
DENY, and because the cache name (`quest-shell-v1`) never changed, no deploy evicted it — so
the worker kept serving the stale DENY shell into the embedded frame. Incognito worked (no
active worker); clearing site data and disabling extensions did not (a worker already
controlling an open tab survives reload); only "Bypass for network" fixed it, isolating the
worker as the cause. Fix: `public/sw.js` now early-returns for any `/taskmanagement/` path
(same treatment as `/api/`) so the vendored task app always loads straight from the network,
and the cache VERSION was bumped to `v2` so the activate handler drops the poisoned `v1`
caches for everyone on their next visit. Guarded by tests/service-worker-taskframe.test.mjs.
Do not re-include /taskmanagement/ in the worker's caching paths.

## Task visibility is per person within a workspace

Task visibility is scoped per person, with "team = the job/workspace" and no reporting
hierarchy. A lead — anyone holding `tasks.manage` on the workspace, which company owners,
admins, and developers do automatically — sees and manages every task on that job. Crew,
holding only `tasks.view`, see and update just the tasks they are assigned to or created;
the creator always sees their own task. Enforced by narrowing the `tasks workspace read`
and `tasks workspace update` RLS policies in migration
`202607241200_per_person_task_visibility.sql`; the `is_workspace_member` and
`has_workspace_permission` gates and the INSERT/DELETE (`tasks.manage`) policies are
unchanged, so tenant isolation and the permission model are preserved. Designating a lead
is a role assignment in Command Center, not a code change.

## Appearance follows the user, not the browser

Theme mode, accent, background preset and card styling are stored on
`public.profiles.appearance_prefs` (jsonb) and applied when the signed-in profile loads, so
a user re-themes once rather than per device. localStorage is still written on every change
and remains the source of truth for *painting*: it is readable before auth resolves, so the
app opens in the right theme with no flash. Writes go through the SECURITY DEFINER
`update_own_appearance(jsonb)` RPC keyed on `auth.uid()`, mirroring `update_own_profile` —
the strict `profiles` WITH CHECK would otherwise block a user saving their own preference.
The RPC whitelists and coerces every field server-side, so the client never decides what may
be stored. Added in `202607291200_profile_appearance_sync.sql`.

An uploaded custom background image is deliberately excluded and stays browser-local. It is
a data URL up to ~2.2 MB and `public.profiles` is read with `select('*')` to build the team
directory, so a blob per row would make that query pathological. A `pg_column_size <= 2048`
check constraint stops the column being repurposed as a blob store. Syncing the image would
mean a Storage bucket plus its RLS, upload path and cleanup of replaced images.

## Terminal company lifecycle uses a backward-compatible projection

Archive, approval rejection, and Stripe cancellation must remain distinct without making
an already-open production client treat a new status as pending. The canonical distinction
therefore lives in nullable `company_subscriptions.terminal_status`
(`archived|rejected|canceled`), while the existing `status` column keeps the legacy value
`canceled` for every terminal row. Legacy list RPCs continue to expose `status`; lifecycle-v2
RPCs and current direct-row normalizers prefer `terminal_status`. The database trigger
defaults a legacy canceled write to terminal `canceled` and ensures every non-terminal
legacy status carries no terminal value.

Archive/Delete/Cancel platform actions write legacy `canceled` plus terminal `archived`.
Approval-console Reject, including the legacy client input `canceled`, writes terminal
`rejected`. Stripe cancellation writes `canceled` only when no manual archive/reject
decision already exists; a newer non-canceled Stripe event clears a prior Stripe-only
cancellation but cannot reopen a manually archived or rejected company. Only an explicit
platform reactivation clears a manual terminal outcome. A non-null terminal status blocks
database access even if an old grace date is still in the future.

Stripe events are also idempotent by event id. The exact same webhook event cannot be
applied again after a later platform action, while a different event at the same provider
timestamp can still advance the subscription.

All three effective terminal states are inactive in normal selectors and task filters;
platform lists expose separate Archived, Rejected, and Canceled filters. The company a user
is currently inside remains visible to prevent stranding. A narrowly targeted backfill
classifies only audit-proven platform archive/delete/cancel and rejected-review events that
are at least as recent as the last Stripe event; every other legacy canceled row becomes a
Stripe-style terminal cancellation.

## Company appearance is a default, not a mandate

Owners and Admins can save the current appearance as the company default via
`update_company_appearance(text, jsonb)` (SECURITY DEFINER, gated on
`app_private.is_company_admin` or `is_quest_admin`), stored on
`companies.appearance_prefs`. The client resolves in the order: the member's own saved
appearance if they have ever set one, otherwise the company default, otherwise the built-in
defaults. Applying an inherited look never writes it into the member's profile -- only the
explicit setTheme/setAccent/setAppearance paths push -- so a non-empty
`profiles.appearance_prefs` reliably means "this person chose for themselves" and an admin
change cannot stomp it.

Chosen over enforcing the company look on everyone: theme is frequently an accessibility
need (dark mode, contrast), and a member who has deliberately picked one should not have it
overwritten when an admin restyles the company. The resolved appearance is re-applied at the
three points its inputs change: sign-in (profile lands), the end of the bootstrap load
(companies land), and company switch (a different default may apply). Added in
`202607291400_company_appearance_default.sql`.

## EOD reports are a first-class module, and paid for by extracting the master panel

End-of-day numbers (calls, quotes, appointments, follow-ups, hot leads, blockers) are a
real table, `eod_reports`, rather than free text in chat, so the counts can be totalled.
Tenancy is the standard shape: company membership + subscription + an explicit permission.
`eod.view` lets someone read and file their own report; `eod.manage` is needed to edit or
review anyone else's. Owners and developers get both implicitly through
`has_company_permission`. Added in `202607301200_eod_reports.sql`.

The entry bundle was already at its ceiling before this feature (measured 356408 against a
356352 limit, passing only on the 64-byte environment tolerance), so the module could not
simply be added. Both new surfaces are therefore behind dynamic imports: the EOD page and
its persistence in `src/eod/eod-page.js`, and - as the bundle-budget notes had been asking
for - the admin-only platform master panel in `src/platform/master-panel.js`. Each takes
its shell helpers through a `ctx` object and imports nothing from `src/main.js`, so neither
can form a cycle or be pulled back into the entry chunk. Net effect: the ceiling was not
raised a fifth time, and non-admin sessions no longer download the master panel at all.

Dates in the EOD module are computed from local calendar parts, never `toISOString()`.
Converting to UTC put every week boundary and "today" a day early for anyone east of
Greenwich, which is where this team works.

## Tenancy isolation is proved live, guarded statically

The isolation claim needs two different things, and neither is sufficient alone.

The proof is a live rollback-only probe against production, run 2026-07-31 at revision
972dffa4. It impersonates a real identity, then counts rows the database is willing to
show it outside its own tenancy:

- Company dimension: a non-platform-admin member (of `rom` and `lumen`) saw ZERO rows
  belonging to any other company, across all 62 tables carrying `company_id`.
- Workspace dimension: no existing account belonged to only one workspace of a
  multi-workspace company, so the probe temporarily granted one company membership plus a
  single workspace membership (`new` / App Test), then read the 15 tables carrying
  `workspace_id`. It saw ZERO rows from the sibling `new` / Main workspace, which holds
  real contacts, quotes, jobs and tasks. The transaction was aborted; a follow-up query
  confirmed no membership rows survived.
- A platform admin DOES see other companies' rows in `company_plugins`, `task_types`,
  `task_labels` and `task_type_statuses`. That is intentional: each of those policies
  carries an explicit `OR app_private.is_quest_admin()`. It is not a leak, but it is why
  the probe must run as a non-admin — running it as an owner reports false positives.

The guard is `scripts/check-tenancy-matrix.mjs`, in `npm run check`. Every table carrying
`company_id` or `workspace_id` must have RLS enabled and at least one SELECT/ALL policy.
It reads `.ai/database/snapshot.json` rather than parsing migration SQL: policies are
replaced across migrations and formatting varies, so a text scan produced 26 false
failures against a schema that is actually correct.

Two limits, stated so nobody over-reads a green line. The snapshot records policy names
and commands but not their USING expressions, so the script proves a readable policy
EXISTS, not that it is correctly gated — that is what the live probe is for. And views
carry no RLS of their own; they inherit it only when defined `security_invoker`. The one
tenant-scoped view, `v_pricebook_material_best`, is `security_invoker=on`; any new view
over tenant data fails the check until a human confirms the same and allow-lists it.

Verified the guard fails on injected regressions (RLS switched off, a table left with only
write policies, and a new unvetted view) rather than only passing on the happy path.

## Browser errors are reported to the server log, not a database

Uncaught browser errors POST to `/api/client-error`, which writes one structured line to
stdout where Vercel's runtime logs already collect and retain it. Modelled on the existing
`csp-report.js`: best effort, rate limited, never errors, always answers 204.

Deliberately no table. A database sink would mean a new migration, new RLS surface, and a
write path reachable from an unauthenticated page — a lot of attack surface for telemetry
that is already queryable through the runtime logs. If an in-product dashboard is wanted
later, that is a separate decision with a separate threat model.

This exists because a startup crash reached production and was found by a user reporting a
blank page. Syntax, 788 tests and the bundle budget all passed, because none of them ran
the bundle in a browser. `scripts/check-bundle-boots.mjs` now stops that specific fault
before deploy; this catches the ones that only appear on a real device or a real tenant.

Only identifiers and structural context are accepted: message, stack, revision, route
name/section, and company/workspace/profile IDs. Never a name, email, or field value.
URLs are reduced to origin plus path before logging — in both the `url` field and inside
the stack — because invite and password-recovery links carry their secrets in the query
string and fragment, and logging those would put working credentials in the log.

The client half is written to never become the fault it reports: it runs only in
production builds, caps at five reports per page load, drops repeats of the same message
(a render loop repeats one fault), swallows all of its own failures, and prefers
`sendBeacon` so a report survives the page being torn down — which is exactly when a fatal
error fires.

## Renaming to Questbase without breaking deploy verification

The signed-in shell, PWA manifest, document titles, brand mark and legacy redirect stubs
now say Questbase. Storage keys were deliberately left alone: they use the lowercase
`quest-hq-` prefix, and renaming them would orphan every returning user's cached session,
active company, and local drafts for no visible gain.

The coupling that made this more than a find-and-replace is the production smoke check. It
identifies the app by the literal `Quest HQ Operations Command` in the shell title, and the
legacy stubs by `Opening Quest HQ`. Renaming those while the check pinned the old strings
would have failed deploy verification in the window between merge and deploy — precisely
when it matters. Both validators now accept either brand, so the check passes against the
old title before the rename ships and the new one after. The old markers can be dropped
once production has served the new shell.

Six foreign keys had no covering index (`calendar_events.created_by`,
`company_join_requests.profile_id`, `field_permissions.role_id`,
`pricebook_vendor_prices.material_id` and `.vendor_id`, `user_role_assignments.role_id`).
An unindexed foreign key turns any DELETE of the parent row into a full scan of the child
table, so deleting a role or a profile is the action that would start timing out first.
Added in `202607311200_foreign_key_indexes.sql`. Note the advisor's headline count of 32
covers several categories; only these six are genuinely uncovered foreign keys.

### Follow-up: `if not exists` on an index name is not a guarantee

Applying the foreign-key indexes exposed a trap worth recording. `calendar_events(created_by)`
stayed uncovered even after the migration reported success, because an index already existed
under the intended NAME on `(company_id, created_by)`. `create index if not exists` matches on
the name, so it silently did nothing, and a composite index only covers a foreign key when the
FK columns are a leading prefix — `(company_id, created_by)` does not cover `created_by` alone.

Fixed with a distinct name in `202607311300_calendar_events_created_by_fk_index.sql`. Re-running
the uncovered-FK query afterwards now returns none, which is the check that caught it: a
migration reporting success is not evidence that the index you wanted exists.

The apply also hit a 502 mid-run and left one of six indexes created. Because every statement is
`if not exists`, re-running was safe and completed the rest — worth keeping that property on any
migration that might be retried through a flaky gateway.

## Concurrent App Builder edits merge instead of overwriting

A company's whole App Builder document is one JSONB row, and saving it was a blind
`upsert`. Two people editing at once meant the second save silently erased the first —
no error, no warning, and the loser only discovered it when their app was missing.

The write is now conditional on the revision the edit was based on. `updated_at` is
already maintained by a `BEFORE UPDATE` trigger, so the row carries a natural version
token and no migration was needed: the client remembers the `updated_at` it last read
and saves with `.eq('updated_at', known)`. A save built on a stale read matches zero
rows instead of overwriting.

A rejected save is not an error the user should have to resolve by hand. It triggers a
three-way merge (`src/workspace/builder-merge.js`) against the last-synced revision as
the common ancestor, then retries against the new revision. This is only possible
because every entity in the document carries a stable id — workspaces, apps, fields,
items, automations, feed posts, poll options — so "the same thing" can be identified
across two divergent copies. Edits to different apps, records, or columns therefore
combine with no user involvement at all, which is the overwhelmingly common case.

Two rules are deliberate and worth stating, because both trade a little tidiness for
not destroying work:

- When both sides changed the *same* field, the local value wins and the collision is
  reported by name ("Ops / Roof Inspections"). The local user is present and can see
  the result; the remote user has already moved on.
- When one side deleted an entry the other had edited, the entry comes back and is
  reported. A stale row costs a cleanup; a dropped one costs work the user cannot
  recover.

Without a common ancestor the merge degrades to a union that deletes nothing, so a
client that has never synced cannot cause a deletion.

Restoring a backup stays an unconditional overwrite — replacing what is there is the
whole point — but it now resets the version and ancestor. Leaving a pre-restore
ancestor behind would make the next ordinary save merge against it and resurrect
exactly what the restore removed.

Verified against production (rolled back): two clients load the same revision; A's
guarded write is accepted, B's stale write matches zero rows, and B's retry against
A's revision is accepted. Sixteen tests cover the merge rules directly.

### The bundle budget had no headroom left, and the sprite paid for it

Worth recording because it nearly forced a bad decision. The entry chunk measured
356363 gzip bytes against a 356352 ceiling *before* this change — already 11 bytes over,
passing only on the 64-byte environment tolerance. Any feature at all would have failed
the check, and the note in `bundle-budget-lib.mjs` says a fifth raise is blocked.

Extraction paid for it instead. `renderSvgSprite()` was 5.7 KB of source that took no
arguments, read no state, and returned a constant — it sat in the entry chunk purely to
emit static markup, and was re-serialised into `innerHTML` on every render. It now lives
in `index.html`, outside `#app` so re-rendering the shell cannot wipe it; `<use href="#q-…">`
resolves against the whole document either way. All 29 symbols moved intact and every id
the bundle requests still resolves. Icons are now painted by the HTML parser before any
JavaScript runs.

The durable fix remains extracting the App Builder editing UI (`renderWorkspaceBuilderModal`,
`wbMountModal`, `wbFieldConfigUI`, `wbRenderFieldInput` — roughly 63 KB of source that is
only needed once someone opens the builder editor). That is the next real headroom.

## Modal focus follows the modal

The audit found the app in better shape than expected: a real focus trap, Escape
handling, `role="dialog"` on the generic shell, and 112 of 117 icon-only buttons already
named. Two things were genuinely missing, and both are the kind of defect that is
invisible to anyone using a mouse.

Focus was never moved into a modal when it opened, and never restored when it closed.
Because the app re-renders wholesale, the element that opened the dialog is destroyed by
the time it appears — so focus fell to `<body>`. A screen reader never announced the
dialog, and every close dropped the keyboard user back at the top of the page. Both are
now handled in one place: `syncModalFocus`, queued at the top of `render()` so it runs
after whichever early return fires.

The trigger is recorded as a *selector* built from its data attributes, not as a node
reference — the node will not survive the re-render. It is armed only when a click
actually opened a modal, and cleared once used.

Ordering matters and is deliberate: the sync is queued first, so a screen that wants the
cursor in a particular input queues its own `focus()` later and still wins.

Also fixed: the builder modal was not announced as a dialog at all, the generic dialog
had no accessible name (announced as bare "dialog"), and five icon-only controls had no
name. The icon-picker swatches were the worst of them — every option in the grid read
identically as "button", so the picker was unusable without sight. They now carry the
icon name, `aria-pressed`, and an explicit `type="button"`.

The focus trap and the focus mover now share one `FOCUSABLE_SELECTOR` rather than two
copies that had to be kept in step by hand.

Not changed, having checked: 64 buttons omit `type=`, but none sits inside a `<form>`, so
the implicit `submit` does nothing. Three `<img>` without `alt` are inside code comments.
Both were false positives from the first pass of the audit, recorded here so the next
person does not re-investigate them.

## RLS: hoisted auth calls, and three checks that were doing nothing

The performance advisor's 17 `auth_rls_initplan` findings were the stated task, and they
are a real if unglamorous win: every one of those policies called `auth.uid()` (or
`auth.jwt()`) bare, so Postgres re-evaluated it once per row instead of once per query.
Wrapping the call in a scalar subquery — `(select auth.uid())` — lets the planner hoist it
into an InitPlan evaluated once. Identical value, far fewer calls. It matters most on
`messages` and `message_reads`, which are read on every poll of the inbox.

Reading the policies to rewrite them turned up something more serious. Three of them
compared a column to itself:

    (mc.company_id = mc.company_id)          -- messages insert senders
    (mc.company_id = mc.company_id)          -- message access insert creator or manager
    (m.conversation_id = m.conversation_id)  -- message attachments insert allowed
    (m.company_id = m.company_id)            -- message attachments insert allowed

Always true. The intent was clearly to tie the new row to its parent — a message's
company must match its conversation's, an attachment's conversation and company must
match the message it hangs off. As written the clause did nothing, so a client could
insert a message carrying one company's id into another company's conversation. Nothing
prevented it except the client being well-behaved.

Confirmed safe to tighten before doing it: zero existing rows violate the intended
constraint on any of the four checks. So this closes a hole rather than invalidating data
anyone depends on.

Verified live by acting as a real member (rolled back): a normal send is still accepted,
a message tagged with a foreign company id is now rejected, and a message sent as
somebody else is rejected. The first of those is the one that mattered — a tightened
policy that also breaks ordinary sending would be a worse outcome than the hole.

Both rewrites were checked mechanically rather than by eye: normalising the new
definitions back to their pre-migration form (stripping the InitPlan wrapper) leaves no
differences beyond the four intended ones, and no policy anywhere in `public` or
`app_private` still contains an unhoisted `auth.uid()`/`auth.jwt()`.

Advisor after: 165 findings down to 148. `auth_rls_initplan` 17 -> 0,
`unindexed_foreign_keys` 1 -> 0 (the last one, `app_private.platform_admins.created_by`).

### Not doing: the 15 `multiple_permissive_policies` findings

Left deliberately. Removing them means merging separate policies into single compound
ones, and these policies are the tenancy boundary — the thing this project has spent the
most effort proving correct. One readable policy per intent is what makes that boundary
auditable at a glance; a merged disjunction trades a minor planner optimisation for
exactly the kind of expression where a mistake hides. Not worth it at this data volume.

## Bootstrap fetches 37 tables instead of 51

The checklist said "~30 tables"; it was actually 51, plus one RPC, all before first paint.

Measurement first, because the obvious assumption was wrong. The payload is not the
problem: the largest table in production is `activities` at 338 rows, and jobs/tasks/
contacts are in single or low double digits. The seven fastest-growing tables already
carried limits. So the cost today is round trips and per-query RLS evaluation, not bytes
— and the durable benefit is that these won't degrade as the business grows.

Five domains now load on demand: finance, forms, pricebook, portals, recycle. Fourteen
tables, 51 -> 37.

Almost no new machinery was needed. `loadRealtimeDomain` already knew how to fetch each
domain — it was written for realtime refresh — so deferring the bootstrap fetch just
means calling that same tested loader the first time something asks.

**The trigger is the accessor, not the route.** This matters more than it looks. Route-
based triggering is exactly how this kind of change produces blank screens: some widget
on an unrelated page reads the data, nobody remembers to list that route, and it renders
empty with no error to point at. Every read goes through a small set of accessors, so
hooking those cannot miss a caller. A test enumerates every `state.<deferred field>` read
in the file and fails if one is reached from a function that neither triggers the load nor
is a write path.

That test earned its keep immediately — it found six readers the first pass had missed
(`responseById`, `clientPortalDocumentById`, the two pricebook vendor renderers, and both
client-portal annotation accessors), each of which would have rendered an empty section.

Two things checked rather than assumed:

- `persistAll` writes every dataset to local storage and would happily cache an empty
  array over a good one. It is safe because it returns early on `auth === 'supabase'`,
  and deferral only applies to live Supabase sessions.
- The recycle-bin writers can fire from anywhere, since deleting any record appends to
  the bin. Safe unhooked: the local upsert prepends to whatever list is in memory, which
  is correct against an empty one, and a later load replaces the array from the server.
  Hooking them would refetch the whole bin on every delete — the opposite of the point.

A failed deferred load clears its marker so it retries, rather than leaving a section
permanently empty.

### The bug this turned up

The realtime `workspace` domain reload had its own copy of the builder-doc apply logic,
and that copy skipped the concurrency bookkeeping added earlier the same day: it replaced
`workspaceBuilderDocs` without the hold-local guard and without refreshing
`wbDocVersions` / `wbDocBase`. So after any realtime workspace refresh, the version token
described a revision that was no longer current — the next save would fail its guard and
then merge against a stale ancestor, which is precisely the failure the guard exists to
prevent.

Two copies of the logic is what caused it. There is one now,
`applyWorkspaceBuilderRows`, called from both paths, with a test asserting exactly one
definition and two call sites.

### Not deferred, and why

`messages`, `notifications` and `files` stay in the bootstrap: the topbar shows unread
counts on first paint, so deferring them would trade a round trip for a visibly wrong
badge. `workspace_builder_state` stays because workspace pages render app tiles
immediately. `audit_events`, `company_invites` and `company_join_requests` are settings-
only and are the obvious next candidates, but they have no existing domain loader, so
deferring them means writing one — worth doing when someone next touches that area.

## Two unintended browser grants, found by auditing rather than counting

The security advisor reports 48 findings in the SECURITY DEFINER family. Counting them
is useless; classifying them is not. Every one of them is a function the browser roles
can execute, but a **trigger function** and an **RPC** are different things, and only one
of them belongs on `/rest/v1/rpc`.

Of the six SECURITY DEFINER trigger functions in `public`, five already carried no
browser grants. The sixth, `touch_eod_report_updated_at()`, was executable by PUBLIC,
anon and authenticated — introduced by my own `202607301200_eod_reports`, which created
it without revoking PostgreSQL's default grant of EXECUTE to PUBLIC. PostgREST turns that
into a callable endpoint reachable without signing in.

The other 47 are authenticated-executable RPCs — `accept_company_invite`,
`save_company_role`, the recycle and workspace functions — which ARE the application's
API and each perform their own permission checks. Reviewed and left alone, not silenced.

Revoking EXECUTE does not disturb the trigger: triggers fire in the context of the
statement's table, not the caller's function-execute privilege. Proved rather than
assumed, and the first attempt at proving it was wrong in an instructive way. `now()` is
fixed for a transaction, so comparing `updated_at` before and after an update in one
transaction shows no movement and looks like a regression. The test that actually works
is to write an obviously wrong `updated_at` and observe the trigger replace it: the
client sent 2000-01-01, the row stored the current timestamp.

`checkin_log` and `reminder_log` also had `anon`/`authenticated` table grants while
having RLS enabled and zero policies. Not a hole — RLS with no policy denies everything —
but the grants described an access path that did not exist and would have become real the
moment anyone added a policy. Revoked so the intent reads correctly: server-only tables.

A test now derives every `returns trigger` function from the migration history and
requires its browser EXECUTE to be revoked, so the next one is caught in CI rather than
by an advisor weeks later.

Incidentally confirmed while probing: `eod_reports` has zero rows. The app built for the
crew has never been used by them, which is consistent with none of them having a login.

## Three more domains deferred, and one the guard refused

`audit_events`, `underwriting_cases` and `proposal_documents` now load on demand,
taking first paint from 37 tables to 34.

The accessor-hook test paid for itself twice more:

- It rejected `proposals` as cleanly section-scoped, because `contactJobTypeOptions`
  reads it — that is a CRM surface, not the proposals section, so deferring blindly would
  have silently dropped job-type options for everyone. Hooking that reader keeps it
  correct, and sessions that never open contacts still skip the fetch.
- The public proposal flow (`ensureProposalPublicOpen`, `submitPublicProposalDecision`)
  also reads it. Harmless — those run anonymously, where `ensureDomainLoaded`
  short-circuits — but it had to be hooked for the signed-in case.

`company_invites` and `company_join_requests` were candidates and were deliberately
rejected: they feed the dashboard's pending-invite widget, which renders on first paint.
Deferring them would show a confident "0 pending" until somebody opened Settings, and a
wrong number is worse than one extra query.
