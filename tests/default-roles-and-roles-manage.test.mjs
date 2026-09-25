import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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

// The Manager seed waits in plans/ until a migration can land (Area 1 of the roles
// enhancement; see .ai/plans/seed-manager-role.md). Read it from supabase/migrations once it
// lands, from .ai/plans until then — so the pin stops being enforced on neither day.
function managerSeedMigration() {
  const migrationsDir = join(root, 'supabase', 'migrations');
  const landed = existsSync(migrationsDir)
    ? readdirSync(migrationsDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && /seed_manager_role\.sql$/.test(entry.name))
        .map((entry) => entry.name)
        .sort()
        .at(-1)
    : undefined;
  const file = landed
    ? join(migrationsDir, landed)
    : join(root, '.ai', 'plans', 'seed-manager-role.proposed.sql');
  return readFileSync(file, 'utf8');
}

// "Verbatim" has to mean the two sets are EQUAL. Checking only that every preset key was
// found lets the seed quietly keep keys the product dropped, which is how a permission
// nobody agreed to becomes permanent in every company. Both directions, compared as sets.
function assertSameKeySet(presetKeys, seededText, label) {
  const seededKeys = new Set([...seededText.matchAll(/'([\w.*]+)'/g)].map((match) => match[1]));
  const presetSet = new Set(presetKeys);
  const onlyInPreset = presetKeys.filter((key) => !seededKeys.has(key));
  const onlyInSeed = [...seededKeys].filter((key) => !presetSet.has(key));
  assert.deepEqual(
    { onlyInPreset, onlyInSeed },
    { onlyInPreset: [], onlyInSeed: [] },
    `${label} must be seeded exactly and in full: preset-only ${onlyInPreset.join(', ') || 'none'}; seed-only ${onlyInSeed.join(', ') || 'none'}`,
  );
}

// The permission keys a grant writes, read from the `insert into public.role_permissions`
// that follows `from`. Keys always come after the `unnest(array[`, which is what separates
// them from the `'allow'` / `'deny'` effect literal that precedes it, so only text from
// there on is read. Without that cut the effect value looks like a 37th permission key.
function grantedKeysIn(source, from) {
  const start = source.indexOf('insert into public.role_permissions', from);
  if (start === -1) return '';
  const end = source.indexOf('on conflict (role_id, permission_key) do nothing', start);
  const segment = end === -1 ? source.slice(start) : source.slice(start, end);
  const unnest = segment.lastIndexOf('from unnest(array[');
  if (unnest === -1) return segment;
  return segment.slice(unnest);
}

// SQL comments, dropped. These assertions read the source as text, and prose like
// "ROLE_PERMISSIONS.manager from src/main.js" is not a table reference.
function stripSqlComments(sql) {
  return sql.replace(/--[^\n]*/g, '');
}

// True when `index` falls between some `if <something>_role_id is null then` and its
// matching `end if;`.
function insideAnyCreateBranch(body, index) {
  for (const open of [...body.matchAll(/if\s+\w+\s+is\s+null\s+then/gi)].map((match) => match.index)) {
    const end = body.indexOf('end if;', open);
    if (end !== -1 && index > open && index < end) return true;
  }
  return false;
}

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
  const memberStart = fn.indexOf("values (target_company_id, 'Member'");
  const memberBlock = fn.slice(memberStart, fn.indexOf('end if;', memberStart));
  assertSameKeySet(keys, grantedKeysIn(memberBlock, 0), 'ROLE_PRESETS.member');
  // And a Member must not be able to change who anybody is.
  for (const forbidden of ['roles.manage', 'users.manage', 'settings.manage', 'billing.manage', 'plugins.manage', "'*'", "'deny'"]) {
    assert.ok(!memberBlock.includes(forbidden), `Member must not be granted ${forbidden}`);
  }
});

test("Manager's permissions are the product's own preset, verbatim", () => {
  const managerMigration = managerSeedMigration();
  const preset = main.slice(main.indexOf('  manager: ['));
  const keys = [...preset.slice(0, preset.indexOf(']')).matchAll(/'([\w.]+)'/g)].map((m) => m[1]);
  assert.ok(keys.length >= 30, 'expected to find ROLE_PRESETS.manager');
  const fn = managerMigration.slice(managerMigration.indexOf('function app_private.seed_company_default_roles'));
  const managerBlockStart = fn.indexOf("values (target_company_id, 'Manager'");
  const managerBlock = fn.slice(managerBlockStart, fn.indexOf('end if;', managerBlockStart));
  const seeded = grantedKeysIn(managerBlock, 0);
  assertSameKeySet(keys, seeded, 'ROLE_PERMISSIONS.manager');
  // A Manager may run the operation but must not be able to change who anybody is, grant
  // full access, or hold denial-level power. Manager inherits nothing by rank.
  for (const forbidden of ['roles.manage', 'users.manage', 'settings.manage', 'billing.manage', 'plugins.manage', "'*'"]) {
    assert.ok(!seeded.includes(forbidden), `Manager must not be granted ${forbidden}`);
  }
  //
  // `effect` is a column on the permission row, not a permission key, and
  // role_permissions_effect_check constrains it to ('allow', 'deny'). So the string 'deny'
  // can never appear in the unnest() key list — searching the key list for it proved only
  // that the key list was not literally ['deny'], and could not fail. Assert on the effect
  // literals themselves: every one the Manager block writes must be 'allow', and there must
  // be at least one, so the assertion is not vacuously true.
  const effects = [...managerBlock.matchAll(/'(allow|deny)'/g)].map((match) => match[1]);
  assert.ok(effects.length > 0, 'expected to find the Manager permission grants');
  assert.deepEqual(
    [...new Set(effects)],
    ['allow'],
    `Manager must only ever be granted effect 'allow'; found: ${[...new Set(effects)].join(', ')}`,
  );
});


test('the read-only probe asserts the same role keys the product ships', () => {
  // The probe hardcodes its expected key lists so it can run without reading this repo.
  // That makes it a third copy that can drift, so pin both of its lists to src/main.js.
  // Without this the probe would quietly verify a contract the product no longer holds.
  const probe = readFileSync(
    join(root, 'supabase', 'probes', 'default_roles_and_modules_readonly.sql'),
    'utf8',
  );

  const presetKeys = (name) => {
    const preset = main.slice(main.indexOf(`  ${name}: [`));
    return [...preset.slice(0, preset.indexOf(']')).matchAll(/'([\w.]+)'/g)].map((m) => m[1]);
  };

  // expected_manager = array[ ... ] inside the Manager block. The closing bracket has to be
  // searched for from the opening one, since `text[]` in the declaration comes first.
  const arrayLiteral = (block) => {
    const open = block.indexOf('array[');
    assert.notEqual(open, -1, 'expected an array literal');
    return block.slice(open, block.indexOf(']', open));
  };

  assertSameKeySet(presetKeys('manager'), arrayLiteral(probe.slice(probe.indexOf('expected_manager constant text[]'))), 'probe expected_manager');
  assertSameKeySet(presetKeys('member'), arrayLiteral(probe.slice(probe.indexOf('expected_member constant text[]'))), 'probe expected_member');

  // The probe must actually check Manager now, and must not fail on a hand-made role. The
  // seeder is create-only, so a company that built its own `manager` keeps whatever its
  // owner gave it; scoping the check to is_system roles is what makes that correct. Every
  // Manager lookup has to be scoped -- one unscoped query would fail the probe on a company
  // whose hand-made Manager is entirely legitimate.
  assert.match(probe, /expected_manager/, 'the probe must assert the Manager contract');
  const managerLookups = [...probe.matchAll(/lower\(r\.name\) = 'manager'/g)];
  assert.ok(managerLookups.length >= 3, `expected the probe to check Manager in several places, found ${managerLookups.length}`);
  for (const lookup of managerLookups) {
    const preceding = probe.slice(Math.max(0, lookup.index - 40), lookup.index);
    assert.match(preceding, /r\.is_system\s+and\s*$/, 'every Manager lookup must be scoped to is_system roles');
  }
  assert.match(probe, /rp\.permission_key = '\*' or rp\.effect = 'deny'/, 'Manager must be checked for wildcard and deny rows');
  // It stays read-only and still ends in ROLLBACK.
  assert.doesNotMatch(probe, /^\s*(insert|update|delete|truncate)\b/im, 'the probe must not write');
  assert.match(probe.trimEnd(), /rollback;\s*$/i);
});

test('the Manager seed keeps the empty search path the hardening migration applied', () => {
  // 20260901200003_harden_remaining_app_private_search_paths set
  // app_private.seed_company_default_roles(text, uuid) to `search_path = ''`, and
  // tests/app-private-search-path-hardening.test.mjs pins that. `create or replace function`
  // re-applies whatever search_path the replacement body names, so a body saying
  // `set search_path to 'public', 'pg_temp'` silently un-hardens a SECURITY DEFINER function
  // every time it is applied. Require the replacement to keep the empty path.
  const managerMigration = managerSeedMigration();
  const fn = managerMigration.slice(
    managerMigration.indexOf('create or replace function app_private.seed_company_default_roles'),
    managerMigration.indexOf('$$;'),
  );
  // Assert against the code, not the prose. A comment that says "SECURITY DEFINER" would
  // otherwise satisfy a case-insensitive check on a function that had lost the attribute.
  const code = stripSqlComments(fn);
  assert.match(code, /security\s+definer/i, 'the seeder must stay SECURITY DEFINER');
  assert.match(code, /set\s+search_path\s*(?:to|=)\s*''\s*\n\s*as\s+\$\$/i, 'the replacement must keep an empty search path');
  assert.doesNotMatch(code, /set\s+search_path\s*(?:to|=)\s*'public'/i, 'never name a mutable schema in a SECURITY DEFINER function');
  // Nothing is on the path any more, so every relation the body touches must be qualified.
  assert.doesNotMatch(
    code,
    /(?<![\w.])(?:insert\s+into|delete\s+from|update|from|join)\s+(?!public\.|app_private\.|unnest\b)/i,
    'every table the seeder touches must be schema-qualified to survive an empty search path',
  );

  // And the hardening migration itself must still be the one on disk.
  const hardening = readFileSync(
    join(root, 'supabase', 'migrations', '20260901200003_harden_remaining_app_private_search_paths.sql'),
    'utf8',
  );
  assert.match(
    hardening,
    /alter\s+function\s+app_private\.seed_company_default_roles\(text,\s*uuid\)\s+set\s+search_path\s*=\s*''/i,
  );

  // No migration after the hardening one may re-define the seeder or widen its search path.
  // Alexia asked for this to be checked rather than assumed. The hardening file is excluded
  // by name: its own filename sorts after the bare timestamp it is keyed on.
  const migrationsDir = join(root, 'supabase', 'migrations');
  const hardeningName = '20260901200003_harden_remaining_app_private_search_paths.sql';
  const offenders = readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql') && name > '20260901200003' && name !== hardeningName)
    .filter((name) => {
      const body = readFileSync(join(migrationsDir, name), 'utf8');
      return (
        /create\s+(?:or\s+replace\s+)?function\s+app_private\.seed_company_default_roles/i.test(body) ||
        /alter\s+function\s+app_private\.seed_company_default_roles\b/i.test(body)
      );
    });
  assert.deepEqual(
    offenders,
    [],
    `no migration after 20260901200003 may redefine or re-alter the seeder; found: ${offenders.join(', ')}`,
  );
});

test('Manager is seeded as an immutable system role, and never widens a hand-made one', () => {
  const managerMigration = managerSeedMigration();
  const body = managerMigration.slice(
    managerMigration.indexOf('function app_private.seed_company_default_roles'),
    managerMigration.indexOf('$$;'),
  );
  assert.match(body, /values \(target_company_id, 'Manager', '#3b82f6', 500, true, actor_id\)/);
  // The grants happen inside the create branch, so a manager somebody already built is not
  // topped up — the same create-only rule Member has.
  //
  // Slicing from the LAST `end if;` only inspects the function's tail, so a grant inserted
  // after an intermediate `end if;` — between the Member block and the Manager block, say —
  // sits outside that slice and passes unnoticed. Check the whole body instead: every grant
  // must be inside SOME create-only branch, and nothing may follow the final `end if;`.
  const managerBranch = body.indexOf('if manager_role_id is null then');
  const managerEnd = body.indexOf('end if;', managerBranch);
  assert.ok(managerBranch !== -1 && managerEnd !== -1, 'expected the Manager create branch');
  assert.match(body.slice(managerBranch, managerEnd), /insert into public\.role_permissions/, 'the grants belong inside the create branch');

  const outside = [...body.matchAll(/insert\s+into\s+public\.role_permissions/gi)]
    .map((match) => match.index)
    .filter((index) => !insideAnyCreateBranch(body, index));
  assert.deepEqual(outside, [], 'no role_permissions grant may sit outside a create-only branch');

  const afterBranch = body.slice(body.lastIndexOf('end if;') + 'end if;'.length);
  assert.doesNotMatch(afterBranch, /\binsert\s+into\b|\bupdate\b|\bdelete\b/i, 'the seeder tail must not write anything');
});

test('the seeder never widens a role somebody already built', () => {
  // An earlier version topped up whatever Member it found and granted one company's hand-made
  // role seven permissions its owner had not chosen.
  const fn = migration.slice(migration.indexOf('function app_private.seed_company_default_roles'));
  const body = fn.slice(0, fn.indexOf('$$;'));
  const memberBranch = body.indexOf('if member_role_id is null then');
  const memberEnd = body.indexOf('end if;', memberBranch);
  assert.ok(memberBranch !== -1 && memberEnd !== -1, 'expected the Member create branch');
  assert.match(body.slice(memberBranch, memberEnd), /insert into public\.role_permissions/, 'the grants belong inside the create branch');
  const outside = [...body.matchAll(/insert\s+into\s+public\.role_permissions/gi)]
    .map((match) => match.index)
    .filter((index) => !insideAnyCreateBranch(body, index));
  assert.deepEqual(outside, [], 'no role_permissions grant may sit outside a create-only branch');
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
