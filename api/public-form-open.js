const env = (name) => process.env[name] || '';
const baseUrl = () => env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
const serviceKey = () => env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY');
const isSupabaseSecretKey = () => /^sb_secret_/i.test(serviceKey()) || /^eyJ/i.test(serviceKey());

function supabaseHeaders(extra = {}) {
  const key = serviceKey();
  return {
    apikey: key,
    ...(isSupabaseSecretKey() ? {} : { Authorization: `Bearer ${key}` }),
    ...extra,
  };
}

async function supabaseGet(path) {
  const response = await fetch(`${baseUrl()}/rest/v1/${path}`, {
    headers: supabaseHeaders({ Accept: 'application/json' }),
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) throw new Error(Array.isArray(data) ? 'Supabase request failed.' : data.message || 'Supabase request failed.');
  return data;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  if (!baseUrl() || !serviceKey()) return res.status(500).json({ error: 'Public forms are not configured.' });

  const formId = String(req.query?.form_id || '').trim();
  if (!formId) return res.status(400).json({ error: 'Missing form id.' });

  try {
    const select = 'id,company_id,title,description,type,status,audience,theme_color,background,submit_label,collect_email,require_approval,questions,created_at,updated_at';
    const rows = await supabaseGet(`forms?id=eq.${encodeURIComponent(formId)}&status=eq.Published&select=${select}`);
    const form = rows[0];
    if (!form) return res.status(404).json({ error: 'Form not found or not published.' });
    let company = { id: form.company_id, name: 'Quest HQ' };
    try {
      const companies = await supabaseGet(`companies?id=eq.${encodeURIComponent(form.company_id)}&select=id,name,icon_key,icon_image`);
      if (companies[0]) company = companies[0];
    } catch {
      // The form is still usable without company decoration.
    }
    return res.status(200).json({ form, company });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not open form.' });
  }
}
