import assert from 'node:assert/strict';
import test from 'node:test';

import { createRecordEvents } from '../src/workspace/record-events.js';

// The alarm. "It also alarms when the date and time comes."
//
// There is no server job, so the alarm is raised by whichever open session notices the moment has
// passed. That makes it a race: two tabs, or one tab reloaded, both notice the same row. So
// noticing is a CLAIM -- an update that only takes rows whose notified_at is still null -- and
// only what came back is announced. These tests are mostly about that.

const ago = (mins) => new Date(Date.now() - mins * 60000).toISOString();
const ahead = (mins) => new Date(Date.now() + mins * 60000).toISOString();

function bench({ rows = [], claimed = null, claimError = null } = {}) {
  const notified = [];
  const updates = [];
  const state = {};
  /** The chain the query builder makes, thin enough to see what was asked for. */
  const table = {
    // read
    select() { return table; },
    eq() { return table; },
    order() { return table; },
    then(ok) { return Promise.resolve(ok({ data: rows })); },
    // write
    update(patch) { updates.push(patch); return table; },
    in(_col, ids) { updates.push(ids); return table; },
    is() {
      // The claim ends in .select(), which must resolve rather than chain -- so the last call
      // wins by returning a thenable of its own.
      return {
        select: async () => ({
          data: claimed === null ? rows.map((r) => ({ id: r.id })) : claimed,
          error: claimError,
        }),
      };
    },
  };
  const mod = createRecordEvents({
    state,
    activeProfileId: () => 'me',
    appHref: (p) => p,
    companyPath: (section, params) => `/${section}?${new URLSearchParams(params)}`,
    createSupabaseClient: () => ({ from: () => table }),
    isLiveSupabaseSession: () => true,
    notifyLocalEvent: (...args) => notified.push(args),
    render: () => {},
  });
  return {
    mod, state, notified, updates,
  };
}

const row = (over = {}) => ({
  id: 'e1',
  workspace_id: '42959c90-a8e6-4ec4-af78-82036849dba7',
  app_id: 'app-1',
  item_id: 'item-1',
  kind: 'call',
  title: 'Follow up',
  to_number: '555 111 2222',
  scheduled_for: ago(5),
  status: 'scheduled',
  notified_at: null,
  created_by: 'me',
  ...over,
});

test('a reminder whose time has come is announced, once', async () => {
  const b = bench({ rows: [row()] });
  const out = await b.mod.checkReminders('co1');
  assert.equal(out.length, 1);
  assert.equal(b.notified.length, 1);
  const [type, title, body, href, sourceType, sourceId, companyId, recipients] = b.notified[0];
  assert.equal(type, 'workspace.reminder');
  assert.equal(title, 'Call: Follow up');
  assert.match(body, /Due now/);
  assert.equal(sourceType, 'workspace_item');
  assert.equal(sourceId, 'item-1');
  assert.equal(companyId, 'co1');
  assert.deepEqual(recipients, ['me'], 'the alarm is for whoever arranged it');
  // The link opens the record it was scheduled on, by the key the ROUTE uses -- the stored uuid
  // with the prefix the App Builder gives its workspaces.
  assert.match(href, /workspace=ws-42959c90-a8e6-4ec4-af78-82036849dba7/);
  assert.match(href, /item_id=item-1/);
});

test('it claims the row before saying anything', async () => {
  const b = bench({ rows: [row()] });
  await b.mod.checkReminders('co1');
  const [patch, ids] = b.updates;
  assert.ok(patch.notified_at, 'nothing was stamped, so it would go off again');
  assert.deepEqual(ids, ['e1']);
});

test('the session that loses the race stays quiet', async () => {
  // Two tabs both see the row. The update takes only what is still unclaimed, so the loser is
  // handed nothing back -- and must not announce on the strength of having seen it.
  const b = bench({ rows: [row()], claimed: [] });
  assert.deepEqual(await b.mod.checkReminders('co1'), []);
  assert.equal(b.notified.length, 0);
});

test('only the rows actually won are announced', async () => {
  const b = bench({ rows: [row({ id: 'e1' }), row({ id: 'e2' })], claimed: [{ id: 'e2' }] });
  const out = await b.mod.checkReminders('co1');
  assert.deepEqual(out.map((r) => r.id), ['e2']);
  assert.equal(b.notified.length, 1);
});

test('a failed claim announces nothing', async () => {
  const b = bench({ rows: [row()], claimError: { message: 'denied' } });
  assert.deepEqual(await b.mod.checkReminders('co1'), []);
  assert.equal(b.notified.length, 0);
});

test('nothing due means nothing is written at all', async () => {
  const b = bench({ rows: [row({ scheduled_for: ahead(30) })] });
  assert.deepEqual(await b.mod.checkReminders('co1'), []);
  assert.deepEqual(b.updates, [], 'an update per pass with nothing to say is a write every minute');
  assert.equal(b.notified.length, 0);
});

test('the held rows are dropped once one has gone off', async () => {
  // Otherwise the next pass reads the same cached row, sees notified_at still null on the copy
  // it is holding, and rings again.
  const b = bench({ rows: [row()] });
  await b.mod.checkReminders('co1');
  assert.equal(b.state.wbEvents?.co1, undefined);
});

test('with no live session it does nothing rather than guessing', async () => {
  const b = bench({ rows: [row()] });
  const mod = createRecordEvents({
    state: {},
    activeProfileId: () => 'me',
    appHref: (p) => p,
    companyPath: () => '/',
    createSupabaseClient: () => null,
    isLiveSupabaseSession: () => false,
    notifyLocalEvent: () => { throw new Error('must not announce'); },
    render: () => {},
  });
  assert.deepEqual(await mod.checkReminders('co1'), []);
});

test('the rows are held per company, and read back without another fetch', async () => {
  const b = bench({ rows: [row()] });
  assert.deepEqual(b.mod.companyEvents('co1'), [], 'the first read has nothing yet, and starts a fetch');
  await b.mod.loadCompanyEvents('co1');
  assert.equal(b.mod.companyEvents('co1').length, 1);
  assert.equal(b.mod.companyEvents('other').length, 0);
  b.mod.forgetCompanyEvents('co1');
  assert.deepEqual(b.state.wbEvents.co1, undefined);
});
