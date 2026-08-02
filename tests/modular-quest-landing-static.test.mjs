import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const logoSourceUrl = new URL('../src/assets/questbase-modular-logo.png', import.meta.url);
const logoUrl = new URL('../src/assets/questbase-mark.png', import.meta.url);
const productReferenceUrl = new URL('../src/assets/questbase-interior-jobs.png', import.meta.url);

test('public home uses the approved Modular Quest direction', () => {
  assert.match(source, /document\.title = 'Questbase\.io \| Connected workspaces for service teams'/);
  assert.match(source, /<main class="qb-landing-shell"/);
  assert.match(source, /Run every team from one connected base\./);
  assert.match(source, /Focused for each role\. Connected for the company\./);
  assert.match(source, /Not another disconnected tool\./);
  assert.match(source, /The landing page speaks the same language as the app\./);
  assert.doesNotMatch(source, /Quest HQ Command Center for the whole roofing operation/);
  assert.doesNotMatch(source, /Join early access/);
  assert.doesNotMatch(source, /waitlist-form/);
});

test('landing conversion actions use the existing authentication modes', () => {
  assert.match(source, /data-action="open-auth-modal" data-auth-mode="signin"[^>]*>[\s\S]*?Business login/);
  assert.match(source, /data-action="open-auth-modal" data-auth-mode="register"[^>]*>[\s\S]*?Start workspace/);
  assert.match(source, /data-action="open-auth-modal" data-auth-mode="invite"[^>]*>[\s\S]*?Join by invite/);
  assert.match(source, /\$\{showAuthModal \? renderAuthModal\(returnUrl, inviteToken, authEnabled\) : ''\}/);
  assert.match(source, /session \? `[\s\S]*?Open workspace/);
});

test('workspace product preview is interactive and read-only', () => {
  assert.match(source, /const QUESTBASE_LANDING_WORKSPACES = \{/);
  assert.match(source, /'cold-calling': \{/);
  assert.match(source, /underwriting: \{/);
  assert.match(source, /production: \{/);
  assert.match(source, /data-action="landing-preview-workspace"/);
  assert.match(source, /if \(action === 'landing-preview-workspace'\)/);
  assert.match(source, /renderLandingWorkspacePreview\(node\.dataset\.workspace\)/);
  assert.match(source, /'landing-preview-workspace'/);
});

test('landing assets and responsive visual system ship with the application', () => {
  assert.ok(existsSync(logoUrl), 'expected the selected Questbase logo asset');
  assert.ok(existsSync(productReferenceUrl), 'expected the selected Questbase interior reference asset');
  assert.ok(statSync(logoUrl).size > 0);
  assert.ok(statSync(productReferenceUrl).size > 0);
  // The master artwork stays in the repo as the generator's input, but is no longer
  // imported: rendering a 1254px, 681 KB PNG at ~28px shipped half a megabyte for
  // pixels nobody sees. The landing page uses the same generated mark as the shell.
  assert.ok(existsSync(logoSourceUrl), 'the master artwork is still the generator input');
  assert.match(source, /import questLogoMarkUrl from '\.\/assets\/questbase-mark\.png'/);
  assert.ok(!source.includes('questbase-modular-logo.png'), 'the master should not be bundled');
  assert.match(source, /import questbaseInteriorJobsUrl from '\.\/assets\/questbase-interior-jobs\.png'/);
  assert.match(styles, /\.qb-landing-shell\s*\{/);
  assert.match(styles, /\.qb-landing-hero-grid\s*\{[\s\S]*?grid-template-columns:/);
  assert.match(styles, /\.qb-landing-workspace-pill\.active\s*\{/);
  assert.match(styles, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.qb-landing-product-layout\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(styles, /@media \(prefers-reduced-motion:\s*reduce\)/);
});
