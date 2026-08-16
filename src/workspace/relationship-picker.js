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
 * What a control currently holds, in the one form the copy compares against.
 */
function readValue(node) {
  if (node.type === 'checkbox') return node.checked ? '1' : '';
  return String(node.value || '').trim();
}

function writeValue(node, isCombo, value) {
  if (isCombo) {
    // The visible box of a category/status: it SHOWS a label while the hidden field beside it
    // STORES an option id. Writing the label into the box lets the app's own commit resolve
    // the id -- and add the option when this app has never seen that value.
    node.value = value;
    return;
  }
  if (node.type === 'checkbox') {
    node.checked = /^(yes|true|1)$/i.test(value);
    return;
  }
  if (node.tagName === 'SELECT') {
    const match = [...node.options].find((option) => option.value === value)
      || [...node.options].find((option) => option.textContent.trim().toLowerCase() === value.trim().toLowerCase());
    node.value = match ? match.value : '';
    return;
  }
  node.value = value;
}

/**
 * Fill a record's fields from somewhere else: a linked record, or a company contact.
 *
 * `values` is already resolved to { thisAppFieldId: value } -- whoever calls had the source in
 * hand, so nothing here needs to know what an app or a contact is. A status/category arrives as
 * its LABEL, because an option id means nothing on the other side. Every MAPPED field is
 * present, including the ones the source leaves empty, because "" is an instruction too.
 *
 * The copy owns what the copy wrote, and nothing else. Each field it fills is stamped with the
 * value it put there; picking a different record refreshes exactly those fields -- to the new
 * record's value, or to empty where it has none. A field somebody typed in themselves no longer
 * matches its stamp, so it is left alone from then on, and a field that was already filled
 * before any copy ran was never the copy's to touch.
 *
 * That is the difference between a copy you can trust and one people work around: changing the
 * linked record used to leave the first record's values sitting there, silently wrong.
 */
export function applyPullValues(from, values, opts = {}) {
  // `chips()` hands back the choice-chip runtime, or nothing if it has not loaded -- late-bound
  // because it lives in the chunk that draws the chips, and a form with none never fetches it.
  // It is what turns a copied LABEL into an option id, minting when the app has no such value.
  const chipRuntime = opts.chips?.() || null;
  // Scoped to the form the picker is in, so two record forms on one page cannot fill each other.
  const scope = from.closest('form, .wb-modal, .wb-record-page') || document;
  Object.entries(values).forEach(([fieldId, raw]) => {
    const target = scope.querySelector(`[data-f="${cssEscape(fieldId)}"]`);
    if (!target || target === from || from.contains?.(target)) return;
    const combo = target.type === 'hidden' ? target.closest?.('[data-wb-option-combo]') : null;
    // A category shown as chips has no visible box to write a label into: the row's hidden
    // input holds an option id and the chips are painted from it.
    const chips = !combo && target.type === 'hidden' ? target.closest?.('[data-wb-chip-pick]') : null;
    // For a combobox everything happens on the visible box; the hidden id follows from it.
    const node = combo ? combo.querySelector('[data-wb-option-input]') : target;
    if (!node) return;

    let value = raw === undefined || raw === null ? '' : String(raw);
    // Resolve to an id BEFORE the guard, so the comparison, the stamp and the write are all in
    // the same terms the field actually stores. Compared as a label, every copy would look like
    // a change and would overwrite a chip somebody had picked themselves.
    if (chips && value.trim()) {
      const optionId = chipRuntime?.wbResolveChipOption(fieldId, value.trim(), chips) || '';
      // No option and none can be added -- leave the field alone rather than clearing it.
      if (!optionId) return;
      value = optionId;
    }
    const current = readValue(node);
    const stamp = node.dataset.wbPull;
    // Ours to write: still empty, or still holding exactly what we last put there.
    if (current !== '' && current !== stamp) return;
    if (current === value.trim() && stamp !== undefined) return;

    if (chips) {
      // Paints the row and fires the events, so a chip filled by a copy is indistinguishable
      // from one that was clicked.
      chipRuntime?.wbChipSelect(chips, value);
      node.dataset.wbPull = readValue(node);
      return;
    }
    writeValue(node, !!combo, value);
    node.dataset.wbPull = readValue(node);
    // Both events: an automation listens for change, a calculation redraws on input, and a
    // combobox resolves its option id on change.
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

export function createRelationshipPicker(ctx) {
  // `chips` is optional: a caller that only wants the picker still gets one, and a copy onto a
  // choice-chip field simply leaves that field alone.
  const { h, chips } = ctx;

  // The linked record's values ride on the <option> the renderer built.
  function applyPull(select, itemId) {
    const raw = [...select.options].find((o) => o.value === itemId)?.dataset?.pull;
    if (!raw) return;
    try { applyPullValues(select, JSON.parse(raw), { chips }); } catch { /* a mapping we cannot read fills nothing */ }
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

  // applyPullValues is a module-level export AND is handed back here, because main.js reaches
  // this module through loadRelationshipPicker(), which resolves to whatever this factory
  // returns rather than to the module namespace. Leaving it off meant the company-contact copy
  // called undefined, threw, and was swallowed by its own error handler -- so it never once
  // ran, and nothing said why.
  return { wbBindRelationshipPickers, applyPullValues };
}
