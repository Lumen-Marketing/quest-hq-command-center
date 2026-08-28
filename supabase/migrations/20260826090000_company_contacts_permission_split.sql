-- Split company_contacts.manage into the four powers it was bundling.
--
-- One checkbox granted all of: file a new contact, edit an existing one, delete one, and
-- restructure the contact SCHEMA. Those are not the same risk. Deleting a Company Contacts
-- field is a hard delete with no recycle bin (see .ai/known-issues.md) that has already cost
-- one company its entire field set, while "file a new contact" is what an ordinary worker
-- does every time a Workspace button sends a lead to the directory.
--
-- Because they shared a key, letting a worker file a lead also handed them the power to
-- destroy the directory's structure. That is the reason a Worker role pressing "Lead" got
-- "could not be filed in Company Contacts": the only permission that would have let them do
-- it was one nobody sensibly grants a worker.
--
-- Backwards compatible on purpose. The shared permission resolver maps each new key back to
-- the legacy super-grant, so every existing role keeps its access and server actions use the
-- same variants as the browser. An administrator who wants fine control simply stops granting
-- company_contacts.manage and grants the specific keys instead.
--
-- Deny keeps precedence over allow across both variants, matching src/main.js can(). The one
-- existing SECURITY DEFINER resolver is replaced in place; no privileged surface is added.

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

-- ---------------------------------------------------------------------------------------
-- Contacts themselves: create / edit / delete are now separable.
-- ---------------------------------------------------------------------------------------

drop policy if exists "company contacts insert" on public.company_contacts;
create policy "company contacts insert" on public.company_contacts
for insert with check (
  app_private.has_company_permission(company_id, 'company_contacts.create')
);

drop policy if exists "company contacts update" on public.company_contacts;
create policy "company contacts update" on public.company_contacts
for update using (
  app_private.has_company_permission(company_id, 'company_contacts.edit')
)
with check (
  app_private.has_company_permission(company_id, 'company_contacts.edit')
);

drop policy if exists "company contacts delete" on public.company_contacts;
create policy "company contacts delete" on public.company_contacts
for delete using (
  app_private.has_company_permission(company_id, 'company_contacts.delete')
);

-- Reading is unchanged: any active member of the company may read the directory, which is
-- what "company_contacts.view" already expresses at the UI layer.

-- ---------------------------------------------------------------------------------------
-- The schema behind the directory: field definitions, their options, and the contact types.
-- This is the half that is unrecoverable when it goes wrong, so it gets its own key.
-- ---------------------------------------------------------------------------------------

drop policy if exists "company contact fields write" on public.company_contact_fields;
create policy "company contact fields write" on public.company_contact_fields
for all using (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
)
with check (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
);

-- This table began as company_contact_types and was renamed to company_contact_options in
-- 20260813210000. Use its current name so a fresh migration and the live catalog agree.
drop policy if exists "company contact options write" on public.company_contact_options;
create policy "company contact options write" on public.company_contact_options
for all using (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
)
with check (
  app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
);

-- app_private.permission_plugin_ids already maps 'company_contacts.%' onto the
-- company_contacts plugin, so every new key inherits the module gate with no change here.
