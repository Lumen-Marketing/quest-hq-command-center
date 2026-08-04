import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const views = readFileSync(new URL('../src/workspace/app-views.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const modal = readFileSync(new URL('../src/workspace/builder-modal.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const alarms = readFileSync(new URL('../src/workspace/memo-runtime.js', import.meta.url), 'utf8');


// ---- every dated record on the calendar -----------------------------------------------------

test('the calendar shows every date field by default, not just the first', () => {
  // Records were already dated; the calendar just was not showing them.
  assert.match(views, /const active = chosen \? \[chosen\] : candidates;/);
  assert.match(views, /const \{ byDay, undated \} = recordsByDates\(app, active\);/);
  assert.match(views, /<option value="" \$\{chosen \? '' : 'selected'\}>All dates<\/option>/);
});

test('a record on two dates says which field put it on each', () => {
  // Otherwise the same record appears twice with no explanation. A sub-item always says which
  // list it came from, even when it is the only source, or a Daily and its Job look alike.
  assert.match(views, /const many = active\.length > 1;/);
  assert.match(views, /many \|\| child \? `<b class="wb-cal-why">\$\{h\(why\)\}<\/b>` : ''/);
});

test('a sub-item lands on its own date and opens the record holding it', () => {
  // A sub-item has no page of its own, so the pill has to point at its parent.
  assert.match(views, /export function calendarSources\(app\)/);
  assert.match(views, /put\(raw, \{ item, source, child \}\);/);
  assert.match(views, /href="\$\{itemHref\(companyId, app, item\)\}"/);
});

test('undated counts records, not empty field values', () => {
  // With three date fields, counting blanks reports three times the misses there are.
  assert.match(views, /const undated = \(app\?\.items \|\| \[\]\)\.filter\(\(it\) => !placed\.has\(it\.id\)\)\.length;/);
});

// ---- memos ----------------------------------------------------------------------------------

test('memos render on the month, week and day views', () => {
  assert.match(views, /const memoDays = memosByDay\(app\);/);
  assert.match(views, /const memoPill = \(memo\) =>/);
  // dayCell backs both month and week; the day view lists them separately.
  assert.match(views, /\$\{memos\.map\(memoPill\)\.join\(''\)\}/);
});

test('only someone who can manage the workspace can add one', () => {
  assert.match(views, /const canManage = can\('workspaces\.manage', companyId\);/);
  assert.match(views, /\$\{canManage \? `<button type="button" class="wb-cal-add"/);
});

test('the memo runtime is fetched on demand', () => {
  // main.js no longer touches the model directly -- the runtime imports it, and main.js
  // imports the runtime. Neither is in the entry bundle.
  assert.match(main, /import\('\.\/workspace\/memo-runtime\.js'\)/);
  assert.ok(!/^import .*memo-runtime/m.test(main), 'a static import would defeat the split');
  assert.ok(main.includes('memoRuntimePending = null;'), 'a failed load must be retryable');
  assert.match(alarms, /from '\.\/calendar-memos\.js'/);
});

test('the alarm engine is only fetched when a memo actually exists', () => {
  // Most companies have none, and the entry bundle should not carry an alarm clock for them.
  // main.js keeps only the boolean; the runtime does the real walk when it arms.
  assert.match(main, /if \(anyMemos\(\)\) scheduleMemoAlarms\(\);/);
  assert.match(main, /if \(!anyMemos\(\)\) return;/);
  assert.match(alarms, /function appsWithMemos\(\)/);
});

// ---- the alarm --------------------------------------------------------------------------------

test('one timer aimed at the next memo, not a poll', () => {
  // A poll wakes the tab forever, on every device, to discover nothing has happened.
  assert.match(alarms, /const next = nextDueAt\(app, now\);/);
  assert.match(alarms, /timer = setTimeout\(/);
  // setTimeout past ~24.8 days overflows and fires immediately.
  assert.match(alarms, /Math\.min\(Math\.max\(soonest\.getTime\(\) - Date\.now\(\), 1000\), 6 \* 60 \* 60 \* 1000\)/);
});

test('the previous timer is always cleared before a new one is set', () => {
  const fn = alarms.slice(alarms.indexOf('function schedule()'));
  assert.match(fn.slice(0, 160), /if \(timer\) \{ clearTimeout\(timer\); timer = null; \}/);
  assert.match(alarms, /const stop = \(\) => \{ if \(timer\)/, 'and it can be stopped outright');
});

test('a memo is stamped before it is announced, so it cannot fire twice', () => {
  const fn = alarms.slice(alarms.indexOf('function fireDue()'));
  const body = fn.slice(0, fn.indexOf('\n}\n'));
  assert.ok(
    body.indexOf('notifiedAt') < body.indexOf('showToast('),
    'the stamp must be written before the announcement',
  );
});

test('editing when a memo fires re-arms it', () => {
  // A memo moved to a later time must alarm again rather than stay marked as already fired.
  assert.match(alarms, /const patch = \{ \.\.\.draft, notifiedAt: '' \};/);
});

test('a desktop notification is never requested unprompted', () => {
  // Asking on load is what every browser now penalises, and it is meaningless before the user
  // has asked to be reminded of anything.
  assert.match(alarms, /if \(typeof Notification === 'undefined' \|\| Notification\.permission !== 'default'\) return;/);
  assert.match(alarms, /if \(remind\.value !== ''\) requestPermission\(\)/);
  const show = alarms.slice(alarms.indexOf('function desktopNotify('));
  assert.match(show.slice(0, 300), /Notification\.permission !== 'granted'/, 'and it never asks at fire time');
});

test('a blocked notification does not take the in-app toast down with it', () => {
  const show = alarms.slice(alarms.indexOf('function desktopNotify('));
  assert.match(show.slice(0, 700), /catch \(error\)/);
  const fire = alarms.slice(alarms.indexOf('function fireDue()'));
  assert.ok(
    fire.indexOf('showToast(') < fire.indexOf('desktopNotify('),
    'the toast fires first, so the desktop one is a bonus',
  );
});

test('the dialog does not promise alarms it cannot deliver', () => {
  // There is no service worker and no push subscription, so a closed browser gets nothing.
  assert.match(modal, /Nothing is sent by email or push\./);
  assert.match(alarms, /There is no service worker and no push subscription/);
});

// ---- the form ---------------------------------------------------------------------------------

test('a memo needs a title and a date, and says which is missing', () => {
  assert.match(alarms, /Give the memo a title\./);
  assert.match(alarms, /Pick a date for the memo\./);
});

test('typing survives a background render', () => {
  assert.match(alarms, /el\.addEventListener\('input', \(\) => collectDraft\(overlay\)\)/);
});

test('the reminder is opt-in', () => {
  assert.match(modal, /<option value="" \$\{remind == null \? 'selected' : ''\}>Don't remind me<\/option>/);
});

test('everything rendered has styles', () => {
  for (const cls of ['wb-cal-memo', 'wb-cal-add', 'wb-cal-why']) {
    assert.ok(css.includes(`.${cls}`), `.${cls} is rendered but unstyled`);
  }
  // Touch has no hover, so the add button must not be hover-only there.
  assert.match(css, /@media \(hover: none\) \{ \.wb-cal-add \{ opacity: \.6; \} \}/);
});

test('memos survive a download and restore, but never reach the market', () => {
  // They are content, like records. A backup that dropped them would lose work; a
  // structure-only market install carrying them would publish somebody's notes.
  const io = readFileSync(new URL('../src/workspace/data-io.js', import.meta.url), 'utf8');
  assert.match(io, /Array\.isArray\(app\.memos\) && app\.memos\.length \? \{ memos: clone\(app\.memos\) \} : \{\}/);
  assert.match(main, /const memos = includeItems && Array\.isArray\(src\.memos\)/);
});

test('a restored memo is re-armed rather than arriving already fired', () => {
  assert.match(main, /\.map\(\(m\) => \(\{ \.\.\.m, id: wbUid\(\), notifiedAt: '' \}\)\)/);
});
