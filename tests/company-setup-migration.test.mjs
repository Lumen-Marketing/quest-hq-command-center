import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const migrationsDir = fileURLToPath(new URL('../supabase/migrations/', import.meta.url));
const migrationName = readdirSync(migrationsDir).find((name) => /_company_setup_survey\.sql$/.test(name));

assert.ok(migrationName, 'company setup survey migration must exist');

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

test('setup profiles are tenant scoped, RLS protected, and read-only through the Data API', () => {
  assert.match(sql, /create table public\.company_setup_profiles\s*\(/i);
  assert.match(sql, /company_id text primary key references public\.companies\(id\) on delete cascade/i);
  assert.match(sql, /alter table public\.company_setup_profiles enable row level security/i);
  assert.match(sql, /create index company_setup_profiles_updated_by_idx[\s\S]*on public\.company_setup_profiles\(updated_by\)/i);
  assert.match(sql, /create policy company_setup_profiles_select_admin[\s\S]*app_private\.is_company_admin\(company_id\)/i);
  assert.match(sql, /grant select on table public\.company_setup_profiles to authenticated/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete|all)[^;]*company_setup_profiles[^;]*authenticated/i);
});

test('all setup write RPCs use fixed search paths and active company admin checks', () => {
  for (const name of ['save_company_setup_draft', 'apply_company_setup', 'reset_company_setup']) {
    const body = functionBody(name);
    assert.match(body, /security definer/i, name);
    assert.match(body, /set search_path to ''/i, name);
    assert.match(body, /app_private\.is_company_admin\(target_company_id\)/i, name);
    assert.match(sql, new RegExp(`grant execute on function public\\.${name}\\(`, 'i'), name);
  }
});

test('apply validates bounded plans, known apps, and server-owned role templates', () => {
  const body = functionBody('apply_company_setup');

  assert.match(body, /octet_length\(p_plan::text\)[\s\S]*131072/i);
  assert.match(body, /jsonb_array_length\(p_plan->'workspaces'\)[\s\S]*between 1 and 6/i);
  assert.match(body, /crm_2/);
  assert.match(body, /time_clock/);
  assert.match(body, /cold_caller/);
  assert.match(body, /production_coordinator/);
  assert.doesNotMatch(body, /\b(owner|admin|developer)\b[^\n]*generated role/i);
});

test('apply is idempotent and does not delete live workspaces or business records', () => {
  const body = functionBody('apply_company_setup');

  assert.match(body, /previous_applied_plan/i);
  assert.match(body, /managed_workspaces/i);
  assert.match(body, /on conflict \(workspace_id, plugin_id\) do update/i);
  assert.doesNotMatch(body, /delete from public\.(companies|company_memberships|workspaces|workspace_memberships|contacts|deals|jobs|tasks|files|messages)/i);
  assert.doesNotMatch(body, /truncate/i);
});

test('pipeline replacement is skipped when a workspace contains contacts, quotes, or jobs', () => {
  const body = functionBody('apply_company_setup');

  assert.match(body, /from public\.contacts[\s\S]*workspace_id = target_workspace_id/i);
  assert.match(body, /from public\.deals[\s\S]*workspace_id = target_workspace_id/i);
  assert.match(body, /from public\.jobs[\s\S]*workspace_id = target_workspace_id/i);
  assert.match(body, /pipeline_preserved/i);
});

test('reset only reopens setup and cannot remove tenant or business data', () => {
  const body = functionBody('reset_company_setup');

  assert.match(body, /update public\.company_setup_profiles/i);
  assert.match(body, /answers = '\{\}'::jsonb/i);
  assert.match(body, /draft_plan = '\{\}'::jsonb/i);
  assert.match(body, /status = 'draft'/i);
  assert.match(body, /reset_count = [\w.]*reset_count \+ 1/i);
  assert.doesNotMatch(body, /applied_plan =/i);
  assert.doesNotMatch(body, /delete from|truncate/i);
  assert.doesNotMatch(body, /update public\.(companies|company_memberships|workspaces|contacts|deals|jobs|tasks|files|messages)/i);
});

test('new and existing companies receive a default Main workspace without rewriting current companies', () => {
  assert.match(sql, /function app_private\.ensure_company_default_workspace\(\)/i);
  assert.match(sql, /after insert on public\.companies/i);
  assert.match(sql, /where w\.company_id = p_company_id[\s\S]*w\.is_default[\s\S]*w\.status = 'active'/i);
  assert.match(sql, /where not exists \([\s\S]*from public\.workspaces w[\s\S]*w\.company_id = c\.id[\s\S]*w\.is_default/i);
  assert.doesNotMatch(sql, /update public\.companies/i);
});
