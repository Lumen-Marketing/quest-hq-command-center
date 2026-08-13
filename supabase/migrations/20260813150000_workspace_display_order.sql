-- An explicit order for the workspace rail, so it can be dragged into the order the
-- business actually runs in.
--
-- The rail has always rendered in whatever order the rows arrived, which is creation order.
-- That is fine until a company's workspaces are stages -- Prospecting, Underwriting, Sales,
-- Production -- and the one created last is the one that belongs second.
--
-- COMPANY-WIDE, NOT PER PERSON. The order is a property of how the company works, so it
-- lives on the row rather than in each browser: everyone discussing "the third workspace"
-- means the same one, and a new device or a new hire inherits it. Only a company admin may
-- change it, which is why the RPC below checks is_company_admin rather than
-- is_workspace_admin -- reordering is a statement about the whole list, not about any one
-- workspace in it.
--
-- Backfilled to match what the rail renders TODAY -- default workspace first, then by name
-- -- so nobody's sidebar reshuffles the moment this ships. Creation order would have been
-- the obvious choice and is wrong for exactly that reason: it is not what people see.

alter table public.workspaces
  add column if not exists position integer not null default 0;

with ranked as (
  select id, row_number() over (
    partition by company_id
    order by (case when is_default then 0 else 1 end), lower(coalesce(name, '')), id
  ) as rn
  from public.workspaces
)
update public.workspaces w
set position = ranked.rn
from ranked
where ranked.id = w.id
  and w.position = 0;

create index if not exists workspaces_company_position_idx
  on public.workspaces (company_id, position);

comment on column public.workspaces.position is
  'Display order of the workspace rail within a company. Company-wide, set by an admin through reorder_operational_workspaces.';

-- One atomic call rather than an UPDATE per row from the browser. A half-applied reorder
-- leaves duplicate positions behind and the rail renders in an order nobody chose.
create or replace function public.reorder_operational_workspaces(
  target_company_id text,
  workspace_ids uuid[]
)
returns setof public.workspaces
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if not app_private.is_company_admin(target_company_id) then
    raise exception 'Company admin access required';
  end if;
  if workspace_ids is null or array_length(workspace_ids, 1) is null then
    raise exception 'No workspaces supplied';
  end if;

  -- Every id has to belong to the named company. Without this, an admin of company A could
  -- pass company B's workspace id and learn from the result whether it exists.
  if exists (
    select 1
    from unnest(workspace_ids) as wid
    where not exists (
      select 1 from public.workspaces w
      where w.id = wid and w.company_id = target_company_id
    )
  ) then
    raise exception 'Workspace does not belong to this company';
  end if;

  -- WITH ORDINALITY, not row_number() over () -- an empty OVER has no defined order, so the
  -- positions it hands out are not guaranteed to be the order the caller sent.
  update public.workspaces w
  set position = ordered.ord,
      updated_at = now()
  from unnest(workspace_ids) with ordinality as ordered(wid, ord)
  where w.id = ordered.wid
    and w.company_id = target_company_id;

  -- A workspace the caller left out keeps its old position. That can tie with a new one,
  -- which the created_at tiebreak below already resolves, so there is nothing to fix up.

  insert into public.audit_events (company_id, actor_profile_id, event_type, target_type, target_id, details)
  values (
    target_company_id, (select auth.uid()), 'workspace.reordered', 'company', target_company_id,
    jsonb_build_object('order', to_jsonb(workspace_ids))
  );

  return query
    select *
    from public.workspaces w
    where w.company_id = target_company_id
    order by w.position, w.created_at;
end;
$$;

revoke all on function public.reorder_operational_workspaces(text, uuid[]) from public, anon;
grant execute on function public.reorder_operational_workspaces(text, uuid[]) to authenticated;
