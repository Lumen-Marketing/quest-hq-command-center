-- Managers can delete client portals and their plan documents.
--
-- The original client-portal migrations shipped INSERT/SELECT/UPDATE policies for
-- these tables but no DELETE policy. With RLS enabled, a DELETE with no matching
-- policy is silently blocked (0 rows affected, no error), so the app removed the row
-- locally but it reappeared on refresh when data reloaded from the database.
--
-- (client_portal_annotations already had a manager DELETE policy; client_portal_events
-- rows are removed via ON DELETE CASCADE when their portal is deleted.)

create policy "managers delete client portals"
  on public.client_portals for delete
  to authenticated
  using (
    app_private.is_company_member(company_id)
    and app_private.subscription_allows_access(company_id)
    and app_private.has_company_permission(company_id, 'client_portals.manage'::text)
  );

create policy "managers delete portal documents"
  on public.client_portal_documents for delete
  to authenticated
  using (
    app_private.is_company_member(company_id)
    and app_private.subscription_allows_access(company_id)
    and app_private.has_company_permission(company_id, 'client_portals.manage'::text)
  );
