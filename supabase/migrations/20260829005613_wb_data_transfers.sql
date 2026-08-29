-- Taking records out of an app, and putting them in, become permissions -- and leave a trace.
--
-- Two gaps this closes.
--
-- EXPORT WAS NOT GATED AT ALL. Anyone who could open an app could press Export and take every
-- record as CSV, or Download app and take them as JSON, whatever their role said about reading,
-- editing or deleting them. The four record permissions added on 2026-08-28 controlled what a
-- person could do to records in place; nothing controlled taking a copy of all of them.
--
-- NEITHER LEFT A TRACE. Import wrote a line into the workspace activity feed; export wrote
-- nothing anywhere. For the one action that removes data from the product entirely, there was no
-- record that it had happened.
--
-- WHY NOT THE ACTIVITY FEED. `wbLogActivity` appends to the builder document, and persisting
-- that needs `workspaces.manage`. A role that may export and nothing else could not write its own
-- log line, so the log would be missing exactly for the people it most needs to cover.
--
-- WHY NOT wb_record_events. That table requires `item_id` and `scheduled_for`: it is a ledger of
-- scheduled per-record events, and its reader filters on `status = 'scheduled'`. An app-level
-- transfer has no single record and no schedule, so it would have to invent both.

create table if not exists public.wb_data_transfers (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  app_id text not null,
  direction text not null check (direction in ('export', 'import')),
  -- csv | questapp | questfields | print. Free text rather than a constraint, so a new
  -- transfer shape does not need a migration before it can be recorded.
  format text not null default '',
  record_count integer not null default 0,
  file_name text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.wb_data_transfers is
  'Append-only log of App Builder records leaving or entering an app. One row per Export, Download app, Print or Import.';

create index if not exists wb_data_transfers_app_idx
  on public.wb_data_transfers (workspace_id, app_id, created_at desc);
create index if not exists wb_data_transfers_company_idx
  on public.wb_data_transfers (company_id, created_at desc);

alter table public.wb_data_transfers enable row level security;

-- Anyone who may see the records may see that they were taken out.
drop policy if exists "wb transfers read" on public.wb_data_transfers;
create policy "wb transfers read" on public.wb_data_transfers
for select to authenticated
using (app_private.has_workspace_permission(workspace_id, 'workspaces.records.view'));

-- Writing the log needs the same permission as the act it records, so a person who may export
-- can always record their own export. Nothing else may write it.
drop policy if exists "wb transfers insert" on public.wb_data_transfers;
create policy "wb transfers insert" on public.wb_data_transfers
for insert to authenticated
with check (
  (direction = 'export' and app_private.has_workspace_permission(workspace_id, 'workspaces.records.export'))
  or (direction = 'import' and app_private.has_workspace_permission(workspace_id, 'workspaces.records.import'))
);

-- No UPDATE and no DELETE policy, deliberately. A log somebody can edit afterwards is not a log.
grant select, insert on public.wb_data_transfers to authenticated;
revoke all on public.wb_data_transfers from anon;

-- ---------------------------------------------------------------------------------------
-- Compatibility, as data rather than as a rule.
-- ---------------------------------------------------------------------------------------
--
-- The lesson from 20260828040051: an alias that makes a broad key satisfy a narrow one leaves
-- the narrow checkbox unable to say no. So nobody is given these by implication -- the roles
-- that can do it today are granted the keys once, here, and after that the boxes mean
-- themselves.
--
--   export  -> every role that can read records, because export was ungated and any of them
--              could already take a copy. This grants no new power; it names one that existed.
--   import  -> every role that can create records, which is what the Import button required.

insert into public.role_permissions (role_id, permission_key, effect)
select rp.role_id, 'workspaces.records.export', 'allow'
from public.role_permissions rp
where rp.permission_key in ('workspaces.records.view', 'workspaces.view')
  and rp.effect = 'allow'
  and not exists (
    select 1 from public.role_permissions existing
    where existing.role_id = rp.role_id and existing.permission_key = 'workspaces.records.export'
  )
group by rp.role_id
on conflict do nothing;

insert into public.role_permissions (role_id, permission_key, effect)
select rp.role_id, 'workspaces.records.import', 'allow'
from public.role_permissions rp
where rp.permission_key in ('workspaces.records.create', 'workspaces.manage')
  and rp.effect = 'allow'
  and not exists (
    select 1 from public.role_permissions existing
    where existing.role_id = rp.role_id and existing.permission_key = 'workspaces.records.import'
  )
group by rp.role_id
on conflict do nothing;
