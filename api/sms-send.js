import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';

// Deliberately closed. The former handler authorized at company level and depended on
// company-only number/message tables that do not exist in production. Credentials appearing
// in hosting configuration must never be enough to revive that unsafe contract.
export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'private, no-store',
    rateLimit: { namespace: 'sms-send', limit: 60, windowMs: 10 * 60 * 1000 },
  },
  async () => {
    throw new HttpError(501, 'SMS is intentionally disabled until workspace-safe routing and storage are implemented.');
  },
);
