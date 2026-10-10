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

// This used to assert styles.css keeps CRLF endings, which is what pinned the corruption in
// place: the file was committed with CRLF (and, on some lines, a doubled CR) and the test made
// that the expected state. The repository policy is now LF everywhere, via .gitattributes.
//
// Asserting "no CR byte at all" is strictly stronger than counting CRLF pairs: it catches CRLF
// endings AND the doubled CR (\r\r\n) that a CRLF-only check waves through, because a doubled CR
// still contains one CR.
test('styles.css carries no CR byte', () => {
  let cr = 0;
  for (let i = 0; i < raw.length; i += 1) if (raw[i] === 0x0d) cr += 1;
  assert.equal(cr, 0, `styles.css must be LF-only; found ${cr} CR byte(s)`);
});
