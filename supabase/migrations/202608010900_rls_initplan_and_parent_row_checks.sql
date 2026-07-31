-- Two unrelated problems, fixed together because they live in the same 17 policies and
-- rewriting a policy twice is worse than rewriting it once.
--
-- 1. PERFORMANCE. Every one of these policies calls auth.uid() (or auth.jwt()) bare, so
--    Postgres re-evaluates it once per row instead of once per query. Wrapping the call
--    in a scalar subquery -- (select auth.uid()) -- lets the planner hoist it into an
--    InitPlan evaluated a single time. The value is identical; only the number of calls
--    changes. This is what the `auth_rls_initplan` advisor reports, and it matters most
--    on messages / message_reads, which are read on every poll of the inbox.
--
-- 2. CORRECTNESS. Three of these policies compare a column to ITSELF:
--
--        (mc.company_id = mc.company_id)          -- messages insert senders
--        (mc.company_id = mc.company_id)          -- message access insert creator...
--        (m.conversation_id = m.conversation_id)  -- message attachments insert allowed
--        (m.company_id = m.company_id)            -- message attachments insert allowed
--
--    Those are always true. The intent was plainly to tie the new row to its parent --
--    to require that a message's company_id matches its conversation's, and that an
--    attachment's conversation and company match the message it hangs off. As written,
--    the check does nothing, so a client could insert a message carrying one company's
--    id into a conversation belonging to another. Nothing stops that today except the
--    client being well-behaved.
--
--    Verified before tightening: zero existing rows violate the intended constraint
--    (messages vs conversation company, attachment vs message conversation, attachment
--    vs message company, access vs conversation company all return 0). So this closes a
--    hole rather than invalidating data anybody is relying on.
--
-- Every policy below is otherwise a faithful reproduction of what was already there.

-- comment_reactions ----------------------------------------------------------------
drop policy if exists "company members insert own comment_reactions" on public.comment_reactions;
create policy "company members insert own comment_reactions" on public.comment_reactions
  for insert to authenticated
  with check (
    (exists (select 1 from public.profiles p
             where p.id = (select auth.uid()) and p.member_id = comment_reactions.member_id))
    and (exists (select 1 from public.task_comments c
                 join public.tasks t on t.id = c.task_id
                 where c.id = comment_reactions.comment_id
                   and app_private.is_company_member(t.company_id)))
  );

drop policy if exists "owners and admins delete comment_reactions" on public.comment_reactions;
create policy "owners and admins delete comment_reactions" on public.comment_reactions
  for delete to authenticated
  using (
    (exists (select 1 from public.profiles p
             where p.id = (select auth.uid()) and p.member_id = comment_reactions.member_id))
    or (exists (select 1 from public.task_comments c
                join public.tasks t on t.id = c.task_id
                where c.id = comment_reactions.comment_id
                  and (app_private.is_company_admin(t.company_id) or app_private.is_quest_admin())))
  );

-- company_join_requests ------------------------------------------------------------
drop policy if exists "requesters read own join requests" on public.company_join_requests;
create policy "requesters read own join requests" on public.company_join_requests
  for select to authenticated
  using (profile_id = (select auth.uid()) or app_private.is_company_admin(company_id));

-- message_attachments --------------------------------------------------------------
-- Self-comparisons replaced with the parent-row checks they were meant to be.
drop policy if exists "message attachments insert allowed" on public.message_attachments;
create policy "message attachments insert allowed" on public.message_attachments
  for insert to authenticated
  with check (
    app_private.can_access_message_conversation(conversation_id)
    and app_private.has_company_permission(company_id, 'messages.attach_files')
    and (exists (select 1 from public.messages m
                 where m.id = message_attachments.message_id
                   and m.conversation_id = message_attachments.conversation_id
                   and m.company_id = message_attachments.company_id
                   and m.sender_profile_id = (select auth.uid())))
  );

-- message_conversation_access ------------------------------------------------------
drop policy if exists "message access insert creator or manager" on public.message_conversation_access;
create policy "message access insert creator or manager" on public.message_conversation_access
  for insert to authenticated
  with check (
    app_private.is_company_member(company_id)
    and (exists (select 1 from public.message_conversations mc
                 where mc.id = message_conversation_access.conversation_id
                   and mc.company_id = message_conversation_access.company_id
                   and (mc.created_by = (select auth.uid())
                        or app_private.has_company_permission(mc.company_id, 'messages.manage_groups')
                        or app_private.has_company_permission(mc.company_id, 'messages.manage'))))
  );

-- message_conversations ------------------------------------------------------------
drop policy if exists "message conversations insert allowed" on public.message_conversations;
create policy "message conversations insert allowed" on public.message_conversations
  for insert to authenticated
  with check (
    app_private.is_company_member(company_id)
    and app_private.subscription_allows_access(company_id)
    and created_by = (select auth.uid())
    and (
      (type = 'direct' and app_private.has_company_permission(company_id, 'messages.send'))
      or (type <> 'direct' and app_private.has_company_permission(company_id, 'messages.create_group'))
    )
  );

-- message_reads --------------------------------------------------------------------
drop policy if exists "message reads select own" on public.message_reads;
create policy "message reads select own" on public.message_reads
  for select to authenticated
  using (profile_id = (select auth.uid())
         and app_private.can_access_message_conversation(conversation_id));

drop policy if exists "message reads update own" on public.message_reads;
create policy "message reads update own" on public.message_reads
  for update to authenticated
  using (profile_id = (select auth.uid())
         and app_private.can_access_message_conversation(conversation_id))
  with check (profile_id = (select auth.uid())
              and app_private.can_access_message_conversation(conversation_id));

drop policy if exists "message reads upsert own" on public.message_reads;
create policy "message reads upsert own" on public.message_reads
  for insert to authenticated
  with check (profile_id = (select auth.uid())
              and app_private.can_access_message_conversation(conversation_id));

-- messages -------------------------------------------------------------------------
-- `mc.company_id = mc.company_id` becomes the real check against the message's company.
drop policy if exists "messages insert senders" on public.messages;
create policy "messages insert senders" on public.messages
  for insert to authenticated
  with check (
    sender_profile_id = (select auth.uid())
    and app_private.can_access_message_conversation(conversation_id)
    and app_private.has_company_permission(company_id, 'messages.send')
    and (exists (select 1 from public.message_conversations mc
                 where mc.id = messages.conversation_id
                   and mc.company_id = messages.company_id))
  );

drop policy if exists "messages update delete permissions" on public.messages;
create policy "messages update delete permissions" on public.messages
  for update to authenticated
  using (
    app_private.can_access_message_conversation(conversation_id)
    and ((sender_profile_id = (select auth.uid())
          and app_private.has_company_permission(company_id, 'messages.delete_own'))
         or app_private.has_company_permission(company_id, 'messages.delete_any'))
  )
  with check (
    app_private.can_access_message_conversation(conversation_id)
    and ((sender_profile_id = (select auth.uid())
          and app_private.has_company_permission(company_id, 'messages.delete_own'))
         or app_private.has_company_permission(company_id, 'messages.delete_any'))
  );

-- profiles -------------------------------------------------------------------------
drop policy if exists "managers delete profiles" on public.profiles;
create policy "managers delete profiles" on public.profiles
  for delete to authenticated
  using (public.can_manage_roles() and id <> (select auth.uid()));

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

-- The self-service update: a user may edit their own display fields, but role,
-- approval, supervisor, company membership, member id and email must each come back
-- unchanged. Every comparison re-reads the row's current value, so each of those
-- subqueries needs the same hoisting treatment.
drop policy if exists "users update own profile name" on public.profiles;
create policy "users update own profile name" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check (
    (select auth.uid()) = id
    and role = (select p.role from public.profiles p where p.id = (select auth.uid()))
    and approved = (select p.approved from public.profiles p where p.id = (select auth.uid()))
    and not (supervisor_id is distinct from (select p.supervisor_id from public.profiles p where p.id = (select auth.uid())))
    and not (company_ids is distinct from (select p.company_ids from public.profiles p where p.id = (select auth.uid())))
    and not (member_id is distinct from (select p.member_id from public.profiles p where p.id = (select auth.uid())))
    and not (email is distinct from (select p.email from public.profiles p where p.id = (select auth.uid())))
  );

-- ringcentral_calls ----------------------------------------------------------------
drop policy if exists "members read own calls" on public.ringcentral_calls;
create policy "members read own calls" on public.ringcentral_calls
  for select to authenticated
  using (
    app_private.is_quest_admin()
    or app_private.is_company_admin(company_id)
    or (app_private.is_company_member(company_id)
        and extension_email <> ''
        and extension_email = lower(coalesce((select auth.jwt()) ->> 'email', '')))
  );

-- task_comments --------------------------------------------------------------------
drop policy if exists "authors and admins delete task_comments" on public.task_comments;
create policy "authors and admins delete task_comments" on public.task_comments
  for delete to authenticated
  using (
    (exists (select 1 from public.profiles p
             where p.id = (select auth.uid()) and p.member_id = task_comments.author_id))
    or (exists (select 1 from public.tasks t
                where t.id = task_comments.task_id
                  and (app_private.is_company_admin(t.company_id) or app_private.is_quest_admin())))
  );

drop policy if exists "company members insert own task_comments" on public.task_comments;
create policy "company members insert own task_comments" on public.task_comments
  for insert to authenticated
  with check (
    (exists (select 1 from public.profiles p
             where p.id = (select auth.uid()) and p.member_id = task_comments.author_id))
    and (exists (select 1 from public.tasks t
                 where t.id = task_comments.task_id
                   and app_private.is_company_member(t.company_id)))
  );

-- The last uncovered foreign key. Same reasoning as 202607311200: without this,
-- deleting a profile that created a platform admin row forces a sequential scan.
-- Distinct name, per the lesson recorded in 202607311300.
create index if not exists platform_admins_created_by_fk_idx
  on app_private.platform_admins (created_by);
