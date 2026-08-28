// A stranger's answers, on their way to becoming a record.
//
// This writes to wb_intake_submissions and NOWHERE else. It deliberately does not touch
// workspace_builder_state: that row holds every app and every record for the whole company in
// one jsonb value, so "append one record" is really "rewrite everything", and no unauthenticated
// request should be able to cause that. A member with workspaces.manage accepts the submission
// afterwards, through the client's own save path.

import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { claimSubmissionSlot, loadIntake, releaseSubmissionSlot } from './_lib/intake-db.js';
import { IntakeValueError, cleanIntakeValues, lockedReason, verifyPasscode } from './_lib/intake.js';

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'no-store',
    notConfiguredStatus: 500,
    notConfiguredMessage: 'Public intake links are not configured.',
    bodyLimitBytes: 512 * 1024,
    rateLimit: { namespace: 'wb-intake-submit', limit: 12, windowMs: 10 * 60 * 1000 },
  },
  async ({ body, db }) => {
    // Two cheap spam gates, the same pair the public form uses: a honeypot field no human
    // sees, and a floor on how fast the form can have been filled in. Both answer 200-ish so
    // a bot learns nothing from the difference.
    if (String(body.website || '').trim()) return { submitted: true };
    const startedAt = Date.parse(String(body.started_at || ''));
    if (Number.isFinite(startedAt) && Date.now() - startedAt < 1500) {
      throw new HttpError(429, 'Please wait a moment before submitting.');
    }

    const token = String(body.token || '').trim();
    const { link, fields } = await loadIntake(db, token, { withFields: true });

    // The gate is enforced again here, not just on open: the open call is what the page uses,
    // and a submit that trusted it would let anybody post to a private link by skipping it.
    if (link.visibility === 'private') {
      const locked = lockedReason(link);
      if (locked) throw new HttpError(429, locked);
      if (!verifyPasscode(body.passcode, link.passcode_salt, link.passcode_hash)) {
        throw new HttpError(401, 'That passcode is not right.');
      }
    }

    let values;
    try {
      values = cleanIntakeValues(body.values, fields);
    } catch (error) {
      if (error instanceof IntakeValueError) throw new HttpError(400, error.message);
      throw error;
    }

    // Claim the slot BEFORE writing the row.
    //
    // This used to count afterwards, so that a failed insert could not use up somebody's one
    // submission. The cost was that two posts sent together both passed the cap check and both
    // got in — a link meant to be filled in once accepted several. Claiming first makes the cap
    // mean something; the release below restores the old guarantee when the insert really does
    // fail, which is the rarer case of the two.
    if (!(await claimSubmissionSlot(db, link))) {
      throw new HttpError(410, 'This link has already been filled in.');
    }

    const insert = await db('/rest/v1/wb_intake_submissions', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        token: link.token,
        company_id: link.company_id,
        workspace_id: link.workspace_id,
        app_id: link.app_id,
        values,
        submitted_name: String(body.name || '').slice(0, 240),
        submitted_email: String(body.email || '').slice(0, 240),
      }),
    }).catch(() => null);

    if (!insert?.ok) {
      await releaseSubmissionSlot(db, link.token);
      throw new HttpError(500, 'Could not send this form.');
    }

    return { submitted: true };
  },
);
