import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// A new company got ONE role. Ten companies in production, ten Owner roles, one hand-made
// Member -- so the first person invited to a fresh workspace had nothing to be assigned
// except Owner, which is how a worker ends up holding `*`.
//
// And roles.manage was a client-only idea: the interface checked it, the policies checked
// membership rank.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase', 'migrations', '202608082000_default_roles_and_roles_manage.sql'),
  'utf8',
);

test('a new company gets Owner and Member', () => {
  const fn = migration.slice(migration.indexOf('function app_private.seed_company_default_roles'));
  const body = fn.slice(0, fn.indexOf('$$;'));
  assert.match(body, /values \(target_company_id, 'Owner', '#f0b23b', 1000, true, actor_id\)/);
  assert.match(body, /values \(target_company_id, 'Member', '#64748b', 100, true, actor_id\)/);
  assert.match(body, /values \(owner_role_id, '\*', 'allow'\)/);
  // Creation goes through the one helper, so the two paths cannot drift.
  assert.match(migration, /perform app_private\.seed_company_default_roles\(v_company_id, auth\.uid\(\)\);/);
});

test("Member's permissions are the product's own preset, verbatim", () => {
  const preset = main.slice(main.indexOf('  member: ['));
  const keys = [...preset.slice(0, preset.indexOf(']')).matchAll(/'([\w.]+)'/g)].map((m) => m[1]);
  assert.ok(keys.length >= 10, 'expected to find ROLE_PRESETS.member');
  const fn = migration.slice(migration.indexOf('function app_private.seed_company_default_roles'));
  const seeded = fn.slice(fn.indexOf('from unnest(array['), fn.indexOf(']) as key'));
  for (const key of keys) {
    assert.ok(seeded.includes(`'${key}'`), `${key} is in ROLE_PRESETS.member but not seeded`);
  }
  // And a Member must not be able to change who anybody is.
  for (const forbidden of ['roles.manage', 'users.manage', 'settings.manage', 'billing.manage', 'plugins.manage', "'*'"]) {
    assert.ok(!seeded.includes(forbidden), `Member must not be granted ${forbidden}`);
  }
});

test('the seeder never widens a role somebody already built', () => {
  // An earlier version topped up whatever Member it found and granted one company's hand-made
  // role seven permissions its owner had not chosen.
  const fn = migration.slice(migration.indexOf('function app_private.seed_company_default_roles'));
  const body = fn.slice(0, fn.indexOf('$$;'));
  const memberBlock = body.slice(body.indexOf('if member_role_id is null then'));
  assert.match(memberBlock, /insert into public\.role_permissions/, 'the grants belong inside the create branch');
  const afterBranch = body.slice(body.lastIndexOf('end if;'));
  assert.ok(!/insert into public\.role_permissions/.test(afterBranch), 'nothing may be granted outside it');
});

test('roles.manage actually gates role editing', () => {
  assert.match(migration, /drop policy if exists "admins manage roles" on public\.roles;/);
  const roles = migration.slice(migration.indexOf('create policy "role managers manage roles"'));
  assert.match(roles.slice(0, roles.indexOf(';')), /has_company_permission\(company_id, 'roles\.manage'\)/);
  const perms = migration.slice(migration.indexOf('create policy "role managers manage role permissions"'));
  assert.match(perms.slice(0, perms.indexOf(';')), /has_company_permission\(r\.company_id, 'roles\.manage'\)/);
});

test('holding roles.manage cannot be turned into holding everything', () => {
  const wildcard = migration.slice(migration.indexOf('function app_private.guard_wildcard_permission'));
  const body = wildcard.slice(0, wildcard.indexOf('$$;'));
  assert.match(body, /if new\.permission_key <> '\*' then\s*[\r\n]+\s*return new;/, 'ordinary grants pass straight through');
  assert.match(body, /if app_private\.is_company_owner\(v_company\) or app_private\.is_quest_admin\(\) then/);
  assert.match(body, /raise exception 'Only an Owner can grant full access to a role'/);
  assert.match(migration, /create trigger role_permissions_guard_wildcard\s*[\r\n]+\s*before insert or update on public\.role_permissions/);

  const system = migration.slice(migration.indexOf('function app_private.guard_system_role'));
  assert.match(system.slice(0, system.indexOf('$$;')), /raise exception 'Only an Owner can change a built-in role'/);
  assert.match(migration, /create trigger roles_guard_system\s*[\r\n]+\s*before update or delete on public\.roles/);
});

test('the roles screen names the two defaults and reads a wildcard correctly', () => {
  assert.match(main, /Every company starts with Owner, who can do everything, and Member/);
  // Counting rows reported "2 permissions" for the one role that has them all.
  assert.match(main, /const fullAccess = rolePermissions\.some\(\(item\) => item\.permission_key === '\*'\);/);
  assert.match(main, /\$\{fullAccess \? 'Full access' : `\$\{permissionCount \|\| 'All'\} permissions`\}/);
  // New role was offered to everyone, including people the server would refuse.
  assert.match(main, /data-action="open-role-form" \$\{canManageRoles \? '' : 'disabled'\}/);
});

// The sidebar footer carried an account card: your name, your role, your workspace, and a
// Settings cog. All of it duplicated something else -- the topbar account menu already shows
// the name and owns the Profile action, and Settings is a first-class nav item directly above
// it. The rail is for navigating, not for telling you who you are.

test('the rail carries no account card', () => {
  for (const gone of ['deck-user-card', 'deck-footer', 'deck-user-initials', 'deck-user-scope', 'deck-settings-link']) {
    assert.ok(!main.includes(gone), `${gone} should be gone from the sidebar markup`);
  }
});

test('Profile is still reachable, from the places that already had it', () => {
  // Removing the card must not remove the only way in.
  const menu = main.slice(main.indexOf('<div class="account-menu'));
  assert.match(menu.slice(0, 1400), /data-action="open-profile"><i class="ti ti-user-circle"><\/i>Profile/);
  assert.match(main, /if \(action === 'open-profile'\) \{/);
  assert.match(main, /'open-profile',/, 'the action stays registered');
});
