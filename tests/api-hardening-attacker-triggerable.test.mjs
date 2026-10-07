import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { recordFailedPasscode } from '../api/_lib/intake-db.js';
import { LOCKOUT_MINUTES, MAX_PASSCODE_ATTEMPTS } from '../api/_lib/intake.js';

// Three findings from the 2026-10-01 audit, all of them attacker-triggerable rather than
// theoretical. Each was reachable without any credentials in one case, and with a single valid
// session in the others.
//
// The intake one is the reason this file starts where it does: `recordFailedPasscode` had NO test
// at all, which is how a denial-of-service sat in the middle of a security control for as long as
// it did.

// ---------------------------------------------------------------------------
// A fake PostgREST that models the compare-and-swap honestly.
//
// `raceAlways` makes every PATCH with a filter return an empty array, which is what Postgres says
// when the WHERE clause matched no row -- i.e. somebody else moved the row first. That is the
// contention the fallback exists to handle.
// ---------------------------------------------------------------------------

function fakeDb({ initialFailed = 0, lockedUntil = null, raceAlways = false } = {}) {
  const state = { failed_attempts: initialFailed, locked_until: lockedUntil };
  const calls = [];
  const db = async (path, options = {}) => {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ path, method, body });

    if (method === 'GET') {
      const column = /select=(\w+)/.exec(path)?.[1];
      if (path.includes('wb_intake_links?token=') && column) {
        return { ok: true, status: 200, async json() { return [{ [column]: state[column] }]; } };
      }
      return { ok: true, status: 200, async json() { return []; } };
    }

    if (method === 'PATCH') {
      // A filtered PATCH is a compare-and-swap: the filter names the value that was read.
      const cas = /failed_attempts=eq\.(\d+)/.exec(path);
      if (cas) {
        if (raceAlways || Number(cas[1]) !== state.failed_attempts) {
          return { ok: true, status: 200, async json() { return []; } }; // lost the race
        }
        Object.assign(state, body);
        return { ok: true, status: 200, async json() { return [{ id: 'link_1' }]; } };
      }
      // An unfiltered PATCH lands unconditionally.
      Object.assign(state, body);
      return { ok: true, status: 200, async json() { return []; } };
    }

    return { ok: true, status: 200, async json() { return []; } };
  };
  return { db, state, calls };
}

test('contention refuses the guess instead of locking the link', async () => {
  // Eight wrong guesses posted together all lose every compare-and-swap. Under the old code that
  // wrote locked_until unconditionally, so the attempts never had to be counted: whoever held the
  // link could shut a live submission form for 15 minutes at a time, indefinitely, and never come
  // near the real threshold of eight.
  const { db, state, calls } = fakeDb({ initialFailed: 0, raceAlways: true });

  const result = await recordFailedPasscode(db, 'tok');

  assert.equal(result.locked, false, 'a lost race must not lock a live link');
  assert.equal(state.locked_until, null, 'and must not write locked_until');
  assert.equal(
    calls.filter((call) => call.body && 'locked_until' in call.body && call.body.locked_until).length,
    0,
    'no call may carry a ban',
  );
});

test('a link is still locked when the counter genuinely reached the limit', async () => {
  // The control has to keep working. Losing five races does not excuse the counter, so if it
  // really did reach MAX_PASSCODE_ATTEMPTS during those rounds the link locks on the ordinary terms.
  const { db, state } = fakeDb({ initialFailed: MAX_PASSCODE_ATTEMPTS, raceAlways: true });

  const result = await recordFailedPasscode(db, 'tok');

  assert.equal(result.locked, true);
  assert.ok(state.locked_until, 'the link must carry the ban');
});

test('the ordinary counted path is unchanged', async () => {
  // One below the threshold: counted, not locked. This is the behaviour the existing design had
  // and the one the fallback must not disturb.
  const { db, state } = fakeDb({ initialFailed: MAX_PASSCODE_ATTEMPTS - 1 });

  const result = await recordFailedPasscode(db, 'tok');

  assert.equal(result.locked, true, 'reaching the threshold still locks');
  assert.equal(state.failed_attempts, 0, 'counter resets when the ban is applied');
});

test('a single uncontended wrong guess is counted, not locked', async () => {
  const { db, state } = fakeDb({ initialFailed: 2 });

  const result = await recordFailedPasscode(db, 'tok');

  assert.equal(result.locked, false);
  assert.equal(state.failed_attempts, 3);
  assert.equal(state.locked_until, null);
});

// ---------------------------------------------------------------------------
// ringcentral-presence: a GET with a database write and an upstream fetch, reached without the
// wrapper's rate limit or origin check because it predates defineEndpoint.
// ---------------------------------------------------------------------------

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const presence = readFileSync(join(root, 'api', 'ringcentral-presence.js'), 'utf8');
const ringcentralLib = readFileSync(join(root, 'api', '_lib', 'ringcentral.js'), 'utf8');

test('ringcentral-presence rate limits and checks origin', () => {
  assert.match(presence, /import \{ enforceRateLimit \} from '\.\/_lib\/rate-limit\.js';/);
  assert.match(presence, /requireAllowedOrigin\(request\);/);
  assert.match(
    presence,
    /enforceRateLimit\(request, response, \{ namespace: 'ringcentral-presence', limit: \d+, windowMs: \d+_000 \}\)/,
    'a ceiling has to exist, and it has to be a real one',
  );
  // Order matters: reject the cross-origin caller before spending a RingCentral request.
  assert.ok(
    presence.indexOf('requireAllowedOrigin(request)') < presence.indexOf('enforceRateLimit('),
    'the origin check must come first, or a refused caller still costs an upstream fetch',
  );
  assert.ok(
    presence.indexOf('enforceRateLimit(') < presence.indexOf('fetchPaged('),
    'the limit must be applied before the upstream call it exists to bound',
  );
});

test('presence pages far less than call history does', () => {
  // Presence is one row per extension -- a snapshot, not a log. The shared 250 x 40 ceiling is
  // sized for call history, so one request could pull 10,000 records to render a board with a few
  // dozen rows on it.
  assert.match(presence, /\{ pageSize: 100, maxPages: 3 \}/);
  assert.match(
    ringcentralLib,
    /async function fetchPaged\(path, params = \{\}, \{ pageSize = PAGE_SIZE, maxPages = MAX_PAGES \} = \{\}\)/,
    'fetchPaged has to accept the override without disturbing its other callers',
  );
  // The sync endpoint still walks call history at the shared ceiling, so the default must survive.
  assert.match(ringcentralLib, /pageSize = PAGE_SIZE, maxPages = MAX_PAGES/);
});

test('the ringcentral sync caller is untouched by the new option', () => {
  const sync = readFileSync(join(root, 'api', 'ringcentral-sync.js'), 'utf8');
  assert.match(sync, /fetchPaged\(/);
  // Two-argument calls keep the defaults; nothing was rewritten to pass an override.
  assert.doesNotMatch(sync, /fetchPaged\([^)]*\{ pageSize/);
});