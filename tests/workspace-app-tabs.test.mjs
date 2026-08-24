import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "Can you make these nav menu customisable — I can hide it in the settings, select only what
// to display, or rearrange its order."

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const settings = readFileSync(join(root, 'src', 'workspace', 'app-settings.js'), 'utf8').replace(/\r\n/g, '\n');
const styles = (readFileSync(join(root, 'src', 'styles.css'), 'utf8') + '\n' + readFileSync(join(root, 'src', 'workspace', 'builder.css'), 'utf8'));

// The real chooser, lifted out of main.js and run.
const wbAppTabs = Function(`
  ${main.slice(main.indexOf('const WB_ALL_TABS ='), main.indexOf('\n}\n', main.indexOf('function wbAppTabs')) + 2)}
  return wbAppTabs;
`)();

const ALL = ['dashboard', 'calendar', 'items', 'fields', 'reports', 'automations', 'trash', 'settings'];

test('an app that has never been told otherwise shows every tab', () => {
  assert.deepEqual(wbAppTabs({}), ALL);
  assert.deepEqual(wbAppTabs({ tabs: null }), ALL);
  assert.deepEqual(wbAppTabs(undefined), ALL);
});

test('only the chosen tabs show, in the chosen order', () => {
  assert.deepEqual(wbAppTabs({ tabs: ['items', 'dashboard'] }), ['items', 'dashboard', 'settings']);
  assert.deepEqual(wbAppTabs({ tabs: ['reports'] }), ['reports', 'settings']);
});

test('Settings is always there and always last', () => {
  // It is the only way back to this setting. An app that has hidden the door is one somebody
  // has to be dug out of.
  assert.deepEqual(wbAppTabs({ tabs: [] }), ['settings']);
  assert.deepEqual(wbAppTabs({ tabs: ['settings', 'items'] }), ['items', 'settings']);
  assert.ok(wbAppTabs({ tabs: ['items'] }).includes('settings'));
});

test('a tab name that means nothing is dropped rather than drawn', () => {
  assert.deepEqual(wbAppTabs({ tabs: ['items', 'nope', 'calendar'] }), ['items', 'calendar', 'settings']);
  assert.deepEqual(wbAppTabs({ tabs: ['items', 'items'] }), ['items', 'settings'], 'and listed once');
});

test('a hidden tab cannot strand somebody on it', () => {
  // The fallback used to be 'dashboard', which is a tab an app is now allowed to hide.
  assert.match(main, /const tab = tabs\.includes\(route\.params\.get\('tab'\)\) \? route\.params\.get\('tab'\) : tabs\[0\];/);
});

test('the choice is saved, and survives a reload', () => {
  assert.match(main, /app\.tabs = rows\.filter\(\(row\) => row\.querySelector\('input\[type=checkbox\]'\)\?\.checked\)\.map\(\(row\) => row\.dataset\.wbTabRow\);/);
  // The doc normalizer rebuilds every app explicitly, so anything it does not name is dropped.
  assert.match(main, /\.\.\.\(Array\.isArray\(app\.tabs\) \? \{ tabs: app\.tabs\.filter\(\(tab\) => typeof tab === 'string'\) \} : \{\}\)/);
});

test('the order is read off the rows as drawn, so moving one is the same as ticking one', () => {
  // Reordering is DOM-only: no state to keep in step, and no re-render to lose a tick.
  assert.match(main, /bind\('\[data-wb-tab-move\]'/);
  assert.match(main, /row\.parentNode\.insertBefore/);
  assert.ok(!/wbTabMove.*render\(\)/.test(main), 'moving a row does not repaint the page');
});

test('the settings panel lists every tab, with Settings pinned', () => {
  assert.match(settings, /function tabsField\(app\)/);
  ALL.filter((tab) => tab !== 'settings').forEach((tab) => {
    assert.ok(settings.includes(`${tab}:`), `${tab} is not named in the panel`);
  });
  assert.match(settings, /data-wb-tab-row="settings"/);
  assert.match(settings, /checked disabled/, 'Settings cannot be unticked');
  assert.match(settings, /Always last/);
  // Somebody who cannot manage the workspace is not offered it at all.
  assert.match(settings, /\$\{canManage \? tabsField\(app\) : ''\}/);
});

test('every class the chooser uses is styled', () => {
  ['wb-tab-list', 'wb-tab-row', 'wb-tab-show', 'wb-tab-fixed'].forEach((name) => {
    assert.ok(styles.includes(`.${name}`), `.${name} has no rule`);
  });
});
