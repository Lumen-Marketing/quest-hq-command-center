import { errorResponse, readJsonBody, requireAllowedOrigin, setApiHeaders } from './_lib/http-security.js';
import { enforceRateLimit } from './_lib/rate-limit.js';
import { supabaseConfigured, supabaseRpc } from './_lib/supabase-admin.js';

// Public proposal view. Anonymous browsers can no longer call the RPC directly
// (anon EXECUTE is revoked) — they come through here, where every request is
// rate-limited per IP to stop token brute-forcing.

export default async function handler(req, res) {
  setApiHeaders(res, { cacheControl: 'private, no-store' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!supabaseConfigured()) return res.status(500).json({ error: 'Proposals are not configured.' });
  if (!enforceRateLimit(req, res, { namespace: 'public-proposal-open', limit: 60, windowMs: 10 * 60 * 1000 })) return;

  try {
    requireAllowedOrigin(req);
    const body = await readJsonBody(req, { maxBytes: 4096 });
    const token = String(body.proposal_token || '').trim();
    if (!token) return res.status(400).json({ error: 'Missing proposal link.' });

    const proposal = await supabaseRpc('public_proposal_by_token', { proposal_token: token });
    return res.status(200).json({ proposal });
  } catch (error) {
    if (error.statusCode) return errorResponse(res, error, 'Could not open proposal.');
    const status = error.status && error.status < 500 ? 404 : 500;
    return res.status(status).json({ error: status === 404 ? 'Proposal not found.' : 'Could not open proposal.' });
  }
}
