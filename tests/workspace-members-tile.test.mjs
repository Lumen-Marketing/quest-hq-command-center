import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { workspaceMembers } from '../src/workspaces/model.js';

// "add a tile where you can display the list of members of workspace and those who are
// online". Scoped to the WORKSPACE, not the company -- the tile sits on a workspace
// dashboard, and the whole company is what the Users page is for.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const modal = readFileSync(join(root, 'src', 'workspace', 'builder-modal.js'), 'utf8');
const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');

const USERS = [
  { profile_id: 'p-owner', name: 'Abe Owner', role: 'owner', status: 'active' },
  { profile_id: 'p-admin', name: 'Ada Admin', role: 'admin', status: 'active' },
  { profile_id: 'p-rep', name: 'Rey Rep', role: 'member', status: 'active' },
  { profile_id: 'p-other', name: 'Otto Other', role: 'member', status: 'active' },
  { profile_id: 'p-gone', name: 'Gil Gone', role: 'member', status: 'disabled' },
  { profile_id: 'p-susp', name: 'Sue Susp', role: 'member', status: 'active' },
];
const MEMBERSHIPS = [
  { workspace_id: 'ws-1', profile_id: 'p-rep', status: 'active' },
  { workspace_id: 'ws-2', profile_id: 'p-other', status: 'active' },
  { workspace_id: 'ws-1', profile_id: 'p-susp', status: 'revoked' },
  { workspace_id: 'ws-1', profile_id: 'p-gone', status: 'active' },
];
const ids = (workspaceId) => workspaceMembers({ workspaceId, memberships: MEMBERSHIPS, users: USERS })
  .map((user) => user.profile_id).sort();

// --- who counts as a member ----------------------------------------------------------------

test('an explicit membership puts you in that workspace and no other', () => {
  assert.ok(ids('ws-1').includes('p-rep'));
  assert.ok(!ids('ws-1').includes('p-other'), 'a member of ws-2 is not a member of ws-1');
});

test('owners and admins are in every workspace without a row', () => {
  // This is allowedWorkspaces() read from the other end, so the two directions have to
  // agree: an owner has no membership row for most workspaces and belongs to all of them.
  assert.deepEqual(ids('ws-9'), ['p-admin', 'p-owner'], 'a workspace nobody was assigned to');
  const inherited = workspaceMembers({ workspaceId: 'ws-1', memberships: MEMBERSHIPS, users: USERS })
    .filter((user) => user.inherited).map((user) => user.profile_id).sort();
  assert.deepEqual(inherited, ['p-admin', 'p-owner']);
});

test('a disabled account and a revoked membership are both left out', () => {
  // Two different ways to stop being a member, and the tile is a list of who to expect --
  // showing either of them would be showing somebody who cannot get in.
  assert.ok(!ids('ws-1').includes('p-gone'), 'disabled account, active membership row');
  assert.ok(!ids('ws-1').includes('p-susp'), 'active account, revoked membership row');
});

test('the reason is carried out, not just the answer', () => {
  const rep = workspaceMembers({ workspaceId: 'ws-1', memberships: MEMBERSHIPS, users: USERS })
    .find((user) => user.profile_id === 'p-rep');
  assert.equal(rep.inherited, false, 'an assigned member is not an inherited one');
});

// --- the tile ------------------------------------------------------------------------------

test('the tile is offered, routed, and titled', () => {
  assert.match(modal, /\['members', 'ti-users', 'Members', 'Who is in this workspace, and who is online now'\]/);
  assert.match(main, /case 'members': return \{ title: 'Members', icon: 'ti-users', config: false \};/);
  assert.match(main, /case 'members': return wbTileMembers\(companyId\);/);
});

test('it is a plain tile, so it needs no configuring to be useful', () => {
  // wbAddTile opens the config dialog for the types that are meaningless until configured.
  const at = main.indexOf('function wbAddTile(');
  const body = main.slice(at, main.indexOf('\n}', at));
  assert.ok(!/'members'/.test(body), 'members must not be sent to the config dialog');
});

test('online comes from presence, and presence alone', () => {
  const at = main.indexOf('function wbTileMembers(');
  assert.notEqual(at, -1);
  const body = main.slice(at, main.indexOf('\n}\n', at));
  // The same source as the messaging list and every avatar ring. It is ephemeral by
  // design, so no row is ever stale: a closed socket drops the person on the next paint.
  assert.match(body, /profileIsOnline\(user\.profile_id\)/);
  assert.match(body, /withPresenceRing\(avatar, user\.profile_id\)/);
  // Scoped to this workspace, not the company.
  assert.match(body, /const workspaceId = workspaceIdForCompany\(companyId\);/);
  assert.match(body, /memberships: state\.workspaceMemberships/);
});

test('online sorts first, because that is what the tile is for', () => {
  const at = main.indexOf('function wbTileMembers(');
  const body = main.slice(at, main.indexOf('\n}\n', at));
  assert.match(body, /Number\(b\.online\) - Number\(a\.online\)/);
  assert.match(body, /localeCompare/, 'and alphabetical within each group');
  assert.match(body, /onlineCount/);
});

test('an empty workspace says so rather than rendering an empty box', () => {
  const at = main.indexOf('function wbTileMembers(');
  const body = main.slice(at, main.indexOf('\n}\n', at));
  assert.match(body, /Nobody has access to this workspace yet\./);
});

test('the status reads without relying on colour', () => {
  const at = main.indexOf('function wbTileMembers(');
  const body = main.slice(at, main.indexOf('\n}\n', at));
  assert.match(body, /\$\{user\.online \? 'Online' : 'Offline'\}/);
  // An owner listed with no explicit assignment otherwise looks like a bug.
  assert.match(body, /user\.inherited \? ' · all workspaces' : ''/);
  assert.match(css, /\.wb-tile-member-status\.is-online \{/);
  assert.match(css, /\.wb-presence-dot\.is-online \{ background: #16a34a; \}/);
});

test('members is an allowed tile type, or it is silently a blank note', () => {
  // normalizeWorkspaceTile falls back to 'text' for anything not on this list, so a type
  // missing from it does not render as an unknown tile -- it renders as an empty note, and
  // that is exactly what adding a Members tile did.
  assert.match(main, /const WB_TILE_TYPES = \[[^\]]*'members'/);
  const at = main.indexOf('function normalizeWorkspaceTile(');
  const body = main.slice(at, main.indexOf('\n}', at));
  assert.match(body, /WB_TILE_TYPES\.includes\(tile\.type\) \? tile\.type : 'text'/,
    'the fallback is what makes the list authoritative');
});
