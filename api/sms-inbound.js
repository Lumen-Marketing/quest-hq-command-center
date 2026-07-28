import crypto from 'node:crypto';
import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { toE164 } from './_lib/phone.js';

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    cacheControl: 'private, no-store',
    notConfiguredStatus: 501,
    notConfiguredMessage: 'SMS is not configured.',
    rateLimit: { namespace: 'sms-inbound', limit: 600, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const { body, query, db } = ctx;

    const expected = process.env.SMSBLAST_WEBHOOK_TOKEN;
    if (!expected) throw new HttpError(501, 'SMS inbound is not configured.');
    const provided = query.token || body.token || '';
    if (!safeEqual(provided, expected)) throw new HttpError(401, 'Invalid webhook token.');

    const from = toE164(body.from ?? body.From ?? body.sender ?? '');
    const to = toE164(body.to ?? body.To ?? body.recipient ?? '');
    const text = String(body.message ?? body.text ?? body.body ?? body.Body ?? '').trim();
    const providerId = body.id || body.messageId || body.message_id || null;
    if (!from || !to) return { ok: true, skipped: 'unparseable numbers' };

    const numberRes = await db(`/rest/v1/sms_numbers?from_number=eq.${encodeURIComponent(to)}&active=eq.true&select=company_id&limit=1`);
    const numberRow = numberRes.ok ? (await numberRes.json().catch(() => []))[0] : null;
    if (!numberRow?.company_id) return { ok: true, skipped: 'unknown destination number' };
    const companyId = numberRow.company_id;

    // Match by normalized phone. Contact counts are small; fetch and compare in JS.
    const contactsRes = await db(`/rest/v1/contacts?company_id=eq.${encodeURIComponent(companyId)}&select=id,phone`);
    const contacts = contactsRes.ok ? (await contactsRes.json().catch(() => [])) : [];
    let contact = contacts.find((c) => toE164(c.phone) === from);

    if (!contact) {
      const newId = `contact_${crypto.randomUUID()}`;
      const createRes = await db('/rest/v1/contacts', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ id: newId, company_id: companyId, name: from, phone: from, stage: 'Leads' }),
      });
      if (createRes.ok) contact = (await createRes.json().catch(() => []))[0] || null;
      // On failure (commonly a concurrent inbound that already created this contact and
      // tripped a unique constraint) re-select by phone rather than inventing an id that
      // has no row — otherwise the sms_messages FK insert fails and the message is lost.
      if (!contact) {
        const retryRes = await db(`/rest/v1/contacts?company_id=eq.${encodeURIComponent(companyId)}&select=id,phone`);
        const retryContacts = retryRes.ok ? (await retryRes.json().catch(() => [])) : [];
        contact = retryContacts.find((c) => toE164(c.phone) === from) || null;
      }
      // Do not silently drop the message: return 5xx so the provider retries.
      if (!contact?.id) throw new HttpError(502, 'Could not resolve contact for inbound message.');
    }

    const messageRes = await db('/rest/v1/sms_messages', {
      method: 'POST',
      body: JSON.stringify({
        company_id: companyId,
        contact_id: contact.id,
        direction: 'inbound',
        body: text,
        from_number: from,
        to_number: to,
        status: 'received',
        provider_message_id: providerId,
      }),
    });
    if (!messageRes.ok) throw new HttpError(502, 'Failed to store inbound message.');

    return { ok: true };
  },
);
