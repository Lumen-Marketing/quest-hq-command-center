import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202607171200_underwriting_cases.sql', import.meta.url), 'utf8');

test('job cards and job records expose direct photo capture', () => {
  assert.match(source, /data-action="open-job-photos"/);
  assert.match(source, /function renderJobPhotosModal\s*\(/);
  assert.match(source, /data-job-photo-form/);
  assert.match(source, /accept="\$\{acceptAttr\('image'\)\}"/);
  assert.match(source, /capture="environment"/);
  assert.match(source, /multiple/);
  assert.match(source, /guardUpload\(item, 'image', 'Job photos'\)/);
  assert.match(source, /folder:\s*'photos'/);
  assert.match(source, /job_id:\s*job\.id/);
  assert.match(source, /client\.from\('job_files'\)\.insert\(filePayload\(payload\)\)\.select\(\)\.single\(\)/);
  assert.match(source, /ensureFileThumbnails\(photos\)/);
  assert.match(css, /\.job-photo-gallery/);
});
test('underwriter page renders a persisted decision calculator', () => {
  assert.match(source, /data-underwriting-form/);
  assert.match(source, /data-underwriting-field/);
  assert.match(source, /data-underwriting-results/);
  assert.match(source, /calculateUnderwriting\(/);
  assert.match(source, /client\.from\('underwriting_cases'\)\.upsert/);
  assert.match(source, /onConflict:\s*'company_id,contact_id'/);
  assert.match(css, /\.underwriting-calculator/);
  assert.match(css, /\.underwriting-decision/);
});

test('underwriter summary metrics stay compact above the calculator', () => {
  assert.match(source, /<section class="metric-grid underwriter-summary">/);
  assert.match(css, /\.underwriter-summary \.metric\s*\{[\s\S]*?min-height:\s*64px/);
  assert.match(css, /\.underwriter-summary \.metric-symbol\s*\{[\s\S]*?position:\s*static/);
  assert.match(css, /\.underwriter-page \.underwriter-summary\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,/);
});

test('underwriter uses the approved technical ledger hierarchy', () => {
  assert.match(source, /<section class="tool-page underwriter-page underwriter-ledger">/);
  assert.match(source, /<section class="panel underwriting-calculator underwriter-workbench">/);
  assert.match(source, /type="submit" form="underwriting-form"[\s\S]*?>[\s\S]*?Save decision<\/button>/);
  assert.match(source, /<form id="underwriting-form" data-underwriting-form>/);
  assert.match(source, /class="underwriting-results-head"[\s\S]*?<h3>Decision summary<\/h3>[\s\S]*?<div data-underwriting-results aria-live="polite">/);
  assert.match(source, /<section class="panel underwriter-ledger-queue">[\s\S]*?<h2>Estimate queue<\/h2>/);
  assert.doesNotMatch(source, /const guide =/);
  assert.doesNotMatch(source, /<h2>Guidance<\/h2>/);
  assert.match(css, /\.underwriter-ledger \.underwriter-workbench form\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) minmax\(300px, 340px\)/);
  assert.match(css, /\.underwriter-ledger \.underwriting-results-head\s*\{/);
  assert.match(css, /\.underwriter-ledger-queue\s*\{/);
});

test('underwriting case table is tenant scoped and permission protected', () => {
  assert.match(migration, /create table if not exists public\.underwriting_cases/);
  assert.match(migration, /unique \(company_id, contact_id\)/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /has_company_permission\(company_id, 'underwriter\.view'\)/);
  assert.match(migration, /has_company_permission\(company_id, 'underwriter\.manage'\)/);
  assert.match(migration, /grant select, insert, update, delete on public\.underwriting_cases to authenticated/);
});
