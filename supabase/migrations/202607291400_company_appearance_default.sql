-- Company-wide appearance default.
--
-- Complements profiles.appearance_prefs (202607291200_profile_appearance_sync.sql).
-- Resolution order in the client is: the member's own saved appearance if they have
-- ever set one, otherwise this company default, otherwise the built-in defaults.
-- A member is never locked out of their own choice — someone who needs dark mode or
-- a particular contrast keeps it after an admin sets a company look.
--
-- Same exclusions as the profile column: no uploaded background image (a data URL
-- up to ~2.2 MB), and a hard size ceiling so the column cannot become a blob store.

alter table public.companies
  add column if not exists appearance_prefs jsonb not null default '{}'::jsonb;

alter table public.companies
  drop constraint if exists companies_appearance_prefs_size_check;
alter table public.companies
  add constraint companies_appearance_prefs_size_check
  check (pg_column_size(appearance_prefs) <= 2048);

-- Owners/Admins of the company (and Quest platform admins) may set the default.
-- SECURITY DEFINER with an explicit authorization check rather than relying on a
-- table policy, matching update_company_workspace. The same server-side whitelist
-- as update_own_appearance applies, so a tampered payload cannot store arbitrary
-- data or smuggle an image in.
create or replace function public.update_company_appearance(target_company_id text, p_prefs jsonb)
returns public.companies
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.companies;
  v_clean jsonb;
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

  update public.companies
     set appearance_prefs = v_clean
   where id = v_company_id
   returning * into v_row;

  if v_row.id is null then
    raise exception 'company not found';
  end if;
  return v_row;
end;
$$;

revoke execute on function public.update_company_appearance(text, jsonb) from public, anon;
grant execute on function public.update_company_appearance(text, jsonb) to authenticated;
