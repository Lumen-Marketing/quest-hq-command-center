# Two-Tenant Leak Test — Checklist & Record

**This is the launch gate for the task module.** Locked decision 10: any single
failure blocks the module (Command Center itself may still launch without it).
Do not weaken a check to make it pass, and never mark a skipped check as passed.

- Run date: `__________`
- Run by: `__________`
- Branch / commit under test: `__________`
- Migrations applied: Phase 2 `202607221400…` ☐ · Phase 3 `202607221600…` ☐
- Functions deployed: notify-email ☐ · report-problem ☐

## Setup (Phase 5 Task 4)

Both tenants must be created **through the public signup flow**, not by hand in
the Supabase dashboard — using the real path is itself the first test.

| | Tenant A | Tenant B |
| --- | --- | --- |
| Business name | Acme Cabinets | Bravo Plumbing |
| Owner email | | |
| Company id | | |
| A job id | | |
| A task id | | |
| A member email | | |

Each tenant needs at least: 1 job, 2 tasks (one assigned to the owner), 1 time
entry, 1 task comment. **Without data on both sides the probes pass vacuously.**

Put the credentials in an env file and add it to `.git/info/exclude` — never commit it.

## Part 1 — Automated probes

```bash
SUPABASE_URL=... SUPABASE_ANON_KEY=... \
A_EMAIL=... A_PASSWORD=... B_EMAIL=... B_PASSWORD=... \
node scripts/tenant-leak-test.mjs
```

The script covers: cross-tenant reads of companies, team_members, tasks,
projects, notifications, task taxonomy, checkin_settings, bug_reports,
time_entries, active_timers, task_comments; cross-tenant insert/update/delete of
tasks; cross-tenant team_member insert; and a cross-tenant notify-email attempt.

Paste the **full** output below — passes included, so the record shows what was
actually exercised:

```
(paste output)
```

Result: ☐ all passed ☐ failures (list them, fix, then re-run the ENTIRE matrix)

## Part 2 — Manual checks the script can't do

| # | Check | Expected | Result |
| --- | --- | --- | --- |
| M1 | Signed in as A, type B's job id into the address bar (`/company/<B-company>/jobs?job_id=<B job>`) | Refused / empty — never B's job | ☐ |
| M2 | Signed in as A, type B's task id into the tasks route (`?task_id=<B task>`) | Task app shows "not found", not B's task | ☐ |
| M3 | A's workspace switcher | Lists only A's workspaces | ☐ |
| M4 | A's team/assignee pickers inside the task module | Only A's people — no B names or emails | ☐ |
| M5 | Invite a worker to A; sign in as that worker | Sees only A; no B data anywhere | ☐ |
| M6 | Invite the SAME email to B as well; sign in | Each workspace shows only its own tasks; switching is explicit | ☐ |
| M7 | Remove that worker from A (Command Center → members) | Task access to A gone immediately; their account still exists and B still works | ☐ |
| M8 | From an A job, click "Open tasks" | Only that job's tasks; new task created there attaches to that job **and** A's company | ☐ |
| M9 | A's task module deep-links (from contacts, messages, calendar) | All open the right task inside the module | ☐ |
| M10 | Sign out entirely, visit `/taskmanagement/app.html` | Redirected to Command Center sign-in — never the task UI | ☐ |

## Part 3 — Email checks (from the Phase 4 review doc)

| # | Check | Expected | Result |
| --- | --- | --- | --- |
| E1 | As A, trigger every task-notification type | Mail reaches only A's members | ☐ |
| E2 | Inspect a received email's links | All resolve to `APP_URL` (Command Center), **not** task.questroofing.com | ☐ |
| E3 | Forge a notify-email call naming B's member (covered by the script, confirm manually too) | `422 No recipients are on the team allowlist` | ☐ |
| E4 | Check `EMAIL_FROM` on a received message | Verified domain; sender name is the agreed product branding | ☐ |

## Verdict

☐ **PASS** — every probe and check above passed. Task module cleared for outside
tenants. Proceed to Phase 5 Task 6 (cutover).

☐ **BLOCKED** — failures recorded below. Task module stays off for outside
tenants until fixed and the whole matrix is re-run.

Failures / follow-ups:

```
(list)
```
