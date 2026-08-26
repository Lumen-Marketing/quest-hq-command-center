-- Reconcile the final Company Contacts policy shape after both forward migrations.
-- This is deliberately idempotent: production received the recycle migration before the
-- permission split while the repository's timestamp order is the reverse. Re-applying the
-- intended final policies here makes either history converge on the same safe catalog.

-- Older databases may already have recorded the original permission-split migration, so
-- editing that historical file is not enough. Replace the shared resolver again here to make
-- legacy company_contacts.manage grants and the new granular keys converge in every database.
-- Denies keep precedence across all equivalent keys.
create or replace function app_private.has_company_permission(target_company_id text, permission text)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  with permission_variants as (
    select permission as permission_key
    union
    select case
      when permission = 'messages.manage' then 'messages.manage_groups'
      when permission = 'messages.manage_groups' then 'messages.manage'
      when permission = 'company_contacts.create' then 'company_contacts.manage'
      when permission = 'company_contacts.edit' then 'company_contacts.manage'
      when permission = 'company_contacts.delete' then 'company_contacts.manage'
      when permission = 'company_contacts.fields.manage' then 'company_contacts.manage'
      else permission
    end
  ),
  membership as (
    select cm.role
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
    limit 1
  ),
  assigned as (
    select rp.effect
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    where ura.company_id = target_company_id
      and ura.profile_id = auth.uid()
      and (
        rp.permission_key = '*'
        or rp.permission_key in (select permission_key from permission_variants)
      )
  )
  select
    app_private.permission_plugin_available(target_company_id, permission)
    and (
      exists (select 1 from membership where role in ('owner', 'admin', 'developer'))
      or (
        exists (select 1 from membership)
        and not exists (select 1 from assigned where effect = 'deny')
        and (
          exists (select 1 from assigned where effect = 'allow')
          or permission in ('jobs.view', 'tasks.view', 'users.view', 'settings.view', 'plugins.view')
        )
      )
    );
$function$;

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
