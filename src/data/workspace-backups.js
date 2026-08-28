export const WORKSPACE_BACKUP_METADATA_COLUMNS = [
  'id',
  'company_id',
  'label',
  'kind',
  'status',
  'interval_key',
  'size_bytes',
  'record_counts',
  'created_by',
  'created_by_label',
  'source',
  'imported_from_backup_id',
  'deleted_at',
  'deleted_by',
  'created_at',
  'updated_at',
].join(',');

export function hasWorkspaceBackupPayload(backup, version = 1) {
  const payload = backup?.payload;
  return Boolean(
    payload
    && typeof payload === 'object'
    && payload.version === version
    && payload.data
    && typeof payload.data === 'object',
  );
}

export function workspaceBackupsForCache(backups = []) {
  return (backups || []).map((backup) => ({ ...backup, payload: null }));
}

export async function hydrateWorkspaceBackupPayload(backup, {
  client,
  safeQuery,
  version = 1,
} = {}) {
  if (hasWorkspaceBackupPayload(backup, version)) return backup;
  if (!client) throw new Error('Backup service is unavailable.');
  const result = await safeQuery(
    client
      .from('workspace_backups')
      .select('payload')
      .eq('id', backup.id)
      .eq('company_id', backup.company_id)
      .maybeSingle(),
  );
  if (result.error) throw new Error(result.error.message || 'Could not load the backup snapshot.');
  const hydrated = { ...backup, payload: result.data?.payload };
  if (!hasWorkspaceBackupPayload(hydrated, version)) {
    throw new Error('This backup does not contain a usable workspace snapshot.');
  }
  return hydrated;
}
