import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createCompanySetupPanel } from '../src/onboarding/company-setup-panel.js';
import { buildCompanySetupPlan } from '../src/onboarding/company-setup-model.js';

// Two defects found reviewing the guided setup.
//
// 1. The Office and Finance role granted `reporting.view` -- a key this application does not
//    define anywhere. Reporting's two modules gate on team.view (Team chart) and jobs.view
//    (Analytics), so a role sold as covering reporting could open none of it.
//
// 2. Apply refuses a generated role whose name collides with a built-in one, and aborts the
//    whole transaction to do it. Until this week the only built-in role was Owner, which
//    nobody types. Every company now also has a built-in Member.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase', 'migrations', '202608082400_company_setup_role_fixes.sql'),
  'utf8',
);

test('the setup roles only grant permissions the app actually defines', () => {
  // PERMISSION_KEYS is the only list the Roles editor reads, so a key outside it can never
  // be granted by hand -- and one outside can() entirely grants nothing at all.
  const catalogBlock = main.slice(main.indexOf('const PERMISSION_KEYS = ['), main.indexOf('];', main.indexOf('const PERMISSION_KEYS = [')));
  const catalog = new Set([...catalogBlock.matchAll(/\['([a-z_]+\.[a-z_]+)', '/g)].map((m) => m[1]));
  assert.ok(catalog.has('team.view') && catalog.has('jobs.view'), 'sanity: the catalog parsed');

  const helper = migration.slice(migration.indexOf('function app_private.company_setup_role_permissions'));
  const body = helper.slice(0, helper.indexOf('$$;'));
  const used = [...new Set([...body.matchAll(/'([a-z_]+\.[a-z_]+)'/g)].map((m) => m[1]))];
  const unknown = used.filter((key) => !catalog.has(key));
  assert.deepEqual(unknown, [], 'a permission the app does not define grants nothing');
});

test('Office and Finance can reach both Reporting modules', () => {
  const helper = migration.slice(migration.indexOf("when 'office_finance' then"));
  const perms = helper.slice(0, helper.indexOf(']'));
  assert.match(perms, /'team\.view'/, 'Team chart gates on team.view');
  assert.match(perms, /'jobs\.view'/, 'Analytics gates on jobs.view');
  assert.ok(!/reporting\.view/.test(perms), 'reporting.view is not a permission');
});

test('the templates live outside the 680-line body', () => {
  // Correcting one key used to mean replacing the whole function, which is why a wrong key
  // survived unnoticed.
  assert.match(migration, /role_permissions := app_private\.company_setup_role_permissions\(role_key\);/);
  assert.match(migration, /revoke all on function app_private\.company_setup_role_permissions\(text\) from public, anon, authenticated;/);
});

test('a refused role name says which name', () => {
  assert.match(migration, /already used by a built-in role/);
  assert.ok(!/Generated role name is reserved/.test(migration), 'the message that named nothing is gone');
});

function panelWith(reserved) {
  return createCompanySetupPanel({ reservedRoleNames: () => reserved, h: (v) => String(v ?? '') });
}

test('the panel blocks a built-in name before the server has to', () => {
  const panel = panelWith(['Owner', 'Member']);
  const plan = buildCompanySetupPlan({ mode: 'blueprint', blueprint: 'roofing' });
  assert.ok(plan.roles.length > 1, 'sanity: the roofing blueprint generates roles');

  // Untouched, the generated names are fine.
  assert.equal(panel.firstRoleNameIssue('lumen', plan), '');

  const collides = { ...plan, roles: plan.roles.map((r, i) => (i === 0 ? { ...r, name: 'Member' } : r)) };
  assert.match(panel.firstRoleNameIssue('lumen', collides), /"Member" is a built-in role/);

  // Case does not rescue it -- the database compares lowered.
  const lowered = { ...plan, roles: plan.roles.map((r, i) => (i === 0 ? { ...r, name: 'member' } : r)) };
  assert.match(panel.firstRoleNameIssue('lumen', lowered), /is a built-in role/);
});

test('two roles renamed to the same thing are caught too', () => {
  // These do not collide loudly on the server: the second finds the first row by name and
  // adopts it, so two roles quietly become one and the last template's permissions win.
  const panel = panelWith(['Owner', 'Member']);
  const plan = buildCompanySetupPlan({ mode: 'blueprint', blueprint: 'roofing' });
  const duped = { ...plan, roles: plan.roles.map((r, i) => (i < 2 ? { ...r, name: 'Field Team' } : r)) };
  assert.match(panel.firstRoleNameIssue('lumen', duped), /already used by another role above/);
});

test('an empty role name is caught before it reaches the plan validator', () => {
  const panel = panelWith([]);
  const plan = buildCompanySetupPlan({ mode: 'blueprint', blueprint: 'roofing' });
  const blank = { ...plan, roles: plan.roles.map((r, i) => (i === 0 ? { ...r, name: '   ' } : r)) };
  assert.match(panel.firstRoleNameIssue('lumen', blank), /Give this role a name/);
});

test('main hands the built-in names to the panel', () => {
  assert.match(main, /reservedRoleNames: \(companyId\) => state\.roles/);
  assert.match(main, /\.filter\(\(role\) => role\.company_id === canonicalCompanyId\(companyId\) && role\.is_system\)/);
});

test('every module gate can be granted from the Roles editor', () => {
  // team.view gated Team chart and was absent from PERMISSION_KEYS, so the permission worked
  // and could not be handed out -- the one module gate with no checkbox behind it.
  const catalogBlock = main.slice(main.indexOf('const PERMISSION_KEYS = ['), main.indexOf('];', main.indexOf('const PERMISSION_KEYS = [')));
  const catalog = new Set([...catalogBlock.matchAll(/\['([a-z_]+\.[a-z_]+)', '/g)].map((m) => m[1]));
  const gated = new Set([...main.matchAll(/permission: '([a-z_]+\.[a-z_]+)'/g)].map((m) => m[1]));
  assert.deepEqual([...gated].filter((key) => !catalog.has(key)), []);
});
