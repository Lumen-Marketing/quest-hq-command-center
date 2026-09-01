# Database overview

The full machine-readable Supabase catalog was refreshed through 2026-09-01T20:02:47.185039Z.
The [machine-readable snapshot](snapshot.json) contains catalog metadata
only; it has no production rows, auth-user records, storage object paths, or credentials.

## 2026-09-01 app_private search-path hardening

Migration `20260901200003_harden_remaining_app_private_search_paths.sql` removes the remaining
mutable schemas from seven SECURITY DEFINER helpers whose references were already fully qualified.
It changes only each routine's `search_path`; bodies, owners, grants, volatility and trigger
bindings stay intact. Production verification found 7/7 empty paths, 3/3 trigger bindings and
successful direct probes for the three callable chat visibility helpers.

## 2026-08-29 record actor index

Migration `20260828191625_add_wb_records_created_by_index.sql` adds
`wb_records_created_by_idx` on `public.wb_records(created_by)`. This is the covering index for
the table's profile foreign key, preventing profile deletion or reference checks from scanning
every App Builder record. The migration is live, the index definition was re-queried from
`pg_indexes`, and the catalog snapshot below was refreshed after that verification.

## 2026-08-27 priority migrations

The permission split and recycle migrations are applied to production. A third forward-only
reconciliation migration records the final catalog shape independently of application order:

- `20260826090000_company_contacts_permission_split.sql` centralizes legacy/granular Company
  Contacts permission aliases in `app_private.has_company_permission` and makes the policies use
  only their exact granular operation key.
- `20260827100000_company_contact_field_recycle.sql` adds soft-delete metadata to
  `company_contact_fields`, limits normal reads to active definitions, revokes direct browser
  DELETE, and registers the source with the existing Recycle Bin functions.
- `20260827110000_company_contact_permission_reconcile.sql` removes the superseded broad policies,
  prevents browser writes from setting recycle metadata directly, splits the retained options
  catalogue's write policy by operation, and indexes the new `deleted_by` foreign key.

Post-migration catalog verification confirmed the aliases, active-only policies, recycle metadata,
revoked DELETE grant and both field indexes. The live migration versions are recorded in the
manifest after the final reconciliation is applied.

Supabase recorded the three forward changes as `20260826195655_company_contact_field_recycle`,
`20260826195746_company_contacts_permission_split`, and
`20260826195939_company_contact_permission_reconcile`. Security advisors reported no finding tied
to the changed objects. Performance advisors reported only the expected new/unused index notices;
the duplicate-policy warnings seen between the second and third migration were removed by the
reconciliation.

## Catalog summary

- Public tables/views: 89
- Foreign-key column relationships: 229
- RLS policies: 271
- Public functions: 79
- Triggers: 103
- Storage buckets: 6
- Applied migration ledger entries: 129
- Latest live ledger entry: `20260826195939_company_contact_permission_reconcile`

## Operational-workspace identity

`workspaces.icon_image` stores a validated PNG, JPEG, or WebP data URL for shared uploaded
workspace icons; an empty value selects the built-in `icon_key`. The create and update RPCs
accept that field through backward-compatible trailing parameters. The authorized
`set_default_operational_workspace(uuid)` RPC serializes each company's change and atomically
clears the old default before selecting an active replacement.

## Guided workspace setup

`workspace_setup_profiles` stores questionnaire answers, editable draft, last applied plan,
reset history, and an optimistic mutation revision for one `workspaces.id`. Signed-in company administrators may read that
workspace's row; writes go only through fixed-search-path RPCs. `save_workspace_setup_draft`
changes no configuration. `apply_workspace_setup` validates exactly one bounded target,
known apps, pipeline stages, and role templates and applies them atomically and idempotently.
It preserves sibling workspaces, manual apps and their configuration, populated pipelines,
and explicitly disabled company entitlements. It blocks an unmanaged CRM/Quest CRM conflict
instead of activating both. `reset_workspace_setup` clears only that workspace's answers and draft;
the applied configuration and every tenant/business record remain intact.

New companies still receive an active default `Main` workspace from the existing database
trigger, and the UI opens this workspace-specific setup immediately. The first and every later
operational workspace start blank and open their own survey. Draft, apply, and reset reject stale
revisions from another tab or device. A rollback-only production test passed truly blank company
creation, repeated apply, manual-app configuration/provenance, disabled-entitlement handling,
mutually exclusive CRM blocking, stale-write rejection, and reset, then proved that no probe
company, workspace, or setup row survived. The latest provider ledger entries are
`20260810181935_workspace_setup_release_hardening` and
`20260810182232_workspace_setup_revision_save_fix`.

## Live P0 database state

Two reviewed forward migrations are live and newer than the committed full catalog snapshot:

- `20260730180045_atomic_contact_to_quote.sql` adds a unique request id to Quotes and an authenticated, workspace-authorized `convert_contact_to_quote(text, uuid)` transaction. Retries return the same linked account, site, quote, and activity; an intentional extra quote uses a new request id.
- `20260730181000_pipeline_stage_seed_repair.sql` repairs only missing pipeline kinds. It first copies that company's own default-workspace stages and uses baseline starting stages only when the kind remains entirely absent. The operational-workspace creation RPC applies the same per-kind behavior for future workspaces.

Supabase recorded them as `20260730183658_atomic_contact_to_quote` and `20260730183713_pipeline_stage_seed_repair`. Targeted catalog verification confirmed the column, index, grants, function security mode, per-kind creation guard, and zero missing required pipeline kinds in active workspaces.

## Live advisor hardening

`20260820201503_harden_setup_function_and_foreign_keys.sql` is live in the provider ledger as
`20260820201554_harden_setup_function_and_foreign_keys`. It pins
`app_private.company_setup_role_permissions(text)` to an empty search path and adds the 21
foreign-key indexes identified by the performance advisor. Targeted live verification confirmed
the function configuration and all 21 indexes. The migration changes neither foreign-key
behavior nor application rows.

The committed full catalog snapshot below predates this migration. Its tracked public function,
policy, table, trigger, bucket, and relationship shapes are unaffected because the changed helper
is private-schema and the snapshot does not catalog indexes; use the live ledger and this section
for the newer migration's exact status.

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
