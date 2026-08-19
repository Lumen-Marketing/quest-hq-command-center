import assert from 'node:assert/strict';
import test from 'node:test';

import {
  NEW_FIELD_TYPES, configFor, fieldRefusal, needsOptions, parseOptions, press, renderQuickModal,
  saveQuick, setQuickType, setQuickValue,
} from '../src/workspace/quick-create.js';

// "New Field: select the field type, configure the field, choose where it goes, click Add."
//
// The configuring half is the one that decides whether the field WORKS. A dropdown with no
// options renders an empty select on every record for ever, and a calculation with no formula
// renders a warning triangle -- both look configured and neither can hold a value.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const h = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

function harness() {
  const app = {
    id: 'app-1',
    name: 'Leads',
    fields: [{ id: 'f-name', label: 'Name', type: 'text', config: {} }],
    items: [{ id: 'item-1', values: {} }],
    recordLayout: null,
  };
  const state = {};
  let n = 0;
  const ctx = {
    h,
    state,
    can: () => true,
    render: () => {},
    showToast: () => {},
    wbDoc: () => ({ workspaces: [{ id: 'ws-1', apps: [app] }] }),
    wbSave: async () => {},
    wbUid: () => `id-${(n += 1)}`,
    wbItemTitle: () => 'x',
    navigate: () => {},
    companyPath: () => '/',
    WB_FIELD_TYPES: Object.fromEntries(
      ['text', 'number', 'money', 'category', 'status', 'tags', 'checklist', 'date', 'calculation',
        'rollup', 'relationship', 'button', 'progress'].map((k) => [k, {
        label: k, icon: `ti-${k}`, color: '#2563eb', desc: `a ${k}`,
      }]),
    ),
    createSupabaseClient: () => null,
    isLiveSupabaseSession: () => false,
  };
  const seat = {
    companyId: 'co1', workspaceId: 'ws-1', appId: 'app-1', itemId: 'item-1',
  };
  return { ctx, state, app, open: () => press('field', seat, ctx) };
}

// ---- which types are offered -----------------------------------------------------------------

test('a type that cannot be finished here is not offered', () => {
  // Each of these arrives DEAD without something this dialog has no way to ask for.
  for (const dead of ['calculation', 'rollup', 'relationship', 'button', 'progress']) {
    assert.ok(!NEW_FIELD_TYPES.includes(dead), `${dead} needs a target this dialog cannot pick`);
  }
  // And the everyday ones are all there.
  for (const usable of ['text', 'number', 'money', 'date', 'category', 'status', 'tags', 'checkbox', 'file']) {
    assert.ok(NEW_FIELD_TYPES.includes(usable), `${usable} should be offered`);
  }
});

test('the dialog lists only those, and only ones the app knows', async () => {
  const bench = harness();
  await bench.open();
  // The list is drawn only while it is open -- shut, the dialog shows the one current choice.
  setQuickValue('open|type', bench.ctx);
  const html = renderQuickModal(bench.ctx);
  assert.match(html, /data-wb-quick-set="type\|text"/);
  assert.match(html, /data-wb-quick-set="type\|category"/);
  assert.ok(!/data-wb-quick-set="type\|calculation"/.test(html));
  assert.ok(!/data-wb-quick-set="type\|relationship"/.test(html));
});

test('every type in the list arrives wearing its own icon', async () => {
  // The point of the picker: twenty-six types as bare words is a wall to read.
  const bench = harness();
  await bench.open();
  setQuickValue('open|type', bench.ctx);
  const html = renderQuickModal(bench.ctx);
  assert.match(html, /ti ti-text/, 'the type has no icon');
  assert.match(html, /ti ti-money/);
  assert.match(html, /wb-pick-txt/);
  // And shut, no list is drawn at all -- the dialog shows the choices, not the catalogue.
  setQuickValue('open|', bench.ctx);
  const closed = renderQuickModal(bench.ctx);
  assert.ok(!closed.includes('wb-pick-list'), 'the list stayed open');
  assert.match(closed, /ti ti-text/, 'the current choice still shows its icon');
});

test('opening one list, choosing from it, and shutting it', async () => {
  const bench = harness();
  await bench.open();
  assert.equal(bench.ctx.state.wbQuick.open, '');
  assert.equal(setQuickValue('open|type', bench.ctx), 'open');
  assert.equal(bench.ctx.state.wbQuick.open, 'type');
  // Choosing shuts it: left open it covers the rest of the form, and the answer is on the button.
  assert.equal(setQuickValue('type|money', bench.ctx), 'type');
  assert.equal(bench.ctx.state.wbQuick.type, 'money');
  assert.equal(bench.ctx.state.wbQuick.open, '');
  // Nothing it does not recognise moves anything.
  assert.equal(setQuickValue('nonsense|x', bench.ctx), '');
  assert.equal(setQuickValue('no-separator', bench.ctx), '');
  assert.equal(bench.ctx.state.wbQuick.type, 'money');
});

// ---- where it goes, asked as two questions -----------------------------------------------------

test('Before or After is asked first, and only then which field', async () => {
  // "first select after or before, then select which field, then the name of field."
  const bench = harness();
  await bench.open();
  const html = renderQuickModal(bench.ctx);
  const order = ['Field type', 'Where it goes', 'Which field', 'Field name'].map((cap) => html.indexOf(cap));
  assert.ok(order.every((at) => at > -1), `a step is missing: ${JSON.stringify(order)}`);
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'the steps are out of order');
});

test('At the end has no field to pick, so it is not asked for', async () => {
  const bench = harness();
  await bench.open();
  setQuickValue('dir|end', bench.ctx);
  const html = renderQuickModal(bench.ctx);
  assert.ok(!html.includes('Which field'), 'asking after "at the end" is a question with no answer');
  assert.match(html, /name="position" value="end"/);
});

test('the direction and the field are carried to the form as one position', async () => {
  const bench = harness();
  await bench.open();
  setQuickValue('dir|before', bench.ctx);
  assert.match(renderQuickModal(bench.ctx), /name="position" value="before:f-name"/);
  // ...and the field picker offers the app's fields, each wearing its own type's icon.
  setQuickValue('open|target', bench.ctx);
  const html = renderQuickModal(bench.ctx);
  assert.match(html, /data-wb-quick-set="target\|f-name"/);
  assert.match(html, /ti ti-text/);
});

// ---- what each type is asked for ---------------------------------------------------------------

test('a choice field asks for its options, and a checklist for its steps', async () => {
  assert.equal(needsOptions('category'), true);
  assert.equal(needsOptions('status'), true);
  assert.equal(needsOptions('tags'), true);
  assert.equal(needsOptions('checklist'), true);
  assert.equal(needsOptions('text'), false);

  const bench = harness();
  await bench.open();
  setQuickType('category', bench.ctx);
  assert.match(renderQuickModal(bench.ctx), /name="options"/);
  setQuickType('checklist', bench.ctx);
  assert.match(renderQuickModal(bench.ctx), /Steps/);
});

test('money asks for a currency and a number for a unit', async () => {
  const bench = harness();
  await bench.open();
  setQuickType('money', bench.ctx);
  assert.match(renderQuickModal(bench.ctx), /name="currency"/);
  setQuickType('number', bench.ctx);
  assert.match(renderQuickModal(bench.ctx), /name="unit"/);
  // And a plain text field is asked for neither.
  setQuickType('text', bench.ctx);
  const plain = renderQuickModal(bench.ctx);
  assert.ok(!/name="currency"/.test(plain));
  assert.ok(!/name="options"/.test(plain));
});

test('changing the type keeps the name already typed', async () => {
  // This test USED to put the name into state itself and then change the type -- so it passed
  // while the product was broken, because the real path never wrote the box into state at all.
  // It now hands over what the form holds, which is what the record page does.
  const bench = harness();
  await bench.open();
  setQuickType('category', bench.ctx, { label: 'Trade' });
  assert.equal(bench.ctx.state.wbQuick.label, 'Trade', 'retyping it is not part of changing the type');
  assert.equal(bench.ctx.state.wbQuick.type, 'category');
});

test('nothing typed is lost to any of the presses that redraw', async () => {
  // Every control in this dialog redraws it, and the dialog draws from state. A box that has not
  // been saved anywhere is wiped by that redraw unless it is carried across.
  const bench = harness();
  await bench.open();
  const box = { label: 'Roof age', options: 'Old\nNew', currency: '£', unit: 'SQ' };

  setQuickValue('open|type', bench.ctx, box);
  assert.equal(bench.ctx.state.wbQuick.label, 'Roof age', 'opening the list wiped the name');
  setQuickValue('type|category', bench.ctx, box);
  assert.equal(bench.ctx.state.wbQuick.label, 'Roof age', 'choosing a type wiped the name');
  assert.equal(bench.ctx.state.wbQuick.options, 'Old\nNew', 'the options went with it');
  setQuickValue('dir|before', bench.ctx, box);
  assert.equal(bench.ctx.state.wbQuick.label, 'Roof age', 'Before/After wiped the name');
  setQuickValue('target|f-name', bench.ctx, box);
  assert.equal(bench.ctx.state.wbQuick.label, 'Roof age', 'picking the field wiped the name');
  assert.equal(bench.ctx.state.wbQuick.currency, '£');
  assert.equal(bench.ctx.state.wbQuick.unit, 'SQ');
  // ...and it is drawn back into the box, not just held.
  assert.match(renderQuickModal(bench.ctx), /name="label" value="Roof age"/);
});

test('the press wins over the form it was read from', async () => {
  // The form also carries type, target and the composed position -- the values the press is
  // CHANGING. Putting those back would undo the press it was meant to survive.
  const bench = harness();
  await bench.open();
  const stale = {
    label: 'Roof age', type: 'text', target: 'f-name', position: 'after:f-name',
  };
  setQuickValue('type|money', bench.ctx, stale);
  assert.equal(bench.ctx.state.wbQuick.type, 'money', 'the form put the old type back');
  setQuickValue('dir|before', bench.ctx, stale);
  assert.equal(bench.ctx.state.wbQuick.dir, 'before');
  assert.equal(bench.ctx.state.wbQuick.label, 'Roof age');
});

// ---- options -----------------------------------------------------------------------------------

test('options are one per line, trimmed, and never two the same', () => {
  const made = parseOptions('Roofing\n  Framing  \n\nRoofing\nroofing\nGutters', () => 'x');
  assert.deepEqual(made.map((o) => o.label), ['Roofing', 'Framing', 'Gutters'],
    'a duplicate label gives two options nothing can tell apart');
  made.forEach((o) => assert.match(o.color, /^#[0-9a-f]{6}$/i, 'an option needs a colour that survives install'));
  assert.notEqual(made[0].color, made[1].color, 'all-one-colour reads as one blob');
  assert.deepEqual(parseOptions('   \n  \n'), []);
  assert.deepEqual(parseOptions(undefined), []);
});

test('each option gets its own id', () => {
  let n = 0;
  const made = parseOptions('A\nB\nC', () => `o-${(n += 1)}`);
  assert.deepEqual(made.map((o) => o.id), ['o-1', 'o-2', 'o-3']);
});

test('the config carries only what the type uses', () => {
  assert.deepEqual(configFor('text', { options: 'A' }, () => 'x'), {});
  assert.equal(configFor('category', { options: 'A\nB' }, () => 'x').options.length, 2);
  assert.deepEqual(configFor('money', {}, () => 'x'), { currency: '$' }, 'a default beats a blank');
  assert.deepEqual(configFor('money', { currency: '£' }, () => 'x'), { currency: '£' });
  assert.deepEqual(configFor('number', { unit: ' % ' }, () => 'x'), { unit: '%' });
  assert.deepEqual(configFor('checklist', { options: 'Measure\nOrder' }, () => 'x'), { steps: ['Measure', 'Order'] });
});

// ---- what is refused ---------------------------------------------------------------------------

test('a choice field with no options is refused', () => {
  // It renders an empty dropdown on every record in the app, for ever.
  assert.match(fieldRefusal('category', 'Trade', { options: [] }), /at least one option/);
  assert.match(fieldRefusal('status', 'Stage', {}), /at least one option/);
  assert.equal(fieldRefusal('category', 'Trade', { options: [{ id: 'a', label: 'Roofing' }] }), '');
  // A checklist with no steps is fine -- steps are added on the record.
  assert.equal(fieldRefusal('checklist', 'Punch list', {}), '');
  assert.match(fieldRefusal('text', '  ', {}), /name/i);
});

test('the refusal reaches the dialog and nothing is written', async () => {
  const bench = harness();
  await bench.open();
  const before = bench.app.fields.length;
  assert.equal(await saveQuick({ type: 'category', label: 'Trade', options: '' }, bench.ctx), 'invalid');
  assert.equal(bench.app.fields.length, before, 'a dead field must not reach the app');
  assert.match(bench.ctx.state.wbQuick.error, /at least one option/);
});

// ---- the field that is actually made -------------------------------------------------------------

test('a dropdown arrives with its options on it', async () => {
  const bench = harness();
  await bench.open();
  assert.equal(await saveQuick({
    type: 'category', label: 'Trade', position: 'end', options: 'Roofing\nGutters',
  }, bench.ctx), 'field');
  const made = bench.app.fields.at(-1);
  assert.equal(made.type, 'category');
  assert.equal(made.label, 'Trade');
  assert.deepEqual(made.config.options.map((o) => o.label), ['Roofing', 'Gutters']);
  assert.equal(made.hidden, false);
  assert.equal(made.required, false);
});

test('money arrives spendable and a number arrives with its unit', async () => {
  const bench = harness();
  await bench.open();
  await saveQuick({
    type: 'money', label: 'Deposit', position: 'end', currency: '£',
  }, bench.ctx);
  assert.deepEqual(bench.app.fields.at(-1).config, { currency: '£' });

  await bench.open();
  await saveQuick({
    type: 'number', label: 'Squares', position: 'end', unit: 'SQ',
  }, bench.ctx);
  assert.deepEqual(bench.app.fields.at(-1).config, { unit: 'SQ' });
});
