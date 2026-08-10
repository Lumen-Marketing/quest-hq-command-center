import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const migrationsDir = fileURLToPath(new URL('../supabase/migrations/', import.meta.url));
const migrationName = readdirSync(migrationsDir).find((name) => /_workspace_setup_profiles\.sql$/.test(name));

assert.ok(migrationName, 'workspace setup migration must exist');
const sql = readFileSync(join(migrationsDir, migrationName), 'utf8').replace(/\r\n/g, '\n');

function functionBody(name) {
  const start = sql.indexOf(`function public.${name}`);
  assert.notEqual(start, -1, `${name} must exist`);
  const nextFunction = sql.indexOf('\ncreate or replace function ', start + 1);
  const nextGrant = sql.indexOf('\ngrant execute on function ', start + 1);
  const candidates = [nextFunction, nextGrant].filter((index) => index > start);
  const end = candidates.length ? Math.min(...candidates) : sql.length;
  return sql.slice(start, end);
}

test('workspace setup profiles are workspace-keyed and read-only through the Data API', () => {
  assert.match(sql, /create table public\.workspace_setup_profiles\s*\(/i);
  assert.match(sql, /workspace_id uuid primary key references public\.workspaces\(id\) on delete cascade/i);
  assert.match(sql, /alter table public\.workspace_setup_profiles enable row level security/i);
  assert.match(sql, /create policy workspace_setup_profiles_select_admin[\s\S]*app_private\.is_company_admin\(w\.company_id\)/i);
  assert.match(sql, /grant select on table public\.workspace_setup_profiles to authenticated/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete|all)[^;]*workspace_setup_profiles[^;]*authenticated/i);
});

test('workspace setup RPCs derive authorization from the target workspace', () => {
  for (const name of ['save_workspace_setup_draft', 'apply_workspace_setup', 'reset_workspace_setup']) {
    const body = functionBody(name);
    assert.match(body, /security definer/i, name);
    assert.match(body, /set search_path to ''/i, name);
    assert.match(body, /from public\.workspaces w[\s\S]*w\.id = target_workspace_id/i, name);
    assert.match(body, /app_private\.is_company_admin\(target_company_id\)/i, name);
    assert.match(sql, new RegExp(`grant execute on function public\\.${name}\\(`, 'i'), name);
  }
});

test('apply accepts exactly one bounded workspace and preserves manual workspace configuration', () => {
  const body = functionBody('apply_workspace_setup');

  assert.match(body, /octet_length\(p_plan::text\)[\s\S]*131072/i);
  assert.match(body, /jsonb_array_length\(p_plan->'workspaces'\) <> 1/i);
  assert.match(body, /count\(distinct lower\(btrim\(stage\.value\)\)\)/i);
  assert.match(body, /previous_applied_plan/i);
  assert.match(body, /managed_plugins/i);
  assert.match(body, /plugin_id = any\(previous_managed_plugins\)/i);
  assert.match(body, /pipeline_preserved/i);
  assert.match(body, /from public\.contacts[\s\S]*workspace_id = target_workspace_id/i);
  assert.match(body, /from public\.deals[\s\S]*workspace_id = target_workspace_id/i);
  assert.match(body, /from public\.jobs[\s\S]*workspace_id = target_workspace_id/i);
  assert.doesNotMatch(body, /delete from public\.(companies|company_memberships|workspaces|workspace_memberships|contacts|deals|jobs|tasks|files|messages)/i);
  assert.doesNotMatch(body, /truncate/i);
  assert.match(body, /'plugin_count', cardinality\(requested_plugins\)/i);
});

test('reset clears only the selected workspace answers and keeps its applied setup', () => {
  const body = functionBody('reset_workspace_setup');

  assert.match(body, /update public\.workspace_setup_profiles/i);
  assert.match(body, /answers = '\{\}'::jsonb/i);
  assert.match(body, /draft_plan = '\{\}'::jsonb/i);
  assert.match(body, /status = 'draft'/i);
  assert.match(body, /reset_count = [\w.]*reset_count \+ 1/i);
  assert.doesNotMatch(body, /applied_plan =/i);
  assert.doesNotMatch(body, /delete from|truncate/i);
});

test('blank operational workspaces are created without active plugins', () => {
  assert.match(sql, /function app_private\.plugin_ids_for_preset\(preset_code text\)/i);
  assert.match(sql, /when 'blank' then array\[\]::text\[\]/i);
});
