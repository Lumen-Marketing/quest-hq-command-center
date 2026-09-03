# notify-email

Sends task notification emails (assignment, mentions, reminders) via Resend.
Ported from the standalone task app in Phase 4 of the task-app absorption.

## Changes from upstream

The original port authorized the caller by the legacy global `profiles.role`
and then pooled recipients from every company the caller belonged to. That did
not match Questbase's company-scoped role and permission model.

This port adds tenant scoping in two places:

1. **Explicit company** — every request must name exactly one `company_id`.
2. **Sender** — the caller needs an active membership plus `tasks.manage` in
   that company; Owner, Admin, and Developer retain their normal elevated-role
   behavior.
3. **Recipients** — the allowlist contains only members of that same company.
4. **Shared rate limit** — the existing service-role-only
   `consume_rate_limit` RPC caps each sender/company pair at 20 sends per hour,
   across cold starts and all Edge Function instances.

Payload size caps, HTML sanitizing, CORS, and provider error handling remain in
place.

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
supabase functions deploy notify-email --project-ref rqundirizvojpzhljtdn
```

Then set the secrets above in the Supabase dashboard (Edge Functions → Secrets).

## Verifying after deploy

Part of Phase 5's leak test: trigger every email type as one tenant and confirm
no mail reaches another tenant's members, and that every link points at
`APP_URL`.
