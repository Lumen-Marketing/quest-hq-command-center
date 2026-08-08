import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// The Access tab could change a role and a status and nothing else -- there was no way to
// take a seat back. Two actions now:
//
//   Suspend  the existing 'disabled' status, relabelled. Seat and rows stay put; the person
//            reaches nothing until somebody reactivates them.
//   Remove   the seat goes. The profile and everything they ever wrote stay, and the same
//            email can be invited again.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const row = readFileSync(join(root, 'src', 'team', 'access-row.js'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase', 'migrations', '202608081600_remove_company_member.sql'),
  'utf8',
);

test('removing a seat keeps the person and everything they wrote', () => {
  const fn = migration.slice(migration.indexOf('function public.remove_company_member'));
  const body = fn.slice(0, fn.indexOf('$$;'));
  for (const table of ['workspace_memberships', 'user_role_assignments', 'company_memberships']) {
    assert.match(body, new RegExp(`delete from public\\.${table}`), `${table} is part of the seat`);
  }
  // The profile and the authored rows are the company's record, not the seat.
  assert.ok(!/delete from public\.profiles/.test(body), 'the profile must survive');
  assert.ok(!/delete from auth\.users/.test(body), 'the auth account is not a company s to delete');
  for (const table of ['jobs', 'tasks', 'messages', 'job_files', 'company_time_entries']) {
    assert.ok(!new RegExp(`delete from public\\.${table}`).test(body), `${table} must keep its attribution`);
  }
});

test('the audit entry still names who it was after the row is gone', () => {
  const fn = migration.slice(migration.indexOf('function public.remove_company_member'));
  const body = fn.slice(0, fn.indexOf('$$;'));
  assert.match(body, /select p\.email into target_email from public\.profiles p where p\.id = target_profile_id;/);
  assert.ok(
    body.indexOf('into target_email') < body.indexOf('delete from public.company_memberships'),
    'the email has to be read before the row it describes is deleted',
  );
  assert.match(body, /'membership\.removed'/);
  assert.match(body, /'email', target_email/);
});

test('removal refuses the cases that would lock a company', () => {
  const fn = migration.slice(migration.indexOf('function public.remove_company_member'));
  const body = fn.slice(0, fn.indexOf('$$;'));
  assert.match(body, /if not app_private\.is_company_admin\(target_company_id\) then/);
  assert.match(body, /You cannot remove yourself\./);
  assert.match(body, /Owner access required to remove an Owner or Developer/);
  assert.match(body, /This is the main owner of the company and cannot be removed\./);
  assert.match(body, /This is the last active Owner\. Promote another Owner first\./);
});

test('the procedure is not reachable without signing in', () => {
  assert.match(migration, /revoke all on function public\.remove_company_member\(text, uuid\) from public, anon;/);
  assert.match(migration, /grant execute on function public\.remove_company_member\(text, uuid\) to authenticated;/);
});

test('suspend is the existing status under the word people use', () => {
  // Renaming the stored value would mean migrating live rows to buy a nicer string.
  assert.match(main, /\['disabled', 'Suspended'\],/);
  const fn = main.slice(main.indexOf('async function setMemberSuspension(companyId, profileId, suspended)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /const status = suspended \? 'disabled' : 'active';/);
  // Reuses the procedure that already refuses the main owner and writes the audit event.
  assert.match(body, /client\.rpc\('update_company_member_access'/);
  // Passing the role they already hold keeps this about the status alone.
  assert.match(body, /target_role: membership\.role,/);
  assert.match(body, /if \(membership\.status === status\) return;/, 'a no-op must not write');
});

test('both actions are gated in the client as well as the server', () => {
  for (const name of ['setMemberSuspension', 'removeCompanyMember']) {
    const fn = main.slice(main.indexOf(`async function ${name}(`));
    const body = fn.slice(0, fn.search(/\r?\n\}/));
    assert.match(body, /requirePermission\('users\.manage', companyId/, `${name} needs the gate`);
  }
});

test('the row offers suspend or reactivate, never both', () => {
  assert.match(row, /user\.status === 'disabled' \? `/);
  assert.match(row, /data-action="reactivate-company-member"/);
  assert.match(row, /data-action="suspend-company-member"/);
  assert.match(row, /data-action="remove-company-member"/);
  // The same guard that protects the role and status dropdowns.
  assert.match(row, /data-action="remove-company-member"[^`]*\$\{canEditUser \? '' : 'disabled'\}/);
});

test('removing asks first, and the dialog leads with what survives', () => {
  // "Remove" reads as "erase", and the fear that it deletes somebody's work is what stops
  // people using it.
  const fn = main.slice(main.indexOf('function renderRemoveMemberModal(key)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /Everything they did stays/);
  assert.match(body, /Their Questbase account is untouched/);
  assert.match(body, /invite the same email again later/);
  assert.match(body, /suspend them instead/, 'the softer option has to be offered here');
  assert.match(body, /data-action="confirm-remove-member"/);
  assert.match(body, /data-action="cancel-remove-member"/);
  assert.match(main, /if \(state\.modal === 'remove-member-confirm'\) return renderRemoveMemberModal\(state\.removingMemberId\);/);
  assert.match(main, /^\s{2}removingMemberId: '',$/m);
});

test('a suspended person is told why rather than invited to start over', () => {
  const fn = main.slice(main.indexOf('function blockedMembershipsForMe()'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /item\.profile_id === profileId && item\.status !== 'active'/);
  assert.match(main, /const suspended = blockedMembershipsForMe\(\)\.filter\(\(item\) => item\.status === 'disabled'\);/);
  assert.match(main, /Your access is suspended/);
  assert.match(main, /Your account and everything you did are untouched\./);
});
