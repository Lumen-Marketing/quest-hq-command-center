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
