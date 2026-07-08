-- Let VIEW-ONLY workspace members comment on items.
--
-- Item comments live inside the workspace_builder_state.doc JSON, whose UPDATE
-- policy requires workspaces.MANAGE — so a user with only workspaces.view can't
-- persist a comment through the normal full-document save.
--
-- This SECURITY DEFINER function appends a single comment to one item (and bumps
-- its lastActivityAt), gated on the caller having workspaces.VIEW for the company.
-- It touches nothing else, so viewers can discuss records without being able to
-- edit the app's structure or data.

create or replace function public.wb_add_item_comment(
  p_company_id text,
  p_workspace_id text,
  p_app_id text,
  p_item_id text,
  p_comment jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_doc jsonb;
  v_ws_idx int;
  v_app_idx int;
  v_item_idx int;
  v_item_path text[];
  v_now text := to_char((now() at time zone 'utc'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
begin
  if not app_private.has_company_permission(p_company_id, 'workspaces.view') then
    raise exception 'not permitted to comment on this workspace';
  end if;

  select doc into v_doc from public.workspace_builder_state where company_id = p_company_id for update;
  if v_doc is null then raise exception 'workspace not found'; end if;

  select ord - 1 into v_ws_idx
    from jsonb_array_elements(coalesce(v_doc->'workspaces', '[]'::jsonb)) with ordinality t(w, ord)
    where w->>'id' = p_workspace_id limit 1;
  if v_ws_idx is null then raise exception 'workspace missing'; end if;

  select ord - 1 into v_app_idx
    from jsonb_array_elements(coalesce(v_doc#>array['workspaces', v_ws_idx::text, 'apps'], '[]'::jsonb)) with ordinality t(a, ord)
    where a->>'id' = p_app_id limit 1;
  if v_app_idx is null then raise exception 'app missing'; end if;

  select ord - 1 into v_item_idx
    from jsonb_array_elements(coalesce(v_doc#>array['workspaces', v_ws_idx::text, 'apps', v_app_idx::text, 'items'], '[]'::jsonb)) with ordinality t(i, ord)
    where i->>'id' = p_item_id limit 1;
  if v_item_idx is null then raise exception 'item missing'; end if;

  v_item_path := array['workspaces', v_ws_idx::text, 'apps', v_app_idx::text, 'items', v_item_idx::text];

  v_doc := jsonb_set(
    v_doc,
    v_item_path || array['comments'],
    coalesce(v_doc #> (v_item_path || array['comments']), '[]'::jsonb) || jsonb_build_array(p_comment),
    true
  );
  v_doc := jsonb_set(v_doc, v_item_path || array['lastActivityAt'], to_jsonb(v_now), true);

  update public.workspace_builder_state set doc = v_doc, updated_at = now() where company_id = p_company_id;
  return p_comment;
end;
$$;

revoke all on function public.wb_add_item_comment(text, text, text, text, jsonb) from public;
grant execute on function public.wb_add_item_comment(text, text, text, text, jsonb) to authenticated;
