// Opening a public intake link.
//
//   GET  ?token=...            -- what this link is. Fields come back only on a PUBLIC link.
//   POST { token, passcode }   -- the passcode gate on a private link; fields on success.
//
// A private link returns NO fields until the passcode is right. Field labels describe the
// business ("Adjuster", "Claim #"), so handing them out before the gate would leak the shape
// of the work to anybody who guessed a token.

import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { loadIntake, linkSummary, loadLinkApp } from './_lib/intake-db.js';
import {
  LOCKOUT_MINUTES, MAX_PASSCODE_ATTEMPTS, lockedReason, publicFields, verifyPasscode,
} from './_lib/intake.js';

async function patchLink(db, token, patch) {
  await db(`/rest/v1/wb_intake_links?token=eq.${encodeURIComponent(token)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  }).catch(() => null);
}

export default defineEndpoint(
  {
    method: ['GET', 'POST'],
    auth: 'none',
    cacheControl: 'private, no-store',
    notConfiguredStatus: 500,
    notConfiguredMessage: 'Public intake links are not configured.',
    // Deliberately tight: this is the endpoint a passcode is guessed against. The per-link
    // lockout below is the real defence -- this limiter is in-memory and per serverless
    // instance, so it does not survive a cold start and cannot be relied on alone.
    rateLimit: { namespace: 'wb-intake-open', limit: 40, windowMs: 10 * 60 * 1000 },
  },
  async ({ req, query, body, db }) => {
    const token = String((req.method === 'POST' ? body.token : query.token) || '').trim();

    // A public link hands its fields over on the GET; a private one is metadata only, so the
    // page knows to draw the gate.
    const probe = await loadIntake(db, token, { withFields: false });
    const isPrivate = probe.link.visibility === 'private';

    if (req.method === 'GET') {
      if (!isPrivate) {
        const full = await loadIntake(db, token, { withFields: true });
        return { link: linkSummary(full.link, full.app), fields: full.fields };
      }
      return { link: linkSummary(probe.link, null), fields: [] };
    }

    // ---- POST: the passcode gate ----
    if (!isPrivate) {
      const full = await loadIntake(db, token, { withFields: true });
      return { link: linkSummary(full.link, full.app), fields: full.fields };
    }

    const locked = lockedReason(probe.link);
    if (locked) throw new HttpError(429, locked);

    const ok = verifyPasscode(body.passcode, probe.link.passcode_salt, probe.link.passcode_hash);
    if (!ok) {
      const attempts = Number(probe.link.failed_attempts || 0) + 1;
      const lock = attempts >= MAX_PASSCODE_ATTEMPTS;
      await patchLink(db, token, {
        failed_attempts: lock ? 0 : attempts,
        locked_until: lock ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString() : null,
      });
      throw new HttpError(401, lock
        ? `Too many incorrect passcodes. Try again in ${LOCKOUT_MINUTES} minutes.`
        : 'That passcode is not right.');
    }

    if (Number(probe.link.failed_attempts || 0)) {
      await patchLink(db, token, { failed_attempts: 0, locked_until: null });
    }

    const app = await loadLinkApp(db, probe.link);
    const fields = publicFields(app, probe.link.field_ids);
    if (!fields.length) throw new HttpError(410, 'This form has no fields to fill in yet.');
    return { link: linkSummary(probe.link, app), fields };
  },
);
