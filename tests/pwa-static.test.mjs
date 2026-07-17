import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const manifest = JSON.parse(read('../public/manifest.webmanifest'));
const sw = read('../public/sw.js');
const indexHtml = read('../index.html');
const main = read('../src/main.js');
const vercel = JSON.parse(read('../vercel.json'));

// PNG stores width/height as big-endian uint32 at bytes 16..24, right after IHDR.
function pngSize(rel) {
  const buf = readFileSync(new URL(rel, import.meta.url));
  assert.equal(buf.subarray(1, 4).toString('ascii'), 'PNG', `${rel} is not a PNG`);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test('the manifest carries what Chrome needs to offer an install', () => {
  assert.equal(manifest.name, 'Quest HQ Command Center');
  assert.ok(manifest.short_name.length <= 12, 'short_name must survive a home screen label');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.scope, '/');
  // Launching an installed app onto the marketing landing would be a bug: /command
  // resolves to the active company's dashboard, or bounces to login when signed out.
  assert.equal(manifest.start_url, '/command');
  // Tablets are held both ways; locking orientation would break one of them.
  assert.equal(manifest.orientation, 'any');
});

test('icons exist at the sizes Android actually asks for', () => {
  const bySize = Object.fromEntries(manifest.icons.map((i) => [`${i.sizes}:${i.purpose}`, i.src]));
  assert.ok(bySize['192x192:any'], 'Chrome requires a 192px icon to install');
  assert.ok(bySize['512x512:any'], 'Chrome requires a 512px icon for the splash');
  assert.ok(bySize['512x512:maskable'], 'without a maskable icon Android letterboxes the mark');

  for (const icon of manifest.icons) {
    const rel = `../public${icon.src}`;
    assert.ok(existsSync(new URL(rel, import.meta.url)), `missing icon file: ${icon.src}`);
    const [w, h] = icon.sizes.split('x').map(Number);
    const actual = pngSize(rel);
    assert.deepEqual(actual, { width: w, height: h }, `${icon.src} is ${actual.width}x${actual.height}, manifest claims ${icon.sizes}`);
  }
});

test('the page links the manifest and registers the worker in production only', () => {
  assert.match(indexHtml, /<link rel="manifest" href="%BASE_URL%manifest\.webmanifest" \/>/);
  assert.match(indexHtml, /<link rel="apple-touch-icon"/);
  assert.match(main, /import\.meta\.env\.PROD && 'serviceWorker' in navigator/);
  assert.match(main, /navigator\.serviceWorker\.register\('\/sw\.js', \{ scope: '\/' \}\)/);
});

test('the worker never caches the API or anything cross-origin', () => {
  // Both guards are load-bearing: caching authenticated API responses in the
  // Cache API would leak one user's data to the next session on that device.
  assert.match(sw, /if \(url\.origin !== self\.location\.origin\) return;/);
  assert.match(sw, /if \(url\.pathname\.startsWith\('\/api\/'\)\) return;/);
  assert.match(sw, /if \(request\.method !== 'GET'\) return;/);
});

test('navigations are network-first so a deploy is never shadowed by the cache', () => {
  const nav = sw.slice(sw.indexOf("request.mode === 'navigate'"));
  const fetchAt = nav.indexOf('fetch(request)');
  const fallbackAt = nav.indexOf('caches.match(SHELL_URL)');
  assert.ok(fetchAt > -1 && fallbackAt > -1, 'navigation handler should try network then fall back');
  assert.ok(fetchAt < fallbackAt, 'the cache must be the fallback, not the first choice');
  assert.match(sw, /\.catch\(\(\) => caches\.match\(SHELL_URL\)/);
});

test('stale caches are dropped when the version changes', () => {
  assert.match(sw, /const VERSION = '/);
  assert.match(sw, /keys\.filter\(\(k\) => k !== SHELL_CACHE && k !== ASSET_CACHE\)\.map\(\(k\) => caches\.delete\(k\)\)/);
});

test('vercel serves the worker and manifest so they can update', () => {
  const header = (source, key) =>
    vercel.headers.find((h) => h.source === source)?.headers.find((h) => h.key === key)?.value;
  // A long-lived worker would pin itself and every asset it caches.
  assert.match(header('/sw.js', 'Cache-Control') || '', /max-age=0/);
  assert.equal(header('/sw.js', 'Service-Worker-Allowed'), '/');
  // Chrome silently refuses a manifest served under the wrong content type.
  assert.equal(header('/manifest.webmanifest', 'Content-Type'), 'application/manifest+json');
});
