-- An active member can see who else is in their company.
--
-- The old policy was `profile_id = auth.uid() OR is_company_admin(company_id)`, so a
-- worker could read exactly one row: their own. Every colleague-facing feature reads the
-- client-side directory built from this table, so on a worker account all of them broke at
-- once, and each looked like its own bug:
--
--   * @mention offered only yourself, because wbMembers() had nobody else in it
--   * the Members tile showed one person
--   * comment authors fell back to the "Unknown" stand-in wbMemberById returns
--
-- WHAT THIS DOES AND DOES NOT OPEN UP. Membership rows carry company_id, profile_id, role
-- and status -- who is here and what they are. They carry no contact details, no personal
-- data and no business records; profiles are a separate table whose own policy ALREADY lets
-- company peers read each other (shares_active_company). So this closes a gap between two
-- tables that disagreed: you could read a colleague's profile but not learn they were a
-- colleague.
--
-- Scoped to the reader's own companies through is_company_member, which is SECURITY DEFINER
-- over this same table -- the existing admin branch already relies on it, so this adds no
-- new recursion. Nothing here grants write: insert, update and delete keep their own
-- policies and stay admin-only.

drop policy if exists "members read company memberships" on public.company_memberships;

create policy "members read company memberships"
on public.company_memberships
for select
using (
  profile_id = (select auth.uid())
  or app_private.is_company_admin(company_id)
  -- Added: anybody who is themselves an active member of that company.
  or app_private.is_company_member(company_id)
);
