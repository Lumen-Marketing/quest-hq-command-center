# SMS (SMSblast) setup

Phase 1 texting on a single shared number. Do these steps to turn it on.

## 1. Generate the API key
SMSblast → Settings → Integrations (APIs) → **Generate API Key**. Copy it.

## 2. Server environment variables (Vercel → Project → Settings → Environment Variables)
Set for **Production** and **Preview** (never prefix with `VITE_`):

| Variable | Value |
| --- | --- |
| `SMSBLAST_API_KEY` | the key from step 1 |
| `SMSBLAST_WEBHOOK_TOKEN` | a long random secret you generate (e.g. `openssl rand -hex 24`) |

Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are already set (used by the send/inbound functions).

## 3. Apply the database migration
Apply `supabase/migrations/20260721100000_sms_messaging.sql` to the Quest HQ Supabase
project (Supabase SQL editor, `supabase db push`, or the Supabase MCP). Confirm the tables exist:

    select table_name from information_schema.tables
    where table_schema = 'public' and table_name in ('sms_numbers','sms_messages');

Expected: two rows.

## 4. Map the phone number to the company
Run in the Supabase SQL editor, replacing `<COMPANY_ID>` with the real company id:

    insert into public.sms_numbers (company_id, from_number, active)
    values ('<COMPANY_ID>', '+18555945081', true)
    on conflict (from_number) do update set company_id = excluded.company_id, active = true;

Find the company id with: `select id, name from public.companies order by created_at;`

## 5. Point SMSblast inbound at the webhook
SMSblast → Integrations → **Webhooks** tab. Set the incoming-message webhook URL to:

    https://<your-app-domain>/api/sms-inbound?token=<SMSBLAST_WEBHOOK_TOKEN>

Method: POST. This is how customer replies reach the app.

> **Payload check:** the inbound handler reads the sender/recipient/text defensively
> (`from`/`to`/`message` and common variants). If replies don't appear, check the SMSblast
> webhook's actual field names against `api/sms-inbound.js` and adjust the field list.

## 6. Verify end-to-end
- Open a contact with your own mobile number, go to the **Messages** tab, send a test text.
  Confirm you receive it and the bubble shows "sent".
- Reply from your phone. Within a few seconds the reply appears in the thread.
- Text the number from a phone that is NOT a contact — confirm a new contact is auto-created
  under "Leads" with the message attached.

> **Provider id field:** `api/_lib/smsblast.js` / `api/sms-send.js` extract the message id from
> `id` / `messageId` / `message_id`. If SMSblast returns a different field on success, update the
> `providerId` line in `api/sms-send.js` (one line).

## Notes
- Each text costs money against the SMSblast balance. A failed send (e.g. empty balance) is
  saved as a "failed" bubble so nothing looks silently lost.
- This is Phase 1 (one shared number). The per-business-account reseller model is tracked in
  `docs/partnerships/2026-07-21-smsblast-partnership.md`.
