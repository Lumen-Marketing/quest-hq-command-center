# Durable decisions

## Vendor-neutral project brain

The canonical context lives in .ai rather than a vendor-specific instruction file. Vendor adapters only point to .ai/README.md. This keeps AI handoffs and future human handoffs consistent across tools.

## Direct deployment workflow

The operating workflow does not use local servers. Tests and builds may run locally, but behavior is accepted against the directly deployed Vercel environment after merge.

## Workspace membership is visible navigation context

The desktop command rail renders every company allowed by the signed-in profile's active memberships as a workspace row. The active row is persistent rather than hidden behind a single-company dropdown. Workspace switching continues through `setActiveCompany()` so route preservation, scoped UI reset, and company-specific pipeline stage application remain centralized. Workspace creation and identity management remain on the Company settings surface.

## Supabase is production data truth

Repository migrations explain intended history; the live Supabase catalog determines the current production shape. Database documentation is a metadata-only snapshot and must be refreshed after database changes.

## Tenant isolation is layered

Company-scoped columns, memberships, role/permission tables, field/resource controls, RLS policies, server endpoint checks, and plugin/subscription gates are all part of access control. Removing one layer requires explicit security review.

## Atomic and recoverable mutations

Where live routines provide atomic mutations or safe-delete/recycle-bin behavior, callers must use them rather than recreating multi-step client mutations.

## Task system boundary

TaskManagement owns task execution. Quest HQ links business containers to tasks through jobs.id to tasks.project_id and must not fork the task model.

## Funnel next actions are tasks

Contacts, Quotes/Deals, and Jobs do not maintain a parallel next-step field. Their "What's next" value is the earliest scheduled open task. Contacts link through `tasks.contact_id`, jobs through `tasks.project_id`, and quotes through the tenant-safe composite relationship `tasks(company_id, deal_id)` to `deals(company_id, id)`. Legacy contact-linked quote tasks are used only when one active quote makes the match unambiguous.

## Production Guardian

A scheduled GitHub workflow verifies the deployed production revision, routes, and critical assets. It opens or recovers an incident issue automatically so production drift does not depend on a human noticing it.

## Job photos reuse the file system

Direct job-card photo capture writes image bytes to the existing private `quest-job-files` bucket and metadata to `job_files`. Photo category and caption use existing file metadata, keeping storage policy, signed previews, Drive visibility, and recycle behavior consistent.

## Underwriting cases are shared records

Calculator drafts are stored in `underwriting_cases` with one current case per company/contact. Browser-only persistence was rejected because underwriting decisions need to survive devices and be visible to other authorized team members.

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

## No sensitive project-brain content

The project brain records catalog metadata, architecture, decisions, and state—not credentials, user identities, row payloads, storage objects, or private operational content.

