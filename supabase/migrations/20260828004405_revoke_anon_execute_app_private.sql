-- The anon role stops holding EXECUTE on app_private helpers it cannot reach.
--
-- Twelve of the fifty-four functions in app_private are executable by anon; the other
-- forty-two are not, because they were created after someone started revoking. The twelve are
-- the leftovers: EXECUTE on a new function is granted to PUBLIC by default, and PUBLIC
-- includes anon.
--
-- Not exploitable, and this is not a fix for a hole. anon has no USAGE on the app_private
-- schema, so it cannot name any of these functions, and PostgREST exposes only `public`.
-- The reason to do it is the same as the reason the anon table grants went in
-- 20260828002845: schema USAGE should not be the single thing standing between an anonymous
-- caller and the authorization kernel's own helpers.
--
-- ORDER MATTERS HERE, and getting it wrong takes production down.
--
-- These twelve are reachable by `authenticated` only THROUGH the same PUBLIC grant that gives
-- anon its access. Revoking from PUBLIC first would therefore strip authenticated as well --
-- and five of the twelve (chat_message_visible, chat_attachment_visible, chat_left_at,
-- is_company_owner, mark_own_chat_access, plus baseline_plugin_ids) are called from RLS policy
-- expressions, which are evaluated with the CALLING role's privileges. SECURITY DEFINER
-- governs what a function may do once it runs, not who is allowed to call it. Losing that
-- grant would make every policy that calls one of them fail for real signed-in users.
--
-- So: grant explicitly to authenticated, THEN revoke the blanket PUBLIC grant. After this,
-- authenticated holds its access in its own right rather than by inheritance.
--
-- Deliberately NOT touching the function bodies. Six of the twelve still carry
-- `search_path = 'public', pg_temp'`, the same inconsistency 20260828002845 fixed for
-- is_company_member and has_company_permission. Those two were safe to rewrite because every
-- reference in them was already schema-qualified and both are covered by tests; rewriting six
-- trigger and RLS helpers blind is a separate reviewed change. See .ai/known-issues.md.

do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature,
           pg_get_function_result(p.oid) = 'trigger' as is_trigger
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'app_private'
      and has_function_privilege('anon', p.oid, 'EXECUTE')
  loop
    -- A trigger function is never called directly, so it needs no caller grant. Everything
    -- else keeps authenticated access explicitly before the blanket grant goes.
    if not fn.is_trigger then
      execute format('grant execute on function %s to authenticated', fn.signature);
    end if;
    execute format('revoke execute on function %s from public, anon', fn.signature);
  end loop;
end
$$;

-- Stop the default from re-granting it on the next function created here.
alter default privileges for role postgres in schema app_private revoke execute on functions from anon;
