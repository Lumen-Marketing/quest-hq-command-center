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

import { createOptionMint } from '../workspace/option-mint.js';

// Takes its one dependency positionally rather than as a ctx object: a factory that
// destructures a single key is ceremony, and the extracted-module guard rightly treats a
// three-key ctx as a sign the extraction was not worth making.
export function createComboboxMenu(ctx) {
  // `h` was the whole context until the option-minting below, which needs the builder document
  // and a way to save it. Everything is optional in practice: a caller that only renders the
  // menu never reaches the part that writes.
  const {
    h, wbDoc, wbSave, wbUid, can, showToast, activeCompanyId, WB_PALETTE,
  } = ctx;
  // Shared with the choice-chip field, which mints options the same way: the two have to agree
  // on casing, colour, and who is allowed to add one.
  const { wbMintOption } = createOptionMint({ wbDoc, wbSave, wbUid, can, activeCompanyId, WB_PALETTE });


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

  // A category/status combobox shows a LABEL; the field stores an option ID. Resolve one to the

  // other, and when the label matches nothing, add it to the list rather than refusing it --

  // "when the data I type does not match on the list and I just use it, it will automatically

  // add to the category list".

  //

  // The resolving itself is wbMintOption, in ./workspace/option-mint.js, because the choice-chip

  // field and the copy-from-a-contact both mint options too and all three have to agree.

  function wbCommitOptionChoice(input) {

    const combo = input.closest('[data-wb-option-combo]');

    const holder = combo?.querySelector('input[type="hidden"][data-f]');

    if (!holder) return;

    const label = String(input.value || '').trim();

    if (!label) { holder.value = ''; return; }

    const result = wbMintOption(holder.getAttribute('data-f'), label);

    // No such field, or not allowed to add: their typing stays on screen; it simply does not

    // become a new choice for the whole company.

    if (!result || !result.option) return;

    holder.value = result.option.id;

    input.value = result.option.label;

    if (!result.added) return;

    // The menu reads its list off the input, so the new value is offered immediately rather

    // than after a reload.

    input.dataset.jobTypeOptions = JSON.stringify(result.options.map((o) => o.label));

    showToast(`Added "${result.option.label}" to ${result.field.label}.`, 'local', 'Workspaces');

  }

  return {
    wbCommitOptionChoice, wbMintOption, parseJobTypeOptions, jobTypeMenu, jobTypeMatches, renderJobTypeSuggestions };
}
