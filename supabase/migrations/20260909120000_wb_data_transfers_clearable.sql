-- Clearing a workspace log now reaches the import & export ledger too.
--
-- WHAT WAS WRONG. "Clear log" on Configure workspace emptied `workspace.activity` and nothing
-- else, but the workspace activity view is a merge of three sources -- feed posts, the document's
-- activity array, and rows from this table (see wbTransferActivity in main.js). So clearing left
-- every "Exported 12 records from Prospecting" line exactly where it was. The log looked cleared
-- from the button and uncleared on the screen, which is the worst of both.
--
-- WHY THIS REVERSES 20260829005613. That migration ended with "No UPDATE and no DELETE policy,
-- deliberately. A log somebody can edit afterwards is not a log." That reasoning still holds for
-- UPDATE, which stays impossible: a row that can be rewritten is a row that can be made to say an
-- export was smaller, or was somebody else's, and there is no honest reason to want that.
--
-- DELETE is a different question, and the product answer changed. A workspace manager clearing
-- their own workspace's log is a real thing to want, and the append-only rule was answering a
-- different threat -- somebody quietly editing history so the absence of evidence looks like a
-- quiet week. What actually defends against that is not "nothing can ever be removed", it is
-- "nothing can be removed without saying so". That is how the activity log has always worked:
-- clearing it replaces 23 entries with one entry that says 23 entries went.
--
-- So this grants DELETE on the same terms:
--
--   * only `workspaces.manage`, the same permission the button is painted behind;
--   * only export and import rows -- the `cleared` tombstones are excluded from the USING clause,
--     so no amount of clearing can erase the record that a clear happened;
--   * and the client writes one tombstone per app that had rows, carrying the count it removed,
--     so the app's own Import & Export tab says what was there rather than showing an empty
--     table indistinguishable from an app nobody ever exported.
--
-- The net effect is that history compacts but never disappears. Clearing twice leaves two
-- tombstones, not one, because a tombstone is not deletable by the thing that writes it.

-- ---------------------------------------------------------------------------------------
-- A third direction, for the tombstone.
-- ---------------------------------------------------------------------------------------
-- `cleared` is not a transfer and is deliberately not called one: nothing crossed the boundary
-- of the product. It shares the table because it is the only place the count it reports is
-- meaningful, and because a tombstone kept anywhere else could be dropped independently of the
-- rows it accounts for.
alter table public.wb_data_transfers
  drop constraint if exists wb_data_transfers_direction_check;

alter table public.wb_data_transfers
  add constraint wb_data_transfers_direction_check
  check (direction in ('export', 'import', 'cleared'));

comment on table public.wb_data_transfers is
  'Log of App Builder records leaving or entering an app. One row per Export, Download app, '
  'Print or Import. A workspace manager may clear the export and import rows; doing so writes a '
  'direction=cleared tombstone per app recording who cleared it and how many rows went. '
  'Tombstones and UPDATE are not deletable or writable by anyone.';

-- ---------------------------------------------------------------------------------------
-- Writing a tombstone.
-- ---------------------------------------------------------------------------------------
-- Same shape as before, with one branch added. `workspaces.manage` rather than the transfer
-- permissions, because clearing is an administrative act and not an export: a role that may
-- export must not thereby be able to declare the log cleared.
drop policy if exists "wb transfers insert" on public.wb_data_transfers;
create policy "wb transfers insert" on public.wb_data_transfers
for insert to authenticated
with check (
  (direction = 'export' and app_private.has_workspace_permission(workspace_id, 'workspaces.records.export'))
  or (direction = 'import' and app_private.has_workspace_permission(workspace_id, 'workspaces.records.import'))
  or (direction = 'cleared' and app_private.has_workspace_permission(workspace_id, 'workspaces.manage'))
);

-- ---------------------------------------------------------------------------------------
-- Clearing.
-- ---------------------------------------------------------------------------------------
-- `direction <> 'cleared'` is the whole safety property of this migration and is enforced here
-- rather than in the client, so a hand-rolled request cannot skip it. Postgres evaluates USING
-- per row, so a blanket `delete from wb_data_transfers where workspace_id = $1` issued by a
-- manager silently keeps the tombstones and removes only what it is allowed to.
drop policy if exists "wb transfers clear" on public.wb_data_transfers;
create policy "wb transfers clear" on public.wb_data_transfers
for delete to authenticated
using (
  direction <> 'cleared'
  and app_private.has_workspace_permission(workspace_id, 'workspaces.manage')
);

-- Still no UPDATE policy, deliberately and permanently. Clearing is a removal that announces
-- itself; editing is not, and nothing in the product needs it.
grant delete on public.wb_data_transfers to authenticated;
revoke all on public.wb_data_transfers from anon;

-- ---------------------------------------------------------------------------------------
-- Grants the 2026-08-29 migration left behind.
-- ---------------------------------------------------------------------------------------
-- That migration said `grant select, insert ... to authenticated`, which ADDS privileges; it
-- never removed the ones the table was created with. Checked against live before writing this,
-- `authenticated` still holds UPDATE, DELETE and TRUNCATE here.
--
-- UPDATE and DELETE were inert and the table was not exposed by them: RLS is enabled, and a
-- command with no policy is denied whatever the grant says. They are revoked anyway, because
-- "there is no policy" is a fact somebody can change in one line, and this table is meant to
-- resist exactly that.
--
-- TRUNCATE is the one that mattered. It is not a DELETE with a different name: it bypasses row
-- level security completely, so no USING clause can see it -- including the `direction <>
-- 'cleared'` clause above, which is the entire safety property of this migration. A truncate
-- would take the tombstones with the rows and leave a table indistinguishable from one nobody
-- had ever used. PostgREST never issues it, so nothing in the product regressed, but the
-- privilege had no reason to be here and every reason not to be.
revoke update, truncate on public.wb_data_transfers from authenticated;
