import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ADMIN_TABS,
  PEOPLE_ACCESS_TABS,
  SETUP_TABS,
  canonicalSettingsDestination,
  normalizeSettingsSurfaceTab,
  settingsSurfaceTabs,
} from '../src/settings/navigation-model.js';
import { createSettingsSurfaces } from '../src/settings/settings-surfaces.js';

function fakeSurfaceContext({ billingMode = 'manual', developer = false, permissions = ['*'] } = {}) {
  const allowed = new Set(permissions);
  return {
    activeWorkspace: () => ({ id: 'workspace-a', name: 'Sales' }),
    appHref: (value) => value,
    availableWorkspacePlugins: () => [],
    billingMode,
    can: (permission) => allowed.has('*') || allowed.has(permission),
    companyAccessUsers: () => [{ status: 'active' }],
    companyAuditEvents: () => [],
    companyDirectoryEmptyState: () => 'NO_COMPANIES',
    companyDirectoryFilters: () => ({ status: 'active', page: 0 }),
    companyName: () => 'Acme',
    companyPath: (section, params = {}) => `/${section}?tab=${params.tab || ''}`,
    companySubscription: () => ({ status: 'active' }),
    compactTabs: (_label, items) => items.map((item) => item[1]).join('|'),
    contractRows: () => '<div>ROWS</div>',
    emptyState: (message) => `<div>${message}</div>`,
    filterCompanyRows: (rows) => rows,
    formatDate: String,
    h: String,
    isPluginInstalled: () => false,
    isQuestDeveloper: () => developer,
    navigationLabel: (_section, fallback) => fallback,
    paginate: (rows) => ({ rows }),
    profileById: () => null,
    questAuthEnabled: true,
    renderAppearanceControls: () => 'APPEARANCE',
    renderAvatar: () => 'AVATAR',
    renderBackupsSettings: () => 'BACKUPS',
    renderCompanySetupSettings: () => 'WORKSPACE_SETUP',
    renderHandoffReviewPanel: () => 'HANDOFFS',
    renderPlatformMasterPanel: () => 'PLATFORM',
    renderPluginsSettings: () => 'MODULES',
    renderRecycleBinSettings: () => 'RECYCLE',
    renderCompanyDirectoryPager: () => 'PAGER',
    renderCompanyDirectoryToolbar: () => 'TOOLBAR',
    renderWorkspaceSettingsSurface: (method) => method,
    roleForCompany: () => 'Owner',
    shortUserId: String,
    state: { sync: { mode: 'live', label: 'Connected' } },
    subscriptionAllowsCompany: () => true,
    subscriptionLabel: () => 'Active',
    subscriptionLabelForStatus: (status) => status,
    subscriptionNeedsReview: () => false,
    titleCase: (value) => value,
    workspaceHeader: (title) => `<h1>${title}</h1>`,
    workspaceReviewRows: () => [],
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
  assert.equal(normalizeSettingsSurfaceTab('admin', 'platform', { can: (permission) => permission === 'billing.view' }), 'billing');
  assert.equal(normalizeSettingsSurfaceTab('admin', 'platform', { isDeveloper: true }), 'platform');
  assert.equal(normalizeSettingsSurfaceTab('admin', 'wrong', { isDeveloper: true }), 'billing');
});

test('admin tabs are independently gated by the permission that protects their data', () => {
  const canOnly = (...permissions) => {
    const allowed = new Set(permissions);
    return (permission) => allowed.has(permission);
  };

  assert.deepEqual(settingsSurfaceTabs('admin'), []);
  assert.deepEqual(settingsSurfaceTabs('admin', { can: canOnly('settings.view') }), []);
  assert.deepEqual(settingsSurfaceTabs('admin', { can: canOnly('billing.view') }).map(({ id }) => id), ['billing']);
  assert.deepEqual(settingsSurfaceTabs('admin', { can: canOnly('settings.manage') }).map(({ id }) => id), [
    'data-recovery',
    'audit-history',
    'diagnostics',
  ]);
  assert.deepEqual(settingsSurfaceTabs('admin', { can: canOnly('users.manage') }).map(({ id }) => id), ['audit-history']);
  assert.deepEqual(settingsSurfaceTabs('admin', { isDeveloper: true }).map(({ id }) => id), ADMIN_TABS.map(({ id }) => id));
});

test('setup and admin compose the existing screens instead of duplicating their data paths', () => {
  const surfaces = createSettingsSurfaces(fakeSurfaceContext());
  const modules = surfaces.renderSetupPage({ params: new URLSearchParams('tab=modules') }, 'company-a');
  assert.match(modules, /<h1>Setup<\/h1>/);
  assert.match(modules, /MODULES/);
  assert.doesNotMatch(modules, /Subscription|Billing gate|BACKUPS|RECYCLE/);

  const recovery = surfaces.renderAdminPage({ params: new URLSearchParams('tab=data-recovery') }, 'company-a');
  assert.match(recovery, /<h1>Admin<\/h1>/);
  assert.match(recovery, /BACKUPS[\s\S]*RECYCLE/);
  assert.doesNotMatch(recovery, /PLATFORM/);
});

test('a non-developer cannot open platform administration by typing its URL', () => {
  const normal = createSettingsSurfaces(fakeSurfaceContext()).renderAdminPage({ params: new URLSearchParams('tab=platform') }, 'company-a');
  assert.match(normal, /Subscription/);
  assert.doesNotMatch(normal, /PLATFORM/);

  const developer = createSettingsSurfaces(fakeSurfaceContext({ developer: true })).renderAdminPage({ params: new URLSearchParams('tab=platform') }, 'company-a');
  assert.match(developer, /PLATFORM/);
  assert.doesNotMatch(developer, /Subscription|Billing gate/);
});

test('a billing viewer cannot open recovery by typing its URL', () => {
  const billingOnly = createSettingsSurfaces(fakeSurfaceContext({ permissions: ['billing.view'] }))
    .renderAdminPage({ params: new URLSearchParams('tab=data-recovery') }, 'company-a');
  assert.match(billingOnly, /Subscription/);
  assert.doesNotMatch(billingOnly, /BACKUPS|RECYCLE|Audit History|Diagnostics/);
});

test('settings managers see recovery and diagnostics but not billing controls', () => {
  const manager = createSettingsSurfaces(fakeSurfaceContext({ permissions: ['settings.manage'] }));
  const recovery = manager.renderAdminPage({ params: new URLSearchParams('tab=data-recovery') }, 'company-a');
  assert.match(recovery, /BACKUPS[\s\S]*RECYCLE/);
  assert.doesNotMatch(recovery, /Subscription|Billing gate/);

  const invalid = manager.renderAdminPage({ params: new URLSearchParams('tab=billing') }, 'company-a');
  assert.match(invalid, /BACKUPS[\s\S]*RECYCLE/);
  assert.doesNotMatch(invalid, /Subscription|Billing gate/);
});

test('billing viewers can inspect billing but only billing managers can start checkout', () => {
  const viewer = createSettingsSurfaces(fakeSurfaceContext({
    billingMode: 'stripe',
    permissions: ['billing.view'],
  })).renderAdminPage({ params: new URLSearchParams('tab=billing') }, 'company-a');
  assert.match(viewer, /data-action="start-checkout" disabled/);

  const manager = createSettingsSurfaces(fakeSurfaceContext({
    billingMode: 'stripe',
    permissions: ['billing.view', 'billing.manage'],
  })).renderAdminPage({ params: new URLSearchParams('tab=billing') }, 'company-a');
  assert.match(manager, /data-action="start-checkout" ><i/);
});
