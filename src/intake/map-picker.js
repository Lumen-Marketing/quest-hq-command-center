// The map pin on a public intake form: search an address, use this device's location, or tap the
// map, and the address lands in the form's Location box.
//
// The same approach as the app's own picker (src/crm/location-picker-modal.js) -- Leaflet,
// OpenStreetMap tiles, Nominatim for addresses -- rewritten for a visitor with no session. It
// holds no application state, and it draws itself as a dialog laid over the form rather than
// through a re-render: the public page redraws from innerHTML, which would rebuild the form empty.
//
// What it writes is what the app writes: the address TEXT. A workspace location field stores
// nothing else, even when a member pins it in the app. A pin with no street address nearby writes
// its coordinates instead, which still open in the right place from the record.
//
// Fetched on the first press of a pin, and Leaflet only then too.

const NOMINATIM = 'https://nominatim.openstreetmap.org';

// Where the map starts when there is nothing to search yet. The whole world: a visitor holding a
// link could be anywhere, and a guessed city is worse than an honest overview.
const WORLD = [20, 0];

// Nominatim's usage policy allows about one request a second and no search-as-you-type. Searches
// happen on a press; a run of drags or taps settles into one address lookup.
const REVERSE_DELAY_MS = 600;

export const searchUrl = (query) => `${NOMINATIM}/search?${new URLSearchParams({
  q: String(query ?? '').trim(), format: 'jsonv2', limit: '1', addressdetails: '1',
})}`;

export const reverseUrl = (lat, lng) => `${NOMINATIM}/reverse?${new URLSearchParams({
  lat: String(lat), lon: String(lng), format: 'jsonv2', zoom: '18', addressdetails: '1',
})}`;

/** A pin as a location value, for where no street address is found. */
export const coordsLabel = (lat, lng) => `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;

async function getJson(url) {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

// The one dialog, while it is showing. A second press of a pin does nothing until it closes.
let current = null;

/**
 * Open the picker for one Location box.
 *
 * @param {HTMLInputElement} input   the box the chosen address is written into
 * @param {HTMLElement} [trigger]    the pin that was pressed; it gets the caret back on close
 */
export async function openMapPicker(input, trigger) {
  if (current || !input) return;

  const dialog = document.createElement('div');
  dialog.className = 'intake-map-overlay';
  // Static markup only. Everything that comes from outside -- a searched address, a looked-up
  // one -- is written with textContent below, never into this string.
  dialog.innerHTML = `
    <div class="intake-map" role="dialog" aria-modal="true" aria-labelledby="intake-map-title">
      <header class="intake-map-head">
        <h2 id="intake-map-title"><i class="ti ti-map-pin" aria-hidden="true"></i>Pick the location</h2>
        <button type="button" class="intake-map-x" data-map-close aria-label="Close the map"><i class="ti ti-x" aria-hidden="true"></i></button>
      </header>
      <div class="intake-map-search">
        <input class="intake-input" type="search" data-map-query placeholder="Search an address" aria-label="Search an address" autocomplete="street-address" enterkeyhint="search">
        <button type="button" class="btn intake-map-btn" data-map-find><i class="ti ti-search" aria-hidden="true"></i><span>Search</span></button>
        <button type="button" class="btn intake-map-btn" data-map-here><i class="ti ti-current-location" aria-hidden="true"></i><span>Use my location</span></button>
      </div>
      <div class="intake-map-canvas" data-map-canvas></div>
      <p class="intake-map-status" data-map-status role="status" aria-live="polite">Loading the map…</p>
      <footer class="intake-map-foot">
        <p class="intake-map-picked" data-map-picked></p>
        <div class="intake-map-actions">
          <button type="button" class="btn" data-map-close>Cancel</button>
          <button type="button" class="btn btn-primary" data-map-use disabled><i class="ti ti-check" aria-hidden="true"></i>Use this location</button>
        </div>
      </footer>
    </div>`;
  document.body.append(dialog);
  current = dialog;

  const $ = (selector) => dialog.querySelector(selector);
  const status = (text) => { $('[data-map-status]').textContent = text; };
  const query = $('[data-map-query]');
  const useButton = $('[data-map-use]');

  let L = null;
  let map = null;
  let marker = null;
  let chosen = '';
  let lookup = 0; // bumped by every new pin, so a slow answer for an old one is ignored
  let reverseTimer = 0;

  const choose = (text) => {
    chosen = String(text || '').trim();
    $('[data-map-picked]').textContent = chosen;
    useButton.disabled = !chosen;
  };

  function setPin(lat, lng, { center = false, address = '' } = {}) {
    if (!map) return;
    if (!marker) {
      marker = L.marker([lat, lng], {
        draggable: true,
        icon: L.divIcon({ className: 'quest-map-pin', html: '<i class="ti ti-map-pin-filled"></i>', iconSize: [34, 34], iconAnchor: [17, 34] }),
      }).addTo(map);
      marker.on('dragend', () => {
        const at = marker.getLatLng();
        setPin(at.lat, at.lng);
      });
    } else {
      marker.setLatLng([lat, lng]);
    }
    if (center) map.setView([lat, lng], Math.max(map.getZoom(), 16));

    const mine = ++lookup;
    clearTimeout(reverseTimer);
    if (address) {
      choose(address);
      status('Drag the pin or tap the map to adjust it.');
      return;
    }
    // The coordinates at once, so the pin can be used before -- or without -- a street address.
    // The address replaces them when the lookup answers.
    choose(coordsLabel(lat, lng));
    status('Finding the address…');
    reverseTimer = setTimeout(async () => {
      const place = await getJson(reverseUrl(lat, lng));
      if (mine !== lookup || current !== dialog) return;
      const text = String(place?.display_name || '').trim();
      if (text) {
        choose(text);
        status('Drag the pin or tap the map to adjust it.');
      } else {
        status('No street address here, so its coordinates will be used.');
      }
    }, REVERSE_DELAY_MS);
  }

  async function search() {
    const text = query.value.trim();
    if (!text) { status('Type an address to search for.'); return; }
    if (!map) { status('The map is still loading.'); return; }
    status('Searching…');
    const results = await getJson(searchUrl(text));
    if (current !== dialog) return;
    const match = Array.isArray(results) ? results[0] : null;
    if (!match) {
      status('No match. Try a fuller address, or tap the map to drop the pin.');
      return;
    }
    setPin(Number(match.lat), Number(match.lon), { center: true, address: String(match.display_name || text) });
  }

  function useHere() {
    if (!navigator.geolocation) {
      status('This browser cannot share its location. Search, or tap the map.');
      return;
    }
    if (!map) { status('The map is still loading.'); return; }
    status('Asking for your location…');
    navigator.geolocation.getCurrentPosition(
      (position) => { if (current === dialog) setPin(position.coords.latitude, position.coords.longitude, { center: true }); },
      () => { if (current === dialog) status('Your location was not shared. Search, or tap the map.'); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const onKey = (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    close();
  };

  function close() {
    clearTimeout(reverseTimer);
    document.removeEventListener('keydown', onKey, true);
    map?.remove();
    dialog.remove();
    current = null;
    trigger?.focus();
  }

  dialog.querySelectorAll('[data-map-close]').forEach((button) => { button.onclick = close; });
  // A press on the dim backdrop, not the dialog, closes it too.
  dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  $('[data-map-find]').onclick = search;
  $('[data-map-here]').onclick = useHere;
  // Enter searches. No form element for it: the page's own submit listener sits on the document, and a
  // stray form submitting past it would reload the page and lose everything typed.
  query.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); search(); }
  });
  useButton.onclick = () => {
    if (!chosen) return;
    input.value = chosen;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    close();
  };
  document.addEventListener('keydown', onKey, true);
  query.focus();

  try {
    // The dialog's sheet brings Leaflet's with it (./map-picker.css).
    const [module] = await Promise.all([import('leaflet'), import('./map-picker.css')]);
    L = module.default || module;
  } catch {
    if (current === dialog) status('The map could not load. Type the address into the form instead.');
    return;
  }
  if (current !== dialog) return; // closed while Leaflet was loading

  map = L.map($('[data-map-canvas]'), { zoomControl: true }).setView(WORLD, 2);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);
  map.on('click', (event) => setPin(event.latlng.lat, event.latlng.lng));
  // The canvas was sized after Leaflet measured it; without this the tiles fill a corner.
  setTimeout(() => map?.invalidateSize(), 60);

  // Whatever is already in the form's box is the first search, so the map opens on that place.
  const typed = input.value.trim();
  if (typed) {
    query.value = typed;
    search();
  } else {
    status('Search for the address, use your location, or tap the map.');
  }
}
