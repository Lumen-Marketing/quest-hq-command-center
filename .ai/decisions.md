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

## No sensitive project-brain content

The project brain records catalog metadata, architecture, decisions, and state—not credentials, user identities, row payloads, storage objects, or private operational content.

