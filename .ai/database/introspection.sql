-- Quest HQ AI project-brain refresh queries.
-- Read-only catalog metadata only. Do not turn this file into a migration.
-- Do not add SELECT statements against application rows, auth.users, or storage.objects.

-- Public tables, columns, defaults, and RLS flags.
select
  c.table_schema,
  c.table_name,
  c.ordinal_position,
  c.column_name,
  c.data_type,
  c.udt_name,
  c.is_nullable,
  c.column_default,
  cls.relrowsecurity as rls_enabled
from information_schema.columns c
join pg_catalog.pg_class cls on cls.relname = c.table_name
join pg_catalog.pg_namespace n on n.oid = cls.relnamespace and n.nspname = c.table_schema
where c.table_schema = 'public'
order by c.table_name, c.ordinal_position;

-- Public primary and foreign-key metadata.
select
  tc.constraint_type,
  tc.constraint_name,
  kcu.table_name,
  kcu.column_name,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on kcu.constraint_schema = tc.constraint_schema
 and kcu.constraint_name = tc.constraint_name
left join information_schema.constraint_column_usage ccu
  on ccu.constraint_schema = tc.constraint_schema
 and ccu.constraint_name = tc.constraint_name
where tc.table_schema = 'public'
  and tc.constraint_type in ('PRIMARY KEY', 'FOREIGN KEY')
order by tc.constraint_type, kcu.table_name, tc.constraint_name, kcu.ordinal_position;

-- Policy names and role/command coverage. Expressions are intentionally omitted.
select tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Public function signatures, behavior flags, and visible execute grants.
select
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as returns,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname, pg_get_function_identity_arguments(p.oid);

-- Public trigger catalog.
select event_object_table, trigger_name, event_manipulation, action_timing, action_orientation
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name, event_manipulation;

-- Bucket settings only. Never query storage.objects for this project brain.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
order by id;

select extname, extversion
from pg_extension
order by extname;

select jobname, schedule, active, database
from cron.job
order by jobname;

