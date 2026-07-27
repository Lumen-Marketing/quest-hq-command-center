import assert from 'node:assert/strict';
import test from 'node:test';

import { isOpenTask, scopeToJob } from '../src/tasks/task-shape.js';

test('isOpenTask is false only when status is done', () => {
  assert.equal(isOpenTask({ status: 'todo' }), true);
  assert.equal(isOpenTask({ status: 'in_progress' }), true);
  assert.equal(isOpenTask({ status: 'done' }), false);
});

test('scopeToJob matches project_id to a job id as strings', () => {
  assert.equal(scopeToJob({ project_id: '11111111' }, '11111111'), true);
  assert.equal(scopeToJob({ project_id: 11111111 }, '11111111'), true);
  assert.equal(scopeToJob({ project_id: '99' }, '11111111'), false);
});

test('scopeToJob is false when the job id is empty (no job = not job-scoped)', () => {
  assert.equal(scopeToJob({ project_id: '' }, ''), false);
  assert.equal(scopeToJob({ project_id: '11111111' }, ''), false);
});
