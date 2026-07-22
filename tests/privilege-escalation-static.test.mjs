// Guards two closed privilege-escalation paths.
//
// These assertions run over the migration text, because the suite has no
// database to execute against. That means they prove the *intent* is still
// encoded in the schema, not that Postgres behaves as expected — verify that
// against a real database before shipping.
//
// Each check resolves the LAST migration (by filename order, which is how
// Supabase applies them) that redefines the function, so a later migration
// reintroducing the hole fails the test rather than silently winning.

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const MIGRATIONS_DIR = new URL('../supabase/migrations/', import.meta.url);

function migrationsInOrder() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();
}

// Returns the body of the final definition of `signature`, or null if absent.
function lastDefinitionOf(signature) {
  let found = null;
  for (const name of migrationsInOrder()) {
    const source = readFileSync(new URL(name, MIGRATIONS_DIR), 'utf8');
    const start = source.lastIndexOf(signature);
    if (start === -1) continue;
    const end = source.indexOf('$$;', start);
    found = { name, body: source.slice(start, end === -1 ? undefined : end) };
  }
  return found;
}

test('construction_supervisor is not a workspace administrator', () => {
  const fn = lastDefinitionOf('create or replace function app_private.is_company_admin');
  assert.ok(fn, 'is_company_admin must be defined by some migration');
  assert.doesNotMatch(
    fn.body,
    /construction_supervisor/,
    `${fn.name} lets construction_supervisor pass is_company_admin, which gates the RLS `
    + 'policies on roles, role_permissions and user_role_assignments. That is enough to '
    + "self-assign permission_key '*' and take over the workspace.",
  );
  assert.match(fn.body, /cm\.role in \('owner', 'admin', 'developer'\)/, `${fn.name} should admit exactly owner/admin/developer`);
});

test('an invite can never confer an elevated membership role', () => {
  const fn = lastDefinitionOf('create or replace function public.accept_company_invite');
  assert.ok(fn, 'accept_company_invite must be defined by some migration');

  // The role name is attacker-controlled: anyone who can create a role and an
  // invite picks this string. It must never map to an elevated membership role.
  for (const elevated of ['owner', 'developer', 'admin']) {
    assert.doesNotMatch(
      fn.body,
      new RegExp(`then '${elevated}'`),
      `${fn.name} maps an invite role name to '${elevated}'. Elevated roles must come only `
      + 'from update_company_member_access / promote_company_owner, which are owner-guarded.',
    );
  }

  assert.match(
    fn.body,
    /when lower\(name\) in \('owner', 'developer', 'admin'\) then 'member'/,
    `${fn.name} should explicitly fold elevated role names down to 'member'`,
  );
});

test('elevated membership changes stay behind the owner-only guard', () => {
  const fn = lastDefinitionOf('create or replace function public.update_company_member_access');
  assert.ok(fn, 'update_company_member_access must be defined by some migration');
  assert.match(
    fn.body,
    /clean_role in \('owner', 'developer'\)[\s\S]*?is_company_owner/,
    `${fn.name} must keep requiring owner access to grant or remove Owner/Developer`,
  );
});
