-- Company icon colour.
--
-- A chosen icon now renders as a plain glyph rather than sitting in a tinted tile, so its
-- colour is the whole of its appearance. This stores that choice per company.
--
-- NOT YET APPLIED to the live project. Written to be reviewed first, because it changes a
-- shared production schema and alters the signature of an RPC the app already calls.
--
-- Applying it is safe in either order relative to a deploy:
--   * old client + new schema -> the 4-arg RPC still exists, colour keeps its default
--   * new client + old schema -> the 5-arg call fails, so apply this BEFORE deploying a
--     client that sends p_icon_color
-- The old 4-argument function is deliberately left in place rather than dropped, so a
-- rollback of the client does not need a rollback of the database.

alter table public.companies
  add column if not exists icon_color text not null default '#e0552d';

-- Six-digit hex only. The value is interpolated into a style attribute in the browser, so
-- the constraint is a correctness AND an injection boundary; three-digit shorthand is
-- normalised client-side before it ever gets here.
alter table public.companies
  drop constraint if exists companies_icon_color_check;

alter table public.companies
  add constraint companies_icon_color_check
  check (icon_color ~ '^#[0-9a-f]{6}$');

update public.companies
set icon_color = '#e0552d'
where icon_color is null
   or icon_color !~ '^#[0-9a-f]{6}$';

create or replace function app_private.normalize_icon_color(value text)
returns text
language sql
immutable
set search_path = public, app_private, pg_temp
as $$
  -- Anything that is not a plain six-digit hex becomes Quest orange, so a bad value can
  -- never reach the constraint and fail an otherwise valid company update.
  select case
    when lower(trim(coalesce(value, ''))) ~ '^#[0-9a-f]{6}$' then lower(trim(value))
    else '#e0552d'
  end;
$$;

create or replace function public.update_company_workspace(
  target_company_id text,
  workspace_name text,
  icon_key text,
  icon_image text default null,
  p_icon_color text default null
)
returns text
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  clean_company_id text := trim(coalesce(target_company_id, ''));
  clean_name text := trim(coalesce(workspace_name, ''));
  clean_icon text := app_private.normalize_workspace_icon_key(icon_key);
  clean_icon_image text := trim(coalesce(icon_image, ''));
  -- Null means "leave it alone", which is what an older client sends.
  clean_icon_color text := case
    when p_icon_color is null then null
    else app_private.normalize_icon_color(p_icon_color)
  end;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if clean_company_id = '' then
    raise exception 'Company is required';
  end if;

  if clean_name = '' then
    raise exception 'Workspace name is required';
  end if;

  if clean_icon_image <> ''
    and (
      length(clean_icon_image) > 330000
      or clean_icon_image !~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$'
    )
  then
    raise exception 'Workspace icon upload must be a PNG, JPG, or WebP image under 220 KB.';
  end if;

  if not (app_private.is_company_admin(clean_company_id) or app_private.is_quest_admin()) then
    raise exception 'Workspace admin access required';
  end if;

  update public.companies c
  set name = clean_name,
      short_name = clean_name,
      label = clean_name,
      icon_key = clean_icon,
      icon_image = clean_icon_image,
      icon_color = coalesce(clean_icon_color, c.icon_color)
  where c.id = clean_company_id;

  if not found then
    raise exception 'Company not found';
  end if;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    clean_company_id,
    auth.uid(),
    'company.updated',
    'company',
    clean_company_id,
    jsonb_build_object(
      'name',
      clean_name,
      'icon_key',
      clean_icon,
      'icon_image',
      case when clean_icon_image = '' then '' else 'uploaded' end,
      'icon_color',
      clean_icon_color
    )
  );

  return clean_company_id;
end;
$$;

-- The five-argument overload. The four-argument one is untouched and still granted, so a
-- client mid-rollout can call either.
revoke all on function public.update_company_workspace(text, text, text, text, text) from public, anon;
grant execute on function public.update_company_workspace(text, text, text, text, text) to authenticated;

revoke all on function app_private.normalize_icon_color(text) from public, anon, authenticated;
