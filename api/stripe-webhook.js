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

async function supabaseRpc(name, body) {
  const url = `${env('SUPABASE_URL') || env('VITE_SUPABASE_URL')}/rest/v1/rpc/${name}`;
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await response.text());
}

export function normalizeStripeSubscriptionStatus(status) {
  const value = String(status || '').toLowerCase();
  if (['trialing', 'active', 'past_due', 'canceled', 'incomplete'].includes(value)) return value;
  if (['unpaid', 'incomplete_expired', 'paused'].includes(value)) return 'suspended';
  return 'incomplete';
}

async function fetchStripeSubscription(subscriptionId) {
  if (!subscriptionId) return null;
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${env('STRIPE_SECRET_KEY')}` },
  });
  if (!response.ok) return null;
  return response.json();
}

async function syncSubscriptionFromStripe(object, event) {
  const subscriptionId = object.object === 'subscription' ? object.id : object.subscription;
  // Prefer Stripe's current object so delayed webhook delivery cannot regress
  // the row. Deleted subscriptions can no longer be fetched, so retain the
  // signed event object as the authoritative fallback for that event.
  const current = await fetchStripeSubscription(subscriptionId);
  if (object.object !== 'subscription' && (!subscriptionId || !current)) {
    throw new Error('Stripe subscription could not be resolved; retry the webhook.');
  }
  const subscription = current || (object.object === 'subscription' ? object : null);
  const companyId = object.metadata?.company_id || subscription?.metadata?.company_id;
  if (!companyId) return;
  await supabaseRpc('apply_stripe_subscription_event', {
    p_event_id: String(event.id || ''),
    p_event_created_at: new Date(Number(event.created || 0) * 1000).toISOString(),
    p_company_id: String(companyId),
    p_customer_id: String(object.customer || subscription?.customer || ''),
    p_subscription_id: String(subscription?.id || subscriptionId || ''),
    p_status: normalizeStripeSubscriptionStatus(subscription?.status || object.status),
    p_current_period_end: subscription?.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
    p_trial_ends_at: subscription?.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
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
      await syncSubscriptionFromStripe(event.data.object, event);
    }
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ received: true }));
  } catch (error) {
    // Log the detail server-side; return a generic message so config/DB error text
    // (which can precede signature verification) is never echoed to the caller.
    console.error('[stripe-webhook]', error?.message || error);
    response.statusCode = 400;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ error: 'Webhook processing failed' }));
  }
}
