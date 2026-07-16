# Storage, extensions, and scheduled work

Live catalog metadata captured 2026-07-16T19:52:01.513Z. Object names, paths, owners, and contents are deliberately excluded.

## Storage buckets

| Bucket | Public | Size limit | Allowed MIME types |
| --- | --- | ---: | --- |
| avatars | yes | 2097152 | image/jpeg, image/png, image/webp |
| quest-client-portal-documents | no | 26214400 | application/pdf, image/png, image/jpeg, image/webp, image/gif, text/plain, text/csv |
| quest-finance-attachments | no | 26214400 | application/pdf, image/png, image/jpeg, image/webp, image/gif, text/plain, text/csv |
| quest-form-response-files | no | 15728640 | application/pdf, image/png, image/jpeg, image/webp, text/plain, text/csv |
| quest-job-files | no | 26214400 | application/pdf, image/png, image/jpeg, image/webp, image/gif, text/plain, text/csv |
| quest-message-attachments | no | 26214400 | application/pdf, image/png, image/jpeg, image/webp, image/gif, text/plain, text/csv |

## Extensions

| Extension | Version |
| --- | --- |
| pg_cron | 1.6.4 |
| pg_stat_statements | 1.11 |
| pgcrypto | 1.3 |
| plpgsql | 1.0 |
| supabase_vault | 0.3.1 |
| uuid-ossp | 1.1 |

## Database cron jobs

| Job | Schedule | Active | Database |
| --- | --- | --- | --- |
| quest-hq-recycle-bin-purge | 15 3 * * * | yes | postgres |

Vercel also invokes /api/recycle-bin-purge daily from [vercel.json](../../vercel.json). Authorization depends on the deployment's server-side cron credential; never place its value in this folder.
