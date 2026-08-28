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

## Guided setup produces an editable plan, not a hardcoded company type

Company registration creates only the account and its safe default Main workspace, then opens that workspace's required Setup modal. Guide me, ready-made blueprints, and Start from scratch all produce the same versioned plan shape, which the owner can review before applying. The server owns app/role allowlists and role permission templates, caps the plan size, rejects CRM conflicts, preserves populated pipelines, and maps generated workspace/role keys to stable ids so a retry cannot duplicate them. Questionnaire reset clears only answers and the draft; it intentionally retains the last applied plan and every company or business record. This keeps onboarding easy without making one roofing/CRM layout mandatory for every market customer.

## Worker invites are non-elevated and workspace-explicit

An invite may assign a regular/custom role and one or more active operational workspaces, but it can never confer Owner, Admin, or Developer. Acceptance clears stale custom-role assignments and reinserts only a role proven non-elevated and company-scoped. Existing active members cannot use a second invite to mutate their access. Elevated promotion remains a separate, owner-guarded action after the teammate joins.

Invite delivery is durable state, not the source of access truth. The database invite remains valid when the email provider is unavailable, records `not_sent`, `sent`, or `failed`, and always exposes the manual link fallback. The mail endpoint accepts only an invite id and derives every message field server-side so it cannot become an arbitrary mail relay.

## Plugin entitlement and activation are separate

`company_plugins` records what a customer's plan is entitled to use. `workspace_plugins` records which entitled plugins are active and how they are configured in one operational workspace. This keeps the system customizable without hardcoding one pipeline or app layout for every market customer.

Both layers must say yes: `workspacePluginStatus` in src/workspaces/model.js returns
`available` when the company is not entitled, and again when the workspace has no row. A
plugin present in only one of the two tables is not installed.

## The Workspace App Builder is baseline, not a preset choice

`app_private.baseline_plugin_ids()` names the plugins every new company and every new
workspace gets regardless of preset; `plugin_ids_for_preset` unions it into all four
presets, including `blank`. Blank means no *business* modules, not no workspace.

The reason is that `workspaces` is not in `CORE_MODULE_IDS`, so reaching the workspace app
requires the `workspace_builder` plugin, and creating a workspace leads there. Three
independent places failed to provide it: `'blank'` returned an empty array and is what the
client passes for both creation RPCs; a new account's `Main` workspace is built by the
`companies_ensure_default_workspace` trigger, which seeded pipeline stages and no plugins;
and the client never re-read `workspace_plugins` after the create RPC, so rows that existed
in the database still read as uninstalled until a reload.

`create_operational_workspace` installs the intersection of the preset list with the
company's entitlements, so it now guarantees the company-level baseline row first --
otherwise a company created before this installs nothing however the preset is fixed. Every
baseline insert is `on conflict do nothing`, so a plugin somebody deliberately disabled
stays disabled, and the default-workspace insert sits only on the branch that creates a
workspace, never on the repair paths that adopt an existing one.

## A record is edited in place, not in a form over it

The record page has no Edit button. Clicking a value opens that field's real input in the
cell; moving focus away commits, Escape reverts, Enter commits except where a newline is
part of the value. The input is the SAME markup the modal used -- `wbRenderFieldInput` out,
`wbReadFieldInput` back, which finds its element by `[data-f]` anywhere in the document --
so every field type is editable inline with no per-type code, and a type added later works
without being taught to. Fields in `WB_AUTO_FIELD_TYPES` are not offered: there is no input
behind them and the reader returns `undefined`, so a click would promise an edit that could
never save.

Committing on focusout is deferred one tick and then asks where focus actually landed,
because "focus left" and "focus moved into my own dropdown" are indistinguishable at event
time. A file picker takes focus out of the document entirely, so an open file zone suppresses
the commit -- leaving the editor open is recoverable, discarding a pending upload is not.

A single-field save runs the same tail as the modal did (stamp, log, notify, automations
with the previous values, persist). An inline edit that skipped automations would be a
second, quieter way to edit a record, and the two would drift. Opening a value and leaving
it untouched compares equal and does nothing at all -- no stamp, no activity, no automation.

## Activity says who, recorded at the choke point

`wbLogActivity` stamps `actorId` and `actor` from the session. It is the one place every
entry passes through, so no writer can forget. The id is what renders -- resolved to a
current profile at read time, so a rename shows on every past entry -- and the stored name
is the fallback for somebody who has since left. Entries written before this carry neither
and render exactly as they did; inventing an actor for them would be worse than the gap.

## A company's own members are readable by its members

`company_memberships` SELECT is `own row OR is_company_admin OR is_company_member`. Before
the third clause a worker could read exactly one row -- their own -- and every feature built
on the client-side directory (`companyAccessUsers` -> `wbMembers`) failed at once on a worker
account: @mention offered only yourself, the Members tile listed one person, and comment
authors fell back to the `{ name: 'Unknown' }` stand-in `wbMemberById` returns.

This is not a widening of personal data. Membership rows carry company, profile, role and
status; `profiles` is a separate table whose policy already lets company peers read each
other via `shares_active_company`. The two tables disagreed -- you could read a colleague's
profile but not learn they were a colleague -- and this closes that gap. Writes are
untouched and remain admin-only.

## Workspace membership is answered from one rule, in both directions

`allowedWorkspaces` answers "which workspaces may this person enter"; `workspaceMembers`
answers "which people may enter this workspace". Both live in src/workspaces/model.js and
both go through `roleCanEnterEveryWorkspace`, so they cannot disagree about an owner — who
has no membership row for most workspaces and belongs to all of them. A second copy of that
role list anywhere else is a bug waiting to happen.

The Members dashboard tile is the first consumer. It is workspace-scoped rather than
company-scoped (the Users page is the company view), excludes both disabled accounts and
revoked memberships, and labels inherited access so an owner with no explicit assignment
does not read as a defect. "Online" is the realtime presence channel — the same source as
the messaging list and every avatar ring — which is ephemeral by design, so a row is never
stale: a closed socket drops the person on the next paint.

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

The desktop command rail separates daily modules into My work and company-wide/configuration modules into Company. Company now exposes People & Access, Setup, and Admin instead of one catch-all Settings destination. Setup owns company profile/brand, workspaces, modules, pipelines, handoffs, integrations, and launch checks; People & Access owns members, roles, access, and invites; Admin owns billing, recovery, audit history, and diagnostics. These are presentation and route-composition boundaries over the existing stores, RPCs, permission checks, and RLS—not new copies of the data. Old Settings URLs redirect to the equivalent new page. The mobile More sheet continues to expose the complete allowed module set.

## Job Center navigation uses stakeholder language at the presentation layer

The desktop rail groups daily work as Work, Pipeline, Production, Tools, Review, and Build, with user-facing aliases such as Home, Inbox, Estimator, Reports, People & Access, Workspace Apps, and Meetings. Compatibility module IDs and permission names remain unchanged where existing links or authorization depend on them; new Setup and Admin sections use the existing `settings.view` permission. The rail and dense estimator screens use IBM Plex Sans for interface copy and IBM Plex Mono for labels and numeric data.

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

A relationship value renders as a link to the record it names (`wbRelHref` ->
`wb-rel-link`, `data-router`). The record page always renders whichever
operational workspace is active, so the link carries `workspace=<ops id>`, which
`reconcileCompany` switches to on any route change -- the same mechanism
`setActiveWorkspace` uses, so this stays an ordinary anchor. `wbAppIndex` skips
linked copies, so the target resolves to the workspace that owns the records.
Four cases render as plain text rather than a dead link: no item id, a deleted
target app, a builder-only workspace (keyed by bare uid, not `ws-<id>`, so no
route reaches it), and an operational workspace the viewer may not open.

The single-select relationship input is a type-ahead over a retained `<select>`
(`wb-rel-pick`). The select is visually hidden, never removed: every read, write,
automation and submit already goes through it, and committing a choice sets
`select.value` and dispatches a bubbling `change` so dependent calculations and
automations fire as they did for the plain dropdown. Multi-select deliberately
keeps the plain list.

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
The CSP now has two layers: a compatible policy is enforced and the tighter target remains
Report-Only. The enforced layer allows same-origin Tasks framing and the eval/wasm behavior
the current PDF and ZIP libraries require; the monitor shows what must change before those
exceptions can be removed. `tests/security-headers.test.mjs` holds both policies in place.

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

## The bundle budget needs the builder modal extracted, and that is its own job

Entry chunk headroom is **179 bytes**. The sprite move bought room in the morning and
a day of features consumed it. The next change of any size fails the budget again, so
this is now the blocking constraint on the codebase, not a background concern.

I measured three candidate extractions rather than guessing, and the result is worth
recording so the next person does not repeat it:

**1. The four modal functions alone — no.** `renderWorkspaceBuilderModal`, `wbMountModal`,
`wbFieldConfigUI` and `wbRenderFieldInput` are 64.9 KB of genuinely lazy-able code (they
only run once someone opens the builder editor). But they call out to 66 distinct
main.js functions. Threading 66 dependencies through a context object is not an
extraction, it is a new coupling surface.

**2. The pure helper closure — no, and this is the non-obvious one.** There are exactly 50
`wb*` declarations that touch no state, no DOM, and call nothing outside their own set:
20.9 KB, and on paper an ideal tested module. They cannot help. They are called from
eager paths too — `wbUid` from 41 sites, `wbLogActivity` from 16 — so the module has to
be a *static* import and stays in the entry chunk. Moving pure code out of main.js is
good hygiene; it is not the same thing as buying gzip headroom, and only lazy-loading is.

**3. The whole subsystem — yes, but not in one sweep.** 220 `wb*` declarations, 267 KB
raw, interleaved with unrelated code across 4,477 lines. The shape that works is three
modules, not two:

    src/workspace/builder-core.js    shared helpers, statically imported (stays eager)
    src/workspace/builder-modal.js   the editing UI, dynamically imported (lazy)
    src/main.js                      static import of core, dynamic import of modal

The third module is what avoids the circular import main -> modal -> main, which is the
failure mode already recorded against a big-bang split. The work is triaging 220
declarations into core vs modal, and it needs someone able to exercise the builder UI
afterwards — an automated suite cannot tell you the field-config panel silently stopped
rendering.

Deliberately not attempted at the end of a long session. The App Builder is in daily use
and a blind 267 KB refactor is exactly how it breaks.

Until it happens, the budget has no slack: any feature that adds to the entry chunk has
to be paired with a real extraction, or the ceiling has to move as a conscious decision
with the reason recorded.

### Follow-up: the Reports tab paid for the cross-company install

The rule above was applied rather than waived. Cross-company installs put the entry chunk
234 bytes over, and the choice was a sixth budget raise or a real extraction. The charts
came out instead:

    src/workspace/reports-view.js    donut, bars, KPIs, sparkline — dynamically imported

It qualifies on the test that ruled option 2 out above: nothing on an eager path calls it.
The Reports tab needs a click, the print view needs a button, and both call sites live in
one place. Its only outside dependency is *who a person is*, passed in as `memberById`, so
there is no context object of 66 functions. Result: **1,122 bytes of headroom** and a
2 KB chunk fetched on first use.

Two things worth knowing before touching it:

- **Printing takes a synchronous path when the module is already loaded.** `window.open`
  has to run in the same task as the click or browsers treat the window as an unsolicited
  pop-up — and an `await` that resolves instantly still yields the task. The Print button
  only exists on a Reports tab that has already fetched the module, so the fast path is
  the normal one; the async branch is the retry after a failed fetch.
- **Extracting it surfaced a display bug.** One `|| 1` was serving as both the divide-by-
  zero guard and the printed total, so an empty donut claimed a total of 1. Unreachable
  from the tab today (the empty state returns earlier), but wrong in a now-public
  function. The guard and the figure are separate values.

This is the pattern for the next one: find a subsystem behind a click with a narrow
dependency edge, pass its dependencies as data, and take the tests that become possible
once the code is callable. The builder modal is still the big prize and still its own job.

### Follow-up: four chunks out, and the dependency count was the thing to measure

The board, stage manager and side-menu presets were each paired with an extraction rather
than a budget raise. Cumulatively **10.4 KB gzip** now loads on demand:

    workspace/reports-view.js      2.0 KB   charts, behind the Reports tab
    workspace/board-view.js        1.2 KB   kanban columns, behind the view switch
    workspace/field-config-ui.js   5.4 KB   field editor panel + record form inputs
    ui/appearance-panel.js         1.8 KB   the Appearance settings panel

Entry headroom: **1,074 bytes**.

What made these work where the earlier attempt failed is worth stating plainly, because
the recorded reason above ("66 dependencies") reads as a property of the builder modal
when it is really the metric to check first. Measured before starting: `wbFieldConfigUI`
needed 11 helpers and 4 constants; `wbRenderFieldInput` 11; the appearance panel 6 and 4.
At that size a single `ctx` object is a fine seam. **Count the edges before deciding an
extraction is impossible.**

Two techniques carried all four:

- **Move, do not rewrite.** Each body was relocated verbatim and its helpers destructured
  from `ctx` under their original names, so the diff is a cut and a paste plus a header.
  Nothing inside the moved code was retyped, which is where a 12 KB move would go wrong.
- **A factory when the body recurses.** `wbRenderFieldInput` calls itself for nested
  fields. Exporting `createFieldInput(ctx)` that closes over the context lets those inner
  calls keep their original four-argument shape.

And one rule that decides *how* a chunk is awaited:

- **A dialog awaits its chunk before opening; a page renders a loader.** `openWbFieldModal`
  and `openWbItemModal` are `async` and load before setting modal state, so a form never
  appears as an empty shell. Tabs and panels return `questLoader(...)` and re-render.
- **Anything that calls `window.open` must not await.** Print takes a synchronous path
  when the module is already in hand — an `await` that resolves instantly still yields the
  task, which is enough for a browser to treat the window as an unsolicited pop-up.

## Secondary text was below AA contrast in four of seven themes

Measured, not eyeballed. `--muted` carries secondary text everywhere — metadata, hints,
table sub-labels — and it is the colour most likely to be tuned for looks and least likely
to be re-checked afterwards. Four of the seven theme blocks had drifted just under WCAG AA:

| Theme | Before | After |
| --- | --- | --- |
| base palette (amber) | 4.42:1 | 4.55:1 |
| Option 7 white SaaS | 4.22:1 | 4.60:1 |
| Option 3 white control room | 4.45:1 | 4.59:1 |
| Option 4 professional white | 4.43:1 | 4.56:1 |

Both dark themes were already comfortable at 7.7:1 and 7.3:1 and were not touched.

The fix walks each colour one percent darker at a time and stops at the first value that
clears 4.55:1 — deliberately the *smallest* change that works, so the design shifts as
little as possible. Every channel moved by between two and six points and the hue is
preserved; the greys still read as the same greys.

Two things worth noting about doing this properly:

- A first pass took the first definition of each variable and reported a single failure.
  That was wrong: the stylesheet layers several `:root` blocks (design directions added
  over time), so contrast has to be computed per theme block against *that block's* own
  `--bg`. Scoping it turned one finding into four.
- Contrast has to be checked against the surface the text actually sits on, and
  translucent colours flattened over their backdrop first, or the number is fiction.

`tests/colour-contrast.test.mjs` recomputes the ratio for every theme from the stylesheet
and fails below 4.5:1, so the next palette tweak cannot quietly undo this.

Still open on accessibility: the viewport matrix across phone/tablet/laptop widths, which
needs real devices or a browser harness rather than static analysis, and contrast for
non-text UI (borders, focus rings, chart colours) against the 3:1 requirement.

## Linked apps were real but second-class, which read as "the install did nothing"

The "install this app into another workspace, sharing fields *and* records" feature was
already built: a linked entry is a pointer (`{ id, linked: true, linkedFromWs }`), never a
copy, so both workspaces read the same app object and edits from either side are the same
edit. That part works and is now covered by tests that mutate through the link and assert
the source changed, in both directions.

What did not work was everything around it. Four places looked at the raw
`workspace.apps` entry and filtered on `!a.linked`, which silently treats a linked app as
if it does not exist:

- **The default sidebar.** `wbSidebarTiles` picked the first non-linked app for the
  default app tile. A workspace whose *only* app was installed from elsewhere therefore
  got no app tile at all — it showed "Apps" and nothing else. This is the one that makes
  the feature look broken, because it is exactly what you see after installing into a
  fresh second workspace.
- **Tile metadata.** A tile pointing at a linked app resolved to nothing and fell back to
  a generic empty "App" with a placeholder icon.
- **The tile configurator.** Linked apps were excluded from the picker, so one could not
  be placed on a tile at all.

The mistake is the same in each: an app id is *identical* for a linked entry and its
source, so `!linked` does not distinguish "not this app" from "reach it through the
link" — the entry has to be resolved, which `wbResolveAppEntry` already did. All three now
resolve through a shared `wbTileTargetApp`.

Two sites that filter on `!a.linked` are correct and were left alone: `dashboardFindApp`
and the dashboard widget registry both iterate every workspace and would otherwise list
the same app once per workspace it is installed in.

The link was scoped to a single company, because the builder document is one JSONB row per
company and a cross-company link had nothing to resolve against. That is no longer true —
see the next entry.

## Installing an app into another company you own

Requested directly: pick a company, then a workspace inside it, and install there. The
same-company case above is unchanged; this widens where the pointer may point.

The pointer gains one optional field:

    { id, linked: true, linkedFromWs, linkedFromCompany?, installedAt }

**Absent means "this document".** Every link created before this feature existed has no
`linkedFromCompany`, so absent has to keep resolving against the current company or all of
them break on deploy. `resolveAppEntry` only consults the cross-company path when the field
is present, and the install handler only writes it when the two companies actually differ —
a same-company install still produces a byte-identical entry.

Three consequences worth holding on to:

- **Resolution needs a way to reach another document,** so `resolveAppEntry`,
  `workspaceApps` and `tileTargetApp` take a `getDoc(companyId)` argument. main.js passes
  `wbDoc` — which is why `wbTileTargetApp` appears to pass the document twice. It does not:
  once as *this* company's document, once as the getter for someone else's.
- **Saving had to change, and this is where data loss would have been.** A linked app's
  data lives in the document of the company that *owns* it, so editing through the link
  mutates the owner's row. Saving only the current company would leave the edit on screen
  until the next reload discarded it, with no error anywhere. `companiesToSave` returns the
  current company plus every distinct company it links out to, and `wbSave` writes all of
  them.
- **Losing access is a normal outcome, not an error.** If the reader can no longer see the
  other company, `getDoc` returns null, the link stops resolving, and the app disappears
  from the list. Nothing throws. The same path covers a deleted source workspace.

Permission is checked twice: only companies passing `canManageOperationalWorkspaces` are
offered in the picker, and the destination is re-checked in the handler, because the
select was rendered from state that may since have gone stale. The picker states plainly
that records are shared and that deleting from either side deletes for both — sharing data
across a company boundary should not be something you discover afterwards.

Also fixed while here: the document normaliser runs on every load and would have stripped
`linkedFromCompany`, writing the link correctly and erasing it moments later. There is a
test pinning that field's survival specifically, because the failure is silent.

## Contact labels as durable rows (P1 6, first line)

Labels were being written into the contact's notes field, with `lead_source` overwritten
to record campaign membership. Both are lossy: a label could not be renamed, removed,
counted or filtered on, and overwriting `lead_source` destroyed the record of where the
contact actually came from.

Two tables — `contact_labels` and `contact_label_assignments` — because a contact has many
labels and a label has many contacts. An array column on the contact would make renaming a
label a rewrite of every contact row, and "which contacts carry this label" a scan. That
second query is what a saved segment *is*, so it gets its own index; the composite primary
key leads with `contact_id` and would not serve it.

Scoping matches `contacts` exactly: workspace membership plus `crm.view` to read and
`crm.manage` to change. A label is only ever seen beside the contacts it describes, and
anything looser would leak one workspace's segmentation vocabulary into another's.

The assignment policies deliberately verify the contact's *and* the label's own workspace
rather than only the assignment row's `workspace_id` column. Checking only the row's own
column is exactly the defect fixed in `202608010900` — it lets a caller name a workspace
they belong to while pointing at a record that lives elsewhere.

No UPDATE policy on assignments: the row carries no mutable state, so changing a label
means delete plus insert, which keeps `assigned_at` honest.

Verified as a real member, rolled back: creating a label and labelling a contact in one's
own workspace are accepted; an assignment claiming a workspace the contact is not in is
rejected; a label created in a workspace the member does not belong to is rejected; and a
duplicate name differing only in case is rejected. `contacts.id` is `text`, not `uuid`,
which the foreign key refused outright on the first attempt — a useful failure, since the
mismatch would otherwise have surfaced as a puzzling type error at query time.

Still open in P1 6: the labels UI, saved segments, campaigns, and removing the code that
writes labels into notes. This lands the durable model those depend on.

## The tenancy guard was three tables out of date

Refreshing the snapshot for the new tables exposed a quieter problem: the guard reads
`.ai/database/snapshot.json`, which was captured on 29 July, so it had been reporting
"63 tenant-scoped tables all have RLS" while the database actually held 66. Any table
added since that capture — including `eod_reports` — was outside its coverage entirely,
and the check reported success the whole time.

The `tables` and `policies` sections are now regenerated from live catalogue state (79
relations, 235 policies) and the guard covers 66. Only those two sections were replaced,
because they are the only ones this check consumes; the rest is left as captured rather
than half-regenerated while appearing complete.

Worth fixing properly: a check whose coverage silently shrinks relative to reality is
worse than no check, because it produces a reassuring number. The refresh should be part
of applying a migration, not something remembered later.

## The campaign action stopped destroying lead source

The second P1 6 line closes. Two bulk-contact actions were writing lossy data:

- **Add to campaign** did `persistContact({ ...c, source: value })` — it overwrote the
  contact's `source` with the campaign name. That field is *provenance*: it answers "is
  this channel worth the money". Membership is not provenance, and overwriting it threw
  away the only record of where the contact came from. This is the actual defect behind
  the checklist line; the notes one is merely untidy by comparison.
- **Assign label** appended `Label: X` to the notes field. Unrenameable, unremovable,
  uncountable, unfilterable — and "VIP" and "vip" produced two things that look identical.

Both now write rows into the tables added in `202608011200`. Neither touches `source` or
`notes`.

Three decisions worth stating:

**Grouped by the contact's own workspace, not the active one.** The row-level policies
check an assignment against its contact's workspace, so a selection spanning two
workspaces needs a label in each. Using whichever workspace happens to be on screen would
produce rows the database rejects, and the user would see an unexplained failure.

**Assignment is filtered before insert, not attempted and caught.** The primary key is
`(contact_id, label_id)`, so re-labelling an already-labelled contact is a duplicate-key
error rather than a no-op. A bulk action over a partly-labelled selection would fail on
the ones already done. The toast reports what actually happened — "Labelled 1 contact
'VIP' — 2 already had it" — instead of claiming credit for the whole selection.

**A lost create race re-reads rather than fails.** Two people creating the same label at
once means one loses the unique index. That client re-reads the workspace's labels and
uses the winner, because the user asked for a label to exist and it now does.

A campaign is represented as a label until real campaigns exist. That is deliberate: the
line asks to stop *destroying* lead source, and a labelled set is the honest minimum. When
campaigns become their own entity they can carry schedules and delivery events, which a
label should not.

The pure half lives in `src/crm/contact-labels.js` — matching, diffing and row shapes —
so it is tested directly rather than through the UI. Labels render as removable chips on
the contact record, and rendering them is what triggers the deferred fetch, so any screen
showing a contact gets them without knowing they load separately.

Still open in P1 6: saved segments, campaigns proper, templates/consent/delivery, and
campaign reporting.

## Pipeline stages are an existing status field, read as a sequence

Asked for: a Manage stages button, working pipeline stages, and a board view for moving
records through them.

The decision that shaped everything else was **not** to introduce a stages structure. A
`status` field's options already are an ordered list of `{ id, label, color }`, already
drive the status pill, filters and automations, and are already persisted. Adding a
parallel structure would have created two sources of truth that drift the first time
someone edits the field in the field editor instead of the stage manager. So: the options
*are* the stages, in listed order, and any app that already had a status field is already
a pipeline with no migration.

`src/workspace/pipeline-core.js` holds the model — grouping, reordering, safe deletion —
pure and callable. `src/workspace/board-view.js` renders the columns and is fetched on
demand.

Four things worth keeping in mind:

- **A record whose stage was deleted must still appear.** Unresolvable and unset values
  collect in a leading "No stage" column rather than being filtered out. A board that
  silently drops records is the worst kind of wrong: the column counts stop adding up to
  the number of records that exist, and nobody can find the missing one.
- **Deleting a stage asks where its records go.** `removeStage` returns the ids standing
  on it plus a destination, and clearing is offered alongside every other stage — without
  that, the last stage would be undeletable. Nothing is applied until Save, so Cancel
  really cancels.
- **A drag is an edit.** `wbSetItemStage` stamps `updatedAt`, runs automations and saves,
  exactly as editing the field on the record form does. An automation should not care how
  a status changed. It also re-checks the stage still exists, because the board may have
  been drawn before someone else deleted it.
- **The card body is passed into the board module, not rebuilt there.** A record looks the
  same on the board as in Cards because both render from `wbCardFieldHtml`; the board only
  owns columns and drop targets.

The record card carries only its id. The company, workspace, app and field come from the
`[data-wb-board]` container it was dropped on, so a second board on screen cannot be
mistaken for this one.

### The stage_moves automation trigger

`field_is` could already say "changes TO Won". What a pipeline actually gets asked is
"leaves Quoted" and "moves at all", so `stage_moves` expresses from → to with either side
left as *any stage*.

It fires only when the value genuinely changed (`now !== was`). Without that guard every
save on a record would trip every pipeline rule attached to it. No value is required —
"any to any" is a legitimate rule — but saving is refused when the app has no pipeline for
it to watch.

## Side menu presets, and why Default is empty

Asked for: presets for the side menu, with the current layout as the default.

**"Default" applies no overrides at all.** It is `null` in the preset table, sets no data
attribute, and matches none of the themed CSS. The alternative — writing the shipped
charcoal values into the table as one preset among seven — means the current look drifts
the moment anyone edits that table, and "Default" quietly becomes an approximation of
itself. Every themed rule is scoped to `[data-sidebar-theme]`, which is only ever set for
a non-default choice, and a test enumerates those rules to keep it that way.

Presets: Midnight (the navy in the reference), Dark, Coffee, Hot, Forest, Light, plus
Custom.

- **Light is the reason `dark: true/false` exists.** Six presets are dark surfaces where
  hairlines and hover lift with white; the light one has to darken instead or its dividers
  and hover state vanish. That flag becomes `data-sidebar-surface`, kept separate from the
  preset name so the stylesheet does not have to list every preset to know which way to go.
- **Custom derives its text from the background's relative luminance**, not from a guess.
  A naive channel average puts `#0000ff` and `#ffff00` in the same place and would make one
  of them unreadable.
- **The colour pickers do not re-render.** A re-render mid-drag tears down the open native
  colour popup, so they write state and let the CSS variables repaint.

The choice rides the existing appearance sync (the payload spreads the whole record), so
it follows the account between devices and can be set as the company default like any
other appearance setting.

## Choosing an install company no longer re-renders the settings page

A `render()` on the company `<select>` rebuilt the whole app-settings page and returned the
reader to the top of it — a long way from the control they had just used, for a change that
affects one other dropdown.

The block that actually depends on the company (the workspace picker and the cross-company
warning) is now `wbInstallTargetBody`, swapped in place. The install handler moved to
`wbInstallLinkedApp` so the first render and the in-place rebind call the same function
rather than keeping two copies that drift.

This is the same class of problem as the scroll-preservation work: the general fix restores
position after a render, but not re-rendering at all is better when only one block changed.

## The boot check found a blank page and passed anyway

Two blank screens shipped in one session, and the second is the more important one.

**The bug.** `main.js` builds its initial `state` at module scope, and that initializer
maps `normalizeCompany` over the fallback companies. I added `icon_color` and `icon_pack`
to that normaliser, with their lookup tables declared beside the functions that use them —
about 35,000 lines further down. At the moment `state` is built those consts are still in
their temporal dead zone, so the app threw before its first render: a completely blank
page and `Cannot access 'Vk' before initialization` in the console.

The fix is placement, not logic: the icon colour and pack tables now sit beside
`WORKSPACE_ICON_OPTIONS`, above the state initializer, with a comment saying why they are
not next to the code that reads them. `tests/module-init-order.test.mjs` asserts the
ordering, and also asserts that `normalizeCompany` still calls all three helpers — so the
ordering test cannot quietly become vacuous.

**The part worth remembering.** `scripts/check-bundle-boots.mjs` exists for exactly this
failure, and it *detected* it. It printed `BOOT THREW: ReferenceError …` and then exited
**0**. `npm run check` reported success. I only found the error by writing a throwaway
probe, and then discovered the real check had been telling me all along.

A check that detects a fault and exits zero is decoration. The catch block now exits 1,
and a test asserts it does. Worth applying the same suspicion to every other script under
`scripts/` that reports rather than gates.

Second lesson, same session: I confirmed the fix by grepping the check's output for a
success string. Grepping for "the good line" cannot distinguish "passed" from "printed
something else entirely" — check exit codes, not stdout.

**A probe artifact, and how it looked real.** After fixing the dead zone the probe reported
a stack overflow on the settings route. That was the probe: its `history.pushState` was a
no-op, so a redirect the app performs during render never moved `location` and repeated
forever. A test harness that does not implement navigation will manufacture infinite
redirect loops that look exactly like application bugs.

## Company and workspace icons: a plain glyph, a colour, and two local packs

Three related changes, driven by one observation — a chosen icon is a symbol, not a
picture, and the tinted tile around it was chrome for something that never needed a frame.

- **Plain unless uploaded.** `.workspace-icon:not(.has-upload)` drops the border, radius
  and fill. An uploaded image keeps its container: it has its own edges, arbitrary colours
  and an aspect ratio to crop. The distinction already existed in `workspaceIconMarkup`,
  so the CSS follows it rather than inventing a second one that could disagree.
- **Icon colour**, defaulting to Quest orange rather than the company tint, so a new
  account looks like the product instead of like whatever colour its label happened to
  get. Only a plain 3- or 6-digit hex is accepted — the value is interpolated into a
  `style` attribute, which makes the validator a security boundary as well as a
  correctness one.
- **124 icons in 10 groups, with Solid and Line packs**, all local. This is only
  affordable because rendering moved from inline SVG paths to the bundled Tabler font.
  The old path table cost 4.9 KB of the entry chunk for 47 icons — roughly 105 bytes per
  icon — which is precisely what capped the library. Font glyphs cost the entry chunk
  nothing per icon; the subset grew to 66 KB woff2 and the entry chunk got *smaller*.

Tabler ships filled variants for only 45 of the 124, so the Solid pack falls back to the
line glyph. The alternative — dropping unfilled icons from that pack — would make a style
choice silently change which icons exist.

Two traps worth recording:

- **Keys are permanent.** They are stored on company rows, so renaming one resets every
  company using it to the first icon in the list. The generator refuses to emit a list
  that would orphan a previously-shipped key, and a test repeats the check on the
  committed table.
- **The subset builder correctly refused to build.** Once the glyph is chosen at runtime
  the name never appears next to a `ti-` prefix, so its static scan saw an unresolvable
  name and stopped — which is exactly right, because subsetting on a guess would have
  shipped a picker full of blank boxes. The fix was to teach it to read the icon table
  (`collectTableIcons`) and to exempt only the one helper by name, with a comment binding
  the exemption to the collector so neither can be added without the other.

## The floating message dock, and a guide that cannot make things up

A circular button in the bottom-right corner opens a small panel with three tabs — recent
conversations, a people picker, and a Questbase guide — and any conversation opens as a
floating window over the current page rather than navigating away.

**It reimplements nothing.** Starting a conversation goes through
`startDirectMessageWithProfile`, which finds an existing direct thread before creating one;
without that the dock would spawn duplicate threads alongside the Messages page. The
composer posts through the app's own `data-message-form` handler, so permissions,
attachment rules and the double-send guard all still apply. A second send path would mean
a second set of those rules to keep in step.

`src/messaging/dock.js` receives **accessor functions**, not state — `conversations()`,
`members()`, `canSend(companyId)`. The module cannot reach into the application, every read
goes through code that already applies access filtering, and shaping the data inside the
module keeps it out of the eager bundle.

### The guide is grounded, not generative

It searches `HELP_TOPICS` — the curated index that already backs the command palette — and
the loader hands that index to the dock rather than importing it twice, so the two can
never disagree about what the product does.

This was a deliberate choice over wiring in a language model:

- It cannot invent a feature that does not exist. The failure mode is "nothing on that
  yet", which is the right answer for in-product help and a wrong answer no LLM reliably
  gives.
- It works offline, costs nothing per question, and sends no user text anywhere.
- The panel says outright that answers come from Questbase's built-in help, so silence
  reads as "not covered" rather than as a broken assistant.

The cost is real and worth stating: it only knows what is written in `HELP_TOPICS`. Adding
a capability means adding a topic there. That file already said as much before this
existed; the dock just made it user-facing.

## Print, CSV and download moved to a fetched chunk — carefully

`src/workspace/data-io.js` holds the print windows, CSV import/export and app download —
11.5 KB raw, every entry point a button, nothing needed to paint the app.

The thing that made this the *last* extraction attempted rather than the first:
**`window.open` must run in the same task as the click**, or the browser treats the new
window as an unsolicited pop-up. An `await` that resolves immediately still yields the
task, so the usual "load on demand, then act" shape breaks printing.

The resolution is a prefetch plus a synchronous path:

- `wbViewApp` fires `wbLoadDataIO()` on render, fire-and-forget. Every one of these buttons
  lives on that view, so by the time one can be clicked the module is in hand.
- `wbDataIO(name, ...args)` calls straight through when loaded, and only falls back to the
  async path if that prefetch failed — where a pop-up prompt is better than doing nothing.

The same rule already applied to the Reports print path; this generalises it. Any future
chunk containing `window.open`, a download anchor, or clipboard access needs the same
treatment, and a test pins the synchronous branch.

## Guided setup belongs to each operational workspace

Decided 2026-08-11 and applied in `20260810173743_workspace_setup_profiles.sql`, with release
hardening in `20260811100000_workspace_setup_release_hardening.sql` and
`20260811103000_workspace_setup_revision_save_fix.sql`.

A company is the billing and security account, not one fixed business process. The same
customer may need Roofing, Sales, Production, and a separate service-business workspace,
so one company-level questionnaire cannot safely own all of their apps and pipelines.

Setup state is therefore keyed by `workspace_id`. Company creation still guarantees one
default Main workspace and opens setup for it immediately. Every later operational workspace
is created blank and opens the same independent survey. A plan may describe exactly one
workspace; the server derives its company from that target and never accepts a sibling id in
the payload.

Start from scratch is a small skip action that directly applies a blank plan. Reset clears
only the selected workspace's answers and draft. It preserves the last applied plan, manual
apps, populated pipelines, business records, company membership, and every sibling workspace.
This is also why the legacy company setup routines remain only for compatibility while the
current UI writes through the workspace-specific RPCs.

The first Main workspace starts blank too; otherwise the generic creation preset survives a
later selection and can leave two CRM variants active. Manual apps retain their configuration
and are never silently adopted as setup-managed. A manual competing CRM variant blocks apply
with an actionable message. Every setup mutation carries an expected revision, preventing an
older tab or device from overwriting a newer decision.

### Workspace creation requires a setup decision

Decided 2026-08-11.

Creating a company or an operational workspace now opens the selected workspace's setup as
a modal that cannot be cancelled, closed from the backdrop, or dismissed with Escape. This
does not force a preset: **Start from scratch** remains the explicit skip and applies the
bounded blank plan. Once a plan is applied, the modal closes through the shared modal cleanup.

Setup > Workspaces is deliberately different. It is a small launcher for the same lazy-loaded
interface, but the reopened modal has Cancel because the workspace already exists and the
owner is choosing to review it. Keeping one panel for both entry points prevents creation and
Setup from drifting into two setup systems.

The workspace work-type question uses a searchable catalog of more than forty common trades
and business types. Those choices are presentation detail, not new server authorities: each
maps to the existing `roofing`, `construction`, `home_services`, `sales_agency`, or `mixed`
plan family before a plan is built. Older saved answers that contain only an industry family
resume through a stable default work type.

## App Builder records move from the workspace JSON to rows

Decided 2026-08-04. Approved, phase 1 not yet applied.

Every App Builder app, field, record and comment for a company lives in one `doc jsonb`
value on `workspace_builder_state`. That is why an App Builder app cannot reach the depth of
the native Jobs module: no child records, no enforceable rules, no aggregation, and the whole
document is rewritten on every edit.

The strain is already visible in the codebase: `wb_add_item_comment` and
`wb_modify_item_comment` exist only so a comment does not rewrite the document, and
`src/workspace/builder-merge.js` is a 148-line three-way merge that exists only because the
unit of change is the whole company workspace.

Records move to `public.wb_items`, with `parent_id` + `collection` giving child collections
and one partial unique index serving every app uniqueness rule. Apps, fields and automations
stay in the document: they are small, change rarely, and one owner edits them at a time.

Full plan and phases: [app-builder-records-as-rows](plans/app-builder-records-as-rows.md). The
proposed phase-1 migration is parked beside it as `.proposed.sql`, deliberately outside
`supabase/migrations/`, because it must land in the same change as the dual-write code.

## Product help is a route, not another floating answer box

Decided 2026-08-12.

Questbase now has a company-scoped Help Center at `/company/:companyId/help`, reached from
the top-bar `?`, the account menu, mobile More, or command search. It stays inside the
selected operational workspace so an article can link back to the correct Tasks, People,
Settings, Contacts, or other module without silently changing the user's context.

The Help Center and the company Knowledge Base solve different problems. Knowledge Base is
customer-authored SOP content. Help Center is Questbase-owned product documentation backed
by the curated `HELP_TOPICS` catalog already used by the in-product guide. Reusing that one
catalog prevents a tutorial page, command result, and floating guide from giving different
answers about the same feature.

Help itself renders after tenant access is reconciled but before billing, plugin, and module
permission blockers. A user who is blocked from a paid module still needs to understand the
account and contact support. Individual module articles do not bypass those checks: the
browser filters them through the real installed-plugin, subscription, module permission,
and optional manage-permission rules. A direct URL for a hidden article returns a neutral
unavailable notice rather than leaking its contents.

The page and its CSS are fetched only on first use. Search and category filters are URL
parameters, so Back/Forward and copied links work while `companyPath` preserves the active
workspace. Unresolved questions reuse the existing authenticated problem-report controller
and support email; there is no second report pipeline to secure or maintain.

## Client portal `scale_unit`: match production, and never send an explicit null

Decided 2026-08-15.

`client_portal_documents.scale_unit` had drifted. The migration that introduced it
(`202607041100_client_portal_document_review_fields.sql`) declared a nullable column guarded by
`check (scale_unit is null or scale_unit in ('ft','in','cm'))`. Production, though, runs it as
`not null default 'ft'` — applied out of band and never recorded as a migration. A database
built from this repository therefore had a different shape from the one the app talks to.

It surfaced as "Upload failed — no documents were saved": every plan-set upload sent an explicit
`scale_unit: null`, a column default does not apply to a key that is present-and-null, and so
each insert died on the not-null constraint. Because the upload path deletes the stored object
again when the record fails, it left nothing behind to diagnose.

Fixed on both sides, because they fail differently. `clientPortalDocumentPayload` now falls back
to `'ft'` instead of null, which works against either shape — so the app is not waiting on a
deploy to be correct. `20260815140000_client_portal_scale_unit_not_null.sql` moves the migration
history to what production actually has, so a fresh environment matches. Production is already in
that state, so the migration is a no-op there.

Production was chosen as the truth rather than the migration: a unit with no scale beside it is
inert, `'ft'` is the sensible default for a plan set, and NOT NULL is the stricter of the two.

The general rule this is an instance of: a NOT NULL column with a default must be OMITTED from an
insert payload, never sent as null. `emptyToNull` is the trap — it turns `''` into null, so a
NOT NULL column must never appear in its key list.

## The contact card is arranged, not fixed — region + span for content, pins for buttons

Decided 2026-08-15.

Company Contacts cards were a fixed shape: four hardcoded stat tiles, a summary line, a details
grid, four panels. The only choice was which of three shelves a field landed on. They are now
arranged by the company, and the model deliberately has two halves rather than one.

CONTENT — tiles, details, summary segments, panels — has a REGION and a SPAN on a four-column
grid. The card's shape stays the card's: a header that identifies somebody, a row of numbers,
their details, the panels that read their work. A tile can be turned off, resized, reordered, and
any field can be promoted into one.

A BUTTON is an affordance rather than content, so it gets a seventh region, `pin`: an anchor, a
reference point and a pixel offset. The load-bearing decision is that a pinned button is rendered
INSIDE its anchor element rather than into a card-level overlay — `.cc-profile-head` is
`position: relative` and a pin on it is `position: absolute; right: 12px`. Everything that is
otherwise hard falls out of that for free: it cannot drift when the window resizes because it is
in the thing it was measured against; it needs no measure-then-paint pass, so there is no flicker
and no invisible button on a slow frame; and it cannot teleport when a contact has no records and
the card is half the height. Which inset the offset lands on is chosen in CSS by attribute
selector, never inline, so one media query switches the whole mechanism off below 560px and pins
fall into their anchor's flow in reading order.

No fallback chain exists, and that is deliberate. `anchorsInUse` makes `renderCard` emit any
anchor a pin names on EVERY contact, even when empty — an empty region is a zero-height grid. A
chain of "if the anchor is missing, try the next one" is how a button ends up somewhere nobody
put it.

STORAGE NEEDED NO NEW TABLE. Field placement, button config and pin coordinates ride
`company_contact_fields.config` (jsonb), written by the Save that already existed. Tile layout
rides `workspace_builder_state.doc.contactCard`, which is already localStorage-mirrored,
realtime-synced, three-way merged and backed up. Tile entries are keyed `id` so `mergeIdLists`
merges per tile — two people moving different tiles both keep their change. Two edits were
required and either one missing loses layouts silently: `normalizeWorkspaceBuilderDoc` drops
every key it does not name, and `mergeBuilderDocs` rebuilds the doc from named keys.

`button` joined the contact palette. It had been excluded alongside `relationship` and `rollup`
on the stated grounds that all three "name an app" — but those two resolve IMPLICITLY against the
app they live in, while a button names `targetCompany` + `targetApp` in its own config and
`resolveTarget` walks the company for it. Three exclusions, three different reasons; describing
them as one is what kept a usable field type off the list. `company_contact` was removed from the
same palette as circular (a contact pointing at a contact), while staying in the APP palette,
where it is what `contactUsage` scans to build the card at all.

A contact is not a record, and the adapter that bridges them lives in `page.js` so that neither
`button-field.js` nor `button-push.js` learns what a contact stores. They disagree in four ways:
a category/status keeps its LABEL rather than an option id, tags are JSON text rather than an
array, a checkbox is 'yes'/'no' rather than a boolean, and the name is a real column rather than
a field. The name travels OUT as a synthetic field so `planPush` can label-match it, but the set
action is handed an app shape WITHOUT it — a button that silently renames a contact is excluded
structurally rather than by a guard somebody can delete.

## A photo is a doorway, and a row is not a gallery

Two halves of one rule about the Image field.

A stored photo is now always clickable and always opens the same viewer, from every surface it
is drawn on. A second place for "this cannot be shown" to be worded differently is how two
answers to "let me see that photo" appear — which is exactly what had happened: the record drew
a decorative thumbnail with no behaviour at all, while the field editor beside it offered an eye
button that opened a raw browser tab and left the record. On a phone that is a trip you do not
come back from.

A record LIST shows ONE photo and counts the rest. A cell is a summary of a value, not the value
itself — the same reason a Sheet field shows what the grid is CALLED rather than printing it. A
cell that painted eight photos pushed every other column off the row and still drew each one too
small to identify, so it was worse at both jobs. The record page shows the whole set, because
that is the page somebody opened in order to look at them.

The two are told apart by `detail: true` on the context object `wbFmtVal` already receives, set
by the record page and the record view modal. Not by a second formatter: the last time a surface
grew its own copy of the value formatter, a User field printed the member's raw UUID.

## Read-only mode is visible before a user presses a forbidden control

Server and event-handler authorization remain the source of truth, but the rendered shell also
applies one central read-only control state after each repaint. Mutable actions, form controls,
file labels, and submit buttons associated through `form=` are disabled and marked consistently.
This avoids presenting an action that can only fail while preserving the enforcement guard if a
disabled attribute is removed or a call is made directly.

## Terminal integration states do not keep background pollers alive

RingCentral presence polling continues through transient transport, hosting, and server errors,
but it stops when the session has no token, the endpoint forbids access, or a successful endpoint
response explicitly says the company has no active account. HTTP status alone is not evidence of
a deliberate disconnect. Presence state and the interval are keyed to the company so a company
switch resets a prior terminal state and a late response cannot repaint the wrong account.

## Advisor hardening is forward-only and behavior-preserving

Foreign-key indexes are added without changing constraints or customer rows. Service-only log
tables keep RLS enabled with no browser policy so they fail closed; an advisor warning is safer
than inventing a client policy for data the browser must never read. Reviewed authenticated
security-definer routines likewise retain their grants and internal authorization instead of
being broken solely to silence a generic advisor category.

### The extraction paid for the feature, again

The entry chunk had 18 bytes of headroom, so the viewer could not simply be added. The File /
Image uploader moved into `src/workspace/file-field.js`, fetched on demand: 180 lines of drop
zone, thumbnail list, progress bar and upload path that nothing needs until a field EDITOR is on
screen. Entry JavaScript went 364,526 → 363,613 gzip bytes and the ceiling was left alone.

It is prefetched by `wbLoadFieldUi`, which fetches the module that DRAWS the markup it binds, so
the two arrive together and the drop zone does not paint blank for a round trip. The mount is
idempotent — every zone it binds is marked — so arriving a tick late binds exactly once.

The failure mode of this kind of extraction is a name that was reached for and is now missing:
a ReferenceError nobody sees until they try to attach something. `file-field.js` is registered
in `tests/extracted-module-references.test.mjs`, which asserts `main.js` passes every key the
ctx destructures. That guard already existed for fifteen other modules; it is the reason this
was a safe thing to do in the same change as a feature.

## company_contacts.manage is split into the powers it was bundling

2026-08-26. Migration `20260826090000_company_contacts_permission_split`.

One key granted four unrelated powers: file a contact, edit one, delete one, and restructure
the directory's field definitions and card layout. Those carry very different risk. Filing a
contact is what an ordinary worker does whenever a Workspace button sends a lead across, while
field removal belongs behind its own schema-management permission and recovery path.

Because they shared a key, the only way to let a worker file a lead was to also hand them the
power to destroy the directory's structure. In practice nobody granted it, so the Workspace
"Lead" button answered `Sent, but Name could not be filed in Company Contacts` for every
non-elevated role.

Now `company_contacts.create`, `.edit`, `.delete` and `.fields.manage`, each grantable on its
own. Decisions taken deliberately:

- **`company_contacts.manage` survives as the everything-grant.** The existing
  `app_private.has_company_permission` expands the requested granular key and its legacy alias,
  and the browser's `PERMISSION_ALIASES` mirrors the same map. No existing role loses access and
  no assignment has to be rewritten.
- **One resolver decides deny precedence.** The database policy calls the exact granular key
  once. The resolver evaluates explicit denies across the equivalent-key set before grants, so
  browser and database cannot disagree because an SQL `OR` happened to bypass one denied key.
- **No new SECURITY DEFINER function.** The existing resolver is replaced in place, preserving
  its reviewed plugin gate, elevation, fixed search path, revokes and grants without adding a
  second security-definer surface.
- **Reads were not narrowed.** Any active member still reads the directory.
- **Filing a lead against somebody already on file, with nothing left to fill in, now writes
  nothing** and needs no write permission at all. It also stops a button press bumping an
  unrelated contact's timestamp.

The browser's `permissionPluginIds` gained the `company_contacts.` branch the SQL side has had
since 20260813180000. Without it the module gate disagreed across the two layers: a company
that uninstalled Company Contacts still saw the UI offer actions RLS refused.

Only the Company Contacts half of the permission work is done. The equivalent split for
Workspaces cannot be enforced today: every workspace, app, field and record for a company
lives in one `workspace_builder_state` row behind a single `workspaces.manage` write policy,
so editing one record and deleting every app are the same UPDATE. Splitting it needs records
moved into their own table first.

## The tenancy guard refuses a stale snapshot (2026-08-28)

`scripts/check-tenancy-matrix.mjs` iterates `.ai/database/snapshot.json`. A tenant table the
snapshot has never heard of was therefore not failed — it was skipped, and the run still
reported a clean matrix.

On 2026-08-28 an audit found the committed snapshot was 18 days and 28 migrations behind live.
Seven tenant-carrying tables existed in production that the guard had never examined:
`company_contacts`, `company_contact_fields`, `sms_messages`, `sms_numbers`, `wb_intake_links`,
`wb_intake_submissions`, `wb_record_events`. All seven were in fact correct, so nothing leaked.
The control was the thing that was broken, and a green check that is not checking anything is
worse than no check, because it stops anyone looking.

The guard now compares the newest migration filename's own timestamp against the snapshot's
`captured_at` and refuses to certify when a migration landed after the capture. The snapshot
was refreshed from live metadata in the same change; coverage went from 50-odd tables to 83.

Consequence to expect: adding a migration file makes `npm run check` fail until that migration
is applied AND the snapshot refreshed. That is the intended ordering from operations.md, now
enforced rather than remembered. Do not relax the gate to unblock a branch — refresh the
snapshot, which is the work the gate is asking for.

## Portal guest identity is a session-minted id, not the typed name (2026-08-28)

Client Portal annotation ownership was scoped by `guest_name`, which the guest supplies when
they open the portal. Anyone holding the link could reopen it under somebody else's name and
inherit their annotations; a bulk save with an empty list then deleted every one of them.

`client-portal-open` now mints a `guest_id` into the signed session, and
`client-portal-annotations` scopes ownership on `payload->>guest_id`. The id lives inside the
existing `payload` jsonb rather than a new column, deliberately: `payload` is already rewritten
server-side (it is where `payload.author` is forced), PostgREST can filter it, and putting it
there meant the fix shipped without a migration and without a window where the code expected a
column the database did not have.

Annotations written before this carry no id, so no guest matches them and none can be deleted
through the public endpoint. That is the safe direction — portal managers still reach them
through the authenticated path. Sessions issued before the change likewise own nothing, which
self-resolves within their six-hour lifetime.

Related, same change: every session-authenticated portal endpoint now re-reads the portal and
requires `status = active`, so revoking a link ends the sessions already riding on it instead
of leaving them working for the rest of the token's life.

## Intake counters are compare-and-swap (2026-08-28)

The passcode lockout and the submission cap on `wb_intake_links` were read-modify-write: read
the row, add one in JavaScript, write it back. Eight passcode guesses posted together all read
`0` and all wrote `1`, so `MAX_PASSCODE_ATTEMPTS` never tripped; the same race let a link capped
at one submission accept several.

Both now filter the PATCH on the value that was read (`?failed_attempts=eq.3`), so Postgres
applies the update only if nobody moved it, and an empty representation means re-read and retry.
No new database function and no migration — the atomicity is in the WHERE clause.

Two deliberate behaviours fall out of it. Losing the swap past the retry budget locks the link
outright rather than letting an uncounted guess through, because that much simultaneous failure
IS the attack. And the submission slot is now claimed BEFORE the row is written, with an
explicit release if the insert fails — the reverse of the old ordering, which protected against
a wasted slot at the cost of letting concurrent posts overshoot the cap.

## Rate limiting is two limiters, not one (2026-08-28)

`api/_lib/rate-limit.js` kept its counters in a Map in module scope. On Vercel that makes the
real ceiling the configured limit multiplied by the number of live lambda instances, reset by
every cold start. `wb-intake-open.js` already said so in a comment; the gap was that five
endpoints relied on it as the only thing between an attacker and a secret.

The in-memory limiter stays exactly as it was, and is still the whole story for ordinary
throttling. Endpoints where a SECRET is being guessed additionally count in Postgres, through
`public.consume_rate_limit` and `public.api_rate_limits`: portal open (a password), intake open
and submit (a passcode), and the three public token endpoints (invite, proposal open, proposal
respond).

Three properties worth keeping:

- **Local first, shared second.** A request refused by the in-memory window never reaches the
  database, so the round trip is charged to attackers rather than to ordinary traffic. The
  origin check sits between them, because it is free and a disallowed origin should not cost a
  query either.
- **Fails open.** If the RPC cannot answer, the request proceeds on the local ceiling alone.
  Behind an existing limiter, that degrades to the protection that existed before this change;
  failing closed would turn a Supabase blip into an outage of every public portal and proposal.
- **No IP is stored.** The bucket key is a SHA-256 of `namespace:ip`, hashed in the process
  before it is sent. The digest is enough to count against and useless for identifying anyone,
  and the namespace inside the hash keeps one endpoint's window from colliding with another's.

`api_rate_limits` is a server-only ledger in the same shape as `wo_counters` and `checkin_log`:
RLS on, no policies, no grants to any browser role. `consume_rate_limit` is SECURITY DEFINER and
executable by `service_role` only -- a browser role that could call it could inflate somebody
else's counter. Expired rows are swept opportunistically on roughly one call in a hundred, with
a LIMIT, so no cron entry is needed and no single request pays for the cleanup.
## Company Contact field definitions join the 30-day Recycle Bin

2026-08-27. Migration `20260826195655_company_contact_field_recycle`.

A field definition is schema, but deleting it also makes every value stored under that field id
disappear from the product. Hard deletion therefore made a harmless-looking settings action
operationally unrecoverable. Definitions now carry `deleted_at` and `deleted_by`, normal reads
return active rows only, browser DELETE is revoked, and the existing recycle functions recognize
`company_contact_field` with the `company_contacts.fields.manage` permission.

The UI moves removed definitions through the same audited recycle operation as other business
records. Batch removal is sequential and returns the unprocessed ids at the first failure, so a
retry does not create duplicate ledger entries for definitions already recycled. Restore keeps
the original field id, which reconnects the values already present in
`company_contacts.field_values`.

## Managing a workspace is its own permission (2026-08-28)

The roles editor offered two workspace powers -- view apps and create/edit apps -- and neither
covered administering the workspace itself. The only key that reached its name, icon,
description, archive state and default flag was `settings.manage`, which is the entire company
settings area: brand, modules, integrations, pipelines, handoffs, launch. Letting somebody
rename a workspace meant handing them all of it. Same bundling problem as
`company_contacts.manage`, and the same fix: `workspaces.settings.manage`.

It also closed a live mismatch. `canManageOperationalWorkspaces()` already accepted
`settings.manage`, but every RPC behind that surface checked `is_workspace_admin` or
`is_company_admin`, which read the company ROLE and ignore permissions entirely. A non-elevated
member holding `settings.manage` saw the controls enabled and got "Workspace admin access
required" on save -- the UI promising what the database refuses, which is the exact failure
`can()` warns about in its own comment.

Scope is identity and lifecycle: rename, icon, description, archive/restore, create, reorder,
set-default. It does NOT grant workspace membership or module activation.
`app_private.is_workspace_admin` was deliberately left untouched for that reason -- it also
guards `workspace_memberships` and `workspace_plugins` through RLS, so widening it would have
handed over who can see a workspace's records along with the ability to rename it. Only the
four settings RPCs were repointed, at `app_private.can_manage_workspace_settings` /
`can_manage_company_workspace_settings`, neither of which is callable by a browser role.

Two details worth keeping:

- **Not gated on the App Builder plugin.** `workspaces.%` maps to `workspace_builder`, which is
  right for the app keys and wrong for this one: every company has workspaces whether or not
  the builder is installed, and they still have to be renamed and archived. The exception is
  declared in both `permissionPluginIds()` and `app_private.permission_plugin_ids`, and a test
  asserts the branch order in each, because whichever is tested second never runs.
- **The RPC guards were patched by checked text substitution**, not by restating four bodies in
  the migration. `create_operational_workspace` alone is 6.6 KB of preset seeding, and retyping
  it to change one line is how a transcription error gets into an authorization path. The
  substitution raises if a guard is not found exactly where expected, so a future rewrite fails
  the migration rather than silently leaving the old role-only check in place.

Verified on live with a rollback-only probe against a real non-elevated member: workspace
settings went false -> true when the key was granted, while `is_workspace_admin` and
`workspaces.manage` both stayed false.

## App Builder records are rows, so permissions can attach to them (2026-08-28)

Records lived inside `workspace_builder_state.doc` -- one jsonb cell per COMPANY holding every
app, every field and every record. Two consequences followed from that shape.

It could not carry permissions. Creating a record, deleting a record and renaming an app were
all the same UPDATE of the same column, so RLS could only say `workspaces.view` reads the whole
document and `workspaces.manage` writes the whole document. A per-record permission had nothing
to attach to, and any checkbox offering one would have been honoured by the browser and ignored
by the API.

It could not scale. The largest document was 525 kB, read in full on every page load and
rewritten in full on every record save -- the O2 finding from the security audit.

Records are now rows in `public.wb_records`, gated per operation by `workspaces.records.view`
/ `.create` / `.edit` / `.delete`, one policy each.

**The in-memory shape did not change.** 139 call sites across 22 files read `app.items`, and
rewriting them is how this would have broken the App Builder. `src/workspace/record-store.js`
swaps the STORAGE behind that shape: rows carry the item verbatim in `data`, hydration is a
copy, and only the load and save seams moved. `app.items` is still the same array of the same
objects.

Four things worth keeping in mind:

- **Gated by workspace, not company.** Records carry a `workspace_id` and the stated invariant
  is that workspace_id is the operational boundary, so `has_workspace_permission` decides. That
  is also a tightening: the company-wide document let a member of one workspace read another's
  records.
- **The broad keys still work.** `workspaces.view` satisfies records.view and
  `workspaces.manage` satisfies the other three, so no role lost access on deploy. A role
  wanting finer control stops granting the broad key.
- **Refusal is an ordinary outcome.** `persistRecordDiff` writes records BEFORE the document
  and reports which ids the database would not take, per operation, instead of failing the
  whole save. A role with create but not delete is supposed to run into this.
- **The document is written without records.** Keeping them in both places would have left the
  old unenforced write path open, since the document's UPDATE policy is still
  `workspaces.manage`. Anyone with a tab open across the deploy should reload.

Verified on live with a rollback-only probe: a member with no role assignment answered false to
all four; granting only view and create answered view=true, create=true, edit=false,
delete=false.

**Backfill note.** The first backfill matched nothing and still reported success -- it filtered
the document's workspace id as a bare uuid, but the builder addresses workspaces as
`ws-<uuid>`. 85 of the 96 records in the document were copied on the corrected pass. The other
11 sit under a builder workspace whose real row was deleted; `allowedBuilderIds` already
filters those out, so they are unreachable in the product and importing them would have
resurrected invisible data into a live workspace. They remain in the document, which this work
does not modify.

## Compatibility for a permission split belongs in data, not in a rule (2026-08-28)

When `workspaces.records.view/create/edit/delete` were introduced, the broad keys were made to
satisfy them: `workspaces.manage` implied create/edit/delete, `workspaces.view` implied view.
That stopped any role losing access on deploy -- and made the four checkboxes non-authoritative.
A role with "Create/edit workspace apps" ticked kept every record power regardless of the record
boxes, so unticking "Delete app records" did nothing.

It was reported from production in exactly that shape: a worker deleted a record they had been
denied. The database was enforcing correctly the whole time; it was enforcing a rule that said
the broad key was enough.

`20260828040051` grants the specific keys once to every role that relied on a broad one, then
removes the aliasing from `app_private.has_workspace_permission` and from PERMISSION_ALIASES.
Same compatibility, expressed as data. After it, the four keys are the only thing consulted, so
what the roles screen shows is what the database does.

Verified on live for the reported worker: view/create allowed, edit and delete refused
(`deleted=0`, `updated=0`, `inserted=true`), and the backfill left that role's own choices
untouched while giving the manage-holding roles all four.

## A refused write must not be reported as a success (2026-08-28)

`saveWorkspaceBuilderDoc` returned nothing. A refused write showed a toast and was then
forgotten, and the caller announced success on top of it -- so the record vanished from the
list, "Deleted." appeared, and the row was still there on the next reload. The same was true of
`wbTrashFields`.

It now returns a boolean, and `wbSave` reports whether every target landed. The per-write
`.catch` stays, so the ~68 fire-and-forget call sites still cannot raise an unhandled rejection;
the callers that care can tell the difference. `wbTrashItems` and `wbTrashFields` throw when the
save did not land, which is what makes `sendToTrashAndSave` put the records back.

A refused record change also aborts the document write rather than continuing. Writing the
document afterwards would store a half-applied edit: the record removed from the list and parked
in the app's trash, while the row it was meant to delete is untouched.

## Startup deadlines cancel work, and partial data stays visible (2026-08-29)

The first-workspace loader used a Promise race for its 15-second deadline. The user stopped
waiting, but the Supabase request kept running, consuming a browser connection and potentially
settling after the fallback had already painted. Initial query builders now receive one
AbortSignal and the deadline aborts that request before returning the timeout result.

Independent reads still settle separately: a temporary failure must not blank cached data that
did load previously. The shell therefore keeps the last safe rows, records the failed areas,
labels the connection `Quest Supabase partial`, and offers a visible Retry action. `live` is no
longer used as a claim that every initial query succeeded.

Backup payloads are detail data, not list data. Startup and realtime refresh select backup
metadata only; download and restore hydrate the exact saved payload by id when requested. There
is deliberately no fallback that builds a new snapshot from current state, because exporting
current state under an old backup's label is data corruption disguised as recovery.
