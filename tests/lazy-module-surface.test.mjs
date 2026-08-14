import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createRelationshipPicker } from '../src/workspace/relationship-picker.js';

// A lazily fetched module is reached through a loader that resolves to whatever its FACTORY
// returns -- not to the module namespace:
//
//   relationshipPickerModule = mod.createRelationshipPicker({ h });
//   return relationshipPickerModule;
//
// So `loadRelationshipPicker().then((mod) => mod.applyPullValues(...))` only works if the
// factory hands applyPullValues back. It did not. The call was `undefined(...)`, it threw, and
// the `.catch` written to report a failed IMPORT swallowed it. The company-contact copy never
// ran once, in any session, and the console said only "Contact copy failed to load".
//
// The test that was supposed to cover it asserted the `.then((mod) => mod.applyPullValues(...))`
// line matched a regex. It did. That is the fourth bug this session that a source-text
// assertion waved through, so this one resolves the loader and checks the object.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');

/** Every method main.js calls on the object a loader resolves to. */
function methodsCalledOn(loader) {
  const wanted = new Set();
  for (const match of main.matchAll(new RegExp(`${loader}\\(\\)[\\s\\S]{0,200}?mod\\.([A-Za-z_$][\\w$]*)`, 'g'))) {
    wanted.add(match[1]);
  }
  // ...and the cached-module fast path beside it, which calls the same object directly.
  const cache = `${loader.replace(/^load/, '').replace(/^./, (c) => c.toLowerCase())}Module`;
  for (const match of main.matchAll(new RegExp(`${cache}\\.([A-Za-z_$][\\w$]*)\\(`, 'g'))) {
    wanted.add(match[1]);
  }
  return [...wanted];
}

test('the relationship picker hands back everything main.js calls on it', () => {
  const built = createRelationshipPicker({ h: (value) => String(value ?? '') });
  const wanted = methodsCalledOn('loadRelationshipPicker');
  assert.ok(wanted.length >= 2, `expected to find the call sites, found ${wanted.join(', ')}`);
  wanted.forEach((name) => {
    assert.equal(typeof built[name], 'function', `loadRelationshipPicker() resolves to an object with no ${name}()`);
  });
});

test('the copy is reachable the way the contact picker reaches it', () => {
  // Exactly main.js's call: resolve the loader's shape, then use it.
  const built = createRelationshipPicker({ h: (value) => String(value ?? '') });
  const filled = {};
  const target = {
    tagName: 'INPUT',
    value: '',
    dispatchEvent: () => {},
  };
  const scope = { querySelector: () => target };
  const picker = { closest: () => scope, contains: () => false };
  built.applyPullValues(picker, { 'wb-dc72f820-d5e': '+639551766487' });
  filled.phone = target.value;
  assert.equal(filled.phone, '+639551766487');
});

test('a failure to copy is not reported as a failure to load', () => {
  // The handler said "failed to load" for anything that went wrong, including a perfectly
  // loaded module whose method was missing — which is what hid this for two deploys.
  assert.ok(!/console\.error\('Contact copy failed to load'/.test(main));
});
