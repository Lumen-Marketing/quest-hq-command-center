import assert from 'node:assert/strict';
import test from 'node:test';

import { parseContactsCsv, parseCsvRows } from '../src/data/csv.js';

test('CSV parsing preserves empty cells instead of shifting later columns', () => {
  assert.deepEqual(
    parseCsvRows('Name,Email,Phone,Title\r\nJane Doe,,480-555-0101,Manager'),
    [
      ['Name', 'Email', 'Phone', 'Title'],
      ['Jane Doe', '', '480-555-0101', 'Manager'],
    ],
  );
});

test('CSV parsing handles escaped quotes, commas, newlines, and a UTF-8 BOM', () => {
  assert.deepEqual(
    parseCsvRows('\uFEFFName,Email,Notes\n"Doe, Jane",jane@example.com,"Said ""hello""\nFollow up"'),
    [
      ['Name', 'Email', 'Notes'],
      ['Doe, Jane', 'jane@example.com', 'Said "hello"\nFollow up'],
    ],
  );
});

test('contact CSV header mapping keeps blank email and phone columns aligned', () => {
  assert.deepEqual(
    parseContactsCsv('Full Name,Email Address,Mobile Phone,Job Title\nJane Doe,,480-555-0101,Sales Manager'),
    [{
      name: 'Jane Doe',
      email: '',
      phone: '480-555-0101',
      title: 'Sales Manager',
    }],
  );
});

test('contact CSV skips empty records but accepts harmless blank lines', () => {
  assert.deepEqual(
    parseContactsCsv('Name,Email\n\nAlex Smith,alex@example.com\n,missing@example.com\n'),
    [{ name: 'Alex Smith', email: 'alex@example.com', phone: '', title: '' }],
  );
});
