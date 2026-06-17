alter table public.notifications
  add column if not exists company_id text,
  add column if not exists recipient_profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists type text not null default 'general',
  add column if not exists title text not null default 'Notification',
  add column if not exists body text not null default '',
  add column if not exists href text not null default '',
  add column if not exists source_type text not null default '',
  add column if not exists source_id text not null default '',
  add column if not exists read_at timestamptz;

alter table public.notifications
  alter column member_id drop not null,
  alter column meta set default '',
  alter column html set default '',
  alter column read set default false;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'notifications'
      and constraint_name = 'notifications_company_id_fkey'
  ) then
    alter table public.notifications
      add constraint notifications_company_id_fkey
      foreign key (company_id) references public.companies(id) on delete cascade;
  end if;
end;
$$;

update public.notifications n
set recipient_profile_id = p.id
from public.profiles p
where n.recipient_profile_id is null
  and (p.member_id = n.member_id or p.id::text = n.member_id);

update public.notifications n
set company_id = t.company_id
from public.tasks t
where n.company_id is null
  and n.task_id = t.id;

update public.notifications n
set company_id = membership.company_id
from (
  select distinct on (cm.profile_id) cm.profile_id, cm.company_id
  from public.company_memberships cm
  where cm.status = 'active'
  order by cm.profile_id, cm.company_id
) membership
where n.company_id is null
  and n.recipient_profile_id = membership.profile_id;

update public.notifications
set
  type = coalesce(nullif(type, ''), case when task_id is null then 'general' else 'task.notification' end),
  title = coalesce(nullif(title, ''), nullif(meta, ''), 'Notification'),
  body = coalesce(nullif(body, ''), nullif(regexp_replace(html, '<[^>]*>', ' ', 'g'), ''), nullif(meta, ''), ''),
  source_type = coalesce(nullif(source_type, ''), case when task_id is null then '' else 'task' end),
  source_id = coalesce(nullif(source_id, ''), task_id, ''),
  read_at = case when read = true and read_at is null then created_at else read_at end;

create index if not exists notifications_recipient_created_idx
  on public.notifications(recipient_profile_id, created_at desc);

create index if not exists notifications_company_recipient_idx
  on public.notifications(company_id, recipient_profile_id, read_at);

create index if not exists notifications_source_idx
  on public.notifications(company_id, source_type, source_id);

alter table public.notifications enable row level security;

drop policy if exists "authenticated can read notifications" on public.notifications;

drop policy if exists "notification recipients read own rows" on public.notifications;
create policy "notification recipients read own rows"
on public.notifications
for select
to authenticated
using (
  recipient_profile_id = (select auth.uid())
  and company_id is not null
  and app_private.is_company_member(company_id)
);

drop policy if exists "notification recipients update own rows" on public.notifications;
create policy "notification recipients update own rows"
on public.notifications
for update
to authenticated
using (
  recipient_profile_id = (select auth.uid())
  and company_id is not null
  and app_private.is_company_member(company_id)
)
with check (
  recipient_profile_id = (select auth.uid())
  and company_id is not null
  and app_private.is_company_member(company_id)
);

drop policy if exists "notification recipients delete own rows" on public.notifications;
create policy "notification recipients delete own rows"
on public.notifications
for delete
to authenticated
using (
  recipient_profile_id = (select auth.uid())
  and company_id is not null
  and app_private.is_company_member(company_id)
);

drop policy if exists "active members insert company notifications" on public.notifications;
create policy "active members insert company notifications"
on public.notifications
for insert
to authenticated
with check (
  company_id is not null
  and recipient_profile_id is not null
  and app_private.is_company_member(company_id)
  and exists (
    select 1
    from public.company_memberships recipient_membership
    where recipient_membership.company_id = notifications.company_id
      and recipient_membership.profile_id = notifications.recipient_profile_id
      and recipient_membership.status = 'active'
  )
);

grant select, insert, update, delete on public.notifications to authenticated;
