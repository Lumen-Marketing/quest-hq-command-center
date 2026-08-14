// The relationship picker: a type-ahead over the linked app's records, and the field copy
// that fires when one is chosen.
//
// Fetched on the first record form that carries a relationship field. A plain <select> is
// fine for five records and unusable for five hundred -- but neither the search nor the copy
// is needed until such a form is on screen, so neither belongs in the entry bundle.

// CSS.escape is not in every environment this is unit-tested in.
const cssEscape = (value) => (typeof CSS !== 'undefined' && CSS.escape
  ? CSS.escape(value)
  : String(value).replace(/["\\]/g, '\\$&'));

/**
 * Fill a record's fields from somewhere else: a linked record, or a company contact.
 *
 * `values` is already resolved to { thisAppFieldId: value } -- whoever calls had the source in
 * hand, so nothing here needs to know what an app or a contact is. A status/category arrives as
 * its LABEL, because an option id means nothing on the other side; the destination matches its
 * own option by text.
 *
 * Only ever fills a BLANK field. Somebody who typed an address and then picked a contact did
 * not ask for their address to be replaced, and a copy that overwrites is a copy people learn
 * to work around rather than use.
 */
export function applyPullValues(from, values) {
  // Scoped to the form the picker is in, so two record forms on one page cannot fill each other.
  const scope = from.closest('form, .wb-modal, .wb-record-page') || document;
  Object.entries(values).forEach(([fieldId, value]) => {
    const target = scope.querySelector(`[data-f="${cssEscape(fieldId)}"]`);
    if (!target || target === from || from.contains?.(target)) return;
    // A category or status is a combobox: it SHOWS a label and STORES an option id, in a
    // hidden input beside the visible box. Writing to the hidden field directly put the label
    // where an id belongs and left the box looking empty -- the value was wrong and the copy
    // looked like it had not happened. Fill the visible box instead and let the app's own
    // commit resolve it, which also adds the option when this app has never seen it.
    const combo = target.type === 'hidden' ? target.closest?.('[data-wb-option-combo]') : null;
    if (combo) {
      const visible = combo.querySelector('[data-wb-option-input]');
      if (!visible || String(visible.value || '').trim() || String(target.value || '').trim()) return;
      visible.value = value;
      visible.dispatchEvent(new Event('input', { bubbles: true }));
      visible.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    if (target.type === 'checkbox') {
      if (target.checked) return;
      target.checked = /^(yes|true|1)$/i.test(String(value));
    } else if (target.tagName === 'SELECT') {
      if (target.value) return;
      const match = [...target.options].find((o) => o.value === value)
        || [...target.options].find((o) => o.textContent.trim().toLowerCase() === String(value).trim().toLowerCase());
      if (!match) return;
      target.value = match.value;
    } else {
      if (String(target.value || '').trim()) return;
      target.value = value;
    }
    // Both events: an automation listens for change, a calculation redraws on input.
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

export function createRelationshipPicker(ctx) {
  const { h } = ctx;

  // The linked record's values ride on the <option> the renderer built.
  function applyPull(select, itemId) {
    const raw = [...select.options].find((o) => o.value === itemId)?.dataset?.pull;
    if (!raw) return;
    try { applyPullValues(select, JSON.parse(raw)); } catch { /* a mapping we cannot read fills nothing */ }
  }

  function wbBindRelationshipPickers(root) {
  if (!root) return;
  root.querySelectorAll('[data-wb-rel-pick]').forEach((pick) => {
    if (pick.dataset.wbRelBound === '1') return;
    pick.dataset.wbRelBound = '1';
    const select = pick.querySelector('select[data-f]');
    const search = pick.querySelector('[data-wb-rel-search]');
    const results = pick.querySelector('[data-wb-rel-results]');
    const clear = pick.querySelector('[data-wb-rel-clear]');
    if (!select || !search || !results) return;

    // `label` is the whole searchable string and what the box shows once chosen; `name` and
    // `detail` are its two halves, so the list can set them on separate lines. The renderer
    // built label as "name — detail", so the split is a read, not a re-derivation.
    const options = [...select.options]
      .filter((option) => option.value)
      .map((option) => {
        const label = option.textContent;
        const detail = option.dataset.detail || '';
        return {
          id: option.value,
          label,
          detail,
          name: detail && label.endsWith(` — ${detail}`) ? label.slice(0, -(detail.length + 3)) : label,
        };
      });
    let active = -1;

    const close = () => {
      results.hidden = true;
      search.setAttribute('aria-expanded', 'false');
      active = -1;
    };

    const commit = (option) => {
      select.value = option ? option.id : '';
      search.value = option ? option.label : '';
      if (clear) clear.hidden = !option;
      // Anything listening for a change on the field -- an automation, a dependent
      // calculation -- must fire as if it had been picked from the list.
      select.dispatchEvent(new Event('change', { bubbles: true }));
      if (option) applyPull(select, option.id);
      close();
    };

    const paint = (query) => {
      const needle = query.trim().toLowerCase();
      const matches = needle
        ? options.filter((option) => option.label.toLowerCase().includes(needle))
        : options;
      const shown = matches.slice(0, 50);
      // Two lines where the record has a second thing worth knowing: the Identify-by value
      // names it, the Show field tells two records with the same name apart. One line when
      // there is no second thing, rather than an empty one pretending there is.
      results.innerHTML = shown.length
        ? shown.map((option, index) => `<button type="button" role="option" class="wb-rel-result ${index === active ? 'active' : ''}" data-rel-id="${h(option.id)}"><span class="wb-rel-result-name">${h(option.name)}</span>${option.detail ? `<span class="wb-rel-result-detail">${h(option.detail)}</span>` : ''}</button>`).join('')
          + (matches.length > shown.length ? `<div class="wb-rel-more">${h(String(matches.length - shown.length))} more — keep typing</div>` : '')
        : `<div class="wb-rel-more">No record matches "${h(query.trim())}".</div>`;
      results.hidden = false;
      search.setAttribute('aria-expanded', 'true');
      return shown;
    };

    search.addEventListener('input', () => { active = -1; paint(search.value); });
    search.addEventListener('focus', () => paint(search.value));
    search.addEventListener('keydown', (event) => {
      const shown = results.hidden ? [] : [...results.querySelectorAll('.wb-rel-result')];
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!shown.length) { paint(search.value); return; }
        active = event.key === 'ArrowDown'
          ? Math.min(active + 1, shown.length - 1)
          : Math.max(active - 1, 0);
        shown.forEach((node, index) => node.classList.toggle('active', index === active));
        shown[active]?.scrollIntoView({ block: 'nearest' });
        return;
      }
      if (event.key === 'Enter' && !results.hidden && shown[active]) {
        // Only when something is highlighted -- Enter on a half-typed query should submit
        // the form, as it does in every other field here.
        event.preventDefault();
        commit(options.find((option) => option.id === shown[active].dataset.relId));
        return;
      }
      if (event.key === 'Escape' && !results.hidden) { event.preventDefault(); close(); }
    });
    // Typed something that matches nothing and clicked away: the field shows text that is
    // not a record, so put back whatever is actually selected.
    search.addEventListener('blur', () => setTimeout(() => {
      if (results.contains(document.activeElement)) return;
      const current = options.find((option) => option.id === select.value);
      search.value = current ? current.label : '';
      close();
    }, 120));

    results.addEventListener('mousedown', (event) => {
      const button = event.target.closest('[data-rel-id]');
      if (!button) return;
      event.preventDefault();
      commit(options.find((option) => option.id === button.dataset.relId));
    });
    if (clear) clear.addEventListener('click', () => { commit(null); search.focus(); });
  });
  }

  return { wbBindRelationshipPickers };
}
