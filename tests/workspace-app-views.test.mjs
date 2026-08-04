import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createAppViews, dateFields, recordsByDay } from '../src/workspace/app-views.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const views = readFileSync(new URL('../src/workspace/app-views.js', import.meta.url), 'utf8');

const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const build = () => createAppViews({
  h: esc,
  can: () => true,
  money: (n) => `${Number(n || 0).toLocaleString('en-US')}`,
  emptyState: (m) => `<div class="empty">${esc(m)}</div>`,
  appHref: (path) => `#${path}`,
  companyPath: (section, params = {}) => `/c/x/${section}?${new URLSearchParams(params)}`,
  wbItemTitle: (a, item) => item.values?.f1 || '',
  wbTimeAgo: () => '2h ago',
});

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

test('the dashboard renders an arrangement rather than a fixed layout', () => {
  // Which cards, in what order, at what width now comes from the app. The widget model owns
  // the shapes and the arithmetic; this file only draws them.
  assert.match(views, /from '\.\/dashboard-widgets\.js'/);
  assert.match(views, /const widgets = dashboardFor\(app\);/);
  assert.match(views, /style="--w-span:\$\{widget\.size\}"/);
});

test('an app missing the field a view needs is told which one to add', () => {
  assert.match(views, /Add a Status or Category field, and its options become the bars here./);
  assert.match(views, /This app has no <b>Date<\/b> field yet/);
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
  assert.match(main, /renderAppCalendar\(companyId, app, route\.params\.get\('on'\) \|\| '', route\.params\.get\('field'\) \|\| '', route\.params\.get\('view'\) \|\| ''\)/);
  assert.match(main, /bind\('\[data-wb-cal-field\]'/);
});

// --- month / week / day -------------------------------------------------------------------

test('month is the default view, and all three are offered', () => {
  // Month is what you can orient yourself in without scrolling.
  assert.match(views, /export const CAL_VIEWS = \['month', 'week', 'day'\];/);
  assert.match(views, /const view = CAL_VIEWS\.includes\(viewMode\) \? viewMode : 'month';/);
});

test('next and previous step by whatever the view shows', () => {
  // A "next" that jumps a month while you are looking at a week loses your place.
  const step = views.match(/const step = \(delta\) => \{[\s\S]*?\n {4}\};/)?.[0] || '';
  assert.match(step, /if \(view === 'month'\) next\.setMonth\(next\.getMonth\(\) \+ delta\);/);
  assert.match(step, /view === 'week' \? 7 : 1/);
});

test('week shows every record on a day, month caps and links to the day', () => {
  assert.match(views, /\$\{days\.map\(\(day\) => dayCell\(day\)\)\.join\(''\)\}/, 'week passes no cap');
  assert.match(views, /dayCell\(day, \{ dim: day\.getMonth\(\) !== anchor\.getMonth\(\), cap: 3 \}\)/);
  // The overflow is a way through to the day, not a dead label.
  assert.match(views, /href="\$\{link\(\{ view: 'day', on: key \}\)\}" data-router>\+\$\{items\.length - cap\} more/);
});

test('an empty day says so instead of rendering a blank panel', () => {
  assert.match(views, /Nothing is set to \$\{h\(field\.label\.toLowerCase\(\)\)\} on this day\./);
});

test('the view rides in the url alongside the month and the field', () => {
  // So a refresh keeps it and "week of Aug 3, by Due date" is a shareable link.
  assert.match(main, /route\.params\.get\('view'\) \|\| ''\)/);
  assert.match(main, /\.\.\.\(params\?\.get\('view'\) \? \{ view: params\.get\('view'\) \} : \{\}\)/, 'the field picker must keep the view');
  assert.match(views, /app_id: app\.id, tab: 'calendar', \.\.\.\(field \? \{ field: field\.id \} : \{\}\), \.\.\.params,/);
});

test('the week label does not repeat the month when it does not change', () => {
  // "Aug 3 – 9, 2026" within one month; "Aug 31 – Sep 6, 2026" across two; both years shown
  // only when the week straddles New Year.
  assert.match(views, /start\.getMonth\(\) === end\.getMonth\(\)/);
  assert.match(views, /start\.getFullYear\(\) !== end\.getFullYear\(\)/);
  assert.match(views, /\$\{md\(start\)\} – \$\{end\.getDate\(\)\}, \$\{end\.getFullYear\(\)\}/);
});

test('the week label is built by parts, not by a partial option set', () => {
  // toLocaleDateString with { day, year } and no month produced "2026 (day: 9)" — dropping
  // the month leaves the formatter to invent a shape for what is left.
  assert.match(views, /const md = \(d\) => d\.toLocaleDateString\(undefined, \{ month: 'short', day: 'numeric' \}\);/);
  assert.ok(!/\{ day: 'numeric', year: 'numeric' \}/.test(views));
});

test('a calendar day is the viewer own day, not a UTC one', () => {
  // toISOString converts to UTC first, so from late afternoon in Arizona it returns
  // tomorrow — putting the "today" highlight on the wrong square and opening the day view
  // on the wrong day. The stored dates are plain calendar days with no timezone.
  const cal = readFileSync(new URL('../src/jobs/job-calendar.js', import.meta.url), 'utf8');
  assert.match(cal, /export const iso = \(date\) => \{/);
  assert.match(cal, /d\.getFullYear\(\)\}-\$\{String\(d\.getMonth\(\) \+ 1\)/);
  assert.ok(!/toISOString\(\)\.slice\(0, 10\)/.test(cal), 'no UTC reading may remain');
});

test('the calendar draws even before the app has a date field', () => {
  // Replacing it with an empty state hid the whole feature behind a setup step, so you could
  // not see what you were being asked to set up.
  assert.match(views, /const field = candidates\.find\(\(f\) => f\.id === fieldId\) \|\| candidates\[0\] \|\| null;/);
  assert.ok(!/if \(!candidates\.length\) \{\s*return/.test(views), 'no early return may remain');
  assert.match(views, /\$\{field \? '' : `<p class="wb-cal-setup">/, 'the notice sits above the grid');
});

test('an app with no date field renders every view instead of throwing', () => {
  // Actually running it beats grepping for guarded field reads: the whole risk of dropping
  // the early return is a `field.label` somewhere that nobody thought about.
  const bare = { id: 'a1', name: 'Jobs', color: '#ED4E0D', fields: [{ id: 'f1', type: 'text', label: 'Job' }], items: [{ id: 'i1', values: { f1: 'Pima St' } }] };
  for (const view of ['month', 'week', 'day', '', 'nonsense']) {
    const html = build().renderAppCalendar('c1', bare, '', '', view);
    assert.ok(html.includes('wb-cal-setup'), `${view || '(default)'}: the notice must show`);
    assert.ok(!/undefined|NaN|\[object Object\]/.test(html), `${view || '(default)'}: ${html.match(/.{0,50}(undefined|NaN).{0,50}/)?.[0]}`);
    assert.ok(!html.includes('${'), 'a stray placeholder means a template literal broke');
  }
  // Month and week still draw their grid, so you can see what you are setting up.
  assert.ok(build().renderAppCalendar('c1', bare, '', '', 'month').includes('wb-cal-grid'));
  assert.ok(build().renderAppCalendar('c1', bare, '', '', 'week').includes('wb-cal-week'));
});

test('with no date field the url carries none, and no "By ..." label is invented', () => {
  const bare = { id: 'a1', name: 'Jobs', color: '#ED4E0D', fields: [], items: [] };
  const html = build().renderAppCalendar('c1', bare, '', '', 'month');
  assert.ok(!/field=/.test(html), 'nothing to point at');
  assert.ok(!html.includes('wb-cal-by'), 'no field to name');
});

test('a date field still drives the calendar once it exists', () => {
  const html = build().renderAppCalendar('c1', { ...app, id: 'a1', name: 'Jobs', color: '#ED4E0D' }, '2026-08-04', 'f2', 'day');
  assert.ok(!html.includes('wb-cal-setup'), 'the setup notice must be gone');
  assert.ok(html.includes('field=f2'));
});

test('the url carries no field when there is none to carry', () => {
  assert.match(views, /\.\.\.\(field \? \{ field: field\.id \} : \{\}\)/);
});
