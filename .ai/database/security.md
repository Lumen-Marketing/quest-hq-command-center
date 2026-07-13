# Database security map

Captured 2026-07-13T21:28:30.100Z. All 53 public tables currently report Row Level Security enabled. Policy expressions are intentionally omitted; inspect migrations or the live catalog before changing authorization.

## Coverage

| Table | RLS | Policies | Commands |
| --- | --- | ---: | --- |
| accounts | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| active_timers | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| activities | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| audit_events | enabled | 2 | INSERT, SELECT |
| calendar_events | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| client_portal_annotations | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| client_portal_documents | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| client_portal_events | enabled | 2 | INSERT, SELECT |
| client_portals | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| clients | enabled | 1 | ALL |
| companies | enabled | 2 | SELECT, UPDATE |
| company_invites | enabled | 1 | ALL |
| company_join_requests | enabled | 2 | SELECT, UPDATE |
| company_memberships | enabled | 2 | ALL, SELECT |
| company_plugins | enabled | 2 | ALL, SELECT |
| company_subscriptions | enabled | 1 | SELECT |
| contacts | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| crm_sites | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| deals | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| field_permissions | enabled | 2 | ALL, SELECT |
| finance_expenses | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| finance_invoices | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| finance_payments | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| finance_vendors | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| form_responses | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| forms | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| job_activity | enabled | 1 | ALL |
| job_files | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| jobs | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
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
| profiles | enabled | 5 | DELETE, SELECT, UPDATE |
| proposal_documents | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| recycle_bin_items | enabled | 1 | ALL |
| resource_acl | enabled | 2 | ALL, SELECT |
| role_permissions | enabled | 2 | ALL, SELECT |
| roles | enabled | 2 | ALL, SELECT |
| tasks | enabled | 5 | DELETE, INSERT, SELECT, UPDATE |
| team_members | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| time_entries | enabled | 4 | DELETE, INSERT, SELECT, UPDATE |
| user_role_assignments | enabled | 2 | ALL, SELECT |
| wo_counters | enabled | 1 | SELECT |
| workspace_backup_copies | enabled | 2 | ALL, SELECT |
| workspace_backups | enabled | 2 | ALL, SELECT |
| workspace_builder_state | enabled | 3 | INSERT, SELECT, UPDATE |

## Policy catalog

| Table | Policy | Roles | Command | Mode |
| --- | --- | --- | --- | --- |
| accounts | accounts members delete | authenticated | DELETE | PERMISSIVE |
| accounts | accounts members insert | authenticated | INSERT | PERMISSIVE |
| accounts | accounts members read | authenticated | SELECT | PERMISSIVE |
| accounts | accounts members update | authenticated | UPDATE | PERMISSIVE |
| active_timers | role users can delete active_timers | authenticated | DELETE | PERMISSIVE |
| active_timers | role users can insert active_timers | authenticated | INSERT | PERMISSIVE |
| active_timers | role users can read active_timers | authenticated | SELECT | PERMISSIVE |
| active_timers | role users can update active_timers | authenticated | UPDATE | PERMISSIVE |
| activities | activities members delete | authenticated | DELETE | PERMISSIVE |
| activities | activities members insert | authenticated | INSERT | PERMISSIVE |
| activities | activities members read | authenticated | SELECT | PERMISSIVE |
| activities | activities members update | authenticated | UPDATE | PERMISSIVE |
| audit_events | admins insert audit events | authenticated | INSERT | PERMISSIVE |
| audit_events | members read audit events | authenticated | SELECT | PERMISSIVE |
| calendar_events | calendar events delete by managers or creator | authenticated | DELETE | PERMISSIVE |
| calendar_events | calendar events insert by managers | authenticated | INSERT | PERMISSIVE |
| calendar_events | calendar events update by managers or creator | authenticated | UPDATE | PERMISSIVE |
| calendar_events | calendar events visible to allowed members | authenticated | SELECT | PERMISSIVE |
| client_portal_annotations | managers delete portal annotations | authenticated | DELETE | PERMISSIVE |
| client_portal_annotations | managers insert portal annotations | authenticated | INSERT | PERMISSIVE |
| client_portal_annotations | managers update portal annotations | authenticated | UPDATE | PERMISSIVE |
| client_portal_annotations | members read portal annotations | authenticated | SELECT | PERMISSIVE |
| client_portal_documents | managers delete portal documents | authenticated | DELETE | PERMISSIVE |
| client_portal_documents | managers insert portal documents | authenticated | INSERT | PERMISSIVE |
| client_portal_documents | managers update portal documents | authenticated | UPDATE | PERMISSIVE |
| client_portal_documents | members read portal documents | authenticated | SELECT | PERMISSIVE |
| client_portal_events | managers insert portal events | authenticated | INSERT | PERMISSIVE |
| client_portal_events | members read portal events | authenticated | SELECT | PERMISSIVE |
| client_portals | managers delete client portals | authenticated | DELETE | PERMISSIVE |
| client_portals | managers insert client portals | authenticated | INSERT | PERMISSIVE |
| client_portals | managers update client portals | authenticated | UPDATE | PERMISSIVE |
| client_portals | members read client portals | authenticated | SELECT | PERMISSIVE |
| clients | members access clients | authenticated | ALL | PERMISSIVE |
| companies | admins update companies | authenticated | UPDATE | PERMISSIVE |
| companies | role users can read companies | authenticated | SELECT | PERMISSIVE |
| company_invites | admins manage invites | authenticated | ALL | PERMISSIVE |
| company_join_requests | admins manage join requests | authenticated | UPDATE | PERMISSIVE |
| company_join_requests | requesters read own join requests | authenticated | SELECT | PERMISSIVE |
| company_memberships | admins manage company memberships | authenticated | ALL | PERMISSIVE |
| company_memberships | members read company memberships | authenticated | SELECT | PERMISSIVE |
| company_plugins | admins manage company plugins | authenticated | ALL | PERMISSIVE |
| company_plugins | members read company plugins | authenticated | SELECT | PERMISSIVE |
| company_subscriptions | members read subscriptions | authenticated | SELECT | PERMISSIVE |
| contacts | contacts members delete | authenticated | DELETE | PERMISSIVE |
| contacts | contacts members insert | authenticated | INSERT | PERMISSIVE |
| contacts | contacts members read | authenticated | SELECT | PERMISSIVE |
| contacts | contacts members update | authenticated | UPDATE | PERMISSIVE |
| crm_sites | crm_sites members delete | authenticated | DELETE | PERMISSIVE |
| crm_sites | crm_sites members insert | authenticated | INSERT | PERMISSIVE |
| crm_sites | crm_sites members read | authenticated | SELECT | PERMISSIVE |
| crm_sites | crm_sites members update | authenticated | UPDATE | PERMISSIVE |
| deals | deals members delete | authenticated | DELETE | PERMISSIVE |
| deals | deals members insert | authenticated | INSERT | PERMISSIVE |
| deals | deals members read | authenticated | SELECT | PERMISSIVE |
| deals | deals members update | authenticated | UPDATE | PERMISSIVE |
| field_permissions | admins manage field permissions | authenticated | ALL | PERMISSIVE |
| field_permissions | members read field permissions | authenticated | SELECT | PERMISSIVE |
| finance_expenses | finance_expenses_delete | authenticated | DELETE | PERMISSIVE |
| finance_expenses | finance_expenses_insert | authenticated | INSERT | PERMISSIVE |
| finance_expenses | finance_expenses_select | authenticated | SELECT | PERMISSIVE |
| finance_expenses | finance_expenses_update | authenticated | UPDATE | PERMISSIVE |
| finance_invoices | finance_invoices_delete | authenticated | DELETE | PERMISSIVE |
| finance_invoices | finance_invoices_insert | authenticated | INSERT | PERMISSIVE |
| finance_invoices | finance_invoices_select | authenticated | SELECT | PERMISSIVE |
| finance_invoices | finance_invoices_update | authenticated | UPDATE | PERMISSIVE |
| finance_payments | finance_payments_delete | authenticated | DELETE | PERMISSIVE |
| finance_payments | finance_payments_insert | authenticated | INSERT | PERMISSIVE |
| finance_payments | finance_payments_select | authenticated | SELECT | PERMISSIVE |
| finance_payments | finance_payments_update | authenticated | UPDATE | PERMISSIVE |
| finance_vendors | finance_vendors_delete | authenticated | DELETE | PERMISSIVE |
| finance_vendors | finance_vendors_insert | authenticated | INSERT | PERMISSIVE |
| finance_vendors | finance_vendors_select | authenticated | SELECT | PERMISSIVE |
| finance_vendors | finance_vendors_update | authenticated | UPDATE | PERMISSIVE |
| form_responses | managers delete company form responses | authenticated | DELETE | PERMISSIVE |
| form_responses | managers update company form responses | authenticated | UPDATE | PERMISSIVE |
| form_responses | members read company form responses | authenticated | SELECT | PERMISSIVE |
| form_responses | members submit company form responses | authenticated | INSERT | PERMISSIVE |
| forms | managers create company forms | authenticated | INSERT | PERMISSIVE |
| forms | managers delete company forms | authenticated | DELETE | PERMISSIVE |
| forms | managers update company forms | authenticated | UPDATE | PERMISSIVE |
| forms | members read company forms | authenticated | SELECT | PERMISSIVE |
| job_activity | members access job activity | authenticated | ALL | PERMISSIVE |
| job_files | subscription members delete job files | authenticated | DELETE | PERMISSIVE |
| job_files | subscription members insert job files | authenticated | INSERT | PERMISSIVE |
| job_files | subscription members read job files | authenticated | SELECT | PERMISSIVE |
| job_files | subscription members update job files | authenticated | UPDATE | PERMISSIVE |
| jobs | subscription members delete jobs | authenticated | DELETE | PERMISSIVE |
| jobs | subscription members insert jobs | authenticated | INSERT | PERMISSIVE |
| jobs | subscription members read jobs | authenticated | SELECT | PERMISSIVE |
| jobs | subscription members update jobs | authenticated | UPDATE | PERMISSIVE |
| message_attachments | message attachments insert allowed | authenticated | INSERT | PERMISSIVE |
| message_attachments | message attachments select conversation access | authenticated | SELECT | PERMISSIVE |
| message_conversation_access | message access delete managers | authenticated | DELETE | PERMISSIVE |
| message_conversation_access | message access insert creator or manager | authenticated | INSERT | PERMISSIVE |
| message_conversation_access | message access select visible | authenticated | SELECT | PERMISSIVE |
| message_conversation_access | message access update managers | authenticated | UPDATE | PERMISSIVE |
| message_conversations | message conversations insert allowed | authenticated | INSERT | PERMISSIVE |
| message_conversations | message conversations select access | authenticated | SELECT | PERMISSIVE |
| message_conversations | message conversations update managers | authenticated | UPDATE | PERMISSIVE |
| message_reads | message reads select own | authenticated | SELECT | PERMISSIVE |
| message_reads | message reads update own | authenticated | UPDATE | PERMISSIVE |
| message_reads | message reads upsert own | authenticated | INSERT | PERMISSIVE |
| messages | messages insert senders | authenticated | INSERT | PERMISSIVE |
| messages | messages select conversation access | authenticated | SELECT | PERMISSIVE |
| messages | messages update delete permissions | authenticated | UPDATE | PERMISSIVE |
| notifications | active members insert company notifications | authenticated | INSERT | PERMISSIVE |
| notifications | notification recipients delete own rows | authenticated | DELETE | PERMISSIVE |
| notifications | notification recipients read own rows | authenticated | SELECT | PERMISSIVE |
| notifications | notification recipients update own rows | authenticated | UPDATE | PERMISSIVE |
| notifications | role users can delete notifications | authenticated | DELETE | PERMISSIVE |
| notifications | role users can insert notifications | authenticated | INSERT | PERMISSIVE |
| notifications | role users can read notifications | authenticated | SELECT | PERMISSIVE |
| notifications | role users can update notifications | authenticated | UPDATE | PERMISSIVE |
| pipeline_stages | pipeline stages members delete | authenticated | DELETE | PERMISSIVE |
| pipeline_stages | pipeline stages members insert | authenticated | INSERT | PERMISSIVE |
| pipeline_stages | pipeline stages members read | authenticated | SELECT | PERMISSIVE |
| pipeline_stages | pipeline stages members update | authenticated | UPDATE | PERMISSIVE |
| pricebook_materials | managers delete pricebook materials | authenticated | DELETE | PERMISSIVE |
| pricebook_materials | managers insert pricebook materials | authenticated | INSERT | PERMISSIVE |
| pricebook_materials | managers update pricebook materials | authenticated | UPDATE | PERMISSIVE |
| pricebook_materials | members read pricebook materials | authenticated | SELECT | PERMISSIVE |
| pricebook_vendor_prices | managers delete pricebook prices | authenticated | DELETE | PERMISSIVE |
| pricebook_vendor_prices | managers insert pricebook prices | authenticated | INSERT | PERMISSIVE |
| pricebook_vendor_prices | managers update pricebook prices | authenticated | UPDATE | PERMISSIVE |
| pricebook_vendor_prices | members read pricebook prices | authenticated | SELECT | PERMISSIVE |
| pricebook_vendors | managers delete pricebook vendors | authenticated | DELETE | PERMISSIVE |
| pricebook_vendors | managers insert pricebook vendors | authenticated | INSERT | PERMISSIVE |
| pricebook_vendors | managers update pricebook vendors | authenticated | UPDATE | PERMISSIVE |
| pricebook_vendors | members read pricebook vendors | authenticated | SELECT | PERMISSIVE |
| profiles | managers delete profiles | authenticated | DELETE | PERMISSIVE |
| profiles | managers update profiles | authenticated | UPDATE | PERMISSIVE |
| profiles | team viewers read profiles | authenticated | SELECT | PERMISSIVE |
| profiles | users read own profile | authenticated | SELECT | PERMISSIVE |
| profiles | users update own profile name | authenticated | UPDATE | PERMISSIVE |
| proposal_documents | members create company proposals | authenticated | INSERT | PERMISSIVE |
| proposal_documents | members delete company proposals | authenticated | DELETE | PERMISSIVE |
| proposal_documents | members read company proposals | authenticated | SELECT | PERMISSIVE |
| proposal_documents | members update company proposals | authenticated | UPDATE | PERMISSIVE |
| recycle_bin_items | admins manage recycle bin | authenticated | ALL | PERMISSIVE |
| resource_acl | admins manage resource acl | authenticated | ALL | PERMISSIVE |
| resource_acl | members read resource acl | authenticated | SELECT | PERMISSIVE |
| role_permissions | admins manage role permissions | authenticated | ALL | PERMISSIVE |
| role_permissions | members read role permissions | authenticated | SELECT | PERMISSIVE |
| roles | admins manage roles | authenticated | ALL | PERMISSIVE |
| roles | members read roles | authenticated | SELECT | PERMISSIVE |
| tasks | assignees can read tasks | authenticated | SELECT | PERMISSIVE |
| tasks | role users can delete tasks | authenticated | DELETE | PERMISSIVE |
| tasks | role users can insert tasks | authenticated | INSERT | PERMISSIVE |
| tasks | role users can read tasks | authenticated | SELECT | PERMISSIVE |
| tasks | role users can update tasks | authenticated | UPDATE | PERMISSIVE |
| team_members | managers can delete team_members | authenticated | DELETE | PERMISSIVE |
| team_members | managers can insert team_members | authenticated | INSERT | PERMISSIVE |
| team_members | managers can update team_members | authenticated | UPDATE | PERMISSIVE |
| team_members | role users can read team_members | authenticated | SELECT | PERMISSIVE |
| time_entries | role users can delete time_entries | authenticated | DELETE | PERMISSIVE |
| time_entries | role users can insert time_entries | authenticated | INSERT | PERMISSIVE |
| time_entries | role users can read time_entries | authenticated | SELECT | PERMISSIVE |
| time_entries | role users can update time_entries | authenticated | UPDATE | PERMISSIVE |
| user_role_assignments | admins manage role assignments | authenticated | ALL | PERMISSIVE |
| user_role_assignments | members read role assignments | authenticated | SELECT | PERMISSIVE |
| wo_counters | company members read wo counters | authenticated | SELECT | PERMISSIVE |
| workspace_backup_copies | platform admins manage backup copies | authenticated | ALL | PERMISSIVE |
| workspace_backup_copies | platform admins read backup copies | authenticated | SELECT | PERMISSIVE |
| workspace_backups | admins manage company backups | authenticated | ALL | PERMISSIVE |
| workspace_backups | members read company backups | authenticated | SELECT | PERMISSIVE |
| workspace_builder_state | managers insert workspace builder | authenticated | INSERT | PERMISSIVE |
| workspace_builder_state | managers update workspace builder | authenticated | UPDATE | PERMISSIVE |
| workspace_builder_state | members read workspace builder | authenticated | SELECT | PERMISSIVE |

Security-sensitive changes require checking [relationships.md](relationships.md), [functions.md](functions.md), the corresponding SQL migration, and the live Supabase state. Never infer tenant safety from a policy name alone.
