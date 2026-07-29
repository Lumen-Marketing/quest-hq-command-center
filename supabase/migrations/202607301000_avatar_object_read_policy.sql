-- Profile picture uploads failed for every signed-in user with
-- "new row violates row-level security policy" (HTTP 400 from storage).
--
-- The avatars bucket had INSERT, UPDATE and DELETE policies but no SELECT policy.
-- The Storage API reads the object row back as part of an upload (and checks for an
-- existing object when upsert is set), so with no SELECT policy that read was denied
-- and the whole request failed — the write itself was always permitted. Same shape as
-- the message_conversations INSERT ... RETURNING failure.
--
-- Scoped to the caller's own prefix, mirroring the three existing avatar policies.
-- This grants no new visibility: the avatars bucket is public, so the images are
-- already readable through /object/public/avatars/..., which does not consult this
-- policy at all. What changes is that a user can read the metadata row for the object
-- they just wrote.

drop policy if exists "users read own avatar objects" on storage.objects;
create policy "users read own avatar objects" on storage.objects
for select to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = ((select auth.uid()))::text
);
