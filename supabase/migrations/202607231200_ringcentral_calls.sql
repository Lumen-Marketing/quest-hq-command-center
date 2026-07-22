-- RingCentral call dashboard.
--
-- Company-scoped on purpose: a RingCentral account belongs to the whole company
-- and its calls do not belong to any single operational workspace, so there is
-- no workspace_id here. Every table is written by the service role only; the
-- browser reads and never writes.

-- ============================================================
-- A. Tables
-- ============================================================

-- Which companies are connected, and where their credentials live. The JWT
-- itself never enters the database: credential_key names an environment
-- variable. Adding per-tenant OAuth later means adding columns here rather than
-- reworking the sync.
create table if not exists public.ringcentral_accounts (
  company_id text primary key references public.companies (id) on delete cascade,
  rc_account_id text not null default '~',
  credential_source text not null default 'env',
  credential_key text not null default 'RINGCENTRAL_JWT',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ringcentral_accounts_status_check check (status in ('active', 'paused')),
  constraint ringcentral_accounts_source_check check (credential_source in ('env'))
);

-- The extension directory, refreshed by the sync job. This is what maps a call
-- to a human name and what matches a logged-in member to their own extension.
create table if not exists public.ringcentral_extensions (
  company_id text not null references public.companies (id) on delete cascade,
  extension_id text not null,
  extension_number text not null default '',
  name text not null default '',
  email text not null default '',
  status text not null default '',
  updated_at timestamptz not null default now(),
  primary key (company_id, extension_id)
);

-- One row per call. Extension name and email are denormalized at write time so
-- history survives a rename or a person leaving.
create table if not exists public.ringcentral_calls (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies (id) on delete cascade,
  call_id text not null,
  session_id text not null default '',
  started_at timestamptz not null,
  direction text not null default '',
  from_number text not null default '',
  from_name text not null default '',
  to_number text not null default '',
  to_name text not null default '',
  extension_id text not null default '',
  extension_number text not null default '',
  extension_name text not null default '',
  extension_email text not null default '',
  duration_seconds integer not null default 0,
  result text not null default '',
  is_conversation boolean not null default false,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ringcentral_calls_company_call_key unique (company_id, call_id)
);

create index if not exists ringcentral_calls_company_started_idx
  on public.ringcentral_calls (company_id, started_at desc);
create index if not exists ringcentral_calls_company_email_idx
  on public.ringcentral_calls (company_id, extension_email);
create index if not exists ringcentral_calls_conversation_idx
  on public.ringcentral_calls (company_id, started_at desc)
  where is_conversation;

-- Current status per extension. status_since is the memory that makes the
-- ticking duration possible: RingCentral reports what a status IS, never how
-- long it has been held.
create table if not exists public.ringcentral_presence (
  company_id text not null references public.companies (id) on delete cascade,
  extension_id text not null,
  display_status text not null default 'available',
  status_since timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, extension_id)
);

-- Sync health. There is no sync token: the job re-fetches a rolling window and
-- upserts, so a missed run is covered by the next one.
create table if not exists public.ringcentral_sync_state (
  company_id text primary key references public.companies (id) on delete cascade,
  last_sync_at timestamptz,
  backfilled_through timestamptz,
  consecutive_failures integer not null default 0,
  last_error text not null default '',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- B. Row level security
-- ============================================================
-- No policy below permits insert, update, or delete. Writes happen through the
-- service role in the Vercel functions, which bypasses RLS.

alter table public.ringcentral_accounts
  enable row level security;
alter table public.ringcentral_extensions
  enable row level security;
alter table public.ringcentral_calls
  enable row level security;
alter table public.ringcentral_presence
  enable row level security;
alter table public.ringcentral_sync_state
  enable row level security;

drop policy if exists "company admins read accounts" on public.ringcentral_accounts;
create policy "company admins read accounts" on public.ringcentral_accounts
for select to authenticated
using (app_private.is_quest_admin() or app_private.is_company_admin(company_id));

drop policy if exists "company admins read extensions" on public.ringcentral_extensions;
create policy "company admins read extensions" on public.ringcentral_extensions
for select to authenticated
using (app_private.is_quest_admin() or app_private.is_company_admin(company_id));

drop policy if exists "company admins read presence" on public.ringcentral_presence;
create policy "company admins read presence" on public.ringcentral_presence
for select to authenticated
using (app_private.is_quest_admin() or app_private.is_company_admin(company_id));

-- Admins see the company; everyone else sees only the calls handled by the
-- extension carrying their own login email.
drop policy if exists "members read own calls" on public.ringcentral_calls;
create policy "members read own calls" on public.ringcentral_calls
for select to authenticated
using (
  app_private.is_quest_admin()
  or app_private.is_company_admin(company_id)
  or (
    app_private.is_company_member(company_id)
    and extension_email <> ''
    and extension_email = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

-- Members need this to render the "synced N minutes ago" stamp.
drop policy if exists "members read sync state" on public.ringcentral_sync_state;
create policy "members read sync state" on public.ringcentral_sync_state
for select to authenticated
using (app_private.is_quest_admin() or app_private.is_company_member(company_id));

-- ============================================================
-- C. Grants
-- ============================================================
-- Supabase's 2026 API hardening does not expose new tables automatically.

grant select on public.ringcentral_accounts to authenticated;
grant select on public.ringcentral_extensions to authenticated;
grant select on public.ringcentral_calls to authenticated;
grant select on public.ringcentral_presence to authenticated;
grant select on public.ringcentral_sync_state to authenticated;

revoke all on public.ringcentral_accounts from anon;
revoke all on public.ringcentral_extensions from anon;
revoke all on public.ringcentral_calls from anon;
revoke all on public.ringcentral_presence from anon;
revoke all on public.ringcentral_sync_state from anon;

-- ============================================================
-- D. Aggregate
-- ============================================================
-- security invoker so the policy above does the filtering: an admin gets the
-- whole team, a member gets one row.

create or replace function public.ringcentral_conversation_stats(
  p_company_id text,
  p_from timestamptz,
  p_to timestamptz
)
returns table (
  extension_id text,
  extension_number text,
  extension_name text,
  total_calls bigint,
  conversations bigint
)
language sql
security invoker
stable
set search_path = public, pg_temp
as $$
  select
    c.extension_id,
    max(c.extension_number) as extension_number,
    max(c.extension_name) as extension_name,
    count(*)::bigint as total_calls,
    count(*) filter (where c.is_conversation)::bigint as conversations
  from public.ringcentral_calls c
  where c.company_id = p_company_id
    and c.started_at >= p_from
    and c.started_at < p_to
  group by c.extension_id
  order by conversations desc, total_calls desc;
$$;

revoke all on function public.ringcentral_conversation_stats(text, timestamptz, timestamptz) from public, anon;
grant execute on function public.ringcentral_conversation_stats(text, timestamptz, timestamptz) to authenticated;

-- ============================================================
-- E. Register the plugin
-- ============================================================
-- The array below is the LIVE allowlist with 'calls' appended, read back from
-- pg_constraint rather than copied from the newest migration in this repository.
-- Those two disagree: 'tasks' was added live by work that is applied to the
-- database but still on an unmerged branch, so a copy taken from
-- 20260701170157_price_book_plugin_allowlist.sql is missing it. Applying that
-- stale copy fails outright against existing rows — which is how this was
-- caught. Always re-read the live constraint before touching this.

alter table public.company_plugins
  drop constraint if exists company_plugins_known_plugin_check;

alter table public.company_plugins
  add constraint company_plugins_known_plugin_check check (
    plugin_id in (
      'crm',
      'crm_2',
      'underwriter',
      'files',
      'client_portal',
      'workspace_builder',
      'price_book',
      'forms',
      'finance',
      'messages',
      'calendar',
      'time_clock',
      'approvals',
      'reporting',
      'tasks',
      'calls'
    )
  );

-- The Calls module is gated on the existing 'team.view' permission rather than
-- a new one, which would need seeding into role_permissions for every role
-- before anyone could open it. But team.view previously resolved to the
-- 'reporting' plugin alone, so a workspace with Calls installed and Reporting
-- uninstalled would have been locked out of its own module. Every other branch
-- below is reproduced verbatim from the price-book allowlist migration.
create or replace function app_private.permission_plugin_ids(permission text)
returns text[]
language sql
stable
set search_path = public, app_private, pg_temp
as $$
  select case
    when permission like 'crm.%' then array['crm', 'crm_2']::text[]
    when permission like 'underwriter.%' then array['underwriter']::text[]
    when permission like 'files.%' then array['files']::text[]
    when permission like 'client_portals.%' then array['client_portal']::text[]
    when permission like 'workspaces.%' then array['workspace_builder']::text[]
    when permission like 'price_book.%' then array['price_book']::text[]
    when permission like 'forms.%' then array['forms']::text[]
    when permission like 'finance.%' then array['finance']::text[]
    when permission like 'messages.%' then array['messages']::text[]
    when permission like 'calendar.%' then array['calendar']::text[]
    when permission in ('time.track', 'clock.manage') then array['time_clock']::text[]
    when permission like 'approvals.%' then array['approvals']::text[]
    when permission = 'team.view' then array['reporting', 'calls']::text[]
    else array[]::text[]
  end;
$$;

revoke all on function app_private.permission_plugin_ids(text) from public, anon;
grant execute on function app_private.permission_plugin_ids(text) to authenticated;
