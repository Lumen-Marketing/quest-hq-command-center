import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "Timer resets on refresh" and "the Clock dashboard is device-local" turned out to be one
// bug with one cause: persistTimeState() returned early for every Supabase session, so a
// signed-in person's clock was written neither to the local cache nor to the server, and the
// refresh that reloads state from the server found nothing and cleared it.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const clockDashboard = readFileSync(join(root, 'src', 'ops', 'clock-dashboard-page.js'), 'utf8');
const initialQueries = readFileSync(join(root, 'src', 'data', 'initial-data-queries.js'), 'utf8');
const migration = readFileSync(
  join(root, 'supabase', 'migrations', '202608081000_company_time_clock.sql'),
  'utf8',
);

test('a signed-in session writes the clock somewhere', () => {
  const fn = main.slice(main.indexOf('function persistTimeState(closedEntry = null)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  // The early return that dropped every write is the bug.
  assert.ok(!/if \(state\.session\?\.auth === 'supabase'\) return;/.test(body));
  assert.match(body, /if \(isLiveSupabaseSession\(\)\) \{/);
  assert.match(body, /persistTimeStateToSupabase\(closedEntry\)/);
  // A local or demo session still uses the cache it always used.
  assert.match(body, /writeJson\(ACTIVE_TIMER_KEY, state\.activeTimer\);/);
});

test('stopping the clock stores the shift and clears the running row', () => {
  const fn = main.slice(main.indexOf('async function persistTimeStateToSupabase(closedEntry)'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /client\.from\('company_time_entries'\)\.insert\(\{/);
  // Upsert on the primary key, because one person has one clock: starting a second replaces
  // the first rather than colliding with it.
  assert.match(body, /\.upsert\(\{[\s\S]*?\}, \{ onConflict: 'profile_id' \}\)/);
  assert.match(body, /client\.from\('company_active_timers'\)\.delete\(\)\.eq\('profile_id', profileId\)/);
  // The optimistic row carries a local uuid; the stored id replaces it.
  assert.match(body, /state\.timeEntries\[at\] = normalizeTimeEntry\(insert\.data\)/);
  assert.match(body, /notifySyncFailure\(result\.error, 'Clock'\)/, 'a refused write has to say so');
});

test('the running clock is fetched on first paint while history waits for Clock', () => {
  // The module grid paints an "On" badge for it before anything is clicked.
  assert.match(initialQueries, /activeTimerResult: client\.from\('company_active_timers'\)\.select\('\*'\)/);
  assert.match(main, /if \(!activeTimerResult\.error\) state\.activeTimer = normalizeActiveTimer\(\(activeTimerResult\.data \|\| \[\]\)\[0\]\)/);
  assert.doesNotMatch(initialQueries, /company_time_entries/);
  assert.match(main, /if \(!ensureDomainLoaded\('time'\)\) return questLoader\('Loading clock'\)/);
  assert.match(readFileSync(new URL('../src/data/realtime-deferred-loader.js', import.meta.url), 'utf8'), /domain === 'time'/);
});

test('the clock shows my time and nobody else s', () => {
  const fn = main.slice(main.indexOf('function timeEntriesForCompany(companyId = activeCompanyId())'));
  const body = fn.slice(0, fn.search(/\r?\n\}/));
  assert.match(body, /entry\.company_id === companyId && isMyClockRow\(entry\)/);
  const timer = main.slice(main.indexOf('function activeTimerForCompany(companyId = activeCompanyId())'));
  assert.match(timer.slice(0, timer.search(/\r?\n\}/)), /if \(!isMyClockRow\(timer\)\) return null;/);
  // Both spellings of the owner column, so a cache written before this moved to the server
  // still reads back as mine.
  const owner = main.slice(main.indexOf('function isMyClockRow(row)'));
  assert.match(owner.slice(0, owner.search(/\r?\n\}/)), /row\?\.profile_id \|\| row\?\.user_id/);
});

test('the database keeps one clock per person and shows it to nobody else', () => {
  assert.match(migration, /profile_id uuid primary key references public\.profiles\(id\)/);
  assert.match(migration, /create policy "own running clock"[\s\S]*?using \(profile_id = \(select auth\.uid\(\)\)\)/);
  assert.match(migration, /create policy "own time entries"[\s\S]*?profile_id = \(select auth\.uid\(\)\)/);
  // Writing time needs the permission; reading your own does not, or you would lose your own
  // history the moment a role changed.
  assert.match(migration, /create policy "log own time"[\s\S]*?has_company_permission\(company_id, 'time\.track'\)/);
  assert.match(migration, /create policy "start own clock"[\s\S]*?has_company_permission\(company_id, 'time\.track'\)/);
});

test('a deleted task does not erase the hours worked on it', () => {
  assert.match(migration, /task_id text not null default '',\s*[\r\n]+\s*task_title text not null default ''/);
  assert.ok(
    !/task_id text[^\n]*references public\.tasks/.test(migration),
    'a cascade from tasks would delete somebody s recorded time',
  );
});

test('the standard roles can actually clock in', () => {
  // time.track was granted to two hand-made roles only; a named Manager or Staff would have
  // been refused by the database for the action they use most.
  assert.match(migration, /insert into public\.role_permissions \(role_id, permission_key, effect\)[\s\S]*?'time\.track', 'allow'/);
  assert.match(migration, /where lower\(name\) in \('owner', 'admin', 'manager', 'staff', 'member', 'worker'\)/);
});

test('short and unusually long shifts have guardrails instead of silently creating bad rows', () => {
  const stop = main.slice(main.indexOf('function stopClock(shouldRender = true)'));
  const body = stop.slice(0, stop.indexOf('\n}', 1) + 2);
  assert.match(main, /const MIN_CLOCK_ENTRY_MS = 60 \* 1000/);
  assert.match(main, /const LONG_CLOCK_ENTRY_MS = 16 \* 60 \* 60 \* 1000/);
  assert.match(body, /window\.confirm\('This shift is longer than 16 hours\. Save it anyway\?'\)/);
  assert.match(body, /durationMs < MIN_CLOCK_ENTRY_MS/);
  assert.match(body, /no duplicate 0m entry was saved/);
  assert.match(clockDashboard, /function timeEntryQuality\(entry = \{\}\)/);
});

test('the clock lazy-load failure gives the user a working retry', () => {
  assert.match(main, /let clockDashboardPageError = null/);
  assert.match(main, /workspaceHeader\('Clock dashboard could not load'[^\n]+retry-clock-dashboard/);
  assert.match(main, /if \(action === 'retry-clock-dashboard'\)/);
});
