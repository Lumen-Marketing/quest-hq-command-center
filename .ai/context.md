# Product context

Quest HQ Command Center is Lumen's multi-tenant operating system for roofing companies. It combines customer and job management, estimating, work execution, files, collaboration, finance, access control, and workspace administration in one company-scoped web app.

## Product boundary

Quest HQ owns the company shell, authentication flow, memberships, subscription gating, roles and permissions, CRM records, job containers, files, forms, finance, messaging, calendar, client portals, reporting, settings, and custom workspace apps.

TaskManagement remains the vendored work-execution engine. The stable integration contract is jobs.id to tasks.project_id. Do not create a second independent task model inside Quest HQ.

## Live product areas

| Group | Modules |
| --- | --- |
| Work | Dashboard, Tasks, Workspace App Builder, Underwriter |
| Quest CRM | Workday, Contacts, Quotes/Deals, Proposals, Jobs |
| Communication | Messages, Calendar |
| Estimating and delivery | Price Book, Finance, Files, Forms, Client Portals |
| Review and workforce | Analytics, Users, Team Chart, Time, Approvals, Clock |
| Control | Company, roles, access, billing, plugins, and workspace settings |

Tickets, knowledge, automations, templates, and team workload appear as future/planned areas. Confirm current implementation status in [current-state.md](current-state.md) before building against them.

## Users and tenancy

- A company is the tenant boundary.
- A profile represents the signed-in person; company_memberships grant company access.
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
- Task: work execution linked to a job through project_id.
- Workspace: a tenant company; Workspace App Builder also means the configurable custom-app module inside that tenant.
- Plugin: a company-level module entitlement; disabling a plugin preserves its data.

