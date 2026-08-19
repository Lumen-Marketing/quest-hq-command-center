// The workspace id the DATABASE means, from the one the App Builder document uses.
//
// Its own module, and a deliberately tiny one, because of where it is imported FROM.
// builder-core.js is the natural home -- it builds `ws-${workspace.id}` from the other
// direction -- but main.js imports builder-core statically, so anything added there lands in the
// entry chunk that every session downloads. The only callers are lazy: the record page, Quick
// Create, and the intake link manager. So it lives where they can reach it without the entry
// paying for a function it never calls.

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
