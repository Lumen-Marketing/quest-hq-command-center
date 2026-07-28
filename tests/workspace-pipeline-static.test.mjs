import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

function functionSource(name) {
  const match = source.match(new RegExp(`(?:async )?function ${name}\\b[\\s\\S]*?(?=\\n(?:async )?function |$)`));
  assert.ok(match, `Expected ${name} to exist`);
  return match[0];
}

test('workspace-owned records preserve workspace identity through normalization', () => {
  [
    'normalizeProposal',
    'normalizeJob',
    'normalizeContact',
    'normalizeCrmSite',
    'normalizeAccount',
    'normalizeDeal',
    'normalizeActivity',
    'normalizeTask',
    'normalizeUnderwritingCase',
    'normalizeFile',
  ].forEach((name) => {
    assert.match(functionSource(name), /workspace_id: String\(input\.workspace_id \|\| ''\)/, `${name} must preserve workspace_id`);
  });
});

test('company record selectors are scoped to the active operational workspace', () => {
  assert.match(source, /function recordVisibleInOperationalWorkspace\(record, companyId = activeCompanyId\(\)\)/);
  [
    ['companyProposals', 'proposal'],
    ['companyJobs', 'job'],
    ['companyTasks', 'task'],
    ['companyFiles', 'file'],
    ['companyContacts', 'contact'],
    ['companyAccounts', 'account'],
    ['companyCrmSites', 'site'],
    ['companyDeals', 'deal'],
    ['companyActivities', 'activity'],
  ].forEach(([name, variable]) => {
    // Accept either the per-record predicate recordVisibleInOperationalWorkspace(x, companyId)
    // or the hoisted collection helper recordsVisibleInOperationalWorkspace(state.X, companyId);
    // both enforce the same company/workspace scoping.
    assert.match(functionSource(name), new RegExp(`records?VisibleInOperationalWorkspace\\((${variable}|state\\.\\w+), companyId\\)`), `${name} must filter by workspace`);
  });
  assert.match(functionSource('underwritingCaseForContact'), /recordVisibleInOperationalWorkspace\(item, companyId\)/);
});

test('workspace-owned table payloads always include workspace_id', () => {
  assert.match(source, /const ACCOUNT_COLS = \['id', 'company_id', 'workspace_id'/);
  assert.match(source, /const SITE_COLS = \['id', 'company_id', 'workspace_id'/);
  assert.match(source, /const DEAL_COLS = \['id', 'company_id', 'workspace_id'/);
  assert.match(source, /const JOB_COLS = \['id', 'company_id', 'workspace_id'/);
  assert.match(source, /const PROPOSAL_COLS = \['id', 'company_id', 'workspace_id'/);
  assert.match(source, /const ACTIVITY_COLS = \['id', 'company_id', 'workspace_id'/);
  assert.match(source, /const CONTACT_COLS = \['id', 'company_id', 'workspace_id'/);
  assert.match(functionSource('taskPayload'), /workspace_id: task\.workspace_id \|\| activeWorkspaceId\(\)/);
  assert.match(functionSource('filePayload'), /workspace_id: file\.workspace_id \|\| activeWorkspaceId\(\)/);
  assert.match(functionSource('underwritingCasePayload'), /workspace_id: item\.workspace_id \|\| activeWorkspaceId\(\)/);
});

test('new records and CRM conversions inherit the active or source workspace', () => {
  assert.match(functionSource('saveJob'), /payload\.workspace_id = payload\.workspace_id \|\| activeWorkspaceId\(\)/);
  assert.match(functionSource('saveTask'), /workspace_id: activeWorkspaceId\(\)/);
  assert.match(functionSource('saveAccount'), /payload\.workspace_id = payload\.workspace_id \|\| activeWorkspaceId\(\)/);
  assert.match(functionSource('saveDeal'), /payload\.workspace_id = payload\.workspace_id \|\| activeWorkspaceId\(\)/);
  assert.match(functionSource('proposalRecordFromDraft'), /workspace_id: existing\?\.workspace_id \|\| activeWorkspaceId\(\)/);
  assert.match(functionSource('logActivity'), /workspace_id: input\.workspace_id \|\| activeWorkspaceId\(\)/);
  assert.match(functionSource('convertDealToJob'), /workspace_id: deal\.workspace_id \|\| activeWorkspaceId\(\)/);
});

test('pipeline stages are loaded and replaced per operational workspace', () => {
  assert.match(functionSource('applyPipelineStagesForCompany'), /const workspaceId = workspaceIdForCompany\(companyId\)/);
  assert.match(functionSource('applyPipelineStagesForCompany'), /recordBelongsToWorkspace\(row, workspaceId, defaultOperationalWorkspaceId\(companyId\)\)/);
  assert.match(functionSource('syncPipelineStagesToSupabase'), /client\.rpc\('replace_workspace_pipeline_stages'/);
  assert.match(functionSource('syncPipelineStagesToSupabase'), /p_workspace_id: workspaceId/);
  assert.match(functionSource('syncPipelineStagesToSupabase'), /row\.workspace_id === workspaceId/);
});
