-- Address tenancy-specific performance advisor findings without changing access.

create index if not exists workspaces_created_by_idx on public.workspaces(created_by);
create index if not exists workspace_memberships_assigned_by_idx on public.workspace_memberships(assigned_by);
create index if not exists workspace_plugins_installed_by_idx on public.workspace_plugins(installed_by);

-- The former FOR ALL policies overlapped the member SELECT policies. Keep the
-- same administrator mutations while evaluating only one SELECT policy.
drop policy if exists "workspace admins manage memberships" on public.workspace_memberships;
drop policy if exists "workspace admins insert memberships" on public.workspace_memberships;
drop policy if exists "workspace admins update memberships" on public.workspace_memberships;
drop policy if exists "workspace admins delete memberships" on public.workspace_memberships;

create policy "workspace admins insert memberships" on public.workspace_memberships
for insert to authenticated
with check (app_private.is_workspace_admin(workspace_id));

create policy "workspace admins update memberships" on public.workspace_memberships
for update to authenticated
using (app_private.is_workspace_admin(workspace_id))
with check (app_private.is_workspace_admin(workspace_id));

create policy "workspace admins delete memberships" on public.workspace_memberships
for delete to authenticated
using (app_private.is_workspace_admin(workspace_id));

drop policy if exists "workspace admins manage plugins" on public.workspace_plugins;
drop policy if exists "workspace admins insert plugins" on public.workspace_plugins;
drop policy if exists "workspace admins update plugins" on public.workspace_plugins;
drop policy if exists "workspace admins delete plugins" on public.workspace_plugins;

create policy "workspace admins insert plugins" on public.workspace_plugins
for insert to authenticated
with check (app_private.is_workspace_admin(workspace_id));

create policy "workspace admins update plugins" on public.workspace_plugins
for update to authenticated
using (app_private.is_workspace_admin(workspace_id))
with check (app_private.is_workspace_admin(workspace_id));

create policy "workspace admins delete plugins" on public.workspace_plugins
for delete to authenticated
using (app_private.is_workspace_admin(workspace_id));
