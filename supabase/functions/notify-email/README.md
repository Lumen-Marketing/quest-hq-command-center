# notify-email

Sends task notification emails (assignment, mentions, reminders) via Resend.
Ported from the standalone task app in Phase 4 of the task-app absorption.

## Changes from upstream

Upstream authorized the caller by **global role** and read the **entire**
`team_members` table with the service-role client, which bypasses RLS. In a
multi-tenant deployment that let a manager of one workspace email another
workspace's staff.

This port adds tenant scoping in two places:

1. **Sender** — the caller's active `company_memberships` are loaded; a caller
   with no active membership is rejected (403).
2. **Recipients** — the allowlist query is `.overlaps("company_ids", callerCompanyIds)`,
   so only members of the caller's own companies can ever receive mail.

Everything else (payload size caps, HTML sanitizer, rate limits, CORS, error
shapes) is unchanged from upstream.

## Secrets to set before deploying

| Secret | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key — the actual mail sender |
| `EMAIL_FROM` | From address, e.g. `Quest HQ <notifications@yourdomain>` (must be a Resend-verified domain) |
| `APP_URL` | Base URL used for links inside emails — set to Command Center's production URL, **not** the old task.questroofing.com |
| `ALLOWED_ORIGINS` | Comma-separated origins allowed to call the function (CORS) — Command Center's origin |

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are injected
automatically by Supabase; do not set them by hand.

## Deploy

Not yet deployed — deployment is batched with the migrations. When ready:

```bash
supabase functions deploy notify-email --project-ref lpzotcznihwyyudxycmd
```

Then set the secrets above in the Supabase dashboard (Edge Functions → Secrets).

## Verifying after deploy

Part of Phase 5's leak test: trigger every email type as one tenant and confirm
no mail reaches another tenant's members, and that every link points at
`APP_URL`.
