-- Backup rows contain full company snapshots: contacts, jobs, messages, roles,
-- memberships, permissions, and Workspace Builder state. Ordinary active
-- membership is not sufficient authority to read or restore that payload.
drop policy if exists "members read company backups" on public.workspace_backups;
drop policy if exists "admins manage company backups" on public.workspace_backups;

-- One FOR ALL policy covers both reads and mutations without creating two
-- permissive SELECT policies whose conditions would be ORed by PostgreSQL.
create policy "settings managers manage company backups"
on public.workspace_backups
for all
to authenticated
using (
  app_private.has_company_permission(workspace_backups.company_id, 'settings.manage')
)
with check (
  app_private.has_company_permission(workspace_backups.company_id, 'settings.manage')
);
