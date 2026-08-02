import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  .replace(/\r\n/g, '\n')
  .replace(/\/\*[\s\S]*?\*\//g, '');

// Rough CSS specificity: ids * 100 + (classes|attributes|pseudo-classes) * 10 + elements.
// Enough to compare rules that differ only by class count, which is the case here.
const specificity = (selector) => {
  const ids = (selector.match(/#/g) || []).length;
  const classes = (selector.match(/\.|\[|:(?!:)/g) || []).length;
  const elements = (selector.match(/(^|[\s>+~])[a-z]/g) || []).length;
  return ids * 100 + classes * 10 + elements;
};

const rulesFor = (property, mustMatch) => {
  const found = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!new RegExp(`${property}\\s*:`).test(m[2])) continue;
    for (const sel of m[1].split(',').map((x) => x.replace(/\s+/g, ' ').trim())) {
      if (!mustMatch.every((re) => re.test(sel))) continue;
      found.push({ sel, spec: specificity(sel), at: m.index, value: (m[2].match(new RegExp(`${property}:[^;]*`)) || [''])[0] });
    }
  }
  return found.sort((a, b) => a.spec - b.spec || a.at - b.at);
};

// Six earlier rules lay out .side-item, several inside media queries, and the one that
// used to win kept a three-column grid — icon, flexible label, badge. Correct at 236px;
// at 76px the row still demands its full width, so its centred contents sit outside the
// rail and get clipped. What reached the screen was a sliver of each icon at the very
// edge, which reads as "the icons are gone".
test('the collapsed rail lays out as a single centred column, and wins the cascade', () => {
  const layout = rulesFor('grid-template-columns', [/side-item/, /collapsed/]);
  assert.ok(layout.length >= 4, 'expected several competing layout rules');
  const winner = layout[layout.length - 1];
  assert.match(winner.sel, /^\.quest-app\.sidebar-collapsed \.side-item$/);
  assert.match(winner.value, /minmax\(0, 1fr\)/, 'a multi-column grid does not fit a 76px rail');
});

test('the rail and its containers are allowed to shrink', () => {
  // A grid item will not go below its content width unless min-width: 0 says it may, so
  // without this the rail simply refuses to be narrow and everything overflows.
  for (const part of ['deck', 'deck-scroll', 'side-items', 'side-group']) {
    assert.match(
      css,
      new RegExp(`\\.quest-app\\.sidebar-collapsed \\.${part}[^{]*\\{[^}]*min-width: 0;`, 's'),
      `${part} must be allowed to shrink`,
    );
  }
});

test('the icon is given a legible size once it is the whole row', () => {
  assert.match(css, /\.quest-app\.sidebar-collapsed \.side-item \.symbol-icon \{[^}]*width: 20px;/s);
  assert.match(css, /\.quest-app\.sidebar-collapsed \.side-item \.symbol-icon \{[^}]*justify-self: center;/s);
});

test('text is hidden rather than squeezed to one character', () => {
  // A one-character-wide label is noise, and squeezing is what produced the clipped
  // glyphs that looked like missing icons.
  assert.match(
    css,
    /\.quest-app\.sidebar-collapsed \.side-item span,[\s\S]{0,160}\{\s*display: none;/,
  );
});

test('badges ride the icon corner instead of claiming a column', () => {
  assert.match(css, /\.quest-app\.sidebar-collapsed \.side-item b \{[^}]*position: absolute;/s);
  // The absolute badge needs a positioned ancestor; an earlier rule supplies it and this
  // block must not have clobbered it.
  assert.match(css, /\.sidebar-collapsed \.side-item \{[^}]*position: relative;/s);
});

test('the rail is wide enough for the icon to breathe', () => {
  const widths = rulesFor('grid-template-columns', [/quest-app/, /sidebar-collapsed$/]);
  assert.ok(widths.length, 'the collapsed rail width should be declared');
  assert.match(widths[widths.length - 1].value, /84px/);
});
