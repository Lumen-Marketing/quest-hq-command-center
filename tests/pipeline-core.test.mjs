import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addStage, boardColumns, canDropOn, moveStage, pipelineField, pipelineFields,
  recolorStage, removeStage, renameStage, stageCounts, stagesOf, summaryField,
} from '../src/workspace/pipeline-core.js';

const field = () => ({
  id: 'f-stage', label: 'Stage', type: 'status',
  config: { options: [
    { id: 'lead', label: 'Lead', color: '#f00' },
    { id: 'quoted', label: 'Quoted', color: '#0f0' },
    { id: 'won', label: 'Won', color: '#00f' },
  ] },
});
const money = { id: 'f-amt', label: 'Value', type: 'money', config: { currency: '$' } };
const app = () => ({
  fields: [field(), money, { id: 'f-cat', label: 'Type', type: 'category', config: { options: [] } }],
  items: [
    { id: 'a', values: { 'f-stage': 'lead', 'f-amt': 100 } },
    { id: 'b', values: { 'f-stage': 'won', 'f-amt': 900 } },
    { id: 'c', values: { 'f-stage': 'won', 'f-amt': 50 } },
  ],
});

// --- choosing the pipeline --------------------------------------------------------

test('only status fields drive a board, not categories', () => {
  // A category labels a record; a status is a sequence. Offering both would put a board
  // column order on a field that has no meaningful order.
  assert.deepEqual(pipelineFields(app()).map((f) => f.id), ['f-stage']);
});

test('a deleted pipeline field falls back instead of blanking the board', () => {
  assert.equal(pipelineField(app(), 'f-gone').id, 'f-stage');
  assert.equal(pipelineField(app(), 'f-stage').id, 'f-stage');
  assert.equal(pipelineField({ fields: [money] }), null);
});

test('column totals prefer money, and stay absent when there is nothing to total', () => {
  assert.equal(summaryField(app()).id, 'f-amt');
  assert.equal(summaryField({ fields: [{ id: 'n', type: 'number' }, money] }).id, 'f-amt', 'money wins over number');
  assert.equal(summaryField({ fields: [field()] }), null);
});

// --- grouping ---------------------------------------------------------------------

test('columns follow stage order, not the order records were created', () => {
  const cols = boardColumns(app().items, field(), null);
  assert.deepEqual(cols.map((c) => c.id), ['lead', 'quoted', 'won']);
  assert.deepEqual(cols.map((c) => c.count), [1, 0, 2], 'an empty stage still gets a column');
});

test('a record on a deleted stage surfaces instead of vanishing', () => {
  // The failure this prevents: the board shows 2 records, the footer says 3, and nobody
  // can find the third one.
  const rows = [...app().items, { id: 'd', values: { 'f-stage': 'ghost' } }];
  const cols = boardColumns(rows, field(), null);
  assert.equal(cols[0].id, null);
  assert.deepEqual(cols[0].items.map((i) => i.id), ['d']);
  assert.equal(cols.reduce((n, c) => n + c.count, 0), rows.length, 'every record must appear exactly once');
});

test('records with no stage at all collect in the same leading column', () => {
  const rows = [{ id: 'x', values: {} }, { id: 'y', values: { 'f-stage': '' } }, { id: 'z', values: { 'f-stage': null } }];
  const cols = boardColumns(rows, field(), null);
  assert.deepEqual(cols[0].items.map((i) => i.id), ['x', 'y', 'z']);
});

test('the unplaced column is hidden when there is nothing in it', () => {
  assert.equal(boardColumns(app().items, field(), null)[0].id, 'lead');
});

test('column totals sum the chosen field', () => {
  const cols = boardColumns(app().items, field(), money);
  assert.deepEqual(cols.map((c) => c.total), [100, 0, 950]);
});

test('with no numeric field there is no total line, rather than a row of zeroes', () => {
  assert.deepEqual(boardColumns(app().items, field(), null).map((c) => c.total), [null, null, null]);
});

test('unparseable values count as zero rather than poisoning the column total', () => {
  const rows = [{ id: 'a', values: { 'f-stage': 'lead', 'f-amt': 'n/a' } }, { id: 'b', values: { 'f-stage': 'lead', 'f-amt': 5 } }];
  assert.equal(boardColumns(rows, field(), money)[0].total, 5);
});

// --- dropping ---------------------------------------------------------------------

test('a drop is refused onto a stage that no longer exists', () => {
  // Two people editing at once: one deletes a stage while the other drags onto it.
  assert.equal(canDropOn(field(), 'won'), true);
  assert.equal(canDropOn(field(), 'ghost'), false);
  assert.equal(canDropOn(field(), null), true, 'clearing a stage is always allowed');
});

// --- editing stages ---------------------------------------------------------------

test('adding a stage appends it and never collides with an existing id', () => {
  const next = addStage(field(), 'Scheduled', '#abc', () => 'new-1');
  assert.deepEqual(next.map((s) => s.label), ['Lead', 'Quoted', 'Won', 'Scheduled']);
  assert.equal(next[3].id, 'new-1');
});

test('an unnamed stage still gets a usable label', () => {
  assert.equal(addStage(field(), '   ', '', () => 'x')[3].label, 'Stage 4');
});

test('renaming to blank keeps the old name rather than making a nameless column', () => {
  assert.equal(renameStage(field(), 'lead', '  ').find((s) => s.id === 'lead').label, 'Lead');
  assert.equal(renameStage(field(), 'lead', 'New lead').find((s) => s.id === 'lead').label, 'New lead');
});

test('renaming and recoloring keep the id, so records stay on their stage', () => {
  // Regenerating the id here would strand every record that referenced it.
  const renamed = renameStage(field(), 'lead', 'Enquiry');
  assert.equal(renamed[0].id, 'lead');
  assert.equal(recolorStage(field(), 'lead', '#123456')[0].id, 'lead');
  assert.equal(recolorStage(field(), 'lead', '#123456')[0].color, '#123456');
});

test('reordering moves one place and refuses to run off either end', () => {
  assert.deepEqual(moveStage(field(), 'quoted', -1).map((s) => s.id), ['quoted', 'lead', 'won']);
  assert.deepEqual(moveStage(field(), 'quoted', 1).map((s) => s.id), ['lead', 'won', 'quoted']);
  assert.deepEqual(moveStage(field(), 'lead', -1).map((s) => s.id), ['lead', 'quoted', 'won'], 'no wrap to the end');
  assert.deepEqual(moveStage(field(), 'won', 1).map((s) => s.id), ['lead', 'quoted', 'won'], 'no wrap to the start');
});

test('editing returns a new array, leaving the field untouched until it is saved', () => {
  const f = field();
  addStage(f, 'X', '#000', () => 'x');
  moveStage(f, 'lead', 1);
  assert.deepEqual(stagesOf(f).map((s) => s.id), ['lead', 'quoted', 'won']);
});

// --- deleting, which is where records get lost ------------------------------------

test('deleting a stage reports the records standing on it', () => {
  const r = removeStage(field(), 'won', app().items, 'lead');
  assert.deepEqual(r.options.map((s) => s.id), ['lead', 'quoted']);
  assert.deepEqual(r.moved, ['b', 'c']);
  assert.equal(r.reassignTo, 'lead');
});

test('reassigning to a stage that is also gone clears instead of stranding records', () => {
  assert.equal(removeStage(field(), 'won', app().items, 'won').reassignTo, null, 'cannot reassign to itself');
  assert.equal(removeStage(field(), 'won', app().items, 'ghost').reassignTo, null);
});

test('deleting an empty stage moves nothing', () => {
  assert.deepEqual(removeStage(field(), 'quoted', app().items, 'lead').moved, []);
});

test('stage counts are shown before deleting, so the cost is visible', () => {
  const counts = stageCounts(field(), app().items);
  assert.equal(counts.get('won'), 2);
  assert.equal(counts.get('quoted'), 0);
  assert.equal(counts.has('ghost'), false);
});
