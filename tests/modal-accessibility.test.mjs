import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Normalised: the working tree is CRLF, so \n-anchored slices would run past the end
// of whatever they are meant to bound.
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const fn = (name) => {
  const start = main.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} should exist`);
  const rest = main.slice(start);
  return rest.slice(0, rest.indexOf('\n}\n') + 2);
};

test('both modal shells are announced as dialogs', () => {
  const generic = fn('renderModalShell');
  assert.match(generic, /role="dialog"/);
  assert.match(generic, /aria-modal="true"/);
  // A dialog with no accessible name is announced as just "dialog".
  assert.match(generic, /aria-labelledby="modalTitle"/);
  assert.match(generic, /<h2 id="modalTitle">/);

  const builder = fn('wbModalShell');
  assert.match(builder, /role="dialog"/, 'the builder modal was not announced as a dialog');
  assert.match(builder, /aria-modal="true"/);
});

test('an open modal takes focus instead of leaving it on a destroyed trigger', () => {
  const sync = fn('syncModalFocus');
  assert.match(sync, /activeModalOverlay\(\)/);
  assert.match(sync, /panel\.focus\(\)/, 'the dialog container should take focus so its title is read');
  assert.match(sync, /first\?\.focus\(\)/, 'and fall back to the first control');
});

test('closing a modal returns focus to whatever opened it', () => {
  const sync = fn('syncModalFocus');
  assert.match(sync, /state\.focusReturn/);
  assert.match(sync, /state\.focusReturn = ''/, 'the pending restore must be cleared so it fires once');
  assert.match(sync, /querySelector\(selector\)\?\.focus\(\)/);
});

test('the trigger is recorded as a selector, because the node does not survive a render', () => {
  const build = fn('modalTriggerSelector');
  assert.match(build, /closest/);
  assert.match(build, /CSS\.escape/, 'attribute values must be escaped to build a valid selector');
  // Only a click that actually opened a modal should arm a restore.
  assert.match(main, /if \(!hadModal && trigger && \(state\.modal \|\| state\.builderModal\)\) state\.focusReturn = trigger;/);
});

test('focus syncing is queued once, at the top of render, so early returns still get it', () => {
  // Both run at the top of render so every early return is covered. Scroll capture comes
  // first because it has to read the outgoing DOM before innerHTML is replaced.
  assert.match(main, /function render\(\) \{\n  const keptScroll = captureScrollForRender\(\);/);
  assert.match(main, /queueMicrotask\(syncModalFocus\);/);
});

test('the focus trap and the focus mover agree on what is focusable', () => {
  assert.equal((main.match(/const FOCUSABLE_SELECTOR = /g) || []).length, 1);
  const trap = fn('trapModalFocus');
  assert.match(trap, /FOCUSABLE_SELECTOR/, 'the trap should use the shared selector, not its own copy');
});

test('every icon-only control has an accessible name', () => {
  const buttons = [...main.matchAll(/<button\b[^>]*>([\s\S]{0,400}?)<\/button>/g)];
  const unnamed = [];
  for (const match of buttons) {
    const tag = match[0].slice(0, match[0].indexOf('>') + 1);
    const inner = match[1];
    const hasIcon = /<i\b[^>]*class="[^"]*\bti\b/.test(inner) || /svgIcon\(/.test(inner);
    if (!hasIcon) continue;
    // Anything left after removing the icon itself -- static text or an interpolation
    // that renders a label -- is an accessible name.
    const rest = inner
      .replace(/<i\b[^>]*>\s*<\/i>/g, '')
      .replace(/\$\{svgIcon\([^}]*\}/g, '')
      .replace(/<svg[\s\S]*?<\/svg>/g, '')
      .trim();
    if (rest !== '') continue;
    if (!/aria-label=|title=|aria-labelledby=/.test(tag)) unnamed.push(tag.replace(/\s+/g, ' ').slice(0, 120));
  }
  assert.deepEqual(unnamed, [], 'icon-only buttons read as just "button" without a name');
});

test('icon picker options are distinguishable and read as a chosen state', () => {
  assert.match(main, /function wbIconLabel\(/);
  // "ti-building-store" read aloud verbatim is worse than nothing.
  assert.ok(!main.includes('aria-label="Icon ${h(icon)}"'), 'the raw class name is not a label');
  const picks = [...main.matchAll(/<button class="wb-emoji-opt[^>]*>/g)];
  assert.equal(picks.length, 3);
  for (const pick of picks) {
    assert.match(pick[0], /aria-label="Icon \$\{h\(wbIconLabel\(icon\)\)\}"/);
    assert.match(pick[0], /aria-pressed=/);
    assert.match(pick[0], /type="button"/);
  }
});
