import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { WORKSPACE_PLUGIN_REGISTRY } from '../src/workspaces/plugin-catalog.js';

// "can you include this Production menu in side menu include to the Quest CRM Plugin? so it will
// be hidden if I disable Quest CRM plugin"
//
// The mapping was already right: Quest CRM has always listed jobs among its modules, and its own
// summary says so -- "...and production jobs workspace". What stopped it working was that jobs sat
// in CORE_MODULE_IDS, and isModuleInstalled answers true for a core module BEFORE it looks at a
// single plugin. The gate existed and was never reached.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const plugin = (id) => WORKSPACE_PLUGIN_REGISTRY.find((entry) => entry.id === id);

test('Quest CRM owns the Production module', () => {
  const quest = plugin('crm_2');
  assert.equal(quest.label, 'Quest CRM');
  assert.ok(quest.module_ids.includes('jobs'), 'jobs is one of its modules');
});

test('jobs is no longer core, so the gate is actually reached', () => {
  // This is the whole fix. A core module short-circuits isModuleInstalled and can never be
  // hidden by a plugin, however the catalog maps it.
  const core = main.match(/const CORE_MODULE_IDS = new Set\(\[([^\]]*)\]\)/)[1];
  assert.ok(!core.includes("'jobs'"), 'jobs is out of the core set');
  assert.ok(core.includes("'dashboard'"), 'and the ones that must always be reachable stay');
});

test('every id in the Production group is gated by a plugin now', () => {
  const groups = main.slice(main.indexOf('const NAV_GROUPS'), main.indexOf('const SIDEBAR_SCOPE_GROUPS'));
  const production = groups.match(/\{ label: 'Production', ids: \[([^\]]*)\] \}/)[1];
  const ids = [...production.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids, ['jobs']);
  ids.forEach((id) => {
    const owners = WORKSPACE_PLUGIN_REGISTRY.filter((entry) => entry.module_ids.includes(id));
    assert.ok(owners.length, `${id} maps to no plugin, so it can never be switched off`);
  });
});

test('the plain CRM plugin does NOT carry jobs, and that is deliberate', () => {
  // The two are in one exclusiveGroup, so a workspace runs one or the other. Plain CRM is
  // "accounts, contacts, quotes"; production work is what separates Quest CRM from it.
  assert.ok(!plugin('crm').module_ids.includes('jobs'));
  assert.equal(plugin('crm').exclusiveGroup, plugin('crm_2').exclusiveGroup);
});

test('an empty group draws nothing, so no orphan PRODUCTION heading is left behind', () => {
  // Jobs is the only row in that group. Without this the rail would show a header with nothing
  // under it the moment the plugin came off.
  const group = main.slice(main.indexOf('function navGroup('));
  assert.match(group.slice(0, 200), /if \(!items\.length\) return '';/);
});

test('reaching the page by URL is handled too', () => {
  // Hiding a row is not the same as blocking the route. Somebody with a bookmark gets a page
  // that explains itself rather than a broken screen.
  assert.match(main, /if \(!isModuleInstalled\(route\.section, companyId\)\) return renderPluginBlockedPage\(companyId, moduleMeta\);/);
});
