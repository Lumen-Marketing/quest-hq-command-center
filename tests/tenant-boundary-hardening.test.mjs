import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = new URL(
  '../supabase/migrations/20260903175607_tighten_profile_and_notification_boundaries.sql',
  import.meta.url,
);

test('profile access changes stay in company-scoped membership RPCs', async () => {
  const sql = await readFile(migration, 'utf8');

  assert.match(sql, /create policy "profiles update own"/i);
  assert.doesNotMatch(sql, /create policy "profiles update own or managed"/i);
  assert.doesNotMatch(sql, /can_manage_roles\s*\(\s*\)/i);
  assert.match(sql, /revoke delete, truncate on table public\.profiles from authenticated/i);

  for (const field of ['role', 'approved', 'supervisor_id', 'company_ids', 'member_id', 'email']) {
    assert.match(sql, new RegExp(`\\b${field}\\b[\\s\\S]{0,100}current_profile_row`, 'i'));
  }
});

test('notification sends cannot use a global profile role or cross-company task', async () => {
  const sql = await readFile(migration, 'utf8');
  const policy = sql.split('create policy "active members insert company notifications"')[1] || '';

  assert.doesNotMatch(policy, /current_profile_role\s*\(/i);
  assert.match(policy, /app_private\.is_company_member\(company_id\)/i);
  assert.match(policy, /recipient_membership\.status = 'active'/i);
  assert.match(policy, /source_task\.creator_id = current_member_id\(\)/i);
  assert.match(policy, /source_task\.company_id = any\(recipient_member\.company_ids\)/i);
  assert.match(policy, /notifications\.company_id = source_task\.company_id/i);
  assert.match(policy, /recipient_profile\.member_id = notifications\.member_id/i);
});

test('legacy notification updates cannot be redirected into another profile inbox', async () => {
  const sql = await readFile(migration, 'utf8');
  const policy = sql.split('create policy "notification recipients update own rows"')[1] || '';

  assert.match(policy, /member_id = current_member_id\(\)/i);
  assert.match(policy, /recipient_profile_id is null or recipient_profile_id = \(select auth\.uid\(\)\)/i);
  assert.match(policy, /company_id is null or app_private\.is_company_member\(company_id\)/i);
});
