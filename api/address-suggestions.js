import { setApiHeaders } from './_lib/http-security.js';
import { enforceRateLimit } from './_lib/rate-limit.js';

const suggestionCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
  response.end(JSON.stringify(payload));
};

const env = (key) => process.env[key] || '';

function cleanQuery(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 160);
}

function normalizeSuggestion(value, source = 'address') {
  const label = cleanQuery(value);
  return label ? { label, value: label, source } : null;
}

async function googleSuggestions(query) {
  const key = env('GOOGLE_MAPS_API_KEY') || env('GOOGLE_PLACES_API_KEY');
  if (!key) return [];
  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'suggestions.placePrediction.text',
    },
    body: JSON.stringify({
      input: query,
      includedRegionCodes: ['us'],
      locationBias: {
        circle: {
          center: { latitude: 33.4484, longitude: -112.0740 },
          radius: 350000,
        },
      },
    }),
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload.suggestions || [])
    .map((item) => normalizeSuggestion(item.placePrediction?.text?.text, 'google'))
    .filter(Boolean);
}

async function openStreetMapSuggestions(query) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '8',
    countrycodes: 'us',
    bounded: '0',
    'accept-language': 'en',
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'QuestHQCommandCenter/1.0 (address autocomplete)',
    },
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return (Array.isArray(payload) ? payload : [])
    .map((item) => normalizeSuggestion(item.display_name, 'openstreetmap'))
    .filter(Boolean);
}

export default async function handler(request, response) {
  setApiHeaders(response, { cacheControl: 's-maxage=300, stale-while-revalidate=86400' });
  if (request.method !== 'GET') return json(response, 405, { error: 'Method not allowed' });
  if (!enforceRateLimit(request, response, { namespace: 'address-suggestions', limit: 60, windowMs: 60 * 1000 })) return;
  const url = new URL(request.url, `https://${request.headers.host || 'quest-hq.local'}`);
  const query = cleanQuery(url.searchParams.get('q'));
  if (query.length < 3) return json(response, 200, { suggestions: [] });

  const cacheKey = query.toLowerCase();
  const cached = suggestionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return json(response, 200, { suggestions: cached.suggestions });
  if (cached) suggestionCache.delete(cacheKey);

  const suggestions = await googleSuggestions(query).catch(() => []);
  const fallback = suggestions.length ? [] : await openStreetMapSuggestions(query).catch(() => []);
  const unique = new Map();
  [...suggestions, ...fallback].forEach((item) => {
    if (!unique.has(item.value.toLowerCase())) unique.set(item.value.toLowerCase(), item);
  });
  const result = [...unique.values()].slice(0, 8);
  suggestionCache.set(cacheKey, { suggestions: result, expiresAt: Date.now() + CACHE_TTL_MS });
  if (suggestionCache.size > 500) suggestionCache.delete(suggestionCache.keys().next().value);
  return json(response, 200, { suggestions: result });
}
