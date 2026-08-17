import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Registering a field type takes TWO lists, and only one of them draws the palette.
//
// The Form field was added to WB_FIELD_TYPES and shipped invisible: every lookup resolved it, the
// config panel and the record renderer both worked, and it appeared in no palette because that is
// built from WB_FIELD_ORDER. "I can't see the form field" was the only symptom, and nothing in the
// suite noticed.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');

const order = (main.match(/const WB_FIELD_ORDER = \[([^\]]*)\]/)?.[1] || '')
  .match(/'([a-z_]+)'/g).map((quoted) => quoted.replace(/'/g, ''));
const typesAt = main.indexOf('const WB_FIELD_TYPES = {');
// eslint-disable-next-line no-eval
const types = eval(`(${main.slice(typesAt + 'const WB_FIELD_TYPES = '.length, main.indexOf('\n};', typesAt) + 2)})`);

test('every registered field type has a place in the palette', () => {
  const missing = Object.keys(types).filter((type) => !order.includes(type));
  assert.deepEqual(missing, [], `registered but invisible: ${missing.join(', ')}`);
});

test('the palette offers nothing that is not a real type', () => {
  const ghosts = order.filter((type) => !types[type]);
  assert.deepEqual(ghosts, [], `in the palette with no definition: ${ghosts.join(', ')}`);
});

test('the Form field is one of them', () => {
  assert.ok(types.form, 'the Form field is not registered');
  assert.ok(order.includes('form'), 'the Form field is not in the palette');
  // Its own type, not a second Sheet: the two sit beside each other and must stay distinct.
  assert.notEqual(types.form.icon, types.sheet.icon);
  assert.match(types.form.desc, /design|print|document/i);
});
