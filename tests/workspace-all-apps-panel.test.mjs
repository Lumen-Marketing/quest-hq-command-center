// The app strip scrolls, so past a dozen apps the far end is out of sight. A button beside the
// paging arrows opens every app at once as a grid.
//
// The panel lives in its own module, fetched on first press. That is not a style preference:
// the entry chunk is at its gzip budget, and building the panel inline pushed it over.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const panel = readFileSync(new URL('../src/workspace/all-apps.js', import.meta.url), 'utf8');
const header = source.match(/function wbWorkspaceHeader\([\s\S]*?\n\}/)[0];

test('the button sits in the bar and is not inside the arrows, which hide when nothing overflows', () => {
  assert.match(header, /data-wb-topbar-all/);
  assert.match(header, /\$\{allBtn\}\$\{nav\}/, 'the button renders beside the nav, not within it');
  const navGroup = header.match(/const nav = `<div class="wb-topbar-nav"[\s\S]*?`;/)[0];
  assert.doesNotMatch(navGroup, /data-wb-topbar-all/);
  assert.match(header, /aria-expanded="false" aria-controls="wbAllApps"/);
});

test('the panel is fetched on press, so it costs the entry chunk nothing but the button', () => {
  assert.match(source, /import\('\.\/workspace\/all-apps\.js'\)/);
  assert.match(source, /\.catch\(\(error\) => console\.error\('All apps failed to load', error\)\)/);
  assert.doesNotMatch(source, /wb-allapps-grid/, 'the panel markup belongs in the module');
  assert.doesNotMatch(header, /allPanel/);
});

test('the grid is drawn from the strip itself, so it cannot disagree with the bar', () => {
  assert.match(panel, /querySelectorAll\('\.wb-topbar-tab'\)/);
  assert.match(panel, /tab\.cloneNode\(true\)/);
  assert.doesNotMatch(panel, /slice\(/, 'every tab is drawn — the grid must not page or truncate');
  // A clone that kept these would be found by the reorder pass and the scroll-into-view pass.
  assert.match(panel, /removeAttribute\('data-wb-topbar-active'\)/);
  assert.match(panel, /removeAttribute\('data-wb-app-id'\)/);
});

test('Activity is in the grid but is not counted as an app', () => {
  assert.match(panel, /tab\.dataset\.wbAppId !== ACTIVITY_TILE/);
  assert.match(panel, /const ACTIVITY_TILE = 'activity';/);
  // The strip's own id for the Activity tile, which this must keep in step with.
  assert.match(source, /const WB_ACTIVITY_TILE = 'activity';/);
});

test('opening reports state on the button and puts the caret in the filter', () => {
  assert.match(panel, /button\?\.setAttribute\('aria-expanded', 'true'\)/);
  assert.match(panel, /search\.focus\(\)/);
  assert.match(panel, /if \(refocus\) button\.focus\(\)/, 'Escape and Close return the caret to the button');
  assert.doesNotMatch(panel, /render\(\)/, 'the panel must not re-render: the strip would lose its scroll position');
});

test('the filter hides tiles by name and says when nothing is left', () => {
  assert.match(panel, /\(tile\.dataset\.name \|\| ''\)\.includes\(needle\)/);
  assert.match(panel, /none\.hidden = shown > 0/);
  assert.match(panel, /tile\.dataset\.name = name\.toLowerCase\(\)/);
});

test('Escape and an outside click close it, without swallowing the click that opened it', () => {
  assert.match(panel, /event\.key === 'Escape'/);
  assert.match(panel, /if \(button\?\.contains\(event\.target\)\) return;/);
  // A render replaces the whole bar; the listeners must not outlive the node they belong to.
  assert.match(panel, /if \(!panel\.isConnected\) \{ detach\(\); return; \}/);
  assert.match(panel, /document\.removeEventListener\('keydown', onKey\)/);
  assert.match(panel, /document\.removeEventListener\('click', onClick\)/);
});

test('following a tile lets the router read the link before the panel goes', () => {
  assert.match(panel, /setTimeout\(\(\) => close\(panel, button, false\), 0\)/);
});

test('the panel hangs off the sticky bar and the bar does not clip it', () => {
  const bar = styles.match(/\n\.wb-topbar \{[^}]*\}/)[0];
  assert.match(bar, /position: sticky;/);
  assert.match(bar, /overflow: visible;/, 'overflow:hidden here would clip the panel away');
  const rule = styles.match(/\.wb-allapps \{[^}]*\}/)[0];
  assert.match(rule, /position: absolute;/);
  assert.match(rule, /top: 100%;/);
  assert.match(rule, /overflow-y: auto;/, 'a long app list must scroll inside the panel');
  assert.match(styles, /\.wb-allapps-grid \{[^}]*grid-template-columns: repeat\(auto-fill/);
  assert.match(styles, /\.wb-topbar-all\[aria-expanded="true"\]/);
});
