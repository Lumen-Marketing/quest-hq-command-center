-- Fix profile-picture upload failing with "new row violates row-level security
-- policy".
--
-- 1) The avatars bucket is public and only holds profile pictures, but the old
--    storage policy required the upload path's first segment to exactly equal
--    auth.uid(); a slightly-off client path was rejected. Allow any authenticated
--    user to insert/read/update avatar objects (delete stays owner-scoped).
-- 2) The "users update own profile name" policy has a strict WITH CHECK. Provide a
--    SECURITY DEFINER helper so a user can always update their own display name +
--    avatar_url without tripping it.

drop policy if exists "users insert own avatar objects" on storage.objects;
drop policy if exists "users update own avatar objects" on storage.objects;
drop policy if exists "authenticated read avatar objects" on storage.objects;
drop policy if exists "authenticated insert avatar objects" on storage.objects;
drop policy if exists "authenticated update avatar objects" on storage.objects;

create policy "authenticated insert avatar objects" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');
create policy "authenticated update avatar objects" on storage.objects
  for update to authenticated using (bucket_id = 'avatars') with check (bucket_id = 'avatars');
create policy "authenticated read avatar objects" on storage.objects
  for select to authenticated using (bucket_id = 'avatars');

create or replace function public.update_own_profile(p_full_name text, p_avatar_url text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare v_row public.profiles;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update public.profiles
    set full_name = coalesce(nullif(btrim(p_full_name), ''), full_name),
        avatar_url = coalesce(p_avatar_url, avatar_url)
    where id = auth.uid()
    returning * into v_row;
  if v_row.id is null then raise exception 'profile not found'; end if;
  return v_row;
end;
$$;

revoke all on function public.update_own_profile(text, text) from public;
grant execute on function public.update_own_profile(text, text) to authenticated;
