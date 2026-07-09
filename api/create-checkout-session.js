import crypto from 'node:crypto';
import { appendQuery, readJsonBody, requireAllowedOrigin, safeReturnUrl, setApiHeaders } from './_lib/http-security.js';

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
};

const env = (key) => process.env[key] || '';

async function supabaseFetch(path, options = {}) {
  const url = `${env('SUPABASE_URL') || env('VITE_SUPABASE_URL')}${path}`;
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  return fetch(url, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...(options.headers || {}),
    },
  });
}

async function getUserFromBearer(request) {
  const token = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const response = await fetch(`${env('SUPABASE_URL') || env('VITE_SUPABASE_URL')}/auth/v1/user`, {
    headers: {
      apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return null;
  return response.json();
}

export function checkoutIdempotencyKey({ companyId, userId, priceId, requestId }) {
  return crypto.createHash('sha256').update(`${companyId}:${userId}:${priceId}:${requestId}`).digest('hex');
}

export default async function handler(request, response) {
  setApiHeaders(response);
  if (request.method !== 'POST') return json(response, 405, { error: 'Method not allowed' });
  if (!env('STRIPE_SECRET_KEY') || !env('STRIPE_PRICE_ID') || !env('SUPABASE_SERVICE_ROLE_KEY')) {
    return json(response, 501, { error: 'Billing is not configured yet.' });
  }

  const user = await getUserFromBearer(request);
  if (!user?.id) return json(response, 401, { error: 'Authentication required.' });

  try {
    requireAllowedOrigin(request);
    const body = await readJsonBody(request, { maxBytes: 16 * 1024 });
    const companyId = String(body.company_id || '').trim();
    const requestId = String(body.request_id || request.headers['x-idempotency-key'] || '').trim();
    const returnUrl = safeReturnUrl(body.return_url, request);
    if (!companyId) return json(response, 400, { error: 'company_id is required.' });
    if (!/^[A-Za-z0-9_-]{8,120}$/.test(requestId)) return json(response, 400, { error: 'A stable request_id is required.' });

    const membershipResponse = await supabaseFetch(`/rest/v1/company_memberships?company_id=eq.${encodeURIComponent(companyId)}&profile_id=eq.${encodeURIComponent(user.id)}&status=eq.active&select=role`);
    const memberships = membershipResponse.ok ? await membershipResponse.json() : [];
    const allowed = memberships.some((item) => ['owner', 'admin', 'developer', 'construction_supervisor'].includes(String(item.role || '').toLowerCase()));
    if (!allowed) return json(response, 403, { error: 'Owner/Admin billing permission required.' });

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

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': idempotencyKey,
      },
      body: params,
    });
    const payload = await stripeResponse.json();
    if (!stripeResponse.ok) return json(response, stripeResponse.status, { error: payload.error?.message || 'Stripe checkout failed.' });
    return json(response, 200, { url: payload.url });
  } catch (error) {
    return json(response, Number(error?.statusCode) || 500, { error: Number(error?.statusCode) < 500 ? error.message : 'Could not start billing.' });
  }
}
