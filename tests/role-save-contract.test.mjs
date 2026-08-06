import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// save_company_role branches on whether p_role carries an id: present means "update the row
// with this id", absent means "insert". The client minted a fresh UUID for a new role and
// sent it anyway, so creation took the update branch, matched no row, and raised
// 'role not found'. No custom role could be created from 2026-07-10 until this was fixed --
// and the failure was near-silent, because the handler set the sync chip without a toast.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');

const migrations = readdirSync(join(root, 'supabase', 'migrations'))
  .filter((name) => name.endsWith('.sql'))
  .map((name) => readFileSync(join(root, 'supabase', 'migrations', name), 'utf8'))
  .filter((sql) => sql.includes('function public.save_company_role'));

function saveRoleBody() {
  const at = main.indexOf('async function saveRole(formNode)');
  assert.notEqual(at, -1, 'saveRole should exist');
  return main.slice(at, main.indexOf('\nasync function deleteRole', at));
}

test('the server still distinguishes insert from update by the id it is given', () => {
  // If this stops being true the client rule below is no longer the right one.
  assert.ok(migrations.length, 'save_company_role should be defined by a migration');
  const sql = migrations[migrations.length - 1];
  assert.match(sql, /if nullif\(p_role->>'id', ''\) is not null then v_id := \(p_role->>'id'\)::uuid; end if;/);
  assert.match(sql, /if v_id is null then\s*\n\s*insert into public\.roles/);
  assert.match(sql, /raise exception 'role not found'/);
});

test('a new role is sent without an id, so the database inserts it', () => {
  const body = saveRoleBody();
  assert.match(body, /p_role: existing \? role : \{ \.\.\.role, id: '' \}/);
  // The locally minted id is still needed for the offline branch, so it stays on `role`.
  assert.match(body, /id: existing \? existing\.id : crypto\.randomUUID\(\)/);
});

test('an existing role keeps its id, so the database updates it', () => {
  const body = saveRoleBody();
  assert.ok(/p_role: existing \? role/.test(body), 'editing must still reach the update branch');
});

test('a failed role save says so instead of looking like a success', () => {
  const body = saveRoleBody();
  const failure = body.slice(body.indexOf('if (result.error)'));
  assert.match(failure, /showToast\(result\.error\.message \|\| 'Role save failed\.', 'local', 'Roles'\)/);
});
