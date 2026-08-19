import assert from 'node:assert/strict';
import test from 'node:test';

import { createAppViews } from '../src/workspace/app-views.js';
import { contactDates, datesByDay } from '../src/company-contacts/timeline.js';

// "Make the call reminder added on Quick Create also appear on the app calendar and on the
// contact card calendar."
//
// Two calendars, two different readings of the same rows. The app's is by app; the contact's is
// by which records name that person -- the event table has no contact on it, and does not need
// one, because the document already knows.

const ESC = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

// Local noon on 1 Sep 2026, so the day is the same wherever this runs.
const AT = new Date(2026, 8, 1, 14, 30).toISOString();

const event = (over = {}) => ({
  id: 'e1',
  workspace_id: '42959c90-a8e6-4ec4-af78-82036849dba7',
  app_id: 'app-1',
  item_id: 'item-1',
  kind: 'call',
  title: 'Follow up',
  to_number: '555 111 2222',
  scheduled_for: AT,
  status: 'scheduled',
  ...over,
});

// ---- the app's calendar -------------------------------------------------------------------------

function appBench(events) {
  const app = {
    id: 'app-1',
    name: 'Prospects',
    color: '#2563eb',
    fields: [{ id: 'f-name', label: 'Name', type: 'text', config: {} }],
    items: [{ id: 'item-1', values: { 'f-name': '58th Pl' } }],
  };
  const views = createAppViews({
    h,
    can: () => true,
    money: (v) => `$${v}`,
    emptyState: (msg) => `<p class="empty">${msg}</p>`,
    appHref: (p) => p,
    companyPath: (section, params) => `/${section}?${new URLSearchParams(params)}`,
    wbItemTitle: (a, item) => item.values['f-name'] || '',
    wbTimeAgo: () => 'just now',
    wbModalShell: (body) => body,
    // Read straight off state: the calendar draws during a render and cannot wait for a fetch,
    // and the reminder heartbeat is what fills this.
    state: { wbEvents: { co1: events } },
  });
  return { app, views };
}

test('a scheduled call is drawn on the day it falls on', () => {
  const bench = appBench([event()]);
  const html = bench.views.renderAppCalendar('co1', bench.app, '2026-09-01', '', 'day');
  assert.match(html, /wb-cal-ev/, 'the call is not on the calendar');
  assert.match(html, /Follow up/);
  assert.match(html, /14:30/, 'the time is the part worth reading first');
  assert.match(html, /ti-phone/);
  // It opens the record it was scheduled on, which is where it can be acted on.
  assert.match(html, /item_id=item-1/);
});

test('it is on the month grid too, not only the day view', () => {
  const bench = appBench([event()]);
  const html = bench.views.renderAppCalendar('co1', bench.app, '2026-09-01', '', 'month');
  assert.match(html, /wb-cal-ev/);
  assert.match(html, /Follow up/);
});

test('a message is marked as one', () => {
  const bench = appBench([event({ kind: 'sms', title: 'Arrival' })]);
  const html = bench.views.renderAppCalendar('co1', bench.app, '2026-09-01', '', 'day');
  assert.match(html, /wb-cal-ev-sms/);
  assert.match(html, /ti-message-2/);
});

test('reminders from another app stay on that app calendar', () => {
  const bench = appBench([event({ app_id: 'app-2', title: 'Not mine' })]);
  const html = bench.views.renderAppCalendar('co1', bench.app, '2026-09-01', '', 'day');
  assert.ok(!html.includes('Not mine'));
});

test('a day with only a reminder on it does not say it is empty', () => {
  // The empty state counted records and memos. A day whose only entry was a scheduled call read
  // as "nothing on this day" while plainly showing something.
  const bench = appBench([event()]);
  const html = bench.views.renderAppCalendar('co1', bench.app, '2026-09-01', '', 'day');
  assert.ok(!/Nothing on this day/.test(html));
  // ...and a day with nothing at all still does.
  const empty = bench.views.renderAppCalendar('co1', bench.app, '2026-09-05', '', 'day');
  assert.match(empty, /Nothing on this day/);
});

test('the calendar draws with no events at all', () => {
  // companyEvents answers with nothing until the rows have been fetched, which is most renders.
  const bench = appBench([]);
  assert.match(bench.views.renderAppCalendar('co1', bench.app, '2026-09-01', '', 'month'), /wb-cal-grid/);
});

// ---- the contact card's calendar ------------------------------------------------------------------

const doc = () => ({
  workspaces: [{
    id: 'ws-1',
    name: 'Prospecting',
    activity: [],
    apps: [{
      id: 'app-1',
      name: 'Prospects',
      fields: [
        { id: 'f-name', label: 'Name', type: 'text', config: {} },
        { id: 'f-c', label: 'Contact', type: 'company_contact', config: {} },
        { id: 'f-when', label: 'Inspection', type: 'date', config: {} },
      ],
      items: [
        { id: 'item-1', values: { 'f-name': '58th Pl', 'f-c': 'c1', 'f-when': '2026-08-20' } },
        { id: 'item-9', values: { 'f-name': 'Somebody else', 'f-c': 'c2', 'f-when': '2026-08-20' } },
      ],
    }],
  }],
});

test('a call scheduled on a contact-s record lands on that contact-s calendar', () => {
  const dates = contactDates(doc(), 'c1', { events: [event()] });
  const day = datesByDay(dates).get('2026-09-01') || [];
  assert.equal(day.length, 1, 'the call is not on the calendar');
  assert.equal(day[0].label, 'Call');
  assert.match(day[0].title, /Follow up/);
  assert.match(day[0].title, /14:30/);
  assert.equal(day[0].kind, 'call', 'the card keys its icon off this');
  // It carries the route, so pressing it opens the record.
  assert.equal(day[0].itemId, 'item-1');
  assert.equal(day[0].appId, 'app-1');
  assert.equal(day[0].appName, 'Prospects');
  assert.equal(day[0].workspaceRouteId, '1');
});

test('a call on somebody else-s record is not on this contact-s calendar', () => {
  // The event table has no contact on it. What makes it theirs is the record it sits on naming
  // them, which is the same rule the rest of the card already works by.
  const dates = contactDates(doc(), 'c1', { events: [event({ item_id: 'item-9' })] });
  assert.deepEqual(dates.filter((d) => d.day === '2026-09-01'), []);
});

test('the dated records are still there, alongside', () => {
  const dates = contactDates(doc(), 'c1', { events: [event()] });
  const byDay = datesByDay(dates);
  assert.equal((byDay.get('2026-08-20') || []).length, 1, 'the Inspection date went missing');
  assert.equal((byDay.get('2026-08-20') || [])[0].kind, undefined, 'a date field is not a call');
  assert.equal((byDay.get('2026-09-01') || []).length, 1);
});

test('no events passed is the calendar exactly as it was', () => {
  assert.deepEqual(contactDates(doc(), 'c1'), contactDates(doc(), 'c1', { events: [] }));
});

test('a reminder with an unreadable date is left off rather than filed wrongly', () => {
  assert.deepEqual(contactDates(doc(), 'c1', { events: [event({ scheduled_for: 'soon' })] })
    .filter((d) => d.label === 'Call'), []);
});
