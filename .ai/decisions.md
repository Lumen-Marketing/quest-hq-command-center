# Durable decisions

## Vendor-neutral project brain

The canonical context lives in .ai rather than a vendor-specific instruction file. Vendor adapters only point to .ai/README.md. This keeps AI handoffs and future human handoffs consistent across tools.

## Direct deployment workflow

The operating workflow does not use local servers. Tests and builds may run locally, but behavior is accepted against the directly deployed Vercel environment after merge.

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

## Android ships as an installable PWA, not a native wrapper

Installability comes from a manifest, icons, and a service worker, so the app installs to an Android home screen on phone and tablet and runs standalone. A Capacitor shell was rejected for now: the app makes thirteen relative `/api/...` calls that resolve against the page origin, and a native webview origin (`capacitor://localhost`) would break every one of them, while the CSP delivered as Vercel headers would have to move into a meta tag and Supabase auth redirects would need custom-scheme or App Links handling. The PWA keeps the real origin, so those calls and headers work unchanged. If a Play Store listing is wanted, the next step is a Trusted Web Activity wrapping this same PWA, which also keeps the origin — Capacitor is only worth its cost for genuine native needs such as camera or FCM push.

## The service worker is scoped to what it cannot get wrong

Navigations are network-first with the cached shell as an offline-only fallback, so a deploy is never shadowed by the cache. Only content-hashed `/assets/` files are cache-first, which is safe because a changed file is a changed URL. The API, and every cross-origin request, is not cached at all: storing authenticated responses in the Cache API would leave one user's data on the device for the next session, which is a privacy bug rather than a performance win.

## No sensitive project-brain content

The project brain records catalog metadata, architecture, decisions, and state—not credentials, user identities, row payloads, storage objects, or private operational content.

