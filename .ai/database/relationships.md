# Public relationships

Captured 2026-08-08T00:57:09.780Z. Composite foreign keys appear as one row per paired column.

| Constraint | From | To | Update | Delete |
| --- | --- | --- | --- | --- |
| accounts_company_id_fkey | `accounts.company_id` | `companies.id` | NO ACTION | CASCADE |
| accounts_created_by_fkey | `accounts.created_by` | `profiles.id` | NO ACTION | SET NULL |
| accounts_deleted_by_fkey | `accounts.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| accounts_workspace_id_fkey | `accounts.workspace_id` | `workspaces.id` | NO ACTION | RESTRICT |
| active_timers_task_id_fkey | `active_timers.task_id` | `tasks.id` | NO ACTION | CASCADE |
| active_timers_user_id_fkey | `active_timers.user_id` | `team_members.id` | NO ACTION | RESTRICT |
| activities_account_id_fkey | `activities.account_id` | `accounts.id` | NO ACTION | SET NULL |
| activities_company_id_fkey | `activities.company_id` | `companies.id` | NO ACTION | CASCADE |
| activities_contact_id_fkey | `activities.contact_id` | `contacts.id` | NO ACTION | SET NULL |
| activities_created_by_fkey | `activities.created_by` | `profiles.id` | NO ACTION | SET NULL |
| activities_deal_id_fkey | `activities.deal_id` | `deals.id` | NO ACTION | SET NULL |
| activities_deleted_by_fkey | `activities.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| activities_job_id_fkey | `activities.job_id` | `jobs.id` | NO ACTION | SET NULL |
| activities_site_id_fkey | `activities.site_id` | `crm_sites.id` | NO ACTION | SET NULL |
| activities_workspace_id_fkey | `activities.workspace_id` | `workspaces.id` | NO ACTION | RESTRICT |
| audit_events_actor_profile_id_fkey | `audit_events.actor_profile_id` | `profiles.id` | NO ACTION | SET NULL |
| audit_events_company_id_fkey | `audit_events.company_id` | `companies.id` | NO ACTION | CASCADE |
| automations_company_id_fkey | `automations.company_id` | `companies.id` | NO ACTION | CASCADE |
| bug_reports_reporter_id_fkey | `bug_reports.reporter_id` | `profiles.id` | NO ACTION | SET NULL |
| calendar_events_company_id_fkey | `calendar_events.company_id` | `companies.id` | NO ACTION | CASCADE |
| calendar_events_created_by_fkey | `calendar_events.created_by` | `profiles.id` | NO ACTION | SET NULL |
| calendar_events_deleted_by_fkey | `calendar_events.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| checkin_settings_company_id_fkey | `checkin_settings.company_id` | `companies.id` | NO ACTION | CASCADE |
| client_portal_annotations_author_profile_id_fkey | `client_portal_annotations.author_profile_id` | `profiles.id` | NO ACTION | SET NULL |
| client_portal_annotations_company_id_fkey | `client_portal_annotations.company_id` | `companies.id` | NO ACTION | CASCADE |
| client_portal_annotations_document_id_fkey | `client_portal_annotations.document_id` | `client_portal_documents.id` | NO ACTION | CASCADE |
| client_portal_annotations_portal_id_fkey | `client_portal_annotations.portal_id` | `client_portals.id` | NO ACTION | CASCADE |
| client_portal_documents_company_id_fkey | `client_portal_documents.company_id` | `companies.id` | NO ACTION | CASCADE |
| client_portal_documents_deleted_by_fkey | `client_portal_documents.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| client_portal_documents_portal_id_fkey | `client_portal_documents.portal_id` | `client_portals.id` | NO ACTION | CASCADE |
| client_portal_documents_uploaded_by_fkey | `client_portal_documents.uploaded_by` | `profiles.id` | NO ACTION | SET NULL |
| client_portal_events_company_id_fkey | `client_portal_events.company_id` | `companies.id` | NO ACTION | CASCADE |
| client_portal_events_portal_id_fkey | `client_portal_events.portal_id` | `client_portals.id` | NO ACTION | CASCADE |
| client_portals_company_id_fkey | `client_portals.company_id` | `companies.id` | NO ACTION | CASCADE |
| client_portals_created_by_fkey | `client_portals.created_by` | `profiles.id` | NO ACTION | SET NULL |
| client_portals_deleted_by_fkey | `client_portals.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| client_portals_job_id_fkey | `client_portals.job_id` | `jobs.id` | NO ACTION | SET NULL |
| clients_company_id_fkey | `clients.company_id` | `companies.id` | NO ACTION | RESTRICT |
| comment_reactions_comment_id_fkey | `comment_reactions.comment_id` | `task_comments.id` | NO ACTION | CASCADE |
| companies_primary_owner_profile_id_fkey | `companies.primary_owner_profile_id` | `profiles.id` | NO ACTION | SET NULL |
| company_active_timers_company_id_fkey | `company_active_timers.company_id` | `companies.id` | NO ACTION | CASCADE |
| company_active_timers_profile_id_fkey | `company_active_timers.profile_id` | `profiles.id` | NO ACTION | CASCADE |
| company_invites_accepted_by_fkey | `company_invites.accepted_by` | `profiles.id` | NO ACTION | SET NULL |
| company_invites_company_id_fkey | `company_invites.company_id` | `companies.id` | NO ACTION | CASCADE |
| company_invites_invited_by_fkey | `company_invites.invited_by` | `profiles.id` | NO ACTION | SET NULL |
| company_invites_role_id_fkey | `company_invites.role_id` | `roles.id` | NO ACTION | SET NULL |
| company_join_requests_company_id_fkey | `company_join_requests.company_id` | `companies.id` | NO ACTION | CASCADE |
| company_join_requests_profile_id_fkey | `company_join_requests.profile_id` | `profiles.id` | NO ACTION | CASCADE |
| company_join_requests_reviewed_by_fkey | `company_join_requests.reviewed_by` | `profiles.id` | NO ACTION | SET NULL |
| company_memberships_company_id_fkey | `company_memberships.company_id` | `companies.id` | NO ACTION | CASCADE |
| company_memberships_disabled_by_fkey | `company_memberships.disabled_by` | `profiles.id` | NO ACTION | SET NULL |
| company_memberships_profile_id_fkey | `company_memberships.profile_id` | `profiles.id` | NO ACTION | CASCADE |
| company_plugins_company_id_fkey | `company_plugins.company_id` | `companies.id` | NO ACTION | CASCADE |
| company_plugins_installed_by_fkey | `company_plugins.installed_by` | `profiles.id` | NO ACTION | SET NULL |
| company_setup_profiles_company_id_fkey | `company_setup_profiles.company_id` | `companies.id` | NO ACTION | CASCADE |
| company_setup_profiles_updated_by_fkey | `company_setup_profiles.updated_by` | `profiles.id` | NO ACTION | SET NULL |
| company_subscriptions_company_id_fkey | `company_subscriptions.company_id` | `companies.id` | NO ACTION | CASCADE |
| company_time_entries_company_id_fkey | `company_time_entries.company_id` | `companies.id` | NO ACTION | CASCADE |
| company_time_entries_profile_id_fkey | `company_time_entries.profile_id` | `profiles.id` | NO ACTION | CASCADE |
| contact_label_assignments_assigned_by_fkey | `contact_label_assignments.assigned_by` | `profiles.id` | NO ACTION | SET NULL |
| contact_label_assignments_contact_id_fkey | `contact_label_assignments.contact_id` | `contacts.id` | NO ACTION | CASCADE |
| contact_label_assignments_label_id_fkey | `contact_label_assignments.label_id` | `contact_labels.id` | NO ACTION | CASCADE |
| contact_label_assignments_workspace_id_fkey | `contact_label_assignments.workspace_id` | `workspaces.id` | NO ACTION | CASCADE |
| contact_labels_created_by_fkey | `contact_labels.created_by` | `profiles.id` | NO ACTION | SET NULL |
| contact_labels_workspace_id_fkey | `contact_labels.workspace_id` | `workspaces.id` | NO ACTION | CASCADE |
| contacts_account_id_fkey | `contacts.account_id` | `accounts.id` | NO ACTION | SET NULL |
| contacts_company_id_fkey | `contacts.company_id` | `companies.id` | NO ACTION | CASCADE |
| contacts_created_by_fkey | `contacts.created_by` | `profiles.id` | NO ACTION | SET NULL |
| contacts_deleted_by_fkey | `contacts.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| contacts_workspace_id_fkey | `contacts.workspace_id` | `workspaces.id` | NO ACTION | RESTRICT |
| crm_sites_account_id_fkey | `crm_sites.account_id` | `accounts.id` | NO ACTION | SET NULL |
| crm_sites_company_id_fkey | `crm_sites.company_id` | `companies.id` | NO ACTION | CASCADE |
| crm_sites_contact_id_fkey | `crm_sites.contact_id` | `contacts.id` | NO ACTION | CASCADE |
| crm_sites_created_by_fkey | `crm_sites.created_by` | `profiles.id` | NO ACTION | SET NULL |
| crm_sites_workspace_id_fkey | `crm_sites.workspace_id` | `workspaces.id` | NO ACTION | RESTRICT |
| deals_account_id_fkey | `deals.account_id` | `accounts.id` | NO ACTION | SET NULL |
| deals_company_id_fkey | `deals.company_id` | `companies.id` | NO ACTION | CASCADE |
| deals_created_by_fkey | `deals.created_by` | `profiles.id` | NO ACTION | SET NULL |
| deals_deleted_by_fkey | `deals.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| deals_job_id_fkey | `deals.job_id` | `jobs.id` | NO ACTION | SET NULL |
| deals_primary_contact_id_fkey | `deals.primary_contact_id` | `contacts.id` | NO ACTION | SET NULL |
| deals_site_id_fkey | `deals.site_id` | `crm_sites.id` | NO ACTION | SET NULL |
| deals_workspace_id_fkey | `deals.workspace_id` | `workspaces.id` | NO ACTION | RESTRICT |
| eod_reports_company_id_fkey | `eod_reports.company_id` | `companies.id` | NO ACTION | CASCADE |
| eod_reports_created_by_fkey | `eod_reports.created_by` | `profiles.id` | NO ACTION | SET NULL |
| eod_reports_workspace_id_fkey | `eod_reports.workspace_id` | `workspaces.id` | NO ACTION | SET NULL |
| field_permissions_company_id_fkey | `field_permissions.company_id` | `companies.id` | NO ACTION | CASCADE |
| field_permissions_role_id_fkey | `field_permissions.role_id` | `roles.id` | NO ACTION | CASCADE |
| finance_expenses_company_id_fkey | `finance_expenses.company_id` | `companies.id` | NO ACTION | CASCADE |
| finance_expenses_created_by_fkey | `finance_expenses.created_by` | `profiles.id` | NO ACTION | SET NULL |
| finance_expenses_deleted_by_fkey | `finance_expenses.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| finance_expenses_job_id_fkey | `finance_expenses.job_id` | `jobs.id` | NO ACTION | SET NULL |
| finance_expenses_vendor_id_fkey | `finance_expenses.vendor_id` | `finance_vendors.id` | NO ACTION | SET NULL |
| finance_invoices_company_id_fkey | `finance_invoices.company_id` | `companies.id` | NO ACTION | CASCADE |
| finance_invoices_created_by_fkey | `finance_invoices.created_by` | `profiles.id` | NO ACTION | SET NULL |
| finance_invoices_deleted_by_fkey | `finance_invoices.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| finance_invoices_job_id_fkey | `finance_invoices.job_id` | `jobs.id` | NO ACTION | SET NULL |
| finance_payments_company_id_fkey | `finance_payments.company_id` | `companies.id` | NO ACTION | CASCADE |
| finance_payments_created_by_fkey | `finance_payments.created_by` | `profiles.id` | NO ACTION | SET NULL |
| finance_payments_deleted_by_fkey | `finance_payments.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| finance_payments_invoice_id_fkey | `finance_payments.invoice_id` | `finance_invoices.id` | NO ACTION | CASCADE |
| finance_vendors_company_id_fkey | `finance_vendors.company_id` | `companies.id` | NO ACTION | CASCADE |
| finance_vendors_created_by_fkey | `finance_vendors.created_by` | `profiles.id` | NO ACTION | SET NULL |
| finance_vendors_deleted_by_fkey | `finance_vendors.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| form_responses_company_id_fkey | `form_responses.company_id` | `companies.id` | NO ACTION | CASCADE |
| form_responses_deleted_by_fkey | `form_responses.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| form_responses_form_id_fkey | `form_responses.form_id` | `forms.id` | NO ACTION | CASCADE |
| forms_company_id_fkey | `forms.company_id` | `companies.id` | NO ACTION | CASCADE |
| forms_deleted_by_fkey | `forms.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| job_activity_job_id_fkey | `job_activity.job_id` | `jobs.id` | NO ACTION | CASCADE |
| job_change_order_lines_change_order_id_fkey | `job_change_order_lines.change_order_id` | `job_change_orders.id` | NO ACTION | CASCADE |
| job_change_order_lines_company_id_fkey | `job_change_order_lines.company_id` | `companies.id` | NO ACTION | CASCADE |
| job_change_order_lines_job_id_fkey | `job_change_order_lines.job_id` | `jobs.id` | NO ACTION | CASCADE |
| job_change_order_lines_material_id_fkey | `job_change_order_lines.material_id` | `pricebook_materials.id` | NO ACTION | SET NULL |
| job_change_orders_company_id_fkey | `job_change_orders.company_id` | `companies.id` | NO ACTION | CASCADE |
| job_change_orders_created_by_fkey | `job_change_orders.created_by` | `profiles.id` | NO ACTION | SET NULL |
| job_change_orders_job_id_fkey | `job_change_orders.job_id` | `jobs.id` | NO ACTION | CASCADE |
| job_cost_buckets_company_id_fkey | `job_cost_buckets.company_id` | `companies.id` | NO ACTION | CASCADE |
| job_cost_buckets_job_id_fkey | `job_cost_buckets.job_id` | `jobs.id` | NO ACTION | CASCADE |
| job_dailies_company_id_fkey | `job_dailies.company_id` | `companies.id` | NO ACTION | CASCADE |
| job_dailies_created_by_fkey | `job_dailies.created_by` | `profiles.id` | NO ACTION | SET NULL |
| job_dailies_job_id_fkey | `job_dailies.job_id` | `jobs.id` | NO ACTION | CASCADE |
| job_draws_company_id_fkey | `job_draws.company_id` | `companies.id` | NO ACTION | CASCADE |
| job_draws_job_id_fkey | `job_draws.job_id` | `jobs.id` | NO ACTION | CASCADE |
| job_files_company_id_fkey | `job_files.company_id` | `companies.id` | NO ACTION | RESTRICT |
| job_files_deleted_by_fkey | `job_files.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| job_files_job_id_fkey | `job_files.job_id` | `jobs.id` | NO ACTION | CASCADE |
| job_files_workspace_id_fkey | `job_files.workspace_id` | `workspaces.id` | NO ACTION | RESTRICT |
| job_plans_company_id_fkey | `job_plans.company_id` | `companies.id` | NO ACTION | CASCADE |
| job_plans_job_id_fkey | `job_plans.job_id` | `jobs.id` | NO ACTION | CASCADE |
| jobs_account_id_fkey | `jobs.account_id` | `accounts.id` | NO ACTION | SET NULL |
| jobs_client_id_fkey | `jobs.client_id` | `clients.id` | NO ACTION | SET NULL |
| jobs_company_id_fkey | `jobs.company_id` | `companies.id` | NO ACTION | RESTRICT |
| jobs_contact_id_fkey | `jobs.contact_id` | `contacts.id` | NO ACTION | SET NULL |
| jobs_deal_id_fkey | `jobs.deal_id` | `deals.id` | NO ACTION | SET NULL |
| jobs_deleted_by_fkey | `jobs.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| jobs_site_id_fkey | `jobs.site_id` | `crm_sites.id` | NO ACTION | SET NULL |
| jobs_workspace_id_fkey | `jobs.workspace_id` | `workspaces.id` | NO ACTION | RESTRICT |
| knowledge_articles_company_id_fkey | `knowledge_articles.company_id` | `companies.id` | NO ACTION | CASCADE |
| message_attachments_company_id_fkey | `message_attachments.company_id` | `companies.id` | NO ACTION | CASCADE |
| message_attachments_conversation_id_fkey | `message_attachments.conversation_id` | `message_conversations.id` | NO ACTION | CASCADE |
| message_attachments_message_id_fkey | `message_attachments.message_id` | `messages.id` | NO ACTION | CASCADE |
| message_conversation_access_company_id_fkey | `message_conversation_access.company_id` | `companies.id` | NO ACTION | CASCADE |
| message_conversation_access_conversation_id_fkey | `message_conversation_access.conversation_id` | `message_conversations.id` | NO ACTION | CASCADE |
| message_conversations_company_id_fkey | `message_conversations.company_id` | `companies.id` | NO ACTION | CASCADE |
| message_conversations_created_by_fkey | `message_conversations.created_by` | `profiles.id` | NO ACTION | SET NULL |
| message_reads_company_id_fkey | `message_reads.company_id` | `companies.id` | NO ACTION | CASCADE |
| message_reads_conversation_id_fkey | `message_reads.conversation_id` | `message_conversations.id` | NO ACTION | CASCADE |
| message_reads_profile_id_fkey | `message_reads.profile_id` | `profiles.id` | NO ACTION | CASCADE |
| messages_company_id_fkey | `messages.company_id` | `companies.id` | NO ACTION | CASCADE |
| messages_conversation_id_fkey | `messages.conversation_id` | `message_conversations.id` | NO ACTION | CASCADE |
| messages_sender_profile_id_fkey | `messages.sender_profile_id` | `profiles.id` | NO ACTION | CASCADE |
| notifications_company_id_fkey | `notifications.company_id` | `companies.id` | NO ACTION | CASCADE |
| notifications_member_id_fkey | `notifications.member_id` | `team_members.id` | NO ACTION | RESTRICT |
| notifications_recipient_profile_id_fkey | `notifications.recipient_profile_id` | `profiles.id` | NO ACTION | CASCADE |
| notifications_task_id_fkey | `notifications.task_id` | `tasks.id` | NO ACTION | CASCADE |
| pipeline_stages_company_id_fkey | `pipeline_stages.company_id` | `companies.id` | NO ACTION | CASCADE |
| pipeline_stages_workspace_id_fkey | `pipeline_stages.workspace_id` | `workspaces.id` | NO ACTION | RESTRICT |
| pricebook_materials_company_id_fkey | `pricebook_materials.company_id` | `companies.id` | NO ACTION | CASCADE |
| pricebook_materials_deleted_by_fkey | `pricebook_materials.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| pricebook_vendor_prices_company_id_fkey | `pricebook_vendor_prices.company_id` | `companies.id` | NO ACTION | CASCADE |
| pricebook_vendor_prices_deleted_by_fkey | `pricebook_vendor_prices.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| pricebook_vendor_prices_material_id_fkey | `pricebook_vendor_prices.material_id` | `pricebook_materials.id` | NO ACTION | CASCADE |
| pricebook_vendor_prices_vendor_id_fkey | `pricebook_vendor_prices.vendor_id` | `pricebook_vendors.id` | NO ACTION | CASCADE |
| pricebook_vendors_company_id_fkey | `pricebook_vendors.company_id` | `companies.id` | NO ACTION | CASCADE |
| pricebook_vendors_deleted_by_fkey | `pricebook_vendors.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| profiles_id_fkey | `profiles.id` | `users.id` | NO ACTION | CASCADE |
| profiles_member_id_fkey | `profiles.member_id` | `team_members.id` | NO ACTION | NO ACTION |
| profiles_supervisor_id_fkey | `profiles.supervisor_id` | `team_members.id` | NO ACTION | NO ACTION |
| projects_company_id_fkey | `projects.company_id` | `companies.id` | NO ACTION | CASCADE |
| proposal_documents_company_id_fkey | `proposal_documents.company_id` | `companies.id` | NO ACTION | CASCADE |
| proposal_documents_deleted_by_fkey | `proposal_documents.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| proposal_documents_workspace_id_fkey | `proposal_documents.workspace_id` | `workspaces.id` | NO ACTION | RESTRICT |
| record_history_actor_profile_id_fkey | `record_history.actor_profile_id` | `profiles.id` | NO ACTION | SET NULL |
| record_history_company_id_fkey | `record_history.company_id` | `companies.id` | NO ACTION | CASCADE |
| record_history_workspace_id_fkey | `record_history.workspace_id` | `workspaces.id` | NO ACTION | CASCADE |
| recycle_bin_items_company_id_fkey | `recycle_bin_items.company_id` | `companies.id` | NO ACTION | CASCADE |
| recycle_bin_items_deleted_by_fkey | `recycle_bin_items.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| recycle_bin_items_restored_by_fkey | `recycle_bin_items.restored_by` | `profiles.id` | NO ACTION | SET NULL |
| resource_acl_company_id_fkey | `resource_acl.company_id` | `companies.id` | NO ACTION | CASCADE |
| ringcentral_accounts_company_id_fkey | `ringcentral_accounts.company_id` | `companies.id` | NO ACTION | CASCADE |
| ringcentral_calls_company_id_fkey | `ringcentral_calls.company_id` | `companies.id` | NO ACTION | CASCADE |
| ringcentral_extensions_company_id_fkey | `ringcentral_extensions.company_id` | `companies.id` | NO ACTION | CASCADE |
| ringcentral_presence_company_id_fkey | `ringcentral_presence.company_id` | `companies.id` | NO ACTION | CASCADE |
| ringcentral_sync_state_company_id_fkey | `ringcentral_sync_state.company_id` | `companies.id` | NO ACTION | CASCADE |
| role_permissions_role_id_fkey | `role_permissions.role_id` | `roles.id` | NO ACTION | CASCADE |
| roles_company_id_fkey | `roles.company_id` | `companies.id` | NO ACTION | CASCADE |
| roles_created_by_fkey | `roles.created_by` | `profiles.id` | NO ACTION | SET NULL |
| task_comments_task_id_fkey | `task_comments.task_id` | `tasks.id` | NO ACTION | CASCADE |
| task_labels_company_id_fkey | `task_labels.company_id` | `companies.id` | NO ACTION | CASCADE |
| task_type_statuses_company_id_fkey | `task_type_statuses.company_id` | `companies.id` | NO ACTION | CASCADE |
| task_types_company_id_fkey | `task_types.company_id` | `companies.id` | NO ACTION | CASCADE |
| tasks_assignee_id_fkey | `tasks.assignee_id` | `team_members.id` | NO ACTION | RESTRICT |
| tasks_company_deal_id_fkey | `tasks.company_id` | `deals.company_id` | NO ACTION | NO ACTION |
| tasks_company_deal_id_fkey | `tasks.deal_id` | `deals.id` | NO ACTION | NO ACTION |
| tasks_company_id_fkey | `tasks.company_id` | `companies.id` | NO ACTION | RESTRICT |
| tasks_creator_id_fkey | `tasks.creator_id` | `team_members.id` | NO ACTION | RESTRICT |
| tasks_deleted_by_fkey | `tasks.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| tasks_job_id_fkey | `tasks.job_id` | `jobs.id` | NO ACTION | CASCADE |
| tasks_workspace_id_fkey | `tasks.workspace_id` | `workspaces.id` | NO ACTION | RESTRICT |
| time_entries_task_id_fkey | `time_entries.task_id` | `tasks.id` | NO ACTION | CASCADE |
| time_entries_user_id_fkey | `time_entries.user_id` | `team_members.id` | NO ACTION | RESTRICT |
| underwriting_cases_company_id_fkey | `underwriting_cases.company_id` | `companies.id` | NO ACTION | CASCADE |
| underwriting_cases_contact_id_fkey | `underwriting_cases.contact_id` | `contacts.id` | NO ACTION | CASCADE |
| underwriting_cases_created_by_fkey | `underwriting_cases.created_by` | `profiles.id` | NO ACTION | SET NULL |
| underwriting_cases_workspace_id_fkey | `underwriting_cases.workspace_id` | `workspaces.id` | NO ACTION | RESTRICT |
| user_role_assignments_assigned_by_fkey | `user_role_assignments.assigned_by` | `profiles.id` | NO ACTION | SET NULL |
| user_role_assignments_company_id_fkey | `user_role_assignments.company_id` | `companies.id` | NO ACTION | CASCADE |
| user_role_assignments_profile_id_fkey | `user_role_assignments.profile_id` | `profiles.id` | NO ACTION | CASCADE |
| user_role_assignments_role_id_fkey | `user_role_assignments.role_id` | `roles.id` | NO ACTION | CASCADE |
| workspace_backup_copies_backup_id_fkey | `workspace_backup_copies.backup_id` | `workspace_backups.id` | NO ACTION | SET NULL |
| workspace_backup_copies_company_id_fkey | `workspace_backup_copies.company_id` | `companies.id` | NO ACTION | CASCADE |
| workspace_backup_copies_created_by_fkey | `workspace_backup_copies.created_by` | `profiles.id` | NO ACTION | SET NULL |
| workspace_backup_copies_deleted_by_fkey | `workspace_backup_copies.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| workspace_backups_company_id_fkey | `workspace_backups.company_id` | `companies.id` | NO ACTION | CASCADE |
| workspace_backups_created_by_fkey | `workspace_backups.created_by` | `profiles.id` | NO ACTION | SET NULL |
| workspace_backups_deleted_by_fkey | `workspace_backups.deleted_by` | `profiles.id` | NO ACTION | SET NULL |
| workspace_builder_state_company_id_fkey | `workspace_builder_state.company_id` | `companies.id` | NO ACTION | CASCADE |
| workspace_builder_state_updated_by_fkey | `workspace_builder_state.updated_by` | `profiles.id` | NO ACTION | SET NULL |
| workspace_memberships_assigned_by_fkey | `workspace_memberships.assigned_by` | `profiles.id` | NO ACTION | SET NULL |
| workspace_memberships_profile_id_fkey | `workspace_memberships.profile_id` | `profiles.id` | NO ACTION | CASCADE |
| workspace_memberships_role_id_fkey | `workspace_memberships.role_id` | `roles.id` | NO ACTION | SET NULL |
| workspace_memberships_workspace_id_fkey | `workspace_memberships.workspace_id` | `workspaces.id` | NO ACTION | CASCADE |
| workspace_plugins_installed_by_fkey | `workspace_plugins.installed_by` | `profiles.id` | NO ACTION | SET NULL |
| workspace_plugins_workspace_id_fkey | `workspace_plugins.workspace_id` | `workspaces.id` | NO ACTION | CASCADE |
| workspaces_company_id_fkey | `workspaces.company_id` | `companies.id` | NO ACTION | CASCADE |
| workspaces_created_by_fkey | `workspaces.created_by` | `profiles.id` | NO ACTION | SET NULL |
