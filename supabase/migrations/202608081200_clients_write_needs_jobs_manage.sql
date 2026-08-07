-- public.clients was the one tenant table whose write policy consulted nothing but company
-- membership: a single ALL policy with `is_company_member(company_id)` on both sides. Any
-- active member -- a Viewer, a field worker, anyone -- could insert, edit and delete client
-- records for their whole company.
--
-- Every QA pass so far ran as an Owner, who holds every permission, so a table gated on
-- membership alone and a table gated correctly behave identically under test. This is the
-- class of gap that testing as Owner cannot see, which is why it was found by auditing the
-- policy expressions rather than by clicking through the app.
--
-- The table is currently empty and no client code reads or writes it, but public.jobs has a
-- foreign key into it, so it is reachable and not dead. Gated on the surface it belongs to:
-- jobs.view to read, jobs.manage to change.

drop policy if exists "members access clients" on public.clients;

drop policy if exists "clients visible to job viewers" on public.clients;
create policy "clients visible to job viewers"
on public.clients
for select
to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'jobs.view')
);

drop policy if exists "clients written by job managers" on public.clients;
create policy "clients written by job managers"
on public.clients
for insert
to authenticated
with check (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'jobs.manage')
);

drop policy if exists "clients edited by job managers" on public.clients;
create policy "clients edited by job managers"
on public.clients
for update
to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'jobs.manage')
)
with check (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'jobs.manage')
);

drop policy if exists "clients removed by job managers" on public.clients;
create policy "clients removed by job managers"
on public.clients
for delete
to authenticated
using (
  app_private.is_company_member(company_id)
  and app_private.has_company_permission(company_id, 'jobs.manage')
);
