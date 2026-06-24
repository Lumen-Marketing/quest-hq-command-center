import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migrationDir = new URL('../supabase/migrations/', import.meta.url);
const migrationFiles = readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort();
const pluginMigrationName = migrationFiles.find((name) => {
  const sql = readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
  return /company_plugins/.test(sql) && /set_company_plugin/.test(sql);
});
const pluginMigration = pluginMigrationName ? readFileSync(new URL(`../supabase/migrations/${pluginMigrationName}`, import.meta.url), 'utf8') : '';

test('plugin registry maps every non-core route to a workspace plugin', () => {
  assert.match(source, /const CORE_MODULE_IDS = new Set\(\['home', 'jobs', 'tasks', 'users', 'settings'\]\);/);
  assert.match(source, /const WORKSPACE_PLUGIN_REGISTRY = \[/);
  assert.match(source, /id: 'crm'[\s\S]*module_ids: \['crm', 'contacts', 'deals'\]/);
  assert.match(source, /id: 'time_clock'[\s\S]*module_ids: \['time', 'clock'\]/);
  assert.match(source, /id: 'reporting'[\s\S]*module_ids: \['analytics', 'team-chart'\]/);
  assert.match(source, /function pluginForModule\(moduleId\)/);
  assert.match(source, /function isModuleInstalled\(moduleId, companyId = activeCompanyId\(\)\)/);
});

test('workspace presets install industry plugin bundles', () => {
  assert.match(source, /const WORKSPACE_PLUGIN_PRESETS = \{/);
  assert.match(source, /roofing: \['crm', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting'\]/);
  assert.match(source, /construction: \['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting'\]/);
  assert.match(source, /generic: \['crm', 'files', 'messages'\]/);
  assert.match(source, /name="preset_code"/);
  assert.match(source, /client\.rpc\('create_company_workspace', \{ company_name: companyName, preset_code: presetCode \}\)/);
});

test('navigation and routes are gated by installed plugins', () => {
  assert.match(source, /function renderPluginBlockedPage\(companyId, moduleMeta\)/);
  assert.match(source, /if \(!isModuleInstalled\(route\.section, companyId\)\) return renderPluginBlockedPage\(companyId, moduleMeta\);/);
  assert.match(source, /if \(!isModuleInstalled\(module\.id, companyId\)\) return false;/);
  assert.match(source, /installedModulesForMobileWork\(companyId\)/);
  assert.match(source, /installedLiveModules\(companyId\)/);
});

test('settings exposes plugin management and role permissions respect installed plugins', () => {
  assert.match(source, /companyPath\('settings', \{ tab: 'plugins' \}, companyId\), 'Plugins', 'plugins'/);
  assert.match(source, /function renderPluginsSettings\(companyId\)/);
  assert.match(source, /data-action="set-company-plugin"/);
  assert.match(source, /data-action="apply-plugin-preset"/);
  assert.match(source, /\['plugins\.view', 'View plugins'\]/);
  assert.match(source, /\['plugins\.manage', 'Install\/disable plugins'\]/);
  assert.match(source, /permissionAvailableForCompany\(key, companyId\)/);
});

test('plugin migration creates tenant plugin records, RPCs, grants, RLS, and Lumen seed', () => {
  assert.ok(pluginMigrationName, 'Expected a migration containing company_plugins and set_company_plugin');
  assert.match(pluginMigration, /create table if not exists public\.company_plugins/);
  assert.match(pluginMigration, /status text not null default 'installed'/);
  assert.match(pluginMigration, /constraint company_plugins_status_check check \(status in \('installed', 'disabled'\)\)/);
  assert.match(pluginMigration, /alter table public\.company_plugins enable row level security;/);
  assert.match(pluginMigration, /grant select, insert, update on public\.company_plugins to authenticated;/);
  assert.match(pluginMigration, /create or replace function public\.set_company_plugin/);
  assert.match(pluginMigration, /create or replace function public\.apply_company_plugin_preset/);
  assert.match(pluginMigration, /create or replace function public\.create_company_workspace\(company_name text, preset_code text default 'generic'\)/);
  assert.match(pluginMigration, /insert into public\.company_plugins \(company_id, plugin_id, status, installed_by, installed_at, updated_at\)[\s\S]*select 'lumen'/);
  assert.match(pluginMigration, /app_private\.company_has_plugin/);
});

test('plugin migration file exists in migrations directory', () => {
  assert.ok(existsSync(migrationDir), 'migration directory should exist');
  assert.ok(pluginMigrationName?.endsWith('.sql'), 'plugin migration should be a sql file');
});
