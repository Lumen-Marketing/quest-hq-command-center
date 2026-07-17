/* Quest HQ service worker.
 *
 * Deliberately conservative. A service worker is the easiest way to ship a bug
 * that outlives the deploy that fixed it, so the rules here are narrow:
 *
 *   - Navigations are network-first. The cached shell is a fallback for offline
 *     only, never the default, so a deploy is live the moment it lands.
 *   - Hashed build assets are cache-first. Vite content-hashes them, so a changed
 *     file is a changed URL -- there is no such thing as a stale hit.
 *   - Everything else (the API, Supabase, fonts, tiles) is left alone entirely.
 *     Caching authenticated or cross-origin responses here would be a privacy bug,
 *     not a performance win.
 */

const VERSION = 'v1';
const SHELL_CACHE = `quest-shell-${VERSION}`;
const ASSET_CACHE = `quest-assets-${VERSION}`;
const SHELL_URL = '/';

// The SPA is served for every route, so one shell covers every navigation.
const PRECACHE = [SHELL_URL, '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      // A precache miss must not wedge the install; the fetch handler copes.
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Lets the page trigger an immediate update instead of waiting for a cold start.
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

const isHashedAsset = (url) =>
  url.origin === self.location.origin &&
  url.pathname.startsWith('/assets/') &&
  /-[A-Za-z0-9_-]{8,}\.(js|css|woff2|webp|png|svg|mjs)$/.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never touch the API or anything cross-origin (Supabase, fonts, map tiles).
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Navigations: network-first, cached shell only when the network is gone.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(SHELL_URL, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(SHELL_URL).then((hit) => hit || Response.error()))
    );
    return;
  }

  // Hashed assets: cache-first is safe because the URL changes when the file does.
  if (isHashedAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
      )
    );
  }
});
