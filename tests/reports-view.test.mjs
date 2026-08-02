import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { barsHTML, donutSVG, groupKey, keyMeta, renderReports } from '../src/workspace/reports-view.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const statusField = {
  id: 'f-status', label: 'Stage', type: 'status',
  config: { options: [{ id: 'new', label: 'New', color: '#f00' }, { id: 'done', label: 'Done', color: '#0f0' }] },
};
const moneyField = { id: 'f-amt', label: 'Amount', type: 'money', config: { currency: '$' } };
const app = {
  fields: [statusField, moneyField],
  items: [
    { id: '1', createdAt: '2026-01-01', values: { 'f-status': 'new', 'f-amt': 100 } },
    { id: '2', createdAt: '2026-01-02', values: { 'f-status': 'done', 'f-amt': 250 } },
    { id: '3', createdAt: '2026-01-02', values: { 'f-status': 'done', 'f-amt': 0 } },
  ],
};

// --- donut geometry ---------------------------------------------------------------

test('segments consume the whole circumference, in order', () => {
  const svg = donutSVG([{ label: 'a', color: '#f00', value: 3 }, { label: 'b', color: '#0f0', value: 1 }], 176);
  const dashes = [...svg.matchAll(/stroke-dasharray="([\d.]+) ([\d.]+)"/g)].map((m) => Number(m[1]));
  const C = 2 * Math.PI * (176 / 2 - 16);
  assert.equal(dashes.length, 2);
  assert.ok(Math.abs(dashes[0] - C * 0.75) < 0.01, 'a 3-of-4 share should cover three quarters');
  assert.ok(Math.abs(dashes[0] + dashes[1] - C) < 0.01, 'the segments must close the ring exactly');
  // The second segment starts where the first ended, or they would overlap at 12 o'clock.
  const offsets = [...svg.matchAll(/stroke-dashoffset="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
  assert.ok(Math.abs(offsets[1] + dashes[0]) < 0.01);
});

test('an empty category paints nothing rather than a stray tick', () => {
  const svg = donutSVG([{ label: 'a', color: '#f00', value: 5 }, { label: 'none', color: '#00f', value: 0 }]);
  assert.equal([...svg.matchAll(/stroke-dasharray/g)].length, 1);
  assert.ok(!svg.includes('#00f'));
});

test('a chart of nothing renders an empty ring instead of dividing by zero', () => {
  const svg = donutSVG([]);
  assert.ok(!svg.includes('NaN'), svg.slice(0, 200));
  assert.match(svg, />0</, 'the total should read zero');
});

test('the centre total is the sum, not the segment count', () => {
  assert.match(donutSVG([{ label: 'a', color: '#f00', value: 7 }, { label: 'b', color: '#0f0', value: 5 }]), />12</);
});

// --- bars -------------------------------------------------------------------------

test('bars scale to the largest value, and a non-zero bar stays visible', () => {
  const html = barsHTML([
    { label: 'big', color: '#f00', value: 200 },
    { label: 'tiny', color: '#0f0', value: 1 },
    { label: 'zero', color: '#00f', value: 0 },
  ]);
  const widths = [...html.matchAll(/width:([\d.]+)%/g)].map((m) => Number(m[1]));
  assert.equal(widths[0], 100);
  assert.ok(widths[1] >= 4, 'a 0.5% bar would be invisible; it is floored at 4%');
  assert.equal(widths[2], 0, 'but a genuine zero must not be floored, or it would read as data');
});

test('bar labels are escaped, since they come from user-typed options', () => {
  const html = barsHTML([{ label: '<img src=x onerror=alert(1)>', color: '#f00', value: 1 }]);
  assert.ok(!html.includes('<img'), html);
  assert.match(html, /&lt;img/);
});

// --- grouping ---------------------------------------------------------------------

test('blank, missing and unset all group together as one bucket', () => {
  const f = { id: 'x', type: 'category', config: {} };
  assert.equal(groupKey({ values: { x: '' } }, f), '__none');
  assert.equal(groupKey({ values: { x: null } }, f), '__none');
  assert.equal(groupKey({ values: {} }, f), '__none');
  assert.equal(keyMeta(f, '__none').label, '(empty)');
});

test('a multi-select groups by its first choice', () => {
  assert.equal(groupKey({ values: { x: ['b', 'c'] } }, { id: 'x', type: 'category', config: {} }), 'b');
});

test('a zero value is data, not emptiness', () => {
  // Grouping 0 as "(empty)" would quietly delete a whole bucket from every chart.
  assert.equal(groupKey({ values: { x: 0 } }, { id: 'x', type: 'category', config: {} }), 0);
});

test('a deleted option or unknown person degrades to the raw key, not a crash', () => {
  assert.equal(keyMeta(statusField, 'gone').label, 'gone');
  assert.equal(keyMeta({ type: 'user', config: {} }, 'u9', () => null).label, 'u9');
  assert.equal(keyMeta({ type: 'user', config: {} }, 'u9').label, 'u9', 'with no resolver at all');
});

test('a person supplies the label and colour for a user field', () => {
  const meta = keyMeta({ type: 'user', config: {} }, 'u1', (id) => ({ id, name: 'Manny', color: '#123456' }));
  assert.deepEqual(meta, { label: 'Manny', color: '#123456' });
});

// --- the tab ----------------------------------------------------------------------

test('money is summed per field and grouped, not counted', () => {
  const html = renderReports(app, { memberById: () => null, canManage: true });
  assert.match(html, /\$350/, 'the KPI should total every item');
  assert.match(html, /\$250/, 'and the Done bar should total only its group');
});

test('with no money field the bars fall back to counting items', () => {
  const html = renderReports({ fields: [statusField], items: app.items }, {});
  assert.match(html, /Count by Stage/);
});

test('the empty state only offers a way out to someone who can take it', () => {
  const empty = { fields: [], items: [] };
  assert.match(renderReports(empty, { canManage: true }), /data-tab="fields"/);
  assert.ok(!/data-tab=/.test(renderReports(empty, { canManage: false })));
  // Fields but no items points at items, not back at fields.
  assert.match(renderReports({ fields: [statusField], items: [] }, { canManage: true }), /data-tab="items"/);
});

test('the sparkline shows the last ten days and scales to its own peak', () => {
  const items = Array.from({ length: 14 }, (_, i) => ({ id: String(i), createdAt: `2026-01-${String(i + 1).padStart(2, '0')}`, values: {} }));
  const html = renderReports({ fields: [statusField], items }, {});
  assert.equal([...html.matchAll(/class="wb-sb"/g)].length, 10);
  assert.match(html, /height:100%/, 'the busiest day should reach full height');
});

// --- laziness ---------------------------------------------------------------------

test('the charts are fetched on use, not bundled into the entry chunk', () => {
  // A static import would land this in main.js's chunk and the deferral would be a no-op.
  assert.ok(!/^import .*reports-view\.js/m.test(main), 'must not be statically imported');
  assert.match(main, /import\('\.\/workspace\/reports-view\.js'\)/);
});

test('a failed fetch can be retried rather than cached forever', () => {
  const fn = main.slice(main.indexOf('function wbLoadReports()'));
  assert.match(fn.slice(0, fn.indexOf('\n}\n')), /wbReportsPending = null;/);
});

test('printing never renders the loading placeholder', () => {
  // wbPrintReports now lives in the lazily-fetched data-io chunk; main.js keeps a thin
  // wrapper. The property that matters is unchanged: the click path is synchronous once
  // the module is loaded, which keeps window.open inside the click's own task.
  const io = readFileSync(new URL('../src/workspace/data-io.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  const at = io.indexOf('function wbPrintReports(');
  assert.notEqual(at, -1, 'wbPrintReports should live in the data-io chunk');
  const body = io.slice(at, io.indexOf('\n  }\n', at));
  assert.ok(!/wbViewReports/.test(body), 'calling the view could print a spinner');
  assert.match(body, /if \(wbReportsModule\) \{ print\(wbReportsModule\); return; \}/);
  assert.ok(!/await /.test(body), 'an await would risk the pop-up blocker');

  // And main.js only awaits when the prefetch has not landed yet.
  const wrapper = main.slice(main.indexOf('function wbDataIO('));
  assert.match(wrapper.slice(0, wrapper.indexOf('\n}\n')), /if \(wbDataIOModule\) return wbDataIOModule\[name\]\(\.\.\.args\);/);
  assert.match(main, /wbLoadDataIO\(\)\.catch\(\(\) => null\);/, 'an app view should prefetch it');
});
