-- Live Supabase migration version: 20260730213315.
-- Keep browser and RLS message-management permission aliases in parity.
-- The preceding admin-elevation migration replaced this function without the
-- compatibility variants, so old roles and newer message-management checks
-- could disagree despite being the same effective permission.
create or replace function app_private.has_company_permission(target_company_id text, permission text)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  with permission_variants as (
    select permission as permission_key
    union
    select case
      when permission = 'messages.manage' then 'messages.manage_groups'
      when permission = 'messages.manage_groups' then 'messages.manage'
      else permission
    end
  ),
  membership as (
    select cm.role
    from public.company_memberships cm
    where cm.company_id = target_company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
    limit 1
  ),
  assigned as (
    select rp.effect
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    where ura.company_id = target_company_id
      and ura.profile_id = auth.uid()
      and (
        rp.permission_key = '*'
        or rp.permission_key in (select permission_key from permission_variants)
      )
  )
  select
    app_private.permission_plugin_available(target_company_id, permission)
    and (
      exists (select 1 from membership where role in ('owner', 'admin', 'developer'))
      or (
        exists (select 1 from membership)
        and not exists (select 1 from assigned where effect = 'deny')
        and (
          exists (select 1 from assigned where effect = 'allow')
          or permission in ('jobs.view', 'tasks.view', 'users.view', 'settings.view', 'plugins.view')
        )
      )
    );
$function$;

-- Expand the subscription lifecycle without breaking already-open production
-- clients. Legacy clients select company_subscriptions.* and only understand the
-- original status vocabulary, so every terminal row remains status='canceled'.
-- New clients prefer terminal_status, which distinguishes platform archive,
-- approval rejection, and a real Stripe cancellation.
alter table public.company_subscriptions
  drop constraint if exists company_subscriptions_status_check;

alter table public.company_subscriptions
  add constraint company_subscriptions_status_check check (
    status in ('pending_review', 'trialing', 'active', 'past_due', 'grace', 'suspended', 'canceled', 'incomplete')
  );

alter table public.company_subscriptions
  add column if not exists terminal_status text default null;

create or replace function app_private.normalize_company_subscription_terminal_status()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status <> 'canceled' then
    new.terminal_status := null;
  elsif new.terminal_status is null then
    new.terminal_status := 'canceled';
  end if;
  return new;
end;
$$;

revoke all on function app_private.normalize_company_subscription_terminal_status() from public, anon, authenticated;

drop trigger if exists normalize_company_subscription_terminal_status on public.company_subscriptions;
create trigger normalize_company_subscription_terminal_status
before insert or update of status, terminal_status on public.company_subscriptions
for each row execute function app_private.normalize_company_subscription_terminal_status();

-- Classify only audit-proven manual terminal actions that are not older than
-- the latest Stripe event. Other historical canceled rows retain Stripe-canceled
-- meaning. The legacy status column is intentionally never rewritten.
with latest_terminal as (
  select distinct on (ae.company_id)
    ae.company_id,
    ae.event_type,
    ae.details,
    ae.created_at
  from public.audit_events ae
  where ae.event_type in ('platform.company.archive', 'platform.company.delete', 'platform.company.cancel')
     or (ae.event_type = 'workspace.reviewed' and ae.details ->> 'status' = 'canceled')
  order by ae.company_id, ae.created_at desc, ae.id desc
)
update public.company_subscriptions cs
set terminal_status = case
  when latest_terminal.event_type in (
    'platform.company.archive',
    'platform.company.delete',
    'platform.company.cancel'
  ) then 'archived'
  when latest_terminal.event_type = 'workspace.reviewed'
    and latest_terminal.details ->> 'status' = 'canceled'
  then 'rejected'
  else 'canceled'
end
from latest_terminal
where cs.status = 'canceled'
  and latest_terminal.company_id = cs.company_id
  and (
    cs.stripe_event_created_at is null
    or latest_terminal.created_at >= cs.stripe_event_created_at
  );

update public.company_subscriptions
set terminal_status = 'canceled'
where status = 'canceled'
  and terminal_status is null;

alter table public.company_subscriptions
  drop constraint if exists company_subscriptions_terminal_status_check;

alter table public.company_subscriptions
  add constraint company_subscriptions_terminal_status_check check (
    terminal_status is null or terminal_status in ('archived', 'rejected', 'canceled')
  );

alter table public.company_subscriptions
  drop constraint if exists company_subscriptions_terminal_invariant_check;

alter table public.company_subscriptions
  add constraint company_subscriptions_terminal_invariant_check check (
    (status = 'canceled' and terminal_status is not null)
    or
    (status <> 'canceled' and terminal_status is null)
  );

create or replace function app_private.subscription_allows_access(target_company_id text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce((
    select
      cs.terminal_status is null
      and (
        (cs.status = 'trialing' and cs.trial_ends_at is not null and cs.trial_ends_at > now())
        or cs.status in ('active', 'past_due', 'grace')
        or (cs.grace_ends_at is not null and cs.grace_ends_at > now())
      )
    from public.company_subscriptions cs
    where cs.company_id = target_company_id
  ), true);
$$;

revoke all on function app_private.subscription_allows_access(text) from public, anon;
grant execute on function app_private.subscription_allows_access(text) to authenticated;

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
set search_path = public, app_private, pg_temp
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
  where cs.status in ('pending_review', 'trialing', 'active', 'past_due', 'grace', 'suspended', 'canceled', 'incomplete')
  order by
    case cs.status
      when 'pending_review' then 0
      when 'active' then 1
      when 'trialing' then 2
      when 'suspended' then 3
      when 'canceled' then 4
      else 5
    end,
    coalesce(c.name, c.short_name, cs.company_id);
end;
$$;

revoke all on function public.list_workspace_reviews() from public, anon;
grant execute on function public.list_workspace_reviews() to authenticated;

create or replace function public.list_workspace_reviews_v2()
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
set search_path = public, app_private, pg_temp
as $$
begin
  if not app_private.is_quest_admin() then
    raise exception 'Quest admin access required';
  end if;

  return query
  select
    cs.company_id,
    coalesce(c.name, c.short_name, cs.company_id) as company_name,
    coalesce(cs.terminal_status, cs.status) as status,
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
  where coalesce(cs.terminal_status, cs.status) in (
    'pending_review', 'trialing', 'active', 'past_due', 'grace',
    'suspended', 'archived', 'rejected', 'canceled', 'incomplete'
  )
  order by
    case coalesce(cs.terminal_status, cs.status)
      when 'pending_review' then 0
      when 'active' then 1
      when 'trialing' then 2
      when 'suspended' then 3
      when 'archived' then 4
      when 'rejected' then 5
      when 'canceled' then 6
      else 7
    end,
    coalesce(c.name, c.short_name, cs.company_id);
end;
$$;

revoke all on function public.list_workspace_reviews_v2() from public, anon;
grant execute on function public.list_workspace_reviews_v2() to authenticated;

create or replace function public.review_company_workspace(
  target_company_id text,
  next_status text,
  review_note text default null
)
returns text
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  clean_company_id text := trim(coalesce(target_company_id, ''));
  clean_status text := lower(trim(coalesce(next_status, '')));
  effective_status text := case when clean_status = 'canceled' then 'rejected' else clean_status end;
  legacy_status text := case when effective_status in ('archived', 'rejected', 'canceled') then 'canceled' else effective_status end;
begin
  if not app_private.is_quest_admin() then
    raise exception 'Quest admin access required';
  end if;

  if clean_company_id = '' then
    raise exception 'Company is required';
  end if;

  if clean_status not in ('pending_review', 'trialing', 'active', 'suspended', 'archived', 'rejected', 'canceled') then
    raise exception 'Unsupported workspace status';
  end if;

  insert into public.company_subscriptions (
    company_id,
    status,
    terminal_status,
    plan_code,
    amount_cents,
    currency,
    current_period_end,
    updated_at
  )
  values (
    clean_company_id,
    legacy_status,
    case when effective_status in ('archived', 'rejected', 'canceled') then effective_status else null end,
    'quest_company_300',
    30000,
    'usd',
    case when effective_status in ('trialing', 'active') then now() + interval '30 days' else null end,
    now()
  )
  on conflict (company_id) do update
    set status = excluded.status,
        terminal_status = excluded.terminal_status,
        plan_code = coalesce(public.company_subscriptions.plan_code, excluded.plan_code),
        amount_cents = coalesce(public.company_subscriptions.amount_cents, excluded.amount_cents),
        currency = coalesce(public.company_subscriptions.currency, excluded.currency),
        current_period_end = case
          when excluded.status in ('trialing', 'active') then coalesce(public.company_subscriptions.current_period_end, excluded.current_period_end)
          else public.company_subscriptions.current_period_end
        end,
        updated_at = now();

  if effective_status in ('archived', 'rejected', 'canceled') then
    update public.company_invites
    set status = 'revoked',
        updated_at = now()
    where company_id = clean_company_id
      and status = 'pending';

    update public.company_join_requests
    set status = 'canceled',
        reviewed_by = auth.uid(),
        updated_at = now()
    where company_id = clean_company_id
      and status = 'pending';
  end if;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    clean_company_id,
    auth.uid(),
    'workspace.reviewed',
    'company_subscription',
    clean_company_id,
    jsonb_build_object('status', effective_status, 'note', coalesce(review_note, ''))
  );

  return effective_status;
end;
$$;

revoke all on function public.review_company_workspace(text, text, text) from public, anon;
grant execute on function public.review_company_workspace(text, text, text) to authenticated;

create or replace function public.list_platform_companies()
returns table (
  company_id text,
  company_name text,
  short_name text,
  color text,
  label text,
  pill text,
  icon_key text,
  status text,
  plan_code text,
  amount_cents integer,
  currency text,
  owner_profile_id uuid,
  owner_name text,
  owner_email text,
  member_count integer,
  active_member_count integer,
  pending_member_count integer,
  disabled_member_count integer,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
begin
  if not app_private.is_quest_admin() then
    raise exception 'Platform admin access required';
  end if;

  return query
  select
    c.id as company_id,
    coalesce(c.name, c.short_name, c.id) as company_name,
    c.short_name,
    c.color,
    c.label,
    c.pill,
    coalesce(c.icon_key, 'home') as icon_key,
    coalesce(cs.status, 'pending_review') as status,
    coalesce(cs.plan_code, 'manual') as plan_code,
    coalesce(cs.amount_cents, 0) as amount_cents,
    coalesce(cs.currency, 'usd') as currency,
    owner_row.profile_id as owner_profile_id,
    owner_row.full_name as owner_name,
    owner_row.email as owner_email,
    coalesce(member_counts.member_count, 0)::integer as member_count,
    coalesce(member_counts.active_member_count, 0)::integer as active_member_count,
    coalesce(member_counts.pending_member_count, 0)::integer as pending_member_count,
    coalesce(member_counts.disabled_member_count, 0)::integer as disabled_member_count,
    cs.trial_ends_at,
    cs.current_period_end,
    cs.grace_ends_at,
    coalesce(cs.created_at, c.created_at) as created_at,
    coalesce(cs.updated_at, c.created_at) as updated_at
  from public.companies c
  left join public.company_subscriptions cs on cs.company_id = c.id
  left join lateral (
    select cm.profile_id, p.full_name, p.email
    from public.company_memberships cm
    left join public.profiles p on p.id = cm.profile_id
    where cm.company_id = c.id
      and cm.role = 'owner'
    order by case when cm.status = 'active' then 0 else 1 end, cm.created_at asc
    limit 1
  ) owner_row on true
  left join lateral (
    select
      count(*) as member_count,
      count(*) filter (where cm.status = 'active') as active_member_count,
      count(*) filter (where cm.status = 'pending') as pending_member_count,
      count(*) filter (where cm.status in ('disabled', 'left')) as disabled_member_count
    from public.company_memberships cm
    where cm.company_id = c.id
  ) member_counts on true
  order by
    case coalesce(cs.status, 'pending_review')
      when 'pending_review' then 0
      when 'active' then 1
      when 'trialing' then 2
      when 'suspended' then 3
      when 'canceled' then 4
      else 5
    end,
    coalesce(c.name, c.short_name, c.id);
end;
$$;

revoke all on function public.list_platform_companies() from public, anon;
grant execute on function public.list_platform_companies() to authenticated;

create or replace function public.list_platform_companies_v2()
returns table (
  company_id text,
  company_name text,
  short_name text,
  color text,
  label text,
  pill text,
  icon_key text,
  status text,
  plan_code text,
  amount_cents integer,
  currency text,
  owner_profile_id uuid,
  owner_name text,
  owner_email text,
  member_count integer,
  active_member_count integer,
  pending_member_count integer,
  disabled_member_count integer,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
begin
  if not app_private.is_quest_admin() then
    raise exception 'Platform admin access required';
  end if;

  return query
  select
    c.id as company_id,
    coalesce(c.name, c.short_name, c.id) as company_name,
    c.short_name,
    c.color,
    c.label,
    c.pill,
    coalesce(c.icon_key, 'home') as icon_key,
    coalesce(cs.terminal_status, cs.status, 'pending_review') as status,
    coalesce(cs.plan_code, 'manual') as plan_code,
    coalesce(cs.amount_cents, 0) as amount_cents,
    coalesce(cs.currency, 'usd') as currency,
    owner_row.profile_id as owner_profile_id,
    owner_row.full_name as owner_name,
    owner_row.email as owner_email,
    coalesce(member_counts.member_count, 0)::integer as member_count,
    coalesce(member_counts.active_member_count, 0)::integer as active_member_count,
    coalesce(member_counts.pending_member_count, 0)::integer as pending_member_count,
    coalesce(member_counts.disabled_member_count, 0)::integer as disabled_member_count,
    cs.trial_ends_at,
    cs.current_period_end,
    cs.grace_ends_at,
    coalesce(cs.created_at, c.created_at) as created_at,
    coalesce(cs.updated_at, c.created_at) as updated_at
  from public.companies c
  left join public.company_subscriptions cs on cs.company_id = c.id
  left join lateral (
    select cm.profile_id, p.full_name, p.email
    from public.company_memberships cm
    left join public.profiles p on p.id = cm.profile_id
    where cm.company_id = c.id
      and cm.role = 'owner'
    order by case when cm.status = 'active' then 0 else 1 end, cm.created_at asc
    limit 1
  ) owner_row on true
  left join lateral (
    select
      count(*) as member_count,
      count(*) filter (where cm.status = 'active') as active_member_count,
      count(*) filter (where cm.status = 'pending') as pending_member_count,
      count(*) filter (where cm.status in ('disabled', 'left')) as disabled_member_count
    from public.company_memberships cm
    where cm.company_id = c.id
  ) member_counts on true
  order by
    case coalesce(cs.terminal_status, cs.status, 'pending_review')
      when 'pending_review' then 0
      when 'active' then 1
      when 'trialing' then 2
      when 'suspended' then 3
      when 'archived' then 4
      when 'rejected' then 5
      when 'canceled' then 6
      else 7
    end,
    coalesce(c.name, c.short_name, c.id);
end;
$$;

revoke all on function public.list_platform_companies_v2() from public, anon;
grant execute on function public.list_platform_companies_v2() to authenticated;

create or replace function public.manage_platform_company(
  target_company_id text,
  platform_action text,
  review_note text default null
)
returns text
language plpgsql
security definer
set search_path = public, app_private, pg_temp
as $$
declare
  clean_company_id text := trim(coalesce(target_company_id, ''));
  clean_action text := lower(trim(coalesce(platform_action, '')));
  next_status text;
begin
  if not app_private.is_quest_admin() then
    raise exception 'Platform admin access required';
  end if;

  if clean_company_id = '' then
    raise exception 'Company is required';
  end if;

  if not exists (select 1 from public.companies c where c.id = clean_company_id) then
    raise exception 'Company not found';
  end if;

  next_status := case clean_action
    when 'approve' then 'active'
    when 'activate' then 'active'
    when 'reactivate' then 'active'
    when 'suspend' then 'suspended'
    when 'disable' then 'suspended'
    when 'archive' then 'archived'
    when 'delete' then 'archived'
    when 'cancel' then 'archived'
    when 'pending' then 'pending_review'
    else ''
  end;

  if next_status = '' then
    raise exception 'Unsupported platform action';
  end if;

  insert into public.company_subscriptions (
    company_id,
    status,
    terminal_status,
    plan_code,
    amount_cents,
    currency,
    current_period_end,
    updated_at
  )
  values (
    clean_company_id,
    case when next_status in ('archived', 'rejected', 'canceled') then 'canceled' else next_status end,
    case when next_status in ('archived', 'rejected', 'canceled') then next_status else null end,
    case when clean_company_id = 'lumen' then 'manual_platform' else 'quest_company_300' end,
    case when clean_company_id = 'lumen' then 0 else 30000 end,
    'usd',
    case when next_status = 'active' then now() + interval '30 days' else null end,
    now()
  )
  on conflict (company_id) do update
    set status = excluded.status,
        terminal_status = excluded.terminal_status,
        plan_code = coalesce(public.company_subscriptions.plan_code, excluded.plan_code),
        amount_cents = coalesce(public.company_subscriptions.amount_cents, excluded.amount_cents),
        currency = coalesce(public.company_subscriptions.currency, excluded.currency),
        current_period_end = case
          when excluded.status = 'active' then coalesce(public.company_subscriptions.current_period_end, excluded.current_period_end)
          else public.company_subscriptions.current_period_end
        end,
        updated_at = now();

  if next_status in ('suspended', 'archived', 'rejected', 'canceled') then
    update public.company_invites
    set status = case when next_status in ('archived', 'rejected', 'canceled') then 'revoked' else status end,
        updated_at = now()
    where company_id = clean_company_id
      and status = 'pending';

    update public.company_join_requests
    set status = case when next_status in ('archived', 'rejected', 'canceled') then 'canceled' else status end,
        reviewed_by = auth.uid(),
        updated_at = now()
    where company_id = clean_company_id
      and status = 'pending';
  end if;

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    clean_company_id,
    auth.uid(),
    'platform.company.' || clean_action,
    'company',
    clean_company_id,
    jsonb_build_object('action', clean_action, 'status', next_status, 'note', coalesce(review_note, ''))
  );

  return next_status;
end;
$$;

revoke all on function public.manage_platform_company(text, text, text) from public, anon;
grant execute on function public.manage_platform_company(text, text, text) to authenticated;

create or replace function public.apply_stripe_subscription_event(
  p_event_id text,
  p_event_created_at timestamptz,
  p_company_id text,
  p_customer_id text,
  p_subscription_id text,
  p_status text,
  p_current_period_end timestamptz,
  p_trial_ends_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
set statement_timeout = '15s'
as $$
declare
  v_role text := coalesce((select auth.role()), current_setting('request.jwt.claim.role', true), '');
  v_applied boolean;
begin
  if session_user <> 'postgres' and v_role <> 'service_role' then
    raise exception 'service role required';
  end if;
  if nullif(btrim(p_event_id), '') is null or p_event_created_at is null or nullif(btrim(p_company_id), '') is null then
    raise exception 'invalid Stripe subscription event';
  end if;
  if p_status is null or p_status not in ('trialing', 'active', 'past_due', 'grace', 'suspended', 'canceled', 'incomplete') then
    raise exception 'invalid subscription status';
  end if;

  insert into public.company_subscriptions as company_subscriptions (
    company_id, stripe_customer_id, stripe_subscription_id, status, terminal_status,
    plan_code, amount_cents, currency, current_period_end, trial_ends_at,
    stripe_event_id, stripe_event_created_at, updated_at
  ) values (
    p_company_id, nullif(p_customer_id, ''), nullif(p_subscription_id, ''), p_status,
    case when p_status = 'canceled' then 'canceled' else null end,
    'quest_company_300', 30000, 'usd', p_current_period_end, p_trial_ends_at,
    p_event_id, p_event_created_at, now()
  )
  on conflict (company_id) do update
    set stripe_customer_id = coalesce(excluded.stripe_customer_id, company_subscriptions.stripe_customer_id),
        stripe_subscription_id = coalesce(excluded.stripe_subscription_id, company_subscriptions.stripe_subscription_id),
        status = case
          when excluded.terminal_status is null
            and company_subscriptions.terminal_status in ('archived', 'rejected')
          then company_subscriptions.status
          else excluded.status
        end,
        terminal_status = case
          when company_subscriptions.terminal_status in ('archived', 'rejected')
          then company_subscriptions.terminal_status
          when excluded.terminal_status = 'canceled' then 'canceled'
          else excluded.terminal_status
        end,
        plan_code = excluded.plan_code,
        amount_cents = excluded.amount_cents,
        currency = excluded.currency,
        current_period_end = excluded.current_period_end,
        trial_ends_at = excluded.trial_ends_at,
        stripe_event_id = excluded.stripe_event_id,
        stripe_event_created_at = excluded.stripe_event_created_at,
        updated_at = now()
  where company_subscriptions.stripe_event_id is distinct from excluded.stripe_event_id
    and (
      company_subscriptions.stripe_event_created_at is null
      or company_subscriptions.stripe_event_created_at <= excluded.stripe_event_created_at
    )
  returning true into v_applied;

  return coalesce(v_applied, false);
end;
$$;

revoke execute on function public.apply_stripe_subscription_event(text, timestamptz, text, text, text, text, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.apply_stripe_subscription_event(text, timestamptz, text, text, text, text, timestamptz, timestamptz) to service_role;
