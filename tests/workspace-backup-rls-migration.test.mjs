import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationUrl = new URL('../supabase/migrations/20260820190142_restrict_workspace_backups_to_settings_managers.sql', import.meta.url);

test('workspace backup payloads are protected by one settings-manager RLS policy', async () => {
  const sql = await readFile(migrationUrl, 'utf8');
  assert.match(sql, /drop policy if exists "members read company backups"/i);
  assert.match(sql, /drop policy if exists "admins manage company backups"/i);
  assert.match(sql, /create policy "settings managers manage company backups"[\s\S]*for all[\s\S]*settings\.manage/is);
  assert.match(sql, /with check[\s\S]*settings\.manage/is);
  assert.equal((sql.match(/create policy/gi) || []).length, 1);
  assert.doesNotMatch(sql, /company_memberships[\s\S]*status\s*=\s*'active'/i);
});
