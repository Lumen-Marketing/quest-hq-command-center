import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// The rules added for this, bounded by the next top-level section comment. Slicing to the
// end of the file instead sweeps in whatever gets appended later, which turns an unrelated
// addition into a failure here.
const plainBlock = (() => {
  const start = css.indexOf('/* ---- Company / workspace icons: plain glyph');
  assert.notEqual(start, -1, 'the plain-icon section should exist');
  const next = css.indexOf('/* ---- ', start + 10);
  return css.slice(start, next === -1 ? css.length : next);
})();

test('an uploaded image is marked in the markup, not inferred in CSS', () => {
  // The distinction already existed; the styling follows it rather than inventing a
  // second one that could disagree.
  const fn = main.slice(main.indexOf('function workspaceIconMarkup('));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.match(body, /class="workspace-icon has-upload/);
  assert.match(body, /if \(iconImage\)/);
  // The chosen-icon branch carries no upload marker.
  const chosen = body.slice(body.lastIndexOf('return `<span class="workspace-icon '));
  assert.ok(!/has-upload/.test(chosen));
});

test('a chosen icon renders with no frame at all', () => {
  assert.match(plainBlock, /\.workspace-icon:not\(\.has-upload\) \{[^}]*border: 0;/s);
  assert.match(plainBlock, /\.workspace-icon:not\(\.has-upload\) \{[^}]*background: none;/s);
  assert.match(plainBlock, /\.workspace-icon:not\(\.has-upload\) \{[^}]*border-radius: 0;/s);
});

test('the glyph takes the chosen icon colour', () => {
  // Originally this inherited the company tint. It is now an explicit per-company icon
  // colour defaulting to Quest orange, so an account that never picks one looks like the
  // product rather than like whatever colour its label happened to get.
  assert.match(plainBlock, /color: var\(--icon-color, var\(--orange\)\)/);
  assert.match(main, /--icon-color:\$\{h\(normalizeIconColor\(company\?\.icon_color\)\)\}/);
});

test('an uploaded image keeps its container', () => {
  // An image has its own edges, colours and crop, so it still needs a frame — the
  // stripping must not reach it.
  for (const rule of plainBlock.split('}').filter((r) => r.includes('{'))) {
    const selector = rule.slice(0, rule.indexOf('{'));
    const body = rule.slice(rule.indexOf('{') + 1);
    if (!selector.includes('.workspace-icon')) continue;
    // Rules that only declare the box size apply to both cases on purpose: an uploaded
    // image is sized by the same box as a glyph. Only rules that remove the frame have
    // to be scoped away from it.
    if (/^\s*--wsi-size:[^;]+;\s*$/.test(body)) continue;
    assert.match(selector, /:not\(\.has-upload\)/, `would also strip the uploaded case: ${selector.trim()}`);
  }
  // And the container rules for uploads are still present.
  assert.match(css, /\.workspace-icon\.has-upload \{[^}]*overflow: hidden;/s);
  assert.match(css, /\.workspace-icon\.has-upload img \{[^}]*object-fit: cover;/s);
});

test('the glyph is sized from its box, not pinned to one value', () => {
  // A single font-size that suited the 34px sidebar icon overflowed the 22px workspace
  // rail: the glyph spilled out of its box and sat on top of the workspace name. Each
  // context declares its box size once and the glyph follows a proportion of it.
  assert.match(plainBlock, /\.workspace-icon:not\(\.has-upload\) i \{[^}]*font-size: calc\(var\(--wsi-size, 34px\) \* 0\.78\);/s);
  assert.match(plainBlock, /\.workspace-icon \{\s*--wsi-size: 34px;/s);
  assert.match(plainBlock, /\.workspace-icon\.large \{\s*--wsi-size: 52px;/s);
});

test('every context that resizes the box also declares its glyph size', () => {
  // Otherwise that context silently inherits 34px and overflows — which is exactly how
  // the rail icon ended up on top of the text.
  const sized = new Set([...plainBlock.matchAll(/([^{}]+)\{\s*--wsi-size:/g)].map((m) => m[1].trim()));
  const joined = [...sized].join(' | ');
  for (const context of ['.workspace-rail-item', '.company-account-header', '.operational-workspace-row', '.workspace-menu-option']) {
    assert.ok(joined.includes(context), `${context} resizes the icon box but declares no glyph size`);
  }
});

test('Done sits in the header beside Close, not at the foot of a scrolling grid', () => {
  // The icon grid is long enough to scroll, so a footer button was frequently off-screen.
  // Every choice in this dialog applies live, so Done is a way out, not a submit.
  const fn = main.slice(main.indexOf('function renderWorkspaceIconModal('));
  const body = fn.slice(0, fn.indexOf("'wide-modal workspace-icon-modal-panel'") + 700);
  assert.ok(!/<div class="form-actions">/.test(body), 'the footer action row should be gone');
  assert.match(body, /'wide-modal workspace-icon-modal-panel',[\s\S]*data-action="close-modal"><i class="ti ti-check"><\/i>Done/);
  // renderModalShell puts headerActions before its own Close button.
  const shell = main.slice(main.indexOf('function renderModalShell('));
  assert.match(shell.slice(0, shell.indexOf('\n}\n')), /\$\{headerActions\}\s*<button class="btn" type="button" data-action="close-modal">Close<\/button>/);
});
