import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const block = main.slice(main.indexOf("if (state.route.name === 'home') {"));
const body = block.slice(0, block.indexOf('\n  }\n'));

test('a signed-in user hitting / lands on the Dashboard', () => {
  // It used to land on Jobs, which made the whole product look like the Jobs module.
  assert.match(body, /navigate\(appHref\(companyPath\('dashboard', \{\}, defaultCompanyId\(\)\)\), \{ replace: true \}\);/);
  assert.ok(!/companyPath\('jobs'/.test(body), 'the old Jobs landing must be gone');
});

test('the landing page is the one section that needs no permission', () => {
  // Jobs is gated on jobs.view, so the old landing dropped anybody without it onto a screen
  // they could not use. The Dashboard module declares an empty permission.
  assert.match(main, /\{ id: 'dashboard', group: 'Workspace', label: 'Dashboard'[^}]*permission: ''/);
});

test('it replaces rather than pushes, so Back still leaves the app', () => {
  assert.match(body, /\{ replace: true \}/);
});

test('password recovery still keeps the landing page', () => {
  // The recovery form lives on the marketing page; navigating away would strand it.
  assert.match(body, /state\.authMode !== 'recovery'/);
});

test('a signed-out visitor still gets the marketing page', () => {
  assert.match(body, /renderLandingPage\(false\);/);
  assert.match(body, /state\.session\?\.auth === 'supabase'/);
});

test('the dashboard route is a real one, not a redirect loop', () => {
  // /company/{id} resolves to section 'dashboard', and routeRedirect canonicalises it. If the
  // landing target were not handled there it would bounce.
  assert.ok(
    main.includes("if (route.section === 'dashboard' && ") && main.includes('.test(route.path)) {'),
    'routeRedirect must canonicalise the bare company path',
  );
  assert.match(main, /if \(route\.section === 'dashboard'\) return renderCompanyDashboard\(companyId\);/);
});
