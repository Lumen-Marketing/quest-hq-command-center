import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const migrationUrl = new URL('../supabase/migrations/202606270800_workspace_builder_plugin.sql', import.meta.url);
const migration = existsSync(migrationUrl) ? readFileSync(migrationUrl, 'utf8') : '';

test('workspace builder is integrated as a current app plugin, not an old standalone clone', () => {
  assert.match(source, /id: 'workspace_builder'/);
  assert.match(source, /label: 'Workspace Builder'/);
  assert.match(source, /module_ids: \['workspaces'\]/);
  assert.match(source, /permissions: \['workspaces.view', 'workspaces.manage'\]/);
  assert.match(source, /id: 'workspaces'[\s\S]*label: 'Workspaces'[\s\S]*permission: 'workspaces.view'/);
  assert.match(source, /\{ label: 'Work', ids: \['dashboard', 'tasks', 'workspaces', 'underwriter'\] \}/);
  assert.match(source, /\{ label: 'Quest CRM', ids: \['workday', 'contacts', 'deals', 'proposals', 'jobs'\] \}/);
  assert.match(source, /if \(route\.section === 'workspaces'\) return renderWorkspaceBuilderPage\(route, companyId\);/);
  assert.match(source, /function renderWorkspaceBuilderPage\(route, companyId\)/);
  assert.doesNotMatch(source, /id="companyCard"/);
  assert.doesNotMatch(source, /const KEY='qhq_cc_workspaces_v1'/);
});

test('workspace builder supports working no-code workspace app flows inside a company', () => {
  assert.match(source, /const WORKSPACE_BUILDER_STORAGE_PREFIX = 'qhq_workspace_builder_v1';/);
  assert.match(source, /function workspaceBuilderStorageKey\(companyId\)/);
  assert.match(source, /function normalizeWorkspaceBuilderDoc\(doc\)/);
  assert.match(source, /function wbDoc\(companyId\)/);
  assert.match(source, /function ensureWorkspaceBuilderLoaded\(companyId\)/);
  assert.match(source, /function saveWorkspaceBuilderDoc\(companyId\)/);
  assert.match(source, /client\.from\('workspace_builder_state'\)\.upsert/);
  assert.match(source, /client\.from\('workspace_builder_state'\)\.select\('\*'\)/);
  assert.match(source, /function wbCompanyWorkspace\(companyId\)/);
  assert.match(source, /if \(!doc\) doc = readJson\(workspaceBuilderStorageKey\(companyId\), \{ workspaces: \[\] \}\)/);
  assert.match(source, /function renderWorkspaceBuilderModal\(\)/);
  assert.match(source, /function wbViewCompanyHome\(companyId, workspace\)/);
  assert.match(source, /function wbViewApp\(route, companyId, workspace, app\)/);
  assert.match(source, /function wbViewBuilder\(companyId, workspace, app\)/);
  assert.match(source, /function wbViewItems\(companyId, workspace, app\)/);
  assert.match(source, /function wbViewAutomations\(companyId, workspace, app\)/);
  assert.match(source, /function wbViewAppSettings\(companyId, workspace, app\)/);
  assert.match(source, /data-new-app/);
  assert.match(source, /data-add-field/);
  assert.match(source, /data-add-item/);
  assert.match(source, /data-add-auto/);
  assert.match(source, /data-save-app/);
  assert.match(source, /function openWbWorkspaceModal\(companyId, editId\)/);
  assert.match(source, /function openWbAppModal\(companyId, workspaceId\)/);
  assert.match(source, /function openWbFieldModal\(companyId, workspaceId, appId, fieldId, fieldType\)/);
  assert.match(source, /function openWbItemModal\(companyId, workspaceId, appId, itemId, mode\)/);
  assert.match(source, /function openWbAutoModal\(companyId, workspaceId, appId, autoId\)/);
  assert.match(source, /function wbMountDnD\(companyId, workspaceId, appId\)/);
  assert.match(source, /function revealPluginModulesInNavigation\(plugin\)/);
  assert.match(source, /if \(nextStatus === 'installed'\) revealPluginModulesInNavigation\(plugin\);/);
  assert.match(source, /localStorage\.setItem\(SIDEBAR_COLLAPSED_KEY, 'false'\)/);
  assert.match(source, /wbSave\(companyId\)/);
  assert.match(source, /wbSaveAppSettings\(companyId, workspaceId, appId\)/);
});

test('workspace builder UI is scoped and styled for dense command-center use', () => {
  assert.match(styles, /\.wb-page\s*\{/);
  assert.match(styles, /\.wb-grid\s*\{/);
  assert.match(styles, /\.wb-card\s*\{/);
  assert.match(styles, /\.wb-table\s*\{/);
  assert.match(styles, /\.wb-builder-grid\s*\{/);
  assert.match(styles, /\.wb-field-row\s*\{/);
  assert.match(styles, /\.wb-auto-row\s*\{/);
  assert.match(styles, /\.wb-modal-overlay\s*\{/);
});

test('workspace builder plugin is allowed by Supabase plugin RPCs', () => {
  assert.ok(migration, 'Expected workspace builder plugin migration');
  assert.match(migration, /drop constraint if exists company_plugins_known_plugin_check/);
  assert.match(migration, /plugin_id in \([\s\S]*'workspace_builder'/);
  assert.match(migration, /when permission like 'workspaces\.%'/);
  assert.match(migration, /public\.set_company_plugin/);
  assert.match(migration, /clean_plugin_id not in \([\s\S]*'workspace_builder'/);
  assert.match(migration, /public\.company_plugins \(company_id, plugin_id, status/);
  assert.match(migration, /values \('lumen', 'workspace_builder', 'installed'/);
});
