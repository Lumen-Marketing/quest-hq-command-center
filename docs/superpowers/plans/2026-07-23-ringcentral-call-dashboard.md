# RingCentral Call Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `calls` module to Quest HQ showing per-person live phone status and a count of calls longer than 60 seconds, sourced from Quest's RingCentral account.

**Architecture:** A Vercel cron endpoint authenticates to RingCentral with a JWT credential, pulls a rolling window of the company call log plus the extension directory, and upserts both into Supabase. The browser reads aggregates from a Postgres function and gets live status from a second, user-authenticated Vercel function that proxies the RingCentral Presence API behind a short cache. RLS restricts non-admins to their own rows, matched by email.

**Tech Stack:** Vanilla JS SPA (Vite), Vercel Functions (Node, ESM), Supabase Postgres + RLS, `node --test` for tests. No new npm dependencies.

## Global Constraints

Every task's requirements implicitly include this section.

- **Never start a local server.** `npm run dev` and `npm run preview` are forbidden by `.ai/operations.md`. Local verification is `npm test`, `npm run ai:check`, `npm run build`, `npm run check` only.
- **No new npm dependencies.** No charting library, no RingCentral SDK. Use `fetch` and hand-written SQL.
- **Tests run with `node --test tests/*.mjs`** via `npm test`. Test files live in `tests/` and end in `.test.mjs`.
- **Migrations are forward-only** SQL files in `supabase/migrations/`. Never edit an applied migration.
- **New tables must be deliberately exposed and granted.** Supabase's 2026 API hardening means a created table is not automatically reachable from the Data API. Every new table needs explicit `grant` statements.
- **Company id is the tenant boundary and is `text`,** not uuid. `app_private.is_company_member(target_company_id text)`, `app_private.is_company_admin(target_company_id text)` and `app_private.is_quest_admin()` are the authorization helpers.
- **This module is company-scoped, not workspace-scoped.** A RingCentral account belongs to the whole company, and calls do not belong to an operational workspace. Do not add a `workspace_id` column.
- **Service credentials never enter `VITE_`-prefixed variables.** RingCentral secrets are read only inside `api/`.
- **The project brain must be updated in the same change** — see Task 8. `npm run ai:check` fails otherwise.
- **`CONVERSATION_THRESHOLD_SECONDS = 60`** is defined once in `api/_lib/ringcentral.js` and imported everywhere else. Never inline the number `60` in a second place.
- **Commit after every task.**

## Design change from the spec

The spec described using RingCentral's `call-log-sync` API with `FSync`/`ISync` sync tokens. This plan instead fetches a **rolling window of the plain company call log** and upserts it.

Why: the sync-token approach carries a documented failure mode — if more than 250 records change between runs, the token is rejected and the job must fall back to a full sync — and the documented sync endpoint is extension-scoped, which would mean one request per person. A rolling window over `/account/~/call-log` is company-wide in one paged request, is idempotent through the unique constraint, and self-heals: a missed run is simply covered by the next one. The cost is re-fetching a few hundred already-seen records each run, which is negligible.

Consequence for the data model: `ringcentral_sync_state` holds no `sync_token`. It tracks `last_sync_at`, `backfilled_through`, `consecutive_failures` and `last_error`.

## File structure

| File | Responsibility |
| --- | --- |
| `api/_lib/ringcentral.js` (create) | The only module that knows RingCentral exists: token exchange, call-log/presence/extension fetches, and the pure normalisation helpers. |
| `api/_lib/user-auth.js` (create) | Turns a browser bearer token into `{ profileId, email }` and answers "is this person an active admin of this company?" |
| `api/ringcentral-sync.js` (create) | Cron endpoint. Fetches extensions + a rolling call-log window, upserts, records sync state. |
| `api/ringcentral-presence.js` (create) | User-authenticated endpoint. Admin-only. Cached presence fetch, reconciles `ringcentral_presence`. |
| `supabase/migrations/202607231200_ringcentral_calls.sql` (create) | Five tables, RLS, grants, and the aggregate function. |
| `src/main.js` (modify) | Plugin registry, module registry, nav group, permission mapping, route dispatch, `renderCallsPage`. |
| `src/styles.css` (modify) | Styles for the two sections. |
| `vercel.json` (modify) | Cron entry for the sync endpoint. |
| `tests/ringcentral-client.test.mjs` (create) | Token exchange, paging, and the pure helpers. |
| `tests/ringcentral-sync-api.test.mjs` (create) | Cron auth, upsert shape, failure recording. |
| `tests/ringcentral-presence-api.test.mjs` (create) | Auth, admin gate, cache, `status_since` reconciliation. |
| `tests/ringcentral-migration.test.mjs` (create) | Static assertions over the migration SQL. |
| `tests/ringcentral-calls-static.test.mjs` (create) | Static assertions over `src/main.js` registration and rendering. |
| `.ai/*` (modify) | Project brain refresh. |

---

### Task 1: RingCentral client — token exchange and paged fetch

**Files:**
- Create: `api/_lib/ringcentral.js`
- Test: `tests/ringcentral-client.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `CONVERSATION_THRESHOLD_SECONDS` — `number`, value `60`
  - `createRingCentralClient(config)` where `config` is
    `{ clientId: string, clientSecret: string, jwt: string, serverUrl: string, fetchImpl?: typeof fetch }`,
    returning `{ getAccessToken(): Promise<string>, fetchPaged(path: string, params: object): Promise<object[]> }`
  - `RingCentralError` — `class extends Error` with a `statusCode: number` property

- [ ] **Step 1: Write the failing test**

Create `tests/ringcentral-client.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import { createRingCentralClient, RingCentralError, CONVERSATION_THRESHOLD_SECONDS } from '../api/_lib/ringcentral.js';

const CONFIG = {
  clientId: 'cid',
  clientSecret: 'csecret',
  jwt: 'jwt-value',
  serverUrl: 'https://platform.ringcentral.com',
};

function fakeFetch(handlers) {
  const calls = [];
  const impl = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    const handler = handlers.shift();
    if (!handler) throw new Error(`Unexpected request to ${url}`);
    return handler(String(url), options);
  };
  impl.calls = calls;
  return impl;
}

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) };
}

test('the conversation threshold is sixty seconds', () => {
  assert.equal(CONVERSATION_THRESHOLD_SECONDS, 60);
});

test('getAccessToken posts the JWT bearer grant with basic auth', async () => {
  const fetchImpl = fakeFetch([() => jsonResponse({ access_token: 'token-1', expires_in: 3600 })]);
  const client = createRingCentralClient({ ...CONFIG, fetchImpl });

  const token = await client.getAccessToken();

  assert.equal(token, 'token-1');
  const [request] = fetchImpl.calls;
  assert.equal(request.url, 'https://platform.ringcentral.com/restapi/oauth/token');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.equal(request.options.headers.Authorization, `Basic ${Buffer.from('cid:csecret').toString('base64')}`);
  assert.match(request.options.body, /grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer/);
  assert.match(request.options.body, /assertion=jwt-value/);
});

test('getAccessToken reuses a cached token instead of re-authenticating', async () => {
  const fetchImpl = fakeFetch([() => jsonResponse({ access_token: 'token-1', expires_in: 3600 })]);
  const client = createRingCentralClient({ ...CONFIG, fetchImpl });

  assert.equal(await client.getAccessToken(), 'token-1');
  assert.equal(await client.getAccessToken(), 'token-1');
  assert.equal(fetchImpl.calls.length, 1);
});

test('a failed token exchange raises RingCentralError carrying the status', async () => {
  const fetchImpl = fakeFetch([() => jsonResponse({ error: 'invalid_grant' }, 400)]);
  const client = createRingCentralClient({ ...CONFIG, fetchImpl });

  await assert.rejects(() => client.getAccessToken(), (error) => {
    assert.ok(error instanceof RingCentralError);
    assert.equal(error.statusCode, 400);
    return true;
  });
});

test('fetchPaged follows every page and concatenates records', async () => {
  const fetchImpl = fakeFetch([
    () => jsonResponse({ access_token: 'token-1', expires_in: 3600 }),
    (url) => {
      assert.match(url, /page=1/);
      assert.match(url, /perPage=250/);
      return jsonResponse({ records: [{ id: 'a' }], paging: { page: 1, totalPages: 2 } });
    },
    (url) => {
      assert.match(url, /page=2/);
      return jsonResponse({ records: [{ id: 'b' }], paging: { page: 2, totalPages: 2 } });
    },
  ]);
  const client = createRingCentralClient({ ...CONFIG, fetchImpl });

  const records = await client.fetchPaged('/restapi/v1.0/account/~/call-log', { view: 'Simple' });

  assert.deepEqual(records.map((record) => record.id), ['a', 'b']);
});

test('fetchPaged sends the bearer token and surfaces a 429 as RingCentralError', async () => {
  const fetchImpl = fakeFetch([
    () => jsonResponse({ access_token: 'token-1', expires_in: 3600 }),
    (_url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer token-1');
      return jsonResponse({ message: 'rate limit' }, 429);
    },
  ]);
  const client = createRingCentralClient({ ...CONFIG, fetchImpl });

  await assert.rejects(() => client.fetchPaged('/restapi/v1.0/account/~/call-log', {}), (error) => {
    assert.equal(error.statusCode, 429);
    return true;
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/ringcentral-client.test.mjs`
Expected: FAIL — `Cannot find module '../api/_lib/ringcentral.js'`

- [ ] **Step 3: Write the implementation**

Create `api/_lib/ringcentral.js`:

```javascript
// The only module that knows RingCentral exists. Everything else talks to it
// through these functions, so tests can inject a fake fetch and never touch the
// network.

export const CONVERSATION_THRESHOLD_SECONDS = 60;

const JWT_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const PAGE_SIZE = 250;
const MAX_PAGES = 40; // hard stop: a runaway pager would burn the rate limit
const TOKEN_SAFETY_WINDOW_MS = 60_000;

export class RingCentralError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'RingCentralError';
    this.statusCode = statusCode;
  }
}

async function describeFailure(response) {
  try {
    const body = await response.text();
    return body.slice(0, 200);
  } catch {
    return 'no response body';
  }
}

export function createRingCentralClient({ clientId, clientSecret, jwt, serverUrl, fetchImpl = fetch, now = () => Date.now() }) {
  const base = String(serverUrl || '').replace(/\/$/, '');
  let cachedToken = '';
  let cachedUntil = 0;

  async function getAccessToken() {
    if (cachedToken && now() < cachedUntil) return cachedToken;

    const body = new URLSearchParams({ grant_type: JWT_GRANT_TYPE, assertion: jwt }).toString();
    const response = await fetchImpl(`${base}/restapi/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body,
    });
    if (!response.ok) throw new RingCentralError(response.status, `Token exchange failed: ${await describeFailure(response)}`);

    const payload = await response.json();
    cachedToken = String(payload.access_token || '');
    if (!cachedToken) throw new RingCentralError(502, 'Token exchange returned no access_token.');
    const lifetimeMs = (Number(payload.expires_in) || 3600) * 1000;
    cachedUntil = now() + Math.max(lifetimeMs - TOKEN_SAFETY_WINDOW_MS, 0);
    return cachedToken;
  }

  async function fetchPaged(path, params = {}) {
    const token = await getAccessToken();
    const records = [];

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const query = new URLSearchParams({ ...params, page: String(page), perPage: String(PAGE_SIZE) });
      const response = await fetchImpl(`${base}${path}?${query.toString()}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!response.ok) throw new RingCentralError(response.status, `${path} failed: ${await describeFailure(response)}`);

      const payload = await response.json();
      records.push(...(payload.records || []));
      const totalPages = Number(payload.paging?.totalPages) || 1;
      if (page >= totalPages) break;
    }

    return records;
  }

  return { getAccessToken, fetchPaged };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/ringcentral-client.test.mjs`
Expected: PASS — 6 tests

- [ ] **Step 5: Commit**

```bash
git add api/_lib/ringcentral.js tests/ringcentral-client.test.mjs
git commit -m "feat: RingCentral JWT client with paged fetch"
```

---

### Task 2: Pure helpers — call normalisation and status derivation

**Files:**
- Modify: `api/_lib/ringcentral.js`
- Modify: `tests/ringcentral-client.test.mjs`

**Interfaces:**
- Consumes: Task 1's module.
- Produces:
  - `normalizeCallRecord(record: object, context: { companyId: string, extensions: Map<string, object> }): object | null`
    returning `{ company_id, call_id, session_id, started_at, direction, from_number, from_name, to_number, to_name, extension_id, extension_number, extension_name, extension_email, duration_seconds, result, is_conversation, raw }`
  - `deriveDisplayStatus(presence: object): 'on_call' | 'ringing' | 'dnd' | 'offline' | 'busy' | 'available'`
  - `normalizeExtension(record: object, companyId: string): object | null`
    returning `{ company_id, extension_id, extension_number, name, email, status }`

- [ ] **Step 1: Write the failing tests**

Append to `tests/ringcentral-client.test.mjs`:

```javascript
import { normalizeCallRecord, deriveDisplayStatus, normalizeExtension } from '../api/_lib/ringcentral.js';

const EXTENSIONS = new Map([
  ['201', { extension_id: '201', extension_number: '103', name: 'Ralph Garcia', email: 'Ralph@Quest.com ' }],
]);

test('normalizeCallRecord flattens a call and denormalizes the extension', () => {
  const row = normalizeCallRecord({
    id: 'call-1',
    sessionId: 'sess-1',
    startTime: '2026-07-20T17:04:05.000Z',
    direction: 'Outbound',
    duration: 95,
    result: 'Call connected',
    from: { phoneNumber: '+16025550101', name: 'Quest' },
    to: { phoneNumber: '+16025550102', name: 'Customer' },
    extension: { id: 201 },
  }, { companyId: 'quest', extensions: EXTENSIONS });

  assert.equal(row.company_id, 'quest');
  assert.equal(row.call_id, 'call-1');
  assert.equal(row.session_id, 'sess-1');
  assert.equal(row.started_at, '2026-07-20T17:04:05.000Z');
  assert.equal(row.direction, 'Outbound');
  assert.equal(row.duration_seconds, 95);
  assert.equal(row.result, 'Call connected');
  assert.equal(row.from_number, '+16025550101');
  assert.equal(row.to_name, 'Customer');
  assert.equal(row.extension_id, '201');
  assert.equal(row.extension_number, '103');
  assert.equal(row.extension_name, 'Ralph Garcia');
  assert.equal(row.extension_email, 'ralph@quest.com', 'email is lowercased and trimmed for matching');
  assert.equal(row.is_conversation, true);
});

test('normalizeCallRecord is inclusive at exactly the threshold and excludes one second under', () => {
  const build = (duration) => normalizeCallRecord(
    { id: `c-${duration}`, startTime: '2026-07-20T17:00:00.000Z', duration, extension: { id: 201 } },
    { companyId: 'quest', extensions: EXTENSIONS },
  );
  assert.equal(build(60).is_conversation, true);
  assert.equal(build(59).is_conversation, false);
  assert.equal(build(0).is_conversation, false);
});

test('normalizeCallRecord tolerates an unknown extension and a missing duration', () => {
  const row = normalizeCallRecord(
    { id: 'call-2', startTime: '2026-07-20T17:00:00.000Z', extension: { id: 999 } },
    { companyId: 'quest', extensions: EXTENSIONS },
  );
  assert.equal(row.extension_id, '999');
  assert.equal(row.extension_name, '');
  assert.equal(row.extension_email, '');
  assert.equal(row.duration_seconds, 0);
  assert.equal(row.is_conversation, false);
});

test('normalizeCallRecord rejects a record with no id or no start time', () => {
  const context = { companyId: 'quest', extensions: EXTENSIONS };
  assert.equal(normalizeCallRecord({ startTime: '2026-07-20T17:00:00.000Z' }, context), null);
  assert.equal(normalizeCallRecord({ id: 'call-3' }, context), null);
});

test('deriveDisplayStatus ranks an active call above every other signal', () => {
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'CallConnected', userStatus: 'Offline', dndStatus: 'DoNotAcceptAnyCalls' }), 'on_call');
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'Ringing', userStatus: 'Offline' }), 'ringing');
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'NoCall', dndStatus: 'DoNotAcceptAnyCalls' }), 'dnd');
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'NoCall', userStatus: 'Offline' }), 'offline');
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'NoCall', userStatus: 'Busy' }), 'busy');
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'NoCall', userStatus: 'Available' }), 'available');
  assert.equal(deriveDisplayStatus({}), 'available', 'an empty payload falls back to available');
});

test('deriveDisplayStatus ignores a DND value that means DND is off', () => {
  assert.equal(deriveDisplayStatus({ telephonyStatus: 'NoCall', userStatus: 'Available', dndStatus: 'TakeAllCalls' }), 'available');
});

test('normalizeExtension keeps only enabled user extensions', () => {
  const row = normalizeExtension({
    id: 201,
    extensionNumber: '103',
    name: 'Ralph Garcia',
    contact: { email: 'Ralph@Quest.com' },
    status: 'Enabled',
    type: 'User',
  }, 'quest');
  assert.deepEqual(row, {
    company_id: 'quest',
    extension_id: '201',
    extension_number: '103',
    name: 'Ralph Garcia',
    email: 'ralph@quest.com',
    status: 'Enabled',
  });

  assert.equal(normalizeExtension({ id: 5, type: 'Department', status: 'Enabled' }, 'quest'), null);
  assert.equal(normalizeExtension({ type: 'User', status: 'Enabled' }, 'quest'), null);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/ringcentral-client.test.mjs`
Expected: FAIL — `normalizeCallRecord is not a function` (the import resolves but the binding is undefined)

- [ ] **Step 3: Write the implementation**

Append to `api/_lib/ringcentral.js`:

```javascript
const DND_OFF_VALUES = new Set(['', 'takeallcalls', 'unknown']);

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function cleanText(value) {
  return String(value ?? '').trim();
}

/** Flatten one RingCentral call-log record into a `ringcentral_calls` row. */
export function normalizeCallRecord(record, { companyId, extensions }) {
  const callId = cleanText(record?.id);
  const startedAt = cleanText(record?.startTime);
  if (!callId || !startedAt) return null;

  const extensionId = cleanText(record?.extension?.id);
  const known = extensions.get(extensionId) || {};
  const durationSeconds = Number(record?.duration) || 0;

  return {
    company_id: companyId,
    call_id: callId,
    session_id: cleanText(record?.sessionId),
    started_at: startedAt,
    direction: cleanText(record?.direction),
    from_number: cleanText(record?.from?.phoneNumber),
    from_name: cleanText(record?.from?.name),
    to_number: cleanText(record?.to?.phoneNumber),
    to_name: cleanText(record?.to?.name),
    extension_id: extensionId,
    extension_number: cleanText(known.extension_number),
    extension_name: cleanText(known.name),
    extension_email: cleanEmail(known.email),
    duration_seconds: durationSeconds,
    result: cleanText(record?.result),
    is_conversation: durationSeconds >= CONVERSATION_THRESHOLD_SECONDS,
    raw: record,
  };
}

/**
 * Collapse RingCentral's three independent presence signals into the one label
 * the board shows. Order matters: an active call outranks whatever the person
 * set their status to.
 */
export function deriveDisplayStatus(presence) {
  const telephony = cleanText(presence?.telephonyStatus).toLowerCase();
  if (telephony === 'callconnected') return 'on_call';
  if (telephony === 'ringing') return 'ringing';

  const dnd = cleanText(presence?.dndStatus).toLowerCase();
  if (dnd && !DND_OFF_VALUES.has(dnd)) return 'dnd';

  const user = cleanText(presence?.userStatus).toLowerCase();
  if (user === 'offline') return 'offline';
  if (user === 'busy') return 'busy';
  return 'available';
}

/** Keep only user extensions — departments and queues are not people. */
export function normalizeExtension(record, companyId) {
  const extensionId = cleanText(record?.id);
  if (!extensionId) return null;
  if (cleanText(record?.type) !== 'User') return null;

  return {
    company_id: companyId,
    extension_id: extensionId,
    extension_number: cleanText(record?.extensionNumber),
    name: cleanText(record?.name),
    email: cleanEmail(record?.contact?.email),
    status: cleanText(record?.status),
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/ringcentral-client.test.mjs`
Expected: PASS — 13 tests

- [ ] **Step 5: Commit**

```bash
git add api/_lib/ringcentral.js tests/ringcentral-client.test.mjs
git commit -m "feat: normalize RingCentral calls, extensions, and presence status"
```

---

### Task 3: Database migration

**Files:**
- Create: `supabase/migrations/202607231200_ringcentral_calls.sql`
- Test: `tests/ringcentral-migration.test.mjs`

**Interfaces:**
- Consumes: `app_private.is_company_member(text)`, `app_private.is_company_admin(text)`, `app_private.is_quest_admin()`.
- Produces: tables `ringcentral_accounts`, `ringcentral_extensions`, `ringcentral_calls`, `ringcentral_presence`, `ringcentral_sync_state`; function `public.ringcentral_conversation_stats(p_company_id text, p_from timestamptz, p_to timestamptz)` returning
  `(extension_id text, extension_number text, extension_name text, total_calls bigint, conversations bigint)`.

- [ ] **Step 1: Write the failing test**

Create `tests/ringcentral-migration.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(new URL('../supabase/migrations/202607231200_ringcentral_calls.sql', import.meta.url), 'utf8');

test('every RingCentral table is created with row level security enabled', () => {
  for (const table of ['ringcentral_accounts', 'ringcentral_extensions', 'ringcentral_calls', 'ringcentral_presence', 'ringcentral_sync_state']) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`), `${table} is not created`);
    assert.match(sql, new RegExp(`alter table public\\.${table}\\s+enable row level security`), `${table} has no RLS`);
  }
});

test('calls are unique per company and call id so re-syncing cannot duplicate', () => {
  assert.match(sql, /constraint ringcentral_calls_company_call_key unique \(company_id, call_id\)/);
});

test('a partial index backs the conversation filter', () => {
  assert.match(sql, /create index if not exists ringcentral_calls_conversation_idx[\s\S]{0,200}where is_conversation/);
});

test('members read only their own calls while admins read the company', () => {
  assert.match(sql, /create policy "members read own calls" on public\.ringcentral_calls/);
  assert.match(sql, /app_private\.is_company_admin\(company_id\)/);
  assert.match(sql, /lower\(coalesce\(auth\.jwt\(\) ->> 'email', ''\)\)/);
});

test('no policy grants write access to browser clients', () => {
  assert.doesNotMatch(sql, /for (insert|update|delete) to authenticated/);
});

test('presence and extensions are admin-readable only', () => {
  assert.match(sql, /create policy "company admins read presence" on public\.ringcentral_presence/);
  assert.match(sql, /create policy "company admins read extensions" on public\.ringcentral_extensions/);
});

test('tables are explicitly granted because Supabase does not expose them automatically', () => {
  assert.match(sql, /grant select on public\.ringcentral_calls to authenticated/);
  assert.match(sql, /grant select on public\.ringcentral_presence to authenticated/);
  assert.match(sql, /grant select on public\.ringcentral_sync_state to authenticated/);
});

test('the aggregate function is security invoker so it inherits RLS', () => {
  assert.match(sql, /create or replace function public\.ringcentral_conversation_stats/);
  assert.match(sql, /security invoker/);
  assert.match(sql, /revoke all on function public\.ringcentral_conversation_stats\(text, timestamptz, timestamptz\) from public, anon/);
  assert.match(sql, /grant execute on function public\.ringcentral_conversation_stats\(text, timestamptz, timestamptz\) to authenticated/);
});

test('the calls plugin joins the known-plugin allowlist without dropping existing entries', () => {
  assert.match(sql, /company_plugins_known_plugin_check/);
  for (const plugin of ['crm', 'crm_2', 'underwriter', 'files', 'client_portal', 'workspace_builder', 'price_book', 'forms', 'finance', 'messages', 'calendar', 'time_clock', 'approvals', 'reporting', 'calls']) {
    assert.match(sql, new RegExp(`'${plugin}'`), `${plugin} disappeared from the allowlist`);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/ringcentral-migration.test.mjs`
Expected: FAIL — `ENOENT: no such file or directory ... 202607231200_ringcentral_calls.sql`

- [ ] **Step 3: Write the migration**

Create `supabase/migrations/202607231200_ringcentral_calls.sql`:

```sql
-- RingCentral call dashboard.
--
-- Company-scoped on purpose: a RingCentral account belongs to the whole company
-- and its calls do not belong to any single operational workspace, so there is
-- no workspace_id here. Every table is written by the service role only; the
-- browser reads and never writes.

-- ============================================================
-- A. Tables
-- ============================================================

-- Which companies are connected, and where their credentials live. The JWT
-- itself never enters the database: credential_key names an environment
-- variable. Adding per-tenant OAuth later means adding columns here rather than
-- reworking the sync.
create table if not exists public.ringcentral_accounts (
  company_id text primary key references public.companies (id) on delete cascade,
  rc_account_id text not null default '~',
  credential_source text not null default 'env',
  credential_key text not null default 'RINGCENTRAL_JWT',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ringcentral_accounts_status_check check (status in ('active', 'paused')),
  constraint ringcentral_accounts_source_check check (credential_source in ('env'))
);

-- The extension directory, refreshed by the sync job. This is what maps a call
-- to a human name and what matches a logged-in member to their own extension.
create table if not exists public.ringcentral_extensions (
  company_id text not null references public.companies (id) on delete cascade,
  extension_id text not null,
  extension_number text not null default '',
  name text not null default '',
  email text not null default '',
  status text not null default '',
  updated_at timestamptz not null default now(),
  primary key (company_id, extension_id)
);

-- One row per call. Extension name and email are denormalized at write time so
-- history survives a rename or a person leaving.
create table if not exists public.ringcentral_calls (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies (id) on delete cascade,
  call_id text not null,
  session_id text not null default '',
  started_at timestamptz not null,
  direction text not null default '',
  from_number text not null default '',
  from_name text not null default '',
  to_number text not null default '',
  to_name text not null default '',
  extension_id text not null default '',
  extension_number text not null default '',
  extension_name text not null default '',
  extension_email text not null default '',
  duration_seconds integer not null default 0,
  result text not null default '',
  is_conversation boolean not null default false,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ringcentral_calls_company_call_key unique (company_id, call_id)
);

create index if not exists ringcentral_calls_company_started_idx
  on public.ringcentral_calls (company_id, started_at desc);
create index if not exists ringcentral_calls_company_email_idx
  on public.ringcentral_calls (company_id, extension_email);
create index if not exists ringcentral_calls_conversation_idx
  on public.ringcentral_calls (company_id, started_at desc)
  where is_conversation;

-- Current status per extension. status_since is the memory that makes the
-- ticking duration possible: RingCentral reports what a status IS, never how
-- long it has been held.
create table if not exists public.ringcentral_presence (
  company_id text not null references public.companies (id) on delete cascade,
  extension_id text not null,
  display_status text not null default 'available',
  status_since timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, extension_id)
);

-- Sync health. There is no sync token: the job re-fetches a rolling window and
-- upserts, so a missed run is covered by the next one.
create table if not exists public.ringcentral_sync_state (
  company_id text primary key references public.companies (id) on delete cascade,
  last_sync_at timestamptz,
  backfilled_through timestamptz,
  consecutive_failures integer not null default 0,
  last_error text not null default '',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- B. Row level security
-- ============================================================
-- No policy below permits insert, update, or delete. Writes happen through the
-- service role in the Vercel functions, which bypasses RLS.

alter table public.ringcentral_accounts enable row level security;
alter table public.ringcentral_extensions enable row level security;
alter table public.ringcentral_calls enable row level security;
alter table public.ringcentral_presence enable row level security;
alter table public.ringcentral_sync_state enable row level security;

drop policy if exists "company admins read accounts" on public.ringcentral_accounts;
create policy "company admins read accounts" on public.ringcentral_accounts
for select to authenticated
using (app_private.is_quest_admin() or app_private.is_company_admin(company_id));

drop policy if exists "company admins read extensions" on public.ringcentral_extensions;
create policy "company admins read extensions" on public.ringcentral_extensions
for select to authenticated
using (app_private.is_quest_admin() or app_private.is_company_admin(company_id));

drop policy if exists "company admins read presence" on public.ringcentral_presence;
create policy "company admins read presence" on public.ringcentral_presence
for select to authenticated
using (app_private.is_quest_admin() or app_private.is_company_admin(company_id));

-- Admins see the company; everyone else sees only the calls handled by the
-- extension carrying their own login email.
drop policy if exists "members read own calls" on public.ringcentral_calls;
create policy "members read own calls" on public.ringcentral_calls
for select to authenticated
using (
  app_private.is_quest_admin()
  or app_private.is_company_admin(company_id)
  or (
    app_private.is_company_member(company_id)
    and extension_email <> ''
    and extension_email = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

-- Members need this to render the "synced N minutes ago" stamp.
drop policy if exists "members read sync state" on public.ringcentral_sync_state;
create policy "members read sync state" on public.ringcentral_sync_state
for select to authenticated
using (app_private.is_quest_admin() or app_private.is_company_member(company_id));

-- ============================================================
-- C. Grants
-- ============================================================
-- Supabase's 2026 API hardening does not expose new tables automatically.

grant select on public.ringcentral_accounts to authenticated;
grant select on public.ringcentral_extensions to authenticated;
grant select on public.ringcentral_calls to authenticated;
grant select on public.ringcentral_presence to authenticated;
grant select on public.ringcentral_sync_state to authenticated;

revoke all on public.ringcentral_accounts from anon;
revoke all on public.ringcentral_extensions from anon;
revoke all on public.ringcentral_calls from anon;
revoke all on public.ringcentral_presence from anon;
revoke all on public.ringcentral_sync_state from anon;

-- ============================================================
-- D. Aggregate
-- ============================================================
-- security invoker so the policy above does the filtering: an admin gets the
-- whole team, a member gets one row.

create or replace function public.ringcentral_conversation_stats(
  p_company_id text,
  p_from timestamptz,
  p_to timestamptz
)
returns table (
  extension_id text,
  extension_number text,
  extension_name text,
  total_calls bigint,
  conversations bigint
)
language sql
security invoker
stable
set search_path = public, pg_temp
as $$
  select
    c.extension_id,
    max(c.extension_number) as extension_number,
    max(c.extension_name) as extension_name,
    count(*)::bigint as total_calls,
    count(*) filter (where c.is_conversation)::bigint as conversations
  from public.ringcentral_calls c
  where c.company_id = p_company_id
    and c.started_at >= p_from
    and c.started_at < p_to
  group by c.extension_id
  order by conversations desc, total_calls desc;
$$;

revoke all on function public.ringcentral_conversation_stats(text, timestamptz, timestamptz) from public, anon;
grant execute on function public.ringcentral_conversation_stats(text, timestamptz, timestamptz) to authenticated;

-- ============================================================
-- E. Register the plugin
-- ============================================================
-- The array below is reproduced verbatim from the existing constraint with
-- 'calls' appended. Do not re-order or drop entries: a stale copy would
-- silently remove modules from newly created workspaces.

alter table public.company_plugins
  drop constraint if exists company_plugins_known_plugin_check;

alter table public.company_plugins
  add constraint company_plugins_known_plugin_check check (
    plugin_id in (
      'crm',
      'crm_2',
      'underwriter',
      'files',
      'client_portal',
      'workspace_builder',
      'price_book',
      'forms',
      'finance',
      'messages',
      'calendar',
      'time_clock',
      'approvals',
      'reporting',
      'calls'
    )
  );
```

**Before writing this file, verify the current allowlist.** Run:

```bash
grep -rn "company_plugins_known_plugin_check" supabase/migrations/ | tail -3
```

Open the most recent match and copy its `plugin_id in (...)` list verbatim, then append `'calls'`. If the live list differs from the one written above, the live list wins — a stale copy silently removes modules from new workspaces.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/ringcentral-migration.test.mjs`
Expected: PASS — 9 tests

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/202607231200_ringcentral_calls.sql tests/ringcentral-migration.test.mjs
git commit -m "feat: RingCentral call dashboard schema, RLS, and aggregate"
```

---

### Task 4: Browser bearer-token authentication helper

**Files:**
- Create: `api/_lib/user-auth.js`
- Test: `tests/ringcentral-presence-api.test.mjs` (created here, extended in Task 6)

**Interfaces:**
- Consumes: nothing.
- Produces: `resolveCompanyAdmin(request, { supabaseUrl, serviceKey, companyId, fetchImpl })` returning
  `Promise<{ profileId: string, email: string, isAdmin: boolean }>`, throwing `HttpError(401)` when the
  token is missing or invalid and `HttpError(403)` when the caller is not an active member.

- [ ] **Step 1: Write the failing test**

Create `tests/ringcentral-presence-api.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveCompanyAdmin } from '../api/_lib/user-auth.js';

const SUPABASE = { supabaseUrl: 'https://project.supabase.co', serviceKey: 'service-key' };

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) };
}

function requestWithToken(token) {
  return { headers: token ? { authorization: `Bearer ${token}` } : {} };
}

test('a request with no bearer token is rejected with 401', async () => {
  await assert.rejects(
    () => resolveCompanyAdmin(requestWithToken(''), { ...SUPABASE, companyId: 'quest', fetchImpl: async () => jsonResponse({}) }),
    (error) => { assert.equal(error.statusCode, 401); return true; },
  );
});

test('a token Supabase rejects is surfaced as 401', async () => {
  const fetchImpl = async () => jsonResponse({ message: 'bad jwt' }, 401);
  await assert.rejects(
    () => resolveCompanyAdmin(requestWithToken('nope'), { ...SUPABASE, companyId: 'quest', fetchImpl }),
    (error) => { assert.equal(error.statusCode, 401); return true; },
  );
});

test('a valid token from a non-member is rejected with 403', async () => {
  const fetchImpl = async (url) => {
    if (String(url).includes('/auth/v1/user')) return jsonResponse({ id: 'profile-1', email: 'Nobody@Quest.com' });
    return jsonResponse([]);
  };
  await assert.rejects(
    () => resolveCompanyAdmin(requestWithToken('good'), { ...SUPABASE, companyId: 'quest', fetchImpl }),
    (error) => { assert.equal(error.statusCode, 403); return true; },
  );
});

test('an active member is resolved with a lowercased email and isAdmin false', async () => {
  const fetchImpl = async (url) => {
    if (String(url).includes('/auth/v1/user')) return jsonResponse({ id: 'profile-1', email: 'Rep@Quest.com' });
    return jsonResponse([{ role: 'worker', status: 'active' }]);
  };
  const result = await resolveCompanyAdmin(requestWithToken('good'), { ...SUPABASE, companyId: 'quest', fetchImpl });
  assert.deepEqual(result, { profileId: 'profile-1', email: 'rep@quest.com', isAdmin: false });
});

test('an owner, admin, developer, or construction supervisor is an admin', async () => {
  for (const role of ['owner', 'admin', 'developer', 'construction_supervisor']) {
    const fetchImpl = async (url) => {
      if (String(url).includes('/auth/v1/user')) return jsonResponse({ id: 'profile-1', email: 'boss@quest.com' });
      return jsonResponse([{ role, status: 'active' }]);
    };
    const result = await resolveCompanyAdmin(requestWithToken('good'), { ...SUPABASE, companyId: 'quest', fetchImpl });
    assert.equal(result.isAdmin, true, `${role} should be an admin`);
  }
});

test('a disabled membership does not authorize the caller', async () => {
  const fetchImpl = async (url) => {
    if (String(url).includes('/auth/v1/user')) return jsonResponse({ id: 'profile-1', email: 'ex@quest.com' });
    return jsonResponse([]);
  };
  await assert.rejects(
    () => resolveCompanyAdmin(requestWithToken('good'), { ...SUPABASE, companyId: 'quest', fetchImpl }),
    (error) => { assert.equal(error.statusCode, 403); return true; },
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/ringcentral-presence-api.test.mjs`
Expected: FAIL — `Cannot find module '../api/_lib/user-auth.js'`

- [ ] **Step 3: Write the implementation**

Create `api/_lib/user-auth.js`:

```javascript
// Turns a browser bearer token into an identity plus a company-admin answer.
// Server endpoints that return data RLS never sees (anything proxied from a
// third party) must call this, because RLS cannot protect what never touches a
// table.

import { HttpError } from './http-security.js';

const ADMIN_ROLES = new Set(['owner', 'admin', 'developer', 'construction_supervisor']);

function bearerToken(request) {
  const header = String(request?.headers?.authorization || '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export async function resolveCompanyAdmin(request, { supabaseUrl, serviceKey, companyId, fetchImpl = fetch }) {
  const token = bearerToken(request);
  if (!token) throw new HttpError(401, 'Sign in to continue.');

  const base = String(supabaseUrl || '').replace(/\/$/, '');

  const userResponse = await fetchImpl(`${base}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
  });
  if (!userResponse.ok) throw new HttpError(401, 'Sign in to continue.');

  const user = await userResponse.json();
  const profileId = String(user?.id || '');
  if (!profileId) throw new HttpError(401, 'Sign in to continue.');

  const query = new URLSearchParams({
    select: 'role,status',
    company_id: `eq.${companyId}`,
    profile_id: `eq.${profileId}`,
    status: 'eq.active',
    limit: '1',
  });
  const membershipResponse = await fetchImpl(`${base}/rest/v1/company_memberships?${query.toString()}`, {
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Accept: 'application/json' },
  });
  if (!membershipResponse.ok) throw new HttpError(403, 'You do not have access to this workspace.');

  const memberships = await membershipResponse.json();
  const membership = Array.isArray(memberships) ? memberships[0] : null;
  if (!membership) throw new HttpError(403, 'You do not have access to this workspace.');

  return {
    profileId,
    email: String(user?.email || '').trim().toLowerCase(),
    isAdmin: ADMIN_ROLES.has(String(membership.role || '').toLowerCase()),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/ringcentral-presence-api.test.mjs`
Expected: PASS — 6 tests

- [ ] **Step 5: Commit**

```bash
git add api/_lib/user-auth.js tests/ringcentral-presence-api.test.mjs
git commit -m "feat: resolve browser bearer tokens to company admin identity"
```

---

### Task 5: Sync endpoint and cron registration

**Files:**
- Create: `api/ringcentral-sync.js`
- Modify: `vercel.json`
- Test: `tests/ringcentral-sync-api.test.mjs`

**Interfaces:**
- Consumes: `createRingCentralClient`, `normalizeCallRecord`, `normalizeExtension` from `api/_lib/ringcentral.js`; `setApiHeaders` from `api/_lib/http-security.js`.
- Produces: `export function buildSyncWindow(state, now)` returning `{ dateFrom: string, dateTo: string, isBackfill: boolean }`; default export `handler(request, response)`.

- [ ] **Step 1: Write the failing test**

Create `tests/ringcentral-sync-api.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildSyncWindow } from '../api/ringcentral-sync.js';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../api/ringcentral-sync.js', import.meta.url), 'utf8');

const NOW = new Date('2026-07-23T12:00:00.000Z');

test('a company that has never synced gets the ninety day backfill', () => {
  const window = buildSyncWindow({ backfilled_through: null }, NOW);
  assert.equal(window.isBackfill, true);
  assert.equal(window.dateTo, '2026-07-23T12:00:00.000Z');
  assert.equal(window.dateFrom, '2026-04-24T12:00:00.000Z');
});

test('a company that has synced gets the short rolling window', () => {
  const window = buildSyncWindow({ backfilled_through: '2026-07-01T00:00:00.000Z' }, NOW);
  assert.equal(window.isBackfill, false);
  assert.equal(window.dateFrom, '2026-07-20T12:00:00.000Z', 'three days back');
  assert.equal(window.dateTo, '2026-07-23T12:00:00.000Z');
});

test('the rolling window overlaps itself so a missed run is covered by the next', () => {
  const window = buildSyncWindow({ backfilled_through: '2026-07-01T00:00:00.000Z' }, NOW);
  const spanHours = (new Date(window.dateTo) - new Date(window.dateFrom)) / 3_600_000;
  assert.ok(spanHours >= 72, `window is ${spanHours}h, must be at least 72h to tolerate missed runs`);
});

test('the endpoint is cron authenticated and refuses anything but GET', () => {
  assert.match(source, /CRON_SECRET/);
  assert.match(source, /timingSafeEqual/);
  assert.match(source, /request\.method !== 'GET'/);
  assert.match(source, /status\(401\)/);
});

test('the endpoint uses the service role key and never a VITE variable for secrets', () => {
  assert.match(source, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(source, /VITE_RINGCENTRAL/);
});

test('calls are upserted on the company and call id pair', () => {
  assert.match(source, /onConflict: 'company_id,call_id'/);
});

test('Vercel runs the sync on a schedule', () => {
  const job = vercel.crons?.find((entry) => entry.path === '/api/ringcentral-sync');
  assert.ok(job, 'no cron entry for /api/ringcentral-sync');
  assert.equal(typeof job.schedule, 'string');
  assert.ok(job.schedule.length > 0);
});

test('the existing recycle purge cron survives the change', () => {
  assert.ok(vercel.crons?.some((entry) => entry.path === '/api/recycle-bin-purge' && entry.schedule === '20 3 * * *'));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/ringcentral-sync-api.test.mjs`
Expected: FAIL — `Cannot find module '../api/ringcentral-sync.js'`

- [ ] **Step 3: Write the implementation**

Create `api/ringcentral-sync.js`:

```javascript
import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { setApiHeaders } from './_lib/http-security.js';
import { createRingCentralClient, normalizeCallRecord, normalizeExtension } from './_lib/ringcentral.js';

const BACKFILL_DAYS = 90;
const ROLLING_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const env = (name) => process.env[name] || '';

function authorized(request) {
  const expected = `Bearer ${env('CRON_SECRET')}`;
  const supplied = String(request.headers.authorization || '');
  if (!env('CRON_SECRET') || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

function serverClient() {
  return createClient(
    env('SUPABASE_URL') || env('VITE_SUPABASE_URL'),
    env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Pick the window to fetch. A company that has never been backfilled gets 90
 * days; everyone else gets a rolling three days. The window deliberately
 * overlaps previous runs — upserts make that free, and it means a missed run
 * heals itself instead of leaving a permanent hole.
 */
export function buildSyncWindow(state, now = new Date()) {
  const isBackfill = !state?.backfilled_through;
  const days = isBackfill ? BACKFILL_DAYS : ROLLING_DAYS;
  return {
    isBackfill,
    dateFrom: new Date(now.getTime() - days * DAY_MS).toISOString(),
    dateTo: new Date(now.getTime()).toISOString(),
  };
}

async function recordFailure(client, companyId, message) {
  const existing = await client
    .from('ringcentral_sync_state')
    .select('consecutive_failures')
    .eq('company_id', companyId)
    .maybeSingle();
  const failures = Number(existing.data?.consecutive_failures || 0) + 1;
  await client.from('ringcentral_sync_state').upsert({
    company_id: companyId,
    consecutive_failures: failures,
    last_error: String(message).slice(0, 500),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'company_id' });
}

async function syncCompany(client, account) {
  const companyId = account.company_id;
  const jwt = env(account.credential_key);
  if (!jwt) throw new Error(`Missing credential ${account.credential_key}.`);

  const ringcentral = createRingCentralClient({
    clientId: env('RINGCENTRAL_CLIENT_ID'),
    clientSecret: env('RINGCENTRAL_CLIENT_SECRET'),
    jwt,
    serverUrl: env('RINGCENTRAL_SERVER_URL') || 'https://platform.ringcentral.com',
  });

  // Extensions first: calls are denormalized against them.
  const extensionRecords = await ringcentral.fetchPaged(`/restapi/v1.0/account/${account.rc_account_id}/extension`, { status: 'Enabled' });
  const extensionRows = extensionRecords.map((record) => normalizeExtension(record, companyId)).filter(Boolean);
  if (extensionRows.length) {
    const written = await client
      .from('ringcentral_extensions')
      .upsert(extensionRows.map((row) => ({ ...row, updated_at: new Date().toISOString() })), { onConflict: 'company_id,extension_id' });
    if (written.error) throw written.error;
  }

  const extensions = new Map(extensionRows.map((row) => [row.extension_id, row]));

  const state = await client
    .from('ringcentral_sync_state')
    .select('backfilled_through')
    .eq('company_id', companyId)
    .maybeSingle();
  const window = buildSyncWindow(state.data, new Date());

  const callRecords = await ringcentral.fetchPaged(`/restapi/v1.0/account/${account.rc_account_id}/call-log`, {
    view: 'Simple',
    dateFrom: window.dateFrom,
    dateTo: window.dateTo,
  });
  const callRows = callRecords.map((record) => normalizeCallRecord(record, { companyId, extensions })).filter(Boolean);

  if (callRows.length) {
    const written = await client
      .from('ringcentral_calls')
      .upsert(callRows.map((row) => ({ ...row, updated_at: new Date().toISOString() })), { onConflict: 'company_id,call_id' });
    if (written.error) throw written.error;
  }

  const now = new Date().toISOString();
  const saved = await client.from('ringcentral_sync_state').upsert({
    company_id: companyId,
    last_sync_at: now,
    backfilled_through: window.isBackfill ? now : (state.data?.backfilled_through || now),
    consecutive_failures: 0,
    last_error: '',
    updated_at: now,
  }, { onConflict: 'company_id' });
  if (saved.error) throw saved.error;

  return { company_id: companyId, extensions: extensionRows.length, calls: callRows.length, backfill: window.isBackfill };
}

export default async function handler(request, response) {
  setApiHeaders(response);
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  if (!authorized(request)) return response.status(401).json({ error: 'Unauthorized.' });
  if (!env('RINGCENTRAL_CLIENT_ID') || !env('RINGCENTRAL_CLIENT_SECRET')) {
    return response.status(503).json({ error: 'RingCentral is not configured.' });
  }

  const client = serverClient();
  const accounts = await client
    .from('ringcentral_accounts')
    .select('company_id,rc_account_id,credential_key')
    .eq('status', 'active');
  if (accounts.error) return response.status(500).json({ error: 'Sync failed.' });

  const synced = [];
  const failed = [];
  for (const account of accounts.data || []) {
    try {
      synced.push(await syncCompany(client, account));
    } catch (error) {
      failed.push(account.company_id);
      await recordFailure(client, account.company_id, error?.message || 'Unknown error');
    }
  }

  return response.status(failed.length ? 207 : 200).json({ synced, failed });
}
```

- [ ] **Step 4: Add the cron entry**

Edit `vercel.json` — add the second entry to the existing `crons` array, leaving the recycle purge untouched:

```json
  "crons": [
    {
      "path": "/api/recycle-bin-purge",
      "schedule": "20 3 * * *"
    },
    {
      "path": "/api/ringcentral-sync",
      "schedule": "*/15 * * * *"
    }
  ],
```

**Vercel plan caveat:** `*/15 * * * *` requires a Pro plan. On Hobby, cron granularity is daily and this entry will be rejected at deploy time. If the deploy fails for that reason, change the schedule to `0 * * * *` or move the trigger to Supabase `pg_cron` calling the same URL with the `CRON_SECRET` bearer header. The endpoint and its tests are unchanged either way. Confirm the plan tier before deploying.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/ringcentral-sync-api.test.mjs`
Expected: PASS — 8 tests

- [ ] **Step 6: Commit**

```bash
git add api/ringcentral-sync.js vercel.json tests/ringcentral-sync-api.test.mjs
git commit -m "feat: scheduled RingCentral call log sync"
```

---

### Task 6: Presence endpoint

**Files:**
- Create: `api/ringcentral-presence.js`
- Modify: `tests/ringcentral-presence-api.test.mjs`

**Interfaces:**
- Consumes: `resolveCompanyAdmin` from `api/_lib/user-auth.js`; `createRingCentralClient`, `deriveDisplayStatus` from `api/_lib/ringcentral.js`.
- Produces: `export function reconcilePresence(previousRows, liveRows, now)` returning `{ rows: object[], changed: object[] }`; default export `handler(request, response)`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/ringcentral-presence-api.test.mjs`:

```javascript
import { readFileSync } from 'node:fs';
import { reconcilePresence } from '../api/ringcentral-presence.js';

const presenceSource = readFileSync(new URL('../api/ringcentral-presence.js', import.meta.url), 'utf8');
const NOW = new Date('2026-07-23T12:00:00.000Z');

test('an unchanged status keeps its original status_since', () => {
  const previous = [{ extension_id: '201', display_status: 'available', status_since: '2026-07-23T11:00:00.000Z' }];
  const live = [{ extension_id: '201', display_status: 'available' }];

  const { rows, changed } = reconcilePresence(previous, live, NOW);

  assert.equal(rows[0].status_since, '2026-07-23T11:00:00.000Z');
  assert.equal(changed.length, 0, 'nothing changed, so nothing is written');
});

test('a changed status resets status_since to now', () => {
  const previous = [{ extension_id: '201', display_status: 'available', status_since: '2026-07-23T11:00:00.000Z' }];
  const live = [{ extension_id: '201', display_status: 'on_call' }];

  const { rows, changed } = reconcilePresence(previous, live, NOW);

  assert.equal(rows[0].display_status, 'on_call');
  assert.equal(rows[0].status_since, '2026-07-23T12:00:00.000Z');
  assert.equal(changed.length, 1);
});

test('an extension seen for the first time starts its clock now', () => {
  const { rows, changed } = reconcilePresence([], [{ extension_id: '202', display_status: 'busy' }], NOW);

  assert.equal(rows[0].status_since, '2026-07-23T12:00:00.000Z');
  assert.equal(changed.length, 1);
});

test('an extension that disappears from the live payload is dropped', () => {
  const previous = [{ extension_id: '201', display_status: 'available', status_since: '2026-07-23T11:00:00.000Z' }];
  const { rows } = reconcilePresence(previous, [], NOW);
  assert.equal(rows.length, 0);
});

test('the presence endpoint requires authentication and admin rights', () => {
  assert.match(presenceSource, /resolveCompanyAdmin/);
  assert.match(presenceSource, /isAdmin/);
  assert.match(presenceSource, /status\(403\)/);
});

test('the presence endpoint caches upstream calls', () => {
  assert.match(presenceSource, /CACHE_TTL_MS/);
  assert.match(presenceSource, /detailedTelephonyState=true|detailedTelephonyState: 'true'/);
});

test('the presence endpoint never exposes RingCentral credentials to the browser', () => {
  assert.doesNotMatch(presenceSource, /VITE_RINGCENTRAL/);
  assert.doesNotMatch(presenceSource, /access_token/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/ringcentral-presence-api.test.mjs`
Expected: FAIL — `Cannot find module '../api/ringcentral-presence.js'`

- [ ] **Step 3: Write the implementation**

Create `api/ringcentral-presence.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import { setApiHeaders, errorResponse, HttpError } from './_lib/http-security.js';
import { resolveCompanyAdmin } from './_lib/user-auth.js';
import { createRingCentralClient, deriveDisplayStatus } from './_lib/ringcentral.js';

const CACHE_TTL_MS = 10_000;

const env = (name) => process.env[name] || '';
const cache = new Map(); // companyId -> { expiresAt, payload }

function serverClient() {
  return createClient(
    env('SUPABASE_URL') || env('VITE_SUPABASE_URL'),
    env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * RingCentral reports what a status IS, never how long it has been held, so we
 * keep the clock ourselves: carry `status_since` forward while the status is
 * unchanged, reset it the moment it differs. `changed` is what needs writing —
 * an idle team produces zero writes.
 */
export function reconcilePresence(previousRows, liveRows, now = new Date()) {
  const stamp = new Date(now).toISOString();
  const previous = new Map((previousRows || []).map((row) => [String(row.extension_id), row]));
  const rows = [];
  const changed = [];

  for (const live of liveRows || []) {
    const extensionId = String(live.extension_id);
    const before = previous.get(extensionId);
    const unchanged = before && before.display_status === live.display_status;
    const row = {
      extension_id: extensionId,
      display_status: live.display_status,
      status_since: unchanged ? before.status_since : stamp,
    };
    rows.push(row);
    if (!unchanged) changed.push(row);
  }

  return { rows, changed };
}

export default async function handler(request, response) {
  setApiHeaders(response);
  try {
    if (request.method !== 'GET') throw new HttpError(405, 'Method not allowed.');

    const companyId = String(request.query?.company_id || '').trim();
    if (!companyId) throw new HttpError(400, 'company_id is required.');

    const supabaseUrl = env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
    const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');
    if (!supabaseUrl || !serviceKey) throw new HttpError(503, 'Presence is not configured.');

    const caller = await resolveCompanyAdmin(request, { supabaseUrl, serviceKey, companyId });
    if (!caller.isAdmin) return response.status(403).json({ error: 'Only workspace admins can view the live board.' });

    const cached = cache.get(companyId);
    if (cached && cached.expiresAt > Date.now()) return response.status(200).json(cached.payload);

    const client = serverClient();
    const account = await client
      .from('ringcentral_accounts')
      .select('rc_account_id,credential_key')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .maybeSingle();
    if (account.error || !account.data) throw new HttpError(503, 'RingCentral is not connected for this workspace.');

    const jwt = env(account.data.credential_key);
    if (!jwt) throw new HttpError(503, 'RingCentral is not configured.');

    const ringcentral = createRingCentralClient({
      clientId: env('RINGCENTRAL_CLIENT_ID'),
      clientSecret: env('RINGCENTRAL_CLIENT_SECRET'),
      jwt,
      serverUrl: env('RINGCENTRAL_SERVER_URL') || 'https://platform.ringcentral.com',
    });

    const records = await ringcentral.fetchPaged(
      `/restapi/v1.0/account/${account.data.rc_account_id}/presence`,
      { detailedTelephonyState: 'true' },
    );

    const [directory, stored] = await Promise.all([
      client.from('ringcentral_extensions').select('extension_id,extension_number,name').eq('company_id', companyId),
      client.from('ringcentral_presence').select('extension_id,display_status,status_since').eq('company_id', companyId),
    ]);
    const names = new Map((directory.data || []).map((row) => [String(row.extension_id), row]));

    const live = records
      .map((record) => ({
        extension_id: String(record?.extension?.id || ''),
        display_status: deriveDisplayStatus(record),
      }))
      .filter((row) => row.extension_id && names.has(row.extension_id));

    const { rows, changed } = reconcilePresence(stored.data || [], live, new Date());

    if (changed.length) {
      await client.from('ringcentral_presence').upsert(
        changed.map((row) => ({ ...row, company_id: companyId, updated_at: new Date().toISOString() })),
        { onConflict: 'company_id,extension_id' },
      );
    }

    const payload = {
      agents: rows.map((row) => ({
        extension_id: row.extension_id,
        extension_number: names.get(row.extension_id)?.extension_number || '',
        name: names.get(row.extension_id)?.name || '',
        status: row.display_status,
        since: row.status_since,
      })),
      fetched_at: new Date().toISOString(),
    };
    cache.set(companyId, { expiresAt: Date.now() + CACHE_TTL_MS, payload });

    return response.status(200).json(payload);
  } catch (error) {
    return errorResponse(response, error, 'Could not load live status.');
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/ringcentral-presence-api.test.mjs`
Expected: PASS — 13 tests

- [ ] **Step 5: Commit**

```bash
git add api/ringcentral-presence.js tests/ringcentral-presence-api.test.mjs
git commit -m "feat: admin-only RingCentral live presence endpoint"
```

---

### Task 7: Front-end module

**Files:**
- Modify: `src/main.js` (five insertion points, listed below)
- Modify: `src/styles.css`
- Test: `tests/ringcentral-calls-static.test.mjs`

**Interfaces:**
- Consumes: `public.ringcentral_conversation_stats` RPC, `public.ringcentral_sync_state` table, `/api/ringcentral-presence`.
- Produces: `renderCallsPage(route, companyId)`.

Insertion points in `src/main.js`, all located by searching for the quoted anchor text:

| # | Anchor | Change |
| --- | --- | --- |
| 1 | `{ id: 'reporting', label: 'Reporting',` in `WORKSPACE_PLUGIN_REGISTRY` | add a `calls` plugin entry after it |
| 2 | `{ id: 'clock', group: 'Operations', label: 'Clock dashboard',` in `MODULE_REGISTRY` | add a `calls` module entry after it |
| 3 | `{ label: 'Review', ids: ['analytics', 'users', 'calendar'] }` in `NAV_GROUPS` | append `'calls'` to that group |
| 4 | `if (route.section === 'team-workload') return renderTeamWorkloadPage(companyId);` | add the `calls` route above it |

The module reuses the existing `team.view` permission rather than introducing
`calls.view`. A new permission string would need seeding into `role_permissions`
for every role before anyone could open the module, and it buys nothing: the
only access distinction this feature needs is admin-versus-member on the live
board, which is enforced server-side in Task 6. For the same reason
`permissionPluginIds` is left untouched.

- [ ] **Step 1: Write the failing test**

Create `tests/ringcentral-calls-static.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('the calls plugin is registered and maps to the calls module', () => {
  assert.match(main, /\{ id: 'calls', label: 'Calls',[^}]*module_ids: \['calls'\]/);
});

test('the calls module is registered as live with a permission gate', () => {
  assert.match(main, /\{ id: 'calls', group: '[^']+', label: 'Calls'[^}]*status: 'live'[^}]*permission: 'team\.view'/);
});

test('the calls module appears in navigation', () => {
  assert.match(main, /ids: \['analytics', 'users', 'calendar', 'calls'\]/);
});

test('the module reuses an already-granted permission instead of inventing one', () => {
  assert.doesNotMatch(main, /'calls\.view'/, 'calls.view would need seeding into role_permissions first');
});

test('the router dispatches the calls section', () => {
  assert.match(main, /if \(route\.section === 'calls'\) return renderCallsPage\(route, companyId\);/);
});

test('the page reads aggregates through the RPC rather than counting in the browser', () => {
  assert.match(main, /ringcentral_conversation_stats/);
  assert.doesNotMatch(main, /from\('ringcentral_calls'\)[\s\S]{0,200}select\('\*'\)/);
});

test('the live board polls the presence endpoint and stops when the tab is hidden', () => {
  assert.match(main, /\/api\/ringcentral-presence/);
  assert.match(main, /visibilitychange/);
  assert.match(main, /clearInterval/);
});

test('the page states the accuracy limit of the status timer', () => {
  assert.match(main, /measured from when this dashboard first saw the status/i);
});

test('a member with no matching extension is told why the table is empty', () => {
  assert.match(main, /couldn't match you to a RingCentral extension/i);
});

test('the sixty second threshold is labelled in the UI, not recomputed in the browser', () => {
  assert.match(main, /Conversations 60s\+/);
  assert.doesNotMatch(main, /duration_seconds >= 60/);
});

test('the module ships styles', () => {
  assert.match(styles, /\.calls-board/);
  assert.match(styles, /\.calls-status-dot/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/ringcentral-calls-static.test.mjs`
Expected: FAIL — the first assertion fails, `calls` plugin not registered

- [ ] **Step 3: Register the module (insertion points 1–3)**

In `src/main.js`, after the `reporting` entry in `WORKSPACE_PLUGIN_REGISTRY`:

```javascript
  { id: 'calls', label: 'Calls', summary: 'Live phone status and conversation counts from RingCentral.', icon: 'ti-phone', module_ids: ['calls'], permissions: ['team.view'] },
```

After the `clock` entry in `MODULE_REGISTRY`:

```javascript
  { id: 'calls', group: 'Operations', label: 'Calls', icon: 'ti-phone', symbol: 'q-symbol-analytics', status: 'live', permission: 'team.view' },
```

The module reuses the existing `team.view` permission and the existing `q-symbol-analytics` symbol on purpose: adding a new permission would mean seeding `role_permissions` for every role, and adding a new symbol would mean a new sprite. Neither buys anything here. Admin-only behaviour for the live board is enforced server-side in Task 6, not by a permission.

In `NAV_GROUPS`, replace the `Review` group:

```javascript
  { label: 'Review', ids: ['analytics', 'users', 'calendar', 'calls'] },
```

- [ ] **Step 4: Add the route (insertion point 4)**

In `src/main.js`, immediately above `if (route.section === 'team-workload')`:

```javascript
  if (route.section === 'calls') return renderCallsPage(route, companyId);
```

- [ ] **Step 5: Write the page renderer**

Add near `renderTeamWorkloadPage` in `src/main.js`:

```javascript
const CALLS_RANGE_OPTIONS = [
  ['today', 'Today'],
  ['7d', 'Last 7 days'],
  ['30d', 'Last 30 days'],
];
const CALLS_STATUS_LABELS = {
  on_call: 'On call',
  ringing: 'Ringing',
  dnd: 'Do not disturb',
  offline: 'Offline',
  busy: 'Busy',
  available: 'Available',
};
let callsPresenceTimer = null;

function callsRangeBounds(rangeKey) {
  const to = new Date();
  const from = new Date(to);
  if (rangeKey === '7d') from.setDate(from.getDate() - 7);
  else if (rangeKey === '30d') from.setDate(from.getDate() - 30);
  else from.setHours(0, 0, 0, 0);
  return { from: from.toISOString(), to: to.toISOString() };
}

function callsDuration(sinceIso) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(sinceIso).getTime()) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (value) => String(value).padStart(2, '0');
  return hours ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

function callsBoardMarkup(agents) {
  if (!agents.length) return '<p class="calls-empty">No extensions are reporting status yet.</p>';
  return `<table class="calls-board"><tbody>${agents.map((agent) => `
    <tr>
      <td class="calls-board-name">${escapeHtml(agent.name || 'Unknown')}</td>
      <td class="calls-board-ext">${escapeHtml(agent.extension_number || '')}</td>
      <td><span class="calls-status-dot calls-status-${escapeHtml(agent.status)}"></span>${escapeHtml(CALLS_STATUS_LABELS[agent.status] || agent.status)}</td>
      <td class="calls-board-since" data-calls-since="${escapeHtml(agent.since)}">${callsDuration(agent.since)}</td>
    </tr>`).join('')}</tbody></table>`;
}

async function renderCallsPage(route, companyId) {
  const rangeKey = String(route.params?.range || 'today');
  const bounds = callsRangeBounds(rangeKey);

  const [stats, syncState] = await Promise.all([
    supabase.rpc('ringcentral_conversation_stats', { p_company_id: companyId, p_from: bounds.from, p_to: bounds.to }),
    supabase.from('ringcentral_sync_state').select('last_sync_at,consecutive_failures').eq('company_id', companyId).maybeSingle(),
  ]);

  const rows = stats.data || [];
  const stale = Number(syncState.data?.consecutive_failures || 0) >= 3;
  const syncedAt = syncState.data?.last_sync_at;

  const tableMarkup = rows.length
    ? `<table class="calls-table">
        <thead><tr><th>Name</th><th>Ext</th><th>Total calls</th><th>Conversations 60s+</th></tr></thead>
        <tbody>${rows.map((row) => `<tr>
          <td>${escapeHtml(row.extension_name || 'Unknown')}</td>
          <td>${escapeHtml(row.extension_number || '')}</td>
          <td>${Number(row.total_calls || 0)}</td>
          <td class="calls-conversations">${Number(row.conversations || 0)}</td>
        </tr>`).join('')}</tbody>
      </table>`
    : `<p class="calls-empty">No calls in this range. If you expected to see your own, we couldn't match you to a RingCentral extension &mdash; ask your admin to check that your RingCentral email matches your Command Center login.</p>`;

  setPageContent(`
    <section class="calls-page">
      <header class="calls-header">
        <h1>Calls</h1>
        <p class="calls-sync ${stale ? 'is-stale' : ''}">${syncedAt ? `Synced ${escapeHtml(relativeTime(syncedAt))}` : 'Not synced yet'}</p>
      </header>

      <section class="calls-live" data-calls-live>
        <h2>Right now</h2>
        <div data-calls-board><p class="calls-empty">Loading live status&hellip;</p></div>
        <p class="calls-note">Durations are measured from when this dashboard first saw the status, so they are accurate to about 15 seconds.</p>
      </section>

      <section class="calls-conversations-section">
        <h2>Conversations 60s+</h2>
        <nav class="calls-ranges">${CALLS_RANGE_OPTIONS.map(([key, label]) =>
          `<a class="calls-range ${key === rangeKey ? 'is-active' : ''}" href="${appHref(companyPath('calls', { range: key }, companyId))}" data-router>${label}</a>`).join('')}</nav>
        ${tableMarkup}
      </section>
    </section>
  `);

  startCallsPresencePolling(companyId);
}

function stopCallsPresencePolling() {
  if (callsPresenceTimer) clearInterval(callsPresenceTimer);
  callsPresenceTimer = null;
}

function startCallsPresencePolling(companyId) {
  stopCallsPresencePolling();

  const target = document.querySelector('[data-calls-board]');
  if (!target) return;

  const refresh = async () => {
    if (document.hidden || !document.querySelector('[data-calls-board]')) return;
    try {
      const session = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      if (!token) return;
      const response = await fetch(`/api/ringcentral-presence?company_id=${encodeURIComponent(companyId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const live = document.querySelector('[data-calls-board]');
      if (!live) return;
      if (response.status === 403) {
        document.querySelector('[data-calls-live]')?.remove();
        stopCallsPresencePolling();
        return;
      }
      if (!response.ok) {
        live.innerHTML = '<p class="calls-empty">Can\'t reach RingCentral right now.</p>';
        return;
      }
      const payload = await response.json();
      live.innerHTML = callsBoardMarkup(payload.agents || []);
    } catch {
      // A transient failure is not worth destroying the board over; the next
      // tick will either recover or replace it with the unreachable message.
    }
  };

  refresh();
  callsPresenceTimer = setInterval(refresh, 15000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  setInterval(() => {
    document.querySelectorAll('[data-calls-since]').forEach((cell) => {
      cell.textContent = callsDuration(cell.getAttribute('data-calls-since'));
    });
  }, 1000);
}
```

**Before writing this, confirm the real helper names.** This project's browser code uses its own helpers; verify each of `escapeHtml`, `setPageContent`, `appHref`, `companyPath`, `relativeTime`, and the Supabase client binding (`supabase`) actually exists with that name by running:

```bash
grep -nE "function (escapeHtml|setPageContent|appHref|companyPath|relativeTime)\b" src/main.js
```

Substitute the real names where they differ. Do not invent a helper — if `relativeTime` does not exist, find how another module renders a "N minutes ago" string and reuse that.

- [ ] **Step 6: Add styles**

Append to `src/styles.css`:

```css
.calls-page { display: grid; gap: var(--space-6, 24px); }
.calls-header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.calls-sync { font-size: 0.85rem; color: var(--text-muted, #6b7280); }
.calls-sync.is-stale { color: var(--danger, #e0484d); font-weight: 600; }
.calls-board, .calls-table { width: 100%; border-collapse: collapse; }
.calls-board td, .calls-table td, .calls-table th { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border, #e5e7eb); }
.calls-table th { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted, #6b7280); }
.calls-board-name { font-weight: 600; }
.calls-board-ext, .calls-board-since { color: var(--text-muted, #6b7280); font-variant-numeric: tabular-nums; }
.calls-conversations { font-weight: 700; font-variant-numeric: tabular-nums; }
.calls-status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; background: var(--text-muted, #9ca3af); }
.calls-status-on_call { background: #e0484d; }
.calls-status-ringing { background: #ed9a3a; }
.calls-status-available { background: #2e9e6b; }
.calls-status-dnd { background: #8f867b; }
.calls-status-busy { background: #ed9a3a; }
.calls-status-offline { background: #c8cbd0; }
.calls-ranges { display: flex; gap: 8px; margin-bottom: 12px; }
.calls-range { padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border, #e5e7eb); text-decoration: none; }
.calls-range.is-active { background: var(--accent-soft, #eef2ff); border-color: transparent; font-weight: 600; }
.calls-empty { color: var(--text-muted, #6b7280); }
.calls-note { font-size: 0.8rem; color: var(--text-muted, #6b7280); margin-top: 8px; }
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `node --test tests/ringcentral-calls-static.test.mjs`
Expected: PASS — 11 tests

- [ ] **Step 8: Run the full check**

Run: `npm test && npm run build`
Expected: all tests pass; `Bundle budget passed.`

If the bundle budget fails, the added markup pushed `main.js` over its limit. Do not raise the limit — trim the added markup instead.

- [ ] **Step 9: Commit**

```bash
git add src/main.js src/styles.css tests/ringcentral-calls-static.test.mjs
git commit -m "feat: Calls module with live board and conversation counts"
```

---

### Task 8: Project brain, docs, and final verification

**Files:**
- Modify: `.ai/current-state.md`, `.ai/architecture.md`, `.ai/decisions.md`, `.ai/database/overview.md`, `.ai/database/schema.md`, `.ai/database/security.md`, `.ai/manifest.json`
- Create: `docs/ringcentral-setup.md`

**Interfaces:**
- Consumes: everything above.
- Produces: a passing `npm run check`.

- [ ] **Step 1: Write the setup guide**

Create `docs/ringcentral-setup.md` documenting, for the account owner:

1. Creating a **REST API App** in the RingCentral Developer Console, **JWT auth flow**, **private** access, with scopes **Read Call Log**, **Read Accounts**, **Read Presence**.
2. Creating the JWT credential under *your name → Credentials → Create JWT*, restricted to the app's Client ID. **It must be created by a Super Admin** — a JWT inherits the permissions of whoever created it, so one made by a regular user would expose only that person's calls.
3. Graduating the app to Production and using the Production Client ID and Secret.
4. Setting `RINGCENTRAL_CLIENT_ID`, `RINGCENTRAL_CLIENT_SECRET`, `RINGCENTRAL_JWT`, `RINGCENTRAL_SERVER_URL` (`https://platform.ringcentral.com`) in Vercel.
5. Confirming `CRON_SECRET` is already set in Vercel.
6. Confirming the Vercel plan supports the `*/15 * * * *` cron; if not, switching to `0 * * * *` or Supabase `pg_cron`.
7. Applying the migration, then inserting the account row and installing the plugin:

```sql
insert into public.ringcentral_accounts (company_id, rc_account_id, credential_key)
values ('<quest-company-id>', '~', 'RINGCENTRAL_JWT')
on conflict (company_id) do nothing;

insert into public.company_plugins (company_id, plugin_id, status, installed_at, updated_at)
values ('<quest-company-id>', 'calls', 'installed', now(), now())
on conflict (company_id, plugin_id) do update set status = 'installed', updated_at = now();
```

8. Triggering the first sync manually and confirming rows land:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<deployment>/api/ringcentral-sync
```

- [ ] **Step 2: Update the project brain**

Per `.ai/README.md`'s update matrix, this change touches product modules, frontend/API architecture, Supabase schema and cron, and adds durable decisions. Update:

- `.ai/current-state.md` — add the Calls module and its two endpoints to the shipped inventory.
- `.ai/architecture.md` — add `api/ringcentral-*.js` to the source-area table; add an invariant stating RingCentral data is company-scoped, has no `workspace_id`, and is service-role write only.
- `.ai/database/overview.md` — bump the relation, policy, function and cron counts; add a "Phone and call activity" domain row listing the five tables.
- `.ai/database/schema.md` — add the five tables with their columns.
- `.ai/database/security.md` — add the five RLS policies, noting members are matched by `auth.jwt() ->> 'email'`.
- `.ai/decisions.md` — record three decisions with their reasoning: (a) rolling-window upsert instead of `FSync`/`ISync` sync tokens, because the token has a documented 250-record failure mode and the sync endpoint is extension-scoped; (b) email matching instead of an extension-to-member mapping table, because it needs no admin UI and no upkeep; (c) polling the Presence API instead of push subscriptions, because subscriptions need a public webhook and renewal handling that a team this size does not justify.
- `.ai/known-issues.md` — record that presence durations are measured from first observation, restart at zero after a deploy, and are accurate only to the poll interval.
- `.ai/manifest.json` — refresh timestamps and source revisions.

- [ ] **Step 3: Run the full verification**

Run: `npm run check`
Expected: all tests pass, `ai:check` passes, `Bundle budget passed.`

If `ai:check` fails, it will name the missing file, stale migration marker, or broken link. Fix and re-run.

- [ ] **Step 4: Commit**

```bash
git add .ai docs/ringcentral-setup.md
git commit -m "docs: RingCentral setup guide and project brain refresh"
```

---

## Verification limits

There is no headless-screenshot step in this plan. `.ai/operations.md` forbids starting a local server, and this branch has no static component harness. Visual confirmation therefore happens after deployment, not before merge. `npm run check` is the gate.

## Deferred until credentials exist

These cannot be done before the RingCentral app is approved and the environment variables are set. Do them as a follow-up:

1. Trigger `/api/ringcentral-sync` manually and confirm `ringcentral_calls` fills.
2. Reconcile total call counts per extension against the owner's RingCentral Analytics page for one date range. Document any deliberate difference.
3. Confirm a non-admin member sees exactly one row in the conversations table and no live board — the two-user tenancy check.
4. Confirm the Vercel cron actually fires at the configured interval.
