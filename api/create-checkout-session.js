import crypto from 'node:crypto';

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

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return json(response, 405, { error: 'Method not allowed' });
  if (!env('STRIPE_SECRET_KEY') || !env('STRIPE_PRICE_ID') || !env('SUPABASE_SERVICE_ROLE_KEY')) {
    return json(response, 501, { error: 'Billing is not configured yet.' });
  }

  const user = await getUserFromBearer(request);
  if (!user?.id) return json(response, 401, { error: 'Authentication required.' });

  const body = await readJson(request).catch(() => ({}));
  const companyId = String(body.company_id || '').trim();
  const returnUrl = String(body.return_url || request.headers.origin || 'https://quest-hq-command-center.vercel.app');
  if (!companyId) return json(response, 400, { error: 'company_id is required.' });

  const membershipResponse = await supabaseFetch(`/rest/v1/company_memberships?company_id=eq.${encodeURIComponent(companyId)}&profile_id=eq.${encodeURIComponent(user.id)}&status=eq.active&select=role`);
  const memberships = membershipResponse.ok ? await membershipResponse.json() : [];
  const allowed = memberships.some((item) => ['owner', 'admin', 'developer', 'construction_supervisor'].includes(String(item.role || '').toLowerCase()));
  if (!allowed) return json(response, 403, { error: 'Owner/Admin billing permission required.' });

  const idempotencyKey = crypto.createHash('sha256').update(`${companyId}:${user.id}:${Date.now()}`).digest('hex');
  const params = new URLSearchParams();
  params.set('mode', 'subscription');
  params.set('line_items[0][price]', env('STRIPE_PRICE_ID'));
  params.set('line_items[0][quantity]', '1');
  params.set('success_url', `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}billing=success`);
  params.set('cancel_url', `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}billing=cancel`);
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
}
