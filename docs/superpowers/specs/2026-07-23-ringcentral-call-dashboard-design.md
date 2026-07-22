# RingCentral Call Dashboard — Design Spec

**Date:** 2026-07-23
**Branch:** `feat/ringcentral-calls` (cut from `origin/main` at `070586e`)
**Worktree:** `.worktrees/ringcentral`
**Reference:** RingCentral Analytics screenshot supplied by the owner, 2026-07-23

## Goal

Give Quest a call-activity dashboard inside the Command Center, powered by Quest's
RingCentral account. Two things it must do that RingCentral's own Analytics page does not:

1. Show every KPI **against a target**, with red/amber/green status.
2. Surface **calls longer than 60 seconds** — real conversations, as distinct from dials
   that went nowhere — as a reviewable queue with one-click recording playback.

The second point is the reason this exists. In the owner's own sample data, one extension
logged 137 calls at a 15-second average handle time. Raw call counts flatter that
behaviour; a conversation count exposes it.

This is an observation tool. It does not place calls, send texts, or write anything back
to RingCentral.

## Scope

### In scope

- A new per-workspace plugin, `calls`, installed for Quest only.
- A scheduled background sync pulling RingCentral call log into Supabase.
- A live "calls in progress right now" strip, polled while the tab is open.
- Two KPI rows, a trend chart, a per-user table, a 60s+ conversation queue, and a
  recent-call log.
- Company-wide KPI targets with red/amber/green status, editable by admins.
- In-app playback of call recordings and voicemail, proxied through the server.
- Row-level security: admins see the whole company, members see only their own calls.

### Explicitly out of scope

Decided during brainstorming, 2026-07-23:

- **No click-to-call.** Phone numbers in the CRM stay as they are.
- **No call logging onto contact cards.** Calls are not matched to CRM contacts in v1.
- **No RingCentral SMS.** Texting stays on SMSblast (`feat/sms-messaging`). The two
  features share no code and no tables.
- **No per-tenant OAuth.** Only Quest connects. The schema is shaped so this can be added
  later without a rewrite (see *Tenancy seam*), but no OAuth flow is built now.
- **No extension-to-team-member mapping UI.** Matching is by email, silently, with a
  clear failure message. No admin screen to correct mismatches.
- **No per-person targets.** Targets are company-wide; the same goal line applies to
  every rep.
- **No user-selectable KPI tiles.** RingCentral's "Select KPIs" control is not
  reproduced; the tile set is fixed.
- **No writes to RingCentral.** The integration is strictly read-only.

## Decisions taken during brainstorming

| Question | Decision | Why |
|---|---|---|
| What is it for? | Call activity KPIs, read-only | Owner watching team performance |
| Whose account? | Quest now, schema built to expand | Avoids a rewrite if other tenants want it |
| Data freshness | Scheduled sync **plus** a live "right now" panel | Trends need stored history; the live strip needs real-time |
| Recordings | Play in-app, proxied | Coaching value; credentials must not reach the browser |
| Who is who | RingCentral extension names as-is | No mapping table to maintain |
| Who sees what | Members see own calls, admins see all | Matched silently by email address |
| KPI naming | RingCentral's six verbatim, Quest additions in a second row | Numbers must be recognisable to the owner |
| Targets | Company-wide, admin-editable | One number per KPI; no per-person upkeep |
| Conversation threshold | **60 seconds, hard-coded** | Owner's explicit choice |

### Conflicts resolved during brainstorming

**Naming vs. additions.** "Match RingCentral exactly" and "add Conversations 60s+ /
Speed to Answer / Callback Time" cannot both hold in one row. Resolved with two visually
distinct rows: RingCentral's six verbatim and in order, then a row labelled *Quest KPIs*.
The owner can always tell which numbers should reconcile with his RingCentral screen.

**Names vs. per-person visibility.** "Use RingCentral names as-is" and "everyone sees
their own calls" contradicted each other: with no mapping, the app cannot tell which
extension is the logged-in user, so a non-admin would see an empty dashboard. Resolved by
matching `extension_email` against the caller's authenticated email at the RLS layer. No
mapping table, no admin UI. Users whose emails do not line up get an explicit message
rather than a silent zero.

## Known risks

These are recorded now so they are not discovered late.

1. **Speed to Answer and Callback Time may be unavailable.** Those fields typically
   require RingCentral's *detailed* call-log view or the separate Analytics API, not the
   basic call log. Verification is the first implementation task. **If the data is not
   available, those two tiles are dropped — they are never estimated or faked.**
2. **Computed figures may diverge from RingCentral's own.** Avg Handle Time and
   % Missed (w/VM) are derived here from raw call records; RingCentral computes its
   equivalents internally and may count edge cases differently. A visible mismatch
   destroys trust in the whole dashboard. Mitigation: reconcile against the owner's
   RingCentral screen for a known date range during implementation, and document any
   deliberate difference in the module's help text.
3. **The 60-second threshold is hard-coded.** Changing it later requires a code edit and
   a redeploy. Accepted by the owner. It is defined as a single named constant so the
   change is one line if it comes.
4. **Vercel plan tier is unconfirmed.** See *Scheduling*.

## Architecture

### Tenancy seam

Every table is keyed by `company_id`. Credentials are *referenced*, not stored:
`ringcentral_accounts` records that a company is connected and names the environment
variable holding its JWT. Today exactly one row exists, pointing at Quest's env vars.
Adding per-tenant OAuth later means adding encrypted-token columns to that one table and
teaching the credential resolver a second source — the sync, the dashboard, the RLS
policies and the stats function are unaffected.

The JWT secret never enters the database.

### Components

Each piece has one job and can be tested on its own.

**`api/_lib/ringcentral.js`** — the only module that knows RingCentral exists. Exchanges
the JWT for an access token, caches it in memory for the life of the serverless instance,
and exposes `syncCallLog()`, `activeCalls()`, `extensions()` and `recordingStream()`.
Every network call goes through an injectable `fetch`, so tests never touch the network.

**`api/ringcentral-sync.js`** — the scheduled job. Same skeleton as
`api/recycle-bin-purge.js`: `GET` only, `CRON_SECRET` bearer auth compared with
`timingSafeEqual`, service-role Supabase client, `setApiHeaders`. For each enabled company
it reads the stored `sync_token`, calls the RingCentral sync API, upserts the returned
records, and writes back the new token. Returns a JSON summary.

**`api/ringcentral-active-calls.js`** — user-authenticated. Verifies the caller's bearer
token against Supabase, confirms company membership, returns currently active calls. A
10-second in-memory cache means N viewers cost one upstream call. Non-admins receive only
calls on their own extension.

**`api/ringcentral-recording.js`** — user-authenticated. Confirms the caller may see that
specific call (admin, or owner of the extension), then streams the audio back.
RingCentral credentials never reach the browser.

**`ringcentral_call_stats()` Postgres function** — does the aggregation in the database.
Takes a company and a date range; returns both KPI rows, per-interval trend series, and
the per-extension table in one round trip. The browser receives summary rows, not raw
call records.

**Front-end module in `src/main.js`** — registered in the plugin registry near line 832
and added to `company_plugins_known_plugin_check`, following the pattern the Phase 3
migration used for `tasks`. Not added to any workspace preset, so new tenants do not get
a phone tab they cannot use.

### Data flow

```
RingCentral  --(JWT auth, incremental sync)-->  api/ringcentral-sync  -->  Supabase
                                                        ^
                                                   cron trigger
Browser  -->  ringcentral_call_stats()   -->  Supabase        (KPI rows, trend, user table)
Browser  -->  ringcentral_calls (RLS select, paged)           (60s+ queue, recent calls)
Browser  -->  api/ringcentral-active-calls                    (live strip, 15s poll)
Browser  -->  api/ringcentral-recording                       (playback)
```

The dashboard reads Quest's own database, never RingCentral directly. If RingCentral is
unreachable the page still renders, with a staleness stamp.

## Data model

**`ringcentral_accounts`** — one row per connected workspace.
`company_id` (pk, text), `rc_account_id`, `credential_source` (`'env'` today),
`credential_key` (name of the env var), `status` (`active` / `paused`), timestamps.

**`ringcentral_calls`** — one row per call.
`company_id`, `call_id` (RingCentral's id), `session_id`, `started_at`, `direction`
(`Inbound` / `Outbound`), `from_number`, `from_name`, `to_number`, `to_name`,
`extension_id`, `extension_number`, `extension_name`, `extension_email`,
`duration_seconds`, `result`, `has_voicemail`, `recording_id`, `raw` (jsonb), timestamps.
Unique on `(company_id, call_id)`, so re-syncing updates rather than duplicates.
Indexes on `(company_id, started_at desc)`, `(company_id, extension_email)`, and a
partial index on `(company_id, started_at desc) where duration_seconds >= 60` to keep the
conversation queue fast.

**`ringcentral_sync_state`** — one row per workspace.
`company_id` (pk), `sync_token`, `last_sync_at`, `last_full_sync_at`,
`consecutive_failures`, `last_error`.

**`ringcentral_kpi_targets`** — one row per company per KPI.
`company_id`, `metric_key`, `target_value` (numeric), `direction`
(`higher_is_better` / `lower_is_better`), `amber_band` (numeric, how close counts as
amber), timestamps. Primary key `(company_id, metric_key)`. Admin-writable. A KPI with no
target row simply renders without a status dot — targets are optional per metric.

## KPI definitions

`CONVERSATION_THRESHOLD_SECONDS = 60` is a single named constant, referenced by the stats
function, the queue query, and the front end.

### Row 1 — RingCentral parity

Named and ordered exactly as they appear on the owner's RingCentral Analytics page.

| Tile | Definition |
|---|---|
| Total Calls | Count of calls in range |
| Avg. Calls/Day | Total Calls ÷ days in range |
| # Inbound | Calls where `direction = 'Inbound'` |
| # Outbound | Calls where `direction = 'Outbound'` |
| % Missed (w/VM) | Missed or voicemail-terminated calls ÷ inbound calls |
| Avg. Handle Time | Mean `duration_seconds`, rendered `mm:ss` |

### Row 2 — Quest KPIs

| Tile | Definition |
|---|---|
| Conversations 60s+ | Count of calls with `duration_seconds >= 60` |
| Speed to Answer | Mean seconds from call start to answer — **subject to risk 1** |
| Callback Time | Median time from a missed call to the next outbound call to that number — **subject to risk 1** |

Every tile renders: the value, the target beneath it, and a status dot — green on target,
amber within the configured band, red outside it. Tiles with no target row show the value
alone.

## User interface

Top to bottom:

**Live strip.** "3 calls in progress" with extension name, other party, and a ticking
duration. Polls every 15 seconds; stops when the tab is hidden or the module is closed.
Collapses to nothing when no calls are active — no empty box.

**KPI row 1 — RingCentral.** The six tiles above, with target lines.

**KPI row 2 — Quest KPIs.** Visually separated and labelled, so it is always clear which
numbers should reconcile with RingCentral's own screen.

**Trend.** Line chart with a primary and a secondary metric picker and an
hour/day granularity toggle, mirroring the RingCentral layout the owner already reads.
Range picker: today / 7 days / 30 days / custom.

**Users table.** One row per extension: Name, Ext, Total Calls, Avg. Calls/Day,
# Inbound, # Outbound, % Missed (w/VM), Avg. Handle Time — RingCentral's columns — plus
**Conversations 60s+**. Sortable on every column, honouring the selected range.
Non-admins see a single row, their own.

**Conversations 60s+.** A dedicated review queue: only calls at or over the threshold.
Time, extension, other party, duration, outcome, ▶ playback. This is the coaching surface.

**Recent calls.** Paged full log with a "60s+ only" toggle, so the same filter is
reachable without leaving the list.

**Staleness stamp.** Persistent, near the header: "Synced 4 minutes ago", echoing
RingCentral's own "Data refreshed" line. Turns to a warning state once
`consecutive_failures` exceeds 3, so stale numbers are never presented as current.

**Targets settings.** Admin-only panel: one target value, direction, and amber band per
KPI. Writes to `ringcentral_kpi_targets`.

**Unmatched-user empty state.** A member whose email matches no extension sees
"We couldn't match you to a RingCentral extension. Ask your admin to check that your
RingCentral email matches your Command Center login." — not a blank dashboard.

Charts are rendered with inline SVG. No charting library is added: `npm run build`
enforces a bundle budget via `scripts/check-bundle-budget.mjs`, and `src/main.js` is
already ~1.7 MB.

## Sync behaviour

RingCentral's call-log sync API issues a `syncToken` on a full sync; later incremental
syncs pass that token and receive only what changed. Two documented limits shape the design:

- **Max 250 records per response.** If more than 250 calls changed since the last sync,
  the token is rejected with a "max sync record number limit is exceeded" error.
- **Rate limits** apply per app per account.

Therefore:

1. No stored token, or token rejected → **full sync** over the configured backfill window,
   then store the fresh token.
2. Token present → **incremental sync**.
3. HTTP 429 → record it, increment `consecutive_failures`, return without changing the
   token. The next scheduled run catches up; because the sync is incremental, nothing is lost.
4. Any success → reset `consecutive_failures` and clear `last_error`.

Initial backfill window: **90 days**, paged. Run once at install, not on every full sync.

## Scheduling

The sync endpoint is a plain authenticated `GET`, so whatever calls it is interchangeable.

Target interval: **every 10 minutes**.

Vercel's Hobby plan permits cron jobs at daily granularity only, and the project's sole
existing cron (`/api/recycle-bin-purge`, `20 3 * * *`) is daily — so the plan tier must be
confirmed before implementation. If the account is not on Pro, Supabase's `pg_cron` +
`pg_net` will call the same URL on the same schedule. The endpoint, its auth, and its
tests are identical under either trigger; only the `vercel.json` entry differs.

**Action:** confirm the Vercel plan tier as an early implementation step.

## Permissions and RLS

All tables have RLS enabled. Call data is written by the service role only — nothing in
the browser can insert, update, or delete a call record.

**`ringcentral_calls` select policy:**

- `app_private.is_quest_admin()`, or
- `app_private.is_company_admin(company_id)`, or
- `app_private.is_company_member(company_id)` **and** `extension_email` equals the
  caller's authenticated email (`auth.jwt() ->> 'email'`), compared case-insensitively
  and trimmed.

**`ringcentral_sync_state`** — company members may read (they need the staleness stamp);
nobody may write.

**`ringcentral_accounts`** — company admins may read; nobody may write via the API.

**`ringcentral_kpi_targets`** — company members may read (targets appear on every tile);
company admins may insert, update and delete.

`ringcentral_call_stats()` is `security invoker`, so it inherits exactly these rules
rather than restating them.

`api/ringcentral-active-calls.js` and `api/ringcentral-recording.js` re-apply the same
admin-or-own-extension test server-side, because those responses come from RingCentral and
never pass through RLS.

## Error handling summary

| Failure | Behaviour |
|---|---|
| First run / no sync token | Full sync over the 90-day backfill window |
| Sync token rejected (>250 changes) | Automatic full sync, logged to `last_error` |
| RingCentral 429 | Back off, record, retry next run; token untouched |
| RingCentral unreachable | Dashboard renders from stored data with staleness stamp |
| ≥3 consecutive sync failures | Staleness stamp turns to a warning state |
| Missing / invalid `CRON_SECRET` | 401, no work performed |
| Env vars not configured | Sync returns 503; dashboard shows a "not connected" state |
| Caller has no matching extension | Explicit empty state, not an empty table |
| KPI has no target row | Tile renders the value with no status dot |
| Speed to Answer / Callback Time unavailable | Tiles removed, not estimated |

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
8. Active-calls responses are cached for 10 seconds (one upstream call for N requests).
9. Recording endpoint refuses a non-admin requesting another extension's recording.
10. Email matching is case-insensitive and tolerates surrounding whitespace.
11. Conversation counting is inclusive at exactly 60 seconds, and excludes 59.
12. KPI status resolves correctly for `higher_is_better` and `lower_is_better` metrics,
    including inside the amber band and with no target row present.

Database-level verification: a two-user check confirming a non-admin member selecting from
`ringcentral_calls` sees only rows carrying their own email.

Reconciliation check: for one known date range, compare Total Calls, # Inbound,
# Outbound, % Missed (w/VM) and Avg. Handle Time against the owner's RingCentral Analytics
page. Any deliberate difference is documented; any accidental one is fixed.

Visual verification: headless-Chrome screenshot of the dashboard against seeded data
before the work is called done.

## Delivery phases

The scope is large enough that shipping it as one block would delay any feedback until
the end. Three phases, each independently useful:

**Phase 1 — Numbers on the screen.** Tables, sync job, RLS, `ringcentral_call_stats()`,
both KPI rows without targets, the trend chart, and the users table with the
Conversations 60s+ column. At the end of this phase the owner can see the truth about
call quality. This is the bulk of the value.

**Phase 2 — Listen and review.** The Conversations 60s+ queue, the recording proxy, and
the "60s+ only" toggle on the recent-call log.

**Phase 3 — Targets and live.** `ringcentral_kpi_targets`, the admin settings panel,
red/amber/green status on every tile, and the live "calls in progress" strip.

Each phase gets its own implementation plan.

## Setup required from the account owner

1. A RingCentral **Super Admin** creates a **Server-only (JWT)** app in the Developer
   Console with permissions to read call log, call recordings, accounts, and presence.
2. Graduate the app to Production (RingCentral reviews this; allow a few days).
3. Generate a JWT credential.
4. Set Vercel environment variables: `RINGCENTRAL_CLIENT_ID`,
   `RINGCENTRAL_CLIENT_SECRET`, `RINGCENTRAL_JWT`, `RINGCENTRAL_SERVER_URL`.
5. Confirm the Vercel plan tier so the cron interval can be settled.
6. Apply the migration, insert the `ringcentral_accounts` row for Quest, seed KPI targets,
   and install the `calls` plugin for Quest's workspace.

Steps 1–3 gate everything that touches live data; the sync, RLS, KPI logic and UI can all
be built and tested against fakes before they are done.

## References

- [JWT authentication flow](https://developers.ringcentral.com/guide/authentication/jwt-flow)
- [Call log synchronization](https://developers.ringcentral.com/guide/voice/call-log/sync)
- [API rate limits](https://developers.ringcentral.com/guide/basics/rate-limits)
