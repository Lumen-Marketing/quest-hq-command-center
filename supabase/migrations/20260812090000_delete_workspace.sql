-- Deleting an operational workspace.
--
-- There was no way to remove one. Archiving exists and hides a workspace, but the directory
-- still fills with dead entries and nothing ever goes away.
--
-- WHAT THE FOREIGN KEYS ALREADY SAY. Eighteen tables reference public.workspaces, and they
-- fall into three groups that decide this design rather than being decided by it:
--
--   RESTRICT (11)  accounts, activities, contacts, crm_sites, deals, job_files, jobs,
--                  pipeline_stages, proposal_documents, tasks, underwriting_cases.
--                  A plain delete FAILS while any of these exist. For the ten business
--                  tables that is exactly right and is left alone: a workspace holding
--                  customers or jobs must not be removable in one click. pipeline_stages is
--                  the odd one out -- it is configuration, every workspace has some, and
--                  leaving it would make every workspace undeletable -- so this removes those
--                  itself, inside the same transaction.
--
--   CASCADE (6)    contact_labels, contact_label_assignments, record_history,
--                  workspace_memberships, workspace_plugins, workspace_setup_profiles.
--                  All configuration or history OF the workspace, so they go with it.
--
--   SET NULL (1)   eod_reports keeps the report and forgets the workspace.
--
-- So the rule is: a workspace can be deleted when it holds no business records, and the
-- procedure says how many are in the way when it cannot. The caller is told to archive
-- instead, which is the operation that does exist for a workspace with history in it.
--
-- OWNER, not admin. An admin can configure a company; unmaking part of one is an owner's
-- decision. The client also re-checks the password before calling, because a session left
-- open on somebody's desk should not be enough.

create or replace function public.delete_workspace(target_workspace_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  actor_id uuid := (select auth.uid());
  ws public.workspaces%rowtype;
  blocking jsonb := '{}'::jsonb;
  blocking_total integer := 0;
  counts record;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select * into ws from public.workspaces where id = target_workspace_id;
  if ws.id is null then
    raise exception 'Workspace not found';
  end if;

  if not app_private.is_company_owner(ws.company_id) then
    raise exception 'Owner access is required to delete a workspace';
  end if;

  -- The default is how everyone without an explicit assignment reaches the company at all.
  if ws.is_default then
    raise exception 'This is the default workspace. Make another workspace the default first.';
  end if;

  select
    (select count(*) from public.contacts            where workspace_id = ws.id) as contacts,
    (select count(*) from public.deals               where workspace_id = ws.id) as deals,
    (select count(*) from public.jobs                where workspace_id = ws.id) as jobs,
    (select count(*) from public.tasks               where workspace_id = ws.id) as tasks,
    (select count(*) from public.accounts            where workspace_id = ws.id) as accounts,
    (select count(*) from public.activities          where workspace_id = ws.id) as activities,
    (select count(*) from public.job_files           where workspace_id = ws.id) as files,
    (select count(*) from public.proposal_documents  where workspace_id = ws.id) as proposals,
    (select count(*) from public.underwriting_cases  where workspace_id = ws.id) as underwriting,
    (select count(*) from public.crm_sites           where workspace_id = ws.id) as sites
  into counts;

  blocking := jsonb_strip_nulls(jsonb_build_object(
    'contacts',     nullif(counts.contacts, 0),
    'quotes',       nullif(counts.deals, 0),
    'jobs',         nullif(counts.jobs, 0),
    'tasks',        nullif(counts.tasks, 0),
    'accounts',     nullif(counts.accounts, 0),
    'activity',     nullif(counts.activities, 0),
    'files',        nullif(counts.files, 0),
    'proposals',    nullif(counts.proposals, 0),
    'underwriting', nullif(counts.underwriting, 0),
    'sites',        nullif(counts.sites, 0)
  ));

  blocking_total := counts.contacts + counts.deals + counts.jobs + counts.tasks
    + counts.accounts + counts.activities + counts.files + counts.proposals
    + counts.underwriting + counts.sites;

  if blocking_total > 0 then
    -- Returned rather than raised: the dialog lists what is in the way, and a raised
    -- exception would carry one string instead of the breakdown.
    return jsonb_build_object(
      'deleted', false,
      'reason', 'has_records',
      'blocking', blocking,
      'blocking_total', blocking_total
    );
  end if;

  -- Configuration, not records. Without this the pipeline_stages RESTRICT makes every
  -- workspace undeletable, because every workspace has stages.
  delete from public.pipeline_stages where workspace_id = ws.id;

  insert into public.audit_events (
    company_id, actor_profile_id, event_type, target_type, target_id, details
  ) values (
    ws.company_id, actor_id, 'workspace.deleted', 'workspace', ws.id::text,
    jsonb_build_object('name', ws.name, 'slug', ws.slug, 'status', ws.status)
  );

  delete from public.workspaces where id = ws.id;

  return jsonb_build_object('deleted', true, 'name', ws.name);
end;
$$;

revoke all on function public.delete_workspace(uuid) from public, anon;
grant execute on function public.delete_workspace(uuid) to authenticated;
