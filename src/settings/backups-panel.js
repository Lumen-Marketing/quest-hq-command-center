// Settings > Backups, fetched on first use: it is a tab inside Settings and nothing that
// paints before that click needs it.
//
// A factory, because every store, permission and formatting helper belongs to main.js.

export function createBackupsPanel(ctx) {
  const {
    BACKUP_INTERVAL_OPTIONS, backupSettingsForCompany, contractRows, emptyState, formatDateTime,
    h, renderWorkspaceBackupRow, state, workspaceBackupsForCompany,
  } = ctx;

  function renderBackupsSettings(companyId) {
    const settings = backupSettingsForCompany(companyId);
    const backups = workspaceBackupsForCompany(companyId);
    const lastBackup = backups.find((backup) => backup.status === 'active');
    return `
      <article class="panel span-3 backup-settings-panel">
        <div class="section-head">
          <div>
            <h2>Backups</h2>
            <p>Exportable workspace snapshots for recovery, transfer, and rollback.</p>
          </div>
          <button class="btn btn-primary" type="button" data-action="create-workspace-backup">
            <i class="ti ti-database-export"></i>Backup now
          </button>
        </div>
        <div class="backup-settings-grid">
          <form class="backup-config-card" data-backup-settings-form>
            <label>
              <span>Automatic backup interval</span>
              <select name="interval_key">
                ${BACKUP_INTERVAL_OPTIONS.map(([value, label]) => `<option value="${h(value)}" ${settings.interval_key === value ? 'selected' : ''}>${h(label)}</option>`).join('')}
              </select>
            </label>
            <button class="btn" type="submit"><i class="ti ti-device-floppy"></i>Save interval</button>
            <small>Automatic backup scheduling uses this setting. Manual backups are always available.</small>
          </form>
          <div class="backup-config-card">
            <strong>Import backup zip</strong>
            <label class="file-drop small">
              <span>Choose a Quest backup zip</span>
              <input type="file" accept=".zip,application/zip" data-workspace-backup-import />
            </label>
            <small>Import adds the backup to this list. Restore is a separate confirmation step.</small>
          </div>
          <div class="backup-config-card">
            <strong>Current state</strong>
            ${contractRows([
              ['Active backups', String(backups.filter((item) => item.status === 'active').length)],
              ['Deleted markers', String(backups.filter((item) => item.status === 'deleted').length)],
              ['Last backup', lastBackup ? formatDateTime(lastBackup.created_at) : 'None yet'],
            ])}
          </div>
        </div>
        <div class="backup-list">
          ${backups.map(renderWorkspaceBackupRow).join('') || emptyState('No backups yet. Use Backup now to create the first snapshot.')}
        </div>
      </article>
    `;
  }

  return { renderBackupsSettings };
}
