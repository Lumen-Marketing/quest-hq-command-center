import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// The Users page showed teammates as raw account ids -- "31a52568 5e3a 4448 Aa44 ..." -- to
// some viewers and as real names to others, in the same company. Reading another profile was
// gated by can_view_team(), which checks profiles.role: a LEGACY per-account field unrelated
// to company_memberships.role. A company OWNER whose legacy role was still 'member' could not
// read one teammate's profile, so every row fell back to titleCase(profile_id).

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const migration = readFileSync(
  join(root, 'supabase', 'migrations', '202608071400_profiles_visible_to_company_peers.sql'),
  'utf8',
);
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');

test('sharing a company is what makes a profile readable', () => {
  assert.match(migration, /create or replace function app_private\.shares_active_company\(target_profile_id uuid\)/);
  assert.match(migration, /join public\.company_memberships them on them\.company_id = me\.company_id/);
  // Both sides must be active: a departed member should not read the team, nor be read as one.
  assert.match(migration, /me\.status = 'active'/);
  assert.match(migration, /them\.status = 'active'/);
});

test('the lookup cannot recurse through the policies it is consulted by', () => {
  // company_memberships has its own RLS; a plain sub-select here would re-enter it.
  const fn = migration.slice(migration.indexOf('shares_active_company'), migration.indexOf('$function$;'));
  assert.match(fn, /security definer/);
  assert.match(fn, /set search_path to ''/);
});

test('the legacy role no longer decides who you can see', () => {
  assert.match(migration, /drop policy if exists "team viewers read profiles" on public\.profiles;/);
  const policy = migration.slice(migration.indexOf('create policy "profiles readable'));
  assert.ok(!/can_view_team/.test(policy), 'the legacy gate must be gone from the new policy');
  assert.match(policy, /id = \(select auth\.uid\(\)\)/, 'you can always read yourself');
  assert.match(policy, /app_private\.shares_active_company\(id\)/);
  assert.match(policy, /app_private\.is_quest_admin\(\)/, 'the platform panel still needs the directory');
});

test('the fallback that produced the id-as-a-name is still only a last resort', () => {
  // It is correct for an identity with genuinely no profile; it was firing because the
  // profile existed but could not be read.
  assert.match(main, /name: profile\?\.full_name \|\| member\?\.full_name \|\| profile\?\.email \|\| member\?\.name \|\| titleCase\(id\) \|\| 'User',/);
});

// Settings > Users > Access renders one checkbox and one role select per workspace. Both were
// gated by a single flag, so an owner/admin/developer -- whose workspace ACCESS is inherited
// and cannot be revoked here -- also had their per-workspace ROLE locked. Those are two
// different decisions.

test('workspace access stays locked for an inherited role, but the role in it does not', () => {
  const row = readFileSync(join(root, 'src', 'team', 'access-row.js'), 'utf8');
  assert.match(row, /const membershipEditable = canAssignWorkspaces && !implicitWorkspaceAccess;/);
  assert.match(row, /const workspaceRoleEditable = canAssignWorkspaces;/);
  // The checkbox keeps the stricter rule; the select only needs manage rights.
  assert.match(row, /name="workspace_ids"[^`]*\$\{membershipEditable \? '' : 'disabled'\}/);
  assert.match(row, /name="workspace_role:\$\{h\(workspace\.id\)\}"[^`]*\$\{workspaceRoleEditable \? '' : 'disabled'\}/);
  assert.ok(!/assignmentEditable/.test(row), 'the one-flag-for-two-decisions version must be gone');
});

test('the saved workspace role is the one the select submitted', () => {
  // A disabled select submits nothing, so this fell back to the company role every time.
  assert.match(main, /const requestedWorkspaceRoleId = String\(data\.get\(`workspace_role:\$\{workspace\.id\}`\) \|\| role\.id \|\| ''\);/);
  assert.match(main, /const workspaceRole = roleById\(companyId, requestedWorkspaceRoleId\) \|\| role;/);
  assert.match(main, /target_role_id: isUuid\(workspaceMembership\.role_id\) \? workspaceMembership\.role_id : null,/);
});
