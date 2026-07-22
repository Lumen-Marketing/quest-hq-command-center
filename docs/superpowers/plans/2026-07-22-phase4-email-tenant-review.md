# Phase 4 — Outbound Email Tenant Review

Satisfies the blocking review in locked decision 8 ("every email template
re-read for tenant leaks before it can reach an outside business"). Reviewed
2026-07-22 against the ported functions in `supabase/functions/`.

## Findings summary

One **real cross-tenant leak** was found and fixed; everything else passes.

| # | Email | Who can trigger | Who can receive | Tenant data in body | Links point at | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Task notification (assignment / mention / update) — `notify-email` | Signed-in, approved caller with a management role **and at least one active company membership** | **Only** `team_members` whose `company_ids` overlap the caller's active companies | Task title, task body/HTML (sanitized), sender name — all from the caller's own workspace | `APP_URL` (must be set to Command Center's production URL) | **FIXED — PASS** |
| 2 | Problem report copy — `report-problem` | Any signed-in, approved user (rate-limited to 5/hour) | Platform inbox only (`EMAIL_FROM` / configured recipient) — never another tenant | Reporter name/email, their description, their UI context (view, company id, user agent) | `APP_URL` | **PASS** |

## Finding 1 — the leak (fixed)

**Upstream behavior:** `notify-email` authorized the caller purely on a *global*
`profiles.role`, then built its recipient allowlist from
`admin.from("team_members").select("email")` — a **service-role** read, which
bypasses RLS entirely and returns every workspace's roster.

**Consequence if shipped as-is:** a manager in workspace A could send arbitrary
(sanitized) HTML from the platform's official address to staff of workspace B.
An internal phishing vector across tenants, and a disclosure of B's email
addresses to A.

**Fix applied** (`supabase/functions/notify-email/index.ts`):

1. After the role check, load the caller's `company_memberships` where
   `status = 'active'`. Empty → 403.
2. Change the allowlist query to
   `.select("email, company_ids").overlaps("company_ids", callerCompanyIds)`.

Recipients are therefore always the intersection of "requested" and "member of a
company the sender actually belongs to".

## Finding 2 — report-problem (no change)

The report body can name the reporter's own company. That is intended content
for the platform inbox and is not cross-tenant exposure: reports are written
only by this function, read only by platform admins, and no tenant can read
another tenant's rows. `bug_reports` is deliberately platform-global.

## Deploy-time requirements (carry into the batched session)

- `APP_URL` **must** be Command Center's production URL. If it still points at
  `task.questroofing.com`, every email links outside tenants back to the retired
  standalone app — treat as a blocker.
- `EMAIL_FROM` must be a Resend-verified domain. Product branding in the from-name
  ("Quest HQ") is the open branding question in the parent plan, not a leak.
- `ALLOWED_ORIGINS` must list Command Center's origin only.

## Still to verify (Phase 5 leak test)

Static review cannot prove runtime behavior. The two-tenant test must include:

1. As Acme, trigger every task-notification type; assert no mail reaches Bravo's
   members and that Bravo's addresses never appear in any response.
2. Attempt a forged request naming a Bravo member's email as recipient → expect
   `422 No recipients are on the team allowlist`.
3. Confirm every link in a received email resolves to `APP_URL` and lands the
   viewer in their own workspace.

## Deferred functions (not deployed, not reviewed)

`ai-assistant`, `checkins`, `due-reminders` are deferred in Phase 4 and are not
deployed. **`checkins` and `due-reminders` both send email** — each must get its
own row in this table before it is ever deployed.
