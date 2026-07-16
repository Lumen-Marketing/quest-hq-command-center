# Relationship map

Foreign keys captured from the live public schema on 2026-07-16T19:21:04.447Z. Relationships are directional from the referencing column to the referenced column.

| From | To | Constraint | Update | Delete |
| --- | --- | --- | --- | --- |
| accounts.company_id | companies.id | accounts_company_id_fkey | NO ACTION | CASCADE |
| accounts.created_by | profiles.id | accounts_created_by_fkey | NO ACTION | SET NULL |
| accounts.deleted_by | profiles.id | accounts_deleted_by_fkey | NO ACTION | SET NULL |
| active_timers.task_id | tasks.id | active_timers_task_id_fkey | NO ACTION | CASCADE |
| active_timers.user_id | team_members.id | active_timers_user_id_fkey | NO ACTION | RESTRICT |
| activities.account_id | accounts.id | activities_account_id_fkey | NO ACTION | SET NULL |
| activities.company_id | companies.id | activities_company_id_fkey | NO ACTION | CASCADE |
| activities.contact_id | contacts.id | activities_contact_id_fkey | NO ACTION | SET NULL |
| activities.created_by | profiles.id | activities_created_by_fkey | NO ACTION | SET NULL |
| activities.deal_id | deals.id | activities_deal_id_fkey | NO ACTION | SET NULL |
| activities.deleted_by | profiles.id | activities_deleted_by_fkey | NO ACTION | SET NULL |
| activities.job_id | jobs.id | activities_job_id_fkey | NO ACTION | SET NULL |
| activities.site_id | crm_sites.id | activities_site_id_fkey | NO ACTION | SET NULL |
| audit_events.actor_profile_id | profiles.id | audit_events_actor_profile_id_fkey | NO ACTION | SET NULL |
| audit_events.company_id | companies.id | audit_events_company_id_fkey | NO ACTION | CASCADE |
| calendar_events.company_id | companies.id | calendar_events_company_id_fkey | NO ACTION | CASCADE |
| calendar_events.created_by | profiles.id | calendar_events_created_by_fkey | NO ACTION | SET NULL |
| calendar_events.deleted_by | profiles.id | calendar_events_deleted_by_fkey | NO ACTION | SET NULL |
| client_portal_annotations.author_profile_id | profiles.id | client_portal_annotations_author_profile_id_fkey | NO ACTION | SET NULL |
| client_portal_annotations.company_id | companies.id | client_portal_annotations_company_id_fkey | NO ACTION | CASCADE |
| client_portal_annotations.document_id | client_portal_documents.id | client_portal_annotations_document_id_fkey | NO ACTION | CASCADE |
| client_portal_annotations.portal_id | client_portals.id | client_portal_annotations_portal_id_fkey | NO ACTION | CASCADE |
| client_portal_documents.company_id | companies.id | client_portal_documents_company_id_fkey | NO ACTION | CASCADE |
| client_portal_documents.deleted_by | profiles.id | client_portal_documents_deleted_by_fkey | NO ACTION | SET NULL |
| client_portal_documents.portal_id | client_portals.id | client_portal_documents_portal_id_fkey | NO ACTION | CASCADE |
| client_portal_documents.uploaded_by | profiles.id | client_portal_documents_uploaded_by_fkey | NO ACTION | SET NULL |
| client_portal_events.company_id | companies.id | client_portal_events_company_id_fkey | NO ACTION | CASCADE |
| client_portal_events.portal_id | client_portals.id | client_portal_events_portal_id_fkey | NO ACTION | CASCADE |
| client_portals.company_id | companies.id | client_portals_company_id_fkey | NO ACTION | CASCADE |
| client_portals.created_by | profiles.id | client_portals_created_by_fkey | NO ACTION | SET NULL |
| client_portals.deleted_by | profiles.id | client_portals_deleted_by_fkey | NO ACTION | SET NULL |
| client_portals.job_id | jobs.id | client_portals_job_id_fkey | NO ACTION | SET NULL |
| clients.company_id | companies.id | clients_company_id_fkey | NO ACTION | RESTRICT |
| company_invites.accepted_by | profiles.id | company_invites_accepted_by_fkey | NO ACTION | SET NULL |
| company_invites.company_id | companies.id | company_invites_company_id_fkey | NO ACTION | CASCADE |
| company_invites.invited_by | profiles.id | company_invites_invited_by_fkey | NO ACTION | SET NULL |
| company_invites.role_id | roles.id | company_invites_role_id_fkey | NO ACTION | SET NULL |
| company_join_requests.company_id | companies.id | company_join_requests_company_id_fkey | NO ACTION | CASCADE |
| company_join_requests.profile_id | profiles.id | company_join_requests_profile_id_fkey | NO ACTION | CASCADE |
| company_join_requests.reviewed_by | profiles.id | company_join_requests_reviewed_by_fkey | NO ACTION | SET NULL |
| company_memberships.company_id | companies.id | company_memberships_company_id_fkey | NO ACTION | CASCADE |
| company_memberships.disabled_by | profiles.id | company_memberships_disabled_by_fkey | NO ACTION | SET NULL |
| company_memberships.profile_id | profiles.id | company_memberships_profile_id_fkey | NO ACTION | CASCADE |
| company_plugins.company_id | companies.id | company_plugins_company_id_fkey | NO ACTION | CASCADE |
| company_plugins.installed_by | profiles.id | company_plugins_installed_by_fkey | NO ACTION | SET NULL |
| company_subscriptions.company_id | companies.id | company_subscriptions_company_id_fkey | NO ACTION | CASCADE |
| contacts.account_id | accounts.id | contacts_account_id_fkey | NO ACTION | SET NULL |
| contacts.company_id | companies.id | contacts_company_id_fkey | NO ACTION | CASCADE |
| contacts.created_by | profiles.id | contacts_created_by_fkey | NO ACTION | SET NULL |
| contacts.deleted_by | profiles.id | contacts_deleted_by_fkey | NO ACTION | SET NULL |
| crm_sites.account_id | accounts.id | crm_sites_account_id_fkey | NO ACTION | SET NULL |
| crm_sites.company_id | companies.id | crm_sites_company_id_fkey | NO ACTION | CASCADE |
| crm_sites.contact_id | contacts.id | crm_sites_contact_id_fkey | NO ACTION | CASCADE |
| crm_sites.created_by | profiles.id | crm_sites_created_by_fkey | NO ACTION | SET NULL |
| deals.account_id | accounts.id | deals_account_id_fkey | NO ACTION | SET NULL |
| deals.company_id | companies.id | deals_company_id_fkey | NO ACTION | CASCADE |
| deals.created_by | profiles.id | deals_created_by_fkey | NO ACTION | SET NULL |
| deals.deleted_by | profiles.id | deals_deleted_by_fkey | NO ACTION | SET NULL |
| deals.job_id | jobs.id | deals_job_id_fkey | NO ACTION | SET NULL |
| deals.primary_contact_id | contacts.id | deals_primary_contact_id_fkey | NO ACTION | SET NULL |
| deals.site_id | crm_sites.id | deals_site_id_fkey | NO ACTION | SET NULL |
| field_permissions.company_id | companies.id | field_permissions_company_id_fkey | NO ACTION | CASCADE |
| field_permissions.role_id | roles.id | field_permissions_role_id_fkey | NO ACTION | CASCADE |
| finance_expenses.company_id | companies.id | finance_expenses_company_id_fkey | NO ACTION | CASCADE |
| finance_expenses.created_by | profiles.id | finance_expenses_created_by_fkey | NO ACTION | SET NULL |
| finance_expenses.deleted_by | profiles.id | finance_expenses_deleted_by_fkey | NO ACTION | SET NULL |
| finance_expenses.job_id | jobs.id | finance_expenses_job_id_fkey | NO ACTION | SET NULL |
| finance_expenses.vendor_id | finance_vendors.id | finance_expenses_vendor_id_fkey | NO ACTION | SET NULL |
| finance_invoices.company_id | companies.id | finance_invoices_company_id_fkey | NO ACTION | CASCADE |
| finance_invoices.created_by | profiles.id | finance_invoices_created_by_fkey | NO ACTION | SET NULL |
| finance_invoices.deleted_by | profiles.id | finance_invoices_deleted_by_fkey | NO ACTION | SET NULL |
| finance_invoices.job_id | jobs.id | finance_invoices_job_id_fkey | NO ACTION | SET NULL |
| finance_payments.company_id | companies.id | finance_payments_company_id_fkey | NO ACTION | CASCADE |
| finance_payments.created_by | profiles.id | finance_payments_created_by_fkey | NO ACTION | SET NULL |
| finance_payments.deleted_by | profiles.id | finance_payments_deleted_by_fkey | NO ACTION | SET NULL |
| finance_payments.invoice_id | finance_invoices.id | finance_payments_invoice_id_fkey | NO ACTION | CASCADE |
| finance_vendors.company_id | companies.id | finance_vendors_company_id_fkey | NO ACTION | CASCADE |
| finance_vendors.created_by | profiles.id | finance_vendors_created_by_fkey | NO ACTION | SET NULL |
| finance_vendors.deleted_by | profiles.id | finance_vendors_deleted_by_fkey | NO ACTION | SET NULL |
| form_responses.company_id | companies.id | form_responses_company_id_fkey | NO ACTION | CASCADE |
| form_responses.deleted_by | profiles.id | form_responses_deleted_by_fkey | NO ACTION | SET NULL |
| form_responses.form_id | forms.id | form_responses_form_id_fkey | NO ACTION | CASCADE |
| forms.company_id | companies.id | forms_company_id_fkey | NO ACTION | CASCADE |
| forms.deleted_by | profiles.id | forms_deleted_by_fkey | NO ACTION | SET NULL |
| job_activity.job_id | jobs.id | job_activity_job_id_fkey | NO ACTION | CASCADE |
| job_files.company_id | companies.id | job_files_company_id_fkey | NO ACTION | RESTRICT |
| job_files.deleted_by | profiles.id | job_files_deleted_by_fkey | NO ACTION | SET NULL |
| job_files.job_id | jobs.id | job_files_job_id_fkey | NO ACTION | CASCADE |
| jobs.account_id | accounts.id | jobs_account_id_fkey | NO ACTION | SET NULL |
| jobs.client_id | clients.id | jobs_client_id_fkey | NO ACTION | SET NULL |
| jobs.company_id | companies.id | jobs_company_id_fkey | NO ACTION | RESTRICT |
| jobs.contact_id | contacts.id | jobs_contact_id_fkey | NO ACTION | SET NULL |
| jobs.deal_id | deals.id | jobs_deal_id_fkey | NO ACTION | SET NULL |
| jobs.deleted_by | profiles.id | jobs_deleted_by_fkey | NO ACTION | SET NULL |
| jobs.site_id | crm_sites.id | jobs_site_id_fkey | NO ACTION | SET NULL |
| knowledge_articles.company_id | companies.id | knowledge_articles_company_id_fkey | NO ACTION | CASCADE |
| message_attachments.company_id | companies.id | message_attachments_company_id_fkey | NO ACTION | CASCADE |
| message_attachments.conversation_id | message_conversations.id | message_attachments_conversation_id_fkey | NO ACTION | CASCADE |
| message_attachments.message_id | messages.id | message_attachments_message_id_fkey | NO ACTION | CASCADE |
| message_conversation_access.company_id | companies.id | message_conversation_access_company_id_fkey | NO ACTION | CASCADE |
| message_conversation_access.conversation_id | message_conversations.id | message_conversation_access_conversation_id_fkey | NO ACTION | CASCADE |
| message_conversations.company_id | companies.id | message_conversations_company_id_fkey | NO ACTION | CASCADE |
| message_conversations.created_by | profiles.id | message_conversations_created_by_fkey | NO ACTION | SET NULL |
| message_reads.company_id | companies.id | message_reads_company_id_fkey | NO ACTION | CASCADE |
| message_reads.conversation_id | message_conversations.id | message_reads_conversation_id_fkey | NO ACTION | CASCADE |
| message_reads.profile_id | profiles.id | message_reads_profile_id_fkey | NO ACTION | CASCADE |
| messages.company_id | companies.id | messages_company_id_fkey | NO ACTION | CASCADE |
| messages.conversation_id | message_conversations.id | messages_conversation_id_fkey | NO ACTION | CASCADE |
| messages.sender_profile_id | profiles.id | messages_sender_profile_id_fkey | NO ACTION | CASCADE |
| notifications.company_id | companies.id | notifications_company_id_fkey | NO ACTION | CASCADE |
| notifications.member_id | team_members.id | notifications_member_id_fkey | NO ACTION | RESTRICT |
| notifications.recipient_profile_id | profiles.id | notifications_recipient_profile_id_fkey | NO ACTION | CASCADE |
| notifications.task_id | tasks.id | notifications_task_id_fkey | NO ACTION | CASCADE |
| pipeline_stages.company_id | companies.id | pipeline_stages_company_id_fkey | NO ACTION | CASCADE |
| pricebook_materials.company_id | companies.id | pricebook_materials_company_id_fkey | NO ACTION | CASCADE |
| pricebook_materials.deleted_by | profiles.id | pricebook_materials_deleted_by_fkey | NO ACTION | SET NULL |
| pricebook_vendor_prices.company_id | companies.id | pricebook_vendor_prices_company_id_fkey | NO ACTION | CASCADE |
| pricebook_vendor_prices.deleted_by | profiles.id | pricebook_vendor_prices_deleted_by_fkey | NO ACTION | SET NULL |
| pricebook_vendor_prices.material_id | pricebook_materials.id | pricebook_vendor_prices_material_id_fkey | NO ACTION | CASCADE |
| pricebook_vendor_prices.vendor_id | pricebook_vendors.id | pricebook_vendor_prices_vendor_id_fkey | NO ACTION | CASCADE |
| pricebook_vendors.company_id | companies.id | pricebook_vendors_company_id_fkey | NO ACTION | CASCADE |
| pricebook_vendors.deleted_by | profiles.id | pricebook_vendors_deleted_by_fkey | NO ACTION | SET NULL |
| profiles.member_id | team_members.id | profiles_member_id_fkey | NO ACTION | NO ACTION |
| profiles.supervisor_id | team_members.id | profiles_supervisor_id_fkey | NO ACTION | NO ACTION |
| proposal_documents.company_id | companies.id | proposal_documents_company_id_fkey | NO ACTION | CASCADE |
| proposal_documents.deleted_by | profiles.id | proposal_documents_deleted_by_fkey | NO ACTION | SET NULL |
| recycle_bin_items.company_id | companies.id | recycle_bin_items_company_id_fkey | NO ACTION | CASCADE |
| recycle_bin_items.deleted_by | profiles.id | recycle_bin_items_deleted_by_fkey | NO ACTION | SET NULL |
| recycle_bin_items.restored_by | profiles.id | recycle_bin_items_restored_by_fkey | NO ACTION | SET NULL |
| resource_acl.company_id | companies.id | resource_acl_company_id_fkey | NO ACTION | CASCADE |
| role_permissions.role_id | roles.id | role_permissions_role_id_fkey | NO ACTION | CASCADE |
| roles.company_id | companies.id | roles_company_id_fkey | NO ACTION | CASCADE |
| roles.created_by | profiles.id | roles_created_by_fkey | NO ACTION | SET NULL |
| tasks.assignee_id | team_members.id | tasks_assignee_id_fkey | NO ACTION | RESTRICT |
| tasks.company_id | companies.id | tasks_company_id_fkey | NO ACTION | RESTRICT |
| tasks.creator_id | team_members.id | tasks_creator_id_fkey | NO ACTION | RESTRICT |
| tasks.deleted_by | profiles.id | tasks_deleted_by_fkey | NO ACTION | SET NULL |
| time_entries.task_id | tasks.id | time_entries_task_id_fkey | NO ACTION | CASCADE |
| time_entries.user_id | team_members.id | time_entries_user_id_fkey | NO ACTION | RESTRICT |
| underwriting_cases.company_id | companies.id | underwriting_cases_company_id_fkey | NO ACTION | CASCADE |
| underwriting_cases.contact_id | contacts.id | underwriting_cases_contact_id_fkey | NO ACTION | CASCADE |
| underwriting_cases.created_by | profiles.id | underwriting_cases_created_by_fkey | NO ACTION | SET NULL |
| user_role_assignments.assigned_by | profiles.id | user_role_assignments_assigned_by_fkey | NO ACTION | SET NULL |
| user_role_assignments.company_id | companies.id | user_role_assignments_company_id_fkey | NO ACTION | CASCADE |
| user_role_assignments.profile_id | profiles.id | user_role_assignments_profile_id_fkey | NO ACTION | CASCADE |
| user_role_assignments.role_id | roles.id | user_role_assignments_role_id_fkey | NO ACTION | CASCADE |
| workspace_backup_copies.backup_id | workspace_backups.id | workspace_backup_copies_backup_id_fkey | NO ACTION | SET NULL |
| workspace_backup_copies.company_id | companies.id | workspace_backup_copies_company_id_fkey | NO ACTION | CASCADE |
| workspace_backup_copies.created_by | profiles.id | workspace_backup_copies_created_by_fkey | NO ACTION | SET NULL |
| workspace_backup_copies.deleted_by | profiles.id | workspace_backup_copies_deleted_by_fkey | NO ACTION | SET NULL |
| workspace_backups.company_id | companies.id | workspace_backups_company_id_fkey | NO ACTION | CASCADE |
| workspace_backups.created_by | profiles.id | workspace_backups_created_by_fkey | NO ACTION | SET NULL |
| workspace_backups.deleted_by | profiles.id | workspace_backups_deleted_by_fkey | NO ACTION | SET NULL |
| workspace_builder_state.company_id | companies.id | workspace_builder_state_company_id_fkey | NO ACTION | CASCADE |
| workspace_builder_state.updated_by | profiles.id | workspace_builder_state_updated_by_fkey | NO ACTION | SET NULL |
