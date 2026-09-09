// The workspace id the DATABASE means, from the one the App Builder document uses.
//
// Its own module, and a deliberately tiny one, because of where it is imported FROM.
// builder-core.js is the natural home -- it builds `ws-${workspace.id}` from the other
// direction -- but builder-core carries the whole App Builder with it, so putting this there
// would drag that weight into anything that only wanted to map an id. Here it stays a function
// on its own, and the lazy callers (the record page, Quick Create, the intake link manager)
// reach it without pulling in a module they do not otherwise need.
//
// main.js reaches it too, through `await import(...)` inside wbClearWorkspaceTransfers rather
// than a static import: a static one would pull it into the entry chunk, which the bundle budget
// refuses. wbTransferActivity, next to it, keeps a bare `replace(/^ws-/, '')` because it is a
// render path that cannot await -- and it only compares the result against rows it already holds,
// where a malformed id matches nothing. The validated mapping is for ids being handed to Postgres.

/**
 * The operational workspace a builder id points at, or '' when it points at nothing.
 *
 * The App Builder keys its workspaces as `ws-<uuid>`, where that uuid IS the row in
 * public.workspaces. Anything writing a workspace_id to the database wants THAT, both because the
 * column is a uuid and because `app_private.has_workspace_permission` is given it to decide
 * whether the row may be read or written at all.
 *
 * A legacy document that was never adopted keys the COMPANY instead (`ws-<companyId>`), and there
 * is no workspace row for that. It returns '' rather than a company id dressed as a workspace, so
 * the caller can say so in words instead of handing Postgres something it will only reject.
 */
const OPS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function opsWorkspaceId(builderId) {
  const id = String(builderId || '').replace(/^ws-/, '');
  return OPS_UUID.test(id) ? id : '';
}
