import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const loadingModule = await import('../src/ui/workspace-loading.js').catch(() => null);
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

test('the first workspace load paints an app-shaped skeleton instead of a spinner card', () => {
  assert.ok(loadingModule?.renderWorkspaceSkeleton, 'workspace skeleton renderer must exist');

  const markup = loadingModule.renderWorkspaceSkeleton({
    brandMarkup: '<img src="/brand.png" alt="" />',
    statusText: 'Loading workspace data...',
  });

  assert.match(markup, /data-workspace-loading-skeleton/);
  assert.match(markup, /class="workspace-skeleton-rail"/);
  assert.match(markup, /class="workspace-skeleton-topbar"/);
  assert.match(markup, /class="workspace-skeleton-content"/);
  assert.match(markup, /class="workspace-skeleton-stat-grid"/);
  assert.match(markup, /<img src="\/brand\.png" alt="" \/>/);
  assert.ok((markup.match(/workspace-skeleton-block/g) || []).length >= 12, 'the shell should show meaningful page structure');
  assert.doesNotMatch(markup, /quest-loader|login-panel/);
});

test('the skeleton reports loading accessibly without exposing placeholder shapes', () => {
  assert.ok(loadingModule?.renderWorkspaceSkeleton, 'workspace skeleton renderer must exist');

  const markup = loadingModule.renderWorkspaceSkeleton({
    statusText: '<img src=x onerror=alert(1)>',
  });

  assert.match(markup, /role="status"/);
  assert.match(markup, /aria-live="polite"/);
  assert.match(markup, /aria-busy="true"/);
  assert.match(markup, /class="sr-only">&lt;img src=x onerror=alert\(1\)&gt;<\/span>/);
  assert.match(markup, /aria-hidden="true"/);
  assert.doesNotMatch(markup, /<img src=x/);
});

test('the workspace skeleton is responsive and stops shimmering for reduced motion', () => {
  assert.match(css, /\.workspace-skeleton-layout\s*\{/);
  assert.match(css, /@keyframes workspace-skeleton-shimmer/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.workspace-skeleton-rail/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.workspace-skeleton-block/);
});

test('the skeleton rail keeps readable branding on light, dark, and custom sidebars', () => {
  const rail = css.match(/\.workspace-skeleton-rail\s*\{[^}]*\}/s)?.[0] || '';
  const brand = css.match(/\.workspace-skeleton-brand\s*\{[^}]*\}/s)?.[0] || '';
  const small = css.match(/\.workspace-skeleton-brand small\s*\{[^}]*\}/s)?.[0] || '';

  assert.match(rail, /background:\s*var\(--deck-bg,/);
  assert.match(brand, /color:\s*var\(--deck-strong,\s*var\(--ink\)\)/);
  assert.doesNotMatch(brand, /color:\s*#fff/);
  assert.match(small, /color:\s*var\(--deck-label,\s*var\(--muted\)\)/);
  assert.match(css, /\[data-sidebar-surface="dark"\] \.workspace-skeleton-brand-mark \.quest-logo-on-light/);
  assert.match(css, /:root\[data-theme="dark"\]:not\(\[data-sidebar-theme\]\) \.workspace-skeleton-rail/);
});

test('content loading uses a reusable skeleton rather than a centered spinner', () => {
  assert.ok(loadingModule?.renderContentSkeleton, 'content skeleton renderer must exist');

  const markup = loadingModule.renderContentSkeleton({
    statusText: '<b>Loading clock</b>',
  });

  assert.match(markup, /class="quest-content-skeleton"/);
  assert.match(markup, /class="quest-content-skeleton-grid"/);
  assert.match(markup, /role="status"/);
  assert.match(markup, /aria-busy="true"/);
  assert.match(markup, /&lt;b&gt;Loading clock&lt;\/b&gt;/);
  assert.ok((markup.match(/workspace-skeleton-block/g) || []).length >= 10);
  assert.doesNotMatch(markup, /<svg|quest-loader/);
});
