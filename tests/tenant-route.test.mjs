import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveTenantRoute } from '../src/workspaces/tenant-route.js';

const workspaces = [
  { id: 'alpha-main', slug: 'main', company_id: 'alpha', name: 'Main', is_default: true, status: 'active' },
  { id: 'alpha-sales', slug: 'sales', company_id: 'alpha', name: 'Sales', is_default: false, status: 'active' },
  { id: 'beta-main', slug: 'main', company_id: 'beta', name: 'Main', is_default: true, status: 'active' },
];

const memberships = [
  { workspace_id: 'alpha-sales', profile_id: 'worker-1', status: 'active' },
  { workspace_id: 'beta-main', profile_id: 'worker-1', status: 'active' },
];

test('keeps a company and workspace that the user can access', () => {
  assert.deepEqual(resolveTenantRoute({
    routeCompanyId: 'alpha',
    routeWorkspaceId: 'alpha-sales',
    storedWorkspaceId: 'alpha-main',
    allowedCompanyIds: ['alpha', 'beta'],
    workspaces,
    memberships,
    profileId: 'owner-1',
    companyRoles: { alpha: 'owner', beta: 'owner' },
  }), {
    status: 'ready',
    companyId: 'alpha',
    workspaceId: 'alpha-sales',
    companyChanged: false,
    workspaceChanged: false,
    needsRedirect: false,
  });
});

test('replaces a stale company with the first allowed company and its default workspace', () => {
  assert.deepEqual(resolveTenantRoute({
    routeCompanyId: 'removed-company',
    routeWorkspaceId: 'removed-workspace',
    storedWorkspaceId: '',
    allowedCompanyIds: ['beta', 'alpha'],
    workspaces,
    memberships,
    profileId: 'owner-1',
    companyRoles: { alpha: 'owner', beta: 'owner' },
  }), {
    status: 'ready',
    companyId: 'beta',
    workspaceId: 'beta-main',
    companyChanged: true,
    workspaceChanged: true,
    needsRedirect: true,
  });
});

test('replaces an inaccessible workspace with one assigned to the member', () => {
  assert.deepEqual(resolveTenantRoute({
    routeCompanyId: 'alpha',
    routeWorkspaceId: 'alpha-main',
    storedWorkspaceId: '',
    allowedCompanyIds: ['alpha'],
    workspaces,
    memberships,
    profileId: 'worker-1',
    companyRoles: { alpha: 'member' },
  }), {
    status: 'ready',
    companyId: 'alpha',
    workspaceId: 'alpha-sales',
    companyChanged: false,
    workspaceChanged: true,
    needsRedirect: true,
  });
});

test('uses an allowed stored workspace when the route omits a workspace', () => {
  assert.deepEqual(resolveTenantRoute({
    routeCompanyId: 'alpha',
    routeWorkspaceId: '',
    storedWorkspaceId: 'alpha-sales',
    allowedCompanyIds: ['alpha'],
    workspaces,
    memberships,
    profileId: 'owner-1',
    companyRoles: { alpha: 'owner' },
  }), {
    status: 'ready',
    companyId: 'alpha',
    workspaceId: 'alpha-sales',
    companyChanged: false,
    workspaceChanged: true,
    needsRedirect: true,
  });
});

test('uses the default workspace when route and stored workspaces are unavailable', () => {
  assert.deepEqual(resolveTenantRoute({
    routeCompanyId: 'alpha',
    routeWorkspaceId: '',
    storedWorkspaceId: 'deleted-workspace',
    allowedCompanyIds: ['alpha'],
    workspaces,
    memberships,
    profileId: 'owner-1',
    companyRoles: { alpha: 'owner' },
  }), {
    status: 'ready',
    companyId: 'alpha',
    workspaceId: 'alpha-main',
    companyChanged: false,
    workspaceChanged: true,
    needsRedirect: true,
  });
});

test('preserves the no-access state instead of inventing a tenant', () => {
  assert.deepEqual(resolveTenantRoute({
    routeCompanyId: 'alpha',
    routeWorkspaceId: 'alpha-main',
    storedWorkspaceId: 'alpha-main',
    allowedCompanyIds: [],
    workspaces,
    memberships,
    profileId: 'worker-1',
    companyRoles: {},
  }), {
    status: 'no-access',
    companyId: '',
    workspaceId: '',
    companyChanged: false,
    workspaceChanged: false,
    needsRedirect: false,
  });
});
