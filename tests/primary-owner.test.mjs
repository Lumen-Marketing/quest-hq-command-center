import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Every owner used to be interchangeable: any owner could demote any other owner, including
// the person whose company it is, so a company could be taken over by whoever moved first.
// The main owner is now recorded on the company and is the one membership nobody inside the
// company may change. Everything else about owner-edits-owner stays allowed.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const row = readFileSync(join(root, 'src', 'team', 'access-row.js'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase', 'migrations', '202608071600_company_primary_owner.sql'),
  'utf8',
);

test('the main owner is stored, not derived at read time', () => {
  // Deriving it from "earliest membership" would move if the founder ever left and rejoined.
  assert.match(migration, /add column if not exists primary_owner_profile_id uuid references public\.profiles\(id\)/);
  assert.match(migration, /on delete set null/, 'losing a profile must not orphan the company');
  assert.match(migration, /select distinct on \(cm\.company_id\) cm\.company_id, cm\.profile_id/);
  assert.match(migration, /order by cm\.company_id, cm\.created_at asc/, 'backfill = the founding membership');
});

test('a new company cannot end up without one', () => {
  assert.match(migration, /create or replace function app_private\.claim_primary_owner\(\)/);
  assert.match(migration, /if new\.role = 'owner' and new\.status = 'active' then/);
  assert.match(migration, /where c\.id = new\.company_id\s*\n\s*and c\.primary_owner_profile_id is null;/,
    'it claims only when unset, so it can never reassign an existing main owner');
  assert.match(migration, /create trigger company_memberships_claim_primary_owner/);
});

test('the server refuses to change the main owner, and says so', () => {
  const fn = migration.slice(migration.indexOf('function public.update_company_member_access'));
  assert.match(fn, /app_private\.is_primary_owner\(target_company_id, target_profile_id\)/);
  assert.match(fn, /not app_private\.is_quest_admin\(\)/, 'a platform admin keeps a way to hand a company over');
  assert.match(fn, /raise exception 'This is the main owner of the company\./);
});

test('an unchanged save is not turned into an error', () => {
  // The row is still re-saved to adjust workspace assignments; only a real change is refused.
  const fn = migration.slice(migration.indexOf('function public.update_company_member_access'));
  assert.match(fn, /clean_role is distinct from old_row\.role or clean_status is distinct from old_row\.status/);
});

test('owners may still edit other owners', () => {
  // The only owner-level gate left is the pre-existing one: you must be an owner yourself.
  const fn = migration.slice(migration.indexOf('function public.update_company_member_access'));
  assert.match(fn, /raise exception 'Owner access required to change Owner or Developer membership'/);
  // Nothing may block an owner from editing a non-primary owner.
  assert.ok(!/is_last_active_owner/i.test(fn), 'the server does not add a second owner-count rule');
});

test('the client locks identity but not workspace assignment', () => {
  assert.match(row, /const isMainOwner = !!user\.profile_id && isPrimaryOwner\(companyId, user\.profile_id\);/);
  assert.match(row, /const canEditUser = canManageUsers && !!user\.profile_id && !isMainOwner && !isLastOwner;/);
  assert.match(row, /const canAssignWorkspaces = canManageUsers && !!user\.profile_id;/);
  // Role and status follow the stricter flag; the workspace controls do not.
  assert.match(row, /name="role_id" \$\{canEditUser \? '' : 'disabled'\}/);
  assert.match(row, /name="membership_status" \$\{canEditUser \? '' : 'disabled'\}/);
  assert.match(row, /const workspaceRoleEditable = canAssignWorkspaces;/);
  assert.match(row, /type="submit" \$\{canAssignWorkspaces \? '' : 'disabled'\}/);
});

test('the locked row explains itself, and the two reasons are distinct', () => {
  assert.match(row, /Main owner of this company - their role and status cannot be changed\./);
  assert.match(row, /Last active Owner - promote another Owner/);
  assert.ok(row.indexOf('isMainOwner ?') < row.indexOf('isLastOwner ?'), 'main owner is the stronger reason');
});

test('the client refuses before calling the server, with the same reason', () => {
  const fn = main.slice(main.indexOf('function validateMembershipChange('));
  const body = fn.slice(0, fn.indexOf('\n}'));
  assert.match(body, /isPrimaryOwner\(companyId, profileId\)/);
  assert.match(body, /This is the main owner of the company\./);
  // Checked first: it outranks the last-owner rule and the actor-role rule.
  assert.ok(body.indexOf('isPrimaryOwner') < body.indexOf('isLastActiveOwner'));
});

test('the company row carries the field the guard reads', () => {
  assert.match(main, /primary_owner_profile_id: String\(input\.primary_owner_profile_id \|\| ''\),/);
  assert.match(main, /function isPrimaryOwner\(companyId, profileId\)/);
  // An older row without the column means "no protected owner", not "protect nobody's guess".
  const fn = main.slice(main.indexOf('function isPrimaryOwner('));
  assert.match(fn.slice(0, fn.indexOf('\n}')), /return !!primary && primary === String\(profileId \|\| ''\);/);
});
