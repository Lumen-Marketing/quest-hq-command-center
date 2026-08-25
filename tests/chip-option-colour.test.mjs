import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { wbChipHtml } from '../src/workspace/chip-field.js';

// "can you apply the color in the choice chips too?"
//
// Every option already carried its colour -- wbChipHtml has always written it out as --chip. The
// stylesheet only spent it on :hover, on .on and on the focus ring, so a picker of four
// colour-coded stages drew four identical grey pills, and the colours somebody had just chosen in
// the field editor were invisible at the moment they were choosing between them.

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

const rule = (selector) => {
  const at = css.indexOf(`${selector} {`);
  return at < 0 ? '' : css.slice(at, css.indexOf('}', at) + 1);
};

test('the markup was already carrying the colour', () => {
  const html = wbChipHtml((v) => String(v ?? ''), { id: 'o1', label: 'Sales', color: '#e0552d' }, false);
  assert.match(html, /style="--chip:#e0552d"/);
  assert.match(html, /aria-pressed="false"/);
});

test('an option with no colour still gets a usable one', () => {
  const html = wbChipHtml((v) => String(v ?? ''), { id: 'o2', label: 'Untitled' }, false);
  assert.match(html, /--chip:#6b7280/, 'a grey, not an empty custom property');
});

test('an unselected chip hints at its colour through the rim', () => {
  // A dot was tried here and removed: the rim already carries the colour, and two ways of
  // saying it is one more than the question has answers.
  assert.ok(!css.includes('.wb-chip:not(.wb-chip-other)::before'), 'no dot is drawn');
  const rim = rule('[data-wb-chip-pick] .wb-chip:not(.wb-chip-other)');
  assert.match(rim, /border-color: color-mix\(in srgb, var\(--chip/);
});

test('and a tinted rim, without becoming a filled chip', () => {
  // The selected chip is a solid block of its colour. Filling the others the same way would leave
  // a picker that cannot say which one is picked.
  const rim = rule('[data-wb-chip-pick] .wb-chip:not(.wb-chip-other)');
  assert.match(rim, /border-color: color-mix\(in srgb, var\(--chip/);
  assert.ok(!/background:/.test(rim), 'the unselected chip keeps the plain surface behind it');
  assert.match(rule('.wb-chip.on'), /background: var\(--chip/, 'the selected one is still filled');
});

test('nothing is drawn inside the filled chip either', () => {
  assert.ok(!css.includes('[data-wb-chip-pick] .wb-chip.on::before'), 'the white dot went with it');
});

test('the Other button keeps no colour rim', () => {
  // It is a dashed "add a new one" affordance carrying a plus icon, not an option with a colour.
  const rim = rule('[data-wb-chip-pick] .wb-chip:not(.wb-chip-other)');
  assert.ok(rim.includes(':not(.wb-chip-other)'), 'excluded by selector');
});

test('chips that carry no colour are left alone', () => {
  // The Button field reuses the wb-chip-pick CLASS for its link-field inserter, and those chips
  // have no colour at all. Scoping to the data attribute keeps the tint off them.
  assert.ok(css.includes('[data-wb-chip-pick] .wb-chip'), 'scoped to the attribute, not the class');
  assert.ok(!css.includes('.wb-chip-pick .wb-chip:not(.wb-chip-other) {'), 'not scoped to the bare class');
});

test('a selected chip fills with the OPTION colour, not near-black', () => {
  // The bug behind the ask: a THIRD .wb-chip block, further down the stylesheet, styled the
  // selected state as var(--ink) with no scope at all. Being later it won the cascade
  // everywhere -- so every chosen choice chip came out near-black and the option colour, which
  // the markup had been carrying all along, never got to show.
  const picker = rule('.wb-chip.on');
  assert.match(picker, /background: var\(--chip/, 'the option colour is what fills it');
  assert.ok(!picker.includes('var(--ink)'), 'and not the near-black text colour');
});

test('the quick filter bar keeps its near-black selection', () => {
  // A filter toggle is a different thing from an option: it is on or off, and it carries its
  // colour in a dot of its own. Near-black is the right answer for it -- it just cannot be the
  // answer for both, which is what an unscoped rule made it.
  const bar = rule('.wb-chip-bar .wb-chip.on');
  assert.ok(bar.length > 0, 'the filter rule is scoped, not deleted');
  assert.match(bar, /background: var\(--ink\)/);
});
