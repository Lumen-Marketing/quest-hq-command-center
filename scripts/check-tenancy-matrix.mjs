// Tenancy isolation matrix — coverage half.
//
// Every table carrying company_id or workspace_id must have row level security enabled
// and at least one readable (SELECT or ALL) policy. A tenant table with RLS off, or with
// only write policies, is a leak or a dead table; both are bugs.
//
// This reads .ai/database/snapshot.json — catalog metadata captured from the live
// database — rather than parsing migration SQL. Policies get replaced across migrations
// and formatting varies, so a text scan produces false failures; the snapshot is what the
// database actually has.
//
// WHAT THIS CANNOT DO: the snapshot records policy names and commands, not their USING
// expressions, so this cannot prove a policy is correctly *gated* — only that one exists.
// Correctness is proved by the live rollback-only probe recorded in .ai/decisions.md,
// which impersonates a real non-admin identity and asserts zero foreign-company and
// foreign-workspace rows. Treat this script as the regression guard, not the proof.
//
// AND IT ONLY SEES WHAT THE SNAPSHOT SEES. This loop iterates the snapshot, so a table the
// snapshot has never heard of is not failed — it is skipped, silently, and the run still
// reports success. On 2026-08-28 an audit found seven tenant-carrying tables in production
// that postdated the committed snapshot (company_contacts, company_contact_fields,
// sms_messages, sms_numbers, wb_intake_links, wb_intake_submissions, wb_record_events).
// All seven were in fact correct, so nothing leaked — but this script had been reporting a
// clean matrix while checking none of them, which is worse than not running at all.
//
// The freshness gate below is the fix: if a migration landed after the snapshot was
// captured, the snapshot cannot describe the schema and this script must not certify it.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Normally the repository this script lives in. QUEST_BRAIN_ROOT redirects it at a fixture so
// the gate's own failure modes can be tested without a stale snapshot in the real tree.
const repoRoot = process.env.QUEST_BRAIN_ROOT
  || path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const snapshot = JSON.parse(readFileSync(path.join(repoRoot, '.ai', 'database', 'snapshot.json'), 'utf8'));

// ---- Freshness gate ---------------------------------------------------------------------

// Migration filenames are YYYYMMDDHHMM or YYYYMMDDHHMMSS, matching latestMigrationFilename()
// in ai-context-lib.mjs.
//
// Compared at DAY granularity on purpose. The time half of a migration filename is a naming
// convention, not a record of when it was applied — a file named ...120000 routinely applies
// at 00:28 the same day, and comparing to the second would fail that pair for no reason. A day
// is coarse enough to ignore that, and far finer than the drift this exists to catch: the run
// that prompted it was eighteen days and twenty-eight migrations behind.
//
// Deliberately NOT matched by name against the snapshot's own applied ledger. Repository
// filenames and provider-recorded versions disagree on both sides for historical reasons
// documented in .ai/known-issues.md, so a name comparison needs a large allowlist and reports
// mostly noise. The date is the one field both sides agree on.
function migrationDay(name) {
  const digits = /^(\d{12,14})_/.exec(name)?.[1];
  if (!digits) return null;
  const iso = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}T00:00:00Z`;
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? null : parsed;
}

function dayOf(timestampMs) {
  const date = new Date(timestampMs);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

const migrationDir = path.join(repoRoot, 'supabase', 'migrations');
const migrationNames = existsSync(migrationDir)
  ? readdirSync(migrationDir, { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => entry.name)
  : [];

const capturedAt = Date.parse(snapshot.captured_at);
if (Number.isNaN(capturedAt)) {
  console.error('Tenancy matrix: snapshot captured_at is not a readable timestamp, so freshness cannot be established.');
  process.exit(1);
}

// A migration dated after the capture day may have added, dropped or re-scoped a tenant table
// the snapshot cannot know about.
const capturedDay = dayOf(capturedAt);
const newerThanSnapshot = migrationNames
  .map((name) => ({ name, at: migrationDay(name) }))
  .filter((entry) => entry.at !== null && entry.at > capturedDay)
  .sort((a, b) => a.at - b.at);

if (newerThanSnapshot.length) {
  console.error(`Tenancy matrix: the snapshot was captured ${snapshot.captured_at}, but `
    + `${newerThanSnapshot.length} migration(s) landed after it. The snapshot cannot describe the current `
    + 'schema, so this check would pass without examining whatever they changed:');
  for (const entry of newerThanSnapshot) console.error(`  - ${entry.name}`);
  console.error('\nRefresh .ai/database/snapshot.json from live metadata (see .ai/operations.md, "Database changes"),');
  console.error('then re-run. Do not relax this gate: a green matrix over a stale snapshot is a false assurance.');
  process.exit(1);
}

// Server-only ledgers: RLS on with no policies is the intended lockdown, stated directly
// in 202607221400_taskmanagement_phase2_runtime_delta.sql ("no grants - RPC / service
// role only"). They are never read from the browser.
const SERVER_ONLY = new Set(['wo_counters', 'checkin_log', 'reminder_log']);

const policiesByTable = new Map();
for (const policy of snapshot.policies || []) {
  if (!policiesByTable.has(policy.table)) policiesByTable.set(policy.table, []);
  policiesByTable.get(policy.table).push(policy);
}

// Views appear in this list too and never carry RLS of their own — they inherit it from
// the tables underneath, but only when defined security_invoker. The snapshot does not
// record that flag, so views are listed explicitly here and their invoker setting is
// checked by the live probe rather than silently skipped.
const KNOWN_SAFE_VIEWS = new Set(['v_pricebook_material_best']);
const isView = (table) => Array.isArray(table.primary_key) && table.primary_key.length === 0;

const tenantRelations = (snapshot.tables || []).filter((table) => table.schema === 'public'
  && (table.columns || []).some((column) => column.name === 'company_id' || column.name === 'workspace_id'));

const unexpectedViews = tenantRelations.filter((t) => isView(t) && !KNOWN_SAFE_VIEWS.has(t.name));
const tenantTables = tenantRelations.filter((table) => !isView(table));

const failures = [];
// A new view over tenant data is a real risk: unless it is security_invoker it runs with
// the definer's rights and bypasses RLS entirely. Force a human to confirm that.
for (const view of unexpectedViews) {
  failures.push(`${view.name}: new view over tenant data — confirm it is security_invoker, then add it to KNOWN_SAFE_VIEWS`);
}
for (const table of tenantTables) {
  if (SERVER_ONLY.has(table.name)) continue;

  if (!table.rls_enabled) {
    failures.push(`${table.name}: row level security is disabled`);
    continue;
  }

  const policies = policiesByTable.get(table.name) || [];
  if (!policies.length) {
    failures.push(`${table.name}: RLS is on but no policy exists, so the table is unreachable`);
    continue;
  }

  const readable = policies.filter((policy) => /^(SELECT|ALL)$/i.test(policy.command));
  if (!readable.length) {
    failures.push(`${table.name}: no SELECT or ALL policy among ${policies.length} policies`);
  }
}

if (tenantTables.length < 40) {
  console.error(`Tenancy matrix: only ${tenantTables.length} tenant tables found — the snapshot looks stale or truncated.`);
  process.exit(1);
}

if (failures.length) {
  console.error(`Tenancy matrix: ${failures.length} problem(s) across ${tenantTables.length} tenant-scoped tables:`);
  failures.forEach((line) => console.error(`  - ${line}`));
  process.exit(1);
}

console.log(`Tenancy matrix: ${tenantTables.length} tenant-scoped tables all have RLS and a readable policy; `
  + `${unexpectedViews.length === 0 ? KNOWN_SAFE_VIEWS.size : '?'} known security_invoker view(s); `
  + `snapshot ${snapshot.captured_at} is current against all ${migrationNames.length} migrations.`);
