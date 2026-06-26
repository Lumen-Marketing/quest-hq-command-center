alter table public.companies
  add column if not exists icon_image text not null default '';

alter table public.companies
  drop constraint if exists companies_icon_image_check;

alter table public.companies
  add constraint companies_icon_image_check
  check (
    icon_image = ''
    or (
      length(icon_image) <= 330000
      and icon_image ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$'
    )
  );

create or replace function public.update_company_workspace(
  target_company_id text,
  workspace_name text,
  icon_key text,
  icon_image text default null
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
      icon_image = clean_icon_image
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
      case when clean_icon_image = '' then '' else 'uploaded' end
    )
  );

  return clean_company_id;
end;
$$;

revoke all on function public.update_company_workspace(text, text, text, text) from public, anon;
grant execute on function public.update_company_workspace(text, text, text, text) to authenticated;
