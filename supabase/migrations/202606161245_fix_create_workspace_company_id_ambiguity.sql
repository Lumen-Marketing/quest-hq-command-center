create or replace function public.create_company_workspace(company_name text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  clean_name text := trim(coalesce(company_name, ''));
  base_id text;
  v_company_id text;
  owner_role_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if clean_name = '' then
    raise exception 'Company name is required';
  end if;

  base_id := trim(both '-' from regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g'));
  if base_id = '' then
    base_id := 'company';
  end if;

  v_company_id := base_id;
  while exists (select 1 from public.companies c where c.id = v_company_id) loop
    v_company_id := base_id || '-' || lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end loop;

  insert into public.companies (id, name, short_name, color)
  values (v_company_id, clean_name, clean_name, '#f0b23b');

  insert into public.company_subscriptions (company_id, status)
  values (v_company_id, 'trialing')
  on conflict (company_id) do nothing;

  insert into public.company_memberships (company_id, profile_id, role, status)
  values (v_company_id, auth.uid(), 'owner', 'active')
  on conflict (company_id, profile_id) do update
    set role = 'owner',
        status = 'active',
        updated_at = now();

  update public.profiles p
  set approved = true,
      role = case when p.role = 'member' then 'admin' else p.role end,
      company_ids = array(
        select distinct unnest(coalesce(p.company_ids, '{}'::text[]) || array[v_company_id])
      )
  where p.id = auth.uid();

  insert into public.roles (company_id, name, color, priority, is_system, created_by)
  values (v_company_id, 'Owner', '#f0b23b', 1000, true, auth.uid())
  returning id into owner_role_id;

  insert into public.role_permissions (role_id, permission_key, effect)
  values (owner_role_id, '*', 'allow')
  on conflict (role_id, permission_key) do nothing;

  insert into public.user_role_assignments (company_id, profile_id, role_id, assigned_by)
  values (v_company_id, auth.uid(), owner_role_id, auth.uid())
  on conflict do nothing;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (v_company_id, auth.uid(), 'company.created', 'company', v_company_id, jsonb_build_object('name', clean_name));

  return v_company_id;
end;
$$;

revoke all on function public.create_company_workspace(text) from public, anon;
grant execute on function public.create_company_workspace(text) to authenticated;
