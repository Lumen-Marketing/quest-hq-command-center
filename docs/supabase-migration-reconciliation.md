# Supabase migration history reconciliation

## Current production state

Production project `rqundirizvojpzhljtdn` is healthy, but its migration ledger predates the repository's current timestamp convention. The SQL names generally match the committed migrations while the recorded versions do not. Examples observed on 2026-07-10:

| Repository file | Production ledger |
| --- | --- |
| `202607081200_workspace_app_library.sql` | `20260708020623_workspace_app_library` |
| `202607081400_wb_item_comment_rpc.sql` | `20260708024032_wb_add_item_comment` |
| `202607081500_wb_modify_item_comment.sql` | `20260708024846_wb_modify_item_comment` |
| `202607081600_enable_realtime_core_tables.sql` | `20260708030051_enable_realtime_core_tables` |
| `202607081800_profile_avatar_upload_fix.sql` | `20260708034747_relax_avatar_storage_policies` plus `20260708034839_update_own_profile_rpc` |

This means `supabase migration list --linked` cannot be treated as a clean reproducibility proof even though production has the intended schema.

## Safety rule

Do not rename already-applied files, delete rows from `supabase_migrations.schema_migrations`, or mark historical versions applied/reverted directly in production. Some repository files combine SQL that production recorded as separate changes, so a mechanical version rewrite could make the ledger claim SQL ran when it did not.

All new work is forward-only:

1. Give each new migration a unique timestamp and descriptive name.
2. Dry-run the complete SQL inside `BEGIN … ROLLBACK` against production or, when Supabase Branching is available, against a disposable branch.
3. Apply the migration once through the Supabase migration API.
4. Record the returned production version and keep future repository migrations ordered after it.
5. Never edit an applied migration; add a corrective migration.

## Full reconciliation procedure

Perform this as a separate maintenance operation, not during a feature deploy:

1. Create a Supabase development branch or a temporary project from a fresh production backup.
2. Export the production schema and migration ledger.
3. Build a new baseline migration from that schema, excluding Supabase-managed schemas and data.
4. Apply the baseline to a second empty branch and run schema diff, RLS/grant inspection, generated-type diff, tests, and advisors.
5. Archive the pre-baseline repository migrations without changing production history.
6. Only after the empty-branch replay is identical, use the supported Supabase migration-repair command to mark the baseline at the agreed cutover version.

Branch creation currently requires a separate cost confirmation and the connector's branch-list call returned `Project reference is missing when validating permissions`, so this rollout uses the safe transaction rollback dry-run and leaves historical metadata untouched.
