import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Every QA pass so far ran as an Owner, who holds every permission by rank. Under that
// account a table gated on nothing but company membership behaves exactly like a correctly
// gated one, so no amount of clicking through the app can tell them apart. The gap was found
// by reading the policy expressions in the live database instead:
//
//   select ... from pg_policies where cmd in ('INSERT','UPDATE','DELETE','ALL')
//     and expression mentions no permission, rank, or identity check
//
// That returned exactly one real result -- public.clients, a single ALL policy whose only
// condition was is_company_member(company_id) -- plus notifications, whose write policies are
// self-scoped through current_member_id() and were false positives of the search.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = join(root, 'supabase', 'migrations');
const migration = readFileSync(
  join(migrationsDir, '202608081200_clients_write_needs_jobs_manage.sql'),
  'utf8',
);

test('a plain member can no longer rewrite the company client list', () => {
  // One ALL policy is what made every verb equally open.
  assert.match(migration, /drop policy if exists "members access clients" on public\.clients;/);
  for (const [name, cmd] of [
    ['clients written by job managers', 'insert'],
    ['clients edited by job managers', 'update'],
    ['clients removed by job managers', 'delete'],
  ]) {
    const policy = migration.slice(migration.indexOf(`create policy "${name}"`));
    const body = policy.slice(0, policy.indexOf(';'));
    assert.match(body, new RegExp(`for ${cmd}`));
    assert.match(body, /has_company_permission\(company_id, 'jobs\.manage'\)/);
  }
});

test('reading the client list needs the jobs permission, not just a seat', () => {
  const policy = migration.slice(migration.indexOf('create policy "clients visible to job viewers"'));
  const body = policy.slice(0, policy.indexOf(';'));
  assert.match(body, /for select/);
  assert.match(body, /has_company_permission\(company_id, 'jobs\.view'\)/);
});

test('the committed snapshot describes the policies the database actually has', () => {
  // The tenancy matrix reads this file, so a stale snapshot means the guard silently stops
  // covering whatever was added since. Both clock tables and the reworked clients policies
  // have to be in it.
  const snapshot = JSON.parse(readFileSync(join(root, '.ai', 'database', 'snapshot.json'), 'utf8'));
  const tables = new Set(snapshot.tables.filter((t) => t.schema === 'public').map((t) => t.name));
  assert.ok(tables.has('company_time_entries'));
  assert.ok(tables.has('company_active_timers'));

  const clients = snapshot.policies.filter((p) => p.table === 'clients').map((p) => p.command).sort();
  assert.deepEqual(clients, ['DELETE', 'INSERT', 'SELECT', 'UPDATE'], 'one policy per verb, not one ALL');
  assert.ok(
    !snapshot.policies.some((p) => p.table === 'clients' && p.command === 'ALL'),
    'the blanket policy must be gone from the snapshot too',
  );
});

test('every migration in the tree is committed with a name the manifest can point at', () => {
  const names = readdirSync(migrationsDir).filter((n) => n.endsWith('.sql')).sort();
  const manifest = JSON.parse(readFileSync(join(root, '.ai', 'manifest.json'), 'utf8'));
  const latest = names[names.length - 1];
  assert.equal(
    JSON.stringify(manifest).includes(latest),
    true,
    `manifest does not name the newest migration (${latest})`,
  );
});
