import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const manifest = JSON.parse(read('../public/manifest.webmanifest'));
const sw = read('../public/sw.js');
const indexHtml = read('../index.html');
const main = read('../src/main.js');
const vercel = JSON.parse(read('../vercel.json'));

const header = (source, key) =>
  vercel.headers.find((entry) => entry.source === source)?.headers.find((entry) => entry.key === key)?.value;

// PNG stores width/height as big-endian uint32 at bytes 16..24, right after IHDR.
function pngSize(rel) {
  const buf = readFileSync(new URL(rel, import.meta.url));
  assert.equal(buf.subarray(1, 4).toString('ascii'), 'PNG', `${rel} is not a PNG`);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test('the manifest carries what Chrome needs to offer an install', () => {
  assert.equal(manifest.name, 'Questbase');
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
  // A long-lived worker would pin itself and every asset it caches.
  assert.match(header('/sw.js', 'Cache-Control') || '', /max-age=0/);
  assert.equal(header('/sw.js', 'Service-Worker-Allowed'), '/');
  // Chrome silently refuses a manifest served under the wrong content type.
  assert.equal(header('/manifest.webmanifest', 'Content-Type'), 'application/manifest+json');
});

test('vercel caches only content-hashed build assets for one year', () => {
  assert.equal(
    header('/assets/(.*)', 'Cache-Control'),
    'public, max-age=31536000, immutable',
    'hashed Vite assets should not be downloaded again when their filename has not changed',
  );
  assert.doesNotMatch(
    header('/(.*)', 'Cache-Control') || '',
    /immutable/,
    'HTML, API, auth, and compatibility routes must keep revalidating',
  );
});

test('the SPA fallback never turns a missing static file into index HTML', () => {
  const fallback = vercel.rewrites.find((rule) => rule.destination === '/index.html');
  assert.ok(fallback, 'the company routes still need an SPA fallback');
  const matcher = new RegExp(`^${fallback.source}$`);

  assert.equal(matcher.test('/company/lumen/jobs'), true, 'real application routes should still reach the SPA');
  assert.equal(matcher.test('/assets/retired-build-deadbeef.js'), false, 'a removed chunk must return 404, not HTML');
  assert.equal(matcher.test('/taskmanagement/js/retired-runtime.js'), false, 'a removed Tasks asset must return 404');
  assert.equal(matcher.test('/missing.css'), false, 'a missing root static file must not become the app shell');
});

async function runHashedAssetFetch(response) {
  const handlers = {};
  const writes = [];
  const cache = {
    addAll: async () => {},
    put: async (...args) => { writes.push(args); },
  };
  const cacheStorage = {
    open: async () => cache,
    match: async () => null,
    keys: async () => [],
    delete: async () => true,
  };
  const scope = {
    location: new URL('https://questbase.test/'),
    addEventListener: (name, listener) => { handlers[name] = listener; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  vm.runInNewContext(sw, {
    self: scope,
    caches: cacheStorage,
    fetch: async () => response,
    URL,
    Request,
    Response,
    Promise,
  });
  let responsePromise = null;
  handlers.fetch({
    request: new Request('https://questbase.test/assets/main-deadbeef.js'),
    respondWith: (pending) => { responsePromise = pending; },
  });
  const delivered = await responsePromise;
  await new Promise((resolve) => setImmediate(resolve));
  return { delivered, writes };
}

test('the worker never caches index HTML under a hashed JavaScript URL', async () => {
  const html = new Response('<!doctype html><title>Questbase</title>', {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });

  const { delivered, writes } = await runHashedAssetFetch(html);

  assert.equal(await delivered.text(), '<!doctype html><title>Questbase</title>');
  assert.equal(writes.length, 0, 'an HTML fallback must never poison the immutable asset cache');
});

test('the worker still caches a valid hashed JavaScript response', async () => {
  const javascript = new Response('export const ready = true;', {
    status: 200,
    headers: { 'content-type': 'application/javascript; charset=utf-8' },
  });

  const { writes } = await runHashedAssetFetch(javascript);

  assert.equal(writes.length, 1);
});
