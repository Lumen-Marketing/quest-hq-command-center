import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const migrationsDir = fileURLToPath(new URL('../supabase/migrations/', import.meta.url));
const migrationName = readdirSync(migrationsDir).find((name) => /_workspace_setup_release_hardening\.sql$/.test(name));

test('workspace setup release hardening is a forward migration', () => {
  assert.ok(migrationName, 'release hardening migration must exist');
});

const sql = migrationName
  ? readFileSync(`${migrationsDir}/${migrationName}`, 'utf8').replace(/\r\n/g, '\n')
  : '';

test('new companies may start with a truly blank first workspace', () => {
  assert.match(sql, /create or replace function public\.create_company_workspace/i);
  assert.match(sql, /clean_preset not in \('roofing', 'construction', 'generic', 'blank'\)/i);
});

test('workspace setup draft, apply, and reset use optimistic revisions', () => {
  assert.match(sql, /add column if not exists revision integer not null default 0/i);
  assert.match(sql, /save_workspace_setup_draft\([\s\S]*p_expected_revision integer/i);
  assert.match(sql, /apply_workspace_setup\([\s\S]*p_expected_revision integer/i);
  assert.match(sql, /reset_workspace_setup\([\s\S]*p_expected_revision integer/i);
  assert.match(sql, /revision = [\w.]*revision \+ 1/i);
  assert.match(sql, /Workspace setup changed in another tab or device/i);
});

test('workspace setup preserves manually active plugin ownership and configuration', () => {
  assert.match(sql, /manual_plugin_snapshot/i);
  assert.match(sql, /previous_managed_plugins/i);
  assert.match(sql, /preexisting manual workspace apps/i);
  assert.match(sql, /corrected_managed_plugins/i);
  assert.match(sql, /config = manual\.config/i);
  assert.match(sql, /managed_plugins/i);
});

test('workspace setup blocks unmanaged CRM conflicts and owns only actually active apps', () => {
  assert.match(sql, /manually installed CRM app[\s\S]*Quest CRM/i);
  assert.match(sql, /manually installed Quest CRM app[\s\S]*uses CRM/i);
  assert.match(sql, /join public\.workspace_plugins workspace_plugin[\s\S]*workspace_plugin\.status = 'installed'/i);
  assert.match(sql, /join public\.company_plugins entitlement[\s\S]*entitlement\.status = 'installed'/i);
});
