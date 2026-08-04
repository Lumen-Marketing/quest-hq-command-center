import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const jobFile = readFileSync(new URL('../src/jobs/job-file.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const policy = readFileSync(new URL('../src/security/upload-policy.js', import.meta.url), 'utf8');

// ---- needs attention -----------------------------------------------------------------------

test('attention items are real tasks, so "synced to My Queue" is true', () => {
  // Ticking here clears it in the assignee's queue because it is the same row. A job-only
  // checklist would be a second list of work nobody looks at.
  assert.match(jobFile, /data-action="job-attention-done" data-task-id=/);
  assert.match(main, /if \(action === 'job-attention-done'\)/);
  assert.match(main, /toggleContactTask\(node\.dataset\.taskId\)/);
});

test('both job links are written and either is read', () => {
  // project_id has carried the job id since before tasks had a job column. Writing only the
  // new one would hide anything created by the old path.
  assert.match(main, /job_id: linkedJob\?\.id \|\| linkedDeal\?\.job_id \|\| previous\?\.job_id \|\| '',/);
  assert.match(main, /task\.job_id === id \|\| \(!task\.job_id && task\.project_id === id\)/);
});

test('the composer reuses the real task form rather than a job-local one', () => {
  // Same fields, same assignee list, same validation -- and it lands in the queue without
  // anything extra having to happen.
  assert.match(main, /function openTaskComposerForJob\(job\)/);
  assert.match(main, /navigate\(companyPath\('tasks', \{ new: '1', job_id: job\.id \}, job\.company_id\)\)/);
});

test('with nothing outstanding the pipeline prompt still has a home', () => {
  // It used to be the whole card. Dropping it to make room for a list would have lost a
  // working prompt.
  assert.match(jobFile, /renderPipelineNextAction\('job', job, \{ compact: true \}\)/);
});

test('an overdue item is marked, using a local date', () => {
  assert.match(main, /task\.due && task\.due < localIsoDate\(\)/);
  assert.match(jobFile, /task\.overdue \? 'overdue' : ''/);
  assert.match(css, /\.jf-attn-row\.overdue \.jf-attn-due/);
});

test('a viewer cannot tick or add', () => {
  assert.match(jobFile, /data-action="job-attention-done"[\s\S]{0,80}\$\{canManage \? '' : ' disabled'\}/);
});

// ---- expense -------------------------------------------------------------------------------

test('a spend moves the bucket, because that is what moves the net', () => {
  // Recording it anywhere else would let the Numbers tab and the receipts disagree, and the
  // Numbers tab is the one people decide on.
  assert.match(main, /from\('job_cost_buckets'\)\s*\n?\s*\.update\(\{ spent: next/);
  assert.match(main, /const next = Number\(bucket\.spent \|\| 0\) \+ amount;/);
});

test('a spend of zero or less is refused', () => {
  assert.match(main, /if \(!\(amount > 0\)\) \{ draft\.error = 'Enter an amount greater than zero\.'/);
});

test('final buckets are not offered', () => {
  // Closing a bucket is what firms up the net; adding to a closed one would un-firm it
  // silently.
  assert.match(main, /state\.jobCostBuckets\.filter\(\(b\) => b\.job_id === job\.id && b\.status !== 'final'\)/);
  assert.match(main, /This job has no open cost buckets/);
});

test('a failed receipt does not roll back a spend the user watched go in', () => {
  const fn = main.slice(main.indexOf('async function submitJobExpense('));
  assert.match(fn.slice(0, 3000), /Spend logged, but the receipt did not upload\./);
});

// ---- job walk ------------------------------------------------------------------------------

test('audio has an upload policy, or every voice note is rejected', () => {
  assert.match(policy, /audio: \{ exts: \['webm', 'm4a', 'mp4', 'ogg', 'oga', 'mp3', 'wav'\]/);
  assert.match(main, /'Job walk', 'audio'\)/);
});

test('closing the recorder stops the hardware', () => {
  // Otherwise the browser keeps showing the recording indicator after the dialog is gone.
  const at = main.indexOf("action === 'job-walk-cancel'");
  assert.match(main.slice(at, at + 400), /activeRecorder\.cancel\(\); activeRecorder = null;/);
});

test('the clock does not repaint the whole app twice a second', () => {
  assert.match(main, /const el = document\.querySelector\('\.jw-time'\);/);
});

test('a browser that cannot record says so instead of failing silently', () => {
  assert.match(main, /if \(!mod\.canRecord\(\)\)/);
  assert.match(main, /This browser cannot record audio/);
});

test('a blocked microphone names the actual cause', () => {
  assert.match(main, /error\?\.name === 'NotAllowedError'/);
  assert.match(main, /Microphone access was blocked/);
});

// ---- sidebar -------------------------------------------------------------------------------

test('Jobs gets Dashboard and Calendar above its status buckets', () => {
  assert.match(main, /function jobsNavViews\(route, companyId\)/);
  assert.match(main, /\$\{kind === 'jobs' \? jobsNavViews\(route, companyId\) : ''\}/);
  // The dashboard is the module home, so it carries no tab of its own.
  assert.match(main, /key === 'dashboard' \? \{\} : \{ tab: key \}/);
});

test('the view rows line up with the stage rows', () => {
  // The icon takes the slot the stage dot would, at the same width.
  assert.match(css, /\.side-sub-icon \{[^}]*width: 8px/);
});

test('the quick-create rail offers everything the design lists that can work', () => {
  for (const action of ['job-daily-new', 'open-job-photos', 'job-walk-new', 'job-change-order-new', 'job-expense-new']) {
    assert.ok(jobFile.includes(`data-action="${action}"`), `${action} missing from the rail`);
  }
});
