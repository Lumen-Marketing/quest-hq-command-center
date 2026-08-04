import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  COLLECTION_FIELD_PREFIX, metricValue, numberFields, parseTotalField, totalableFields,
} from '../src/workspace/dashboard-widgets.js';

// A Jobs app whose money lives on the sub-items, not on the record — which is what left the
// number card saying "No number fields yet".
const APP = {
  id: 'a1',
  fields: [{ id: 'f1', label: 'Name', type: 'text' }],
  collections: [
    { id: 'k1', name: 'Dailies', fields: [{ id: 'kf1', label: 'Hours', type: 'number' }, { id: 'kf2', label: 'Crew', type: 'text' }] },
    { id: 'k2', name: 'Costs', fields: [{ id: 'kf3', label: 'Amount', type: 'money' }] },
  ],
  items: [
    { id: 'i1', values: {}, children: [
      { id: 'c1', collection: 'k1', values: { kf1: 8 } },
      { id: 'c2', collection: 'k1', values: { kf1: 6 } },
      { id: 'c3', collection: 'k2', values: { kf3: 250 } },
    ] },
    { id: 'i2', values: {}, children: [{ id: 'c4', collection: 'k1', values: { kf1: 4 } }] },
    { id: 'i3', values: {} },
  ],
};

test('an app with no number field of its own still has something to total', () => {
  // This is the reported state: the record has only text, so the old list was empty.
  assert.deepEqual(numberFields(APP), []);
  assert.deepEqual(totalableFields(APP).map((f) => f.label), ['Dailies · Hours', 'Costs · Amount']);
});

test('the app own fields lead, then the lists', () => {
  const withOwn = { ...APP, fields: [...APP.fields, { id: 'f2', label: 'Value', type: 'money' }] };
  assert.deepEqual(totalableFields(withOwn).map((f) => f.label), ['Value', 'Dailies · Hours', 'Costs · Amount']);
});

test('a sub-item field is addressed by a composite key, not a bare id', () => {
  // Collection fields and app fields are separate id spaces; a bare id could collide.
  const [hours] = totalableFields(APP);
  assert.equal(hours.id, `${COLLECTION_FIELD_PREFIX}k1:kf1`);
  assert.deepEqual(parseTotalField(hours.id), { collectionId: 'k1', fieldId: 'kf1' });
  assert.deepEqual(parseTotalField('f2'), { collectionId: '', fieldId: 'f2' }, 'a plain field still reads');
  assert.deepEqual(parseTotalField(''), { collectionId: '', fieldId: '' });
});

test('it totals that field across every sub-item of every record', () => {
  const out = metricValue(APP, { metric: 'sum', fieldId: `${COLLECTION_FIELD_PREFIX}k1:kf1` });
  assert.equal(out.value, 18, '8 + 6 + 4');
  assert.equal(out.label, 'Dailies · Hours');
  assert.match(out.caption, /across 3 sub-items/);
});

test('it counts only the list asked for', () => {
  const out = metricValue(APP, { metric: 'sum', fieldId: `${COLLECTION_FIELD_PREFIX}k2:kf3` });
  assert.equal(out.value, 250);
  assert.match(out.caption, /across 1 sub-item$/, 'and says one, not 1 sub-items');
});

test('a list nobody has filled in reads as zero across zero, not as a bare zero', () => {
  const empty = { ...APP, items: [{ id: 'x', values: {}, children: [] }] };
  const out = metricValue(empty, { metric: 'sum', fieldId: `${COLLECTION_FIELD_PREFIX}k1:kf1` });
  assert.equal(out.value, 0);
  assert.match(out.caption, /across 0 sub-items/);
});

test('totalling a record field is unchanged', () => {
  const app = { fields: [{ id: 'f2', label: 'Value', type: 'money' }], items: [{ id: 'i', values: { f2: 100 } }, { id: 'j', values: { f2: 50 } }] };
  const out = metricValue(app, { metric: 'sum', fieldId: 'f2' });
  assert.equal(out.value, 150);
  assert.equal(out.label, 'Value');
  assert.match(out.caption, /across 2 records/);
});

test('junk values and missing lists do not poison the total', () => {
  const messy = { ...APP, items: [{ id: 'i', values: {}, children: [
    { id: 'a', collection: 'k1', values: { kf1: 'abc' } },
    { id: 'b', collection: 'k1', values: {} },
    null,
    { id: 'c', collection: 'gone', values: { kf1: 999 } },
  ] }] };
  const out = metricValue(messy, { metric: 'sum', fieldId: `${COLLECTION_FIELD_PREFIX}k1:kf1` });
  assert.equal(out.value, 0);
  assert.match(out.caption, /across 2 sub-items/, 'the other list is not counted');
});

test('the card settings are offered the sub-item fields', () => {
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(main, /numberFields: mod\.totalableFields\(app\),/);
});
