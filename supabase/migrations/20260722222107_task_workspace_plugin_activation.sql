-- Tasks is a company entitlement and an independently configurable workspace
-- plugin. Existing companies already have the entitlement from the Task
-- absorption migration, but that migration did not create workspace_plugins
-- rows. Backfill only missing active-workspace rows so an explicit disabled or
-- installed choice is never overwritten.

insert into public.workspace_plugins (
  workspace_id,
  plugin_id,
  status,
  config,
  installed_by,
  installed_at,
  disabled_at,
  created_at,
  updated_at
)
select
  w.id,
  'tasks',
  'installed',
  cp.config,
  cp.installed_by,
  coalesce(cp.installed_at, now()),
  null,
  now(),
  now()
from public.workspaces w
join public.company_plugins cp on cp.company_id = w.company_id
where w.status = 'active'
  and cp.plugin_id = 'tasks'
  and cp.status = 'installed'
on conflict (workspace_id, plugin_id) do nothing;
