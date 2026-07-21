#!/usr/bin/env node
/* Two-tenant leak test — the evidence for Phases 3-4's tenancy claims.
 *
 * Signs in as two REAL tenants created through the public signup flow, then, as
 * tenant A, attempts every cross-tenant read and write it can reach. Anything
 * that returns tenant B's data (or succeeds when it should be refused) is a FAIL.
 *
 * Locked decision 10: any single failure blocks the task module's launch.
 *
 * Usage (see docs/superpowers/plans/2026-07-22-phase5-leak-test-checklist.md):
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... \
 *   A_EMAIL=... A_PASSWORD=... B_EMAIL=... B_PASSWORD=... \
 *   node scripts/tenant-leak-test.mjs
 *
 * Anon key only — using a service-role key here would bypass RLS and make every
 * probe pass meaninglessly. The script refuses one if it sees it.
 */

import { createClient } from '@supabase/supabase-js';

const {
  SUPABASE_URL: url,
  SUPABASE_ANON_KEY: anonKey,
  A_EMAIL, A_PASSWORD, B_EMAIL, B_PASSWORD,
} = process.env;

if (!url || !anonKey || !A_EMAIL || !A_PASSWORD || !B_EMAIL || !B_PASSWORD) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_ANON_KEY, A_EMAIL, A_PASSWORD, B_EMAIL, B_PASSWORD');
  process.exit(2);
}
if (/^sb_secret_|service_role/i.test(anonKey)) {
  console.error('Refusing to run with a service-role key — it bypasses RLS and every probe would pass falsely.');
  process.exit(2);
}

const results = [];
const record = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
};

const signIn = async (email, password, label) => {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(`Could not sign in ${label} (${email}): ${error.message}`);
    process.exit(2);
  }
  return { client, userId: data.user.id };
};

const A = await signIn(A_EMAIL, A_PASSWORD, 'tenant A');
const B = await signIn(B_EMAIL, B_PASSWORD, 'tenant B');

/* ---- Establish each tenant's own footprint (as themselves) ---------------- */

const own = async ({ client }, table, columns = '*') => {
  const { data, error } = await client.from(table).select(columns);
  if (error) throw new Error(`${table}: ${error.message}`);
  return data ?? [];
};

const aCompanies = (await own(A, 'companies', 'id')).map((r) => r.id);
const bCompanies = (await own(B, 'companies', 'id')).map((r) => r.id);
const bTasks = await own(B, 'tasks', 'id, company_id');
const bMembers = await own(B, 'team_members', 'id, email, company_ids');

if (!aCompanies.length || !bCompanies.length) {
  console.error('Each tenant needs at least one company. Create both workspaces via public signup first.');
  process.exit(2);
}
if (!bTasks.length || !bMembers.length) {
  console.error('Tenant B needs at least one task and one team member, or the probes pass vacuously.');
  process.exit(2);
}

const overlap = aCompanies.filter((id) => bCompanies.includes(id));
record('tenants are genuinely separate (no shared company id)', overlap.length === 0,
  overlap.length ? `shared: ${overlap.join(', ')}` : '');

const bCompanyId = bCompanies[0];
const bTaskId = bTasks[0].id;
const bMemberEmail = (bMembers.find((m) => m.email) || {}).email || '';

/* ---- Probes 1-10: cross-tenant READS as tenant A ------------------------- */

const readProbe = async (table, isForeign, label = table) => {
  const { data, error } = await A.client.from(table).select('*');
  if (error) { record(`read ${label}`, true, `refused: ${error.message}`); return; }
  const leaked = (data ?? []).filter(isForeign);
  record(`read ${label}`, leaked.length === 0,
    leaked.length ? `${leaked.length} foreign row(s), e.g. ${JSON.stringify(leaked[0]).slice(0, 200)}` : `${(data ?? []).length} own row(s)`);
};

const foreignByCompany = (row) => row.company_id && !aCompanies.includes(row.company_id);

await readProbe('companies', (row) => !aCompanies.includes(row.id));
await readProbe('team_members', (row) => Array.isArray(row.company_ids)
  && row.company_ids.length > 0
  && !row.company_ids.some((id) => aCompanies.includes(id)));
await readProbe('tasks', foreignByCompany);
await readProbe('projects', foreignByCompany);
await readProbe('notifications', foreignByCompany);
await readProbe('task_types', foreignByCompany);
await readProbe('task_type_statuses', foreignByCompany);
await readProbe('task_labels', foreignByCompany);
await readProbe('checkin_settings', foreignByCompany);
await readProbe('bug_reports', () => true, 'bug_reports (platform-global, expect none)');

// time_entries / active_timers / task_comments have no company column — a row is
// foreign if its parent task belongs to another tenant.
const bTaskIds = new Set(bTasks.map((t) => t.id));
for (const table of ['time_entries', 'active_timers', 'task_comments']) {
  const { data, error } = await A.client.from(table).select('*');
  if (error) { record(`read ${table}`, true, `refused: ${error.message}`); continue; }
  const leaked = (data ?? []).filter((row) => bTaskIds.has(row.task_id));
  record(`read ${table}`, leaked.length === 0,
    leaked.length ? `${leaked.length} row(s) belonging to tenant B's tasks` : `${(data ?? []).length} own row(s)`);
}

/* ---- Probes 11-15: cross-tenant WRITES as tenant A ----------------------- */

const forgedTaskId = `leaktest-${A.userId.slice(0, 8)}`;
const insert = await A.client.from('tasks').insert({
  id: forgedTaskId,
  title: 'leak test — should never exist',
  company_id: bCompanyId,
  creator_id: 'leaktest',
  assignee_id: 'leaktest',
  due: new Date().toISOString().slice(0, 10),
}).select('id');
record('insert task into tenant B\'s company', !!insert.error,
  insert.error ? `refused: ${insert.error.message}` : 'INSERT SUCCEEDED — clean up row ' + forgedTaskId);

const update = await A.client.from('tasks').update({ title: 'leak test overwrite' }).eq('id', bTaskId).select('id');
record('update tenant B\'s task', !update.error && (update.data ?? []).length === 0,
  update.error ? `refused: ${update.error.message}` : `${(update.data ?? []).length} row(s) affected`);

const del = await A.client.from('tasks').delete().eq('id', bTaskId).select('id');
record('delete tenant B\'s task', !del.error && (del.data ?? []).length === 0,
  del.error ? `refused: ${del.error.message}` : `${(del.data ?? []).length} row(s) affected`);

const memberInsert = await A.client.from('team_members').insert({
  id: `leaktest-${Date.now()}`,
  name: 'Leak Test',
  full_name: 'Leak Test',
  email: `leaktest+${Date.now()}@example.com`,
  color: '#000000',
  company_ids: [bCompanyId],
}).select('id');
record('insert team member into tenant B\'s company', !!memberInsert.error,
  memberInsert.error ? `refused: ${memberInsert.error.message}` : 'INSERT SUCCEEDED — clean up');

/* ---- Probe 16: cross-tenant EMAIL ---------------------------------------- */

if (!bMemberEmail) {
  record('notify-email to tenant B\'s member', false, 'SKIPPED — tenant B has no member email; cannot verify (treat as unproven)');
} else {
  const { data, error } = await A.client.functions.invoke('notify-email', {
    body: { to: [bMemberEmail], subject: 'leak test', html: '<p>leak test</p>' },
  });
  const refused = !!error || (data && data.error);
  record('notify-email to tenant B\'s member', refused,
    refused ? `refused: ${error?.message || data?.error}` : 'EMAIL ACCEPTED — cross-tenant mail is possible');
}

/* ---- Verdict ------------------------------------------------------------- */

const failures = results.filter((r) => !r.pass);
console.log(`\n${results.length - failures.length}/${results.length} probes passed.`);
if (failures.length) {
  console.log('\nBLOCKING FAILURES:');
  for (const f of failures) console.log(` - ${f.name}: ${f.detail}`);
  console.log('\nLocked decision 10: the task module does not launch until every probe passes.');
}
process.exit(failures.length ? 1 : 0);
