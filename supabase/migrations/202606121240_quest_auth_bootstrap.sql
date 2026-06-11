create or replace function public.slugify_member_id(input text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, 'member')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_member_id text := coalesce(nullif(public.slugify_member_id(split_part(new.email, '@', 1)), ''), 'member-' || left(new.id::text, 8));
  v_full_name text := coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1));
  v_is_first_profile boolean;
  v_role text;
  v_approved boolean;
  v_company_ids text[];
begin
  select not exists (select 1 from public.profiles) into v_is_first_profile;
  v_role := case when v_is_first_profile then 'developer' else 'member' end;
  v_approved := v_is_first_profile;
  v_company_ids := case when v_is_first_profile then array['roofing', 'drafting', 'lumen'] else '{}'::text[] end;

  insert into public.team_members (id, name, full_name, email, color, active, company_ids)
  values (v_member_id, split_part(v_full_name, ' ', 1), v_full_name, new.email, '#' || substr(md5(new.email), 1, 6), v_approved, v_company_ids)
  on conflict (id) do update set
    name = excluded.name,
    full_name = excluded.full_name,
    email = excluded.email,
    active = excluded.active,
    company_ids = excluded.company_ids;

  insert into public.profiles (id, email, full_name, approved, role, email_verified, member_id, company_ids)
  values (new.id, new.email, v_full_name, v_approved, v_role, false, v_member_id, v_company_ids)
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    member_id = excluded.member_id;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_taskmanagement on auth.users;
drop trigger if exists on_auth_user_created_quest_hq on auth.users;
create trigger on_auth_user_created_quest_hq
after insert on auth.users
for each row execute function public.handle_new_user();
