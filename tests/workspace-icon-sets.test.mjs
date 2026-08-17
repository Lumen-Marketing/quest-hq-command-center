import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { WB_APP_ICONS, WB_WS_ICONS } from '../src/workspace/icon-sets.js';

// The icon lists left the entry bundle: a hundred-odd Tabler class names is a list nobody
// sees until they open a picker, and it was costing every first paint. main.js keeps only the
// two defaults, because normalising a stored document runs on boot and has to name a fallback
// before anything can be fetched. That split is what these tests hold together.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const builderModal = readFileSync(join(root, 'src', 'workspace', 'builder-modal.js'), 'utf8');
const appSettings = readFileSync(join(root, 'src', 'workspace', 'app-settings.js'), 'utf8');

test('the defaults in main.js are the first entry of each list', () => {
  // Otherwise a new app is created with one icon and the picker shows a different one
  // selected, which reads as the picker having failed to save.
  assert.match(main, new RegExp(`const WB_DEFAULT_WS_ICON = '${WB_WS_ICONS[0]}';`));
  assert.match(main, new RegExp(`const WB_DEFAULT_APP_ICON = '${WB_APP_ICONS[0]}';`));
});

test('main.js no longer carries either list', () => {
  const body = main.replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/const WB_APP_ICONS =/.test(body), 'that would put it back in the entry bundle');
  assert.ok(!/const WB_WS_ICONS =/.test(body));
});

test('the grid is no longer in main.js at all', () => {
  // It moved into app-settings.js, its only caller, which is already a lazy chunk. Keeping it in
  // main.js meant every session that never opened the Settings tab carried an icon picker.
  assert.ok(!main.includes('function wbAppIconGrid('), 'that is entry-bundle weight nobody sees');
  assert.ok(!main.includes('function wbIconLabel('), 'and so is reading a class name aloud');
  assert.ok(!/wbAppIconGrid|wbIconLabel/.test(main), 'nor may it still be threaded through a ctx');
});

test('the app-settings grid loads the list before it draws one', () => {
  const at = appSettings.indexOf('function wbAppIconGrid(');
  assert.notEqual(at, -1, 'the grid is not in app-settings.js either');
  const body = appSettings.slice(at, appSettings.indexOf('\n  }', at));
  // A loader, not an empty box: an icon picker with no icons in it reads as broken rather
  // than as pending.
  assert.match(body, /questLoader\('Loading icons'\)/);
  assert.match(body, /loadIconSets\(\)\.then\(\(\) => render\(\)\)/);
  // And the list arrives by dynamic import, which is the only thing that keeps it out of the
  // entry chunk -- a static one would be bundled straight back into it.
  assert.match(appSettings, /import\('\.\/icon-sets\.js'\)/);
});

test('builder-modal imports the lists rather than taking them through ctx', () => {
  // It is already its own lazy chunk, so a static import puts the list in that chunk. Passing
  // it through ctx would have kept it in the entry bundle, which is the thing being avoided.
  assert.match(builderModal, /import \{ WB_APP_ICONS, WB_WS_ICONS, iconLabel \} from '\.\/icon-sets\.js';/);
  const ctx = builderModal.slice(builderModal.indexOf('const {'), builderModal.indexOf('} = ctx;'));
  assert.ok(!/WB_APP_ICONS|WB_WS_ICONS/.test(ctx));
});

test('an imported app keeps an icon this build does not list, if it is shaped like one', () => {
  // The value is interpolated into class="ti ${icon}", so the shape is what has to hold --
  // and list membership would silently reset an app exported from a build with more icons.
  assert.match(main, /const WB_ICON_CLASS = \/\^ti-\[a-z0-9-\]\+\$\/;/);
  assert.match(main, /WB_ICON_CLASS\.test\(String\(src\.icon \|\| ''\)\) \? src\.icon : WB_DEFAULT_APP_ICON/);
  assert.ok(WB_ICON_CLASS_LIKE(WB_APP_ICONS), 'every listed icon must itself pass that check');
});

function WB_ICON_CLASS_LIKE(list) {
  return list.every((icon) => /^ti-[a-z0-9-]+$/.test(icon));
}
