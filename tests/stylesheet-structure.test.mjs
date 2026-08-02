import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// Strip comments once: a comment between a trailing comma and the next rule is exactly
// what hides this defect from a human reading the file.
const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');

test('the sidebar hides its labels when collapsed, and nothing else', () => {
  // The bug this replaces: in 4cc10a4 a rule was inserted between this selector list and
  // its `{ display: none; }`. A trailing comma is not a syntax error, so the four
  // selectors silently joined the next rule — `.client-portal-public.open` — and every
  // nav label became `position: fixed; inset: 0` filled with the page background. The
  // result was a stack of full-screen panels covering the app on every collapse.
  const match = bare.match(
    /\.sidebar-collapsed \.side-item span\s*(,|\{)([^}]*)\}/,
  );
  assert.ok(match, 'the collapsed-label rule should exist');
  assert.equal(match[1], '{', 'the selector list must terminate in its own block, not a comma');
  assert.match(match[2], /display:\s*none/, 'collapsing should hide the label');
  assert.ok(!/position:\s*fixed/.test(match[2]), 'a nav label must never become a full-screen panel');
});

// A selector list that ends in a comma silently absorbs whatever rule follows. CSS
// parsers accept it, browsers apply it, and reading the file does not reveal it because
// the two rules usually have a comment between them.
test('no selector list is left dangling on a trailing comma', () => {
  const offenders = [];
  const lines = bare.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line.endsWith(',')) continue;
    // Walk forward past blank lines. The next meaningful line should be another selector
    // or the opening of a block — never a gap wide enough to have swallowed a rule.
    let j = i + 1;
    let blanks = 0;
    while (j < lines.length && lines[j].trim() === '') { blanks += 1; j += 1; }
    if (blanks > 0 && j < lines.length) {
      offenders.push(`line ${i + 1}: "${line}" is followed by a blank line, then "${lines[j].trim().slice(0, 60)}"`);
    }
  }
  assert.deepEqual(offenders, [],
    'a selector list separated from its block by blank lines has probably absorbed the next rule');
});

test('the stylesheet parses: braces and comments balance', () => {
  assert.equal(
    (bare.match(/\{/g) || []).length,
    (bare.match(/\}/g) || []).length,
    'unbalanced braces',
  );
  assert.equal((css.match(/\/\*/g) || []).length, (css.match(/\*\//g) || []).length, 'unclosed comment');
});
