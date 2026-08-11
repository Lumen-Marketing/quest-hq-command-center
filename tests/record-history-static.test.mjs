import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  // The contact record page is a fetched module now; same surface, read as one.
  + readFileSync(new URL('../src/crm/contact-record.js', import.meta.url), 'utf8')
  // The job record page is fetched on demand now; it is still part of the surface these
  // tests describe, so both files are read as one.
  + readFileSync(new URL('../src/crm/job-record.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/crm/deal-detail.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('contact quote and job record headers expose workspace-scoped History actions', () => {
  assert.match(source, /data-action="open-record-history" data-record-type="contact" data-record-id="\$\{h\(contact\.id\)\}"/);
  assert.match(source, /data-action="open-record-history" data-record-type="deal" data-record-id="\$\{h\(deal\.id\)\}"/);
  assert.match(source, /data-action="open-record-history" data-record-type="job" data-record-id="\$\{h\(job\.id\)\}"/);
  assert.match(source, /data-company-id="\$\{h\([^}]*companyId[^}]*\)\}"/);
  assert.match(source, /data-workspace-id="\$\{h\([^}]*workspace_id[^}]*activeWorkspaceId\(\)[^}]*\)\}"/);
});

test('history opens through delegated actions and has a dedicated modal state', () => {
  assert.match(source, /recordHistory: \{[\s\S]*recordType: ''[\s\S]*recordId: ''[\s\S]*loading: false[\s\S]*events: \[\]/);
  assert.match(source, /if \(state\.modal === 'record-history'\) return renderRecordHistoryModal\(\)/);
  assert.match(source, /if \(action === 'open-record-history'\)[\s\S]*openRecordHistory\(\{[\s\S]*recordType: node\.dataset\.recordType[\s\S]*recordId: node\.dataset\.recordId/);
  assert.match(source, /function renderRecordHistoryModal\(\)/);
  assert.match(source, /Loading history/);
  assert.match(source, /No recorded changes yet/);
  assert.match(source, /History could not be loaded/);
});

test('history model and rows load only when one exact record is opened', () => {
  assert.match(source, /import\('\.\/history\/record-history\.js'\)/);
  assert.match(source, /async function loadRecordHistory\(input = state\.recordHistory\)/);
  const queryCount = [...source.matchAll(/from\('record_history'\)/g)].length;
  assert.equal(queryCount, 1, 'record history should have one on-demand query and no startup load');
  const loadStart = source.indexOf('async function loadRecordHistory(input = state.recordHistory)');
  const loadEnd = source.indexOf('function renderRecordHistoryModal()', loadStart);
  const loadBody = source.slice(loadStart, loadEnd);
  assert.ok(loadStart >= 0 && loadEnd > loadStart, 'history load helper should precede its modal renderer');
  assert.match(loadBody, /\.from\('record_history'\)\s*\.select\('\*'\)\s*\.eq\('company_id', input\.companyId\)\s*\.eq\('workspace_id', input\.workspaceId\)\s*\.eq\('record_type', input\.recordType\)\s*\.eq\('record_id', input\.recordId\)\s*\.order\('created_at', \{ ascending: false \}\)\s*\.limit\(50\)/);
  assert.match(loadBody, /recordHistoryModule\.recordHistoryFor\(result\.data \|\| \[\], input\)/);
});

test('history renderer escapes actor summaries and before-after values', () => {
  assert.match(source, /h\(recordHistoryModule\.describeRecordHistoryEvent\(event\)\)/);
  assert.match(source, /h\(recordHistoryModule\.historyFieldLabel\(event\.record_type, field\)\)/);
  assert.match(source, /h\(recordHistoryModule\.formatHistoryValue\(change\.before\)\)/);
  assert.match(source, /h\(recordHistoryModule\.formatHistoryValue\(change\.after\)\)/);
  assert.match(source, /h\(actor\)/);
  assert.match(styles, /\.record-history-modal/);
  assert.match(styles, /\.record-history-event/);
  assert.match(styles, /\.record-history-change/);
});
