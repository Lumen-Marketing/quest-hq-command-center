-- Two P1s from the 2026-08-04 production QA.
--
-- 1. Expired cleared tasks could not be purged: HTTP 403, "permission denied for table
--    tasks". A correctly scoped DELETE policy exists for `authenticated` -- workspace
--    membership plus tasks.manage -- but the table GRANT was never given, so the request
--    failed at the permission layer before RLS was ever consulted.
--
--    `anon` meanwhile HAD the DELETE grant, which is the wrong way round. No policy grants
--    anon anything, so nothing could actually be deleted through it, but an unused grant on
--    a public role is not something to leave lying around.
--
-- 2. Tasks onboarding and profile saves failed with "infinite recursion detected in policy
--    for relation profiles". The `users update own profile name` policy pins six columns to
--    their current values so someone cannot escalate their own role -- correct intent -- but
--    it read those values with six `SELECT ... FROM profiles` subqueries. Reading profiles
--    inside a policy on profiles re-enters policy evaluation, and Postgres stops it.
--
--    The fix is the pattern this schema already uses elsewhere (current_profile_role,
--    can_manage_roles): read through a SECURITY DEFINER function owned by the table owner.
--    profiles does not have FORCE ROW LEVEL SECURITY, so RLS does not apply inside such a
--    function and the cycle is broken. The guarantee is unchanged -- the same six columns
--    are still pinned to the same values.

-- ---- 1. tasks DELETE -------------------------------------------------------------------
grant delete on public.tasks to authenticated;
revoke delete on public.tasks from anon;

-- ---- 2. profiles policy recursion -------------------------------------------------------
create or replace function app_private.current_profile_row()
returns public.profiles
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
  select p.* from public.profiles p where p.id = (select auth.uid());
$$;

revoke all on function app_private.current_profile_row() from public, anon;
grant execute on function app_private.current_profile_row() to authenticated;

drop policy if exists "users update own profile name" on public.profiles;

create policy "users update own profile name"
on public.profiles
for update
using ((select auth.uid()) = id)
with check (
  (select auth.uid()) = id
  -- The same six columns as before, pinned to the same values. Only the way they are read
  -- has changed. IS DISTINCT FROM is kept for the nullable ones so a NULL compares equal to
  -- a NULL rather than to nothing.
  and role = (app_private.current_profile_row()).role
  and approved = (app_private.current_profile_row()).approved
  and not (supervisor_id is distinct from (app_private.current_profile_row()).supervisor_id)
  and not (company_ids is distinct from (app_private.current_profile_row()).company_ids)
  and not (member_id is distinct from (app_private.current_profile_row()).member_id)
  and not (email is distinct from (app_private.current_profile_row()).email)
);
