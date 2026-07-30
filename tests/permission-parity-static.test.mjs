import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202607301300_company_admin_permissions.sql', import.meta.url), 'utf8');
const canFn = source.match(/function can\(permission[\s\S]*?\n\}/)[0];

// The UI used to promise access RLS then refused. `can` fell through to the static
// ROLE_PERMISSIONS table, whose 'member' entry includes messages.send — so a member whose
// role granted nothing was still offered Messages, and got a raw policy error or a silently
// empty inbox. For live sessions `can` must now answer from the same inputs as the SQL.
test('a live session never falls back to the static role table', () => {
  const start = canFn.indexOf("state.session?.auth === 'supabase'");
  // The branch must END by answering from the default set; everything up to that point is
  // the live path, and none of it may reach for the static table.
  const answer = 'return variants.some((variant) => DEFAULT_MEMBER_PERMISSIONS.includes(variant));';
  const end = canFn.indexOf(answer);
  assert.ok(start !== -1 && end > start, 'expected the live branch to end by answering');
  // Strip comments: the branch is deliberately commented with why it must not use the
  // static table, and that prose is not a use of it.
  const code = canFn.slice(start, end).replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(code, /ROLE_PERMISSIONS/, 'the live branch must not consult the static table');
});

test('the elevated roles match the SQL exactly', () => {
  assert.match(source, /const ELEVATED_COMPANY_ROLES = \['owner', 'admin', 'developer'\];/);
  assert.match(migration, /role in \('owner', 'admin', 'developer'\)/);
});

test('the no-role default set matches the SQL exactly', () => {
  assert.match(source, /const DEFAULT_MEMBER_PERMISSIONS = \['jobs\.view', 'tasks\.view', 'users\.view', 'settings\.view', 'plugins\.view'\];/);
  assert.match(migration, /permission in \('jobs\.view', 'tasks\.view', 'users\.view', 'settings\.view', 'plugins\.view'\)/);
});

test('admins are elevated for feature permissions, not just company management', () => {
  // is_company_admin already treated admin as elevated; has_company_permission did not,
  // so an Admin could create workspaces yet be refused when sending a message.
  assert.match(migration, /create or replace function app_private\.has_company_permission/);
  assert.match(migration, /security definer/);
  assert.match(migration, /set search_path to 'public', 'pg_temp'/);
});

test('a deny still beats an allow, and company scope is respected', () => {
  const live = canFn.slice(canFn.indexOf("state.session?.auth === 'supabase'"));
  assert.ok(live.indexOf("effect === 'deny'") < live.indexOf("effect === 'allow'"), 'deny must be checked first');
  // Assignments are filtered by company, so a role held in another company cannot leak in.
  assert.match(live, /item\.company_id === companyId && item\.profile_id === profile\.id/);
});

test('the static table is still available for demo and local sessions', () => {
  assert.match(source, /const ROLE_PERMISSIONS = \{/);
  assert.match(canFn, /const permissions = ROLE_PERMISSIONS\[role\] \|\| ROLE_PERMISSIONS\.member;/);
});
