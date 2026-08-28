import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readApi = (name) => readFileSync(new URL(`../api/${name}`, import.meta.url), 'utf8');
const readRoot = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

const open = readApi('public-proposal-open.js');
const respond = readApi('public-proposal-respond.js');
const invite = readApi('public-invite-lookup.js');
const admin = readApi('_lib/supabase-admin.js');
const app = readRoot('src/main.js');
const migration = readRoot('supabase/migrations/202607151200_revoke_anon_public_rpc_execute.sql');

test('every public proposal/invite endpoint is rate-limited, origin-checked, and POST-only', () => {
  for (const source of [open, respond, invite]) {
    // Durable, not just in-memory. What is guessed at these three is a token, and a counter
    // that lives in one lambda's memory and resets on every cold start is not a limit on that.
    assert.match(source, /enforceDurableRateLimit/);
    assert.match(source, /requireAllowedOrigin/);
    assert.match(source, /readJsonBody/);
    assert.match(source, /setApiHeaders/);
    assert.match(source, /req\.method !== 'POST'/);
  }
});

test('endpoints call the RPCs server-side with the service role, not anon', () => {
  assert.match(admin, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(open, /supabaseRpc\('public_proposal_by_token'/);
  assert.match(respond, /supabaseRpc\('accept_public_proposal'/);
  assert.match(invite, /supabaseRpc\('lookup_company_invite'/);
});

test('the accept endpoint validates the decision and email before signing', () => {
  assert.match(respond, /decision !== 'accept' && decision !== 'decline'/);
  assert.match(respond, /signer_name/);
  assert.match(respond, /@\[\^\\s@\]/); // email shape check present
});

test('the app calls the new endpoints, not the anon RPCs directly', () => {
  assert.match(app, /\/api\/public-proposal-open/);
  assert.match(app, /\/api\/public-proposal-respond/);
  assert.match(app, /\/api\/public-invite-lookup/);
  // The direct anon RPC calls are gone.
  assert.ok(!/client\.rpc\('public_proposal_by_token'/.test(app), 'direct anon public_proposal_by_token rpc still present');
  assert.ok(!/client\.rpc\('accept_public_proposal'/.test(app), 'direct anon accept_public_proposal rpc still present');
  assert.ok(!/client\.rpc\('lookup_company_invite'/.test(app), 'direct anon lookup_company_invite rpc still present');
});

test('the revoke migration removes anon/authenticated EXECUTE but keeps service_role', () => {
  assert.match(migration, /revoke execute on function public\.accept_public_proposal.* from anon, authenticated/i);
  assert.match(migration, /revoke execute on function public\.public_proposal_by_token.* from anon, authenticated/i);
  assert.match(migration, /revoke execute on function public\.lookup_company_invite.* from anon, authenticated/i);
  assert.ok(!/from service_role/i.test(migration), 'must not revoke from service_role');
  // Documents the deploy-order hazard and a rollback.
  assert.match(migration, /APPLY ONLY AFTER/i);
  assert.match(migration, /grant execute/i);
});
