import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// `.wb-act-feed` is shared by two surfaces. In the standalone Activity view it is the list's own
// card and its border belongs there. On a record it sits inside `.wb-w`, which already draws the
// same border, radius and background -- so it drew a second frame a few pixels inside the first.
//
// Asserted as two separate rules rather than by concatenating the stylesheets, because a
// concatenated string erases the load order that decides the outcome -- the mistake recorded in
// .ai/known-issues.md about the app strip.

const builder = readFileSync(new URL('../src/workspace/builder.css', import.meta.url), 'utf8');

test('the record panel feed draws no box of its own', () => {
  assert.match(builder, /\.wb-rec-panel \.wb-act-feed \{ border: 0; border-radius: 0; background: none; \}/);
});

test('the standalone Activity view keeps its border', () => {
  // Removing it from the shared rule instead of scoping the override would flatten that view.
  assert.match(builder, /^\.wb-act-feed \{ border: 1px solid var\(--border/m);
});

test('the override comes after the rule it overrides', () => {
  // Same specificity would not be enough; this one is more specific, but order still has to be
  // right for the next person who reaches for a plain `.wb-act-feed` override.
  assert.ok(
    builder.indexOf('.wb-rec-panel .wb-act-feed') > builder.indexOf('.wb-act-feed { border: 1px solid'),
    'the scoped override must follow the shared rule',
  );
});
