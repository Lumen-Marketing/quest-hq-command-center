# Recent Update — 1 to 6 October 2026

What shipped, why, and what is still open. Written for anyone catching up rather than for
someone who watched it happen.

Everything below is **merged to `main` and live in production** except where a section says
otherwise.

---

## Summary

| | |
|---|---|
| Pull requests merged | **5** |
| Files changed | 17 |
| Lines | +826 / −120 |
| Production data changes | 2 rows, 1 company |
| Open follow-ups | 1 |

One security fix, one UI honesty fix, one data bug, one dead-code removal, and one CI fix that
unblocked the other four from merging.

---

## 1. Client portal: cross-guest markup theft — PR #29

**The most serious item in this period.** Closed 1 October.

### What was wrong

When a client opened a shared document to leave comments or markups, the bulk-save endpoint
accepted a caller-supplied annotation id and wrote it with `ON CONFLICT (id) DO UPDATE` — without
checking who owned the row it was overwriting.

The single-annotation path had always had that check. The bulk path did not.

Because the GET endpoint returns every guest's annotation ids in a portal, **no id had to be
guessed**. A guest could read another guest's ids, name one of them in a save, and the upsert would
overwrite that row and take `payload.guest_id` with it — which then also satisfied the delete
filter. The same request sequence could delete the annotation it had just claimed.

Scope was limited: another guest's notes and markups on a shared document. Not files, not
accounts, not login.

### What changed

- The bulk path now resolves ownership before writing, and refuses the whole request with a `409`
  if any id in the batch belongs to somebody else
- The ownership read is no longer filtered by portal, so an id living in another portal is visible
  in order to be refused. Filtering first made that row invisible, and the upsert would move it
  into the caller's portal
- A failed ownership read now returns `503` instead of reading as "no such row". Previously a
  transient database error skipped the guard and let the caller take the annotation
- `document_id` is verified against the session's portal. It is a uuid foreign key the database
  accepts happily, so a guest could previously write against another portal's document
- Supplied ids must be uuids before reaching a query, which is what makes the `id=in.(...)` lookup
  safe to construct
- `GET` no longer returns `payload.guest_id`. Guests are still meant to see each other's markup —
  that is what the thread is — but the ownership key is internal and no client reads it

### Verification

Ten tests added covering both write paths, the cross-portal case, the failed-read case, the
legitimate second-guest reply, and the non-uuid id.

**Reverting the fix makes 8 of the 10 fail.** The tests are pinned to behaviour, not to the shape
of the fix.

The legitimate case is preserved: a second guest replying to somebody else's comment keeps the
original author's `guest_id`, name, type, page and comment text. Only the incoming thread is
accepted. There is a test pinning exactly that, because it is the case a careless fix would break.

---

## 2. Phone numbers formatted inconsistently — PR #31

Closed 6 October.

### What was wrong

The same number came out as `602-555-0198` in some screens and `6025550198` in others, which also
meant the two could not be matched against each other.

The cause was a marker attribute only the newer workspace and contact forms carried. Five phone
inputs never had it, so they stored exactly what was typed:

- the job form's Contact box
- the vendor phone
- the account phone
- the draft phone
- the quick-add contact tile

### What changed

`isPhoneInput()` now keys on the shape of the field — `type="tel"`, `name="phone"`, the existing
marker, the quick-add dataset — so a phone box is covered whether or not anybody remembered to tag
it. A phone input added later is covered too, which is the part that stops this recurring.

Formatting moved to `focusout`. Live formatting put a dash three characters ahead of the caret on
every keystroke, which moved it. Blur is when the number is actually finished, and it is also when
the value is read, so what a person sees is what gets saved.

### What deliberately did not change

`formatPhoneNumber` is untouched:

- Dashes appear at 10 digits, or 11 starting with a `1`. Fewer digits shows no dashes, which is
  correct — there is no number to reformat yet
- Extensions and international numbers are returned exactly as typed. `+639171234567` does not get
  US dashes imposed on it, and `602-555-0198 x214` is left intact

Tests pin both, so a later "fix" that reformats an international number would fail rather than
pass quietly.

---

## 3. Dashboard: two filters removed — PR #33

Closed 6 October.

The Workspace and Rep dropdowns are gone from the company dashboard. Range stays, because it
changes every number on the page and has no other home.

**Workspace** duplicated the left rail. Every list the dashboard reads — deals, jobs, tasks,
contacts — is already filtered to the open workspace before it reaches the page, so the dropdown
only restated where you already were.

**Rep** was a scoping control nothing was using. It sat on "Whole team" and stayed there.

Dropping Rep left three things unreachable, so they were removed rather than left as a filter with
no way to set it: `dashboardRepOptions`, `dashboardRepDisplayName`, `state.dashboardRep`, and the
`matchesRep` comparison in `dashboardContext` — which was comparing every contact, deal, job, task
and activity against a value that could now only be `'all'`.

### Kept on purpose

`isInternalDashboardRepName`, `personOwnerDisplayName` and `personOwnerLabel` read like
rep-filter code but are still load-bearing: the rep breakdown widget and every owner label go
through them. Without that sanitising, a raw `basic-quest-user` would surface on a customer's
dashboard.

---

## 4. Calls plugin: button that refused its own click — PR #35

Closed 6 October.

### What was wrong

The Calls card rendered as **Available** with a bright **Activate** button. Clicking it answered:

> This company account is not entitled to that plugin.

Two pieces of code disagreed about what company entitlement means. `renderPluginCard` treated only
a row whose status is literally `disabled` as withheld, so a **missing** row looked like an open
invitation. `setWorkspacePlugin` refuses anything not already `installed`.

### Why it was reachable

`calls` reached the plugin catalog and the database allowlist but was **never added to a plugin
preset** — not in the client, not in the database. A company seeded from any preset had no
`company_plugins` row for it at all. Nobody had to do anything wrong to hit this.

### What changed

- `withheld` is now `!entitled`, matching the handler. A plugin with no entitlement shows a locked
  button and says which of the two situations it is: turned off by Quest, or not yet enabled
- A workspace that switched its **own** plugin off still gets a working Re-enable, because that row
  exists and is the company's own decision
- `calls` added to the roofing, construction and generic presets. `blank` stays empty on purpose:
  it is somebody having chosen nothing

Two existing tests were corrected rather than deleted. One asserted that a company admin *could*
activate a plugin with no entitlement yet — which the handler has never permitted. That test was
pinning the bug.

### Verified by simulation

Every entitlement × workspace-status combination run against both old and new logic. The one
broken case now renders locked; the four working cases are unchanged.

---

## 5. CI ran the suite twice per pull request — PR #34

Closed 6 October.

The workflow triggered on both `push: branches: ['**']` and `pull_request`, so every pull request
ran the whole suite twice against the same commit SHA.

Branch protection counts every check run reported against the head SHA, and `test-and-build` is a
required check. Two consequences, both hit in practice:

- A merge could be held up by one of two identical runs — a coin flip rather than a signal
- Cancelling a stuck run turned its twin into a **cancelled** check, and GitHub refuses to override
  a cancelled required check even with admin rights

`push` is now restricted to `main`, so a merge commit is still verified in its own right and a
pull request produces exactly one required check. Concurrency is keyed on the pull request number
so the two runs share a group and a newer push supersedes both.

Six tests pin the trigger shape, including that `pull_request` survives and that `main` keeps its
push run. Reverting the workflow fails 3 of the 6.

---

## Production data changes

Two rows, both for `quest-roofing-az` ("Quest Roofing"), both reversible with a `DELETE`.

| Table | Change | Why |
|---|---|---|
| `company_plugins` | `calls` set to `installed` | The company had no row at all, which is what produced the refused Activate click |
| `ringcentral_accounts` | Row mirroring Lumen's config | See the note below |

### What was deliberately not done

Lumen's RingCentral data — **4 extension records** (named individuals), **4 presence rows**, and
**8,362 call records** — was **not** copied to Quest Roofing. Those are one tenant's data, and
moving them into another tenant's account is the exact isolation failure the tenancy matrix exists
to catch.

### Known limitation

`rc_account_id` is `~`, which is the migration's default for *unset* — not a real RingCentral
account id. **Lumen's is `~` too.** So the live call to `/restapi/v1.0/account/~/presence` cannot
succeed for either company; the code catches that and serves last-known stored statuses instead.

Lumen shows a populated board because rows were seeded for it. Quest Roofing will show
"Loading live status…" indefinitely until a real RingCentral account id is supplied and the sync
job is run. **This is not a regression introduced by the change above** — it is the pre-existing
state, made visible.

---

## Open follow-ups

**PR #28 — architecture and maintainability audit.** Documentation only, no code. Ten findings
ranked by business impact, with measurements. CI-green, waiting on review.

### Not done, and why

- **Backfill migration for other companies.** `roofph`, `laptop`, `new` and `rom` still have no
  `calls` row. A migration is written and tested but was held back: committing it fails
  `npm run tenancy:check` until `.ai/database/snapshot.json` is refreshed from the live catalog,
  and that refresh needs database access. It was judged better to ship the button fix and the
  presets now, rather than hold them behind a database round trip.
- **`supabase db push` is not safe in this repository.** A dry run failed with *"Remote migration
  versions not found in local migrations directory"* — roughly 160 applied versions in the
  database have no matching file. This is documented in `.ai/database/migration-names.md`. The
  documented process is to apply each migration under its bare name, not to use `db push`.

---

## Test suite

Green across the repository apart from one **pre-existing** failure:

`tests/task-assignee-identity.test.mjs` fails with 5 errors on a clean checkout of `main`, caused
by line-ending handling on Windows. It does not fail on CI, which runs Linux.

Roughly 40 new tests were added across the five changes.