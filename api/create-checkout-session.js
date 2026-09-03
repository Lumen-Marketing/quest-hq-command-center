import crypto from 'node:crypto';
import { defineEndpoint, jsonResponse } from './_lib/endpoint.js';
import { HttpError, appendQuery, safeReturnUrl } from './_lib/http-security.js';
import { getUserFromBearer } from './_lib/user-auth.js';

const env = (key) => process.env[key] || '';

const BILLING_ROLES = ['owner', 'admin', 'developer'];

export function checkoutIdempotencyKey({ companyId, userId, priceId, requestId }) {
  return crypto.createHash('sha256').update(`${companyId}:${userId}:${priceId}:${requestId}`).digest('hex');
}

export default defineEndpoint(
  {
    method: 'POST',
    auth: 'none',
    requireOrigin: true,
    cacheControl: 'private, no-store',
    bodyLimitBytes: 16 * 1024,
    rateLimit: { namespace: 'create-checkout-session', limit: 10, windowMs: 10 * 60 * 1000 },
  },
  async (ctx) => {
    const { body, db, req } = ctx;
    const getUser = ctx.getUser || getUserFromBearer;
    const stripeFetch = ctx.stripeFetch || fetch;

    if (!env('STRIPE_SECRET_KEY') || !env('STRIPE_PRICE_ID')) {
      throw new HttpError(501, 'Billing is not configured yet.');
    }

    const user = await getUser(req);
    if (!user?.id) throw new HttpError(401, 'Authentication required.');

    const companyId = String(body.company_id || '').trim();
    const requestId = String(body.request_id || req.headers['x-idempotency-key'] || '').trim();
    const returnUrl = safeReturnUrl(body.return_url, req);
    if (!companyId) throw new HttpError(400, 'company_id is required.');
    if (!/^[A-Za-z0-9_-]{8,120}$/.test(requestId)) throw new HttpError(400, 'A stable request_id is required.');

    const membershipRes = await db(`/rest/v1/company_memberships?company_id=eq.${encodeURIComponent(companyId)}&profile_id=eq.${encodeURIComponent(user.id)}&status=eq.active&select=role`);
    const memberships = membershipRes.ok ? await membershipRes.json().catch(() => []) : [];
    const allowed = memberships.some((item) => BILLING_ROLES.includes(String(item.role || '').toLowerCase()));
    if (!allowed) throw new HttpError(403, 'Owner/Admin billing permission required.');

    const idempotencyKey = checkoutIdempotencyKey({ companyId, userId: user.id, priceId: env('STRIPE_PRICE_ID'), requestId });
    const params = new URLSearchParams();
    params.set('mode', 'subscription');
    params.set('line_items[0][price]', env('STRIPE_PRICE_ID'));
    params.set('line_items[0][quantity]', '1');
    params.set('success_url', appendQuery(returnUrl, 'billing', 'success'));
    params.set('cancel_url', appendQuery(returnUrl, 'billing', 'cancel'));
    params.set('customer_email', user.email || '');
    params.set('metadata[company_id]', companyId);
    params.set('metadata[profile_id]', user.id);
    params.set('subscription_data[metadata][company_id]', companyId);
    params.set('subscription_data[metadata][profile_id]', user.id);

    const stripeRes = await stripeFetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': idempotencyKey,
      },
      body: params,
    });
    const payload = await stripeRes.json().catch(() => ({}));
    if (!stripeRes.ok) {
      return jsonResponse(stripeRes.status, { error: payload.error?.message || 'Stripe checkout failed.' });
    }

    return { url: payload.url };
  },
);
