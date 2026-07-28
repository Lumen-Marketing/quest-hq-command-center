import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202607291400_company_appearance_default.sql', import.meta.url), 'utf8');
const profileMigration = readFileSync(new URL('../supabase/migrations/202607291200_profile_appearance_sync.sql', import.meta.url), 'utf8');

test('the company default is a sized jsonb column, not an open blob store', () => {
  assert.match(migration, /alter table public\.companies\s+add column if not exists appearance_prefs jsonb not null default '\{\}'::jsonb;/);
  assert.match(migration, /check \(pg_column_size\(appearance_prefs\) <= 2048\)/);
});

test('only company admins can write the company default', () => {
  assert.match(migration, /security definer/);
  assert.match(migration, /set search_path = ''/);
  assert.match(migration, /if not \(app_private\.is_company_admin\(v_company_id\) or app_private\.is_quest_admin\(\)\) then\s+raise exception 'Company admin access required'/);
  assert.match(migration, /revoke execute on function public\.update_company_appearance\(text, jsonb\) from public, anon;/);
  assert.match(migration, /grant execute on function public\.update_company_appearance\(text, jsonb\) to authenticated;/);
});

test('both appearance RPCs whitelist the same fields server-side', () => {
  // The client never decides what may be stored; an image can never be smuggled in.
  for (const sql of [migration, profileMigration]) {
    for (const field of ['themeMode', 'accent', 'bgType', 'bgPreset', 'cardStyle', 'cardColor', 'cardOpacity', 'cardBlur']) {
      assert.ok(sql.includes(`'${field}'`), `expected the whitelist to cover ${field}`);
    }
    assert.doesNotMatch(sql, /'bgImage'/, 'background images must never be stored server-side');
    assert.match(sql, /jsonb_strip_nulls/);
    assert.match(sql, /least\(100, greatest\(20,/, 'cardOpacity must be clamped');
    assert.match(sql, /least\(40, greatest\(0,/, 'cardBlur must be clamped');
  }
});

test('a member\'s own appearance beats the company default', () => {
  assert.match(source, /function resolvedAppearancePrefs\(\)/);
  // Personal first, company only as the fallback — never the other way round.
  assert.match(source, /const personal = activeSession\(\)\?\.profile\?\.appearance_prefs;\s*\n\s*if \(hasPrefs\(personal\)\) return personal;/);
  assert.match(source, /const company = companyById\(activeCompanyId\(\)\)\?\.appearance_prefs;/);
});

test('inheriting a company look never writes it into the member profile', () => {
  // Only explicit user actions push, so a non-empty profile record always means
  // "this person chose for themselves" and the company default must not stomp it.
  const applyFn = source.match(/function applySyncedAppearance\(prefs\)\{?[\s\S]*?\n\}/)[0];
  assert.doesNotMatch(applyFn, /pushAppearanceSync\(\)/);
  for (const setter of ['function setTheme(', 'function setAccent(', 'function setAppearance(']) {
    const at = source.indexOf(setter);
    assert.notEqual(at, -1, `expected ${setter}`);
    const body = source.slice(at, source.indexOf('\n}', at));
    assert.match(body, /pushAppearanceSync\(\)/, `${setter} must record the personal override`);
  }
});

test('the resolved appearance is re-applied when its inputs change', () => {
  assert.match(source, /function refreshResolvedAppearance\(\)/);
  // Sign-in brings the profile, the bootstrap load brings companies, and switching
  // company can bring a different default.
  const calls = source.match(/refreshResolvedAppearance\(\);/g) || [];
  assert.ok(calls.length >= 3, `expected refreshResolvedAppearance at 3+ sites, found ${calls.length}`);
  assert.match(source, /state\.activeCompanyId = next;[\s\S]{0,400}refreshResolvedAppearance\(\);/);
});

test('the save action is gated in the UI as well as the database', () => {
  assert.match(source, /function canManageCompanyAppearance\(companyId = activeCompanyId\(\)\)/);
  assert.match(source, /\['owner', 'admin', 'developer'\]/);
  assert.match(source, /canManageCompanyAppearance\(\) \? `[\s\S]*?data-action="save-company-appearance"/);
  assert.match(source, /client\.rpc\('update_company_appearance', \{ target_company_id: companyId, p_prefs: prefs \}\)/);
});
