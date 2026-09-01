import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activeSummaries, computeSummary, formatSummary, functionsForType, isNumericType,
  summaryLabel,
} from '../src/workspace/summary.js';

// A list answers "which ones". It did not answer "how many, how much, how big on average", so
// the answer was export to CSV and total it elsewhere -- which is also how a number stops
// matching the list it came from.

const sum = (values) => computeSummary({ fn: 'sum' }, values);

test('a text column can be counted but not summed', () => {
  // Offering Sum on a text column is an invitation to a blank answer.
  const text = functionsForType('text').map((fn) => fn.id);
  assert.ok(text.includes('count') && text.includes('countIf') && text.includes('unique'));
  assert.ok(!text.includes('sum') && !text.includes('average'));

  const number = functionsForType('number').map((fn) => fn.id);
  assert.ok(number.includes('sum') && number.includes('median') && number.includes('variance'));
  assert.ok(number.includes('count'), 'and every field can still be counted');
});

test('the numeric types are the ones that hold numbers', () => {
  for (const type of ['number', 'money', 'duration', 'rating', 'progress', 'calculation', 'rollup', 'autonumber']) {
    assert.ok(isNumericType(type), `${type} should be numeric`);
  }
  for (const type of ['text', 'category', 'company_contact', 'location', 'date', 'checkbox']) {
    assert.ok(!isNumericType(type), `${type} should not be numeric`);
  }
});

test('counting counts rows; filled and empty split them', () => {
  const rows = [1, '', 3, null, 0];
  assert.equal(computeSummary({ fn: 'count' }, rows), 5, 'count is every row, blank or not');
  assert.equal(computeSummary({ fn: 'filled' }, rows), 3, 'zero is a value');
  assert.equal(computeSummary({ fn: 'empty' }, rows), 2);
});

test('a blank is not a zero', () => {
  // Averaging blanks in as zeroes moves the answer, which is the whole reason to drop them.
  assert.equal(computeSummary({ fn: 'average' }, [10, '', 20]), 15);
  assert.equal(sum([10, null, 20]), 30);
});

test('the arithmetic', () => {
  const values = [2, 4, 4, 4, 5, 5, 7, 9];
  assert.equal(sum(values), 40);
  assert.equal(computeSummary({ fn: 'average' }, values), 5);
  assert.equal(computeSummary({ fn: 'median' }, values), 4.5, 'even count averages the middle two');
  assert.equal(computeSummary({ fn: 'median' }, [3, 1, 2]), 2, 'and it sorts first');
  assert.equal(computeSummary({ fn: 'mode' }, values), 4);
  assert.equal(computeSummary({ fn: 'min' }, values), 2);
  assert.equal(computeSummary({ fn: 'max' }, values), 9);
  assert.equal(computeSummary({ fn: 'range' }, values), 7);
  assert.equal(computeSummary({ fn: 'variance' }, values), 4, 'population variance');
  assert.equal(computeSummary({ fn: 'stdev' }, values), 2);
});

test('variance of a single row is zero, not an error', () => {
  assert.equal(computeSummary({ fn: 'variance' }, [7]), 0);
  assert.equal(computeSummary({ fn: 'stdev' }, [7]), 0);
});

test('numbers written the way people type them still count', () => {
  assert.equal(sum(['1,200', '300']), 1500);
  assert.equal(sum(['12', 'not a number', '3']), 15, 'and nonsense is dropped rather than NaN');
});

test('nothing to say is a dash, which is not the same as zero', () => {
  // No rows is a different answer from rows that add to nothing.
  assert.equal(computeSummary({ fn: 'sum' }, []), null);
  assert.equal(computeSummary({ fn: 'average' }, ['', null]), null);
  assert.equal(formatSummary(null), '—');
  assert.equal(computeSummary({ fn: 'sum' }, [0, 0]), 0);
  assert.equal(formatSummary(0), '0');
});

test('count if is asked in the words on screen, not the stored id', () => {
  // A category cell holds an option id. Nobody has seen that id; they have seen "Male".
  const rows = ['opt-m', 'opt-f', 'opt-m', ''];
  const display = (value) => ({ 'opt-m': 'Male', 'opt-f': 'Female' })[value] || '';
  assert.equal(computeSummary({ fn: 'countIf', value: 'Male' }, rows, { display }), 2);
  assert.equal(computeSummary({ fn: 'countIf', value: 'female' }, rows, { display }), 1, 'case does not matter');
  assert.equal(computeSummary({ fn: 'countIf', value: '  Male ' }, rows, { display }), 2, 'nor does stray spacing');
  assert.equal(computeSummary({ fn: 'countIf', value: 'Other' }, rows, { display }), 0);
});

test('count if with nothing to match against says nothing', () => {
  assert.equal(computeSummary({ fn: 'countIf', value: '' }, ['a', 'b']), null);
});

test('a row tagged three things counts for each of them', () => {
  const rows = [['Roofing', 'Urgent'], ['Siding'], []];
  assert.equal(computeSummary({ fn: 'countIf', value: 'Roofing' }, rows, { display: (v) => v }), 1);
  assert.equal(computeSummary({ fn: 'countIf', value: 'Urgent' }, rows, { display: (v) => v }), 1);
  assert.equal(computeSummary({ fn: 'filled' }, rows), 2, 'an empty tag list is empty');
});

test('unique counts distinct values, not rows', () => {
  const rows = ['Phoenix', 'phoenix', 'Tucson', ''];
  assert.equal(computeSummary({ fn: 'unique' }, rows, { display: (v) => v }), 2);
});

test('the label says what was counted', () => {
  assert.equal(summaryLabel({ fn: 'sum' }), 'Sum');
  assert.equal(summaryLabel({ fn: 'countIf', value: 'Male' }), 'Count if Male');
  assert.equal(summaryLabel({ fn: 'countIf', value: '' }), 'Count if…');
  assert.equal(summaryLabel({ fn: 'none' }), '');
  assert.equal(summaryLabel(undefined), '');
});

test('long decimals are trimmed to something a person reads', () => {
  assert.equal(formatSummary(1 / 3), '0.33');
  assert.equal(formatSummary(12), '12', 'and whole numbers stay whole');
  assert.equal(formatSummary(Infinity), '—');
});

test('only the columns actually asked a question appear', () => {
  const fields = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const summary = { a: { fn: 'sum' }, b: { fn: 'none' } };
  assert.deepEqual(activeSummaries(fields, summary).map((one) => one.field.id), ['a']);
  assert.deepEqual(activeSummaries(fields, null), [], 'and none at all is fine');
  assert.deepEqual(activeSummaries(fields, {}), []);
});
