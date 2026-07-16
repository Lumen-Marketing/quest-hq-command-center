import { setApiHeaders } from './_lib/http-security.js';
import { enforceRateLimit } from './_lib/rate-limit.js';

// Receives Content-Security-Policy violation reports (the CSP is Report-Only, so
// nothing is blocked — this just makes the violations visible in the server logs
// instead of only each visitor's console). Watch these before promoting the CSP
// to enforcing, so the enforce policy allows exactly what the app really needs.

export default async function handler(req, res) {
  setApiHeaders(res, { cacheControl: 'no-store' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();
  // Violations can arrive in bursts; cap them so a noisy page can't flood logs.
  if (!enforceRateLimit(req, res, { namespace: 'csp-report', limit: 60, windowMs: 60 * 1000 })) return;

  try {
    let raw = '';
    if (typeof req.body === 'string') raw = req.body;
    else if (req.body && typeof req.body === 'object') raw = JSON.stringify(req.body);
    else { for await (const chunk of req) { raw += chunk; if (raw.length > 16 * 1024) break; } }

    const report = JSON.parse(raw || '{}');
    // report-uri sends { "csp-report": {...} }; report-to sends { body: {...} }.
    const body = report['csp-report'] || report.body || report;
    const directive = body['violated-directive'] || body['effective-directive'] || body.effectiveDirective || 'unknown';
    const blocked = body['blocked-uri'] || body.blockedURL || '';
    console.warn('[CSP] violation:', directive, blocked || '(inline)');
  } catch {
    // Ignore malformed reports — never error on a best-effort telemetry endpoint.
  }
  return res.status(204).end();
}
