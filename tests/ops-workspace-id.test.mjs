import assert from 'node:assert/strict';
import test from 'node:test';

import { opsWorkspaceId } from '../src/workspace/ops-workspace-id.js';

// "invalid input syntax for type uuid: ws-42959c90-a8e6-4ec4-af78-82036849dba7"
//
// The App Builder keys its workspaces as `ws-<uuid>`, and that uuid is the row in
// public.workspaces. Writing the BUILDER id into a workspace_id column is two bugs at once: the
// column is a uuid, and app_private.has_workspace_permission is handed that value to decide
// whether the row may be written at all.

test('the prefix comes off, and what is left is the workspace row', () => {
  assert.equal(
    opsWorkspaceId('ws-42959c90-a8e6-4ec4-af78-82036849dba7'),
    '42959c90-a8e6-4ec4-af78-82036849dba7',
  );
  // Already bare, which is what a caller that resolved it earlier hands over.
  assert.equal(
    opsWorkspaceId('42959c90-a8e6-4ec4-af78-82036849dba7'),
    '42959c90-a8e6-4ec4-af78-82036849dba7',
  );
});

test('a legacy company-keyed workspace resolves to nothing, not to a company id', () => {
  // Pre-adoption documents key the COMPANY (`ws-<companyId>`). There is no workspace row for it,
  // so returning the company id would put a value in a uuid column that means something else --
  // and if it ever DID parse, it would be checked for permission against the wrong thing.
  assert.equal(opsWorkspaceId('ws-questroofing'), '');
  assert.equal(opsWorkspaceId('ws-'), '');
  assert.equal(opsWorkspaceId(''), '');
  assert.equal(opsWorkspaceId(null), '');
  assert.equal(opsWorkspaceId(undefined), '');
});

test('it is a uuid or it is nothing', () => {
  // Half a uuid, a uuid with something on the end, and a uuid-shaped thing that is not hex.
  assert.equal(opsWorkspaceId('ws-42959c90-a8e6-4ec4-af78'), '');
  assert.equal(opsWorkspaceId('ws-42959c90-a8e6-4ec4-af78-82036849dba7-x'), '');
  assert.equal(opsWorkspaceId('ws-zzzzzzzz-a8e6-4ec4-af78-82036849dba7'), '');
  // Uppercase is still a uuid: Postgres accepts it and so does this.
  assert.equal(opsWorkspaceId('ws-42959C90-A8E6-4EC4-AF78-82036849DBA7'), '42959C90-A8E6-4EC4-AF78-82036849DBA7');
});

test('only the leading prefix is taken', () => {
  // A stray `ws-` further in is part of nothing; only the key's own prefix is a prefix.
  assert.equal(opsWorkspaceId('xws-42959c90-a8e6-4ec4-af78-82036849dba7'), '');
});
