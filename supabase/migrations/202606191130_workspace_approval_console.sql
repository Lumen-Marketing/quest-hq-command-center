alter table public.company_subscriptions
  drop constraint if exists company_subscriptions_status_check;

alter table public.company_subscriptions
  add constraint company_subscriptions_status_check check (
    status in ('pending_review', 'trialing', 'active', 'past_due', 'grace', 'suspended', 'canceled', 'incomplete')
  );

create or replace function app_private.is_quest_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) = 'developer'
  );
$$;

revoke all on function app_private.is_quest_admin() from public, anon;
grant execute on function app_private.is_quest_admin() to authenticated;

create or replace function public.list_workspace_reviews()
returns table (
  company_id text,
  company_name text,
  status text,
  plan_code text,
  amount_cents integer,
  currency text,
  owner_profile_id uuid,
  owner_name text,
  owner_email text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not app_private.is_quest_admin() then
    raise exception 'Quest admin access required';
  end if;

  return query
  select
    cs.company_id,
    coalesce(c.name, c.short_name, cs.company_id) as company_name,
    cs.status,
    cs.plan_code,
    cs.amount_cents,
    cs.currency,
    owner_row.profile_id as owner_profile_id,
    owner_row.full_name as owner_name,
    owner_row.email as owner_email,
    cs.trial_ends_at,
    cs.current_period_end,
    cs.grace_ends_at,
    cs.created_at,
    cs.updated_at
  from public.company_subscriptions cs
  join public.companies c on c.id = cs.company_id
  left join lateral (
    select cm.profile_id, p.full_name, p.email
    from public.company_memberships cm
    left join public.profiles p on p.id = cm.profile_id
    where cm.company_id = cs.company_id
      and cm.role = 'owner'
      and cm.status = 'active'
    order by cm.created_at asc
    limit 1
  ) owner_row on true
  where cs.status in ('pending_review', 'trialing', 'active', 'suspended', 'canceled')
  order by
    case when cs.status = 'pending_review' then 0 else 1 end,
    coalesce(c.name, c.short_name, cs.company_id);
end;
$$;

revoke all on function public.list_workspace_reviews() from public, anon;
grant execute on function public.list_workspace_reviews() to authenticated;

create or replace function public.review_company_workspace(
  target_company_id text,
  next_status text,
  review_note text default null
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  clean_company_id text := trim(coalesce(target_company_id, ''));
  clean_status text := lower(trim(coalesce(next_status, '')));
begin
  if not app_private.is_quest_admin() then
    raise exception 'Quest admin access required';
  end if;

  if clean_company_id = '' then
    raise exception 'Company is required';
  end if;

  if clean_status not in ('pending_review', 'trialing', 'active', 'suspended', 'canceled') then
    raise exception 'Unsupported workspace status';
  end if;

  insert into public.company_subscriptions (
    company_id,
    status,
    plan_code,
    amount_cents,
    currency,
    current_period_end,
    updated_at
  )
  values (
    clean_company_id,
    clean_status,
    'quest_company_300',
    30000,
    'usd',
    case when clean_status in ('trialing', 'active') then now() + interval '30 days' else null end,
    now()
  )
  on conflict (company_id) do update
    set status = excluded.status,
        plan_code = coalesce(public.company_subscriptions.plan_code, excluded.plan_code),
        amount_cents = coalesce(public.company_subscriptions.amount_cents, excluded.amount_cents),
        currency = coalesce(public.company_subscriptions.currency, excluded.currency),
        current_period_end = case
          when excluded.status in ('trialing', 'active') then coalesce(public.company_subscriptions.current_period_end, excluded.current_period_end)
          else public.company_subscriptions.current_period_end
        end,
        updated_at = now();

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    clean_company_id,
    auth.uid(),
    'workspace.reviewed',
    'company_subscription',
    clean_company_id,
    jsonb_build_object('status', clean_status, 'note', coalesce(review_note, ''))
  );

  return clean_status;
end;
$$;

revoke all on function public.review_company_workspace(text, text, text) from public, anon;
grant execute on function public.review_company_workspace(text, text, text) to authenticated;

create or replace function public.lookup_company_invite(invite_token text)
returns table (
  company_id text,
  company_name text,
  email text,
  status text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  clean_token text := trim(coalesce(invite_token, ''));
begin
  if clean_token = '' then
    return;
  end if;

  update public.company_invites ci
  set status = 'expired',
      updated_at = now()
  where ci.token = clean_token
    and ci.status = 'pending'
    and ci.expires_at is not null
    and ci.expires_at <= now();

  return query
  select
    ci.company_id,
    coalesce(c.name, c.short_name, ci.company_id) as company_name,
    ci.email,
    ci.status,
    ci.expires_at
  from public.company_invites ci
  join public.companies c on c.id = ci.company_id
  where ci.token = clean_token
  limit 1;
end;
$$;

revoke all on function public.lookup_company_invite(text) from public;
grant execute on function public.lookup_company_invite(text) to anon, authenticated;
