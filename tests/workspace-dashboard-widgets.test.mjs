import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  DASH_COLUMNS, WIDGET_TYPES, addWidget, dashboardFor, defaultDashboard, metricValue,
  moveWidget, normalizeWidget, optionFields, removeWidget, reorderWidget, resizeWidget, widgetRecords,
  widgetSupported,
} from '../src/workspace/dashboard-widgets.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// Deterministic ids, so an arrangement can be compared rather than merely counted.
const ids = () => { let n = 0; return () => `w${(n += 1)}`; };

const app = {
  id: 'a1',
  name: 'Jobs',
  fields: [
    { id: 'f1', type: 'text', label: 'Job' },
    { id: 'f2', type: 'status', label: 'Stage', config: { options: [{ id: 's1', label: 'Open' }, { id: 's2', label: 'Done' }] } },
    { id: 'f3', type: 'money', label: 'Value' },
    { id: 'f4', type: 'date', label: 'Start' },
  ],
  items: [
    { id: 'i1', values: { f2: 's1', f3: 100 }, createdAt: '2026-08-04', lastActivityAt: '2026-08-04' },
    { id: 'i2', values: { f2: 's1', f3: 250 }, createdAt: '2026-07-01', lastActivityAt: '2026-08-03' },
    { id: 'i3', values: { f2: 's2', f3: 50 }, createdAt: '2026-07-01', lastActivityAt: '2026-06-01' },
  ],
};
const TODAY = '2026-08-04';

// --- shape ---------------------------------------------------------------------------------

test('a widget is normalised into range rather than rejected', () => {
  // A hand-edited or older document holding size 9 should render full width, not disappear.
  assert.equal(normalizeWidget({ type: 'metric', size: 9 }).size, DASH_COLUMNS);
  assert.equal(normalizeWidget({ type: 'metric', size: 0 }).size, 1);
  assert.equal(normalizeWidget({ type: 'metric', size: 'wide' }).size, 1, 'falls back to the type default');
  assert.equal(normalizeWidget({ type: 'nonsense' }).type, 'metric', 'an unknown type still renders something');
  assert.deepEqual(normalizeWidget({}).config, {});
  assert.ok(normalizeWidget({}).id, 'every widget needs an id to be moved or removed');
});

test('never arranged and arranged to be empty are different', () => {
  // dashboard: null means "show the default". An empty array means the user cleared it, and
  // must stay cleared rather than springing back.
  assert.ok(dashboardFor({ ...app, dashboard: null }, ids()).length > 0);
  assert.deepEqual(dashboardFor({ ...app, dashboard: [] }, ids()), []);
  assert.match(main, /dashboard: Array\.isArray\(app\.dashboard\) \? app\.dashboard : null,/);
});

test('the default arrangement is what the fixed dashboard used to show', () => {
  // Turning this on changes nothing until somebody chooses to change it.
  const types = defaultDashboard(app, ids()).map((w) => w.type);
  assert.deepEqual(types, ['metric', 'metric', 'metric', 'metric', 'stages', 'recent']);
});

test('the default leaves out cards the app cannot fill', () => {
  // An app with no money field gets no money tile, rather than one reading $0.
  const bare = { ...app, fields: [{ id: 'f1', type: 'text', label: 'Job' }] };
  const types = defaultDashboard(bare, ids()).map((w) => w.type);
  // No money field, so no total tile reading $0. No status field, so no stage bars. Recent
  // stays: it needs nothing but records.
  assert.deepEqual(types, ['metric', 'metric', 'metric', 'recent']);
  assert.ok(!types.includes('stages'));
});

test('a card that needs a field it has not got is offered as blocked, not hidden', () => {
  assert.equal(widgetSupported(app, 'calendar'), true);
  assert.equal(widgetSupported({ fields: [] }, 'calendar'), false);
  assert.equal(widgetSupported({ fields: [] }, 'stages'), false);
  assert.equal(widgetSupported({ fields: [] }, 'clock'), true, 'a clock needs nothing');
  for (const meta of WIDGET_TYPES.filter((t) => t.needs)) {
    assert.ok(['date', 'option'].includes(meta.needs), `${meta.type} names a kind the catalogue can explain`);
  }
});

// --- arranging -----------------------------------------------------------------------------

test('moving swaps with the neighbour, and the ends are no-ops', () => {
  const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.deepEqual(moveWidget(list, 'b', 'up').map((w) => w.id), ['b', 'a', 'c']);
  assert.deepEqual(moveWidget(list, 'b', 'down').map((w) => w.id), ['a', 'c', 'b']);
  assert.deepEqual(moveWidget(list, 'a', 'up').map((w) => w.id), ['a', 'b', 'c'], 'already first');
  assert.deepEqual(moveWidget(list, 'c', 'down').map((w) => w.id), ['a', 'b', 'c'], 'already last');
  assert.deepEqual(moveWidget(list, 'gone', 'up').map((w) => w.id), ['a', 'b', 'c']);
});

test('moving does not mutate the arrangement it was given', () => {
  // The caller assigns the result; mutating in place would change the app before the save.
  const list = [{ id: 'a' }, { id: 'b' }];
  moveWidget(list, 'a', 'down');
  assert.deepEqual(list.map((w) => w.id), ['a', 'b']);
});

test('resize and remove touch only the widget named', () => {
  const list = [normalizeWidget({ id: 'a', type: 'metric', size: 1 }), normalizeWidget({ id: 'b', type: 'recent', size: 2 })];
  assert.deepEqual(resizeWidget(list, 'a', 3).map((w) => w.size), [3, 2]);
  assert.deepEqual(resizeWidget(list, 'a', 99).map((w) => w.size), [DASH_COLUMNS, 2], 'still clamped');
  assert.deepEqual(removeWidget(list, 'a').map((w) => w.id), ['b']);
});

test('a new card arrives with a field already chosen', () => {
  // Otherwise it lands blank and needs a second trip through the settings to show anything.
  const added = addWidget([], 'stages', app, ids());
  assert.equal(added[0].config.fieldId, 'f2');
  assert.equal(addWidget([], 'calendar', app, ids())[0].config.fieldId, 'f4');
  assert.equal(addWidget([], 'metric', app, ids())[0].config.metric, 'count');
  assert.deepEqual(addWidget([], 'nonsense', app, ids()), [], 'an unknown type adds nothing');
});

// --- the figures ---------------------------------------------------------------------------

test('a metric reports what it says it reports', () => {
  assert.equal(metricValue(app, { metric: 'count' }, TODAY).value, 3);
  assert.equal(metricValue(app, { metric: 'sum', fieldId: 'f3' }, TODAY).value, 400);
  assert.equal(metricValue(app, { metric: 'sum', fieldId: 'f3' }, TODAY).label, 'Value', 'named for the field');
  assert.equal(metricValue(app, { metric: 'added' }, TODAY).value, 1, 'only i1 is inside seven days');
  assert.equal(metricValue(app, { metric: 'touched' }, TODAY).value, 2);
});

test('a metric with no usable date window reports zero rather than guessing', () => {
  assert.equal(metricValue(app, { metric: 'added' }, '').value, 0);
  assert.equal(metricValue(app, { metric: 'added' }, 'nonsense').value, 0);
});

test('an unknown metric falls back to the count', () => {
  assert.equal(metricValue(app, { metric: 'wat' }, TODAY).value, 3);
  assert.equal(metricValue(app, {}, TODAY).value, 3);
});

test('a record list can be narrowed to one stage, which is the point of it', () => {
  const all = widgetRecords(app, {});
  assert.equal(all.total, 3);
  const open = widgetRecords(app, { fieldId: 'f2', value: 's1' });
  assert.deepEqual(open.rows.map((r) => r.id), ['i1', 'i2']);
  assert.equal(open.total, 2);
});

test('a field with no value chosen means every record, not none', () => {
  assert.equal(widgetRecords(app, { fieldId: 'f2', value: '' }).total, 3);
});

test('the list is newest-touched first and capped sanely', () => {
  // A list on a dashboard answers "what is happening", not "what exists".
  assert.deepEqual(widgetRecords(app, {}).rows.map((r) => r.id), ['i1', 'i2', 'i3']);
  assert.equal(widgetRecords(app, { limit: 1 }).rows.length, 1);
  assert.equal(widgetRecords(app, { limit: 0 }).rows.length, 3, 'zero is not a valid cap');
  assert.equal(widgetRecords(app, { limit: 999 }).rows.length, 3);
});

test('every write goes through one save', () => {
  // A half-applied arrangement must not be able to persist.
  assert.match(main, /async function wbDashEdit\(companyId, workspaceId, appId, change\)/);
  assert.match(main, /app\.dashboard = change\(mod\.dashboardFor\(app\), mod\);\n\s*wbSave\(companyId\);/);
  assert.match(main, /if \(!app \|\| !can\('workspaces\.manage', companyId\)\) return;/, 'arranging is a write');
});

test('the clock does not leak a timer across renders', () => {
  // render() rebuilds the DOM wholesale, so a timer holding the old nodes ticks into nothing
  // forever. One interval, cleared on each mount and when the last clock goes away.
  assert.match(main, /if \(state\.wbClockTimer\) clearInterval\(state\.wbClockTimer\);/);
  assert.match(main, /if \(!nodes\.length\) \{ clearInterval\(state\.wbClockTimer\); state\.wbClockTimer = null; return; \}/);
});

test('reset restores the default rather than emptying the board', () => {
  assert.match(main, /mod\.defaultDashboard\(wbFind\(companyId, workspaceId, appId\)\.app\)/);
});

// --- config ---------------------------------------------------------------------------------

test('option fields are the ones a stage or filter card can use', () => {
  assert.deepEqual(optionFields(app).map((f) => f.id), ['f2']);
  assert.deepEqual(optionFields({ fields: [{ id: 'x', type: 'text' }] }), []);
});

test('changing the field clears the value chosen under the old one', () => {
  // The value id belongs to the previous field and would match nothing.
  assert.match(main, /if \(key === 'fieldId'\) delete draft\.value;/);
});

// --- drag to reorder -------------------------------------------------------------------------

test('dragging moves a card to where another sits, it does not swap them', () => {
  // Dragging past three cards should leave those three in order, shifted by one. Swapping
  // scrambles them, which is only invisible when the two happen to be neighbours.
  const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  assert.deepEqual(reorderWidget(list, 'a', 'd').map((w) => w.id), ['b', 'c', 'd', 'a']);
  assert.deepEqual(reorderWidget(list, 'd', 'a').map((w) => w.id), ['d', 'a', 'b', 'c']);
  assert.deepEqual(reorderWidget(list, 'b', 'c').map((w) => w.id), ['a', 'c', 'b', 'd'], 'neighbours read as a swap');
});

test('a drag that lands on itself or on nothing changes nothing', () => {
  const list = [{ id: 'a' }, { id: 'b' }];
  assert.deepEqual(reorderWidget(list, 'a', 'a').map((w) => w.id), ['a', 'b']);
  assert.deepEqual(reorderWidget(list, 'a', 'gone').map((w) => w.id), ['a', 'b']);
  assert.deepEqual(reorderWidget(list, 'gone', 'a').map((w) => w.id), ['a', 'b']);
});

test('reordering does not mutate the arrangement it was given', () => {
  const list = [{ id: 'a' }, { id: 'b' }];
  reorderWidget(list, 'a', 'b');
  assert.deepEqual(list.map((w) => w.id), ['a', 'b']);
});

test('cards only drag while customising', () => {
  const views = readFileSync(new URL('../src/workspace/app-views.js', import.meta.url), 'utf8');
  assert.match(views, /data-wb-dash-id="\$\{h\(widget\.id\)\}" \$\{editing \? 'draggable="true"' : ''\}/);
  assert.match(views, /<span class="wb-w-grip"/, 'a grip, so the gesture is discoverable');
  assert.match(views, /<div class="wb-dash-grid" data-wb-dash-grid>/);
});

test('the arrow buttons survive alongside the drag', () => {
  // HTML5 drag never fires on touch, and the buttons are the keyboard-reachable path.
  const views = readFileSync(new URL('../src/workspace/app-views.js', import.meta.url), 'utf8');
  assert.match(views, /data-wb-dash-move="\$\{h\(widget\.id\)\}:up"/);
  assert.match(views, /data-wb-dash-move="\$\{h\(widget\.id\)\}:down"/);
  assert.match(main, /HTML5 drag-and-drop does not fire on touch/);
});

test('the drag sets transfer data, which Firefox requires to start one at all', () => {
  assert.match(main, /event\.dataTransfer\.setData\('text\/plain', card\.dataset\[idKey\]\)/);
  assert.match(main, /event\.dataTransfer\?\.getData\('text\/plain'\)/, 'and reads it back as the fallback');
});

test('the drag is re-bound each render, because render replaces the nodes', () => {
  assert.match(main, /mountWbDashDrag\(companyId, workspaceId, appId\);/);
  assert.match(main, /const grid = document\.querySelector\(gridSelector\);\n\s*if \(!grid\) return;/);
});

test('one drag mount serves both grids rather than a copy each', () => {
  // The record layout drags identically; only the attributes and the writer differ. A second
  // copy would drift the first time one of them was fixed.
  assert.match(main, /mountWbGridDrag\('\[data-wb-dash-grid\]', 'data-wb-dash-id', 'wbDashId'/);
  assert.match(main, /mountWbGridDrag\('\[data-wb-rec-grid\]', 'data-wb-rec-id', 'wbRecId'/);
  assert.match(main, /function mountWbGridDrag\(gridSelector, idAttr, idKey, commit\)/);
});
