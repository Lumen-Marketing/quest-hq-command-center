import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../src/help/help-center-page.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/help/help-center.css', import.meta.url), 'utf8');

test('Help Center is a real company route loaded outside subscription and plugin gates', () => {
  assert.match(main, /\{ id: 'help',[^\n]*label: 'Help Center'[^\n]*permission: '' \}/);
  assert.match(main, /import\('\.\/help\/help-center-page\.js'\)/);
  const helpRoute = main.indexOf("if (route.section === 'help') return renderHelpCenterPage(route, companyId);");
  const subscriptionGate = main.indexOf('if (!subscriptionAllowsCompany(companyId)', main.indexOf('function renderWorkspace(route)'));
  assert.ok(helpRoute > -1, 'help route should render explicitly');
  assert.ok(helpRoute < subscriptionGate, 'help must remain available when billing blocks other modules');
});

test('desktop, account, and mobile navigation all expose Help Center links', () => {
  assert.match(main, /class="btn help-center-trigger"[^>]*href="\$\{appHref\(companyPath\('help'/);
  assert.match(main, /class="account-help-link"[^>]*href="\$\{appHref\(companyPath\('help'/);
  assert.match(main, /class="more-sheet-item mobile-help-center/);
  assert.match(main, /<span>Help Center<\/span>/);
});

test('help search navigates through the SPA and preserves the active workspace', () => {
  assert.match(main, /event\.target\.matches\('\[data-help-search-form\]'\)/);
  assert.match(main, /navigate\(companyPath\('help', params, activeCompanyId\(\)\)\)/);
  assert.match(page, /companyPath\('help', params, companyId\)/);
});

test('help content is permission-aware and the stylesheet is lazy and responsive', () => {
  assert.match(main, /if \(permission && !can\(permission, companyId\)\) return false/);
  assert.match(main, /return Boolean\(module\) && canViewModule\(module, companyId\)/);
  assert.match(page, /typeof document !== 'undefined'[^\n]*import\('\.\/help-center\.css'\)/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /\.help-search \.btn[^}]*min-height: 44px/s);
});

test('failed lazy loads offer an in-app retry without replacing the support flow', () => {
  assert.match(main, /data-action="retry-help-center"/);
  assert.match(main, /action === 'retry-help-center'/);
  assert.match(page, /data-action="open-support"/);
});
