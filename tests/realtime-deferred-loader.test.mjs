import assert from 'node:assert/strict';
import test from 'node:test';
import { loadDeferredRealtimeDomain } from '../src/data/realtime-deferred-loader.js';

test('access results preserve the server batch order when routed into state', async () => {
  const state = { workspaceLoadEpoch: 9, pluginLoadFailed: true };
  const dependencies = Array(67).fill((row) => row);
  dependencies[0] = {};
  dependencies[1] = 'access';
  dependencies[2] = 9;
  dependencies[3] = state;
  dependencies[4] = async (_client, domain) => {
    assert.equal(domain, 'access');
    return Array.from({ length: 16 }, (_, index) => ({ error: null, data: [{ id: index }] }));
  };
  dependencies[5] = () => {};
  dependencies[6] = (rows) => rows;
  dependencies[7] = () => {};
  dependencies[8] = (_previous, rows) => rows;
  dependencies[9] = () => 'company-1';
  dependencies[10] = () => {};
  dependencies[11] = () => {};

  const normalizerNames = [
    'daily', 'costBucket', 'draw', 'changeOrder', 'changeOrderLine', 'plan', 'job', 'task', 'calendarEvent',
    'contact', 'account', 'deal', 'crmSite', 'activity', 'file', 'form', 'formResponse', 'financeInvoice',
    'financePayment', 'financeExpense', 'financeVendor', 'clientPortal', 'clientPortalDocument',
    'clientPortalAnnotation', 'clientPortalEvent', 'pricebookVendor', 'pricebookMaterial', 'pricebookPrice',
    'notification', 'timeEntry', 'proposal', 'recycleBinItem', 'underwritingCase', 'workspaceBackup',
    'messageConversation', 'messageAccess', 'message', 'messageAttachment', 'messageRead', 'company',
    'teamMember', 'membership', 'profile', 'subscription', 'role', 'rolePermission', 'roleAssignment',
    'resourceAcl', 'fieldPermission', 'companyInvite', 'joinRequest', 'companyPlugin',
    'operationalWorkspace', 'workspaceMembership', 'workspacePlugin',
  ];
  normalizerNames.forEach((name, index) => {
    dependencies[12 + index] = (row) => ({ normalizer: name, id: row.id });
  });

  await loadDeferredRealtimeDomain(dependencies);

  const routed = [
    ['companies', 'company'], ['teamMembers', 'teamMember'], ['memberships', 'membership'], ['profiles', 'profile'],
    ['subscriptions', 'subscription'], ['roles', 'role'], ['rolePermissions', 'rolePermission'],
    ['roleAssignments', 'roleAssignment'], ['resourceAcl', 'resourceAcl'], ['fieldPermissions', 'fieldPermission'],
    ['companyInvites', 'companyInvite'], ['joinRequests', 'joinRequest'],
    ['operationalWorkspaces', 'operationalWorkspace'], ['workspaceMemberships', 'workspaceMembership'],
    ['workspacePlugins', 'workspacePlugin'],
  ];
  routed.forEach(([field, normalizer], index) => {
    const batchIndex = index < 12 ? index : index + 1;
    assert.deepEqual(state[field], [{ normalizer, id: batchIndex }], `${field} should receive access result ${batchIndex}`);
  });
  assert.deepEqual(state.companyPlugins, [{ normalizer: 'companyPlugin', id: 12 }]);
  assert.equal(state.pluginLoadFailed, false);
});
