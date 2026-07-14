import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

function headerMap() {
  const block = (config.headers || []).find((entry) => entry.source === '/(.*)');
  assert.ok(block, 'expected a site-wide "/(.*)" headers block in vercel.json');
  const map = new Map();
  for (const { key, value } of block.headers) map.set(key, value);
  return map;
}

test('the static app ships the unambiguous security headers', () => {
  const headers = headerMap();
  assert.equal(headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(headers.get('X-Frame-Options'), 'DENY');
  assert.ok(headers.has('Referrer-Policy'));
  assert.ok(headers.has('Cross-Origin-Opener-Policy'));
  assert.match(headers.get('Strict-Transport-Security') || '', /max-age=\d{7,}/);
});

test('Permissions-Policy disables camera/mic but KEEPS geolocation for the map', () => {
  // The map's "use my current location" control calls navigator.geolocation;
  // a blanket geolocation=() would silently break it.
  const pp = headerMap().get('Permissions-Policy') || '';
  assert.match(pp, /camera=\(\)/);
  assert.match(pp, /microphone=\(\)/);
  assert.match(pp, /geolocation=\(self\)/);
});

test('CSP ships in Report-Only until proven safe, not enforcing', () => {
  const headers = headerMap();
  // Deliberately Report-Only: the app embeds Supabase/Office iframes and loads
  // OSM tiles, so an enforcing policy must be verified in a browser first.
  assert.ok(headers.has('Content-Security-Policy-Report-Only'), 'expected a Report-Only CSP');
  assert.ok(!headers.has('Content-Security-Policy'), 'CSP should not enforce until the report-only pass is clean');
});

test('the CSP allows every origin the app actually uses', () => {
  const csp = headerMap().get('Content-Security-Policy-Report-Only') || '';
  // script has NO unsafe-inline (the build emits no inline scripts) — the real win.
  assert.match(csp, /script-src 'self'(;|\s)/, "script-src must be strict 'self'");
  assert.ok(!/script-src[^;]*unsafe-inline/.test(csp), 'script-src must not allow unsafe-inline');
  // Origins discovered in the source that must not be blocked:
  for (const needle of [
    'https://rqundirizvojpzhljtdn.supabase.co',        // REST + storage
    'wss://rqundirizvojpzhljtdn.supabase.co',          // realtime
    'https://api.pwnedpasswords.com',                  // breach check
    'https://nominatim.openstreetmap.org',             // geocoding
    'tile.openstreetmap.org',                          // map tiles
    'https://fonts.gstatic.com',                       // web font files
    'https://view.officeapps.live.com',                // office doc preview iframe
  ]) {
    assert.ok(csp.includes(needle), `CSP is missing a required origin: ${needle}`);
  }
});
