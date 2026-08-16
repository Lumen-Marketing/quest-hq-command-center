// Restoring or discarding a recovery draft: what happens after somebody clicks one of the two
// buttons on the draft strip.
//
// Fetched on that click and never before. Writing a draft has to be instant and happens on every
// keystroke, so that half stays in the entry bundle; reading one back is a deliberate act with a
// dialog already on screen, which is exactly the shape that pays for a dynamic import.
//
// The address half is the reason this is worth extracting at all: putting a contact's country,
// province, city and barangay back means driving four dependent selects in order, each of which
// fetches its list from the one above it. None of that is reachable until a draft is restored.
export function createDraftRecovery(ctx) {
  const {
    draftManager, underwriterModule, protectedFormDraftContext, setProtectedFormDraftStatus,
    queueProtectedFormDraft, initContactAddressForm, countryData,
    qcEl, qcLoadCountries, qcSelectByText, qcLoadProvinces, qcLoadCities, qcLoadBarangays,
    qcSelectDial, qcPlacePin,
  } = ctx;

  /**
   * Put a restored address back on screen.
   *
   * The stored values are NAMES, not ids, because that is what the form holds. Each select has
   * to be loaded before the one below it can be matched, so this walks down the chain in order
   * and re-writes the plain values afterwards -- a lookup that finds nothing must not leave the
   * field emptier than the draft was.
   */
  async function syncContactAddressFromRestoredDraft(form) {
    if (!form?.matches('[data-contact-address-form]')) return;
    await initContactAddressForm();
    const countryName = String(form.elements.country?.value || '').trim();
    const provinceName = String(form.elements.province?.value || '').trim();
    const cityName = String(form.elements.city?.value || '').trim();
    const barangayName = String(form.elements.barangay?.value || '').trim();
    const locationName = String(form.elements.location?.value || '').trim();
    const dial = String(form.elements.country_code?.value || '').trim();
    const country = qcEl('qc-country');
    await qcLoadCountries();
    if (country?.tagName === 'SELECT' && countryName && qcSelectByText(country, countryName)) {
      await qcLoadProvinces(country.value, provinceName);
      if (cityName) await qcLoadCities(cityName);
      if (barangayName) await qcLoadBarangays(barangayName);
    } else if (country?.tagName === 'INPUT') {
      country.value = countryName;
    }
    if (dial) {
      const match = countryData().find((item) => item.dial === dial);
      qcSelectDial(dial, match?.iso2 || '');
    }
    const lat = Number(form.elements.lat?.value);
    const lng = Number(form.elements.lng?.value);
    if (Number.isFinite(lat) && Number.isFinite(lng) && form.elements.lat?.value && form.elements.lng?.value) {
      qcPlacePin(lat, lng, { center: true });
    }
    if (form.elements.country) form.elements.country.value = countryName;
    if (form.elements.province) form.elements.province.value = provinceName;
    if (form.elements.city) form.elements.city.value = cityName;
    if (form.elements.barangay) form.elements.barangay.value = barangayName;
    if (form.elements.location) form.elements.location.value = locationName;
  }

  function handleProtectedFormDraftAction(actionName, node) {
    const form = node.closest('form');
    const context = protectedFormDraftContext(form);
    const manager = draftManager();
    if (!form || !context || !manager) {
      setProtectedFormDraftStatus(form, 'unavailable');
      return false;
    }
    const recovery = form.querySelector('[data-form-draft-recovery]');
    if (actionName === 'restore-form-draft') {
      const result = manager.restore(context, form.elements);
      if (!result.ok) {
        setProtectedFormDraftStatus(form, 'unavailable');
        return true;
      }
      if (recovery) recovery.hidden = true;
      delete form.dataset.draftRecoveryPending;
      delete form.dataset.draftChangedWhilePending;
      setProtectedFormDraftStatus(form, result.draft ? 'restored' : 'idle');
      if (form.matches('[data-underwriting-form]')) underwriterModule()?.syncUnderwritingForm(form);
      syncContactAddressFromRestoredDraft(form).catch((error) => console.warn('Contact draft address restore failed', error));
      return true;
    }
    if (actionName === 'discard-form-draft') {
      // Typing that happened WHILE the offer was on screen is not covered by the draft being
      // discarded -- it is newer than the draft. Discarding must not throw it away too, so it
      // is written back out as the draft from here on.
      const changedWhilePending = form.dataset.draftChangedWhilePending === 'true';
      const result = manager.clear(context);
      if (recovery) recovery.hidden = true;
      delete form.dataset.draftRecoveryPending;
      delete form.dataset.draftChangedWhilePending;
      setProtectedFormDraftStatus(form, result.ok ? 'discarded' : 'unavailable');
      if (result.ok && changedWhilePending) queueProtectedFormDraft(form);
      return true;
    }
    return false;
  }

  return { handleProtectedFormDraftAction };
}
