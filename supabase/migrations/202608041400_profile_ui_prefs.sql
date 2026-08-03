-- Per-account UI state that should follow someone between devices.
--
-- Appearance already syncs (202608041000). This covers the rest of what a person arranges
-- for themselves and reasonably expects to find again on another machine: their dashboard
-- widgets and layout, the sidebar and navigation state, and whether each record list opens
-- as a table or a board.
--
-- Deliberately NOT included, because they are location rather than preference: which company
-- and workspace were last open, and the sidebar scroll position. Someone with two machines
-- open on two companies should not have one yank the other around.
--
-- Data caches (quest-hq-*-cache-v1) are not included either. They are mirrors of server rows
-- and are re-fetched; syncing them would be shipping a copy of the database through a
-- preferences column.

alter table public.profiles
  add column if not exists ui_prefs jsonb not null default '{}'::jsonb;

-- Bigger than appearance's 2048 because a dashboard layout is per company AND per role, so
-- it grows with the number of companies someone belongs to. Still bounded: this is written
-- back into every session, and an unbounded column here would become one.
alter table public.profiles
  drop constraint if exists profiles_ui_prefs_size_check;
alter table public.profiles
  add constraint profiles_ui_prefs_size_check check (pg_column_size(ui_prefs) <= 32768);

-- Validation is by namespace, not by leaf key.
--
-- The appearance RPC enumerated every key it would accept, and silently dropped everything
-- added afterwards -- which is the bug this column's sibling had to be migrated to fix. The
-- shapes here are open-ended by nature (a dashboard layout is a map of company -> role ->
-- widget ids), so enumerating leaves would guarantee the same rot. Instead the top-level
-- namespace list is fixed and small, each namespace must be an object, and the whole thing
-- is size-capped by the constraint above.
create or replace function app_private.clean_ui_prefs(p_prefs jsonb)
returns jsonb
language sql
immutable
set search_path to ''
as $$
  select coalesce(
    jsonb_object_agg(key, value) filter (
      where key in ('dashboard', 'nav', 'views')
        and jsonb_typeof(value) = 'object'
    ),
    '{}'::jsonb
  )
  from jsonb_each(case when jsonb_typeof(p_prefs) = 'object' then p_prefs else '{}'::jsonb end);
$$;

revoke all on function app_private.clean_ui_prefs(jsonb) from public;

create or replace function public.update_own_ui_prefs(p_prefs jsonb)
returns profiles
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_row public.profiles;
  v_clean jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  if p_prefs is null or jsonb_typeof(p_prefs) <> 'object' then
    raise exception 'ui payload must be an object';
  end if;

  v_clean := app_private.clean_ui_prefs(p_prefs);

  -- Refuse rather than truncate. A silently half-saved layout is worse than an unsaved one:
  -- the client treats a failed sync as "keep what you have", which is recoverable.
  if pg_column_size(v_clean) > 32768 then
    raise exception 'ui preferences too large';
  end if;

  update public.profiles
     set ui_prefs = v_clean
   where id = (select auth.uid())
   returning * into v_row;

  if v_row.id is null then
    raise exception 'profile not found';
  end if;
  return v_row;
end;
$function$;

revoke all on function public.update_own_ui_prefs(jsonb) from public, anon;
grant execute on function public.update_own_ui_prefs(jsonb) to authenticated;
