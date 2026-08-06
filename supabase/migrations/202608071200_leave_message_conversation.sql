-- "Delete this chat, but only on my side."
--
-- Removing yourself is deleting a row from message_conversation_access, and the DELETE policy
-- on that table requires messages.manage_groups or messages.manage -- a manager permission.
-- So an ordinary member could not leave a chat at all, and anyone who could would have been
-- able to remove other people too, which is not what "delete on my side" means.
--
-- This function removes exactly one row: the caller's own. It cannot touch anyone else's
-- access, and it never deletes the conversation or its messages, so everybody else keeps the
-- chat and its history intact.

create or replace function public.leave_message_conversation(target_conversation_id uuid)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_company text;
  v_removed integer := 0;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select mc.company_id into v_company
  from public.message_conversations mc
  where mc.id = target_conversation_id;

  if v_company is null then
    raise exception 'Conversation not found';
  end if;

  -- You can only leave something you are actually in.
  if not app_private.can_access_message_conversation(target_conversation_id) then
    raise exception 'You are not in this conversation';
  end if;

  delete from public.message_conversation_access a
  where a.conversation_id = target_conversation_id
    and a.target_type = 'profile'
    and a.target_id = v_uid::text;
  get diagnostics v_removed = row_count;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    v_company, v_uid, 'message.conversation_left', 'message_conversation',
    target_conversation_id::text,
    jsonb_build_object('conversation_id', target_conversation_id, 'removed_rows', v_removed)
  );

  return v_removed > 0;
end;
$function$;

revoke all on function public.leave_message_conversation(uuid) from public;
grant execute on function public.leave_message_conversation(uuid) to authenticated;
