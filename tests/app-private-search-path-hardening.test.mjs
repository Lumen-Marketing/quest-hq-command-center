import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(
  new URL('../supabase/migrations/20260901200003_harden_remaining_app_private_search_paths.sql', import.meta.url),
  'utf8',
);

const signatures = [
  'chat_attachment_visible(uuid, uuid)',
  'chat_left_at(uuid)',
  'chat_message_visible(uuid, timestamptz)',
  'companies_seed_task_taxonomy()',
  'guard_system_role()',
  'guard_wildcard_permission()',
  'seed_company_default_roles(text, uuid)',
];

test('the remaining app_private definers receive an empty search path', () => {
  for (const signature of signatures) {
    const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(
      sql,
      new RegExp(`alter\\s+function\\s+app_private\\.${escaped}\\s+set\\s+search_path\\s*=\\s*''`, 'i'),
      `${signature} must use an empty search path`,
    );
  }
});

test('the hardening migration changes configuration without replacing routine bodies', () => {
  assert.doesNotMatch(sql, /create\s+(?:or\s+replace\s+)?function/i);
  assert.equal((sql.match(/alter\s+function/gi) || []).length, signatures.length);
});
