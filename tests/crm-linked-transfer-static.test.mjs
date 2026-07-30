import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../src/crm/contact-to-quote.js', import.meta.url), 'utf8');
const migrationUrl = new URL('../supabase/migrations/202607021030_crm_linked_transfer_sites.sql', import.meta.url);
const migration = existsSync(migrationUrl) ? readFileSync(migrationUrl, 'utf8') : '';
const indexMigrationUrl = new URL('../supabase/migrations/202607021031_crm_sites_fk_indexes.sql', import.meta.url);
const indexMigration = existsSync(indexMigrationUrl) ? readFileSync(indexMigrationUrl, 'utf8') : '';

test('crm transfers preserve a shared customer and site instead of copying address-only data', () => {
  const contactConverter = workflow.match(/async function convertContactToQuoteLocally\(contact, companyId, api\) \{[\s\S]*?\n\}/)?.[0] || '';
  const dealConverter = source.match(/async function convertDealToJob\(dealId\) \{[\s\S]*?\n\}/)?.[0] || '';

  assert.match(source, /function normalizeCrmSite\(input\)/);
  assert.match(workflow, /async function ensureCrmSiteForContact\(contact, api\)/);
  assert.match(source, /const SITE_COLS = \[/);
  assert.match(source, /const JOB_COLS = \[/);

  assert.match(contactConverter, /const site = await ensureCrmSiteForContact\(contact, api\)/);
  assert.match(contactConverter, /site_id: site\?\.id \|\| ''/);
  assert.match(contactConverter, /primary_contact_id: contact\.id/);
  assert.match(workflow, /client\.rpc\('convert_contact_to_quote'/);

  assert.match(dealConverter, /const site = crmSiteById\(deal\.site_id\)/);
  assert.match(dealConverter, /contact_id: deal\.primary_contact_id/);
  assert.match(dealConverter, /site_id: deal\.site_id/);
  assert.match(dealConverter, /site_address: site\?\.address \|\| account\?\.address \|\| contact\?\.location \|\| ''/);
});

test('crm activities can be read as one shared customer thread across contact quote and job', () => {
  assert.match(source, /function matchesActivityThread\(activity, relatedType, relatedId\)/);
  assert.match(source, /activitiesFor\(relatedType, relatedId\)[\s\S]*matchesActivityThread\(activity, relatedType, relatedId\)/);
  assert.match(source, /const ACTIVITY_COLS = \[[^\]]*'contact_id'[^\]]*'site_id'[^\]]*'deal_id'[^\]]*'job_id'/);
  assert.match(source, /contact_id: input\.contact_id \?/);
  assert.match(source, /site_id: input\.site_id \?/);
  assert.match(source, /deal_id: input\.deal_id \?/);
  assert.match(source, /job_id: input\.job_id \?/);
});

test('crm linked transfer migration adds shared site and link columns safely', () => {
  assert.match(migration, /create table if not exists public\.crm_sites/);
  assert.match(migration, /contact_id text references public\.contacts\(id\) on delete cascade/);
  assert.match(migration, /alter table public\.deals[\s\S]*add column if not exists site_id/);
  assert.match(migration, /alter table public\.jobs[\s\S]*add column if not exists contact_id/);
  assert.match(migration, /alter table public\.jobs[\s\S]*add column if not exists site_id/);
  assert.match(migration, /alter table public\.activities[\s\S]*add column if not exists contact_id/);
  assert.match(migration, /alter table public\.activities[\s\S]*add column if not exists site_id/);
  assert.match(migration, /alter table public\.activities[\s\S]*add column if not exists deal_id/);
  assert.match(migration, /alter table public\.activities[\s\S]*add column if not exists job_id/);
  assert.match(migration, /alter table public\.crm_sites enable row level security/);
  assert.match(migration, /grant select, insert, update, delete on public\.crm_sites to authenticated/);
  assert.match(indexMigration, /create index if not exists crm_sites_contact_fk_idx/);
  assert.match(indexMigration, /create index if not exists crm_sites_created_by_idx/);
});
