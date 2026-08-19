import assert from 'node:assert/strict';
import test from 'node:test';

import {
  dueEvents, eventDay, eventTime, eventTitle, eventsByDay, eventsForItems, heldEvents,
  reminderText,
} from '../src/workspace/record-events.js';

// "Make the call reminder added on Quick Create also appear on the app calendar and on the
// contact card calendar, and alarm when the date and time comes."
//
// The reading half, pure: which day a scheduled thing lands on, whose records it belongs to, and
// which ones are due. No database and no clock, so the calendars and the alarm can be checked
// without either.

const row = (over = {}) => ({
  id: 'e1',
  kind: 'call',
  title: 'Follow up',
  to_number: '555 111 2222',
  status: 'scheduled',
  notified_at: null,
  created_by: 'me',
  item_id: 'item-1',
  // Local noon, so the day is the same one everywhere this test can run.
  scheduled_for: new Date(2026, 8, 1, 12, 0).toISOString(),
  ...over,
});

test('a thing lands on the day it is local to, not the day UTC calls it', () => {
  // A call at 8pm on the 1st is on the 1st for the person who arranged it. Slicing the ISO
  // string would file it on the 2nd for everyone east of UTC and nobody would know why.
  const late = row({ scheduled_for: new Date(2026, 8, 1, 20, 30).toISOString() });
  assert.equal(eventDay(late), '2026-09-01');
  assert.equal(eventTime(late), '20:30');
  const early = row({ scheduled_for: new Date(2026, 8, 1, 0, 15).toISOString() });
  assert.equal(eventDay(early), '2026-09-01');
  assert.equal(eventTime(early), '00:15');
});

test('a date that will not parse puts nothing anywhere', () => {
  assert.equal(eventDay(row({ scheduled_for: 'soon' })), '');
  assert.equal(eventDay(null), '');
  assert.equal(eventTime(row({ scheduled_for: '' })), '');
  assert.equal(eventsByDay([row({ scheduled_for: 'soon' })]).size, 0, 'an unplaceable row is not a day');
});

test('a thing with no title says what kind of thing it is', () => {
  assert.equal(eventTitle(row()), 'Follow up');
  assert.equal(eventTitle(row({ title: '   ' })), 'Call');
  assert.equal(eventTitle(row({ title: '', kind: 'sms' })), 'Message');
});

test('a day reads down the morning', () => {
  const at = (h) => new Date(2026, 8, 1, h, 0).toISOString();
  const map = eventsByDay([
    row({ id: 'c', scheduled_for: at(16) }),
    row({ id: 'a', scheduled_for: at(8) }),
    row({ id: 'b', scheduled_for: at(11) }),
    row({ id: 'd', scheduled_for: new Date(2026, 8, 2, 9, 0).toISOString() }),
  ]);
  assert.deepEqual(map.get('2026-09-01').map((r) => r.id), ['a', 'b', 'c']);
  assert.deepEqual(map.get('2026-09-02').map((r) => r.id), ['d']);
});

test('a contact sees the reminders on its own records and no others', () => {
  const rows = [row({ id: 'a', item_id: 'item-1' }), row({ id: 'b', item_id: 'item-9' })];
  assert.deepEqual(eventsForItems(rows, ['item-1']).map((r) => r.id), ['a']);
  assert.deepEqual(eventsForItems(rows, new Set(['item-9'])).map((r) => r.id), ['b']);
  assert.deepEqual(eventsForItems(rows, []), []);
  assert.deepEqual(eventsForItems(null, ['item-1']), []);
});

// ---- the alarm ---------------------------------------------------------------------------------

const NOW = new Date(2026, 8, 1, 12, 0).toISOString();
const ago = (mins) => new Date(new Date(NOW).getTime() - mins * 60000).toISOString();
const ahead = (mins) => new Date(new Date(NOW).getTime() + mins * 60000).toISOString();

test('due means the moment has passed, and a moment still to come is left alone', () => {
  assert.equal(dueEvents([row({ scheduled_for: ago(1) })], NOW, 'me').length, 1);
  assert.equal(dueEvents([row({ scheduled_for: NOW })], NOW, 'me').length, 1, 'on the minute is due');
  assert.equal(dueEvents([row({ scheduled_for: ahead(1) })], NOW, 'me').length, 0);
});

test('one missed while the app was shut is still announced, late', () => {
  // Silence is not the honest answer to "you were supposed to ring them yesterday".
  assert.equal(dueEvents([row({ scheduled_for: ago(60 * 26) })], NOW, 'me').length, 1);
});

test('announced once, and never again', () => {
  assert.deepEqual(dueEvents([row({ scheduled_for: ago(5), notified_at: ago(4) })], NOW, 'me'), []);
});

test('a cancelled or finished reminder does not go off', () => {
  assert.deepEqual(dueEvents([row({ scheduled_for: ago(5), status: 'cancelled' })], NOW, 'me'), []);
  assert.deepEqual(dueEvents([row({ scheduled_for: ago(5), status: 'done' })], NOW, 'me'), []);
});

test('it belongs to whoever arranged it', () => {
  // Everybody in the company being alarmed about a call they did not arrange is noise -- and
  // since noticing is a claim, the first of them to notice would silence it for the one person
  // it was actually for.
  const mine = row({ scheduled_for: ago(5), created_by: 'me' });
  const theirs = row({ id: 'e2', scheduled_for: ago(5), created_by: 'someone-else' });
  assert.deepEqual(dueEvents([mine, theirs], NOW, 'me').map((r) => r.id), ['e1']);
  // An old row with no creator on it belongs to whoever is looking, rather than to nobody.
  assert.equal(dueEvents([row({ scheduled_for: ago(5), created_by: null })], NOW, 'me').length, 1);
});

test('what the alarm actually says', () => {
  assert.deepEqual(reminderText(row()), { title: 'Call: Follow up', body: 'Due now — 555 111 2222' });
  assert.deepEqual(
    reminderText(row({ kind: 'sms', title: 'Arrival', to_number: '' })),
    { title: 'Message: Arrival', body: 'Due now' },
  );
});

test('the held rows are read without asking for any', () => {
  // What the two calendars call during a render. They cannot wait for a fetch, so they draw what
  // has arrived -- and nothing, before it has.
  const state = { wbEvents: { co1: [row()] } };
  assert.equal(heldEvents(state, 'co1').length, 1);
  assert.deepEqual(heldEvents(state, 'other'), []);
  assert.deepEqual(heldEvents({}, 'co1'), []);
  assert.deepEqual(heldEvents(undefined, 'co1'), []);
});
