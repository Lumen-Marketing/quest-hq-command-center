-- PROPOSED. Deliberately NOT in supabase/migrations/ yet.
--
-- A file in the migrations folder is a promise that it will be applied on the next run.
-- This one must land in the SAME change as the dual-write code, so it lives here until
-- phase 1 actually starts. Move it to supabase/migrations/<timestamp>_wb_items.sql then.
-- App Builder records become rows. Phase 1 of .ai/plans/app-builder-records-as-rows.md
--
-- NOT YET APPLIED. Reviewed first, then applied with dual-write already shipping, so the
-- table fills alongside the document rather than instead of it.
--
-- Additive only: this creates one table and touches no existing column, so reverting is
-- `drop table public.wb_items` plus one code flag. That is deliberate — everything a user
-- can see keeps reading the JSON document until the reconciliation says the rows agree.

create table if not exists public.wb_items (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  -- The app's id inside the builder document. Text, not a foreign key: apps still live in
  -- the doc, and a real reference would need them moved first. Phase 1 moves one thing.
  app_id text not null,

  -- Child collections. A daily belongs to a job: parent_id points at the job row, and
  -- collection names which list it is in. A top-level record has parent_id null and an
  -- empty collection, so the same table serves both without a second shape.
  parent_id uuid references public.wb_items(id) on delete cascade,
  collection text not null default '',

  -- Whatever the app's uniqueness rule computes to, filled by the writer. One partial index
  -- below serves every app's rule, so no app ever needs an index created at runtime -- which
  -- would mean DDL from user input.
  unique_key text,

  values jsonb not null default '{}'::jsonb,

  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A record cannot be its own parent. Deeper cycles are prevented by the UI only building
  -- one level; if collections ever nest, this needs a trigger walking the chain.
  constraint wb_items_not_own_parent check (parent_id is null or parent_id <> id),
  -- A child must say which collection it is in, and a top-level record must not claim one.
  constraint wb_items_collection_matches_parent
    check ((parent_id is null and collection = '') or (parent_id is not null and collection <> ''))
);

-- "One daily per crew per day" and every rule like it, from one index.
create unique index if not exists wb_items_unique_key
  on public.wb_items (app_id, collection, unique_key)
  where unique_key is not null;

create index if not exists wb_items_by_app
  on public.wb_items (company_id, app_id, collection);
create index if not exists wb_items_by_parent
  on public.wb_items (parent_id) where parent_id is not null;
create index if not exists wb_items_by_workspace
  on public.wb_items (workspace_id);

alter table public.wb_items enable row level security;

-- Same shape as every other workspace-owned table: membership plus an explicit permission,
-- resolved through the SECURITY DEFINER helpers so the policy cannot recurse.
drop policy if exists "wb_items read" on public.wb_items;
create policy "wb_items read" on public.wb_items for select to authenticated
  using (
    app_private.is_workspace_member(workspace_id)
    and app_private.has_workspace_permission(workspace_id, 'workspaces.view')
  );

drop policy if exists "wb_items insert" on public.wb_items;
create policy "wb_items insert" on public.wb_items for insert to authenticated
  with check (
    app_private.is_workspace_member(workspace_id)
    and app_private.has_workspace_permission(workspace_id, 'workspaces.manage')
  );

drop policy if exists "wb_items update" on public.wb_items;
create policy "wb_items update" on public.wb_items for update to authenticated
  using (
    app_private.is_workspace_member(workspace_id)
    and app_private.has_workspace_permission(workspace_id, 'workspaces.manage')
  )
  with check (
    app_private.is_workspace_member(workspace_id)
    and app_private.has_workspace_permission(workspace_id, 'workspaces.manage')
  );

drop policy if exists "wb_items delete" on public.wb_items;
create policy "wb_items delete" on public.wb_items for delete to authenticated
  using (
    app_private.is_workspace_member(workspace_id)
    and app_private.has_workspace_permission(workspace_id, 'workspaces.manage')
  );

-- The workspace must belong to the row's company, the same guard every other
-- workspace-owned table carries. Without it a record is readable from the wrong account.
drop trigger if exists wb_items_validate_workspace on public.wb_items;
create trigger wb_items_validate_workspace
  before insert or update on public.wb_items
  for each row execute function app_private.validate_workspace_record_links();

-- A child must sit in the same workspace as its parent, or a record's own children could be
-- invisible to the person looking at it.
create or replace function app_private.wb_items_parent_same_workspace()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.parent_id is not null and not exists (
    select 1 from public.wb_items p
    where p.id = new.parent_id and p.workspace_id = new.workspace_id
  ) then
    raise exception 'Child record must be in the same workspace as its parent';
  end if;
  return new;
end;
$$;

drop trigger if exists wb_items_parent_workspace on public.wb_items;
create trigger wb_items_parent_workspace
  before insert or update on public.wb_items
  for each row execute function app_private.wb_items_parent_same_workspace();

-- Each table in this schema carries its own touch function; there is no shared one to reuse.
create or replace function public.touch_wb_item_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists wb_items_touch on public.wb_items;
create trigger wb_items_touch
  before update on public.wb_items
  for each row execute function public.touch_wb_item_updated_at();
