import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
// The New/Edit task form moved into its own fetched-on-demand module: it is the body of one
// modal, and every session that never opens it was carrying it in the entry bundle.
const taskForm = readFileSync(new URL('../src/tasks/task-form.js', import.meta.url), 'utf8');

function sourceBetween(start, end) {
  const startAt = source.indexOf(start);
  const endAt = source.indexOf(end, startAt + start.length);
  assert.notEqual(startAt, -1, `Missing source marker: ${start}`);
  assert.notEqual(endAt, -1, `Missing source marker: ${end}`);
  return source.slice(startAt, endAt);
}

test('native Tasks is feature flagged and keeps the deployed embed fallback', () => {
  assert.match(source, /nativeTasksModule: import\.meta\.env\.VITE_NATIVE_TASKS_MODULE === 'true'/);
  assert.match(envExample, /VITE_NATIVE_TASKS_MODULE=false/);
  assert.match(source, /function nativeTasksModuleEnabled\(route\)/);
  assert.match(source, /function renderNativeTasksPage\(route, companyId\)/);
  assert.match(source, /function renderEmbeddedTasksPage\(route, companyId\)/);
  const router = sourceBetween('function renderTasksPage(route, companyId)', 'function renderNativeTasksPage');
  assert.match(router, /nativeTasksModuleEnabled\(route\)/);
  assert.match(router, /renderNativeTasksPage\(route, companyId\)/);
  assert.match(router, /renderEmbeddedTasksPage\(route, companyId\)/);
});

test('company Owners/Admins can opt into native Tasks while embedded stays the default', () => {
  const gate = sourceBetween('function nativeTasksModuleEnabled(route)', 'function taskPath');
  assert.match(gate, /if \(CONFIG\.nativeTasksModule\) return true;/);
  // Without the explicit opt-in nobody leaves the embedded default, whatever their role.
  assert.match(gate, /if \(route\?\.params\?\.get\('task_ui'\) !== 'native'\) return false;/);
  assert.match(gate, /if \(state\.platformAdmin === true\) return true;/);
  assert.match(gate, /membership\?\.status === 'active'/);
  assert.match(gate, /\['owner', 'admin'\]\.includes\(String\(membership\.role\)\.toLowerCase\(\)\)/);
});

test('native Tasks renders list, board, detail, create, and edit inside Command Center', () => {
  const nativePage = sourceBetween('function renderNativeTasksPage(route, companyId)', 'function renderEmbeddedTasksPage');
  assert.match(nativePage, /filteredTasks\(companyId, job\?\.id\)/);
  assert.match(nativePage, /renderTaskBoard\(companyId, tasks\)/);
  assert.match(nativePage, /renderTaskTable\(companyId, tasks\)/);
  assert.doesNotMatch(nativePage, /taskmanagement\/app\.html|<iframe/);
  assert.match(source, /function renderTaskRouteModal\(route, companyId\)/);
  assert.match(source, /taskFormModule\.renderTaskForm\(companyId, job, of\)/);
  assert.match(source, /import\('\.\/tasks\/task-form\.js'\)/);
  // Both openings still exist; they share one builder now rather than two call sites.
  assert.match(source, /form\('New task', null\)/);
  assert.match(source, /form\('Edit task', task\)/);
  assert.match(source, /renderTaskDetail\(companyId, task\)/);
});

test('task detail and forms expose job, contact, and deal business context', () => {
  const context = sourceBetween('function renderTaskContextLinks(task, companyId)', 'function renderTaskDetail');
  assert.match(context, /task\.project_id/);
  assert.match(context, /task\.contact_id/);
  assert.match(context, /task\.deal_id/);
  assert.match(context, /companyPath\('jobs'/);
  assert.match(context, /companyPath\('contacts'/);
  assert.match(context, /companyPath\('deals'/);

  const form = taskForm;
  assert.match(form, /selectField\('Job', 'project_id'/);
  assert.match(form, /selectField\('Contact', 'contact_id'/);
  assert.match(form, /selectField\('Quote', 'deal_id'/);
});

test('record-created tasks preserve workspace and all available business links', () => {
  const contactCreate = sourceBetween('async function createContactTask', 'async function spawnNextRecurrence');
  assert.match(contactCreate, /workspace_id: workspaceIdForRecord\(contact\.company_id, contact\.workspace_id\)/);

  const jobCreate = sourceBetween('async function createJobTask', 'function jobQuickCreate');
  assert.match(jobCreate, /workspace_id: workspaceIdForRecord\(job\.company_id, job\.workspace_id\)/);
  assert.match(jobCreate, /contact_id: job\.contact_id \|\| ''/);
  assert.match(jobCreate, /deal_id: job\.deal_id \|\| ''/);

  const dealCreate = sourceBetween('async function createDealTask', 'async function logDealActivity');
  assert.match(dealCreate, /workspace_id: workspaceIdForRecord\(deal\.company_id, deal\.workspace_id\)/);
  assert.match(dealCreate, /project_id: deal\.job_id \|\| ''/);
});

test('automation and recurrence hooks stay on the direct workspace data path', () => {
  const automationCreate = sourceBetween('async function createAutomationTask', 'async function runCompanyAutomations');
  for (const field of ['workspace_id', 'project_id', 'contact_id', 'deal_id']) {
    assert.match(automationCreate, new RegExp(`${field}: fields\\.${field}`));
  }
  const automationRun = sourceBetween('async function runCompanyAutomations', 'function fillTemplateSafe');
  assert.match(automationRun, /taskAutomationContext\(object, after\)/);

  const recurrence = sourceBetween('async function spawnNextRecurrence', 'async function logContactActivity');
  assert.match(recurrence, /\.\.\.task/);
  assert.match(recurrence, /client\.from\('tasks'\)\.insert\(taskPayload\(next\)\)/);
});

test('native task writes are direct and constrained to the active workspace', () => {
  const save = sourceBetween('async function saveTask(form)', 'async function deleteTask');
  assert.match(save, /client\.from\('tasks'\)\.update\(savePayload\)[\s\S]*?\.eq\('workspace_id', payload\.workspace_id\)/);
  assert.match(save, /client\.from\('tasks'\)\.insert\(savePayload\)/);
  assert.match(save, /const previous = taskId \? taskById\(taskId\) : null/);
  assert.match(save, /watchers: previous\?\.watchers \|\| \[\]/);
  assert.match(save, /runTaskSaveHooks\(previous, savedTask\)/);
  assert.doesNotMatch(save, /taskmanagement|iframe|postMessage/);
});

test('native completion reuses recurrence and automation engines', () => {
  const hooks = sourceBetween('async function runTaskSaveHooks', 'async function saveTask(form)');
  assert.match(hooks, /spawnNextRecurrence\(savedTask\)/);
  assert.match(hooks, /runCompanyAutomations\('task', previous, savedTask/);
});
