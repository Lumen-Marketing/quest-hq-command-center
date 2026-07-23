import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

// Regression guard for the Tasks-iframe "X-Frame-Options: deny" refusal.
//
// The embedded task app (/taskmanagement/) is a separate application. When the
// CC shell service worker mediated its iframe navigations, a `/` shell cached
// before X-Frame-Options was relaxed from DENY to SAMEORIGIN kept being served
// into the frame, and the browser refused to display it. The fix: the worker
// leaves /taskmanagement/ entirely to the network, and the cache VERSION was
// bumped so the poisoned shell self-evicts on activate for returning users.

test('service worker leaves the embedded task app to the network', () => {
  // The exclusion must sit in the fetch handler, before the navigate branch that
  // could otherwise serve the cached SPA shell as a fallback.
  const fetchStart = sw.indexOf("addEventListener('fetch'");
  const taskExclusion = sw.indexOf("startsWith('/taskmanagement/')");
  const navigateBranch = sw.indexOf("request.mode === 'navigate'");

  assert.ok(taskExclusion > fetchStart, '/taskmanagement/ exclusion must be in the fetch handler');
  assert.match(
    sw.slice(taskExclusion - 40, taskExclusion + 60),
    /if \(url\.pathname\.startsWith\('\/taskmanagement\/'\)\) return;/,
    'the exclusion must early-return, like the /api/ exclusion',
  );
  assert.ok(
    taskExclusion < navigateBranch,
    'the exclusion must run before the navigate handler so the task frame is never served the shell',
  );
});

test('cache version is past v1 so the poisoned shell self-evicts', () => {
  const match = sw.match(/const VERSION = '(v\d+)'/);
  assert.ok(match, 'VERSION constant not found');
  const n = Number(match[1].slice(1));
  assert.ok(n >= 2, `cache VERSION must be >= v2 to evict the pre-fix shell (found ${match[1]})`);

  // The activate handler must still delete any cache that is not the current one,
  // which is what actually flushes the old version.
  assert.match(sw, /k !== SHELL_CACHE && k !== ASSET_CACHE/);
  assert.match(sw, /caches\.delete\(k\)/);
});
