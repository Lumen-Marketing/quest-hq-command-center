import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const jobFile = readFileSync(new URL('../src/jobs/job-file.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const policy = readFileSync(new URL('../src/security/upload-policy.js', import.meta.url), 'utf8');
const walk = readFileSync(new URL('../src/jobs/voice-note.js', import.meta.url), 'utf8');
const expense = readFileSync(new URL('../src/jobs/job-expense.js', import.meta.url), 'utf8');

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
  assert.match(expense, /from\('job_cost_buckets'\)\s*\n?\s*\.update\(\{ spent: next/);
  assert.match(expense, /const next = Number\(bucket\.spent \|\| 0\) \+ amount;/);
});

test('a spend of zero or less is refused', () => {
  assert.match(expense, /if \(!\(amount > 0\)\) \{ draft\.error = 'Enter an amount greater than zero\.'/);
});

test('final buckets are not offered', () => {
  // Closing a bucket is what firms up the net; adding to a closed one would un-firm it
  // silently.
  assert.match(expense, /state\.jobCostBuckets\.filter\(\(b\) => b\.job_id === job\.id && b\.status !== 'final'\)/);
  assert.match(expense, /This job has no open cost buckets/);
});

test('a failed receipt does not roll back a spend the user watched go in', () => {
  const fn = expense.slice(expense.indexOf('async function submit('));
  assert.match(fn.slice(0, 3000), /Spend logged, but the receipt did not upload\./);
});

// ---- job walk ------------------------------------------------------------------------------

test('audio has an upload policy, or every voice note is rejected', () => {
  assert.match(policy, /audio: \{ exts: \['webm', 'm4a', 'mp4', 'ogg', 'oga', 'mp3', 'wav'\]/);
  assert.match(walk, /'Job walk', 'audio'\)/);
});

test('closing the recorder stops the hardware', () => {
  // Otherwise the browser keeps showing the recording indicator after the dialog is gone.
  const at = main.indexOf("action === 'job-walk-cancel'");
  assert.match(main.slice(at, at + 400), /jobWalkModule\.cancel\(\)/);
  assert.match(walk, /const cancel = \(\) => \{ if \(recorder\) \{ recorder\.cancel\(\); recorder = null; \} \};/);
});

test('the clock does not repaint the whole app twice a second', () => {
  assert.match(walk, /const el = document\.querySelector\('\.jw-time'\);/);
});

test('a browser that cannot record says so instead of failing silently', () => {
  assert.match(walk, /if \(!canRecord\(\)\)/);
  assert.match(walk, /This browser cannot record audio/);
});

test('a blocked microphone names the actual cause', () => {
  assert.match(walk, /error\?\.name === 'NotAllowedError'/);
  assert.match(walk, /Microphone access was blocked/);
});

// ---- sidebar -------------------------------------------------------------------------------

test('the Jobs sub-menu is a fixed list, with Calendar and no Dashboard', () => {
  // The stages are how production is navigated, so collapsing them costs a click on every
  // move and nothing else is competing for the room. The Dashboard row is gone because the
  // dashboard moved to the workspace home as a tile — there is no page left to link to.
  assert.match(main, /const alwaysOpen = kind === 'jobs';/);
  assert.match(main, /const expanded = alwaysOpen \|\| state\.expandedNav\.has\(kind\);/);
  assert.match(main, /\$\{alwaysOpen \? '' : `<button class="side-pipe-toggle"/, 'no chevron on Jobs');
  assert.match(main, /function jobsNavViews\(route, companyId\)/);
  const fn = main.slice(main.indexOf('function jobsNavViews('));
  const body = fn.slice(0, fn.indexOf(String.fromCharCode(10) + '}'));
  assert.match(body, /tab: 'calendar'/);
  assert.ok(!/dashboard/i.test(body), 'the Dashboard row must be gone');
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

test('Activity does not get a second Quick Create', () => {
  // The Activity tab renders the job record, which brings its own Quick Create panel. Showing
  // the rail there put two lists of the same idea on one screen, overlapping, with different
  // contents in each.
  assert.match(jobFile, /const showRail = canManage && active !== 'activity';/);
  assert.match(jobFile, /\$\{showRail \? `\s*\n\s*<aside class="jf-rail"/);
  assert.ok(!/\$\{canManage \? `\s*\n\s*<aside class="jf-rail"/.test(jobFile), 'the rail must key on showRail');
});

test('with no rail the content takes the width instead of leaving a hole', () => {
  assert.match(jobFile, /class="jf-body \$\{showRail \? '' : 'jf-body-wide'\}"/);
  assert.match(css, /\.jf-body-wide \{ grid-template-columns: minmax\(0, 1fr\); \}/);
});

test('the attention card reads like the design: flame, sync note, blue owner pills', () => {
  // It is the one card on the page asking for something, and the warm border says so before
  // any of the words are read.
  assert.match(jobFile, /<i class="ti ti-flame jf-attn-flame" aria-hidden="true"><\/i>Needs attention/);
  assert.match(jobFile, /<i class="ti ti-refresh" aria-hidden="true"><\/i>synced to My Queue/);
  assert.match(css, /\.jf-attention \{ border-color: color-mix/);
  // The owner reads as a person, so the pill takes the informational blue rather than grey.
  assert.match(css, /\.jf-attn-who \{[^}]*var\(--info/s);
});

test('the card colours come from tokens, so dark mode is not a hard-coded light blue', () => {
  // The design's #eaf2fe is a light-theme value; mixed against the token it follows the theme.
  const rule = css.slice(css.indexOf('.jf-attn-who {'), css.indexOf('.jf-attn-tick {'));
  assert.ok(!/#eaf2fe/i.test(rule), 'no baked-in light-theme background');
  assert.match(rule, /color-mix\(in srgb, var\(--info/);
});

test('the tick reads as a checkbox, not as a custom control', () => {
  const rule = css.slice(css.indexOf('.jf-attn-tick {'), css.indexOf('.jf-attn-tick:hover'));
  assert.match(rule, /border-radius: 4px/);
  assert.match(rule, /1\.5px solid/);
});

test('the job header leads with the trade, as the design does', () => {
  // On a board of jobs the trade is what you scan for before the address.
  assert.match(jobFile, /<span class="jf-trade" style="background:\$\{h\(tradeColor\(job\.job_type\)\)\}"/);
  assert.match(jobFile, /\(job\.job_type \|\| '\?'\)\.trim\(\)\.charAt\(0\)\.toUpperCase\(\)/);
  assert.match(css, /\.jf-trade \{/);
});

test('stage and day sit on the title line as one chip', () => {
  // It is the job's state, not a separate fact on a line of its own.
  assert.match(jobFile, /<span class="jf-stage-chip"/);
  assert.match(jobFile, /\$\{worked \? ` · day \$\{worked\}` : ''\}<\/span>/);
  assert.match(css, /\.jf-stage-chip \{/);
});

test('the streak is not repeated in the header', () => {
  // "How it is going" already carries it; in the header it read as an orphaned dot.
  assert.ok(!/jf-head-meta/.test(jobFile), 'the header meta line is gone');
  assert.match(jobFile, /<h3>How it is going<\/h3>[\s\S]{0,200}streakDots\(data\.dailies\)/);
});

test('the quick-create rail is a narrow column of icons', () => {
  assert.match(css, /\.jf-body \{[^}]*minmax\(0, 1fr\) 126px/);
  assert.match(css, /\.jf-quick \{[^}]*justify-items: center/s);
  // The descriptions said the same thing twice — "How the day went" beside "Daily report".
  assert.ok(!/<b>Daily report<\/b><span>How the day went<\/span>/.test(jobFile));
  assert.match(jobFile, /<i class="ti ti-clipboard-text" aria-hidden="true"><\/i><span>Daily report<\/span>/);
});
