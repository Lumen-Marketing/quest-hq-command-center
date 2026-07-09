import crypto from 'node:crypto';
import { setApiHeaders } from './_lib/http-security.js';

const env = (key) => process.env[key] || '';

async function readRawBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 1024 * 1024) throw new Error('Webhook body is too large');
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export function verifyStripeSignature(rawBody, header, { nowMs = Date.now(), toleranceSeconds = 300 } = {}) {
  const secret = env('STRIPE_WEBHOOK_SECRET');
  if (!secret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  const parts = String(header || '').split(',').map((part) => part.trim().split('=')).filter(([key, value]) => key && value);
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || !signatures.length || !/^\d+$/.test(timestamp)) throw new Error('Invalid Stripe signature header');
  if (Math.abs(Math.floor(nowMs / 1000) - Number(timestamp)) > toleranceSeconds) throw new Error('Stripe signature timestamp is outside tolerance');
  const signedPayload = `${timestamp}.${rawBody}`;
  const actual = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  const actualBuffer = Buffer.from(actual, 'hex');
  const valid = signatures.some((signature) => {
    if (!/^[0-9a-f]{64}$/i.test(signature)) return false;
    const expectedBuffer = Buffer.from(signature, 'hex');
    return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
  });
  if (!valid) {
    throw new Error('Invalid Stripe signature');
  }
}

async function supabaseUpsert(table, row) {
  const url = `${env('SUPABASE_URL') || env('VITE_SUPABASE_URL')}/rest/v1/${table}`;
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) throw new Error(await response.text());
}

async function fetchStripeSubscription(subscriptionId) {
  if (!subscriptionId) return null;
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${env('STRIPE_SECRET_KEY')}` },
  });
  if (!response.ok) return null;
  return response.json();
}

async function syncSubscriptionFromStripe(object) {
  const subscription = object.object === 'subscription' ? object : await fetchStripeSubscription(object.subscription);
  const companyId = object.metadata?.company_id || subscription?.metadata?.company_id;
  if (!companyId) return;
  await supabaseUpsert('company_subscriptions', {
    company_id: companyId,
    stripe_customer_id: String(object.customer || subscription?.customer || ''),
    stripe_subscription_id: String(subscription?.id || object.subscription || ''),
    status: String(subscription?.status || object.status || 'incomplete'),
    plan_code: 'quest_company_300',
    amount_cents: 30000,
    currency: 'usd',
    current_period_end: subscription?.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
    trial_ends_at: subscription?.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  });
}

export default async function handler(request, response) {
  setApiHeaders(response);
  if (request.method !== 'POST') {
    response.statusCode = 405;
    response.end('Method not allowed');
    return;
  }
  try {
    const rawBody = await readRawBody(request);
    verifyStripeSignature(rawBody, request.headers['stripe-signature']);
    const event = JSON.parse(rawBody);
    if ([
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ].includes(event.type)) {
      await syncSubscriptionFromStripe(event.data.object);
    }
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ received: true }));
  } catch (error) {
    response.statusCode = 400;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ error: error.message || 'Webhook failed' }));
  }
}
