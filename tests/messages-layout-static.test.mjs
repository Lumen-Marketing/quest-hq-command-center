import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

// A selector can legitimately have several top-level rules (tokens in one, layout in
// another), so collect them all. Only unindented occurrences count: a bound nested in a
// media query would not apply at desktop width, which is how the first attempt failed.
function topLevelRules(selector) {
  const rules = [];
  const needle = `\n${selector} {`;
  for (let at = styles.indexOf(needle); at !== -1; at = styles.indexOf(needle, at + 1)) {
    rules.push(styles.slice(at, styles.indexOf('}', at) + 1));
  }
  assert.ok(rules.length, `expected a top-level rule for ${selector}`);
  return rules;
}

function topLevelRule(selector) {
  return topLevelRules(selector).join('\n');
}

// The composer sat below the fold with nothing to scroll. .message-simple-page is a flex
// column and .message-simple-workspace has `flex: 1`, which sets flex-basis: 0% and
// overrides `height` on the main axis — so bounding the workspace did nothing. The bound
// has to make the PAGE height definite so `flex: 1` resolves to the leftover space.
test('the messages page height is definite, not just a minimum', () => {
  const page = topLevelRule('.message-simple-page');
  assert.match(page, /max-height: min\(820px, calc\(100vh - 112px\)\)/);
  assert.match(styles, /\.message-simple-page \{[\s\S]*?min-height: min\(820px, calc\(100vh - 112px\)\)/);
});

test('the workspace does not try to bound itself with a height', () => {
  const workspace = topLevelRule('.message-simple-workspace');
  assert.match(workspace, /min-height: 0;/);
  assert.doesNotMatch(workspace, /(^|\n)\s*height:/, 'a height here is overridden by flex-basis');
});

test('the thread panel gives the stream its own scrollable row', () => {
  assert.match(styles, /\.message-simple-main:has\(\.message-stream\) \{\s*grid-template-rows: auto minmax\(0, 1fr\) auto;\s*\}/);
  assert.match(styles, /\.message-simple-main \.message-stream \{[^}]*overflow: auto;/);
});

test('own messages align right and the other person left', () => {
  // The stream is a flex column, where justify-self does nothing.
  assert.match(styles, /\.message-bubble \{[^}]*align-self: flex-start;/);
  assert.match(styles, /\.message-bubble\.own \{[^}]*align-self: flex-end;/);
});

test('the stacked layout releases the bound so the composer is not stranded', () => {
  assert.match(styles, /@media \(max-width: 900px\) \{[\s\S]*?\.message-simple-page \{\s*max-height: none;/);
});

test('the conversation list scrolls inside its own panel', () => {
  assert.match(styles, /\.message-simple-sidebar \{[^}]*min-height: 0;/);
  assert.match(styles, /\.message-simple-list \{[^}]*overflow: auto;/);
});
