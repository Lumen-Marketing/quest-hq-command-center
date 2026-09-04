import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('recent-route state initializes before the app can render a cached deep link', () => {
  const initIndex = main.indexOf('init();');
  const keyIndex = main.indexOf("const COMMAND_RECENTS_KEY = 'quest.command.recents';");
  const lastKeyIndex = main.indexOf("let lastRecentKey = '';");

  assert.ok(keyIndex > -1 && keyIndex < initIndex, 'the recents storage key must exist before the first render');
  assert.ok(lastKeyIndex > -1 && lastKeyIndex < initIndex, 'the recents dedupe state must exist before the first render');
});

test('the route is tracked into recents on every rendered company view', () => {
  assert.match(main, /trackRouteForRecents\(state\.route\);/);
  assert.match(main, /function trackRouteForRecents\(route\)/);
  // Dedupes repeated renders of the same view before writing.
  assert.match(main, /dedupeKey === lastRecentKey/);
});

test('recents are per-profile, company and workspace, capped, and most-recent-first', () => {
  assert.match(main, /COMMAND_RECENTS_KEY/);
  assert.match(main, /function commandRecentStorageKey\(companyId, profileId = activeDraftProfileId\(\)\)/);
  assert.match(main, /`\$\{COMMAND_RECENTS_KEY\}\.\$\{owner\}\.\$\{canonicalCompanyId\(companyId\)\}`/);
  assert.match(main, /run: \{ kind: 'record', companyId, workspaceId/);
  assert.match(main, /run: \{ kind: 'navigate', companyId, workspaceId/);
  assert.match(main, /\.slice\(0, COMMAND_RECENTS_MAX\)/);
  assert.match(main, /list\.unshift\(entry\)/);
});

test('stale recents are revalidated and sign-out clears the current profile history', () => {
  assert.match(main, /commandRecentAllowed\(entry, companyId, allowedWorkspaceIds\)/);
  assert.match(main, /commandRecentRecordExists\(entry, companyId, workspaceId\)/);
  assert.match(main, /valid\.length !== list\.length/);
  assert.match(main, /clearCommandRecents\(draftProfileId\);/);
});

test('recent navigation restores its recorded workspace and company', () => {
  assert.match(main, /run\.workspaceId \? \{ workspace: run\.workspaceId \} : \{\}/);
  assert.match(main, /run\.companyId \|\| activeCompanyId\(\)/);
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
