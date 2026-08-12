import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// "Make the logs in workspace clickable so I can redirect to its record, also other member of
// workspace can comment, like and Task (a modal will open to create a task, wire it to My
// Task)." The feed's own posts already had like/comment/task; the SYSTEM activity rows below
// them had none, and pointed nowhere.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');

function fn(name) {
  const at = main.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return main.slice(at, main.indexOf('\n}', at));
}

test('a log line links to the record it describes', () => {
  const body = fn('wbActivityHref');
  assert.match(body, /if \(!ev\?\.appId \|\| !ev\?\.itemId\) return '';/,
    'an entry about no record must not pretend to point at one');
  assert.match(body, /workspace_id: workspace\.id, app_id: ev\.appId, item_id: ev\.itemId/);
  // Every write that knows a record now records which one.
  // Six now: the five original writes, plus the inline single-field save on the record page.
  assert.equal((main.match(/appId: app\.id, itemId: item\.id/g) || []).length, 6);
});

test('entries written before this stay plain text', () => {
  // Old rows carry no ids, so the guard above leaves them unlinked rather than linking wrong.
  const row = fn('wbActivityRow');
  assert.match(row, /const body = href\s*[\r\n]+\s*\? `<a class="wb-act-text wb-act-link"/);
  assert.match(row, /: `<div class="wb-act-text">\$\{ev\.text\}<\/div>`/);
});

test('a log line carries the same three actions a post does', () => {
  const bar = fn('wbActivityBar');
  assert.match(bar, /data-wb-act-like="\$\{h\(ev\.id\)\}"/);
  assert.match(bar, /data-wb-act-comment-toggle="\$\{h\(ev\.id\)\}"/);
  assert.match(bar, /data-wb-act-task="\$\{h\(ev\.id\)\}"/);
  // Task is offered only to somebody who could create one.
  assert.match(bar, /const canTask = can\('tasks\.manage', companyId\);/);
  assert.match(bar, /\$\{canTask \? `<button/);
});

test('the task is a real task, through the one task model', () => {
  const body = fn('wbCreateTaskFromActivity');
  // wbCreateTaskFromPost is the existing path that writes a row to tasks -- reusing it is
  // what makes the task appear in My Tasks instead of being a workspace-only to-do.
  assert.match(body, /await wbCreateTaskFromPost\(companyId, \{/);
  assert.match(body, /entry\.task = \{ id: saved\.id/, 'the chip is a receipt, not the task');
  assert.match(body, /It is in My Tasks now\./);
  // A refused create must not stamp a chip claiming success.
  assert.ok(body.indexOf('if (!saved) return;') < body.indexOf('entry.task ='));
});

test('the task title is words, not the markup the log stores', () => {
  assert.match(fn('wbActivityPlainText'), /replace\(\/<\[\^>\]\*>\/g, ''\)/);
});

test('like and comment live on the entry, and persist', () => {
  const like = fn('wbToggleActivityLike');
  assert.match(like, /entry\.likes = likes\.includes\(myId\) \? likes\.filter/);
  assert.match(like, /wbSave\(companyId\);/);
  const comment = fn('wbAddActivityComment');
  assert.match(comment, /if \(!body\) return;/, 'an empty comment is not a comment');
  assert.match(comment, /wbSave\(companyId\);/);
});

test('the dialog is routed and its handlers are bound', () => {
  assert.match(main, /if \(state\.modal === 'wb-activity-task'\) return renderActivityTaskModal\(activeCompanyId\(\), state\.wbTaskFromActivityId\);/);
  for (const selector of ['data-wb-act-like', 'data-wb-act-comment-toggle', 'data-wb-act-comment-send', 'data-wb-act-task']) {
    // A plain substring, not a built regex: these selectors contain characters that need
    // escaping, and getting that wrong fails the test for the wrong reason.
    assert.ok(main.includes(`bind('[${selector}]'`), `${selector} is rendered but never bound`);
  }
  assert.match(main, /event\.target\.matches\('\[data-wb-activity-task-form\]'\)/);
  // The submit says it is working and releases on every path.
  assert.match(main, /const done = beginSubmitting\(event\.target, 'Creating…'\);/);
  assert.match(main, /\.finally\(done\);/);
});

// --- who did it ----------------------------------------------------------------------------
// "can you add who's user do this activity?" -- the feed said what happened and when, and
// never who.

test('the actor is stamped where every entry passes through', () => {
  // Not at each call site: there are six of them, and a writer that forgets is a silent gap.
  const body = fn('wbLogActivity');
  assert.match(body, /const actor = activeSession\(\)\.profile \|\| \{\};/);
  assert.match(body, /actorId: actor\.id \|\| '',/);
  assert.match(body, /actor: actor\.full_name \|\| actor\.email \|\| '',/);
  // Spread last so an entry may still say who it was on behalf of somebody else.
  assert.ok(body.indexOf('actor: actor.full_name') < body.indexOf('...entry'));
});

test('the name is resolved live, so a rename shows on past entries', () => {
  const body = fn('wbActivityRow');
  assert.match(body, /const member = ev\.actorId \? wbMemberById\(companyId, ev\.actorId\) : null;/);
  // The stored name is only the fallback for somebody who no longer resolves.
  assert.match(body, /const actorName = live \? live\.name : \(ev\.actor \|\| ''\);/);
});

test('an entry written before this stays as it was', () => {
  // No actor recorded, so none is shown -- inventing one would be worse than the gap.
  assert.match(fn('wbActivityRow'), /const actor = actorName\s*[\r\n]+\s*\? `<span class="wb-act-actor">/);
  assert.match(fn('wbActivityRow'), /\$\{actor \? '<span class="wb-act-sep">·<\/span>' : ''\}/);
});
