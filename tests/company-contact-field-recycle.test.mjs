import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../src/company-contacts/page.js', import.meta.url), 'utf8');
// Both files are named for the version the live ledger actually recorded, because they are
// reconciliations of migrations that were applied to production before their file existed.
// Two duplicate copies under invented 2026-08-27 timestamps were removed on 2026-08-28; keeping
// the filename equal to the applied version is what stops that drift recurring.
const migration = readFileSync(new URL('../supabase/migrations/20260826195655_company_contact_field_recycle.sql', import.meta.url), 'utf8');
const reconcileMigrationUrl = new URL('../supabase/migrations/20260826195939_company_contact_permission_reconcile.sql', import.meta.url);

test('deleted field definitions are excluded from active company fields', async () => {
  const { activeCompanyContactFields } = await import('../src/data/company-contact-field-lifecycle.js');
  const rows = [
    { id: 'active', company_id: 'company-a', deleted_at: null },
    { id: 'deleted', company_id: 'company-a', deleted_at: '2026-08-27T00:00:00Z' },
    { id: 'other', company_id: 'company-b', deleted_at: null },
  ];
  assert.deepEqual(activeCompanyContactFields(rows, 'company-a').map((row) => row.id), ['active']);
});

test('editing a contact keeps values owned by recycled field definitions', async () => {
  const { mergeCompanyContactFieldValues } = await import('../src/data/company-contact-field-lifecycle.js');
  const existing = {
    active_name: 'Old active value',
    recycled_notes: 'Keep this for restore',
    unknown_legacy: 'Keep legacy data too',
  };
  const activeFields = [{ id: 'active_name' }, { id: 'cleared_active' }];

  assert.deepEqual(
    mergeCompanyContactFieldValues(existing, activeFields, { active_name: 'New active value' }),
    {
      active_name: 'New active value',
      recycled_notes: 'Keep this for restore',
      unknown_legacy: 'Keep legacy data too',
    },
  );
  assert.deepEqual(
    mergeCompanyContactFieldValues(existing, activeFields, {}),
    {
      recycled_notes: 'Keep this for restore',
      unknown_legacy: 'Keep legacy data too',
    },
  );
});

test('field removal uses the shared recycle operation and stops on the first failure', async () => {
  const { recycleCompanyContactFieldDefinitions } = await import('../src/data/company-contact-field-lifecycle.js');
  const calls = [];
  const result = await recycleCompanyContactFieldDefinitions(['field-a', 'field-a', 'field-b', 'field-c'], async (request) => {
    calls.push(request);
    return request.id === 'field-b' ? false : { id: `recycle-${request.id}` };
  });
  assert.equal(result.ok, false);
  assert.deepEqual(calls, [
    { type: 'company_contact_field', id: 'field-a', options: { silent: true } },
    { type: 'company_contact_field', id: 'field-b', options: { silent: true } },
  ]);
  assert.deepEqual(result.items.map((item) => item.id), ['recycle-field-a']);
  assert.deepEqual(result.remainingIds, ['field-b', 'field-c']);
});

test('the page no longer hard-deletes field definitions', () => {
  assert.match(page, /recycleCompanyContactFieldDefinitions\(fieldDraft\.removed, recycleDeleteRecord\)/);
  assert.doesNotMatch(page, /from\('company_contact_fields'\)\.delete\(\)/);
  assert.match(page, /moved to Recycle Bin/);
});

test('company contact fields are registered as a recoverable source', () => {
  assert.match(main, /company_contact_field:\s*\{[^}]*table: 'company_contact_fields'[^}]*permission: 'company_contacts\.fields\.manage'/s);
  assert.match(main, /deleted_at: input\.deleted_at \|\| null/);
  assert.match(main, /deleted_by: input\.deleted_by \|\| null/);
  assert.match(main, /activeCompanyContactFields\(state\.companyContactFields, target\)/);
});

test('the migration enables soft delete, active-only reads, and recycle metadata', () => {
  assert.match(migration, /add column if not exists deleted_at timestamptz/);
  assert.match(migration, /add column if not exists deleted_by uuid/);
  assert.match(migration, /create policy "company contact fields read"[\s\S]*deleted_at is null/);
  // The insert/update WITH CHECK arms gained `deleted_at is null` in the reconciliation that
  // followed this migration, not in this one -- asserted there rather than here, because this
  // file is a verbatim record of what actually ran against production.
  assert.match(migration, /when 'company_contact_field' then jsonb_build_object\('table', 'company_contact_fields', 'permission', 'company_contacts\.fields\.manage', 'updated_at', true\)/);
  assert.match(migration, /revoke delete on table public\.company_contact_fields from authenticated/);
});

test('a later reconciliation keeps the final policy shape safe even if migrations were applied out of order', () => {
  assert.equal(existsSync(reconcileMigrationUrl), true, 'the forward reconciliation migration must exist');
  const reconcile = readFileSync(reconcileMigrationUrl, 'utf8');
  // It must NOT re-declare app_private.has_company_permission.
  //
  // A duplicate copy of this reconciliation did, carrying the function's pre-hardening body:
  // `search_path to 'public', pg_temp'` and no `auth.uid() is not null` guard.
  // 20260828002845_tenant_grant_and_policy_hardening.sql later replaced that body with
  // `search_path = ''` and the explicit guard. Because this file sorts EARLIER, a fresh
  // environment would still end up hardened -- but the declaration is a loaded gun: re-running
  // this file, or any reordering, silently reverts a security fix. The duplicate was deleted
  // and this assertion is what stops the body coming back.
  assert.doesNotMatch(reconcile, /create or replace function app_private\.has_company_permission/);
  assert.match(reconcile, /drop policy if exists "company contact fields write"/);
  assert.match(reconcile, /create policy "company contact fields read"[\s\S]*deleted_at is null/);
  assert.match(reconcile, /create policy "company contact fields insert"[\s\S]*for insert with check \(\s*deleted_at is null/);
  assert.match(reconcile, /create policy "company contact fields update"[\s\S]*with check \(\s*deleted_at is null/);
  assert.doesNotMatch(reconcile, /create policy "company contact fields write"/);
  assert.match(reconcile, /company_contact_fields_deleted_by_idx/);
  assert.match(reconcile, /create policy "company contact options insert"/);
  assert.match(reconcile, /create policy "company contact options update"/);
  assert.match(reconcile, /create policy "company contact options delete"/);
});
