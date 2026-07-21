# API Endpoint Seam — Land & Finish Adoption

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the `api/_lib/` endpoint seam on `main` on its own branch, then migrate the three public-form endpoints and `create-checkout-session` onto it, deleting the copy-pasted Supabase helpers that have already diverged from it.

**Architecture:** `defineEndpoint(config, handler)` is a deep module: the config plus the handler's unique logic is the whole interface, and the implementation owns method check, security headers, rate limit, body cap, config guard, auth dispatch, response writing and error handling. Handlers receive `ctx = { req, res, query, body, session?, db }` and return a plain object (→ 200 JSON), a `jsonResponse(status, body)`, a `fileResponse(...)`, or throw `HttpError`. `ctx.db` is the injection seam: production passes the real admin fetch, tests pass a fake. Phase 2 adds one sibling module, `_lib/supabase-storage.js`, for the two endpoints that need Supabase Storage (signed URLs) rather than PostgREST.

**Tech Stack:** Node 20+ ESM, Vercel serverless functions, Supabase (PostgREST + Storage), `node --test`, `@supabase/supabase-js`.

## Global Constraints

- Node's built-in test runner only: `npm test` runs `node --test tests/*.mjs`. No new test dependencies.
- All API code is ESM (`import`/`export`), no CommonJS.
- Responses are written Node-native (`statusCode` / `setHeader` / `end`) — **never** Vercel's `res.status().json()` sugar — so a plain mock response object is enough to test with.
- `defineEndpoint` is the single writer of the response. Handlers never call `res.end()` themselves.
- **Preserve existing behaviour exactly** except where this plan says otherwise. Body caps and "not configured" status codes are security-relevant and are pinned per endpoint below.
- Body caps, verbatim per endpoint: `public-form-submit` = `1024 * 1024`; `public-form-file-upload` = `16 * 1024`; `public-form-file-url` = `16 * 1024`; `create-checkout-session` = `16 * 1024`.
- "Not configured" responses, verbatim: `public-form-submit` → 500 `'Public forms are not configured.'`; both file endpoints → 500 `'Public form files are not configured.'`; `create-checkout-session` → 501 `'Billing is not configured yet.'` (gated on **Stripe** env vars, so it stays inside the handler).
- Never commit to `main` directly. Never force-push. Never use `git rebase -i` or any interactive git command.
- Do not touch `api/stripe-webhook.js`, `api/address-suggestions.js`, or `api/recycle-bin-purge.js`. They are deliberately out of scope.
- Do not touch `src/main.js`.

## Context: why Phase 1 exists

`api/_lib/endpoint.js` **does not exist on `main`.** It exists only on `feat/sms-messaging`, bundled there by commit `3b25f08`, whose message states: *"Not for main — these refactor files should land via their own branch."*

The branch named `refactor/api-endpoint-module` is misnamed: it contains the SMS feature work and **imports `defineEndpoint` without shipping `endpoint.js`**, so it cannot build standalone. Leave that branch alone; do not build on it and do not delete it.

Phase 1 creates the branch that commit message asked for. Phase 2 cannot start until Phase 1 is merged.

## File Structure

**Phase 1 — moved from `feat/sms-messaging` to a branch off `main`, unchanged:**

| File | Responsibility |
|---|---|
| `api/_lib/endpoint.js` | The seam. `defineEndpoint`, `jsonResponse`, `fileResponse`. |
| `api/_lib/supabase-admin.js` | Base-URL + service-key header logic; `createAdminFetch()`. |
| `api/_lib/portal-session.js` | Portal Session sign/verify (HMAC-SHA256 + `exp`). |
| `api/_lib/user-auth.js` | `getUserFromBearer`, `isActiveMember`. Generic, not SMS-specific; Phase 2 needs it. |
| `api/_lib/http-security.js` | Modified: `HttpError` gains an optional third `body` argument. |
| `api/client-portal-*.js` (6 files) | Already migrated onto the seam. |
| `api/public-form-open.js` | Already migrated onto the seam. |
| `CONTEXT.md` | Domain glossary + the seam's architecture section. |
| `tests/endpoint-overrides.test.mjs` | Executable: proves `overrides`/`ctx.db` forwarding. |
| `tests/client-portal-api.test.mjs` | Executable: invokes 4 client-portal handlers with a fake `db`. |
| `tests/user-auth.test.mjs` | Executable: self-contained unit tests. |
| `tests/client-portal-plugin-static.test.mjs` | Updated by `3b25f08`; moves with its subject. |

**Explicitly excluded from Phase 1** (they are the SMS feature, not the seam): `api/_lib/phone.js`, `api/_lib/smsblast.js`, `api/sms-inbound.js`, `api/sms-send.js`, `tests/phone.test.mjs`, `tests/smsblast.test.mjs`, `tests/sms-inbound.test.mjs`, `tests/sms-send.test.mjs`, `tests/contact-workspace-video-static.test.mjs`, `quest-hq-test-cases.csv`, everything under `docs/`.

**Phase 2 — new and changed:**

| File | Change |
|---|---|
| `api/_lib/supabase-storage.js` | **Create.** `createStorageClient()` — a `@supabase/supabase-js` client built from `_lib/supabase-admin.js` env logic. Used only by the two file endpoints, overridable per handler via `ctx.storage`. |
| `api/_lib/form-files.js` | **Create.** `FORM_FILE_BUCKET` constant, currently declared separately in three files. |
| `api/public-form-submit.js` | Migrate. Delete its `env`/`baseUrl`/`serviceKey`/`isSupabaseSecretKey`/`supabaseHeaders`/`supabaseGet`/`supabaseInsert` copies. |
| `api/public-form-file-upload.js` | Migrate. Delete the same copies + local `serverClient()`. |
| `api/public-form-file-url.js` | Migrate. Delete the same copies + local `serverClient()`. Keep `supabaseGetAsUser` local (one caller — a hypothetical seam, not a real one) but source env from `_lib/supabase-admin.js`. |
| `api/create-checkout-session.js` | Migrate. Delete its `json`, `supabaseFetch`, `getUserFromBearer` copies. Add a rate limit. Keep the `checkoutIdempotencyKey` export. |
| `api/_lib/http-security.js` | Delete `errorResponse` — zero callers after migration. |
| `tests/public-api-security-static.test.mjs` | Replace grep assertions with executable handler tests. |
| `tests/forms-file-storage-static.test.mjs` | Update the two assertions that reference moved constants. |
| `CONTEXT.md` | Document `supabase-storage.js` in the architecture section. |

---

# Phase 1 — Land the seam on `main`

### Task 1: Create the seam branch with `_lib` and CONTEXT.md

**Files:**
- Create (from `feat/sms-messaging`): `api/_lib/endpoint.js`, `api/_lib/supabase-admin.js`, `api/_lib/portal-session.js`, `api/_lib/user-auth.js`, `CONTEXT.md`
- Modify (from `feat/sms-messaging`): `api/_lib/http-security.js`
- Test (from `feat/sms-messaging`): `tests/endpoint-overrides.test.mjs`, `tests/user-auth.test.mjs`

**Interfaces:**
- Produces: `defineEndpoint(config, handler)`, `jsonResponse(status, body)`, `fileResponse({buffer, contentType, fileName, cacheControl})`, `FileResponse`, `JsonResponse` from `api/_lib/endpoint.js`. `createAdminFetch()`, `isSupabaseConfigured()`, `supabaseBaseUrl()`, `supabaseServiceKey()`, `isSupabaseSecretKey()`, `supabaseHeaders(hasBody)` from `api/_lib/supabase-admin.js`. `signPortalSession(payload)`, `verifyPortalSession(token)` from `api/_lib/portal-session.js`. `getUserFromBearer(req, fetchImpl?)`, `isActiveMember(db, companyId, profileId)` from `api/_lib/user-auth.js`. `HttpError(statusCode, message, body?)` from `api/_lib/http-security.js`.

- [ ] **Step 1: Confirm the working tree is clean and note the current branch**

```bash
git status --short
git branch --show-current
```

Expected: no output from `git status --short`. If anything is listed, stop and ask before continuing.

- [ ] **Step 2: Create the branch off `main`**

```bash
git checkout main
git checkout -b refactor/api-endpoint-seam
```

Expected: `Switched to a new branch 'refactor/api-endpoint-seam'`

- [ ] **Step 3: Bring the `_lib` seam files and CONTEXT.md across**

```bash
git checkout feat/sms-messaging -- \
  api/_lib/endpoint.js \
  api/_lib/supabase-admin.js \
  api/_lib/portal-session.js \
  api/_lib/user-auth.js \
  api/_lib/http-security.js \
  CONTEXT.md \
  tests/endpoint-overrides.test.mjs \
  tests/user-auth.test.mjs
```

Expected: no output (success).

- [ ] **Step 4: Verify nothing SMS-related came across**

```bash
git status --short
ls api/_lib/
```

Expected from `ls api/_lib/`: exactly `endpoint.js  http-security.js  portal-session.js  rate-limit.js  supabase-admin.js  user-auth.js`.
There must be **no** `phone.js` and **no** `smsblast.js`. If either is present, run `git checkout main -- api/_lib/phone.js api/_lib/smsblast.js` and re-check.

- [ ] **Step 5: Run the tests**

```bash
npm test
```

Expected: PASS. `tests/endpoint-overrides.test.mjs` and `tests/user-auth.test.mjs` both run and pass. Every pre-existing test still passes — nothing on `main` imported these files, so nothing can have broken.

- [ ] **Step 6: Commit**

```bash
git add api/_lib/endpoint.js api/_lib/supabase-admin.js api/_lib/portal-session.js \
        api/_lib/user-auth.js api/_lib/http-security.js CONTEXT.md \
        tests/endpoint-overrides.test.mjs tests/user-auth.test.mjs
git commit -m "$(cat <<'EOF'
refactor(api): add the endpoint module seam

defineEndpoint(config, handler) owns the request pipeline every Vercel
function repeats: method check, security headers, rate limit, body cap,
config guard, auth dispatch, single-writer response, error handling.
ctx.db is the injection seam — real admin fetch in production, a fake in
tests.

Lands the _lib files on their own branch as commit 3b25f08 intended.
No endpoint uses them yet; that is the next commit.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Move the seven already-migrated endpoints onto the branch

**Files:**
- Modify (from `feat/sms-messaging`): `api/client-portal-annotations.js`, `api/client-portal-document-file.js`, `api/client-portal-document-status.js`, `api/client-portal-document-url.js`, `api/client-portal-export-event.js`, `api/client-portal-open.js`, `api/public-form-open.js`
- Test (from `feat/sms-messaging`): `tests/client-portal-api.test.mjs`, `tests/client-portal-plugin-static.test.mjs`

**Interfaces:**
- Consumes: `defineEndpoint`, `jsonResponse`, `fileResponse` from Task 1; `signPortalSession`/`verifyPortalSession` from Task 1.
- Produces: seven default-exported endpoint handlers, each callable as `handler(req, res, overrides)`.

- [ ] **Step 1: Bring the seven endpoints and their tests across**

```bash
git checkout feat/sms-messaging -- \
  api/client-portal-annotations.js \
  api/client-portal-document-file.js \
  api/client-portal-document-status.js \
  api/client-portal-document-url.js \
  api/client-portal-export-event.js \
  api/client-portal-open.js \
  api/public-form-open.js \
  tests/client-portal-api.test.mjs \
  tests/client-portal-plugin-static.test.mjs
```

Expected: no output (success).

- [ ] **Step 2: Verify no endpoint on this branch imports an SMS module**

```bash
grep -rn "smsblast\|_lib/phone" api/ || echo "CLEAN"
```

Expected: `CLEAN`

- [ ] **Step 3: Run the tests**

```bash
npm test
```

Expected: PASS, including `tests/client-portal-api.test.mjs` (invokes four client-portal handlers with a fake `db` and a real signed Portal Session).
If `client-portal-plugin-static.test.mjs` fails, read the failing assertion — it greps `src/main.js`, which this branch has not modified, so a failure means the wrong version of that test came across. Restore it with `git checkout main -- tests/client-portal-plugin-static.test.mjs` and re-run.

- [ ] **Step 4: Commit**

```bash
git add api/ tests/
git commit -m "$(cat <<'EOF'
refactor(api): move client portal and form-open endpoints onto the seam

Seven handlers keep only their unique logic; the request pipeline moves
into defineEndpoint. tests/client-portal-api.test.mjs invokes four of
them with a fake ctx.db, replacing source-text assertions with executed
behaviour.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Merge the seam to `main`

**Files:** none changed — this task is integration only.

- [ ] **Step 1: Confirm the full diff against `main` is seam-only**

```bash
git diff --stat main refactor/api-endpoint-seam
```

Expected: exactly these paths, and nothing else — `CONTEXT.md`, `api/_lib/endpoint.js`, `api/_lib/http-security.js`, `api/_lib/portal-session.js`, `api/_lib/supabase-admin.js`, `api/_lib/user-auth.js`, the six `api/client-portal-*.js`, `api/public-form-open.js`, `tests/client-portal-api.test.mjs`, `tests/client-portal-plugin-static.test.mjs`, `tests/endpoint-overrides.test.mjs`, `tests/user-auth.test.mjs`.
If any `sms`, `phone`, `smsblast`, `docs/` or `.csv` path appears, stop — the branch is contaminated.

- [ ] **Step 2: Run the full suite one more time**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 3: Push the branch**

```bash
git push -u origin refactor/api-endpoint-seam
```

- [ ] **Step 4: Open the pull request**

```bash
gh pr create --base main --title "refactor(api): land the endpoint module seam" --body "$(cat <<'EOF'
Lands `api/_lib/endpoint.js` and its siblings on `main` via their own
branch, as commit 3b25f08 on `feat/sms-messaging` said they should.

**What this is:** `defineEndpoint(config, handler)` — a deep module owning
the request pipeline every Vercel function was repeating. Seven endpoints
(six client-portal + public-form-open) move onto it. `ctx.db` is the
injection seam, so handlers become testable with a fake.

**What this is not:** no SMS code. `feat/sms-messaging` should rebase onto
`main` after this merges and drop its bundled copy (3b25f08).

**Not yet migrated:** the three public-form endpoints and
create-checkout-session — that is the follow-on branch. stripe-webhook,
address-suggestions and recycle-bin-purge stay off the seam for now: they
need raw-body access, no-Supabase operation, and a cron-secret auth mode
respectively.

**Verification:** `npm test` passes. `tests/client-portal-api.test.mjs`
and `tests/endpoint-overrides.test.mjs` execute the handlers rather than
grepping them.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: STOP — hand back to the user**

Do not merge the pull request yourself. Report the PR URL and wait.
After it is merged, `feat/sms-messaging` should be rebased onto the new `main` and commit `3b25f08` dropped, but that is not part of this plan.

---

# Phase 2 — Migrate the remaining four endpoints

**Do not start Phase 2 until Phase 1 is merged to `main`.**

- [ ] **Phase 2 setup**

```bash
git checkout main
git pull
git checkout -b refactor/api-endpoint-adoption
ls api/_lib/endpoint.js
```

Expected: `api/_lib/endpoint.js` exists. If it does not, Phase 1 has not merged — stop.

---

### Task 4: The Supabase Storage module

**Files:**
- Create: `api/_lib/supabase-storage.js`
- Create: `api/_lib/form-files.js`
- Test: `tests/supabase-storage.test.mjs`

**Interfaces:**
- Consumes: `supabaseBaseUrl()`, `supabaseServiceKey()` from `api/_lib/supabase-admin.js` (Task 1).
- Produces: `createStorageClient()` from `api/_lib/supabase-storage.js` — returns a `@supabase/supabase-js` client configured for server use. `FORM_FILE_BUCKET` (string `'quest-form-response-files'`) and `FORM_FILE_MAX_BYTES` (number `15 * 1024 * 1024`) from `api/_lib/form-files.js`.

- [ ] **Step 1: Write the failing test**

Create `tests/supabase-storage.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import { createStorageClient } from '../api/_lib/supabase-storage.js';
import { FORM_FILE_BUCKET, FORM_FILE_MAX_BYTES } from '../api/_lib/form-files.js';

const originalEnv = { ...process.env };
test.afterEach(() => { process.env = { ...originalEnv }; });

test('createStorageClient builds a client from the shared admin env logic', () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc-key';
  const client = createStorageClient();
  assert.equal(typeof client.storage.from, 'function');
});

test('createStorageClient falls back to VITE_ and SECRET_ env names', () => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.VITE_SUPABASE_URL = 'https://fallback.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_key';
  const client = createStorageClient();
  assert.equal(typeof client.storage.from, 'function');
});

test('form file constants are shared, not re-declared', () => {
  assert.equal(FORM_FILE_BUCKET, 'quest-form-response-files');
  assert.equal(FORM_FILE_MAX_BYTES, 15 * 1024 * 1024);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/supabase-storage.test.mjs`
Expected: FAIL — `Cannot find module '.../api/_lib/supabase-storage.js'`

- [ ] **Step 3: Write the implementation**

Create `api/_lib/form-files.js`:

```javascript
// Public form file constants, shared by the submit, upload and signed-URL
// endpoints so the bucket name cannot drift between them.

export const FORM_FILE_BUCKET = 'quest-form-response-files';
export const FORM_FILE_MAX_BYTES = 15 * 1024 * 1024;

export const ALLOWED_PUBLIC_FORM_FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);
```

Create `api/_lib/supabase-storage.js`:

```javascript
// Supabase Storage seam. `ctx.db` is a raw PostgREST fetch and cannot mint
// signed upload/download URLs, so the two public-form file endpoints need a
// real supabase-js client. Base URL and key come from _lib/supabase-admin.js
// so the env resolution can never drift from the admin fetch.
//
// Handlers use `ctx.storage || createStorageClient()`, matching the
// ctx.smsSend idiom: a real default in production, a fake in tests.

import { createClient } from '@supabase/supabase-js';
import { supabaseBaseUrl, supabaseServiceKey } from './supabase-admin.js';

export function createStorageClient() {
  return createClient(supabaseBaseUrl(), supabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/supabase-storage.test.mjs`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/supabase-storage.js api/_lib/form-files.js tests/supabase-storage.test.mjs
git commit -m "$(cat <<'EOF'
refactor(api): add the Supabase Storage seam and shared form-file constants

createStorageClient() sources its base URL and key from
_lib/supabase-admin.js, so the storage client and the admin fetch can
never disagree about which env var wins.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Migrate `public-form-submit`

**Files:**
- Modify: `api/public-form-submit.js`
- Test: `tests/public-form-submit.test.mjs` (create)

**Interfaces:**
- Consumes: `defineEndpoint` (Task 1), `HttpError` (Task 1), `FORM_FILE_BUCKET` (Task 4).
- Produces: default-exported handler `(req, res, overrides) => Promise<void>`. Test overrides: `{ db }`.

**Behaviour to preserve exactly:** body cap `1024 * 1024`; not-configured → 500 `'Public forms are not configured.'`; rate limit `{ namespace: 'public-form-submit', limit: 12, windowMs: 10 * 60 * 1000 }`; honeypot `body.website` non-empty → 200 `{ response: null }`; `started_at` less than 1500 ms ago → 429; the `cleanAnswers`/`cleanAnswerValue` validators are copied across **unchanged**.

- [ ] **Step 1: Write the failing test**

Create `tests/public-form-submit.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/public-form-submit.js';
import { resetRateLimits } from '../api/_lib/rate-limit.js';

const originalEnv = { ...process.env };
test.beforeEach(() => { resetRateLimits(); });
test.afterEach(() => { process.env = { ...originalEnv }; });

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

function req(body, extraHeaders = {}) {
  return {
    method: 'POST',
    url: '/api/public-form-submit',
    headers: { host: 'app.example.com', ...extraHeaders },
    body,
  };
}

function baseEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
}

const FORM = {
  id: 'form-1',
  company_id: 'co1',
  title: 'Contact us',
  status: 'Published',
  collect_email: true,
  questions: [{ id: 'q1', type: 'text', required: true }],
};

function makeDb({ form = FORM } = {}) {
  const calls = [];
  const db = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET', body: options.body });
    if (path.startsWith('/rest/v1/forms?')) {
      return { ok: true, async json() { return form ? [form] : []; } };
    }
    if (path === '/rest/v1/form_responses') {
      return { ok: true, async json() { return [{ id: 'response-1' }]; } };
    }
    return { ok: true, async json() { return []; } };
  };
  return { db, calls };
}

test('happy path: stores the response and returns it', async () => {
  baseEnv();
  const { db, calls } = makeDb();
  const r = res();
  await handler(req({ form_id: 'form-1', answers: { q1: 'hello' } }), r, { db });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { response: { id: 'response-1' } });
  const insert = calls.find((call) => call.path === '/rest/v1/form_responses');
  assert.ok(insert, 'expected an insert into form_responses');
  assert.equal(JSON.parse(insert.body).company_id, 'co1');
});

test('rejects a disallowed origin before doing any work', async () => {
  baseEnv();
  const { db, calls } = makeDb();
  const r = res();
  await handler(req({ form_id: 'form-1' }, { origin: 'https://evil.example' }), r, { db });
  assert.equal(r.statusCode, 403);
  assert.equal(r.json().error, 'Origin is not allowed.');
  assert.equal(calls.length, 0, 'no Supabase call should happen for a bad origin');
});

test('honeypot submissions are silently accepted and never stored', async () => {
  baseEnv();
  const { db, calls } = makeDb();
  const r = res();
  await handler(req({ form_id: 'form-1', website: 'spam' }), r, { db });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { response: null });
  assert.equal(calls.length, 0);
});

test('submissions faster than 1500ms are rejected', async () => {
  baseEnv();
  const { db } = makeDb();
  const r = res();
  await handler(req({ form_id: 'form-1', started_at: new Date().toISOString() }), r, { db });
  assert.equal(r.statusCode, 429);
});

test('an answer referencing an unknown question is rejected', async () => {
  baseEnv();
  const { db } = makeDb();
  const r = res();
  await handler(req({ form_id: 'form-1', answers: { nope: 'x' } }), r, { db });
  assert.equal(r.statusCode, 400);
  assert.equal(r.json().error, 'Answer references an unknown question.');
});

test('a file answer pointing outside the form prefix is rejected', async () => {
  baseEnv();
  const form = { ...FORM, questions: [{ id: 'q1', type: 'file', required: false }] };
  const { db } = makeDb({ form });
  const r = res();
  await handler(req({
    form_id: 'form-1',
    answers: { q1: { kind: 'file', bucket_id: 'quest-form-response-files', object_path: 'other-co/other-form/q1/x.pdf' } },
  }), r, { db });
  assert.equal(r.statusCode, 400);
  assert.equal(r.json().error, 'Invalid form file reference.');
});

test('an unpublished or missing form returns 404', async () => {
  baseEnv();
  const { db } = makeDb({ form: null });
  const r = res();
  await handler(req({ form_id: 'nope', answers: {} }), r, { db });
  assert.equal(r.statusCode, 404);
});

test('returns 500 when Supabase is not configured', async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  const r = res();
  await handler(req({ form_id: 'form-1' }), r, {});
  assert.equal(r.statusCode, 500);
  assert.equal(r.json().error, 'Public forms are not configured.');
});

test('GET is not allowed', async () => {
  baseEnv();
  const r = res();
  await handler({ method: 'GET', url: '/api/public-form-submit', headers: {} }, r, {});
  assert.equal(r.statusCode, 405);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/public-form-submit.test.mjs`
Expected: FAIL. The current handler calls `res.status(...)`, which the mock does not implement, so tests error with `res.status is not a function`.

- [ ] **Step 3: Rewrite the handler**

Replace the whole of `api/public-form-submit.js` with:

```javascript
import { randomUUID } from 'node:crypto';
import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { FORM_FILE_BUCKET } from './_lib/form-files.js';

function cleanAnswerValue(value, { form, question }) {
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => cleanAnswerValue(item, { form, question }));
  if (value && typeof value === 'object') {
    const expectedPrefix = `${form.company_id}/${form.id}/${question.id}/`;
    const bucketId = String(value.bucket_id || '').slice(0, 120);
    const objectPath = String(value.object_path || '').slice(0, 800);
    if (value.kind === 'file' && (question.type !== 'file' || bucketId !== FORM_FILE_BUCKET || !objectPath.startsWith(expectedPrefix))) {
      throw new HttpError(400, 'Invalid form file reference.');
    }
    const file = {
      kind: value.kind === 'file' ? 'file' : undefined,
      name: String(value.name || '').slice(0, 240),
      size: Number(value.size || 0) || 0,
      type: String(value.type || '').slice(0, 120),
      lastModified: Number(value.lastModified || 0) || 0,
      data_url: String(value.data_url || '').length <= 500_000 ? String(value.data_url || '') : '',
      bucket_id: bucketId,
      object_path: objectPath,
      uploaded_at: String(value.uploaded_at || '').slice(0, 80),
    };
    return Object.fromEntries(Object.entries(file).filter(([, item]) => item !== undefined && item !== ''));
  }
  return String(value || '').slice(0, 10000);
}

function cleanAnswers(input, form) {
  const source = input && typeof input === 'object' ? input : {};
  const allowedQuestions = new Map((Array.isArray(form.questions) ? form.questions : []).map((question) => [String(question.id), question]));
  if (Object.keys(source).length > 200) throw new HttpError(400, 'Too many answers.');
  const answers = {};
  for (const [rawKey, value] of Object.entries(source)) {
    const key = String(rawKey).slice(0, 160);
    const question = allowedQuestions.get(key);
    if (!question) throw new HttpError(400, 'Answer references an unknown question.');
    answers[key] = cleanAnswerValue(value, { form, question });
  }
  for (const question of allowedQuestions.values()) {
    const value = answers[String(question.id)];
    if (question.required && (value === undefined || value === '' || (Array.isArray(value) && !value.length))) {
      throw new HttpError(400, 'A required answer is missing.');
    }
  }
  return answers;
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'no-store',
    notConfiguredStatus: 500,
    notConfiguredMessage: 'Public forms are not configured.',
    bodyLimitBytes: 1024 * 1024,
    rateLimit: { namespace: 'public-form-submit', limit: 12, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const { body, db } = ctx;

    if (String(body.website || '').trim()) return { response: null };
    const startedAt = Date.parse(String(body.started_at || ''));
    if (Number.isFinite(startedAt) && Date.now() - startedAt < 1500) {
      throw new HttpError(429, 'Please wait a moment before submitting.');
    }

    const formId = String(body.form_id || '').trim();
    if (!formId) throw new HttpError(400, 'Missing form id.');

    const formsRes = await db(`/rest/v1/forms?id=eq.${encodeURIComponent(formId)}&status=eq.Published&select=id,company_id,title,status,collect_email,questions`);
    if (!formsRes.ok) throw new HttpError(500, 'Could not submit form response.');
    const form = (await formsRes.json().catch(() => []))[0];
    if (!form) throw new HttpError(404, 'Form not found or not published.');

    const answers = cleanAnswers(body.answers, form);

    const insertRes = await db('/rest/v1/form_responses', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        id: `response-${randomUUID()}`,
        company_id: form.company_id,
        form_id: form.id,
        submitted_by: String(body.submitted_by || body.submitter_email || 'Public respondent').slice(0, 240),
        submitter_email: String(body.submitter_email || '').slice(0, 240),
        answers,
        created_at: new Date().toISOString(),
      }),
    });
    if (!insertRes.ok) throw new HttpError(500, 'Could not submit form response.');
    const response = (await insertRes.json().catch(() => []))[0] || null;

    return { response };
  },
);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/public-form-submit.test.mjs`
Expected: PASS, 9 tests.

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: `tests/public-api-security-static.test.mjs` now **FAILS** — it asserts `readJsonBody`, `requireAllowedOrigin`, `enforceRateLimit` and `setApiHeaders` appear literally in this file, and they no longer do. This failure is expected and is fixed in Task 9. Every other test passes.

- [ ] **Step 6: Commit**

```bash
git add api/public-form-submit.js tests/public-form-submit.test.mjs
git commit -m "$(cat <<'EOF'
refactor(api): move public-form-submit onto the endpoint seam

Deletes the copy-pasted supabase env/header/get/insert helpers. The
copies matched /^eyJ/i as a "secret key" and so omitted the
Authorization header for legacy service-role JWTs; _lib/supabase-admin.js
sends it, which Storage requires.

Behaviour preserved: 1MB body cap, 500 not-configured, 12/10min rate
limit, honeypot and timing checks. Nine executable tests replace grep.

Note: tests/public-api-security-static.test.mjs fails until Task 9.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Migrate `public-form-file-upload`

**Files:**
- Modify: `api/public-form-file-upload.js`
- Test: `tests/public-form-file-upload.test.mjs` (create)

**Interfaces:**
- Consumes: `defineEndpoint`, `HttpError`, `FORM_FILE_BUCKET`, `FORM_FILE_MAX_BYTES`, `ALLOWED_PUBLIC_FORM_FILE_TYPES` (Task 4), `createStorageClient` (Task 4).
- Produces: default-exported handler. Test overrides: `{ db, storage }`, where `storage` is any object shaped `{ storage: { getBucket, createBucket, from } }`.

**Behaviour to preserve exactly:** body cap `16 * 1024`; not-configured → 500 `'Public form files are not configured.'`; rate limit `{ namespace: 'public-form-file-upload', limit: 20, windowMs: 10 * 60 * 1000 }`; oversized file → 413; disallowed MIME type → 415; non-file question → 400.

- [ ] **Step 1: Write the failing test**

Create `tests/public-form-file-upload.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/public-form-file-upload.js';
import { resetRateLimits } from '../api/_lib/rate-limit.js';

const originalEnv = { ...process.env };
test.beforeEach(() => { resetRateLimits(); });
test.afterEach(() => { process.env = { ...originalEnv }; });

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

function req(body, extraHeaders = {}) {
  return {
    method: 'POST',
    url: '/api/public-form-file-upload',
    headers: { host: 'app.example.com', ...extraHeaders },
    body,
  };
}

function baseEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
}

const FORM = {
  id: 'form-1',
  company_id: 'co1',
  status: 'Published',
  questions: [{ id: 'q1', type: 'file' }, { id: 'q2', type: 'text' }],
};

function makeDb({ form = FORM } = {}) {
  const db = async (path) => {
    if (path.startsWith('/rest/v1/forms?')) {
      return { ok: true, async json() { return form ? [form] : []; } };
    }
    return { ok: true, async json() { return []; } };
  };
  return db;
}

function makeStorage() {
  const created = [];
  return {
    created,
    storage: {
      async getBucket() { return { data: { name: 'quest-form-response-files' }, error: null }; },
      async createBucket() { return { data: null, error: null }; },
      from() {
        return {
          async createSignedUploadUrl(objectPath) {
            created.push(objectPath);
            return { data: { token: 'tok', signedUrl: 'https://signed.example/upload' }, error: null };
          },
        };
      },
    },
  };
}

const VALID = { form_id: 'form-1', question_id: 'q1', file_name: 'plan.pdf', file_type: 'application/pdf', file_size: 1024 };

test('happy path: returns a signed upload URL scoped to company/form/question', async () => {
  baseEnv();
  const storage = makeStorage();
  const r = res();
  await handler(req(VALID), r, { db: makeDb(), storage });
  assert.equal(r.statusCode, 200);
  const payload = r.json();
  assert.equal(payload.bucket_id, 'quest-form-response-files');
  assert.equal(payload.signed_upload_url, 'https://signed.example/upload');
  assert.ok(payload.object_path.startsWith('co1/form-1/q1/'), `unexpected path ${payload.object_path}`);
});

test('rejects a disallowed origin', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID, { origin: 'https://evil.example' }), r, { db: makeDb(), storage: makeStorage() });
  assert.equal(r.statusCode, 403);
});

test('rejects an unsupported file type with 415', async () => {
  baseEnv();
  const r = res();
  await handler(req({ ...VALID, file_type: 'application/x-msdownload' }), r, { db: makeDb(), storage: makeStorage() });
  assert.equal(r.statusCode, 415);
  assert.equal(r.json().error, 'Unsupported file type.');
});

test('rejects an oversized file with 413', async () => {
  baseEnv();
  const r = res();
  await handler(req({ ...VALID, file_size: 16 * 1024 * 1024 }), r, { db: makeDb(), storage: makeStorage() });
  assert.equal(r.statusCode, 413);
});

test('rejects a zero-size file with 413', async () => {
  baseEnv();
  const r = res();
  await handler(req({ ...VALID, file_size: 0 }), r, { db: makeDb(), storage: makeStorage() });
  assert.equal(r.statusCode, 413);
});

test('rejects uploads to a non-file question with 400', async () => {
  baseEnv();
  const r = res();
  await handler(req({ ...VALID, question_id: 'q2' }), r, { db: makeDb(), storage: makeStorage() });
  assert.equal(r.statusCode, 400);
  assert.equal(r.json().error, 'This question does not accept files.');
});

test('rejects a missing form with 404', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID), r, { db: makeDb({ form: null }), storage: makeStorage() });
  assert.equal(r.statusCode, 404);
});

test('a hostile file name cannot inject directories into the object path', async () => {
  baseEnv();
  const storage = makeStorage();
  const r = res();
  await handler(req({ ...VALID, file_name: '../../etc/pa ss wd.pdf' }), r, { db: makeDb(), storage });
  assert.equal(r.statusCode, 200);
  const path = r.json().object_path;
  assert.ok(path.startsWith('co1/form-1/q1/'), `escaped its prefix: ${path}`);
  // safeFileName keeps dots but strips slashes, so ".." survives as literal
  // text inside the file name and can never become a path segment. Four
  // segments exactly: company / form / question / file.
  assert.equal(path.split('/').length, 4, `injected a directory: ${path}`);
});

test('returns 500 when Supabase is not configured', async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  const r = res();
  await handler(req(VALID), r, {});
  assert.equal(r.statusCode, 500);
  assert.equal(r.json().error, 'Public form files are not configured.');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/public-form-file-upload.test.mjs`
Expected: FAIL — `res.status is not a function`.

- [ ] **Step 3: Rewrite the handler**

Replace the whole of `api/public-form-file-upload.js` with:

```javascript
import { randomUUID } from 'node:crypto';
import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { createStorageClient } from './_lib/supabase-storage.js';
import { ALLOWED_PUBLIC_FORM_FILE_TYPES, FORM_FILE_BUCKET, FORM_FILE_MAX_BYTES } from './_lib/form-files.js';

function safeFileName(name) {
  const cleaned = String(name || 'upload')
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return cleaned || 'upload';
}

async function ensureFormFileBucket(client) {
  const existing = await client.storage.getBucket(FORM_FILE_BUCKET);
  if (!existing.error) return;
  const created = await client.storage.createBucket(FORM_FILE_BUCKET, {
    public: false,
    fileSizeLimit: FORM_FILE_MAX_BYTES,
  });
  if (created.error && !/already exists/i.test(created.error.message || '')) {
    throw created.error;
  }
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'no-store',
    notConfiguredStatus: 500,
    notConfiguredMessage: 'Public form files are not configured.',
    bodyLimitBytes: 16 * 1024,
    rateLimit: { namespace: 'public-form-file-upload', limit: 20, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const { body, db } = ctx;
    const storage = ctx.storage || createStorageClient();

    const formId = String(body.form_id || '').trim();
    const questionId = String(body.question_id || '').trim();
    const fileName = safeFileName(body.file_name);
    const fileType = String(body.file_type || '').toLowerCase().trim().slice(0, 120);
    const fileSize = Number(body.file_size || 0) || 0;

    if (!formId || !questionId) throw new HttpError(400, 'Missing form or question.');
    if (fileSize <= 0 || fileSize > FORM_FILE_MAX_BYTES) throw new HttpError(413, 'File is too large for this form.');
    if (!ALLOWED_PUBLIC_FORM_FILE_TYPES.has(fileType)) throw new HttpError(415, 'Unsupported file type.');

    const formsRes = await db(`/rest/v1/forms?id=eq.${encodeURIComponent(formId)}&status=eq.Published&select=id,company_id,status,questions`);
    if (!formsRes.ok) throw new HttpError(500, 'Could not prepare file upload.');
    const form = (await formsRes.json().catch(() => []))[0];
    if (!form) throw new HttpError(404, 'Form not found or not published.');

    const question = Array.isArray(form.questions) ? form.questions.find((item) => item.id === questionId) : null;
    if (!question || question.type !== 'file') throw new HttpError(400, 'This question does not accept files.');

    await ensureFormFileBucket(storage);
    const objectPath = `${form.company_id}/${form.id}/${questionId}/${randomUUID()}-${fileName}`;
    const { data, error } = await storage.storage
      .from(FORM_FILE_BUCKET)
      .createSignedUploadUrl(objectPath, { upsert: false });
    if (error) throw new HttpError(500, 'Could not prepare file upload.');

    return {
      bucket_id: FORM_FILE_BUCKET,
      object_path: objectPath,
      token: data?.token || '',
      signed_upload_url: data?.signedUrl || '',
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    };
  },
);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/public-form-file-upload.test.mjs`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add api/public-form-file-upload.js tests/public-form-file-upload.test.mjs
git commit -m "$(cat <<'EOF'
refactor(api): move public-form-file-upload onto the endpoint seam

Storage access moves behind ctx.storage || createStorageClient(), so the
signed-upload path is now testable with a fake. Behaviour preserved:
16KB body cap, 500 not-configured, 20/10min rate limit, 413/415 checks.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Migrate `public-form-file-url`

**Files:**
- Modify: `api/public-form-file-url.js`
- Test: `tests/public-form-file-url.test.mjs` (create)

**Interfaces:**
- Consumes: `defineEndpoint`, `HttpError`, `createStorageClient`, `FORM_FILE_BUCKET`, and `supabaseBaseUrl`/`supabaseServiceKey` from `_lib/supabase-admin.js`.
- Produces: default-exported handler. Test overrides: `{ storage, fetchAsUser }`.

**Behaviour to preserve exactly:** body cap `16 * 1024`; not-configured → 500; rate limit `{ namespace: 'public-form-file-url', limit: 60, windowMs: 10 * 60 * 1000 }`; **the `form_responses` row must be read with the caller's JWT so RLS enforces membership before any service-role signed URL is minted**; object path must start with `company_id/form_id/`, must not contain `..`, and must actually appear in the stored answers.

`supabaseGetAsUser` stays local to this file — it has exactly one caller, which makes it a hypothetical seam, not a real one. It is made injectable as `ctx.fetchAsUser` purely so the RLS-scoped read can be faked in tests.

- [ ] **Step 1: Write the failing test**

Create `tests/public-form-file-url.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/public-form-file-url.js';
import { resetRateLimits } from '../api/_lib/rate-limit.js';

const originalEnv = { ...process.env };
test.beforeEach(() => { resetRateLimits(); });
test.afterEach(() => { process.env = { ...originalEnv }; });

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

function req(body, headers = { authorization: 'Bearer caller-jwt' }) {
  return { method: 'POST', url: '/api/public-form-file-url', headers: { host: 'app.example.com', ...headers }, body };
}

function baseEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
}

const OBJECT_PATH = 'co1/form-1/q1/abc-plan.pdf';
const RESPONSE_ROW = {
  id: 'response-1',
  form_id: 'form-1',
  company_id: 'co1',
  answers: { q1: { kind: 'file', object_path: OBJECT_PATH } },
};

function makeStorage() {
  const signed = [];
  return {
    signed,
    auth: { async getUser(token) { return token ? { data: { user: { id: 'u1' } }, error: null } : { data: null, error: new Error('no') }; } },
    storage: {
      from() {
        return {
          async createSignedUrl(objectPath) {
            signed.push(objectPath);
            return { data: { signedUrl: 'https://signed.example/download' }, error: null };
          },
        };
      },
    },
  };
}

const VALID = { response_id: 'response-1', form_id: 'form-1', object_path: OBJECT_PATH, file_name: 'plan.pdf' };

test('happy path: mints a signed URL after the RLS-scoped read succeeds', async () => {
  baseEnv();
  const storage = makeStorage();
  const seen = [];
  const fetchAsUser = async (path, token) => { seen.push({ path, token }); return [RESPONSE_ROW]; };
  const r = res();
  await handler(req(VALID), r, { storage, fetchAsUser });
  assert.equal(r.statusCode, 200);
  assert.equal(r.json().signed_url, 'https://signed.example/download');
  assert.equal(seen[0].token, 'caller-jwt', 'the row must be read with the caller JWT, not the service key');
  assert.deepEqual(storage.signed, [OBJECT_PATH]);
});

test('requires a bearer token', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID, {}), r, { storage: makeStorage(), fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 401);
});

test('rejects a disallowed origin', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID, { authorization: 'Bearer t', origin: 'https://evil.example' }), r,
    { storage: makeStorage(), fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 403);
});

test('rejects an object path outside the response prefix', async () => {
  baseEnv();
  const storage = makeStorage();
  const r = res();
  await handler(req({ ...VALID, object_path: 'other-co/form-9/q1/secret.pdf' }), r,
    { storage, fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 404);
  assert.deepEqual(storage.signed, [], 'no URL may be signed for a foreign path');
});

test('rejects a path containing traversal segments', async () => {
  baseEnv();
  const storage = makeStorage();
  const r = res();
  await handler(req({ ...VALID, object_path: 'co1/form-1/../../etc/passwd' }), r,
    { storage, fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 404);
  assert.deepEqual(storage.signed, []);
});

test('rejects a path not referenced by the stored answers', async () => {
  baseEnv();
  const storage = makeStorage();
  const r = res();
  await handler(req({ ...VALID, object_path: 'co1/form-1/q1/never-uploaded.pdf' }), r,
    { storage, fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 404);
  assert.deepEqual(storage.signed, []);
});

test('rejects an unsupported bucket', async () => {
  baseEnv();
  const r = res();
  await handler(req({ ...VALID, bucket_id: 'some-other-bucket' }), r,
    { storage: makeStorage(), fetchAsUser: async () => [RESPONSE_ROW] });
  assert.equal(r.statusCode, 400);
  assert.equal(r.json().error, 'Unsupported file bucket.');
});

test('returns 404 when RLS hides the response row', async () => {
  baseEnv();
  const storage = makeStorage();
  const r = res();
  await handler(req(VALID), r, { storage, fetchAsUser: async () => [] });
  assert.equal(r.statusCode, 404);
  assert.deepEqual(storage.signed, []);
});

test('returns 500 when Supabase is not configured', async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  const r = res();
  await handler(req(VALID), r, {});
  assert.equal(r.statusCode, 500);
  assert.equal(r.json().error, 'Public form files are not configured.');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/public-form-file-url.test.mjs`
Expected: FAIL — `res.status is not a function`.

- [ ] **Step 3: Rewrite the handler**

Replace the whole of `api/public-form-file-url.js` with:

```javascript
import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { createStorageClient } from './_lib/supabase-storage.js';
import { supabaseBaseUrl, supabaseServiceKey } from './_lib/supabase-admin.js';
import { FORM_FILE_BUCKET } from './_lib/form-files.js';

// Query with the caller JWT so form_responses RLS enforces active membership
// and forms.view before any service-role signed URL is minted. One caller, so
// this stays local rather than becoming a seam of its own; it is injectable
// only so the RLS-scoped read can be faked in tests.
async function supabaseGetAsUser(path, token) {
  const response = await fetch(`${supabaseBaseUrl()}/rest/v1/${path}`, {
    headers: {
      apikey: supabaseServiceKey(),
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) throw new HttpError(500, 'Could not open form file.');
  return data;
}

function containsObjectPath(value, objectPath) {
  if (Array.isArray(value)) return value.some((item) => containsObjectPath(item, objectPath));
  if (!value || typeof value !== 'object') return false;
  if (value.kind === 'file' && value.object_path === objectPath) return true;
  return Object.values(value).some((item) => containsObjectPath(item, objectPath));
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'private, no-store',
    notConfiguredStatus: 500,
    notConfiguredMessage: 'Public form files are not configured.',
    bodyLimitBytes: 16 * 1024,
    rateLimit: { namespace: 'public-form-file-url', limit: 60, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const { body, req } = ctx;
    const storage = ctx.storage || createStorageClient();
    const fetchAsUser = ctx.fetchAsUser || supabaseGetAsUser;

    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) throw new HttpError(401, 'Authentication required.');
    const authenticated = await storage.auth.getUser(token);
    if (authenticated.error || !authenticated.data?.user?.id) throw new HttpError(401, 'Authentication required.');

    const responseId = String(body.response_id || '').trim();
    const formId = String(body.form_id || '').trim();
    const bucketId = String(body.bucket_id || FORM_FILE_BUCKET).trim();
    const objectPath = String(body.object_path || '').trim();
    const fileName = String(body.file_name || 'form-upload').slice(0, 240);

    if (!responseId || !formId || !objectPath) throw new HttpError(400, 'Missing file reference.');
    if (bucketId !== FORM_FILE_BUCKET) throw new HttpError(400, 'Unsupported file bucket.');

    const rows = await fetchAsUser(
      `form_responses?id=eq.${encodeURIComponent(responseId)}&form_id=eq.${encodeURIComponent(formId)}&select=id,form_id,company_id,answers`,
      token,
    );
    const response = rows[0];
    const expectedPrefix = response ? `${response.company_id}/${response.form_id}/` : '';
    if (!response || !objectPath.startsWith(expectedPrefix) || objectPath.includes('..') || !containsObjectPath(response.answers, objectPath)) {
      throw new HttpError(404, 'File reference not found.');
    }

    const { data, error } = await storage.storage
      .from(FORM_FILE_BUCKET)
      .createSignedUrl(objectPath, 60 * 60, { download: fileName });
    if (error) throw new HttpError(500, 'Could not open form file.');

    return { signed_url: data?.signedUrl || '' };
  },
);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/public-form-file-url.test.mjs`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add api/public-form-file-url.js tests/public-form-file-url.test.mjs
git commit -m "$(cat <<'EOF'
refactor(api): move public-form-file-url onto the endpoint seam

The RLS-scoped read stays: form_responses is still queried with the
caller JWT before any service-role URL is signed, and there are now
executable tests proving no URL is signed for a foreign path, a
traversal path, or a path absent from the stored answers.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Migrate `create-checkout-session` and add its rate limit

**Files:**
- Modify: `api/create-checkout-session.js`
- Test: `tests/create-checkout-session.test.mjs` (create)

**Interfaces:**
- Consumes: `defineEndpoint`, `HttpError`, `safeReturnUrl`, `appendQuery` from `_lib/http-security.js`, `getUserFromBearer`/`isActiveMember` from `_lib/user-auth.js` (Task 1).
- Produces: default-exported handler, **plus the existing named export `checkoutIdempotencyKey({companyId, userId, priceId, requestId})`** — `tests/http-security.test.mjs:8` imports it and must keep working. Test overrides: `{ db, getUser, stripeFetch }`.

**Behaviour changes in this task (all agreed):**
- **New:** rate limit `{ namespace: 'create-checkout-session', limit: 10, windowMs: 10 * 60 * 1000 }`. It had none.
- **New:** the service key now also resolves from `SUPABASE_SECRET_KEY` via `ctx.db`; previously only `SUPABASE_SERVICE_ROLE_KEY` worked.
- **Changed:** origin is now checked *before* the bearer token, so a request from a disallowed origin returns 403 instead of 401.
- Preserved: body cap `16 * 1024`; Stripe-not-configured → 501 `'Billing is not configured yet.'`; role allowlist `owner`/`admin`/`developer`/`construction_supervisor` → otherwise 403; `request_id` pattern `/^[A-Za-z0-9_-]{8,120}$/`; Stripe's own error status passed through.

- [ ] **Step 1: Write the failing test**

Create `tests/create-checkout-session.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import test from 'node:test';
import handler, { checkoutIdempotencyKey } from '../api/create-checkout-session.js';
import { resetRateLimits } from '../api/_lib/rate-limit.js';

const originalEnv = { ...process.env };
test.beforeEach(() => { resetRateLimits(); });
test.afterEach(() => { process.env = { ...originalEnv }; });

function res() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

function req(body, headers = { authorization: 'Bearer t' }) {
  return { method: 'POST', url: '/api/create-checkout-session', headers: { host: 'app.example.com', ...headers }, body };
}

function baseEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
  process.env.STRIPE_SECRET_KEY = 'sk_test';
  process.env.STRIPE_PRICE_ID = 'price_1';
}

function makeDb(role = 'owner') {
  return async (path) => {
    if (path.startsWith('/rest/v1/company_memberships?')) {
      return { ok: true, async json() { return role ? [{ role }] : []; } };
    }
    return { ok: true, async json() { return []; } };
  };
}

const getUser = async () => ({ id: 'u1', email: 'owner@example.com' });
const VALID = { company_id: 'co1', request_id: 'req-abcdefgh' };

function stripeOk() {
  const calls = [];
  return {
    calls,
    fetch: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, status: 200, async json() { return { url: 'https://checkout.stripe.com/s/1' }; } };
    },
  };
}

test('happy path: returns the Stripe checkout URL', async () => {
  baseEnv();
  const stripe = stripeOk();
  const r = res();
  await handler(req(VALID), r, { db: makeDb('owner'), getUser, stripeFetch: stripe.fetch });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.json(), { url: 'https://checkout.stripe.com/s/1' });
  assert.equal(stripe.calls.length, 1);
  assert.equal(stripe.calls[0].options.headers['Idempotency-Key'].length, 64);
});

test('rejects a disallowed origin before authenticating', async () => {
  baseEnv();
  const stripe = stripeOk();
  const r = res();
  await handler(req(VALID, { authorization: 'Bearer t', origin: 'https://evil.example' }), r,
    { db: makeDb('owner'), getUser, stripeFetch: stripe.fetch });
  assert.equal(r.statusCode, 403);
  assert.equal(stripe.calls.length, 0);
});

test('requires authentication', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID), r, { db: makeDb('owner'), getUser: async () => null, stripeFetch: stripeOk().fetch });
  assert.equal(r.statusCode, 401);
});

test('rejects a member without billing permission', async () => {
  baseEnv();
  const stripe = stripeOk();
  const r = res();
  await handler(req(VALID), r, { db: makeDb('member'), getUser, stripeFetch: stripe.fetch });
  assert.equal(r.statusCode, 403);
  assert.equal(r.json().error, 'Owner/Admin billing permission required.');
  assert.equal(stripe.calls.length, 0, 'Stripe must not be called without permission');
});

test('rejects a non-member', async () => {
  baseEnv();
  const r = res();
  await handler(req(VALID), r, { db: makeDb(null), getUser, stripeFetch: stripeOk().fetch });
  assert.equal(r.statusCode, 403);
});

test('requires a stable request_id', async () => {
  baseEnv();
  const r = res();
  await handler(req({ company_id: 'co1', request_id: 'short' }), r,
    { db: makeDb('owner'), getUser, stripeFetch: stripeOk().fetch });
  assert.equal(r.statusCode, 400);
  assert.equal(r.json().error, 'A stable request_id is required.');
});

test('requires a company_id', async () => {
  baseEnv();
  const r = res();
  await handler(req({ request_id: 'req-abcdefgh' }), r,
    { db: makeDb('owner'), getUser, stripeFetch: stripeOk().fetch });
  assert.equal(r.statusCode, 400);
});

test('passes a Stripe failure status through', async () => {
  baseEnv();
  const stripeFetch = async () => ({ ok: false, status: 402, async json() { return { error: { message: 'Card declined.' } }; } });
  const r = res();
  await handler(req(VALID), r, { db: makeDb('owner'), getUser, stripeFetch });
  assert.equal(r.statusCode, 402);
  assert.equal(r.json().error, 'Card declined.');
});

test('returns 501 when Stripe is not configured', async () => {
  baseEnv();
  delete process.env.STRIPE_SECRET_KEY;
  const r = res();
  await handler(req(VALID), r, { db: makeDb('owner'), getUser, stripeFetch: stripeOk().fetch });
  assert.equal(r.statusCode, 501);
  assert.equal(r.json().error, 'Billing is not configured yet.');
});

test('rate limits repeated checkout attempts', async () => {
  baseEnv();
  const stripe = stripeOk();
  let last;
  for (let i = 0; i < 12; i += 1) {
    last = res();
    await handler(req(VALID), last, { db: makeDb('owner'), getUser, stripeFetch: stripe.fetch });
  }
  assert.equal(last.statusCode, 429);
});

test('checkoutIdempotencyKey is stable and still exported', () => {
  const args = { companyId: 'co1', userId: 'u1', priceId: 'price_1', requestId: 'req-abcdefgh' };
  assert.equal(checkoutIdempotencyKey(args), checkoutIdempotencyKey(args));
  assert.equal(checkoutIdempotencyKey(args).length, 64);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/create-checkout-session.test.mjs`
Expected: FAIL — the handler is not built by `defineEndpoint`, so the third `overrides` argument is ignored and `getUser`/`stripeFetch` are never used.

- [ ] **Step 3: Rewrite the handler**

Replace the whole of `api/create-checkout-session.js` with:

```javascript
import crypto from 'node:crypto';
import { defineEndpoint, jsonResponse } from './_lib/endpoint.js';
import { HttpError, appendQuery, safeReturnUrl } from './_lib/http-security.js';
import { getUserFromBearer } from './_lib/user-auth.js';

const env = (key) => process.env[key] || '';

const BILLING_ROLES = ['owner', 'admin', 'developer', 'construction_supervisor'];

export function checkoutIdempotencyKey({ companyId, userId, priceId, requestId }) {
  return crypto.createHash('sha256').update(`${companyId}:${userId}:${priceId}:${requestId}`).digest('hex');
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'private, no-store',
    bodyLimitBytes: 16 * 1024,
    rateLimit: { namespace: 'create-checkout-session', limit: 10, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const { body, db, req } = ctx;
    const getUser = ctx.getUser || getUserFromBearer;
    const stripeFetch = ctx.stripeFetch || fetch;

    if (!env('STRIPE_SECRET_KEY') || !env('STRIPE_PRICE_ID')) {
      throw new HttpError(501, 'Billing is not configured yet.');
    }

    const user = await getUser(req);
    if (!user?.id) throw new HttpError(401, 'Authentication required.');

    const companyId = String(body.company_id || '').trim();
    const requestId = String(body.request_id || req.headers['x-idempotency-key'] || '').trim();
    const returnUrl = safeReturnUrl(body.return_url, req);
    if (!companyId) throw new HttpError(400, 'company_id is required.');
    if (!/^[A-Za-z0-9_-]{8,120}$/.test(requestId)) throw new HttpError(400, 'A stable request_id is required.');

    const membershipRes = await db(`/rest/v1/company_memberships?company_id=eq.${encodeURIComponent(companyId)}&profile_id=eq.${encodeURIComponent(user.id)}&status=eq.active&select=role`);
    const memberships = membershipRes.ok ? await membershipRes.json().catch(() => []) : [];
    const allowed = memberships.some((item) => BILLING_ROLES.includes(String(item.role || '').toLowerCase()));
    if (!allowed) throw new HttpError(403, 'Owner/Admin billing permission required.');

    const idempotencyKey = checkoutIdempotencyKey({ companyId, userId: user.id, priceId: env('STRIPE_PRICE_ID'), requestId });
    const params = new URLSearchParams();
    params.set('mode', 'subscription');
    params.set('line_items[0][price]', env('STRIPE_PRICE_ID'));
    params.set('line_items[0][quantity]', '1');
    params.set('success_url', appendQuery(returnUrl, 'billing', 'success'));
    params.set('cancel_url', appendQuery(returnUrl, 'billing', 'cancel'));
    params.set('customer_email', user.email || '');
    params.set('metadata[company_id]', companyId);
    params.set('metadata[profile_id]', user.id);
    params.set('subscription_data[metadata][company_id]', companyId);
    params.set('subscription_data[metadata][profile_id]', user.id);

    const stripeRes = await stripeFetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': idempotencyKey,
      },
      body: params,
    });
    const payload = await stripeRes.json().catch(() => ({}));
    if (!stripeRes.ok) {
      return jsonResponse(stripeRes.status, { error: payload.error?.message || 'Stripe checkout failed.' });
    }

    return { url: payload.url };
  },
);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/create-checkout-session.test.mjs`
Expected: PASS, 11 tests.

- [ ] **Step 5: Confirm the pre-existing import still works**

Run: `node --test tests/http-security.test.mjs`
Expected: PASS — it imports `checkoutIdempotencyKey` from this file.

- [ ] **Step 6: Commit**

```bash
git add api/create-checkout-session.js tests/create-checkout-session.test.mjs
git commit -m "$(cat <<'EOF'
refactor(api): move create-checkout-session onto the endpoint seam

Deletes its private json/supabaseFetch/getUserFromBearer copies in favour
of _lib/user-auth.js and ctx.db, which also lets the service key resolve
from SUPABASE_SECRET_KEY — this endpoint only ever read
SUPABASE_SERVICE_ROLE_KEY.

Adds a rate limit (10 per 10 minutes per IP); it previously had none.
Origin is now checked before the bearer token, so a disallowed origin
returns 403 rather than 401.

checkoutIdempotencyKey stays exported for tests/http-security.test.mjs.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Delete the dead helper, replace the grep tests, update CONTEXT.md

**Files:**
- Modify: `api/_lib/http-security.js` (delete `errorResponse`)
- Modify: `tests/public-api-security-static.test.mjs`
- Modify: `tests/forms-file-storage-static.test.mjs`
- Modify: `CONTEXT.md`

**Interfaces:**
- Consumes: everything from Tasks 4–8.
- Produces: nothing new.

- [ ] **Step 1: Confirm `errorResponse` has no callers left**

```bash
grep -rn "errorResponse" api/ src/ tests/ || echo "NO CALLERS"
```

Expected: only the declaration in `api/_lib/http-security.js`. If any endpoint still calls it, that endpoint was not migrated — go back and finish it.

- [ ] **Step 2: Delete `errorResponse`**

Remove these lines from the end of `api/_lib/http-security.js`:

```javascript
export function errorResponse(response, error, fallback = 'Request failed.') {
  const status = Number(error?.statusCode) || 500;
  return response.status(status).json({ error: status >= 500 ? fallback : (error?.message || fallback) });
}
```

It used Vercel's `response.status().json()` sugar, which the seam's "plain mock response is enough to test with" invariant forbids.

- [ ] **Step 3: Replace the grep assertions**

Replace the whole of `tests/public-api-security-static.test.mjs` with:

```javascript
// The public API's security properties are proven by executing the handlers
// (see public-form-submit / -file-upload / -file-url / create-checkout-session
// test files). What remains here is the one property no behavioural test can
// assert: that these endpoints are still *on* the seam, and so still inherit
// the pipeline rather than hand-rolling it.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (name) => readFileSync(new URL(`../api/${name}`, import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const SEAM_ENDPOINTS = [
  'public-form-submit.js',
  'public-form-file-upload.js',
  'public-form-file-url.js',
  'create-checkout-session.js',
];

test('public mutation endpoints stay on the endpoint seam', () => {
  for (const name of SEAM_ENDPOINTS) {
    const source = read(name);
    assert.match(source, /defineEndpoint\(/, `${name} must be built with defineEndpoint`);
    assert.match(source, /requireOrigin: true/, `${name} must require an allowed origin`);
    assert.match(source, /rateLimit: \{/, `${name} must declare a rate limit`);
    assert.doesNotMatch(source, /res\.status\(|response\.status\(/, `${name} must not write responses directly`);
  }
});

test('no endpoint re-declares the Supabase admin header logic', () => {
  for (const name of SEAM_ENDPOINTS) {
    const source = read(name);
    assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/, `${name} must resolve the key via _lib`);
    assert.doesNotMatch(source, /function supabaseHeaders/, `${name} must not copy supabaseHeaders`);
  }
});

test('the app sends the caller access token when opening form files', () => {
  assert.match(app, /Authorization: `Bearer \$\{activeSession\(\)\.access_token\}`/);
});

test('the public form posts the honeypot and timing fields', () => {
  assert.match(app, /name="website"/);
  assert.match(app, /started_at: state\.publicForm\.openedAt/);
});
```

- [ ] **Step 4: Fix the two moved-constant assertions**

In `tests/forms-file-storage-static.test.mjs`, line 13 asserts `FORM_FILE_BUCKET` appears in `public-form-file-upload.js`. It now lives in `api/_lib/form-files.js`. Change that assertion to read the shared module instead:

```javascript
const formFiles = readFileSync(new URL('../api/_lib/form-files.js', import.meta.url), 'utf8');
assert.match(formFiles, /FORM_FILE_BUCKET = 'quest-form-response-files'/);
```

- [ ] **Step 5: Update CONTEXT.md**

In the `## Architecture: the API endpoint module` section, add this entry after the `supabase-admin.js` bullet:

```markdown
- **`supabase-storage.js`** — `createStorageClient()` returns a supabase-js
  client for the Storage operations `ctx.db` cannot express (signed upload and
  download URLs). Base URL and key come from `supabase-admin.js`, so the two
  can never disagree about env resolution. Only the two public-form file
  endpoints use it, via `ctx.storage || createStorageClient()` — a real
  default in production, a fake in tests.
- **`form-files.js`** — the Public Form file bucket name, size cap and allowed
  MIME types, shared by the three form endpoints.
```

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: PASS — everything, with no remaining failures from Task 5 Step 5.

- [ ] **Step 7: Commit**

```bash
git add api/_lib/http-security.js tests/public-api-security-static.test.mjs \
        tests/forms-file-storage-static.test.mjs CONTEXT.md
git commit -m "$(cat <<'EOF'
refactor(api): replace public-API grep tests with seam assertions

The security properties those greps stood in for are now proven by
executing the handlers. What is left asserts only what behaviour cannot:
that these four endpoints are still on the seam and still do not
re-declare the Supabase header logic.

Deletes errorResponse — zero callers, and it used the Vercel
response.status().json() sugar the seam's mock-response invariant forbids.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Verify and open the pull request

**Files:** none changed.

- [ ] **Step 1: Confirm the duplication is actually gone**

```bash
grep -ln "function supabaseHeaders\|const isSupabaseSecretKey\|function serverClient" api/*.js || echo "NO DUPLICATES"
```

Expected: `NO DUPLICATES`.

Note the glob is `api/*.js`, **not** `-r api/` — `api/_lib/supabase-admin.js` legitimately declares `export function supabaseHeaders`, and that is the one copy that should exist. This check is asking whether any *endpoint* still declares its own.

- [ ] **Step 2: Confirm which endpoints remain off the seam**

```bash
grep -L "defineEndpoint" api/*.js
```

Expected exactly three: `api/address-suggestions.js`, `api/recycle-bin-purge.js`, `api/stripe-webhook.js`. Any other file listed was missed.

- [ ] **Step 3: Confirm `enforceRateLimit` has one caller left**

```bash
grep -rln "enforceRateLimit" api/
```

Expected: `api/_lib/rate-limit.js` and `api/address-suggestions.js` only. Leave both — `address-suggestions` is out of scope, and it is the last endpoint that breaks the mock-response invariant.

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Push and open the pull request**

```bash
git push -u origin refactor/api-endpoint-adoption
gh pr create --base main --title "refactor(api): finish adopting the endpoint seam for public forms and checkout" --body "$(cat <<'EOF'
Moves the three public-form endpoints and create-checkout-session onto
`defineEndpoint`, deleting the helper copies that had already diverged
from `_lib/supabase-admin.js`.

**The divergence this fixes:** the copied `isSupabaseSecretKey` matched
`/^eyJ/i` as well as `sb_secret_`, so a legacy service-role JWT got
`apikey` alone from the form endpoints but `apikey` + `Authorization:
Bearer` from `_lib`. Storage requires the Bearer header. Same env var,
two different requests, depending on which endpoint you hit.

**New module:** `_lib/supabase-storage.js` — a supabase-js client for the
signed-URL work `ctx.db` cannot express, built from the same env logic as
the admin fetch. Used via `ctx.storage || createStorageClient()`, so the
signed-URL paths are now testable with a fake.

**Behaviour changes, all deliberate:**
- `create-checkout-session` gains a rate limit (10 per 10 min per IP). It had none.
- `create-checkout-session` now also accepts `SUPABASE_SECRET_KEY`; it previously read only `SUPABASE_SERVICE_ROLE_KEY`.
- `create-checkout-session` checks origin before the bearer token, so a disallowed origin returns 403 rather than 401.
- Everything else preserved exactly: per-endpoint body caps (1MB for submit, 16KB for the rest), the 500 "not configured" responses, and every existing rate limit.

**Tests:** ~38 executable tests replace the grep assertions in
`public-api-security-static.test.mjs`. They prove the properties that
mattered — a foreign object path is never signed, a traversal path is
never signed, a path absent from the stored answers is never signed,
Stripe is never called without billing permission, and a bad origin stops
the request before any Supabase call.

**Still off the seam, deliberately:** `stripe-webhook` (needs raw-body
access for signature verification), `address-suggestions` (needs to run
without Supabase configured), `recycle-bin-purge` (needs a cron-secret
auth mode).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 6: STOP — report the PR URL and hand back**

Do not merge. Report the URL.

---

## Out of scope, recorded for later

These came out of the architecture review and are deliberately **not** in this plan:

- **`stripe-webhook`** — needs `bodyMode: 'raw'` on `defineEndpoint` so the HMAC can be computed over the unparsed body. It is the live billing path; migrate it on its own branch with its own signature-verification tests.
- **`address-suggestions`** — needs a "this endpoint does not require Supabase" config flag, because `defineEndpoint` currently 501s when Supabase is unconfigured. It is also the last caller of `enforceRateLimit`, which breaks the mock-response invariant.
- **`recycle-bin-purge`** — needs a `cron-secret` auth mode.
- **A `portalScoped(session, table, filters)` builder** — the Client Portal tenant filter is hand-written seven times across the client-portal endpoints, and the audit insert three times. Candidate 5 in the review.
- **Permission drift between JS, RLS and the plugin registry** — candidate 3, the highest-risk item in the review, and independent of this work.
