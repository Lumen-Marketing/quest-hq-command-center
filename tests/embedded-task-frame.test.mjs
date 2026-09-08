import test from 'node:test';
import assert from 'node:assert/strict';

import { readFileSync } from 'node:fs';
import { embeddedTaskFrameMarkup, renderShellPreservingTaskFrame } from '../src/tasks/embedded-frame.js';

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

test('the preservation path never removes or reparents the live iframe', () => {
  const source = readFileSync(new URL('../src/tasks/embedded-frame.js', import.meta.url), 'utf8');
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /frame\.remove\(|replaceWith\(frame\)|appendChild\(frame\)/);
  assert.match(source, /renderShellPreservingTaskFrame/);
  assert.match(main, /if \(!renderShellPreservingTaskFrame\(app, shell\)\) app\.innerHTML = shell/);
});

test('preservation declines cleanly outside a browser', () => {
  const frame = node({ src: '/taskmanagement/app.html?workspace_id=one' });
  assert.equal(renderShellPreservingTaskFrame({ querySelector: () => frame }, '<div></div>'), false);
});
