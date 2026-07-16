import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('the route is tracked into recents on every rendered company view', () => {
  assert.match(main, /trackRouteForRecents\(state\.route\);/);
  assert.match(main, /function trackRouteForRecents\(route\)/);
  // Dedupes repeated renders of the same view before writing.
  assert.match(main, /entry\.key === lastRecentKey/);
});

test('recents are per-company, capped, and most-recent-first', () => {
  assert.match(main, /COMMAND_RECENTS_KEY/);
  assert.match(main, /\.slice\(0, COMMAND_RECENTS_MAX\)/);
  assert.match(main, /list\.unshift\(entry\)/);
});

test('recents lead the empty-query results', () => {
  assert.match(main, /if \(!query\.trim\(\)\) return \[\.\.\.commandRecents\(activeCompanyId\(\)\), \.\.\.results\]/);
});

test('recents capture records (contact/job/deal/proposal) and modules', () => {
  for (const param of ['contact_id', 'job_id', 'deal_id', 'proposal_id']) {
    assert.ok(main.includes(`'${param}'`), `recents should track ${param}`);
  }
  // A module-level fallback when no record param is present.
  assert.match(main, /MODULE_REGISTRY\.find\(\(m\) => m\.id === route\.section\)/);
});
