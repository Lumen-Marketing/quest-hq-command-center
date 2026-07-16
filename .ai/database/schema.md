# Public schema catalog

Captured 2026-07-16T19:21:04.447Z from the live Supabase catalog. This page is generated for fast reading; [snapshot.json](snapshot.json) is the precise machine-readable source.

Nullable columns end in ?. Arrays and database-specific types use the live Postgres type name.

## public.accounts

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `name` text; `type` text; `industry` text; `website` text; `phone` text; `email` text; `address` text; `owner_name` text; `status` text; `notes` text; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.active_timers

- RLS: enabled
- Primary key: user_id
- Columns: `user_id` text; `task_id` text; `started_at` timestamp with time zone; `task_title` text?; `task_company` text?; `updated_at` timestamp with time zone

## public.activities

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `type` text; `subject` text; `body` text; `related_type` text; `related_id` text; `account_id` text?; `due_at` timestamp with time zone?; `completed_at` timestamp with time zone?; `owner_name` text; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `contact_id` text?; `site_id` text?; `deal_id` text?; `job_id` uuid?; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.audit_events

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text?; `actor_profile_id` uuid?; `event_type` text; `target_type` text?; `target_id` text?; `details` jsonb; `created_at` timestamp with time zone

## public.calendar_events

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `title` text; `description` text; `event_type` text; `starts_at` timestamp with time zone; `ends_at` timestamp with time zone?; `all_day` boolean; `visibility` text; `linked_type` text; `linked_id` text; `assigned_profile_id` text; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.client_portal_annotations

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `portal_id` uuid; `document_id` uuid?; `page_number` integer; `guest_name` text?; `annotation_type` text; `payload` jsonb; `resolved_at` timestamp with time zone?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `author_profile_id` uuid?

## public.client_portal_documents

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `portal_id` uuid; `bucket_id` text; `object_path` text; `file_name` text; `mime_type` text; `size_bytes` bigint; `page_count` integer?; `uploaded_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `version_group_id` uuid; `version_number` integer; `is_current` boolean; `review_status` text; `scale` numeric?; `scale_unit` text; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.client_portal_events

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `portal_id` uuid; `event_type` text; `guest_name` text?; `details` jsonb; `created_at` timestamp with time zone

## public.client_portals

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `job_id` uuid?; `title` text; `client_name` text?; `client_email` text?; `token_hash` text; `password_hash` text?; `password_salt` text?; `status` text; `created_by` uuid?; `last_opened_at` timestamp with time zone?; `revoked_at` timestamp with time zone?; `archived_at` timestamp with time zone?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.clients

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `name` text; `contact_name` text?; `email` text?; `phone` text?; `address` text?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.companies

- RLS: enabled
- Primary key: id
- Columns: `id` text; `name` text; `short_name` text; `color` text?; `created_at` timestamp with time zone; `label` text?; `pill` text?; `icon_key` text; `icon_image` text

## public.company_invites

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `email` text; `role_id` uuid?; `token` text; `status` text; `expires_at` timestamp with time zone; `invited_by` uuid?; `accepted_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.company_join_requests

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `profile_id` uuid?; `requested_email` text?; `status` text; `message` text?; `reviewed_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.company_memberships

- RLS: enabled
- Primary key: company_id, profile_id
- Columns: `company_id` text; `profile_id` uuid; `role` text; `status` text; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `disabled_at` timestamp with time zone?; `disabled_by` uuid?; `left_at` timestamp with time zone?; `last_active_at` timestamp with time zone?

## public.company_plugins

- RLS: enabled
- Primary key: company_id, plugin_id
- Columns: `company_id` text; `plugin_id` text; `status` text; `installed_by` uuid?; `installed_at` timestamp with time zone?; `disabled_at` timestamp with time zone?; `updated_at` timestamp with time zone; `config` jsonb

## public.company_subscriptions

- RLS: enabled
- Primary key: company_id
- Columns: `company_id` text; `stripe_customer_id` text?; `stripe_subscription_id` text?; `status` text; `plan_code` text; `amount_cents` integer; `currency` text; `current_period_end` timestamp with time zone?; `trial_ends_at` timestamp with time zone?; `grace_ends_at` timestamp with time zone?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `stripe_event_id` text?; `stripe_event_created_at` timestamp with time zone?

## public.contacts

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `name` text; `phone` text; `email` text; `location` text; `stage` text; `value` numeric; `owner_name` text; `notes` text; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `account_id` text?; `title` text; `source` text; `last_activity_at` timestamp with time zone?; `temperature` text?; `pay_type` text; `roof_system` text; `country_code` text; `country` text; `province` text; `city` text; `barangay` text; `street` text; `block_no` text; `zip` text; `lat` text; `lng` text; `secondary_roof_system` text; `has_multiple_roof_systems` boolean; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.crm_sites

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `contact_id` text?; `account_id` text?; `label` text; `address` text; `roof_system` text; `secondary_roof_system` text; `has_multiple_roof_systems` boolean; `notes` text; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.deals

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `account_id` text?; `primary_contact_id` text?; `name` text; `stage` text; `status` text; `value` numeric; `probability` integer; `close_date` date?; `owner_name` text; `source` text; `job_id` uuid?; `notes` text; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `site_id` text?; `line_items` jsonb; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.field_permissions

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `resource_type` text; `field_key` text; `role_id` uuid?; `visibility` text; `editable` boolean; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.finance_expenses

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `job_id` uuid?; `vendor_id` text?; `category` text; `amount` numeric; `status` text; `spent_at` date?; `notes` text; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.finance_invoices

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `job_id` uuid?; `client_name` text; `invoice_number` text; `status` text; `issue_date` date?; `due_date` date?; `subtotal` numeric; `tax` numeric; `total` numeric; `notes` text; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.finance_payments

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `invoice_id` text; `amount` numeric; `method` text; `received_at` date?; `reference` text; `notes` text; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.finance_vendors

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `name` text; `contact_name` text; `email` text; `phone` text; `category` text; `status` text; `notes` text; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.form_responses

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `form_id` text; `submitted_by` text; `submitter_email` text; `answers` jsonb; `created_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.forms

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `title` text; `description` text; `type` text; `status` text; `audience` text; `creator_id` text?; `linked_job_id` text?; `theme_color` text; `background` text; `submit_label` text; `collect_email` boolean; `require_approval` boolean; `questions` jsonb; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.job_activity

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `job_id` uuid; `source` text; `event_type` text; `message` text; `metadata` jsonb; `created_at` timestamp with time zone

## public.job_files

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `job_id` uuid?; `bucket_id` text; `object_path` text; `file_name` text; `mime_type` text; `size_bytes` bigint; `category` text; `uploaded_by_label` text?; `notes` text?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `folder` text; `deleted_by` uuid?

## public.jobs

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `client_id` uuid?; `client_name` text?; `name` text; `contact_name` text?; `site_address` text?; `job_type` text; `stage` text; `priority` text; `owner_name` text?; `scope` text?; `start_date` date?; `due_date` date?; `estimate_total` numeric; `invoice_total` numeric; `task_count` integer; `file_count` integer; `notes` text?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `account_id` text?; `deal_id` text?; `contact_id` text?; `site_id` text?; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.knowledge_articles

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `title` text; `body` text; `category` text; `creator_id` text?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.message_attachments

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `conversation_id` uuid; `message_id` uuid; `bucket_id` text; `object_path` text; `file_name` text; `mime_type` text; `size_bytes` bigint; `created_at` timestamp with time zone

## public.message_conversation_access

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `conversation_id` uuid; `target_type` text; `target_id` text; `created_at` timestamp with time zone

## public.message_conversations

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `title` text; `type` text; `created_by` uuid?; `last_message_at` timestamp with time zone?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.message_reads

- RLS: enabled
- Primary key: conversation_id, profile_id
- Columns: `company_id` text; `conversation_id` uuid; `profile_id` uuid; `last_read_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.messages

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `conversation_id` uuid; `sender_profile_id` uuid; `body` text; `message_type` text; `deleted_at` timestamp with time zone?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.notifications

- RLS: enabled
- Primary key: id
- Columns: `id` text; `member_id` text?; `task_id` text?; `meta` text; `html` text; `read` boolean; `created_at` timestamp with time zone; `company_id` text?; `recipient_profile_id` uuid?; `type` text; `title` text; `body` text; `href` text; `source_type` text; `source_id` text; `read_at` timestamp with time zone?

## public.pipeline_stages

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `kind` text; `name` text; `color` text; `position` integer; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.pricebook_materials

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `name` text; `category` text?; `unit` text; `created_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.pricebook_vendor_prices

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `material_id` uuid; `vendor_id` uuid; `sku` text?; `unit_cost` numeric; `updated_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.pricebook_vendors

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `name` text; `type` text; `account_ref` text?; `color` text?; `last_synced_at` timestamp with time zone?; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `credit_terms` text; `on_account` boolean; `payment_terms` text; `credit_limit` numeric?; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.profiles

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `email` text; `full_name` text?; `approved` boolean; `role` text; `email_verified` boolean; `member_id` text?; `supervisor_id` text?; `company_ids` ARRAY; `avatar_url` text?; `onboarded` boolean; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.proposal_documents

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `proposal_no` text; `title` text; `status` text; `related_type` text; `related_id` text; `contact_id` text?; `deal_id` text?; `job_id` text?; `client` jsonb; `draft` jsonb; `total` numeric; `public_token` text; `accepted_by` text; `accepted_email` text; `accepted_at` timestamp with time zone?; `declined_at` timestamp with time zone?; `viewed_at` timestamp with time zone?; `sent_at` timestamp with time zone?; `created_by` text; `created_by_label` text; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.recycle_bin_items

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `source_type` text; `source_table` text; `source_id` text; `item_label` text; `status` text; `deleted_by` uuid?; `deleted_by_label` text; `deleted_at` timestamp with time zone; `restore_until` timestamp with time zone; `restored_at` timestamp with time zone?; `restored_by` uuid?; `snapshot` jsonb; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.resource_acl

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `resource_type` text; `resource_id` text; `principal_type` text; `principal_id` text; `permission_key` text; `effect` text; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.role_permissions

- RLS: enabled
- Primary key: role_id, permission_key
- Columns: `role_id` uuid; `permission_key` text; `effect` text; `created_at` timestamp with time zone

## public.roles

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `name` text; `color` text; `priority` integer; `is_system` boolean; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.tasks

- RLS: enabled
- Primary key: id
- Columns: `id` text; `title` text; `description` text; `type` text; `label` text?; `bid_status` text?; `company_id` text; `creator_id` text; `assignee_id` text; `project_id` text?; `due` date; `due_time` text?; `reminder_at` text?; `priority` text; `urgency` text; `status` text; `watchers` jsonb; `subtasks` jsonb; `activity` jsonb; `cleared_at` timestamp with time zone?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone; `contact_id` text?; `assignee_ids` ARRAY; `wo_number` integer?; `reminder_offset` text?; `deleted_at` timestamp with time zone?; `deleted_by` uuid?

## public.team_members

- RLS: enabled
- Primary key: id
- Columns: `id` text; `name` text; `full_name` text; `email` text; `color` text; `avatar_url` text?; `active` boolean; `company_ids` ARRAY; `created_at` timestamp with time zone

## public.time_entries

- RLS: enabled
- Primary key: id
- Columns: `id` text; `user_id` text; `task_id` text; `start_at` timestamp with time zone; `end_at` timestamp with time zone; `duration_ms` bigint; `note` text; `created_at` timestamp with time zone

## public.underwriting_cases

- RLS: enabled
- Primary key: id
- Columns: `id` uuid; `company_id` text; `contact_id` text; `contract_price` numeric; `material_cost` numeric; `labor_cost` numeric; `permit_cost` numeric; `disposal_cost` numeric; `other_cost` numeric; `overhead_percent` numeric; `commission_percent` numeric; `contingency_percent` numeric; `target_margin_percent` numeric; `notes` text; `created_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.user_role_assignments

- RLS: enabled
- Primary key: company_id, profile_id, role_id
- Columns: `company_id` text; `profile_id` uuid; `role_id` uuid; `assigned_by` uuid?; `created_at` timestamp with time zone

## public.v_pricebook_material_best

- RLS: disabled
- Primary key: —
- Columns: `company_id` text?; `material_id` uuid?; `vendor_id` uuid?; `unit_cost` numeric?; `updated_at` timestamp with time zone?

## public.wo_counters

- RLS: enabled
- Primary key: company_id
- Columns: `company_id` text; `next_val` integer

## public.workspace_backup_copies

- RLS: enabled
- Primary key: id
- Columns: `id` text; `backup_id` text?; `company_id` text; `company_name` text?; `owner_profile_id` uuid?; `owner_email` text?; `created_by` uuid?; `created_by_label` text?; `kind` text; `status` text; `payload` jsonb; `size_bytes` bigint; `record_counts` jsonb; `source_table` text; `original_created_at` timestamp with time zone?; `deleted_at` timestamp with time zone?; `deleted_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.workspace_backups

- RLS: enabled
- Primary key: id
- Columns: `id` text; `company_id` text; `label` text; `kind` text; `status` text; `interval_key` text; `payload` jsonb; `size_bytes` bigint; `record_counts` jsonb; `created_by` uuid?; `created_by_label` text?; `source` text; `imported_from_backup_id` text?; `deleted_at` timestamp with time zone?; `deleted_by` uuid?; `created_at` timestamp with time zone; `updated_at` timestamp with time zone

## public.workspace_builder_state

- RLS: enabled
- Primary key: company_id
- Columns: `company_id` text; `doc` jsonb; `updated_by` uuid?; `updated_at` timestamp with time zone; `created_at` timestamp with time zone

