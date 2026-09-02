import test from 'node:test';
import assert from 'node:assert/strict';

import { embeddedTaskFrameMarkup, retainEmbeddedTaskFrame } from '../src/tasks/embedded-frame.js';

function node({ src = '', key = '' } = {}) {
  return {
    dataset: { ...(key ? { persistKey: key } : {}) },
    removed: false,
    replacement: null,
    getAttribute(name) { return name === 'src' ? src : ''; },
    remove() { this.removed = true; },
    replaceWith(value) { this.replacement = value; },
  };
}

test('renders a placeholder only for the exact mounted Tasks URL', () => {
  const frame = node({ src: '/taskmanagement/app.html?workspace_id=one' });
  const root = { querySelector: () => frame };
  assert.match(embeddedTaskFrameMarkup(root, '/taskmanagement/app.html?workspace_id=one'), /data-task-frame-placeholder/);
  assert.match(embeddedTaskFrameMarkup(root, '/taskmanagement/app.html?workspace_id=two'), /^<iframe/);
});

test('restores a detached frame into the matching placeholder', () => {
  const key = '/taskmanagement/app.html?workspace_id=one';
  const frame = node({ src: key });
  const placeholder = node({ key });
  const root = {
    querySelector: () => frame,
    querySelectorAll: () => [placeholder],
  };
  const restore = retainEmbeddedTaskFrame(root);
  assert.equal(frame.removed, true);
  assert.equal(restore(), true);
  assert.equal(placeholder.replacement, frame);
});

test('does not reuse a frame when the new route has a different key', () => {
  const frame = node({ src: '/taskmanagement/app.html?workspace_id=one' });
  const placeholder = node({ key: '/taskmanagement/app.html?workspace_id=two' });
  const root = {
    querySelector: () => frame,
    querySelectorAll: () => [placeholder],
  };
  assert.equal(retainEmbeddedTaskFrame(root)(), false);
  assert.equal(placeholder.replacement, null);
});
