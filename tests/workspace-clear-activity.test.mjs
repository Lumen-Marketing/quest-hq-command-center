import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { clearableCount, clearedActivity, logStamp, matchBuilderWorkspace } from '../src/workspace/activity-log.js';
import {
  clearWorkspaceTransfers, clearableTransferCount, clearableTransfers, previewWorkspaceTransferClear,
} from '../src/workspace/transfer-clear.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const modal = readFileSync(new URL('../src/workspace/builder-modal.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const transferClear = readFileSync(new URL('../src/workspace/transfer-clear.js', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/20260909181650_wb_transfer_clear_atomic.sql', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const fn = (name) => {
  const at = main.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} should exist`);
  return main.slice(at, main.indexOf('\n}\n', at));
};
const clearHandlerSource = main.slice(
  main.indexOf('async function wbClearWorkspaceActivity(button) {'),
  main.indexOf('\n/**\n * Prepare/consume the server', main.indexOf('async function wbClearWorkspaceActivity(button) {')),
);
const makeClearHandler = (deps) => new Function(
  ...Object.keys(deps),
  `return (${clearHandlerSource});`,
)(...Object.values(deps));
const clearHarness = ({ save, clear = async () => ({ removed: 2 }), live = false, password = '' } = {}) => {
  const workspace = { activity: [{ id: 'before' }] };
  const modalState = {
    kind: 'clear-activity', companyId: 'company', workspaceId: 'workspace', actionPending: false,
    transferResult: null, preview: { status: 'ready', data: { request_id: 'request' } },
    sessionEpoch: 'u:profile:7', returnTo: null, error: '',
  };
  const state = { builderModal: modalState };
  let passwordSeen = null;
  let clearCalls = 0;
  const deps = {
    state,
    can: () => true,
    render: () => {},
    wbFind: () => ({ workspace }),
    isLiveSupabaseSession: () => live,
    document: { getElementById: () => ({ value: password }) },
    confirmAccountPassword: async (value) => { passwordSeen = value; return { ok: true }; },
    wbClearActionContextCurrent: (modal) => state.builderModal === modal,
    wbClearWorkspaceTransfers: async (...args) => { clearCalls += 1; return clear(...args); },
    clearedActivity: () => [{ id: 'clear-marker' }],
    actorName: () => 'Rom',
    wbUid: () => 'clear-marker',
    wbSave: save,
    showToast: () => {},
    activeCompanyId: () => 'company',
  };
  return { handler: makeClearHandler(deps), workspace, modalState, state, passwordSeen: () => passwordSeen, clearCalls: () => clearCalls };
};
const OPS = '11111111-2222-3333-4444-555555555555';

test('activity clearing leaves one honest trace and never mutates before save', () => {
  const workspace = { activity: [{ id: '1' }, { id: '2' }] };
  const result = clearedActivity(workspace, { actorName: 'Rom', at: '2026-09-10T00:00:00Z', id: 'clear', transfersRemoved: 3 });
  assert.equal(workspace.activity.length, 2);
  assert.equal(result.length, 1);
  assert.match(result[0].text, /2 entries and 3 entries of import & export history removed/);
  assert.equal(clearableCount(undefined), 0);
  assert.match(logStamp('2026-09-10T00:00:00Z'), /2026/);
});

test('the server preview, not the cached 200 rows, supplies the destructive count', async () => {
  const calls = [];
  const client = { rpc(name, args) {
    calls.push([name, args]);
    return Promise.resolve({ data: { request_id: 'request-1', transfer_count: 201, per_app: { leads: 201 }, expires_at: '2026-09-10T00:05:00Z' }, error: null });
  } };
  const preview = await previewWorkspaceTransferClear({ client, state: { wbTransfers: [] }, workspace: { id: `ws-${OPS}` } });
  assert.equal(preview.transfer_count, 201);
  assert.deepEqual(calls, [['preview_wb_transfer_clear', { p_workspace_id: OPS }]]);
  assert.doesNotMatch(transferClear, /client\.from\(/, 'a manager without record-view uses RPC, never a direct table select/insert');
});

test('clear consumes only returned snapshot ids and preserves new cached arrivals', async () => {
  const state = { wbTransfers: [
    { id: 'old-1', workspace_id: OPS, app_id: 'leads', direction: 'export' },
    { id: 'new-after-preview', workspace_id: OPS, app_id: 'leads', direction: 'import' },
    { id: 'other', workspace_id: 'other', app_id: 'other', direction: 'export' },
  ] };
  const calls = [];
  const response = {
    request_id: 'request-1', removed: 1, removed_ids: ['old-1'],
    tombstones: [{ id: 't1', workspace_id: OPS, app_id: 'leads', direction: 'cleared', record_count: 1, created_at: '2026-09-10T00:00:00Z' }],
  };
  const client = { rpc(name, args) { calls.push([name, args]); return Promise.resolve({ data: response, error: null }); } };
  const result = await clearWorkspaceTransfers({ client, state, workspace: { id: `ws-${OPS}` }, preview: { request_id: 'request-1' } });
  assert.equal(result.removed, 1);
  assert.deepEqual(calls, [['clear_wb_transfer_log', { p_request_id: 'request-1' }]]);
  assert.deepEqual(state.wbTransfers.map((row) => row.id).sort(), ['new-after-preview', 'other', 't1']);
});

test('a rejected atomic clear leaves the local activity/transfer state alone', async () => {
  const state = { wbTransfers: [{ id: 'old-1', workspace_id: OPS, app_id: 'leads', direction: 'export' }] };
  const client = { rpc: () => Promise.resolve({ data: null, error: { message: 'request expired' } }) };
  await assert.rejects(
    clearWorkspaceTransfers({ client, state, workspace: { id: `ws-${OPS}` }, preview: { request_id: 'expired' } }),
    /request expired/,
  );
  assert.equal(state.wbTransfers.length, 1);
});

test('repeated completed results do not duplicate tombstones', async () => {
  const state = { wbTransfers: [{ id: 'old-1', workspace_id: OPS, app_id: 'leads', direction: 'export' }] };
  const result = { request_id: 'request-1', removed: 1, removed_ids: ['old-1'], tombstones: [{ id: 't1', workspace_id: OPS, app_id: 'leads', direction: 'cleared' }] };
  const client = { rpc: () => Promise.resolve({ data: result, error: null }) };
  const input = { client, state, workspace: { id: `ws-${OPS}` }, preview: { request_id: 'request-1' } };
  await clearWorkspaceTransfers(input);
  await clearWorkspaceTransfers(input);
  assert.deepEqual(state.wbTransfers.map((row) => row.id), ['t1']);
});

test('a stale clear RPC result never changes a newer context transfer cache', async () => {
  const state = { wbTransfers: [{ id: 'old-1', workspace_id: OPS, app_id: 'leads', direction: 'export' }] };
  let current = true;
  const client = { rpc: async () => {
    current = false;
    return { data: { request_id: 'request-1', removed: 1, removed_ids: ['old-1'], tombstones: [{ id: 't1', direction: 'cleared' }] }, error: null };
  } };
  await assert.rejects(
    clearWorkspaceTransfers({ client, state, workspace: { id: `ws-${OPS}` }, preview: { request_id: 'request-1' }, isCurrentContext: () => current }),
    /no longer active/,
  );
  assert.deepEqual(state.wbTransfers.map((row) => row.id), ['old-1']);
  const wrapper = main.slice(
    main.indexOf('async function wbClearWorkspaceTransfers('),
    main.indexOf('\nfunction openWbWorkspaceModal', main.indexOf('async function wbClearWorkspaceTransfers(')),
  );
  assert.match(wrapper, /const liveSession = isLiveSupabaseSession\(\);[\s\S]*const sessionEpoch = wbClearSessionEpoch\(\);[\s\S]*const client = liveSession \? createSupabaseClient\(\) : null;[\s\S]*await import/);
  assert.match(wrapper, /isCurrentContext/);
});

test('clear epoch survives a same-account token refresh but rejects logout or an account switch', () => {
  const epochStart = main.indexOf('function wbClearSessionEpoch(');
  const epochEnd = main.indexOf('\n}\n', epochStart);
  const epochSource = main.slice(epochStart, epochEnd + 2);
  const state = { workspaceLoadEpoch: 7 };
  let session = { user: { id: 'auth-a' }, profile: { id: 'profile-a' }, access_token: 'before-reauth' };
  const epoch = new Function('state', 'activeSession', `return (${epochSource});`)(state, () => session);
  const before = epoch();
  session = { ...session, access_token: 'after-reauth' };
  assert.equal(epoch(), before, 'a password reauthentication may rotate the token without cancelling itself');
  state.workspaceLoadEpoch += 1;
  assert.notEqual(epoch(), before, 'logout/reset advances the data context');
  state.workspaceLoadEpoch = 7;
  session = { user: { id: 'auth-b' }, profile: { id: 'profile-b' }, access_token: 'other-user-token' };
  assert.notEqual(epoch(), before, 'a different signed-in identity is never the same clear action');
  assert.doesNotMatch(epochSource, /access_token/);
  assert.match(epochSource, /state\.workspaceLoadEpoch/);
});

test('offline demo retains local clear behavior without an RPC', async () => {
  const state = { wbTransfers: [{ id: 'old', workspace_id: OPS, app_id: 'leads', direction: 'export' }] };
  const preview = await previewWorkspaceTransferClear({ client: null, state, workspace: { id: `ws-${OPS}` } });
  const result = await clearWorkspaceTransfers({ client: null, state, workspace: { id: `ws-${OPS}` }, preview });
  assert.equal(result.removed, 1);
  assert.equal(state.wbTransfers[0].direction, 'cleared');
});

test('a live session fails closed instead of using the demo cache', async () => {
  const state = { wbTransfers: [{ id: 'cached', workspace_id: OPS, app_id: 'leads', direction: 'export' }] };
  await assert.rejects(
    previewWorkspaceTransferClear({ client: null, liveSession: true, state, workspace: { id: `ws-${OPS}` } }),
    /live transfer log is unavailable/,
  );
  await assert.rejects(
    previewWorkspaceTransferClear({ client: { rpc: () => { throw new Error('must not call'); } }, liveSession: true, state, workspace: { id: '' } }),
    /cannot clear a live transfer log/,
  );
  await assert.rejects(
    clearWorkspaceTransfers({ client: null, liveSession: true, state, workspace: { id: `ws-${OPS}` }, preview: { request_id: 'local', local: true } }),
    /live transfer log is unavailable/,
  );
  assert.deepEqual(state.wbTransfers.map((row) => row.id), ['cached']);
});

test('legacy cache helpers still exclude tombstones, but live UI does not rely on them', () => {
  const rows = [{ id: '1', workspace_id: OPS, app_id: 'a', direction: 'export' }, { id: '2', workspace_id: OPS, app_id: 'a', direction: 'cleared' }];
  assert.equal(clearableTransferCount(rows, OPS), 1);
  assert.deepEqual([...clearableTransfers(rows, OPS)], [['a', 1]]);
});

test('the migration keeps the request ledger private and snapshots bounded exact ids', () => {
  assert.match(migration, /create table public\.wb_transfer_clear_requests/);
  assert.match(migration, /transfer_ids uuid\[\] not null/);
  assert.match(migration, /alter table public\.wb_transfer_clear_requests enable row level security/);
  assert.match(migration, /revoke all on table public\.wb_transfer_clear_requests from public, anon, authenticated/);
  assert.match(migration, /v_snapshot_limit constant integer := 10000/);
  assert.match(migration, /This transfer log is too large to clear at once/);
  assert.match(migration, /and t\.id = any\(v_request\.transfer_ids\)/);
  assert.match(migration, /completed_result/);
  assert.match(migration, /for update/);
  assert.match(migration, /limit 100/);
  assert.match(migration, /completed_at < now\(\) - interval '30 days'/);
  assert.match(migration, /wb_transfer_clear_requests_completed_at_idx/);
  assert.match(migration, /set statement_timeout = '1500ms'/);
});

test('both RPCs are authenticated, actor-bound, permission-rechecked and non-public', () => {
  for (const name of ['preview_wb_transfer_clear', 'clear_wb_transfer_log']) {
    assert.match(migration, new RegExp(`create or replace function public\\.${name}`));
    assert.match(migration, new RegExp(`revoke all on function public\\.${name}\\(uuid\\) from public, anon`));
    assert.match(migration, new RegExp(`grant execute on function public\\.${name}\\(uuid\\) to authenticated`));
  }
  assert.match(migration, /v_actor uuid := auth\.uid\(\)/);
  assert.match(migration, /v_request\.actor_id <> v_actor/);
  assert.match(migration, /app_private\.has_workspace_permission\(v_request\.workspace_id, 'workspaces\.manage'\)/);
  assert.match(migration, /created_by = \(select auth\.uid\(\)\)/);
  assert.match(migration, /where w\.id = wb_data_transfers\.workspace_id\s+and w\.company_id = wb_data_transfers\.company_id/);
  assert.match(migration, /drop policy if exists "wb transfers clear"/);
  assert.match(migration, /revoke delete, update, truncate on public\.wb_data_transfers from authenticated/);
  assert.doesNotMatch(migration, /direction = 'cleared' and app_private/, 'cleared rows have no browser INSERT branch');
});

test('the dialog loads/retries a server preview, disables confirm, and retains partial success for retry', () => {
  const dialog = modal.slice(modal.indexOf("if (m.kind === 'clear-activity')"));
  assert.match(dialog, /Checking the complete import &amp; export log/);
  assert.match(dialog, /data-wb-retry-clear-preview/);
  assert.match(dialog, /preview\.status === 'ready' \|\| !!m\.transferResult/);
  assert.match(dialog, /\(!ready \|\| m\.actionPending\) \? 'disabled' : ''/);
  assert.match(dialog, /Retry activity save/);
  assert.match(fn('wbClearWorkspaceActivity'), /const saved = await wbSave\(m\.companyId\);/);
  assert.match(fn('wbClearWorkspaceActivity'), /!wbClearActionContextCurrent\(m\) \|\| !saved/);
  assert.match(fn('wbClearWorkspaceActivity'), /if \(workspace\.activity === nextActivity\) workspace\.activity = originalActivity;/);
  assert.match(fn('wbClearWorkspaceActivity'), /m\.transferResult \|\| await wbClearWorkspaceTransfers/);
});

test('pending clear cannot be dismissed by header, Cancel, Escape, or backdrop', () => {
  assert.match(fn('closeWbModal'), /if \(wbClearActionPending\(\)\) return false/);
  assert.match(fn('dismissTopModal'), /if \(wbClearActionPending\(\)\) return true/);
  assert.match(main, /if \(action === 'wb-modal-close'\)[\s\S]{0,300}closeWbModal\(\)/);
  assert.match(main, /<div class="modal-overlay wb-modal-overlay"><div class="wb-modal/);
  assert.match(fn('wbClearWorkspaceActivity'), /if \(!wbClearActionContextCurrent\(m\)\) return;/);
});

test('saved=false restores activity while retaining the completed transfer result for retry', async () => {
  const h = clearHarness({ save: async () => false });
  await h.handler();
  assert.deepEqual(h.workspace.activity, [{ id: 'before' }]);
  assert.equal(h.modalState.transferResult.removed, 2);
  assert.equal(h.modalState.actionPending, false);
  assert.match(h.modalState.error, /Import & export history cleared: 2 entries/);
});

test('a rejected final save has the same safe partial-result behavior', async () => {
  const h = clearHarness({ save: async () => { throw new Error('network failed'); } });
  await h.handler();
  assert.deepEqual(h.workspace.activity, [{ id: 'before' }]);
  assert.equal(h.modalState.transferResult.removed, 2);
  assert.match(h.modalState.error, /activity-log audit entry was not saved/);
});

test('a second click while the transfer RPC is pending is ignored', async () => {
  let release;
  const h = clearHarness({
    clear: () => new Promise((resolve) => { release = () => resolve({ removed: 2 }); }),
    save: async () => true,
  });
  const first = h.handler();
  await Promise.resolve();
  await h.handler();
  assert.equal(h.clearCalls(), 1);
  release();
  await first;
  assert.equal(h.clearCalls(), 1);
});

test('the password is read before pending render can replace its DOM input and is never stateful', async () => {
  const h = clearHarness({ live: true, password: 'typed-secret', save: async () => true });
  await h.handler();
  assert.equal(h.passwordSeen(), 'typed-secret');
  assert.doesNotMatch(JSON.stringify(h.modalState), /typed-secret/);
});

test('both entry points stay available when activity is zero because transfer rows may be uncached', () => {
  assert.match(modal, /data-wb-clear-activity><i class="ti ti-eraser"><\/i>Clear activity log/);
  assert.doesNotMatch(modal, /data-wb-clear-activity \$\{clearableCount\(editing\) \? '' : 'disabled'\}/);
  const operational = main.slice(main.indexOf('function renderOperationalWorkspaceEditModal('));
  assert.match(operational, /data-action="open-clear-workspace-activity"/);
  assert.doesNotMatch(operational.slice(0, 3500), /clearCount/);
  assert.match(main, /openWbClearWorkspaceActivity\(\{ companyId: activeCompanyId\(\), workspaceId: node\.dataset\.workspaceId \}\)/);
});

test('matching a sidebar workspace is strict and an activity clear remains scoped', () => {
  assert.equal(matchBuilderWorkspace([{ id: 'a', name: 'Main' }], ' main ').id, 'a');
  assert.equal(matchBuilderWorkspace([{ id: 'a', name: 'Main' }, { id: 'b', name: 'main' }], 'main'), null);
  const body = fn('wbClearWorkspaceActivity');
  assert.match(body, /if \(!can\('workspaces\.manage', m\.companyId\)\)/);
  assert.ok(!/\.feed\b|audit_events/.test(body));
});
