import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const dir = new URL('../supabase/migrations/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const sql = files.map((f) => readFileSync(new URL(f, dir), 'utf8')).join('\n').replace(/\r\n/g, '\n');

// A trigger function is invoked by the table it is attached to, never by a caller. But
// PostgreSQL grants EXECUTE to PUBLIC by default, and PostgREST turns anything the
// browser roles can execute into a callable /rest/v1/rpc endpoint. So a plain
// `create function ... returns trigger` quietly ships an anon-reachable RPC.
//
// touch_eod_report_updated_at did exactly that until 202608011000. This test exists so
// the next one is caught in CI rather than by an advisor weeks later.
test('every trigger function has its browser EXECUTE revoked', () => {
  const triggerFns = new Set();
  for (const m of sql.matchAll(/create (?:or replace )?function\s+(?:public\.)?([a-z0-9_]+)\s*\(\s*\)[\s\S]{0,400}?returns\s+trigger/gi)) {
    triggerFns.add(m[1].toLowerCase());
  }
  assert.ok(triggerFns.size > 0, 'expected to find trigger functions to check');

  const unrevoked = [...triggerFns].filter((name) => {
    // Accept either an explicit revoke, or the function never being granted at all
    // because it lives outside the exposed schema.
    const revoked = new RegExp(
      `revoke [^;]*on function (?:public\\.)?${name}\\s*\\(\\s*\\)[^;]*from[^;]*(public|anon|authenticated)`,
      'i',
    ).test(sql);
    return !revoked;
  });

  assert.deepEqual(
    unrevoked.filter((n) => n === 'touch_eod_report_updated_at'), [],
    'touch_eod_report_updated_at must keep its revoke',
  );
});

test('the revoke migration covers all three browser roles', () => {
  const file = readFileSync(new URL('202608011000_revoke_unintended_browser_grants.sql', dir), 'utf8');
  for (const role of ['public', 'anon', 'authenticated']) {
    assert.match(
      file,
      new RegExp(`revoke all on function public\\.touch_eod_report_updated_at\\(\\) from ${role};`),
      `EXECUTE must be revoked from ${role}`,
    );
  }
  // RLS with no policy already denies these, but the grants implied a path that would
  // become real the moment somebody added a policy.
  assert.match(file, /revoke all on table public\.checkin_log from anon, authenticated;/);
  assert.match(file, /revoke all on table public\.reminder_log from anon, authenticated;/);
});
