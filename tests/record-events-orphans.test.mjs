import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { createRecordEvents, eventsByDay, eventsForItems } from '../src/workspace/record-events.js';

// "I deleted all the records so why is this stays here?"
//
// Because a scheduled call is a ROW in wb_record_events and a record is a fragment of a JSON
// document. There is no table for a foreign key to point at, so nothing cascades: delete the
// record and its calls stay behind, and the calendar drew them for ever -- no name on them, and
// a link that went nowhere.
//
// Two surfaces read those rows and both had to learn the same thing.

const views = readFileSync(new URL('../src/workspace/app-views.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const row = (id, itemId, when) => ({
  id, item_id: itemId, app_id: 'app-1', workspace_id: 'ws-uuid', kind: 'call',
  title: 'Follow up', scheduled_for: when, status: 'scheduled', notified_at: null, created_by: 'me',
});

/* ---- the calendar ---------------------------------------------------------------------- */

test('an event whose record is gone is not put on a day', () => {
  const rows = [row('e1', 'kept', '2026-09-01T09:00:00Z'), row('e2', 'deleted', '2026-09-01T10:00:00Z')];
  const alive = new Set(['kept']);
  const days = eventsByDay(eventsForItems(rows, alive));
  const all = [...days.values()].flat();
  assert.deepEqual(all.map((r) => r.id), ['e1']);
});

test('the calendar filters against the app it is drawing', () => {
  // The app is resolved at that point, so its item list is proof rather than a guess.
  assert.match(views, /const alive = new Set\(\(app\.items \|\| \[\]\)\.map\(\(one\) => one\.id\)\);/);
  assert.match(views, /eventsForItems\(/);
});

/* ---- the alarm ------------------------------------------------------------------------- */

function bench({ live = true } = {}) {
  const announced = [];
  const rows = [row('e1', 'deleted', '2020-01-01T00:00:00Z')];
  const events = createRecordEvents({
    activeProfileId: () => 'me',
    appHref: (p) => p,
    companyPath: () => '/',
    isLiveSupabaseSession: () => true,
    notifyLocalEvent: (...args) => announced.push(args),
    render: () => {},
    state: {},
    recordIsLive: () => live,
    createSupabaseClient: () => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: rows }),
            }),
          }),
        }),
        update: () => ({
          in: () => ({
            is: () => ({ select: () => Promise.resolve({ data: [{ id: 'e1' }] }) }),
          }),
        }),
      }),
    }),
  });
  return { events, announced };
}

test('a due reminder on a deleted record never goes off', async () => {
  // Worse than a missed alarm: it rings, names a call, and takes you to a page that says the
  // record is gone.
  const b = bench({ live: false });
  assert.deepEqual(await b.events.checkReminders('co1'), []);
  assert.equal(b.announced.length, 0);
});

test('a due reminder on a record that is still there still goes off', async () => {
  const b = bench({ live: true });
  const out = await b.events.checkReminders('co1');
  assert.equal(out.length, 1);
  assert.equal(b.announced.length, 1);
});

test('with no liveness check supplied, nothing is silenced', async () => {
  // Suppressing an alarm is destructive -- the reminder is gone and nobody is told -- so the
  // ABSENCE of a check must never be read as "the record is gone".
  const announced = [];
  const rows = [row('e1', 'whoever', '2020-01-01T00:00:00Z')];
  const events = createRecordEvents({
    activeProfileId: () => 'me',
    appHref: (p) => p,
    companyPath: () => '/',
    isLiveSupabaseSession: () => true,
    notifyLocalEvent: (...args) => announced.push(args),
    render: () => {},
    state: {},
    createSupabaseClient: () => ({
      from: () => ({
        select: () => ({ eq: () => ({ eq: () => ({ order: () => Promise.resolve({ data: rows }) }) }) }),
        update: () => ({ in: () => ({ is: () => ({ select: () => Promise.resolve({ data: [{ id: 'e1' }] }) }) }) }),
      }),
    }),
  });
  assert.equal((await events.checkReminders('co1')).length, 1);
});

test('a document this session cannot see is not evidence that a record is gone', () => {
  // The predicate main.js supplies. An unresolvable app returns true, so a company whose document
  // has not been loaded cannot swallow its own reminders.
  assert.match(main, /if \(!app \|\| !Array\.isArray\(app\.items\)\) return true;/);
  assert.match(main, /return app\.items\.some\(\(one\) => one\.id === row\.item_id\);/);
});
