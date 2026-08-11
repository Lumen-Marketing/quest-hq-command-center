import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8');

test("an app's actions sit with the tabs that govern them", () => {
  // Every one is tab-specific -- Add field only exists on Fields, Print only on Items and
  // Reports -- so above the tab row they read as page-level actions, which they are not.
  assert.match(main, /<div class="wb-tabs-row">/);
  assert.match(main, /\$\{headBtn \? `<div class="wb-tab-actions">\$\{headBtn\}<\/div>` : ''\}/);
  // The page header no longer carries them.
  const head = main.slice(main.indexOf('<div class="wb-page-head">'), main.indexOf('<div class="wb-tabs-row">'));
  assert.ok(!head.includes('${headBtn}'), 'the actions should have left the page header');
});

test('the row does not push the buttons off a narrow screen', () => {
  // The tab strip scrolls sideways, so side by side it would shove them past the edge.
  assert.match(styles, /@media \(max-width: 900px\) \{[\s\S]*?\.wb-tabs-row \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(styles, /\.wb-tab-actions \{ order: -1;/);
});

test('a Settings button that cannot open says why', () => {
  // Each of these used to `return` in silence, so a dead button looked the same whether the
  // app was gone, the card was gone, or the module failed to load.
  for (const marker of [
    /if \(!app\) \{ showToast\('That app is no longer available\.'/,
    /That card is no longer on this dashboard\. Reload and try again\./,
    /That card is no longer on this layout\. Reload and try again\./,
    /That tile is no longer on this dashboard\. Reload and try again\./,
  ]) assert.match(main, marker);
});

test('a failed module load surfaces instead of becoming an unhandled rejection', () => {
  // Both openers are async and were called with no catch at all.
  assert.equal((main.match(/Card settings could not be opened\./g) || []).length, 2);
});
