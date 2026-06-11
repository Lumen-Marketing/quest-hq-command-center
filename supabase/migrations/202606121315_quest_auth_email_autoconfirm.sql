create or replace function public.quest_confirm_email_before_insert()
returns trigger
language plpgsql
security definer
set search_path = auth, public, pg_temp
as $$
begin
  if new.email is not null then
    new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
    new.confirmed_at := coalesce(new.confirmed_at, new.email_confirmed_at, now());
    new.confirmation_token := coalesce(nullif(new.confirmation_token, ''), '');
    new.confirmation_sent_at := coalesce(new.confirmation_sent_at, now());
  end if;

  return new;
end;
$$;

revoke execute on function public.quest_confirm_email_before_insert() from public, anon, authenticated;

drop trigger if exists before_auth_user_created_quest_confirm on auth.users;
create trigger before_auth_user_created_quest_confirm
before insert on auth.users
for each row execute function public.quest_confirm_email_before_insert();
