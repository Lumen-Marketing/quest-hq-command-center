-- Revoking an invite failed once the same address had been invited and revoked before.
--
--   duplicate key value violates unique constraint "company_invites_company_id_email_status_key"
--
-- The constraint was UNIQUE (company_id, email, status). It was there to stop two live
-- invitations existing for one address, which is right, but covering `status` meant it also
-- allowed exactly ONE revoked row per address. Revoking a second invite tried to create a
-- second (company, email, 'revoked') and collided.
--
-- The failure surfaced as "nothing happens": the client reported the RPC error into the sync
-- pill, the row stayed pending, and it reappeared on the next load.
--
-- What the rule should say is "one PENDING invite per address per company". Revoked and
-- accepted rows are history and there can be as many as the company has sent.

alter table public.company_invites
  drop constraint if exists company_invites_company_id_email_status_key;

-- Partial, so only live invitations are constrained. lower(email) as well, because
-- Rom@x.com and rom@x.com are one person and should not both hold an open invitation.
create unique index if not exists company_invites_one_pending_per_email
  on public.company_invites (company_id, lower(email))
  where status = 'pending';
