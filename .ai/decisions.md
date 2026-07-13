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

## Production Guardian

A scheduled GitHub workflow verifies the deployed production revision, routes, and critical assets. It opens or recovers an incident issue automatically so production drift does not depend on a human noticing it.

## No sensitive project-brain content

The project brain records catalog metadata, architecture, decisions, and state—not credentials, user identities, row payloads, storage objects, or private operational content.

