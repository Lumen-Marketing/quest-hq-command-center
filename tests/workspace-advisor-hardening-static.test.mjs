import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const migrationUrl = new URL('../supabase/migrations/202607211230_workspace_tenancy_advisor_hardening.sql', import.meta.url);
const sql = existsSync(migrationUrl) ? readFileSync(migrationUrl, 'utf8') : '';

test('workspace tenancy advisor hardening migration exists', () => {
  assert.ok(sql, 'Expected the workspace tenancy advisor hardening migration');
});

test('workspace actor foreign keys have covering indexes', () => {
  assert.match(sql, /create index if not exists workspaces_created_by_idx on public\.workspaces\(created_by\)/i);
  assert.match(sql, /create index if not exists workspace_memberships_assigned_by_idx on public\.workspace_memberships\(assigned_by\)/i);
  assert.match(sql, /create index if not exists workspace_plugins_installed_by_idx on public\.workspace_plugins\(installed_by\)/i);
});

test('workspace membership and plugin admin policies do not overlap SELECT policies', () => {
  assert.match(sql, /drop policy if exists "workspace admins manage memberships"/i);
  assert.match(sql, /create policy "workspace admins insert memberships"[\s\S]*for insert/i);
  assert.match(sql, /create policy "workspace admins update memberships"[\s\S]*for update/i);
  assert.match(sql, /create policy "workspace admins delete memberships"[\s\S]*for delete/i);
  assert.match(sql, /drop policy if exists "workspace admins manage plugins"/i);
  assert.match(sql, /create policy "workspace admins insert plugins"[\s\S]*for insert/i);
  assert.match(sql, /create policy "workspace admins update plugins"[\s\S]*for update/i);
  assert.match(sql, /create policy "workspace admins delete plugins"[\s\S]*for delete/i);
  assert.doesNotMatch(sql, /for all to authenticated/i);
});
