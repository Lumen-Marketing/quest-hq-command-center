import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The bell repeated one edit five times in a row, which buried everything else. Identical
// back-to-back notifications now collapse into one row with a count. Display only: the stored
// rows and delivery are untouched.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const start = main.indexOf('function groupRepeatedNotifications(');
const group = new Function(`${main.slice(start, main.indexOf('\nfunction ', start + 1))}\nreturn groupRepeatedNotifications;`)();

const n = (id, title, body, read_at = null, type = 'record.updated') => ({ id, type, title, body, read_at });

test('back-to-back identical notifications collapse with a count, newest first', () => {
  const out = group([
    n('5', 'Updated: Adrian', 'X updated Something to bid'),
    n('4', 'Updated: Adrian', 'X updated Something to bid', '2026-09-23'),
    n('3', 'Updated: Adrian', 'X updated Something to bid'),
    n('2', 'Updated: Adrian', 'X updated Type'),
    n('1', 'New comment on Deborah', 'yo', '2026-09-23', 'message.comment'),
  ]);
  assert.deepEqual(out.map((g) => [g.id, g.repeat]), [['5', 3], ['2', 1], ['1', 1]]);
  assert.equal(out[0].read_at, null, 'unread when any copy is unread');
  assert.equal(out[2].read_at, '2026-09-23');
});

test('the same notification separated by another one is not merged', () => {
  const out = group([n('3', 'A', 'x'), n('2', 'B', 'y'), n('1', 'A', 'x')]);
  assert.equal(out.length, 3);
});

test('the bell groups before limiting and drops the empty "Inbox" label', () => {
  assert.match(main, /groupRepeatedNotifications\(notifications\)\.slice\(0, 12\)/);
  assert.match(main, /typeLabel === 'Inbox' \? '' : typeLabel/);
  assert.match(main, /class="notification-repeat"/);
});
