// `removeKind` turns the suggestion list into a list you can prune: each option gets an X
// that deletes it from the stored list. Only pass it where the options ARE a stored list --
// on a derived list, removing an entry would mean editing the records it came from.
export function renderSearchCombobox(h, label, name, value, options, { placeholder = 'Type to search', allowCustom = true, removeKind = '' } = {}) {
  return `
    <label class="job-type-field">
      <span>${h(label)}</span>
      <div class="job-type-combobox">
        <input name="${h(name)}" type="text" value="${h(value || '')}" data-job-type-input data-job-type-options="${h(JSON.stringify(options))}" data-job-type-allow-custom="${allowCustom ? 'true' : 'false'}"${removeKind ? ` data-job-type-remove="${h(removeKind)}"` : ''} autocomplete="off" placeholder="${h(placeholder)}" />
        <button class="job-type-toggle" type="button" data-job-type-toggle aria-label="Show ${h(label.toLowerCase())} suggestions"><i class="ti ti-chevron-down"></i></button>
        <div class="job-type-suggestions-menu" data-job-type-menu hidden></div>
      </div>
    </label>
  `;
}


// The suggestion menu behind every type-ahead combobox in the app.
//
// Fetched on first focus: no suggestion exists until somebody opens one, and keeping the
// matching and the markup out of main.js is what pays for the features that use it.

// Takes its one dependency positionally rather than as a ctx object: a factory that
// destructures a single key is ceremony, and the extracted-module guard rightly treats a
// three-key ctx as a sign the extraction was not worth making.
export function createComboboxMenu(h) {

  function parseJobTypeOptions(input) {
    try {
      const parsed = JSON.parse(input.dataset.jobTypeOptions || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function jobTypeMenu(input) {
    const host = input.closest('.job-type-combobox');
    if (!host) return null;
    let menu = host.querySelector('[data-job-type-menu]');
    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'job-type-suggestions-menu';
      menu.setAttribute('data-job-type-menu', '');
      menu.hidden = true;
      host.appendChild(menu);
    }
    if (!menu.dataset.jobTypeBound) {
      menu.dataset.jobTypeBound = 'true';
      menu.addEventListener('pointerdown', (event) => {
        // Also the remove control: without this the input blurs first, the menu closes, and
        // the click lands on nothing.
        if (event.target.closest('[data-job-type-option], [data-job-type-remove-option]')) event.preventDefault();
      });
    }
    return menu;
  }

  function jobTypeMatches(input) {
    const query = input.value.trim().toLowerCase();
    const options = parseJobTypeOptions(input);
    const filtered = query
      ? options.filter((item) => item.toLowerCase().includes(query))
      : options;
    return filtered.slice(0, 12);
  }

  function renderJobTypeSuggestions(input, force = false) {
    const menu = jobTypeMenu(input);
    if (!menu) return;
    const query = input.value.trim();
    const matches = jobTypeMatches(input);
    const exact = matches.some((item) => item.toLowerCase() === query.toLowerCase());
    const custom = input.dataset.jobTypeAllowCustom !== 'false' && query && !exact
      ? [`<button type="button" class="job-type-suggestion-option custom" data-job-type-option="${h(query)}"><i class="ti ti-plus"></i><span>Use "${h(query)}"</span></button>`]
      : [];
    if (!force && !query && !matches.length) {
      menu.hidden = true;
      menu.innerHTML = '';
      return;
    }
    // A removable list wraps each option so the X is a sibling, never a child: a <button>
    // inside a <button> is invalid, and browsers disagree about which one a click belongs to.
    const removeKind = input.dataset.jobTypeRemove || '';
    const row = (item) => (removeKind
      ? `<span class="job-type-suggestion-row"><button type="button" class="job-type-suggestion-option" data-job-type-option="${h(item)}"><span>${h(item)}</span></button><button type="button" class="job-type-suggestion-remove" data-job-type-remove-option="${h(item)}" data-job-type-remove-kind="${h(removeKind)}" title="Remove &quot;${h(item)}&quot; from the list" aria-label="Remove ${h(item)} from the list"><i class="ti ti-x"></i></button></span>`
      : `<button type="button" class="job-type-suggestion-option" data-job-type-option="${h(item)}"><span>${h(item)}</span></button>`);
    menu.innerHTML = `${custom.join('')}${matches.map(row).join('')}`;
    menu.hidden = !menu.innerHTML;
  }

  return { parseJobTypeOptions, jobTypeMenu, jobTypeMatches, renderJobTypeSuggestions };
}
