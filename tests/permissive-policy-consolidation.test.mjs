import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = new URL('../supabase/migrations/20260902193803_consolidate_permissive_policies.sql', import.meta.url);

test('notification policy consolidation preserves both recipient authorization models', async () => {
  const sql = await readFile(migration, 'utf8');
  assert.match(sql, /recipient_profile_id\s*=\s*\(select auth\.uid\(\)\)/i);
  assert.match(sql, /member_id\s*=\s*current_member_id\(\)/i);
  assert.equal((sql.match(/create policy [^\n]+\non public\.notifications/gi) || []).length, 4);
});

test('profile update consolidation keeps self-service fields immutable', async () => {
  const sql = await readFile(migration, 'utf8');
  assert.match(sql, /create policy "profiles update own or managed"/i);
  assert.match(sql, /role = \(app_private\.current_profile_row\(\)\)\.role/i);
  assert.match(sql, /approved = \(app_private\.current_profile_row\(\)\)\.approved/i);
  for (const field of ['supervisor_id', 'company_ids', 'member_id', 'email']) {
    assert.match(sql, new RegExp(`not \\(${field} is distinct from`, 'i'));
  }
  assert.match(sql, /can_manage_roles\(\)/i);
});
