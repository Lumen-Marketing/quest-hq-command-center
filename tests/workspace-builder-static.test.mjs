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
  assert.match(source, /\{ label: 'Work', ids: \['home', 'tasks', 'workspaces', 'underwriter'\] \}/);
  assert.match(source, /if \(route\.section === 'workspaces'\) return renderWorkspaceBuilderPage\(route, companyId\);/);
  assert.match(source, /function renderWorkspaceBuilderPage\(route, companyId\)/);
  assert.doesNotMatch(source, /id="companyCard"/);
  assert.doesNotMatch(source, /const KEY='qhq_cc_workspaces_v1'/);
});

test('workspace builder supports working no-code workspace app flows inside a company', () => {
  assert.match(source, /const WORKSPACE_BUILDER_STORAGE_PREFIX = 'qhq_workspace_builder_v1';/);
  assert.match(source, /function workspaceBuilderStorageKey\(companyId\)/);
  assert.match(source, /function loadWorkspaceBuilderState\(companyId\)/);
  assert.match(source, /function saveWorkspaceBuilderState\(companyId, builderState\)/);
  assert.match(source, /function seedWorkspaceBuilderState\(companyId\)/);
  assert.match(source, /function renderBuilderWorkspaceList\(companyId, builderState\)/);
  assert.match(source, /function renderBuilderWorkspaceDetail\(route, companyId, builderState\)/);
  assert.match(source, /function renderBuilderAppDetail\(route, companyId, builderState\)/);
  assert.match(source, /data-action="builder-create-workspace"/);
  assert.match(source, /data-action="builder-create-app"/);
  assert.match(source, /data-action="builder-create-field"/);
  assert.match(source, /data-action="builder-create-item"/);
  assert.match(source, /data-builder-workspace-name/);
  assert.match(source, /data-builder-app-name/);
  assert.match(source, /data-builder-field-label/);
  assert.match(source, /data-builder-item-field/);
  assert.match(source, /function handleWorkspaceBuilderAction\(node\)/);
  assert.match(source, /function revealPluginModulesInNavigation\(plugin\)/);
  assert.match(source, /if \(nextStatus === 'installed'\) revealPluginModulesInNavigation\(plugin\);/);
  assert.match(source, /localStorage\.setItem\(SIDEBAR_COLLAPSED_KEY, 'false'\)/);
  assert.match(source, /workspaceBuilderCreateWorkspace\(companyId, name, description\)/);
  assert.match(source, /workspaceBuilderCreateApp\(companyId, workspaceId, name, type\)/);
  assert.match(source, /workspaceBuilderCreateField\(companyId, workspaceId, appId, label, fieldType\)/);
  assert.match(source, /workspaceBuilderCreateItem\(companyId, workspaceId, appId, values\)/);
});

test('workspace builder UI is scoped and styled for dense command-center use', () => {
  assert.match(styles, /\.builder-shell\s*\{/);
  assert.match(styles, /\.builder-grid\s*\{/);
  assert.match(styles, /\.builder-card\s*\{/);
  assert.match(styles, /\.builder-app-table\s*\{/);
  assert.match(styles, /\.builder-inline-form\s*\{/);
  assert.match(styles, /\.builder-field-pill\s*\{/);
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
