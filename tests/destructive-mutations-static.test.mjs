import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('pipeline replacement uses one atomic RPC and checks returned errors', () => {
  assert.match(source, /client\.rpc\('replace_workspace_pipeline_stages', \{[\s\S]*p_workspace_id: workspaceId[\s\S]*p_rename_map: renameMap/);
  assert.match(source, /if \(result\.error\)[\s\S]*Pipeline stage sync/);
  assert.doesNotMatch(source, /from\('pipeline_stages'\)\.delete\(\)[\s\S]{0,300}from\('pipeline_stages'\)\.insert/);
});

test('role save and delete use transactional RPCs', () => {
  assert.match(source, /client\.rpc\('save_company_role', \{ p_role: role, p_permissions: permissions \}\)/);
  assert.match(source, /client\.rpc\('delete_company_role', \{ p_role_id: role\.id \}\)/);
});

test('role and stage deletion require explicit confirmation modals', () => {
  assert.match(source, /function openRoleDeleteModal\(roleId\)/);
  assert.match(source, /function renderRoleDeleteModal\(\)/);
  assert.match(source, /function openPipelineStageDeleteModal\(kind, index\)/);
  assert.match(source, /function renderPipelineStageDeleteModal\(\)/);
  assert.match(source, /data-action="confirm-role-delete"/);
  assert.match(source, /data-action="confirm-pipeline-stage-delete"/);
});
