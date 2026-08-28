-- App Builder records become rows, so that permissions can attach to them.
--
-- Until now every app, every field and every RECORD in a company lived in a single jsonb cell:
-- workspace_builder_state.doc, one row per company. Its RLS could therefore only say two
-- things -- `workspaces.view` reads the whole document, `workspaces.manage` writes the whole
-- document -- because creating a record, deleting a record and renaming an app are all the
-- same UPDATE of the same column. There was nothing for a per-record permission to attach to.
--
-- That is also the scaling problem recorded as O2 in the 2026-08-28 audit: the largest doc is
-- already 525 kB and is read in full on every page load and rewritten in full on every record
-- save, because "append one record" really is "rewrite everything".
--
-- 96 records exist across all six companies. This will never be cheaper to fix.
--
-- WHAT THIS MIGRATION DOES NOT DO: it does not remove `items` from the document. The rows are
-- copied, not moved, so this migration alone changes no behaviour and the running client keeps
-- working exactly as it does today. The client is repointed in the same release; a later
-- migration strips the now-redundant `items` arrays once that is verified in production.
-- Doing it in that order means an old tab open during the deploy cannot lose records.

-- ---------------------------------------------------------------------------------------
-- 1. The table.
-- ---------------------------------------------------------------------------------------
--
-- `data` holds the item object exactly as the browser already knows it -- id, values,
-- createdAt, createdBy, updatedAt, lastActivityAt, children, comments, pushedFrom. Keeping the
-- shape byte-identical is deliberate: 139 call sites across 22 files read `app.items`, and
-- rewriting them is how this change would have broken the App Builder. They keep reading the
-- same objects; only where those objects are loaded from and saved to moves.
--
-- The promoted columns are the ones RLS and indexing need, and nothing else.

create table if not exists public.wb_records (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  app_id text not null,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.wb_records is
  'One row per App Builder record. `data` is the item object as the browser holds it; the promoted columns exist for RLS and indexing. Replaces the items[] arrays inside workspace_builder_state.doc.';

-- The list every screen asks for: one app's records, in one workspace.
create index if not exists wb_records_app_idx on public.wb_records (workspace_id, app_id);
create index if not exists wb_records_company_idx on public.wb_records (company_id);

-- public.set_updated_at() already exists and is what every other table's *_set_updated_at
-- trigger calls. Reused rather than redeclared: a second copy is one more definition to keep
-- in step, and it would pick up the default PUBLIC execute grant for nothing.
drop trigger if exists wb_records_set_updated_at on public.wb_records;
create trigger wb_records_set_updated_at
before update on public.wb_records
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------------------
-- 2. Four permissions, one per operation.
-- ---------------------------------------------------------------------------------------
--
-- Gated with has_workspace_permission rather than has_company_permission. Records carry a
-- workspace_id, and the architecture's stated invariant is that workspace_id is the
-- operational data boundary -- the same choice wb_intake_submissions and wb_record_events
-- already made. It is also a tightening: the company-wide document meant a member of one
-- workspace could read another's records, which the row form ends.
--
-- Backwards compatibility matters more than tidiness here, so the old keys keep working:
-- `workspaces.view` still reads records and `workspaces.manage` still writes them. Nobody
-- loses access on deploy, and a role that wants finer control simply stops granting the broad
-- key and grants these instead.

create or replace function app_private.has_workspace_permission(target_workspace_id uuid, permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  with permission_variants as (
    select permission as permission_key
    union
    select case
      when permission = 'workspaces.records.view' then 'workspaces.view'
      when permission = 'workspaces.records.create' then 'workspaces.manage'
      when permission = 'workspaces.records.edit' then 'workspaces.manage'
      when permission = 'workspaces.records.delete' then 'workspaces.manage'
      else permission
    end
  ), workspace_company as (
    select w.company_id
    from public.workspaces w
    where w.id = target_workspace_id and w.status = 'active'
  ), membership as (
    select cm.company_id, cm.role as company_role
    from public.company_memberships cm
    join workspace_company wc on wc.company_id = cm.company_id
    where cm.profile_id = (select auth.uid()) and cm.status = 'active'
    limit 1
  ), workspace_access as (
    select wm.role_id
    from public.workspace_memberships wm
    where wm.workspace_id = target_workspace_id
      and wm.profile_id = (select auth.uid())
      and wm.status = 'active'
    limit 1
  ), assigned_roles as (
    select wa.role_id from workspace_access wa where wa.role_id is not null
    union
    select ura.role_id
    from public.user_role_assignments ura
    join membership m on m.company_id = ura.company_id
    where ura.profile_id = (select auth.uid())
      and not exists (select 1 from workspace_access wa where wa.role_id is not null)
  ), effects as (
    select rp.effect
    from assigned_roles ar
    join public.role_permissions rp on rp.role_id = ar.role_id
    where rp.permission_key = '*'
       or rp.permission_key in (select permission_key from permission_variants)
  )
  select
    (select auth.uid()) is not null
    and app_private.workspace_permission_plugin_available(target_workspace_id, permission)
    and (
      exists (select 1 from membership where company_role in ('owner', 'admin', 'developer'))
      or (
        exists (select 1 from membership)
        and exists (select 1 from workspace_access)
        and not exists (select 1 from effects where effect = 'deny')
        and (
          exists (select 1 from effects where effect = 'allow')
          or permission in ('jobs.view', 'tasks.view', 'users.view', 'settings.view', 'plugins.view')
        )
      )
    );
$function$;

-- ---------------------------------------------------------------------------------------
-- 3. Row level security, one policy per operation.
-- ---------------------------------------------------------------------------------------
--
-- This is the whole point of the table. Four separate policies is what makes "may add a
-- record but never delete one" a thing the database can actually enforce, rather than a
-- checkbox the browser honours and the API ignores.

alter table public.wb_records enable row level security;

drop policy if exists "wb records read" on public.wb_records;
create policy "wb records read" on public.wb_records
for select to authenticated
using (app_private.has_workspace_permission(workspace_id, 'workspaces.records.view'));

drop policy if exists "wb records insert" on public.wb_records;
create policy "wb records insert" on public.wb_records
for insert to authenticated
with check (app_private.has_workspace_permission(workspace_id, 'workspaces.records.create'));

drop policy if exists "wb records update" on public.wb_records;
create policy "wb records update" on public.wb_records
for update to authenticated
using (app_private.has_workspace_permission(workspace_id, 'workspaces.records.edit'))
with check (app_private.has_workspace_permission(workspace_id, 'workspaces.records.edit'));

drop policy if exists "wb records delete" on public.wb_records;
create policy "wb records delete" on public.wb_records
for delete to authenticated
using (app_private.has_workspace_permission(workspace_id, 'workspaces.records.delete'));

-- anon holds nothing here. The blanket legacy grants were revoked in 20260828002845 and the
-- default privileges with them, so this is stated rather than inherited.
grant select, insert, update, delete on public.wb_records to authenticated;
revoke all on public.wb_records from anon;

-- ---------------------------------------------------------------------------------------
-- 4. Backfill, copying rather than moving.
-- ---------------------------------------------------------------------------------------
--
-- Idempotent: re-running adopts nothing new and overwrites nothing, so a replay on an
-- environment that already has the rows is a no-op rather than a conflict.
--
-- THE WORKSPACE ID IN THE DOCUMENT IS NOT A UUID. The builder addresses workspaces as
-- `ws-<uuid>` (src/workspace/builder-core.js builds it, ops-workspace-id.js strips it), with a
-- legacy `ws-<companyId>` form meaning "this company's default workspace" that src/main.js
-- still falls back to. The first version of this migration filtered on a bare uuid pattern and
-- therefore matched nothing at all: it reported success and copied zero of the 96 records. The
-- join below is the same two rules the client uses, and it is joined rather than cast so a
-- malformed id skips the row instead of raising.
--
-- Records under a builder workspace with no real counterpart are deliberately NOT copied.
-- `allowedBuilderIds` in builder-core.js already filters those out, so they are unreachable in
-- the product; importing them would resurrect invisible data into a live workspace. They stay
-- in the document, which this migration does not modify. See .ai/known-issues.md.

insert into public.wb_records (id, company_id, workspace_id, app_id, data, created_by, created_at, updated_at)
select
  i->>'id',
  s.company_id,
  ws.id,
  a->>'id',
  i,
  case when (i->>'createdBy') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       then (i->>'createdBy')::uuid else null end,
  coalesce((i->>'createdAt')::timestamptz, now()),
  coalesce((i->>'updatedAt')::timestamptz, (i->>'createdAt')::timestamptz, now())
from public.workspace_builder_state s
cross join lateral jsonb_array_elements(coalesce(s.doc->'workspaces', '[]'::jsonb)) w
cross join lateral jsonb_array_elements(coalesce(w->'apps', '[]'::jsonb)) a
cross join lateral jsonb_array_elements(coalesce(a->'items', '[]'::jsonb)) i
join public.workspaces ws
  on ws.company_id = s.company_id
 and (
   ws.id::text = substring(w->>'id' from 4)
   or (substring(w->>'id' from 4) = s.company_id and ws.is_default and ws.status = 'active')
 )
where i->>'id' is not null
on conflict (id) do nothing;
