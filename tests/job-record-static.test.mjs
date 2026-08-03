import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  // The job record page is fetched on demand now; it is still part of the surface these
  // tests describe, so both files are read as one.
  + readFileSync(new URL('../src/crm/job-record.js', import.meta.url), 'utf8');

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
  assert.match(source, /fieldRow\('Site Address', `\$\{ed\('site_address'\)\}\$\{job\.site_address \? `<button class="sf-field-action" type="button" data-action="open-location-picker"/);
  assert.match(source, /beginAddressInlineEdit\(span, job\.site_address, job\.company_id/);
  assert.match(source, /function jobInlineOptions\(job, key\)/);
  assert.match(source, /if \(key === 'priority'\) return \['Low', 'Medium', 'High', 'Urgent'\]\.map/);
  assert.match(source, /if \(key === 'owner_name'\) return contactOwnerOptions\(job\.company_id, job\.owner_name\)/);
  assert.match(source, /if \(key === 'job_type'\) return contactJobTypeOptions\(job\.company_id\)\.map/);
  assert.match(source, /const rowValueTarget = \[\.\.\.\(span\.closest\('\.sf-field'\)\?\.querySelectorAll\('\.sf-field-value \[data-job-edit\]'\) \|\| \[\]\)\]/);
  assert.match(source, /const input = document\.createElement\(options\.length \? 'select' : 'input'\)/);
  assert.match(source, /input\.addEventListener\('change', commit\)/);
  assert.match(source, /fieldRow\('Job Type', `<span class="sf-pill sf-edit" data-job-edit="job_type"/);
  assert.match(source, /fieldRow\('Owner', ed\('owner_name'/);
  assert.match(source, /fieldRow\('Priority', `<span class="sf-pill sf-edit" data-job-edit="priority"/);
  assert.match(source, /fieldRow\('Stage', `<span>\$\{h\(job.stage\)\}<\/span>`, 'stage'\)/);
  assert.doesNotMatch(source, /<i class="ti ti-pencil sf-pencil"><\/i>/);
});
