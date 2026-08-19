import assert from 'node:assert/strict';
import test from 'node:test';

import {
  NEW_FIELD_TYPES, configFor, fieldRefusal, needsOptions, parseOptions, press, renderQuickModal,
  saveQuick, setQuickType,
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
        'rollup', 'relationship', 'button', 'progress'].map((k) => [k, { label: k }]),
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
  const html = renderQuickModal(bench.ctx);
  assert.match(html, /value="text"/);
  assert.match(html, /value="category"/);
  assert.ok(!/value="calculation"/.test(html));
  assert.ok(!/value="relationship"/.test(html));
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
  const bench = harness();
  await bench.open();
  bench.ctx.state.wbQuick = { ...bench.ctx.state.wbQuick, label: 'Trade' };
  setQuickType('category', bench.ctx);
  assert.equal(bench.ctx.state.wbQuick.label, 'Trade', 'retyping it is not part of changing the type');
  assert.equal(bench.ctx.state.wbQuick.type, 'category');
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
