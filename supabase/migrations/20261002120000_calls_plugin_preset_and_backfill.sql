-- Entitle 'calls' where the company was entitled to everything else in its preset.
--
-- THE BUG THIS FIXES
--
-- The Calls module reached the catalog (src/workspaces/plugin-catalog.js) and the database
-- allowlist (202607231200_ringcentral_calls.sql:240) but was never added to a plugin preset,
-- in the client or in the database. So a company created from any preset has no
-- company_plugins row for 'calls' at all.
--
-- That made the settings card lie. src/settings/plugins-panel.js treated only a row whose
-- status is literally 'disabled' as withheld, so a MISSING row rendered as "Available" with a
-- bright Activate button. Clicking it reached setWorkspacePlugin (src/main.js), which refuses
-- anything that is not already 'installed', and answered:
--
--   "This company account is not entitled to that plugin."
--
-- The button promised something the handler could not deliver. The card-side check is fixed in
-- the same change; this migration fixes the data that made the case reachable at all.
--
-- WHY THE PRESET FUNCTION IS REPLACED WHOLESALE
--
-- Nine migrations have replaced app_private.plugin_ids_for_preset; the deployed copy is the last
-- one (20260812140000_baseline_workspace_builder_plugin.sql:34), which composes a baseline with
-- a per-preset list rather than returning a literal. It is reproduced here with 'calls' added and
-- nothing else changed, so this does not silently roll the definition back to an earlier one.
--
-- WHERE THE BACKFILL DOES AND DOES NOT APPLY
--
-- Applies: companies whose preset already contained the plugins this adds alongside. They were
-- clearly entitled to the same bundle and only missed this one entry.
--
-- Deliberately does NOT apply: a company with a 'disabled' row, which is somebody having made a
-- decision, and a company on the 'blank' preset, which is somebody having chosen nothing. Both
-- keep the card's "not enabled yet" state and can be turned on deliberately.
--
-- An existing company with a 'disabled' row is also the reason this cannot be a blanket insert:
-- honouring it is the entire point of having a status column.

-- 1. New companies get 'calls' in the preset.
create or replace function app_private.plugin_ids_for_preset(preset_code text)
returns text[]
language sql
stable
set search_path to ''
as $$
  select array(
    select distinct unnest(
      app_private.baseline_plugin_ids() ||
      case lower(trim(coalesce(preset_code, 'generic')))
        when 'blank' then array[]::text[]
        when 'roofing' then array['crm_2', 'underwriter', 'price_book', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting', 'calls', 'tasks']::text[]
        when 'construction' then array['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting', 'calls', 'tasks']::text[]
        else array['crm', 'files', 'messages', 'workspace_builder', 'calls', 'tasks']::text[]
      end
    )
    -- Deterministic, because create_company_workspace records this list in audit_events.
    order by 1
  );
$$;

-- 2. Existing companies that were already entitled to the siblings get the row.
--
-- 'roofing' is the reported case, and the company's id is the seeded one. A real company that
-- slugs itself to 'quest-roofing' keeps that raw id (canonicalCompanyId aliases only when no
-- real company owns the raw value), so matching on the preset's plugins rather than on a literal
-- id covers both without having to guess which this is.
insert into public.company_plugins (company_id, plugin_id, status, installed_at, updated_at)
select cp.company_id, 'calls', 'installed', now(), now()
  from public.company_plugins cp
 where cp.status = 'installed'
   -- Every roofing sibling, so a company on the construction or generic preset is not swept in.
   and cp.plugin_id in ('crm_2', 'underwriter', 'price_book')
   -- Never overwrite a decision somebody already made.
   and not exists (
     select 1 from public.company_plugins existing
      where existing.company_id = cp.company_id
        and existing.plugin_id = 'calls'
   )
 group by cp.company_id
having count(*) = 3;

-- 3. The other two presets, for a company entitled to the full set of their siblings.
insert into public.company_plugins (company_id, plugin_id, status, installed_at, updated_at)
select cp.company_id, 'calls', 'installed', now(), now()
  from public.company_plugins cp
 where cp.status = 'installed'
   and cp.plugin_id in ('files', 'forms', 'finance', 'messages', 'calendar', 'time_clock')
   and not exists (
     select 1 from public.company_plugins existing
      where existing.company_id = cp.company_id
        and existing.plugin_id = 'calls'
   )
 group by cp.company_id
having count(*) = 6;

-- 4. Companies already carrying a deliberate row keep it; only note the shape for review.
--    This returns nothing on a database where nothing was withheld, which is the expected case.
select company_id,
       'calls' as plugin_id,
       status
  from public.company_plugins
 where plugin_id = 'calls'
   and status = 'disabled'
 order by company_id;
