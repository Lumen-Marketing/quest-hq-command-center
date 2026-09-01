-- These seven SECURITY DEFINER helpers already use schema-qualified references.
-- Remove the remaining mutable schemas from their execution environment without
-- replacing their bodies, owners, volatility, grants, or trigger bindings.

alter function app_private.chat_attachment_visible(uuid, uuid)
  set search_path = '';

alter function app_private.chat_left_at(uuid)
  set search_path = '';

alter function app_private.chat_message_visible(uuid, timestamptz)
  set search_path = '';

alter function app_private.companies_seed_task_taxonomy()
  set search_path = '';

alter function app_private.guard_system_role()
  set search_path = '';

alter function app_private.guard_wildcard_permission()
  set search_path = '';

alter function app_private.seed_company_default_roles(text, uuid)
  set search_path = '';
