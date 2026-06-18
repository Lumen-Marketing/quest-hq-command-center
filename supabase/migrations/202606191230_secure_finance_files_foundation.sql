create table if not exists public.finance_vendors (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  name text not null,
  contact_name text not null default '',
  email text not null default '',
  phone text not null default '',
  category text not null default 'Other',
  status text not null default 'Active',
  notes text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_vendors_status_check check (status in ('Active', 'On hold', 'Inactive'))
);

create table if not exists public.finance_invoices (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  job_id text references public.jobs(id) on delete set null,
  client_name text not null default '',
  invoice_number text not null,
  status text not null default 'Draft',
  issue_date date,
  due_date date,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_invoices_status_check check (status in ('Draft', 'Sent', 'Partially paid', 'Paid', 'Overdue', 'Void')),
  constraint finance_invoices_company_number_unique unique (company_id, invoice_number)
);

create table if not exists public.finance_payments (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  invoice_id text not null references public.finance_invoices(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  method text not null default 'ACH',
  received_at date,
  reference text not null default '',
  notes text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_payments_method_check check (method in ('ACH', 'Check', 'Card', 'Cash', 'Wire', 'Other'))
);

create table if not exists public.finance_expenses (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  job_id text references public.jobs(id) on delete set null,
  vendor_id text references public.finance_vendors(id) on delete set null,
  category text not null default 'Other',
  amount numeric(12,2) not null default 0,
  status text not null default 'Pending',
  spent_at date,
  notes text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_expenses_status_check check (status in ('Pending', 'Approved', 'Paid', 'Rejected'))
);

create index if not exists finance_vendors_company_idx on public.finance_vendors(company_id);
create index if not exists finance_invoices_company_idx on public.finance_invoices(company_id);
create index if not exists finance_invoices_job_idx on public.finance_invoices(job_id);
create index if not exists finance_payments_company_idx on public.finance_payments(company_id);
create index if not exists finance_payments_invoice_idx on public.finance_payments(invoice_id);
create index if not exists finance_expenses_company_idx on public.finance_expenses(company_id);
create index if not exists finance_expenses_job_idx on public.finance_expenses(job_id);

alter table public.finance_vendors enable row level security;
alter table public.finance_invoices enable row level security;
alter table public.finance_payments enable row level security;
alter table public.finance_expenses enable row level security;

drop policy if exists finance_vendors_select on public.finance_vendors;
drop policy if exists finance_vendors_insert on public.finance_vendors;
drop policy if exists finance_vendors_update on public.finance_vendors;
drop policy if exists finance_vendors_delete on public.finance_vendors;
drop policy if exists finance_invoices_select on public.finance_invoices;
drop policy if exists finance_invoices_insert on public.finance_invoices;
drop policy if exists finance_invoices_update on public.finance_invoices;
drop policy if exists finance_invoices_delete on public.finance_invoices;
drop policy if exists finance_payments_select on public.finance_payments;
drop policy if exists finance_payments_insert on public.finance_payments;
drop policy if exists finance_payments_update on public.finance_payments;
drop policy if exists finance_payments_delete on public.finance_payments;
drop policy if exists finance_expenses_select on public.finance_expenses;
drop policy if exists finance_expenses_insert on public.finance_expenses;
drop policy if exists finance_expenses_update on public.finance_expenses;
drop policy if exists finance_expenses_delete on public.finance_expenses;

create policy finance_vendors_select on public.finance_vendors
  for select to authenticated
  using (app_private.has_company_permission(company_id, 'finance.view'));
create policy finance_vendors_insert on public.finance_vendors
  for insert to authenticated
  with check (app_private.has_company_permission(company_id, 'finance.manage'));
create policy finance_vendors_update on public.finance_vendors
  for update to authenticated
  using (app_private.has_company_permission(company_id, 'finance.manage'))
  with check (app_private.has_company_permission(company_id, 'finance.manage'));
create policy finance_vendors_delete on public.finance_vendors
  for delete to authenticated
  using (app_private.has_company_permission(company_id, 'finance.manage'));

create policy finance_invoices_select on public.finance_invoices
  for select to authenticated
  using (app_private.has_company_permission(company_id, 'finance.view'));
create policy finance_invoices_insert on public.finance_invoices
  for insert to authenticated
  with check (app_private.has_company_permission(company_id, 'finance.manage'));
create policy finance_invoices_update on public.finance_invoices
  for update to authenticated
  using (app_private.has_company_permission(company_id, 'finance.manage'))
  with check (app_private.has_company_permission(company_id, 'finance.manage'));
create policy finance_invoices_delete on public.finance_invoices
  for delete to authenticated
  using (app_private.has_company_permission(company_id, 'finance.manage'));

create policy finance_payments_select on public.finance_payments
  for select to authenticated
  using (app_private.has_company_permission(company_id, 'finance.view'));
create policy finance_payments_insert on public.finance_payments
  for insert to authenticated
  with check (
    app_private.has_company_permission(company_id, 'finance.manage')
    and exists (
      select 1 from public.finance_invoices fi
      where fi.id = invoice_id and fi.company_id = finance_payments.company_id
    )
  );
create policy finance_payments_update on public.finance_payments
  for update to authenticated
  using (app_private.has_company_permission(company_id, 'finance.manage'))
  with check (app_private.has_company_permission(company_id, 'finance.manage'));
create policy finance_payments_delete on public.finance_payments
  for delete to authenticated
  using (app_private.has_company_permission(company_id, 'finance.manage'));

create policy finance_expenses_select on public.finance_expenses
  for select to authenticated
  using (app_private.has_company_permission(company_id, 'finance.view'));
create policy finance_expenses_insert on public.finance_expenses
  for insert to authenticated
  with check (app_private.has_company_permission(company_id, 'finance.manage'));
create policy finance_expenses_update on public.finance_expenses
  for update to authenticated
  using (app_private.has_company_permission(company_id, 'finance.manage'))
  with check (app_private.has_company_permission(company_id, 'finance.manage'));
create policy finance_expenses_delete on public.finance_expenses
  for delete to authenticated
  using (app_private.has_company_permission(company_id, 'finance.manage'));

grant select, insert, update, delete on public.finance_vendors to authenticated;
grant select, insert, update, delete on public.finance_invoices to authenticated;
grant select, insert, update, delete on public.finance_payments to authenticated;
grant select, insert, update, delete on public.finance_expenses to authenticated;

insert into storage.buckets (id, name, public)
values ('quest-finance-attachments', 'quest-finance-attachments', false)
on conflict (id) do update set public = false;

drop policy if exists finance_attachment_select on storage.objects;
drop policy if exists finance_attachment_insert on storage.objects;
drop policy if exists finance_attachment_update on storage.objects;
drop policy if exists finance_attachment_delete on storage.objects;

create policy finance_attachment_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'quest-finance-attachments'
    and app_private.has_company_permission(split_part(name, '/', 1), 'finance.view')
  );

create policy finance_attachment_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'quest-finance-attachments'
    and app_private.has_company_permission(split_part(name, '/', 1), 'finance.manage')
  );

create policy finance_attachment_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'quest-finance-attachments'
    and app_private.has_company_permission(split_part(name, '/', 1), 'finance.manage')
  )
  with check (
    bucket_id = 'quest-finance-attachments'
    and app_private.has_company_permission(split_part(name, '/', 1), 'finance.manage')
  );

create policy finance_attachment_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'quest-finance-attachments'
    and app_private.has_company_permission(split_part(name, '/', 1), 'finance.manage')
  );

insert into public.role_permissions (role_id, permission_key, effect)
select id, 'finance.view', 'allow'
from public.roles
where lower(name) in ('owner', 'admin', 'manager')
on conflict (role_id, permission_key) do nothing;

insert into public.role_permissions (role_id, permission_key, effect)
select id, 'finance.manage', 'allow'
from public.roles
where lower(name) in ('owner', 'admin')
on conflict (role_id, permission_key) do nothing;
