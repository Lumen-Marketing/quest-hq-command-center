// SMSblast send seam. POST form-encoded params, per the Integrations "Post
// Params" contract: apiKey, from, to, message.
const SEND_URL = 'https://app.smsblast.io/api/v2/sms/send';

export async function sendSms({ apiKey, from, to, message }, fetchImpl = fetch) {
  const params = new URLSearchParams();
  params.set('apiKey', apiKey);
  params.set('from', from);
  params.set('to', to);
  params.set('message', message);

  const res = await fetchImpl(SEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}
