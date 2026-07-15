import { errorResponse, readJsonBody, requireAllowedOrigin, setApiHeaders } from './_lib/http-security.js';
import { enforceRateLimit } from './_lib/rate-limit.js';
import { supabaseConfigured, supabaseRpc } from './_lib/supabase-admin.js';

// Public company-invite lookup. Rate-limited per IP so invite tokens (which
// reveal a company name + the invited email) can't be enumerated by brute force.

export default async function handler(req, res) {
  setApiHeaders(res, { cacheControl: 'private, no-store' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!supabaseConfigured()) return res.status(500).json({ error: 'Invites are not configured.' });
  if (!enforceRateLimit(req, res, { namespace: 'public-invite-lookup', limit: 40, windowMs: 10 * 60 * 1000 })) return;

  try {
    requireAllowedOrigin(req);
    const body = await readJsonBody(req, { maxBytes: 4096 });
    const token = String(body.invite_token || '').trim();
    if (!token) return res.status(400).json({ error: 'Missing invite code.' });

    const rows = await supabaseRpc('lookup_company_invite', { invite_token: token });
    const invite = Array.isArray(rows) ? rows[0] : rows;
    return res.status(200).json({ invite: invite || null });
  } catch (error) {
    if (error.statusCode) return errorResponse(res, error, 'Could not look up that invite.');
    return res.status(500).json({ error: 'Could not look up that invite.' });
  }
}
