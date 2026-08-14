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

// The mention picker is its own fetched module now; main.js keeps only the shim that loads it.
const mentionPicker = readFileSync(join(root, 'src', 'workspace', 'mention-picker.js'), 'utf8');

function fn(name) {
  const inModule = name === 'wbBindMentionPickers';
  const from = inModule ? mentionPicker : main;
  const at = from.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  // The module's copy is indented inside its factory, so its closing brace is too.
  return from.slice(at, from.indexOf(inModule ? '\n  }' : '\n}', at));
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

// --- the comment thread ---------------------------------------------------------------------
// "can you not display all the comments only the last comment that will only be expand when
// clicked, also click again to hide it, also fix the UI as you can see the name and comment
// are almost merging so close, allow mentioning a member on the comment."

test('only the newest comment shows until asked', () => {
  const body = fn('wbActivityComments');
  assert.match(body, /const shown = expanded \? comments : comments\.slice\(-1\);/);
  assert.match(body, /const hidden = comments\.length - 1;/);
  // One comment needs no control at all.
  assert.match(body, /const more = hidden > 0/);
});

test('the same control hides them again', () => {
  const toggle = fn('wbToggleActivityCommentsMore');
  assert.match(toggle, /if \(set\.has\(id\)\) set\.delete\(id\); else set\.add\(id\);/);
  assert.match(fn('wbActivityComments'), /\$\{expanded \? 'Hide' : `Show \$\{hidden\} earlier`\}/);
  assert.match(fn('wbActivityComments'), /aria-expanded="\$\{expanded \? 'true' : 'false'\}"/);
  assert.ok(main.includes("bind('[data-wb-act-comments-more]'"), 'the control is rendered but never bound');
});

test('expanded is its own state, not the composer being open', () => {
  // openActComments controls whether the write box shows. Reusing it would mean opening the
  // box to read, and reading to write.
  const compose = fn('wbComposeState');
  assert.match(compose, /if \(!\(state\.wbCompose\.expandedActComments instanceof Set\)\) state\.wbCompose\.expandedActComments = new Set\(\);/);
  assert.match(fn('wbActivityComments'), /const open = compose\.openActComments\?\.has\(ev\.id\);/);
  assert.match(fn('wbActivityComments'), /const expanded = compose\.expandedActComments\?\.has\(ev\.id\);/);
});

test('the name, the time and the text each get their own place', () => {
  // They shared one line with no gap, so "Lumen Marketing Account" ran into "test" and then
  // into "6m ago".
  const body = fn('wbActivityComments');
  assert.match(body, /<div class="wb-cmt-head"><b>\$\{h\(name\)\}<\/b><em>/);
  assert.match(body, /<div class="wb-cmt-text">/);
  const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');
  assert.match(css, /\.wb-cmt \{\n  display: flex;/);
  assert.match(css, /\.wb-cmt-head \{\n  display: flex;[\s\S]*?gap: 8px;/);
  assert.match(css, /\.wb-cmt-text \{[\s\S]*?overflow-wrap: anywhere;/);
});

test('@ offers the members, so the name typed is one that resolves', () => {
  // wbFeedText highlights a mention and mentionedProfileIds notifies the person, but both
  // need the name spelled exactly right from memory.
  const body = fn('wbBindMentionPickers');
  // A plain substring: matching a regex with a regex needs escaping that is easy to get
  // wrong, and a wrong one fails the test for the wrong reason.
  assert.ok(
    body.includes('/(^|\\s)@([^@\\n]*)$/.exec(input.value.slice(0, caret))'),
    '@ must start a word, or an email address opens the menu',
  );
  assert.match(body, /matches = wbMembers\(companyId\)/);
  assert.match(body, /input\.value = `\$\{before\}@\$\{member\.name\} \$\{after\}`;/, 'a trailing space, or the next word joins the mention');
  for (const key of ['ArrowDown', 'ArrowUp', 'Escape']) assert.ok(body.includes(`'${key}'`), `${key} is unhandled`);
  assert.ok(main.includes('wbBindMentionPickers(document, companyId)'), 'the picker is never bound');
  // And main.js only fetches it, so a page with no mention box never pays for it.
  assert.match(main, /import\('\.\/workspace\/mention-picker\.js'\)/);
  assert.match(main, /if \(!\(root \|\| document\)\.querySelector\('\[data-wb-mention\]'\)\) return;/);
});

test('Enter picks a mention without also sending the comment', () => {
  // Both handlers are on the same element, so stopPropagation does not reach the other one,
  // and by the time it runs the picker has already closed the list -- "is the list open"
  // would answer no and send a comment nobody finished writing.
  assert.match(fn('wbBindMentionPickers'), /event\.mentionHandled = true;/);
  assert.match(main, /if \(event\.mentionHandled\) return;/);
  assert.match(main, /const results = el\.closest\('\[data-wb-mention-wrap\]'\)\?\.querySelector\('\[data-wb-mention-results\]'\);\r?\n\s*if \(results && !results\.hidden\) return;/);
});

// --- the feed orders by activity, not by age ------------------------------------------------
// "make this activity log sort by updated, so when new comments on an old post or activity
// that post or activity will go to top."

test('a comment pulls its thread back to the top', () => {
  const body = fn('wbFeedBumpedAt');
  assert.match(body, /let latest = String\(entry\?\.ts \|\| ''\);/);
  assert.match(body, /const at = String\(comment\?\.editedAt \|\| comment\?\.ts \|\| ''\);/,
    'editing a comment is activity on the thread too');
  assert.match(body, /if \(at > latest\) latest = at;/);
});

test('both halves of the stream are ordered the same way', () => {
  const stream = fn('wbFeedStream');
  assert.match(stream, /kind: 'post', ts: wbFeedBumpedAt\(p\)/);
  assert.match(stream, /kind: 'act', ts: wbFeedBumpedAt\(a\)/);
  // Sort first, THEN trim: the other order drops an old thread with a new reply before its
  // comment has been taken into account.
  assert.ok(stream.indexOf('.sort(') < stream.indexOf('.slice(0, 60)'));
});

test('a like does not reshuffle the feed', () => {
  // Likes carry no timestamp, and a like is an acknowledgement rather than something to come
  // back and read -- bumping for one would move the ground under anybody scrolling.
  const body = fn('wbFeedBumpedAt');
  assert.ok(!/likes/.test(body), 'likes must not contribute to the bump time');
});

test('commenting refreshes one entry instead of stacking identical ones', () => {
  // "they are commented on the same item, can you make it one and just update the activity
  // log every time someone adds a comment on it."
  const body = fn('wbLogCommentActivity');
  assert.match(body, /entry\.appId === app\.id && entry\.itemId === item\.id && entry\.text === text/);
  assert.match(body, /existing\.ts = new Date\(\)\.toISOString\(\);/, 're-stamping is what lifts it back to the top');
  // The bumped card reports whoever spoke last.
  assert.match(body, /existing\.actorId = actor\.id \|\| '';/);
  // Only the first comment on a record creates an entry at all.
  assert.ok(body.indexOf('if (existing)') < body.indexOf('wbLogActivity(workspace, {'));
  // And the caller goes through it rather than logging directly.
  assert.match(main, /wbLogCommentActivity\(workspace, app, item\);/);
  assert.equal((main.match(/Commented on <b>/g) || []).length, 1, 'one place builds this text');
});
