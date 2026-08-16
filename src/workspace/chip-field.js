// A Category field set to the "Choice chips" display style: every option on screen, one click
// to pick, and a "+ Other" box that mints a value the app has never seen.
//
// Rides in the field-config-ui chunk rather than the entry bundle. Chips are drawn by
// createFieldInput over there, and wbRenderFieldInput renders nothing at all until that module
// has arrived -- so a chip on screen is proof this code is loaded, and main.js only keeps the
// few lines of event delegation that route a click here.
//
// The chosen option ID lives in the row's hidden [data-f] input -- the same one the dropdown
// writes to -- so saving, automations, filters and the table read a chip exactly as they read a
// dropdown, and none of them knows which display style drew it.
import { createOptionMint } from './option-mint.js';

/**
 * One chip. Exported because the row is spliced into rather than re-rendered when "+ Other"
 * mints an option: a re-render would throw away everything else typed into the record.
 *
 * `h` is passed in rather than closed over, matching the rest of this corner of the codebase.
 */
export function wbChipHtml(h, option, on) {
  return `<button type="button" class="wb-chip${on ? ' on' : ''}" data-wb-chip="${h(option.id)}" aria-pressed="${on ? 'true' : 'false'}" style="--chip:${h(option.color || '#6b7280')}">${h(option.label)}</button>`;
}

export function createChipRuntime(ctx) {
  const {
    h, showToast, wbDoc, wbSave, wbUid, can, activeCompanyId, WB_PALETTE,
  } = ctx;
  const { wbMintOption } = createOptionMint({ wbDoc, wbSave, wbUid, can, activeCompanyId, WB_PALETTE });

  /** Point the field at `optionId` (or at nothing) and repaint the row. */
  function wbChipSelect(zone, optionId) {
    const hidden = zone.querySelector('input[type="hidden"][data-f]');
    if (!hidden) return;
    hidden.value = optionId || '';
    zone.querySelectorAll('[data-wb-chip]').forEach((chip) => {
      const on = !!optionId && chip.dataset.wbChip === optionId;
      chip.classList.toggle('on', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    // What the record form's recompute, its dirty-tracking and any conditional button listen
    // for. Without these a chip would look picked and the record would save as if untouched.
    hidden.dispatchEvent(new Event('input', { bubbles: true }));
    hidden.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** Open or close the "+ Other" box; "Other" itself hides while its box is open. */
  function wbChipOtherBox(zone, open) {
    const box = zone.querySelector('[data-wb-chip-new]');
    if (!box) return;
    box.hidden = !open;
    const other = zone.querySelector('[data-wb-chip-other]');
    if (other) other.hidden = open;
    const input = box.querySelector('[data-wb-chip-new-input]');
    if (!input) return;
    if (open) { input.focus(); input.select(); } else input.value = '';
  }

  /** Put a newly minted option on a row that is already on screen. */
  function wbChipAppend(zone, option) {
    const before = zone.querySelector('[data-wb-chip-other]') || zone.querySelector('[data-wb-chip-new]');
    const html = wbChipHtml(h, option, false);
    if (before) before.insertAdjacentHTML('beforebegin', html);
    else zone.insertAdjacentHTML('beforeend', html);
  }

  // "+ Other" committed. The typed label becomes a real option on the field -- offered to
  // everybody from now on, exactly as typing a new value into the dropdown does -- and this
  // record is set to it.
  function wbChipAddOption(zone) {
    const input = zone.querySelector('[data-wb-chip-new-input]');
    const hidden = zone.querySelector('input[type="hidden"][data-f]');
    const label = String(input?.value || '').trim();
    if (!input || !hidden || !label) return;
    const result = wbMintOption(hidden.getAttribute('data-f'), label);
    if (!result) return;
    // Minting an option edits the app, which not everybody may do. Say so, rather than dropping
    // what they typed on the floor without explanation.
    if (!result.option) { showToast('Only people who can manage workspaces can add an option.', 'local', 'Workspaces'); return; }
    // A label that already exists under another spelling just gets picked -- no duplicate chip,
    // which is the whole reason wbMintOption matches case-insensitively.
    if (result.added) {
      wbChipAppend(zone, result.option);
      showToast(`Added "${result.option.label}" to ${result.field.label}.`, 'local', 'Workspaces');
    }
    wbChipSelect(zone, result.option.id);
    wbChipOtherBox(zone, false);
  }

  // A copy landing on a chip field, from a company contact or a linked record. The copy carries
  // a LABEL, because an option id means nothing on the other side of it; the chips store an id.
  // Resolve one to the other, minting when this app has never seen that value -- "type: demo"
  // arrives off a contact, no Demo option exists here, so Demo is created.
  function wbResolveChipOption(fieldId, label, zone) {
    const result = wbMintOption(fieldId, label);
    if (!result || !result.option) return '';
    if (result.added) wbChipAppend(zone, result.option);
    return result.option.id;
  }

  /** Route a click that landed anywhere on a chip row. Returns nothing; it always claims it. */
  function wbChipClick(zone, event) {
    const chip = event.target.closest('[data-wb-chip]');
    // Clicking the chosen one again clears the field -- the chips' equivalent of emptying the
    // dropdown, which otherwise has no way back to "nothing picked".
    if (chip) { event.preventDefault(); wbChipSelect(zone, chip.classList.contains('on') ? '' : chip.dataset.wbChip); return; }
    if (event.target.closest('[data-wb-chip-other]')) { event.preventDefault(); wbChipOtherBox(zone, true); return; }
    if (event.target.closest('[data-wb-chip-add]')) { event.preventDefault(); wbChipAddOption(zone); return; }
    if (event.target.closest('[data-wb-chip-cancel]')) { event.preventDefault(); wbChipOtherBox(zone, false); }
  }

  // Enter commits the "+ Other" box, Escape backs out of it. Both are swallowed here because
  // the dialog around them treats Escape as "close the record" -- backing out of a half-typed
  // option name must not take the record with it.
  function wbChipKeydown(zone, event) {
    if (!zone) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Enter') wbChipAddOption(zone);
    else wbChipOtherBox(zone, false);
  }

  return { wbChipSelect, wbChipOtherBox, wbChipAddOption, wbResolveChipOption, wbChipClick, wbChipKeydown };
}
