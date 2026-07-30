# Database overview

The live Supabase public catalog was captured 2026-07-29T22:52:09.000Z. The [machine-readable snapshot](snapshot.json) contains catalog metadata only; it has no production rows, auth-user records, storage object paths, or credentials.

## Catalog summary

- Public tables/views: 76
- Foreign-key column relationships: 194
- RLS policies: 224
- Public functions: 64
- Triggers: 91
- Storage buckets: 6
- Applied migration ledger entries: 86
- Latest live ledger entry: `20260729224956_operational_workspace_persistence`

## Operational-workspace identity

`workspaces.icon_image` stores a validated PNG, JPEG, or WebP data URL for shared uploaded
workspace icons; an empty value selects the built-in `icon_key`. The create and update RPCs
accept that field through backward-compatible trailing parameters. The authorized
`set_default_operational_workspace(uuid)` RPC serializes each company's change and atomically
clears the old default before selecting an active replacement.

## Live P0 database state

Two reviewed forward migrations are live and newer than the committed full catalog snapshot:

- `20260730180045_atomic_contact_to_quote.sql` adds a unique request id to Quotes and an authenticated, workspace-authorized `convert_contact_to_quote(text, uuid)` transaction. Retries return the same linked account, site, quote, and activity; an intentional extra quote uses a new request id.
- `20260730181000_pipeline_stage_seed_repair.sql` repairs only missing pipeline kinds. It first copies that company's own default-workspace stages and uses baseline starting stages only when the kind remains entirely absent. The operational-workspace creation RPC applies the same per-kind behavior for future workspaces.

Supabase recorded them as `20260730183658_atomic_contact_to_quote` and `20260730183713_pipeline_stage_seed_repair`. Targeted catalog verification confirmed the column, index, grants, function security mode, per-kind creation guard, and zero missing required pipeline kinds in active workspaces.

## Live lifecycle hardening migration

`20260730213315_additional_command_center_hardening.sql` is in the live Supabase ledger.
It adds nullable `company_subscriptions.terminal_status`, keeps the
legacy `status` vocabulary intact, and exposes lifecycle-v2 platform/review RPCs that return
the effective status. A trigger enforces the legacy/canonical projection, audit-aware
backfill classifies only provable manual terminal actions, and subscription access rejects
every non-null terminal state. The migration preserves the existing function authorization,
fixed search paths, revokes, and authenticated/service-role grants.

Live verification found seven Active and two legacy Canceled subscriptions; the two terminal
rows classify as Archived, with zero lifecycle invariant violations. Rollback-only probes
confirmed that manual archive/reject decisions survive Stripe events and that an exact
Stripe-event retry cannot undo a later platform reactivation.

## Launch-critical onboarding state

`company_invites` records selected operational workspace ids and email delivery state. `accept_company_invite` validates the invite recipient, refuses to mutate an already-active member, folds Owner/Admin/Developer invites down to Member, clears prior custom assignments, inserts only a verified non-elevated role, and creates active `workspace_memberships`. Empty legacy workspace selections fall back to the company default workspace.

The active `send-company-invite` Edge Function accepts only an invite id, derives recipient/content server-side, checks the caller's active Owner/Admin/Developer membership, and records sent/failed delivery status without invalidating the invite. Browser CORS is restricted to the production Vercel origin and Questbase domains.

## User preference state

`profiles.appearance_prefs` (jsonb, default `{}`) carries the signed-in user's theme mode,
accent, background preset and card styling so appearance follows them between devices. It is
written only through `update_own_appearance(jsonb)` — SECURITY DEFINER, `search_path = ''`,
keyed on `auth.uid()` — which whitelists and coerces every field, so a tampered client
payload cannot store arbitrary data. A `pg_column_size(appearance_prefs) <= 2048` check
constraint keeps the column from being used as a blob store; uploaded background images are
deliberately not stored here. Added in `202607291200_profile_appearance_sync.sql`.

`companies.appearance_prefs` carries a company default through the separately authorized
`update_company_appearance(text, jsonb)` RPC. A member's saved preference wins; otherwise the
company default is inherited.

## Recoverable business-record history

`record_history` is an append-only, workspace-scoped history ledger for Contacts, Quotes,
Jobs, and Tasks. Database triggers capture created, updated, deleted, and restored events
using a strict field allowlist that excludes phone, email, address, notes, and descriptions.
Signed-in users can only read history when they belong to the matching active workspace and
hold the module's view permission.

The existing 30-day Recycle Bin remains the durable recovery path. `recycle_undo_item(text)`
adds a narrower immediate Undo path that is limited to the deleting user, ten minutes,
the original tenant/workspace, and the source module's current permission check.

## Maps

- [Schema](schema.md)
- [Relationships](relationships.md)
- [Functions](functions.md)
- [Security](security.md)
- [Storage](storage.md)
- [Refresh queries](introspection.sql)
- [Machine snapshot](snapshot.json)
