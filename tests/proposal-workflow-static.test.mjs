import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202607020930_proposal_documents.sql', import.meta.url), 'utf8');
const smoke = readFileSync(new URL('../scripts/production-smoke-lib.mjs', import.meta.url), 'utf8');

assert.match(main, /const PROPOSAL_CACHE_KEY = 'quest-hq-proposal-cache-v1'/);
assert.match(main, /id: 'proposals'.*label: 'Proposals'/s);
assert.match(main, /module_ids: \['workday', 'contacts', 'deals', 'proposals', 'jobs'\]/);
assert.match(main, /if \(route\.section === 'proposals'\) return renderProposalsPage\(route, companyId\);/);

assert.match(main, /function normalizeProposal\(/);
assert.match(main, /function companyProposals\(/);
assert.match(main, /function renderProposalsPage\(/);
assert.match(main, /function renderProposalPublicPage\(/);
assert.match(main, /function ensureProposalPublicOpen\(/);
assert.match(main, /function submitPublicProposalDecision\(/);
assert.match(main, /async function persistProposal\(/);
assert.match(main, /async function exportProposalPdf\(/);

assert.ok(main.includes("client.from('proposal_documents').select('*')"));
assert.match(main, /PROPOSAL_COLS/);
assert.match(main, /persistProposal\(proposalRecordFromDraft\(ctx, draft, existing\)/);
assert.match(main, /data-action="copy-proposal-link"/);
assert.match(main, /data-action="export-proposal"/);
assert.match(main, /data-action="duplicate-proposal"/);
assert.match(main, /data-proposal-public-form/);
assert.match(main, /rpc\('public_proposal_by_token'/);
assert.match(main, /rpc\('accept_public_proposal'/);

assert.ok(styles.includes('.proposal-workspace'));
assert.ok(styles.includes('.proposal-public-shell'));
assert.ok(styles.includes('.proposal-status-pill.accepted'));

assert.match(migration, /create table if not exists public\.proposal_documents/);
assert.match(migration, /alter table public\.proposal_documents enable row level security/);
assert.match(migration, /grant select, insert, update, delete on public\.proposal_documents to authenticated/);
assert.match(migration, /create or replace function public\.public_proposal_by_token/);
assert.match(migration, /grant execute on function public\.public_proposal_by_token\(text\) to anon, authenticated/);
assert.match(migration, /create or replace function public\.accept_public_proposal/);
assert.match(migration, /grant execute on function public\.accept_public_proposal\(text, text, text, text\) to anon, authenticated/);

assert.match(smoke, /'proposals'/);

console.log('proposal workflow static checks passed');
