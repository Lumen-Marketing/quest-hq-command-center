-- Per-person task visibility.
-- Live model: tasks RLS gates on is_workspace_member + has_workspace_permission,
-- so anyone with tasks.view on a workspace sees EVERY task in it. This narrows
-- that: a "lead" (holds tasks.manage — company owner/admin/developer do so
-- automatically) still sees/edits all tasks on the job; everyone else ("crew",
-- tasks.view only) is limited to tasks they are assigned to or created. The
-- outer gates are unchanged, so tenant isolation and the permission model are
-- preserved — this can only narrow access, never widen it. INSERT and DELETE
-- keep their tasks.manage policies (create/delete stay lead/owner only).

drop policy if exists "tasks workspace read" on public.tasks;
create policy "tasks workspace read" on public.tasks for select to authenticated
using (
  app_private.is_workspace_member(workspace_id)
  and app_private.has_workspace_permission(workspace_id, 'tasks.view')
  and (
    app_private.has_workspace_permission(workspace_id, 'tasks.manage')
    or assignee_id = public.current_member_id()
    or creator_id  = public.current_member_id()
  )
);

drop policy if exists "tasks workspace update" on public.tasks;
create policy "tasks workspace update" on public.tasks for update to authenticated
using (
  app_private.is_workspace_member(workspace_id)
  and (
    app_private.has_workspace_permission(workspace_id, 'tasks.manage')
    or (
      app_private.has_workspace_permission(workspace_id, 'tasks.view')
      and (assignee_id = public.current_member_id() or creator_id = public.current_member_id())
    )
  )
)
with check (
  app_private.is_workspace_member(workspace_id)
  and (
    app_private.has_workspace_permission(workspace_id, 'tasks.manage')
    or (
      app_private.has_workspace_permission(workspace_id, 'tasks.view')
      and (assignee_id = public.current_member_id() or creator_id = public.current_member_id())
    )
  )
);
