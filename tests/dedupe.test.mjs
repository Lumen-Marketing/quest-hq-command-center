import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeEmail, normalizePhone, normalizeName,
  findDuplicateGroups, mergeContactFields, partitionImport,
} from '../src/data/dedupe.js';

test('phone normalizes to the last 10 digits, or empty when too short', () => {
  assert.equal(normalizePhone('(602) 555-0198'), '6025550198');
  assert.equal(normalizePhone('+1 602-555-0198'), '6025550198');
  assert.equal(normalizePhone('602.555.0198'), '6025550198');
  assert.equal(normalizePhone('555-0198'), ''); // 7 digits, too weak
  assert.equal(normalizePhone(''), '');
});

test('name normalizes and refuses single-token names', () => {
  assert.equal(normalizeName('  Bob   Henderson '), 'bob henderson');
  assert.equal(normalizeName("O'Brien, María"), 'o brien mar a'.replace('  ', ' '));
  assert.equal(normalizeName('Bob'), ''); // first name only -- too weak to link
  assert.equal(normalizeName('  '), '');
});

test('same email links two contacts regardless of name spelling', () => {
  const groups = findDuplicateGroups([
    { id: '1', name: 'Bob Henderson', email: 'bob@x.com', phone: '' },
    { id: '2', name: 'Robert Henderson', email: 'BOB@x.com', phone: '' },
    { id: '3', name: 'Someone Else', email: 'else@x.com', phone: '' },
  ]);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].ids.sort(), ['1', '2']);
  assert.ok(groups[0].reasons.includes('email'));
  assert.equal(groups[0].strong, true);
});

test('same phone links even with different emails', () => {
  const groups = findDuplicateGroups([
    { id: '1', name: 'Bob H', email: 'bob@a.com', phone: '(602) 555-0198' },
    { id: '2', name: 'Bob H', email: 'bob@b.com', phone: '602-555-0198' },
  ]);
  assert.equal(groups.length, 1);
  assert.ok(groups[0].reasons.includes('phone'));
});

test('links are transitive (A~B by email, B~C by phone => one group)', () => {
  const groups = findDuplicateGroups([
    { id: 'A', name: 'A', email: 'shared@x.com', phone: '111-222-3333' },
    { id: 'B', name: 'B', email: 'shared@x.com', phone: '444-555-6666' },
    { id: 'C', name: 'C', email: 'c@x.com', phone: '444-555-6666' },
  ]);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].ids.sort(), ['A', 'B', 'C']);
});

test('a name-only match is reported as a weak group', () => {
  const groups = findDuplicateGroups([
    { id: '1', name: 'Bob Henderson', email: 'a@x.com', phone: '111-111-1111' },
    { id: '2', name: 'bob henderson', email: 'b@y.com', phone: '222-222-2222' },
  ]);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].reasons, ['name']);
  assert.equal(groups[0].strong, false);
});

test('no false positives: distinct contacts, and empty fields never link', () => {
  assert.equal(findDuplicateGroups([
    { id: '1', name: 'Alice Smith', email: 'alice@x.com', phone: '111-111-1111' },
    { id: '2', name: 'Bob Jones', email: 'bob@y.com', phone: '222-222-2222' },
    { id: '3', name: '', email: '', phone: '' },
    { id: '4', name: '', email: '', phone: '' },
  ]).length, 0);
});

test('strong groups sort before weak ones', () => {
  const groups = findDuplicateGroups([
    { id: 'n1', name: 'Weak Match', email: 'w1@x.com', phone: '111-111-1111' },
    { id: 'n2', name: 'weak match', email: 'w2@x.com', phone: '222-222-2222' },
    { id: 'e1', name: 'X', email: 'same@x.com', phone: '' },
    { id: 'e2', name: 'Y', email: 'same@x.com', phone: '' },
  ]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].strong, true); // email group first
  assert.equal(groups[1].strong, false);
});

test('partitionImport skips rows already present by email or phone', () => {
  const existing = [
    { id: '1', name: 'Bob H', email: 'bob@x.com', phone: '602-555-0198' },
    { id: '2', name: 'Ann', email: 'ann@x.com', phone: '' },
  ];
  const incoming = [
    { name: 'Bob Henderson', email: 'BOB@x.com', phone: '' },        // dup by email
    { name: 'Someone', email: '', phone: '(602) 555-0198' },          // dup by phone
    { name: 'New Person', email: 'new@x.com', phone: '480-111-2222' }, // new
  ];
  const { toImport, duplicates } = partitionImport(incoming, existing);
  assert.deepEqual(toImport.map((r) => r.name), ['New Person']);
  assert.equal(duplicates.length, 2);
});

test('partitionImport dedupes within the incoming batch itself', () => {
  const { toImport, duplicates } = partitionImport([
    { name: 'A', email: 'same@x.com', phone: '' },
    { name: 'A again', email: 'same@x.com', phone: '' },
    { name: 'B', email: 'b@x.com', phone: '' },
  ], []);
  assert.deepEqual(toImport.map((r) => r.name), ['A', 'B']);
  assert.equal(duplicates.length, 1);
});

test('partitionImport imports rows with no email/phone (nothing to match on)', () => {
  const { toImport, duplicates } = partitionImport([
    { name: 'No Contact Info', email: '', phone: '' },
    { name: 'Also None', email: '', phone: '' },
  ], [{ id: '1', name: 'X', email: 'x@x.com', phone: '111-222-3333' }]);
  assert.equal(toImport.length, 2); // can't be judged duplicates, so they come in
  assert.equal(duplicates.length, 0);
});

test('mergeContactFields fills only blank survivor fields, first non-empty wins', () => {
  const survivor = { id: 's', name: 'Bob H', email: 'bob@x.com', phone: '', title: '', location: 'Phoenix' };
  const merged = mergeContactFields(survivor, [
    { id: 'd1', name: 'Robert', email: 'other@x.com', phone: '602-555-0198', title: '', location: 'Tucson' },
    { id: 'd2', name: 'Rob', email: '', phone: '999', title: 'Owner', location: 'Mesa' },
  ], ['name', 'email', 'phone', 'title', 'location']);
  assert.equal(merged.name, 'Bob H');        // survivor kept
  assert.equal(merged.email, 'bob@x.com');   // survivor kept
  assert.equal(merged.phone, '602-555-0198'); // filled from d1 (first non-empty)
  assert.equal(merged.title, 'Owner');       // d1 blank, filled from d2
  assert.equal(merged.location, 'Phoenix');  // survivor kept
  assert.equal(merged.id, 's');              // id never changes
});
