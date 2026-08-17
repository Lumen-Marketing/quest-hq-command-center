import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// A record carries its history when it is moved, and the cap on the workspace log kept
// deleting it.
//
// "I created an item on Prospects, then moved it to Leads — the activity should still be there,
// and when I move it to Nurturing it should still be there. It only records the recent activity
// from the other app, not from the start."
//
// Two causes. The log is newest-first and truncated from the TAIL, and the move APPENDED the
// carried entries — putting a record's oldest history exactly where truncation starts. And the
// cap was 60 for the whole workspace, which three apps sharing one workspace pass in a morning.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const push = readFileSync(join(root, 'src', 'workspace', 'button-push.js'), 'utf8').replace(/\r\n/g, '\n');

test('the carried history is merged by time, never appended to the tail', () => {
  // This is the half that actually loses the history: the tail is what truncation eats.
  assert.doesNotMatch(push, /target\.workspace\.activity\.push\(\.\.\.mine/, 'still appended to the tail');
  assert.match(push, /\.sort\(\(a, b\) => String\(b\?\.ts \|\| ''\)\.localeCompare\(String\(a\?\.ts \|\| ''\)\)\)/);
});

test('the log stores far more than the feed draws', () => {
  const stored = /workspace\.activity\.length > ([0-9]+)\) workspace\.activity\.length = ([0-9]+);/.exec(main);
  assert.ok(stored, 'the activity cap has moved');
  assert.equal(stored[1], stored[2], 'the two numbers disagree');
  const kept = Number(stored[1]);
  // wbFeedStream sorts and slices its own 60, so the store was never what limited the feed —
  // it was only ever limiting how much history a record could keep.
  assert.match(main, /\.slice\(0, 60\)/);
  assert.ok(kept >= 400, `the store keeps only ${kept}, which three apps in one workspace pass in a morning`);
});

test('a record moved twice still owns its whole history', async () => {
  // Driven through the real push: create in App 1, move to App 2, move to App 3.
  const { createButtonPush } = await import('../src/workspace/button-push.js');
  const f = (id, label, type) => ({
    id, label, type, config: {},
  });
  const mk = (id, name) => ({
    id, name, fields: [f(`${id}-n`, 'Name', 'text'), f(`${id}-b`, 'Send', 'button')], items: [],
  });
  const [A1, A2, A3] = [mk('app1', 'App 1'), mk('app2', 'App 2'), mk('app3', 'App 3')];
  A1.items = [{ id: 'i1', values: { 'app1-n': 'Juan Dela Cruz' }, comments: [{ id: 'c1', text: 'Hey' }] }];
  const ws = {
    id: 'ws1',
    name: 'Quest App Market',
    apps: [A1, A2, A3],
    activity: [
      { ts: '2026-08-17T09:00:00Z', appId: 'app1', itemId: 'i1', text: 'created in App 1' },
      { ts: '2026-08-17T09:05:00Z', appId: 'app1', itemId: 'i1', text: 'stage 2 to 3' },
    ],
  };
  let n = 0;
  const runner = createButtonPush({
    h: (v) => String(v ?? ''),
    can: () => true,
    wbDoc: () => ({ workspaces: [ws] }),
    wbSave: async () => {},
    wbUid: () => `u${(n += 1)}`,
    showToast: () => {},
    render: () => {},
    canonicalCompanyId: (id) => id || 'co1',
    activeSession: () => ({ profile: { id: 'me' } }),
    wbLogActivity: (workspace, entry) => {
      workspace.activity.unshift({ ts: new Date(2026, 7, 17, 10, n).toISOString(), ...entry });
    },
    wbItemTitle: () => 'Juan Dela Cruz',
    state: {},
    contactsApp: () => null,
    contactIntake: async () => ({ ok: true, contact: { id: 'c1' } }),
  });
  const move = (from, to) => runner.pressButton('co1', from, {
    id: `${from.id}-b`, config: { action: 'move', targetCompany: 'co1', targetApp: to },
  }, from.items[0], ws);

  await move(A1, 'app2');
  await move(A2, 'app3');

  const landed = A3.items[0];
  const mine = ws.activity.filter((e) => e.appId === 'app3' && e.itemId === landed.id);
  const said = mine.map((e) => e.text).join(' | ');
  assert.ok(/created in App 1/.test(said), `the beginning was lost: ${said}`);
  assert.ok(/stage 2 to 3/.test(said), `an edit was lost: ${said}`);
  assert.equal(mine.length, 4, said);
  assert.equal((landed.comments || []).length, 1, 'the conversation did not come with it');
  // Nothing left pointing at an app the record is no longer in.
  assert.equal(ws.activity.filter((e) => ['app1', 'app2'].includes(e.appId) && e.itemId === landed.id).length, 0);
});
