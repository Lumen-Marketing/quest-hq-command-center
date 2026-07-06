import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('form response detail exposes a real delete response action', () => {
  assert.match(source, /data-action="delete-form-response"/);
  assert.match(source, /Delete response/);
  assert.match(source, /if \(action === 'delete-form-response'\)/);
  assert.match(source, /deleteFormResponse\(node\.dataset\.responseId \|\| ''\)/);
});

test('form response delete removes the row from Supabase and updates selection', () => {
  assert.match(source, /async function deleteFormResponseRecord\(response\)/);
  assert.match(source, /client\.from\('form_responses'\)\.delete\(\)\.eq\('id', response\.id\)\.eq\('company_id', response\.company_id\)/);
  assert.match(source, /async function deleteFormResponse\(responseId\)/);
  assert.match(source, /window\.confirm\('Delete this response\?/);
  assert.match(source, /state\.formResponses = state\.formResponses\.filter\(\(item\) => item\.id !== response\.id\)/);
  assert.match(source, /state\.selectedFormResponseId = responsesForForm\(response\.form_id\)\[0\]\?\.id \|\| ''/);
});
