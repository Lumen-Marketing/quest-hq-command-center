import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('Quest CRM exposes a Workday route for the daily action queue', () => {
  assert.match(source, /\{ id: 'workday', group: 'Work', label: 'Workday'/);
  assert.match(source, /module_ids: \['workday', 'contacts', 'deals', 'proposals', 'jobs'\]/);
  assert.match(source, /\{ label: 'Work', ids: \['dashboard', 'workday', 'tasks', 'workspaces', 'underwriter'\] \}/);
  assert.match(source, /if \(route\.section === 'workday'\) return renderWorkdayPage\(companyId\);/);
});

test('Workday page combines manager visibility with a live CRM work queue', () => {
  assert.match(source, /function workdayManagerMetrics\(companyId = activeCompanyId\(\)\)/);
  assert.match(source, /function workdayQueueItems\(companyId = activeCompanyId\(\)\)/);
  assert.match(source, /function renderWorkdayPage\(companyId\)/);
  assert.match(source, /Calls today/);
  assert.match(source, /Touched today/);
  assert.match(source, /Untouched leads/);
  assert.match(source, /Overdue follow-ups/);
  assert.match(source, /No next step/);
  assert.match(source, /Form responses/);
  assert.match(source, /data-action="workday-open-item"/);
  assert.match(source, /data-action="workday-quick-action"/);
  assert.match(source, /data-action="workday-complete-item"/);
});

test('Workday quick panel uses real CRM actions and follow-up creation', () => {
  assert.match(source, /function renderWorkdayPanel\(item, companyId\)/);
  assert.match(source, /function workdayOpenRecord\(itemId\)/);
  assert.match(source, /function workdayQuickAction\(itemId, kind\)/);
  assert.match(source, /function createWorkdayFollowupTask\(context, fields\)/);
  assert.match(source, /openDockedActivityComposer\(record\.type, record\.id, kind\)/);
  assert.match(source, /openEstimateBuilder\(record\.type, record\.id\)/);
  assert.match(source, /openProposalBuilder\(record\.type, record\.id\)/);
  assert.match(source, /await createWorkdayFollowupTask\(context, formData\)/);
});

test('logging activity can prompt for a required next step', () => {
  assert.match(source, /workdayNextStepContext: null/);
  assert.match(source, /function openWorkdayNextStepPrompt\(context\)/);
  assert.match(source, /function renderWorkdayNextStepModal\(\)/);
  assert.match(source, /data-workday-next-step-form/);
  assert.match(source, /What happens next\?/);
  assert.match(source, /if \(\['call', 'email', 'note'\]\.includes\(config\.type\)\) openWorkdayNextStepPrompt/);
});

test('Workday has responsive command-center styling', () => {
  assert.match(styles, /\.workday-page/);
  assert.match(styles, /\.workday-manager-grid/);
  assert.match(styles, /\.workday-shell/);
  assert.match(styles, /\.workday-queue/);
  assert.match(styles, /\.workday-panel/);
  assert.match(styles, /\.workday-action-grid/);
  assert.match(styles, /@media \(max-width: 980px\) \{[\s\S]*?\.workday-shell/);
});
