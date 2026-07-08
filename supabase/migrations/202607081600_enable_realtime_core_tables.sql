-- Enable Supabase Realtime on the core data tables so the app can live-update
-- without a manual refresh. RLS still applies to realtime: each user only
-- receives change events for rows they are allowed to read.
--
-- Idempotent: only adds a table if it exists and isn't already in the
-- supabase_realtime publication (messages/message_attachments were already added
-- for the messaging feature).

do $$
declare t text;
begin
  foreach t in array array[
    'jobs','tasks','contacts','accounts','deals','pipeline_stages','crm_sites','proposal_documents',
    'forms','form_responses','finance_invoices','finance_payments','finance_expenses','finance_vendors',
    'job_files','client_portals','client_portal_documents','client_portal_annotations','client_portal_events',
    'calendar_events','notifications','workspace_builder_state','pricebook_vendors','pricebook_materials',
    'pricebook_prices','team_members','company_memberships','recycle_bin_items','recycle_bin',
    'company_subscriptions','user_role_assignments','role_permissions','roles','sites'
  ] loop
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=t)
       and not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
