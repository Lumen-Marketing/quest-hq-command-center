import { defineEndpoint } from './_lib/endpoint.js';
import { HttpError } from './_lib/http-security.js';
import { getUserFromBearer, isActiveMember } from './_lib/user-auth.js';
import { toE164 } from './_lib/phone.js';
import { sendSms as sendViaSmsblast } from './_lib/smsblast.js';

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'private, no-store',
    notConfiguredStatus: 501,
    notConfiguredMessage: 'SMS is not configured.',
    rateLimit: { namespace: 'sms-send', limit: 60, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const { body, db } = ctx;
    const getUser = ctx.getUser || getUserFromBearer;
    const smsSend = ctx.smsSend || sendViaSmsblast;

    const apiKey = process.env.SMSBLAST_API_KEY;
    if (!apiKey) throw new HttpError(501, 'SMS is not configured.');

    const user = await getUser(ctx.req);
    if (!user?.id) throw new HttpError(401, 'Authentication required.');

    const contactId = String(body.contact_id || '').trim();
    const messageBody = String(body.body || '').trim();
    if (!contactId) throw new HttpError(400, 'contact_id is required.');
    if (!messageBody) throw new HttpError(400, 'Message text is required.');
    if (messageBody.length > 1600) throw new HttpError(400, 'Message is too long.');

    const contactRes = await db(`/rest/v1/contacts?id=eq.${encodeURIComponent(contactId)}&select=id,company_id,phone,name`);
    if (!contactRes.ok) throw new HttpError(500, 'Could not load contact.');
    const contact = (await contactRes.json().catch(() => []))[0];
    if (!contact) throw new HttpError(404, 'Contact not found.');

    if (!(await isActiveMember(db, contact.company_id, user.id))) {
      throw new HttpError(403, 'You do not have access to this contact.');
    }

    const to = toE164(contact.phone);
    if (!to) throw new HttpError(400, 'This contact has no valid mobile number.');

    const numberRes = await db(`/rest/v1/sms_numbers?company_id=eq.${encodeURIComponent(contact.company_id)}&active=eq.true&select=from_number&limit=1`);
    const numberRow = numberRes.ok ? (await numberRes.json().catch(() => []))[0] : null;
    if (!numberRow?.from_number) throw new HttpError(400, 'SMS is not set up for this company yet.');
    const from = numberRow.from_number;

    const result = await smsSend({ apiKey, from, to, message: messageBody });
    const status = result.ok ? 'sent' : 'failed';
    const providerId = result.data?.id || result.data?.messageId || result.data?.message_id || null;
    const errorText = result.ok ? null : (result.data?.error || result.data?.message || result.data?.raw || `SMSblast error ${result.status}`);

    const insertRes = await db('/rest/v1/sms_messages', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        company_id: contact.company_id,
        contact_id: contact.id,
        direction: 'outbound',
        body: messageBody,
        from_number: from,
        to_number: to,
        status,
        provider_message_id: providerId,
        error: errorText,
        created_by: user.id,
      }),
    });
    const saved = insertRes.ok ? (await insertRes.json().catch(() => []))[0] : null;

    if (!result.ok) throw new HttpError(502, errorText || 'Text could not be sent.');
    return { message: saved };
  },
);
