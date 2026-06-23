-- Contacts (sales pipeline records) + customizable pipeline stages.
-- Both are company-scoped and tenant-isolated, accessible to active company
-- members (via company_memberships) or profiles carrying the company id.

create table if not exists public.contacts (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  name text not null,
  phone text not null default '',
  email text not null default '',
  location text not null default '',
  stage text not null default '',
  value numeric(12, 2) not null default 0,
  owner_name text not null default '',
  notes text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  kind text not null,
  name text not null,
  color text not null default '#9AA0A8',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, kind, name),
  constraint pipeline_stages_kind_check check (kind in ('jobs', 'contacts'))
);

create index if not exists contacts_company_stage_idx on public.contacts(company_id, stage);
create index if not exists pipeline_stages_company_kind_idx on public.pipeline_stages(company_id, kind, position);

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

drop trigger if exists pipeline_stages_set_updated_at on public.pipeline_stages;
create trigger pipeline_stages_set_updated_at
before update on public.pipeline_stages
for each row execute function public.set_updated_at();

alter table public.contacts enable row level security;
alter table public.pipeline_stages enable row level security;

-- Access helper: member of the company, or the company is in the caller's profile.
drop policy if exists "contacts members read" on public.contacts;
create policy "contacts members read" on public.contacts
for select to authenticated
using (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));

drop policy if exists "contacts members insert" on public.contacts;
create policy "contacts members insert" on public.contacts
for insert to authenticated
with check (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));

drop policy if exists "contacts members update" on public.contacts;
create policy "contacts members update" on public.contacts
for update to authenticated
using (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id))
with check (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));

drop policy if exists "contacts members delete" on public.contacts;
create policy "contacts members delete" on public.contacts
for delete to authenticated
using (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));

drop policy if exists "pipeline stages members read" on public.pipeline_stages;
create policy "pipeline stages members read" on public.pipeline_stages
for select to authenticated
using (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));

drop policy if exists "pipeline stages members insert" on public.pipeline_stages;
create policy "pipeline stages members insert" on public.pipeline_stages
for insert to authenticated
with check (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));

drop policy if exists "pipeline stages members update" on public.pipeline_stages;
create policy "pipeline stages members update" on public.pipeline_stages
for update to authenticated
using (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id))
with check (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));

drop policy if exists "pipeline stages members delete" on public.pipeline_stages;
create policy "pipeline stages members delete" on public.pipeline_stages
for delete to authenticated
using (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));

grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.pipeline_stages to authenticated;

-- Seed default pipeline stages for the known demo companies.
insert into public.pipeline_stages (company_id, kind, name, color, position)
select c.id, 'jobs', s.name, s.color, s.position
from (values ('roofing'), ('drafting'), ('lumen'), ('quest-roofing'), ('quest-drafting')) as c(id)
cross join (values
  ('Unscheduled', '#9AA0A8', 0),
  ('Scheduled', '#378ADD', 1),
  ('Material ordered', '#3C7BD0', 2),
  ('In production', '#BA7517', 3),
  ('QC / punch list', '#C08A2B', 4),
  ('Invoiced', '#7F77DD', 5),
  ('Paid / closed', '#639922', 6),
  ('On hold', '#C4C7CC', 7)
) as s(name, color, position)
where exists (select 1 from public.companies pc where pc.id = c.id)
on conflict (company_id, kind, name) do nothing;

insert into public.pipeline_stages (company_id, kind, name, color, position)
select c.id, 'contacts', s.name, s.color, s.position
from (values ('roofing'), ('drafting'), ('lumen'), ('quest-roofing'), ('quest-drafting')) as c(id)
cross join (values
  ('Prospects', '#9AA0A8', 0),
  ('Leads', '#378ADD', 1),
  ('Underwriting', '#BA7517', 2),
  ('Estimate sent', '#3C7BD0', 3),
  ('Negotiating', '#C08A2B', 4),
  ('Contract out', '#7F77DD', 5),
  ('Won', '#639922', 6),
  ('Follow-up', '#C4C7CC', 7),
  ('Lost', '#E24B4A', 8)
) as s(name, color, position)
where exists (select 1 from public.companies pc where pc.id = c.id)
on conflict (company_id, kind, name) do nothing;
