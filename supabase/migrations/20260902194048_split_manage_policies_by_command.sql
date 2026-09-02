-- An ALL policy also participates in SELECT. Each table below already has a dedicated read
-- policy, so the overlapping ALL policy made Postgres evaluate two permissive expressions on
-- every read. Split the write arm by command and leave the established read policy unchanged.
do $migration$
declare
  rule record;
begin
  for rule in
    select * from (values
      (
        'company_memberships',
        'admins manage company memberships',
        'admins manage company memberships',
        'app_private.is_company_admin(company_id)'
      ),
      (
        'company_plugins',
        'admins manage company plugins',
        'admins manage company plugins',
        '(app_private.is_company_admin(company_id) or app_private.is_quest_admin())'
      ),
      (
        'field_permissions',
        'admins manage field permissions',
        'admins manage field permissions',
        'app_private.is_company_admin(company_id)'
      ),
      (
        'resource_acl',
        'admins manage resource acl',
        'admins manage resource acl',
        'app_private.is_company_admin(company_id)'
      ),
      (
        'role_permissions',
        'role managers manage role permissions',
        'role managers manage role permissions',
        '(exists (select 1 from public.roles r where r.id = role_permissions.role_id and app_private.has_company_permission(r.company_id, ''roles.manage''::text)))'
      ),
      (
        'roles',
        'role managers manage roles',
        'role managers manage roles',
        'app_private.has_company_permission(company_id, ''roles.manage''::text)'
      ),
      (
        'user_role_assignments',
        'admins manage role assignments',
        'admins manage role assignments',
        'app_private.is_company_admin(company_id)'
      ),
      (
        'wb_intake_links',
        'managers write intake links',
        'managers write intake links',
        'app_private.has_workspace_permission(workspace_id, ''workspaces.manage''::text)'
      ),
      (
        'wb_record_events',
        'managers write record events',
        'managers write record events',
        'app_private.has_workspace_permission(workspace_id, ''workspaces.manage''::text)'
      ),
      (
        'workspace_backup_copies',
        'platform admins manage backup copies',
        'platform admins manage backup copies',
        'app_private.is_quest_admin()'
      )
    ) as policies(table_name, old_policy_name, new_policy_stem, predicate)
  loop
    execute format('drop policy if exists %I on public.%I', rule.old_policy_name, rule.table_name);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (%s)',
      rule.new_policy_stem || ' insert', rule.table_name, rule.predicate
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (%s) with check (%s)',
      rule.new_policy_stem || ' update', rule.table_name, rule.predicate, rule.predicate
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (%s)',
      rule.new_policy_stem || ' delete', rule.table_name, rule.predicate
    );
  end loop;
end
$migration$;
