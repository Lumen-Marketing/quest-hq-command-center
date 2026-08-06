import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Typing one letter into the Chats search threw you out of the field: the handler called
// updateWorkspaceOnly(), which replaces the workspace innerHTML, so the focused input was
// destroyed and rebuilt as a new node. You had to click back in for every single character.
//
// updateWorkspacePreservingFocus() exists for exactly this and puts focus and the caret back.
// Three boxes used it; the rest did not, so the same bug was in Files, Quotes, Calendar and
// the others too.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');

const SEARCH_BOXES = [
  'data-file-search',
  'data-form-search',
  'data-client-portal-search',
  'data-crm-search',
  'data-account-search',
  'data-deal-search',
  'data-proposal-search',
  'data-pb-search',
  'data-message-search',
  'data-calendar-search',
];

for (const attr of SEARCH_BOXES) {
  test(`${attr} keeps focus while you type`, () => {
    const at = main.indexOf(`if (event.target.matches('[${attr}]'))`);
    assert.notEqual(at, -1, `no input handler for ${attr}`);
    const handler = main.slice(at, main.indexOf('\n  }', at));
    assert.ok(
      handler.includes(`updateWorkspacePreservingFocus('[${attr}]')`),
      `${attr} re-renders the workspace without restoring focus, so it drops you after one letter`,
    );
    assert.ok(
      !/updateWorkspaceOnly\(\);/.test(handler),
      `${attr} must not call the plain workspace update`,
    );
  });
}

test('the helper restores the caret, not just focus', () => {
  // Refocusing alone would put the cursor at the end, which silently reorders what you type
  // when you are editing the middle of a query.
  const at = main.indexOf('function updateWorkspacePreservingFocus(selector)');
  const fn = main.slice(at, main.indexOf('\n}', at));
  assert.match(fn, /const start = before\?\.selectionStart \?\? null;/);
  assert.match(fn, /after\.focus\(\);/);
  assert.match(fn, /after\.setSelectionRange\(start, end\)/);
  // A control with no caret (a select, a checkbox) must not throw the whole render.
  assert.match(fn, /try \{[\s\S]{0,120}?\} catch/);
});

test('a box whose element is gone after the render does not throw', () => {
  const at = main.indexOf('function updateWorkspacePreservingFocus(selector)');
  const fn = main.slice(at, main.indexOf('\n}', at));
  assert.match(fn, /if \(!after\) return;/);
});
