-- Allow the new 'price_book' plugin id in company_plugins so it can be installed per company.
alter table public.company_plugins drop constraint if exists company_plugins_known_plugin_check;
alter table public.company_plugins add constraint company_plugins_known_plugin_check
  check (plugin_id = any (array[
    'crm','crm_2','underwriter','files','client_portal','workspace_builder',
    'forms','finance','messages','calendar','time_clock','approvals','reporting','price_book'
  ]));
