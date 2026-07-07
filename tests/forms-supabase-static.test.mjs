import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migrationUrl = new URL('../supabase/migrations/202607010900_forms_shared_data.sql', import.meta.url);
const migration = existsSync(migrationUrl) ? readFileSync(migrationUrl, 'utf8') : '';

test('forms load from Supabase tables during live workspace bootstrap', () => {
  assert.match(source, /formsResult/);
  assert.match(source, /formResponsesResult/);
  assert.match(source, /client\.from\('forms'\)\.select\('\*'\)\.order\('updated_at'/);
  assert.match(source, /client\.from\('form_responses'\)\.select\('\*'\)\.order\('created_at'/);
  assert.match(source, /state\.forms = activeRows\(formsResult\.data \|\| \[\]\)\.map\(normalizeForm\)/);
  assert.match(source, /state\.formResponses = activeRows\(formResponsesResult\.data \|\| \[\]\)\.map\(normalizeFormResponse\)/);
});

test('forms save and response submission use Supabase in live sessions', () => {
  assert.match(source, /function formPayload\(form\)/);
  assert.match(source, /function formResponsePayload\(response\)/);
  assert.match(source, /async function persistFormRecord\(form\)/);
  assert.match(source, /client\.from\('forms'\)\.upsert\(formPayload\(form\), \{ onConflict: 'id' \}\)\.select\(\)\.single\(\)/);
  assert.match(source, /async function deleteFormRecord\(form\)/);
  assert.match(source, /client\.from\('forms'\)\.delete\(\)\.eq\('id', form\.id\)\.eq\('company_id', form\.company_id\)/);
  assert.match(source, /async function persistFormResponseRecord\(response\)/);
  assert.match(source, /client\.from\('form_responses'\)\.insert\(formResponsePayload\(response\)\)\.select\(\)\.single\(\)/);
  assert.match(source, /Supabase live/);
  assert.doesNotMatch(source, /Local autosafe/);
});

test('forms migration creates RLS-backed shared form tables', () => {
  assert.ok(migration, 'Expected shared forms data migration');
  assert.match(migration, /create table if not exists public\.forms/);
  assert.match(migration, /create table if not exists public\.form_responses/);
  assert.match(migration, /questions jsonb not null default '\[\]'::jsonb/);
  assert.match(migration, /answers jsonb not null default '\{\}'::jsonb/);
  assert.match(migration, /alter table public\.forms enable row level security/);
  assert.match(migration, /alter table public\.form_responses enable row level security/);
  assert.match(migration, /app_private\.has_company_permission\(company_id, 'forms\.view'\)/);
  assert.match(migration, /app_private\.has_company_permission\(company_id, 'forms\.manage'\)/);
  assert.match(migration, /grant select, insert, update, delete on public\.forms to authenticated/);
  assert.match(migration, /grant select, insert, update, delete on public\.form_responses to authenticated/);
});
