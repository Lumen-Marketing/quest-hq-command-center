import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/20260730192246_additional_command_center_hardening.sql', import.meta.url), 'utf8');

function functionSource(name, nextName) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf(`\nfunction ${nextName}(`, start);
  assert.ok(start !== -1 && end !== -1, `Expected ${name} source`);
  return source.slice(start, end);
}

const normalizeCompanySource = functionSource('normalizeCompany', 'normalizeCompanyPlugin');
const mergeCompaniesSource = functionSource('mergeCompanies', 'mergeSubscriptions');
const normalizeMembershipSource = functionSource('normalizeMembership', 'normalizeSubscription');
const normalizeWorkspaceReviewSource = functionSource('normalizeWorkspaceReview', 'normalizePlatformCompany');
const normalizePlatformCompanySource = functionSource('normalizePlatformCompany', 'normalizePlatformCompanyMember');
const normalizePlatformCompanyMemberSource = functionSource('normalizePlatformCompanyMember', 'normalizeWorkspaceBackup');
const applyCreatedWorkspaceSource = functionSource('applyCreatedWorkspace', 'applyPlatformCreatedWorkspace');
const applyPlatformCreatedWorkspaceSource = functionSource('applyPlatformCreatedWorkspace', 'applyPluginPresetLocal');
const workspaceReviewRowsSource = functionSource('workspaceReviewRows', 'platformCompanyRows');
const normalizeSubscriptionStatusSource = functionSource('normalizeSubscriptionStatus', 'isQuestDeveloper');

test('authoritative company normalization preserves a trimmed Supabase id that is also a legacy URL alias', () => {
  const normalize = new Function('authoritativeCompanyId', 'workspaceIconOption', 'sanitizeWorkspaceIconImage', 'input', `${normalizeCompanySource}\nreturn normalizeCompany(input);`);
  const company = normalize((id) => String(id || '').trim(), (key) => ({ key: key || 'home' }), () => '', { id: ' quest-roofing ', name: 'Quest Roofing' });
  assert.equal(company.id, 'quest-roofing');
});

test('initial Supabase company loads preserve authoritative ids through real merge behavior', () => {
  const load = new Function('authoritativeCompanyId', 'workspaceIconOption', 'sanitizeWorkspaceIconImage', 'rows', `${normalizeCompanySource}\n${mergeCompaniesSource}\nreturn mergeCompanies(rows.map(normalizeCompany));`);
  const companies = load((id) => String(id || '').trim(), (key) => ({ key: key || 'home' }), () => '', [{ id: ' quest-roofing ', name: 'Quest Roofing' }]);
  assert.equal(companies[0].id, 'quest-roofing');
});

test('limited initial bootstrap keeps membership company ids authoritative before company rows load', () => {
  const normalize = new Function('canonicalCompanyId', 'authoritativeCompanyId', 'row', `${normalizeMembershipSource}\nreturn normalizeMembership(row);`);
  const membership = normalize(() => 'roofing', (id) => String(id || '').trim(), { company_id: ' quest-roofing ', profile_id: 'profile-1', status: 'active' });
  assert.equal(membership.company_id, 'quest-roofing');
});

test('platform, review, and member RPC normalizers preserve authoritative company ids before company state exists', () => {
  const normalize = new Function('authoritativeCompanyId', 'canonicalCompanyId', 'workspaceIconOption', 'sanitizeWorkspaceIconImage', 'normalizeSubscriptionStatus', 'number', 'titleCase', 'row', `${normalizeWorkspaceReviewSource}\n${normalizePlatformCompanySource}\n${normalizePlatformCompanyMemberSource}\nreturn [normalizePlatformCompany(row), normalizeWorkspaceReview(row), normalizePlatformCompanyMember(row)];`);
  const rows = normalize((id) => String(id || '').trim(), () => 'roofing', (key) => ({ key: key || 'home' }), () => '', (status) => status, Number, (value) => value, { company_id: ' quest-roofing ', company_name: 'Quest Roofing' });
  assert.deepEqual(rows.map((row) => row.company_id), ['quest-roofing', 'quest-roofing', 'quest-roofing']);
});

function creationHarness(fnSource, workspaceId) {
  const run = new Function(
    'state', 'localStorage', 'canonicalCompanyId', 'defaultCompanyId', 'companyName', 'companySubscription', 'companyColor',
    'workspaceIconOption', 'sanitizeWorkspaceIconImage', 'normalizeMembership', 'mergeSubscriptions', 'normalizeSubscription',
    'activeSession', 'compactUnique', 'normalizeProfile', 'writeJson', 'markWorkspacePendingReview', 'clearWorkspacePendingReview',
    'workspaceId',
    `const SESSION_KEY = 'quest-hq-session';\nconst COMPANY_KEY = 'quest-hq-company';\nconst authoritativeCompanyId = (id) => String(id || '').trim();\n${normalizeCompanySource}\n${mergeCompaniesSource}\n${fnSource}\n${fnSource.includes('applyPlatformCreatedWorkspace') ? 'applyPlatformCreatedWorkspace(workspaceId);' : 'applyCreatedWorkspace(workspaceId);'}\nreturn state;`,
  );
  const state = { companies: [], memberships: [], subscriptions: [], session: { auth: 'supabase', profile: { id: 'profile-1', member_id: 'member-1', company_ids: [], role: 'member' } } };
  return run(
    state, { setItem() {} }, (id) => String(id || '').trim() === 'quest-roofing' ? 'roofing' : String(id || '').trim(), () => 'fallback',
    (id) => id, () => null, () => '#f0b23b', (key) => ({ key: key || 'home' }), () => '',
    (row) => row, (rows) => rows, (row) => row,
    () => state.session, (ids) => [...new Set(ids)], (profile) => profile, () => {}, () => {}, () => {}, workspaceId,
  );
}

test('member workspace creation keeps the authoritative RPC id instead of resolving a legacy URL alias', () => {
  const state = creationHarness(applyCreatedWorkspaceSource, ' quest-roofing ');
  assert.equal(state.activeCompanyId, 'quest-roofing');
  assert.equal(state.companies.at(-1).id, 'quest-roofing');
});

test('platform workspace creation keeps the authoritative RPC id instead of resolving a legacy URL alias', () => {
  const state = creationHarness(applyPlatformCreatedWorkspaceSource, ' quest-roofing ');
  assert.equal(state.companies.at(-1).id, 'quest-roofing');
});

test('live browser permissions honor either message-management alias and let a matching deny override allow', () => {
  const aliases = source.match(/const PERMISSION_ALIASES = \{[\s\S]*?\n\};/)?.[0];
  const variants = functionSource('permissionVariants', 'roleIdForName');
  const can = functionSource('can', 'requirePermission');
  assert.ok(aliases, 'Expected permission aliases');
  const check = new Function('state', 'permission', `${aliases}\nconst ELEVATED_COMPANY_ROLES = ['owner', 'admin', 'developer'];\nconst DEFAULT_MEMBER_PERMISSIONS = ['jobs.view', 'tasks.view', 'users.view', 'settings.view', 'plugins.view'];\nconst compactUnique = (values) => [...new Set(values.filter(Boolean))];\nconst permissionAvailableForCompany = () => true;\nconst rolePreviewForCompany = () => '';\nconst activeSession = () => state.session;\nconst membershipForProfile = () => state.membership;\nconst activeCompanyId = () => 'company-1';\nconst workspaceIdForCompany = () => '';\n${variants}\n${can}\nreturn can(permission, 'company-1', '');`);
  const state = {
    session: { auth: 'supabase', profile: { id: 'profile-1' } },
    membership: { role: 'member', status: 'active' },
    roleAssignments: [{ company_id: 'company-1', profile_id: 'profile-1', role_id: 'role-1' }],
    rolePermissions: [{ role_id: 'role-1', permission_key: 'messages.manage_groups', effect: 'allow' }],
  };
  assert.equal(check(state, 'messages.manage'), true);
  state.rolePermissions.push({ role_id: 'role-1', permission_key: 'messages.manage', effect: 'deny' });
  assert.equal(check(state, 'messages.manage_groups'), false);
});

test('SQL permissions match browser message aliases while retaining plugin gates, company scope, admin elevation, defaults, and deny precedence', () => {
  assert.match(migration, /with permission_variants as \([\s\S]*when permission = 'messages\.manage' then 'messages\.manage_groups'[\s\S]*when permission = 'messages\.manage_groups' then 'messages\.manage'/);
  assert.match(migration, /app_private\.permission_plugin_available\(target_company_id, permission\)/);
  assert.match(migration, /ura\.company_id = target_company_id[\s\S]*ura\.profile_id = auth\.uid\(\)/);
  assert.match(migration, /role in \('owner', 'admin', 'developer'\)/);
  assert.match(migration, /not exists \(select 1 from assigned where effect = 'deny'\)[\s\S]*exists \(select 1 from assigned where effect = 'allow'\)/);
  assert.match(migration, /permission in \('jobs\.view', 'tasks\.view', 'users\.view', 'settings\.view', 'plugins\.view'\)/);
});

test('distinct terminal lifecycle states are normalized, labeled, and used by their respective browser actions', () => {
  const actionStatus = functionSource('platformActionStatus', 'subscriptionAllowsCompany');
  const labelStatus = functionSource('subscriptionLabelForStatus', 'normalizeSubscriptionStatus');
  const normalizeStatus = functionSource('normalizeSubscriptionStatus', 'isQuestDeveloper');
  const statusFor = new Function(`${actionStatus}\nreturn ['archive', 'delete', 'cancel'].map(platformActionStatus);`);
  const labelFor = new Function('formatDate', `${normalizeStatus}\n${labelStatus}\nreturn [subscriptionLabelForStatus('archived'), subscriptionLabelForStatus('rejected'), subscriptionLabelForStatus('canceled')];`);
  assert.deepEqual(statusFor(), ['archived', 'archived', 'archived']);
  assert.deepEqual(labelFor(() => ''), ['Archived', 'Rejected', 'Canceled']);
  assert.match(source, /data-action="review-workspace"[^>]*data-status="rejected"[^>]*>Reject<\/button>/);
});

test('workspace review subscription fallback retains every normalized lifecycle status', () => {
  const statuses = ['pending_review', 'trialing', 'active', 'past_due', 'grace', 'suspended', 'archived', 'rejected', 'canceled', 'incomplete'];
  const run = new Function(
    'state', 'normalizeWorkspaceReview', 'pendingReviewCompanyIds', 'companyName',
    `${normalizeSubscriptionStatusSource}\n${workspaceReviewRowsSource}\nreturn workspaceReviewRows();`,
  );
  const reviews = run(
    { workspaceReviews: [], subscriptions: statuses.map((status) => ({ company_id: status, status })) },
    (row) => row,
    () => [],
    (id) => id,
  );
  assert.deepEqual(reviews.map((review) => review.status).sort(), statuses.slice().sort());
});

test('lifecycle migration preserves the reviewed permission function and applies only the audit-proven non-Stripe archive backfill', () => {
  assert.match(migration, /status in \('pending_review', 'trialing', 'active', 'past_due', 'grace', 'suspended', 'archived', 'rejected', 'canceled', 'incomplete'\)/);
  assert.match(migration, /where cs\.status = 'canceled'[\s\S]*cs\.stripe_subscription_id is null[\s\S]*latest_terminal\.event_type = 'platform\.company\.archive'/);
  assert.match(migration, /create or replace function public\.list_workspace_reviews\(\)/);
  assert.match(migration, /create or replace function public\.review_company_workspace\([\s\S]*'rejected'/);
  assert.match(migration, /create or replace function public\.list_platform_companies\(\)[\s\S]*icon_key text/);
  assert.match(migration, /create or replace function public\.manage_platform_company\([\s\S]*when 'archive' then 'archived'/);
});
