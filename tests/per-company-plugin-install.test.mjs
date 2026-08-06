import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Installing a plugin takes two rows: a company entitlement, and a workspace activation.
// Only the second one is read when deciding whether a module works. The platform master
// could write the first for any company but not the second -- has_workspace_permission()
// requires a company_memberships row, which a master does not have for a customer's company.
// So "install" from the platform panel wrote a row nothing read, and the screen never moved.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const panel = readFileSync(join(root, 'src', 'platform', 'master-panel.js'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase', 'migrations', '202608071000_per_company_plugin_install.sql'),
  'utf8',
);

test('the workspace switch accepts a platform master, not only a company member', () => {
  const fn = migration.slice(migration.indexOf('function public.set_workspace_plugin'));
  assert.match(fn, /has_workspace_permission\(target_workspace_id, 'plugins\.manage'\)\s*\n\s*or app_private\.is_quest_admin\(\)/);
});

test('a company may take a plugin nobody has decided on', () => {
  const fn = migration.slice(migration.indexOf('function public.set_workspace_plugin'));
  // No company_plugins row at all means undecided, and a company admin may decide it.
  assert.match(fn, /if entitlement_status is null then/);
  assert.match(fn, /app_private\.is_company_admin\(target_company_id\)/);
  assert.match(fn, /insert into public\.company_plugins[\s\S]{0,200}'installed'/);
  assert.match(fn, /'self_service', true/, 'self-service installs must be auditable');
});

test('an explicit platform "disabled" is still a wall', () => {
  // Otherwise self-service would silently undo every decision the platform has made.
  const fn = migration.slice(migration.indexOf('function public.set_workspace_plugin'));
  assert.match(fn, /if entitlement_status = 'disabled' then[\s\S]{0,140}?raise exception 'This plugin has been withheld for this company'/);
});

test('the company switch reaches the workspaces that decide whether a module works', () => {
  const fn = migration.slice(
    migration.indexOf('function public.set_company_plugin'),
    migration.indexOf('function public.set_workspace_plugin'),
  );
  assert.match(fn, /insert into public\.workspace_plugins \(workspace_id, plugin_id, status/);
  assert.match(fn, /where w\.company_id = clean_company_id and w\.status = 'active'/);
  // Disabling has to travel too, or a revoked entitlement leaves the plugin running.
  assert.match(fn, /disabled_at = case when excluded\.status = 'disabled' then now\(\) else null end/);
});

test('the platform panel reads the entitlement it writes', () => {
  // It wrote company_plugins and read workspace_plugins, so a successful install left the
  // button saying "Install". Reading the wrong row is what made the bug look like a no-op.
  assert.match(panel, /companyPluginStatus\(companyId, plugin\.id\) === 'installed'/);
  assert.ok(!/isPluginInstalled/.test(panel), 'the workspace-level read must be gone');
  assert.match(main, /companyPluginStatus,/, 'and main.js has to pass it');
});

test('a company admin can activate a plugin that has no entitlement yet', () => {
  const card = main.slice(main.indexOf('function renderPluginCard('));
  const body = card.slice(0, card.indexOf('\nfunction '));
  assert.match(body, /const withheld = entitlement === 'disabled';/);
  assert.match(body, /const available = status === 'available' && !withheld;/);
  assert.match(body, /const unavailable = status === 'available' && withheld;/);
  // The Activate button used to require `entitled`, which only the platform could grant.
  assert.ok(
    !/data-action="set-workspace-plugin"[^`]*canManagePlugins && entitled/.test(body),
    'Activate must no longer require a platform-granted entitlement',
  );
  assert.match(body, /Withheld for your company/, 'a withheld plugin says who to ask');
});
