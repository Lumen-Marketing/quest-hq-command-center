import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

function functionBlock(name) {
  const marker = `function ${name}`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing ${name}`);
  const next = source.indexOf('\nfunction ', start + marker.length);
  return source.slice(start, next === -1 ? source.length : next);
}

test('forms builder groups publish directly beside save in a cleaner toolbar', () => {
  const tabs = functionBlock('renderFormEditorTabs');
  const identity = functionBlock('renderFormIdentityPanel');
  assert.match(tabs, /gform-editor-tab-group/);
  assert.match(tabs, /gform-editor-actions/);
  assert.match(tabs, /data-action="publish-form"[\s\S]*data-action="save-form"/);
  assert.doesNotMatch(identity, /data-action="publish-form"/);
  assert.doesNotMatch(identity, /data-action="open-form-preview"/);
  assert.match(styles, /\.gform-editor-tab-group/);
  assert.match(styles, /\.gform-editor-actions/);
  assert.match(styles, /\.gform-title-card \.forms-simple-meta/);
});
