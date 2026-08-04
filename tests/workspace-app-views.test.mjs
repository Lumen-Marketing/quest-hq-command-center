import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { dateFields, recordsByDay } from '../src/workspace/app-views.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const views = readFileSync(new URL('../src/workspace/app-views.js', import.meta.url), 'utf8');

const app = {
  id: 'a1',
  fields: [
    { id: 'f1', type: 'text', label: 'Job' },
    { id: 'f2', type: 'date', label: 'Start date' },
    { id: 'f3', type: 'date', label: 'Due date' },
  ],
  items: [
    { id: 'i1', values: { f2: '2026-08-04' } },
    { id: 'i2', values: { f2: '2026-08-04' } },
    { id: 'i3', values: { f2: '2026-08-09' } },
    { id: 'i4', values: {} },
    { id: 'i5', values: { f2: 'not a date' } },
  ],
};

test('only date fields can drive the calendar', () => {
  assert.deepEqual(dateFields(app).map((f) => f.label), ['Start date', 'Due date']);
  assert.deepEqual(dateFields({ fields: [{ type: 'text' }] }), []);
  assert.deepEqual(dateFields(null), []);
});

test('records group onto the day they fall on', () => {
  const { byDay } = recordsByDay(app, app.fields[1]);
  assert.deepEqual(byDay.get('2026-08-04').map((i) => i.id), ['i1', 'i2']);
  assert.deepEqual(byDay.get('2026-08-09').map((i) => i.id), ['i3']);
});

test('undated records are counted, not silently dropped', () => {
  // A month that looks empty has to be distinguishable from a month nobody has dated.
  const { undated } = recordsByDay(app, app.fields[1]);
  assert.equal(undated, 2, 'the blank one and the unparseable one');
});

test('a value that is not a date cannot land on a day', () => {
  const { byDay } = recordsByDay(app, app.fields[1]);
  assert.ok(![...byDay.keys()].some((k) => !/^\d{4}-\d{2}-\d{2}$/.test(k)));
});

test('a timestamp is read as the day it starts, not rejected', () => {
  const withTime = { items: [{ id: 'x', values: { f2: '2026-08-04T14:30:00Z' } }] };
  const { byDay, undated } = recordsByDay(withTime, { id: 'f2' });
  assert.equal(undated, 0);
  assert.deepEqual(byDay.get('2026-08-04').map((i) => i.id), ['x']);
});

// --- what the views are built from --------------------------------------------------------

test('both views read the app own fields rather than new configuration', () => {
  // The status field is the pipeline, a money field is the total, a date field is the
  // calendar. A second place to configure the same thing is a second place to drift.
  assert.match(views, /import \{ boardColumns, pipelineField, stagesOf, summaryField \} from '\.\/pipeline-core\.js';/);
  assert.match(views, /const field = pipelineField\(app\);/);
  assert.match(views, /const sum = summaryField\(app\);/);
});

test('an app missing the field a view needs is told which one to add', () => {
  assert.match(views, /Add a Status field and its options become the stages here/);
  assert.match(views, /Add a Date field to this app and its records appear on a calendar\./);
});

test('the calendar reuses the date maths rather than repeating it', () => {
  assert.match(views, /from '\.\.\/jobs\/job-calendar\.js'/);
  assert.ok(!/function monthGrid/.test(views), 'a second copy would drift on week-start rules');
});

// --- wiring -------------------------------------------------------------------------------

test('Dashboard and Calendar come before Items', () => {
  assert.match(main, /const tabs = \['dashboard', 'calendar', 'items', 'fields', 'reports', 'automations', 'settings'\];/);
  assert.match(main, /dashboard: 'Dashboard', calendar: 'Calendar',/);
});

test('both bodies are fetched on demand, and a failed fetch is retryable', () => {
  assert.ok(!/^import .*workspace\/app-views/m.test(main), 'a static import would defeat the split');
  assert.match(main, /import\('\.\/workspace\/app-views\.js'\)/);
  assert.match(main, /appViewsPending = null;/);
});

test('the month and the chosen date field live in the url', () => {
  // So a refresh keeps them, and a link to "September, by Due date" is shareable.
  assert.match(main, /renderAppCalendar\(companyId, app, route\.params\.get\('on'\) \|\| '', route\.params\.get\('field'\) \|\| ''\)/);
  assert.match(main, /bind\('\[data-wb-cal-field\]'/);
});
