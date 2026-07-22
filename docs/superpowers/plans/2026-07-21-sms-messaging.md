# SMS Messaging (SMSblast) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a logged-in team member text a contact from that contact's card, receive replies back into a per-contact thread, and auto-create a contact when an unknown number texts in — powered by SMSblast.

**Architecture:** Two new server functions under `api/` (send + inbound webhook) follow the existing `defineEndpoint` seam and keep the SMSblast API key server-only. Two new Supabase tables (`sms_numbers`, `sms_messages`) store the number↔company map and message history; RLS mirrors the existing `contacts` policies. The browser reads history through the Supabase client (RLS-scoped) and sends through `/api/sms-send`. Inbound replies route to a company by the destination number, then match/auto-create a contact.

**Tech Stack:** Node 20+ ESM, Vite 7 SPA, Vercel serverless functions, Supabase (PostgREST + Auth + RLS), `node:test` harness.

## Global Constraints

- Node.js 20+, ESM only (`"type": "module"`); no TypeScript.
- **Do NOT add npm dependencies** — the build runs `scripts/check-bundle-budget.mjs`; keep it dependency-free. Use `node:crypto` and `URLSearchParams` only.
- Secrets are **server env vars only**, never `VITE_`-prefixed: `SMSBLAST_API_KEY`, `SMSBLAST_WEBHOOK_TOKEN`.
- New tables are named `sms_numbers` and `sms_messages` — the existing `public.messages` table is the unrelated internal team-chat module; do not touch it.
- `contacts.id`, `companies.id`, and `company_id` columns are **`text`**, not uuid.
- Server functions use the service-role key via the injected `ctx.db` seam and bypass RLS; the browser uses the anon client under RLS.
- Follow the `api/_lib/endpoint.js` `defineEndpoint(config, handler)` pattern for new endpoints. Tests inject fakes via the third `overrides` argument.
- Reuse existing RLS helpers `public.current_company_ids()` and `app_private.is_company_member(text)`, and the `public.set_updated_at()` trigger function.
- Run the whole suite with `npm test` (runs `node --test tests/*.mjs`). Build check: `npm run build`.

---

### Task 1: Supabase migration — `sms_numbers` + `sms_messages`

**Files:**
- Create: `supabase/migrations/20260721100000_sms_messaging.sql`

**Interfaces:**
- Produces tables:
  - `public.sms_numbers(id uuid pk, company_id text fk→companies, from_number text unique, active bool, created_at, updated_at)`
  - `public.sms_messages(id uuid pk, company_id text fk→companies, contact_id text fk→contacts, direction text['outbound'|'inbound'], body text, from_number text, to_number text, status text, provider_message_id text null, error text null, created_by uuid null fk→profiles, created_at timestamptz)`
- Later tasks rely on these exact column names.

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/20260721100000_sms_messaging.sql`:

```sql
-- SMS messaging (SMSblast). Two company-scoped tables:
--   sms_numbers  : which owned SMSblast number belongs to which company
--   sms_messages : per-contact outbound/inbound SMS history
-- RLS mirrors public.contacts: active company members (or profiles carrying the
-- company id) may read. Writes are performed server-side with the service role,
-- so no browser insert/update/delete policies are granted.

create table if not exists public.sms_numbers (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  from_number text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sms_messages (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  contact_id text not null references public.contacts(id) on delete cascade,
  direction text not null,
  body text not null default '',
  from_number text not null default '',
  to_number text not null default '',
  status text not null default 'queued',
  provider_message_id text,
  error text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint sms_messages_direction_check check (direction in ('outbound', 'inbound')),
  constraint sms_messages_status_check check (status in ('queued', 'sent', 'failed', 'received'))
);

create index if not exists sms_numbers_company_idx on public.sms_numbers(company_id, active);
create index if not exists sms_messages_contact_idx on public.sms_messages(contact_id, created_at);
create index if not exists sms_messages_company_idx on public.sms_messages(company_id, created_at);

drop trigger if exists sms_numbers_set_updated_at on public.sms_numbers;
create trigger sms_numbers_set_updated_at
before update on public.sms_numbers
for each row execute function public.set_updated_at();

alter table public.sms_numbers enable row level security;
alter table public.sms_messages enable row level security;

-- Read-only for company members; server-side writes use the service role.
drop policy if exists "sms_numbers members read" on public.sms_numbers;
create policy "sms_numbers members read" on public.sms_numbers
for select to authenticated
using (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));

drop policy if exists "sms_messages members read" on public.sms_messages;
create policy "sms_messages members read" on public.sms_messages
for select to authenticated
using (company_id = any(public.current_company_ids()) or app_private.is_company_member(company_id));
```

- [ ] **Step 2: Verify the SQL parses / applies**

Apply it to the Supabase project (via the Supabase MCP `apply_migration`, the Supabase CLI `supabase db push`, or the SQL editor). Then confirm:

Run (SQL editor or `execute_sql`):
```sql
select table_name from information_schema.tables
where table_schema = 'public' and table_name in ('sms_numbers','sms_messages');
```
Expected: two rows returned (`sms_numbers`, `sms_messages`).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260721100000_sms_messaging.sql
git commit -m "feat(sms): add sms_numbers and sms_messages tables with RLS"
```

---

### Task 2: Phone number normalization helper

**Files:**
- Create: `api/_lib/phone.js`
- Test: `tests/phone.test.mjs`

**Interfaces:**
- Produces: `toE164(raw: string): string | null` — returns `+1XXXXXXXXXX` for US 10-digit or 11-digit (leading 1) input, passes through already-`+`-prefixed international numbers of 8–15 digits, and returns `null` for empty/invalid input.

- [ ] **Step 1: Write the failing test**

Create `tests/phone.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import { toE164 } from '../api/_lib/phone.js';

test('toE164 normalizes US phone formats', () => {
  assert.equal(toE164('928-231-0147'), '+19282310147');
  assert.equal(toE164('(602) 750-5678'), '+16027505678');
  assert.equal(toE164('16027505678'), '+16027505678');
  assert.equal(toE164('+1 855 594 5081'), '+18555945081');
});

test('toE164 returns null for empty or invalid input', () => {
  assert.equal(toE164(''), null);
  assert.equal(toE164(null), null);
  assert.equal(toE164('123'), null);
  assert.equal(toE164('not a phone'), null);
});

test('toE164 passes through valid international + numbers', () => {
  assert.equal(toE164('+639171234567'), '+639171234567');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/phone.test.mjs`
Expected: FAIL — `Cannot find module '../api/_lib/phone.js'`.

- [ ] **Step 3: Write minimal implementation**

Create `api/_lib/phone.js`:

```javascript
// Normalize a raw phone string to E.164. US-first (defaults to +1); already
// international +numbers pass through. Returns null when it cannot be trusted.
export function toE164(raw) {
  const str = String(raw ?? '').trim();
  if (!str) return null;
  const digits = str.replace(/\D/g, '');
  if (!digits) return null;
  if (str.startsWith('+')) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/phone.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/phone.js tests/phone.test.mjs
git commit -m "feat(sms): add E.164 phone normalization helper"
```

---

### Task 3: Widen the endpoint injection seam

The endpoint wrapper currently only injects `db`. `sms-send` also needs to inject a fake user resolver and a fake SMS sender in tests. Spread all overrides onto `ctx` so any dependency can be substituted, keeping `db`'s default.

**Files:**
- Modify: `api/_lib/endpoint.js:149`
- Test: `tests/endpoint-overrides.test.mjs`

**Interfaces:**
- Produces: `ctx` now contains every key passed in the third `overrides` argument (e.g. `ctx.getUser`, `ctx.smsSend`), with `ctx.db` still defaulting to `createAdminFetch()`.

- [ ] **Step 1: Write the failing test**

Create `tests/endpoint-overrides.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import { defineEndpoint } from '../api/_lib/endpoint.js';

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

test('overrides beyond db are forwarded onto ctx', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  const handler = defineEndpoint({ method: 'POST', auth: 'none' }, async (ctx) => ({ got: ctx.marker }));
  const r = res();
  await handler({ method: 'POST', headers: {}, url: '/x' }, r, { marker: 'hello', db: async () => ({ ok: true }) });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { got: 'hello' });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/endpoint-overrides.test.mjs`
Expected: FAIL — `got` is `undefined` (overrides not forwarded).

- [ ] **Step 3: Apply the minimal change**

In `api/_lib/endpoint.js`, replace the `ctx` construction (line ~149):

```javascript
      const ctx = { req, res, query, body, db: overrides.db || createAdminFetch() };
```

with:

```javascript
      const ctx = { req, res, query, body, ...overrides, db: overrides.db || createAdminFetch() };
```

- [ ] **Step 4: Run tests to verify pass (and no regressions)**

Run: `node --test tests/endpoint-overrides.test.mjs`
Expected: PASS.
Run: `npm test`
Expected: all existing tests still PASS.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/endpoint.js tests/endpoint-overrides.test.mjs
git commit -m "refactor(api): forward all endpoint overrides onto ctx"
```

---

### Task 4: User-auth helper (bearer → user → membership)

**Files:**
- Create: `api/_lib/user-auth.js`
- Test: `tests/user-auth.test.mjs`

**Interfaces:**
- Consumes: `ctx.db` (admin fetch) from the endpoint seam.
- Produces:
  - `getUserFromBearer(req, fetchImpl = fetch): Promise<{ id, email } | null>` — resolves the Supabase user from the `Authorization: Bearer <token>` header, or `null`.
  - `isActiveMember(db, companyId, profileId): Promise<boolean>` — true if an `active` row exists in `company_memberships`.

- [ ] **Step 1: Write the failing test**

Create `tests/user-auth.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import { getUserFromBearer, isActiveMember } from '../api/_lib/user-auth.js';

const originalEnv = { ...process.env };
test.afterEach(() => { process.env = { ...originalEnv }; });

test('getUserFromBearer returns null without a token', async () => {
  const user = await getUserFromBearer({ headers: {} }, async () => { throw new Error('should not fetch'); });
  assert.equal(user, null);
});

test('getUserFromBearer resolves the user from Supabase auth', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
  const fakeFetch = async (url, opts) => {
    assert.match(url, /\/auth\/v1\/user$/);
    assert.equal(opts.headers.Authorization, 'Bearer user-token');
    return { ok: true, async json() { return { id: 'u1', email: 'a@b.com' }; } };
  };
  const user = await getUserFromBearer({ headers: { authorization: 'Bearer user-token' } }, fakeFetch);
  assert.deepEqual(user, { id: 'u1', email: 'a@b.com' });
});

test('isActiveMember is true when an active membership row exists', async () => {
  const db = async (path) => {
    assert.match(path, /company_memberships/);
    assert.match(path, /status=eq\.active/);
    return { ok: true, async json() { return [{ role: 'admin' }]; } };
  };
  assert.equal(await isActiveMember(db, 'co1', 'u1'), true);
});

test('isActiveMember is false when no row exists', async () => {
  const db = async () => ({ ok: true, async json() { return []; } });
  assert.equal(await isActiveMember(db, 'co1', 'u1'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/user-auth.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `api/_lib/user-auth.js`:

```javascript
// Authenticate the browser caller: resolve the Supabase user from the bearer
// token, then confirm active company membership. Mirrors the pattern already
// used by api/create-checkout-session.js.

const env = (key) => process.env[key] || '';
const baseUrl = () => env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
const serviceKey = () => env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');

export async function getUserFromBearer(req, fetchImpl = fetch) {
  const token = String(req?.headers?.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const res = await fetchImpl(`${baseUrl()}/auth/v1/user`, {
    headers: { apikey: serviceKey(), Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function isActiveMember(db, companyId, profileId) {
  const path = `/rest/v1/company_memberships?company_id=eq.${encodeURIComponent(companyId)}`
    + `&profile_id=eq.${encodeURIComponent(profileId)}&status=eq.active&select=role`;
  const res = await db(path);
  if (!res.ok) return false;
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/user-auth.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/user-auth.js tests/user-auth.test.mjs
git commit -m "feat(sms): add bearer-token user auth + membership helper"
```

---

### Task 5: SMSblast provider client

**Files:**
- Create: `api/_lib/smsblast.js`
- Test: `tests/smsblast.test.mjs`

**Interfaces:**
- Produces: `sendSms({ apiKey, from, to, message }, fetchImpl = fetch): Promise<{ ok: boolean, status: number, data: object }>` — POSTs form-encoded params to `https://app.smsblast.io/api/v2/sms/send` and returns the parsed result.

- [ ] **Step 1: Write the failing test**

Create `tests/smsblast.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import { sendSms } from '../api/_lib/smsblast.js';

test('sendSms posts form-encoded params to SMSblast', async () => {
  let captured;
  const fakeFetch = async (url, opts) => {
    captured = { url, opts };
    return { ok: true, status: 200, async text() { return JSON.stringify({ id: 'msg_1' }); } };
  };
  const result = await sendSms({ apiKey: 'k', from: '+18555945081', to: '+19282310147', message: 'hi' }, fakeFetch);
  assert.equal(captured.url, 'https://app.smsblast.io/api/v2/sms/send');
  assert.equal(captured.opts.method, 'POST');
  const params = new URLSearchParams(captured.opts.body);
  assert.equal(params.get('apiKey'), 'k');
  assert.equal(params.get('from'), '+18555945081');
  assert.equal(params.get('to'), '+19282310147');
  assert.equal(params.get('message'), 'hi');
  assert.deepEqual(result, { ok: true, status: 200, data: { id: 'msg_1' } });
});

test('sendSms surfaces non-JSON error bodies', async () => {
  const fakeFetch = async () => ({ ok: false, status: 402, async text() { return 'Insufficient balance'; } });
  const result = await sendSms({ apiKey: 'k', from: 'f', to: 't', message: 'm' }, fakeFetch);
  assert.equal(result.ok, false);
  assert.equal(result.status, 402);
  assert.deepEqual(result.data, { raw: 'Insufficient balance' });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/smsblast.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `api/_lib/smsblast.js`:

```javascript
// SMSblast send seam. POST form-encoded params, per the Integrations "Post
// Params" contract: apiKey, from, to, message.
const SEND_URL = 'https://app.smsblast.io/api/v2/sms/send';

export async function sendSms({ apiKey, from, to, message }, fetchImpl = fetch) {
  const params = new URLSearchParams();
  params.set('apiKey', apiKey);
  params.set('from', from);
  params.set('to', to);
  params.set('message', message);

  const res = await fetchImpl(SEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/smsblast.test.mjs`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/smsblast.js tests/smsblast.test.mjs
git commit -m "feat(sms): add SMSblast provider client"
```

> **Note on provider fields:** SMSblast's success-response field for the message id is confirmed against the live API during Task 9's real send. If it is not `id`, adjust the `providerId` extraction in Task 6 accordingly (a one-line change).

---

### Task 6: Send endpoint `api/sms-send.js`

**Files:**
- Create: `api/sms-send.js`
- Test: `tests/sms-send.test.mjs`

**Interfaces:**
- Consumes: `defineEndpoint` (Task 3 seam), `getUserFromBearer`/`isActiveMember` (Task 4), `toE164` (Task 2), `sendSms` (Task 5).
- Request: `POST /api/sms-send` with header `Authorization: Bearer <access_token>` and JSON body `{ contact_id: string, body: string }`.
- Response: `200 { message: <sms_messages row> }` on success; `4xx/5xx { error }` otherwise. A failed provider send returns `502` but the failed row is still persisted.
- Overridable in tests via `{ db, getUser, smsSend }`.

- [ ] **Step 1: Write the failing test**

Create `tests/sms-send.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/sms-send.js';

const originalEnv = { ...process.env };
test.afterEach(() => { process.env = { ...originalEnv }; });

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}
function req(body) {
  return { method: 'POST', url: '/api/sms-send',
    headers: { authorization: 'Bearer t', origin: 'https://app.example.com', host: 'app.example.com' },
    body };
}

function baseEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
  process.env.SMSBLAST_API_KEY = 'k';
  process.env.ALLOWED_ORIGINS = 'https://app.example.com';
}

function makeDb({ contact, number }) {
  const calls = [];
  const db = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET', body: options.body });
    if (path.startsWith('/rest/v1/contacts?')) return { ok: true, async json() { return contact ? [contact] : []; } };
    if (path.startsWith('/rest/v1/company_memberships?')) return { ok: true, async json() { return [{ role: 'admin' }]; } };
    if (path.startsWith('/rest/v1/sms_numbers?')) return { ok: true, async json() { return number ? [number] : []; } };
    if (path === '/rest/v1/sms_messages') return { ok: true, async json() { return [{ id: 'm1', status: 'sent' }]; } };
    return { ok: true, async json() { return []; } };
  };
  return { db, calls };
}

test('happy path: sends via SMSblast and returns the saved row', async () => {
  baseEnv();
  const { db, calls } = makeDb({
    contact: { id: 'c1', company_id: 'co1', phone: '928-231-0147', name: 'Will' },
    number: { from_number: '+18555945081' },
  });
  const r = res();
  await handler(req({ contact_id: 'c1', body: 'Hello there' }), r, {
    db,
    getUser: async () => ({ id: 'u1', email: 'a@b.com' }),
    smsSend: async ({ to, from, message }) => {
      assert.equal(to, '+19282310147'); assert.equal(from, '+18555945081'); assert.equal(message, 'Hello there');
      return { ok: true, status: 200, data: { id: 'prov_1' } };
    },
  });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { message: { id: 'm1', status: 'sent' } });
  const insert = calls.find((c) => c.path === '/rest/v1/sms_messages' && c.method === 'POST');
  assert.ok(insert, 'inserts an sms_messages row');
  const row = JSON.parse(insert.body);
  assert.equal(row.direction, 'outbound');
  assert.equal(row.status, 'sent');
  assert.equal(row.provider_message_id, 'prov_1');
});

test('unauthenticated caller is rejected 401', async () => {
  baseEnv();
  const { db } = makeDb({ contact: { id: 'c1', company_id: 'co1', phone: '928-231-0147' }, number: { from_number: '+1' } });
  const r = res();
  await handler(req({ contact_id: 'c1', body: 'hi' }), r, { db, getUser: async () => null, smsSend: async () => ({ ok: true, status: 200, data: {} }) });
  assert.equal(r.statusCode, 401);
});

test('non-member is rejected 403', async () => {
  baseEnv();
  const db = async (path, options = {}) => {
    if (path.startsWith('/rest/v1/contacts?')) return { ok: true, async json() { return [{ id: 'c1', company_id: 'co1', phone: '928-231-0147' }]; } };
    if (path.startsWith('/rest/v1/company_memberships?')) return { ok: true, async json() { return []; } };
    return { ok: true, async json() { return []; } };
  };
  const r = res();
  await handler(req({ contact_id: 'c1', body: 'hi' }), r, { db, getUser: async () => ({ id: 'u1' }), smsSend: async () => ({ ok: true, status: 200, data: {} }) });
  assert.equal(r.statusCode, 403);
});

test('invalid contact phone is rejected 400', async () => {
  baseEnv();
  const { db } = makeDb({ contact: { id: 'c1', company_id: 'co1', phone: '' }, number: { from_number: '+18555945081' } });
  const r = res();
  await handler(req({ contact_id: 'c1', body: 'hi' }), r, { db, getUser: async () => ({ id: 'u1' }), smsSend: async () => ({ ok: true, status: 200, data: {} }) });
  assert.equal(r.statusCode, 400);
});

test('provider failure persists a failed row and returns 502', async () => {
  baseEnv();
  const { db, calls } = makeDb({
    contact: { id: 'c1', company_id: 'co1', phone: '928-231-0147' },
    number: { from_number: '+18555945081' },
  });
  const r = res();
  await handler(req({ contact_id: 'c1', body: 'hi' }), r, {
    db, getUser: async () => ({ id: 'u1' }),
    smsSend: async () => ({ ok: false, status: 402, data: { error: 'Insufficient balance' } }),
  });
  assert.equal(r.statusCode, 502);
  const insert = calls.find((c) => c.path === '/rest/v1/sms_messages' && c.method === 'POST');
  const row = JSON.parse(insert.body);
  assert.equal(row.status, 'failed');
  assert.equal(row.error, 'Insufficient balance');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/sms-send.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `api/sms-send.js`:

```javascript
import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { getUserFromBearer, isActiveMember } from './_lib/user-auth.js';
import { toE164 } from './_lib/phone.js';
import { sendSms as sendViaSmsblast } from './_lib/smsblast.js';

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'private, no-store',
    notConfiguredStatus: 501,
    notConfiguredMessage: 'SMS is not configured.',
    rateLimit: { namespace: 'sms-send', limit: 60, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const { body, db } = ctx;
    const getUser = ctx.getUser || getUserFromBearer;
    const smsSend = ctx.smsSend || sendViaSmsblast;

    const apiKey = process.env.SMSBLAST_API_KEY;
    if (!apiKey) throw new HttpError(501, 'SMS is not configured.');

    const user = await getUser(ctx.req);
    if (!user?.id) throw new HttpError(401, 'Authentication required.');

    const contactId = String(body.contact_id || '').trim();
    const messageBody = String(body.body || '').trim();
    if (!contactId) throw new HttpError(400, 'contact_id is required.');
    if (!messageBody) throw new HttpError(400, 'Message text is required.');
    if (messageBody.length > 1600) throw new HttpError(400, 'Message is too long.');

    const contactRes = await db(`/rest/v1/contacts?id=eq.${encodeURIComponent(contactId)}&select=id,company_id,phone,name`);
    if (!contactRes.ok) throw new HttpError(500, 'Could not load contact.');
    const contact = (await contactRes.json().catch(() => []))[0];
    if (!contact) throw new HttpError(404, 'Contact not found.');

    if (!(await isActiveMember(db, contact.company_id, user.id))) {
      throw new HttpError(403, 'You do not have access to this contact.');
    }

    const to = toE164(contact.phone);
    if (!to) throw new HttpError(400, 'This contact has no valid mobile number.');

    const numberRes = await db(`/rest/v1/sms_numbers?company_id=eq.${encodeURIComponent(contact.company_id)}&active=eq.true&select=from_number&limit=1`);
    const numberRow = numberRes.ok ? (await numberRes.json().catch(() => []))[0] : null;
    if (!numberRow?.from_number) throw new HttpError(400, 'SMS is not set up for this company yet.');
    const from = numberRow.from_number;

    const result = await smsSend({ apiKey, from, to, message: messageBody });
    const status = result.ok ? 'sent' : 'failed';
    const providerId = result.data?.id || result.data?.messageId || result.data?.message_id || null;
    const errorText = result.ok ? null : (result.data?.error || result.data?.message || result.data?.raw || `SMSblast error ${result.status}`);

    const insertRes = await db('/rest/v1/sms_messages', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        company_id: contact.company_id,
        contact_id: contact.id,
        direction: 'outbound',
        body: messageBody,
        from_number: from,
        to_number: to,
        status,
        provider_message_id: providerId,
        error: errorText,
        created_by: user.id,
      }),
    });
    const saved = insertRes.ok ? (await insertRes.json().catch(() => []))[0] : null;

    if (!result.ok) throw new HttpError(502, errorText || 'Text could not be sent.');
    return { message: saved };
  },
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/sms-send.test.mjs`
Expected: PASS (5 tests).

> If the origin check (`requireOrigin`) makes tests 403, confirm the test request sets `origin`/`host` matching `ALLOWED_ORIGINS` (already done in the test helper). Check `api/_lib/http-security.js` `requireAllowedOrigin` for the exact env var name and align the test env if it differs.

- [ ] **Step 5: Commit**

```bash
git add api/sms-send.js tests/sms-send.test.mjs
git commit -m "feat(sms): add authenticated send endpoint"
```

---

### Task 7: Inbound webhook `api/sms-inbound.js`

**Files:**
- Create: `api/sms-inbound.js`
- Test: `tests/sms-inbound.test.mjs`

**Interfaces:**
- Consumes: `defineEndpoint` seam, `toE164` (Task 2), `node:crypto`.
- Request: `POST /api/sms-inbound?token=<SMSBLAST_WEBHOOK_TOKEN>` with SMSblast's incoming-message body (fields read defensively: `from`/`to`/`message`).
- Behavior: reject bad token (401); route to company by destination number; match a contact by normalized phone, else auto-create one (stage `Leads`); insert an inbound `sms_messages` row. Unknown destination number or unparseable numbers → `200 { ok: true, skipped }` no-op.

- [ ] **Step 1: Write the failing test**

Create `tests/sms-inbound.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/sms-inbound.js';

const originalEnv = { ...process.env };
test.afterEach(() => { process.env = { ...originalEnv }; });

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}
function req(body, token) {
  return { method: 'POST', url: `/api/sms-inbound?token=${encodeURIComponent(token || '')}`,
    headers: { host: 'app.example.com' }, body };
}
function env() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
  process.env.SMSBLAST_WEBHOOK_TOKEN = 'secret-token';
}

test('rejects an invalid webhook token with 401', async () => {
  env();
  const r = res();
  await handler(req({ from: '+19282310147', to: '+18555945081', message: 'hi' }, 'wrong'), r, { db: async () => ({ ok: true, async json() { return []; } }) });
  assert.equal(r.statusCode, 401);
});

test('matches an existing contact and saves an inbound row', async () => {
  env();
  const calls = [];
  const db = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET', body: options.body });
    if (path.startsWith('/rest/v1/sms_numbers?')) return { ok: true, async json() { return [{ company_id: 'co1' }]; } };
    if (path.startsWith('/rest/v1/contacts?')) return { ok: true, async json() { return [{ id: 'c1', phone: '928-231-0147' }]; } };
    return { ok: true, async json() { return [{ id: 'x' }]; } };
  };
  const r = res();
  await handler(req({ from: '+19282310147', to: '+18555945081', message: 'yes please' }, 'secret-token'), r, { db });
  assert.equal(r.statusCode, 200);
  const insert = calls.find((c) => c.path === '/rest/v1/sms_messages' && c.method === 'POST');
  const row = JSON.parse(insert.body);
  assert.equal(row.direction, 'inbound');
  assert.equal(row.status, 'received');
  assert.equal(row.contact_id, 'c1');
  assert.equal(row.company_id, 'co1');
  assert.ok(!calls.some((c) => c.path === '/rest/v1/contacts' && c.method === 'POST'), 'does not create a contact');
});

test('auto-creates a contact when the sender is unknown', async () => {
  env();
  const calls = [];
  const db = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET', body: options.body });
    if (path.startsWith('/rest/v1/sms_numbers?')) return { ok: true, async json() { return [{ company_id: 'co1' }]; } };
    if (path.startsWith('/rest/v1/contacts?')) return { ok: true, async json() { return []; } };
    if (path === '/rest/v1/contacts') return { ok: true, async json() { return [{ id: 'new1' }]; } };
    return { ok: true, async json() { return [{ id: 'x' }]; } };
  };
  const r = res();
  await handler(req({ from: '+14805551234', to: '+18555945081', message: 'new lead' }, 'secret-token'), r, { db });
  assert.equal(r.statusCode, 200);
  const create = calls.find((c) => c.path === '/rest/v1/contacts' && c.method === 'POST');
  assert.ok(create, 'creates a contact');
  const created = JSON.parse(create.body);
  assert.equal(created.company_id, 'co1');
  assert.equal(created.stage, 'Leads');
  assert.equal(created.phone, '+14805551234');
});

test('unknown destination number is a safe no-op', async () => {
  env();
  const db = async (path) => {
    if (path.startsWith('/rest/v1/sms_numbers?')) return { ok: true, async json() { return []; } };
    return { ok: true, async json() { return []; } };
  };
  const r = res();
  await handler(req({ from: '+19282310147', to: '+15550000000', message: 'hi' }, 'secret-token'), r, { db });
  assert.equal(r.statusCode, 200);
  assert.equal(r.json().ok, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/sms-inbound.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `api/sms-inbound.js`:

```javascript
import crypto from 'node:crypto';
import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { toE164 } from './_lib/phone.js';

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    cacheControl: 'private, no-store',
    notConfiguredStatus: 501,
    notConfiguredMessage: 'SMS is not configured.',
    rateLimit: { namespace: 'sms-inbound', limit: 600, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const { body, query, db } = ctx;

    const expected = process.env.SMSBLAST_WEBHOOK_TOKEN;
    if (!expected) throw new HttpError(501, 'SMS inbound is not configured.');
    const provided = query.token || body.token || '';
    if (!safeEqual(provided, expected)) throw new HttpError(401, 'Invalid webhook token.');

    const from = toE164(body.from ?? body.From ?? body.sender ?? '');
    const to = toE164(body.to ?? body.To ?? body.recipient ?? '');
    const text = String(body.message ?? body.text ?? body.body ?? body.Body ?? '').trim();
    const providerId = body.id || body.messageId || body.message_id || null;
    if (!from || !to) return { ok: true, skipped: 'unparseable numbers' };

    const numberRes = await db(`/rest/v1/sms_numbers?from_number=eq.${encodeURIComponent(to)}&active=eq.true&select=company_id&limit=1`);
    const numberRow = numberRes.ok ? (await numberRes.json().catch(() => []))[0] : null;
    if (!numberRow?.company_id) return { ok: true, skipped: 'unknown destination number' };
    const companyId = numberRow.company_id;

    // Match by normalized phone. Contact counts are small; fetch and compare in JS.
    const contactsRes = await db(`/rest/v1/contacts?company_id=eq.${encodeURIComponent(companyId)}&select=id,phone`);
    const contacts = contactsRes.ok ? (await contactsRes.json().catch(() => [])) : [];
    let contact = contacts.find((c) => toE164(c.phone) === from);

    if (!contact) {
      const newId = `contact_${crypto.randomUUID()}`;
      const createRes = await db('/rest/v1/contacts', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ id: newId, company_id: companyId, name: from, phone: from, stage: 'Leads' }),
      });
      contact = createRes.ok ? (await createRes.json().catch(() => []))[0] : { id: newId };
    }

    await db('/rest/v1/sms_messages', {
      method: 'POST',
      body: JSON.stringify({
        company_id: companyId,
        contact_id: contact.id,
        direction: 'inbound',
        body: text,
        from_number: from,
        to_number: to,
        status: 'received',
        provider_message_id: providerId,
      }),
    });

    return { ok: true };
  },
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/sms-inbound.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add api/sms-inbound.js tests/sms-inbound.test.mjs
git commit -m "feat(sms): add inbound webhook with company routing + auto-create"
```

---

### Task 8: Contact card "Messages" tab (frontend)

Add a **Messages** workspace tab to the contact record. The panel renders a thread container, an async loader queries `sms_messages` via the Supabase client (RLS-scoped), and a composer form POSTs to `/api/sms-send`.

**Files:**
- Modify: `src/main.js` — `renderContactRecord` (line ~7282) and `renderContactWorkspacePanel` (line ~7368); add new helper functions near `renderContactWorkspacePanel`.

**Interfaces:**
- Consumes: `POST /api/sms-send` (Task 6), `sms_messages` table (Task 1), the existing `createSupabaseClient()` (line ~3316) and `activeSession()` access token (used at line ~22273).
- Produces: a `Messages` tab value for `state.contactWorkspaceTab`; new functions `loadContactSmsThread(contactId)` and `sendContactSms(contactId, text)`.

- [ ] **Step 1: Add the tab to both tab arrays**

In `renderContactRecord` (line ~7282):

```javascript
  const workspaceTabs = [['Notes', 'ti-note'], ['Email', 'ti-mail'], ['Messages', 'ti-message'], ['Activity', 'ti-activity']];
```

In `renderContactWorkspacePanel` (line ~7369):

```javascript
  const tabs = [['Notes', 'ti-note'], ['Email', 'ti-mail'], ['Messages', 'ti-message'], ['Activity', 'ti-activity']];
```

- [ ] **Step 2: Render the Messages panel when active**

In `renderContactWorkspacePanel`, add a branch that returns the SMS panel markup when `activeWorkspaceTab === 'Messages'`. Insert before the panel's normal return, near the composer logic (~line 7373):

```javascript
  if (activeWorkspaceTab === 'Messages') {
    const to = smsNormalize(contact.phone);
    const disabled = to ? '' : 'disabled';
    const hint = to
      ? `Texting ${h(contact.phone)}`
      : 'Add a valid mobile number before texting.';
    return `
      <div class="sf-card sf-sms-card">
        <div class="sf-card-head"><i class="ti ti-message"></i>Messages</div>
        <div class="sf-sms-thread" data-sms-thread data-contact-id="${h(contact.id)}">
          <div class="sf-sms-loading">Loading messages…</div>
        </div>
        <form class="sf-sms-composer" data-sms-form data-contact-id="${h(contact.id)}" autocomplete="off">
          <input name="body" placeholder="Type a text message…" ${disabled} />
          <button type="submit" ${disabled} title="Send text"><i class="ti ti-send"></i></button>
        </form>
        <div class="sf-sms-hint">${hint}</div>
      </div>
    `;
  }
```

- [ ] **Step 3: Add the client-side thread loader, sender, and a local phone normalizer**

Add near `renderContactWorkspacePanel` (module scope):

```javascript
// Client mirror of api/_lib/phone.js toE164 — the UI only needs to know whether
// a number is textable and to display the thread.
function smsNormalize(raw) {
  const str = String(raw ?? '').trim();
  if (!str) return null;
  const digits = str.replace(/\D/g, '');
  if (!digits) return null;
  if (str.startsWith('+')) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

function renderSmsBubbles(rows) {
  if (!rows.length) return '<div class="sf-sms-empty">No messages yet. Say hello 👋</div>';
  return rows.map((m) => {
    const side = m.direction === 'outbound' ? 'out' : 'in';
    const status = m.status === 'failed' ? ' <span class="sf-sms-failed">· failed</span>' : '';
    const when = new Date(m.created_at).toLocaleString();
    return `<div class="sf-sms-bubble ${side}"><div class="sf-sms-text">${h(m.body)}</div>
      <div class="sf-sms-meta">${h(when)}${status}</div></div>`;
  }).join('');
}

async function loadContactSmsThread(contactId) {
  const container = document.querySelector(`[data-sms-thread][data-contact-id="${cssEscape(contactId)}"]`);
  if (!container) return;
  try {
    const client = createSupabaseClient();
    const { data, error } = await client
      .from('sms_messages')
      .select('id,direction,body,status,created_at')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) throw error;
    container.innerHTML = renderSmsBubbles(data || []);
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    container.innerHTML = '<div class="sf-sms-empty">Could not load messages.</div>';
  }
}

async function sendContactSms(contactId, text) {
  const session = activeSession();
  const response = await fetch('/api/sms-send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({ contact_id: contactId, body: text }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Text could not be sent.');
  return payload.message;
}
```

> **Note:** If a `cssEscape` helper does not already exist in `src/main.js`, replace `cssEscape(contactId)` with a direct attribute filter using the existing DOM query approach in the file, or add `const cssEscape = (s) => String(s).replace(/["\\]/g, '\\$&');`. Grep `src/main.js` for `querySelector(\`[data-` to match the established escaping convention.

- [ ] **Step 4: Wire the loader and the composer submit**

Find where the app runs post-render effects for the contact record and where delegated form submits are handled (grep `data-contact-note-form` and `data-contact-task-form` for the existing pattern). Following that same pattern:

- After the contact record renders with the Messages tab active, call `loadContactSmsThread(contactId)`.
- Add a submit handler for `[data-sms-form]`:

```javascript
// In the delegated submit handler, alongside data-contact-note-form:
const smsForm = event.target.closest('[data-sms-form]');
if (smsForm) {
  event.preventDefault();
  const contactId = smsForm.getAttribute('data-contact-id');
  const input = smsForm.querySelector('input[name="body"]');
  const text = (input.value || '').trim();
  if (!text) return;
  input.disabled = true;
  try {
    await sendContactSms(contactId, text);
    input.value = '';
    await loadContactSmsThread(contactId);
  } catch (err) {
    toast(err.message || 'Text could not be sent.'); // use the app's existing toast/notice helper
  } finally {
    input.disabled = false;
    input.focus();
  }
  return;
}
```

> Match `toast(...)` to the app's existing notification helper (grep for `toast(` / `notify(` / `showToast(`).

- [ ] **Step 5: Add minimal styles**

In `src/styles.css`, add thread/bubble/composer styles consistent with existing `sf-` classes (bubbles: outbound right-aligned/brand color, inbound left-aligned/neutral; a scrollable `.sf-sms-thread { max-height: 360px; overflow-y: auto; }`; composer as a flex row like `.sf-task-add`).

- [ ] **Step 6: Verify in the browser**

Run: `npm run dev`
Then, per the headless-screenshot workflow: open a contact, click the **Messages** tab, confirm the thread area, composer, and hint render. With no real send configured yet, the thread shows the empty state and the input is enabled only when the contact has a valid phone.
Run: `npm run build`
Expected: build succeeds and passes the bundle budget check.

- [ ] **Step 7: Commit**

```bash
git add src/main.js src/styles.css
git commit -m "feat(sms): add Messages tab to the contact card"
```

---

### Task 9: Configuration, seed, and go-live wiring

**Files:**
- Create: `docs/sms-setup.md`
- Modify: `README.md` (Environment Variables table — add the two SMS vars)

**Interfaces:** Consumes all prior tasks. This task turns the code on with real credentials.

- [ ] **Step 1: Document env vars + webhook in `docs/sms-setup.md`**

Create `docs/sms-setup.md`:

```markdown
# SMS (SMSblast) setup

## 1. Generate the API key
SMSblast → Settings → Integrations (APIs) → **Generate API Key**. Copy it.

## 2. Server environment variables (Vercel → Project → Settings → Environment Variables)
Set for **Production** and **Preview** (never prefix with `VITE_`):

| Variable | Value |
| --- | --- |
| `SMSBLAST_API_KEY` | the key from step 1 |
| `SMSBLAST_WEBHOOK_TOKEN` | a long random secret you generate (e.g. `openssl rand -hex 24`) |

Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are already set (used by the send/inbound functions).

## 3. Map the phone number to the company
Run in Supabase SQL editor, replacing `<COMPANY_ID>` with the real company id:

    insert into public.sms_numbers (company_id, from_number, active)
    values ('<COMPANY_ID>', '+18555945081', true)
    on conflict (from_number) do update set company_id = excluded.company_id, active = true;

Find the company id with: `select id, name from public.companies order by created_at;`

## 4. Point SMSblast inbound at the webhook
SMSblast → Integrations → **Webhooks** tab. Set the incoming-message webhook URL to:

    https://<your-app-domain>/api/sms-inbound?token=<SMSBLAST_WEBHOOK_TOKEN>

Method: POST. This is how customer replies reach the app.

## 5. Verify end-to-end
- Open a contact with your own mobile number, go to **Messages**, send a test text. Confirm you receive it and the bubble shows "sent".
- Reply from your phone. Within a few seconds the reply appears in the thread.
- Text the number from a phone that is NOT a contact — confirm a new contact is auto-created under "Leads" with the message attached.
```

- [ ] **Step 2: Add the two vars to the README env table**

In `README.md`, under "Environment Variables", add rows:

```markdown
| `SMSBLAST_API_KEY` | Required for SMS | Server functions | Server-only. SMSblast API key; never `VITE_`-prefixed. |
| `SMSBLAST_WEBHOOK_TOKEN` | Required for SMS replies | Server functions | Server-only shared secret; appended as `?token=` on the inbound webhook URL. |
```

- [ ] **Step 3: Full verification**

Run: `npm test`
Expected: all tests pass.
Run: `npm run build`
Expected: build + bundle budget pass.

- [ ] **Step 4: Commit**

```bash
git add docs/sms-setup.md README.md
git commit -m "docs(sms): setup, env vars, and go-live wiring"
```

---

## Self-Review

**Spec coverage:**
- Send from contact card → Tasks 6, 8. ✓
- Two-way / receive replies → Task 7 (inbound) + Task 8 (thread display). ✓
- Auto-create contact on unknown inbound → Task 7. ✓
- One-number-per-company routing → Task 1 (`sms_numbers`), Task 6 (lookup), Task 7 (route by `to`). ✓
- Saved history → Task 1 (`sms_messages`), written by Tasks 6/7, read by Task 8. ✓
- API key server-only → Tasks 6/9 (env var, never `VITE_`). ✓
- Phone normalization → Task 2 (server) + Task 8 (client mirror). ✓
- Error handling (no from-number, invalid phone, provider failure, bad token, unknown destination) → Tasks 6/7 tests. ✓
- Testing per spec → Tasks 2–7 unit tests; Task 8/9 manual. ✓
- Phasing: this plan is Phase 1 only (bulk/automation/central-inbox explicitly out of scope). ✓

**Placeholder scan:** No TBD/TODO. The two `> Note` callouts (SMSblast id field, `cssEscape`/`toast` helper names) are explicit "confirm against the real thing" instructions with concrete fallbacks, not deferred work.

**Type consistency:** `toE164` (server) / `smsNormalize` (client) used consistently; `sendSms({apiKey,from,to,message})` signature matches Tasks 5↔6; `sms_messages` columns match Tasks 1↔6↔7↔8; `getUser`/`smsSend`/`db` override keys match Tasks 3↔6.

**Known simplification (documented, acceptable for Phase 1):** inbound contact matching fetches company contacts and compares in JS rather than filtering in SQL — fine at current contact volumes; revisit with a normalized phone column if a company's contact list grows large.
```
