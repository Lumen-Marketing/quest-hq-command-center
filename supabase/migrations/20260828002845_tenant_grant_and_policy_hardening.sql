-- Restore the layers under RLS. No behaviour change for any signed-in user.
--
-- Found by the 2026-08-28 security audit. Nothing here is exploitable today: every tenant
-- table has RLS with a policy, and every one of those policies fails closed when auth.uid()
-- is null. What this migration fixes is that RLS is currently the ONLY thing standing between
-- an anonymous caller and the data. Each part below puts back a layer that was removed by
-- drift rather than by decision, so that a single future mistake is not immediately fatal.
--
-- Three parts, independent of each other:
--   1. The two authorization-kernel functions hardened the way the other two already are.
--   2. Twenty policies moved off the `public` role onto `authenticated`.
--   3. The anon role's legacy blanket table grants revoked.
--
-- REVIEW NOTE: part 3 is the one to read carefully. It is safe because every unauthenticated
-- product surface -- client portals, public proposals, public forms, workspace intake links --
-- is served by a Vercel function using the service role, never by the browser's anon key. The
-- browser only ever queries Supabase directly once a session exists, which makes the caller
-- `authenticated`. Verified against the client at the commit this migration was written.

-- ---------------------------------------------------------------------------------------
-- 1. Authorization kernel: same hardening on all four functions.
-- ---------------------------------------------------------------------------------------
--
-- app_private.is_company_admin and app_private.has_workspace_permission already use
-- `SET search_path = ''` and an explicit `auth.uid() is not null`. These two did not: they
-- carried `SET search_path = 'public', 'pg_temp'` and relied on `NULL = NULL` yielding no
-- rows to fail closed. Both are correct today. Neither should differ from its two siblings --
-- these four functions decide every authorization question in the product, and `pg_temp` on
-- a SECURITY DEFINER search path is the classic object-shadowing hazard.
--
-- Bodies are otherwise reproduced verbatim from live. Every reference was already schema-
-- qualified, which is what makes the empty search path a safe change rather than a rewrite.

create or replace function app_private.is_company_member(target_company_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
  );
$function$;

create or replace function app_private.has_company_permission(target_company_id text, permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
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
      and cm.profile_id = (select auth.uid())
      and cm.status = 'active'
    limit 1
  ),
  assigned as (
    select rp.effect
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    where ura.company_id = target_company_id
      and ura.profile_id = (select auth.uid())
      and (
        rp.permission_key = '*'
        or rp.permission_key in (select permission_key from permission_variants)
      )
  )
  select
    (select auth.uid()) is not null
    and app_private.permission_plugin_available(target_company_id, permission)
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
-- 2. Policies: `TO public` becomes `TO authenticated`.
-- ---------------------------------------------------------------------------------------
--
-- A policy created without a TO clause applies to `public`, which includes `anon`. These
-- twenty were written that way while the rest of the schema uses `authenticated`. Their
-- predicates already refuse an anonymous caller, so this changes no one's access -- it puts
-- back the role-level backstop the other ~250 policies have, so the predicate is not the only
-- thing standing between anon and the row.
--
-- wb_intake_links is the reason this is worth doing rather than noting: it stores intake
-- passcode hashes and salts, under an ALL policy.
--
-- Predicates are copied verbatim from live (pg_policies), not from earlier migrations, so
-- that any later hand-edit to a policy is preserved rather than silently reverted.

-- company_contacts ------------------------------------------------------------------------
drop policy if exists "company contacts read" on public.company_contacts;
create policy "company contacts read" on public.company_contacts
for select to authenticated
using (app_private.is_company_member(company_id));

drop policy if exists "company contacts insert" on public.company_contacts;
create policy "company contacts insert" on public.company_contacts
for insert to authenticated
with check (app_private.has_company_permission(company_id, 'company_contacts.create'));

drop policy if exists "company contacts update" on public.company_contacts;
create policy "company contacts update" on public.company_contacts
for update to authenticated
using (app_private.has_company_permission(company_id, 'company_contacts.edit'))
with check (app_private.has_company_permission(company_id, 'company_contacts.edit'));

drop policy if exists "company contacts delete" on public.company_contacts;
create policy "company contacts delete" on public.company_contacts
for delete to authenticated
using (app_private.has_company_permission(company_id, 'company_contacts.delete'));

-- company_contact_fields ------------------------------------------------------------------
-- The deleted_at predicates are live state from the field recycle-bin work; preserved exactly.
drop policy if exists "company contact fields read" on public.company_contact_fields;
create policy "company contact fields read" on public.company_contact_fields
for select to authenticated
using (deleted_at is null and app_private.is_company_member(company_id));

drop policy if exists "company contact fields insert" on public.company_contact_fields;
create policy "company contact fields insert" on public.company_contact_fields
for insert to authenticated
with check (deleted_at is null and app_private.has_company_permission(company_id, 'company_contacts.fields.manage'));

drop policy if exists "company contact fields update" on public.company_contact_fields;
create policy "company contact fields update" on public.company_contact_fields
for update to authenticated
using (deleted_at is null and app_private.has_company_permission(company_id, 'company_contacts.fields.manage'))
with check (deleted_at is null and app_private.has_company_permission(company_id, 'company_contacts.fields.manage'));

-- company_contact_options -----------------------------------------------------------------
drop policy if exists "company contact options read" on public.company_contact_options;
create policy "company contact options read" on public.company_contact_options
for select to authenticated
using (app_private.is_company_member(company_id));

drop policy if exists "company contact options insert" on public.company_contact_options;
create policy "company contact options insert" on public.company_contact_options
for insert to authenticated
with check (app_private.has_company_permission(company_id, 'company_contacts.fields.manage'));

drop policy if exists "company contact options update" on public.company_contact_options;
create policy "company contact options update" on public.company_contact_options
for update to authenticated
using (app_private.has_company_permission(company_id, 'company_contacts.fields.manage'))
with check (app_private.has_company_permission(company_id, 'company_contacts.fields.manage'));

drop policy if exists "company contact options delete" on public.company_contact_options;
create policy "company contact options delete" on public.company_contact_options
for delete to authenticated
using (app_private.has_company_permission(company_id, 'company_contacts.fields.manage'));

-- company_memberships ---------------------------------------------------------------------
drop policy if exists "members read company memberships" on public.company_memberships;
create policy "members read company memberships" on public.company_memberships
for select to authenticated
using (
  profile_id = (select auth.uid())
  or app_private.is_company_admin(company_id)
  or app_private.is_company_member(company_id)
);

-- profiles --------------------------------------------------------------------------------
drop policy if exists "users update own profile name" on public.profiles;
create policy "users update own profile name" on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check (
  (select auth.uid()) = id
  and role = (app_private.current_profile_row()).role
  and approved = (app_private.current_profile_row()).approved
  and not (supervisor_id is distinct from (app_private.current_profile_row()).supervisor_id)
  and not (company_ids is distinct from (app_private.current_profile_row()).company_ids)
  and not (member_id is distinct from (app_private.current_profile_row()).member_id)
  and not (email is distinct from (app_private.current_profile_row()).email)
);

-- wb_intake_links -------------------------------------------------------------------------
drop policy if exists "managers read intake links" on public.wb_intake_links;
create policy "managers read intake links" on public.wb_intake_links
for select to authenticated
using (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'));

drop policy if exists "managers write intake links" on public.wb_intake_links;
create policy "managers write intake links" on public.wb_intake_links
for all to authenticated
using (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'))
with check (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'));

-- wb_intake_submissions -------------------------------------------------------------------
drop policy if exists "members read intake submissions" on public.wb_intake_submissions;
create policy "members read intake submissions" on public.wb_intake_submissions
for select to authenticated
using (app_private.has_workspace_permission(workspace_id, 'workspaces.view'));

drop policy if exists "managers review intake submissions" on public.wb_intake_submissions;
create policy "managers review intake submissions" on public.wb_intake_submissions
for update to authenticated
using (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'))
with check (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'));

drop policy if exists "managers delete intake submissions" on public.wb_intake_submissions;
create policy "managers delete intake submissions" on public.wb_intake_submissions
for delete to authenticated
using (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'));

-- wb_record_events ------------------------------------------------------------------------
drop policy if exists "members read record events" on public.wb_record_events;
create policy "members read record events" on public.wb_record_events
for select to authenticated
using (app_private.has_workspace_permission(workspace_id, 'workspaces.view'));

drop policy if exists "managers write record events" on public.wb_record_events;
create policy "managers write record events" on public.wb_record_events
for all to authenticated
using (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'))
with check (app_private.has_workspace_permission(workspace_id, 'workspaces.manage'));

-- ---------------------------------------------------------------------------------------
-- 3. The anon role stops holding table privileges it never uses.
-- ---------------------------------------------------------------------------------------
--
-- Supabase bootstraps `grant all on all tables in schema public to anon, authenticated`, and
-- that grant was never narrowed. anon therefore holds SELECT, INSERT, UPDATE, DELETE and
-- TRUNCATE on roughly seventy-five tables -- companies, contacts, jobs, profiles,
-- company_memberships, roles, role_permissions among them. Tables added since roughly August
-- 2026 (wb_intake_*, sms_*, record_history, ringcentral_*) correctly received none, so the
-- practice already changed; only the legacy grants remained.
--
-- Not remotely exploitable: PostgREST issues no TRUNCATE, and every policy refuses a null
-- auth.uid(). The reason to revoke is what happens on the day a table ships with RLS off.
-- Today that table is world-WRITABLE the moment it is created. After this, it is unreachable.
--
-- authenticated and service_role are deliberately untouched.

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

-- And the same for whatever is created next, which is the half that actually stops the drift
-- recurring. Supabase's bootstrap sets these defaults for the postgres role.
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;

-- USAGE on the schema stays: PostgREST needs it to resolve names, and it grants no data
-- access on its own. Removing it changes error messages for anonymous callers without
-- changing what they can reach.
grant usage on schema public to anon;
