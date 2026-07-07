import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('form response detail exposes a real delete response action', () => {
  assert.match(source, /data-action="delete-form-response"/);
  assert.match(source, /Delete response/);
  assert.match(source, /if \(action === 'delete-form-response'\)/);
  assert.match(source, /openRecycleDeleteModal\(\{ type: 'form_response', id: node\.dataset\.responseId \|\| '' \}\)/);
});

test('form response delete moves the row to the recycle bin instead of hard deleting', () => {
  assert.match(source, /form_response: \{[\s\S]*table: 'form_responses'[\s\S]*stateKey: 'formResponses'/);
  assert.match(source, /async function deleteFormResponse\(responseId\)/);
  assert.match(source, /await recycleDeleteRecord\(\{ type: 'form_response', id: response\.id \}\)/);
  assert.match(source, /async function softDeleteRecycleSource\(typeConfig, record, item\)/);
  assert.match(source, /const patch = \{[\s\S]*deleted_at: item\.deleted_at,[\s\S]*deleted_by: item\.deleted_by \|\| null/);
  assert.doesNotMatch(source, /window\.confirm\('Delete this response\?/);
});
