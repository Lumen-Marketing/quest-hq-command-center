import test from 'node:test';
import assert from 'node:assert/strict';

import {
  selectNextAction,
  taskMatchesRecord,
} from '../src/crm/next-action.js';

test('selectNextAction returns the earliest open task and ignores completed work', () => {
  const tasks = [
    { id: 'done', status: 'done', due: '2026-07-17', due_time: '08:00' },
    { id: 'later', status: 'todo', due: '2026-07-20', due_time: '09:00', priority: 'high' },
    { id: 'next', status: 'in_progress', due: '2026-07-18', due_time: '13:30', priority: 'medium' },
  ];

  assert.equal(selectNextAction(tasks)?.id, 'next');
});

test('selectNextAction puts scheduled work before undated work and uses priority as a tie breaker', () => {
  const tasks = [
    { id: 'undated', status: 'todo', due: '' },
    { id: 'normal', status: 'todo', due: '2026-07-18', priority: 'medium' },
    { id: 'urgent', status: 'todo', due: '2026-07-18', priority: 'urgent' },
  ];

  assert.equal(selectNextAction(tasks)?.id, 'urgent');
});

test('a dated action outranks a higher-priority task with no date', () => {
  const tasks = [
    { id: 'undated-urgent', status: 'todo', due: '', priority: 'critical' },
    { id: 'dated-low', status: 'todo', due: '2026-07-18', priority: 'low' },
  ];

  assert.equal(selectNextAction(tasks)?.id, 'dated-low');
});

test('taskMatchesRecord keeps contact quote and job next actions distinct', () => {
  assert.equal(taskMatchesRecord(
    { contact_id: 'contact-1', deal_id: '', project_id: '' },
    { kind: 'contact', id: 'contact-1' },
  ), true);
  assert.equal(taskMatchesRecord(
    { contact_id: 'contact-1', deal_id: 'deal-1', project_id: '' },
    { kind: 'contact', id: 'contact-1' },
  ), false);
  assert.equal(taskMatchesRecord(
    { contact_id: 'contact-1', deal_id: 'deal-1', project_id: '' },
    { kind: 'deal', id: 'deal-1', contactId: 'contact-1' },
  ), true);
  assert.equal(taskMatchesRecord(
    { contact_id: 'contact-1', deal_id: '', project_id: '' },
    { kind: 'deal', id: 'deal-1', contactId: 'contact-1', allowLegacyContactMatch: true },
  ), true);
  assert.equal(taskMatchesRecord(
    { contact_id: '', deal_id: '', project_id: 'job-1' },
    { kind: 'job', id: 'job-1' },
  ), true);
});
