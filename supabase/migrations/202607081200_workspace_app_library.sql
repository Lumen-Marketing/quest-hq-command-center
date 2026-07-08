-- Shared "available apps" library for the Workspace builder.
--
-- The workspace_builder_state table is row-level-security gated so each user
-- can only read the docs for companies they belong to. The Add app > "Install
-- an available app" flow needs a SYSTEM-WIDE catalog of every app anyone has
-- built, so users can install a copy of another account's app structure.
--
-- This SECURITY DEFINER function bypasses that per-company RLS to return the
-- app STRUCTURE only — name, description, icon, color, fields and automations.
-- Records (`items`) are stripped out, so no company's actual data is exposed;
-- only the reusable template. Callable by any authenticated user.

create or replace function public.list_workspace_app_library()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(entry), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'company_id', s.company_id,
      'company_name', coalesce(c.name, s.company_id),
      'workspace_name', ws->>'name',
      'app', (a - 'items')
    ) as entry
    from public.workspace_builder_state s
    left join public.companies c on c.id::text = s.company_id::text
    cross join lateral jsonb_array_elements(coalesce(s.doc->'workspaces', '[]'::jsonb)) as ws
    cross join lateral jsonb_array_elements(coalesce(ws->'apps', '[]'::jsonb)) as a
    where coalesce(a->>'name', '') <> ''
      and coalesce(a->>'shared', 'false') = 'true'
  ) t;
$$;

revoke all on function public.list_workspace_app_library() from public;
grant execute on function public.list_workspace_app_library() to authenticated;
