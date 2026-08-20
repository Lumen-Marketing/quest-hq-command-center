import assert from 'node:assert/strict';
import test from 'node:test';

import { createBackupsPanel } from '../src/settings/backups-panel.js';

function panel({ canManage }) {
  return createBackupsPanel({
    BACKUP_INTERVAL_OPTIONS: [['daily', 'Daily']],
    backupSettingsForCompany: () => ({ interval_key: 'daily' }),
    canManageBackups: () => canManage,
    contractRows: () => '<div>COUNTS</div>',
    emptyState: (message) => `<div>${message}</div>`,
    formatBytes: (value) => `${value} bytes`,
    formatDateTime: () => 'now',
    h: String,
    state: {},
    titleCase: (value) => value,
    workspaceBackupsForCompany: () => [{
      id: 'backup-a',
      company_id: 'company-a',
      kind: 'manual',
      label: 'Safe backup',
      status: 'active',
      created_at: '2026-08-21T00:00:00Z',
      size_bytes: 20,
      record_counts: { contacts: 1 },
    }],
  }).renderBackupsSettings('company-a');
}

test('backup controls and metadata are absent without settings.manage', () => {
  const html = panel({ canManage: false });
  assert.match(html, /settings\.manage/);
  assert.doesNotMatch(html, /Backup now|Save interval|Import backup zip|Safe backup|Download|Restore|Mark deleted/);
});

test('settings managers can create, configure, import and act on backups', () => {
  const html = panel({ canManage: true });
  assert.match(html, /Backup now/);
  assert.match(html, /Save interval/);
  assert.match(html, /Import backup zip/);
  assert.match(html, /Safe backup/);
  assert.match(html, /Download/);
  assert.match(html, /Restore/);
  assert.match(html, /Mark deleted/);
});
