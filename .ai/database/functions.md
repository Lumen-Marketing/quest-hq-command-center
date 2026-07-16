# Functions and triggers

Live public-schema routines captured 2026-07-16T19:52:01.513Z. Execute flags describe role grants visible in the catalog; application authorization must still be enforced by the routine and RLS.

## Functions

| Function | Arguments | Returns | Security definer | Volatility | Execute roles |
| --- | --- | --- | --- | --- | --- |
| accept_company_invite | invite_token text | text | yes | volatile | authenticated, service_role |
| accept_public_proposal | proposal_token text, signer_name text, signer_email text, decision text | jsonb | yes | volatile | service_role |
| apply_company_plugin_preset | target_company_id text, preset_code text | text[] | yes | volatile | authenticated, service_role |
| apply_stripe_subscription_event | p_event_id text, p_event_created_at timestamp with time zone, p_company_id text, p_customer_id text, p_subscription_id text, p_status text, p_current_period_end timestamp with time zone, p_trial_ends_at timestamp with time zone | boolean | yes | volatile | service_role |
| assign_wo_number | company text | integer | yes | volatile | authenticated, service_role |
| can_manage_roles | — | boolean | yes | stable | authenticated, service_role |
| can_view_team | — | boolean | yes | stable | authenticated, service_role |
| convert_deal_to_job | p_job jsonb, p_deal jsonb | jsonb | yes | volatile | authenticated, service_role |
| create_company_workspace | company_name text, preset_code text, icon_key text, owner_email text | text | yes | volatile | authenticated, service_role |
| current_company_ids | — | text[] | yes | stable | authenticated, service_role |
| current_member_id | — | text | yes | stable | authenticated, service_role |
| current_profile_role | — | text | yes | stable | authenticated, service_role |
| delete_company_role | p_role_id uuid | boolean | yes | volatile | authenticated, service_role |
| delete_company_workspace | target_company_id text | void | yes | volatile | authenticated, service_role |
| handle_new_user | — | trigger | yes | volatile | service_role |
| is_platform_admin | — | boolean | yes | stable | authenticated, service_role |
| job_files_refresh_job_count | — | trigger | no | volatile | anon, authenticated, service_role |
| leave_company | target_company_id text | company_memberships | no | volatile | authenticated, service_role |
| list_platform_backup_copies | filter_company_id text, filter_status text, filter_kind text | TABLE(id text, backup_id text, company_id text, company_name text, owner_profile_id uuid, owner_email text, created_by uuid, created_by_label text, kind text, status text, size_bytes bigint, record_counts jsonb, source_table text, original_created_at timestamp with time zone, deleted_at timestamp with time zone, deleted_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone) | yes | volatile | authenticated, service_role |
| list_platform_companies | — | TABLE(company_id text, company_name text, short_name text, color text, label text, pill text, icon_key text, status text, plan_code text, amount_cents integer, currency text, owner_profile_id uuid, owner_name text, owner_email text, member_count integer, active_member_count integer, pending_member_count integer, disabled_member_count integer, trial_ends_at timestamp with time zone, current_period_end timestamp with time zone, grace_ends_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone) | yes | volatile | authenticated, service_role |
| list_platform_company_members | target_company_id text | TABLE(company_id text, profile_id uuid, member_id text, full_name text, email text, role text, role_label text, role_id uuid, status text, created_at timestamp with time zone, updated_at timestamp with time zone, disabled_at timestamp with time zone, left_at timestamp with time zone, last_active_at timestamp with time zone) | yes | volatile | authenticated, service_role |
| list_workspace_app_library | — | jsonb | yes | volatile | authenticated, service_role |
| list_workspace_reviews | — | TABLE(company_id text, company_name text, status text, plan_code text, amount_cents integer, currency text, owner_profile_id uuid, owner_name text, owner_email text, trial_ends_at timestamp with time zone, current_period_end timestamp with time zone, grace_ends_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone) | yes | volatile | authenticated, service_role |
| lookup_company_invite | invite_token text | TABLE(company_id text, company_name text, email text, status text, expires_at timestamp with time zone) | yes | volatile | service_role |
| manage_platform_company | target_company_id text, platform_action text, review_note text | text | yes | volatile | authenticated, service_role |
| mark_platform_backup_copy_deleted | copy_id text | text | yes | volatile | authenticated, service_role |
| message_touch_conversation | — | trigger | yes | volatile | service_role |
| mirror_workspace_backup_copy | — | trigger | yes | volatile | service_role |
| permanently_delete_platform_backup_copy | copy_id text | text | yes | volatile | authenticated, service_role |
| promote_company_owner | target_company_id text, target_profile_id uuid | company_memberships | no | volatile | authenticated, service_role |
| public_proposal_by_token | proposal_token text | jsonb | yes | volatile | service_role |
| purge_expired_recycle_bin | p_limit integer | integer | yes | volatile | service_role |
| quest_confirm_email_before_insert | — | trigger | yes | volatile | service_role |
| recycle_move_item | p_item jsonb | recycle_bin_items | yes | volatile | authenticated, service_role |
| recycle_permanently_delete_item | p_item_id text | boolean | yes | volatile | authenticated, service_role |
| recycle_restore_item | p_item_id text | recycle_bin_items | yes | volatile | authenticated, service_role |
| refresh_job_file_count | target_job_id uuid | void | no | volatile | anon, authenticated, service_role |
| replace_pipeline_stages | p_company_id text, p_kind text, p_stages jsonb, p_rename_map jsonb | SETOF pipeline_stages | yes | volatile | authenticated, service_role |
| request_company_access | target_company_id text, request_message text | uuid | yes | volatile | authenticated, service_role |
| review_company_join_request | target_request_id uuid, decision text, target_role_id uuid | company_join_requests | no | volatile | authenticated, service_role |
| review_company_workspace | target_company_id text, next_status text, review_note text | text | yes | volatile | authenticated, service_role |
| revoke_company_invite | target_invite_id uuid | company_invites | no | volatile | authenticated, service_role |
| save_company_role | p_role jsonb, p_permissions text[] | roles | yes | volatile | authenticated, service_role |
| set_company_plugin | target_company_id text, target_plugin_id text, next_status text | text | yes | volatile | authenticated, service_role |
| set_updated_at | — | trigger | no | volatile | anon, authenticated, service_role |
| slugify_member_id | input text | text | no | immutable | service_role |
| sync_team_member_from_profile | — | trigger | yes | volatile | service_role |
| update_company_member_access | target_company_id text, target_profile_id uuid, target_role text, target_role_id uuid, target_status text | company_memberships | no | volatile | authenticated, service_role |
| update_company_workspace | target_company_id text, workspace_name text, icon_key text | text | yes | volatile | authenticated, service_role |
| update_company_workspace | target_company_id text, workspace_name text, icon_key text, icon_image text | text | yes | volatile | authenticated, service_role |
| update_own_profile | p_full_name text, p_avatar_url text | profiles | yes | volatile | authenticated, service_role |
| wb_add_item_comment | p_company_id text, p_workspace_id text, p_app_id text, p_item_id text, p_comment jsonb | jsonb | yes | volatile | authenticated, service_role |
| wb_modify_item_comment | p_company_id text, p_workspace_id text, p_app_id text, p_item_id text, p_comment_id text, p_action text, p_text text | jsonb | yes | volatile | authenticated, service_role |

## Triggers

| Table | Trigger | Timing | Event | Orientation |
| --- | --- | --- | --- | --- |
| accounts | accounts_set_updated_at | BEFORE | UPDATE | ROW |
| activities | activities_set_updated_at | BEFORE | UPDATE | ROW |
| calendar_events | set_calendar_events_updated_at | BEFORE | UPDATE | ROW |
| client_portal_annotations | client_portal_annotations_set_updated_at | BEFORE | UPDATE | ROW |
| client_portal_documents | client_portal_documents_set_updated_at | BEFORE | UPDATE | ROW |
| client_portals | client_portals_set_updated_at | BEFORE | UPDATE | ROW |
| clients | clients_set_updated_at | BEFORE | UPDATE | ROW |
| company_invites | company_invites_set_updated_at | BEFORE | UPDATE | ROW |
| company_join_requests | company_join_requests_set_updated_at | BEFORE | UPDATE | ROW |
| company_memberships | company_memberships_prevent_last_owner_loss | BEFORE | DELETE | ROW |
| company_memberships | company_memberships_prevent_last_owner_loss | BEFORE | UPDATE | ROW |
| company_memberships | company_memberships_set_updated_at | BEFORE | UPDATE | ROW |
| company_plugins | company_plugins_set_updated_at | BEFORE | UPDATE | ROW |
| company_subscriptions | company_subscriptions_set_updated_at | BEFORE | UPDATE | ROW |
| contacts | contacts_set_updated_at | BEFORE | UPDATE | ROW |
| crm_sites | crm_sites_set_updated_at | BEFORE | UPDATE | ROW |
| deals | deals_set_updated_at | BEFORE | UPDATE | ROW |
| field_permissions | field_permissions_set_updated_at | BEFORE | UPDATE | ROW |
| forms | forms_set_updated_at | BEFORE | UPDATE | ROW |
| job_files | job_files_refresh_job_count | AFTER | DELETE | ROW |
| job_files | job_files_refresh_job_count | AFTER | INSERT | ROW |
| job_files | job_files_refresh_job_count | AFTER | UPDATE | ROW |
| job_files | job_files_set_updated_at | BEFORE | UPDATE | ROW |
| jobs | jobs_set_updated_at | BEFORE | UPDATE | ROW |
| message_conversations | message_conversations_set_updated_at | BEFORE | UPDATE | ROW |
| message_reads | message_reads_set_updated_at | BEFORE | UPDATE | ROW |
| messages | messages_set_updated_at | BEFORE | UPDATE | ROW |
| messages | messages_touch_conversation | AFTER | INSERT | ROW |
| pipeline_stages | pipeline_stages_set_updated_at | BEFORE | UPDATE | ROW |
| profiles | profiles_set_updated_at | BEFORE | UPDATE | ROW |
| profiles | sync_team_member_from_profile | AFTER | DELETE | ROW |
| profiles | sync_team_member_from_profile | AFTER | INSERT | ROW |
| profiles | sync_team_member_from_profile | AFTER | UPDATE | ROW |
| proposal_documents | proposal_documents_set_updated_at | BEFORE | UPDATE | ROW |
| resource_acl | resource_acl_set_updated_at | BEFORE | UPDATE | ROW |
| roles | roles_set_updated_at | BEFORE | UPDATE | ROW |
| tasks | set_tasks_updated_at | BEFORE | UPDATE | ROW |
| underwriting_cases | underwriting_cases_set_updated_at | BEFORE | UPDATE | ROW |
| workspace_backups | trg_mirror_workspace_backup_copy | AFTER | INSERT | ROW |
| workspace_backups | trg_mirror_workspace_backup_copy | AFTER | UPDATE | ROW |
| workspace_builder_state | workspace_builder_state_set_updated_at | BEFORE | UPDATE | ROW |
