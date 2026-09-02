import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';

// Deliberately closed for the same reason as sms-send: the legacy webhook cannot prove or
// preserve a workspace boundary. Return "not implemented" instead of accepting messages into
// the wrong tenant if provider credentials are added accidentally.
export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    cacheControl: 'private, no-store',
    rateLimit: { namespace: 'sms-inbound', limit: 600, windowMs: 10 * 60 * 1000 },
  },
  async () => {
    throw new HttpError(501, 'SMS inbound is intentionally disabled until workspace-safe routing and storage are implemented.');
  },
);
