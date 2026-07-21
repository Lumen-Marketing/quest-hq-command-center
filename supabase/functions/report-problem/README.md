# report-problem

Receives in-app bug / problem / suggestion reports, stores them in
`public.bug_reports`, and emails a copy to the platform inbox via Resend.
Ported unchanged from the standalone task app in Phase 4.

## Why unchanged

Its insert columns (`reporter_id`, `reporter_name`, `reporter_email`, `type`,
`description`, `context`) match the `bug_reports` table created by
`202607221400_taskmanagement_phase2_runtime_delta.sql` exactly, and the table is
platform-global by design (locked decision: the quest-admin inbox reads it).
A report's body may name the reporter's own company — that is intended content
for the platform inbox, not a cross-tenant leak: nothing lets one tenant read
another tenant's reports.

The function is the only write path to the table; it enforces its own auth,
payload caps, and a 5-reports-per-hour rate limit per reporter.

## Secrets to set before deploying

| Secret | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key (same key as notify-email) |
| `EMAIL_FROM` | From address on the notification copy |
| `ALLOWED_ORIGINS` | Comma-separated origins allowed to call the function (CORS) |
| `APP_URL` | Base URL for links in the emailed copy |

`SUPABASE_*` values are injected automatically.

## Deploy

Batched with the migrations — not yet deployed:

```bash
supabase functions deploy report-problem --project-ref lpzotcznihwyyudxycmd
```
