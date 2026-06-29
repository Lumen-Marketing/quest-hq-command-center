import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const smokeScript = readFileSync(new URL('../scripts/production-smoke.mjs', import.meta.url), 'utf8');

test('dashboard replaces home as the canonical core workspace route', () => {
  assert.match(source, /const CORE_MODULE_IDS = new Set\(\['dashboard', 'jobs', 'tasks', 'users', 'settings'\]\);/);
  assert.match(source, /\{ id: 'dashboard', group: 'Workspace', label: 'Dashboard'/);
  assert.match(source, /\{ label: 'Work', ids: \['dashboard', 'tasks', 'workspaces', 'underwriter'\] \}/);
  assert.match(source, /const section = companyMatch\[2\] \|\| 'dashboard';/);
  assert.match(source, /if \(route\.section === 'dashboard'\) return renderCompanyDashboard\(companyId\);/);
});

test('legacy home and command links redirect to dashboard', () => {
  assert.match(source, /'\/command\.html': companyPath\('dashboard', \{\}, companyId\)/);
  assert.match(source, /if \(route\.section === 'home'\) return companyPath\('dashboard', Object\.fromEntries\(route\.params\.entries\(\)\), route\.companyId\);/);
  assert.match(source, /return companyPath\('dashboard', \{\}, route\.companyId\);/);
  assert.match(source, /if \(!validSections\.includes\(route\.section\)\) return companyPath\('dashboard', \{\}, route\.companyId\);/);
});

test('dashboard uses the team operating dashboard widgets', () => {
  assert.match(source, /Open pipeline/);
  assert.match(source, /Jobs in production/);
  assert.match(source, /Sales pipeline/);
  assert.match(source, /Task status/);
  assert.match(source, /Receivables/);
  assert.match(source, /companyDeals\(companyId\)/);
  assert.match(source, /financeSummary\(companyId\)/);
  assert.match(source, /resolvePipelineStage\('deals', d\.stage, companyId\)/);
  assert.doesNotMatch(source, /Company access'[\s\S]*Workspace health'[\s\S]*Access control'/);
});

test('dashboard CSS includes responsive KPI, chart, and list layouts', () => {
  assert.match(styles, /\.dash-kpis\s*\{/);
  assert.match(styles, /\.dash-overview\s*\{/);
  assert.match(styles, /\.pipe-bar-row\s*\{/);
  assert.match(styles, /\.donut-wrap\s*\{/);
  assert.match(styles, /\.cash-bar\s*\{/);
  assert.match(styles, /@media \(max-width:1300px\)[\s\S]*\.dash-kpis\{ grid-template-columns:repeat\(3,1fr\); \}[\s\S]*\.dash-overview\{ grid-template-columns:1fr; \}/);
});

test('production smoke includes the canonical dashboard route', () => {
  assert.match(smokeScript, /'dashboard'/);
});
