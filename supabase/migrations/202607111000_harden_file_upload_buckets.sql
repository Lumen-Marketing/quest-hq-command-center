-- Harden every file-upload bucket — the server-side backstop for the client's
-- 3-layer upload validation (src/security/upload-policy.js).
--
-- Supabase Storage enforces `allowed_mime_types` against the Content-Type the
-- client declares at upload time, plus `file_size_limit` in bytes. Because the
-- client now sends a *canonical* Content-Type (never a bare octet-stream — see
-- contentTypeFor()), a locked-down allowlist here rejects any file whose declared
-- type is not one we permit — even when the caller talks to the Storage API
-- directly and skips the browser entirely.
--
-- ZIP-based formats (including .docx/.xlsx, which are ZIP containers) are
-- intentionally excluded from the document buckets, matching the "drop ZIP"
-- rule. Only the Backup Import flow accepts ZIP, and it is parsed in-browser —
-- it never lands in Storage — so no bucket allows application/zip.

-- Document buckets: PDF, images, and plain text/CSV. 25 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('quest-job-files', 'quest-job-files', false, 26214400,
    array['application/pdf','image/png','image/jpeg','image/webp','image/gif','text/plain','text/csv']),
  ('quest-message-attachments', 'quest-message-attachments', false, 26214400,
    array['application/pdf','image/png','image/jpeg','image/webp','image/gif','text/plain','text/csv']),
  ('quest-client-portal-documents', 'quest-client-portal-documents', false, 26214400,
    array['application/pdf','image/png','image/jpeg','image/webp','image/gif','text/plain','text/csv'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Public-form response files: PDF, images, plain text/CSV. 15 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('quest-form-response-files', 'quest-form-response-files', false, 15728640,
    array['application/pdf','image/png','image/jpeg','image/webp','text/plain','text/csv'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Avatars stay public (served via public URLs) but keep a tight image allowlist.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ─────────────────────────────────────────────────────────────────────────────
-- OPTIONAL — company-folder-scoped write RLS (review before enabling).
--
-- Today the insert policies on these buckets allow any authenticated user to
-- write anywhere in the bucket. The block below restricts writes so a user can
-- only upload into a folder whose first path segment is a company they are an
-- ACTIVE member of (uploads use `<company_id>/...` object paths).
--
-- Before enabling, confirm that EVERY client upload path's first segment equals
-- the exact `company_memberships.company_id` value (some code paths use
-- canonicalCompanyId()); otherwise legitimate uploads will start returning
-- "row-level security" errors. Enable one bucket at a time and test an upload.
--
-- create or replace function public.storage_company_folder_ok(object_name text)
-- returns boolean language sql stable as $$
--   select split_part(object_name, '/', 1) in (
--     select company_id from public.company_memberships
--     where profile_id = auth.uid() and status = 'active'
--   );
-- $$;
--
-- do $$
-- declare b text;
-- begin
--   foreach b in array array['quest-job-files','quest-message-attachments','quest-client-portal-documents'] loop
--     execute format('drop policy if exists %I on storage.objects', 'company_scoped_insert_' || b);
--     execute format(
--       'create policy %I on storage.objects for insert to authenticated ' ||
--       'with check (bucket_id = %L and public.storage_company_folder_ok(name))',
--       'company_scoped_insert_' || b, b);
--   end loop;
-- end $$;
