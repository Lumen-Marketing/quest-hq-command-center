-- Recover the legacy app.trash entries that the first wb_records bin backfill could not adopt
-- because the global record id had already been used by a different snapshot. Nothing here
-- overwrites, moves, or deletes an existing wb_records row; distinct legacy snapshots receive
-- a new stable recovered id and stay binned for at least another 30 days.

create table if not exists public.wb_legacy_trash_recovery_map (
  fingerprint text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  app_id text not null,
  source_id text not null,
  payload_deleted_at timestamptz not null,
  source_deleted_by text,
  source_purge_after text,
  recovered_record_id text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists wb_legacy_trash_recovery_map_company_id_idx
  on public.wb_legacy_trash_recovery_map (company_id);
create index if not exists wb_legacy_trash_recovery_map_workspace_id_idx
  on public.wb_legacy_trash_recovery_map (workspace_id);

comment on table public.wb_legacy_trash_recovery_map is
  'Service-only idempotency and provenance map for distinct legacy App Builder trash snapshots. Stores identifiers, timestamp, and a payload fingerprint, never the payload itself.';

alter table public.wb_legacy_trash_recovery_map enable row level security;
revoke all on table public.wb_legacy_trash_recovery_map from public, anon, authenticated;
grant select, insert on table public.wb_legacy_trash_recovery_map to service_role;

-- Legacy JSON timestamps are untrusted historic browser values. A malformed value must leave
-- that entry in the document, never abort recovery for every company.
create or replace function app_private.try_legacy_wb_trash_timestamptz(p_value text)
returns timestamptz
language plpgsql
stable
set search_path = ''
set timezone = 'UTC'
as $$
begin
  if nullif(btrim(p_value), '') is null then return null; end if;
  begin
    return p_value::timestamptz;
  exception when others then
    return null;
  end;
end;
$$;

revoke all on function app_private.try_legacy_wb_trash_timestamptz(text) from public, anon, authenticated;
grant execute on function app_private.try_legacy_wb_trash_timestamptz(text) to service_role;

create or replace function public.reconcile_legacy_wb_trash_snapshots(
  p_company_id text default null,
  p_document_limit integer default 100,
  p_dry_run boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
set timezone = 'UTC'
set statement_timeout = '30s'
as $$
declare
  v_role text := coalesce((select auth.role()), current_setting('request.jwt.claim.role', true), '');
  v_limit integer := least(greatest(coalesce(p_document_limit, 100), 1), 1000);
  v_state record;
  v_workspace jsonb;
  v_workspace_ordinal bigint;
  v_app jsonb;
  v_app_ordinal bigint;
  v_entry jsonb;
  v_doc jsonb;
  v_rebuilt_trash jsonb;
  v_workspace_id uuid;
  v_builder_workspace_id text;
  v_workspace_token text;
  v_app_id text;
  v_source_id text;
  v_source_deleted_by text;
  v_source_purge_after text;
  v_payload jsonb;
  v_deleted_at timestamptz;
  v_created_at timestamptz;
  v_updated_at timestamptz;
  v_deleted_by uuid;
  v_fingerprint text;
  v_recovered_id text;
  v_exact boolean;
  v_mapped boolean;
  v_mapping_recorded boolean;
  v_documents_locked integer := 0;
  v_entries_examined integer := 0;
  v_exact_removed integer := 0;
  v_recovered integer := 0;
  v_mapped_removed integer := 0;
  v_unresolved integer := 0;
begin
  if session_user <> 'postgres' and v_role <> 'service_role' then
    raise exception 'service role required';
  end if;

  -- Lock each whole company document before examining or editing its nested arrays. A stale
  -- client can still later resave legacy trash, so this routine is deliberately reusable; it
  -- never relies on a one-time destructive document rewrite or a client-side trigger.
  for v_state in
    select s.company_id, s.doc
      from public.workspace_builder_state s
     where p_company_id is null or s.company_id = p_company_id
     order by s.company_id
     limit v_limit
     for update
  loop
    v_documents_locked := v_documents_locked + 1;
    v_doc := v_state.doc;

    for v_workspace, v_workspace_ordinal in
      select value, ordinality
        from jsonb_array_elements(case when jsonb_typeof(v_state.doc->'workspaces') = 'array' then v_state.doc->'workspaces' else '[]'::jsonb end)
             with ordinality as workspaces(value, ordinality)
    loop
      v_builder_workspace_id := nullif(btrim(v_workspace->>'id'), '');
      v_workspace_token := regexp_replace(coalesce(v_builder_workspace_id, ''), '^ws-', '');
      v_workspace_id := null;
      if v_workspace_token <> '' then
        select w.id into v_workspace_id
          from public.workspaces w
         where w.company_id = v_state.company_id
           and (w.id::text = v_workspace_token or (v_workspace_token = v_state.company_id and w.is_default))
         order by case when w.id::text = v_workspace_token then 0 else 1 end
         limit 1;
      end if;

      for v_app, v_app_ordinal in
        select value, ordinality
          from jsonb_array_elements(case when jsonb_typeof(v_workspace->'apps') = 'array' then v_workspace->'apps' else '[]'::jsonb end)
               with ordinality as apps(value, ordinality)
      loop
        -- Linked apps do not own their rows. Malformed arrays and unresolved workspaces are
        -- preserved byte-for-byte in the document instead of being guessed into a tenant.
        if (
             v_app ? 'linked'
             and coalesce(v_app->'linked', 'null'::jsonb) not in ('null'::jsonb, 'false'::jsonb, '""'::jsonb, '0'::jsonb)
           )
           or jsonb_typeof(v_app->'trash') <> 'array'
           or v_workspace_id is null
           or nullif(btrim(v_app->>'id'), '') is null then
          continue;
        end if;
        v_app_id := btrim(v_app->>'id');
        v_rebuilt_trash := '[]'::jsonb;

        for v_entry in select value from jsonb_array_elements(v_app->'trash') as entries(value)
        loop
          v_entries_examined := v_entries_examined + 1;
          -- Preserve by default; only an exact existing row, a verified mapped recovered row,
          -- or a successful new recovered-row insert is allowed to remove this entry.
          if jsonb_typeof(v_entry) <> 'object' then
            v_rebuilt_trash := v_rebuilt_trash || jsonb_build_array(v_entry);
            v_unresolved := v_unresolved + 1;
            continue;
          end if;

          v_source_id := nullif(btrim(v_entry->>'id'), '');
          v_source_deleted_by := v_entry->>'deletedBy';
          v_source_purge_after := v_entry->>'purgeAfter';
          v_deleted_at := app_private.try_legacy_wb_trash_timestamptz(v_entry->>'deletedAt');
          if v_source_id is null or v_deleted_at is null then
            v_rebuilt_trash := v_rebuilt_trash || jsonb_build_array(v_entry);
            v_unresolved := v_unresolved + 1;
            continue;
          end if;

          -- These stamps belong in promoted columns. `unmigrated` is a browser-only marker
          -- from the first migration and must not make an otherwise exact row look distinct.
          v_payload := v_entry - 'deletedAt' - 'deletedBy' - 'purgeAfter' - 'unmigrated';
          select exists (
            select 1
              from public.wb_records r
             where r.id = v_source_id
               and r.company_id = v_state.company_id
               and r.workspace_id = v_workspace_id
               and r.app_id = v_app_id
               and r.data = v_payload
               and r.deleted_at = v_deleted_at
          ) into v_exact;

          if v_exact then
            v_exact_removed := v_exact_removed + 1;
            if p_dry_run then v_rebuilt_trash := v_rebuilt_trash || jsonb_build_array(v_entry); end if;
            continue;
          end if;

          v_fingerprint := md5(jsonb_build_array(
            v_state.company_id,
            v_workspace_id::text,
            v_app_id,
            v_source_id,
            v_payload,
            extract(epoch from v_deleted_at)
          )::text);
          select exists (
            select 1 from public.wb_legacy_trash_recovery_map m where m.fingerprint = v_fingerprint
          ) into v_mapping_recorded;
          select exists (
            select 1
              from public.wb_legacy_trash_recovery_map m
              join public.wb_records r on r.id = m.recovered_record_id
             where m.fingerprint = v_fingerprint
               and m.company_id = v_state.company_id
               and m.workspace_id = v_workspace_id
               and m.app_id = v_app_id
               and m.source_id = v_source_id
               and m.payload_deleted_at = v_deleted_at
               and r.company_id = v_state.company_id
               and r.workspace_id = v_workspace_id
               and r.app_id = v_app_id
               and r.deleted_at = v_deleted_at
               and r.data = (v_payload || jsonb_build_object('id', m.recovered_record_id))
          ) into v_mapped;

          if v_mapped then
            v_mapped_removed := v_mapped_removed + 1;
            if p_dry_run then v_rebuilt_trash := v_rebuilt_trash || jsonb_build_array(v_entry); end if;
            continue;
          end if;

          -- A map without its matching recovered row is a separate integrity incident. Do not
          -- make a second recovery for the same source fingerprint.
          if v_mapping_recorded then
            v_rebuilt_trash := v_rebuilt_trash || jsonb_build_array(v_entry);
            v_unresolved := v_unresolved + 1;
            continue;
          end if;

          if p_dry_run then
            v_recovered := v_recovered + 1;
            v_rebuilt_trash := v_rebuilt_trash || jsonb_build_array(v_entry);
            continue;
          end if;

          v_recovered_id := 'wb-recovered-' || gen_random_uuid()::text;
          v_created_at := coalesce(app_private.try_legacy_wb_trash_timestamptz(v_entry->>'createdAt'), now());
          v_updated_at := coalesce(app_private.try_legacy_wb_trash_timestamptz(v_entry->>'updatedAt'), v_created_at);
          select p.id into v_deleted_by
            from public.profiles p
           where p.id::text = lower(nullif(btrim(v_entry->>'deletedBy'), ''))
           limit 1;

          insert into public.wb_records
            (id, company_id, workspace_id, app_id, data, created_at, updated_at, deleted_at, deleted_by, purge_after)
          values
            (v_recovered_id, v_state.company_id, v_workspace_id, v_app_id,
             v_payload || jsonb_build_object('id', v_recovered_id),
             v_created_at, v_updated_at, v_deleted_at, v_deleted_by, now() + interval '30 days');

          insert into public.wb_legacy_trash_recovery_map
            (fingerprint, company_id, workspace_id, app_id, source_id, payload_deleted_at, source_deleted_by, source_purge_after, recovered_record_id)
          values
            (v_fingerprint, v_state.company_id, v_workspace_id, v_app_id, v_source_id, v_deleted_at, v_source_deleted_by, v_source_purge_after, v_recovered_id);

          v_recovered := v_recovered + 1;
        end loop;

        if not p_dry_run then
          v_doc := jsonb_set(
            v_doc,
            array['workspaces', (v_workspace_ordinal - 1)::text, 'apps', (v_app_ordinal - 1)::text, 'trash'],
            v_rebuilt_trash,
            false
          );
        end if;
      end loop;
    end loop;

    if not p_dry_run and v_doc is distinct from v_state.doc then
      update public.workspace_builder_state
         set doc = v_doc,
             updated_at = now()
       where company_id = v_state.company_id;
    end if;
  end loop;

  return jsonb_build_object(
    'documents_locked', v_documents_locked,
    'entries_examined', v_entries_examined,
    'exact_existing_removed', v_exact_removed,
    'recovered_rows', v_recovered,
    'mapped_rows_removed', v_mapped_removed,
    'unresolved_entries', v_unresolved,
    'document_entries_proven', v_exact_removed + v_recovered + v_mapped_removed,
    'document_entries_removed', case when p_dry_run then 0 else v_exact_removed + v_recovered + v_mapped_removed end,
    'dry_run', p_dry_run
  );
end;
$$;

revoke all on function public.reconcile_legacy_wb_trash_snapshots(text, integer, boolean) from public, anon, authenticated;
grant execute on function public.reconcile_legacy_wb_trash_snapshots(text, integer, boolean) to service_role;

comment on function public.reconcile_legacy_wb_trash_snapshots(text, integer, boolean) is
  'Service-only idempotent reconciliation of legacy App Builder trash. Exact rows are proved before document removal; distinct valid snapshots receive mapped wb-recovered ids. Dry-run reports without writing.';
