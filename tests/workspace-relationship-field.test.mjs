import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Two requests about the same field:
//   "aside from drop down selection, I want it to be auto populate or auto search and select
//    while I am typing so if record is exist it will show so I can select it"
//   "when I click that Data on the relationship fields it will go to its original detail on
//    the linked app"
// One is the input, the other is the display, so they are tested as the two halves they are.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
// The picker moved into its own lazily-fetched module, leaving a loader shim behind. Its
// behaviour is read from the module; main.js is still read for the shim and everything else.
const picker = readFileSync(join(root, 'src', 'workspace', 'relationship-picker.js'), 'utf8');
const fieldUi = readFileSync(join(root, 'src', 'workspace', 'field-config-ui.js'), 'utf8');
const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');

function fn(source, name) {
  // LAST occurrence: an extracted module leaves a loader shim of the same name in main.js.
  const at = source.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  const end = source.slice(at).search(/\r?\n\}/);
  return source.slice(at, at + end);
}

// --- typing to find a record ---------------------------------------------------------------

test('the single-select relationship is a search box over the same select', () => {
  // The <select> stays and holds the value: every read, write, automation and submit in the
  // builder already goes through it, so replacing it would mean rewriting all of them.
  assert.match(fieldUi, /<div class="wb-rel-pick" data-wb-rel-pick>/);
  assert.match(fieldUi, /<div class="wb-rel-pick-hidden">\$\{selectMarkup\}<\/div>/);
  assert.match(fieldUi, /role="combobox"/);
  assert.match(fieldUi, /aria-autocomplete="list"/);
  assert.match(fieldUi, /data-wb-rel-results/);
});

test('multi-select keeps the plain list', () => {
  // Picking several is what a multi-select is already good at; a type-ahead that has to
  // show what is chosen as well as what matches is worse at it.
  assert.match(fieldUi, /if \(f\.config\.multiple\) \{\r?\n\s*input = `\$\{selectMarkup\}<div class="wb-sub">Linked to/);
});

test('choosing a record drives the select, so everything downstream still fires', () => {
  const body = fn(picker, 'wbBindRelationshipPickers');
  assert.match(body, /select\.value = /);
  assert.match(body, /new Event\('change', \{ bubbles: true \}\)/,
    'automations and calculated fields listen for change, not for this widget');
});

test('the keyboard works, because a search box you must reach for the mouse from is worse', () => {
  const body = fn(picker, 'wbBindRelationshipPickers');
  for (const key of ['ArrowDown', 'ArrowUp', 'Enter', 'Escape']) {
    assert.ok(body.includes(`'${key}'`), `${key} is unhandled`);
  }
});

test('a long list is capped rather than rendered whole', () => {
  const body = fn(picker, 'wbBindRelationshipPickers');
  assert.match(body, /slice\(0, 50\)/);
  assert.match(body, /more — keep typing/, 'a silent cut looks like a missing record');
});

test('leaving the box without choosing restores the real value', () => {
  // Half-typed text left sitting in the box reads as a selection that was never made.
  const body = fn(picker, 'wbBindRelationshipPickers');
  assert.match(body, /'blur'/);
});

test('the picker is bound on both surfaces that render fields', () => {
  assert.match(main, /wbBindUrlControls\(document\); wbBindRelationshipPickers\(document\);/);
  assert.match(main, /wbBindUrlControls\(overlay\);\r?\n\s*wbBindRelationshipPickers\(overlay\);/);
});

// --- clicking a record to open it ----------------------------------------------------------

test('a linked record links to that record', () => {
  const body = fn(main, 'wbRelHref');
  assert.match(body, /workspace: opsId, app_id: entry\.app\.id, tab: 'items', item_id: itemId/);
  // The record page renders whichever operational workspace is active, so a link into
  // another workspace has to switch it -- that is what `workspace` does.
  assert.match(body, /entry\.workspace\.id\.slice\(3\)/);
});

test('it refuses to link where the link would not land', () => {
  const body = fn(main, 'wbRelHref');
  assert.match(body, /if \(!itemId\) return '';/);
  assert.match(body, /if \(!entry\) return '';/, 'a deleted target app resolves to nothing');
  assert.match(body, /if \(!opsId\) return '';/, 'a builder-only workspace has no route');
  assert.match(body, /allowedOperationalWorkspaces\(entry\.companyId\)\.some\(\(ws\) => ws\.id === opsId\)/);
});

test('an unresolved record stays plain text', () => {
  const cell = fn(main, 'wbFmtVal');
  assert.match(cell, /if \(!it\) return '<span class="wb-tag wb-rel">\?<\/span>';/);
  assert.match(cell, /: `<span class="wb-tag wb-rel">\$\{h\(label\)\}<\/span>`/);
});

test('the link is routed in-app rather than reloading the page', () => {
  const cell = fn(main, 'wbFmtVal');
  assert.match(cell, /class="wb-tag wb-rel wb-rel-link" href="\$\{h\(href\)\}" data-router/,
    'without data-router the router ignores it and the browser does a full page load');
});

test('the row click does not swallow the link', () => {
  // Clicking a row opens that row; the guard that keeps links working is what lets a
  // relationship chip inside a row navigate somewhere else instead.
  // Asserted by parts, not as a fixed string: the list grows as more of a card becomes
  // interactive (the checklist panel joined it), and what matters here is that `a` is still
  // in it, not that nothing else ever is.
  const bail = main.match(/if \(e\.target\.closest\('([^']+)'\)\) return;/)[1];
  for (const part of ['a', 'button', 'input', 'select', 'textarea', 'label', '.wb-check-toggle']) {
    assert.ok(bail.split(', ').includes(part), `${part} dropped from the row-click bail list: ${bail}`);
  }
});

// --- styling -------------------------------------------------------------------------------

test('both halves are styled', () => {
  assert.match(css, /\.wb-rel-pick \{ position: relative; \}/);
  // Hidden, not removed: a display:none control is still submitted, but this one also has
  // to stay reachable for the picker to write to.
  assert.match(css, /\.wb-rel-pick-hidden \{\n  position: absolute;/);
  assert.match(css, /\.wb-rel-results \{/);
  assert.match(css, /\.wb-rel-result:hover,\n\.wb-rel-result\.active \{/);
  assert.match(css, /\.wb-rel-link:hover \{ text-decoration: underline; \}/);
});
