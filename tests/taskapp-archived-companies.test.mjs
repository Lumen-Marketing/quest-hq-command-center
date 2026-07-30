import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const store = readFileSync(new URL('../taskmanagement/js/services/SupabaseDataStore.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../taskmanagement/js/app.js', import.meta.url), 'utf8');
const controller = readFileSync(new URL('../taskmanagement/js/controllers/AppController.js', import.meta.url), 'utf8');
const filterBar = readFileSync(new URL('../taskmanagement/js/views/FilterBarView.js', import.meta.url), 'utf8');
const newTask = readFileSync(new URL('../taskmanagement/js/views/NewTaskPageView.js', import.meta.url), 'utf8');
const sidebar = readFileSync(new URL('../taskmanagement/js/views/SidebarView.js', import.meta.url), 'utf8');
const topbar = readFileSync(new URL('../taskmanagement/js/views/TopbarView.js', import.meta.url), 'utf8');
const taskSetup = readFileSync(new URL('../taskmanagement/js/views/TaskSetupAdminView.js', import.meta.url), 'utf8');
const tableLayout = readFileSync(new URL('../taskmanagement/js/views/tasklist/TableLayout.js', import.meta.url), 'utf8');
const taskDetail = readFileSync(new URL('../taskmanagement/js/views/TaskDetailView.js', import.meta.url), 'utf8');

// The embedded task app has its own data store, so the host's allowedCompanies()
// filter does not reach it. Lifecycle state is carried by company_subscriptions;
// without reading that table the app cannot know a company is inactive.
test('the task app loads subscription status into inactive company ids', () => {
  assert.match(store, /_optionalSelect\('company_subscriptions'\)/);
  assert.match(store, /inactiveCompanyIds:/);
  assert.match(store, /\['archived', 'rejected', 'canceled'\]\.includes\(String\(row && row\.status\)\)/);
});

test('the subscription read is optional so a permission failure cannot break loading', () => {
  // _optionalSelect swallows errors and returns an empty set, unlike the required
  // selects that go through _throwIfError.
  assert.match(store, /async _optionalSelect\(table\)/);
  assert.doesNotMatch(store, /_throwIfError\(subscriptionsRes/);
});

test('inactive companies stay in the map so existing tasks still resolve', () => {
  // Dropping them would leave tasks in an inactive company with no label, and
  // validate.js checks payload.company against Object.keys(App.COMPANIES).
  assert.match(app, /const inactive = new Set\(saved\.inactiveCompanyIds \|\| \[\]\);/);
  assert.match(app, /inactive: inactive\.has\(row\.id\),/);
  assert.doesNotMatch(app, /saved\.companies\s*\.filter\([^)]*inactive/);
});

test('inactive companies are excluded from the filter chips', () => {
  assert.match(filterBar, /\.filter\(c => !c\.inactive\)\.map\(c => this\.chip\(\{/);
});

test('inactive companies are excluded from the new-task picker but not force-switched', () => {
  assert.match(newTask, /ids = ids\.filter\(id => id === cur \|\| !\(App\.directory\.company\(id\) \|\| \{\}\)\.inactive\);/);
});

const CONTEXT_COMPANIES = {
  'active-a': { id: 'active-a', label: 'Active A', inactive: false },
  'inactive-current': { id: 'inactive-current', label: 'Inactive current', inactive: true },
  'inactive-hidden': { id: 'inactive-hidden', label: 'Inactive hidden', inactive: true },
};

function companyContextHarness({
  stored,
  role = 'member',
  companies = CONTEXT_COMPANIES,
  assigned = ['active-a', 'inactive-current', 'inactive-hidden'],
} = {}) {
  const start = controller.indexOf('  initCompanyContext() {');
  const end = controller.indexOf('\n  _companyKey() {', start);
  assert.ok(start >= 0 && end > start, 'expected initCompanyContext source');
  const method = controller.slice(start, end).replace('  initCompanyContext() {', 'function initCompanyContext() {');
  const App = {
    realRole: () => role,
    currentProfile: { id: 'profile-1', company_ids: assigned },
    COMPANIES: companies,
  };
  const localStorage = { getItem: () => stored || null };
  const target = { uiState: { companies: [], currentCompany: null }, _companyKey: () => 'company-key' };
  const run = new Function('App', 'localStorage', 'target', `${method}\ninitCompanyContext.call(target);\nreturn target.uiState;`);
  return run(App, localStorage, target);
}

test('company context centrally hides inactive companies while retaining the selected inactive company', () => {
  assert.deepEqual(companyContextHarness({ stored: 'inactive-current' }), {
    companies: ['*', 'active-a', 'inactive-current'],
    currentCompany: 'inactive-current',
  });
  assert.deepEqual(companyContextHarness({ stored: 'active-a' }), {
    companies: ['active-a'],
    currentCompany: 'active-a',
  });
});

test('central company context preserves the developer all-companies sentinel', () => {
  assert.deepEqual(companyContextHarness({ stored: '*', role: 'developer' }), {
    companies: ['*', 'active-a'],
    currentCompany: '*',
  });
});

test('only-inactive access with no stored current produces an empty shared company context', () => {
  const companies = {
    'inactive-a': { id: 'inactive-a', label: 'Inactive A', inactive: true },
    'inactive-b': { id: 'inactive-b', label: 'Inactive B', inactive: true },
  };
  assert.deepEqual(companyContextHarness({ companies, assigned: ['inactive-a', 'inactive-b'] }), {
    companies: [],
    currentCompany: null,
  });
});

test('all task company surfaces consume the centrally filtered company context', () => {
  assert.match(sidebar, /this\.controller\.uiState\.companies/);
  assert.match(topbar, /this\.controller\.uiState\.companies/);
  assert.match(taskSetup, /this\.controller\.uiState\.companies/);
  assert.match(controller, /localStorage\.setItem\(this\._companyKey\(\), id\);[\s\S]*this\.initCompanyContext\(\);/);
});

function sourceBetween(source, startText, endText) {
  const start = source.indexOf(startText);
  const end = source.indexOf(endText, start);
  assert.ok(start >= 0 && end > start, `expected source between ${startText} and ${endText}`);
  return source.slice(start, end);
}

test('empty table-layout fallbacks do not repopulate inactive companies', () => {
  const chipSource = sourceBetween(tableLayout, '  function qtChipRow(view) {', '\n  // The rendered column header');
  const modelSource = sourceBetween(tableLayout, '  function columnFilterModel(view, col) {', '\n  /* App.Menu owns');
  const App = {
    COMPANIES: {
      'inactive-a': { id: 'inactive-a', label: 'Inactive A', inactive: true },
      overall: { id: 'overall', label: 'Overall', all: true },
    },
    directory: { company(id) { return App.COMPANIES[id]; } },
    utils: { escapeHtml: (value) => String(value) },
  };
  const view = { controller: { uiState: { companies: [], filters: { companies: [] } }, setCompanyScopeFilter() {} } };
  const document = { createElement: () => ({ className: '', innerHTML: '', querySelectorAll: () => [] }) };
  const run = new Function('App', 'document', 'view', `${chipSource}\n${modelSource}\nreturn { html: qtChipRow(view).innerHTML, options: columnFilterModel(view, 'companies').options };`);
  const result = run(App, document, view);
  assert.doesNotMatch(result.html, /inactive-a/);
  assert.deepEqual(result.options, []);
});

test('task detail fallback preserves its current inactive company but excludes other inactive targets', () => {
  const method = sourceBetween(taskDetail, '  _companyOpts(current) {', '\n  // Build the editor element')
    .replace('  _companyOpts(current) {', 'function companyOpts(current) {');
  const App = {
    COMPANIES: {
      active: { id: 'active', label: 'Active', inactive: false },
      current: { id: 'current', label: 'Current inactive', inactive: true },
      hidden: { id: 'hidden', label: 'Hidden inactive', inactive: true },
      overall: { id: 'overall', label: 'Overall', all: true },
    },
    directory: { company(id) { return App.COMPANIES[id]; } },
  };
  const context = { controller: { uiState: { companies: [] } } };
  const run = new Function('App', 'context', 'current', `${method}\nreturn companyOpts.call(context, current);`);
  assert.deepEqual(run(App, context, 'current'), [['current', 'Current inactive'], ['active', 'Active']]);
  assert.deepEqual(run(App, context, ''), [['active', 'Active']]);
});
