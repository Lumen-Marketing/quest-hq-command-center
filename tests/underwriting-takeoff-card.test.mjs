import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createTakeoffCard } from '../src/underwriting/takeoff-card.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');
const page = readFileSync(join(root, 'src', 'crm', 'underwriter-page.js'), 'utf8');

const SHEET = {
  total_sq: 65, rakes: 162, valleys: 44, drip_edge: 642,
  eaves: 480, ridges: 95, low_slope: 188, leak_barrier: 924,
};

const build = ({ canManage = true, saved = [] } = {}) => {
  const state = { underwritingCalculators: saved, takeoffCalculatorId: '', takeoffDraft: null };
  const toasts = [];
  const writes = [];
  const card = createTakeoffCard({
    can: () => canManage,
    h: (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'),
    money: (value) => `$${Number(value).toFixed(2)}`,
    showToast: (message) => toasts.push(message),
    state,
    supabaseRow: (row, cols) => Object.fromEntries(cols.filter((col) => row[col] !== undefined).map((col) => [col, row[col]])),
    supabaseWrite: async (table, row) => { writes.push({ table, row }); return { ok: true, data: null }; },
    activeCompanyId: () => 'co',
    activeWorkspaceId: () => 'ws-1',
    isLiveSupabaseSession: () => true,
    render: () => {},
  });
  return { card, state, toasts, writes };
};

// Executing it, not reading it. A module that throws on the first call passes every assertion
// that only matches source text -- which is how a dead Add-job button and a blank field panel
// both shipped looking perfectly fine.
test('the card renders with nothing saved, on the calculator that ships with the app', () => {
  const { card } = build();
  const html = card.renderTakeoffCard('co', { measurements: SHEET });
  assert.match(html, /data-takeoff-root/);
  assert.match(html, /Takeoff calculator/);
  ['Total SQ', 'Leak barrier', 'Eagle tile', 'Ply40 Westlake Royal underlayment', 'Total for client']
    .forEach((label) => assert.ok(html.includes(label), `${label} is on the card`));
});

test('the priced result on the card is the spreadsheet result', () => {
  const { card } = build();
  const html = card.renderTakeoffCard('co', { measurements: SHEET });
  ['$8600.00', '$9202.00', '$9984.17', '$18584.17', '$29250.00', '$10665.83'].forEach((amount) => {
    assert.ok(html.includes(amount), `${amount} is shown`);
  });
  assert.match(html, /36\.46%/);
});

test('a saved measurement set comes back rather than starting at zero', () => {
  const { card, state } = build();
  card.renderTakeoffCard('co', { measurements: SHEET });
  assert.equal(state.takeoffDraft.measurements.total_sq, 65);
  assert.equal(state.takeoffDraft.measurements.leak_barrier, 924);
});

test('the eight measurements are inputs and the waste column is not', () => {
  // The waste figure is worked out, so offering it as a box to type in would be a lie about
  // which number is in charge.
  const { card } = build();
  const html = card.renderTakeoffCard('co', null);
  assert.equal((html.match(/data-takeoff-measure=/g) || []).length, 8);
  assert.ok(!/data-takeoff-waste=/.test(html));
});

test('editing opens the formula, the price and the name of every line', () => {
  const { card, state } = build();
  card.renderTakeoffCard('co', null);
  state.takeoffDraft.editing = true;
  const html = card.renderTakeoffCard('co', null);
  assert.match(html, /data-takeoff-field="formula"/);
  assert.match(html, /data-takeoff-field="price"/);
  assert.match(html, /data-takeoff-field="name"/);
  assert.match(html, /data-takeoff-action="add-line"/);
  assert.match(html, /data-takeoff-action="remove-line"/);
  // And it says what can go in a formula, because an empty text box that only accepts one
  // grammar is a guessing game.
  assert.match(html, /ROUNDUP/);
  assert.match(html, /\+ waste/);
});

test('a line worked out by a formula does not also offer a quantity to type', () => {
  const { card, state } = build();
  card.renderTakeoffCard('co', null);
  state.takeoffDraft.editing = true;
  const html = card.renderTakeoffCard('co', null);
  const eagle = html.slice(html.indexOf('Eagle tile'));
  assert.match(eagle.slice(0, 800), /class="tk-qty" type="number"[^>]*disabled/);
});

test('somebody who can only view gets the numbers and none of the controls', () => {
  const { card } = build({ canManage: false });
  const html = card.renderTakeoffCard('co', { measurements: SHEET });
  assert.ok(html.includes('$29250.00'), 'the priced job is still readable');
  assert.ok(!/data-takeoff-action="save"/.test(html));
  assert.ok(!/data-takeoff-action="toggle-edit"/.test(html));
  assert.ok(!/data-takeoff-field=/.test(html));
});

test('a saved calculator is used ahead of the built-in one, and is pickable', () => {
  const saved = [{
    id: 'calc-1',
    company_id: 'co',
    name: 'Shingle tear-off',
    position: 0,
    created_at: '2026-08-01T00:00:00.000Z',
    config: { waste_percent: 12, tax_percent: 7, lines: [{ id: 'a', group: 'client', name: 'Shingle roof', formula: '{Total SQ}', price: 500 }] },
  }];
  const { card } = build({ saved });
  const html = card.renderTakeoffCard('co', { measurements: SHEET });
  assert.match(html, /Shingle tear-off/);
  assert.ok(html.includes('$32500.00'), '65 squares at 500');
  assert.ok(!html.includes('Eagle tile'), 'the built-in lines are not mixed in');
  assert.match(html, /data-takeoff-action="pick"/);
});

test('saving writes the calculator, not the measurements', async () => {
  // The calculator belongs to the company; the measurements belong to the roof. Storing a
  // customer's report inside the company's pricing template would price the next job on it.
  const { card, state, writes } = build();
  card.renderTakeoffCard('co', { measurements: SHEET });
  state.takeoffDraft.name = 'Tile, retail';
  await withDocument(() => card.onTakeoffEvent({ target: fakeButton('save') }, 'click'));
  assert.equal(writes.length, 1);
  assert.equal(writes[0].table, 'underwriting_calculators');
  assert.equal(writes[0].row.name, 'Tile, retail');
  assert.equal(writes[0].row.company_id, 'co');
  assert.ok(!('measurements' in writes[0].row), 'the report is not in the template');
  assert.ok(!('takeoff' in writes[0].row));
  assert.equal(state.underwritingCalculators.length, 1);
  assert.equal(state.takeoffDraft.dirty, false, 'saved means saved');
});

test('a write the server refuses leaves the card dirty rather than claiming it saved', async () => {
  const { card, state } = build();
  card.renderTakeoffCard('co', { measurements: SHEET });
  const toasts = [];
  const failing = createTakeoffCard({
    can: () => true,
    h: (value) => String(value ?? ''),
    money: (value) => `$${value}`,
    showToast: (message) => toasts.push(message),
    state,
    supabaseRow: (row) => row,
    supabaseWrite: async () => ({ ok: false, data: null }),
    activeCompanyId: () => 'co',
    activeWorkspaceId: () => 'ws-1',
    isLiveSupabaseSession: () => true,
    render: () => {},
  });
  await withDocument(() => failing.onTakeoffEvent({ target: fakeButton('save') }, 'click'));
  assert.equal(state.takeoffDraft.dirty, true, 'the Save button stays live');
  assert.deepEqual(toasts, [], 'and nothing tells the user it worked');
});

test('the totals handed to the decision panel are the takeoff totals', () => {
  const { card } = build();
  card.renderTakeoffCard('co', { measurements: SHEET });
  assert.deepEqual(card.takeoffTotals(), {
    materialCost: 9984.17,
    laborCost: 8600,
    contractPrice: 29250,
    measurements: SHEET,
    calculatorId: '',
  });
});

// ---- the same card on a quote record ------------------------------------------------------

const buildScoped = () => {
  const state = { underwritingCalculators: [], takeoffCalculatorId: '', takeoffDraft: null };
  const saves = [];
  const card = createTakeoffCard({
    can: (permission) => permission === 'crm.manage',
    h: (value) => String(value ?? ''),
    money: (value) => `$${Number(value).toFixed(2)}`,
    showToast: () => {},
    state,
    supabaseRow: (row) => row,
    supabaseWrite: async () => ({ ok: true }),
    activeCompanyId: () => 'co',
    activeWorkspaceId: () => 'ws-1',
    isLiveSupabaseSession: () => false,
    render: () => {},
    takeoffPermission: 'crm.manage',
    saveRecordLabel: 'Save to this quote',
    saveTakeoffToRecord: (scope, payload, totals) => saves.push({ scope, payload, totals }),
  });
  return { card, state, saves };
};

test('on a quote the card saves to the quote, not into a decision', () => {
  const { card } = buildScoped();
  const html = card.renderTakeoffCard('co', { measurements: SHEET }, { scope: 'deal:deal-1' });
  assert.match(html, /data-takeoff-action="save-record"/);
  assert.match(html, /Save to this quote/);
  assert.ok(!/data-takeoff-action="push"/.test(html), 'there is no decision panel on a quote');
});

test('the draft is keyed to the record, so a second quote does not open on the first roof', () => {
  const { card, state } = buildScoped();
  card.renderTakeoffCard('co', { measurements: SHEET }, { scope: 'deal:deal-1' });
  assert.equal(state.takeoffDraft.measurements.total_sq, 65);
  card.renderTakeoffCard('co', { measurements: { total_sq: 12 } }, { scope: 'deal:deal-2' });
  assert.equal(state.takeoffDraft.scope, 'deal:deal-2');
  assert.equal(state.takeoffDraft.measurements.total_sq, 12);
  assert.equal(state.takeoffDraft.measurements.rakes, 0, 'and nothing carried over from the last one');
});

test('saving hands back the scope, the measurements and the totals', async () => {
  const { card, saves } = buildScoped();
  card.renderTakeoffCard('co', { measurements: SHEET }, { scope: 'deal:deal-1' });
  await withDocument(() => card.onTakeoffEvent({ target: fakeButton('save-record') }, 'click'));
  assert.equal(saves.length, 1);
  assert.equal(saves[0].scope, 'deal:deal-1');
  assert.equal(saves[0].payload.measurements.total_sq, 65);
  assert.equal(saves[0].totals.contractPrice, 29250);
});

test('the card answers to the permission of the page it is on', () => {
  const { card } = buildScoped();
  // can() here only grants crm.manage. On a quote that is enough to edit the calculator; the
  // Underwriter page asks for underwriter.manage instead and this same person would be read-only.
  assert.match(card.renderTakeoffCard('co', null, { scope: 'deal:d' }), /data-takeoff-action="toggle-edit"/);
});

test('a quote whose takeoff prices nothing does not overwrite a value typed by hand', () => {
  const deal = readFileSync(join(root, 'src', 'crm', 'deal-detail.js'), 'utf8');
  assert.match(deal, /const setsValue = totals\.contractPrice > 0;/);
  assert.match(deal, /value: setsValue \? totals\.contractPrice : deal\.value/);
});

test('the quote card is on the deal record and scoped to that deal', () => {
  const deal = readFileSync(join(root, 'src', 'crm', 'deal-detail.js'), 'utf8');
  assert.match(deal, /takeoff\.renderTakeoffCard\(companyId, deal\.takeoff, \{ scope: `deal:\$\{deal\.id\}` \}\)/);
  assert.match(deal, /takeoffPermission: 'crm\.manage'/);
});

test('on a quote the card lines up with the columns above it', () => {
  // .sf-record bleeds 26px past its container and insets its columns 16px back from that.
  // Without a rule of its own the card ran out to the bleed edge while every card above it
  // stopped short, which reads as a broken layout rather than a full-width panel.
  assert.match(styles, /\.sf-record > \.takeoff-card \{[^}]*margin: 0 16px/);
});

test('a quote carries its measurements through the deal write path', () => {
  assert.match(main, /takeoff: input\.takeoff && typeof input\.takeoff === 'object' \? input\.takeoff : \{\},/);
  assert.match(main, /const DEAL_COLS = \[[^\]]*'takeoff'/);
});

test('a quote draft is never written onto a contact underwriting case', () => {
  // Two pages share one draft slot. Without the scope check, pricing a quote and then saving
  // an unrelated decision would file this roof against that contact.
  assert.match(main, /if \(!draft \|\| draft\.scope !== 'underwriter' \|\| draft\.companyId !== activeCompanyId\(\)\) return null;/);
});

// ---- the seams it depends on --------------------------------------------------------------

test('the card is on the underwriter page, under the decision panel', () => {
  assert.match(page, /takeoff\.renderTakeoffCard\(companyId, underwritingCaseForContact\(selectedContact\?\.id, companyId\)\?\.takeoff\)/);
  assert.ok(page.indexOf('renderTakeoffCard') > page.indexOf('underwriting-form'), 'the takeoff feeds the decision, so it reads after it');
});

test('main.js forwards the card its own events, and only its own', () => {
  assert.match(main, /function takeoffEvent\(event, kind\) \{/);
  assert.match(main, /event\.target\.closest\?\.\('\[data-takeoff-root\]'\)/);
  ['input', 'change', 'click'].forEach((kind) => {
    assert.ok(main.includes(`takeoffEvent(event, '${kind}')`), `${kind} is forwarded`);
  });
  // Nothing is awaited: the card can only be on screen because the page module drew it.
  assert.ok(!/await takeoffEvent/.test(main));
  // Two modules draw the card, so main.js names neither -- whichever painted last registers.
  assert.match(main, /function setTakeoffHandler\(handler\) \{ takeoffHandler = handler; \}/);
  assert.ok(!/renderUnderwriterPageModule\.onTakeoffEvent/.test(main), 'no page is hard-wired in');
  ['createUnderwriterPage', 'createDealDetail'].forEach((factory) => {
    const at = main.indexOf(`${factory}({`);
    assert.notEqual(at, -1);
    assert.ok(main.slice(at, at + 1400).includes('setTakeoffHandler'), `${factory} gets the registrar`);
  });
});

test('the card gets every helper it destructures', () => {
  const ctxLine = main.slice(main.indexOf('renderUnderwriterPageModule = mod.createUnderwriterPage({'));
  const passed = new Set(ctxLine.slice(0, ctxLine.indexOf('});')).split(/[{},\n]/).map((part) => part.trim()).filter(Boolean));
  const source = readFileSync(join(root, 'src', 'underwriting', 'takeoff-card.js'), 'utf8');
  const destructured = source.slice(source.indexOf('const {'), source.indexOf('} = ctx;'))
    .replace('const {', '')
    .replace(/^\s*\/\/.*$/gm, '') // comments inside the list are prose, not keys
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    // A key with a default is the card's own setting, supplied by whoever builds it.
    .filter((part) => !part.includes('='));
  assert.ok(destructured.length > 5, `expected a context list, parsed ${destructured.length}`);
  destructured.forEach((key) => assert.ok(passed.has(key), `${key} is passed into createUnderwriterPage`));
});

test('changing contact drops the takeoff draft with the decision draft', () => {
  // Otherwise the next contact opens on the previous roof's measurements.
  assert.match(main, /state\.underwritingDraft = null;\n\s*state\.takeoffDraft = null;/);
});

test('the measurements are saved with the decision and normalized on the way back', () => {
  assert.match(main, /takeoff: takeoffStateForSave\(\) \|\| existing\?\.takeoff \|\| \{\},/);
  assert.match(main, /takeoff: input\.takeoff && typeof input\.takeoff === 'object' \? input\.takeoff : \{\},/);
  assert.match(main, /takeoff: item\.takeoff,/);
  assert.match(main, /function takeoffStateForSave\(\)/);
  // A draft belonging to another company, or to a quote, must not land on this contact's case.
  assert.match(main, /if \(!draft \|\| draft\.scope !== 'underwriter' \|\| draft\.companyId !== activeCompanyId\(\)\) return null;/);
});

test('the calculators are fetched with the cases, in the same on-demand domain', () => {
  assert.match(main, /client\.from\('underwriting_calculators'\)\.select\('\*'\)/);
  assert.match(main, /state\.underwritingCalculators = calculators\.data \|\| \[\];/);
});

// Every class the card emits has a rule behind it. A class with no rule looks correct in each
// of the assertions above and ships as an unstyled stack of controls -- which is exactly what
// happened to the relationship mapping rows.
test('every class the card uses is styled', () => {
  const { card, state } = build();
  let html = card.renderTakeoffCard('co', { measurements: SHEET });
  state.takeoffDraft.editing = true;
  html += card.renderTakeoffCard('co', null);
  const used = new Set();
  for (const match of html.matchAll(/class="([^"]+)"/g)) {
    match[1].split(/\s+/).filter(Boolean).forEach((name) => used.add(name));
  }
  const ours = [...used].filter((name) => name.startsWith('tk-') || name === 'takeoff-card');
  assert.ok(ours.length >= 15, `expected the card's own classes, found ${ours.length}`);
  ours.forEach((name) => {
    assert.ok(styles.includes(`.${name}`), `.${name} is emitted but has no CSS rule`);
  });
});

// Just enough DOM for the card to find nothing and carry on; the card repaints in place, so
// the save path walks the document on its way through.
async function withDocument(run) {
  const previous = globalThis.document;
  globalThis.document = { querySelector: () => null };
  try {
    await run();
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
}

function fakeButton(action) {
  const node = {
    dataset: { takeoffAction: action },
    matches: () => false,
    closest: (selector) => (selector === '[data-takeoff-action]' ? node : null),
  };
  return node;
}
