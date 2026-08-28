-- Rebuild .ai/database/snapshot.json in one query.
--
-- WHY THIS EXISTS: check-tenancy-matrix.mjs refuses to certify the tenant matrix when a
-- migration is dated after the snapshot's captured_at, because a snapshot that predates the
-- schema cannot describe it -- and a matrix reported green over a stale snapshot is a false
-- assurance (see .ai/decisions.md, 2026-08-28). That gate makes refreshing the snapshot a
-- routine step after every migration, so it needs to be one command rather than a dozen.
--
-- introspection.sql next to this file returns the same catalog as separate result sets, which
-- is the readable form for looking something up by hand. This returns the assembled document,
-- which is the form the repository actually stores.
--
-- HOW TO USE
--   1. Run this against the production project. It is strictly read-only catalog metadata.
--   2. Take the single `snapshot` value and write it to .ai/database/snapshot.json,
--      pretty-printed with an indent of 1 to match the committed formatting.
--   3. Update .ai/manifest.json: repository.latest_migration, live.supabase_latest_migration,
--      live.supabase_verified_at, generated_at.
--   4. Run npm run ai:check && npm run tenancy:check.
--
-- The shape below is load-bearing. check-tenancy-matrix.mjs reads tables[].rls_enabled,
-- tables[].columns[].name, tables[].primary_key (empty array means a view) and
-- policies[].table/.command; ai-context-lib.mjs validates the key names of every catalog array.
-- Changing a key here silently changes what those checks can see, so keep it in step with them.
--
-- NEVER add a SELECT against application rows, auth.users or storage.objects. This document is
-- committed to the repository and must contain catalog metadata only.

with cols as (
  select c.table_name, c.table_schema, cls.relrowsecurity as rls_enabled,
         jsonb_agg(jsonb_build_object(
           'name', c.column_name, 'default', c.column_default, 'nullable', (c.is_nullable = 'YES'),
           'position', c.ordinal_position, 'udt_name', c.udt_name, 'data_type', c.data_type
         ) order by c.ordinal_position) as columns
  from information_schema.columns c
  join pg_catalog.pg_class cls on cls.relname = c.table_name
  join pg_catalog.pg_namespace n on n.oid = cls.relnamespace and n.nspname = c.table_schema
  where c.table_schema = 'public'
  group by c.table_name, c.table_schema, cls.relrowsecurity
),
pk as (
  select kcu.table_name, jsonb_agg(kcu.column_name order by kcu.ordinal_position) as key_cols
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on kcu.constraint_schema = tc.constraint_schema and kcu.constraint_name = tc.constraint_name
  where tc.table_schema = 'public' and tc.constraint_type = 'PRIMARY KEY'
  group by kcu.table_name
),
fks as (
  select jsonb_agg(jsonb_build_object(
           'name', tc.constraint_name, 'from_table', kcu.table_name, 'from_column', kcu.column_name,
           'to_table', ccu.table_name, 'to_column', ccu.column_name,
           'delete_rule', rc.delete_rule, 'update_rule', rc.update_rule
         ) order by kcu.table_name, tc.constraint_name, kcu.ordinal_position) as j
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on kcu.constraint_schema = tc.constraint_schema and kcu.constraint_name = tc.constraint_name
  join information_schema.referential_constraints rc
    on rc.constraint_schema = tc.constraint_schema and rc.constraint_name = tc.constraint_name
  join information_schema.constraint_column_usage ccu
    on ccu.constraint_schema = tc.constraint_schema and ccu.constraint_name = tc.constraint_name
  where tc.table_schema = 'public' and tc.constraint_type = 'FOREIGN KEY'
)
select jsonb_pretty(jsonb_build_object(
  'scope', 'Catalog metadata only. Contains no production table rows, auth user records, object paths, or credentials.',
  -- These five are project facts rather than catalog facts; confirm them against the Supabase
  -- project settings if the project is ever moved or upgraded.
  'source', jsonb_build_object('region', 'us-west-1', 'status', 'ACTIVE_HEALTHY',
                               'project_ref', 'rqundirizvojpzhljtdn', 'postgres_engine', '17',
                               'release_channel', 'ga', 'postgres_version', '17.6'),
  'tables', (select jsonb_agg(jsonb_build_object(
                      'name', c.table_name, 'schema', c.table_schema, 'columns', c.columns,
                      'primary_key', coalesce(pk.key_cols, '[]'::jsonb), 'rls_enabled', c.rls_enabled)
                    order by c.table_name)
             from cols c left join pk on pk.table_name = c.table_name),
  'buckets', (select jsonb_agg(jsonb_build_object(
                       'id', id, 'name', name, 'public', public,
                       'file_size_limit', file_size_limit, 'allowed_mime_types', to_jsonb(allowed_mime_types))
                     order by id)
              from storage.buckets),
  -- Policy EXPRESSIONS are deliberately omitted; only names, roles and commands cross. The
  -- predicates are reviewed in migrations and proved by the live tenant probe, not stored here.
  'policies', (select jsonb_agg(jsonb_build_object(
                        'name', policyname, 'roles', roles::text, 'table', tablename,
                        'command', cmd, 'permissive', permissive)
                      order by tablename, policyname)
               from pg_policies where schemaname = 'public'),
  'triggers', (select jsonb_agg(jsonb_build_object(
                        'name', trigger_name, 'event', event_manipulation, 'table', event_object_table,
                        'timing', action_timing, 'orientation', action_orientation)
                      order by event_object_table, trigger_name, event_manipulation)
               from information_schema.triggers where trigger_schema = 'public'),
  'cron_jobs', coalesce((select jsonb_agg(jsonb_build_object(
                                  'name', jobname, 'active', active, 'database', database, 'schedule', schedule)
                                order by jobname)
                         from cron.job), '[]'::jsonb),
  'functions', (select jsonb_agg(jsonb_build_object(
                         'name', p.proname, 'returns', pg_get_function_result(p.oid),
                         'arguments', pg_get_function_identity_arguments(p.oid),
                         'volatility', p.provolatile::text,
                         'anon_execute', has_function_privilege('anon', p.oid, 'EXECUTE'),
                         'security_definer', p.prosecdef,
                         'service_role_execute', has_function_privilege('service_role', p.oid, 'EXECUTE'),
                         'authenticated_execute', has_function_privilege('authenticated', p.oid, 'EXECUTE'))
                       order by p.proname, pg_get_function_identity_arguments(p.oid))
                from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'),
  'extensions', (select jsonb_agg(jsonb_build_object('name', extname, 'version', extversion) order by extname)
                 from pg_extension),
  'migrations', (select jsonb_agg(jsonb_build_object('version', version, 'name', name) order by version)
                 from supabase_migrations.schema_migrations),
  'captured_at', now(),
  'relationships', (select j from fks),
  'schema_version', 1
)) as snapshot;
