import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(new URL('../supabase/migrations/202607231200_ringcentral_calls.sql', import.meta.url), 'utf8');

test('every RingCentral table is created with row level security enabled', () => {
  for (const table of ['ringcentral_accounts', 'ringcentral_extensions', 'ringcentral_calls', 'ringcentral_presence', 'ringcentral_sync_state']) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`), `${table} is not created`);
    assert.match(sql, new RegExp(`alter table public\\.${table}\\s+enable row level security`), `${table} has no RLS`);
  }
});

test('calls are unique per company and call id so re-syncing cannot duplicate', () => {
  assert.match(sql, /constraint ringcentral_calls_company_call_key unique \(company_id, call_id\)/);
});

test('a partial index backs the conversation filter', () => {
  assert.match(sql, /create index if not exists ringcentral_calls_conversation_idx[\s\S]{0,200}where is_conversation/);
});

test('members read only their own calls while admins read the company', () => {
  assert.match(sql, /create policy "members read own calls" on public\.ringcentral_calls/);
  assert.match(sql, /app_private\.is_company_admin\(company_id\)/);
  assert.match(sql, /lower\(coalesce\(auth\.jwt\(\) ->> 'email', ''\)\)/);
});

test('no policy grants write access to browser clients', () => {
  assert.doesNotMatch(sql, /for (insert|update|delete) to authenticated/);
});

test('presence and extensions are admin-readable only', () => {
  assert.match(sql, /create policy "company admins read presence" on public\.ringcentral_presence/);
  assert.match(sql, /create policy "company admins read extensions" on public\.ringcentral_extensions/);
});

test('tables are explicitly granted because Supabase does not expose them automatically', () => {
  assert.match(sql, /grant select on public\.ringcentral_calls to authenticated/);
  assert.match(sql, /grant select on public\.ringcentral_presence to authenticated/);
  assert.match(sql, /grant select on public\.ringcentral_sync_state to authenticated/);
});

test('the aggregate function is security invoker so it inherits RLS', () => {
  assert.match(sql, /create or replace function public\.ringcentral_conversation_stats/);
  assert.match(sql, /security invoker/);
  assert.match(sql, /revoke all on function public\.ringcentral_conversation_stats\(text, timestamptz, timestamptz\) from public, anon/);
  assert.match(sql, /grant execute on function public\.ringcentral_conversation_stats\(text, timestamptz, timestamptz\) to authenticated/);
});

test('the calls plugin joins the known-plugin allowlist without dropping existing entries', () => {
  assert.match(sql, /company_plugins_known_plugin_check/);
  for (const plugin of ['crm', 'crm_2', 'underwriter', 'files', 'client_portal', 'workspace_builder', 'price_book', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting', 'calls']) {
    assert.match(sql, new RegExp(`'${plugin}'`), `${plugin} disappeared from the allowlist`);
  }
});

test('team.view resolves to the calls plugin as well as reporting', () => {
  // Without this the Calls module is unreachable for any workspace that has
  // Calls installed but Reporting uninstalled.
  assert.match(sql, /create or replace function app_private\.permission_plugin_ids/);
  assert.match(sql, /when permission = 'team\.view' then array\['reporting', 'calls'\]::text\[\]/);
});

test('the rewritten permission mapping keeps every existing branch', () => {
  for (const branch of [
    "permission like 'crm.%'",
    "permission like 'underwriter.%'",
    "permission like 'files.%'",
    "permission like 'client_portals.%'",
    "permission like 'workspaces.%'",
    "permission like 'price_book.%'",
    "permission like 'forms.%'",
    "permission like 'finance.%'",
    "permission like 'messages.%'",
    "permission like 'calendar.%'",
    "permission in ('time.track', 'clock.manage')",
    "permission like 'approvals.%'",
  ]) {
    assert.ok(sql.includes(branch), `${branch} was dropped from permission_plugin_ids`);
  }
});
