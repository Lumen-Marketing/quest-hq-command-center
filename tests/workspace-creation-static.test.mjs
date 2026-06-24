import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202606251230_idempotent_workspace_creation.sql', import.meta.url), 'utf8');

test('no-company workspace creation shows progress and errors', () => {
  assert.match(source, /const busy = \/creating\|joining\|opening\/i\.test\(state\.authMessage \|\| ''\);/);
  assert.match(source, /Creating workspace\.\.\./);
  assert.match(source, /state\.loginError \? `<div class="form-message error">/);
  assert.match(source, /createWorkspaceForCurrentUser\(event\.target\)\.catch/);
});

test('workspace creation applies optimistic active membership state', () => {
  assert.match(source, /function applyCreatedWorkspace\(workspaceId, requestedName = ''\)/);
  assert.match(source, /state\.memberships = state\.memberships/);
  assert.match(source, /role: 'owner'/);
  assert.match(source, /status: 'active'/);
  assert.match(source, /state\.session = \{ \.\.\.activeSession\(\), profile \};/);
  assert.match(source, /writeJson\(SESSION_KEY, state\.session\);/);
});

test('supabase access survives noncritical full-data load fallback', () => {
  assert.match(source, /function safeSupabaseQuery\(query\)/);
  assert.match(source, /return Promise\.resolve\(query\)\.catch\(\(error\) => \(\{ error \}\)\);/);
  assert.match(source, /async function loadSupabaseBootstrapData\(\)/);
  assert.match(source, /safeSupabaseQuery\(client\.from\('company_memberships'\)\.select\('\*'\)\.eq\('profile_id', profile\.id\)\)/);
  assert.match(source, /safeSupabaseQuery\(client\.rpc\('is_platform_admin'\)\)/);
  assert.match(source, /safeSupabaseQuery\(client\.rpc\('list_platform_companies'\)\)/);
  assert.doesNotMatch(source, /client\.rpc\([^;\n]+\.catch\(\(error\) => \(\{ error \}\)\)/);
  assert.match(source, /const trustedProfileCompany = \(profile\.company_ids \|\| \[\]\)\.map\(canonicalCompanyId\)\.includes/);
  assert.match(source, /trustedProfileCompany && \['owner', 'admin', 'developer'\]\.includes/);
});

test('supabase workspace creation is idempotent for active members', () => {
  assert.match(migration, /create or replace function public\.create_company_workspace\(company_name text\)/);
  assert.match(migration, /select cm\.company_id\s+into existing_company_id/);
  assert.match(migration, /where cm\.profile_id = auth\.uid\(\)\s+and cm\.status = 'active'/);
  assert.match(migration, /if existing_company_id is not null then\s+return existing_company_id;/);
  assert.match(migration, /grant execute on function public\.create_company_workspace\(text\) to authenticated;/);
});
