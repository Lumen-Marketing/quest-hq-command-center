import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('runtime imports and stores operational workspace identity', () => {
  assert.match(source, /from '\.\/workspaces\/model\.js';/);
  assert.match(source, /const ACTIVE_WORKSPACE_KEY = 'quest-hq-active-operational-workspace-v1';/);
  assert.match(source, /operationalWorkspaces:\s*\[\]/);
  assert.match(source, /workspaceMemberships:\s*\[\]/);
  assert.match(source, /workspacePlugins:\s*\[\]/);
  assert.match(source, /activeWorkspaceId:\s*localStorage\.getItem\(ACTIVE_WORKSPACE_KEY\)/);
});

test('live data loading includes workspaces, assignments, and workspace plugin state', () => {
  assert.match(source, /client\.from\('workspaces'\)\.select\('\*'\)/);
  assert.match(source, /client\.from\('workspace_memberships'\)\.select\('\*'\)/);
  assert.match(source, /client\.from\('workspace_plugins'\)\.select\('\*'\)/);
  assert.match(source, /state\.operationalWorkspaces\s*=\s*\(workspacesResult\.data \|\| \[\]\)\.map\(normalizeOperationalWorkspace\)/);
  assert.match(source, /state\.workspaceMemberships\s*=\s*\(workspaceMembershipsResult\.data \|\| \[\]\)\.map\(normalizeWorkspaceMembership\)/);
  assert.match(source, /state\.workspacePlugins\s*=\s*\(workspacePluginsResult\.data \|\| \[\]\)\.map\(normalizeWorkspacePlugin\)/);
});

test('route reconciliation selects only an allowed child workspace', () => {
  assert.match(source, /function allowedOperationalWorkspaces\(/);
  assert.match(source, /function activeWorkspaceId\(/);
  assert.match(source, /function setActiveWorkspace\(/);
  assert.match(source, /workspaceForRoute\(\{/);
  assert.match(source, /route\.params\.get\('workspace'\)/);
  assert.match(source, /localStorage\.setItem\(ACTIVE_WORKSPACE_KEY/);
  assert.match(source, /search\.set\('workspace', workspaceId\)/);
});

test('live company access derives from memberships instead of mutable profile metadata', () => {
  const start = source.indexOf('function allowedCompanyIds()');
  const end = source.indexOf('\nfunction activeCompanyId()', start);
  assert.ok(start >= 0 && end > start, 'allowedCompanyIds function should be present');
  const functionSource = source.slice(start, end);
  const liveBranchStart = functionSource.indexOf("if (state.session?.auth === 'supabase')");
  const liveBranchEnd = functionSource.indexOf('\n  }', liveBranchStart);
  const liveBranch = functionSource.slice(liveBranchStart, liveBranchEnd);
  assert.match(liveBranch, /state\.memberships/);
  assert.doesNotMatch(liveBranch, /profile\.company_ids/);
});
