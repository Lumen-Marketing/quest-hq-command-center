-- Appearance settings did not follow people between devices.
--
-- The sync itself worked. Both appearance RPCs rebuild the payload from a hard-coded
-- whitelist and then REPLACE the stored object with the result, so any key not named in the
-- whitelist is dropped on the way in. The list was written when appearance meant theme,
-- accent, background and card style. Everything added since -- the sidebar themes, the icon
-- packs, the sidebar colours -- was silently discarded server-side.
--
-- The client never noticed: a failed or lossy appearance sync deliberately does not
-- interrupt the user (it is a preference, not data), and the setting still applied locally
-- from localStorage. So it looked right on the device where it was chosen and reverted to
-- default everywhere else -- which is exactly what was reported.
--
-- Two RPCs carried identical copies of that list, and both went stale together. They now
-- share one sanitiser, so the next key added has one place to be added rather than two.

create or replace function app_private.clean_appearance_prefs(p_prefs jsonb)
returns jsonb
language sql
immutable
set search_path to ''
as $$
  -- Unknown keys are dropped rather than stored: this value is written back into every
  -- session, and an open object would let anything ride along into other people's browsers.
  select jsonb_strip_nulls(jsonb_build_object(
    'themeMode', (case when p_prefs->>'themeMode' in ('light', 'dark', 'system')
                       then p_prefs->>'themeMode' end),
    'accent', (case when p_prefs->>'accent' in ('quest', 'blue', 'green', 'slate')
                    then p_prefs->>'accent' end),

    -- Added 2026-08-04. These are the keys that were being lost.
    'iconPack', (case when p_prefs->>'iconPack' in ('quest', 'material', 'lucide', 'phosphor', 'remix')
                      then p_prefs->>'iconPack' end),
    'sidebarTheme', (case when p_prefs->>'sidebarTheme' in
                            ('default', 'midnight', 'dark', 'coffee', 'hot', 'forest', 'light', 'custom')
                          then p_prefs->>'sidebarTheme' end),
    'sidebarBg', (case when p_prefs->>'sidebarBg' ~* '^#[0-9a-f]{6}$'
                       then lower(p_prefs->>'sidebarBg') end),
    'sidebarAccent', (case when p_prefs->>'sidebarAccent' ~* '^#[0-9a-f]{6}$'
                           then lower(p_prefs->>'sidebarAccent') end),
    -- Empty string is a real value here, not a missing one: it means "follow the preset",
    -- which picks light or dark text to suit its own background. Storing it matters,
    -- because it is how someone clears a colour they had set.
    'sidebarText', (case when p_prefs->>'sidebarText' = '' then ''
                         when p_prefs->>'sidebarText' ~* '^#[0-9a-f]{6}$'
                         then lower(p_prefs->>'sidebarText') end),

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
$$;

revoke all on function app_private.clean_appearance_prefs(jsonb) from public;

create or replace function public.update_own_appearance(p_prefs jsonb)
returns profiles
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_row public.profiles;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  if p_prefs is null or jsonb_typeof(p_prefs) <> 'object' then
    raise exception 'appearance payload must be an object';
  end if;

  update public.profiles
     set appearance_prefs = app_private.clean_appearance_prefs(p_prefs)
   where id = (select auth.uid())
   returning * into v_row;

  if v_row.id is null then
    raise exception 'profile not found';
  end if;
  return v_row;
end;
$function$;

create or replace function public.update_company_appearance(target_company_id text, p_prefs jsonb)
returns companies
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_row public.companies;
  v_company_id text := btrim(coalesce(target_company_id, ''));
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  if v_company_id = '' then
    raise exception 'company is required';
  end if;

  if not (app_private.is_company_admin(v_company_id) or app_private.is_quest_admin()) then
    raise exception 'Company admin access required';
  end if;

  if p_prefs is null or jsonb_typeof(p_prefs) <> 'object' then
    raise exception 'appearance payload must be an object';
  end if;

  update public.companies
     set appearance_prefs = app_private.clean_appearance_prefs(p_prefs)
   where id = v_company_id
   returning * into v_row;

  if v_row.id is null then
    raise exception 'company not found';
  end if;
  return v_row;
end;
$function$;

-- Unchanged from the originals: authenticated execution only, no anon.
revoke all on function public.update_own_appearance(jsonb) from public, anon;
revoke all on function public.update_company_appearance(text, jsonb) from public, anon;
grant execute on function public.update_own_appearance(jsonb) to authenticated;
grant execute on function public.update_company_appearance(text, jsonb) to authenticated;
