-- Close the last unprotected public surface.
--
-- accept_public_proposal, public_proposal_by_token and lookup_company_invite are
-- SECURITY DEFINER functions that were callable directly by the `anon` role over
-- /rest/v1/rpc — with no rate limiting, so an attacker could brute-force proposal
-- and invite tokens straight against the database.
--
-- They now run only through rate-limited server endpoints (api/public-proposal-open,
-- api/public-proposal-respond, api/public-invite-lookup), which call them with the
-- service-role key. Revoking anon (and authenticated) EXECUTE forces every request
-- through that rate-limited path. service_role keeps its grant, so the endpoints
-- keep working.
--
-- ⚠️ APPLY ONLY AFTER the code that calls the new endpoints is deployed. If this
-- runs while production still calls the RPCs directly as anon, public proposal
-- pages and invite acceptance break immediately. Rollback is a single re-grant
-- (see the bottom of this file).

revoke execute on function public.accept_public_proposal(text, text, text, text) from anon, authenticated;
revoke execute on function public.public_proposal_by_token(text) from anon, authenticated;
revoke execute on function public.lookup_company_invite(text) from anon, authenticated;

-- Rollback, if the public flow breaks before the new endpoints are live:
--   grant execute on function public.accept_public_proposal(text, text, text, text) to anon, authenticated;
--   grant execute on function public.public_proposal_by_token(text) to anon, authenticated;
--   grant execute on function public.lookup_company_invite(text) to anon, authenticated;
