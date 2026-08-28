// Address autocomplete, proxied so the Places key never reaches a browser.
//
// It also requires a signed-in caller, which it did not always. This endpoint spends money:
// every miss is a billed Google Places Autocomplete call, and the fallback leans on
// Nominatim, whose usage policy is not written for anonymous internet traffic. Unauthenticated,
// the only brake was the in-memory limiter — 60/min PER SERVERLESS INSTANCE, reset by every
// cold start — so anyone who read the network tab once could drive the bill or get the
// project blocked upstream. It is only ever called from signed-in forms, so the token was
// always there to check; nothing asked for it.

import { setApiHeaders, requireAllowedOrigin, HttpError } from './_lib/http-security.js';
import { enforceRateLimit } from './_lib/rate-limit.js';
import { getUserFromBearer } from './_lib/user-auth.js';

const suggestionCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_LOCATION = { country: 'us' };

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'private, max-age=60');
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

function requestHeader(request, name) {
  const value = request.headers?.[name] ?? request.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : String(value || '');
}

function safeDecode(value) {
  try { return decodeURIComponent(String(value || '')); } catch { return String(value || ''); }
}

export function visitorLocation(request) {
  const latitudeRaw = requestHeader(request, 'x-vercel-ip-latitude').trim();
  const longitudeRaw = requestHeader(request, 'x-vercel-ip-longitude').trim();
  const visitorCountry = requestHeader(request, 'x-vercel-ip-country').trim().toLowerCase();
  const isUsVisitor = visitorCountry === DEFAULT_LOCATION.country;
  const latitude = latitudeRaw ? Number(latitudeRaw) : Number.NaN;
  const longitude = longitudeRaw ? Number(longitudeRaw) : Number.NaN;
  const validCoordinates = Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
    && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
  return {
    ...(isUsVisitor && validCoordinates ? { latitude, longitude } : {}),
    city: isUsVisitor ? safeDecode(requestHeader(request, 'x-vercel-ip-city')).trim() : '',
    region: isUsVisitor ? safeDecode(requestHeader(request, 'x-vercel-ip-country-region')).trim() : '',
    country: DEFAULT_LOCATION.country,
  };
}

export function locationCacheKey(query, location) {
  const latitude = Number.isFinite(location.latitude) ? location.latitude.toFixed(2) : 'na';
  const longitude = Number.isFinite(location.longitude) ? location.longitude.toFixed(2) : 'na';
  return `${query.toLowerCase()}|${location.country || 'us'}|${latitude},${longitude}`;
}

async function googleSuggestions(query, location) {
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
      includedRegionCodes: [DEFAULT_LOCATION.country],
      ...(Number.isFinite(location.latitude) && Number.isFinite(location.longitude) ? { locationBias: {
        circle: {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          radius: 150000,
        },
      } } : {}),
    }),
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload.suggestions || [])
    .map((item) => normalizeSuggestion(item.placePrediction?.text?.text, 'google'))
    .filter(Boolean);
}

async function openStreetMapSuggestions(query, location) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '8',
    countrycodes: DEFAULT_LOCATION.country,
    bounded: '0',
    'accept-language': 'en',
  });
  if (Number.isFinite(location.latitude) && Number.isFinite(location.longitude)) {
    const span = 1.5;
    params.set('viewbox', [
      location.longitude - span,
      location.latitude + span,
      location.longitude + span,
      location.latitude - span,
    ].join(','));
  }
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

export default async function handler(request, response, overrides = {}) {
  setApiHeaders(response, { cacheControl: 'private, max-age=60' });
  if (request.method !== 'GET') return json(response, 405, { error: 'Method not allowed' });
  if (!enforceRateLimit(request, response, { namespace: 'address-suggestions', limit: 60, windowMs: 60 * 1000 })) return;

  try {
    requireAllowedOrigin(request);
  } catch (error) {
    return json(response, error instanceof HttpError ? error.statusCode : 403, { error: 'Origin is not allowed.' });
  }

  // Membership is not checked: an address is not tenant data, and every signed-in member of
  // every company may type one. Proving there is a real session is what stops the meter being
  // run by strangers, and that is the whole job here.
  const getUser = overrides.getUser || getUserFromBearer;
  const user = await getUser(request).catch(() => null);
  if (!user?.id) return json(response, 401, { error: 'Authentication required.' });

  const url = new URL(request.url, `https://${request.headers.host || 'quest-hq.local'}`);
  const query = cleanQuery(url.searchParams.get('q'));
  if (query.length < 3) return json(response, 200, { suggestions: [] });

  const location = visitorLocation(request);
  const cacheKey = locationCacheKey(query, location);
  const cached = suggestionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return json(response, 200, { suggestions: cached.suggestions });
  if (cached) suggestionCache.delete(cacheKey);

  const suggestions = await googleSuggestions(query, location).catch(() => []);
  const fallback = suggestions.length ? [] : await openStreetMapSuggestions(query, location).catch(() => []);
  const unique = new Map();
  [...suggestions, ...fallback].forEach((item) => {
    if (!unique.has(item.value.toLowerCase())) unique.set(item.value.toLowerCase(), item);
  });
  const result = [...unique.values()].slice(0, 8);
  suggestionCache.set(cacheKey, { suggestions: result, expiresAt: Date.now() + CACHE_TTL_MS });
  if (suggestionCache.size > 500) suggestionCache.delete(suggestionCache.keys().next().value);
  return json(response, 200, { suggestions: result });
}
