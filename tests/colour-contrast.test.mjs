import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// WCAG 2.1 relative luminance and contrast ratio.
const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const hex = (h) => (h.length === 4
  ? [...h.slice(1)].map((c) => parseInt(c + c, 16))
  : [0, 2, 4].map((i) => parseInt(h.slice(1 + i, 3 + i), 16)));

// Every block that defines --bg is a theme. There are several: the base palette, a dark
// variant, and a few design directions layered later in the file.
function themes() {
  const found = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = m[2];
    if (!/--bg\s*:/.test(body)) continue;
    const pick = (name) => {
      const v = body.match(new RegExp(`--${name}\\s*:\\s*(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})\\s*;`));
      return v ? hex(v[1]) : null;
    };
    found.push({
      selector: m[1].trim().replace(/\s+/g, ' ').slice(-50),
      line: css.slice(0, m.index).split('\n').length,
      bg: pick('bg'),
      muted: pick('muted'),
    });
  }
  return found;
}

test('the stylesheet still defines multiple themes to check', () => {
  const found = themes();
  assert.ok(found.length >= 6, `expected several theme blocks, found ${found.length}`);
  assert.ok(found.some((t) => t.muted), 'no theme defined --muted');
});

// --muted is secondary text: metadata, hints, table sub-labels. It is the colour most
// likely to be tuned for looks and least likely to be re-checked afterwards, and four of
// the seven themes had drifted just under the threshold (4.22-4.45:1).
test('--muted meets WCAG AA 4.5:1 against its own --bg in every theme', () => {
  const failures = themes()
    .filter((t) => t.bg && t.muted)
    .map((t) => ({ ...t, r: ratio(t.muted, t.bg) }))
    .filter((t) => t.r < 4.5)
    .map((t) => `L${t.line} ${t.selector} -> ${t.r.toFixed(2)}:1`);

  assert.deepEqual(failures, [], 'secondary text below AA contrast in these themes');
});
