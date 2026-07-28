import assert from 'node:assert/strict';
import test from 'node:test';

import {
  describeRecordHistoryEvent,
  formatHistoryValue,
  historyFieldLabel,
  normalizeRecordHistoryEvent,
  recordHistoryFor,
} from '../src/history/record-history.js';

function event(overrides = {}) {
  return {
    id: 'history-1',
    company_id: 'company-a',
    workspace_id: 'workspace-a',
    record_type: 'contact',
    record_id: 'contact-a',
    record_label: 'Acme Roofing',
    action: 'updated',
    actor_profile_id: 'person-a',
    changed_fields: ['stage'],
    changes: { stage: { before: 'Lead', after: 'Qualified' } },
    created_at: '2026-07-29T01:00:00.000Z',
    ...overrides,
  };
}

test('normalizes untrusted history rows without retaining malformed change payloads', () => {
  assert.deepEqual(normalizeRecordHistoryEvent({
    ...event(),
    id: 42,
    changed_fields: ['stage', 3, 'stage', 'owner_name'],
    changes: {
      stage: { before: 'Lead', after: 'Qualified', ignored: 'value' },
      owner_name: 'not-a-change-object',
      ignored: { before: 'x', after: 'y' },
    },
  }), {
    id: '42',
    company_id: 'company-a',
    workspace_id: 'workspace-a',
    record_type: 'contact',
    record_id: 'contact-a',
    record_label: 'Acme Roofing',
    action: 'updated',
    actor_profile_id: 'person-a',
    changed_fields: ['stage', 'owner_name'],
    changes: {
      stage: { before: 'Lead', after: 'Qualified' },
    },
    created_at: '2026-07-29T01:00:00.000Z',
  });

  const invalid = normalizeRecordHistoryEvent({
    record_type: 'secret',
    action: 'forged',
    changed_fields: 'stage',
    changes: [],
  });
  assert.equal(invalid.record_type, '');
  assert.equal(invalid.action, 'updated');
  assert.deepEqual(invalid.changed_fields, []);
  assert.deepEqual(invalid.changes, {});
});

test('filters history by every tenant and record dimension and sorts newest first', () => {
  const rows = [
    event({ id: 'matching-old', created_at: '2026-07-29T01:00:00.000Z' }),
    event({ id: 'other-company', company_id: 'company-b' }),
    event({ id: 'other-workspace', workspace_id: 'workspace-b' }),
    event({ id: 'other-type', record_type: 'deal' }),
    event({ id: 'other-record', record_id: 'contact-b' }),
    event({ id: 'matching-new', created_at: '2026-07-29T02:00:00.000Z' }),
  ];

  assert.deepEqual(
    recordHistoryFor(rows, {
      companyId: 'company-a',
      workspaceId: 'workspace-a',
      recordType: 'contact',
      recordId: 'contact-a',
    }).map((row) => row.id),
    ['matching-new', 'matching-old'],
  );
});

test('uses fixed friendly labels and a readable fallback', () => {
  assert.equal(historyFieldLabel('contact', 'owner_name'), 'Owner');
  assert.equal(historyFieldLabel('deal', 'close_date'), 'Close date');
  assert.equal(historyFieldLabel('job', 'estimate_total'), 'Estimate total');
  assert.equal(historyFieldLabel('task', 'due'), 'Due date');
  assert.equal(historyFieldLabel('contact', 'custom_field_name'), 'Custom field name');
});

test('describes created updated deleted and restored events', () => {
  assert.equal(describeRecordHistoryEvent(event({ action: 'created' })), 'Created contact');
  assert.equal(describeRecordHistoryEvent(event({
    action: 'updated',
    changed_fields: ['stage', 'owner_name'],
  })), 'Updated Stage and Owner');
  assert.equal(describeRecordHistoryEvent(event({ action: 'deleted' })), 'Moved to Recycle Bin');
  assert.equal(describeRecordHistoryEvent(event({ action: 'restored' })), 'Restored from Recycle Bin');
  assert.equal(describeRecordHistoryEvent(event({
    action: 'updated',
    changed_fields: [],
  })), 'Updated contact');
});

test('formats common history values without leaking object coercion', () => {
  assert.equal(formatHistoryValue(null), 'Empty');
  assert.equal(formatHistoryValue(''), 'Empty');
  assert.equal(formatHistoryValue(true), 'Yes');
  assert.equal(formatHistoryValue(false), 'No');
  assert.equal(formatHistoryValue(12500), '12,500');
  assert.equal(formatHistoryValue(['Roofing', 'Repair']), 'Roofing, Repair');
  assert.equal(formatHistoryValue({ label: 'Structured' }), '{"label":"Structured"}');
});
