-- Deleting a chat and leaving a chat were the same action. One button removed your access
-- row, which meant "delete this conversation for me" also silently dropped you out of the
-- group: no more messages, no way back without being re-added. Two different intentions were
-- being served by one destructive operation.
--
-- They are separated here, and both become marks on your own access row rather than a delete:
--
--   cleared_at  DELETE CHAT. Hides everything said up to that instant, for you alone. You are
--               still in the group and still receive everything sent afterwards -- the chat
--               simply starts again from empty.
--
--   left_at     LEAVE CHAT. You stop receiving. The conversation stays readable as an archive
--               of what was said up to the moment you left, and nothing after it.
--
-- Both are per-person and neither touches a message row, so nobody else's history changes.
--
-- Marks rather than deletes, because the old delete could not express either idea: it could
-- not keep you in a group you had cleared, and it could not leave you an archive of a group
-- you had left. It was also incomplete as a leave -- access granted by an `all_company` row,
-- a role row, or by having created the conversation survived it, so "leaving" a company-wide
-- chat did nothing at all.

alter table public.message_conversation_access
  add column if not exists cleared_at timestamptz,
  add column if not exists left_at timestamptz;

create index if not exists message_conversation_access_profile_idx
  on public.message_conversation_access(conversation_id, target_id)
  where target_type = 'profile';

-- The moment you left, or null if you are still in. Null when ANY of your access rows has no
-- left_at: being re-added writes a fresh row, and that row is what puts you back in.
create or replace function app_private.chat_left_at(target_conversation_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
  select case when bool_or(a.left_at is null) then null else max(a.left_at) end
  from public.message_conversation_access a
  where a.conversation_id = target_conversation_id
    and a.target_type = 'profile'
    and a.target_id = (select auth.uid())::text;
$$;

-- Is one message inside the window this person is allowed to see?
--
-- bool_or, not bool_and: if you were re-added after leaving you hold two rows, and the newer
-- one -- carrying no watermark -- is what restores the full view. Defaults to true when you
-- hold no profile row at all, because then your access came from an all_company row, a role,
-- or from creating the conversation, and you have never cleared or left it.
create or replace function app_private.chat_message_visible(target_conversation_id uuid, message_created_at timestamptz)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
  select coalesce((
    select bool_or(
      message_created_at > coalesce(a.cleared_at, '-infinity'::timestamptz)
      and message_created_at <= coalesce(a.left_at, 'infinity'::timestamptz)
    )
    from public.message_conversation_access a
    where a.conversation_id = target_conversation_id
      and a.target_type = 'profile'
      and a.target_id = (select auth.uid())::text
  ), true);
$$;

-- An attachment is visible exactly when the message carrying it is. Judged on the MESSAGE's
-- timestamp, not the attachment's: they are written moments apart, and a cleared chat that
-- still showed its photographs would not be cleared.
create or replace function app_private.chat_attachment_visible(target_conversation_id uuid, target_message_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
  select app_private.chat_message_visible(
    target_conversation_id,
    (select m.created_at from public.messages m where m.id = target_message_id)
  );
$$;

drop policy if exists "messages select conversation access" on public.messages;
create policy "messages select conversation access"
on public.messages
for select
to authenticated
using (
  app_private.can_access_message_conversation(conversation_id)
  and app_private.chat_message_visible(conversation_id, created_at)
);

-- Having left, you cannot post into the chat either. Without this the archive would be
-- writable, which is not an archive.
drop policy if exists "messages insert senders" on public.messages;
create policy "messages insert senders"
on public.messages
for insert
to authenticated
with check (
  sender_profile_id = (select auth.uid())
  and app_private.can_access_message_conversation(conversation_id)
  and app_private.has_company_permission(company_id, 'messages.send')
  and app_private.chat_left_at(conversation_id) is null
  and exists (
    select 1 from public.message_conversations mc
    where mc.id = messages.conversation_id and mc.company_id = messages.company_id
  )
);

drop policy if exists "message attachments select conversation access" on public.message_attachments;
create policy "message attachments select conversation access"
on public.message_attachments
for select
to authenticated
using (
  app_private.can_access_message_conversation(conversation_id)
  and app_private.chat_attachment_visible(conversation_id, message_id)
);

drop policy if exists "message attachments insert allowed" on public.message_attachments;
create policy "message attachments insert allowed"
on public.message_attachments
for insert
to authenticated
with check (
  app_private.can_access_message_conversation(conversation_id)
  and app_private.has_company_permission(company_id, 'messages.attach_files')
  and app_private.chat_left_at(conversation_id) is null
  and exists (
    select 1 from public.messages m
    where m.id = message_attachments.message_id
      and m.conversation_id = message_attachments.conversation_id
      and m.company_id = message_attachments.company_id
      and m.sender_profile_id = (select auth.uid())
  )
);

-- Writes the watermark on your own access row, creating one when your access came from
-- somewhere else (all_company, a role, or having created the conversation) and you therefore
-- had no row of your own to mark. SECURITY DEFINER because the INSERT and UPDATE policies on
-- message_conversation_access require a manager permission -- without this a member could not
-- clear or leave anything, and anyone who could would have been able to do it to other people.
create or replace function app_private.mark_own_chat_access(
  target_conversation_id uuid,
  p_cleared boolean,
  p_left boolean
)
returns timestamptz
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_company text;
  v_now timestamptz := now();
  v_touched integer := 0;
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

  if not app_private.can_access_message_conversation(target_conversation_id) then
    raise exception 'You are not in this conversation';
  end if;

  update public.message_conversation_access a
  set cleared_at = case when p_cleared then v_now else a.cleared_at end,
      left_at = case when p_left then v_now else a.left_at end
  where a.conversation_id = target_conversation_id
    and a.target_type = 'profile'
    and a.target_id = v_uid::text;
  get diagnostics v_touched = row_count;

  if v_touched = 0 then
    insert into public.message_conversation_access
      (company_id, conversation_id, target_type, target_id, cleared_at, left_at)
    values (
      v_company, target_conversation_id, 'profile', v_uid::text,
      case when p_cleared then v_now else null end,
      case when p_left then v_now else null end
    );
  end if;

  return v_now;
end;
$$;

-- DELETE CHAT: clear my copy of the history. I stay in the conversation.
create or replace function public.clear_message_conversation(target_conversation_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_at timestamptz;
begin
  v_at := app_private.mark_own_chat_access(target_conversation_id, true, false);

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  select mc.company_id, (select auth.uid()), 'message.conversation_cleared', 'message_conversation',
         target_conversation_id::text,
         jsonb_build_object('conversation_id', target_conversation_id, 'cleared_at', v_at)
  from public.message_conversations mc
  where mc.id = target_conversation_id;

  return v_at;
end;
$$;

-- LEAVE CHAT: stop receiving, keep the archive of what was said before now.
--
-- This replaces the boolean-returning version that deleted the access row. The name is kept
-- because it is the same intention, but the effect is different and the return type changed,
-- so the old signature is dropped rather than replaced in place.
drop function if exists public.leave_message_conversation(uuid);
create function public.leave_message_conversation(target_conversation_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_at timestamptz;
begin
  v_at := app_private.mark_own_chat_access(target_conversation_id, false, true);

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  select mc.company_id, (select auth.uid()), 'message.conversation_left', 'message_conversation',
         target_conversation_id::text,
         jsonb_build_object('conversation_id', target_conversation_id, 'left_at', v_at)
  from public.message_conversations mc
  where mc.id = target_conversation_id;

  return v_at;
end;
$$;

revoke all on function public.clear_message_conversation(uuid) from public, anon;
revoke all on function public.leave_message_conversation(uuid) from public, anon;
grant execute on function public.clear_message_conversation(uuid) to authenticated;
grant execute on function public.leave_message_conversation(uuid) to authenticated;
