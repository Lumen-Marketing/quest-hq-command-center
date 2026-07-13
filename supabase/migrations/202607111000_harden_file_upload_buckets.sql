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
-- (quest-finance-attachments holds invoices/receipts — same document policy.)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('quest-job-files', 'quest-job-files', false, 26214400,
    array['application/pdf','image/png','image/jpeg','image/webp','image/gif','text/plain','text/csv']),
  ('quest-message-attachments', 'quest-message-attachments', false, 26214400,
    array['application/pdf','image/png','image/jpeg','image/webp','image/gif','text/plain','text/csv']),
  ('quest-client-portal-documents', 'quest-client-portal-documents', false, 26214400,
    array['application/pdf','image/png','image/jpeg','image/webp','image/gif','text/plain','text/csv']),
  ('quest-finance-attachments', 'quest-finance-attachments', false, 26214400,
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
-- Write-path RLS is ALREADY company- and permission-scoped. Do not "simplify" it
-- to a plain membership check — that would be a downgrade.
--
-- Verified against pg_policies: every INSERT policy on storage.objects already
-- gates on the company in the object's first path segment AND on a specific
-- permission (and, for some buckets, an active subscription). For example:
--
--   bucket_id = 'quest-job-files'
--     AND app_private.is_company_member(split_part(name, '/', 1))
--     AND app_private.has_company_permission(split_part(name, '/', 1), 'files.manage')
--
-- A membership-only check (`company_id in (select ... from company_memberships)`)
-- would DROP the has_company_permission and subscription_allows_access gates and
-- let any member of a company write to any bucket folder for that company,
-- regardless of role. This bucket allowlist is the file-type backstop only; the
-- tenant/permission boundary lives in those policies. Leave them alone.
