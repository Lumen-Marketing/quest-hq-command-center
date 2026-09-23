import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The sidebar (.deck) is position: fixed with width var(--sidebar-width), so it only stays out of
// the content when the shell grid's first column is the same width. An older max-width:1180px
// rule pinned the expanded column to 218px while the sidebar stayed 264px, so the sidebar covered
// 46px of content between 981px and 1180px wide.

const raw = readFileSync(new URL('../src/styles.css', import.meta.url));
const css = raw.toString('utf8').replace(/\r\n/g, '\n');

const FIX = /@media \(min-width: 981px\) \{\n {2}\.quest-app:not\(\.sidebar-collapsed\) \{\n {4}grid-template-columns: var\(--sidebar-width\) minmax\(0, 1fr\);\n {2}\}\n\}/;

test('the expanded desktop grid column follows the sidebar width', () => {
  assert.match(css, FIX);
});

test('the fix comes after the old 218px rule, so it wins at equal specificity', () => {
  const old = css.indexOf('grid-template-columns: 218px minmax(0, 1fr);');
  const fix = css.search(FIX);
  assert.ok(old > -1 && fix > old, 'fix must be declared after the 1180px rule it corrects');
});

test('styles.css keeps its CRLF line endings', () => {
  const crlf = raw.toString('latin1').split('\r\n').length - 1;
  const lf = raw.toString('latin1').split('\n').length - 1;
  assert.equal(lf, crlf, 'every line ending is CRLF');
});
