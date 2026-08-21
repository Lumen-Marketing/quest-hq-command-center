/* Questbase service worker.
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

// Bumped v1 -> v2 to evict a poisoned shell. Returning users cached `/` while it
// still carried X-Frame-Options: DENY (before that header was relaxed to
// SAMEORIGIN for the embedded Tasks module). Because the cache name never
// changed, no deploy ever dropped that stale copy, and the worker kept serving
// the DENY shell into the Tasks iframe — the frame was refused with
// "X-Frame-Options: deny" even though the live network response was SAMEORIGIN.
// The activate handler deletes any cache whose name is not the current one, so a
// version bump flushes the bad copy for everyone on their next visit.
const VERSION = 'v2';
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

  // The vendored task app at /taskmanagement/ is a separate application with its
  // own document, assets and caching. The CC shell worker must not mediate it:
  // its embedded pages are iframe navigations, and the network-first handler
  // below would (on any fetch hiccup) fall back to our cached SPA shell — which,
  // served into the Tasks frame, is what surfaced the X-Frame-Options refusal.
  // Leave it entirely to the network, exactly as it loads with the worker
  // bypassed (which is the only state in which the frame reliably worked).
  if (url.pathname.startsWith('/taskmanagement/')) return;

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
