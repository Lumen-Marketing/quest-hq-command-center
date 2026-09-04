import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { createDataIO } from '../src/workspace/data-io.js';
import {
  COMPUTED_FIELD_TYPES, UNIMPORTABLE_FIELD_TYPES, fieldTakesCsvValue, parseChecklistCell,
  parseRatingCell, parseTagsCell,
} from '../src/workspace/csv-cells.js';

// Import named thirteen of the thirty field types and let the other seventeen fall through to
// `return s`. Right for text, email, phone and url; structurally wrong for everything holding an
// array, an id or a document. A Tags field ended up holding the string "Roofing, Urgent" where
// the renderer asks Array.isArray and gets false -- so the record read as empty while looking
// populated, and nothing failed anywhere.
//
// The round trip at the bottom is the test that would have caught it: export a record, import
// the file back, compare. It is the most obvious thing a person does with these two buttons and
// it was never asserted.

// ---- which fields a CSV cell may speak for ------------------------------------------------------

test('every field type is either handled, computed, or refused — none is forgotten', () => {
  // Read from the source rather than retyped, so a thirty-first type cannot be added without
  // this test noticing that nobody decided what a CSV cell means for it.
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const at = main.indexOf('const WB_FIELD_TYPES');
  const block = main.slice(at, main.indexOf('\n};', at));
  const types = [...block.matchAll(/^ {2}([a-z_]+): \{/gm)].map((m) => m[1]);
  assert.equal(types.length, 30, `expected the 30 field types, parsed ${types.length}`);

  const io = readFileSync(new URL('../src/workspace/data-io.js', import.meta.url), 'utf8');
  const coerce = io.slice(io.indexOf('function wbCoerceImport'), io.indexOf('function wbImportCsvPrompt'));
  const named = new Set([...coerce.matchAll(/case '([a-z_]+)'/g)].map((m) => m[1]));
  // The four that are genuinely just a string, and say so in the `default` comment.
  const plainText = new Set(['text', 'textarea', 'email', 'url', 'phone', 'location']);

  const undecided = types.filter((type) => !named.has(type)
    && !COMPUTED_FIELD_TYPES.has(type)
    && !UNIMPORTABLE_FIELD_TYPES.has(type)
    && !plainText.has(type));
  assert.deepEqual(undecided, [], `no decision recorded for: ${undecided.join(', ')}`);
});

test('a field the product computes is never written to by an import', () => {
  // `calculation` was already refused for this reason. Its four siblings are computed the same
  // way and were being written to, which is how an autonumber ends up holding the string "7".
  for (const type of ['calculation', 'rollup', 'autonumber', 'created_time', 'updated_time']) {
    assert.equal(fieldTakesCsvValue(type), false, `${type} is computed`);
  }
});

test('a field holding an id or a document is refused, not filled with its own display text', () => {
  // The export prints the NAME of a linked contact, and a name is not a link. Refusing costs
  // nothing: an import only ever CREATES records, so there is no existing link being cleared.
  for (const type of ['relationship', 'company_contact', 'file', 'image', 'sheet', 'form', 'button']) {
    assert.equal(fieldTakesCsvValue(type), false, `${type} cannot come from one CSV cell`);
  }
  for (const type of ['text', 'number', 'tags', 'checklist', 'rating', 'status', 'date']) {
    assert.equal(fieldTakesCsvValue(type), true, `${type} can`);
  }
});

// ---- the parsers ---------------------------------------------------------------------------------

const OPTIONS = [{ id: 'o1', label: 'Roofing' }, { id: 'o2', label: 'Urgent' }, { id: 'o3', label: 'Gutters' }];

test('tags come back as the ids the field stores, matched on the labels the file holds', () => {
  assert.deepEqual(parseTagsCell('Roofing, Urgent', OPTIONS), ['o1', 'o2']);
  assert.deepEqual(parseTagsCell('urgent,ROOFING', OPTIONS), ['o2', 'o1'], 'nobody types to match');
  assert.deepEqual(parseTagsCell('o3', OPTIONS), ['o3'], 'an id is accepted too');
  assert.deepEqual(parseTagsCell('Roofing, Roofing', OPTIONS), ['o1'], 'and not twice');
});

test('a tag the field does not offer is dropped rather than invented', () => {
  // Importing records is not the moment to add an option to a field, and a silent new option is
  // worse than a missing tag somebody can see is missing.
  assert.deepEqual(parseTagsCell('Roofing, Plumbing', OPTIONS), ['o1']);
  assert.deepEqual(parseTagsCell('', OPTIONS), []);
  assert.deepEqual(parseTagsCell('Roofing', null), [], 'a field with no options can hold none');
});

test('a checklist comes back as its steps, ticks and all', () => {
  const steps = parseChecklistCell('1/2 (50%): [x] Measure; [ ] Quote', () => 'id');
  assert.deepEqual(steps, [
    { id: 'id', label: 'Measure', done: true },
    { id: 'id', label: 'Quote', done: false },
  ]);
});

test('the counted prefix is a summary of the steps, so it is not read back as one', () => {
  assert.deepEqual(parseChecklistCell('3/3 (100%): [x] A', () => '1').map((s) => s.label), ['A']);
  assert.deepEqual(parseChecklistCell('[x] A; [ ] B', () => '1').map((s) => s.label), ['A', 'B']);
});

test('a step somebody typed without a box is an unticked step', () => {
  // A person adding a line in a spreadsheet should not have to know the notation.
  assert.deepEqual(parseChecklistCell('Measure, Quote', () => '1'), [
    { id: '1', label: 'Measure', done: false },
    { id: '1', label: 'Quote', done: false },
  ]);
  assert.deepEqual(parseChecklistCell('', () => '1'), []);
});

test('a rating is a whole number, and never more than the field offers', () => {
  assert.equal(parseRatingCell('4', { config: { max: 5 } }), 4);
  assert.equal(parseRatingCell('4.6', { config: { max: 5 } }), 5, 'rounded, because half a star is not a value');
  assert.equal(parseRatingCell('9', { config: { max: 5 } }), 5);
  assert.equal(parseRatingCell('0', { config: {} }), '');
  assert.equal(parseRatingCell('not a number', { config: {} }), '');
});

// ---- the round trip ------------------------------------------------------------------------------

const FIELDS = () => ([
  { id: 'f1', label: 'Name', type: 'text', config: {} },
  { id: 'f2', label: 'Trades', type: 'tags', config: { options: OPTIONS } },
  { id: 'f3', label: 'Steps', type: 'checklist', config: {} },
  { id: 'f4', label: 'Score', type: 'rating', config: { max: 5 } },
  { id: 'f5', label: 'Customer', type: 'company_contact', config: {} },
  { id: 'f6', label: 'Ref', type: 'autonumber', config: {} },
]);

const ORIGINAL = {
  id: 'i1',
  values: {
    f1: 'Acme Roofing',
    f2: ['o1', 'o2'],
    f3: [{ id: 'c1', label: 'Measure', done: true }, { id: 'c2', label: 'Quote', done: false }],
    f4: 4,
    f5: 'contact-uuid-123',
    f6: 7,
  },
};

/** Stands in for main.js's renderer: what a person actually SEES in the cell. */
const plain = (_c, _w, _a, field, raw) => {
  if (field.type === 'tags') {
    return (Array.isArray(raw) ? raw : []).map((id) => OPTIONS.find((o) => o.id === id)?.label ?? id).join(', ');
  }
  if (field.type === 'checklist') {
    const list = Array.isArray(raw) ? raw : [];
    const done = list.filter((s) => s.done).length;
    return `${done}/${list.length} (${Math.round((done / list.length) * 100)}%): ${list.map((s) => `${s.done ? '[x]' : '[ ]'} ${s.label}`).join('; ')}`;
  }
  if (field.type === 'company_contact') return 'Jane Doe';
  return String(raw ?? '');
};

function roundTrip() {
  const app = { id: 'app-1', name: 'demo', fields: FIELDS(), items: [ORIGINAL], automations: [] };
  const calls = { toasts: [] };
  const io = createDataIO({
    h: (v) => String(v ?? ''),
    showToast: (m) => calls.toasts.push(m),
    render: () => {},
    companyName: (id) => String(id),
    wbFind: () => ({ workspace: { id: 'ws-1', activity: [] }, app }),
    wbPlainVal: plain,
    wbSave: () => {},
    wbUid: () => 'minted',
    wbLogActivity: () => {},
    wbMembers: () => [],
    wbReportContext: () => ({}),
    wbLoadReports: () => Promise.resolve({}),
    wbAssignAutoNumbers: () => {},
    loadedReports: () => null,
    clone: (v) => JSON.parse(JSON.stringify(v)),
    downloadText: (_n, text) => { calls.csv = text; },
    guardUpload: () => Promise.resolve(true),
    activeSession: () => ({ profile: { id: 'p1' } }),
  });
  io.wbExportCsv('acme', 'ws-1', 'app-1');
  io.wbImportCsvText('acme', 'ws-1', 'app-1', calls.csv, 'demo.csv');
  return { app, calls, back: app.items.find((item) => item.id !== 'i1') };
}

test('a record exported to CSV and imported back keeps what a cell can carry', () => {
  const { back } = roundTrip();
  assert.equal(back.values.f1, 'Acme Roofing');
  assert.deepEqual(back.values.f2, ['o1', 'o2'], 'tags stay an array of ids, not a joined string');
  assert.deepEqual(back.values.f3, [
    { id: 'minted', label: 'Measure', done: true },
    { id: 'minted', label: 'Quote', done: false },
  ], 'the steps and their ticks survive; the step ids are this record\'s own');
  assert.equal(back.values.f4, 4, 'a rating is a number, not the string "4"');
});

test('and refuses the two it cannot carry, rather than storing something that looks right', () => {
  const { back } = roundTrip();
  assert.equal(back.values.f5, undefined, '"Jane Doe" is not a contact id');
  assert.equal(back.values.f6, undefined, 'an autonumber is the app\'s to assign');
});

test('the toast names the columns a CSV cannot fill in', () => {
  // "Customer was skipped" is what somebody needs to hear to go and look at that column. Hiding
  // it inside a count of unmatched columns would blame the header, which was spelled correctly.
  const { calls } = roundTrip();
  const imported = calls.toasts.at(-1);
  assert.match(imported, /"Customer"/);
  assert.match(imported, /"Ref"/);
  assert.match(imported, /a CSV cannot fill in/);
});
