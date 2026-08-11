import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { collectTableIcons, parseIconFont } from '../scripts/icon-usage.mjs';

// Workspace settings is fetched on demand now; same surface, two files.
const main = (readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/settings/workspace-settings.js', import.meta.url), 'utf8')
  // The workspace icon dialog is a fetched module too; same surface, one more file.
  + readFileSync(new URL('../src/workspace/icon-modal.js', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
const subset = readFileSync(new URL('../src/tabler-icons.css', import.meta.url), 'utf8');
const upstream = readFileSync(new URL('../taskmanagement/vendor/tabler-icons/tabler-icons.min.css', import.meta.url), 'utf8');
const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};
const table = main.match(/const WORKSPACE_ICON_OPTIONS = \[[\s\S]*?\n\];/)[0];
const entries = [...table.matchAll(/\{ key: '([^']+)', label: '([^']+)', line: '([^']+)'(?:, solid: '([^']+)')?, group: '([^']+)' \}/g)]
  .map(([, key, label, line, solid, group]) => ({ key, label, line, solid, group }));

test('the library is large, grouped, and parses cleanly', () => {
  assert.ok(entries.length >= 100, `expected 100+ icons, parsed ${entries.length}`);
  const groups = new Set(entries.map((e) => e.group));
  assert.ok(groups.size >= 6, `expected several groups, got ${[...groups].join(', ')}`);
  // A flat grid of 120 icons is unusable; sections are what make it scannable.
  assert.match(main, /const WORKSPACE_ICON_GROUPS = \[\.\.\.new Set\(WORKSPACE_ICON_OPTIONS\.map\(\(item\) => item\.group\)\)\]/);
});

test('nothing is fetched from the internet — both packs ship in the bundled font', () => {
  // The whole point of the local-only choice: no third-party request, works offline.
  assert.ok(!/fonts\.googleapis|fonts\.gstatic|material-symbols/i.test(main), 'no external icon source');
  for (const e of entries) {
    assert.ok(subset.includes(`.ti-${e.line}:before`), `${e.key}: ti-${e.line} missing from the shipped subset`);
    if (e.solid) assert.ok(subset.includes(`.ti-${e.solid}:before`), `${e.key}: ti-${e.solid} missing from the shipped subset`);
  }
});

test('every declared glyph is a real upstream glyph', () => {
  const font = parseIconFont(upstream);
  const bad = entries.flatMap((e) => [e.line, e.solid].filter(Boolean)).filter((n) => !font.has(n));
  assert.deepEqual(bad, [], `not in Tabler: ${bad.join(', ')}`);
});

test('Solid falls back to the line glyph rather than showing a gap', () => {
  // Tabler ships filled variants for well under half the set. Dropping those icons from
  // the Solid pack would make the style choice silently change which icons exist.
  const withoutSolid = entries.filter((e) => !e.solid);
  assert.ok(withoutSolid.length > 0, 'this test is meaningless if every icon has a filled variant');
  assert.match(fn('workspaceIconGlyph'), /\(workspaceIconPack\(pack\) === 'solid' && opt\.solid\) \? opt\.solid : opt\.line/);
});

test('an unknown pack falls back instead of rendering nothing', () => {
  assert.match(fn('workspaceIconPack'), /WORKSPACE_ICON_PACKS\.some\(\(\[id\]\) => id === clean\) \? clean : WORKSPACE_ICON_PACK_DEFAULT/);
  assert.match(main, /const WORKSPACE_ICON_PACK_DEFAULT = 'solid';/);
});

test('keys are unique and permanent, since companies store them', () => {
  const keys = entries.map((e) => e.key);
  assert.equal(new Set(keys).size, keys.length);
  // Every key that existed before this expansion must still be here, or those companies
  // silently reset to the first icon in the list.
  const previous = 'home building store warehouse briefcase tools tool hammer helmet ruler truck delivery users messages calendar folder chart shield star contacts checklist approved map-pin map paint plugin alerts book receipt clock camera photo file database lock key flag partner support target rocket bolt package desktop cloud mail phone headset'.split(' ');
  const orphaned = previous.filter((k) => !keys.includes(k));
  assert.deepEqual(orphaned, [], `these companies would lose their icon: ${orphaned.join(', ')}`);
});

test('the subset builder can see names that only exist as table data', () => {
  // The glyph is chosen at runtime, so it never appears next to a `ti-` prefix. Without
  // this collector the whole library would be subsetted away and render as blank boxes.
  const found = collectTableIcons("  { key: 'x', label: 'X', line: 'home', solid: 'home-filled', group: 'G' },");
  assert.deepEqual([...found].sort(), ['home', 'home-filled']);
});

test('the runtime lookup is exempted from the dynamic-name guard, not silently ignored', () => {
  const usage = readFileSync(new URL('../scripts/icon-usage.mjs', import.meta.url), 'utf8');
  assert.match(usage, /const TABLE_RESOLVED = \['workspaceIconGlyph'\];/);
  // The exemption is only safe because a collector covers those names; the comment ties
  // the two together so one cannot be added without the other.
  assert.match(usage, /Adding a helper here without a matching collector would ship a/);
});

test('the pack is a per-company choice that reaches the save', () => {
  assert.match(main, /data-action="set-workspace-icon-pack"/);
  assert.match(main, /setWorkspaceIconDraft\(activeCompanyId\(\), \{ icon_pack: node\.dataset\.iconPack \}\)/);
  assert.match(main, /const iconPack = workspaceIconPack\(form\.icon_pack\);/);
  assert.match(main, /<input type="hidden" name="icon_pack"/);
});

test('the picker states where the icons come from', () => {
  // Someone choosing a "pack" reasonably wonders whether it phones home.
  assert.match(main, /Both styles ship with Questbase — nothing is fetched from the internet/);
});
