-- Correct the revision-aware draft save introduced by the preceding release
-- hardening migration. INSERT ... SELECT with a false WHERE has no candidate row,
-- so it cannot reach ON CONFLICT for revisions above zero. Existing profiles use
-- a direct guarded UPDATE; revision zero retains the insert-or-update path.

create or replace function public.save_workspace_setup_draft(
  target_workspace_id uuid,
  p_answers jsonb,
  p_draft_plan jsonb,
  p_expected_revision integer
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_company_id text;
  result_row public.workspace_setup_profiles%rowtype;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;

  select w.company_id
    into target_company_id
  from public.workspaces w
  where w.id = target_workspace_id
    and w.status = 'active';

  if target_company_id is null then raise exception 'Active workspace not found'; end if;
  if not app_private.is_company_admin(target_company_id) then
    raise exception 'Company admin access required';
  end if;
  if coalesce(p_expected_revision, -1) < 0 then
    raise exception 'A valid setup revision is required';
  end if;
  if jsonb_typeof(coalesce(p_answers, '{}'::jsonb)) <> 'object' then
    raise exception 'Setup answers must be an object';
  end if;
  if jsonb_typeof(coalesce(p_draft_plan, '{}'::jsonb)) <> 'object' then
    raise exception 'Setup draft must be an object';
  end if;
  if octet_length(coalesce(p_answers, '{}'::jsonb)::text) > 32768
     or octet_length(coalesce(p_draft_plan, '{}'::jsonb)::text) > 131072 then
    raise exception 'Workspace setup draft is too large';
  end if;

  if p_expected_revision = 0 then
    insert into public.workspace_setup_profiles (
      workspace_id, answers, draft_plan, status, setup_version,
      revision, updated_at, updated_by
    ) values (
      target_workspace_id, coalesce(p_answers, '{}'::jsonb),
      coalesce(p_draft_plan, '{}'::jsonb), 'draft', 1, 1, now(), actor_id
    )
    on conflict (workspace_id) do update
    set answers = excluded.answers,
        draft_plan = excluded.draft_plan,
        status = 'draft',
        setup_version = 1,
        revision = public.workspace_setup_profiles.revision + 1,
        updated_at = now(),
        updated_by = actor_id
    where public.workspace_setup_profiles.revision = p_expected_revision
    returning public.workspace_setup_profiles.* into result_row;
  else
    update public.workspace_setup_profiles profile
       set answers = coalesce(p_answers, '{}'::jsonb),
           draft_plan = coalesce(p_draft_plan, '{}'::jsonb),
           status = 'draft',
           setup_version = 1,
           revision = profile.revision + 1,
           updated_at = now(),
           updated_by = actor_id
     where profile.workspace_id = target_workspace_id
       and profile.revision = p_expected_revision
    returning profile.* into result_row;
  end if;

  if result_row.workspace_id is null then
    raise exception 'Workspace setup changed in another tab or device. Reload Setup before saving again.'
      using errcode = '40001';
  end if;

  return jsonb_build_object(
    'status', result_row.status,
    'workspace_id', result_row.workspace_id,
    'revision', result_row.revision,
    'updated_at', result_row.updated_at
  );
end;
$$;

revoke all on function public.save_workspace_setup_draft(uuid, jsonb, jsonb, integer)
  from public, anon;
grant execute on function public.save_workspace_setup_draft(uuid, jsonb, jsonb, integer)
  to authenticated, service_role;
