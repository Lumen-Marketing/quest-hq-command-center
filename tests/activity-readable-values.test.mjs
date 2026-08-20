import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { readableValue } from '../src/workspace/record-activity.js';

// "can you make it simple not this its shows so many like code, link etc"
//
// The first fix changed what gets WRITTEN. It could not change what was already in the feed:
// an activity entry keeps the string it was logged with, and those entries are the history --
// the part nobody wants to lose to a migration.
//
// So the reading is fixed too. Anything already stored is made readable on the way to the screen.

const panel = readFileSync(new URL('../src/workspace/record-panel.js', import.meta.url), 'utf8');

// The value from the reported feed, near enough: two files, each with a signed URL and a token.
const STORED = JSON.stringify([
  {
    name: 'consultant.webp',
    url: 'https://rqundirizvojpzhljtdn.supabase.co/storage/v1/object/sign/quest-roofing-az/'
      + 'workspace/3aca1fc9-5032-4203-8ff1-4b61cbe316a1-consultant.webp?token=eyJhbGciOiJIUzI1NiJ9.SECRET',
  },
  {
    name: 'APN 300-06-027A FLOOR PLAN-A102-1.pdf',
    url: 'https://rqundirizvojpzhljtdn.supabase.co/storage/v1/object/sign/quest-roofing-az/'
      + 'workspace/dea377cd-0332-4c31-8a85-65aa725cc6f0-apn-300.pdf?token=eyJhbGciOiJIUzI1NiJ9.SECRET',
  },
]);

test('a stored list of files reads as its names', () => {
  assert.equal(readableValue(STORED), 'consultant.webp, APN 300-06-027A FLOOR PLAN-A102-1.pdf');
});

test('and never as a URL, however it was stored', () => {
  // These are SIGNED links. The feed is on screen for anyone who can read the workspace.
  const out = readableValue(STORED);
  assert.ok(!out.includes('http'), 'no link');
  assert.ok(!out.includes('token'), 'no token');
  assert.ok(!out.includes('supabase'), 'nothing about where it is kept');
});

test('one file, stored as an object, reads as its name', () => {
  assert.equal(readableValue('{"name":"plan.pdf","url":"https://x/y"}'), 'plan.pdf');
});

test('a file with no name falls back to the one in the link', () => {
  // Old uploads stored a URL and nothing else.
  assert.equal(
    readableValue('[{"url":"https://x/f/8f14e45f-ea1a-4e5c-9c1e-1c1c1c1c1c1c-site%20plan.pdf"}]'),
    'site plan.pdf',
  );
});

test('a bare storage link reads as the file at the end of it', () => {
  assert.equal(
    readableValue('https://x/f/8f14e45f-ea1a-4e5c-9c1e-1c1c1c1c1c1c-roof%20photo.jpg?token=SECRET'),
    'roof photo.jpg',
  );
});

test('ordinary values are left exactly as they are', () => {
  // The overwhelming majority of what this sees is a name, a stage or a number.
  assert.equal(readableValue('Won'), 'Won');
  assert.equal(readableValue('$4,200'), '$4,200');
  assert.equal(readableValue(''), '');
  assert.equal(readableValue(null), '');
  assert.equal(readableValue('6/9 (67%): [x] Design; [ ] Test'), '6/9 (67%): [x] Design; [ ] Test');
});

test('something long and unrecognised is bounded rather than left to run', () => {
  // A receipt is a chip on one line. Whatever this turns out to be, it cannot be a paragraph.
  const long = 'x'.repeat(400);
  const out = readableValue(long);
  assert.equal(out.length, 120);
  assert.ok(out.endsWith('…'));
});

test('JSON that is not a file list is not mangled into one', () => {
  const out = readableValue('{"hello":"world"}');
  assert.equal(out, '{"hello":"world"}', 'left alone rather than guessed at');
});

test('the receipt reads both halves through it', () => {
  // Not just the new value: "changed FROM this" carried the same blob.
  assert.match(panel, /const from = readableValue\(change\.from\);/);
  assert.match(panel, /const to = readableValue\(change\.to\);/);
});
