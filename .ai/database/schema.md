# Public schema catalog

Captured through 2026-09-01T20:02:47.185039Z from the live Supabase catalog. Nullable columns end in `?`.

## public.accounts

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `name text`; `type text`; `industry text`; `website text`; `phone text`; `email text`; `address text`; `owner_name text`; `status text`; `notes text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`; `workspace_id uuid`

## public.active_timers

- RLS: enabled
- Primary key: user_id
- Columns: `user_id text`; `task_id text`; `started_at timestamptz`; `task_title text?`; `task_company text?`; `updated_at timestamptz`

## public.activities

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `type text`; `subject text`; `body text`; `related_type text`; `related_id text`; `account_id text?`; `due_at timestamptz?`; `completed_at timestamptz?`; `owner_name text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `contact_id text?`; `site_id text?`; `deal_id text?`; `job_id uuid?`; `deleted_at timestamptz?`; `deleted_by uuid?`; `workspace_id uuid`

## public.api_rate_limits

- RLS: enabled
- Primary key: bucket
- Columns: `bucket text`; `count int4`; `reset_at timestamptz`; `updated_at timestamptz`

## public.audit_events

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text?`; `actor_profile_id uuid?`; `event_type text`; `target_type text?`; `target_id text?`; `details jsonb`; `created_at timestamptz`

## public.automations

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `name text`; `enabled bool`; `trigger jsonb`; `actions jsonb`; `creator_id text?`; `created_at timestamptz`; `updated_at timestamptz`

## public.bug_reports

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `reporter_id uuid?`; `reporter_name text?`; `reporter_email text?`; `type text`; `description text`; `context jsonb`; `status text`; `created_at timestamptz`; `resolved_at timestamptz?`

## public.calendar_events

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `title text`; `description text`; `event_type text`; `starts_at timestamptz`; `ends_at timestamptz?`; `all_day bool`; `visibility text`; `linked_type text`; `linked_id text`; `assigned_profile_id text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.checkin_log

- RLS: enabled
- Primary key: kind, subject, period
- Columns: `kind text`; `subject text`; `period text`; `sent_at timestamptz`

## public.checkin_settings

- RLS: enabled
- Primary key: company_id
- Columns: `company_id text`; `morning_enabled bool`; `eod_enabled bool`; `stalled_enabled bool`; `stalled_days int4`; `eod_idle_minutes int4`; `updated_by text?`; `updated_at timestamptz`

## public.client_portal_annotations

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `portal_id uuid`; `document_id uuid?`; `page_number int4`; `guest_name text?`; `annotation_type text`; `payload jsonb`; `resolved_at timestamptz?`; `created_at timestamptz`; `updated_at timestamptz`; `author_profile_id uuid?`

## public.client_portal_documents

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `portal_id uuid`; `bucket_id text`; `object_path text`; `file_name text`; `mime_type text`; `size_bytes int8`; `page_count int4?`; `uploaded_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `version_group_id uuid`; `version_number int4`; `is_current bool`; `review_status text`; `scale numeric?`; `scale_unit text`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.client_portal_events

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `portal_id uuid`; `event_type text`; `guest_name text?`; `details jsonb`; `created_at timestamptz`

## public.client_portals

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `job_id uuid?`; `title text`; `client_name text?`; `client_email text?`; `token_hash text`; `password_hash text?`; `password_salt text?`; `status text`; `created_by uuid?`; `last_opened_at timestamptz?`; `revoked_at timestamptz?`; `archived_at timestamptz?`; `created_at timestamptz`; `updated_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.clients

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `name text`; `contact_name text?`; `email text?`; `phone text?`; `address text?`; `created_at timestamptz`; `updated_at timestamptz`

## public.comment_reactions

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `comment_id uuid`; `member_id text`; `emoji text`; `created_at timestamptz`

## public.companies

- RLS: enabled
- Primary key: id
- Columns: `id text`; `name text`; `short_name text`; `color text?`; `created_at timestamptz`; `label text?`; `pill text?`; `icon_key text`; `icon_image text`; `appearance_prefs jsonb`; `icon_color text`; `primary_owner_profile_id uuid?`

## public.company_active_timers

- RLS: enabled
- Primary key: profile_id
- Columns: `profile_id uuid`; `company_id text`; `task_id text`; `task_title text`; `started_at timestamptz`; `updated_at timestamptz`

## public.company_contact_fields

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `label text`; `type text`; `config jsonb`; `required bool`; `position int4`; `created_at timestamptz`; `updated_at timestamptz`; `hidden bool`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.company_contact_options

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `label text`; `color text`; `position int4`; `created_at timestamptz`; `updated_at timestamptz`; `kind text`

## public.company_contacts

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `name text`; `contact_type text`; `organization text`; `phone text`; `email text`; `location text`; `notes text`; `last_activity_at timestamptz?`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`; `field_values jsonb`

## public.company_invites

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `email text`; `role_id uuid?`; `token text`; `status text`; `expires_at timestamptz`; `invited_by uuid?`; `accepted_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `workspace_ids _uuid`; `email_status text`; `email_sent_at timestamptz?`; `email_last_error text?`

## public.company_join_requests

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `profile_id uuid?`; `requested_email text?`; `status text`; `message text?`; `reviewed_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.company_memberships

- RLS: enabled
- Primary key: company_id, profile_id
- Columns: `company_id text`; `profile_id uuid`; `role text`; `status text`; `created_at timestamptz`; `updated_at timestamptz`; `disabled_at timestamptz?`; `disabled_by uuid?`; `left_at timestamptz?`; `last_active_at timestamptz?`

## public.company_plugins

- RLS: enabled
- Primary key: company_id, plugin_id
- Columns: `company_id text`; `plugin_id text`; `status text`; `installed_by uuid?`; `installed_at timestamptz?`; `disabled_at timestamptz?`; `updated_at timestamptz`; `config jsonb`

## public.company_setup_profiles

- RLS: enabled
- Primary key: company_id
- Columns: `company_id text`; `answers jsonb`; `draft_plan jsonb`; `applied_plan jsonb`; `status text`; `setup_version int4`; `reset_count int4`; `applied_at timestamptz?`; `reset_at timestamptz?`; `created_at timestamptz`; `updated_at timestamptz`; `updated_by uuid?`

## public.company_subscriptions

- RLS: enabled
- Primary key: company_id
- Columns: `company_id text`; `stripe_customer_id text?`; `stripe_subscription_id text?`; `status text`; `plan_code text`; `amount_cents int4`; `currency text`; `current_period_end timestamptz?`; `trial_ends_at timestamptz?`; `grace_ends_at timestamptz?`; `created_at timestamptz`; `updated_at timestamptz`; `stripe_event_id text?`; `stripe_event_created_at timestamptz?`; `terminal_status text?`

## public.company_time_entries

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `profile_id uuid`; `task_id text`; `task_title text`; `started_at timestamptz`; `ended_at timestamptz`; `duration_ms int8`; `notes text`; `created_at timestamptz`

## public.contact_label_assignments

- RLS: enabled
- Primary key: contact_id, label_id
- Columns: `contact_id text`; `label_id uuid`; `workspace_id uuid`; `company_id text`; `assigned_by uuid?`; `assigned_at timestamptz`

## public.contact_labels

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `workspace_id uuid`; `name text`; `color text`; `description text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.contacts

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `name text`; `phone text`; `email text`; `location text`; `stage text`; `value numeric`; `owner_name text`; `notes text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `account_id text?`; `title text`; `source text`; `last_activity_at timestamptz?`; `temperature text?`; `pay_type text`; `roof_system text`; `country_code text`; `country text`; `province text`; `city text`; `barangay text`; `street text`; `block_no text`; `zip text`; `lat text`; `lng text`; `secondary_roof_system text`; `has_multiple_roof_systems bool`; `deleted_at timestamptz?`; `deleted_by uuid?`; `workspace_id uuid`; `contact_type text`

## public.crm_sites

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `contact_id text?`; `account_id text?`; `label text`; `address text`; `roof_system text`; `secondary_roof_system text`; `has_multiple_roof_systems bool`; `notes text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `workspace_id uuid`

## public.deals

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `account_id text?`; `primary_contact_id text?`; `name text`; `stage text`; `status text`; `value numeric`; `probability int4`; `close_date date?`; `owner_name text`; `source text`; `job_id uuid?`; `notes text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `site_id text?`; `line_items jsonb`; `deleted_at timestamptz?`; `deleted_by uuid?`; `workspace_id uuid`; `contact_quote_request_id uuid?`; `takeoff jsonb`

## public.eod_reports

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `workspace_id uuid?`; `report_date date`; `team_member text`; `calls_made int4`; `quotes_sent int4`; `appointments_set int4`; `follow_ups_completed int4`; `hot_leads text`; `blockers text`; `status text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.field_permissions

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `resource_type text`; `field_key text`; `role_id uuid?`; `visibility text`; `editable bool`; `created_at timestamptz`; `updated_at timestamptz`

## public.finance_expenses

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `job_id uuid?`; `vendor_id text?`; `category text`; `amount numeric`; `status text`; `spent_at date?`; `notes text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.finance_invoices

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `job_id uuid?`; `client_name text`; `invoice_number text`; `status text`; `issue_date date?`; `due_date date?`; `subtotal numeric`; `tax numeric`; `total numeric`; `notes text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.finance_payments

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `invoice_id text`; `amount numeric`; `method text`; `received_at date?`; `reference text`; `notes text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.finance_vendors

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `name text`; `contact_name text`; `email text`; `phone text`; `category text`; `status text`; `notes text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.form_responses

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `form_id text`; `submitted_by text`; `submitter_email text`; `answers jsonb`; `created_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.form_upload_intents

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `form_id text`; `question_id text`; `object_path text`; `expected_name text`; `expected_type text`; `expected_size int8`; `created_at timestamptz`; `expires_at timestamptz`; `claimed_at timestamptz?`; `response_id text?`

## public.forms

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `title text`; `description text`; `type text`; `status text`; `audience text`; `creator_id text?`; `linked_job_id text?`; `theme_color text`; `background text`; `submit_label text`; `collect_email bool`; `require_approval bool`; `questions jsonb`; `created_at timestamptz`; `updated_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.job_activity

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `job_id uuid`; `source text`; `event_type text`; `message text`; `metadata jsonb`; `created_at timestamptz`

## public.job_change_order_lines

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `job_id uuid`; `change_order_id uuid`; `kind text`; `label text`; `qty numeric`; `days numeric`; `unit_cost numeric`; `material_id uuid?`; `sort_order int4`; `created_at timestamptz`; `updated_at timestamptz`

## public.job_change_orders

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `job_id uuid`; `title text`; `description text`; `price numeric`; `cost numeric`; `step text`; `requested_by text`; `asked_via text`; `sent_via text`; `execute_when text`; `accepted_at timestamptz?`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `pricing_method text`; `margin_pct numeric`

## public.job_cost_buckets

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `job_id uuid`; `name text`; `expected numeric`; `spent numeric`; `status text`; `note text`; `sort_order int4`; `created_at timestamptz`; `updated_at timestamptz`

## public.job_dailies

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `job_id uuid`; `report_date date`; `crew_label text`; `crew_names _text`; `production text`; `production_note text`; `site_cleaned bool?`; `materials_ok bool?`; `materials_needed _text`; `notes text`; `photo_count int4`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.job_draws

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `job_id uuid`; `label text`; `amount numeric`; `status text`; `invoiced_at timestamptz?`; `paid_at timestamptz?`; `sort_order int4`; `created_at timestamptz`; `updated_at timestamptz`

## public.job_files

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `job_id uuid?`; `bucket_id text`; `object_path text`; `file_name text`; `mime_type text`; `size_bytes int8`; `category text`; `uploaded_by_label text?`; `notes text?`; `created_at timestamptz`; `updated_at timestamptz`; `deleted_at timestamptz?`; `folder text`; `deleted_by uuid?`; `workspace_id uuid`

## public.job_plans

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `job_id uuid`; `name text`; `version text`; `is_current bool`; `file_id uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.jobs

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `client_id uuid?`; `client_name text?`; `name text`; `contact_name text?`; `site_address text?`; `job_type text`; `stage text`; `priority text`; `owner_name text?`; `scope text?`; `start_date date?`; `due_date date?`; `estimate_total numeric`; `invoice_total numeric`; `task_count int4`; `file_count int4`; `notes text?`; `created_at timestamptz`; `updated_at timestamptz`; `account_id text?`; `deal_id text?`; `contact_id text?`; `site_id text?`; `deleted_at timestamptz?`; `deleted_by uuid?`; `workspace_id uuid`; `starts_on date?`; `ends_on date?`

## public.knowledge_articles

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `title text`; `body text`; `category text`; `creator_id text?`; `created_at timestamptz`; `updated_at timestamptz`

## public.message_attachments

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `conversation_id uuid`; `message_id uuid`; `bucket_id text`; `object_path text`; `file_name text`; `mime_type text`; `size_bytes int8`; `created_at timestamptz`

## public.message_conversation_access

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `conversation_id uuid`; `target_type text`; `target_id text`; `created_at timestamptz`; `cleared_at timestamptz?`; `left_at timestamptz?`

## public.message_conversations

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `title text`; `type text`; `created_by uuid?`; `last_message_at timestamptz?`; `created_at timestamptz`; `updated_at timestamptz`; `icon_key text`; `icon_image text`

## public.message_reads

- RLS: enabled
- Primary key: conversation_id, profile_id
- Columns: `company_id text`; `conversation_id uuid`; `profile_id uuid`; `last_read_at timestamptz`; `updated_at timestamptz`

## public.messages

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `conversation_id uuid`; `sender_profile_id uuid`; `body text`; `message_type text`; `deleted_at timestamptz?`; `created_at timestamptz`; `updated_at timestamptz`

## public.notifications

- RLS: enabled
- Primary key: id
- Columns: `id text`; `member_id text?`; `task_id text?`; `meta text`; `html text`; `read bool`; `created_at timestamptz`; `company_id text?`; `recipient_profile_id uuid?`; `type text`; `title text`; `body text`; `href text`; `source_type text`; `source_id text`; `read_at timestamptz?`

## public.pipeline_stages

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `kind text`; `name text`; `color text`; `position int4`; `created_at timestamptz`; `updated_at timestamptz`; `workspace_id uuid`

## public.pricebook_materials

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `name text`; `category text?`; `unit text`; `created_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.pricebook_vendor_prices

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `material_id uuid`; `vendor_id uuid`; `sku text?`; `unit_cost numeric`; `updated_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.pricebook_vendors

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `name text`; `type text`; `account_ref text?`; `color text?`; `last_synced_at timestamptz?`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `credit_terms text`; `on_account bool`; `payment_terms text`; `credit_limit numeric?`; `deleted_at timestamptz?`; `deleted_by uuid?`

## public.profiles

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `email text`; `full_name text?`; `approved bool`; `role text`; `email_verified bool`; `member_id text?`; `supervisor_id text?`; `company_ids _text`; `avatar_url text?`; `onboarded bool`; `created_at timestamptz`; `updated_at timestamptz`; `position text?`; `appearance_prefs jsonb`; `ui_prefs jsonb`

## public.projects

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `name text`; `address text`; `status text`; `budget numeric?`; `start_date date?`; `due_date date?`; `color text`; `client text?`; `created_at timestamptz`; `updated_at timestamptz`

## public.proposal_documents

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `proposal_no text`; `title text`; `status text`; `related_type text`; `related_id text`; `contact_id text?`; `deal_id text?`; `job_id text?`; `client jsonb`; `draft jsonb`; `total numeric`; `public_token text`; `accepted_by text`; `accepted_email text`; `accepted_at timestamptz?`; `declined_at timestamptz?`; `viewed_at timestamptz?`; `sent_at timestamptz?`; `created_by text`; `created_by_label text`; `created_at timestamptz`; `updated_at timestamptz`; `deleted_at timestamptz?`; `deleted_by uuid?`; `workspace_id uuid`

## public.record_history

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `workspace_id uuid`; `record_type text`; `record_id text`; `record_label text`; `action text`; `actor_profile_id uuid?`; `changed_fields _text`; `changes jsonb`; `created_at timestamptz`

## public.recycle_bin_items

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `source_type text`; `source_table text`; `source_id text`; `item_label text`; `status text`; `deleted_by uuid?`; `deleted_by_label text`; `deleted_at timestamptz`; `restore_until timestamptz`; `restored_at timestamptz?`; `restored_by uuid?`; `snapshot jsonb`; `created_at timestamptz`; `updated_at timestamptz`

## public.reminder_log

- RLS: enabled
- Primary key: task_id, kind
- Columns: `task_id text`; `kind text`; `sent_at timestamptz`

## public.resource_acl

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `resource_type text`; `resource_id text`; `principal_type text`; `principal_id text`; `permission_key text`; `effect text`; `created_at timestamptz`; `updated_at timestamptz`

## public.ringcentral_accounts

- RLS: enabled
- Primary key: company_id
- Columns: `company_id text`; `rc_account_id text`; `credential_source text`; `credential_key text`; `status text`; `created_at timestamptz`; `updated_at timestamptz`

## public.ringcentral_calls

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `call_id text`; `session_id text`; `started_at timestamptz`; `direction text`; `from_number text`; `from_name text`; `to_number text`; `to_name text`; `extension_id text`; `extension_number text`; `extension_name text`; `extension_email text`; `duration_seconds int4`; `result text`; `is_conversation bool`; `raw jsonb`; `created_at timestamptz`; `updated_at timestamptz`

## public.ringcentral_extensions

- RLS: enabled
- Primary key: company_id, extension_id
- Columns: `company_id text`; `extension_id text`; `extension_number text`; `name text`; `email text`; `status text`; `updated_at timestamptz`

## public.ringcentral_presence

- RLS: enabled
- Primary key: company_id, extension_id
- Columns: `company_id text`; `extension_id text`; `display_status text`; `status_since timestamptz`; `updated_at timestamptz`

## public.ringcentral_sync_state

- RLS: enabled
- Primary key: company_id
- Columns: `company_id text`; `last_sync_at timestamptz?`; `backfilled_through timestamptz?`; `consecutive_failures int4`; `last_error text`; `updated_at timestamptz`

## public.role_permissions

- RLS: enabled
- Primary key: role_id, permission_key
- Columns: `role_id uuid`; `permission_key text`; `effect text`; `created_at timestamptz`

## public.roles

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `name text`; `color text`; `priority int4`; `is_system bool`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.task_comments

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `task_id text`; `author_id text`; `body text`; `mentions _text`; `kind text`; `created_at timestamptz`

## public.task_labels

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `key text`; `label text`; `color text`; `sort_order float8`; `active bool`; `created_at timestamptz`

## public.task_type_statuses

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `type_key text`; `key text`; `label text`; `color text`; `sort_order float8`; `is_done bool`; `is_default bool`; `active bool`; `created_at timestamptz`

## public.task_types

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `key text`; `label text`; `color text`; `sort_order float8`; `active bool`; `created_at timestamptz`

## public.tasks

- RLS: enabled
- Primary key: id
- Columns: `id text`; `title text`; `description text`; `type text`; `label text?`; `bid_status text?`; `company_id text`; `creator_id text`; `assignee_id text`; `project_id text?`; `due date`; `due_time text?`; `reminder_at text?`; `priority text`; `urgency text`; `status text`; `watchers jsonb`; `subtasks jsonb`; `activity jsonb`; `cleared_at timestamptz?`; `created_at timestamptz`; `updated_at timestamptz`; `contact_id text?`; `assignee_ids _text`; `wo_number int4?`; `reminder_offset text?`; `deleted_at timestamptz?`; `deleted_by uuid?`; `deal_id text?`; `recurrence text?`; `workspace_id uuid`; `focus_seq float4?`; `completed_at timestamptz?`; `stuck jsonb?`; `job_id uuid?`

## public.team_members

- RLS: enabled
- Primary key: id
- Columns: `id text`; `name text`; `full_name text`; `email text`; `color text`; `avatar_url text?`; `active bool`; `company_ids _text`; `created_at timestamptz`; `position text?`; `role text?`

## public.time_entries

- RLS: enabled
- Primary key: id
- Columns: `id text`; `user_id text`; `task_id text`; `start_at timestamptz`; `end_at timestamptz`; `duration_ms int8`; `note text`; `created_at timestamptz`

## public.underwriting_calculators

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `workspace_id text`; `name text`; `config jsonb`; `position int4`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.underwriting_cases

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `contact_id text`; `contract_price numeric`; `material_cost numeric`; `labor_cost numeric`; `permit_cost numeric`; `disposal_cost numeric`; `other_cost numeric`; `overhead_percent numeric`; `commission_percent numeric`; `contingency_percent numeric`; `target_margin_percent numeric`; `notes text`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `workspace_id uuid`; `takeoff jsonb`

## public.user_role_assignments

- RLS: enabled
- Primary key: company_id, profile_id, role_id
- Columns: `company_id text`; `profile_id uuid`; `role_id uuid`; `assigned_by uuid?`; `created_at timestamptz`

## public.v_pricebook_material_best

- RLS: disabled
- Primary key: none
- Columns: `company_id text?`; `material_id uuid?`; `vendor_id uuid?`; `unit_cost numeric?`; `updated_at timestamptz?`

## public.wb_intake_links

- RLS: enabled
- Primary key: token
- Columns: `token text`; `company_id text`; `workspace_id uuid`; `app_id text`; `title text`; `intro text`; `visibility text`; `passcode_hash text?`; `passcode_salt text?`; `field_ids jsonb`; `status text`; `submission_count int4`; `max_submissions int4?`; `expires_at timestamptz?`; `failed_attempts int4`; `locked_until timestamptz?`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.wb_intake_submissions

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `token text`; `company_id text`; `workspace_id uuid`; `app_id text`; `values jsonb`; `status text`; `accepted_item_id text?`; `reviewed_by uuid?`; `reviewed_at timestamptz?`; `submitted_name text`; `submitted_email text`; `created_at timestamptz`

## public.wb_record_events

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `workspace_id uuid`; `app_id text`; `item_id text`; `kind text`; `title text`; `body text`; `to_number text`; `scheduled_for timestamptz`; `status text`; `created_by uuid?`; `created_at timestamptz`; `completed_at timestamptz?`; `notified_at timestamptz?`

## public.wb_records

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `workspace_id uuid`; `app_id text`; `data jsonb`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.wo_counters

- RLS: enabled
- Primary key: company_id
- Columns: `company_id text`; `next_val int4`

## public.workspace_backup_copies

- RLS: enabled
- Primary key: id
- Columns: `id text`; `backup_id text?`; `company_id text`; `company_name text?`; `owner_profile_id uuid?`; `owner_email text?`; `created_by uuid?`; `created_by_label text?`; `kind text`; `status text`; `payload jsonb`; `size_bytes int8`; `record_counts jsonb`; `source_table text`; `original_created_at timestamptz?`; `deleted_at timestamptz?`; `deleted_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.workspace_backups

- RLS: enabled
- Primary key: id
- Columns: `id text`; `company_id text`; `label text`; `kind text`; `status text`; `interval_key text`; `payload jsonb`; `size_bytes int8`; `record_counts jsonb`; `created_by uuid?`; `created_by_label text?`; `source text`; `imported_from_backup_id text?`; `deleted_at timestamptz?`; `deleted_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.workspace_builder_state

- RLS: enabled
- Primary key: company_id
- Columns: `company_id text`; `doc jsonb`; `updated_by uuid?`; `updated_at timestamptz`; `created_at timestamptz`

## public.workspace_memberships

- RLS: enabled
- Primary key: workspace_id, profile_id
- Columns: `workspace_id uuid`; `profile_id uuid`; `role_id uuid?`; `status text`; `assigned_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`

## public.workspace_plugins

- RLS: enabled
- Primary key: workspace_id, plugin_id
- Columns: `workspace_id uuid`; `plugin_id text`; `status text`; `config jsonb`; `installed_by uuid?`; `installed_at timestamptz?`; `disabled_at timestamptz?`; `created_at timestamptz`; `updated_at timestamptz`

## public.workspace_setup_profiles

- RLS: enabled
- Primary key: workspace_id
- Columns: `workspace_id uuid`; `answers jsonb`; `draft_plan jsonb`; `applied_plan jsonb`; `status text`; `setup_version int4`; `reset_count int4`; `applied_at timestamptz?`; `reset_at timestamptz?`; `created_at timestamptz`; `updated_at timestamptz`; `updated_by uuid?`; `revision int4`

## public.workspaces

- RLS: enabled
- Primary key: id
- Columns: `id uuid`; `company_id text`; `slug text`; `name text`; `description text`; `icon_key text`; `color text`; `status text`; `is_default bool`; `created_by uuid?`; `created_at timestamptz`; `updated_at timestamptz`; `icon_image text`; `position int4`
