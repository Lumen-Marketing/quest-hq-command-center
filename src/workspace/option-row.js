// One editable row of a Category / Status option list.
//
// Shared by the two panels that edit option lists -- the App Builder's field editor and the
// Company Contacts field editor -- and by nothing else. It lived in main.js and was handed to
// both through ctx, so every session that never opened either editor carried it. Both of those
// panels are fetched on demand, so a module they share is fetched with them and stays out of
// the entry bundle.
//
// `h` is a parameter rather than a closure: this sits at module scope in a file that has no
// escaper of its own, and reaching for one there is the ReferenceError that took the whole
// relationship config panel down once already.
export function optionRow(h, option) {
  return `<div class="wb-opt-item" data-oid="${h(option.id)}"><input type="color" class="wb-dot-pick" value="${h(option.color || '#2563eb')}"><input class="wb-input wb-opt-label" value="${h(option.label)}" placeholder="Option label"><button class="wb-icon-btn danger" data-wb-del-option type="button" aria-label="Remove option"><i class="ti ti-x"></i></button></div>`;
}
