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

import { readFileSync } from 'node:fs';

const snapshot = JSON.parse(readFileSync(new URL('../.ai/database/snapshot.json', import.meta.url), 'utf8'));

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
  + `${unexpectedViews.length === 0 ? KNOWN_SAFE_VIEWS.size : '?'} known security_invoker view(s) (snapshot ${snapshot.captured_at}).`);
