// Stabilization of the embedded Tasks surface inside Questbase (2026-09-23 production walkthrough):
// the ops cockpit views were unreachable, an open menu ignored Escape/click-away on the host
// page, the task table collided at 740-1100px, and the 761-980px shell had an unstyled tab bar.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const toolbar = read('taskmanagement/js/views/ToolbarMenuView.js');
const host = read('taskmanagement/js/command-center-host.js');
const tasksCss = read('taskmanagement/css/tasks.css');
const menuCss = read('taskmanagement/taskmanagement.css');
const styles = read('src/styles.css');

test('cockpit views are offered in the More menu only when embedded in Questbase', () => {
  const fn = toolbar.slice(toolbar.indexOf('_cockpitViews() {'), toolbar.indexOf('_items()'));
  assert.match(fn, /document\.body\.classList\.contains\('embedded-in-job-center'\)\) return \[\]/);
  for (const [view, label] of [['all', 'All tasks'], ['stuck', 'Stuck'], ['review', 'Needs review'], ['noupdate', 'No update today'], ['recent', 'Recently completed']]) {
    assert.match(fn, new RegExp(`view: '${view}',\\s+label: '${label}'`), `${label} missing`);
  }
  // Same permission gate and counts as the sidebar the embed hides.
  assert.match(fn, /canView\('stuck'\)/);
  assert.match(fn, /this\.controller\.badgeCounts\(\)/);
});

test('picking a cockpit view switches the view through the controller and closes the menu', () => {
  const more = toolbar.slice(toolbar.indexOf("} else if (this.menuFor === 'more') {"), toolbar.indexOf('// ARIA roles'));
  assert.match(more, /data-cockpit-view="\$\{v\.view\}"/);
  assert.match(more, /this\.controller\.setView\(el\.dataset\.cockpitView\);\s+this\.close\(\);/);
  // The existing More actions are still there, below the views.
  assert.match(more, /Saved views[\s\S]*Select tasks[\s\S]*Export/);
  assert.match(menuCss, /\.toolbar-menu-sep \{/);
  assert.match(menuCss, /\.toolbar-menu-count \{/);
});

test('an open menu closes when focus leaves the embedded frame', () => {
  assert.match(host, /if \(integration\.embedded\) \{\s+window\.addEventListener\('blur'/);
  assert.match(host, /App\.Menu && App\.Menu\.isOpen\) App\.Menu\.closeCurrent\('away'\)/);
});

test('task table: titles ellipsize and the 721-1100px band uses a grid that fits', () => {
  assert.match(tasksCss, /#taskViewWrap\.qt-skin \.qt-ttitle \{ display: block; \}/);
  const band = tasksCss.slice(tasksCss.indexOf('@media (min-width: 721px) and (max-width: 1100px)'));
  assert.ok(band.length > 0, 'missing the embed band');
  assert.match(band, /grid-template-columns: 24px 14px minmax\(140px, 1fr\) 104px 84px 104px 76px;/);
  assert.match(band, /\.qt-col-label,\s+#taskViewWrap\.qt-skin \.qt-cell-label \{ display: none; \}/);
  assert.match(band, /\.page-head-widgets \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
  // Seven tracks for the seven visible cells (checkbox, dot, task, status, priority, assignee, due).
  const tracks = band.match(/grid-template-columns: ([^;]+);/)[1].trim().split(/\s+(?![^(]*\))/);
  assert.equal(tracks.length, 7);
});

test('761-980px shell: the tab bar is pinned and styled, the top bar stays one row', () => {
  const at = styles.lastIndexOf('@media (min-width: 761px) and (max-width: 980px)');
  assert.notEqual(at, -1);
  const band = styles.slice(at);
  assert.match(band, /\.mobile-tabbar \{[^}]*position: fixed;[^}]*bottom: 0;/);
  assert.match(band, /grid-auto-flow: column;/);
  assert.match(band, /\.mobile-tabbar a,\r?\n\s+\.mobile-tabbar button \{[^}]*display: grid;/);
  assert.match(band, /\.topbar \.topbar-right \{ display: flex;[^}]*flex-wrap: nowrap;/);
});

test('styles.css keeps its CRLF line endings', () => {
  const raw = readFileSync(new URL('../src/styles.css', import.meta.url));
  let bare = 0;
  for (let i = 0; i < raw.length; i += 1) if (raw[i] === 0x0a && raw[i - 1] !== 0x0d) bare += 1;
  assert.equal(bare, 0);
});
