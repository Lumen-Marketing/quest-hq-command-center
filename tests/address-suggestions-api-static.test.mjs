import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const apiSource = readFileSync(new URL('../api/address-suggestions.js', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('address suggestions API supports Google Places with an open search fallback', () => {
  assert.match(apiSource, /GOOGLE_MAPS_API_KEY/);
  assert.match(apiSource, /GOOGLE_PLACES_API_KEY/);
  assert.match(apiSource, /https:\/\/places\.googleapis\.com\/v1\/places:autocomplete/);
  assert.match(apiSource, /X-Goog-FieldMask/);
  assert.match(apiSource, /https:\/\/nominatim\.openstreetmap\.org\/search/);
  assert.match(apiSource, /const result = \[\.\.\.unique\.values\(\)\]\.slice\(0, 8\)/);
  assert.match(apiSource, /suggestionCache\.set\(cacheKey/);
});

test('the suggestion proxy refuses anonymous callers', () => {
  // It spends money per lookup: a billed Places call, or Nominatim traffic under a usage
  // policy that does not cover the open internet. Unauthenticated, the only brake was an
  // in-memory limiter that resets on every cold start.
  assert.match(apiSource, /getUserFromBearer/);
  assert.match(apiSource, /Authentication required\./);
  assert.match(apiSource, /requireAllowedOrigin\(request\)/);
});

test('crm address inputs use the custom autocomplete endpoint instead of native datalist only', () => {
  assert.match(appSource, /fetch\(`\/api\/address-suggestions\?q=\$\{encodeURIComponent\(query\)\}`/);
  assert.match(appSource, /menu\.className = 'address-suggestions-menu'/);
  assert.match(appSource, /data-address-suggestion/);
  assert.match(appSource, /data-address-options="\$\{h\(JSON\.stringify\(options\)\)\}"/);
  assert.doesNotMatch(appSource, /data-address-lookup-input[^>]+list=/);
});
