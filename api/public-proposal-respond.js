import { errorResponse, readJsonBody, requireAllowedOrigin, setApiHeaders } from './_lib/http-security.js';
import { enforceDurableRateLimit } from './_lib/rate-limit.js';
import { createAdminFetch, supabaseConfigured, supabaseRpc } from './_lib/supabase-admin.js';

// Public proposal accept / decline (the e-signature action). Rate-limited harder
// than the read, since it is a state-changing, legally-meaningful call.

export default async function handler(req, res) {
  setApiHeaders(res, { cacheControl: 'private, no-store' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!supabaseConfigured()) return res.status(500).json({ error: 'Proposals are not configured.' });
  if (!await enforceDurableRateLimit(req, res, {
    namespace: 'public-proposal-respond', limit: 20, windowMs: 10 * 60 * 1000, db: createAdminFetch(),
  })) return;

  try {
    requireAllowedOrigin(req);
    const body = await readJsonBody(req, { maxBytes: 8192 });
    const token = String(body.proposal_token || '').trim();
    const signerName = String(body.signer_name || '').trim();
    const signerEmail = String(body.signer_email || '').trim();
    const decision = String(body.decision || 'accept').trim().toLowerCase();

    if (!token) return res.status(400).json({ error: 'Missing proposal link.' });
    if (!signerName) return res.status(400).json({ error: 'Name is required to respond.' });
    if (decision !== 'accept' && decision !== 'decline') return res.status(400).json({ error: 'Unsupported decision.' });
    if (signerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signerEmail)) return res.status(400).json({ error: 'That email address looks invalid.' });

    const proposal = await supabaseRpc('accept_public_proposal', {
      proposal_token: token,
      signer_name: signerName,
      signer_email: signerEmail,
      decision,
    });
    return res.status(200).json({ proposal });
  } catch (error) {
    if (error.statusCode) return errorResponse(res, error, 'Could not record your response.');
    // Business errors ("Proposal is no longer open") come back as 4xx from the RPC.
    const status = error.status && error.status < 500 ? 409 : 500;
    return res.status(status).json({ error: status === 409 ? (error.message || 'This proposal can no longer be signed.') : 'Could not record your response.' });
  }
}
