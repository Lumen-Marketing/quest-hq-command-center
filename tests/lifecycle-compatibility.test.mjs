import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migration = readFileSync(
  new URL('../supabase/migrations/20260730192246_additional_command_center_hardening.sql', import.meta.url),
  'utf8',
);

function functionSource(name, nextName) {
  const start = main.indexOf(`function ${name}(`);
  const end = main.indexOf(`\nfunction ${nextName}(`, start);
  assert.ok(start !== -1 && end !== -1, `Expected ${name} source`);
  return main.slice(start, end);
}

function sqlFunctionSource(signature, nextMarker) {
  const start = migration.indexOf(signature);
  const end = migration.indexOf(nextMarker, start);
  assert.ok(start !== -1 && end !== -1, `Expected SQL function ${signature}`);
  return migration.slice(start, end);
}

const normalizeSubscriptionSource = functionSource('normalizeSubscription', 'normalizeWorkspaceReview');
const normalizeWorkspaceReviewSource = functionSource('normalizeWorkspaceReview', 'normalizePlatformCompany');
const subscriptionAllowsCompanySource = functionSource('subscriptionAllowsCompany', 'subscriptionNeedsReview');

test('direct subscription rows prefer canonical terminal status while legacy status remains canceled', () => {
  const normalizeSubscription = new Function(
    'canonicalCompanyId',
    'normalizeSubscriptionStatus',
    'number',
    'input',
    `${normalizeSubscriptionSource}\nreturn normalizeSubscription(input);`,
  );
  const normalizeReview = new Function(
    'authoritativeCompanyId',
    'workspaceIconOption',
    'sanitizeWorkspaceIconImage',
    'normalizeSubscriptionStatus',
    'number',
    'input',
    `${normalizeWorkspaceReviewSource}\nreturn normalizeWorkspaceReview(input);`,
  );
  const normalizeStatus = (status) => String(status || '').trim();
  const subscription = normalizeSubscription(
    (value) => value,
    normalizeStatus,
    Number,
    { company_id: 'company-a', status: 'canceled', terminal_status: 'archived' },
  );
  const review = normalizeReview(
    (value) => value,
    (key) => ({ key: key || 'home' }),
    () => '',
    normalizeStatus,
    Number,
    { company_id: 'company-b', status: 'canceled', terminal_status: 'rejected' },
  );

  assert.equal(subscription.status, 'archived');
  assert.equal(review.status, 'rejected');
});

test('new platform and review loads require lifecycle-v2 RPCs', () => {
  assert.match(main, /client\.rpc\('list_platform_companies_v2'\)/);
  assert.match(main, /client\.rpc\('list_workspace_reviews_v2'\)/);
  assert.doesNotMatch(main, /client\.rpc\('list_platform_companies'\)/);
  assert.doesNotMatch(main, /client\.rpc\('list_workspace_reviews'\)/);
});

test('compatibility schema keeps v1 status values and constrains the canonical terminal discriminator', () => {
  const legacyConstraint = migration.slice(
    migration.indexOf('add constraint company_subscriptions_status_check'),
    migration.indexOf('add column if not exists terminal_status'),
  );
  assert.match(
    legacyConstraint,
    /company_subscriptions_status_check check \(\s*status in \('pending_review', 'trialing', 'active', 'past_due', 'grace', 'suspended', 'canceled', 'incomplete'\)\s*\)/,
  );
  assert.doesNotMatch(legacyConstraint, /'archived'|'rejected'/);
  assert.match(migration, /add column if not exists terminal_status text/);
  assert.match(
    migration,
    /company_subscriptions_terminal_status_check check \(\s*terminal_status is null or terminal_status in \('archived', 'rejected', 'canceled'\)\s*\)/,
  );
  assert.match(
    migration,
    /company_subscriptions_terminal_invariant_check check \(\s*\(status = 'canceled' and terminal_status is not null\)\s*or\s*\(status <> 'canceled' and terminal_status is null\)\s*\)/,
  );
});

test('compatibility trigger defaults legacy cancellations and clears terminal state on reactivation', () => {
  const trigger = sqlFunctionSource(
    'create or replace function app_private.normalize_company_subscription_terminal_status()',
    'drop trigger if exists normalize_company_subscription_terminal_status',
  );
  assert.match(trigger, /if new\.status <> 'canceled' then\s*new\.terminal_status := null;/);
  assert.match(trigger, /elsif new\.terminal_status is null then\s*new\.terminal_status := 'canceled';/);
  assert.match(
    migration,
    /before insert or update of status, terminal_status on public\.company_subscriptions[\s\S]*normalize_company_subscription_terminal_status\(\)/,
  );
});

test('backfill changes only terminal_status and leaves every legacy canceled value readable', () => {
  assert.match(
    migration,
    /set terminal_status = case[\s\S]*platform\.company\.archive[\s\S]*platform\.company\.delete[\s\S]*platform\.company\.cancel[\s\S]*then 'archived'[\s\S]*workspace\.reviewed[\s\S]*then 'rejected'/,
  );
  assert.match(
    migration,
    /latest_terminal\.created_at >= cs\.stripe_event_created_at/,
  );
  assert.match(
    migration,
    /update public\.company_subscriptions\s*set terminal_status = 'canceled'[\s\S]*where status = 'canceled'[\s\S]*terminal_status is null/,
  );
  assert.doesNotMatch(migration, /set status = 'archived'/);
  assert.doesNotMatch(migration, /set status = 'rejected'/);

  const legacyNormalize = ({ status }) => (
    ['pending_review', 'trialing', 'active', 'past_due', 'grace', 'suspended', 'canceled', 'incomplete'].includes(status)
      ? status
      : 'pending_review'
  );
  for (const terminal_status of ['archived', 'rejected', 'canceled']) {
    assert.equal(legacyNormalize({ status: 'canceled', terminal_status }), 'canceled');
  }
});

test('legacy Reject input becomes rejected while preserving a canceled v1 projection', () => {
  const review = sqlFunctionSource(
    'create or replace function public.review_company_workspace(',
    'revoke all on function public.review_company_workspace',
  );
  assert.match(review, /effective_status text := case when clean_status = 'canceled' then 'rejected' else clean_status end;/);
  assert.match(review, /legacy_status text := case when effective_status in \('archived', 'rejected', 'canceled'\) then 'canceled' else effective_status end;/);
  assert.match(review, /company_id,\s*status,\s*terminal_status,/);
  assert.match(review, /case when effective_status in \('archived', 'rejected', 'canceled'\) then effective_status else null end/);
  assert.match(review, /jsonb_build_object\('status', effective_status,/);
  assert.match(review, /return effective_status;/);
});

test('v1 list RPCs retain canceled while v2 RPCs expose the effective lifecycle status', () => {
  const reviewsV1 = sqlFunctionSource(
    'create or replace function public.list_workspace_reviews()',
    'revoke all on function public.list_workspace_reviews()',
  );
  const companiesV1 = sqlFunctionSource(
    'create or replace function public.list_platform_companies()',
    'revoke all on function public.list_platform_companies()',
  );
  const reviewsV2 = sqlFunctionSource(
    'create or replace function public.list_workspace_reviews_v2()',
    'revoke all on function public.list_workspace_reviews_v2()',
  );
  const companiesV2 = sqlFunctionSource(
    'create or replace function public.list_platform_companies_v2()',
    'revoke all on function public.list_platform_companies_v2()',
  );

  assert.match(reviewsV1, /\bcs\.status\b/);
  assert.doesNotMatch(reviewsV1, /coalesce\(cs\.terminal_status, cs\.status\)/);
  assert.match(companiesV1, /coalesce\(cs\.status, 'pending_review'\) as status/);
  assert.doesNotMatch(companiesV1, /coalesce\(cs\.terminal_status, cs\.status/);
  assert.match(reviewsV2, /coalesce\(cs\.terminal_status, cs\.status\) as status/);
  assert.match(companiesV2, /coalesce\(cs\.terminal_status, cs\.status, 'pending_review'\) as status/);
});

test('archive, Stripe cancellation, and reactivation explicitly manage terminal status', () => {
  const manage = sqlFunctionSource(
    'create or replace function public.manage_platform_company(',
    'revoke all on function public.manage_platform_company',
  );
  const stripe = sqlFunctionSource(
    'create or replace function public.apply_stripe_subscription_event(',
    'revoke execute on function public.apply_stripe_subscription_event',
  );

  assert.match(manage, /when 'archive' then 'archived'/);
  assert.match(manage, /company_id,\s*status,\s*terminal_status,/);
  assert.match(manage, /case when next_status in \('archived', 'rejected', 'canceled'\) then 'canceled' else next_status end/);
  assert.match(manage, /case when next_status in \('archived', 'rejected', 'canceled'\) then next_status else null end/);
  assert.match(manage, /terminal_status = excluded\.terminal_status/);

  assert.match(stripe, /case when p_status = 'canceled' then 'canceled' else null end/);
  assert.match(
    stripe,
    /status = case[\s\S]*excluded\.terminal_status is null[\s\S]*company_subscriptions\.terminal_status in \('archived', 'rejected'\)[\s\S]*then company_subscriptions\.status[\s\S]*else excluded\.status/,
  );
  assert.match(
    stripe,
    /terminal_status = case[\s\S]*excluded\.terminal_status = 'canceled' then 'canceled'[\s\S]*company_subscriptions\.terminal_status in \('archived', 'rejected'\)[\s\S]*then company_subscriptions\.terminal_status[\s\S]*else excluded\.terminal_status/,
  );
  assert.match(stripe, /set search_path = ''/);
  assert.match(stripe, /service role required/);
  assert.match(
    migration,
    /revoke execute on function public\.apply_stripe_subscription_event\([\s\S]*from public, anon, authenticated;[\s\S]*grant execute[\s\S]*to service_role;/,
  );
});

test('terminal lifecycle blocks access even when an old grace date remains in the future', () => {
  const check = new Function(
    'state',
    'subscription',
    `const activeCompanyId = () => 'company-a';
const subscriptionNeedsReview = () => false;
const companySubscription = () => subscription;
const INACTIVE_COMPANY_STATUSES = ['archived', 'rejected', 'canceled'];
${subscriptionAllowsCompanySource}
return subscriptionAllowsCompany('company-a');`,
  );
  const future = new Date(Date.now() + 86_400_000).toISOString();
  assert.equal(check({ session: { auth: 'supabase' } }, { status: 'archived', grace_ends_at: future }), false);
  assert.equal(check({ session: { auth: 'supabase' } }, { status: 'rejected', grace_ends_at: future }), false);
  assert.equal(check({ session: { auth: 'supabase' } }, { status: 'canceled', grace_ends_at: future }), false);
  assert.equal(check({ session: { auth: 'supabase' } }, { status: 'grace', grace_ends_at: future }), true);

  const sqlAccess = sqlFunctionSource(
    'create or replace function app_private.subscription_allows_access(',
    'revoke all on function app_private.subscription_allows_access',
  );
  assert.match(sqlAccess, /cs\.terminal_status is null[\s\S]*cs\.status = 'trialing'/);
});

test('new lifecycle-v2 RPCs preserve platform authorization, fixed search paths, and grants', () => {
  for (const name of ['list_workspace_reviews_v2', 'list_platform_companies_v2']) {
    const body = sqlFunctionSource(
      `create or replace function public.${name}()`,
      `revoke all on function public.${name}()`,
    );
    assert.match(body, /security definer/);
    assert.match(body, /set search_path = public, app_private, pg_temp/);
    assert.match(body, /if not app_private\.is_quest_admin\(\) then/);
    assert.match(migration, new RegExp(`revoke all on function public\\.${name}\\(\\) from public, anon;`));
    assert.match(migration, new RegExp(`grant execute on function public\\.${name}\\(\\) to authenticated;`));
  }
});
