import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { loadUsedIcons, collectCandidates, parseIconFont } from '../scripts/icon-usage.mjs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const generatedCss = read('src/tabler-icons.css');

test('every icon the app references exists in the generated subset', () => {
  const { used } = loadUsedIcons();
  const missing = [...used.keys()].filter((n) => !generatedCss.includes(`.ti-${n}:before`));
  assert.deepEqual(
    missing,
    [],
    `Icons referenced in source but absent from the subset font: ${missing.join(', ')}.\n` +
      'Run `npm run build:icons` to regenerate src/tabler-icons.css and the woff2.',
  );
});

test('no icon name is dynamic enough to defeat static extraction', () => {
  // If someone writes `ti-${iconName}` (a bare variable), we cannot know at build
  // time which glyph to keep, and the subset could silently drop it. Fail loudly.
  const { dynamic } = loadUsedIcons();
  assert.deepEqual(
    [...dynamic],
    [],
    'Icon names must be statically resolvable so the subset can include them. ' +
      'Use an explicit map or a literal ternary instead of interpolating a bare variable.',
  );
});

test('template-interpolated icon names are expanded, not dropped', () => {
  // Regression guard: `ti-chevron-${open ? 'up' : 'down'}` and
  // `ti-heart${liked ? '-filled' : ''}` must contribute BOTH branches.
  const src = "`<i class=\"ti ti-chevron-${open ? 'up' : 'down'}\"></i>`" +
    "`<i class=\"ti ti-heart${liked ? '-filled' : ''}\"></i>`";
  const names = collectCandidates(src);
  for (const n of ['chevron-up', 'chevron-down', 'heart', 'heart-filled']) {
    assert.ok(names.has(n), `expected template expansion to yield ti-${n}`);
  }
});

test('word-boundary scan does not invent icons from words containing "ti-"', () => {
  const names = collectCandidates('const x = "multi-select"; // anti-pattern');
  assert.ok(!names.has('select'), 'must not extract ti-select from "multi-select"');
  assert.ok(!names.has('pattern'), 'must not extract ti-pattern from "anti-pattern"');
});

test('subset is a strict, much smaller subset of the upstream font', () => {
  const upstream = parseIconFont(read('taskmanagement/vendor/tabler-icons/tabler-icons.min.css'));
  const subset = parseIconFont(generatedCss);

  assert.ok(subset.size > 0, 'subset defines no icons');
  assert.ok(subset.size < upstream.size / 5, 'subset should be far smaller than upstream');

  for (const [name, cp] of subset) {
    assert.ok(upstream.has(name), `subset defines ti-${name}, absent upstream`);
    assert.equal(cp, upstream.get(name), `codepoint drift for ti-${name}`);
  }
});

test('the app no longer loads the full vendored icon font', () => {
  const html = read('index.html');
  assert.ok(
    !/tabler-icons\.min\.css/.test(html),
    'index.html still link-loads the full 5,340-glyph font; the subset makes it dead weight',
  );
  assert.match(read('src/main.js'), /^import '\.\/tabler-icons\.css';/m);
});
