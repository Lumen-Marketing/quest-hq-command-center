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

const DND_OFF_VALUES = new Set(['', 'takeallcalls', 'unknown']);

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function cleanText(value) {
  return String(value ?? '').trim();
}

/** Flatten one RingCentral call-log record into a `ringcentral_calls` row. */
export function normalizeCallRecord(record, { companyId, extensions }) {
  const callId = cleanText(record?.id);
  const startedAt = cleanText(record?.startTime);
  if (!callId || !startedAt) return null;

  const extensionId = cleanText(record?.extension?.id);
  const known = extensions.get(extensionId) || {};
  const durationSeconds = Number(record?.duration) || 0;

  return {
    company_id: companyId,
    call_id: callId,
    session_id: cleanText(record?.sessionId),
    started_at: startedAt,
    direction: cleanText(record?.direction),
    from_number: cleanText(record?.from?.phoneNumber),
    from_name: cleanText(record?.from?.name),
    to_number: cleanText(record?.to?.phoneNumber),
    to_name: cleanText(record?.to?.name),
    extension_id: extensionId,
    extension_number: cleanText(known.extension_number),
    extension_name: cleanText(known.name),
    extension_email: cleanEmail(known.email),
    duration_seconds: durationSeconds,
    result: cleanText(record?.result),
    is_conversation: durationSeconds >= CONVERSATION_THRESHOLD_SECONDS,
    raw: record,
  };
}

/**
 * Collapse RingCentral's three independent presence signals into the one label
 * the board shows. Order matters: an active call outranks whatever the person
 * set their status to.
 */
export function deriveDisplayStatus(presence) {
  const telephony = cleanText(presence?.telephonyStatus).toLowerCase();
  if (telephony === 'callconnected') return 'on_call';
  if (telephony === 'ringing') return 'ringing';

  const dnd = cleanText(presence?.dndStatus).toLowerCase();
  if (dnd && !DND_OFF_VALUES.has(dnd)) return 'dnd';

  const user = cleanText(presence?.userStatus).toLowerCase();
  if (user === 'offline') return 'offline';
  if (user === 'busy') return 'busy';
  return 'available';
}

/** Keep only user extensions — departments and queues are not people. */
export function normalizeExtension(record, companyId) {
  const extensionId = cleanText(record?.id);
  if (!extensionId) return null;
  if (cleanText(record?.type) !== 'User') return null;

  return {
    company_id: companyId,
    extension_id: extensionId,
    extension_number: cleanText(record?.extensionNumber),
    name: cleanText(record?.name),
    email: cleanEmail(record?.contact?.email),
    status: cleanText(record?.status),
  };
}
