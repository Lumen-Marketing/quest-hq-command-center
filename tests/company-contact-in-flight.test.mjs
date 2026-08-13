import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  contactUsage, itemDates, itemDuration, itemFacts, itemStage, sortNewestFirst,
} from '../src/company-contacts/model.js';

// "Instead of Check and Tile Roofing, I want to display here their current status/stage on the
// workspace, and also if duration field is in the workspace app, display it too, if start date
// and edited is also exist display it too, and a link to open it."
//
// The row is a summary of work owned somewhere else, so every part is optional: an app with no
// status field contributes no stage rather than rendering an empty slot.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const page = readFileSync(join(root, 'src', 'company-contacts', 'page.js'), 'utf8');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');

const fn = (name, source = page) => {
  const at = source.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  const start = source.lastIndexOf('\n', at) + 1;
  const close = source === main ? '\n}' : '\n  }';
  return source.slice(start, source.indexOf(close, at) + close.length);
};

const STAGE_FIELD = {
  id: 'st', type: 'status', label: 'Stage',
  config: { options: [{ id: 'o1', label: 'In production', color: '#168653' }, { id: 'o2', label: 'On hold', color: '#d18a05' }] },
};
const app = {
  id: 'app1',
  name: 'Jobs',
  fields: [
    { id: 'contact', type: 'company_contact', label: 'Client', config: {} },
    { id: 'title', type: 'text', label: 'Job', config: {} },
    STAGE_FIELD,
    { id: 'dur', type: 'duration', label: 'On site', config: {} },
    { id: 'start', type: 'date', label: 'Start', config: {} },
    { id: 'end', type: 'date', label: 'End', config: {} },
    { id: 'extra', type: 'date', label: 'Inspected', config: {} },
  ],
  items: [{
    id: 'i1',
    updatedAt: '2026-08-13T10:00:00.000Z',
    createdAt: '2026-08-01T10:00:00.000Z',
    values: {
      contact: 'cc-1', title: 'Tile Roofing', st: 'o1', dur: 480, start: '2026-08-20', end: '2026-08-22', extra: '2026-08-25',
    },
  }],
};
const doc = { workspaces: [{ id: 'ws-abc-123', name: 'Production', apps: [app] }] };

test('the row reads the stage the app gave the record', () => {
  const stage = itemStage(app, app.items[0]);
  assert.deepEqual(stage, { label: 'In production', color: '#168653' });
  // A category stands in when nobody modelled a status field.
  const catApp = { fields: [{ id: 'c', type: 'category', label: 'Type', config: { options: [{ id: 'x', label: 'Re-roof', color: '#2563eb' }] } }] };
  assert.equal(itemStage(catApp, { values: { c: 'x' } })?.label, 'Re-roof');
  // And an app with neither says nothing rather than rendering a blank chip.
  assert.equal(itemStage({ fields: [{ id: 't', type: 'text' }] }, { values: { t: 'x' } }), null);
});

test('duration is minutes, and absent when the app has no duration field', () => {
  assert.equal(itemDuration(app, app.items[0]), 480);
  assert.equal(itemDuration({ fields: [] }, { values: {} }), null);
  // Zero is a real answer and must not be mistaken for "no duration field".
  assert.equal(itemDuration(app, { values: { dur: 0 } }), 0);
  assert.equal(itemDuration(app, { values: {} }), null, 'an empty value is not a duration');
});

test('typed dates are capped at two, and the app decides which two', () => {
  const dates = itemDates(app, app.items[0]);
  assert.deepEqual(dates, [
    { label: 'Start', value: '2026-08-20', relative: false },
    { label: 'End', value: '2026-08-22', relative: false },
  ]);
  // A row is a summary; the third typed date belongs to the record, not the line.
  assert.ok(!dates.some((d) => d.label === 'Inspected'));
  assert.deepEqual(itemDates(app, { values: { end: '2026-09-01' } }), [{ label: 'End', value: '2026-09-01', relative: false }]);
});

test('the cap can never push Created or Last modified off the row', () => {
  // They are two facts the app asked for by name. Sharing one limit with typed dates meant a
  // third Start/End/Inspected could evict the very field that was requested.
  const busy = {
    fields: [
      { id: 'd1', type: 'date', label: 'Start', config: {} },
      { id: 'd2', type: 'date', label: 'End', config: {} },
      { id: 'd3', type: 'date', label: 'Inspected', config: {} },
      { id: 'made', type: 'created_time', label: 'Created', config: {} },
      { id: 'touched', type: 'updated_time', label: 'Last modified', config: {} },
    ],
  };
  const item = {
    id: 'i', createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-13T10:00:00.000Z',
    values: { d1: '2026-08-20', d2: '2026-08-22', d3: '2026-08-25' },
  };
  assert.deepEqual(itemDates(busy, item).map((d) => d.label), ['Start', 'End', 'Created', 'Last modified']);
});

test('a Created time or Last modified field is shown too, from the builder stamps', () => {
  // "If the start date and the latest updated date fields are available on the workspace app
  // display it here also." They store nothing — they report the stamp on the record — which is
  // why they show even for a record nobody has typed into.
  const stamped = {
    fields: [
      { id: 'start', type: 'date', label: 'Start', config: {} },
      { id: 'made', type: 'created_time', label: 'Created', config: {} },
      { id: 'touched', type: 'updated_time', label: 'Last modified', config: {} },
    ],
  };
  const item = { id: 'i', createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-13T10:00:00.000Z', values: {} };
  assert.deepEqual(itemDates(stamped, item), [
    { label: 'Created', value: '2026-08-01T10:00:00.000Z', relative: true },
    { label: 'Last modified', value: '2026-08-13T10:00:00.000Z', relative: true },
  ]);
  // A record never edited still reports a modified time, because created is what it has.
  const fresh = { id: 'j', createdAt: '2026-08-01T10:00:00.000Z', values: {} };
  assert.equal(itemDates(stamped, fresh)[1].value, '2026-08-01T10:00:00.000Z');
  // An app without those fields is unchanged.
  assert.ok(itemDates(app, app.items[0]).every((d) => d.relative === false));
});

test('the app is not made to say the same thing twice', () => {
  // With its own Last modified field there is no reason to add "Edited …" beside it.
  const withOwn = { fields: [{ id: 't', type: 'updated_time', label: 'Last modified', config: {} }] };
  const item = { id: 'i', updatedAt: '2026-08-13T10:00:00.000Z', values: {} };
  assert.equal(itemFacts(withOwn, item).updatedAt, '', 'the field already said it');
  // A Created time field is a different fact, so the generic edited line stays.
  const createdOnly = { fields: [{ id: 'c', type: 'created_time', label: 'Created', config: {} }] };
  assert.equal(itemFacts(createdOnly, { id: 'i', createdAt: 'x', updatedAt: 'y', values: {} }).updatedAt, 'y');
});

test('last edited is always answerable, even with no date field', () => {
  assert.equal(itemFacts(app, app.items[0]).updatedAt, '2026-08-13T10:00:00.000Z');
  // The App Builder stamps createdAt on every record, so a never-edited one still has a date.
  assert.equal(itemFacts(app, { createdAt: '2026-08-01T00:00:00.000Z', values: {} }).updatedAt, '2026-08-01T00:00:00.000Z');
});

test('usage carries the facts and an id the router can actually use', () => {
  const [use] = contactUsage(doc, 'cc-1');
  assert.equal(use.appName, 'Jobs');
  assert.equal(use.items[0].title, 'Tile Roofing');
  assert.equal(use.items[0].facts.stage.label, 'In production');
  assert.equal(use.items[0].facts.duration, 480);
  // The builder keys a workspace as ws-<operational id>; the router wants the bare id.
  assert.equal(use.workspaceId, 'ws-abc-123');
  assert.equal(use.workspaceRouteId, 'abc-123');
  // A builder-only workspace has no operational counterpart and so no route.
  const orphan = contactUsage({ workspaces: [{ id: 'wb-local', name: 'Scratch', apps: [app] }] }, 'cc-1');
  assert.equal(orphan[0].workspaceRouteId, '');
});

test('the link uses the parameter names the router reads', () => {
  // It used ws / app / item, which the router ignores — so the row opened the workspaces
  // section and never the record.
  const body = fn('useRow');
  assert.match(body, /workspace: use\.workspaceRouteId, app_id: use\.appId, tab: 'items', item_id: item\.id/);
  assert.ok(!/\bws: use\.workspaceId\b/.test(page), 'the old parameter names are gone');
  // And the names it uses are the ones main.js parses.
  assert.match(main, /params\.get\('workspace'\)/);
  assert.match(main, /route\.params\.get\('app_id'\)/);
  assert.match(main, /route\.params\.get\('item_id'\)/);
});

test('a record with no route renders as text, not a link to nowhere', () => {
  const body = fn('useRow');
  assert.match(body, /if \(!use\.workspaceRouteId\) return `<span class="cc-use-row is-flat">/);
});

test('a stamp reads as a moment ago and a typed date as a date', () => {
  // "Edited 8m ago" answers a question that "Edited Aug 14" does not.
  const body = fn('useRow');
  assert.match(body, /const text = date\.relative \? timeAgo\(date\.value\) : formatDate\(date\.value\);/);
  assert.match(body, /date\.relative \? 'ti-history' : 'ti-calendar'/);
});

test('every fact is optional and none renders an empty slot', () => {
  const body = fn('useRow');
  assert.match(body, /facts\.duration !== null && facts\.duration !== undefined/, 'a zero duration still shows');
  assert.match(body, /\(facts\.dates \|\| \[\]\)\.forEach/);
  assert.match(body, /facts\.stage \? /);
  assert.match(body, /meta\.length \? /, 'no meta line at all when there is nothing to say');
});

test('records are listed the way the workspace lists them: newest first', () => {
  // The Items table's sort is an in-memory preference that is not persisted, so there is no
  // "current sort" to read across. Its DEFAULT is created_desc, which is what somebody is
  // looking at when they compare the two screens.
  const rows = [
    { id: 'old', createdAt: '2026-08-01T10:00:00.000Z' },
    { id: 'new', createdAt: '2026-08-13T10:00:00.000Z' },
    { id: 'mid', createdAt: '2026-08-07T10:00:00.000Z' },
  ];
  assert.deepEqual(sortNewestFirst(rows).map((r) => r.id), ['new', 'mid', 'old']);
  // And it does not mutate what it was handed.
  assert.equal(rows[0].id, 'old');
});

test('the sort matches the workspace comparator exactly, fallback included', () => {
  // wbApplyPresetSort's created_desc, lifted rather than retyped: a record saved before
  // createdAt existed orders by whatever timestamp it does have instead of sinking to epoch.
  // Normalised first: main.js is CRLF, so a search for a bare newline finds nothing and the
  // slice comes back empty -- which fails as "not defined" rather than as a mismatch.
  const flat = main.replace(/\r\n/g, '\n');
  const at = flat.indexOf('function wbApplyPresetSort(');
  assert.notEqual(at, -1);
  const src = flat.slice(at, flat.indexOf('\n}\n', at) + 3);
  const wbApplyPresetSort = Function(`const wbItemTitle = () => ''; ${src}; return wbApplyPresetSort;`)();

  const rows = [
    { id: 'a', createdAt: '2026-08-01T00:00:00.000Z' },
    { id: 'b', updatedAt: '2026-08-20T00:00:00.000Z' },
    { id: 'c', createdAt: '2026-08-10T00:00:00.000Z' },
  ];
  assert.deepEqual(
    sortNewestFirst(rows).map((r) => r.id),
    wbApplyPresetSort({ fields: [] }, rows, 'created_desc').map((r) => r.id),
  );
});

test('usage returns each app’s records already sorted', () => {
  const twoItems = {
    ...app,
    items: [
      { id: 'older', createdAt: '2026-08-01T00:00:00.000Z', values: { contact: 'cc-1', title: 'First' } },
      { id: 'newer', createdAt: '2026-08-12T00:00:00.000Z', values: { contact: 'cc-1', title: 'Second' } },
    ],
  };
  const [use] = contactUsage({ workspaces: [{ id: 'ws-1', name: 'W', apps: [twoItems] }] }, 'cc-1');
  assert.deepEqual(use.items.map((i) => i.id), ['newer', 'older']);
  assert.equal(use.count, 2, 'sorting must not change what is counted');
});
