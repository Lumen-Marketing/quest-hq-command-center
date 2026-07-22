# RingCentral Call Dashboard — Design Spec

**Date:** 2026-07-23
**Branch:** `feat/ringcentral-calls` (cut from `origin/main` at `070586e`)
**Worktree:** `.worktrees/ringcentral`

## Goal

Two questions, answered inside the Command Center:

1. **Who is on the phone right now, and who is idle?**
2. **How many calls over 60 seconds is each person having?**

Nothing else. Everything the owner already gets from RingCentral Analytics — trend
charts, average handle time, KPI tiles — is deliberately not reproduced.

The 60-second number is the point of the whole module. In the owner's own sample data one
extension logged 137 calls at a 15-second average handle time. Raw call counts flatter
that behaviour; a count of calls that lasted long enough to be a conversation exposes it.

This is an observation tool. It does not place calls, send messages, or write anything
back to RingCentral.

## Scope

### In scope

- A new per-workspace plugin, `calls`, installed for Quest only.
- **Live board** — every extension with status and how long they have held it.
- **Conversations table** — per person, total calls and calls over 60 seconds, for a
  chosen date range.
- A scheduled background sync pulling RingCentral call log into Supabase.

### Explicitly out of scope

Decided during brainstorming, 2026-07-23. The design was deliberately cut back after an
initial, larger version.

- **No recording playback.** Removed at the owner's direction. This also removes the
  `ReadCallRecording` permission from the RingCentral app, which shortens approval.
- **No KPI tiles, no targets, no red/amber/green.**
- **No trend charts.**
- **No RingCentral-parity metrics** — no Avg Handle Time, Speed to Answer, Callback Time,
  Avg Calls/Day, or % Missed (w/VM). RingCentral Analytics already shows these.
- **No click-to-call**, no CRM contact linking, no RingCentral SMS (texting stays on
  SMSblast, `feat/sms-messaging`; the two share no code and no tables).
- **No per-tenant OAuth.** Only Quest connects; the schema leaves room to expand.
- **No extension-to-team-member mapping UI.** Matching is by email, silently.
- **No writes to RingCentral.**

## Decisions

| Question | Decision |
|---|---|
| What is it for? | Live agent status + count of 60s+ calls per person |
| Whose account? | Quest only; schema keyed by `company_id` so it can expand |
| Live data source | RingCentral Presence API, polled — **not** the Live Reports add-on |
| Live board detail | Name, extension, status, and how long they have held it |
| Conversation threshold | **60 seconds, hard-coded** as a single named constant |
| Historic data | Synced into Supabase; the dashboard never queries RingCentral for it |
| Who is who | RingCentral extension names as-is; users matched to their own by email |

## Known risks

1. **Presence does not report how long a status has been held.** RingCentral returns the
   current status only. The duration is derived here by recording when a status was first
   observed (see *Presence state*). Consequence: durations restart at zero the first time
   the module runs after deployment, and a status change occurring between two polls is
   timed from the poll, not the actual change. Accurate to within the poll interval,
   which is acceptable for "has Ralph been idle a while?" and is not accurate enough for
   billing or payroll. This limitation is stated in the UI.
2. **Vercel plan tier is unconfirmed.** See *Scheduling*.
3. **Call totals may differ slightly from RingCentral Analytics.** Totals here are counted
   from raw call records; RingCentral aggregates internally and may treat edge cases
   differently. Reconciled against the owner's Analytics page during implementation, with
   any deliberate difference documented.

## Architecture

### Tenancy seam

Every table is keyed by `company_id`. Credentials are *referenced*, not stored:
`ringcentral_accounts` records that a company is connected and names the environment
variable holding its JWT. Today exactly one row exists, pointing at Quest's env vars.
Adding per-tenant OAuth later means adding encrypted-token columns to that one table and
teaching the credential resolver a second source; the sync, the dashboard and the RLS
policies are unaffected.

The JWT secret never enters the database.

### Components

**`api/_lib/ringcentral.js`** — the only module that knows RingCentral exists. Exchanges
the JWT for an access token, caches it for the life of the serverless instance, and
exposes `syncCallLog()`, `accountPresence()` and `extensions()`. Every network call goes
through an injectable `fetch`, so tests never touch the network.

**`api/ringcentral-sync.js`** — the scheduled job. Same skeleton as
`api/recycle-bin-purge.js`: `GET` only, `CRON_SECRET` bearer auth compared with
`timingSafeEqual`, service-role Supabase client, `setApiHeaders`. Reads the stored
`sync_token`, calls the RingCentral call-log sync API, upserts the returned records,
writes back the new token, returns a JSON summary.

**`api/ringcentral-presence.js`** — user-authenticated. Verifies the caller's bearer token
against Supabase, confirms company membership and admin role, then calls
`GET /restapi/v1.0/account/~/presence?detailedTelephonyState=true`. A 10-second
server-side cache means N viewers cost one upstream call. On each uncached fetch it
reconciles `ringcentral_presence` so status durations survive across page loads and
serverless instances.

**`ringcentral_conversation_stats()` Postgres function** — returns one row per extension:
name, extension number, total calls, and calls at or over the threshold, for a date range.
Aggregation happens in the database; the browser receives a handful of rows.

**Front-end module in `src/main.js`** — registered in the plugin registry near line 832
and added to `company_plugins_known_plugin_check`, following the pattern the Phase 3
migration used for `tasks`. Not added to any workspace preset, so other tenants do not get
a phone tab they cannot use.

### Data flow

```
RingCentral  --(JWT, incremental call-log sync)-->  api/ringcentral-sync  -->  Supabase
                                                            ^
                                                       cron trigger

Browser  -->  api/ringcentral-presence            (live board, polled every 15s)
Browser  -->  ringcentral_conversation_stats()    (conversations table)
```

The conversations table reads Quest's own database and renders even when RingCentral is
unreachable, with a staleness stamp. The live board is the only surface that depends on
RingCentral being up; when it is not, it says so rather than showing stale statuses.

## Data model

**`ringcentral_accounts`** — one row per connected workspace.
`company_id` (pk, text), `rc_account_id`, `credential_source` (`'env'` today),
`credential_key` (name of the env var), `status` (`active` / `paused`), timestamps.

**`ringcentral_calls`** — one row per call.
`company_id`, `call_id`, `session_id`, `started_at`, `direction`, `from_number`,
`from_name`, `to_number`, `to_name`, `extension_id`, `extension_number`, `extension_name`,
`extension_email`, `duration_seconds`, `result`, `raw` (jsonb), timestamps.
Unique on `(company_id, call_id)`, so re-syncing updates rather than duplicates.
Indexes on `(company_id, started_at desc)`, `(company_id, extension_email)`, and a partial
index on `(company_id, started_at desc) where duration_seconds >= 60`.

**`ringcentral_sync_state`** — one row per workspace.
`company_id` (pk), `sync_token`, `last_sync_at`, `last_full_sync_at`,
`consecutive_failures`, `last_error`.

**`ringcentral_presence`** — one row per extension, the memory that makes durations work.
`company_id`, `extension_id`, `extension_number`, `extension_name`, `extension_email`,
`user_status`, `telephony_status`, `dnd_status`, `status_since`, `updated_at`.
Primary key `(company_id, extension_id)`. Written by the service role only, from
`api/ringcentral-presence.js`.

## Presence state

`GET /restapi/v1.0/account/~/presence?detailedTelephonyState=true` returns every extension
in one response, carrying `userStatus` (Available / Busy / Offline), `telephonyStatus`
(NoCall / Ringing / CallConnected) and `dndStatus`. `ReadPresence` is the required
permission. One request covers the entire team, so the live board costs a single upstream
call regardless of headcount.

Displayed status is derived from those fields, most specific first:

| Displayed | Condition |
|---|---|
| **On call** | `telephonyStatus = CallConnected` |
| **Ringing** | `telephonyStatus = Ringing` |
| **Do not disturb** | `dndStatus` indicates DND |
| **Offline** | `userStatus = Offline` |
| **Busy** | `userStatus = Busy` |
| **Available** | otherwise |

On each uncached poll, every extension's displayed status is compared with the stored row.
If it differs, the row is updated and `status_since` is set to now; if it matches,
`status_since` is left alone. `status_since` is what the ticking timer counts from. This
is what allows the timer to survive a page refresh or a cold serverless instance.

**Polling, not subscriptions.** RingCentral supports push subscriptions for presence, but
they require a public webhook, renewal handling, and per-extension subscription
management. For a team of this size, one cached poll every 15 seconds is a fraction of the
code and cannot silently fall behind the way an expired subscription can. Revisit only if
the team grows large enough for the poll to matter.

## User interface

Two sections. Nothing else on the page.

**Live board** (top). One row per extension, sorted with active calls first:

```
Ralph Garcia      103   ● On call        2:14
Jesus Carrillo    102   ● Available     47:03
Manny Serrano     104   ● Offline        —
Abraham Maldonado 101   ● Do not disturb 1:12:40
```

Refreshes every 15 seconds; stops polling when the browser tab is hidden or the module is
closed. Durations tick client-side between refreshes. A footnote states that durations are
measured from when the app first saw the status, accurate to about 15 seconds.

If RingCentral cannot be reached, the board shows an explicit "can't reach RingCentral"
state — it never leaves stale statuses on screen looking live.

**Conversations table** (below). One row per extension for the selected date range:

| Name | Ext | Total calls | Conversations 60s+ |
|---|---|---|---|
| Ralph Garcia | 103 | 137 | 3 |
| Jesus Carrillo | 102 | 41 | 20 |
| Manny Serrano | 104 | 75 | 22 |

Sortable on every column. Range picker: today / 7 days / 30 days / custom. A staleness
stamp reads "Synced 4 minutes ago" and turns to a warning state after three consecutive
sync failures, so stale numbers are never presented as current.

Rendered with plain HTML and CSS. No charts, no charting library: `npm run build` enforces
a bundle budget via `scripts/check-bundle-budget.mjs`, and `src/main.js` is already ~1.7 MB.

## Sync behaviour

RingCentral's call-log sync API issues a `syncToken` on a full sync; later incremental
syncs pass that token and receive only what changed. Two documented limits shape the design:

- **Max 250 records per response.** If more than 250 calls changed since the last sync,
  the token is rejected with a "max sync record number limit is exceeded" error.
- **Rate limits** apply per app per account.

Therefore:

1. No stored token, or token rejected → **full sync** over the backfill window, then store
   the fresh token.
2. Token present → **incremental sync**.
3. HTTP 429 → record it, increment `consecutive_failures`, return without changing the
   token. The next run catches up; because the sync is incremental, nothing is lost.
4. Any success → reset `consecutive_failures` and clear `last_error`.

Initial backfill window: **90 days**, paged. Run once at install, not on every full sync.

## Scheduling

The sync endpoint is a plain authenticated `GET`, so whatever calls it is interchangeable.

Target interval: **every 15 minutes**. The conversations table is a review tool, not a live
one — the live board covers real-time — so a longer interval than the original 10 minutes
costs nothing.

Vercel's Hobby plan permits cron jobs at daily granularity only, and the project's sole
existing cron (`/api/recycle-bin-purge`, `20 3 * * *`) is daily, so the plan tier must be
confirmed. If the account is not on Pro, Supabase's `pg_cron` + `pg_net` calls the same URL
on the same schedule. The endpoint, its auth and its tests are identical either way; only
the `vercel.json` entry differs.

**Action:** confirm the Vercel plan tier as an early implementation step.

## Permissions and RLS

All tables have RLS enabled. Call and presence data is written by the service role only —
nothing in the browser can insert, update or delete a record.

**Live board — admins only.** It is a supervision surface, and a member seeing only their
own status would learn nothing. `api/ringcentral-presence.js` returns 403 to non-admins,
and the module hides the section for them.

**`ringcentral_calls` select policy:**

- `app_private.is_quest_admin()`, or
- `app_private.is_company_admin(company_id)`, or
- `app_private.is_company_member(company_id)` **and** `extension_email` equals the caller's
  authenticated email (`auth.jwt() ->> 'email'`), compared case-insensitively and trimmed.

So a member opening the module sees a one-row conversations table — their own — and no
live board. A member whose email matches no extension sees "We couldn't match you to a
RingCentral extension. Ask your admin to check that your RingCentral email matches your
Command Center login", not a blank table.

**`ringcentral_sync_state`** — company members may read (they need the staleness stamp);
nobody may write.

**`ringcentral_accounts`** and **`ringcentral_presence`** — company admins may read;
nobody may write via the API.

`ringcentral_conversation_stats()` is `security invoker`, so it inherits these rules rather
than restating them.

## Error handling summary

| Failure | Behaviour |
|---|---|
| First run / no sync token | Full sync over the 90-day backfill window |
| Sync token rejected (>250 changes) | Automatic full sync, logged to `last_error` |
| RingCentral 429 on sync | Back off, record, retry next run; token untouched |
| RingCentral unreachable (sync) | Conversations table renders stored data with staleness stamp |
| RingCentral unreachable (presence) | Live board shows an explicit error state, never stale statuses |
| ≥3 consecutive sync failures | Staleness stamp turns to a warning state |
| Missing / invalid `CRON_SECRET` | 401, no work performed |
| Env vars not configured | Sync returns 503; module shows a "not connected" state |
| Non-admin requests presence | 403; the live board section is not rendered |
| Caller has no matching extension | Explicit empty state, not an empty table |

## Testing

Unit tests in the existing harness (`node --test tests/*.mjs`), with a fake `fetch`
injected into `api/_lib/ringcentral.js`:

1. Full sync when no token is stored; the token is persisted.
2. Incremental sync when a token exists; the stored token is sent.
3. Sync-token-rejected error triggers a full-sync fallback and records the error.
4. Re-syncing the same call twice produces one row, updated (upsert idempotency).
5. HTTP 429 leaves the token untouched and increments `consecutive_failures`.
6. A successful run clears `last_error` and resets `consecutive_failures`.
7. Sync request without `CRON_SECRET` returns 401 and performs no work.
8. Presence responses are cached for 10 seconds — one upstream call for N requests.
9. Presence returns 403 for a non-admin member.
10. Status derivation: `CallConnected` wins over `userStatus`; `Ringing` over DND; DND over
    Offline; the fallback is Available.
11. `status_since` is preserved when a status is unchanged and reset when it changes.
12. Conversation counting is inclusive at exactly 60 seconds and excludes 59.
13. Email matching is case-insensitive and tolerates surrounding whitespace.

Database-level verification: a two-user check confirming a non-admin member selecting from
`ringcentral_calls` sees only rows carrying their own email.

Reconciliation check: for one known date range, compare total call counts per extension
against the owner's RingCentral Analytics page. Any deliberate difference is documented;
any accidental one is fixed.

Visual verification: headless-Chrome screenshot of both sections against seeded data
before the work is called done.

## Setup required from the account owner

1. A RingCentral **Super Admin** creates a **Server-only (JWT)** app in the Developer
   Console, marked **private**, with three permissions: **Read Call Log**,
   **Read Accounts**, **Read Presence**. *(Read Call Recording is no longer needed.)*
2. Graduate the app to Production. RingCentral reviews this; allow a few days.
3. Generate a JWT credential **as the Super Admin** — a JWT inherits the permissions of
   the user who created it, so one made by a regular user would expose only that person's
   own calls.
4. Set Vercel environment variables: `RINGCENTRAL_CLIENT_ID`, `RINGCENTRAL_CLIENT_SECRET`,
   `RINGCENTRAL_JWT`, `RINGCENTRAL_SERVER_URL`.
5. Confirm the Vercel plan tier so the cron interval can be settled.
6. Apply the migration, insert the `ringcentral_accounts` row for Quest, and install the
   `calls` plugin for Quest's workspace.

Steps 1–3 gate anything touching live data. The sync, the RLS rules, the status derivation
and both UI sections can all be built and tested against fakes while approval is pending.

## References

- [JWT authentication flow](https://developers.ringcentral.com/guide/authentication/jwt-flow)
- [Call log synchronization](https://developers.ringcentral.com/guide/voice/call-log/sync)
- [Account presence API](https://developers.ringcentral.com/api-reference/Presence/readAccountPresence)
- [Detecting user presence](https://developers.ringcentral.com/guide/account/presence)
- [API rate limits](https://developers.ringcentral.com/guide/basics/rate-limits)
