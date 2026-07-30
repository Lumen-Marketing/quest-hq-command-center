-- Admins could manage the company but not use it.
--
-- app_private.is_company_admin treats owner/admin/developer as the elevated roles, and
-- every company-management gate uses it. app_private.has_company_permission, which every
-- feature policy uses, blanket-allowed only owner/developer — so a company Admin could
-- create workspaces and edit roles yet be refused by RLS when sending a message or filing
-- a report, unless someone had granted them each permission by hand.
--
-- Aligning the two is the smaller, safer half of the fix: it widens access only for a role
-- the product already treats as elevated, and only within companies where that person is
-- already an active admin. The client half (src/main.js `can`) stops falling back to a
-- static role table so the UI no longer offers actions RLS will refuse.

create or replace function app_private.has_company_permission(target_company_id text, permission text)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  with membership as (
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
      and (rp.permission_key = permission or rp.permission_key = '*')
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
