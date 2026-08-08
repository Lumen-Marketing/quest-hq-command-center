-- Member shipped locked, because guard_system_role() refused any change to an is_system role
-- and both defaults carry that flag. That was the wrong line to draw. Member is a starting
-- point -- every company needs to tune what an ordinary person can do -- and locking it left
-- the only editable roles the ones you build from nothing.
--
-- The line that matters is FULL ACCESS, not is_system. A role holding '*' has every permission
-- there is, including ones not invented yet; rewriting that role IS the escalation this
-- trigger exists to stop, and it happens to be Owner.
--
-- Deleting either default is still refused for anyone but an Owner: losing Member would leave
-- the company with nothing to assign but Owner, which is the situation the defaults prevent.

create or replace function app_private.guard_system_role()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_row public.roles%rowtype := coalesce(old, new);
  v_full boolean;
begin
  if app_private.is_company_owner(v_row.company_id) or app_private.is_quest_admin() then
    return coalesce(new, old);
  end if;

  if tg_op = 'DELETE' and coalesce(v_row.is_system, false) then
    raise exception 'Owner and Member are the roles every company starts with and cannot be deleted';
  end if;

  select exists (
    select 1 from public.role_permissions rp
    where rp.role_id = v_row.id and rp.permission_key = '*' and rp.effect = 'allow'
  ) into v_full;

  if v_full then
    raise exception 'Only an Owner can change a role that holds full access';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists roles_guard_system on public.roles;
create trigger roles_guard_system
before update or delete on public.roles
for each row execute function app_private.guard_system_role();