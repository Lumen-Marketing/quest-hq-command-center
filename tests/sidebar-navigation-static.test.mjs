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

test('contacts navigation renders the standalone sales lifecycle instead of legacy contact stages', () => {
  assert.match(source, /const QUEST_SALES_LIFECYCLE_STAGES = \[[\s\S]*?name: 'Prospects'[\s\S]*?name: 'Leads'[\s\S]*?name: 'Underwriting'[\s\S]*?name: 'Estimate sent'[\s\S]*?name: 'Negotiating'[\s\S]*?name: 'Contract out'[\s\S]*?name: 'Won → Jobs'[\s\S]*?name: 'Follow-up'[\s\S]*?name: 'Lost'/);
  assert.match(source, /if \(module\.id === 'contacts'\) return navItemSalesLifecycle\(route, module, companyId\)/);
  assert.match(source, /function navItemSalesLifecycle\(route, module, companyId\)/);
  assert.match(source, /companyPath\('contacts', \{ lifecycle: stage\.key \}, companyId\)/);
  assert.match(source, /function salesLifecycleStageForContact\(contact, companyId/);
  assert.match(source, /state\.contactLifecycleFilter !== 'all'[\s\S]*?salesLifecycleStageForContact\(contact, companyId\)\.key !== state\.contactLifecycleFilter/);

  const lifecycleNavStart = source.indexOf('function navItemSalesLifecycle');
  const lifecycleNavEnd = source.indexOf('function navItemPipeline', lifecycleNavStart);
  const lifecycleNav = source.slice(lifecycleNavStart, lifecycleNavEnd);
  assert.ok(lifecycleNavStart > -1 && lifecycleNavEnd > lifecycleNavStart);
  assert.doesNotMatch(lifecycleNav, /All contacts/);
});

test('desktop navigation adopts the compact Quest command rail', () => {
  assert.match(source, /<aside class="deck quest-nav-v2" aria-label="Quest navigation">/);
  assert.match(source, /class="sidebar-scope-toggle"[\s\S]*?data-sidebar-scope="my-work"[\s\S]*?data-sidebar-scope="company"/);
  assert.match(styles, /\.quest-app\s*\{[\s\S]*?--sidebar-width:\s*264px/);
  assert.match(styles, /\.quest-nav-v2\s*\{[\s\S]*?background:\s*#fff/);
  assert.match(styles, /\.quest-nav-v2 \.side-item\s*\{[\s\S]*?min-height:\s*40px[\s\S]*?border-radius:\s*8px/);
  assert.match(styles, /\.quest-nav-v2 \.side-sub-link\s*\{[\s\S]*?min-height:\s*36px/);
});

test('sidebar scope is interactive without weakening module permissions', () => {
  assert.match(source, /const SIDEBAR_SCOPE_GROUPS = \{/);
  assert.match(source, /function sidebarGroupsForScope\(route\)/);
  assert.match(source, /data-action="set-sidebar-scope"/);
  assert.match(source, /if \(action === 'set-sidebar-scope'\)/);
  assert.match(source, /\.filter\(\(module\) => module && canViewModule\(module, companyId\)\)/);
  assert.match(source, /if \(module\.id === 'contacts'\) return navItemSalesLifecycle/);
  assert.match(source, /if \(module\.id === 'jobs' \|\| module\.id === 'deals'\) return navItemPipeline/);
});

test('settings remains directly reachable from the compact profile footer', () => {
  assert.match(source, /class="deck-settings-link[^"]*" href="\$\{appHref\(companyPath\('settings'/);
  assert.match(source, /aria-label="Settings"/);
  assert.match(styles, /\.quest-nav-v2 \.deck-settings-link\s*\{/);
});

test('the topbar search is visible on both desktop and mobile', () => {
  assert.match(source, /class="global-search topbar-global-search"/);
  // Desktop shows the topbar search (the sidebar no longer carries a search bar).
  assert.match(styles, /@media \(min-width:\s*901px\)\s*\{[\s\S]*?\.topbar-global-search\s*\{\s*display:\s*grid/);
  assert.match(styles, /@media \(max-width:\s*900px\)\s*\{[\s\S]*?\.topbar-global-search\s*\{\s*display:/);
});

test('collapsed command rail keeps icon-only rows and a flexible scroll region', () => {
  assert.match(styles, /\.sidebar-collapsed \.quest-nav-v2\s*\{[\s\S]*?grid-template-rows:\s*auto auto minmax\(0, 1fr\) auto/);
  assert.match(styles, /\.sidebar-collapsed \.quest-nav-v2 \.deck-brand\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(styles, /\.sidebar-collapsed \.quest-nav-v2 \.side-item\s*\{[\s\S]*?grid-template-columns:\s*1fr[\s\S]*?padding-inline:\s*0/);
});
