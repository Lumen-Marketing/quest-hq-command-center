-- The earlier rename updated company_plugins but not workspace_plugins, leaving a row
-- pointing at a plugin id nothing recognises any more.
--
-- That mattered more than it looks: workspacePluginStatus treats "company entitled but no
-- workspace row" as NOT installed, so Company Records was hidden in every workspace nobody
-- had explicitly installed it in -- which is the opposite of "shared by every workspace".
-- The lasting fix is the companyWide flag in the plugin catalog; this just clears the row
-- that was left behind.
--
-- Deleted rather than renamed where both exist: companyWide means a row no longer decides
-- availability, and a stale 'installed' row would only mislead. Where only the old row
-- exists it is renamed, so a deliberate choice survives.
update public.workspace_plugins w
set plugin_id = 'company_records'
where w.plugin_id = 'company_contacts'
  and not exists (
    select 1 from public.workspace_plugins other
    where other.workspace_id = w.workspace_id and other.plugin_id = 'company_records'
  );

delete from public.workspace_plugins where plugin_id = 'company_contacts';
