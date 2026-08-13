import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { allowedWorkspaces } from '../src/workspaces/model.js';

// "can you make this workspaces draggable so I can change its order" -- company-wide, so it
// lives on the row rather than in each browser. The rail has always rendered default-first
// then alphabetically, which is fine until the workspaces are stages and the one created
// last belongs second.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const reorderSrc = readFileSync(join(root, 'src', 'workspaces', 'rail-reorder.js'), 'utf8');

// The reorder body lives in its own module -- fetched on demand, so the entry bundle does
// not carry a drag only a manager can start. Slice from there by default, not from main.js,
// which keeps a loader shim of the same name. Module functions are indented, so they close
// on "\n  }"; the shim in main.js is top-level and closes on "\n}".
const fn = (name, source = reorderSrc) => {
  const at = source.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  const start = source.lastIndexOf('\n', at) + 1;
  const close = source === main ? '\n}' : '\n  }';
  return source.slice(start, source.indexOf(close, at) + close.length);
};

const ws = (id, name, position, extra = {}) => ({
  id, name, position, company_id: 'co-1', status: 'active', is_default: false, ...extra,
});
const railFor = (workspaces) => allowedWorkspaces({
  companyId: 'co-1', workspaces, memberships: [], profileId: 'p1', companyRole: 'Owner',
}).map((w) => w.name);

test('the rail renders in the saved order, not alphabetically', () => {
  assert.deepEqual(
    railFor([ws('c', 'Sales', 3), ws('a', 'Prospecting', 1), ws('d', 'Production', 4), ws('b', 'Underwriting', 2)]),
    ['Prospecting', 'Underwriting', 'Sales', 'Production'],
  );
});

test('position outranks is_default, so the default can be dragged off the top', () => {
  // It used to be pinned first unconditionally, which would leave one row that refuses to
  // move -- and the row people most often want second is the default one.
  assert.deepEqual(
    railFor([ws('a', 'Main', 3, { is_default: true }), ws('b', 'Prospecting', 1), ws('c', 'Sales', 2)]),
    ['Prospecting', 'Sales', 'Main'],
  );
});

test('a row with no position sorts last on the old rules, not first', () => {
  // 0 is what a row written before the column, or read from an older cache, carries. Sorting
  // those numerically would put every one of them ahead of the ordered list.
  assert.deepEqual(
    railFor([ws('a', 'Zulu', 0), ws('b', 'Alpha', 0), ws('c', 'Ordered', 1), ws('d', 'Main', 0, { is_default: true })]),
    ['Ordered', 'Main', 'Alpha', 'Zulu'],
  );
});

const reorder = new Function('ids', 'movedId', 'targetId', `${fn('reorderedWorkspaceIds')}\nreturn reorderedWorkspaceIds(ids, movedId, targetId);`);

test('dropping onto a row below lands after it, above lands before it', () => {
  // Whatever the pointer is over at the moment of release is what the person meant.
  assert.deepEqual(reorder(['a', 'b', 'c', 'd'], 'a', 'c'), ['b', 'c', 'a', 'd'], 'moved down');
  assert.deepEqual(reorder(['a', 'b', 'c', 'd'], 'd', 'b'), ['a', 'd', 'b', 'c'], 'moved up');
});

test('a move that means nothing changes nothing', () => {
  assert.deepEqual(reorder(['a', 'b', 'c'], 'a', 'a'), ['a', 'b', 'c']);
  assert.deepEqual(reorder(['a', 'b', 'c'], 'a', 'nope'), ['a', 'b', 'c'], 'unknown target is a no-op');
});

test('the whole order is sent, not the two rows that moved', () => {
  // The server then never has to reconcile a partial move against what it already had.
  const body = fn('saveWorkspaceRailOrder');
  assert.match(body, /workspace_ids: ordered,/);
  assert.match(body, /client\.rpc\('reorder_operational_workspaces'/);
  assert.match(body, /target_company_id: canonicalCompanyId\(companyId\)/, 'the company id has to be the canonical one');
});

test('the drag paints immediately and rolls back if the server refuses', () => {
  const body = fn('saveWorkspaceRailOrder');
  // Snapshot BEFORE the optimistic write, or the rollback restores the optimistic values.
  assert.ok(
    body.indexOf('const previous = new Map') < body.indexOf('workspace.position = index + 1'),
    'the snapshot has to be taken before the list is mutated',
  );
  assert.match(body, /if \(previous\.has\(workspace\.id\)\) workspace\.position = previous\.get\(workspace\.id\);/);
  // And the server's own answer wins over the guess.
  assert.match(body, /const saved = new Map\(data\.map\(\(row\) => \[String\(row\.id\), normalizeOperationalWorkspace\(row\)\]\)\);/);
});

test('only somebody who may manage workspaces gets a drag handle', () => {
  // The markup is the first gate. The RPC checks again, because markup is not a permission.
  const at = main.indexOf('<div class="workspace-rail-list"');
  const rail = main.slice(at, main.indexOf('.join(', at));
  assert.match(rail, /\$\{canManageWorkspaces \? ' data-workspace-reorder' : ''\}/);
  assert.match(rail, /\$\{canManageWorkspaces \? ` draggable="true" data-workspace-id="\$\{h\(workspace\.id\)\}"` : ''\}/);
  assert.match(fn('mount'), /\.workspace-rail-list\[data-workspace-reorder\]/);
});

test('a single workspace is not draggable, and the drag id survives a re-render', () => {
  const body = fn('mount');
  assert.match(body, /if \(items\.length < 2\) return;/, 'nothing to reorder');
  // render() replaces the rail mid-drag; an id stored on the node would go with it.
  assert.match(reorderSrc, /^  let dragId = '';$/m);
  assert.match(main, /queueMicrotask\(mountWorkspaceRailDrag\);/);
  // Firefox will not start a drag unless dataTransfer carries something.
  assert.match(body, /setData\('text\/plain', item\.dataset\.workspaceId\)/);
});

test('position is read back off the row', () => {
  const body = fn('normalizeOperationalWorkspace', main);
  assert.match(body, /position: Number\.isFinite\(Number\(input\.position\)\) && Number\(input\.position\) > 0 \? Number\(input\.position\) : 0,/);
});

test('the migration is additive and backfills to what the rail already showed', () => {
  const file = readdirSync(join(root, 'supabase', 'migrations')).find((name) => name.includes('workspace_display_order'));
  assert.ok(file, 'migration missing');
  const sql = readFileSync(join(root, 'supabase', 'migrations', file), 'utf8');
  assert.match(sql, /add column if not exists position integer not null default 0/);
  // Backfilled default-first-then-name, which is what the old sort rendered. Ordering by
  // created_at would have reshuffled every company whose creation order differs.
  assert.match(sql, /order by \(case when is_default then 0 else 1 end\), lower\(coalesce\(name, ''\)\), id/);
  assert.match(sql, /create index if not exists workspaces_company_position_idx/);
});

test('the reorder RPC is admin-only, company-scoped and not callable by anon', () => {
  const file = readdirSync(join(root, 'supabase', 'migrations')).find((name) => name.includes('workspace_display_order'));
  const sql = readFileSync(join(root, 'supabase', 'migrations', file), 'utf8');
  assert.match(sql, /security definer/);
  assert.match(sql, /set search_path = ''/, 'a definer function without a fixed search path is a hijack waiting to happen');
  assert.match(sql, /if not app_private\.is_company_admin\(target_company_id\) then/);
  // Every id must belong to the named company, or an admin of one company could probe
  // another's ids by watching which calls succeed.
  assert.match(sql, /raise exception 'Workspace does not belong to this company'/);
  assert.match(sql, /revoke all on function public\.reorder_operational_workspaces\(text, uuid\[\]\) from public, anon;/);
  assert.match(sql, /grant execute on function public\.reorder_operational_workspaces\(text, uuid\[\]\) to authenticated;/);
  // WITH ORDINALITY: row_number() over an empty OVER has no defined order, so the positions
  // it hands out are not guaranteed to be the order the caller sent.
  assert.match(sql, /from unnest\(workspace_ids\) with ordinality as ordered\(wid, ord\)/);
  // Comments stripped: prose explaining why an unordered window is wrong is not one.
  const code = sql.replace(/--[^\n]*/g, '');
  assert.ok(!/row_number\(\) over \(\)/.test(code), 'an unordered window must not decide positions');
});

test('the reorder is fetched on demand, not carried in the entry bundle', () => {
  // The bundle budget is paid by keeping code behind a click out of main.js. Only a manager
  // can reorder, and the rail paints fine without this.
  assert.match(main, /import\('\.\/workspaces\/rail-reorder\.js'\)/);
  assert.ok(!/^import .*rail-reorder/m.test(main), 'a static import would put it straight back');
  // The shim must not try to mount before the module has landed.
  const shim = fn('mountWorkspaceRailDrag', main);
  assert.match(shim, /if \(workspaceRailReorderModule\) \{ workspaceRailReorderModule\.mount\(\); return; \}/);
  assert.match(shim, /if \(!document\.querySelector\('\.workspace-rail-list\[data-workspace-reorder\]'\)\) return;/, 'no fetch for somebody who cannot reorder');
});
