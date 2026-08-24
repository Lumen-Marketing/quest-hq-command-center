import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "why is it in a different card"
//
// Because two unrelated components were both called wb-pick. The Button field's "which fields
// travel" list is a grid of checkboxes inside a dialog; the New Field icon dropdown is a panel
// that hangs under a button. Same names, one stylesheet, and the later rule won -- so the grid
// of checkboxes inherited `position: absolute; left: 0; right: 0` from the dropdown, tore itself
// out of the dialog and landed as a full-width white card across the bottom of the window.
//
// Neither component was wrong on its own, which is what makes this worth a test rather than a
// fix: nothing in either file looks broken, and the failure is only visible on screen.

const srcDir = fileURLToPath(new URL('../src/', import.meta.url));
const css = (readFileSync(join(srcDir, 'styles.css'), 'utf8') + '\n' + readFileSync(join(srcDir, 'workspace', 'builder.css'), 'utf8'));

const walk = (dir) => readdirSync(dir).flatMap((entry) => {
  const full = join(dir, entry);
  if (statSync(full).isDirectory()) return walk(full);
  return full.endsWith('.js') ? [full] : [];
});

/** Every class name written into markup, and which files write it. */
const emitters = new Map();
for (const file of walk(srcDir)) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/class="([^"${]*)/g)) {
    for (const name of m[1].trim().split(/\s+/)) {
      if (!name) continue;
      if (!emitters.has(name)) emitters.set(name, new Set());
      emitters.get(name).add(file.slice(srcDir.length).split('\\').join('/'));
    }
  }
}

test('the two components that collided no longer share a name', () => {
  const carry = 'src/workspace/field-config-ui.js';
  const dropdown = 'src/workspace/quick-create.js';
  for (const name of ['wb-pick', 'wb-pick-list']) {
    const who = emitters.get(name) || new Set();
    assert.ok(!who.has(carry), `${name} is the dropdown's; the carry list must not use it`);
  }
  assert.ok((emitters.get('wb-carry-list') || new Set()).size, 'the carry list has a name of its own');
  assert.deepEqual([...(emitters.get('wb-pick-list') || [])], ['workspace/quick-create.js'],
    'wb-pick-list belongs to the dropdown, and only to it');
});

test('and both are still styled, under their own names', () => {
  // A rename that forgets the stylesheet is an unstyled panel, which looks like a different bug.
  for (const name of ['wb-carry-list', 'wb-carry', 'wb-pick-list', 'wb-pick']) {
    assert.ok(css.includes(`.${name} `) || css.includes(`.${name} {`) || css.includes(`.${name}.`),
      `.${name} has no rule`);
  }
});

test('a positioned dropdown panel and a static grid are not the same class', () => {
  // The specific shape of the bug: one rule takes an element out of flow, the other assumes it
  // stays in. If these two ever land on one name again, this is what it costs.
  const dropdown = css.slice(css.indexOf('.wb-pick-list {'));
  assert.match(dropdown.slice(0, 200), /position: absolute/);
  const carry = css.slice(css.indexOf('.wb-carry-list {'));
  assert.match(carry.slice(0, 200), /display: grid/);
  assert.ok(!/position:\s*absolute/.test(carry.slice(0, 200)), 'the carry list stays in the dialog');
});
