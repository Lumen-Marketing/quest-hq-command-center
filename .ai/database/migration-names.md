# Migration names: the repository against the database

The 2026-09-17 audit found that a migration's name in `supabase/migrations/` and the name recorded
in `supabase_migrations.schema_migrations` are often not the same. 186 migrations are recorded
applied; 175 files exist. 33 applied names have no file of that name, and 22 files have no applied
row of theirs.

Most of those are the same change under two names -- the repository's `wb_item_comment_rpc` is the
database's `wb_add_item_comment` and `wb_modify_item_comment`; `client_portal_document_review_fields`
is `track_client_portal_document_review_fields_20260704`. Some are genuinely older work that was
squashed or superseded. **The link between a file and an applied row is its SQL, not its name**, so
nothing here can be resolved by matching strings, and this page does not pretend otherwise.

## Why it matters

Nothing is broken by it. The live schema is described by [snapshot.json](snapshot.json), which is
captured from the catalog rather than by reading migration files, and the tenancy check is driven by
that snapshot. What the divergence costs is traceability: you cannot answer "which file produced
this applied row" without reading SQL, and a future reconciliation cannot be automated from names.

## The rule going forward

Apply a migration under **exactly** the file's name, without the timestamp prefix:
`20260917220000_widen_run_ledger.sql` is applied as `widen_run_ledger`. Both the Supabase CLI and
the `apply_migration` tool take that name, so this costs nothing at the time and keeps the two
sides matched from here on.

## Applied to the database, no file of that name

- `accept_public_proposal_workspace`
- `add_contact_pay_type_roof_system`
- `add_contact_temperature_and_task_contact_id`
- `avatars_and_auth_bootstrap`
- `backfill_member_role_and_roles_manage`
- `calendar_and_inbox_notifications`
- `client_portal_delete_policies`
- `client_portal_review_upgrade`
- `client_portal_scale_unit`
- `company_contact_field_values_rename`
- `company_records_field_type_rewrite`
- `company_setup_apply_uses_role_permission_helper`
- `company_setup_role_permissions_helper`
- `contact_relationship_type`
- `contacts_structured_address`
- `create_company_workspace_seeds_member_role`
- `fix_create_operational_workspace_auto_default`
- `fix_price_book_company_plugin_allowlist_20260704`
- `harden_finance_attachments_bucket`
- `harden_rls_workspace_invite`
- `onboarding_and_approval_console`
- `prevent_manager_self_privilege_escalation`
- `relax_avatar_storage_policies`
- `security_hardening_revoke_public_execute`
- `seed_company_default_roles`
- `seed_default_roles_only_when_created`
- `storage_allow_office_documents_and_zip`
- `track_client_portal_document_review_fields_20260704`
- `track_contacts_structured_address_fields_20260704`
- `update_own_profile_rpc`
- `wb_add_item_comment`
- `workspace_app_library_shared_only`
- `workspace_builder_state`

## In the repository, no applied row of that name

- `accept_company_invite`
- `client_portal_document_review_fields`
- `client_portal_scale_unit_not_null`
- `company_calendar_events`
- `company_record_field_type_rewrite`
- `company_setup_role_fixes`
- `contacts_structured_address_fields`
- `default_roles_and_roles_manage`
- `fix_create_workspace_company_id_ambiguity`
- `fix_privilege_escalation_roles_invites`
- `harden_demo_rls_leftovers`
- `live_inbox_notifications`
- `owner_worker_onboarding`
- `profile_avatar_upload_fix`
- `quest_auth_bootstrap`
- `quest_auth_email_autoconfirm`
- `quest_profile_avatars`
- `sms_messaging`
- `taskmanagement_phase2_runtime_delta`
- `taskmanagement_phase3_tenant_hardening`
- `wb_item_comment_rpc`
- `workspace_approval_console`

Reconciling these means reading each file against the live catalog and recording the pair. It is
worth doing before anyone relies on the names -- for a rollback, an audit, or a rebuild from
migrations alone -- and it is not urgent while the snapshot remains the source of truth.
