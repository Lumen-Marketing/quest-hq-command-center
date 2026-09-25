# Plan — Seed a Manager role (Area 1 of the roles enhancement)

Status: **approved (only area in scope), queued awaiting database access**. Written 2026-09-24.
Owner chose "the first choice" in `docs/superpowers/specs/2026-09-24-roles-and-permissions-enhancement.md`:
Manager seeded as an immutable system role. Areas 2–4 of the proposal remain unapproved.

## Why

Every company is seeded exactly two system roles by `app_private.seed_company_default_roles`:
Owner (`*`) and Member (12 keys). `ROLE_PERMISSIONS.manager` in `src/main.js:581` is 36 keys
for a role that only exists as a demo/local fallback — there is no Manager role in the
database, so nothing can be assigned it on invite.

Manager is the whole reason `apps`-style work exists in the product: somebody who can run the
operation (jobs, tasks, files, approvals, calendar incl. team, price book reads, finance read,
roles/workspaces build) without owning the company or inheriting `*` by rank.

## The change

One forward-only migration, `seed-manager-role.proposed.sql`:

1. Replaces `app_private.seed_company_default_roles` with the Owner/Member blocks unchanged and
   a new Manager block: `is_system = true`, priority `500` (between Member 100 and Owner 1000),
   distinct colour `#3b82f6`, and the 36 keys from `ROLE_PERMISSIONS.manager` verbatim.
   Grants are only issued for a role this function CREATED — a hand-made `manager` is never
   topped up, the same create-only rule Member already has.
2. Keeps `set search_path = ''` on the replaced function.
   `20260901200003_harden_remaining_app_private_search_paths` set
   `app_private.seed_company_default_roles(text, uuid)` to an empty search path, and
   `create or replace function` re-applies whatever path the new body names. Writing
   `set search_path to 'public', 'pg_temp'` there would have un-hardened a SECURITY DEFINER
   function on every apply. The body is already schema-qualified, so nothing is lost. Verified:
   no migration after `20260901200003` has redefined or re-altered the function.
3. Backfills every existing company with the existing idempotent DO-loop pattern
   (`perform seed_company_default_roles(id, null)`).
4. No RLS change. Roles are read by members, managed via `roles.manage`; Manager inherits
   nothing by rank so its 36 keys are exactly what it does. `guard_system_role` already exists
   and makes `is_system = true` roles Owner-editable only.

## Permission set decision: `time.track`

Review asked whether Manager's missing `time.track` was intended — Member has it, Manager only
had `clock.manage`. They are two separate modules, not elevations of one another:

| Key | Module | Scope |
| --- | --- | --- |
| `time.track` | My time (`src/main.js:1324`) | log your own hours |
| `clock.manage` | Clock dashboard (`src/main.js:1328`) | the whole team's hours |

A Manager holding only `clock.manage` could approve the team's time but not log their own,
which contradicts the role's own rule ("a manager does the work a member does and can also run
the operation"). `time.track` is therefore added to `ROLE_PERMISSIONS.manager`, taking it from
35 keys to 36. **Awaiting reviewer confirmation.**

## Client side (already in the repo)

- `tests/default-roles-and-roles-manage.test.mjs` grows a drift test pinning the seeded keys
  to `ROLE_PERMISSIONS.manager`, mirroring the existing Member pin. It compares the two as
  sets in **both** directions, so a key the product dropped cannot linger in the seed.
- `supabase/probes/default_roles_and_modules_readonly.sql` asserts the Manager contract, scoped
  to `is_system` roles so a hand-made `manager` is not a false failure, and reports rather than
  failing until the seed is applied. A test pins the probe's hardcoded key lists to
  `src/main.js` so the probe cannot verify a stale contract.
- No other client change: the invite dropdown and role editor read roles from the database and
  only block `owner`/`admin`/`developer` by name, so Manager is offered automatically.

## Apply order (needs live catalog access)

1. Apply the SQL through supabase. Round-trip the file as
   `supabase/migrations/<timestamp>_seed_manager_role.sql` so the migration ledger sees it;
   delete the `.proposed.sql` copy.
2. Re-run `npm run check` (the drift test reads the file it lands as, from either location).
3. Refresh `.ai/database/snapshot.json` from live so `captured_at` moves past the new
   migration's date; the tenancy gate refuses a green run over a stale snapshot.
4. Update `.ai/manifest.json` (`latest_migration`, `supabase_latest_migration`) and
   `.ai/current-state.md`, then smoke production.
5. Run `supabase/probes/default_roles_and_modules_readonly.sql` to confirm live Manager state.

## Risks, and what is done about each

| Risk | Mitigation |
| --- | --- |
| Manager escalates the same way Member once did | Same create-only guard; `guard_system_role` and `guard_wildcard_permission` already exist; Manager's keys contain no `*` and no `users.manage`/`roles.manage` |
| A hand-made `manager` gets widened | Grants live inside `if manager_role_id is null then`, mirroring Member's proven rule |
| Drift between seed and product preset | Test asserts the two key sets are **equal**, not merely that the preset is a subset of the seed |
| The replacement un-hardens the seeder | `set search_path = ''` retained; a test asserts it, asserts the body stays schema-qualified, and asserts no later migration redefines the function |
| The probe verifies a contract the product no longer ships | Test pins the probe's `expected_manager` / `expected_member` to `src/main.js` |
| Key not recognized by the Roles editor | Every seeded key already exists in `PERMISSION_KEYS` (`src/main.js:585`); no new keys introduced |
| A Manager cannot log their own time | `time.track` added alongside `clock.manage` (see above) |

## Open (unapproved) decisions from the proposal

Areas 2–4 stay proposals. Nothing in this change implements them.

- Area 2 `recycle.view/manage` keys: in scope or dropped?
- Area 3 Viewer preset: office read-only template.
- Area 4 deny UI + effect-aware RPC.
- Landing order.

## Out of scope for this change

Identity and operational ownership. The Manager role defines what a person is **authorized** to
do; it is not the mechanism that decides operational ownership. Execution owner, decision
owner, approver, blocker, next-step owner, and review responsibility are a separate migration
(`fix/task-identity-ui-stabilization`, PR #25) and are deliberately untouched here.
