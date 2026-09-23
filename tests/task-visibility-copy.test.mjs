import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The task app's words are how the team learns what to write. They steer every update toward the
// four things the owner otherwise has to chase: what happened, what's next, what's blocking it,
// and the proof. These pin that copy and keep Questbase and the task app using the same words.

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const detail = read('taskmanagement/js/views/TaskDetailView.js');
const newTask = read('taskmanagement/js/views/NewTaskPageView.js');
const constants = read('taskmanagement/js/constants.js');
const main = read('src/main.js');

const DESC = 'What needs to happen? Include details, location, client, photos needed, or next step.';

test('new and edit task descriptions ask for the details field work needs', () => {
  assert.ok(newTask.includes(`placeholder="${DESC}"`));
  assert.ok(detail.includes(`placeholder="${DESC}"`));
  assert.doesNotMatch(newTask + detail, /Add context, links, scope/);
});

test('the update composer asks what happened, what is next, blockers and proof', () => {
  assert.match(detail, /placeholder="What happened\? What's next\? Blocked by anything\? Paste a photo\/proof link\. @mention to notify\."/);
  assert.match(detail, /No updates yet\. Post what happened, what's next, or what's blocking it\./);
  assert.match(detail, /What's blocking this, and what decision or help do you need\?/);
});

test('attachments are honest about being unavailable and say what to do instead', () => {
  assert.match(detail, /data-cm-soon-hint="For now, paste a photo or file link in your update\."/);
  assert.match(detail, /sub: btn\.getAttribute\('data-cm-soon-hint'\) \|\| undefined/);
});

test('Questbase uses the task app status words, in the working order', () => {
  assert.match(main, /const TASK_STATUSES = \['pending', 'todo', 'hold', 'review', 'done'\];/);
  for (const [key, label] of [['todo', 'Working on it'], ['hold', 'Stuck'], ['review', 'In review']]) {
    assert.match(main, new RegExp(`${key}: '${label}',`), `host ${key}`);
    assert.match(constants, new RegExp(`${key}: +\\{ label: '${label}'`), `task app ${key}`);
  }
  assert.ok(constants.indexOf("pending: { label: 'Pending'") < constants.indexOf("todo:    { label: 'Working on it'"));
});

test('Questbase knows the field-work type so saving through the host never resets it to admin', () => {
  assert.match(main, /const TASK_TYPES = \['lead', 'bid', 'field_work', 'admin', 'invoicing', 'ar', 'meeting', 'web_dev'\];/);
  assert.match(main, /field_work: 'Job \/ Field Work',/);
  for (const label of ['Lead / Follow-up', 'Bid / Estimate', 'Invoice / Payment', 'Software / Web']) {
    assert.ok(main.includes(`'${label}'`), label);
  }
});
