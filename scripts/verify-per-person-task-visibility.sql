-- Run in the Supabase SQL editor AFTER applying
-- 202607241200_per_person_task_visibility.sql. Every ok must be true.

-- 1. Read policy now filters per person (references current_member_id).
select 'read policy filters per person' as check,
       exists(select 1 from pg_policies
              where schemaname='public' and tablename='tasks'
                and policyname='tasks workspace read'
                and coalesce(qual,'') like '%current_member_id%') as ok;

-- 2. Update policy now filters per person.
select 'update policy filters per person' as check,
       exists(select 1 from pg_policies
              where schemaname='public' and tablename='tasks'
                and policyname='tasks workspace update'
                and coalesce(qual,'') like '%current_member_id%'
                and coalesce(with_check,'') like '%current_member_id%') as ok;

-- 3. Read + update still carry the permission gate (never widened).
select 'read+update keep has_workspace_permission gate' as check,
       count(*) = 2 as ok
from pg_policies
where schemaname='public' and tablename='tasks'
  and policyname in ('tasks workspace read','tasks workspace update')
  and coalesce(qual,'') like '%has_workspace_permission%';

-- 4. Insert + delete are UNCHANGED (still manage-gated, no per-person filter).
select 'insert+delete unchanged (manage-only, no per-person filter)' as check,
       count(*) = 2 as ok
from pg_policies
where schemaname='public' and tablename='tasks'
  and policyname in ('tasks workspace insert','tasks workspace delete')
  and coalesce(qual,'') || coalesce(with_check,'') like '%tasks.manage%'
  and coalesce(qual,'') || coalesce(with_check,'') not like '%current_member_id%';

-- 5. All four task policies still present.
select 'four tasks workspace policies present' as check,
       count(*) = 4 as ok
from pg_policies
where schemaname='public' and tablename='tasks'
  and policyname like 'tasks workspace %';
