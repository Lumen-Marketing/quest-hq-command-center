# send-company-invite

Sends a company invitation whose recipient, role, workspace access, link, and
expiry are derived from the stored invite. The caller cannot supply arbitrary
email content or recipients. Delivery status is written back to the invite, and
a failed email never invalidates the copyable invite link.

## Required production configuration

| Setting | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Transactional-email provider key |
| `EMAIL_FROM` | Verified sender, for example `Questbase <no-reply@auth.questbase.io>` |
| `APP_URL` | Canonical HTTPS app URL: `https://www.questbase.io` |
| `ALLOWED_ORIGINS` | Optional extra preview or controlled-pilot origins |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are supplied automatically by
Supabase. Never place any secret value in this repository.

The production Questbase domains and stable Vercel URL are built into the CORS
allowlist. `ALLOWED_ORIGINS` only extends that allowlist.

## No-cost provider handoff

1. Create or use the owner-approved Resend account.
2. Add and verify the chosen Questbase sender domain in Resend.
3. Add the DNS records supplied by Resend at the domain host.
4. Add `RESEND_API_KEY`, `EMAIL_FROM`, and `APP_URL` as Supabase Edge Function
   secrets.
5. Send one invite to a team-owned mailbox, confirm the HTML and plain-text
   versions arrive, accept it, and record the test in the pilot rehearsal.

Until that handoff is complete, managers can copy the invite link from
Questbase and deliver it manually.
