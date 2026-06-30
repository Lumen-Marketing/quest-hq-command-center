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
  assert.match(source, /\['New Estimate', 'ti-calculator'\]/);
  assert.match(source, /\['Estimate', 'ti-calculator'\]/);
  assert.match(source, /if \(kind === 'Estimate' \|\| kind === 'New Estimate'\) return openEstimateBuilder\('job', jobId\)/);
  assert.match(source, /\['Proposal', 'ti-file-text'\]/);
  assert.match(source, /if \(kind === 'Proposal'\) return openProposalBuilder\('job', jobId\)/);
});

test('job record pencil controls trigger inline editing for editable fields', () => {
  assert.match(source, /const fieldRow = \(label, content, editKey = ''\) =>/);
  assert.match(source, /data-job-edit="\$\{h\(editKey\)\}"/);
  assert.match(source, /aria-label="Edit \$\{h\(label\)\}"/);
  assert.match(source, /fieldRow\('Site Address', ed\('site_address'\), 'site_address'\)/);
  assert.match(source, /fieldRow\('Owner', ed\('owner_name'/);
  assert.match(source, /fieldRow\('Stage', `<span>\$\{h\(job.stage\)\}<\/span>`, 'stage'\)/);
  assert.doesNotMatch(source, /<i class="ti ti-pencil sf-pencil"><\/i>/);
});
