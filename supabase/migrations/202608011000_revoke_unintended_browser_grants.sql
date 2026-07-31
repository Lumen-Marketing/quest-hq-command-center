-- Close two unintended browser grants found by auditing the security advisor.
--
-- 1. touch_eod_report_updated_at() is a TRIGGER function, introduced by
--    202607301200_eod_reports. It was left with the PostgreSQL default of EXECUTE to
--    PUBLIC, which PostgREST turns into a callable endpoint: /rest/v1/rpc/
--    touch_eod_report_updated_at, reachable by anon. A trigger function has no business
--    being an RPC at all.
--
--    The audit is what makes this worth recording rather than just fixing: of the six
--    SECURITY DEFINER trigger functions in public, the other five (handle_new_user,
--    message_touch_conversation, mirror_workspace_backup_copy,
--    quest_confirm_email_before_insert, sync_team_member_from_profile) already carry no
--    browser grants. This one was the outlier, and it was mine.
--
--    Revoking EXECUTE does not affect the trigger. Triggers run in the context of the
--    statement's table, not the caller's function-execute privilege, so the AFTER/BEFORE
--    hook keeps firing exactly as before. Verified after applying, not assumed.
--
--    The advisor's other 47 findings in this family are authenticated-executable
--    SECURITY DEFINER functions — accept_company_invite, save_company_role, the recycle
--    and workspace RPCs, and so on. Those ARE the application's API and each performs its
--    own permission checks, so they are intentional and stay as they are. Reviewed, not
--    silenced.
--
-- 2. checkin_log and reminder_log have RLS enabled with zero policies, which denies
--    everything, yet still carry table grants to anon and authenticated. Not a hole —
--    RLS with no policy fails closed — but the grants imply an access path that does not
--    exist and would quietly become real if anyone ever added a policy or disabled RLS.
--    Removing them makes the intent legible: these are server-only tables.

revoke all on function public.touch_eod_report_updated_at() from public;
revoke all on function public.touch_eod_report_updated_at() from anon;
revoke all on function public.touch_eod_report_updated_at() from authenticated;

revoke all on table public.checkin_log from anon, authenticated;
revoke all on table public.reminder_log from anon, authenticated;
