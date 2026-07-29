import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const store = readFileSync(new URL('../taskmanagement/js/services/SupabaseDataStore.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../taskmanagement/js/app.js', import.meta.url), 'utf8');
const filterBar = readFileSync(new URL('../taskmanagement/js/views/FilterBarView.js', import.meta.url), 'utf8');
const newTask = readFileSync(new URL('../taskmanagement/js/views/NewTaskPageView.js', import.meta.url), 'utf8');

// The embedded task app has its own data store, so the host's allowedCompanies()
// filter does not reach it. Archiving a company writes company_subscriptions.status
// = 'canceled'; without reading that table the app cannot know a company is gone.
test('the task app loads subscription status so it can tell archived companies apart', () => {
  assert.match(store, /_optionalSelect\('company_subscriptions'\)/);
  assert.match(store, /archivedCompanyIds:/);
  assert.match(store, /String\(row && row\.status\) === 'canceled'/);
});

test('the subscription read is optional so a permission failure cannot break loading', () => {
  // _optionalSelect swallows errors and returns an empty set, unlike the required
  // selects that go through _throwIfError.
  assert.match(store, /async _optionalSelect\(table\)/);
  assert.doesNotMatch(store, /_throwIfError\(subscriptionsRes/);
});

test('archived companies stay in the map so existing tasks still resolve', () => {
  // Dropping them would leave tasks in an archived company with no label, and
  // validate.js checks payload.company against Object.keys(App.COMPANIES).
  assert.match(app, /const archived = new Set\(saved\.archivedCompanyIds \|\| \[\]\);/);
  assert.match(app, /archived: archived\.has\(row\.id\),/);
  assert.doesNotMatch(app, /saved\.companies\s*\.filter\([^)]*archived/);
});

test('archived companies are excluded from the filter chips', () => {
  assert.match(filterBar, /\.filter\(c => !c\.archived\)\.map\(c => this\.chip\(\{/);
});

test('archived companies are excluded from the new-task picker but not force-switched', () => {
  assert.match(newTask, /ids = ids\.filter\(id => id === cur \|\| !\(App\.directory\.company\(id\) \|\| \{\}\)\.archived\);/);
});
