// Settings > Backups, fetched on first use: it is a tab inside Settings and nothing that
// paints before that click needs it.
//
// A factory, because every store, permission and formatting helper belongs to main.js.

export function createBackupsPanel(ctx) {
  const {
    BACKUP_INTERVAL_OPTIONS, backupSettingsForCompany, contractRows, emptyState, formatDateTime,
    canManageBackups, formatBytes, h, state, titleCase, workspaceBackupsForCompany,
  } = ctx;

  function renderWorkspaceBackupRow(backup) {
    const statusClass = backup.status === 'active' ? 'active' : 'muted';
    return `
      <article class="backup-row ${backup.status === 'deleted' ? 'deleted' : ''}">
        <div>
          <strong>${h(backup.label || 'Workspace backup')}</strong>
          <small>${h(titleCase(backup.kind))} / ${formatDateTime(backup.created_at)} / ${formatBytes(backup.size_bytes)}</small>
        </div>
        <div class="backup-record-counts">
          ${Object.entries(backup.record_counts || {}).slice(0, 5).map(([key, value]) => `<span>${h(titleCase(key))}: ${h(String(value))}</span>`).join('')}
        </div>
        <b class="status-pill ${statusClass}">${h(titleCase(backup.status))}</b>
        <div class="backup-actions">
          <button class="btn" type="button" data-action="download-workspace-backup" data-backup-id="${h(backup.id)}"><i class="ti ti-download"></i>Download</button>
          <button class="btn" type="button" data-action="open-restore-backup" data-backup-id="${h(backup.id)}" ${backup.status !== 'active' ? 'disabled' : ''}><i class="ti ti-restore"></i>Restore</button>
          <button class="btn danger" type="button" data-action="mark-workspace-backup-deleted" data-backup-id="${h(backup.id)}"><i class="ti ti-trash"></i>Mark deleted</button>
        </div>
      </article>
    `;
  }

  function renderBackupsSettings(companyId) {
    if (!canManageBackups(companyId)) {
      return `
        <article class="panel span-3 backup-settings-panel">
          <div class="section-head"><div><h2>Backups</h2><p>Your role cannot view or manage workspace backup contents.</p></div></div>
          <p class="form-note">The <code>settings.manage</code> permission is required.</p>
        </article>
      `;
    }
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
