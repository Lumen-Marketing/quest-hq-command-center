import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const sql = readFileSync(
  new URL('../supabase/migrations/202608041000_appearance_prefs_sidebar_keys.sql', import.meta.url),
  'utf8',
);

/** The keys the client actually stores and syncs. */
function appearanceKeys() {
  const at = main.indexOf('const APPEARANCE_DEFAULTS = {');
  assert.notEqual(at, -1);
  const body = main.slice(at, main.indexOf('\n};', at));
  return [...body.matchAll(/^\s{2}([A-Za-z][\w]*):/gm)].map((m) => m[1]);
}

// Appearance settings stopped following people between devices because both RPCs rebuilt the
// payload from a hard-coded whitelist and then replaced the stored object with the result.
// Anything not on the list was dropped server-side, and the client deliberately ignores a
// failed appearance sync -- so the setting worked on the device that set it and nowhere else.
//
// The whitelist is still the right design: this object is written back into every session,
// and an open one would let anything ride along into other people's browsers. What was wrong
// was that nothing tied the list to the settings the client actually has.

test('every synced appearance key is accepted by the database', () => {
  const missing = appearanceKeys()
    // The background image is deliberately never synced: it is a data URL, it would blow the
    // 2048-byte column check, and it belongs to the device that chose it.
    .filter((k) => k !== 'bgImage')
    .filter((k) => !sql.includes(`'${k}'`));
  assert.deepEqual(missing, [], `these appearance keys would be dropped server-side: ${missing.join(', ')}`);
});

test('the two settings that live outside APPEARANCE_DEFAULTS are accepted too', () => {
  // themeMode and accent have their own storage keys but ride in the same payload.
  assert.match(main, /return \{ themeMode: getThemeMode\(\), accent: getAccent\(\), \.\.\.shareable \}/);
  assert.match(sql, /'themeMode'/);
  assert.match(sql, /'accent'/);
});

test('the background image is never synced', () => {
  // A data URL in a column capped at 2048 bytes would fail the write, and the failure is
  // swallowed by design -- so it would take every other setting down with it, silently.
  assert.match(main, /const \{ bgImage, \.\.\.shareable \} = getAppearance\(\);/);
});

test('personal and company defaults share one sanitiser', () => {
  // They previously held identical copies of the list and went stale together.
  assert.match(sql, /create or replace function app_private\.clean_appearance_prefs/);
  const own = sql.slice(sql.indexOf('function public.update_own_appearance'));
  const company = sql.slice(sql.indexOf('function public.update_company_appearance'));
  assert.match(own, /app_private\.clean_appearance_prefs\(p_prefs\)/);
  assert.match(company, /app_private\.clean_appearance_prefs\(p_prefs\)/);
  assert.ok(!/jsonb_build_object/.test(own.slice(0, company.length)), 'no second copy of the list');
});

test('every allowed value list matches the client', () => {
  const list = (name) => {
    const at = main.indexOf(`const ${name} = [`);
    return [...main.slice(at, main.indexOf('\n];', at)).matchAll(/\[\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);
  };
  // A theme the client offers but the database rejects is the same bug in a different place.
  for (const id of list('SIDEBAR_THEMES')) {
    assert.ok(sql.includes(`'${id}'`), `sidebar theme "${id}" is offered but not accepted`);
  }
  for (const id of list('ICON_PACKS')) {
    assert.ok(sql.includes(`'${id}'`), `icon pack "${id}" is offered but not accepted`);
  }
  for (const id of list('ACCENT_OPTIONS')) {
    assert.ok(sql.includes(`'${id}'`), `accent "${id}" is offered but not accepted`);
  }
  // 'custom' is a sidebarTheme value without being in SIDEBAR_THEMES.
  assert.ok(sql.includes("'custom'"), 'a custom sidebar colour must be storable');
});

test('an empty sidebar text colour is stored, not stripped', () => {
  // '' means "follow the preset", and it is how someone clears a colour they had set.
  // jsonb_strip_nulls keeps it; the branch has to exist for it to survive validation.
  assert.match(sql, /when p_prefs->>'sidebarText' = '' then ''/);
});
