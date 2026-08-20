import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { calendarSources, datedSources, recordsByDates } from '../src/workspace/app-views.js';

// "on the workspace app calendar only shows all the event or date fields with date that is in
// the app record."
//
// calendarSources answers "what COULD carry a date", which is the right question for the setup
// banner and the wrong one for the picker. An app with six date fields and dates in one of them
// offered six ways to look at the calendar, five of which draw an empty month -- and choosing one
// and finding nothing there reads as a broken calendar rather than as an empty field.

const views = readFileSync(new URL('../src/workspace/app-views.js', import.meta.url), 'utf8');

const d = (id, label) => ({ id, label, type: 'date', config: {} });

const app = () => ({
  id: 'app-1',
  name: 'Jobs',
  fields: [
    { id: 'f-name', label: 'Name', type: 'text', config: {} },
    d('f-start', 'Start date'),
    d('f-install', 'Install date'),
    d('f-never', 'Final inspection'),
  ],
  collections: [
    { id: 'c-daily', name: 'Dailies', fields: [d('c-on', 'On'), d('c-idle', 'Signed off')] },
  ],
  items: [
    {
      id: 'i1',
      values: { 'f-name': '58th Pl', 'f-start': '2026-09-01', 'f-never': '' },
      children: [{ id: 'ch1', collection: 'c-daily', values: { 'c-on': '2026-09-02' } }],
    },
    { id: 'i2', values: { 'f-name': 'Oak St', 'f-install': '2026-09-04' }, children: [] },
  ],
});

test('every date field is still a possible source', () => {
  // The structural question, unchanged: this is what decides whether the app is set up for a
  // calendar at all.
  assert.deepEqual(calendarSources(app()).map((s) => s.label), [
    'Start date', 'Install date', 'Final inspection', 'Dailies · On', 'Dailies · Signed off',
  ]);
});

test('only the fields a record has actually dated are offered', () => {
  assert.deepEqual(datedSources(app()).map((s) => s.label), [
    'Start date', 'Install date', 'Dailies · On',
  ]);
});

test('a sub-item list counts through its children, not the record', () => {
  // `Dailies · On` is filled in on a CHILD; the record itself has no such value. Reading the
  // record's own values would drop every sub-item source.
  const one = datedSources(app()).find((s) => s.label === 'Dailies · On');
  assert.ok(one, 'the dated sub-item field is offered');
  assert.ok(!datedSources(app()).some((s) => s.label === 'Dailies · Signed off'), 'the empty one is not');
});

test('an empty string is not a date, and neither is a half one', () => {
  const bare = {
    fields: [d('a', 'A'), d('b', 'B'), d('c', 'C')],
    items: [{ id: 'i', values: { a: '', b: '2026-09', c: '2026-09-01T09:00' } }],
  };
  // `c` counts: the calendar slices the first ten characters, so a stored timestamp is a date.
  assert.deepEqual(datedSources(bare).map((s) => s.label), ['C']);
});

test('nothing is hidden by this — a field with no dates plots nothing either way', () => {
  // The filter is about what is OFFERED. Proof that it changes no cell: plotting every possible
  // source and plotting only the dated ones puts the same records on the same days.
  const a = app();
  const all = recordsByDates(a, calendarSources(a));
  const dated = recordsByDates(a, datedSources(a));
  assert.deepEqual([...dated.byDay.keys()].sort(), [...all.byDay.keys()].sort());
  assert.equal(dated.undated, all.undated);
});

test('the two empty calendars say different things', () => {
  // "No Date field at all" is a setup problem with an Add field button. "Date fields, none filled
  // in" is not -- telling somebody to add a seventh date field would be wrong twice over.
  assert.match(views, /const possible = calendarSources\(app\);/);
  assert.match(views, /const candidates = datedSources\(app, possible\);/);
  assert.match(views, /Nothing here has a <b>Date<\/b> field yet/);
  assert.match(views, /No record has a date in/);
  assert.match(views, /possible\.length && !candidates\.length/);
});
