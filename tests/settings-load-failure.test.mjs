import assert from 'node:assert/strict';
import test from 'node:test';

import * as navigationModel from '../src/settings/navigation-model.js';

test('a failed settings chunk renders a visible retry action', () => {
  assert.equal(typeof navigationModel.renderSettingsSurfaceLoadError, 'function');
  const html = navigationModel.renderSettingsSurfaceLoadError({
    h: String,
    message: 'Network unavailable',
  });
  assert.match(html, /Settings could not load/);
  assert.match(html, /Network unavailable/);
  assert.match(html, /data-action="retry-settings-surfaces"/);
});
