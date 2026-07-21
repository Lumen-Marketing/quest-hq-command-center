import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migrationPath = new URL('../supabase/migrations/202607211200_company_operational_workspaces.sql', import.meta.url);
const sql = readFileSync(migrationPath, 'utf8');

test('migration creates operational workspaces, memberships, and plugins with explicit API access', () => {
  for (const table of ['workspaces', 'workspace_memberships', 'workspace_plugins']) {
    assert.match(sql, new RegExp(`create table(?: if not exists)? public\\.${table}`, 'i'));
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  }
  assert.match(sql, /grant select, insert, update, delete on public\.workspaces, public\.workspace_memberships, public\.workspace_plugins to authenticated;/i);
  assert.doesNotMatch(sql, /grant .*workspace_(?:memberships|plugins).* to anon/i);
});

test('migration backfills a default workspace, access, plugins, and every pipeline record', () => {
  assert.match(sql, /insert into public\.workspaces[\s\S]*select[\s\S]*from public\.companies/i);
  assert.match(sql, /insert into public\.workspace_memberships[\s\S]*from public\.company_memberships/i);
  assert.match(sql, /insert into public\.workspace_plugins[\s\S]*from public\.company_plugins/i);
  for (const table of [
    'accounts', 'contacts', 'crm_sites', 'deals', 'activities', 'jobs', 'tasks',
    'pipeline_stages', 'underwriting_cases', 'job_files', 'proposal_documents',
  ]) {
    assert.match(sql, new RegExp(`alter table public\\.${table}[\\s\\S]*add column if not exists workspace_id uuid`, 'i'), `${table} must gain workspace_id`);
    assert.match(sql, new RegExp(`update public\\.${table}[\\s\\S]*set workspace_id`, 'i'), `${table} must be backfilled`);
    assert.match(sql, new RegExp(`alter table public\\.${table}[\\s\\S]*alter column workspace_id set not null`, 'i'), `${table} must reject null workspace ids after backfill`);
  }
});

test('authorization helpers are private, fixed-search-path, and membership based', () => {
  for (const fn of ['is_workspace_member', 'is_workspace_admin', 'workspace_has_plugin', 'has_workspace_permission']) {
    assert.match(sql, new RegExp(`create or replace function app_private\\.${fn}`, 'i'));
    assert.match(sql, new RegExp(`revoke all on function app_private\\.${fn}\\([^;]+from public, anon`, 'i'));
  }
  assert.match(sql, /security definer\s+set search_path = ''/i);
  assert.match(sql, /from public\.workspace_memberships/i);
  assert.match(sql, /from public\.company_memberships/i);
  assert.doesNotMatch(sql, /current_company_ids\(\)/i);
  assert.doesNotMatch(sql, /from public\.profiles[\s\S]{0,120}\brole\b/i);
  assert.doesNotMatch(sql, /company_ids/i);
});

test('workspace administration is atomic and server-authorized', () => {
  for (const signature of [
    'create_operational_workspace\\(text, text, text, text\\)',
    'set_workspace_member\\(uuid, uuid, uuid, text\\)',
    'set_workspace_plugin\\(uuid, text, text\\)',
    'apply_workspace_plugin_preset\\(uuid, text\\)',
    'replace_workspace_pipeline_stages\\(uuid, text, jsonb, jsonb\\)',
  ]) {
    assert.match(sql, new RegExp(`grant execute on function public\\.${signature} to authenticated`, 'i'));
    assert.match(sql, new RegExp(`revoke all on function public\\.${signature} from public, anon`, 'i'));
  }
  assert.match(sql, /Workspace admin access required/i);
  assert.match(sql, /Company plugin entitlement required/i);
  assert.match(sql, /Default workspace cannot be archived/i);
});

test('workspace creation uses valid PostgreSQL trim syntax for generated slugs', () => {
  assert.match(sql, /clean_slug := trim\(both '-' from regexp_replace/i);
  assert.doesNotMatch(sql, /btrim\(both/i);
});

test('workspace-scoped pipeline policies check membership and updates have WITH CHECK', () => {
  for (const table of ['accounts', 'contacts', 'crm_sites', 'deals', 'activities', 'jobs', 'tasks', 'pipeline_stages', 'underwriting_cases', 'job_files', 'proposal_documents']) {
    assert.match(sql, new RegExp(`create policy "${table} workspace read"[\\s\\S]*app_private\\.is_workspace_member\\(workspace_id\\)`, 'i'));
    assert.match(sql, new RegExp(`create policy "${table} workspace update"[\\s\\S]*using[\\s\\S]*with check`, 'i'));
    assert.match(sql, new RegExp(`create index if not exists ${table}_workspace`, 'i'));
  }
  assert.match(sql, /create constraint trigger workspace_record_links_match/i);
});
