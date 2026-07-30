import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeSmsReadiness,
  smsUiCapabilities,
} from '../src/communications/sms-readiness.js';

test('a verified ready response allows the thread and composer to mount', () => {
  const result = smsUiCapabilities({
    ready: true,
    status: 'ready',
    message: 'SMS is ready.',
    workspace_id: 'workspace-1',
  });

  assert.deepEqual(result, {
    ready: true,
    status: 'ready',
    message: 'SMS is ready.',
    workspaceId: 'workspace-1',
    canMountThread: true,
    canMountComposer: true,
  });
});

test('a known non-ready response keeps both SMS surfaces unmounted', () => {
  const result = smsUiCapabilities({
    ready: false,
    status: 'number_unassigned',
    message: 'No number yet.',
    workspace_id: 'workspace-1',
  });

  assert.equal(result.status, 'number_unassigned');
  assert.equal(result.canMountThread, false);
  assert.equal(result.canMountComposer, false);
});

test('the backend contract status remains stable from API to UI', () => {
  const capabilities = smsUiCapabilities({
    ready: false,
    status: 'backend_unavailable',
    message: 'Workspace-safe SMS routing is not available yet.',
    workspace_id: 'workspace-1',
  });

  assert.equal(capabilities.status, 'backend_unavailable');
  assert.equal(capabilities.ready, false);
  assert.equal(capabilities.canMountThread, false);
  assert.equal(capabilities.canMountComposer, false);
});

test('a contradictory ready status fails closed', () => {
  const result = smsUiCapabilities({
    ready: false,
    status: 'ready',
    workspace_id: 'workspace-1',
  });

  assert.equal(result.ready, false);
  assert.equal(result.status, 'unavailable');
  assert.equal(result.canMountThread, false);
  assert.equal(result.canMountComposer, false);
});

test('an unknown or malformed response normalizes to unavailable', () => {
  assert.deepEqual(normalizeSmsReadiness({ ready: true, status: 'surprise' }), {
    ready: false,
    status: 'unavailable',
    message: 'SMS is unavailable right now.',
    workspaceId: null,
  });
  assert.deepEqual(normalizeSmsReadiness(null), {
    ready: false,
    status: 'unavailable',
    message: 'SMS is unavailable right now.',
    workspaceId: null,
  });
});

test('a non-ready status cannot be forced open by a true ready flag', () => {
  const result = smsUiCapabilities({
    ready: true,
    status: 'storage_unavailable',
    message: 'Storage is missing.',
    workspace_id: 'workspace-1',
  });

  assert.equal(result.ready, false);
  assert.equal(result.canMountThread, false);
  assert.equal(result.canMountComposer, false);
});
