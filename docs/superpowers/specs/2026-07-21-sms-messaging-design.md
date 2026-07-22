# SMS Messaging (SMSblast integration) — Design

**Date:** 2026-07-21
**Status:** Approved (design), pending implementation
**Author:** Command Center team

## Plain-language summary (the "text someone from the app" ask)

Add texting directly inside Command Center. Every contact card gets a **Messages**
tab — a small chat window. You type a message, hit send, the customer gets a real
SMS on their phone. When they reply, it appears in that same chat. If the person
who texts in isn't a contact yet, the app auto-creates a contact so no lead is lost.
Everything sent and received is saved as history on the contact.

Texting is powered by **SMSblast** (https://app.smsblast.io). Their HTTP API sends
the messages; their **webhooks** deliver incoming replies back to us.

## Goals

- Send an SMS to a contact from their card, and log it. (Boss's core demo.)
- Receive replies into the app as a two-way thread on the contact card.
- Auto-create a contact for an inbound text from an unknown number.
- Architecture ready for **one phone number per company** (multi-workspace safe).

## Non-goals (for now — later phases)

- Bulk send to a segment (e.g. all "Leads"). *(Phase 2.)*
- Event-driven automated SMS tied to the Automations module. *(Phase 3.)*
- A central cross-contact Inbox view. *(Later; v1 is per-contact only.)*
- MMS / media, delivery-receipt UI beyond a simple status.

## Key decisions (from brainstorming)

| Question | Decision |
| --- | --- |
| Send / bulk / automate | Build all three eventually; **ship manual send first**, then bulk, then automation. |
| One-way or two-way | **Two-way** (send + receive replies). |
| Where conversations live | **On the contact card** (a "Messages" tab). No central inbox in v1. |
| Unknown inbound number | **Auto-create a contact** and attach the message. |
| Single vs multi-company number | **One number per company** model. Inbound routes by the *destination* number → company (unambiguous). One number exists today; assign it to the primary company. |

## Architecture — the moving pieces

Four pieces, all following existing repo patterns (`api/_lib/endpoint.js`,
Supabase, contact cards in `src/main.js`).

### 1. Phone-number ↔ company map (Supabase)
A table `sms_numbers` mapping an owned SMSblast number to a company. This is what
makes "one number per company" work and lets inbound replies route correctly.
Adding a company = insert a row; no code change.

- `company_id` (fk), `from_number` (E.164, e.g. `+18555945081`), `active`, timestamps.
- Seed one row: the existing `+18555945081` → primary company.

### 2. `messages` table (Supabase) — the saved history
- `id`, `company_id`, `contact_id` (fk), `direction` (`outbound` | `inbound`),
  `body`, `from_number`, `to_number`, `status` (`queued`/`sent`/`failed`/`received`),
  `provider_message_id` (nullable), `error` (nullable), `created_at`.
- RLS: a member can only see messages for a company they belong to. Inbound writes
  come from the server function using the service role.

### 3. Send function — `api/send-sms.js`
- `defineEndpoint`, `method: POST`, auth = logged-in Supabase user who is a member
  of the target company. Rate-limited.
- Input: `{ contact_id, body }`.
- Steps: verify membership → load contact + its company's `from_number` from
  `sms_numbers` → normalize the contact phone to E.164 (`+1XXXXXXXXXX`) →
  POST to `https://app.smsblast.io/api/v2/sms/send` with
  `apiKey`, `from`, `to`, `message` → insert a `messages` row (status from result)
  → return the saved message.
- **The SMSblast API key is a server env var only** (`SMSBLAST_API_KEY`),
  never exposed to the browser.

### 4. Inbound function (webhook) — `api/sms-inbound.js`
- `defineEndpoint`, `method: POST`, auth = shared-secret token check (SMSblast can't
  do Supabase auth). Validate a `SMSBLAST_WEBHOOK_TOKEN` on the request.
- SMSblast posts an incoming text (`from`, `to`, `message`, provider id).
- Steps: match `to` (destination) → company via `sms_numbers` → find a contact in
  that company whose phone normalizes to `from`; **if none, auto-create** a contact
  (name = the phone number, stage = "Leads") → insert an inbound `messages` row.
- URL to paste into SMSblast's Webhooks tab: `https://<app-domain>/api/sms-inbound`.

### 5. UI — "Messages" tab on the contact card (`src/main.js`)
- New tab on the contact detail view: chat thread (outbound right, inbound left,
  timestamps) + a text box and Send button.
- Send button → calls `/api/send-sms`, appends the message to the thread.
- Thread loads that contact's `messages` newest-at-bottom; light polling or refresh
  to pick up new inbound replies (real-time subscription optional, later).

## Data flow

```
Send:    Messages tab → POST /api/send-sms → SMSblast API → customer's phone
                                           ↘ save row in `messages`
Receive: customer replies → SMSblast webhook → POST /api/sms-inbound
                                           → route by `to` number → company
                                           → match/auto-create contact
                                           → save inbound row → shows in thread
```

## Phone-number normalization

Stored contact phones are inconsistent (e.g. `928-231-0147`, `602-750-5678`, empty).
A small shared helper normalizes to E.164 (`+1` + 10 digits) for both sending and
inbound matching. Numbers that can't be normalized (empty/invalid) can't be texted;
the Send button is disabled for them with a clear message.

## Error handling

- No `from_number` mapped for the company → clear "SMS not set up for this company" error.
- Contact has no valid phone → Send disabled with explanation.
- SMSblast returns an error / no balance → save the message as `failed` with the
  error, show it in the thread so nothing looks silently lost.
- Inbound webhook with bad/missing token → reject 401 (protects against spam/abuse).
- Inbound for a `to` number we don't own → ignore safely (200, no-op).

## Security & cost notes

- `SMSBLAST_API_KEY` and `SMSBLAST_WEBHOOK_TOKEN` are **server env vars only**
  (Vercel Production/Preview), never `VITE_`-prefixed.
- Each SMS costs money (SMSblast balance). Out of scope to meter in v1, but failures
  from an empty balance are surfaced.

## What the human (non-technical) needs to set up

1. In SMSblast → Integrations → **Generate API Key**, copy it.
2. Add env vars in Vercel: `SMSBLAST_API_KEY` (the key) and `SMSBLAST_WEBHOOK_TOKEN`
   (any long random secret we generate).
3. In SMSblast → **Webhooks** tab, set the incoming webhook URL to
   `https://<app-domain>/api/sms-inbound` (with the token).
4. Confirm the "Send from" number `+18555945081` is the one seeded into `sms_numbers`.

## Phasing

- **Phase 1 (this build):** Supabase tables, send function, inbound webhook,
  Messages tab on the contact card, auto-create on unknown inbound. → boss can text
  and receive replies.
- **Phase 2:** Bulk send to a selected group/stage.
- **Phase 3:** Automated SMS via the Automations module (event triggers).
- **Later:** central cross-contact Inbox, delivery receipts, real-time updates.

## Testing

- Unit: phone normalization (valid/invalid/empty variants); send handler with a fake
  SMSblast fetch (`ctx.db`-style injection) asserting the saved row + params; inbound
  handler routing + auto-create + token rejection, using the existing test harness in
  `tests/`.
- Manual: send a real text to a phone, reply, confirm it appears in the thread and a
  new contact is auto-created for an unknown sender.
```
