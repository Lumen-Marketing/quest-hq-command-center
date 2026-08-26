-- Company Contact field definitions must be recoverable just like contacts, jobs and files.
-- Values are already stored separately on company_contacts.field_values; this migration keeps
-- the definition itself for 30 days so restoring it makes those values visible again.

alter table public.company_contact_fields
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

create index if not exists company_contact_fields_active_company_position_idx
  on public.company_contact_fields (company_id, position)
  where deleted_at is null;

-- A deleted definition is visible through the Recycle Bin ledger, not in active forms.
-- Split the old FOR ALL policy so its SELECT arm cannot OR around deleted_at is null.
drop policy if exists "company contact fields read" on public.company_contact_fields;
create policy "company contact fields read" on public.company_contact_fields
for select using (
  deleted_at is null
  and app_private.is_company_member(company_id)
);

drop policy if exists "company contact fields write" on public.company_contact_fields;
drop policy if exists "company contact fields insert" on public.company_contact_fields;
drop policy if exists "company contact fields update" on public.company_contact_fields;
drop policy if exists "company contact fields delete" on public.company_contact_fields;

create policy "company contact fields insert" on public.company_contact_fields
for insert with check (
  deleted_at is null
  and app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
);

create policy "company contact fields update" on public.company_contact_fields
for update using (
  deleted_at is null
  and app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
)
with check (
  deleted_at is null
  and app_private.has_company_permission(company_id, 'company_contacts.fields.manage')
);

-- Permanent deletion is only available through the reviewed recycle purge function.
revoke delete on table public.company_contact_fields from authenticated;

-- Keep the existing allowlist intact and add only this source. The generic recycle RPCs use
-- this metadata for permission checks, soft delete, restore, expiry purge and permanent delete.
create or replace function app_private.recycle_source_metadata(p_type text)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case p_type
    when 'contact' then jsonb_build_object('table', 'contacts', 'permission', 'crm.manage', 'updated_at', true)
    when 'company_contact_field' then jsonb_build_object('table', 'company_contact_fields', 'permission', 'company_contacts.fields.manage', 'updated_at', true)
    when 'account' then jsonb_build_object('table', 'accounts', 'permission', 'crm.manage', 'updated_at', true)
    when 'deal' then jsonb_build_object('table', 'deals', 'permission', 'crm.manage', 'updated_at', true)
    when 'job' then jsonb_build_object('table', 'jobs', 'permission', 'jobs.manage', 'updated_at', true)
    when 'task' then jsonb_build_object('table', 'tasks', 'permission', 'tasks.manage', 'updated_at', true)
    when 'file' then jsonb_build_object('table', 'job_files', 'permission', 'files.manage', 'updated_at', true)
    when 'form' then jsonb_build_object('table', 'forms', 'permission', 'forms.manage', 'updated_at', true)
    when 'form_response' then jsonb_build_object('table', 'form_responses', 'permission', 'forms.manage', 'updated_at', false)
    when 'proposal' then jsonb_build_object('table', 'proposal_documents', 'permission', 'crm.manage', 'updated_at', true)
    when 'client_portal' then jsonb_build_object('table', 'client_portals', 'permission', 'client_portals.manage', 'updated_at', true)
    when 'pricebook_vendor' then jsonb_build_object('table', 'pricebook_vendors', 'permission', 'price_book.manage', 'updated_at', true)
    when 'pricebook_material' then jsonb_build_object('table', 'pricebook_materials', 'permission', 'price_book.manage', 'updated_at', true)
    when 'pricebook_price' then jsonb_build_object('table', 'pricebook_vendor_prices', 'permission', 'price_book.manage', 'updated_at', true)
    when 'finance_invoice' then jsonb_build_object('table', 'finance_invoices', 'permission', 'finance.manage', 'updated_at', true)
    when 'finance_payment' then jsonb_build_object('table', 'finance_payments', 'permission', 'finance.manage', 'updated_at', true)
    when 'finance_expense' then jsonb_build_object('table', 'finance_expenses', 'permission', 'finance.manage', 'updated_at', true)
    when 'finance_vendor' then jsonb_build_object('table', 'finance_vendors', 'permission', 'finance.manage', 'updated_at', true)
    when 'calendar_event' then jsonb_build_object('table', 'calendar_events', 'permission', 'calendar.manage', 'updated_at', true)
    when 'activity' then jsonb_build_object('table', 'activities', 'permission', 'crm.manage', 'updated_at', true)
    else null
  end;
$$;

revoke execute on function app_private.recycle_source_metadata(text) from public, anon, authenticated;
