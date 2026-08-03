import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const ROOT = new URL('../', import.meta.url);
const MIGRATIONS_DIR = new URL('../supabase/migrations/', import.meta.url);
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const EDGE_PATH = new URL('../supabase/functions/send-company-invite/index.ts', import.meta.url);

function lastDefinitionOf(signature) {
  let found = null;
  for (const name of readdirSync(MIGRATIONS_DIR).filter((item) => item.endsWith('.sql')).sort()) {
    const source = readFileSync(new URL(name, MIGRATIONS_DIR), 'utf8');
    const start = source.lastIndexOf(signature);
    if (start === -1) continue;
    const end = source.indexOf('$$;', start);
    found = { name, body: source.slice(start, end === -1 ? undefined : end) };
  }
  return found;
}

test('invite acceptance cannot keep an elevated custom-role assignment', () => {
  const fn = lastDefinitionOf('create or replace function public.accept_company_invite');
  assert.ok(fn, 'accept_company_invite must be defined');
  assert.match(fn.body, /safe_role_id uuid/);
  assert.match(fn.body, /lower\(r\.name\) not in \('owner', 'admin', 'developer'\)/);
  assert.match(fn.body, /delete from public\.user_role_assignments/);
  assert.match(fn.body, /safe_role_id[\s\S]*?insert into public\.user_role_assignments/);
  assert.doesNotMatch(
    fn.body,
    /insert into public\.user_role_assignments[\s\S]{0,500}invite_row\.role_id/,
    `${fn.name} must not assign the invite's elevated role_id`,
  );
});

test('invite acceptance assigns selected workspaces and falls back to the default workspace', () => {
  const fn = lastDefinitionOf('create or replace function public.accept_company_invite');
  assert.ok(fn);
  assert.match(fn.body, /invite_row\.workspace_ids/);
  assert.match(fn.body, /public\.workspaces[\s\S]*?is_default/);
  assert.match(fn.body, /insert into public\.workspace_memberships/);
  assert.match(fn.body, /w\.company_id = invite_row\.company_id/);
});

test('invite UI only offers non-elevated roles and captures workspace assignments', () => {
  assert.match(MAIN, /INVITE_BLOCKED_ROLE_NAMES\s*=\s*new Set\(\['owner', 'admin', 'developer'\]\)/);
  assert.match(MAIN, /name="workspace_ids"/);
  assert.match(MAIN, /workspace_ids:\s*invite\.workspace_ids/);
  assert.match(MAIN, /functions\.invoke\('send-company-invite'/);
  assert.match(MAIN, /data-action="send-invite-email"/);
});

test('an invited worker lands on the permission-neutral dashboard after joining', () => {
  const acceptSource = MAIN.match(/async function acceptCompanyInvite\(token, fallbackReturnUrl = ''\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(acceptSource, /navigate\(companyPath\('dashboard', \{\}, companyId\), \{ replace: true \}\)/);
  assert.doesNotMatch(acceptSource, /navigate\(companyPath\('jobs'/);
});

test('invite email function derives recipient and content from a server-side invite', () => {
  assert.equal(existsSync(EDGE_PATH), true, 'send-company-invite Edge Function must exist');
  const source = readFileSync(EDGE_PATH, 'utf8');
  assert.match(source, /interface InvitePayload\s*\{\s*invite_id\?: unknown;\s*\}/);
  assert.doesNotMatch(source, /\bto\?:\s*unknown/);
  assert.doesNotMatch(source, /\bhtml\?:\s*unknown/);
  assert.match(source, /\.from\("company_invites"\)/);
  assert.match(source, /\.from\("company_memberships"\)/);
  assert.match(source, /\.update\(\{[\s\S]*?email_status:/);
  assert.match(source, /APP_URL/);
  assert.match(source, /RESEND_API_KEY/);
  assert.match(source, /https:\/\/quest-hq-command-center-gamma\.vercel\.app/);
  assert.match(source, /https:\/\/questbase\.io/);
  assert.match(source, /https:\/\/www\.questbase\.io/);
  assert.match(source, /const text = `[\s\S]*?Accept invitation:/);
  assert.match(source, /body:\s*JSON\.stringify\(\{[\s\S]*?\btext,/);
});

test('invite email status is persisted without invalidating the invite on provider failure', () => {
  const migrations = readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => readFileSync(new URL(name, MIGRATIONS_DIR), 'utf8'))
    .join('\n');
  assert.match(migrations, /workspace_ids uuid\[\] not null default '\{\}'::uuid\[\]/);
  assert.match(migrations, /email_status text not null default 'not_sent'/);
  assert.match(migrations, /email_sent_at timestamptz/);
  assert.match(migrations, /email_last_error text/);
  assert.match(MAIN, /email_status:\s*String\(input\.email_status/);
});

// --- where the invitation actually points -------------------------------------------------

test('an invitation can never link to a deployment host', () => {
  // APP_URL was set to the Vercel deployment address, so invited people opened an old build
  // instead of Questbase. Those hostnames rotate with every deploy and an invite may be
  // clicked days later, so the link has to be the product's permanent home. A field in a
  // dashboard being wrong must not be able to send a customer the wrong address.
  const fn = readFileSync(new URL('../supabase/functions/send-company-invite/index.ts', import.meta.url), 'utf8');
  assert.match(fn, /const CANONICAL_APP_URL = "https:\/\/www\.questbase\.io";/);
  assert.match(fn, /const DEPLOYMENT_HOST_RE = \/\(\^\|\\.\)vercel\\.app\$\/i;/);
  assert.match(fn, /if \(DEPLOYMENT_HOST_RE\.test\(appUrl\.hostname\)\) \{/);
  assert.match(fn, /appUrl = new URL\(CANONICAL_APP_URL\);/);
  // The override has to happen before the link is built, not after.
  assert.ok(
    fn.indexOf('DEPLOYMENT_HOST_RE.test(appUrl.hostname)') < fn.indexOf('const loginUrl = new URL("/login", appUrl)'),
    'the host check must run before the login URL is constructed',
  );
});

test('the fallback when APP_URL is unset is the canonical domain', () => {
  const fn = readFileSync(new URL('../supabase/functions/send-company-invite/index.ts', import.meta.url), 'utf8');
  assert.match(fn, /Deno\.env\.get\("APP_URL"\) \?\? CANONICAL_APP_URL/);
});

test('the deployment host is still allowed to CALL the endpoint', () => {
  // Two different questions: which sites may call this, and where the email points. Only the
  // second is pinned -- collapsing them would break the endpoint for the gamma deployment.
  const fn = readFileSync(new URL('../supabase/functions/send-company-invite/index.ts', import.meta.url), 'utf8');
  const origins = fn.slice(fn.indexOf('const PRODUCTION_ORIGINS'), fn.indexOf('const CANONICAL_APP_URL'));
  assert.match(origins, /quest-hq-command-center-gamma\.vercel\.app/);
});

test('the host check matches subdomains but not a lookalike domain', () => {
  const RE = /(^|\.)vercel\.app$/i;
  assert.ok(RE.test('quest-hq-command-center-gamma.vercel.app'));
  assert.ok(RE.test('vercel.app'));
  assert.ok(!RE.test('notvercel.app'), 'a different registrable domain must not be caught');
  assert.ok(!RE.test('vercel.app.example.com'), 'only the suffix counts');
  assert.ok(!RE.test('www.questbase.io'));
});
