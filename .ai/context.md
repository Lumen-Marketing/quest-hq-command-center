# Product context

Questbase is Lumen's multi-tenant operating system for roofing and service companies. The repository and some internal runtime identifiers retain the historical Quest HQ Command Center name while the customer-facing product transitions to Questbase.io. It combines customer and job management, estimating, work execution, files, collaboration, finance, access control, and configurable operational workspaces inside each customer company account.

## Product boundary

Questbase owns the company shell, authentication flow, guided workspace setup, company and workspace memberships, subscription gating, roles and permissions, CRM records, job containers, files, forms, finance, messaging, calendar, client portals, reporting, settings, workspace plugins, and custom workspace apps.

TaskManagement remains the vendored work-execution engine and the default task surface; a host-native Tasks surface is gated behind `VITE_NATIVE_TASKS_MODULE` (off by default). Questbase links those tasks to jobs through `project_id`, contacts through `contact_id`, and quotes/deals through tenant-scoped `deal_id`. Do not create a second independent task or next-step model inside Questbase. The native surface's write engine (src/tasks/task-store.js) is not a second model: it reuses the single `normalizeTask` / `taskPayload` shape.

Questbase also keeps same-browser recovery copies for unsaved Contact, Job, Quote, and Underwriter forms. These copies protect interrupted typing only; successful form submissions still write through the existing Supabase paths and remain the shared business record.

Saved Contacts, Quotes, Jobs, and Tasks have a separate shared record-history ledger. It records who changed whitelisted business fields and preserves delete/restore events within the record's workspace permissions; it never turns the browser-local draft cache into shared company data.

## Live product areas

| Group | Modules |
| --- | --- |
| Work | Home/Dashboard, My Tasks, Inbox/Messages |
| Pipeline and production | Contacts with live stages, Jobs with live stages |
| Tools | Estimator/Underwriter, Proposals |
| Review and build | Reports/Analytics, People/Users, Meetings/Calendar, Templates, Automations |
| Company workspace | Workspace App Builder, Workday, Quotes/Deals, Files, Forms, Client Portals, Knowledge |
| Company operations | Price Book, Finance, Team Chart, Team Workload, Time, Approvals, Clock |
| Control | Guided setup, company, roles, access, billing, plugins, and workspace settings |

Tickets and Templates appear as future/planned areas. Confirm current implementation status in [current-state.md](current-state.md) before building against them.

## Users and tenancy

- A company is the customer account and top-level billing/security tenant.
- A workspace is a configurable operational child of one company. Different teams or pipelines can use different apps, roles, plugins, and records without creating another customer account.
- A profile represents the signed-in person; `company_memberships` grant company access and `workspace_memberships` grant regular workers access to specific child workspaces.
- Company owners, admins, and developers inherit access to every active child workspace. Regular workers require explicit workspace assignments and can have a different role in each workspace.
- Company subscription state gates paid workspace behavior.
- Roles, permissions, resource ACLs, field permissions, membership status, and RLS all participate in authorization.
- The public demo is bundled sample data and must remain read-only.
- Public client portals, proposals, and forms use narrowly scoped server APIs and tokens rather than broad tenant access.

## Core vocabulary

- Contact: a person or prospect in the CRM.
- Account: a company or household related to contacts and deals.
- Site: the physical service/property location.
- Deal or Quote: a sales opportunity that can become a job.
- Job: the operational container for roofing work.
- Task: work execution that also supplies the shared "What's next" value for linked Contacts, Quotes/Deals, and Jobs.
- Company account: the market customer, subscription, and outer security tenant.
- Operational workspace: a configurable child environment for a team, pipeline, or role inside one company account.
- Workspace setup plan: the owner-reviewed, editable apps, pipeline stages, and non-elevated role templates produced for one selected operational workspace by its questionnaire or a ready-made blueprint. It never creates or rewrites sibling workspaces.
- Workspace App Builder: the configurable custom-app module available inside an operational workspace; it is not the tenancy object itself.
- Plugin: a company-level entitlement with separate activation and configuration per operational workspace; disabling it preserves data.

