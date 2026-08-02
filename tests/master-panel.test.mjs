import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createPlatformPanel } from '../src/platform/master-panel.js';

// The Master panel is built by handing a module a context object of ~25 functions. Three
// of the things it uses were never in that object — `state`, `filteredPlatformBackupCopies`
// and `renderPlatformBackupCopyRow` — so rendering threw a ReferenceError every time.
//
// The throw happened inside render(), while building the settings page HTML, so
// `app.innerHTML` was never assigned and the previous page simply stayed on screen. The
// URL changed to ?tab=master and nothing else did: the panel looked like a feature that
// had been removed rather than one that was crashing.
//
// Static checks could not see it: every name is spelled correctly and looks defined. So
// this test RENDERS the panel. A missing binding fails here as a ReferenceError, which is
// the only way to be sure the context is complete.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const stubContext = () => ({
  availableWorkspacePlugins: () => [],
  companyColor: () => '#000000',
  companyDirectoryEmptyState: () => '<p>none</p>',
  companyDirectoryFilters: () => ({ page: 1, query: '', status: 'all' }),
  companyName: (id) => String(id),
  emptyState: (text) => `<p>${text}</p>`,
  filterCompanyRows: (rows) => rows,
  filteredPlatformBackupCopies: () => [{ id: 'b1', company_id: 'lumen', created_at: '2026-08-01' }],
  h: (value) => String(value ?? ''),
  isPluginInstalled: () => false,
  metricCard: (label, value) => `<div class="metric">${label}:${value}</div>`,
  number: (value) => Number(value) || 0,
  paginate: (rows) => ({ rows, page: 1, pages: 1, total: rows.length }),
  platformCompanyRows: () => [
    { company_id: 'lumen', company_name: 'Lumen Marketing', status: 'active', member_count: 2 },
    { company_id: 'acme', company_name: 'Acme Roofing', status: 'pending_review', member_count: 5 },
  ],
  platformMembersForCompany: () => [{ profile_id: 'p1', full_name: 'Rom', role: 'owner' }],
  renderAvatar: () => '<i class="avatar"></i>',
  renderCompanyDirectoryPager: () => '<nav class="pager"></nav>',
  renderCompanyDirectoryToolbar: () => '<div class="toolbar"></div>',
  renderPlatformBackupCopyRow: () => '<div class="backup-row"></div>',
  shortUserId: (value) => String(value).slice(0, 8),
  state: { platformBackupFilters: {}, platformBackupCopies: [] },
  subscriptionLabelForStatus: (status) => status,
  titleCase: (value) => value,
  workspaceIconSelect: () => '<select class="icon"></select>',
  workspacePresetSelect: () => '<select class="preset"></select>',
});

test('the panel renders without a missing binding', () => {
  const api = createPlatformPanel(stubContext());
  const html = api.renderPlatformMasterPanel('lumen');
  assert.ok(html.length > 500, 'expected a substantial panel');
});

test('every section the platform owner needs is present', () => {
  // Each of these vanished together when the panel threw, which is why it read as
  // "the Master feature is gone" rather than as an error.
  const html = createPlatformPanel(stubContext()).renderPlatformMasterPanel('lumen');
  for (const [label, needle] of [
    ['heading', 'Master panel'],
    ['create company form', 'Create company workspace'],
    ['company directory', 'platform-company-list'],
    ['a company row', 'Lumen Marketing'],
    ['backup ledger', 'platform-backup-ledger'],
    ['metrics', 'metric'],
  ]) {
    assert.ok(html.includes(needle), `${label} missing from the master panel`);
  }
});

test('the panel still renders when the platform has no companies yet', () => {
  const ctx = { ...stubContext(), platformCompanyRows: () => [], filteredPlatformBackupCopies: () => [] };
  const html = createPlatformPanel(ctx).renderPlatformMasterPanel('lumen');
  assert.ok(html.includes('Master panel'), 'an empty platform must not blank the panel');
});

test('main.js passes everything the module destructures', () => {
  // Belt and braces alongside the render above: catches a key added to the module's
  // destructure without a matching addition on the main.js side.
  const panel = readFileSync(new URL('../src/platform/master-panel.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  const wanted = [...panel.slice(panel.indexOf('const {'), panel.indexOf('} = ctx;')).matchAll(/^\s+([A-Za-z_$][\w$]*),\s*$/gm)].map((m) => m[1]);
  assert.ok(wanted.length >= 20, `expected the context list, parsed ${wanted.length}`);

  const at = main.indexOf('platformPanelApi = module.createPlatformPanel({');
  assert.notEqual(at, -1, 'main.js should build the panel context');
  const passedBlock = main.slice(at, main.indexOf('\n        });', at));
  const passed = new Set([...passedBlock.matchAll(/^\s+([A-Za-z_$][\w$]*),\s*$/gm)].map((m) => m[1]));

  const missing = wanted.filter((key) => !passed.has(key));
  assert.deepEqual(missing, [], `main.js does not pass: ${missing.join(', ')} — the panel will throw on render`);
});

test('a panel that fails to load says so instead of loading forever', () => {
  // The loader used to swallow every error and never re-render, so any failure showed
  // "Loading…" permanently with nothing in the console.
  const at = main.indexOf('function renderPlatformMasterPanel(');
  const fn = main.slice(at, main.indexOf('\n}\n', at));
  assert.match(fn, /console\.error\('Master panel failed to load', error\)/);
  assert.match(fn, /platformPanelError = error;/);
  assert.match(fn, /data-action="retry-master-panel"/);
  assert.match(main, /if \(action === 'retry-master-panel'\)/);
});
