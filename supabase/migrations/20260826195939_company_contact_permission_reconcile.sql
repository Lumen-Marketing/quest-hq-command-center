-- RECONCILIATION: applied to production on 2026-08-26 as version 20260826195939, but its file
-- was never committed. Recovered verbatim from supabase_migrations.schema_migrations.statements
-- on 2026-08-28. ALREADY APPLIED in production -- committed so a fresh environment matches.
-- Superseded for the policy role by 20260828002845_tenant_grant_and_policy_hardening.sql.

-- Reconcile the final Company Contacts policy shape after both forward migrations.
-- This is deliberately idempotent: production received the recycle migration before the
-- permission split while the repository's timestamp order is the reverse. Re-applying the
-- intended final policies here makes either history converge on the same safe catalog.

create index if not exists company_contact_fields_deleted_by_idx
  on public.company_contact_fields (deleted_by)
  where deleted_by is not null;

drop policy if exists "company contact fields write" on public.company_contact_fields;
drop policy if exists "company contact fields read" on public.company_contact_fields;
drop policy if exists "company contact fields insert" on public.company_contact_fields;
drop policy if exists "company contact fields update" on public.company_contact_fields;
drop policy if exists "company contact fields delete" on public.company_contact_fields;

create policy "company contact fields read" on public.company_contact_fields
for select using (
  deleted_at is null
  and app_private.is_company_member(company_id)
);

create policy "company contact fields insert" on public.company_contact_fields
for insert with check (
  deleted_at is null
  and app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
);

create policy "company contact fields update" on public.company_contact_fields
for update using (
  deleted_at is null
  and app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
)
with check (
  deleted_at is null
  and app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
);

-- Direct browser deletion or soft-deletion would bypass the audited Recycle Bin ledger.
-- The SECURITY DEFINER recycle functions remain the only path that can set these columns or
-- permanently delete an expired definition.
revoke delete on table public.company_contact_fields from authenticated;

-- FOR ALL also creates a SELECT policy, which duplicated the member read policy. The legacy
-- option table is retained for compatibility, but its writes use operation-specific policies.
drop policy if exists "company contact options write" on public.company_contact_options;
drop policy if exists "company contact options insert" on public.company_contact_options;
drop policy if exists "company contact options update" on public.company_contact_options;
drop policy if exists "company contact options delete" on public.company_contact_options;

create policy "company contact options insert" on public.company_contact_options
for insert with check (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
);

create policy "company contact options update" on public.company_contact_options
for update using (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
)
with check (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
);

create policy "company contact options delete" on public.company_contact_options
for delete using (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
);
