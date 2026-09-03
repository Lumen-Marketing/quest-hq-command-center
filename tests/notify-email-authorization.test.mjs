import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  canSendCompanyNotificationEmail,
  NOTIFICATION_EMAIL_PERMISSION,
  NOTIFICATION_EMAIL_RATE_LIMIT,
  NOTIFICATION_EMAIL_RATE_WINDOW_SECONDS,
  notificationEmailRateLimitBucket,
} from '../supabase/functions/notify-email/authorization.mjs';

const edgeSource = readFileSync(new URL('../supabase/functions/notify-email/index.ts', import.meta.url), 'utf8');
const storeSource = readFileSync(new URL('../taskmanagement/js/services/SupabaseDataStore.js', import.meta.url), 'utf8');

test('company email authorization follows membership role and explicit task permission', () => {
  assert.equal(canSendCompanyNotificationEmail({ membershipRole: null }), false);
  for (const role of ['owner', 'admin', 'developer']) {
    assert.equal(canSendCompanyNotificationEmail({ membershipRole: role }), true, `${role} is elevated`);
  }
  assert.equal(canSendCompanyNotificationEmail({ membershipRole: 'construction_supervisor' }), false);
  assert.equal(canSendCompanyNotificationEmail({
    membershipRole: 'member',
    permissionRows: [{ permission_key: NOTIFICATION_EMAIL_PERMISSION, effect: 'allow' }],
  }), true);
  assert.equal(canSendCompanyNotificationEmail({
    membershipRole: 'member',
    permissionRows: [
      { permission_key: '*', effect: 'allow' },
      { permission_key: NOTIFICATION_EMAIL_PERMISSION, effect: 'deny' },
    ],
  }), false, 'an explicit deny wins over allow');
});

test('email rate-limit buckets are private, deterministic, and company scoped', async () => {
  const first = await notificationEmailRateLimitBucket('profile-1', 'company-a');
  const again = await notificationEmailRateLimitBucket('profile-1', 'company-a');
  const otherCompany = await notificationEmailRateLimitBucket('profile-1', 'company-b');
  assert.equal(first, again);
  assert.equal(first.length, 64);
  assert.notEqual(first, otherCompany);
  assert.doesNotMatch(first, /profile|company/i);
  assert.ok(NOTIFICATION_EMAIL_RATE_LIMIT > 0);
  assert.ok(NOTIFICATION_EMAIL_RATE_WINDOW_SECONDS > 0);
});

test('notify-email requires one company, scopes membership and recipients, and uses the durable RPC', () => {
  assert.match(edgeSource, /company_id is required/);
  assert.match(edgeSource, /from\("company_memberships"\)[\s\S]*?\.eq\("company_id", companyId\)[\s\S]*?\.eq\("profile_id", callerUser\.user\.id\)[\s\S]*?\.eq\("status", "active"\)/);
  assert.match(edgeSource, /from\("role_permissions"\)[\s\S]*?NOTIFICATION_EMAIL_PERMISSION/);
  assert.match(edgeSource, /from\("team_members"\)[\s\S]*?\.contains\("company_ids", \[companyId\]\)/);
  assert.match(edgeSource, /\.rpc\("consume_rate_limit"/);
  assert.match(edgeSource, /status,[\s\S]*?429|429,/);
  assert.doesNotMatch(edgeSource, /SEND_ROLES|callerCompanyIds|\.select\("approved, role"\)/);
});

test('the embedded task client sends its task company to notify-email', () => {
  assert.match(storeSource, /sendEmail\(\{ companyId, to, subject, html \}\)/);
  assert.match(storeSource, /body: \{ company_id: company, to: recipients, subject, html \}/);
});
