# Public functions

Captured through 2026-09-01T20:02:47.185039Z from the live catalog. Execute grants are catalog facts; SECURITY DEFINER routines still require their internal authorization checks.

| Function | Returns | Definer | anon | authenticated | service_role |
| --- | --- | --- | --- | --- | --- | --- |
| `accept_company_invite(invite_token text)` | text | yes | no | yes | yes |
| `accept_public_proposal(proposal_token text, signer_name text, signer_email text, decision text)` | jsonb | yes | no | no | yes |
| `apply_company_plugin_preset(target_company_id text, preset_code text)` | text[] | yes | no | yes | yes |
| `apply_company_setup(target_company_id text, p_answers jsonb, p_plan jsonb)` | jsonb | yes | no | yes | yes |
| `apply_stripe_subscription_event(p_event_id text, p_event_created_at timestamp with time zone, p_company_id text, p_customer_id text, p_subscription_id text, p_status text, p_current_period_end timestamp with time zone, p_trial_ends_at timestamp with time zone)` | boolean | yes | no | no | yes |
| `apply_workspace_plugin_preset(target_workspace_id uuid, preset_code text)` | text[] | yes | no | yes | yes |
| `apply_workspace_setup(target_workspace_id uuid, p_answers jsonb, p_plan jsonb, p_expected_revision integer)` | jsonb | yes | no | yes | yes |
| `assign_wo_number(company text)` | integer | yes | no | yes | yes |
| `can_manage_roles()` | boolean | yes | no | yes | yes |
| `can_view_team()` | boolean | yes | no | yes | yes |
| `clear_message_conversation(target_conversation_id uuid)` | timestamp with time zone | yes | no | yes | yes |
| `consume_rate_limit(p_bucket text, p_limit integer, p_window_seconds integer)` | jsonb | yes | no | no | yes |
| `convert_contact_to_quote(p_contact_id text, p_request_id uuid)` | jsonb | no | no | yes | yes |
| `convert_deal_to_job(p_job jsonb, p_deal jsonb)` | jsonb | yes | no | yes | yes |
| `create_company_workspace(company_name text, preset_code text, icon_key text, owner_email text)` | text | yes | no | yes | yes |
| `create_operational_workspace(target_company_id text, workspace_name text, preset_code text, icon_key text, icon_image text)` | uuid | yes | no | yes | yes |
| `current_company_ids()` | text[] | yes | no | yes | yes |
| `current_member_id()` | text | yes | no | yes | yes |
| `current_profile_role()` | text | yes | no | yes | yes |
| `delete_company_role(p_role_id uuid)` | boolean | yes | no | yes | yes |
| `delete_company_workspace(target_company_id text)` | void | yes | no | yes | yes |
| `delete_workspace(target_workspace_id uuid)` | jsonb | yes | no | yes | yes |
| `handle_new_user()` | trigger | yes | no | no | yes |
| `is_platform_admin()` | boolean | yes | no | yes | yes |
| `job_files_refresh_job_count()` | trigger | no | yes | yes | yes |
| `leave_company(target_company_id text)` | company_memberships | no | no | yes | yes |
| `leave_message_conversation(target_conversation_id uuid)` | timestamp with time zone | yes | no | yes | yes |
| `list_platform_backup_copies(filter_company_id text, filter_status text, filter_kind text)` | TABLE(id text, backup_id text, company_id text, company_name text, owner_profile_id uuid, owner_email text, created_by uuid, created_by_label text, kind text, status text, size_bytes bigint, record_counts jsonb, source_table text, original_created_at timestamp with time zone, deleted_at timestamp with time zone, deleted_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone) | yes | no | yes | yes |
| `list_platform_companies()` | TABLE(company_id text, company_name text, short_name text, color text, label text, pill text, icon_key text, status text, plan_code text, amount_cents integer, currency text, owner_profile_id uuid, owner_name text, owner_email text, member_count integer, active_member_count integer, pending_member_count integer, disabled_member_count integer, trial_ends_at timestamp with time zone, current_period_end timestamp with time zone, grace_ends_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone) | yes | no | yes | yes |
| `list_platform_companies_v2()` | TABLE(company_id text, company_name text, short_name text, color text, label text, pill text, icon_key text, status text, plan_code text, amount_cents integer, currency text, owner_profile_id uuid, owner_name text, owner_email text, member_count integer, active_member_count integer, pending_member_count integer, disabled_member_count integer, trial_ends_at timestamp with time zone, current_period_end timestamp with time zone, grace_ends_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone) | yes | no | yes | yes |
| `list_platform_company_members(target_company_id text)` | TABLE(company_id text, profile_id uuid, member_id text, full_name text, email text, role text, role_label text, role_id uuid, status text, created_at timestamp with time zone, updated_at timestamp with time zone, disabled_at timestamp with time zone, left_at timestamp with time zone, last_active_at timestamp with time zone) | yes | no | yes | yes |
| `list_workspace_app_library()` | jsonb | yes | no | yes | yes |
| `list_workspace_reviews()` | TABLE(company_id text, company_name text, status text, plan_code text, amount_cents integer, currency text, owner_profile_id uuid, owner_name text, owner_email text, trial_ends_at timestamp with time zone, current_period_end timestamp with time zone, grace_ends_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone) | yes | no | yes | yes |
| `list_workspace_reviews_v2()` | TABLE(company_id text, company_name text, status text, plan_code text, amount_cents integer, currency text, owner_profile_id uuid, owner_name text, owner_email text, trial_ends_at timestamp with time zone, current_period_end timestamp with time zone, grace_ends_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone) | yes | no | yes | yes |
| `lookup_company_invite(invite_token text)` | TABLE(company_id text, company_name text, email text, status text, expires_at timestamp with time zone) | yes | no | no | yes |
| `manage_platform_company(target_company_id text, platform_action text, review_note text)` | text | yes | no | yes | yes |
| `mark_platform_backup_copy_deleted(copy_id text)` | text | yes | no | yes | yes |
| `message_touch_conversation()` | trigger | yes | no | no | yes |
| `mirror_workspace_backup_copy()` | trigger | yes | no | no | yes |
| `permanently_delete_platform_backup_copy(copy_id text)` | text | yes | no | yes | yes |
| `promote_company_owner(target_company_id text, target_profile_id uuid)` | company_memberships | no | no | yes | yes |
| `public_proposal_by_token(proposal_token text)` | jsonb | yes | no | no | yes |
| `purge_expired_recycle_bin(p_limit integer)` | integer | yes | no | no | yes |
| `quest_confirm_email_before_insert()` | trigger | yes | no | no | yes |
| `recycle_move_item(p_item jsonb)` | recycle_bin_items | yes | no | yes | yes |
| `recycle_permanently_delete_item(p_item_id text)` | boolean | yes | no | yes | yes |
| `recycle_restore_item(p_item_id text)` | recycle_bin_items | yes | no | yes | yes |
| `recycle_undo_item(p_item_id text)` | recycle_bin_items | yes | no | yes | yes |
| `refresh_job_file_count(target_job_id uuid)` | void | no | yes | yes | yes |
| `remove_company_member(target_company_id text, target_profile_id uuid)` | boolean | yes | no | yes | yes |
| `reorder_operational_workspaces(target_company_id text, workspace_ids uuid[])` | SETOF workspaces | yes | no | yes | yes |
| `replace_pipeline_stages(p_company_id text, p_kind text, p_stages jsonb, p_rename_map jsonb)` | SETOF pipeline_stages | yes | no | yes | yes |
| `replace_workspace_pipeline_stages(p_workspace_id uuid, p_kind text, p_stages jsonb, p_rename_map jsonb)` | SETOF pipeline_stages | yes | no | yes | yes |
| `request_company_access(target_company_id text, request_message text)` | uuid | yes | no | yes | yes |
| `reset_company_setup(target_company_id text)` | jsonb | yes | no | yes | yes |
| `reset_workspace_setup(target_workspace_id uuid, p_expected_revision integer)` | jsonb | yes | no | yes | yes |
| `review_company_join_request(target_request_id uuid, decision text, target_role_id uuid)` | company_join_requests | no | no | yes | yes |
| `review_company_workspace(target_company_id text, next_status text, review_note text)` | text | yes | no | yes | yes |
| `revoke_company_invite(target_invite_id uuid)` | company_invites | no | no | yes | yes |
| `ringcentral_conversation_stats(p_company_id text, p_from timestamp with time zone, p_to timestamp with time zone)` | TABLE(extension_id text, extension_number text, extension_name text, total_calls bigint, conversations bigint) | no | no | yes | yes |
| `save_company_role(p_role jsonb, p_permissions text[])` | roles | yes | no | yes | yes |
| `save_company_setup_draft(target_company_id text, p_answers jsonb, p_draft_plan jsonb)` | jsonb | yes | no | yes | yes |
| `save_workspace_setup_draft(target_workspace_id uuid, p_answers jsonb, p_draft_plan jsonb, p_expected_revision integer)` | jsonb | yes | no | yes | yes |
| `set_company_plugin(target_company_id text, target_plugin_id text, next_status text)` | text | yes | no | yes | yes |
| `set_default_operational_workspace(target_workspace_id uuid)` | workspaces | yes | no | yes | yes |
| `set_updated_at()` | trigger | no | yes | yes | yes |
| `set_workspace_member(target_workspace_id uuid, target_profile_id uuid, target_role_id uuid, next_status text)` | workspace_memberships | yes | no | yes | yes |
| `set_workspace_plugin(target_workspace_id uuid, target_plugin_id text, next_status text)` | text | yes | no | yes | yes |
| `slugify_member_id(input text)` | text | no | no | no | yes |
| `sync_team_member_from_profile()` | trigger | yes | no | no | yes |
| `touch_eod_report_updated_at()` | trigger | yes | no | no | yes |
| `update_company_appearance(target_company_id text, p_prefs jsonb)` | companies | yes | no | yes | yes |
| `update_company_member_access(target_company_id text, target_profile_id uuid, target_role text, target_role_id uuid, target_status text)` | company_memberships | no | no | yes | yes |
| `update_company_workspace(target_company_id text, workspace_name text, icon_key text)` | text | yes | no | yes | yes |
| `update_company_workspace(target_company_id text, workspace_name text, icon_key text, icon_image text)` | text | yes | no | yes | yes |
| `update_company_workspace(target_company_id text, workspace_name text, icon_key text, icon_image text, p_icon_color text)` | text | yes | no | yes | yes |
| `update_operational_workspace(target_workspace_id uuid, workspace_name text, workspace_description text, icon_key text, next_status text, icon_image text)` | workspaces | yes | no | yes | yes |
| `update_own_appearance(p_prefs jsonb)` | profiles | yes | no | yes | yes |
| `update_own_profile(p_full_name text, p_avatar_url text)` | profiles | yes | no | yes | yes |
| `update_own_ui_prefs(p_prefs jsonb)` | profiles | yes | no | yes | yes |
| `wb_add_item_comment(p_company_id text, p_workspace_id text, p_app_id text, p_item_id text, p_comment jsonb)` | jsonb | yes | no | yes | yes |
| `wb_modify_item_comment(p_company_id text, p_workspace_id text, p_app_id text, p_item_id text, p_comment_id text, p_action text, p_text text)` | jsonb | yes | no | yes | yes |

## Active Supabase Edge Functions

| Function | Version | Gateway JWT | Authorization model |
| --- | ---: | --- | --- |
| notify-email | 6 | required | Gateway JWT plus management-role and tenant-recipient checks |
| report-problem | 7 | manual | Caller JWT verified server-side; approved users only |
| send-company-invite | 3 | manual | Caller JWT verified server-side; active company Owner/Admin/Developer only |
