import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  WORKSPACE_PLUGIN_PRESETS,
  WORKSPACE_PLUGIN_REGISTRY,
} from '../src/workspaces/plugin-catalog.js';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  // The underwriter page is fetched on demand now; same surface, two files.
  + readFileSync(new URL('../src/crm/underwriter-page.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/settings/plugins-panel.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const workspaceMigration = readFileSync(new URL('../supabase/migrations/202607211200_company_operational_workspaces.sql', import.meta.url), 'utf8');
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
const pluginById = (id) => WORKSPACE_PLUGIN_REGISTRY.find((plugin) => plugin.id === id);

test('plugin registry maps every non-core route to a workspace plugin', () => {
  assert.match(source, /const CORE_MODULE_IDS = new Set\(\['dashboard', 'jobs', 'users', 'settings', 'automations'\]\);/);
  assert.match(source, /const WORKSPACE_PLUGIN_REGISTRY = \[/);
  // Workday is a generic 'today's work' queue over contacts, quotes, jobs and tasks. It was
  // declared only by crm_2, and the two CRM plugins are mutually exclusive, so every company
  // on the standard CRM had no Workday at all -- absent from the rail and the palette, with
  // nothing to explain it. QA reported it as missing; it was never reachable for them.
  assert.deepEqual(pluginById('crm').module_ids, ['crm', 'contacts', 'deals', 'workday']);
  assert.deepEqual(pluginById('crm_2').module_ids, ['workday', 'contacts', 'deals', 'proposals', 'jobs']);
  assert.deepEqual(pluginById('underwriter').module_ids, ['underwriter']);
  assert.deepEqual(pluginById('time_clock').module_ids, ['time', 'clock']);
  assert.deepEqual(pluginById('reporting').module_ids, ['analytics', 'team-chart']);
  assert.match(source, /\{ id: 'underwriter'[\s\S]*label: 'Underwriter'[\s\S]*permission: 'underwriter\.view'/);
  assert.match(source, /function pluginsForModule\(moduleId\)/);
  assert.match(source, /function isModuleInstalled\(moduleId, companyId = activeCompanyId\(\), workspaceId = workspaceIdForCompany\(companyId\)\)/);
});

test('quest crm plugin contents match the contacts quotes jobs workspace', () => {
  const crm2 = pluginById('crm_2');
  assert.equal(crm2.label, 'Quest CRM');
  assert.equal(crm2.summary, 'Private contacts, quotes, estimates, proposals, and production jobs workspace.');
  assert.deepEqual(crm2.module_ids, ['workday', 'contacts', 'deals', 'proposals', 'jobs']);
  assert.equal(crm2.private, true);
  assert.equal(crm2.module_ids.includes('crm'), false);
  assert.match(source, /\{ label: 'Pipeline', ids: \['contacts'\] \}/);
  assert.match(source, /\{ label: 'Production', ids: \['jobs'\] \}/);
  assert.match(source, /\{ label: 'Tools', ids: \['underwriter', 'proposals'\] \}/);
  assert.match(source, /\{ label: 'Workspace', ids: \['workspaces', 'workday', 'deals'/);
  assert.doesNotMatch(source, /PRIVATE_PLUGIN_ACCESS/);
  assert.doesNotMatch(source, /LumenQuest@2026/);
  assert.doesNotMatch(source, /data-private-plugin-form/);
  assert.match(source, /companyPluginStatus\(companyId, pluginId\) === 'installed'/);
});

test('workspace presets install industry plugin bundles', () => {
  assert.deepEqual(WORKSPACE_PLUGIN_PRESETS.roofing, ['crm_2', 'underwriter', 'price_book', 'files', 'forms', 'finance', 'messages', 'calendar', 'approvals', 'reporting', 'tasks']);
  assert.deepEqual(WORKSPACE_PLUGIN_PRESETS.construction, ['files', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting', 'tasks']);
  assert.deepEqual(WORKSPACE_PLUGIN_PRESETS.generic, ['crm', 'files', 'messages', 'workspace_builder', 'tasks']);
  assert.match(source, /name="preset_code"/);
  assert.match(source, /client\.rpc\('create_company_workspace', \{ company_name: companyName, preset_code: presetCode, icon_key: iconKey \}\)/);
});

test('navigation and routes are gated by installed plugins', () => {
  assert.match(source, /function renderPluginBlockedPage\(companyId, moduleMeta\)/);
  assert.match(source, /if \(!isModuleInstalled\(route\.section, companyId\)\) return renderPluginBlockedPage\(companyId, moduleMeta\);/);
  assert.match(source, /if \(route\.section === 'underwriter'\) return renderUnderwriterPage\(route, companyId\);/);
  assert.match(source, /if \(route\.section === 'workspaces'\) return renderWorkspaceBuilderPage\(route, companyId\);/);
  assert.match(source, /function renderUnderwriterPage\(route, companyId\)/);
  assert.match(source, /if \(!isModuleInstalled\(module\.id, companyId\)\) return false;/);
  assert.match(source, /installedModulesForMobileWork\(companyId\)/);
  assert.match(source, /installedLiveModules\(companyId\)/);
});

test('settings exposes plugin management and role permissions respect installed plugins', () => {
  assert.match(source, /companyPath\('settings', \{ tab: 'plugins' \}, companyId\), 'Plugins', 'plugins'/);
  assert.match(source, /function renderPluginsSettings\(companyId\)/);
  assert.match(source, /data-action="set-workspace-plugin"/);
  assert.match(source, /data-action="apply-workspace-plugin-preset"/);
  assert.match(source, /\['plugins\.view', 'View plugins'\]/);
  assert.match(source, /\['plugins\.manage', 'Install\/disable plugins'\]/);
  assert.match(source, /permissionAvailableForCompany\(key, companyId\)/);
});

test('workspace plugin activation is separate from company entitlement', () => {
  assert.match(source, /function workspacePluginRows\(workspaceId = activeWorkspaceId\(\)\)/);
  assert.match(source, /function workspacePluginStatus\(companyId, pluginId, workspaceId = workspaceIdForCompany\(companyId\)\)/);
  assert.match(source, /resolveWorkspacePluginStatus\(\{/);
  assert.match(source, /companyEntitled: companyPluginStatus\(companyId, pluginId\) === 'installed'/);
  assert.match(source, /async function setWorkspacePlugin\(workspaceId, pluginId, status\)/);
  assert.match(source, /client\.rpc\('set_workspace_plugin'/);
  assert.match(source, /target_workspace_id: workspaceId/);
  assert.match(source, /async function applyWorkspacePluginPreset\(workspaceId, presetCode\)/);
  assert.match(source, /client\.rpc\('apply_workspace_plugin_preset'/);
  assert.match(source, /upsertWorkspacePluginLocal\(workspaceId, plugin\.id, nextStatus\)/);
  assert.match(workspaceMigration, /Company plugin entitlement required/);
  assert.match(workspaceMigration, /set status = 'disabled', disabled_at = now\(\), updated_at = now\(\)/);
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

test('quest crm and underwriter plugins are separate in the registry', () => {
  assert.match(source, /\['underwriter\.view', 'View underwriter'\]/);
  assert.match(source, /\['underwriter\.manage', 'Manage underwriter'\]/);
  assert.match(source, /if \(clean\.startsWith\('underwriter\.'\)\) return \['underwriter'\];/);
  assert.deepEqual(pluginById('underwriter').recommendedWith, ['crm_2']);
  assert.match(source, /Underwriter connects best when Quest CRM is installed/);
  assert.doesNotMatch(source, /if \(clean\.startsWith\('underwriter\.'\)\) return 'crm_2';/);
});

test('crm plugins are mutually exclusive and migrated separately from underwriter', () => {
  assert.equal(pluginById('crm').exclusiveGroup, 'crm');
  assert.equal(pluginById('crm_2').exclusiveGroup, 'crm');
  assert.match(source, /function conflictingPluginIds\(companyId, pluginId, nextStatus, workspaceId = workspaceIdForCompany\(companyId\)\)/);
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
  assert.match(source, /<p>\$\{visible\.length\} contact\$\{visible\.length === 1 \? '' : 's'\} in this Quest CRM view\.<\/p>/);
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
