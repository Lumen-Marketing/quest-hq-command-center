import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL('../supabase/migrations/20260730180045_atomic_contact_to_quote.sql', import.meta.url),
  'utf8',
);
const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  // The contact record page is a fetched module now; same surface, read as one.
  + readFileSync(new URL('../src/crm/contact-record.js', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../src/crm/contact-to-quote.js', import.meta.url), 'utf8');

test('contact graduation is one authenticated workspace-authorized transaction', () => {
  assert.match(migration, /create or replace function public\.convert_contact_to_quote\(/i);
  assert.match(migration, /security invoker/i);
  assert.match(migration, /set search_path = ''/i);
  assert.match(migration, /if \(select auth\.uid\(\)\) is null then/i);
  assert.match(migration, /for update/i);
  assert.match(migration, /app_private\.has_workspace_permission\(v_contact\.workspace_id, 'crm\.manage'\)/i);
  assert.match(migration, /from public\.workspaces[\s\S]*v_contact\.workspace_id[\s\S]*v_contact\.company_id/i);
});

test('retries reuse one request while intentional extra quotes use a new idempotency key', () => {
  assert.match(migration, /add column if not exists contact_quote_request_id uuid/i);
  assert.match(migration, /create unique index[\s\S]*contact_quote_request_id/i);
  assert.match(migration, /p_request_id uuid/i);
  assert.match(migration, /where d\.contact_quote_request_id = p_request_id/i);
  assert.match(migration, /'created', false/i);
  assert.match(migration, /a\.type = 'system'/i);
  assert.match(migration, /a\.subject = 'Contact graduated -> Quote created'/i);
  assert.match(migration, /a\.related_type = 'contact'/i);
  assert.match(migration, /a\.related_id = v_contact\.id/i);
});

test('new handoffs create complete account contact site quote and activity links', () => {
  assert.match(migration, /insert into public\.accounts/i);
  assert.match(migration, /update public\.contacts[\s\S]*set account_id = v_account\.id/i);
  assert.match(migration, /insert into public\.crm_sites/i);
  assert.match(migration, /insert into public\.deals/i);
  assert.match(migration, /insert into public\.activities/i);
  assert.match(migration, /workspace_id[\s\S]*v_contact\.workspace_id/i);
  assert.match(migration, /primary_contact_id[\s\S]*v_contact\.id/i);
  assert.match(migration, /account_id[\s\S]*v_account\.id/i);
  assert.match(migration, /site_id[\s\S]*v_site\.id/i);
  assert.match(migration, /deal_id[\s\S]*v_deal\.id/i);
  assert.match(migration, /desc nulls last/i);
  assert.match(migration, /No quote pipeline stages are configured for this workspace/i);
});

test('the RPC is not callable by public or anonymous roles', () => {
  assert.match(migration, /revoke execute on function public\.convert_contact_to_quote\(text, uuid\) from public, anon/i);
  assert.match(migration, /grant execute on function public\.convert_contact_to_quote\(text, uuid\) to authenticated/i);
});

test('the live browser path calls one RPC and consumes its linked records', () => {
  const body = workflow.match(/export async function runContactToQuote\(contactId,[\s\S]*?\n\}/)?.[0] || '';

  assert.match(body, /client\.rpc\('convert_contact_to_quote'/);
  assert.match(body, /p_contact_id: contact\.id/);
  assert.match(body, /p_request_id: requestId/);
  assert.match(body, /result\.data\?\.deal/);
  assert.match(body, /result\.data\?\.contact/);
  assert.match(body, /result\.data\?\.account/);
  assert.match(body, /result\.data\?\.site/);
  assert.match(body, /result\.data\?\.activity/);
  assert.doesNotMatch(body, /supabaseWrite\('deals'/);
  assert.match(source, /import\('\.\/crm\/contact-to-quote\.js'\)/);
});

test('the contact UI has a separate intentional create-another action', () => {
  assert.match(source, /data-action="contact-create-another-quote"/);
  assert.match(source, /convertContactToQuote\(node\.dataset\.contactId, \{ createAnother: true \}\)/);
  assert.match(source, /data-action="open-contact-quote"/);
  assert.match(source, /'contact-create-another-quote'/);
});
