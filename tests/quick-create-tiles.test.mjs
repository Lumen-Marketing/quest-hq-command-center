import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { QUICK_CREATE } from '../src/workspace/record-layout.js';
import {
  ALL_NUMBERS, closeQuick, fieldPositions, insertFieldAt, phoneChoices, press, renderQuickModal,
  saveQuick,
} from '../src/workspace/quick-create.js';

// "Just make sure Task, Call, SMS and New Field are in Quick Create."

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const f = (id, label, type, extra = {}) => ({
  id, label, type, config: {}, hidden: false, ...extra,
});

function harness({ phones = true } = {}) {
  const fields = [
    f('f-name', 'Name', 'text'),
    f('f-stage', 'Stage', 'status'),
    ...(phones ? [f('f-mob', 'Mobile', 'phone'), f('f-off', 'Office', 'phone')] : []),
    f('f-old', 'Old line', 'phone', { hidden: true }),
  ];
  const item = {
    id: 'item-1',
    values: {
      'f-name': '58th Pl', 'f-mob': '555 111 2222', 'f-off': '555 333 4444', 'f-old': '555 000 0000',
    },
  };
  const app = {
    id: 'app-1', name: 'Leads', fields, items: [item], recordLayout: null,
  };
  const state = {};
  const inserted = [];
  let saves = 0;
  const ctx = {
    h,
    state,
    can: () => true,
    render: () => {},
    showToast: () => {},
    wbDoc: () => ({ workspaces: [{ id: 'ws-1', apps: [app] }] }),
    wbSave: async () => { saves += 1; },
    wbUid: () => 'new-1',
    wbItemTitle: () => '58th Pl',
    navigate: () => {},
    companyPath: (section, query, companyId) => `/company/${companyId}/${section}`,
    WB_FIELD_TYPES: { text: { label: 'Text' }, date: { label: 'Date' }, money: { label: 'Money' } },
    WB_FIELD_ORDER: ['text', 'money', 'date'],
    createSupabaseClient: () => ({
      // insert() takes an ARRAY now: a message to every number is one row each, so a sender has
      // a list of messages rather than a field to parse.
      from: () => ({ insert: async (rows) => { inserted.push(...[].concat(rows)); return { error: null }; } }),
    }),
    isLiveSupabaseSession: () => true,
  };
  const seat = {
    companyId: 'co1', workspaceId: 'ws-1', appId: 'app-1', itemId: 'item-1',
  };
  return {
    ctx, state, app, item, inserted, saves: () => saves, run: (key) => press(key, seat, ctx),
  };
}

test('all four tiles are on the card', () => {
  const drawn = QUICK_CREATE.filter((entry) => !entry.soon).map((entry) => entry.key);
  assert.deepEqual(drawn, ['task', 'field', 'call', 'sms']);
  QUICK_CREATE.filter((entry) => !entry.soon).forEach((entry) => {
    assert.ok(entry.label && entry.desc && entry.icon && entry.tone, `${entry.key} is missing its face`);
    assert.ok(entry.module, `${entry.key} does nothing`);
  });
});

// ---- where a new field goes ----------------------------------------------------------------

test('a field can go before or after any field, or at the end', () => {
  const bench = harness();
  const opts = fieldPositions(bench.app).map((one) => one.value);
  assert.equal(opts[0], 'end', 'a record with no fields still has somewhere to put one');
  assert.ok(opts.includes('before:f-name'));
  assert.ok(opts.includes('after:f-name'));
  assert.match(fieldPositions(bench.app).find((one) => one.value === 'after:f-name').label, /After Name/);
});

test('the field lands exactly where it was asked to', () => {
  const list = [f('a', 'A', 'text'), f('b', 'B', 'text')];
  const made = f('n', 'New', 'text');
  assert.deepEqual(insertFieldAt(list, made, 'end').map((x) => x.id), ['a', 'b', 'n']);
  assert.deepEqual(insertFieldAt(list, made, 'before:a').map((x) => x.id), ['n', 'a', 'b']);
  assert.deepEqual(insertFieldAt(list, made, 'after:a').map((x) => x.id), ['a', 'n', 'b']);
  assert.deepEqual(insertFieldAt(list, made, 'before:b').map((x) => x.id), ['a', 'n', 'b']);
});

test('a position naming a field that has gone falls to the end, not to the front', () => {
  // findIndex returns -1, and splice(-1) inserts BEFORE the last item -- so a careless version
  // puts the new field second-to-last on a stale position, which is not what "end" means.
  const list = [f('a', 'A', 'text'), f('b', 'B', 'text')];
  const made = f('n', 'New', 'text');
  assert.deepEqual(insertFieldAt(list, made, 'after:deleted').map((x) => x.id), ['a', 'b', 'n']);
  assert.deepEqual(insertFieldAt(list, made, 'nonsense').map((x) => x.id), ['a', 'b', 'n']);
  assert.deepEqual(insertFieldAt(undefined, made, 'end').map((x) => x.id), ['n']);
});

// ---- which number --------------------------------------------------------------------------

test('only phone fields this record has a number in are offered', () => {
  const bench = harness();
  const found = phoneChoices(bench.app, bench.item);
  assert.deepEqual(found.map((one) => one.label), ['Mobile', 'Office'], 'a hidden line is not offered');
  assert.equal(found[0].value, '555 111 2222');
  assert.deepEqual(phoneChoices(bench.app, { values: {} }), []);
});

// ---- what each tile opens ------------------------------------------------------------------

test('New Field opens with the palette and the positions already worked out', async () => {
  const bench = harness();
  assert.equal(await bench.run('field'), 'field');
  assert.equal(bench.state.wbQuick.kind, 'field');
  assert.equal(bench.state.wbQuick.type, 'text');
  assert.ok(bench.state.wbQuick.positions.length > 1);
  const html = renderQuickModal(bench.ctx);
  assert.match(html, /Add a field to every record/);
  assert.match(html, /name="type"/);
  assert.match(html, /name="position"/);
  assert.match(html, /After Name/);
});

test('Call picks ONE number and rings that one', async () => {
  // A record with a mobile and an office line is asking which, not asking for two ways to press.
  const bench = harness();
  assert.equal(await bench.run('call'), 'call');
  const html = renderQuickModal(bench.ctx);
  assert.match(html, /name="to"/, 'two numbers means a choice, not two buttons');
  assert.equal((html.match(/data-wb-call=/g) || []).length, 1, 'one Call now button');
  // data-wb-call is the record page's existing confirm-then-log-then-dial path, reused rather
  // than a second dialler that would skip the logging.
  assert.match(html, /data-wb-call="tel:5551112222"/, 'the selected number');
  assert.match(html, /name="title"/);
  assert.match(html, /name="date"/);
  assert.match(html, /name="time"/);
  // A call made from a record is nearly always the follow-up, so it is filled in already.
  assert.match(html, /value="Follow up"/);
});

test('a record with no number says so rather than offering a dead button', async () => {
  const bench = harness({ phones: false });
  await bench.run('call');
  const html = renderQuickModal(bench.ctx);
  assert.ok(!/data-wb-call=/.test(html));
  assert.match(html, /no phone number/i);
});

test('SMS picks the number when there is a choice, and never offers Send', async () => {
  const bench = harness();
  assert.equal(await bench.run('sms'), 'sms');
  const html = renderQuickModal(bench.ctx);
  assert.match(html, /name="to"/, 'two numbers means a choice');
  assert.match(html, /name="body"/);
  assert.match(html, /Scheduled only/);
  // The routing contract is not implemented, so a Send button would do nothing in production.
  assert.ok(!/>Send</.test(html), 'there must be no Send button');
});

test('one number needs no dropdown', async () => {
  const bench = harness();
  bench.app.fields = bench.app.fields.filter((x) => x.id !== 'f-off');
  await bench.run('sms');
  assert.ok(!/name="to"/.test(renderQuickModal(bench.ctx)));
});

// ---- saving --------------------------------------------------------------------------------

test('adding a field writes it in the chosen place and saves the app', async () => {
  const bench = harness();
  await bench.run('field');
  assert.equal(await saveQuick({ type: 'date', label: 'Site visit', position: 'before:f-stage' }, bench.ctx), 'field');
  assert.deepEqual(bench.app.fields.map((x) => x.label).slice(0, 3), ['Name', 'Site visit', 'Stage']);
  assert.equal(bench.app.fields[1].type, 'date');
  assert.equal(bench.saves(), 1);
  assert.equal(bench.state.wbQuick, null, 'the dialog closes on success');
});

test('a field with no name is refused, and the dialog stays open', async () => {
  const bench = harness();
  await bench.run('field');
  const before = bench.app.fields.length;
  assert.equal(await saveQuick({ type: 'text', label: '   ', position: 'end' }, bench.ctx), 'invalid');
  assert.equal(bench.app.fields.length, before);
  assert.match(bench.state.wbQuick.error, /name/i);
});

test('a scheduled call becomes a row, dated when it was asked for', async () => {
  const bench = harness();
  await bench.run('call');
  assert.equal(await saveQuick({
    title: 'Follow up', date: '2026-09-01', time: '14:30', body: 'Ask about the roof',
  }, bench.ctx), 'call');
  const [row] = bench.inserted;
  assert.equal(row.kind, 'call');
  assert.equal(row.title, 'Follow up');
  assert.equal(row.body, 'Ask about the roof');
  assert.equal(row.item_id, 'item-1');
  assert.equal(row.app_id, 'app-1');
  assert.equal(bench.inserted.length, 1, 'a call rings one number');
  assert.equal(new Date(row.scheduled_for).getFullYear(), 2026);
  assert.equal(bench.state.wbQuick, null);
});

test('a scheduled SMS keeps the number it was aimed at', async () => {
  // The record's phone field can change; a reminder must use the number the person meant.
  const bench = harness();
  await bench.run('sms');
  await saveQuick({
    title: 'Arrival', to: '555 333 4444', body: 'On my way', date: '2026-09-01', time: '08:00',
  }, bench.ctx);
  assert.equal(bench.inserted.length, 1);
  assert.equal(bench.inserted[0].to_number, '555 333 4444');
  assert.equal(bench.inserted[0].kind, 'sms');
  assert.equal(bench.inserted[0].title, 'Arrival');
});

test('a message to all numbers is one row each', async () => {
  // So whatever sends them has a list of messages rather than a field to parse.
  const bench = harness();
  await bench.run('sms');
  await saveQuick({
    title: 'Arrival', to: ALL_NUMBERS, body: 'On my way', date: '2026-09-01', time: '08:00',
  }, bench.ctx);
  assert.deepEqual(bench.inserted.map((r) => r.to_number), ['555 111 2222', '555 333 4444']);
  bench.inserted.forEach((r) => assert.equal(r.body, 'On my way'));
});

test('all-numbers is offered for a message and never for a call', async () => {
  // You cannot ring two numbers at once.
  const bench = harness();
  await bench.run('sms');
  assert.match(renderQuickModal(bench.ctx), /All 2 numbers/);
  await bench.run('call');
  assert.ok(!/All 2 numbers/.test(renderQuickModal(bench.ctx)));
});

test('an empty message is refused before anything is written', async () => {
  const bench = harness();
  await bench.run('sms');
  assert.equal(await saveQuick({ body: '  ', date: '2026-09-01', time: '08:00' }, bench.ctx), 'invalid');
  assert.deepEqual(bench.inserted, []);
});

test('a save the database refuses is said out loud, not swallowed', async () => {
  // Until the migration is applied this is exactly what happens, and a silent failure here looks
  // identical to a save that worked.
  const bench = harness();
  bench.ctx.createSupabaseClient = () => ({
    from: () => ({ insert: async () => ({ error: { message: 'relation does not exist' } }) }),
  });
  await bench.run('call');
  assert.equal(await saveQuick({ title: 'x', date: '2026-09-01', time: '09:00' }, bench.ctx), 'failed');
  assert.match(bench.state.wbQuick.error, /relation does not exist/);
  assert.equal(bench.state.wbQuick.busy, false, 'and the button comes back');
});

test('scheduling puts the card on the record, once', async () => {
  // So the thing just saved is visible without going to Customize to find out where it went.
  const bench = harness();
  bench.app.recordLayout = [{ id: 'b1', type: 'fields', size: 2, config: { fieldIds: null } }];
  await bench.run('call');
  await saveQuick({ title: 'Follow up', date: '2026-09-01', time: '09:00' }, bench.ctx);
  assert.equal(bench.app.recordLayout.filter((b) => b.type === 'events').length, 1);

  // And taking it off deliberately is not undone by the next save.
  bench.app.recordLayout = bench.app.recordLayout.filter((b) => b.type !== 'events');
  const kept = [...bench.app.recordLayout];
  await bench.run('sms');
  await saveQuick({ body: 'hi', date: '2026-09-02', time: '09:00' }, bench.ctx);
  assert.equal(bench.app.recordLayout.filter((b) => b.type === 'events').length, 1,
    'it is added again because it was gone -- removing it is a layout edit, not a preference');
  assert.equal(kept.length + 1, bench.app.recordLayout.length);
});

test('the cached rows for that record are dropped so the card re-reads them', async () => {
  const bench = harness();
  bench.ctx.state.wbEventRows = { 'co1|ws-1|app-1|item-1': [], other: [] };
  await bench.run('call');
  await saveQuick({ title: 'x', date: '2026-09-01', time: '09:00' }, bench.ctx);
  assert.equal(bench.ctx.state.wbEventRows['co1|ws-1|app-1|item-1'], undefined, 'stale rows would hide it');
  assert.ok(bench.ctx.state.wbEventRows.other, 'another record is left alone');
});

test('closing throws the draft away', async () => {
  const bench = harness();
  await bench.run('sms');
  closeQuick(bench.ctx);
  assert.equal(bench.state.wbQuick, null);
  assert.equal(renderQuickModal(bench.ctx), '');
});

test('Call now is a selector main.js actually binds', () => {
  // "They drew fine and did nothing" is a failure this page has had before: the dialog is drawn
  // by a lazy module and bound by the workspace paint pass, so the two agree only by name.
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(main, /bind\('\[data-wb-call\]'/, 'the Call now button would be inert');
  // ...by the pass that runs after EVERY workspace paint. The record page is not the items list,
  // so a binding gated to that view would leave this button dead on the page it is drawn on.
  const at = main.indexOf("bind('[data-wb-call]'");
  const gate = main.lastIndexOf("if (state.route?.section === 'workspaces'", at);
  assert.ok(gate > -1, 'the binding pass has no recognisable gate');
  assert.equal(
    main.slice(gate, main.indexOf(String.fromCharCode(10), gate)).trim(),
    "if (state.route?.section === 'workspaces' && !state.builderModal) {",
  );
});
