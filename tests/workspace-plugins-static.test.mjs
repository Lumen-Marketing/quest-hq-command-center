import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const migrationDir = new URL('../supabase/migrations/', import.meta.url);
const migrationFiles = readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort();
const pluginMigrationName = migrationFiles.find((name) => {
  const sql = readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
  return /company_plugins/.test(sql) && /set_company_plugin/.test(sql);
});
const pluginMigration = pluginMigrationName ? readFileSync(new URL(`../supabase/migrations/${pluginMigrationName}`, import.meta.url), 'utf8') : '';
const crm2MigrationName = migrationFiles.find((name) => {
  const sql = readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
  return /crm_2/.test(sql) && /underwriter/.test(sql) && /company_plugins_known_plugin_check/.test(sql);
});
const crm2Migration = crm2MigrationName ? readFileSync(new URL(`../supabase/migrations/${crm2MigrationName}`, import.meta.url), 'utf8') : '';
const crmVariantMigrationName = migrationFiles.find((name) => {
  const sql = readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
  return /crm_plugin_variants/.test(sql) && /underwriter/.test(sql);
});
const crmVariantMigration = crmVariantMigrationName ? readFileSync(new URL(`../supabase/migrations/${crmVariantMigrationName}`, import.meta.url), 'utf8') : '';
const pluginAmbiguityMigrationName = migrationFiles.find((name) => /fix_plugin_id_ambiguity/.test(name));
const pluginAmbiguityMigration = pluginAmbiguityMigrationName
  ? readFileSync(new URL(`../supabase/migrations/${pluginAmbiguityMigrationName}`, import.meta.url), 'utf8')
  : '';
const crm2RegistryEntry = source.match(/\{ id: 'crm_2'[^}]+\}/)?.[0] || '';

test('plugin registry maps every non-core route to a workspace plugin', () => {
  assert.match(source, /const CORE_MODULE_IDS = new Set\(\['home', 'jobs', 'tasks', 'users', 'settings'\]\);/);
  assert.match(source, /const WORKSPACE_PLUGIN_REGISTRY = \[/);
  assert.match(source, /id: 'crm'[\s\S]*module_ids: \['crm', 'contacts', 'deals'\]/);
  assert.match(source, /id: 'crm_2'[\s\S]*module_ids: \['contacts', 'deals', 'jobs'\]/);
  assert.match(source, /id: 'underwriter'[\s\S]*module_ids: \['underwriter'\]/);
  assert.match(source, /id: 'time_clock'[\s\S]*module_ids: \['time', 'clock'\]/);
  assert.match(source, /id: 'reporting'[\s\S]*module_ids: \['analytics', 'team-chart'\]/);
  assert.match(source, /\{ id: 'underwriter'[\s\S]*label: 'Underwriter'[\s\S]*permission: 'underwriter\.view'/);
  assert.match(source, /function pluginsForModule\(moduleId\)/);
  assert.match(source, /function isModuleInstalled\(moduleId, companyId = activeCompanyId\(\)\)/);
});

test('crm 2 plugin contents match the contacts quotes jobs workspace', () => {
  assert.match(crm2RegistryEntry, /label: 'CRM 2'/);
  assert.match(crm2RegistryEntry, /summary: 'Contacts, quotes, and production jobs workspace.'/);
  assert.match(crm2RegistryEntry, /module_ids: \['contacts', 'deals', 'jobs'\]/);
  assert.doesNotMatch(crm2RegistryEntry, /module_ids: \['crm'/);
  assert.match(source, /\{ label: 'Contacts · Top of Funnel', ids: \['contacts'\] \}/);
  assert.match(source, /\{ label: 'Quotes · Bottom of Funnel', ids: \['deals'\] \}/);
  assert.match(source, /\{ label: 'Production', ids: \['jobs'\] \}/);
});

test('workspace presets install industry plugin bundles', () => {
  assert.match(source, /const WORKSPACE_PLUGIN_PRESETS = \{/);
  assert.match(source, /roofing: \['crm_2', 'underwriter', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting'\]/);
  assert.match(source, /construction: \['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting'\]/);
  assert.match(source, /generic: \['crm', 'files', 'messages'\]/);
  assert.match(source, /name="preset_code"/);
  assert.match(source, /client\.rpc\('create_company_workspace', \{ company_name: companyName, preset_code: presetCode, icon_key: iconKey \}\)/);
});

test('navigation and routes are gated by installed plugins', () => {
  assert.match(source, /function renderPluginBlockedPage\(companyId, moduleMeta\)/);
  assert.match(source, /if \(!isModuleInstalled\(route\.section, companyId\)\) return renderPluginBlockedPage\(companyId, moduleMeta\);/);
  assert.match(source, /if \(route\.section === 'underwriter'\) return renderUnderwriterPage\(route, companyId\);/);
  assert.match(source, /function renderUnderwriterPage\(route, companyId\)/);
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

test('crm 2 and underwriter plugins are separate in the registry', () => {
  assert.match(source, /\['underwriter\.view', 'View underwriter'\]/);
  assert.match(source, /\['underwriter\.manage', 'Manage underwriter'\]/);
  assert.match(source, /if \(clean\.startsWith\('underwriter\.'\)\) return \['underwriter'\];/);
  assert.match(source, /recommendedWith: \['crm_2'\]/);
  assert.match(source, /Underwriter connects best when CRM 2 is installed/);
  assert.doesNotMatch(source, /if \(clean\.startsWith\('underwriter\.'\)\) return 'crm_2';/);
});

test('crm plugins are mutually exclusive and migrated separately from underwriter', () => {
  assert.match(source, /exclusiveGroup: 'crm'/);
  assert.match(source, /function conflictingPluginIds\(companyId, pluginId, nextStatus\)/);
  assert.match(source, /window\.confirm\(`Installing \$\{plugin\.label\} will disable \$\{conflictLabels\}\. Continue\?`\)/);
  assert.match(source, /upsertCompanyPluginLocal\(companyId, conflictId, 'disabled'\)/);
  assert.match(source, /function pluginPrerequisiteNote\(companyId, plugin\)/);
  assert.ok(crmVariantMigrationName, 'Expected a migration separating CRM variants from underwriter');
  assert.match(crmVariantMigration, /crm_plugin_variants/);
  assert.match(crmVariantMigration, /plugin_id in \('crm', 'crm_2', 'underwriter'/);
  assert.match(crmVariantMigration, /if clean_status = 'installed' and clean_plugin_id in \('crm', 'crm_2'\)/);
  assert.match(crmVariantMigration, /where company_id = clean_company_id[\s\S]*and plugin_id in \('crm', 'crm_2'\)/);
  assert.match(crmVariantMigration, /when permission like 'crm\.%' then array\['crm', 'crm_2'\]/);
  assert.match(crmVariantMigration, /when permission like 'underwriter\.%' then array\['underwriter'\]/);
});

test('plugin preset RPCs qualify plugin ids to avoid PL/pgSQL ambiguity', () => {
  assert.ok(pluginAmbiguityMigrationName, 'Expected migration fixing plugin_id ambiguity');
  assert.match(pluginAmbiguityMigration, /desired_plugin_id text;/);
  assert.match(
    pluginAmbiguityMigration,
    /update public\.company_plugins cp[\s\S]*cp\.company_id = clean_company_id[\s\S]*cp\.plugin_id <> all\(desired_plugins\)/
  );
  assert.match(pluginAmbiguityMigration, /foreach desired_plugin_id in array desired_plugins loop/);
  assert.doesNotMatch(pluginAmbiguityMigration, /\n\s*plugin_id text;/);
  assert.doesNotMatch(pluginAmbiguityMigration, /foreach plugin_id in array desired_plugins loop/);
});

test('underwriter queue uses contact language and a dedicated table layout', () => {
  assert.match(source, /<p>\$\{visible\.length\} contact\$\{visible\.length === 1 \? '' : 's'\} in this CRM 2 view\.<\/p>/);
  assert.match(source, /<div class="data-table underwriter-table">/);
  assert.match(source, /<div class="table-head"><span>Contact<\/span><span>Stage<\/span><span>Owner<\/span><span>Pay type<\/span><span>Value<\/span><\/div>/);
  assert.match(source, /emptyState\('No contacts match this underwriter stage\.'\)/);
  assert.doesNotMatch(source, /No leads match this underwriter stage\./);
  assert.match(styles, /\.underwriter-table \.table-head,[\s\S]*grid-template-columns: minmax\(0, 1\.35fr\) minmax\(0, \.85fr\) minmax\(0, \.8fr\) minmax\(0, \.7fr\) minmax\(0, \.55fr\);/);
  assert.match(styles, /\.underwriter-table \.empty-state span[\s\S]*overflow-wrap: anywhere;/);
});

test('plugin migration file exists in migrations directory', () => {
  assert.ok(existsSync(migrationDir), 'migration directory should exist');
  assert.ok(pluginMigrationName?.endsWith('.sql'), 'plugin migration should be a sql file');
});
