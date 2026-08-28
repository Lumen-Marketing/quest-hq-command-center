-- Re-run of the wb_records backfill, because the first one matched nothing.
--
-- 20260828025112_wb_records_table.sql filtered the document's workspace id as a bare uuid. The
-- builder does not store it that way -- it addresses workspaces as `ws-<uuid>` (built in
-- src/workspace/builder-core.js, stripped by ops-workspace-id.js). Every row failed the filter,
-- so the migration copied zero of the 96 records and still reported success. That is the exact
-- shape of failure worth leaving a note about: a backfill that silently does nothing looks
-- identical to a backfill with nothing to do.
--
-- The join below is the same two rules the client uses -- `ws-<uuid>` against a real workspace
-- in the same company, and the legacy `ws-<companyId>` form meaning that company's default
-- workspace -- and it joins rather than casts, so a malformed id skips the row instead of
-- raising. The original file has been corrected too, so a fresh environment gets it right the
-- first time and this migration is a no-op there.
--
-- Records under a builder workspace with no real counterpart are deliberately NOT copied.
-- `allowedBuilderIds` in builder-core.js already filters them out, so they are unreachable in
-- the product; importing them would resurrect invisible data into a live workspace. On
-- 2026-08-28 that was 11 of 96 records, all under one deleted workspace in `lumen`.

insert into public.wb_records (id, company_id, workspace_id, app_id, data, created_by, created_at, updated_at)
select
  i->>'id',
  s.company_id,
  ws.id,
  a->>'id',
  i,
  case when (i->>'createdBy') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       then (i->>'createdBy')::uuid else null end,
  coalesce((i->>'createdAt')::timestamptz, now()),
  coalesce((i->>'updatedAt')::timestamptz, (i->>'createdAt')::timestamptz, now())
from public.workspace_builder_state s
cross join lateral jsonb_array_elements(coalesce(s.doc->'workspaces', '[]'::jsonb)) w
cross join lateral jsonb_array_elements(coalesce(w->'apps', '[]'::jsonb)) a
cross join lateral jsonb_array_elements(coalesce(a->'items', '[]'::jsonb)) i
join public.workspaces ws
  on ws.company_id = s.company_id
 and (
   ws.id::text = substring(w->>'id' from 4)
   or (substring(w->>'id' from 4) = s.company_id and ws.is_default and ws.status = 'active')
 )
where i->>'id' is not null
on conflict (id) do nothing;
