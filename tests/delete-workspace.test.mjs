import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// The directory could create, open, archive and set-default a workspace, but never remove one,
// so it filled with dead entries. Delete is gated on the account password like the other
// operations that destroy something.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const main = readFileSync(join(root, 'src', 'main.js'), 'utf8');
const settings = readFileSync(join(root, 'src', 'settings', 'workspace-settings.js'), 'utf8');
const migration = readFileSync(join(root, 'supabase', 'migrations', '20260812090000_delete_workspace.sql'), 'utf8');

const fnBody = (source, name) => {
  const at = source.lastIndexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} not found`);
  return source.slice(at, source.indexOf('\n}', at));
};

test('deleting a workspace is an owner action, checked by rank', () => {
  const body = migration.slice(migration.indexOf('function public.delete_workspace'));
  assert.match(body, /if not app_private\.is_company_owner\(ws\.company_id\) then/);
  assert.match(body, /raise exception 'Owner access is required to delete a workspace'/);
  // The button uses the same rule, so the interface cannot promise what the server refuses.
  assert.match(main, /function isCompanyOwner\(companyId\)/);
  assert.match(settings, /!isCompanyOwner\(companyId\) \? '' :/);
});

test('the default workspace cannot be deleted', () => {
  // It is how anyone without an explicit assignment reaches the company at all.
  const body = migration.slice(migration.indexOf('function public.delete_workspace'));
  assert.match(body, /if ws\.is_default then/);
  assert.match(body, /Make another workspace the default first/);
  assert.match(settings, /\$\{item\.is_default \|\| !isCompanyOwner\(companyId\) \? '' :/);
});

test('a workspace holding business records is refused, with the counts', () => {
  const body = migration.slice(migration.indexOf('function public.delete_workspace'));
  for (const table of ['contacts', 'deals', 'jobs', 'tasks', 'accounts', 'activities',
    'job_files', 'proposal_documents', 'underwriting_cases', 'crm_sites']) {
    assert.ok(body.includes(`from public.${table}`), `${table} should be counted`);
  }
  // Returned, not raised: a raised exception carries one string, and the dialog lists what is
  // in the way so the owner can go and deal with it.
  assert.match(body, /'deleted', false,\s*[\r\n]+\s*'reason', 'has_records'/);
  assert.match(body, /'blocking', blocking/);
});

test('configuration goes, records never do', () => {
  const body = migration.slice(migration.indexOf('function public.delete_workspace'));
  // pipeline_stages is RESTRICT and every workspace has some, so leaving it would make every
  // workspace undeletable. It is configuration, so the procedure clears it itself.
  assert.match(body, /delete from public\.pipeline_stages where workspace_id = ws\.id;/);
  // Nothing else is deleted by hand -- the CASCADE constraints carry memberships, plugins,
  // the setup profile, labels and history, and the RESTRICT ones stand guard.
  const deletes = [...body.matchAll(/delete from public\.(\w+)/g)].map((m) => m[1]);
  assert.deepEqual(deletes.sort(), ['pipeline_stages', 'workspaces']);
});

test('the deletion is recorded before the row disappears', () => {
  const body = migration.slice(migration.indexOf('function public.delete_workspace'));
  assert.match(body, /'workspace\.deleted'/);
  assert.ok(
    body.indexOf("'workspace.deleted'") < body.indexOf('delete from public.workspaces'),
    'the audit row must be written while the workspace still exists to describe',
  );
});

test('the procedure is reachable only by a signed-in caller', () => {
  assert.match(migration, /revoke all on function public\.delete_workspace\(uuid\) from public, anon;/);
  assert.match(migration, /grant execute on function public\.delete_workspace\(uuid\) to authenticated;/);
});

test('the password is confirmed before anything is asked of the server', () => {
  const body = fnBody(main, 'deleteOperationalWorkspace');
  assert.match(body, /const check = await confirmAccountPassword\(password\);/);
  assert.ok(
    body.indexOf('confirmAccountPassword') < body.indexOf("rpc('delete_workspace'"),
    'a wrong password should cost nothing',
  );
  // A refusal keeps the dialog open carrying the counts, rather than closing on a toast.
  assert.match(body, /state\.deleteWorkspaceBlocking = result\.data\.blocking \|\| \{\};/);
});

test('deleting the workspace you were looking at does not strand the selection', () => {
  const body = fnBody(main, 'deleteOperationalWorkspace');
  assert.match(body, /if \(state\.activeWorkspaceId === workspaceId\) \{/);
  assert.match(body, /localStorage\.removeItem\(ACTIVE_WORKSPACE_KEY\);/);
});

test('the dialog is routed, asks for the password, and says what survives', () => {
  assert.match(main, /if \(state\.modal === 'delete-workspace'\) return renderDeleteWorkspaceModal\(activeCompanyId\(\), state\.deletingWorkspaceId\);/);
  const body = fnBody(main, 'renderDeleteWorkspaceModal');
  assert.match(body, /reauthPasswordField\('deleteWorkspacePw'/);
  assert.match(body, /This cannot be undone\./);
  assert.match(body, /Sibling workspaces, the company, its people and every other record are untouched\./);
  assert.match(body, /archive the workspace instead to keep its history/);
  assert.match(main, /event\.target\.matches\('\[data-delete-workspace-form\]'\)/);
});
