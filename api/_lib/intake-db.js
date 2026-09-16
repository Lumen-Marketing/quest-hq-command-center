// Loading an intake link and the app it points at.
//
// Separate from intake.js so that file stays pure and testable. Everything here needs `db` --
// the service-role fetch -- because the whole point is reading a company document that the
// caller has no permission to see any part of.

import { HttpError } from './http-security.js';
import { LOCKOUT_MINUTES, MAX_PASSCODE_ATTEMPTS, linkUnavailableReason, publicFields } from './intake.js';

// How many times a contended counter re-reads and tries again before giving up. Contention
// here is either a handful of real people or somebody deliberately racing the lockout; five
// rounds settles the first and does not reward the second.
const CAS_ATTEMPTS = 5;

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
/**
 * Is this document workspace the one the link points at?
 *
 * The App Builder keys its workspaces `ws-<uuid>`, while the link row stores the BARE uuid --
 * wb_intake_links.workspace_id is a uuid column, and RLS is decided from it, so the client
 * writes it through opsWorkspaceId (src/workspace/ops-workspace-id.js). Comparing the two as
 * written never matched, so every public link answered "no longer available" while the app sat
 * in the document all along. The prefix is stripped from both sides rather than added to one,
 * so a row holding either spelling resolves.
 */
const sameWorkspace = (docId, linkId) => {
  const left = String(docId || "").replace(/^ws-/, "").toLowerCase();
  const right = String(linkId || "").replace(/^ws-/, "").toLowerCase();
  return Boolean(left) && left === right;
};

export async function loadLinkApp(db, link) {
  const res = await db(`/rest/v1/workspace_builder_state?company_id=eq.${encodeURIComponent(link.company_id)}&select=doc`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new HttpError(500, 'Could not open this link.');
  const doc = (await res.json().catch(() => []))[0]?.doc;
  const workspaces = Array.isArray(doc?.workspaces) ? doc.workspaces : [];

  const workspace = workspaces.find((item) => sameWorkspace(item?.id, link.workspace_id));
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

// ---- counters ---------------------------------------------------------------------------
//
// Both counters on a link — the passcode lockout and the submission cap — used to be
// read-modify-write: read the row, add one in JavaScript, write it back. Eight passcode
// guesses posted together all read `0` and all wrote `1`, so MAX_PASSCODE_ATTEMPTS never
// tripped; the same race let a link capped at one submission accept several. That mattered
// more than it looks, because the per-link lockout is the control that is *supposed* to carry
// the weight here: the request limiter is in-memory and per serverless instance, so it does
// not survive a cold start and cannot be relied on alone.
//
// These are compare-and-swap instead. The filter names the value we read, so Postgres updates
// the row only if nobody moved it in between; an empty result means we lost the race and must
// re-read. No migration and no new database function — the atomicity is in the WHERE clause.

const eq = (value) => `eq.${encodeURIComponent(String(value ?? ''))}`;

async function readCounter(db, token, column) {
  const res = await db(`/rest/v1/wb_intake_links?token=${eq(token)}&select=${column}`);
  if (!res.ok) return null;
  const row = (await res.json().catch(() => []))[0];
  return row ? Number(row[column] || 0) : null;
}

/**
 * Record one wrong passcode, atomically.
 *
 * Returns `{ locked }` — true when this attempt was the one that tripped the lockout, which
 * is what the caller turns into the "try again in N minutes" message. On reaching the limit
 * the counter resets to zero and `locked_until` carries the ban, matching the original
 * behaviour.
 */
export async function recordFailedPasscode(db, token) {
  for (let round = 0; round < CAS_ATTEMPTS; round += 1) {
    const observed = await readCounter(db, token, 'failed_attempts');
    if (observed === null) return { locked: false };

    const next = observed + 1;
    const locked = next >= MAX_PASSCODE_ATTEMPTS;
    const res = await db(
      `/rest/v1/wb_intake_links?token=${eq(token)}&failed_attempts=${eq(observed)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          failed_attempts: locked ? 0 : next,
          locked_until: locked ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }),
      },
    ).catch(() => null);

    if (res?.ok) {
      const rows = await res.json().catch(() => []);
      if (Array.isArray(rows) && rows.length) return { locked };
    }
    // Lost the race, or the write failed: re-read and try again.
  }

  // Contended past the retry budget. Losing the swap this many times in a row means many wrong
  // passcodes are arriving at once, which is the attack this counter exists to stop — so lock
  // the link outright rather than letting an uncounted guess through. Written without a
  // compare-and-swap filter on purpose: the point is that it lands.
  await db(`/rest/v1/wb_intake_links?token=${eq(token)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      failed_attempts: 0,
      locked_until: new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString(),
      updated_at: new Date().toISOString(),
    }),
  }).catch(() => null);
  return { locked: true };
}

/** Clear the failure counter after a correct passcode. Best effort; never blocks entry. */
export async function clearFailedPasscodes(db, token) {
  await db(`/rest/v1/wb_intake_links?token=${eq(token)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() }),
  }).catch(() => null);
}

/**
 * Claim one submission against the link's cap, atomically.
 *
 * Returns false when the cap is already met, so the caller can refuse BEFORE writing the
 * submission row. Counting after the insert is what let concurrent posts overshoot a link
 * that was only ever meant to be filled in once.
 */
export async function claimSubmissionSlot(db, link) {
  const max = link.max_submissions == null ? null : Number(link.max_submissions);

  for (let round = 0; round < CAS_ATTEMPTS; round += 1) {
    const observed = await readCounter(db, link.token, 'submission_count');
    if (observed === null) return false;
    if (max != null && observed >= max) return false;

    const res = await db(
      `/rest/v1/wb_intake_links?token=${eq(link.token)}&submission_count=${eq(observed)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ submission_count: observed + 1, updated_at: new Date().toISOString() }),
      },
    ).catch(() => null);

    if (res?.ok) {
      const rows = await res.json().catch(() => []);
      if (Array.isArray(rows) && rows.length) return true;
    }
  }
  return false;
}

/** Hand a claimed slot back when the submission itself could not be stored. */
export async function releaseSubmissionSlot(db, token) {
  for (let round = 0; round < CAS_ATTEMPTS; round += 1) {
    const observed = await readCounter(db, token, 'submission_count');
    if (observed === null || observed <= 0) return;
    const res = await db(
      `/rest/v1/wb_intake_links?token=${eq(token)}&submission_count=${eq(observed)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ submission_count: observed - 1, updated_at: new Date().toISOString() }),
      },
    ).catch(() => null);
    if (res?.ok) {
      const rows = await res.json().catch(() => []);
      if (Array.isArray(rows) && rows.length) return;
    }
  }
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
