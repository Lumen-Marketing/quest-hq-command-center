import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { QUICK_CREATE, quickEntry } from '../src/workspace/record-layout.js';
import { press } from '../src/workspace/quick-create.js';

// "On Quick Create tiles add a Task, so we can add a task for someone to do that will be saved
// on the task on My Work."
//
// A task is not a field on the record. It is a row in public.tasks, and the Tasks module already
// owns making one -- the assignee, the due date, the notification that tells them, and the My
// Work listing. Quick Create opens THAT form pre-filled rather than growing a second task writer.

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
// The modal moved out of main.js: it is reachable only from a record page, and the entry chunk
// every session downloads was carrying it regardless.
const task = readFileSync(new URL('../src/workspace/record-task.js', import.meta.url), 'utf8');

function harness({ withContact = true, title = '58th Pl' } = {}) {
  const fields = [
    { id: 'f-name', label: 'Project', type: 'text', config: {} },
    ...(withContact ? [{ id: 'f-c', label: 'Contact', type: 'company_contact', config: {} }] : []),
  ];
  const item = { id: 'item-1', values: { 'f-name': title, ...(withContact ? { 'f-c': 'contact-9' } : {}) } };
  const app = { id: 'app-1', name: 'Prospects', fields, items: [item], recordLayout: null };
  const went = [];
  const saved = [];
  const opened = [];
  const ctx = {
    can: () => true,
    render: () => { went.push('render'); },
    showToast: () => {},
    wbDoc: () => ({ workspaces: [{ id: 'ws-1', apps: [app] }] }),
    wbSave: async () => { saved.push('save'); },
    wbUid: () => 'new-1',
    wbItemTitle: (a, i) => i.values['f-name'] || '',
    // What the tile actually does now: raises the task form over the record.
    openRecordTask: (seed) => { opened.push(seed); },
    navigate: (path) => { went.push(path); },
    companyPath: (section, query, companyId) => `/company/${companyId}/${section}?${new URLSearchParams(query)}`,
  };  const seat = {
    companyId: 'co1', workspaceId: 'ws-1', appId: 'app-1', itemId: 'item-1',
  };
  return {
    ctx, seat, app, went, saved, opened, run: (key) => press(key, seat, ctx),
  };
}

test('Task is offered on the card, and is not a field', () => {
  const entry = quickEntry('task');
  assert.ok(entry, 'the tile is missing');
  assert.equal(entry.module, 'task');
  assert.equal(entry.field, undefined, 'a task is a row in public.tasks, not a column on this app');
  assert.ok(QUICK_CREATE.some((e) => e.key === 'task'));
});

test('pressing Task raises the form on the record, without leaving it', async () => {
  // A trip to the Tasks section to type two fields loses the reader’s place and brings them
  // back by the browser’s back button, if at all.
  const h = harness();
  assert.equal(await h.run('task'), 'task');
  assert.equal(h.opened.length, 1, 'the task form was not opened');
  assert.deepEqual(h.went, [], 'the record page was navigated away from');
});

test('the record it was pressed on travels with it', async () => {
  const h = harness();
  await h.run('task');
  const [seed] = h.opened;
  // The name, so the task says what it is about without anybody retyping it...
  assert.equal(seed.title, '58th Pl');
  // ...the contact, which is a real link rather than a sentence...
  assert.equal(seed.contactId, 'contact-9');
  // ...and the app, so the modal can say which record this is for.
  assert.equal(seed.appName, 'Prospects');
  assert.equal(seed.companyId, 'co1');
});

test('a record with no contact simply sends no contact', async () => {
  // Rather than an empty one, which would show as a linked contact that is not there.
  const h = harness({ withContact: false });
  await h.run('task');
  assert.equal(h.opened[0].contactId, '');
  assert.equal(h.opened[0].title, '58th Pl');
});
test('it writes nothing to the app', async () => {
  // The other four tiles add a field. A task must not: it is not a column on this record, and
  // growing one would put an empty Task box on every record in the app for ever.
  const h = harness();
  const before = h.app.fields.length;
  await h.run('task');
  assert.equal(h.app.fields.length, before);
  assert.deepEqual(h.saved, [], 'the app was not saved, because nothing about it changed');
});

test('the form is a modal on the record, with an assignee and a due date', () => {
  assert.ok(task.includes('function renderRecordTaskModal(companyId)'));
  assert.match(main, /state.modal === 'wb-record-task'/);
  const modal = task.slice(task.indexOf('function renderRecordTaskModal'), task.indexOf('function noteOnRecord'));
  assert.ok(modal.includes("field('Task title', 'title'"));
  assert.ok(modal.includes('name="assignee_id"'), "no assignee: nobody would be told to do it");
  assert.ok(modal.includes("field('Due date', 'due'"));
  assert.ok(modal.includes('wbMembers(companyId)'), "the assignee list is not the company’s people");
});

test('saving goes through the one shared writer, so it lands in My Tasks', () => {
  // Not re-implemented here: wbCreateTaskFromPost checks the permission, stamps the creator,
  // writes the row through the single task shape, and notifies the assignee.
  const fn = task.slice(task.indexOf('async function createTaskFromRecord'));
  assert.ok(fn.includes('wbCreateTaskFromPost(companyId'), "the record modal writes its own task row");
  assert.ok(fn.includes('contactId: seed.contactId'), "the contact link is dropped on the way");
  const writerAt = main.indexOf('async function wbCreateTaskFromPost');
  const writer = main.slice(writerAt, main.indexOf('\n}\n', writerAt));
  assert.ok(writer.includes("requirePermission('tasks.manage'"));
  assert.ok(writer.includes("client.from('tasks').insert(taskPayload(task))"));
  assert.ok(writer.includes('notifyTaskChange(saved)'), "the assignee is never told");
  assert.ok(writer.includes('contact_id: contactId'), "the writer cannot carry a contact");
  const quick = readFileSync(new URL('../src/workspace/quick-create.js', import.meta.url), 'utf8');
  assert.ok(!/from('tasks').insert/.test(quick), "quick-create must not write a task row itself");
  assert.ok(!/from('tasks').insert/.test(task), "nor may the modal");
});
// ---- and it is actually on the card ---------------------------------------------------------
//
// Every test above this line passed while the tile was invisible. The model had it, the press
// handler did the right thing with it, main.js seeded the form from it -- and the card drew four
// buttons, because it selected on `entry.field` and a task is a row in public.tasks rather than a
// column on the app. Written, tested, unreachable.

const recordPage = readFileSync(new URL("../src/workspace/record-page.js", import.meta.url), "utf8");
const quickCreate = readFileSync(new URL("../src/workspace/quick-create.js", import.meta.url), "utf8");

/**
 * The predicate the card actually paints with, with the prose taken out.
 *
 * Comments are stripped first: the rule this replaced is NAMED in the comment above it, so a
 * check that reads the whole slice reads the explanation as if it were the code.
 */
function paintFilter() {
  const at = recordPage.indexOf("recordLayout.QUICK_CREATE");
  assert.ok(at > -1, "the card no longer paints from the model");
  const slice = recordPage.slice(at, recordPage.indexOf(".map(", at));
  return slice.split(String.fromCharCode(10))
    .filter((line) => !line.trim().startsWith("//"))
    .join(String.fromCharCode(10));
}

/** The modules press() can actually carry out, read out of press() itself. */
/**
 * The modules press() can actually carry out, read out of press() itself.
 *
 * Two dispatch shapes, because press() has grown two: `entry.module === 'x'` for one that is
 * handled on its own, and a list membership test for several that share a dialog. A parser
 * that knows only the first reports every module in the second as unimplemented -- which is
 * the same false alarm as missing them entirely, just louder.
 */
function implementedModules() {
  const out = new Set();
  quickCreate.split("entry.module === ").slice(1).forEach((part) => {
    const quote = part[0];
    out.add(part.slice(1, part.indexOf(quote, 1)));
  });
  // e.g. ['field', 'call', 'sms'].includes(entry.module)
  quickCreate.split(".includes(entry.module)").slice(0, -1).forEach((part) => {
    const list = part.slice(part.lastIndexOf("["));
    (list.match(/['"]([a-z_]+)['"]/g) || []).forEach((hit) => out.add(hit.slice(1, -1)));
  });
  return out;
}

test("the card draws the Task tile", () => {
  const filter = paintFilter();
  assert.ok(
    !filter.includes("entry.field"),
    "selecting on entry.field drops every tile that is not a column -- which is all of the modules",
  );
  assert.ok(filter.includes("entry.soon"), "the card selects on what the model marks as unbuilt");
  assert.equal(quickEntry("task").soon, undefined, "so Task is drawn");
});

test("what is drawn is what works, in both directions", () => {
  // The invariant that closes this for the next tile as well: a tile with nothing behind it must
  // not be drawn, and a tile that works must not be left out. Both sides are derived -- the
  // modules from press(), the flag from the model -- so neither can be satisfied by writing it.
  const built = implementedModules();
  assert.ok(built.has("task"), "press() no longer handles a task");
  QUICK_CREATE.forEach((entry) => {
    const drawn = !entry.soon;
    const works = !!entry.field || built.has(entry.key);
    assert.equal(
      drawn,
      works,
      works
        ? `${entry.key} works and is not drawn -- exactly how Task shipped invisible`
        : `${entry.key} is drawn and press() does nothing with it`,
    );
  });
});

test("who will work on it is asked on the modal, from the company's own people", () => {
  // "who will work with this". The list is wbMembers -- the people in this company -- and the
  // chosen one is what decides whose My Tasks the row shows up in. Left blank it is Me, which
  // is the common case for a note somebody makes while reading a record.
  const modal = task.slice(task.indexOf('function renderRecordTaskModal'), task.indexOf('function noteOnRecord'));
  assert.ok(modal.includes('<option value="">Me</option>'), "an unassigned task belongs to nobody");
  assert.ok(modal.includes('wbMembers(companyId)'));
  const writerAt = main.indexOf('async function wbCreateTaskFromPost');
  const writer = main.slice(writerAt, main.indexOf('\n}\n', writerAt));
  // Blank is Me; a chosen person is translated from their profile id to the roster id the
  // tasks table stores (tests/task-assignee-identity.test.mjs pins the translation itself).
  assert.ok(writer.includes('assigneeId ? taskAssigneeId(assigneeId, companyId) : creatorId'), 'blank would save an unassigned task');
  assert.ok(writer.includes('assignee_id: rosterAssigneeId'));
});
