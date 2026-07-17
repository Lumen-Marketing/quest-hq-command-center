import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('command center uses the approved IBM Plex typography system', () => {
  assert.match(html, /family=IBM\+Plex\+Mono:[^&]+&family=IBM\+Plex\+Sans:/);
  assert.match(styles, /--font-sans:\s*'IBM Plex Sans'/);
  assert.match(styles, /--font-mono:\s*'IBM Plex Mono'/);
});

test('navigation follows the approved job center information architecture', () => {
  assert.match(source, /const NAVIGATION_LABELS = \{[\s\S]*dashboard:\s*'Home'[\s\S]*messages:\s*'Inbox'[\s\S]*underwriter:\s*'Estimator'[\s\S]*analytics:\s*'Reports'[\s\S]*users:\s*'People'[\s\S]*calendar:\s*'Meetings'/);
  assert.match(source, /\{ label: 'Work', ids: \['dashboard', 'tasks', 'messages'\] \}/);
  assert.match(source, /\{ label: 'Pipeline', ids: \['contacts'\] \}/);
  assert.match(source, /\{ label: 'Production', ids: \['jobs'\] \}/);
  assert.match(source, /\{ label: 'Tools', ids: \['underwriter', 'proposals'\] \}/);
  assert.match(source, /\{ label: 'Review', ids: \['analytics', 'users', 'calendar'\] \}/);
  assert.match(source, /\{ label: 'Build', ids: \['templates', 'automations'\] \}/);
  assert.match(source, /function navigationLabel\(moduleId, fallbackLabel\)/);
  assert.match(source, /navigationLabel\(module\.id, module\.label\)/);
});

test('desktop navigation adopts the compact Quest command rail', () => {
  assert.match(source, /<aside class="deck quest-nav-v2" aria-label="Quest navigation">/);
  assert.match(source, /class="deck-global-search"[\s\S]*?data-action="command-open"[\s\S]*?<span>Search or jump to/);
  assert.match(source, /class="sidebar-scope-toggle"[\s\S]*?data-sidebar-scope="my-work"[\s\S]*?data-sidebar-scope="company"/);
  assert.match(styles, /\.quest-app\s*\{[\s\S]*?--sidebar-width:\s*264px/);
  assert.match(styles, /\.quest-nav-v2\s*\{[\s\S]*?background:\s*#fff/);
  assert.match(styles, /\.quest-nav-v2 \.side-item\s*\{[\s\S]*?min-height:\s*34px[\s\S]*?border-radius:\s*8px/);
});

test('sidebar scope is interactive without weakening module permissions', () => {
  assert.match(source, /const SIDEBAR_SCOPE_GROUPS = \{/);
  assert.match(source, /function sidebarGroupsForScope\(route\)/);
  assert.match(source, /data-action="set-sidebar-scope"/);
  assert.match(source, /if \(action === 'set-sidebar-scope'\)/);
  assert.match(source, /\.filter\(\(module\) => module && canViewModule\(module, companyId\)\)/);
  assert.match(source, /if \(module\.id === 'jobs' \|\| module\.id === 'contacts' \|\| module\.id === 'deals'\) return navItemPipeline/);
});

test('settings remains directly reachable from the compact profile footer', () => {
  assert.match(source, /class="deck-settings-link[^"]*" href="\$\{appHref\(companyPath\('settings'/);
  assert.match(source, /aria-label="Settings"/);
  assert.match(styles, /\.quest-nav-v2 \.deck-settings-link\s*\{/);
});

test('mobile keeps the topbar search while the desktop rail owns desktop search', () => {
  assert.match(source, /class="global-search topbar-global-search"/);
  assert.match(styles, /@media \(min-width:\s*901px\)\s*\{[\s\S]*?\.topbar-global-search\s*\{\s*display:\s*none/);
  assert.match(styles, /@media \(max-width:\s*900px\)\s*\{[\s\S]*?\.topbar-global-search\s*\{\s*display:/);
});

test('collapsed command rail keeps icon-only rows and a flexible scroll region', () => {
  assert.match(styles, /\.sidebar-collapsed \.quest-nav-v2\s*\{[\s\S]*?grid-template-rows:\s*auto auto minmax\(0, 1fr\) auto/);
  assert.match(styles, /\.sidebar-collapsed \.quest-nav-v2 \.deck-brand\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(styles, /\.sidebar-collapsed \.quest-nav-v2 \.side-item\s*\{[\s\S]*?grid-template-columns:\s*1fr[\s\S]*?padding-inline:\s*0/);
});
