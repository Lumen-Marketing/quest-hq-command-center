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

// The sidebar account card carried an avatar that told you who you were -- which you knew --
// and was the widest thing on the row. The space goes to where you actually stand instead.

test('the sidebar card shows the name and both roles, not a picture', () => {
  const at = main.indexOf('class="deck-user-card"');
  const card = main.slice(at - 1200, at + 700);
  assert.ok(!/renderAvatar\(session\.profile, 'avatar small'\)/.test(card), 'the avatar is gone');
  assert.match(card, /const companyRole = roleForCompany\(companyId\);/);
  assert.match(card, /const workspaceRole = workspace \? workspaceRoleLabel\(workspace\.id\) : '';/);
  assert.match(card, /<strong>\$\{h\(session\.profile\.full_name\)\}<\/strong>/);
  // "Owner / Owner access" twice is noise; one line covers both when they agree.
  assert.match(card, /const sameEverywhere =/);
  assert.match(card, /\$\{sameEverywhere \? '' : ` · \$\{workspaceRole\}`\}/);
});

test('no rule still reserves the avatar track the card no longer has', () => {
  // This is the one that broke it: two MORE SPECIFIC rules (.deck-footer .deck-user-card and
  // .quest-nav-v2 .deck-user-card) still opened with a 30px track, so the name landed in a
  // 30px column, wrapped one letter per line, and both role lines ellipsised to "Ow...".
  const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8');
  const offenders = [];
  for (const m of styles.matchAll(/([^{}]*deck-user-card[^{}]*)\{([^}]*)\}/g)) {
    const selector = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' ');
    const columns = /grid-template-columns:\s*([^;]+);/.exec(m[2])?.[1]?.trim();
    if (!columns) continue;
    // The first rule is shared with the company switcher, which keeps its icon and chevron.
    if (selector.startsWith('.deck-company-switch,')) continue;
    // A fixed PIXEL first track is the avatar slot. `1fr` is just one flexible column.
    if (/^\d+px/.test(columns)) offenders.push(`${selector} -> ${columns}`);
  }
  assert.deepEqual(offenders, [], 'a fixed leading track means an avatar column that is gone');
});

test('the collapsed rail is not left blank', () => {
  // Collapsed, `.deck-user-card span` is display:none -- which used to leave the avatar
  // behind. With no avatar the button would have been empty.
  const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8');
  assert.match(main, /<b class="deck-user-initials" aria-hidden="true">\$\{h\(initials\(session\.profile\.full_name\)\)\}<\/b>/);
  const hidden = styles.slice(styles.indexOf('.deck-user-initials {'));
  assert.match(hidden.slice(0, hidden.indexOf('}')), /display: none;/);
  assert.match(styles, /\.sidebar-collapsed \.deck-user-initials \{[\s\S]{0,200}?display: grid;/);
});

test('the card loses its avatar column without taking the company switcher with it', () => {
  const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8');
  // Matched by regex, not indexOf: this repo's files are CRLF, so a literal '\n' never hits.
  const shared = styles.slice(styles.search(/\.deck-company-switch,\r?\n\.deck-user-card \{/));
  assert.match(shared.slice(0, shared.indexOf('}')), /grid-template-columns: 32px minmax\(0, 1fr\) auto;/);
  // Only the user card is narrowed, by an override.
  const own = styles.slice(styles.search(/\.deck-user-card \{\r?\n\s*cursor: pointer;/));
  assert.match(own.slice(0, own.indexOf('}')), /grid-template-columns: minmax\(0, 1fr\);/);
});
