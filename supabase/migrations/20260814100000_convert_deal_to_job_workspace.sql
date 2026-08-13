-- Converting a quote to a job failed in every workspace except the default one.
--
-- "Quote conversion failed — Linked account belongs to another workspace."
--
-- convert_deal_to_job's INSERT never listed workspace_id. The column is NOT NULL with no
-- default, so the BEFORE INSERT trigger `assign_default_workspace` filled it with the
-- company's DEFAULT workspace. The job then carried account_id / contact_id / site_id copied
-- from the quote -- which live in the quote's workspace -- and the AFTER INSERT constraint
-- trigger `validate_workspace_record_links` correctly rejected the mismatch.
--
-- So a quote in Main converted fine and a quote in Sales could not convert at all, which is
-- why it read as intermittent rather than as a missing column.
--
-- The job takes the QUOTE's workspace, not the caller's. Every record the new job links to
-- belongs to the quote, so that is the only value the link validator can accept -- and it
-- means a client that sends the wrong workspace cannot write a row that fails validation on
-- somebody else's screen later.
--
-- accept_public_proposal has the same shape: it inserts an activity with no workspace_id, so
-- an accepted proposal logged itself into the default workspace. It sets no FK links, so the
-- validator never caught it -- the activity simply appeared in the wrong place. Fixed here
-- too, from the proposal's own workspace.

create or replace function public.convert_deal_to_job(p_job jsonb, p_deal jsonb)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'app_private', 'pg_temp'
as $$
declare
  v_uid uuid := (select auth.uid());
  v_company text := nullif(btrim(p_job->>'company_id'), '');
  v_deal_id text := nullif(btrim(p_deal->>'id'), '');
  v_job public.jobs;
  v_deal public.deals;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if v_company is null or v_deal_id is null then raise exception 'invalid quote conversion'; end if;
  if nullif(btrim(p_deal->>'company_id'), '') is distinct from v_company then raise exception 'company mismatch'; end if;
  if nullif(btrim(p_job->>'deal_id'), '') is distinct from v_deal_id then raise exception 'quote link mismatch'; end if;
  if not app_private.has_company_permission(v_company, 'jobs.manage')
     or not app_private.has_company_permission(v_company, 'crm.view') then
    raise exception 'not permitted to convert this quote';
  end if;

  select * into v_deal
  from public.deals
  where id = v_deal_id and company_id = v_company and deleted_at is null
  for update;
  if v_deal.id is null then raise exception 'quote not found'; end if;

  if v_deal.job_id is not null then
    select * into v_job from public.jobs where id = v_deal.job_id and company_id = v_company;
    if v_job.id is null then raise exception 'linked job is unavailable'; end if;
    return jsonb_build_object('job', to_jsonb(v_job), 'deal', to_jsonb(v_deal), 'created', false);
  end if;

  insert into public.jobs (
    id, company_id, workspace_id, name, client_name, contact_name, site_address, job_type,
    stage, priority, owner_name, scope, notes, estimate_total, invoice_total,
    account_id, contact_id, deal_id, site_id, updated_at
  ) values (
    (p_job->>'id')::uuid,
    v_company,
    -- The quote's workspace. Its account, contact and site all live there, and a job that
    -- links to them has to live there too.
    v_deal.workspace_id,
    nullif(btrim(p_job->>'name'), ''),
    nullif(p_job->>'client_name', ''),
    nullif(p_job->>'contact_name', ''),
    nullif(p_job->>'site_address', ''),
    coalesce(nullif(p_job->>'job_type', ''), 'Roofing'),
    coalesce(nullif(p_job->>'stage', ''), 'Lead'),
    coalesce(nullif(p_job->>'priority', ''), 'Medium'),
    nullif(p_job->>'owner_name', ''),
    nullif(p_job->>'scope', ''),
    nullif(p_job->>'notes', ''),
    coalesce((p_job->>'estimate_total')::numeric, 0),
    coalesce((p_job->>'invoice_total')::numeric, 0),
    nullif(p_job->>'account_id', ''),
    nullif(p_job->>'contact_id', ''),
    v_deal_id,
    nullif(p_job->>'site_id', ''),
    coalesce((p_job->>'updated_at')::timestamptz, now())
  )
  returning * into v_job;

  update public.deals
     set status = 'won',
         stage = coalesce(nullif(p_deal->>'stage', ''), stage),
         job_id = v_job.id,
         updated_at = now()
   where id = v_deal_id and company_id = v_company
   returning * into v_deal;

  if v_deal.id is null then raise exception 'quote link failed'; end if;
  return jsonb_build_object('job', to_jsonb(v_job), 'deal', to_jsonb(v_deal), 'created', true);
end;
$$;

create or replace function public.accept_public_proposal(
  proposal_token text,
  signer_name text,
  signer_email text default '',
  decision text default 'accept'
)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'app_private', 'pg_temp'
as $$
declare
  clean_token text := trim(coalesce(proposal_token, ''));
  clean_name text := trim(coalesce(signer_name, ''));
  clean_email text := trim(coalesce(signer_email, ''));
  clean_decision text := lower(trim(coalesce(decision, 'accept')));
  proposal_row public.proposal_documents%rowtype;
begin
  if clean_token = '' then
    raise exception 'Proposal token is required';
  end if;

  if clean_name = '' then
    raise exception 'Signer name is required';
  end if;

  if clean_decision not in ('accept', 'decline') then
    raise exception 'Unsupported proposal decision';
  end if;

  select *
    into proposal_row
  from public.proposal_documents
  where public_token = clean_token
    and status in ('Sent', 'Viewed')
  limit 1;

  if proposal_row.id is null then
    raise exception 'Proposal is no longer open';
  end if;

  update public.proposal_documents
  set status = case when clean_decision = 'decline' then 'Declined' else 'Accepted' end,
      accepted_by = case when clean_decision = 'decline' then accepted_by else clean_name end,
      accepted_email = case when clean_decision = 'decline' then accepted_email else clean_email end,
      accepted_at = case when clean_decision = 'decline' then accepted_at else now() end,
      declined_at = case when clean_decision = 'decline' then now() else declined_at end,
      updated_at = now()
  where id = proposal_row.id
  returning * into proposal_row;

  insert into public.activities (
    id,
    company_id,
    workspace_id,
    type,
    subject,
    body,
    related_type,
    related_id,
    completed_at,
    owner_name,
    updated_at
  )
  values (
    'activity-' || gen_random_uuid()::text,
    proposal_row.company_id,
    -- The proposal's workspace. Without this the acceptance was logged into the company's
    -- default workspace, where the team that sent the proposal never sees it.
    proposal_row.workspace_id,
    'system',
    case when proposal_row.status = 'Declined' then 'Proposal declined' else 'Proposal accepted' end,
    'Customer: ' || clean_name || case when clean_email <> '' then ' <' || clean_email || '>' else '' end,
    proposal_row.related_type,
    proposal_row.related_id,
    now(),
    clean_name,
    now()
  );

  return jsonb_build_object(
    'id', proposal_row.id,
    'company_id', proposal_row.company_id,
    'proposal_no', proposal_row.proposal_no,
    'title', proposal_row.title,
    'status', proposal_row.status,
    'related_type', proposal_row.related_type,
    'related_id', proposal_row.related_id,
    'client', proposal_row.client,
    'draft', proposal_row.draft,
    'total', proposal_row.total,
    'public_token', proposal_row.public_token,
    'accepted_by', proposal_row.accepted_by,
    'accepted_email', proposal_row.accepted_email,
    'accepted_at', proposal_row.accepted_at,
    'declined_at', proposal_row.declined_at,
    'viewed_at', proposal_row.viewed_at,
    'sent_at', proposal_row.sent_at,
    'created_at', proposal_row.created_at,
    'updated_at', proposal_row.updated_at
  );
end;
$$;
