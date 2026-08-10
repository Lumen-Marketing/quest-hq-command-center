import assert from 'node:assert/strict';
import test from 'node:test';

import { createCompanySetupPanel } from '../src/onboarding/company-setup-panel.js';

// save/apply/reset each guard on `revision = expected` and raise 40001 when somebody else has
// moved it on. The panel kept its stale revision either way, so ONE conflict poisoned the
// surface: every later call re-sent the same number, was refused the same way, and the only
// escape was reloading the page by hand.
//
// Draft recovers by itself. Apply and reset deliberately do not -- see below.

const CONFLICT = { code: '40001', message: 'Workspace setup changed in another tab or device. Reload Setup before saving again.' };
const WORKSPACE = '11111111-2222-4333-8444-555555555555';

function fakeClient({ rpc, row }) {
  const calls = [];
  return {
    calls,
    client: {
      rpc: (name, args) => {
        calls.push({ name, revision: args.p_expected_revision });
        return Promise.resolve(rpc(name, args, calls.length));
      },
      from: () => ({
        select: () => ({
          eq: () => ({ maybeSingle: () => Promise.resolve({ data: row(), error: null }) }),
        }),
      }),
    },
  };
}

function panelFor(client) {
  return createCompanySetupPanel({
    createClient: () => client,
    isLive: () => true,
    h: (v) => String(v ?? ''),
    requestRender: () => {},
    showToast: () => {},
  });
}

test('a stale draft save refreshes the revision and succeeds on its own', async () => {
  let serverRevision = 7;
  const fake = fakeClient({
    row: () => ({ workspace_id: WORKSPACE, revision: serverRevision, status: 'draft', answers: {}, draft_plan: {} }),
    rpc: (name, args) => (args.p_expected_revision === serverRevision
      ? { data: { revision: serverRevision + 1, updated_at: 'now' }, error: null }
      : { data: null, error: CONFLICT }),
  });
  const panel = panelFor(fake.client);

  // The panel believes it is on revision 3; the server has moved to 7.
  const state = { profile: { revision: 3 }, plan: {}, answers: {}, screen: 'review', questionIndex: 0 };
  const saved = await panel.saveDraft(WORKSPACE, state);

  assert.equal(saved, true, 'the save should recover rather than fail');
  assert.equal(state.saveError, '', 'and leave no warning behind');
  assert.deepEqual(fake.calls.map((c) => c.revision), [3, 7], 'refused on 3, retried on the refreshed 7');
  assert.equal(state.profile.revision, 8, 'the local revision follows the server');
});

test('the draft retry happens once, not in a loop', async () => {
  // A conflict that survives the refresh must surface, not spin.
  const fake = fakeClient({
    row: () => ({ workspace_id: WORKSPACE, revision: 9 }),
    rpc: () => ({ data: null, error: CONFLICT }),
  });
  const panel = panelFor(fake.client);
  const state = { profile: { revision: 3 }, plan: {}, answers: {}, screen: 'review', questionIndex: 0 };

  const saved = await panel.saveDraft(WORKSPACE, state);
  assert.equal(saved, false);
  assert.equal(fake.calls.length, 2, 'the original and exactly one retry');
  assert.match(state.saveError, /changed in another tab or device/);
});

test('an ordinary save failure is not treated as a conflict', async () => {
  const fake = fakeClient({
    row: () => ({ workspace_id: WORKSPACE, revision: 9 }),
    rpc: () => ({ data: null, error: { code: '42501', message: 'Company admin access required' } }),
  });
  const panel = panelFor(fake.client);
  const state = { profile: { revision: 3 }, plan: {}, answers: {}, screen: 'review', questionIndex: 0 };

  const saved = await panel.saveDraft(WORKSPACE, state);
  assert.equal(saved, false);
  assert.equal(fake.calls.length, 1, 'no retry for a permission refusal');
  assert.match(state.saveError, /Company admin access required/);
});
