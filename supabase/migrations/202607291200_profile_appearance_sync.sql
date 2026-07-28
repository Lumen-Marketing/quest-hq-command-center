-- Cross-device appearance sync.
--
-- Theme mode, accent, background preset and card styling were browser-local
-- (localStorage), so signing in on a second device meant re-picking every
-- appearance choice. They now live on the profile row and follow the user.
--
-- Deliberately NOT stored here: an uploaded custom background image. That is a
-- data URL up to ~2.2 MB, and public.profiles is read with select('*') to build
-- the whole team directory — a blob on every row would make that query
-- pathological. The image stays browser-local; every other choice syncs, and a
-- device without the image falls back to the default background.

alter table public.profiles
  add column if not exists appearance_prefs jsonb not null default '{}'::jsonb;

-- Hard ceiling so this column can never be repurposed as a blob store, whatever a
-- client sends. The whitelisted payload below is well under 300 bytes.
alter table public.profiles
  drop constraint if exists profiles_appearance_prefs_size_check;
alter table public.profiles
  add constraint profiles_appearance_prefs_size_check
  check (pg_column_size(appearance_prefs) <= 2048);

-- Written through a SECURITY DEFINER RPC keyed on auth.uid(), matching
-- update_own_profile: the strict profiles WITH CHECK (which pins role, email,
-- company_ids and friends) would otherwise block a user from saving their own
-- appearance. The function whitelists and coerces every field server-side, so the
-- client never decides what may be stored and a tampered payload cannot smuggle
-- arbitrary data into the row.
create or replace function public.update_own_appearance(p_prefs jsonb)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.profiles;
  v_clean jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  if p_prefs is null or jsonb_typeof(p_prefs) <> 'object' then
    raise exception 'appearance payload must be an object';
  end if;

  v_clean := jsonb_strip_nulls(jsonb_build_object(
    'themeMode', (case when p_prefs->>'themeMode' in ('light', 'dark', 'system')
                       then p_prefs->>'themeMode' end),
    'accent', (case when p_prefs->>'accent' in ('quest', 'blue', 'green', 'slate')
                    then p_prefs->>'accent' end),
    'bgType', (case when p_prefs->>'bgType' in ('default', 'preset', 'image')
                    then p_prefs->>'bgType' end),
    'bgPreset', (case when p_prefs->>'bgPreset' in ('dots', 'grid', 'diagonal', 'mesh')
                      then p_prefs->>'bgPreset' end),
    'cardStyle', (case when p_prefs->>'cardStyle' in ('default', 'solid', 'glass')
                       then p_prefs->>'cardStyle' end),
    'cardColor', (case when p_prefs->>'cardColor' ~* '^#[0-9a-f]{6}$'
                       then lower(p_prefs->>'cardColor') end),
    'cardOpacity', (case when p_prefs->>'cardOpacity' ~ '^[0-9]{1,3}$'
                         then least(100, greatest(20, (p_prefs->>'cardOpacity')::int)) end),
    'cardBlur', (case when p_prefs->>'cardBlur' ~ '^[0-9]{1,3}$'
                      then least(40, greatest(0, (p_prefs->>'cardBlur')::int)) end)
  ));

  update public.profiles
     set appearance_prefs = v_clean
   where id = (select auth.uid())
   returning * into v_row;

  if v_row.id is null then
    raise exception 'profile not found';
  end if;
  return v_row;
end;
$$;

revoke execute on function public.update_own_appearance(jsonb) from public, anon;
grant execute on function public.update_own_appearance(jsonb) to authenticated;
