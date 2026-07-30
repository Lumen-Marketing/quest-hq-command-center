import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  PLUGIN_DATA_SCOPES,
  WORKSPACE_PLUGIN_REGISTRY,
  pluginDataScopeDetails,
} from '../src/workspaces/plugin-catalog.js';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('every plugin tells customers where its records are visible', () => {
  const validScopes = new Set(Object.values(PLUGIN_DATA_SCOPES));
  const missing = WORKSPACE_PLUGIN_REGISTRY
    .filter((plugin) => !validScopes.has(plugin.dataScope))
    .map((plugin) => plugin.id);

  assert.deepEqual(missing, []);
});

test('workspace pipeline plugins are private to the active workspace', () => {
  const scopes = Object.fromEntries(WORKSPACE_PLUGIN_REGISTRY.map((plugin) => [plugin.id, plugin.dataScope]));

  assert.equal(scopes.crm, 'workspace-private');
  assert.equal(scopes.crm_2, 'workspace-private');
  assert.equal(scopes.tasks, 'workspace-private');
  assert.equal(scopes.underwriter, 'workspace-private');
});

test('known company services are labeled company-wide instead of implying isolation', () => {
  const scopes = Object.fromEntries(WORKSPACE_PLUGIN_REGISTRY.map((plugin) => [plugin.id, plugin.dataScope]));

  assert.equal(scopes.messages, 'company-shared');
  assert.equal(scopes.finance, 'company-shared');
  assert.equal(scopes.calendar, 'company-shared');
  assert.equal(scopes.calls, 'company-shared');
});

test('files and reporting disclose their mixed visibility', () => {
  const scopes = Object.fromEntries(WORKSPACE_PLUGIN_REGISTRY.map((plugin) => [plugin.id, plugin.dataScope]));

  assert.equal(scopes.files, 'hybrid');
  assert.equal(scopes.reporting, 'hybrid');
});

test('scope details are customer-readable and fail closed for an unknown value', () => {
  assert.deepEqual(pluginDataScopeDetails('workspace-private'), {
    label: 'Workspace data',
    description: 'Records are limited to this operational workspace.',
  });
  assert.deepEqual(pluginDataScopeDetails('company-shared'), {
    label: 'Company-wide data',
    description: 'Records are shared across this company, even when the app is enabled here.',
  });
  assert.deepEqual(pluginDataScopeDetails('hybrid'), {
    label: 'Mixed data scope',
    description: 'Some records are workspace-specific and some are shared across the company.',
  });
  assert.deepEqual(pluginDataScopeDetails('unexpected'), {
    label: 'Scope not verified',
    description: 'Do not assume these records are isolated to this workspace.',
  });
});

test('plugin cards show scope explanations without requiring a hover tooltip', () => {
  assert.match(source, /class="plugin-scope-description">\$\{h\(scope\.description\)\}<\/small>/);
  assert.doesNotMatch(source, /plugin-scope-badge[^>]+title="\$\{h\(scope\.description\)\}"/);
});
