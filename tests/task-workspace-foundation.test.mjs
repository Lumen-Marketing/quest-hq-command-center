import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const hostSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const taskConfig = readFileSync(new URL('../taskmanagement/js/config.js', import.meta.url), 'utf8');
const taskBootstrap = readFileSync(new URL('../taskmanagement/js/app.js', import.meta.url), 'utf8');
const taskStore = readFileSync(new URL('../taskmanagement/js/services/SupabaseDataStore.js', import.meta.url), 'utf8');
const migrationDir = new URL('../supabase/migrations/', import.meta.url);
const activationMigrationName = readdirSync(migrationDir)
  .find((name) => /task_workspace_plugin_activation\.sql$/.test(name));
const activationMigration = activationMigrationName
  ? readFileSync(new URL(`../supabase/migrations/${activationMigrationName}`, import.meta.url), 'utf8')
  : '';

function sourceBetween(source, start, end) {
  const startAt = source.indexOf(start);
  const endAt = source.indexOf(end, startAt + start.length);
  assert.notEqual(startAt, -1, `Missing source marker: ${start}`);
  assert.notEqual(endAt, -1, `Missing source marker: ${end}`);
  return source.slice(startAt, endAt);
}

test('Tasks uses company entitlement plus independent workspace activation', () => {
  assert.match(hostSource, /const CORE_MODULE_IDS = new Set\(\['dashboard', 'jobs', 'users', 'settings', 'automations'\]\);/);
  assert.doesNotMatch(hostSource, /CORE_MODULE_IDS = new Set\([^\n]*'tasks'/);

  const taskPlugin = hostSource.match(/\{ id: 'tasks'[^}]+\}/)?.[0] || '';
  assert.match(taskPlugin, /label: 'Tasks'/);
  assert.match(taskPlugin, /module_ids: \['tasks'\]/);
  assert.match(taskPlugin, /permissions: \['tasks\.view', 'tasks\.manage'\]/);
  assert.match(hostSource, /if \(clean\.startsWith\('tasks\.'\)\) return \['tasks'\];/);

  const presets = sourceBetween(hostSource, 'const WORKSPACE_PLUGIN_PRESETS = {', 'const WORKSPACE_PLUGIN_PRESET_LABELS');
  assert.match(presets, /roofing: \[[^\n]*'tasks'/);
  assert.match(presets, /construction: \[[^\n]*'tasks'/);
  assert.match(presets, /generic: \[[^\n]*'tasks'/);
});

test('the Command Center host passes a required workspace boundary into the Task module', () => {
  const renderTasks = sourceBetween(hostSource, 'function renderTasksPage(route, companyId)', 'function renderTaskDeleteModal');
  assert.match(renderTasks, /const workspaceId = workspaceIdForCompany\(companyId\);/);
  assert.match(renderTasks, /if \(!workspaceId\)/);
  assert.match(renderTasks, /params\.set\('workspace_id', workspaceId\);/);
  assert.match(renderTasks, /params\.set\('return_url', window\.location\.href\);/);
  assert.match(renderTasks, /route\.params\.get\('task_id'\)/);
  assert.match(renderTasks, /#\/task\/\$\{encodeURIComponent\(taskId\)\}/);
  assert.match(renderTasks, /#\/new/);
});

test('the vendored Task runtime parses workspace context and fails closed without it', () => {
  assert.match(taskConfig, /workspaceId: \(routeParams\.get\('workspace_id'\) \|\| ''\)\.trim\(\)/);
  assert.match(taskConfig, /projectId: \(routeParams\.get\('project_id'\) \|\| ''\)\.trim\(\)/);
  assert.match(taskBootstrap, /App\.commandCenterIntegration\.hosted && !App\.commandCenterIntegration\.workspaceId/);
  assert.match(taskBootstrap, /renderWorkspaceGate\(\)/);
  assert.match(taskBootstrap, /function renderWorkspaceGate\(\)/);
  assert.match(taskBootstrap, /Open Tasks from an active Questbase workspace/);
});

test('Task data reads and mutations are constrained to the active workspace', () => {
  assert.match(taskStore, /constructor\(\{ supabase, currentUser, role, workspaceId \}\)/);
  assert.match(taskStore, /this\.workspaceId = String\(workspaceId \|\| ''\)\.trim\(\);/);
  assert.match(taskStore, /workspace_id: this\.workspaceId/);

  const initialLoad = sourceBetween(taskStore, 'async load()', 'async _optionalSelect');
  assert.match(initialLoad, /from\('tasks'\)[\s\S]*?\.eq\('workspace_id', this\.workspaceId\)/);

  const taskReload = sourceBetween(taskStore, 'async loadTasks(skipVersionIds)', 'async save(');
  assert.match(taskReload, /from\('tasks'\)[\s\S]*?\.eq\('workspace_id', this\.workspaceId\)/);

  const taskSave = sourceBetween(taskStore, 'async _saveTasks(tasks)', 'async _refetchTask(id)');
  assert.match(taskSave, /\.update\(row\)[\s\S]*?\.eq\('workspace_id', this\.workspaceId\)/);

  const taskRefetch = sourceBetween(taskStore, 'async _refetchTask(id)', '_mergeConflict(serverTask, localTask)');
  assert.match(taskRefetch, /\.eq\('workspace_id', this\.workspaceId\)/);

  const taskDelete = sourceBetween(taskStore, 'async deleteTask(id)', 'async purgeExpiredClearedTasks');
  assert.match(taskDelete, /\.delete\(\)\.eq\('workspace_id', this\.workspaceId\)\.eq\('id', id\)/);

  const taskPurge = sourceBetween(taskStore, 'async purgeExpiredClearedTasks', 'async _upsertTimeEntries');
  assert.match(taskPurge, /\.delete\(\)[\s\S]*?\.eq\('workspace_id', this\.workspaceId\)/);

  assert.match(taskBootstrap, /workspaceId: App\.commandCenterIntegration\.workspaceId/);
  assert.match(taskBootstrap, /controller\.openProject\(App\.commandCenterIntegration\.projectId\);/);
});

test('the workspace activation migration is additive and preserves explicit choices', () => {
  assert.ok(activationMigrationName, 'Expected a task_workspace_plugin_activation migration');
  assert.match(activationMigration, /insert into public\.workspace_plugins/);
  assert.match(activationMigration, /join public\.company_plugins cp on cp\.company_id = w\.company_id/);
  assert.match(activationMigration, /cp\.plugin_id = 'tasks'/);
  assert.match(activationMigration, /cp\.status = 'installed'/);
  assert.match(activationMigration, /w\.status = 'active'/);
  assert.match(activationMigration, /on conflict \(workspace_id, plugin_id\) do nothing;/);
  assert.doesNotMatch(activationMigration, /company_plugins_known_plugin_check/);
  assert.doesNotMatch(activationMigration, /plugin_ids_for_preset/);
});

test('legacy Task links keep workspace and deep-link intent', () => {
  const legacyTaskRoute = sourceBetween(hostSource, "if (path === '/task-management.html')", 'const jobTaskMatch');
  assert.match(legacyTaskRoute, /params\.get\('workspace'\) \|\| params\.get\('workspace_id'\)/);
  assert.match(legacyTaskRoute, /params\.get\('task_id'\)/);
  assert.match(legacyTaskRoute, /params\.get\('new'\)/);
  assert.match(legacyTaskRoute, /params\.get\('edit'\)/);
  assert.match(legacyTaskRoute, /companyPath\('tasks', taskParams/);
});
