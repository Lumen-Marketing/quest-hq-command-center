import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "after creating a new workspace It will redirect to workspace app, so make sure to
// automatically install the workspace plugin upon creating an account or workspace."
//
// 'workspaces' is not a core module, so canViewModule -> isModuleInstalled needs the
// workspace_builder plugin, and BOTH layers must say yes (src/workspaces/model.js returns
// 'available' with no company entitlement, and again with no workspace row). Three separate
// places failed to provide it:
//
//   1. plugin_ids_for_preset('blank') returned []  -- and 'blank' is what the client passes
//      for both create_company_workspace and create_operational_workspace.
//   2. A new account's Main workspace is built by the companies trigger, which seeded
//      pipeline stages and no plugins at all.
//   3. The client never re-read workspace_plugins after the RPC, so a workspace whose rows
//      existed in the database still looked uninstalled until a reload.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const migrationsDir = join(root, 'supabase', 'migrations');
// Pinned by name, not searched by content. These functions were each DEFINED by an older
// migration that is still in the tree, so a content search finds the original and asserts
// against the very text this change replaces.
const migration = (file) => {
  assert.ok(readdirSync(migrationsDir).includes(file), `${file} is not in the tree`);
  return readFileSync(join(migrationsDir, file), 'utf8');
};
const PRESET_MIGRATION = '20260812140000_baseline_workspace_builder_plugin.sql';
const DEFAULT_WS_MIGRATION = '20260812141000_default_workspace_baseline_plugin.sql';

test('the baseline is named once so the callers cannot drift', () => {
  const sql = migration(PRESET_MIGRATION);
  assert.match(sql, /select array\['workspace_builder'\]::text\[\];/);
});

test('every preset carries it, including blank', () => {
  const sql = migration(PRESET_MIGRATION);
  assert.match(sql, /app_private\.baseline_plugin_ids\(\) \|\|/);
  // Blank still contributes nothing of its own -- the baseline is what it gains.
  assert.match(sql, /when 'blank' then array\[\]::text\[\]/);
  // The other presets keep exactly the plugins they had.
  assert.match(sql, /when 'roofing' then array\['crm_2', 'underwriter', 'price_book'/);
  assert.match(sql, /when 'construction' then array\['files', 'forms', 'finance'/);
  assert.match(sql, /order by 1/, 'create_company_workspace records this list in audit_events');
});

test('creating a workspace entitles the company first', () => {
  // The install is an intersection with company_plugins, so a company with no entitlement
  // row installs nothing however the preset is fixed.
  const sql = migration(PRESET_MIGRATION);
  const block = sql.slice(sql.indexOf('foreach baseline_plugin_id'));
  assert.match(block, /insert into public\.company_plugins/);
  assert.match(block, /on conflict \(company_id, plugin_id\) do nothing;/,
    'do nothing must not revive a plugin the company deliberately disabled');
  assert.ok(
    sql.indexOf('foreach baseline_plugin_id') < sql.indexOf('desired_plugins := app_private.plugin_ids_for_preset'),
    'the entitlement has to exist before the intersection runs',
  );
  // The rest of the function is carried over intact.
  assert.match(sql, /insert into public\.pipeline_stages/);
  assert.match(sql, /'workspace\.created'/);
});

test("a new account's first workspace gets it too", () => {
  const sql = migration(DEFAULT_WS_MIGRATION);
  assert.match(sql, /foreach baseline_plugin_id in array app_private\.baseline_plugin_ids\(\) loop/);
  assert.match(sql, /insert into public\.workspace_plugins/);
  // Only on the branch that creates a workspace -- not the repair paths that adopt or
  // re-flag one that already exists.
  const created = sql.indexOf('returning id into target_workspace_id;');
  assert.ok(created !== -1 && sql.indexOf('foreach baseline_plugin_id') > created,
    'the install must sit inside the create branch');
  assert.match(sql, /perform app_private\.seed_company_setup_pipeline_stages/, 'stages still seeded');
});

test('the client mirrors the baseline for the offline path', () => {
  assert.match(main, /^const BASELINE_WORKSPACE_PLUGIN_IDS = \['workspace_builder'\];$/m);
  assert.match(main, /BASELINE_WORKSPACE_PLUGIN_IDS\.forEach\(\(pluginId\) => upsertWorkspacePluginLocal\(saved\.id, pluginId, 'installed'\)\);/);
});

test('the live path reads back what the server installed', () => {
  // Assuming would go stale the moment the server's baseline changes; and without any
  // refresh the module stays hidden until a reload even though the rows exist.
  const at = main.indexOf('async function createOperationalWorkspace');
  const body = main.slice(at, main.indexOf('\n}', at));
  assert.match(body, /client\.from\('workspace_plugins'\)\.select\('\*'\)\.eq\('workspace_id', workspaceId\)/);
  assert.match(body, /upsertWorkspacePluginLocal\(row\.workspace_id, row\.plugin_id, row\.status\)/);
});

test('the module really is gated on this plugin', () => {
  // If 'workspaces' ever becomes core, or the plugin is renamed, everything above is moot.
  assert.match(main, /const CORE_MODULE_IDS = new Set\(\['dashboard', 'jobs', 'users', 'settings', 'automations'\]\);/);
  const catalog = readFileSync(join(root, 'src', 'workspaces', 'plugin-catalog.js'), 'utf8');
  assert.match(catalog, /id: 'workspace_builder',[^}]*module_ids: \['workspaces'\]/);
});
