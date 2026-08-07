-- You can see the name of somebody in your own company.
--
-- The Users page showed teammates as raw account ids -- "31a52568 5e3a 4448 Aa44 ..." -- to
-- some viewers and as real names to others, in the same company. The cause is two parallel
-- role systems. Reading another profile was gated by can_view_team(), which checks
-- profiles.role: a LEGACY per-account field, unrelated to company_memberships.role. A company
-- OWNER whose legacy role is still 'member' therefore could not read a single teammate's
-- profile, and every row fell back to titleCase(profile_id).
--
-- Membership in the same company is the honest test, and it is also tighter than what it
-- replaces: a legacy 'admin' could read every approved profile on the platform, including
-- people in companies they have nothing to do with. Now visibility is: yourself, anybody you
-- share an active company with, and platform admins.

-- SECURITY DEFINER so the lookup does not re-enter the policies on company_memberships,
-- which would recurse.
create or replace function app_private.shares_active_company(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.company_memberships me
    join public.company_memberships them on them.company_id = me.company_id
    where me.profile_id = (select auth.uid())
      and me.status = 'active'
      and them.profile_id = target_profile_id
      and them.status = 'active'
  );
$function$;

revoke all on function app_private.shares_active_company(uuid) from public;
grant execute on function app_private.shares_active_company(uuid) to authenticated;

drop policy if exists "team viewers read profiles" on public.profiles;
drop policy if exists "users read own profile" on public.profiles;

create policy "profiles readable to self, company peers and platform"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or app_private.shares_active_company(id)
  or app_private.is_quest_admin()
);
