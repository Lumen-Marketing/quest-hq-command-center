# Database security catalog

Captured through 2026-08-28T19:16:59.435Z. Policy expressions are intentionally omitted from the metadata snapshot; review migrations and live routine definitions for exact predicates.

## RLS coverage

| Table | RLS | Policies | Commands |
| --- | --- | ---: | --- |
| accounts | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| active_timers | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| activities | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| api_rate_limits | enabled | 0 |  |
| audit_events | enabled | 2 | INSERT, SELECT |
| automations | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| bug_reports | enabled | 3 | DELETE, SELECT, UPDATE |
| calendar_events | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| checkin_log | enabled | 0 |  |
| checkin_settings | enabled | 3 | INSERT, SELECT, UPDATE |
| client_portal_annotations | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| client_portal_documents | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| client_portal_events | enabled | 2 | INSERT, SELECT |
| client_portals | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| clients | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| comment_reactions | enabled | 3 | DELETE, INSERT, SELECT |
| companies | enabled | 2 | SELECT, UPDATE |
| company_active_timers | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| company_contact_fields | enabled | 3 | INSERT, SELECT, UPDATE |
| company_contact_options | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| company_contacts | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| company_invites | enabled | 1 | ALL |
| company_join_requests | enabled | 2 | SELECT, UPDATE |
| company_memberships | enabled | 2 | ALL, SELECT |
| company_plugins | enabled | 2 | ALL, SELECT |
| company_setup_profiles | enabled | 1 | SELECT |
| company_subscriptions | enabled | 1 | SELECT |
| company_time_entries | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| contact_label_assignments | enabled | 3 | DELETE, INSERT, SELECT |
| contact_labels | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| contacts | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| crm_sites | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| deals | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| eod_reports | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| field_permissions | enabled | 2 | ALL, SELECT |
| finance_expenses | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| finance_invoices | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| finance_payments | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| finance_vendors | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| form_responses | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| forms | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| job_activity | enabled | 1 | ALL |
| job_change_order_lines | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| job_change_orders | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| job_cost_buckets | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| job_dailies | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| job_draws | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| job_files | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| job_plans | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| jobs | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| knowledge_articles | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| message_attachments | enabled | 2 | INSERT, SELECT |
| message_conversation_access | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| message_conversations | enabled | 3 | INSERT, SELECT, UPDATE |
| message_reads | enabled | 3 | INSERT, SELECT, UPDATE |
| messages | enabled | 3 | INSERT, SELECT, UPDATE |
| notifications | enabled | 8 | DELETE, INSERT, SELECT, UPDATE |
| pipeline_stages | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| pricebook_materials | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| pricebook_vendor_prices | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| pricebook_vendors | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| profiles | enabled | 4 | DELETE, SELECT, UPDATE |
| projects | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| proposal_documents | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| record_history | enabled | 1 | SELECT |
| recycle_bin_items | enabled | 1 | ALL |
| reminder_log | enabled | 0 |  |
| resource_acl | enabled | 2 | ALL, SELECT |
| ringcentral_accounts | enabled | 1 | SELECT |
| ringcentral_calls | enabled | 1 | SELECT |
| ringcentral_extensions | enabled | 1 | SELECT |
| ringcentral_presence | enabled | 1 | SELECT |
| ringcentral_sync_state | enabled | 1 | SELECT |
| role_permissions | enabled | 2 | ALL, SELECT |
| roles | enabled | 2 | ALL, SELECT |
| task_comments | enabled | 3 | DELETE, INSERT, SELECT |
| task_labels | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| task_type_statuses | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| task_types | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| tasks | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| team_members | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| time_entries | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| underwriting_calculators | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| underwriting_cases | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| user_role_assignments | enabled | 2 | ALL, SELECT |
| v_pricebook_material_best | disabled | 0 |  |
| wb_intake_links | enabled | 2 | ALL, SELECT |
| wb_intake_submissions | enabled | 3 | DELETE, SELECT, UPDATE |
| wb_record_events | enabled | 2 | ALL, SELECT |
| wb_records | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| wo_counters | enabled | 1 | SELECT |
| workspace_backup_copies | enabled | 2 | ALL, SELECT |
| workspace_backups | enabled | 1 | ALL |
| workspace_builder_state | enabled | 3 | INSERT, SELECT, UPDATE |
| workspace_memberships | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| workspace_plugins | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| workspace_setup_profiles | enabled | 1 | SELECT |
| workspaces | enabled | 3 | INSERT, SELECT, UPDATE |

## Policy catalog

| Table | Policy | Roles | Command | Mode |
| --- | --- | --- | --- | --- |
| accounts | accounts workspace delete | {authenticated} | DELETE | PERMISSIVE |
| accounts | accounts workspace insert | {authenticated} | INSERT | PERMISSIVE |
| accounts | accounts workspace read | {authenticated} | SELECT | PERMISSIVE |
| accounts | accounts workspace update | {authenticated} | UPDATE | PERMISSIVE |
| active_timers | own or company-admin read active_timers | {authenticated} | SELECT | PERMISSIVE |
| active_timers | role users can delete active_timers | {authenticated} | DELETE | PERMISSIVE |
| active_timers | role users can insert active_timers | {authenticated} | INSERT | PERMISSIVE |
| active_timers | role users can update active_timers | {authenticated} | UPDATE | PERMISSIVE |
| activities | activities workspace delete | {authenticated} | DELETE | PERMISSIVE |
| activities | activities workspace insert | {authenticated} | INSERT | PERMISSIVE |
| activities | activities workspace read | {authenticated} | SELECT | PERMISSIVE |
| activities | activities workspace update | {authenticated} | UPDATE | PERMISSIVE |
| audit_events | admins insert audit events | {authenticated} | INSERT | PERMISSIVE |
| audit_events | members read audit events | {authenticated} | SELECT | PERMISSIVE |
| automations | admins create company automations | {authenticated} | INSERT | PERMISSIVE |
| automations | admins delete company automations | {authenticated} | DELETE | PERMISSIVE |
| automations | admins update company automations | {authenticated} | UPDATE | PERMISSIVE |
| automations | members read company automations | {authenticated} | SELECT | PERMISSIVE |
| bug_reports | quest admins delete bug_reports | {authenticated} | DELETE | PERMISSIVE |
| bug_reports | quest admins read bug_reports | {authenticated} | SELECT | PERMISSIVE |
| bug_reports | quest admins update bug_reports | {authenticated} | UPDATE | PERMISSIVE |
| calendar_events | calendar events delete by managers or creator | {authenticated} | DELETE | PERMISSIVE |
| calendar_events | calendar events insert by managers | {authenticated} | INSERT | PERMISSIVE |
| calendar_events | calendar events update by managers or creator | {authenticated} | UPDATE | PERMISSIVE |
| calendar_events | calendar events visible to allowed members | {authenticated} | SELECT | PERMISSIVE |
| checkin_settings | company admins insert checkin_settings | {authenticated} | INSERT | PERMISSIVE |
| checkin_settings | company admins read checkin_settings | {authenticated} | SELECT | PERMISSIVE |
| checkin_settings | company admins update checkin_settings | {authenticated} | UPDATE | PERMISSIVE |
| client_portal_annotations | managers delete portal annotations | {authenticated} | DELETE | PERMISSIVE |
| client_portal_annotations | managers insert portal annotations | {authenticated} | INSERT | PERMISSIVE |
| client_portal_annotations | managers update portal annotations | {authenticated} | UPDATE | PERMISSIVE |
| client_portal_annotations | members read portal annotations | {authenticated} | SELECT | PERMISSIVE |
| client_portal_documents | managers delete portal documents | {authenticated} | DELETE | PERMISSIVE |
| client_portal_documents | managers insert portal documents | {authenticated} | INSERT | PERMISSIVE |
| client_portal_documents | managers update portal documents | {authenticated} | UPDATE | PERMISSIVE |
| client_portal_documents | members read portal documents | {authenticated} | SELECT | PERMISSIVE |
| client_portal_events | managers insert portal events | {authenticated} | INSERT | PERMISSIVE |
| client_portal_events | members read portal events | {authenticated} | SELECT | PERMISSIVE |
| client_portals | managers delete client portals | {authenticated} | DELETE | PERMISSIVE |
| client_portals | managers insert client portals | {authenticated} | INSERT | PERMISSIVE |
| client_portals | managers update client portals | {authenticated} | UPDATE | PERMISSIVE |
| client_portals | members read client portals | {authenticated} | SELECT | PERMISSIVE |
| clients | clients edited by job managers | {authenticated} | UPDATE | PERMISSIVE |
| clients | clients removed by job managers | {authenticated} | DELETE | PERMISSIVE |
| clients | clients visible to job viewers | {authenticated} | SELECT | PERMISSIVE |
| clients | clients written by job managers | {authenticated} | INSERT | PERMISSIVE |
| comment_reactions | company members insert own comment_reactions | {authenticated} | INSERT | PERMISSIVE |
| comment_reactions | company members read comment_reactions | {authenticated} | SELECT | PERMISSIVE |
| comment_reactions | owners and admins delete comment_reactions | {authenticated} | DELETE | PERMISSIVE |
| companies | admins update companies | {authenticated} | UPDATE | PERMISSIVE |
| companies | members read their companies | {authenticated} | SELECT | PERMISSIVE |
| company_active_timers | move own clock | {authenticated} | UPDATE | PERMISSIVE |
| company_active_timers | own running clock | {authenticated} | SELECT | PERMISSIVE |
| company_active_timers | start own clock | {authenticated} | INSERT | PERMISSIVE |
| company_active_timers | stop own clock | {authenticated} | DELETE | PERMISSIVE |
| company_contact_fields | company contact fields insert | {authenticated} | INSERT | PERMISSIVE |
| company_contact_fields | company contact fields read | {authenticated} | SELECT | PERMISSIVE |
| company_contact_fields | company contact fields update | {authenticated} | UPDATE | PERMISSIVE |
| company_contact_options | company contact options delete | {authenticated} | DELETE | PERMISSIVE |
| company_contact_options | company contact options insert | {authenticated} | INSERT | PERMISSIVE |
| company_contact_options | company contact options read | {authenticated} | SELECT | PERMISSIVE |
| company_contact_options | company contact options update | {authenticated} | UPDATE | PERMISSIVE |
| company_contacts | company contacts delete | {authenticated} | DELETE | PERMISSIVE |
| company_contacts | company contacts insert | {authenticated} | INSERT | PERMISSIVE |
| company_contacts | company contacts read | {authenticated} | SELECT | PERMISSIVE |
| company_contacts | company contacts update | {authenticated} | UPDATE | PERMISSIVE |
| company_invites | admins manage invites | {authenticated} | ALL | PERMISSIVE |
| company_join_requests | admins manage join requests | {authenticated} | UPDATE | PERMISSIVE |
| company_join_requests | requesters read own join requests | {authenticated} | SELECT | PERMISSIVE |
| company_memberships | admins manage company memberships | {authenticated} | ALL | PERMISSIVE |
| company_memberships | members read company memberships | {authenticated} | SELECT | PERMISSIVE |
| company_plugins | admins manage company plugins | {authenticated} | ALL | PERMISSIVE |
| company_plugins | members read company plugins | {authenticated} | SELECT | PERMISSIVE |
| company_setup_profiles | company_setup_profiles_select_admin | {authenticated} | SELECT | PERMISSIVE |
| company_subscriptions | members read subscriptions | {authenticated} | SELECT | PERMISSIVE |
| company_time_entries | correct own time | {authenticated} | UPDATE | PERMISSIVE |
| company_time_entries | drop own time | {authenticated} | DELETE | PERMISSIVE |
| company_time_entries | log own time | {authenticated} | INSERT | PERMISSIVE |
| company_time_entries | own time entries | {authenticated} | SELECT | PERMISSIVE |
| contact_label_assignments | contact label assignments workspace delete | {authenticated} | DELETE | PERMISSIVE |
| contact_label_assignments | contact label assignments workspace insert | {authenticated} | INSERT | PERMISSIVE |
| contact_label_assignments | contact label assignments workspace read | {authenticated} | SELECT | PERMISSIVE |
| contact_labels | contact labels workspace delete | {authenticated} | DELETE | PERMISSIVE |
| contact_labels | contact labels workspace insert | {authenticated} | INSERT | PERMISSIVE |
| contact_labels | contact labels workspace read | {authenticated} | SELECT | PERMISSIVE |
| contact_labels | contact labels workspace update | {authenticated} | UPDATE | PERMISSIVE |
| contacts | contacts workspace delete | {authenticated} | DELETE | PERMISSIVE |
| contacts | contacts workspace insert | {authenticated} | INSERT | PERMISSIVE |
| contacts | contacts workspace read | {authenticated} | SELECT | PERMISSIVE |
| contacts | contacts workspace update | {authenticated} | UPDATE | PERMISSIVE |
| crm_sites | crm_sites workspace delete | {authenticated} | DELETE | PERMISSIVE |
| crm_sites | crm_sites workspace insert | {authenticated} | INSERT | PERMISSIVE |
| crm_sites | crm_sites workspace read | {authenticated} | SELECT | PERMISSIVE |
| crm_sites | crm_sites workspace update | {authenticated} | UPDATE | PERMISSIVE |
| deals | deals workspace delete | {authenticated} | DELETE | PERMISSIVE |
| deals | deals workspace insert | {authenticated} | INSERT | PERMISSIVE |
| deals | deals workspace read | {authenticated} | SELECT | PERMISSIVE |
| deals | deals workspace update | {authenticated} | UPDATE | PERMISSIVE |
| eod_reports | eod reports delete | {authenticated} | DELETE | PERMISSIVE |
| eod_reports | eod reports insert | {authenticated} | INSERT | PERMISSIVE |
| eod_reports | eod reports read | {authenticated} | SELECT | PERMISSIVE |
| eod_reports | eod reports update | {authenticated} | UPDATE | PERMISSIVE |
| field_permissions | admins manage field permissions | {authenticated} | ALL | PERMISSIVE |
| field_permissions | members read field permissions | {authenticated} | SELECT | PERMISSIVE |
| finance_expenses | finance_expenses_delete | {authenticated} | DELETE | PERMISSIVE |
| finance_expenses | finance_expenses_insert | {authenticated} | INSERT | PERMISSIVE |
| finance_expenses | finance_expenses_select | {authenticated} | SELECT | PERMISSIVE |
| finance_expenses | finance_expenses_update | {authenticated} | UPDATE | PERMISSIVE |
| finance_invoices | finance_invoices_delete | {authenticated} | DELETE | PERMISSIVE |
| finance_invoices | finance_invoices_insert | {authenticated} | INSERT | PERMISSIVE |
| finance_invoices | finance_invoices_select | {authenticated} | SELECT | PERMISSIVE |
| finance_invoices | finance_invoices_update | {authenticated} | UPDATE | PERMISSIVE |
| finance_payments | finance_payments_delete | {authenticated} | DELETE | PERMISSIVE |
| finance_payments | finance_payments_insert | {authenticated} | INSERT | PERMISSIVE |
| finance_payments | finance_payments_select | {authenticated} | SELECT | PERMISSIVE |
| finance_payments | finance_payments_update | {authenticated} | UPDATE | PERMISSIVE |
| finance_vendors | finance_vendors_delete | {authenticated} | DELETE | PERMISSIVE |
| finance_vendors | finance_vendors_insert | {authenticated} | INSERT | PERMISSIVE |
| finance_vendors | finance_vendors_select | {authenticated} | SELECT | PERMISSIVE |
| finance_vendors | finance_vendors_update | {authenticated} | UPDATE | PERMISSIVE |
| form_responses | managers delete company form responses | {authenticated} | DELETE | PERMISSIVE |
| form_responses | managers update company form responses | {authenticated} | UPDATE | PERMISSIVE |
| form_responses | members read company form responses | {authenticated} | SELECT | PERMISSIVE |
| form_responses | members submit company form responses | {authenticated} | INSERT | PERMISSIVE |
| forms | managers create company forms | {authenticated} | INSERT | PERMISSIVE |
| forms | managers delete company forms | {authenticated} | DELETE | PERMISSIVE |
| forms | managers update company forms | {authenticated} | UPDATE | PERMISSIVE |
| forms | members read company forms | {authenticated} | SELECT | PERMISSIVE |
| job_activity | members access job activity | {authenticated} | ALL | PERMISSIVE |
| job_change_order_lines | job_change_order_lines delete | {authenticated} | DELETE | PERMISSIVE |
| job_change_order_lines | job_change_order_lines insert | {authenticated} | INSERT | PERMISSIVE |
| job_change_order_lines | job_change_order_lines read | {authenticated} | SELECT | PERMISSIVE |
| job_change_order_lines | job_change_order_lines update | {authenticated} | UPDATE | PERMISSIVE |
| job_change_orders | job_change_orders delete | {authenticated} | DELETE | PERMISSIVE |
| job_change_orders | job_change_orders insert | {authenticated} | INSERT | PERMISSIVE |
| job_change_orders | job_change_orders read | {authenticated} | SELECT | PERMISSIVE |
| job_change_orders | job_change_orders update | {authenticated} | UPDATE | PERMISSIVE |
| job_cost_buckets | job_cost_buckets delete | {authenticated} | DELETE | PERMISSIVE |
| job_cost_buckets | job_cost_buckets insert | {authenticated} | INSERT | PERMISSIVE |
| job_cost_buckets | job_cost_buckets read | {authenticated} | SELECT | PERMISSIVE |
| job_cost_buckets | job_cost_buckets update | {authenticated} | UPDATE | PERMISSIVE |
| job_dailies | job_dailies delete | {authenticated} | DELETE | PERMISSIVE |
| job_dailies | job_dailies insert | {authenticated} | INSERT | PERMISSIVE |
| job_dailies | job_dailies read | {authenticated} | SELECT | PERMISSIVE |
| job_dailies | job_dailies update | {authenticated} | UPDATE | PERMISSIVE |
| job_draws | job_draws delete | {authenticated} | DELETE | PERMISSIVE |
| job_draws | job_draws insert | {authenticated} | INSERT | PERMISSIVE |
| job_draws | job_draws read | {authenticated} | SELECT | PERMISSIVE |
| job_draws | job_draws update | {authenticated} | UPDATE | PERMISSIVE |
| job_files | job_files workspace delete | {authenticated} | DELETE | PERMISSIVE |
| job_files | job_files workspace insert | {authenticated} | INSERT | PERMISSIVE |
| job_files | job_files workspace read | {authenticated} | SELECT | PERMISSIVE |
| job_files | job_files workspace update | {authenticated} | UPDATE | PERMISSIVE |
| job_plans | job_plans delete | {authenticated} | DELETE | PERMISSIVE |
| job_plans | job_plans insert | {authenticated} | INSERT | PERMISSIVE |
| job_plans | job_plans read | {authenticated} | SELECT | PERMISSIVE |
| job_plans | job_plans update | {authenticated} | UPDATE | PERMISSIVE |
| jobs | jobs workspace delete | {authenticated} | DELETE | PERMISSIVE |
| jobs | jobs workspace insert | {authenticated} | INSERT | PERMISSIVE |
| jobs | jobs workspace read | {authenticated} | SELECT | PERMISSIVE |
| jobs | jobs workspace update | {authenticated} | UPDATE | PERMISSIVE |
| knowledge_articles | managers create company knowledge | {authenticated} | INSERT | PERMISSIVE |
| knowledge_articles | managers delete company knowledge | {authenticated} | DELETE | PERMISSIVE |
| knowledge_articles | managers update company knowledge | {authenticated} | UPDATE | PERMISSIVE |
| knowledge_articles | members read company knowledge | {authenticated} | SELECT | PERMISSIVE |
| message_attachments | message attachments insert allowed | {authenticated} | INSERT | PERMISSIVE |
| message_attachments | message attachments select conversation access | {authenticated} | SELECT | PERMISSIVE |
| message_conversation_access | message access delete managers | {authenticated} | DELETE | PERMISSIVE |
| message_conversation_access | message access insert creator or manager | {authenticated} | INSERT | PERMISSIVE |
| message_conversation_access | message access select visible | {authenticated} | SELECT | PERMISSIVE |
| message_conversation_access | message access update managers | {authenticated} | UPDATE | PERMISSIVE |
| message_conversations | message conversations insert allowed | {authenticated} | INSERT | PERMISSIVE |
| message_conversations | message conversations select access | {authenticated} | SELECT | PERMISSIVE |
| message_conversations | message conversations update managers | {authenticated} | UPDATE | PERMISSIVE |
| message_reads | message reads select own | {authenticated} | SELECT | PERMISSIVE |
| message_reads | message reads update own | {authenticated} | UPDATE | PERMISSIVE |
| message_reads | message reads upsert own | {authenticated} | INSERT | PERMISSIVE |
| messages | messages insert senders | {authenticated} | INSERT | PERMISSIVE |
| messages | messages select conversation access | {authenticated} | SELECT | PERMISSIVE |
| messages | messages update delete permissions | {authenticated} | UPDATE | PERMISSIVE |
| notifications | active members insert company notifications | {authenticated} | INSERT | PERMISSIVE |
| notifications | notification recipients delete own rows | {authenticated} | DELETE | PERMISSIVE |
| notifications | notification recipients read own rows | {authenticated} | SELECT | PERMISSIVE |
| notifications | notification recipients update own rows | {authenticated} | UPDATE | PERMISSIVE |
| notifications | role users can delete notifications | {authenticated} | DELETE | PERMISSIVE |
| notifications | role users can insert notifications | {authenticated} | INSERT | PERMISSIVE |
| notifications | role users can read notifications | {authenticated} | SELECT | PERMISSIVE |
| notifications | role users can update notifications | {authenticated} | UPDATE | PERMISSIVE |
| pipeline_stages | pipeline_stages workspace delete | {authenticated} | DELETE | PERMISSIVE |
| pipeline_stages | pipeline_stages workspace insert | {authenticated} | INSERT | PERMISSIVE |
| pipeline_stages | pipeline_stages workspace read | {authenticated} | SELECT | PERMISSIVE |
| pipeline_stages | pipeline_stages workspace update | {authenticated} | UPDATE | PERMISSIVE |
| pricebook_materials | managers delete pricebook materials | {authenticated} | DELETE | PERMISSIVE |
| pricebook_materials | managers insert pricebook materials | {authenticated} | INSERT | PERMISSIVE |
| pricebook_materials | managers update pricebook materials | {authenticated} | UPDATE | PERMISSIVE |
| pricebook_materials | members read pricebook materials | {authenticated} | SELECT | PERMISSIVE |
| pricebook_vendor_prices | managers delete pricebook prices | {authenticated} | DELETE | PERMISSIVE |
| pricebook_vendor_prices | managers insert pricebook prices | {authenticated} | INSERT | PERMISSIVE |
| pricebook_vendor_prices | managers update pricebook prices | {authenticated} | UPDATE | PERMISSIVE |
| pricebook_vendor_prices | members read pricebook prices | {authenticated} | SELECT | PERMISSIVE |
| pricebook_vendors | managers delete pricebook vendors | {authenticated} | DELETE | PERMISSIVE |
| pricebook_vendors | managers insert pricebook vendors | {authenticated} | INSERT | PERMISSIVE |
| pricebook_vendors | managers update pricebook vendors | {authenticated} | UPDATE | PERMISSIVE |
| pricebook_vendors | members read pricebook vendors | {authenticated} | SELECT | PERMISSIVE |
| profiles | managers delete profiles | {authenticated} | DELETE | PERMISSIVE |
| profiles | managers update profiles | {authenticated} | UPDATE | PERMISSIVE |
| profiles | profiles readable to self, company peers and platform | {authenticated} | SELECT | PERMISSIVE |
| profiles | users update own profile name | {authenticated} | UPDATE | PERMISSIVE |
| projects | company members delete projects | {authenticated} | DELETE | PERMISSIVE |
| projects | company members insert projects | {authenticated} | INSERT | PERMISSIVE |
| projects | company members read projects | {authenticated} | SELECT | PERMISSIVE |
| projects | company members update projects | {authenticated} | UPDATE | PERMISSIVE |
| proposal_documents | proposal_documents workspace delete | {authenticated} | DELETE | PERMISSIVE |
| proposal_documents | proposal_documents workspace insert | {authenticated} | INSERT | PERMISSIVE |
| proposal_documents | proposal_documents workspace read | {authenticated} | SELECT | PERMISSIVE |
| proposal_documents | proposal_documents workspace update | {authenticated} | UPDATE | PERMISSIVE |
| record_history | record history workspace read | {authenticated} | SELECT | PERMISSIVE |
| recycle_bin_items | admins manage recycle bin | {authenticated} | ALL | PERMISSIVE |
| resource_acl | admins manage resource acl | {authenticated} | ALL | PERMISSIVE |
| resource_acl | members read resource acl | {authenticated} | SELECT | PERMISSIVE |
| ringcentral_accounts | company admins read accounts | {authenticated} | SELECT | PERMISSIVE |
| ringcentral_calls | members read own calls | {authenticated} | SELECT | PERMISSIVE |
| ringcentral_extensions | company admins read extensions | {authenticated} | SELECT | PERMISSIVE |
| ringcentral_presence | company admins read presence | {authenticated} | SELECT | PERMISSIVE |
| ringcentral_sync_state | members read sync state | {authenticated} | SELECT | PERMISSIVE |
| role_permissions | members read role permissions | {authenticated} | SELECT | PERMISSIVE |
| role_permissions | role managers manage role permissions | {authenticated} | ALL | PERMISSIVE |
| roles | members read roles | {authenticated} | SELECT | PERMISSIVE |
| roles | role managers manage roles | {authenticated} | ALL | PERMISSIVE |
| task_comments | authors and admins delete task_comments | {authenticated} | DELETE | PERMISSIVE |
| task_comments | company members insert own task_comments | {authenticated} | INSERT | PERMISSIVE |
| task_comments | company members read task_comments | {authenticated} | SELECT | PERMISSIVE |
| task_labels | company admins delete task_labels | {authenticated} | DELETE | PERMISSIVE |
| task_labels | company admins insert task_labels | {authenticated} | INSERT | PERMISSIVE |
| task_labels | company admins update task_labels | {authenticated} | UPDATE | PERMISSIVE |
| task_labels | company members read task_labels | {authenticated} | SELECT | PERMISSIVE |
| task_type_statuses | company admins delete task_type_statuses | {authenticated} | DELETE | PERMISSIVE |
| task_type_statuses | company admins insert task_type_statuses | {authenticated} | INSERT | PERMISSIVE |
| task_type_statuses | company admins update task_type_statuses | {authenticated} | UPDATE | PERMISSIVE |
| task_type_statuses | company members read task_type_statuses | {authenticated} | SELECT | PERMISSIVE |
| task_types | company admins delete task_types | {authenticated} | DELETE | PERMISSIVE |
| task_types | company admins insert task_types | {authenticated} | INSERT | PERMISSIVE |
| task_types | company admins update task_types | {authenticated} | UPDATE | PERMISSIVE |
| task_types | company members read task_types | {authenticated} | SELECT | PERMISSIVE |
| tasks | tasks workspace delete | {authenticated} | DELETE | PERMISSIVE |
| tasks | tasks workspace insert | {authenticated} | INSERT | PERMISSIVE |
| tasks | tasks workspace read | {authenticated} | SELECT | PERMISSIVE |
| tasks | tasks workspace update | {authenticated} | UPDATE | PERMISSIVE |
| team_members | company admins delete own roster | {authenticated} | DELETE | PERMISSIVE |
| team_members | company admins insert own roster | {authenticated} | INSERT | PERMISSIVE |
| team_members | company admins update own roster | {authenticated} | UPDATE | PERMISSIVE |
| team_members | members read own company roster | {authenticated} | SELECT | PERMISSIVE |
| time_entries | own insert time_entries | {authenticated} | INSERT | PERMISSIVE |
| time_entries | own or company-admin delete time_entries | {authenticated} | DELETE | PERMISSIVE |
| time_entries | own or company-admin read time_entries | {authenticated} | SELECT | PERMISSIVE |
| time_entries | own or company-admin update time_entries | {authenticated} | UPDATE | PERMISSIVE |
| underwriting_calculators | subscription members delete underwriting calculators | {authenticated} | DELETE | PERMISSIVE |
| underwriting_calculators | subscription members insert underwriting calculators | {authenticated} | INSERT | PERMISSIVE |
| underwriting_calculators | subscription members read underwriting calculators | {authenticated} | SELECT | PERMISSIVE |
| underwriting_calculators | subscription members update underwriting calculators | {authenticated} | UPDATE | PERMISSIVE |
| underwriting_cases | underwriting_cases workspace delete | {authenticated} | DELETE | PERMISSIVE |
| underwriting_cases | underwriting_cases workspace insert | {authenticated} | INSERT | PERMISSIVE |
| underwriting_cases | underwriting_cases workspace read | {authenticated} | SELECT | PERMISSIVE |
| underwriting_cases | underwriting_cases workspace update | {authenticated} | UPDATE | PERMISSIVE |
| user_role_assignments | admins manage role assignments | {authenticated} | ALL | PERMISSIVE |
| user_role_assignments | members read role assignments | {authenticated} | SELECT | PERMISSIVE |
| wb_intake_links | managers read intake links | {authenticated} | SELECT | PERMISSIVE |
| wb_intake_links | managers write intake links | {authenticated} | ALL | PERMISSIVE |
| wb_intake_submissions | managers delete intake submissions | {authenticated} | DELETE | PERMISSIVE |
| wb_intake_submissions | managers review intake submissions | {authenticated} | UPDATE | PERMISSIVE |
| wb_intake_submissions | members read intake submissions | {authenticated} | SELECT | PERMISSIVE |
| wb_record_events | managers write record events | {authenticated} | ALL | PERMISSIVE |
| wb_record_events | members read record events | {authenticated} | SELECT | PERMISSIVE |
| wb_records | wb records delete | {authenticated} | DELETE | PERMISSIVE |
| wb_records | wb records insert | {authenticated} | INSERT | PERMISSIVE |
| wb_records | wb records read | {authenticated} | SELECT | PERMISSIVE |
| wb_records | wb records update | {authenticated} | UPDATE | PERMISSIVE |
| wo_counters | company members read wo counters | {authenticated} | SELECT | PERMISSIVE |
| workspace_backup_copies | platform admins manage backup copies | {authenticated} | ALL | PERMISSIVE |
| workspace_backup_copies | platform admins read backup copies | {authenticated} | SELECT | PERMISSIVE |
| workspace_backups | settings managers manage company backups | {authenticated} | ALL | PERMISSIVE |
| workspace_builder_state | managers insert workspace builder | {authenticated} | INSERT | PERMISSIVE |
| workspace_builder_state | managers update workspace builder | {authenticated} | UPDATE | PERMISSIVE |
| workspace_builder_state | members read workspace builder | {authenticated} | SELECT | PERMISSIVE |
| workspace_memberships | workspace admins delete memberships | {authenticated} | DELETE | PERMISSIVE |
| workspace_memberships | workspace admins insert memberships | {authenticated} | INSERT | PERMISSIVE |
| workspace_memberships | workspace admins update memberships | {authenticated} | UPDATE | PERMISSIVE |
| workspace_memberships | workspace users read memberships | {authenticated} | SELECT | PERMISSIVE |
| workspace_plugins | workspace admins delete plugins | {authenticated} | DELETE | PERMISSIVE |
| workspace_plugins | workspace admins insert plugins | {authenticated} | INSERT | PERMISSIVE |
| workspace_plugins | workspace admins update plugins | {authenticated} | UPDATE | PERMISSIVE |
| workspace_plugins | workspace users read plugins | {authenticated} | SELECT | PERMISSIVE |
| workspace_setup_profiles | workspace_setup_profiles_select_admin | {authenticated} | SELECT | PERMISSIVE |
| workspaces | company admins create workspaces | {authenticated} | INSERT | PERMISSIVE |
| workspaces | workspace admins update workspaces | {authenticated} | UPDATE | PERMISSIVE |
| workspaces | workspace users read workspaces | {authenticated} | SELECT | PERMISSIVE |

## Invite acceptance advisory

Supabase's linter reports `accept_company_invite(text)` because it is an authenticated SECURITY DEFINER RPC. This exposure is intentional: a signed-in invite recipient must call it. The routine fixes `search_path`, validates `auth.uid()`, token status/expiry, exact profile email, current membership state, tenant-scoped role/workspace ids, and grants no elevated invite role. Public and anon execution are revoked.

The same generic advisor also reports `recycle_undo_item(text)`. Authenticated execution is
intentional and narrowly bounded: the routine fixes `search_path`, requires the current user
to be the deleting actor, enforces the ten-minute Undo and 30-day restore windows, resolves
the source table from a server allowlist, re-checks current company/workspace permission, and
restores the source plus recycle ledger atomically. Public and anonymous execution are revoked.

The setup RPCs (`save_company_setup_draft`, `apply_company_setup`, and
`reset_company_setup`) carry the same generic authenticated SECURITY DEFINER warning by
design. Each fixes `search_path`, requires `auth.uid()`, checks active company-admin access,
validates bounded JSON, and exposes no anonymous execution. The setup table itself grants
signed-in users SELECT only through company-admin RLS; all writes remain inside those RPCs.

The workspace replacements (`save_workspace_setup_draft`, `apply_workspace_setup`, and
`reset_workspace_setup`) intentionally carry the same advisor warning because the browser
must call them. Each fixes `search_path`, derives the company from the active target workspace,
requires `auth.uid()` plus company-admin access, validates bounded one-workspace JSON, and has
anonymous/public execution revoked. `workspace_setup_profiles` grants authenticated users
SELECT only through company-admin RLS; all writes remain inside those routines. Each mutation
also checks the caller's expected workspace-setup revision so a stale tab or device cannot
overwrite a newer draft, apply, or reset.

## Browser reachability inventory

Derived from live state on 2026-07-31, not from reading migrations. A table is
*browser-reachable* only if RLS is on, at least one policy exists, and `anon` or
`authenticated` holds a grant. Anything else is reachable solely through a SECURITY
DEFINER RPC, an API route, or the service role â€” which is a design decision and should be
recorded rather than rediscovered.

**Totals: 77 tables in `public` â€” 75 browser-reachable, 2 server-only, 0 with RLS off.**

### Server-only tables

| Table | Why it is unreachable | Intent |
| --- | --- | --- |
| `checkin_log` | RLS on, zero policies | Written by server-side check-in processing; never read by the client |
| `reminder_log` | RLS on, zero policies | Written by server-side reminder dispatch; never read by the client |

RLS enabled with no policy denies every row to every non-owner role, so these fail closed
regardless of grants. Both nonetheless carried `anon`/`authenticated` table grants until
`202608011000_revoke_unintended_browser_grants.sql` removed them. The grants were not a
hole on their own â€” they described an access path that did not exist â€” but they would have
become one the moment anybody added a policy, which is the kind of latent trap that only
looks obvious afterwards. Supabase's advisor reports both as `rls_enabled_no_policy` at
INFO level; that finding is expected here and should not be "fixed" by adding a policy.

### Tables granted to `authenticated` only

Most tables carry grants to both `anon` and `authenticated` â€” the Supabase default â€” which
is harmless because every policy is written `to authenticated`, so `anon` matches nothing.
These eight are narrower still, with no `anon` grant at all:

`company_setup_profiles`, `workspace_setup_profiles`, `record_history`, `underwriting_cases`, `ringcentral_accounts`, `ringcentral_calls`,
`ringcentral_extensions`, `ringcentral_presence`, `ringcentral_sync_state`.

### Trigger functions are not RPCs

PostgreSQL grants EXECUTE on new functions to PUBLIC by default, and PostgREST turns
anything the browser roles can execute into a callable `/rest/v1/rpc` endpoint. That makes
`create function â€¦ returns trigger` quietly ship an anon-reachable endpoint unless the
grant is revoked.

All six SECURITY DEFINER trigger functions in `public` now have browser EXECUTE revoked:
`handle_new_user`, `message_touch_conversation`, `mirror_workspace_backup_copy`,
`quest_confirm_email_before_insert`, `sync_team_member_from_profile`, and
`touch_eod_report_updated_at` (the last of which was exposed until 202608011000).
`tests/function-exposure.test.mjs` derives this list from the migration history and fails
if a new trigger function ships without its revoke.
