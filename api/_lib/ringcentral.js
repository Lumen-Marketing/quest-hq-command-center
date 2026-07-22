// The only module that knows RingCentral exists. Everything else talks to it
// through these functions, so tests can inject a fake fetch and never touch the
// network.

export const CONVERSATION_THRESHOLD_SECONDS = 60;

const JWT_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const PAGE_SIZE = 250;
const MAX_PAGES = 40; // hard stop: a runaway pager would burn the rate limit
const TOKEN_SAFETY_WINDOW_MS = 60_000;

export class RingCentralError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'RingCentralError';
    this.statusCode = statusCode;
  }
}

async function describeFailure(response) {
  try {
    const body = await response.text();
    return body.slice(0, 200);
  } catch {
    return 'no response body';
  }
}

export function createRingCentralClient({ clientId, clientSecret, jwt, serverUrl, fetchImpl = fetch, now = () => Date.now() }) {
  const base = String(serverUrl || '').replace(/\/$/, '');
  let cachedToken = '';
  let cachedUntil = 0;

  async function getAccessToken() {
    if (cachedToken && now() < cachedUntil) return cachedToken;

    const body = new URLSearchParams({ grant_type: JWT_GRANT_TYPE, assertion: jwt }).toString();
    const response = await fetchImpl(`${base}/restapi/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body,
    });
    if (!response.ok) throw new RingCentralError(response.status, `Token exchange failed: ${await describeFailure(response)}`);

    const payload = await response.json();
    cachedToken = String(payload.access_token || '');
    if (!cachedToken) throw new RingCentralError(502, 'Token exchange returned no access_token.');
    const lifetimeMs = (Number(payload.expires_in) || 3600) * 1000;
    cachedUntil = now() + Math.max(lifetimeMs - TOKEN_SAFETY_WINDOW_MS, 0);
    return cachedToken;
  }

  async function fetchPaged(path, params = {}) {
    const token = await getAccessToken();
    const records = [];

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const query = new URLSearchParams({ ...params, page: String(page), perPage: String(PAGE_SIZE) });
      const response = await fetchImpl(`${base}${path}?${query.toString()}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!response.ok) throw new RingCentralError(response.status, `${path} failed: ${await describeFailure(response)}`);

      const payload = await response.json();
      records.push(...(payload.records || []));
      const totalPages = Number(payload.paging?.totalPages) || 1;
      if (page >= totalPages) break;
    }

    return records;
  }

  return { getAccessToken, fetchPaged };
}
