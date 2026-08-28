-- A rate limit that survives a cold start.
--
-- api/_lib/rate-limit.js keeps its counters in a Map in module scope. On Vercel that means the
-- real ceiling is the configured limit MULTIPLIED by the number of live lambda instances, and
-- every cold start resets it to zero. api/wb-intake-open.js already says so in a comment:
-- "this limiter is in-memory and per serverless instance, so it does not survive a cold start
-- and cannot be relied on alone."
--
-- That is tolerable for throttling chatty clients. It is not tolerable as the thing standing
-- between an attacker and a portal password, an invite token, a proposal token or an intake
-- passcode, which is what it currently is on five endpoints.
--
-- This table is the durable half. The in-memory limiter stays in front of it as a free local
-- pre-filter, so the database is only consulted by requests that already passed locally --
-- the cost lands on attackers rather than on ordinary traffic.
--
-- PRIVACY: `bucket` is a SHA-256 of "namespace:client-ip", hashed in the application before it
-- ever reaches the database. No IP address is stored here. The hash is enough to count against,
-- and useless for identifying anyone.

create table if not exists public.api_rate_limits (
  bucket text primary key,
  count integer not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

comment on table public.api_rate_limits is
  'Durable per-window request counters for secret-guessing endpoints. Bucket is a salted-by-namespace SHA-256 of the client IP; no raw address is stored. Service-role only.';

create index if not exists api_rate_limits_reset_at_idx on public.api_rate_limits (reset_at);

-- Server-only ledger, the same shape as wo_counters and checkin_log: RLS on with no policies,
-- so no browser role can reach it whatever its grants say.
alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from anon, authenticated;

-- One statement, so concurrent requests cannot both read the same count and both write the
-- same increment -- the read-modify-write bug that made the intake passcode lockout
-- ineffective. The window rolls over inside the same statement when reset_at has passed.
create or replace function public.consume_rate_limit(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_count integer;
  v_reset timestamptz;
begin
  if p_limit is null or p_limit <= 0 or p_window_seconds is null or p_window_seconds <= 0 then
    raise exception 'consume_rate_limit requires a positive limit and window';
  end if;
  if p_bucket is null or length(p_bucket) = 0 then
    raise exception 'consume_rate_limit requires a bucket';
  end if;

  insert into public.api_rate_limits as t (bucket, count, reset_at, updated_at)
  values (left(p_bucket, 200), 1, v_now + make_interval(secs => p_window_seconds), v_now)
  on conflict (bucket) do update
    set count = case when t.reset_at <= v_now then 1 else t.count + 1 end,
        reset_at = case when t.reset_at <= v_now
                        then v_now + make_interval(secs => p_window_seconds)
                        else t.reset_at end,
        updated_at = v_now
  returning t.count, t.reset_at into v_count, v_reset;

  -- Opportunistic cleanup. Expired rows are dead weight and there is no other sweeper; doing
  -- it on roughly one call in a hundred keeps the table small without a cron entry, and the
  -- LIMIT keeps any single request's share of the work bounded.
  if random() < 0.01 then
    delete from public.api_rate_limits
    where bucket in (
      select bucket from public.api_rate_limits
      where reset_at < v_now - interval '1 hour'
      limit 500
    );
  end if;

  return jsonb_build_object(
    'allowed', v_count <= p_limit,
    'count', v_count,
    'limit', p_limit,
    'remaining', greatest(0, p_limit - v_count),
    'reset_at', v_reset,
    'retry_after_seconds', greatest(1, ceil(extract(epoch from (v_reset - v_now)))::integer)
  );
end;
$$;

-- Reachable only by the server functions that own these endpoints. A browser role calling this
-- could inflate somebody else's counter, so no browser role may call it at all.
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
