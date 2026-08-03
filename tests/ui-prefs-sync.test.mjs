import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const sql = readFileSync(
  new URL('../supabase/migrations/202608041400_profile_ui_prefs.sql', import.meta.url),
  'utf8',
);

const slotsBlock = (() => {
  const at = main.indexOf('const UI_PREF_SLOTS = [');
  assert.notEqual(at, -1, 'UI_PREF_SLOTS should exist');
  return main.slice(at, main.indexOf('\n];', at));
})();

const slots = [...slotsBlock.matchAll(/\{ group: '(\w+)', name: '(\w+)', store: (\w+), json: (true|false),/g)]
  .map(([, group, name, store, json]) => ({ group, name, store, json: json === 'true' }));

// The appearance bug was a hand-maintained list that went stale and silently dropped
// settings. This table is the same shape of risk, so it is walked rather than trusted.

test('every declared preference has a real storage key behind it', () => {
  assert.ok(slots.length >= 12, `expected the full table, found ${slots.length}`);
  for (const slot of slots) {
    assert.match(main, new RegExp(`const ${slot.store} = '`), `${slot.store} is not a real storage key`);
  }
});

test('every preference both reads and writes', () => {
  // A slot with a getter and no setter syncs one way and looks like it works.
  for (const slot of slots) {
    const entry = slotsBlock.slice(slotsBlock.indexOf(`name: '${slot.name}'`));
    const body = entry.slice(0, entry.indexOf('} }') + 3);
    assert.match(body, /get: \(\) =>/, `${slot.group}.${slot.name} has no getter`);
    assert.match(body, /set: \(v\) =>/, `${slot.group}.${slot.name} has no setter`);
  }
});

test('the namespaces the client sends are the ones the database accepts', () => {
  // A namespace the client writes but the database filters out is the appearance bug again.
  const groups = [...new Set(slots.map((s) => s.group))].sort();
  assert.deepEqual(groups, ['dashboard', 'nav', 'views']);
  for (const g of groups) assert.ok(sql.includes(`'${g}'`), `namespace "${g}" is sent but not accepted`);
});

test('the database validates by namespace, not by leaf key', () => {
  // Dashboard layouts are company -> role -> widget ids; enumerating leaves would guarantee
  // the same staleness that broke appearance.
  assert.match(sql, /key in \('dashboard', 'nav', 'views'\)/);
  assert.match(sql, /jsonb_typeof\(value\) = 'object'/);
  assert.match(sql, /pg_column_size\(ui_prefs\) <= 32768/);
  assert.match(sql, /raise exception 'ui preferences too large'/, 'refuse rather than truncate');
});

test('the dashboard preferences that matter are all covered', () => {
  const names = slots.filter((s) => s.group === 'dashboard').map((s) => s.name).sort();
  // seenWidgets is the non-obvious one: without it a widget removed on one device is
  // re-offered on the other, and the layout appears to undo itself.
  assert.deepEqual(names, ['appWidgets', 'layouts', 'roleViews', 'seenWidgets']);
});

test('location is not synced, only preference', () => {
  // Two machines open on two companies must not drag each other around.
  for (const key of ['COMPANY_KEY', 'ACTIVE_WORKSPACE_KEY', 'SIDEBAR_SCROLL_KEY']) {
    assert.ok(!slotsBlock.includes(key), `${key} is location, not a preference`);
  }
});

test('no data cache is synced', () => {
  // These mirror server rows; syncing them would push a copy of the database through a
  // preferences column.
  const caches = slots.filter((s) => /_CACHE_KEY$/.test(s.store) && !/^DASHBOARD_/.test(s.store));
  assert.deepEqual(caches, [], `data caches must not sync: ${caches.map((c) => c.store).join(', ')}`);
});

// --- the sync itself -------------------------------------------------------------------

test('preferences are pushed only after the profile has been read', () => {
  // Same rule as appearance: a device that has not loaded holds defaults, and pushing from
  // there overwrites what was arranged elsewhere.
  const fn = main.slice(main.indexOf('function scheduleUiPrefsSync()'));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /if \(!isLiveSupabaseSession\(\) \|\| !profilePrefsLoaded\) return;/);
});

test('an idle session never writes', () => {
  // The hook runs on every render, so the comparison is what stops it hammering the RPC.
  const fn = main.slice(main.indexOf('function scheduleUiPrefsSync()'));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /if \(json === uiPrefsLastPushed\) return;/);
  assert.match(body, /if \(uiPrefsSyncTimer\) return;/, 'one timer at a time');
});

test('a failed push is retried rather than assumed saved', () => {
  const fn = main.slice(main.indexOf('async function flushUiPrefsSync('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /uiPrefsLastPushed = '';/);
  assert.match(body, /console\.warn\('UI preference sync failed'/, 'a preference must not interrupt anyone');
});

test('the saved arrangement is applied when the profile lands', () => {
  const fn = main.slice(main.indexOf('function refreshResolvedAppearance()'));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /applySyncedUiPrefs\(activeSession\(\)\?\.profile\?\.ui_prefs\)/);
});

test('the profile normalizer keeps ui_prefs', () => {
  // Dropping it here would mean the saved dashboard never reaches the device that asked.
  assert.match(main, /ui_prefs: \(input\.ui_prefs && typeof input\.ui_prefs === 'object'\)/);
});

test('applying writes through to this device as well as to state', () => {
  // Or the arrangement vanishes on the next cold start, before auth resolves.
  const fn = main.slice(main.indexOf('function applySyncedUiPrefs('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /if \(slot\.json\) writeJson\(slot\.store, value\);/);
  assert.match(body, /else localStorage\.setItem\(slot\.store, String\(value\)\);/);
  assert.match(body, /if \(uiPrefsSyncPending\) return;/, 'an in-flight local change is the newer intent');
});
