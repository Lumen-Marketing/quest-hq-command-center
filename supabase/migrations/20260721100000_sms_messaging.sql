-- SMS messaging (SMSblast). Two company-scoped tables:
--   sms_numbers  : which owned SMSblast number belongs to which company
--   sms_messages : per-contact outbound/inbound SMS history
-- RLS mirrors public.contacts: active company members (or profiles carrying the
-- company id) may read. Writes are performed server-side with the service role,
-- so no browser insert/update/delete policies are granted.

create table if not exists public.sms_numbers (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  from_number text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sms_messages (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  contact_id text not null references public.contacts(id) on delete cascade,
  direction text not null,
  body text not null default '',
  from_number text not null default '',
  to_number text not null default '',
  status text not null default 'queued',
  provider_message_id text,
  error text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint sms_messages_direction_check check (direction in ('outbound', 'inbound')),
  constraint sms_messages_status_check check (status in ('queued', 'sent', 'failed', 'received'))
);

create index if not exists sms_numbers_company_idx on public.sms_numbers(company_id, active);
create index if not exists sms_messages_contact_idx on public.sms_messages(contact_id, created_at);
create index if not exists sms_messages_company_idx on public.sms_messages(company_id, created_at);

drop trigger if exists sms_numbers_set_updated_at on public.sms_numbers;
create trigger sms_numbers_set_updated_at
before update on public.sms_numbers
for each row execute function public.set_updated_at();

alter table public.sms_numbers enable row level security;
alter table public.sms_messages enable row level security;

-- Read-only for company members; server-side writes use the service role.
drop policy if exists "sms_numbers members read" on public.sms_numbers;
create policy "sms_numbers members read" on public.sms_numbers
for select to authenticated
using (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));

drop policy if exists "sms_messages members read" on public.sms_messages;
create policy "sms_messages members read" on public.sms_messages
for select to authenticated
using (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));
