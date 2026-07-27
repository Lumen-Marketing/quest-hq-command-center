# report-problem

Receives in-app bug, problem, and suggestion reports, stores them in
`public.bug_reports`, and emails a copy to the platform inbox via Resend.

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
| `ALLOWED_ORIGINS` | Optional extra preview or pilot origins allowed by CORS |

`SUPABASE_*` values are injected automatically.

The production Questbase domains and stable Vercel URL are built into the CORS
allowlist. Unknown origins remain blocked. Email is best effort: the stored
report is the source of truth if Resend is not configured or delivery fails.

## Deployment

This function is live in the Questbase Supabase project. Deploy it with gateway
JWT verification disabled because the function validates the caller token and
approved profile itself:

```bash
supabase functions deploy report-problem --no-verify-jwt --project-ref rqundirizvojpzhljtdn
```
