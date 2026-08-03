-- Revoke now removes the invitation instead of parking it as a 'revoked' row.
--
-- Rom's words: "when I revoke it, the email invitation is no longer available, meaning it is
-- deleted from the database, so I can invite him again without failure."
--
-- That is the right model for this table. company_invites is live state -- who currently has
-- an open invitation -- and a withdrawn one is not state, it is history. Keeping revoked
-- rows meant every re-invite of the same address had to squeeze past whatever unique index
-- was in force, which is exactly the collision fixed in 202608042000. Deleting removes the
-- class of bug rather than the instance.
--
-- History is NOT lost. The audit_events row this function already writes carries the company,
-- the actor, the email and the timestamp, and audit_events is the table that exists to be
-- permanent. The invite row was never the record of what happened.
--
-- Kept as `revoke_company_invite` returning company_invites: the client calls it by name and
-- reads the returned row, and DELETE ... RETURNING gives back exactly what UPDATE did.

create or replace function public.revoke_company_invite(target_invite_id uuid)
returns company_invites
language plpgsql
set search_path to ''
as $function$
declare
  actor_id uuid := auth.uid();
  invite_row public.company_invites%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select * into invite_row
  from public.company_invites
  where id = target_invite_id;

  if invite_row.id is null then
    raise exception 'Invite not found';
  end if;

  if not app_private.is_company_admin(invite_row.company_id) then
    raise exception 'Owner/Admin access required';
  end if;

  -- Audit first. If the delete then fails, the worst case is a recorded revocation that did
  -- not happen, which is investigable; a silent deletion with no record is not.
  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    invite_row.company_id,
    actor_id,
    'invite.revoked',
    'company_invite',
    invite_row.id::text,
    jsonb_build_object('email', invite_row.email, 'deleted', true)
  );

  delete from public.company_invites
  where id = invite_row.id
  returning * into invite_row;

  if invite_row.id is null then
    raise exception 'Invite could not be revoked';
  end if;

  return invite_row;
end;
$function$;
