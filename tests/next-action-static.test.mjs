import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'src', 'main.js'), 'utf8')
  // The docked composer's fields are fetched on demand now; they are still part of the
  // surface these tests describe, so both files are read as one.
  + fs.readFileSync(path.join(root, 'src', 'messaging', 'dock-fields.js'), 'utf8');
const migrationPath = path.join(root, 'supabase', 'migrations', '202607171500_task_deal_next_actions.sql');
const handleActionSource = source.slice(source.indexOf('function handleAction('), source.indexOf('function onDocumentSubmit('));
const submitSource = source.slice(source.indexOf('function onDocumentSubmit('), source.indexOf('function onDocumentInput('));

test('all three funnel cards render the shared What\'s next field', () => {
  assert.match(source, /renderPipelineNextAction\('contact', contact\)/);
  assert.match(source, /renderPipelineNextAction\('deal', deal\)/);
  assert.match(source, /renderPipelineNextAction\('job', job\)/);
  assert.match(source, /data-action="open-pipeline-next-action"/);
  assert.match(source, /!can\('tasks\.view',[\s\S]*&& !can\('tasks\.manage'/, 'task managers must not lose the field when a custom role omits tasks.view');
  assert.match(handleActionSource, /action === 'open-pipeline-next-action'/, 'the button must be handled by delegated click actions');
  assert.doesNotMatch(submitSource, /action === 'open-pipeline-next-action'/, 'click actions must not leak into the form-submit dispatcher');
});

test('all three funnel table and list views render an actionable What\'s next field', () => {
  const contactTable = source.slice(source.indexOf('function renderContactTable('), source.indexOf('function selectedContactRows('));
  const jobList = source.slice(source.indexOf('function renderJobList('), source.indexOf('function renderJobProfile('));
  const dealRow = source.slice(source.indexOf('function dealRow('), source.indexOf('function dealKpiRow('));

  assert.match(contactTable, /renderPipelineNextAction\('contact', contact, \{ compact: true \}\)/);
  assert.match(jobList, /renderPipelineNextAction\('job', job, \{ compact: true \}\)/);
  assert.match(dealRow, /renderPipelineNextAction\('deal', deal, \{ compact: true \}\)/);
  assert.match(source, /data-action="open-pipeline-task"/, 'an existing next action must remain clickable inside a clickable table row');
  assert.match(handleActionSource, /action === 'open-pipeline-task'/);
  assert.match(handleActionSource, /action === 'open-job'/, 'the keyboard-accessible job row must be handled by delegated click actions');
  assert.doesNotMatch(submitSource, /action === 'open-job'/, 'job row click actions must not leak into the form-submit dispatcher');
});

test('the next-action task composer captures assignment and scheduling', () => {
  assert.match(source, /<span>Assigned to<\/span>[\s\S]*name="assignee_id"/);
  assert.match(source, /function companyTaskAssignees[\s\S]*profile\?\.member_id/, 'task assignees must use the team-member IDs required by the task foreign key');
  assert.match(source, /const members = companyTaskAssignees\(companyId\)/);
  assert.match(source, /assignee_id: clean\.assignee_id \|\| creatorId/);
  assert.match(source, /due_time: clean\.due_time/);
  assert.match(source, /const savedTask = composer\.related_type[\s\S]*if \(!savedTask\) return;[\s\S]*state\.dockedActivityComposers = state\.dockedActivityComposers\.filter/, 'failed task writes must keep the composer open');
});

test('quote next actions have a durable direct task relationship', () => {
  assert.equal(fs.existsSync(migrationPath), true, 'expected deal-link migration');
  const migration = fs.readFileSync(migrationPath, 'utf8');
  assert.match(migration, /add column if not exists deal_id text/i);
  assert.match(migration, /foreign key \(company_id,\s*deal_id\)[\s\S]*references public\.deals\(company_id,\s*id\)/i);
  assert.match(migration, /tasks_company_deal_idx/i);
  assert.match(source, /deal_id: deal\.id/);
  assert.match(source, /deal_id: task\.deal_id \|\| null/);
});
