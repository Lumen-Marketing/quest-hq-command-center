import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('live Supabase users are counted from memberships, not legacy team member seeds', () => {
  assert.match(source, /function companyAccessUsers\(companyId = activeCompanyId\(\)\)/);
  assert.match(source, /if \(state\.session\?\.auth !== 'supabase'\) \{/);
  assert.match(source, /companyMembers\(companyId\)\.forEach\(\(member\) => \{/);
  assert.match(source, /state\.memberships\s*\n\s*\.filter\(\(membership\) => membership\.company_id === companyId\)/);
});
