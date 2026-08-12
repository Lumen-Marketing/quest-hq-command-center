import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// A worker could read exactly one company_memberships row -- their own -- so every feature
// built on the client-side directory broke at once on a worker account: @mention offered
// only yourself, the Members tile showed one person, and comment authors read "Unknown".

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = join(root, 'supabase', 'migrations');
const FILE = '20260813020000_members_read_company_directory.sql';
const sql = (() => {
  assert.ok(readdirSync(migrationsDir).includes(FILE), `${FILE} is not in the tree`);
  return readFileSync(join(migrationsDir, FILE), 'utf8');
})();

test('an active member of a company can read that company directory', () => {
  assert.match(sql, /create policy "members read company memberships"/);
  assert.match(sql, /for select/);
  assert.match(sql, /or app_private\.is_company_member\(company_id\)/);
});

test('the existing grants are kept, not replaced', () => {
  // Your own row and the admin branch both stay; this only widens SELECT by one clause.
  assert.match(sql, /profile_id = \(select auth\.uid\(\)\)/);
  assert.match(sql, /or app_private\.is_company_admin\(company_id\)/);
});

test('it widens reading only, never writing', () => {
  // insert/update/delete keep their own admin-only policy; nothing here should touch them.
  assert.ok(!/for (insert|update|delete|all)\b/i.test(sql), 'this migration must not grant writes');
  assert.ok(!/with check/i.test(sql), 'a SELECT policy takes no WITH CHECK');
});

test('it is scoped to the reader own companies', () => {
  // is_company_member is SECURITY DEFINER over this same table, which is how the admin
  // branch already works -- so this adds no new recursion, and no cross-company read.
  assert.ok(!/using \(\s*true\s*\)/i.test(sql), 'never a blanket true');
  assert.match(sql, /drop policy if exists "members read company memberships"/, 'replaces cleanly on re-run');
});
