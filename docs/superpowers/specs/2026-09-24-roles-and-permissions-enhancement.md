# Roles and permissions enhancement — proposal

Status: **Area 1 approved — Manager as an immutable system role — and queued awaiting database
access** (migration + drift test written; see `.ai/plans/seed-manager-role.md`). Areas 2–4
remain proposals for owner review. No migration or client change has been applied yet.
Date: 2026-09-24. Sources: `src/main.js`, `supabase/migrations`, `.ai/database/security.md`.

## Why now

The review of current roles/permissions surfaced four gaps worth closing. Three are small and
safe; one is the real project. Each is proposed separately below with a recommendation, so
scope can be mixed and matched before any migration is written.

Authorization already has a sound spine. The server (`app_private.has_company_permission`,
`app_private.has_workspace_permission`) and the client (`can()` in `src/main.js:41761`) both
evaluate deny-vetoes-allow, honour a `*` wildcard, and treat Owner/Admin/Developer by rank.
The guard triggers refuse non-owners granting `*` or touching system roles. This proposal
extends that spine; it does not touch the evaluate-order or the tenancy boundary.

## Current state (evidence)

- Every company is seeded exactly two system roles by `seed_company_default_roles`
  (`202608082000`): **Owner** = `*`, **Member** = 12 keys copied verbatim from
  `ROLE_PERMISSIONS.member` (`src/main.js:582`). There is **no Manager role in the database**;
  `ROLE_PERMISSIONS.manager` (35 keys) only exists as a demo/local fallback.
- Guided-setup role templates exist as `app_private.company_setup_role_permissions(role_key)`
  (`202608082400`): cold_caller, salesperson, estimator, production_coordinator, field_crew,
  office_finance. All are allow-lists with no read-only tier.
- `role_permissions.effect` accepts `'allow'` and `'deny'`, and both evaluators already honour
  deny. But **nothing can write a deny row**: the Roles editor posts a flat key list and
  `save_company_role(p_role, p_permissions)` re-inserts every key as `'allow'`
  (`202607101200`). A tri-state UI plus an effect-aware RPC is the sole missing piece.
- The permission catalog (`PERMISSION_KEYS`) is already unusually granular; the one historical
  wart — a `reporting.view` key no module gates on — was removed. New keys without a matching
  RLS/RPC enforcement point would recreate exactly that wart.

## Area 1 — Seed a Manager role (recommended)

Make Manager a real third system role so it can be **assigned on invite**, not just
referenced by demo fallback.

- Extend `app_private.seed_company_default_roles` to also create `Manager`
  (`is_system = true`, priority ~500, distinct colour) with the 35 keys already canonised in
  `ROLE_PERMISSIONS.manager` (`src/main.js:581`).
- Backfill every existing company by re-running the helper (the existing DO-loop pattern).
- No RLS change: roles are read by members, managed via `roles.manage`. Manager is not
  elevated — it inherits nothing by rank, so its 35 keys are exactly what it does.
- Client: keep `ROLE_PERMISSIONS.manager` as the single source of truth the seed is generated
  from (drift test already exists for Member; extend to Manager).
- `accept_company_invite` already "inserts only a verified non-elevated role"; Manager is
  non-elevated, so invites can offer it unchanged.
- Note: system roles are immutable in the editor. A company that wants a tailored Manager
  creates a custom role, as today with Member.

## Area 2 — Granular permission keys (small, opt-in)

Recommendation: add **only keys that map to an enforcement point that exists today**. Anything
else is checkbox theatre. Two qualify:

| Key | Enforcement point | Today | After |
| --- | --- | --- | --- |
| `recycle.view` | `recycle_bin_items` SELECT | workspace-admin rank only | role can open The Recycle Bin (read + restore within their own delete/undo rules) |
| `recycle.manage` | `recycle_bin_items` ALL / purge | workspace-admin rank only | role can restore and permanently delete |

Other split candidates (per-table finance, per-import price book) were consciously *excluded*:
the per-table `finance_*` policies exist but the UI has no distinct screens, so the keys would
describe nothing a member can see differently.

If approved, `recycle.*` follows the `company_contacts.*` precedent exactly: alias keep
(`recycle.manage` and rank keep working), PERMISSION_ALIASES, RLS rewritten to
`has_company_permission(company_id, key)`, and the default Member list unchanged (Member does
not get recycle keys).

## Area 3 — Lighter/middle presets (recommended, small)

- **Viewer** — a read-only template (jobs.view, tasks.view, files.view, forms.view,
  calendar.view, approvals.view, users.view, messages.view, price_book.view, team.view) for
  office staff / accountants who may not file records or send mail. No writes, no CRM on it.
- Add it to `company_setup_role_permissions` **and** to the invite role dropdown, mirroring how
  Member/Manager are offered.
- Deliberately no "super-lite": Member is already the worker default; a second near-empty tier
  buys nothing but confusion.

## Area 4 — Real deny support end-to-end (the project)

Deny is already evaluated by both sides; the gap is that it cannot be written, read, or
explained.

- **DB**: new `save_company_role` shape. Replace `p_permissions text[]` with
  `p_permissions jsonb` carrying `{key, effect}` (or add a second array). The function must
  still delete-and-reinsert (its atomic replace semantics), validate `effect`, and run inside
  the existing `roles.manage` + trigger guards. Keep the old signature working or sequence the
  client change to land first.
- **Client editor** (`Roles` UI in `src/settings`): the permission list becomes tri-state —
  unset / allow / deny per key. Loading already filters role rows to submit; change it to read
  `effect` (`src/main.js:23083`). The save path (`saveRole`, `:33280`) must read the state, not
  a flat `data.getAll('permissions')`. `can()` needs no change — it already denies correctly.
- **Model/state**: `normalizeRolePermission` already tolerates `deny`
  (`src/main.js:44318`), so the leak is only in the editor UI and the RPC.
- **Guards to keep**: `guard_wildcard_permission` runs per row; a `deny` row for `*` is
  nonsense — reject `deny` for `permission_key = '*'`.
- **Explain**: the permissions screen should surface "denied by role X" the way it already
  explains allow, so an administrator removing a deny can find where it came from.

## Rollout (the guardrail you chose)

Every area lands as a forward migration + backfill + tests, following operations.md:

1. Migration per area, forward-only, reviewed against live before writing.
2. Backfill loops modelled on the existing idempotent `seed_company_default_roles` pattern —
   never top-up a role this function did not create.
3. Drift prevention: extend the existing default-roles test to pin Manager keys and the
   new setup templates; extend the "every module gate is in PERMISSION_KEYS" test for any new
   key.
4. `npm run check` (tests + ai:check + tenancy + build) before and after.
5. Database map refresh + `.ai` current-state + decisions.md entry.

## Open decisions for you

1. Manager as an immutable system role (recommended) or an editable template like
   `office_finance`? **Decided 2026-09-24: immutable system role. Area 1 approved and queued.**
2. `recycle.view/manage` in scope, or Area 2 dropped entirely?
3. Deny UI: tri-state checkboxes on every row (recommended) or a per-key toggle?
4. Landing order: proposal says 1 → 3 → 4 → 2 (small wins first, deny last). Agree?

## Non-goals

- No change to the Owner/Admin/Developer rank bypass.
- No new super-permissions; `*` stays Owner-only.
- No cross-company or resource-ACL rewiring.
- No change to default Member permissions.