import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Three fixes in code that needs a browser to run. These check the PROPERTY each one turns on --
// which helper is called, where a key is computed, which node a guard is asked of -- rather than
// the punctuation around it. The version of this file that pinned an exact one-line binding
// turned a correctness fix into a red test and taught nobody anything.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const push = readFileSync(new URL('../src/workspace/button-push.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

/** Code without the prose about it. A fix that explains what it replaced quotes the old line. */
const stripComments = (source) => source
  .split('\n').filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line)).join('\n');

// ---- select all takes what you can see ---------------------------------------------------------
//
// Filters take rows out before the list is drawn; the SEARCH box hides rows already drawn, so
// typing keeps focus. Select all walked every checkbox in the list either way -- so searching for
// four Smiths and pressing it ticked all nine hundred records, and Delete selected took all nine
// hundred. The dialog printed the true count, which is the only reason this was survivable.

test('the visible-rows helper reads hidden off the ROW, which is what the search hides', () => {
  const helper = main.slice(main.indexOf('function wbSelectBoxes()'));
  const body = helper.slice(0, helper.indexOf('\n}'));
  assert.match(body, /#wbItemsList \[data-wb-select\]/);
  assert.match(body, /\.filter\(\(box\) => !box\.closest\('\[data-item\]'\)\?\.hidden\)/);
});

test('every way of selecting many rows goes through it', () => {
  // The header tickbox and the Select all button, which are two doors to the same thing, plus
  // the indeterminate dash that has to agree with them or it reports a state nobody is in.
  // Anchored forwards from the start, because [data-wb-view-file] is also bound earlier in the
  // file and slicing to the first one gave an empty string that matched nothing and proved it.
  const from = main.indexOf("bind('[data-wb-select-all]'");
  const bindings = main.slice(from, main.indexOf("bind('[data-wb-view-file]'", from));
  assert.ok(bindings.length > 200, 'the selection bindings should be in this slice');
  for (const door of ['[data-wb-select-all]', '[data-wb-select-all-btn]']) {
    const at = bindings.indexOf(`bind('${door}'`);
    assert.notEqual(at, -1, `${door} should still be bound`);
    assert.match(bindings.slice(at, at + 260), /wbSelectBoxes\(\)/, `${door} must select only visible rows`);
  }
  assert.match(bindings, /const boxes = wbSelectBoxes\(\);/, 'and the indeterminate dash counts the same rows');
  // The raw query lives in one place now. A second one here is how this comes back: the walk
  // itself is unchanged and looks right, so what has to be checked is where the boxes come from.
  assert.doesNotMatch(
    bindings,
    /querySelectorAll\('#wbItemsList \[data-wb-select\]'\)/,
    'nothing selects straight off the DOM any more',
  );
});

test('deleting says so when part of what is going is not on screen', () => {
  // A tick somebody put on a row and then searched away from is still theirs to delete. "12
  // records" over a list showing four is the moment to mention the other eight.
  const del = main.slice(main.indexOf("bind('[data-wb-del-sel]'"));
  const body = del.slice(0, del.indexOf('\n    });'));
  assert.match(body, /if \(!can\('workspaces\.records\.delete', companyId\)\) return refuseRecord\('delete'\);/);
  assert.match(body, /hidden by the search box/);
});

// ---- the button guard is asked of the button ----------------------------------------------------

test('the new-record guard is asked of each button, not of the root', () => {
  // `document` has no `closest`, so `root.closest?.(…) !== null` was `undefined !== null` --
  // true every time. Opening any add dialog disabled every seatless button on the page,
  // including the ones on the record behind it. The optional call is what made it silent.
  const sync = push.slice(push.indexOf('function syncButtons(root)'));
  // Comments dropped: the one above the guard quotes the broken line so the next reader knows
  // what it replaced, and prose about code is not code.
  const body = stripComments(sync.slice(0, sync.indexOf('\n  }')));
  assert.doesNotMatch(body, /root\.closest/, 'the root is never asked whether it is a form');
  assert.match(body, /const addingRecord = !!state\.builderModal && !state\.builderModal\.editId;/);
  assert.match(body, /if \(addingRecord && !button\.dataset\.wbPressCtx && button\.closest\('\.wb-modal'\)\)/);
});

test('nothing else in the module asks a possibly-rootless node whether it is a form', () => {
  // The shape that hid it: an optional CALL whose result is compared against null, which is
  // never null when the method is missing. Comments dropped for the same reason as above.
  assert.doesNotMatch(stripComments(push), /\?\.\([^)]*\)\s*!==\s*null/);
});

// ---- sort keys are worked out once --------------------------------------------------------------

test('each row s sort key is computed before the sort, not inside the comparator', () => {
  // A comparator runs about n log n times and asks for two keys each time. On a calculation
  // column the key runs the formula, so a thousand records were evaluated some twenty thousand
  // times to produce a thousand answers.
  const sort = main.slice(main.indexOf('function wbSortItems('));
  const body = sort.slice(0, sort.indexOf('\n}'));
  assert.match(body, /rows\.map\(\(row\) => \(\{[\s\S]*?key: wbSortKey\(/, 'decorate first');
  const comparator = body.slice(body.indexOf('.sort('));
  assert.doesNotMatch(comparator, /wbSortKey\(/, 'the comparator only compares');
  assert.match(body, /return keyed\.map\(\(entry\) => entry\.row\);/, 'and undecorate after');
});

// ---- the offline copy does not lie --------------------------------------------------------------

test('a local write that could not fit is reported instead of swallowed', () => {
  const write = main.slice(main.indexOf('function writeJson(key, value)'));
  const body = write.slice(0, write.indexOf('\n}'));
  assert.match(body, /return true;/);
  assert.match(body, /catch \{\s*return false;\s*\}/, 'the quota failure is an answer, not a shrug');
});

test('the save failure only promises a local copy when there is one', () => {
  // Browsers cap localStorage at roughly 5 MB, which a company document passes at around twelve
  // thousand records. Past that the message told people their work was safe on this device and
  // advised a reload -- the one action that would have discarded it.
  const save = main.slice(main.indexOf('async function saveWorkspaceBuilderDoc('));
  const body = save.slice(0, save.indexOf('\n}'));
  assert.match(body, /const cached = writeJson\(workspaceBuilderStorageKey\(companyId\), doc\);/);
  assert.match(body, /if \(!cached\) warnLocalCopyStopped\(key\);/);
  const promises = [...body.matchAll(/They are safe on this device/g)];
  assert.equal(promises.length, 2, 'both messages still make the promise');
  for (const match of promises) {
    const before = body.slice(Math.max(0, match.index - 200), match.index);
    assert.match(before, /cached\s*$|cached\n\s*\?\s*$|showToast\(cached[\s\S]*$/, 'and only when it is true');
  }
  assert.match(body, /this device has no room to hold them\. Do not reload/);
});
