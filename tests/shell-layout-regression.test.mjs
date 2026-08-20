import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('status and permission banners share one explicit shell grid row', () => {
  const shellStart = main.indexOf('function shellTemplate');
  const shellEnd = main.indexOf('\nfunction renderMobileStatusRail', shellStart);
  const shell = main.slice(shellStart, shellEnd);
  assert.match(shell, /<div class="shell-banners">[\s\S]*renderMobileStatusRail[\s\S]*renderReadOnlyDemoBanner[\s\S]*renderRolePreviewBanner[\s\S]*<\/div>/);
  assert.match(styles, /\.shell-banners\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*2;/s);
  assert.match(styles, /grid-template-rows:\s*64px auto minmax\(0,\s*1fr\)/);
  assert.match(styles, /\.work-surface\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*3;/s);
});

test('the mobile shell keeps banners above content and the fixed bottom navigation', () => {
  assert.match(styles, /@media \(max-width:\s*980px\)[\s\S]*?\.shell-banners\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*2;/);
  assert.match(styles, /@media \(max-width:\s*980px\)[\s\S]*?\.work-surface\s*\{[^}]*grid-row:\s*3;/);
  assert.match(styles, /\.readonly-demo-banner\s*\{[^}]*grid-template-columns:\s*auto minmax\(0,\s*1fr\)/s);
});

test('compact settings tabs scroll as whole labels instead of clipping text', () => {
  assert.match(styles, /\.compact-tabbar\s*\{[^}]*overflow-x:\s*auto;[^}]*flex-wrap:\s*nowrap;/s);
  assert.match(styles, /\.compact-tabbar\s*>\s*a\s*\{[^}]*flex:\s*0 0 auto;[^}]*white-space:\s*nowrap;/s);
});
