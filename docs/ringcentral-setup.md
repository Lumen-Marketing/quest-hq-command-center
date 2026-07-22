# RingCentral setup

What has to happen outside the codebase before the Calls module shows anything.
Steps 1–3 are the slow part — start them first, because everything else can be
done while RingCentral reviews the app.

## 1. Create the app

In the [RingCentral Developer Console](https://developers.ringcentral.com/), signed in
with Quest's RingCentral account:

1. **Apps → Create App → REST API App.**
2. Name it `Quest HQ Call Dashboard`. Answer **no** to promoting it in the App Gallery.
3. **Authentication: JWT auth flow.** Not 3-legged OAuth.
4. **Access: private** — "only callable using credentials from the same RingCentral account".
5. **Scopes — exactly three:**
   - Read Call Log
   - Read Accounts
   - Read Presence

   Read Call Recording is **not** needed. The dashboard does not play recordings.
6. Save. The app dashboard shows a **Client ID** and **Client Secret**.

If a scope is flagged as requiring approval, the justification is: *an internal,
read-only dashboard showing our own team's call statistics and live phone status inside
our own business application. No calls placed, no messages sent, no data written back.*

## 2. Create the JWT credential

This is a **separate screen** from the app and is easy to miss.

1. Hover your name in the top-right corner → **Credentials** → **Create JWT**.
2. Restrict it to specific apps and paste in the Client ID from step 1.
3. Copy the JWT string immediately — it is shown once.

**It must be created by a RingCentral Super Admin.** A JWT inherits the permissions of
whoever created it, so a credential made by a regular user would expose only that
person's own calls and the dashboard would show almost nothing.

## 3. Graduate to Production

Everything above starts in the Sandbox, which contains fabricated call data. Real Quest
calls appear only after the app is in Production.

1. On the app dashboard, work through **Graduate to Production** and submit.
2. RingCentral reviews it — allow a few days.
3. Production issues a **different Client ID and Secret**. Those are the ones to use.

## 4. Set the environment variables

In Vercel, for the production environment:

| Variable | Value |
| --- | --- |
| `RINGCENTRAL_CLIENT_ID` | Production Client ID from step 3 |
| `RINGCENTRAL_CLIENT_SECRET` | Production Client Secret from step 3 |
| `RINGCENTRAL_JWT` | JWT string from step 2 |
| `RINGCENTRAL_SERVER_URL` | `https://platform.ringcentral.com` |

Confirm `CRON_SECRET` is already set — the sync endpoint rejects unauthenticated calls.

Never paste these into chat, email, or the project brain.

## 5. Confirm the cron interval is allowed

`vercel.json` schedules `/api/ringcentral-sync` at `*/15 * * * *`. **Sub-daily cron
requires a Vercel Pro plan.** If the deployment rejects the schedule, either coarsen it
to `0 * * * *` or trigger the same URL from Supabase `pg_cron` with the `CRON_SECRET`
bearer header. The endpoint and its tests are unchanged either way.

## 6. Apply the migration and switch the module on

Apply `supabase/migrations/202607231200_ringcentral_calls.sql` through the Supabase
migration workflow — not by pasting DDL into a query editor.

Then, substituting Quest's company id:

```sql
insert into public.ringcentral_accounts (company_id, rc_account_id, credential_key)
values ('<quest-company-id>', '~', 'RINGCENTRAL_JWT')
on conflict (company_id) do nothing;

insert into public.company_plugins (company_id, plugin_id, status, installed_at, updated_at)
values ('<quest-company-id>', 'calls', 'installed', now(), now())
on conflict (company_id, plugin_id) do update set status = 'installed', updated_at = now();
```

The module also has to be activated in Quest's operational workspace, the same way every
other plugin is.

## 7. First sync and verification

Trigger the first sync by hand rather than waiting for the cron:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<deployment>/api/ringcentral-sync
```

A healthy first run returns `{"synced":[{"company_id":"…","extensions":N,"calls":N,"backfill":true}],"failed":[]}`.
The first run backfills 90 days and will take noticeably longer than later ones.

Then check, in order:

1. `select count(*) from public.ringcentral_calls;` is non-zero.
2. Open the Calls module as an admin. The live board lists people, and the conversations
   table shows totals.
3. **Reconcile.** For one date range, compare total calls per extension against
   RingCentral's own Analytics page. They are counted from raw records here and
   aggregated internally there, so a small difference is possible — find out which,
   and write down any difference that turns out to be deliberate.
4. **Two-user check.** Sign in as a non-admin member and confirm they see exactly one
   row — their own — and no live board at all.
5. Confirm the cron actually fired by watching `ringcentral_sync_state.last_sync_at`
   advance without anyone triggering it.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Sync returns 503 "RingCentral is not configured" | `RINGCENTRAL_CLIENT_ID` or `RINGCENTRAL_CLIENT_SECRET` missing in Vercel |
| Sync returns 401 | `CRON_SECRET` missing or the bearer header does not match |
| `synced` is empty and `failed` is empty | No `ringcentral_accounts` row, or its `status` is not `active` |
| `last_error` mentions OAU-250 / unsupported grant type | The app is not configured for JWT auth flow, or is still the sandbox app |
| Calls appear but every name is blank | The extension directory did not load — check the Read Accounts scope |
| A member sees the empty-state message | Their RingCentral email does not match their Command Center login email |
| Live board 403s for an admin | Their `company_memberships.role` is not owner/admin/developer/construction_supervisor |
