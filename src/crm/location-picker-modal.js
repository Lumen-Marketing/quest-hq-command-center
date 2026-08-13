// The map-pin dialog: its markup and the map it drives.
//
// Fetched the first time somebody opens a pin. Leaflet is already a deferred load, so the
// form around it and the geocoding behind it have no business in the entry bundle either.
// Saving stays in main.js, because where a pin is written depends on the record type.

export function createLocationPickerModal(ctx) {
  const {
    activeCompanyId, contactAddressOptions, h, loadLeaflet, locationPickerDefaultPin,
    refreshAddressSuggestions, renderModalShell, showToast, state,
  } = ctx;

  // Owned here, not in main.js: they belong to the node this module renders, and nothing
  // outside it has any business holding a Leaflet handle.
  let locationPickerMap = null;
  let locationPickerMarker = null;

  function resetLocationPickerMap() {
    locationPickerMap = null;
    locationPickerMarker = null;
  }


  function renderLocationPickerModal() {
    const picker = state.locationPicker || {};
    const pin = locationPickerDefaultPin(picker.address);
    const lat = Number(picker.lat || pin.lat);
    const lng = Number(picker.lng || pin.lng);
    return renderModalShell('Map Pin', 'Set exact site pin', `
      <form class="location-picker" data-location-picker-form>
        <div class="address-lookup-field location-picker-search">
          <span>Address</span>
          <div class="address-lookup-control">
            <input name="address" value="${h(picker.address || '')}" data-location-picker-search data-google-address-input data-address-lookup-input data-address-options="${h(JSON.stringify(contactAddressOptions(activeCompanyId())))}" autocomplete="street-address" placeholder="Type the full site address" />
            <button class="address-pin-button" type="button" data-action="location-picker-search"><i class="ti ti-search"></i><span>Search</span></button>
            <button class="address-pin-button" type="button" data-action="location-picker-current"><i class="ti ti-current-location"></i><span>Use my location</span></button>
          </div>
        </div>
        <div class="form-actions location-picker-actions">
          <button class="btn btn-primary" type="submit" data-action="save-location-picker"><i class="ti ti-map-pin"></i>Save exact pin</button>
        </div>
        <div class="location-picker-mode">
          <span><i class="ti ti-click"></i>Manual pin</span>
          <p>Click the map or drag the pin to set the exact spot. Search will move the pin to the best address match.</p>
        </div>
        <input type="hidden" name="lat" value="${h(String(lat))}" data-location-lat />
        <input type="hidden" name="lng" value="${h(String(lng))}" data-location-lng />
        <div class="location-map" data-location-map data-lat="${h(String(lat))}" data-lng="${h(String(lng))}"></div>
        <p class="location-picker-hint" data-location-picker-status>Search the address, drag the pin if needed, then save it to this customer record.</p>
      </form>
    `, 'wide-modal location-picker-modal');
  }

  async function refreshLocationPickerSuggestions(input) {
    await refreshAddressSuggestions(input);
  }

  function setLocationPickerStatus(text) {
    const status = document.querySelector('[data-location-picker-status]');
    if (status) status.textContent = text;
  }

  function dismissLocationPickerSuggestions(input) {
    if (!input) return;
    window.clearTimeout(Number(input.dataset.addressSuggestTimer || 0));
    input.dataset.addressSuggestTimer = '';
    // Invalidate an address request already in flight so it cannot repaint the menu after
    // Search, current location, or a dropped pin has committed a location.
    input.dataset.addressSuggestRequest = 'dismissed';
    const menu = input.closest('.address-lookup-control')?.querySelector('.address-suggestions-menu');
    if (menu) {
      menu.hidden = true;
      menu.innerHTML = '';
    }
  }

  function setLocationPickerPin(lat, lng, { center = false, reverse = false } = {}) {
    if (!locationPickerMap || !locationPickerMarker) return;
    locationPickerMarker.setLatLng([lat, lng]);
    if (center) locationPickerMap.setView([lat, lng], Math.max(locationPickerMap.getZoom(), 16));
    const latInput = document.querySelector('[data-location-lat]');
    const lngInput = document.querySelector('[data-location-lng]');
    if (latInput) latInput.value = String(lat);
    if (lngInput) lngInput.value = String(lng);
    state.locationPicker = { ...(state.locationPicker || {}), lat, lng };
    setLocationPickerStatus(`Pinned at ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}.`);
    if (reverse) reverseGeocodeLocationPicker(lat, lng).catch(() => {});
  }

  async function reverseGeocodeLocationPicker(lat, lng) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`, {
      headers: { Accept: 'application/json' },
    }).catch(() => null);
    const payload = response?.ok ? await response.json().catch(() => ({})) : {};
    const address = String(payload.display_name || '').trim();
    const input = document.querySelector('[data-location-picker-search]');
    if (address && input) {
      dismissLocationPickerSuggestions(input);
      input.value = address;
      state.locationPicker = { ...(state.locationPicker || {}), address };
      setLocationPickerStatus('Address filled from the dropped pin.');
    }
  }

  // Forward-geocode a free-text address to the best-matching place (worldwide,
  // no country restriction) using Nominatim — the same concept as the template.
  async function geocodeLocationPickerAddress(query) {
    const clean = String(query || '').trim();
    if (!clean) return null;
    const params = new URLSearchParams({ q: clean, format: 'jsonv2', addressdetails: '1', limit: '1', 'accept-language': 'en' });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { headers: { Accept: 'application/json' } }).catch(() => null);
    const payload = response?.ok ? await response.json().catch(() => []) : [];
    return Array.isArray(payload) ? payload[0] : null;
  }

  async function searchLocationPickerAddress() {
    const input = document.querySelector('[data-location-picker-search]');
    const query = String(input?.value || '').trim();
    dismissLocationPickerSuggestions(input);
    if (!query) return showToast('Type an address to search.', 'local', 'Map Pin');
    setLocationPickerStatus('Searching the map...');
    const match = await geocodeLocationPickerAddress(query);
    if (!match) {
      setLocationPickerStatus('No match found — click or drag on the map to drop a manual pin.');
      return showToast('No map match found. You can still click the map to drop a manual pin.', 'local', 'Map Pin');
    }
    const address = String(match.display_name || query).trim();
    if (input) input.value = address;
    state.locationPicker = { ...(state.locationPicker || {}), address };
    setLocationPickerPin(Number(match.lat), Number(match.lon), { center: true });
  }

  function useCurrentLocationForPicker() {
    if (!navigator.geolocation) return showToast('Current location is not available in this browser.', 'local', 'Map Pin');
    dismissLocationPickerSuggestions(document.querySelector('[data-location-picker-search]'));
    setLocationPickerStatus('Requesting current location...');
    navigator.geolocation.getCurrentPosition(
      (position) => setLocationPickerPin(position.coords.latitude, position.coords.longitude, { center: true, reverse: true }),
      () => showToast('Could not get your current location.', 'local', 'Map Pin'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function mountLocationPicker() {
    const mapNode = document.querySelector('[data-location-map]');
    if (!mapNode || mapNode.dataset.bound) return;
    mapNode.dataset.bound = '1';
    const mapLibrary = await loadLeaflet().catch(() => null);
    if (!mapLibrary || !document.body.contains(mapNode)) {
      setLocationPickerStatus('Map unavailable. Enter the address manually.');
      return;
    }
    const lat = Number(mapNode.dataset.lat || 33.4484);
    const lng = Number(mapNode.dataset.lng || -112.0740);
    locationPickerMap = mapLibrary.map(mapNode, { zoomControl: true }).setView([lat, lng], 14);
    mapLibrary.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(locationPickerMap);
    locationPickerMarker = mapLibrary.marker([lat, lng], {
      draggable: true,
      icon: mapLibrary.divIcon({ className: 'quest-map-pin', html: '<i class="ti ti-map-pin-filled"></i>', iconSize: [34, 34], iconAnchor: [17, 34] }),
    }).addTo(locationPickerMap);
    const sync = (reverse = false) => {
      const pos = locationPickerMarker.getLatLng();
      setLocationPickerPin(pos.lat, pos.lng, { reverse });
    };
    locationPickerMarker.on('dragend', () => sync(true));
    locationPickerMap.on('click', (event) => {
      locationPickerMarker.setLatLng(event.latlng);
      sync(true);
    });
    setTimeout(() => locationPickerMap?.invalidateSize(), 80);
    // On open, geocode the record's address so the map lands on the real place
    // (worldwide) instead of the hardcoded fallback pin.
    const initialAddress = String(state.locationPicker?.address || '').trim();
    if (initialAddress) {
      setLocationPickerStatus('Locating the address on the map…');
      geocodeLocationPickerAddress(initialAddress).then((match) => {
        if (match) setLocationPickerPin(Number(match.lat), Number(match.lon), { center: true });
        else setLocationPickerStatus('Click or drag on the map to set the exact pin.');
      }).catch(() => {});
    }
  }

  return {
    renderLocationPickerModal, mountLocationPicker, searchLocationPickerAddress,
    useCurrentLocationForPicker, refreshLocationPickerSuggestions, resetLocationPickerMap,
  };
}
