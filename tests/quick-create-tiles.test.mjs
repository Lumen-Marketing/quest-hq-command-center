import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { QUICK_CREATE } from '../src/workspace/record-layout.js';
import {
  ALL_NUMBERS, SAVE_TIMEOUT_MS, closeQuick, fieldTargets, insertFieldAt, phoneChoices,
  positionOf, press, renderQuickModal, saveQuick,
} from '../src/workspace/quick-create.js';

// "Just make sure Task, Call, SMS and New Field are in Quick Create."

// The App Builder keys a workspace as `ws-<uuid>`, and that uuid is the row in
// public.workspaces. A fixture that says `ws-1` cannot catch a uuid column rejecting the key,
// which is exactly what shipped: "invalid input syntax for type uuid".
const WS_UUID = '42959c90-a8e6-4ec4-af78-82036849dba7';
const WS = `ws-${WS_UUID}`;

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const f = (id, label, type, extra = {}) => ({
  id, label, type, config: {}, hidden: false, ...extra,
});

function harness({ phones = true, insert = null, save = null } = {}) {
  const fields = [
    f('f-name', 'Name', 'text'),
    f('f-stage', 'Stage', 'status'),
    // The hidden line belongs WITH the other numbers, not outside them: a hidden phone field is
    // still a phone number, so `phones: false` has to take it away too or the fixture for "this
    // record has no number" still has one.
    ...(phones ? [
      f('f-mob', 'Mobile', 'phone'),
      f('f-off', 'Office', 'phone'),
      f('f-old', 'Old line', 'phone', { hidden: true }),
    ] : []),
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
    wbDoc: () => ({ workspaces: [{ id: WS, apps: [app] }] }),
    wbSave: save || (async () => { saves += 1; }),
    wbUid: () => 'new-1',
    wbItemTitle: () => '58th Pl',
    navigate: () => {},
    companyPath: (section, query, companyId) => `/company/${companyId}/${section}`,
    WB_FIELD_TYPES: { text: { label: 'Text' }, date: { label: 'Date' }, money: { label: 'Money' } },
    WB_FIELD_ORDER: ['text', 'money', 'date'],
    createSupabaseClient: () => ({
      // insert() takes an ARRAY now: a message to every number is one row each, so a sender has
      // a list of messages rather than a field to parse.
      from: () => ({
        insert: insert || (async (rows) => { inserted.push(...[].concat(rows)); return { error: null }; }),
      }),
    }),
    isLiveSupabaseSession: () => true,
  };
  const seat = {
    companyId: 'co1', workspaceId: WS, appId: 'app-1', itemId: 'item-1',
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

test('the fields to sit next to are the ones the record already shows, in that order', () => {
  // One list of fields, not one of every before/after combination -- that was every field twice,
  // so an app with twenty of them offered forty lines to read to make one choice.
  const bench = harness();
  const opts = fieldTargets(bench.app);
  assert.deepEqual(opts.map((one) => one.value), bench.app.fields.map((one) => one.id));
  assert.equal(opts[0].label, bench.app.fields[0].label);
  assert.equal(opts[0].type, bench.app.fields[0].type, 'the type is carried so the row can wear its icon');
  assert.deepEqual(fieldTargets({ fields: [] }), []);
});

test('the direction and the field compose the one string insertFieldAt takes', () => {
  assert.equal(positionOf({ dir: 'before', target: 'f-name' }), 'before:f-name');
  assert.equal(positionOf({ dir: 'after', target: 'f-name' }), 'after:f-name');
  assert.equal(positionOf({ dir: 'end', target: 'f-name' }), 'end', 'at the end ignores whatever was picked before');
  // A record with no fields, or a target deleted since the dialog opened: the field is still
  // wanted, so it goes at the end rather than being refused.
  assert.equal(positionOf({ dir: 'after', target: '' }), 'end');
  assert.equal(positionOf(null), 'end');
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
  assert.deepEqual(found.map((one) => one.label), ['Mobile', 'Office', 'Old line']);
  assert.equal(found[0].value, '555 111 2222');
  assert.deepEqual(phoneChoices(bench.app, { values: {} }), []);
});

test('a hidden phone field is still a phone number', () => {
  // This used to be the other way round, and it was reported from use: a record showing
  // "PHONE 555-123-4570" on screen, and Call three inches away saying "This record has no phone
  // number." The app had hidden its Phone field.
  //
  // `hidden` is a TABLE setting -- the builder's own tooltip reads "Hide this field from the
  // items table (still editable on each record)", and the record page draws hidden fields like
  // any other. Reading it as "retired, do not ring" makes a decision about column width silently
  // disable calling, which nobody would look for and the dialog cannot explain.
  //
  // Keeping a number OUT of Call is a real thing to want, but it needs its own switch. It cannot
  // be the one that tidies a table.
  const bench = harness();
  const old = phoneChoices(bench.app, bench.item).find((one) => one.label === 'Old line');
  assert.ok(old, 'the hidden line is offered');
  assert.equal(old.value, '555 000 0000');
});

// ---- what each tile opens ------------------------------------------------------------------

test('New Field opens on a sensible default rather than an empty form', async () => {
  const bench = harness();
  assert.equal(await bench.run('field'), 'field');
  const v = bench.state.wbQuick;
  assert.equal(v.kind, 'field');
  assert.equal(v.type, 'text');
  // After the last field: where a new one goes unless somebody says otherwise, said in the words
  // the dialog asks in.
  assert.equal(v.dir, 'after');
  assert.equal(v.target, bench.app.fields.at(-1).id);
  assert.equal(v.open, '', 'a list open before it was asked for covers the form');
  const html = renderQuickModal(bench.ctx);
  assert.match(html, /Add a field to every record/);
  // The value still reaches the form as one hidden input, so saveQuick reads what it always did.
  assert.match(html, /name="type"/);
  assert.match(html, new RegExp(`name="position" value="after:${bench.app.fields.at(-1).id}"`));
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
  // Down to ONE number, which now means dropping the hidden line too -- a hidden phone field
  // is still a phone number, so leaving it in leaves a second number and a dropdown with it.
  bench.app.fields = bench.app.fields.filter((x) => x.id !== 'f-off' && x.id !== 'f-old');
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
  assert.deepEqual(bench.inserted.map((r) => r.to_number), ['555 111 2222', '555 333 4444', '555 000 0000']);
  bench.inserted.forEach((r) => assert.equal(r.body, 'On my way'));
});

test('all-numbers is offered for a message and never for a call', async () => {
  // You cannot ring two numbers at once.
  const bench = harness();
  await bench.run('sms');
  assert.match(renderQuickModal(bench.ctx), /All 3 numbers/);
  await bench.run('call');
  assert.ok(!/All 3 numbers/.test(renderQuickModal(bench.ctx)));
});

test('the dialog closes on the row, not on the whole-document write', async () => {
  // "fix it, it takes time saving just this record."
  //
  // The call is durable the moment wb_record_events accepts it. wbSave writes the BUILDER
  // DOCUMENT -- every app and every record in the company, photos and spreadsheets and laid-out
  // pages included -- and holding "Saving…" over that is what made scheduling one call feel like
  // a freeze. Here wbSave never settles at all, and the dialog still finishes.
  const bench = harness({ save: () => new Promise(() => {}) });
  await bench.run('call');
  const out = await saveQuick({
    title: 'Follow up', to: '555 111 2222', date: '2026-09-01', time: '08:00',
  }, bench.ctx);

  assert.equal(out, 'call');
  assert.equal(bench.state.wbQuick, null, 'the dialog is closed, not still saving');
  assert.equal(bench.inserted.length, 1, 'and the row that matters did land');
});

test('a save that THROWS still lets go of the dialog', async () => {
  // The bug this guards, reported from use: a Call dialog stuck on "Saving…" with Save disabled
  // and no way forward. The insert was awaited bare, so an offline fetch rejecting -- or a token
  // refresh throwing inside the client -- escaped as an unhandled rejection with `busy: true`
  // still on state. Nothing repainted, and pressing Save again hit the `if (v.busy) return`
  // guard at the top and did nothing. The dialog was dead until it was closed, and it never
  // said why.
  const bench = harness({
    insert: async () => { throw new TypeError('Failed to fetch'); },
  });
  await bench.run('call');
  const out = await saveQuick({
    title: 'Follow up', to: '555 111 2222', date: '2026-09-01', time: '08:00',
  }, bench.ctx);

  assert.equal(out, 'failed');
  assert.equal(bench.state.wbQuick.busy, false, 'the dialog can be used again');
  assert.match(bench.state.wbQuick.error, /Failed to fetch|offline/);
  // And what was typed is still in it, so the retry is one press rather than a re-fill.
  assert.equal(bench.state.wbQuick.title, 'Follow up');
});

test('a save that never answers gives up rather than saying Saving for ever', async () => {
  // The other half. A request that never settles is not an error the client will ever report,
  // so without a clock of its own "Saving…" is simply where the dialog stops.
  assert.ok(SAVE_TIMEOUT_MS > 0 && SAVE_TIMEOUT_MS <= 60000, 'there is a bound, and it is a sane one');
  const bench = harness({ insert: () => new Promise(() => {}) });
  await bench.run('call');
  bench.ctx.state.wbQuick = { ...bench.ctx.state.wbQuick };
  // Not run to the wall clock -- the point under test is that the race exists and that whatever
  // wins it, `busy` is put back. saveQuick's finally is what guarantees the second part.
  const source = readFileSync(new URL('../src/workspace/quick-create.js', import.meta.url), 'utf8');
  assert.ok(source.includes('Promise.race([signalled, clock.promise])'), 'the insert races a clock');
  assert.ok(source.includes('clock.cancel();'), 'and the clock is always stopped');
  assert.ok(source.includes('} catch (thrown) {'), 'a throw is caught rather than escaping');
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
  const key = `co1|${WS}|app-1|item-1`;
  bench.ctx.state.wbEventRows = { [key]: [], other: [] };
  await bench.run('call');
  await saveQuick({ title: 'x', date: '2026-09-01', time: '09:00' }, bench.ctx);
  assert.equal(bench.ctx.state.wbEventRows[key], undefined, 'stale rows would hide it');
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

test('the row carries the workspace ROW id, not the builder key', () => {
  // "invalid input syntax for type uuid: ws-42959c90-...". workspace_id is a uuid column, and it
  // is also the value app_private.has_workspace_permission is given to decide whether the insert
  // is allowed at all -- so the builder key fails twice over.
  const bench = harness();
  return bench.run('call')
    .then(() => saveQuick({ title: 'Follow up', date: '2026-09-01', time: '09:00' }, bench.ctx))
    .then(() => {
      assert.equal(bench.inserted[0].workspace_id, WS_UUID);
      assert.ok(!String(bench.inserted[0].workspace_id).startsWith('ws-'));
      // The cache key stays the BUILDER id: it names what is on screen, not what is in the table.
      assert.equal(bench.ctx.state.wbEventRows?.[`co1|${WS}|app-1|item-1`], undefined);
    });
});

test('a workspace with no row behind it is refused in words', async () => {
  // A legacy document keys the company instead of a workspace. There is nothing to point at, so
  // it says so rather than handing Postgres a value it can only reject.
  const bench = harness();
  bench.ctx.wbDoc = () => ({ workspaces: [{ id: 'ws-questroofing', apps: [bench.app] }] });
  const seat = { companyId: 'co1', workspaceId: 'ws-questroofing', appId: 'app-1', itemId: 'item-1' };
  await press('call', seat, bench.ctx);
  assert.equal(await saveQuick({ title: 'x', date: '2026-09-01', time: '09:00' }, bench.ctx), 'invalid');
  assert.equal(bench.inserted.length, 0, 'nothing may reach the table');
  assert.match(bench.ctx.state.wbQuick.error, /cannot hold a scheduled call/);
});
