#!/usr/bin/env node
/* Per-person task visibility test — evidence for 202607241200_per_person_task_visibility.
 *
 * Crew C (tasks.view only) and Lead L (tasks.manage) in the SAME workspace.
 * Confirms C sees/edits only their own tasks, C always sees a task C created,
 * and L sees everything.
 *
 * Fixture in the shared workspace (WORKSPACE_ID):
 *   - >=1 task assigned to C
 *   - >=1 task assigned to someone else, NOT created by C
 *   - >=1 task created by C but assigned to another person
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... WORKSPACE_ID=... \
 *   C_EMAIL=... C_PASSWORD=... C_MEMBER_ID=... \
 *   L_EMAIL=... L_PASSWORD=... \
 *   node scripts/task-visibility-test.mjs
 *
 * Anon key only — a service-role key bypasses RLS and every probe passes falsely.
 */

import { createClient } from '@supabase/supabase-js';

const {
  SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey, WORKSPACE_ID,
  C_EMAIL, C_PASSWORD, C_MEMBER_ID, L_EMAIL, L_PASSWORD,
} = process.env;

if (!url || !anonKey || !WORKSPACE_ID || !C_EMAIL || !C_PASSWORD || !C_MEMBER_ID || !L_EMAIL || !L_PASSWORD) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_ANON_KEY, WORKSPACE_ID, C_EMAIL, C_PASSWORD, C_MEMBER_ID, L_EMAIL, L_PASSWORD');
  process.exit(2);
}
if (/^sb_secret_|service_role/i.test(anonKey)) {
  console.error('Refusing to run with a service-role key — it bypasses RLS.');
  process.exit(2);
}

const results = [];
const record = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
};

const signIn = async (email, password, label) => {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) { console.error(`Could not sign in ${label} (${email}): ${error.message}`); process.exit(2); }
  return client;
};

const C = await signIn(C_EMAIL, C_PASSWORD, 'crew C');
const L = await signIn(L_EMAIL, L_PASSWORD, 'lead L');

const wsTasks = async (client) => {
  const { data, error } = await client.from('tasks')
    .select('id, assignee_id, creator_id, workspace_id').eq('workspace_id', WORKSPACE_ID);
  if (error) throw new Error(`tasks: ${error.message}`);
  return data ?? [];
};

// Crew sees ONLY own (assigned or created).
const cTasks = await wsTasks(C);
const cLeak = cTasks.filter((t) => t.assignee_id !== C_MEMBER_ID && t.creator_id !== C_MEMBER_ID);
record('Crew sees only own assigned/created tasks', cLeak.length === 0,
  cLeak.length ? `leaked ${cLeak.length}: ${cLeak.map((t) => t.id).join(', ')}` : 'no leak');

// Crew sees a task they created for someone else.
record('Crew sees a task they created for another person',
  cTasks.some((t) => t.creator_id === C_MEMBER_ID && t.assignee_id !== C_MEMBER_ID),
  `own-created-for-other visible in C's set`);

// Lead sees strictly more than crew in the same workspace (sees all).
const lTasks = await wsTasks(L);
record('Lead sees all workspace tasks (superset of crew)',
  lTasks.length > cTasks.length,
  `lead saw ${lTasks.length}, crew saw ${cTasks.length}`);

// Crew CANNOT update a task that is not theirs (RLS blocks -> 0 rows updated).
const foreign = lTasks.find((t) => t.assignee_id !== C_MEMBER_ID && t.creator_id !== C_MEMBER_ID);
if (foreign) {
  const { data: upd } = await C.from('tasks').update({ updated_at: new Date().toISOString() })
    .eq('id', foreign.id).select('id');
  record("Crew cannot update someone else's task", !upd || upd.length === 0,
    upd && upd.length ? `unexpectedly updated ${foreign.id}` : 'update blocked by RLS');
} else {
  record("Crew cannot update someone else's task", false, 'no foreign task available to probe');
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
