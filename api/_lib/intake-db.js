// Loading an intake link and the app it points at.
//
// Separate from intake.js so that file stays pure and testable. Everything here needs `db` --
// the service-role fetch -- because the whole point is reading a company document that the
// caller has no permission to see any part of.

import { HttpError } from './http-security.js';
import { linkUnavailableReason, publicFields } from './intake.js';

const LINK_COLUMNS = [
  'token', 'company_id', 'workspace_id', 'app_id', 'title', 'intro', 'visibility',
  'passcode_hash', 'passcode_salt', 'field_ids', 'status', 'submission_count',
  'max_submissions', 'expires_at', 'failed_attempts', 'locked_until',
].join(',');

export async function loadLink(db, token) {
  const clean = String(token || '').trim();
  // 404 rather than 400: an empty token and a wrong one are the same fact to the caller, and
  // distinguishing them tells a prober that the format was at least right.
  if (!clean || clean.length > 200) throw new HttpError(404, 'This link was not found.');

  const res = await db(`/rest/v1/wb_intake_links?token=eq.${encodeURIComponent(clean)}&select=${LINK_COLUMNS}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new HttpError(500, 'Could not open this link.');
  const link = (await res.json().catch(() => []))[0];
  if (!link) throw new HttpError(404, 'This link was not found.');
  return link;
}

/**
 * The app the link points at, resolved out of the company's builder document.
 *
 * A LINKED app entry (one workspace displaying another's app) is followed only inside the same
 * company. A cross-company link is refused rather than followed: the token names one company,
 * and quietly reading a second company's document on the strength of it is precisely the kind
 * of hop that should not be possible from an unauthenticated request.
 */
export async function loadLinkApp(db, link) {
  const res = await db(`/rest/v1/workspace_builder_state?company_id=eq.${encodeURIComponent(link.company_id)}&select=doc`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new HttpError(500, 'Could not open this link.');
  const doc = (await res.json().catch(() => []))[0]?.doc;
  const workspaces = Array.isArray(doc?.workspaces) ? doc.workspaces : [];

  const workspace = workspaces.find((item) => String(item?.id) === String(link.workspace_id));
  const entry = workspace && Array.isArray(workspace.apps)
    ? workspace.apps.find((item) => String(item?.id) === String(link.app_id))
    : null;
  if (!entry) throw new HttpError(404, 'The form behind this link is no longer available.');

  let app = entry;
  if (entry.linked) {
    if (entry.linkedFromCompany && entry.linkedFromCompany !== link.company_id) {
      throw new HttpError(404, 'The form behind this link is no longer available.');
    }
    const source = workspaces.find((item) => String(item?.id) === String(entry.linkedFromWs));
    app = (source && Array.isArray(source.apps)
      ? source.apps.find((item) => String(item?.id) === String(entry.id) && !item.linked)
      : null);
    if (!app) throw new HttpError(404, 'The form behind this link is no longer available.');
  }
  return app;
}

/** The whole public view of a link: what it is, and the fields it exposes. */
export async function loadIntake(db, token, { withFields }) {
  const link = await loadLink(db, token);
  const unavailable = linkUnavailableReason(link);
  if (unavailable) throw new HttpError(410, unavailable);
  if (!withFields) return { link, app: null, fields: [] };

  const app = await loadLinkApp(db, link);
  const fields = publicFields(app, link.field_ids);
  if (!fields.length) throw new HttpError(410, 'This form has no fields to fill in yet.');
  return { link, app, fields };
}

/** What the client is allowed to know about the link itself. Never the hash, the salt, the
 *  company, the workspace or the app id. */
export function linkSummary(link, app) {
  return {
    title: String(link.title || app?.name || 'Form').slice(0, 200),
    intro: String(link.intro || '').slice(0, 2000),
    appName: String(app?.name || '').slice(0, 120),
    recordName: String(app?.recordName || '').slice(0, 120),
    color: /^#[0-9a-f]{3,8}$/i.test(String(app?.color || '')) ? String(app.color) : '',
    needsPasscode: link.visibility === 'private',
  };
}
