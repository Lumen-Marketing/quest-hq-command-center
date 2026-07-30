import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { EOD_TEAM_MEMBERS, EOD_WEEKLY_QUOTE_TARGET, eodWeekStart, normalizeEodReport } from '../src/eod/eod-page.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../src/eod/eod-page.js', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202607301200_eod_reports.sql', import.meta.url), 'utf8');

test('the EOD module sits in the Operations group without displacing Calls', () => {
  assert.match(main, /\{ id: 'eod', group: 'Operations',[^}]*permission: 'eod\.view' \}/);
  // ringcentral-calls-static pins 'calls' as the last Operations id; keep that true.
  assert.match(main, /\{ label: 'Operations', ids: \[[^\]]*'eod', 'calls'\] \}/);
});

test('both EOD permissions are grantable from the role editor', () => {
  assert.match(main, /\['eod\.view', /);
  assert.match(main, /\['eod\.manage', /);
});

test('counts are clamped so a typo cannot poison a total', () => {
  const row = normalizeEodReport({ calls_made: -5, quotes_sent: '7', appointments_set: 1e9, follow_ups_completed: 2.6 });
  assert.equal(row.calls_made, 0);
  assert.equal(row.quotes_sent, 7);
  assert.equal(row.appointments_set, 100000);
  assert.equal(row.follow_ups_completed, 3);
});

test('an unknown status falls back to submitted rather than rendering blank', () => {
  assert.equal(normalizeEodReport({ status: 'nonsense' }).status, 'submitted');
  assert.equal(normalizeEodReport({ status: 'reviewed' }).status, 'reviewed');
});

test('the week starts on Monday, matching how the team talks about weekly totals', () => {
  // 2026-07-30 is a Thursday; its week begins Monday 2026-07-27.
  assert.equal(eodWeekStart('2026-07-30'), '2026-07-27');
  assert.equal(eodWeekStart('2026-07-27'), '2026-07-27');
  // Sunday belongs to the week that just ended, not the next one.
  assert.equal(eodWeekStart('2026-08-02'), '2026-07-27');
  assert.equal(eodWeekStart('not-a-date'), '');
});

test('the page stays behind a dynamic import so it never enters the entry chunk', () => {
  assert.match(main, /import\('\.\/eod\/eod-page\.js'\)/);
  assert.doesNotMatch(main, /^import .*eod\/eod-page\.js/m, 'a static import would defeat the split');
  // The module must not reach back into the shell, or it would be pulled back in.
  assert.doesNotMatch(page, /from '\.\.\/main\.js'/);
});

test('the team roster and weekly quote target match the format the boss posts', () => {
  assert.deepEqual(EOD_TEAM_MEMBERS, ['Alkeith', 'Jesus', 'Manny', 'Mackenzie']);
  assert.equal(EOD_WEEKLY_QUOTE_TARGET, 3);
});

test('reports are tenant-scoped and permission-gated in the database', () => {
  assert.match(migration, /alter table public\.eod_reports enable row level security/);
  for (const clause of [
    /app_private\.is_company_member\(company_id\)/,
    /app_private\.subscription_allows_access\(company_id\)/,
    /app_private\.has_company_permission\(company_id, 'eod\.view'\)/,
  ]) assert.match(migration, clause);
  // You may only file a report as yourself.
  assert.match(migration, /and created_by = \(select auth\.uid\(\)\)/);
  // Authors can fix their own; only eod.manage can touch anyone else's.
  assert.match(migration, /created_by = \(select auth\.uid\(\)\) or app_private\.has_company_permission\(company_id, 'eod\.manage'\)/);
});

test('the database rejects negative counts and unknown statuses', () => {
  assert.match(migration, /check \(status in \('draft', 'submitted', 'reviewed'\)\)/);
  assert.match(migration, /calls_made between 0 and 100000/);
});

test('the CSV survives commas and quotes inside a field', async () => {
  const { eodReportsCsv } = await import('../src/eod/eod-page.js');
  const csv = eodReportsCsv([{
    report_date: '2026-07-30', team_member: 'Alkeith', calls_made: 5, quotes_sent: 2,
    appointments_set: 1, follow_ups_completed: 3, hot_leads: 'Smith, Jane',
    blockers: 'needs "ladder"', status: 'submitted',
  }]);
  const [header, row] = csv.split('\r\n');
  assert.equal(header, '"Date","Team member","Calls","Quotes","Appointments","Follow-ups","Hot leads","Blockers","Status"');
  // A bare comma would shift every later column; a bare quote would break the field.
  assert.match(row, /"Smith, Jane"/);
  assert.match(row, /"needs ""ladder"""/);
});

test('the CSV lists newest first, matching the table', async () => {
  const { eodReportsCsv } = await import('../src/eod/eod-page.js');
  const csv = eodReportsCsv([
    { report_date: '2026-07-28', team_member: 'A' },
    { report_date: '2026-07-31', team_member: 'B' },
  ]);
  const lines = csv.split('\r\n');
  assert.match(lines[1], /2026-07-31/);
  assert.match(lines[2], /2026-07-28/);
});

test('editing updates in place and never moves ownership', async () => {
  const page = readFileSync(new URL('../src/eod/eod-page.js', import.meta.url), 'utf8');
  // id / company / workspace / author are stripped from the update payload.
  assert.match(page, /const \{ id, company_id: _c, workspace_id: _w, created_by: _b, \.\.\.changes \} = row;/);
  assert.match(page, /\.from\('eod_reports'\)\.update\(changes\)\.eq\('id', editingId\)/);
});

test('you can edit your own report; eod.manage can edit anyone\u2019s', () => {
  const page = readFileSync(new URL('../src/eod/eod-page.js', import.meta.url), 'utf8');
  assert.match(page, /const editable = \(report\) => canManage \|\| \(profileId && report\.created_by === profileId\);/);
});

test('a stale editing id cannot reopen a vanished report', () => {
  assert.match(main, /if \(state\.eodEditingId && !companyEodReports\(companyId\)\.some\(\(row\) => row\.id === state\.eodEditingId\)\)/);
});

test('a group chat icon can be changed after creation', () => {
  // The manage modal seeds the draft from the conversation, otherwise it would show the
  // leftover draft from whatever group was created last.
  assert.match(main, /state\.messageGroupIcon = \{ icon_key: managed\?\.icon_key \|\| '', icon_image: managed\?\.icon_image \|\| '' \};/);
  assert.match(main, /\$\{conversation\.type === 'direct' \? '' : renderMessageGroupIconControl\(\)\}/);
  // Falls back to the stored value, so a direct chat (which renders no control) cannot
  // have its icon blanked by the save.
  assert.match(main, /icon_key: data\.has\('icon_key'\) \? data\.get\('icon_key'\) : conversation\.icon_key,/);
  assert.match(main, /icon_image: data\.has\('icon_image'\) \? data\.get\('icon_image'\) : conversation\.icon_image,/);
});
