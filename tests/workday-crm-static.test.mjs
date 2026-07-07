import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const smoke = readFileSync(new URL('../scripts/production-smoke.mjs', import.meta.url), 'utf8');

test('Quest CRM exposes a Workday route for the daily action queue', () => {
  assert.match(source, /\{ id: 'workday', group: 'Quest CRM', label: 'Workday'/);
  assert.match(source, /module_ids: \['workday', 'contacts', 'deals', 'proposals', 'jobs'\]/);
  assert.match(source, /\{ label: 'Quest CRM', ids: \['workday', 'contacts', 'deals', 'proposals', 'jobs'\] \}/);
  assert.match(source, /\{ label: 'Work', ids: \['dashboard', 'tasks', 'workspaces', 'underwriter'\] \}/);
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

test('Workday route is covered by production smoke checks', () => {
  assert.match(smoke, /'workday'/);
});

test('Workday exposes a manager view mode beside the rep queue', () => {
  assert.match(source, /workdayMode: 'queue'/);
  assert.match(source, /selectedWorkdayManagerRepId: ''/);
  assert.match(source, /workdayManagerAlertFilter: 'all'/);
  assert.match(source, /function renderWorkdayModeTabs\(/);
  assert.match(source, /My Queue/);
  assert.match(source, /Manager View/);
  assert.match(source, /data-action="set-workday-mode"/);
});

test('Workday manager helpers derive team visibility from existing CRM data', () => {
  assert.match(source, /function workdayRepVisibilityRows\(companyId = activeCompanyId\(\)\)/);
  assert.match(source, /function workdayManagerAlertItems\(companyId = activeCompanyId\(\)\)/);
  assert.match(source, /callsToday/);
  assert.match(source, /touchesToday/);
  assert.match(source, /openTasks/);
  assert.match(source, /overdueTasks/);
  assert.match(source, /noNextStep/);
  assert.match(source, /lastActivityAt/);
  assert.match(source, /Unassigned/);
});

test('Workday manager view renders team pulse rep visibility and attention alerts', () => {
  assert.match(source, /function renderWorkdayManagerView\(companyId\)/);
  assert.match(source, /Team Pulse/);
  assert.match(source, /Rep Visibility/);
  assert.match(source, /Needs Attention/);
  assert.match(source, /data-action="open-workday-rep"/);
  assert.match(source, /data-action="open-workday-alert"/);
  assert.match(source, /data-action="filter-workday-alerts"/);
});

test('Workday manager detail panel can focus one rep workload', () => {
  assert.match(source, /function renderWorkdayRepDetailPanel\(repRow, companyId\)/);
  assert.match(source, /Open workload/);
  assert.match(source, /Overdue follow-ups/);
  assert.match(source, /Records with no next step/);
});

test('Workday manager view has responsive non-overflow styling', () => {
  assert.match(styles, /\.workday-mode-tabs/);
  assert.match(styles, /\.workday-manager-view/);
  assert.match(styles, /\.workday-rep-table/);
  assert.match(styles, /\.workday-alert-list/);
  assert.match(styles, /\.workday-rep-detail/);
  assert.match(styles, /@media \(max-width: 980px\) \{[\s\S]*?\.workday-manager-view/);
});

test('Workday manager UI uses scannable command components', () => {
  assert.match(source, /function workdayMetricTone\(/);
  assert.match(source, /function workdayStatusTone\(/);
  assert.match(source, /function workdayAlertTone\(/);
  assert.match(source, /workday-rep-head/);
  assert.match(source, /workday-status-pill/);
  assert.match(source, /workday-alert-icon/);
  assert.match(source, /workday-filter-count/);
  assert.match(styles, /\.workday-rep-head/);
  assert.match(styles, /\.workday-status-pill/);
  assert.match(styles, /\.workday-alert-item\.tone-critical/);
  assert.match(styles, /\.workday-alert-icon/);
  assert.match(styles, /\.workday-filter-count/);
});

test('Workday My Queue uses scannable command components', () => {
  assert.match(source, /function workdayQueueTone\(/);
  assert.match(source, /function workdayQueueIcon\(/);
  assert.match(source, /function workdayQueueActionHint\(/);
  assert.match(source, /workday-queue-summary/);
  assert.match(source, /workday-queue-icon/);
  assert.match(source, /workday-queue-priority/);
  assert.match(source, /workday-panel-summary/);
  assert.match(source, /workday-panel-action-head/);
  assert.match(styles, /\.workday-queue-item\.tone-critical/);
  assert.match(styles, /\.workday-queue-icon/);
  assert.match(styles, /\.workday-queue-priority/);
  assert.match(styles, /\.workday-panel-summary/);
  assert.match(styles, /\.workday-panel-action-head/);
});
