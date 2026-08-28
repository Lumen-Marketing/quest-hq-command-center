import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// The tenancy matrix iterates the committed snapshot, so a tenant table the snapshot has never
// heard of was not failed — it was skipped, and the run still reported a clean matrix. On
// 2026-08-28 the snapshot was eighteen days and twenty-eight migrations behind live, and seven
// tenant-carrying tables had never been examined by a check that had been passing all along.
//
// These tests cover the gate that closed it. A green matrix over a stale snapshot is a false
// assurance, and the failure has to be loud enough that nobody relaxes the gate to unblock a
// branch.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const script = join(root, 'scripts', 'check-tenancy-matrix.mjs');

function run(brainRoot) {
  try {
    const stdout = execFileSync(process.execPath, [script], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, QUEST_BRAIN_ROOT: brainRoot },
    });
    return { code: 0, out: stdout };
  } catch (error) {
    return { code: error.status ?? 1, out: `${error.stdout || ''}${error.stderr || ''}` };
  }
}

// Enough tenant tables to clear the script's own truncation floor, all correctly policed, so
// that the only thing under test is freshness.
function fixture({ capturedAt, migrations }) {
  const dir = mkdtempSync(join(tmpdir(), 'quest-tenancy-'));
  mkdirSync(join(dir, '.ai', 'database'), { recursive: true });
  mkdirSync(join(dir, 'supabase', 'migrations'), { recursive: true });

  const tables = [];
  const policies = [];
  for (let index = 0; index < 45; index += 1) {
    const name = `tenant_table_${index}`;
    tables.push({
      name,
      schema: 'public',
      rls_enabled: true,
      primary_key: ['id'],
      columns: [
        { name: 'id', default: null, nullable: false, position: 1, udt_name: 'uuid', data_type: 'uuid' },
        { name: 'company_id', default: null, nullable: false, position: 2, udt_name: 'text', data_type: 'text' },
      ],
    });
    policies.push({ name: `${name} read`, roles: '{authenticated}', table: name, command: 'SELECT', permissive: 'PERMISSIVE' });
  }

  writeFileSync(
    join(dir, '.ai', 'database', 'snapshot.json'),
    JSON.stringify({ captured_at: capturedAt, tables, policies }),
  );
  for (const migration of migrations) {
    writeFileSync(join(dir, 'supabase', 'migrations', migration), '-- fixture\n');
  }
  return dir;
}

test('a snapshot captured after every migration certifies the matrix', () => {
  const dir = fixture({
    capturedAt: '2026-08-28T00:31:00.000Z',
    migrations: ['20260826090000_something.sql', '20260828002845_later_that_day.sql'],
  });
  try {
    const result = run(dir);
    assert.equal(result.code, 0, result.out);
    assert.match(result.out, /45 tenant-scoped tables/);
    assert.match(result.out, /is current against all 2 migrations/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a migration dated after the snapshot refuses to certify, and names the files', () => {
  const dir = fixture({
    capturedAt: '2026-08-10T18:23:17.000Z',
    migrations: [
      '20260810120000_before_the_capture.sql',
      '20260817120000_wb_intake_links.sql',
      '20260826090000_company_contacts_permission_split.sql',
    ],
  });
  try {
    const result = run(dir);
    assert.equal(result.code, 1, 'a stale snapshot must fail the check');
    assert.match(result.out, /2 migration\(s\) landed after it/);
    assert.match(result.out, /20260817120000_wb_intake_links\.sql/);
    assert.match(result.out, /20260826090000_company_contacts_permission_split\.sql/);
    assert.doesNotMatch(result.out, /20260810120000_before_the_capture\.sql/);
    // The message has to say what to do, or the next person deletes the gate instead.
    assert.match(result.out, /Refresh \.ai\/database\/snapshot\.json/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the time half of a migration filename does not trip the gate', () => {
  // Filenames carry a naming-convention time, not an apply time: ...120000 routinely applies
  // at 00:28 the same day. Comparing to the second would fail that pair for no reason.
  const dir = fixture({
    capturedAt: '2026-08-28T00:31:00.000Z',
    migrations: ['20260828120000_named_noon_applied_after_midnight.sql'],
  });
  try {
    const result = run(dir);
    assert.equal(result.code, 0, result.out);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('an unreadable capture timestamp fails rather than being treated as fresh', () => {
  const dir = fixture({ capturedAt: 'not-a-timestamp', migrations: ['20260828002845_x.sql'] });
  try {
    const result = run(dir);
    assert.equal(result.code, 1);
    assert.match(result.out, /captured_at is not a readable timestamp/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
