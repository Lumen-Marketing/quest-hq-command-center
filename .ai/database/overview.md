# Database overview

The live Supabase public schema was captured 2026-07-21T00:27:56.075Z. The [machine-readable snapshot](snapshot.json) contains catalog metadata only; it has no production rows, auth-user records, storage object paths, or credentials.

## At a glance

- 60 public relations (59 RLS-enabled base tables and 1 view)
- 754 public columns
- 178 foreign-key column links
- 190 RLS policies
- 59 public functions
- 80 trigger events
- 6 storage buckets
- 1 database cron job
- 76 live migration-ledger entries

## Domain map

| Domain | Principal tables |
| --- | --- |
| Identity and tenancy | profiles, companies, company_memberships, company_subscriptions, company_invites, company_join_requests, workspaces, workspace_memberships |
| Authorization and audit | roles, role_permissions, user_role_assignments, resource_acl, field_permissions, audit_events |
| CRM and sales | contacts, accounts, crm_sites, pipeline_stages, deals, activities, proposal_documents, underwriting_cases |
| Jobs and execution | jobs, job_activity, tasks, time_entries, active_timers, notifications |
| Files, knowledge, and recovery | job_files, knowledge_articles, recycle_bin_items, workspace_backups, workspace_backup_copies |
| Messaging and calendar | message_conversations, message_conversation_access, messages, message_attachments, message_reads, calendar_events |
| Client/public flows | clients, client_portals, client_portal_documents, client_portal_annotations, client_portal_events, forms, form_responses |
| Finance and price book | finance_vendors, finance_invoices, finance_payments, finance_expenses, pricebook_vendors, pricebook_materials, pricebook_vendor_prices, v_pricebook_material_best |
| Workspace configuration | workspace_plugins, company_plugins, workspace_builder_state, wo_counters |
| Phone and call activity (pending migration) | ringcentral_accounts, ringcentral_extensions, ringcentral_calls, ringcentral_presence, ringcentral_sync_state |

## How to use this map

- [schema.md](schema.md) lists tables, columns, primary keys, and RLS flags.
- [relationships.md](relationships.md) lists every public foreign key.
- [functions.md](functions.md) catalogs public routines and triggers.
- [security.md](security.md) summarizes RLS and policy coverage.
- [storage.md](storage.md) catalogs buckets, extensions, and scheduled work.
- [introspection.sql](introspection.sql) contains safe read-only queries for a manual refresh.
- [snapshot.json](snapshot.json) is the structured source used by validators and future agents.

Before changing the database, inspect the relevant SQL under [supabase/migrations](../../supabase/migrations) and verify the live state. A catalog snapshot explains shape, not business semantics or complete policy expressions.
