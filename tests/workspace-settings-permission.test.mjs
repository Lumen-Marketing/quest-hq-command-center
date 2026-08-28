import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Administering a workspace -- its name, icon, description, archive state, and which one is
// the default -- used to be reachable only through `settings.manage`, the whole company
// settings area. Letting somebody rename a workspace meant handing them brand, modules,
// integrations and launch as well.
//
// It is now `workspaces.settings.manage`. These tests hold the two halves together: the key
// has to appear in the picker, and the browser and the database have to agree about what it
// means. A permission the UI honours and the database does not is the failure mode `can()`
// warns about in its own comment -- and it was live here, because the client gate accepted
// settings.manage while every RPC behind it checked the company ROLE and ignored permissions.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migration = readFileSync(
  new URL('../supabase/migrations/20260828021333_workspace_settings_permission.sql', import.meta.url),
  'utf8',
);

test('the roles picker offers workspace settings alongside the two app permissions', () => {
  assert.match(main, /\['workspaces\.view', 'View workspace apps'\]/);
  assert.match(main, /\['workspaces\.manage', 'Create\/edit workspace apps'\]/);
  assert.match(main, /\['workspaces\.settings\.manage', 'Manage workspace settings'\]/);
  // The picker groups by key prefix, so this lands under "Workspace apps" with the other two.
  assert.match(main, /workspaces: 'Workspace apps'/);
});

test('settings.manage still satisfies the narrower key, and app building does not', () => {
  // Nobody who can reach workspace settings today may lose that access, so the legacy grant
  // keeps answering true.
  assert.match(main, /'workspaces\.settings\.manage': \['settings\.manage'\]/);
  // But workspaces.manage must NOT: building apps inside a workspace and administering the
  // workspace are the two powers this split exists to separate.
  assert.doesNotMatch(main, /'workspaces\.settings\.manage': \[[^\]]*workspaces\.manage/);
  assert.match(migration, /when permission = 'workspaces\.settings\.manage' then 'settings\.manage'/);
});

test('the workspace settings gate reads the permission, not settings.manage directly', () => {
  // Normalised, because the working tree is CRLF and a \n-anchored slice silently matches
  // nothing there -- which would make this assertion pass on an empty string.
  const source = main.replace(/\r\n/g, '\n');
  const gate = source.slice(source.indexOf('function canManageOperationalWorkspaces'));
  const body = gate.slice(0, gate.indexOf('\n}\n') + 1);
  assert.ok(body.includes('companyRoleForWorkspaceAccess'), 'the gate body should have been found');
  assert.match(body, /can\('workspaces\.settings\.manage', companyId\)/);
  assert.doesNotMatch(body, /can\('settings\.manage', companyId\)/);
});

test('workspace settings is not gated on the App Builder plugin, in either place', () => {
  // Every company has workspaces whether or not workspace_builder is installed, and they still
  // have to be renamed and archived. The two mappings must agree or the browser and the
  // database gate differently.
  const browser = main.slice(main.indexOf('function permissionPluginIds'));
  const settingsIndex = browser.indexOf("clean === 'workspaces.settings.manage'");
  const prefixIndex = browser.indexOf("clean.startsWith('workspaces.')");
  assert.ok(settingsIndex > -1, 'the settings key needs its own branch');
  assert.ok(settingsIndex < prefixIndex, 'it must be tested before the workspaces. prefix, or the prefix wins');
  assert.match(browser.slice(settingsIndex, prefixIndex), /return \[\]/);

  const sqlSettings = migration.indexOf("when permission = 'workspaces.settings.manage' then array[]::text[]");
  const sqlPrefix = migration.indexOf("when permission like 'workspaces.%'");
  assert.ok(sqlSettings > -1 && sqlSettings < sqlPrefix, 'the SQL CASE needs the same order');
});

test('the migration widens only the four settings RPCs, never is_workspace_admin', () => {
  for (const fn of [
    'create_operational_workspace',
    'reorder_operational_workspaces',
    'update_operational_workspace',
    'set_default_operational_workspace',
  ]) {
    assert.ok(migration.includes(`'${fn}'`), `${fn} must be repointed at the new guard`);
  }
  // is_workspace_admin also guards workspace_memberships and workspace_plugins through RLS.
  // Redefining it would have handed over who can see a workspace's records along with the
  // ability to rename it, which is not what this permission grants.
  assert.doesNotMatch(migration, /create or replace function app_private\.is_workspace_admin/);
  assert.doesNotMatch(migration, /create or replace function app_private\.is_company_admin/);
});

test('the guard substitution asserts rather than silently leaving the old check', () => {
  // The bodies are patched by text substitution because create_operational_workspace is 6.6 KB
  // of preset seeding and retyping it to change one line is how a transcription error gets into
  // an authorization path. That is only safe if a miss is loud.
  assert.match(migration, /guard % not found in public\.%/);
  assert.match(migration, /substitution changed nothing in public\.%/);
  assert.match(migration, /raise exception/);
});

test('the new helpers are not callable by a browser role', () => {
  // They are only ever called from inside SECURITY DEFINER routines, which run as the owner.
  assert.match(
    migration,
    /revoke all on function app_private\.can_manage_company_workspace_settings\(text\) from public, anon, authenticated/,
  );
  assert.match(
    migration,
    /revoke all on function app_private\.can_manage_workspace_settings\(uuid\) from public, anon, authenticated/,
  );
});
