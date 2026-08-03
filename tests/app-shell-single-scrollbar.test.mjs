import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// Pull every `.quest-app {` / `.work-surface {` block with the @media it sits in, so a rule
// added later in the file cannot quietly reintroduce what these tests forbid.
function blocks(selector) {
  const lines = css.split('\n');
  const found = [];
  const stack = [];
  let depth = 0;
  lines.forEach((line, i) => {
    const media = line.match(/^\s*@media([^{]*)\{/);
    if (media) stack.push({ depth, query: media[1].trim() });
    depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    while (stack.length && depth <= stack[stack.length - 1].depth) stack.pop();
    if (!new RegExp(`^\\s*\\${selector}\\s*\\{`).test(line)) return;
    const body = [];
    for (let j = i + 1; j < lines.length && !/^\s*\}/.test(lines[j]); j += 1) body.push(lines[j].trim());
    found.push({ line: i + 1, media: stack.map((s) => s.query).join(' && ') || 'all', body: body.join('\n') });
  });
  assert.ok(found.length, `no ${selector} blocks found`);
  return found;
}

// The app shell is fixed to the viewport and scrolls internally: .work-surface is the one
// scroll container. Anything that makes the shell itself taller than the screen gives the
// document a scrollbar too, and two scrollbars appear side by side.

test('the shell is never taller than the visible viewport', () => {
  // min-height beats height. The pre-app-shell layout left `min-height: 100vh` on .quest-app,
  // and 100vh exceeds the visible 100dvh on any phone showing its address bar — so the shell
  // hung below the fold and the document scrolled.
  const shell = blocks('.quest-app').find((b) => b.media === 'all' && /height: 100dvh/.test(b.body));
  assert.ok(shell, 'the app-shell .quest-app rule should exist');
  assert.match(shell.body, /min-height: 100dvh;/);
  assert.match(shell.body, /min-height: 100vh;\n\s*min-height: 100dvh;/, 'keep the vh fallback ahead of dvh');
  assert.match(shell.body, /overflow: hidden;/);
});

test('no rule floors .work-surface at a height its row cannot give it', () => {
  // calc(100dvh - 58px) was measured against a 58px topbar. It is 64px now, with a status
  // rail under it on narrow viewports, so the floor was taller than the track it sits in and
  // the surface overflowed on every page — including ones with nothing to scroll.
  for (const rule of blocks('.work-surface')) {
    assert.ok(
      !/min-height: calc\(100[dv]h/.test(rule.body),
      `.work-surface at line ${rule.line} (${rule.media}) pins a viewport-height floor: the grid row already stretches`,
    );
  }
});

test('the topbar row and any height maths about it agree', () => {
  // If the topbar row changes, the assumption above has to be revisited rather than drift.
  // The app-shell block, not the pre-app-shell one it overrides.
  const shell = blocks('.quest-app').find((b) => b.media === 'all' && /height: 100dvh/.test(b.body));
  assert.match(shell.body, /grid-template-rows: 64px minmax\(0, 1fr\);/);
});

test('the document is not made a scroll container behind the shell', () => {
  // Clipping the document outright was tried and broke narrow viewports, where .work-surface
  // is the thing that scrolls and the shell must be free to size to it. The fix belongs on
  // the shell's own height, not on body overflow.
  assert.ok(!/body:has\(\.quest-app\)[^{]*\{[^}]*overflow-y: hidden/.test(css));
  const root = css.slice(css.indexOf('html,\nbody {'));
  assert.match(root.slice(0, 400), /overflow-x: hidden;/, 'horizontal clipping at the viewport stays');
  assert.ok(!/overflow-y: hidden;/.test(root.slice(0, 400)), 'vertical clipping at the viewport does not');
});

// --- the diagnostic ------------------------------------------------------------------------

test('the readout finds scrolling elements anywhere, not just in the shell', () => {
  // The shell was measured in a headless browser across 600-1920px and produced exactly one
  // scrollbar at every width. So a second one has to come from page content, and a fixed
  // list of four shell selectors cannot find it.
  const diag = readFileSync(new URL('../src/ui/layout-diagnostic.js', import.meta.url), 'utf8');
  assert.match(diag, /SCROLLING ELEMENTS/);
  assert.match(diag, /document\.querySelectorAll\('body \*'\)/);
  assert.match(diag, /n\.scrollHeight > n\.clientHeight \+ 1 \|\| n\.scrollWidth > n\.clientWidth \+ 1/);
  // Each hit needs an ancestor path; "a div scrolls" is not actionable on its own.
  assert.match(diag, /const path = \(n\) =>/);
});
