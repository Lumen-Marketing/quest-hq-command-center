import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('jobs profile route renders a Salesforce-style job record workspace', () => {
  assert.match(source, /function renderJobRecord\s*\(/);
  assert.match(source, /<div class="sf-record job-record">/);
  assert.match(source, /All Jobs <span class="sf-tab-kind">\| Jobs<\/span>/);
  assert.match(source, /data-action="set-job-stage"/);
  assert.match(source, /data-action="job-mark-next"/);
  assert.match(source, /data-job-note-form/);
  assert.match(source, /data-action="job-quick"/);
  assert.match(source, /data-job-edit=/);
});
