import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const companyMembersBody = source.slice(source.indexOf('function companyMembers(companyId = activeCompanyId())'), source.indexOf('function companyAccessUsers(companyId = activeCompanyId())'));
const liveBranchBody = companyMembersBody.slice(companyMembersBody.indexOf("if (state.session?.auth === 'supabase')"), companyMembersBody.indexOf('return state.teamMembers.filter'));
const memberNameBody = source.slice(source.indexOf('function memberName(id)'), source.indexOf('function formatPhoneNumber(value)'));
const contactOwnerOptionsBody = source.slice(source.indexOf('function contactOwnerOptions(companyId, selectedOwner = \'\')'), source.indexOf('function profileName(id)'));

test('live company members come from active memberships instead of fallback team member seeds', () => {
  assert.match(companyMembersBody, /state\.session\?\.auth === 'supabase'/);
  assert.match(companyMembersBody, /state\.memberships\s*\n\s*\.filter\(\(membership\) => membership\.company_id === companyId && membership\.status === 'active'\)/);
  assert.match(companyMembersBody, /profileById\(membership\.profile_id\)/);
  assert.doesNotMatch(liveBranchBody, /return state\.teamMembers\.filter\(\(member\) => Array\.isArray\(member\.company_ids\)/);
});

test('member display names resolve live profile ids before legacy team member ids', () => {
  assert.match(memberNameBody, /const profile = profileById\(id\)/);
  assert.match(memberNameBody, /profile\?\.full_name \|\| profile\?\.email/);
  assert.match(memberNameBody, /state\.teamMembers\.find/);
});

test('owner dropdowns do not preserve stale selected owners outside active workspace members', () => {
  assert.match(contactOwnerOptionsBody, /const activeOwners = compactUnique\(owners\)/);
  assert.match(contactOwnerOptionsBody, /activeOwners\.includes\(selected\)/);
  assert.doesNotMatch(contactOwnerOptionsBody, /compactUnique\(\[personOwnerDisplayName\(selectedOwner, companyId\), \.\.\.owners\]\)/);
});
