import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ADMIN_TABS,
  PEOPLE_ACCESS_TABS,
  SETUP_TABS,
  canonicalSettingsDestination,
  normalizeSettingsSurfaceTab,
} from '../src/settings/navigation-model.js';
import { createSettingsSurfaces } from '../src/settings/settings-surfaces.js';

function fakeSurfaceContext({ developer = false } = {}) {
  return {
    activeWorkspace: () => ({ id: 'workspace-a', name: 'Sales' }),
    appHref: (value) => value,
    availableWorkspacePlugins: () => [],
    can: () => true,
    companyAccessUsers: () => [{ status: 'active' }],
    companyAuditEvents: () => [],
    companyName: () => 'Acme',
    companyPath: (section, params = {}) => `/${section}?tab=${params.tab || ''}`,
    compactTabs: (_label, items) => items.map((item) => item[1]).join('|'),
    contractRows: () => '<div>ROWS</div>',
    emptyState: (message) => `<div>${message}</div>`,
    h: String,
    isPluginInstalled: () => false,
    isQuestDeveloper: () => developer,
    navigationLabel: (_section, fallback) => fallback,
    renderAdminAuditEventRow: () => '<div>EVENT</div>',
    renderAppearanceControls: () => 'APPEARANCE',
    renderBackupsSettings: () => 'BACKUPS',
    renderBillingSettings: () => 'BILLING',
    renderCompanySetupSettings: () => 'WORKSPACE_SETUP',
    renderHandoffReviewPanel: () => 'HANDOFFS',
    renderPlatformMasterPanel: () => 'PLATFORM',
    renderPluginsSettings: () => 'MODULES',
    renderRecycleBinSettings: () => 'RECYCLE',
    renderWorkspaceSettingsSurface: (method) => method,
    roleForCompany: () => 'Owner',
    state: { sync: { mode: 'live', label: 'Connected' } },
    titleCase: (value) => value,
    workspaceHeader: (title) => `<h1>${title}</h1>`,
  };
}

test('legacy settings links resolve to the new owner-facing destination without losing the task', () => {
  const cases = [
    ['company', { section: 'setup', tab: 'company-profile' }],
    ['setup', { section: 'setup', tab: 'workspaces' }],
    ['plugins', { section: 'setup', tab: 'modules' }],
    ['handoff-review', { section: 'setup', tab: 'handoffs' }],
    ['roles', { section: 'users', tab: 'roles' }],
    ['access', { section: 'users', tab: 'access' }],
    ['team', { section: 'users', tab: 'members' }],
    ['billing', { section: 'admin', tab: 'billing' }],
    ['backups', { section: 'admin', tab: 'data-recovery' }],
    ['recycle-bin', { section: 'admin', tab: 'data-recovery' }],
    ['master', { section: 'admin', tab: 'platform' }],
  ];

  for (const [legacyTab, expected] of cases) {
    assert.deepEqual(canonicalSettingsDestination(legacyTab), expected, legacyTab);
  }
  assert.deepEqual(canonicalSettingsDestination('not-a-real-tab'), { section: 'setup', tab: 'company-profile' });
});

test('setup, people and admin expose the approved information architecture', () => {
  assert.deepEqual(SETUP_TABS.map(({ id, label }) => [id, label]), [
    ['company-profile', 'Company Profile'],
    ['company-brand', 'Company Brand'],
    ['workspaces', 'Workspaces'],
    ['modules', 'Modules'],
    ['pipelines', 'Pipelines'],
    ['handoffs', 'Handoffs'],
    ['integrations', 'Integrations'],
    ['launch-check', 'Launch Check'],
  ]);
  assert.deepEqual(PEOPLE_ACCESS_TABS.map(({ id, label }) => [id, label]), [
    ['members', 'Members'],
    ['roles', 'Roles'],
    ['access', 'Access'],
    ['invites', 'Invites'],
  ]);
  assert.deepEqual(ADMIN_TABS.map(({ id, label }) => [id, label]), [
    ['billing', 'Billing'],
    ['data-recovery', 'Data & Recovery'],
    ['audit-history', 'Audit History'],
    ['diagnostics', 'Diagnostics'],
    ['platform', 'Platform'],
  ]);
});

test('surface tabs fall back safely and hide developer-only platform administration', () => {
  assert.equal(normalizeSettingsSurfaceTab('setup', 'modules'), 'modules');
  assert.equal(normalizeSettingsSurfaceTab('setup', 'wrong'), 'company-profile');
  assert.equal(normalizeSettingsSurfaceTab('people', 'roles'), 'roles');
  assert.equal(normalizeSettingsSurfaceTab('admin', 'platform', { isDeveloper: false }), 'billing');
  assert.equal(normalizeSettingsSurfaceTab('admin', 'platform', { isDeveloper: true }), 'platform');
  assert.equal(normalizeSettingsSurfaceTab('admin', 'wrong', { isDeveloper: true }), 'billing');
});

test('setup and admin compose the existing screens instead of duplicating their data paths', () => {
  const surfaces = createSettingsSurfaces(fakeSurfaceContext());
  const modules = surfaces.renderSetupPage({ params: new URLSearchParams('tab=modules') }, 'company-a');
  assert.match(modules, /<h1>Setup<\/h1>/);
  assert.match(modules, /MODULES/);
  assert.doesNotMatch(modules, /BILLING|BACKUPS|RECYCLE/);

  const recovery = surfaces.renderAdminPage({ params: new URLSearchParams('tab=data-recovery') }, 'company-a');
  assert.match(recovery, /<h1>Admin<\/h1>/);
  assert.match(recovery, /BACKUPS[\s\S]*RECYCLE/);
  assert.doesNotMatch(recovery, /PLATFORM/);
});

test('a non-developer cannot open platform administration by typing its URL', () => {
  const normal = createSettingsSurfaces(fakeSurfaceContext()).renderAdminPage({ params: new URLSearchParams('tab=platform') }, 'company-a');
  assert.match(normal, /BILLING/);
  assert.doesNotMatch(normal, /PLATFORM/);

  const developer = createSettingsSurfaces(fakeSurfaceContext({ developer: true })).renderAdminPage({ params: new URLSearchParams('tab=platform') }, 'company-a');
  assert.match(developer, /PLATFORM/);
  assert.doesNotMatch(developer, /BILLING/);
});
