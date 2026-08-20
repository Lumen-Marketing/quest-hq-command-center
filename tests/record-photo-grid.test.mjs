import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// "On uploading multiple photos, can you fix this? can you make it stack? so it does not take so
// much space" -- six photos on a record, each on a line of its own, and the Change chip squeezed
// until "Change" read down the page one letter at a time.
//
// The value column on a record page is `flex: 1` beside a label that takes 34% (200px max), so it
// lands near 300px. A 78px tile plus its gaps left room for exactly one per line, and an inline
// row that wraps did the only thing it could.

const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

const rule = (selector) => {
  const at = styles.indexOf(`${selector} {`);
  if (at < 0) return '';
  return styles.slice(at, styles.indexOf('}', at) + 1);
};

test('the photos on a record lay out as a grid, not a wrapping row', () => {
  const detail = rule('.wb-img-cell.is-detail');
  assert.match(detail, /display: grid;/);
  // auto-fill packs as many as the column holds; the same six photos become two rows.
  assert.match(detail, /grid-template-columns: repeat\(auto-fill, minmax\(64px, 1fr\)\);/);
  assert.match(detail, /width: 100%;/);
});

test('a tile fills its column and stays square', () => {
  // Fixed 78px squares in a fluid grid leave a ragged right edge; the columns line up whatever
  // proportions the photos themselves have.
  const avatar = rule('.wb-img-cell.is-detail .wb-img-avatar');
  assert.match(avatar, /width: 100%/);
  assert.match(avatar, /aspect-ratio: 1/);
  assert.ok(!/width: 78px/.test(avatar), 'no fixed width fighting the grid');
});

test('past three rows it scrolls rather than growing without end', () => {
  // A cap, not a scrollbar for its own sake: beyond this it stops being a field on a record and
  // starts being a gallery, and the viewer is where a gallery belongs.
  const detail = rule('.wb-img-cell.is-detail');
  assert.match(detail, /max-height: 226px;/);
  assert.match(detail, /overflow-y: auto;/);
});

test('the Change chip can never be squeezed into a column of letters', () => {
  const edit = rule('.wb-img-edit');
  assert.match(edit, /white-space: nowrap;/);
  assert.match(edit, /flex: none;/);
});

test('and it sits under the photos, not beside them', () => {
  // Beside, it competes with the grid for a column that has none to spare.
  assert.match(styles, /\.wb-view-val:has\(\.wb-img-cell\.is-detail\) \{ display: flex; flex-direction: column;/);
});

test('the list cell is untouched', () => {
  // One photo and a corner badge. The grid is the RECORD's treatment; a table row still has to
  // stay one photo wide.
  assert.match(rule('.wb-img-cell'), /display: inline-flex/);
  assert.match(rule('.wb-img-cell.has-more'), /position: relative/);
});
