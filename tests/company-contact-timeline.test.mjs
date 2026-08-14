import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  CALENDAR_VIEWS,
  calendarSpan,
  contactActivity,
  contactDates,
  datesByDay,
  dayKey,
  entriesIn,
  shiftAnchor,
  startOfWeek,
} from '../src/company-contacts/timeline.js';

// "Display the recent updates on a record where his contact is used all over the workspace so
// we can track it... it also has a calendar with the dates where his name is linked and has a
// date field, with four views: by year, month, week or day."

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const page = readFileSync(join(root, 'src', 'company-contacts', 'page.js'), 'utf8');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8');

const doc = () => ({
  workspaces: [{
    id: 'ws-1',
    name: 'Prospecting',
    activity: [
      { id: 'a1', ts: '2026-08-14T10:00:00Z', itemId: 'i1', text: 'Updated Wew', icon: 'ti-pencil', actor: 'Abe' },
      { id: 'a2', ts: '2026-08-14T09:00:00Z', itemId: 'i2', text: 'Added Wew2', icon: 'ti-plus', actor: 'Abe' },
      { id: 'a3', ts: '2026-08-14T08:00:00Z', text: 'Renamed the app', icon: 'ti-edit' },
      { id: 'a4', ts: '2026-08-13T08:00:00Z', itemId: 'other', text: 'Somebody else', icon: 'ti-x' },
    ],
    apps: [{
      id: 'app1',
      name: 'Prospecting',
      fields: [
        { id: 'f-c', type: 'company_contact', label: 'Contacts' },
        { id: 'f-t', type: 'text', label: 'Name' },
        { id: 'f-d', type: 'date', label: 'Site visit' },
        { id: 'f-d2', type: 'date', label: 'Follow up' },
        { id: 'f-made', type: 'created_time', label: 'Created' },
      ],
      items: [
        { id: 'i1', values: { 'f-c': 'c1', 'f-t': 'Wew', 'f-d': '2026-08-20', 'f-d2': '2026-09-02' } },
        { id: 'i2', values: { 'f-c': 'c1', 'f-t': 'Wew2', 'f-d': '2026-08-20' } },
        { id: 'other', values: { 'f-c': 'c9', 'f-t': 'Not theirs', 'f-d': '2026-08-21' } },
      ],
    }],
  }],
});

// ---- the feed ------------------------------------------------------------------------------

test('the feed is what happened to THEIR records, wherever they are', () => {
  const feed = contactActivity(doc(), 'c1');
  assert.equal(feed.length, 2);
  assert.deepEqual(feed.map((entry) => entry.itemId), ['i1', 'i2'], 'newest first');
  assert.equal(feed[0].appName, 'Prospecting');
  assert.equal(feed[0].title, 'Wew', 'named by the record, not by the log line');
});

test('workspace noise and other records stay out', () => {
  const feed = contactActivity(doc(), 'c1');
  assert.ok(!feed.some((entry) => /Renamed the app/.test(entry.text)), 'this is a feed about a person');
  assert.ok(!feed.some((entry) => entry.itemId === 'other'));
  assert.deepEqual(contactActivity(doc(), 'nobody'), []);
  assert.deepEqual(contactActivity(doc(), ''), []);
});

test('the feed is capped, so a busy contact does not become the page', () => {
  const busy = doc();
  busy.workspaces[0].activity = Array.from({ length: 40 }, (_, at) => ({
    id: `x${at}`, ts: `2026-08-${String(28 - (at % 27)).padStart(2, '0')}T10:00:00Z`, itemId: 'i1', text: 'Edited',
  }));
  assert.equal(contactActivity(busy, 'c1').length, 12);
  assert.equal(contactActivity(busy, 'c1', { limit: 3 }).length, 3);
});

// ---- the diary -----------------------------------------------------------------------------

test('every date field on their records is in the calendar', () => {
  const dates = contactDates(doc(), 'c1');
  assert.deepEqual(dates.map((entry) => `${entry.day} ${entry.label}`), [
    '2026-08-20 Site visit',
    '2026-08-20 Site visit',
    '2026-09-02 Follow up',
  ]);
  assert.equal(dates[0].title, 'Wew');
});

test('stamps are not diary entries', () => {
  // A calendar full of "this record was edited" is a calendar nobody opens. Created and Last
  // modified belong in the feed above.
  assert.ok(!contactDates(doc(), 'c1').some((entry) => entry.label === 'Created'));
});

test('dates belonging to another contact are not on this calendar', () => {
  assert.ok(!contactDates(doc(), 'c1').some((entry) => entry.day === '2026-08-21'));
});

test('two things on one day are both kept', () => {
  const byDay = datesByDay(contactDates(doc(), 'c1'));
  assert.equal(byDay.get('2026-08-20').length, 2);
  assert.equal(byDay.get('2026-09-02').length, 1);
});

// ---- the four views ------------------------------------------------------------------------

test('all four views are offered, and each covers what it says', () => {
  assert.deepEqual(CALENDAR_VIEWS, ['year', 'month', 'week', 'day']);
  const at = new Date(2026, 7, 14);
  assert.equal(calendarSpan('year', at).cells.length, 12, 'a year is months, not 365 squares');
  assert.equal(calendarSpan('month', at).cells.length, 42, 'whole weeks, so the grid is rectangular');
  assert.equal(calendarSpan('week', at).cells.length, 7);
  assert.equal(calendarSpan('day', at).cells.length, 1);
  assert.equal(calendarSpan('year', at).title, '2026');
  assert.equal(calendarSpan('month', at).title, 'August 2026');
});

test('a week runs Monday to Sunday', () => {
  assert.equal(dayKey(startOfWeek(new Date(2026, 7, 14))), '2026-08-10');
  assert.equal(dayKey(startOfWeek(new Date(2026, 7, 10))), '2026-08-10', 'a Monday is its own start');
  assert.equal(dayKey(startOfWeek(new Date(2026, 7, 16))), '2026-08-10', 'and Sunday closes it');
});

test('the days either side of a month are marked, not blank', () => {
  const span = calendarSpan('month', new Date(2026, 7, 14));
  assert.ok(span.cells.filter((cell) => cell.outside).length > 0);
  assert.equal(span.cells.filter((cell) => !cell.outside).length, 31, 'August has 31 days');
});

test('a leap February is a February', () => {
  const span = calendarSpan('month', new Date(2028, 1, 10));
  assert.equal(span.cells.filter((cell) => !cell.outside).length, 29);
  assert.equal(calendarSpan('month', new Date(2026, 1, 10)).cells.filter((cell) => !cell.outside).length, 28);
});

test('stepping moves by whatever the view counts in', () => {
  const at = new Date(2026, 7, 14);
  assert.equal(calendarSpan('month', shiftAnchor('month', at, 1)).title, 'September 2026');
  assert.equal(calendarSpan('month', shiftAnchor('month', at, -1)).title, 'July 2026');
  assert.equal(calendarSpan('year', shiftAnchor('year', at, 1)).title, '2027');
  assert.equal(dayKey(shiftAnchor('day', at, 1)), '2026-08-15');
  assert.equal(dayKey(shiftAnchor('week', at, 1)), '2026-08-21');
  // Across a year boundary, which is where naive month arithmetic goes wrong.
  assert.equal(calendarSpan('month', shiftAnchor('month', new Date(2026, 11, 15), 1)).title, 'January 2027');
});

test('a cell knows what falls in it, and a year cell takes the whole month', () => {
  const byDay = datesByDay(contactDates(doc(), 'c1'));
  const month = calendarSpan('month', new Date(2026, 7, 14));
  const twentieth = month.cells.find((cell) => dayKey(cell.date) === '2026-08-20');
  assert.equal(entriesIn(twentieth, byDay).length, 2);
  const year = calendarSpan('year', new Date(2026, 7, 14));
  assert.equal(entriesIn(year.cells[7], byDay).length, 2, 'August');
  assert.equal(entriesIn(year.cells[8], byDay).length, 1, 'September');
  assert.equal(entriesIn(year.cells[0], byDay).length, 0, 'January');
});

test('a day belongs to the reader, not to UTC', () => {
  // A date field holds a day. Reading it in UTC moves it either side of midnight for half the
  // world, which is a calendar showing the wrong square.
  assert.equal(dayKey(new Date(2026, 0, 1, 23, 30)), '2026-01-01');
  assert.equal(dayKey('2026-08-20'), '2026-08-20');
  assert.equal(dayKey('not a date'), '');
});

// ---- on the card ---------------------------------------------------------------------------

test('nameValue is a RENDERER, and both panels pass one', () => {
  // It reads like "the contact's name" and is not: contactUsage hands it to itemTitle, which
  // CALLS it as (app, field, item). Passing contact.name meant a string was called as a
  // function -- and only once a contact was actually used on a record, because with no uses
  // itemTitle is never reached. The contact card threw inside render(), so the page kept
  // whatever was last painted and sat on its loading spinner with no error anywhere.
  const calls = [...page.matchAll(/nameValue:\s*([A-Za-z_$][\w$.]*)/g)].map((m) => m[1]);
  assert.ok(calls.length >= 4, `only found ${calls.length} nameValue arguments`);
  calls.forEach((argument) => {
    assert.equal(argument, 'wbNameValue', `nameValue must be the renderer, got ${argument}`);
  });

  // And it really is called, so the shape matters.
  const model = readFileSync(join(root, 'src', 'company-contacts', 'model.js'), 'utf8');
  assert.match(model, /nameValue \? nameValue\(app, field, item\)/);
});

test('a contact used on a record still builds its feed and diary', () => {
  // The failing case, run: with no uses the title is never rendered and the bug hides.
  const used = doc();
  const feed = contactActivity(used, 'c1', { nameValue: (app, field, item) => String(item?.values?.[field.id] ?? '') });
  assert.ok(feed.length > 0, 'this contact IS used');
  assert.equal(feed[0].title, 'Wew', 'the renderer named the record');
  assert.ok(contactDates(used, 'c1', { nameValue: (app, field, item) => String(item?.values?.[field.id] ?? '') }).length > 0);
});

test('both panels are on the contact card', () => {
  assert.match(page, /function activityPanel\(companyId, doc, contact\)/);
  assert.match(page, /function calendarPanel\(companyId, doc, contact\)/);
  assert.match(page, /\$\{activityPanel\(companyId, doc, contact\)\}/);
  assert.match(page, /\$\{calendarPanel\(companyId, doc, contact\)\}/);
});

test('an entry links to the record it belongs to', () => {
  assert.match(page, /function entryHref\(companyId, entry\)/);
  assert.match(page, /workspace: entry\.workspaceRouteId, app_id: entry\.appId, tab: 'items', item_id: entry\.itemId,/);
  // A builder-only workspace has no route, and a link to nowhere is worse than plain text.
  assert.match(page, /entry\.workspaceRouteId/);
});

test('both panels say so when there is nothing yet', () => {
  assert.match(page, /Nothing has happened on their records yet/);
  assert.match(page, /No dates yet\./);
});

test('every class the two panels use is styled', () => {
  ['cc-feed', 'cc-feed-row', 'cc-feed-ic', 'cc-feed-main', 'cc-cal-bar', 'cc-cal-title',
    'cc-cal-views', 'cc-cal-view', 'cc-cal-days', 'cc-cal-grid', 'cc-cal-cell', 'cc-cal-num',
    'cc-cal-dot', 'cc-cal-item'].forEach((name) => {
    assert.ok(styles.includes(`.${name}`), `.${name} has no rule`);
  });
});
