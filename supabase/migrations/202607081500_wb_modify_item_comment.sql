-- Let a user edit or delete their OWN item comment, even with only
-- workspaces.view (comments live in the manage-gated workspace doc).
--
-- Authorship is enforced server-side: the target comment's authorId must equal
-- auth.uid() (profiles.id == the auth user id in this project). A viewer can
-- therefore manage only the comments they wrote — nothing else in the doc.

create or replace function public.wb_modify_item_comment(
  p_company_id text,
  p_workspace_id text,
  p_app_id text,
  p_item_id text,
  p_comment_id text,
  p_action text,
  p_text text
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
  v_comments jsonb;
  v_author text;
  v_new jsonb;
  v_now text := to_char((now() at time zone 'utc'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
begin
  if not app_private.has_company_permission(p_company_id, 'workspaces.view') then
    raise exception 'not permitted';
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
  v_comments := coalesce(v_doc #> (v_item_path || array['comments']), '[]'::jsonb);

  select c->>'authorId' into v_author
    from jsonb_array_elements(v_comments) c where c->>'id' = p_comment_id limit 1;
  if v_author is null then raise exception 'comment not found'; end if;
  if v_author is distinct from auth.uid()::text then raise exception 'not your comment'; end if;

  if p_action = 'delete' then
    select coalesce(jsonb_agg(c), '[]'::jsonb) into v_new
      from jsonb_array_elements(v_comments) c where c->>'id' <> p_comment_id;
  elsif p_action = 'edit' then
    select coalesce(jsonb_agg(
        case when c->>'id' = p_comment_id
          then jsonb_set(jsonb_set(c, '{text}', to_jsonb(p_text)), '{editedAt}', to_jsonb(v_now))
          else c end
      ), '[]'::jsonb) into v_new
      from jsonb_array_elements(v_comments) c;
  else
    raise exception 'bad action';
  end if;

  v_doc := jsonb_set(v_doc, v_item_path || array['comments'], v_new, true);
  update public.workspace_builder_state set doc = v_doc, updated_at = now() where company_id = p_company_id;
  return v_new;
end;
$$;

revoke all on function public.wb_modify_item_comment(text, text, text, text, text, text, text) from public;
grant execute on function public.wb_modify_item_comment(text, text, text, text, text, text, text) to authenticated;
