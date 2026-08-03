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

test('the invite arrives from Questbase, whatever EMAIL_FROM is named', () => {
  // EMAIL_FROM was configured as "Notification", so the invite came from a sender nobody
  // recognised -- which is how a legitimate email gets deleted unread. The address stays
  // configurable; the display name does not.
  const fn = readFileSync(new URL('../supabase/functions/send-company-invite/index.ts', import.meta.url), 'utf8');
  assert.match(fn, /const SENDER_NAME = "Questbase";/);
  assert.match(fn, /function senderFrom\(raw: string\): string \{/);
  assert.match(fn, /from: senderFrom\(from\),/, 'the raw value must not reach the provider');
});

test('senderFrom handles both shapes of address', () => {
  const SENDER_NAME = 'Questbase';
  const senderFrom = (raw) => {
    const match = raw.match(/<([^>]+)>/);
    const address = (match ? match[1] : raw).trim();
    return address ? `${SENDER_NAME} <${address}>` : '';
  };
  assert.equal(senderFrom('Notification <no-reply@questbase.io>'), 'Questbase <no-reply@questbase.io>');
  assert.equal(senderFrom('no-reply@questbase.io'), 'Questbase <no-reply@questbase.io>');
  assert.equal(senderFrom('  no-reply@questbase.io  '), 'Questbase <no-reply@questbase.io>');
  assert.equal(senderFrom(''), '', 'an empty setting is still caught by the configuration check');
});

// --- revoking ------------------------------------------------------------------------------

test('only PENDING invites are unique per address, not every status', () => {
  // The old constraint was UNIQUE (company_id, email, status). It stopped two live invites --
  // correct -- but it also allowed exactly one REVOKED row per address, so revoking a second
  // invite for someone previously invited and revoked collided and failed.
  const migration = readFileSync(
    new URL('../supabase/migrations/202608042000_invite_unique_pending_only.sql', import.meta.url),
    'utf8',
  );
  assert.match(migration, /drop constraint if exists company_invites_company_id_email_status_key/);
  assert.match(migration, /create unique index if not exists company_invites_one_pending_per_email/);
  assert.match(migration, /where status = 'pending'/, 'the index has to be partial, or the bug returns');
  assert.match(migration, /\(company_id, lower\(email\)\)/, 'one person, one live invite, whatever the casing');
});

test('a refused revoke is surfaced, not left in the status pill', () => {
  // It failed for weeks looking like "nothing happens" because the reason only went somewhere
  // easy to miss.
  const at = MAIN.indexOf('async function revokeInvite(');
  const body = MAIN.slice(at, MAIN.indexOf('\n}\n', at));
  assert.match(body, /showToast\(result\.error\.message \|\| 'Could not revoke this invite\.', 'error', 'Users'\)/);
});

test('revoking marks the invite revoked rather than deleting the row', () => {
  // Deliberate: the audit trail keeps who invited whom and who withdrew it. The list filters
  // to pending, so a revoked invite disappears from the UI either way.
  // MAIN is read raw, and this repo checks out CRLF, so '\n}\n' would never terminate.
  const src = MAIN.replace(/\r\n/g, '\n');
  const at = src.indexOf('async function revokeInvite(');
  const body = src.slice(at, src.indexOf('\n}\n', at));
  assert.match(body, /status: 'revoked'/);
  assert.ok(!/\.delete\(\)/.test(body), 'the row is kept for the audit trail');
});

test('the invite list only shows pending ones', () => {
  // Which is what makes a successful revoke visibly remove the row.
  const at = MAIN.indexOf('function companyInvites(');
  const body = MAIN.slice(at, MAIN.indexOf('\n}\n', at));
  assert.match(body, /invite\.status === 'pending'/);
});
