# Recoverable Deletes and Record History

**Date:** 2026-07-29
**Status:** Approved for implementation

## Goal

Add the next reliability layer after local form drafts:

- let the person who just deleted a record reverse that action immediately;
- show a readable history of important changes to Contacts, Quotes, and Jobs;
- capture Task changes now so the same history can be exposed when Tasks has a
  dedicated record screen;
- preserve Questbase's existing company, workspace, role, and plugin boundaries.

Questbase already has a 30-day Recycle Bin. This release extends it instead of
creating a second deletion system.

## Approaches considered

1. **Database-triggered history plus an actor-limited Undo RPC - selected.**
   Database triggers cover edits from the browser, integrations, and future
   clients. A server-authorized RPC lets the deleting actor undo a recent
   deletion without granting general Recycle Bin administration.
2. **Reuse `audit_events`.** Rejected because that table is an administrator-only
   access and security log. Widening it for record viewers could disclose
   sensitive account-management events and would mix two different histories.
3. **Log changes from browser code.** Rejected because integrations and server
   jobs could bypass the log, a failed request could create a false entry, and
   clients should not be trusted to choose the actor or tenant.

## Immediate Undo

After a successful single-record safe delete, the existing toast remains visible
for ten seconds and includes **Undo**. Selecting it calls
`recycle_undo_item(item_id)`.

The server accepts that request only when all of these are true:

- the caller is authenticated;
- the active Recycle Bin item was deleted by that same profile;
- the delete happened no more than ten minutes ago;
- the normal 30-day restore window has not expired;
- the item type and source table match the server-owned allowlist;
- the caller still has the source record's manage permission.

The ten-minute server window lets Undo survive a slow click or brief connection
problem; the visible toast remains intentionally short. General restore through
Settings continues to require `settings.manage`. Batch deletion remains a single
summary action and does not create many competing Undo buttons.

On success, the source row is restored, the Recycle Bin ledger is marked
restored, local state is repaired, and the user stays in the current workspace.
On failure, Questbase keeps the item in the Recycle Bin and reports the server
error without pretending the record was restored.

## Record history

Create a separate, append-only `record_history` table for these source tables:

| Product record | Source table | Read permission |
| --- | --- | --- |
| Contact | `contacts` | `crm.view` |
| Quote | `deals` | `crm.view` |
| Job | `jobs` | `jobs.view` |
| Task | `tasks` | `tasks.view` |

Each history row contains company id, workspace id, record type/id/label,
action, actor profile id, changed field names, a whitelisted before/after
change map, and timestamp. Normal authenticated clients receive SELECT only.
They cannot insert, update, or delete history rows.

The trigger records:

- `created` on insert;
- `updated` when a whitelisted business field changes;
- `deleted` when `deleted_at` changes from empty to set;
- `restored` when `deleted_at` changes from set to empty.

Internal timestamps, tenant identifiers, deletion metadata, and other technical
columns do not produce noisy update entries. Contact phone, email, addresses,
freeform notes, task descriptions, and other sensitive long-form content are
not copied into the history payload. History describes operational changes such
as stage, status, owner, priority, due date, and totals.

The trigger function runs with a fixed empty search path and gets the actor from
`auth.uid()`. It is not executable by browser roles. A null actor is permitted
for trusted server/background changes and is displayed as `System`.

## Tenant and permission boundaries

Row-level security requires both:

- current membership in the history row's workspace; and
- the matching view permission for its record type.

Company id remains part of every row and index for defense in depth and useful
query plans. History is queried by exact company, workspace, record type, and
record id. A user cannot use a URL or request parameter to read another
workspace's history.

Undo does not trust client-provided company, table, record, permission, actor,
or timestamps. It accepts only the Recycle Bin item id and resolves everything
else from locked server rows and the existing allowlist.

## User experience

Contacts, Quotes, and Jobs receive a **History** action in their record header.
It opens a focused modal and loads only the most recent 50 entries for that
record. The modal shows:

- action and actor;
- date and time;
- friendly field labels;
- previous and new values for updates;
- clear loading, empty, and error states.

History is loaded on demand rather than during application startup. Demo/local
mode shows a helpful empty state and does not invent production history.

## Failure behavior

- A history-trigger failure fails the source write so Questbase never silently
  loses its audit trail for a supposedly successful change.
- A failed Undo leaves both the source row and Recycle Bin ledger unchanged.
- Losing permission during the toast window blocks Undo on the server.
- An already restored, expired, missing, mismatched, or permanently deleted item
  cannot be undone.
- History-loading errors stay inside the modal and do not break the record page.
- Existing Recycle Bin restore and permanent-delete behavior remains unchanged.

## Testing

Unit tests cover normalization, scope filtering, friendly labels, action text,
value formatting, and malformed history payloads.

Static and migration tests confirm:

- the toast action is rendered as inert data and handled through delegated
  actions;
- successful single deletes retain the returned Recycle Bin id and offer Undo;
- Undo uses the new RPC and does not require `settings.manage` client-side;
- Contacts, Quotes, and Jobs expose History;
- the history query is exact, workspace-scoped, and on demand;
- the table is append-only to authenticated clients;
- RLS maps every record type to its correct view permission;
- triggers exist on all four source tables;
- the Undo RPC enforces actor, time, source, and permission checks.

Production verification confirms a same-actor delete/Undo round trip, a visible
history entry after a safe non-sensitive edit, tenant isolation, and no browser
errors.

## Success criteria

- A normal single-record delete offers one-click Undo and restores the item
  without Recycle Bin administrator access.
- Another user, an expired caller, or a caller without the source manage
  permission cannot use that Undo path.
- Contact, Quote, Job, and Task changes are captured by the database.
- Contact, Quote, and Job history is readable only within the authorized
  workspace.
- Authenticated clients cannot forge or erase history.
- Existing 30-day restore, permanent delete, tenant handling, and all release
  checks continue to pass.

## Non-goals

- Replacing the existing Recycle Bin.
- Undoing edits field-by-field.
- Showing Task history before Tasks has a dedicated record header.
- Recording secrets, full notes, message bodies, files, or attachment contents.
- Loading every workspace's history at application startup.
- Changing product roles or relaxing authorization gates.
