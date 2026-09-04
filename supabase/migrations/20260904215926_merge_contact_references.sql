-- Contact merge moves every reference, or it moves none.
--
-- The client used to re-parent three things (deals.primary_contact_id, tasks.contact_id
-- and activities.related_id) one statement at a time, ignore whether any of them
-- succeeded, and then recycle the duplicate regardless. Two consequences:
--
--   1. Five more references were never moved at all: jobs.contact_id,
--      proposal_documents.contact_id, crm_sites.contact_id,
--      underwriting_cases.contact_id, contact_label_assignments.contact_id -- and
--      activities.contact_id, which is a real column with its own foreign key and is
--      not the same thing as activities.related_id.
--   2. contact_label_assignments, crm_sites and underwriting_cases are ON DELETE
--      CASCADE. purge_expired_recycle_bin hard-deletes the contact row once the
--      retention window closes, so anything still pointing at a merged-away duplicate
--      was not merely mislinked -- it was destroyed on a delay.
--
-- One transaction now. If any single move fails the whole merge rolls back and the
-- caller is told, so the duplicate is still there to try again.

create or replace function public.merge_contact_references(
  p_survivor_id text,
  p_duplicate_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
set statement_timeout = '30s'
as $$
declare
  v_company text;
  v_workspace uuid;
  v_dups text[];
  v_counts jsonb := '{}'::jsonb;
  v_moved integer;
begin
  if p_survivor_id is null or p_duplicate_ids is null then
    raise exception 'survivor and duplicates are required';
  end if;

  -- Never let a contact merge into itself, and ignore repeats in the input.
  select array_agg(distinct d)
    into v_dups
    from unnest(p_duplicate_ids) as d
   where d is not null and d <> p_survivor_id;

  if v_dups is null or array_length(v_dups, 1) is null then
    return jsonb_build_object('merged', 0);
  end if;

  select c.company_id, c.workspace_id
    into v_company, v_workspace
    from public.contacts c
   where c.id = p_survivor_id;

  if v_company is null then raise exception 'survivor contact not found'; end if;

  -- Authorize against the same workspace permission the contacts policies use, so the
  -- SECURITY DEFINER bypass here can never grant more than a direct write would.
  if not (
    app_private.is_workspace_member(v_workspace)
    and app_private.has_workspace_permission(v_workspace, 'crm.manage')
  ) then
    raise exception 'not permitted to merge contacts in this workspace';
  end if;

  -- Every duplicate has to sit in the same company and workspace. Anything else would
  -- move a tenant's records across a boundary, and would trip the
  -- workspace_record_links_match constraint trigger on the way through.
  if exists (
    select 1
      from public.contacts c
     where c.id = any(v_dups)
       and (c.company_id is distinct from v_company or c.workspace_id is distinct from v_workspace)
  ) then
    raise exception 'duplicates must be in the same company and workspace as the survivor';
  end if;

  update public.deals set primary_contact_id = p_survivor_id
   where primary_contact_id = any(v_dups) and company_id = v_company;
  get diagnostics v_moved = row_count;
  v_counts := v_counts || jsonb_build_object('deals', v_moved);

  update public.tasks set contact_id = p_survivor_id
   where contact_id = any(v_dups) and company_id = v_company;
  get diagnostics v_moved = row_count;
  v_counts := v_counts || jsonb_build_object('tasks', v_moved);

  update public.activities set contact_id = p_survivor_id
   where contact_id = any(v_dups) and company_id = v_company;
  get diagnostics v_moved = row_count;
  v_counts := v_counts || jsonb_build_object('activities_contact', v_moved);

  update public.activities set related_id = p_survivor_id
   where related_type = 'contact' and related_id = any(v_dups) and company_id = v_company;
  get diagnostics v_moved = row_count;
  v_counts := v_counts || jsonb_build_object('activities_related', v_moved);

  update public.jobs set contact_id = p_survivor_id
   where contact_id = any(v_dups) and company_id = v_company;
  get diagnostics v_moved = row_count;
  v_counts := v_counts || jsonb_build_object('jobs', v_moved);

  update public.proposal_documents set contact_id = p_survivor_id
   where contact_id = any(v_dups) and company_id = v_company;
  get diagnostics v_moved = row_count;
  v_counts := v_counts || jsonb_build_object('proposal_documents', v_moved);

  update public.proposal_documents set related_id = p_survivor_id
   where related_type = 'contact' and related_id = any(v_dups) and company_id = v_company;
  get diagnostics v_moved = row_count;
  v_counts := v_counts || jsonb_build_object('proposal_documents_related', v_moved);

  update public.crm_sites set contact_id = p_survivor_id
   where contact_id = any(v_dups) and company_id = v_company;
  get diagnostics v_moved = row_count;
  v_counts := v_counts || jsonb_build_object('crm_sites', v_moved);

  update public.underwriting_cases set contact_id = p_survivor_id
   where contact_id = any(v_dups) and company_id = v_company;
  get diagnostics v_moved = row_count;
  v_counts := v_counts || jsonb_build_object('underwriting_cases', v_moved);

  -- Labels are keyed (contact_id, label_id), so a straight update collides whenever the
  -- survivor already carries the same label. Insert what is missing, then drop the
  -- duplicate's rows: the survivor ends up with the union, which is what a merge means.
  insert into public.contact_label_assignments (contact_id, label_id, workspace_id, company_id, assigned_by, assigned_at)
  select p_survivor_id, a.label_id, a.workspace_id, a.company_id, a.assigned_by, a.assigned_at
    from public.contact_label_assignments a
   where a.contact_id = any(v_dups) and a.company_id = v_company
  on conflict (contact_id, label_id) do nothing;
  get diagnostics v_moved = row_count;
  v_counts := v_counts || jsonb_build_object('labels_added', v_moved);

  delete from public.contact_label_assignments
   where contact_id = any(v_dups) and company_id = v_company;

  return v_counts || jsonb_build_object('merged', array_length(v_dups, 1));
end;
$$;

revoke all on function public.merge_contact_references(text, text[]) from public, anon;
grant execute on function public.merge_contact_references(text, text[]) to authenticated;

comment on function public.merge_contact_references(text, text[]) is
  'Moves every contact reference from the duplicates onto the survivor in one transaction. Authorized by workspace crm.manage. Does not delete the duplicates; the caller recycles them only after this returns.';
