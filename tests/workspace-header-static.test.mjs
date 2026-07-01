import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const logoAssetUrl = new URL('../src/assets/quest-hq-logo-mark.png', import.meta.url);

test('standard workspace headers collapse to actions only while notices keep readable copy', () => {
  assert.match(source, /function isNoticeWorkspaceHeader\s*\(/);
  assert.match(source, /if \(!isNoticeWorkspaceHeader\(title,\s*summary\)\)\s*\{/);
  assert.match(source, /<section class="workspace-head workspace-head-actions-only">/);
  assert.match(source, /return actions \? `[\s\S]*workspace-head-actions-only[\s\S]*` : '';/);
  assert.match(source, /<h1>\$\{h\(title\)\}<\/h1>/);
  assert.match(styles, /\.sr-only\s*\{/);
  assert.match(styles, /\.workspace-head-actions-only\s*\{/);
  assert.match(styles, /\.workspace-head-actions-only\s*\{[^}]*border-bottom:\s*0;/s);
  assert.match(styles, /\.workspace-head-actions-only\s+\.head-actions\s*\{/);
});

test('Quest HQ brand surfaces use the generated logo mark instead of placeholder badges', () => {
  assert.ok(existsSync(logoAssetUrl), 'Expected generated Quest HQ logo mark asset');
  assert.match(source, /import questLogoMarkUrl from '\.\/assets\/quest-hq-logo-mark\.png';/);
  assert.match(source, /function questLogoImage\(alt = 'Quest HQ'\)/);
  assert.match(source, /class="logo logo-image-mark"/);
  assert.match(source, /class="side-mark logo-image-mark"/);
  assert.match(source, /questLogoImage\('Quest Client Portal'\)/);
  assert.doesNotMatch(source, /<span class="side-mark">Q<\/span>/);
  assert.doesNotMatch(source, /svgIcon\('q-logo', 'brand-symbol'\)/);
  assert.match(styles, /\.logo-image-mark\s*\{/);
  assert.match(styles, /\.logo-image-mark \.quest-logo-image\s*\{/);
  assert.match(styles, /\.landing-nav \.landing-brand \.side-mark\.logo-image-mark/);
});
