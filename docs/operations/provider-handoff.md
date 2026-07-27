# Questbase owner and provider handoff

This page tracks launch inputs that cannot be completed safely in code. Store
credentials only in the provider dashboards, never in this file.

## Owner decisions

- Confirm the public plan name, price, billing interval, trial/refund approach,
  and taxes before checkout is enabled.
- Confirm the legal business name, support address, customer support email,
  statement descriptor, and public terms/privacy links.
- Name the person authorized to approve banking, payment, and email-provider
  accounts.

## Payment provider

- Complete the owner/business identity review.
- Connect the approved settlement bank account.
- Confirm the live payment account is activated.
- Create the production product and price only after the owner approves them.
- Supply the resulting non-secret price ID and store secret/webhook keys in
  Vercel.
- Keep `VITE_BILLING_MODE=manual` until a real checkout, webhook, subscription
  update, failed payment, and cancellation have been tested.

Questbase's current manual-approval billing mode is the safe pilot fallback. It
must not be presented as automatic paid checkout.

## Transactional email

- Approve the Resend account owner.
- Choose and verify a Questbase sender domain.
- Add the provider's DNS records.
- Store `RESEND_API_KEY`, `EMAIL_FROM`, and `APP_URL` in Supabase.
- Send a controlled company invite to a team mailbox and complete acceptance.

## Supabase Auth email

Registration, verification, and password recovery are separate from the invite
Edge Function. Configure custom SMTP and branded Auth templates, then test all
three flows against team-owned mailboxes before public self-service onboarding.

## Domain and public identity

- Keep `questbase.io` and `www.questbase.io` attached to the production Vercel
  project.
- Confirm HTTPS, the preferred canonical host, and login/password-reset links.
- Confirm the support email is monitored during the pilot.

## Evidence to hand back to development

Share only status and non-secret identifiers: provider activated yes/no,
verified sender/domain, approved price ID, webhook endpoint status, and the
date/results of controlled tests. Never send passwords, bank details, API keys,
service-role keys, or webhook secrets in chat or source control.
