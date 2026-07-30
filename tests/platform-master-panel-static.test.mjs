import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// The platform master panel is lazily loaded from its own module, so the shell and
// that module are both part of 'the source' for these assertions.
const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/platform/master-panel.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202606251100_platform_master_panel.sql', import.meta.url), 'utf8');

test('platform master migration exposes admin-only company and member RPCs', () => {
  assert.match(migration, /create or replace function public\.list_platform_companies\(\)/);
  assert.match(migration, /create or replace function public\.list_platform_company_members\(target_company_id text default null\)/);
  assert.match(migration, /create or replace function public\.manage_platform_company\(/);
  assert.match(migration, /if not app_private\.is_quest_admin\(\) then/);
  assert.match(migration, /when 'archive' then 'canceled'/);
  assert.match(migration, /revoke all on function public\.manage_platform_company\(text, text, text\) from public, anon;/);
  assert.match(migration, /grant execute on function public\.manage_platform_company\(text, text, text\) to authenticated;/);
});

test('platform master panel is gated to platform admins and lists companies with members', () => {
  assert.match(source, /if \(isQuestDeveloper\(\)\) settingsTabs\.push\(\[companyPath\('settings', \{ tab: 'master' \}/);
  assert.match(source, /function renderPlatformMasterPanel\(currentCompanyId\)/);
  assert.match(source, /function renderPlatformCompanyRow\(company, currentCompanyId\)/);
  assert.match(source, /function renderPlatformMemberRow\(member\)/);
  assert.match(source, /data-action="platform-company-action"/);
  assert.match(source, /client\.rpc\('list_platform_companies'\)/);
  assert.match(source, /client\.rpc\('list_platform_company_members', \{ target_company_id: null \}\)/);
  assert.match(source, /client\.rpc\('manage_platform_company'/);
});

test('platform company rows merge live admin data with known companies', () => {
  assert.match(source, /const fromCompanies = state\.companies\.map\(\(company\) =>/);
  assert.match(source, /fromCompanies\.concat\(fromPlatform\)\.forEach/);
  assert.doesNotMatch(source, /if \(fromPlatform\.length\) return fromPlatform\.sort\(platformCompanySort\);/);
});

test('platform master styles keep company and member rows scannable', () => {
  assert.match(styles, /\.platform-master-panel \{/);
  assert.match(styles, /\.platform-company-card \{/);
  assert.match(styles, /\.platform-company-actions \{/);
  assert.match(styles, /\.platform-member-row \{/);
});
