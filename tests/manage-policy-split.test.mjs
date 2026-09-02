import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = new URL('../supabase/migrations/20260902194048_split_manage_policies_by_command.sql', import.meta.url);

test('manage policies are split into writes while dedicated reads remain intact', async () => {
  const sql = await readFile(migration, 'utf8');
  const tables = [
    'company_memberships', 'company_plugins', 'field_permissions', 'resource_acl',
    'role_permissions', 'roles', 'user_role_assignments', 'wb_intake_links',
    'wb_record_events', 'workspace_backup_copies',
  ];
  for (const table of tables) assert.match(sql, new RegExp(`'${table}'`));
  assert.match(sql, /for insert to authenticated with check/i);
  assert.match(sql, /for update to authenticated using/i);
  assert.match(sql, /for delete to authenticated using/i);
  assert.doesNotMatch(sql, /create policy[^\n]+for all/i);
});
