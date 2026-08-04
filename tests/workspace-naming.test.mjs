import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { addRecordLabel, newRecordLabel, singularize } from '../src/workspace/naming.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  + readFileSync(new URL('../src/workspace/builder-modal.js', import.meta.url), 'utf8');

test('the common case: an app named for the collection, one record out of it', () => {
  assert.equal(singularize('Jobs'), 'Job');
  assert.equal(singularize('Safety Incidents'), 'Safety Incident');
  assert.equal(singularize('Vendors'), 'Vendor');
});

test('words that only look plural keep their s', () => {
  // Stripping the trailing s here is the classic bug: "Add Clas", "Add Addres".
  for (const word of ['Class', 'Address', 'Progress', 'Status']) {
    assert.equal(singularize(word), word);
  }
});

test('the -es and -ies endings that actually turn up', () => {
  assert.equal(singularize('Companies'), 'Company');
  assert.equal(singularize('Properties'), 'Property');
  assert.equal(singularize('Activities'), 'Activity');
  assert.equal(singularize('Addresses'), 'Address');
  assert.equal(singularize('Boxes'), 'Box');
  assert.equal(singularize('Batches'), 'Batch');
});

test('-ies is ambiguous and the rule says which way it leans', () => {
  // -ies is the plural of -y (Company) and also a plain -s on a word ending -ie (Movie).
  // No rule separates them. It leans -y because that is what app names look like; the
  // record-name setting is the way out for the other kind.
  assert.equal(singularize('Movies'), 'Movy', 'documented miss, not an oversight');
  assert.equal(addRecordLabel({ name: 'Movies', recordName: 'Movie' }), 'Add Movie');
});

test('a name that is already singular is left alone', () => {
  // "Add Equipment Log" reads fine. A wrong guess looks broken, so doing nothing wins.
  for (const word of ['Equipment Log', 'Inventory', 'Payroll', '']) {
    assert.equal(singularize(word), word);
  }
});

test('the labels read as a sentence', () => {
  assert.equal(addRecordLabel({ name: 'Jobs' }), 'Add Job');
  assert.equal(newRecordLabel({ name: 'Safety Incidents' }), 'New Safety Incident');
});

test('a nameless app still gets a usable button rather than "Add "', () => {
  assert.equal(addRecordLabel({}), 'Add item');
  assert.equal(addRecordLabel(null), 'Add item');
  assert.equal(newRecordLabel({ name: '  ' }), 'New item');
});

// --- wiring ------------------------------------------------------------------------------

test('every create button uses the label, not a hardcoded "Add item"', () => {
  assert.ok(!/>Add item</.test(main), 'a hardcoded label would drift from the setting');
  assert.match(main, /data-add-item><i class="ti ti-plus"><\/i>\$\{h\(addRecordLabel\(app\)\)\}/);
  assert.match(main, /\$\{m\.editId \? 'Save' : h\(addRecordLabel\(app\)\)\}/);
});

test('the old naive singulariser is gone from main.js', () => {
  // It turned Class into Clas and Addresses into Addresse.
  assert.ok(!/replace\(\/s\$\/, ''\)/.test(main));
});

test('an app can override what one record is called', () => {
  // No rule gets People -> Person or Equipment -> Piece of equipment. The setting is the
  // escape hatch; blank means follow the app name.
  assert.match(main, /recordName: app\.recordName \|\| '',/, 'it has to persist');
  assert.match(main, /id="wbSetRecordName"/);
  assert.match(main, /app\.recordName = \(document\.getElementById\('wbSetRecordName'\)\?\.value \|\| ''\)\.trim\(\);/);
  assert.match(main, /placeholder="\$\{h\(singularize\(app\.name\)\)\}"/, 'the placeholder shows what it would say anyway');
});

test('the override wins over the derived name', () => {
  assert.equal(addRecordLabel({ name: 'People', recordName: 'Person' }), 'Add Person');
  assert.equal(newRecordLabel({ name: 'People', recordName: 'Person' }), 'New Person');
});
