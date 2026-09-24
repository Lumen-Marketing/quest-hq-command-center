# Plan — Seed a Manager role (Area 1 of the roles enhancement)

Status: **approved (only area in scope), queued awaiting database access**. Written 2026-09-24.
Owner chose "the first choice" in `docs/superpowers/specs/2026-09-24-roles-and-permissions-enhancement.md`:
Manager seeded as an immutable system role. Areas 2–4 of the proposal remain unapproved.

## Why

Every company is seeded exactly two system roles by `app_private.seed_company_default_roles`:
Owner (`*`) and Member (12 keys). `ROLE_PERMISSIONS.manager` in `src/main.js:581` is 35 keys
for a role that only exists as a demo/local fallback — there is no Manager role in the
database, so nothing can be assigned it on invite.

Manager is the whole reason `apps`-style work exists in the product: somebody who can run the
operation (jobs, tasks, files, approvals, calendar incl. team, price book reads, finance read,
roles/workspaces build) without owning the company or inheriting `*` by rank.

## The change

One forward-only migration, `seed-manager-role.proposed.sql`:

1. Replaces `app_private.seed_company_default_roles` with the Owner/Member blocks unchanged and
   a new Manager block: `is_system = true`, priority `500` (between Member 100 and Owner 1000),
   distinct colour `#3b82f6`, and the 35 keys from `ROLE_PERMISSIONS.manager` verbatim.
   Grants are only issued for a role this function CREATED — a hand-made `manager` is never
   topped up, the same create-only rule Member already has.
2. Backfills every existing company with the existing idempotent DO-loop pattern
   (`perform seed_company_default_roles(id, null)`).
3. No RLS change. Roles are read by members, managed via `roles.manage`; Manager inherits
   nothing by rank so its 35 keys are exactly what it does. `guard_system_role` already exists
   and makes `is_system = true` roles Owner-editable only.

## Client side (already in the repo)

- `tests/default-roles-and-roles-manage.test.mjs` grows a drift test pinning the seeded keys
  to `ROLE_PERMISSIONS.manager`, mirroring the existing Member pin.
- No other client change: the invite dropdown and role editor read roles from the database and
  only block `owner`/`admin`/`developer` by name, so Manager is offered automatically.

## Apply order (needs live catalog access)

1. Apply the SQL through supabase. Round-trip the file as
   `supabase/migrations/<timestamp>_seed_manager_role.sql` so the migration ledger sees it;
   delete the `.proposed.sql` copy.
2. Re-run `npm run check` (the drift test reads the file it lands as).
3. Refresh `.ai/database/snapshot.json` from live so `captured_at` moves past the new
   migration's date; the tenancy gate refuses a green run over a stale snapshot.
4. Update `.ai/manifest.json` (`latest_migration`, `supabase_latest_migration`) and
   `.ai/current-state.md`, then smoke production.

## Risks, and what is done about each

| Risk | Mitigation |
| --- | --- |
| Manager escalates the same way Member once did | Same create-only guard; `guard_system_role` and `guard_wildcard_permission` already exist; Manager's keys contain no `*` and no `users.manage`/`roles.manage` |
| A hand-made `manager` gets widened | Grants live inside `if manager_role_id is null then`, mirroring Member's proven rule |
| Drift between seed and product preset | New test pins every `ROLE_PERMISSIONS.manager` key against the migration file |
| Key not recognized by the Roles editor | Every seeded key already exists in `PERMISSION_KEYS` (`src/main.js:585`); no new keys introduced |

## Open (unapproved) decisions from the proposal

- Area 2 `recycle.view/manage` keys: in scope or dropped?
- Area 3 Viewer preset: office read-only template.
- Area 4 deny UI + effect-aware RPC.
- Landing order.