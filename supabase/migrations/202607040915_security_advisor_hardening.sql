-- Deploy-readiness security hardening for findings raised by the Supabase
-- database linter. All changes are idempotent and reversible.

-- 1) v_pricebook_material_best ran as SECURITY DEFINER (ERROR-level lint),
--    bypassing the caller's RLS. Switch to security_invoker so it enforces the
--    querying member's company-scoped RLS on pricebook_vendor_prices.
alter view public.v_pricebook_material_best set (security_invoker = on);

-- 2) The public `avatars` bucket had a broad SELECT policy on storage.objects
--    that let any client LIST every avatar object across companies. Public
--    buckets serve objects by public URL without it (the app uses getPublicUrl),
--    so remove the listing policy. Insert/update/delete policies stay in place.
drop policy if exists "users read avatar objects" on storage.objects;

-- 3) Close the anon-callable surface on SECURITY DEFINER functions. EXECUTE
--    defaults to PUBLIC (which includes anon), so we revoke from PUBLIC and
--    re-grant only the roles that should call each. Both are internally guarded,
--    but this removes needless unauthenticated attack surface on the RPC API.
--    delete_company_workspace: owners (authenticated) legitimately call it.
revoke execute on function public.delete_company_workspace(text) from public, anon;
grant execute on function public.delete_company_workspace(text) to authenticated;
--    sync_team_member_from_profile: a trigger function; no role should RPC it
--    (triggers still fire regardless of EXECUTE grants).
revoke execute on function public.sync_team_member_from_profile() from public, anon, authenticated;

-- 4) clients and job_activity had RLS enabled but zero policies (deny-all).
--    They're currently unused; add company-scoped policies so any future use
--    fails at the correct tenant boundary instead of silently returning nothing.
drop policy if exists "members access clients" on public.clients;
create policy "members access clients" on public.clients for all to authenticated
  using (app_private.is_company_member(company_id))
  with check (app_private.is_company_member(company_id));

drop policy if exists "members access job activity" on public.job_activity;
create policy "members access job activity" on public.job_activity for all to authenticated
  using (exists (
    select 1 from public.jobs j
    where j.id = job_activity.job_id and app_private.is_company_member(j.company_id)
  ))
  with check (exists (
    select 1 from public.jobs j
    where j.id = job_activity.job_id and app_private.is_company_member(j.company_id)
  ));
