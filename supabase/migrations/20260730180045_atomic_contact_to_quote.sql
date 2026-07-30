-- Make the Contacts -> Quotes handoff one workspace-authorized transaction.
-- The request id makes retries idempotent without preventing a contact from
-- intentionally having more than one quote.

alter table public.deals
  add column if not exists contact_quote_request_id uuid;

create unique index if not exists deals_contact_quote_request_id_uidx
  on public.deals(contact_quote_request_id)
  where contact_quote_request_id is not null;

comment on column public.deals.contact_quote_request_id is
  'Client-generated idempotency key for an intentional contact-to-quote action.';

create or replace function public.convert_contact_to_quote(
  p_contact_id text,
  p_request_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
set statement_timeout = '15s'
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_contact public.contacts;
  v_account public.accounts;
  v_site public.crm_sites;
  v_deal public.deals;
  v_activity public.activities;
  v_stage text := '';
  v_now timestamptz := statement_timestamp();
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;

  if nullif(btrim(p_contact_id), '') is null or p_request_id is null then
    raise exception 'A contact and request id are required';
  end if;

  select c.*
  into v_contact
  from public.contacts c
  where c.id = p_contact_id
    and c.deleted_at is null
  for update;

  if not found then
    raise exception 'Contact was not found';
  end if;

  if not app_private.has_workspace_permission(v_contact.workspace_id, 'crm.manage') then
    raise exception 'Workspace CRM management access is required';
  end if;

  if not exists (
    select 1
    from public.workspaces w
    where w.id = v_contact.workspace_id
      and w.company_id = v_contact.company_id
      and w.status = 'active'
  ) then
    raise exception 'Contact workspace is unavailable';
  end if;

  -- Return the exact result of an earlier successful attempt. The unique key
  -- remains consumed even after soft deletion, preventing a retry from making
  -- a second quote later.
  select d.*
  into v_deal
  from public.deals d
  where d.contact_quote_request_id = p_request_id;

  if found then
    if v_deal.company_id <> v_contact.company_id
      or v_deal.workspace_id <> v_contact.workspace_id
      or v_deal.primary_contact_id is distinct from v_contact.id
    then
      raise exception 'Request id is already in use';
    end if;

    if v_deal.deleted_at is not null then
      raise exception 'The quote created by this request is no longer active';
    end if;

    select a.*
    into v_account
    from public.accounts a
    where a.id = v_deal.account_id
      and a.company_id = v_contact.company_id
      and a.workspace_id = v_contact.workspace_id
      and a.deleted_at is null;

    select s.*
    into v_site
    from public.crm_sites s
    where s.id = v_deal.site_id
      and s.company_id = v_contact.company_id
      and s.workspace_id = v_contact.workspace_id;

    select a.*
    into v_activity
    from public.activities a
    where a.deal_id = v_deal.id
      and a.contact_id = v_contact.id
      and a.company_id = v_contact.company_id
      and a.workspace_id = v_contact.workspace_id
      and a.type = 'system'
      and a.subject = 'Contact graduated -> Quote created'
      and a.related_type = 'contact'
      and a.related_id = v_contact.id
      and a.deleted_at is null
    order by a.created_at asc, a.id asc
    limit 1;

    if v_account.id is null or v_site.id is null or v_activity.id is null then
      raise exception 'The earlier quote conversion is incomplete';
    end if;

    return jsonb_build_object(
      'created', false,
      'contact', to_jsonb(v_contact),
      'account', to_jsonb(v_account),
      'site', to_jsonb(v_site),
      'deal', to_jsonb(v_deal),
      'activity', to_jsonb(v_activity)
    );
  end if;

  if v_contact.account_id is not null then
    select a.*
    into v_account
    from public.accounts a
    where a.id = v_contact.account_id
      and a.company_id = v_contact.company_id
      and a.workspace_id = v_contact.workspace_id
      and a.deleted_at is null
    for update;

    if not found then
      raise exception 'The contact account is unavailable in this workspace';
    end if;
  else
    insert into public.accounts (
      id,
      company_id,
      workspace_id,
      name,
      type,
      phone,
      email,
      address,
      owner_name,
      status,
      notes,
      created_by,
      created_at,
      updated_at
    )
    values (
      'account-' || gen_random_uuid()::text,
      v_contact.company_id,
      v_contact.workspace_id,
      v_contact.name,
      'Customer',
      v_contact.phone,
      v_contact.email,
      v_contact.location,
      v_contact.owner_name,
      'Active',
      v_contact.notes,
      v_actor_id,
      v_now,
      v_now
    )
    returning * into v_account;

    update public.contacts
    set account_id = v_account.id,
        updated_at = v_now
    where id = v_contact.id
    returning * into v_contact;
  end if;

  select s.*
  into v_site
  from public.crm_sites s
  where s.contact_id = v_contact.id
    and s.company_id = v_contact.company_id
    and s.workspace_id = v_contact.workspace_id
    and (s.account_id is null or s.account_id = v_account.id)
  order by (s.account_id = v_account.id) desc nulls last, s.created_at asc, s.id asc
  limit 1
  for update;

  if found then
    if v_site.account_id is null then
      update public.crm_sites
      set account_id = v_account.id,
          updated_at = v_now
      where id = v_site.id
      returning * into v_site;
    end if;
  else
    insert into public.crm_sites (
      id,
      company_id,
      workspace_id,
      contact_id,
      account_id,
      label,
      address,
      roof_system,
      secondary_roof_system,
      has_multiple_roof_systems,
      notes,
      created_by,
      created_at,
      updated_at
    )
    values (
      'site-' || gen_random_uuid()::text,
      v_contact.company_id,
      v_contact.workspace_id,
      v_contact.id,
      v_account.id,
      'Primary site',
      v_contact.location,
      v_contact.roof_system,
      v_contact.secondary_roof_system,
      v_contact.has_multiple_roof_systems,
      v_contact.notes,
      v_actor_id,
      v_now,
      v_now
    )
    returning * into v_site;
  end if;

  select ps.name
  into v_stage
  from public.pipeline_stages ps
  where ps.workspace_id = v_contact.workspace_id
    and ps.company_id = v_contact.company_id
    and ps.kind = 'deals'
  order by ps.position asc, ps.created_at asc, ps.id asc
  limit 1;

  if not found then
    raise exception 'No quote pipeline stages are configured for this workspace';
  end if;

  insert into public.deals (
    id,
    company_id,
    workspace_id,
    account_id,
    primary_contact_id,
    site_id,
    contact_quote_request_id,
    name,
    stage,
    status,
    value,
    owner_name,
    source,
    notes,
    created_by,
    created_at,
    updated_at
  )
  values (
    'deal-' || gen_random_uuid()::text,
    v_contact.company_id,
    v_contact.workspace_id,
    v_account.id,
    v_contact.id,
    v_site.id,
    p_request_id,
    v_contact.name || case when nullif(v_contact.title, '') is null then '' else ' - ' || v_contact.title end,
    v_stage,
    'open',
    v_contact.value,
    v_contact.owner_name,
    v_contact.source,
    v_contact.notes,
    v_actor_id,
    v_now,
    v_now
  )
  returning * into v_deal;

  insert into public.activities (
    id,
    company_id,
    workspace_id,
    type,
    subject,
    body,
    related_type,
    related_id,
    account_id,
    contact_id,
    site_id,
    deal_id,
    owner_name,
    created_by,
    created_at,
    updated_at
  )
  values (
    'activity-' || gen_random_uuid()::text,
    v_contact.company_id,
    v_contact.workspace_id,
    'system',
    'Contact graduated -> Quote created',
    v_deal.name,
    'contact',
    v_contact.id,
    v_account.id,
    v_contact.id,
    v_site.id,
    v_deal.id,
    v_contact.owner_name,
    v_actor_id,
    v_now,
    v_now
  )
  returning * into v_activity;

  update public.contacts
  set last_activity_at = v_now,
      updated_at = v_now
  where id = v_contact.id
  returning * into v_contact;

  return jsonb_build_object(
    'created', true,
    'contact', to_jsonb(v_contact),
    'account', to_jsonb(v_account),
    'site', to_jsonb(v_site),
    'deal', to_jsonb(v_deal),
    'activity', to_jsonb(v_activity)
  );
end;
$$;

revoke execute on function public.convert_contact_to_quote(text, uuid) from public, anon;
grant execute on function public.convert_contact_to_quote(text, uuid) to authenticated;
