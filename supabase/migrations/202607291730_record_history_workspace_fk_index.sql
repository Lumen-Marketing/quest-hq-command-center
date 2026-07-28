-- Cover the record_history workspace foreign key for workspace deletion and
-- tenant-scoped history lookups.

create index if not exists record_history_workspace_idx
  on public.record_history(workspace_id);
