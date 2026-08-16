// Turning a LABEL into a stored option on a category/status field -- minting a new one when the
// field has never seen that value.
//
// Three different things need this and must agree, or the same word becomes two options with
// two colours: typing an unknown value into the dropdown, the "+ Other" box on a choice-chip
// field, and a copy from a company contact or a linked record whose value this app has no
// option for ("type: demo" arrives, no Demo option exists, so Demo is created).
//
// Statically imported by main.js rather than fetched on demand like the combobox menu it was
// carved out of: the contact copy resolves labels inside a synchronous loop, and awaiting a
// module there would mean the copy finished before the option existed.
export function createOptionMint(ctx) {
  const {
    wbDoc, wbSave, wbUid, can, activeCompanyId, WB_PALETTE,
  } = ctx;

  // The app, workspace and field behind a field id. Sub-item lists are searched too, so a
  // category on a daily report resolves the same way as one on the record.
  function wbFieldOwner(companyId, fieldId) {
    for (const workspace of wbDoc(companyId)?.workspaces || []) {
      for (const app of workspace.apps || []) {
        const own = (app.fields || []).find((field) => field.id === fieldId);
        if (own) return { workspace, app, field: own };
        for (const collection of app.collections || []) {
          const sub = (collection.fields || []).find((field) => field.id === fieldId);
          if (sub) return { workspace, app, field: sub };
        }
      }
    }
    return null;
  }

  /**
   * Resolve `rawLabel` on the field with `fieldId`, adding it to the option list when nothing
   * matches.
   *
   * Returns null when there is no such field or nothing was typed, and
   * `{ option: null, refused: true }` when the person may not edit the app -- adding an option
   * changes the app for everybody, so it is gated on that and not on who can edit the record.
   * The caller decides what to say about either.
   */
  function wbMintOption(fieldId, rawLabel) {
    const companyId = activeCompanyId();
    const found = wbFieldOwner(companyId, fieldId);
    if (!found) return null;
    const { field } = found;
    const label = String(rawLabel || '').trim();
    if (!label) return null;

    const options = field.config.options || [];
    // Snap to the stored spelling, so "roofing" and "Roofing" do not become two chips.
    const match = options.find((option) => String(option.label).toLowerCase() === label.toLowerCase());
    if (match) return { option: match, field, options, added: false };

    if (!can('workspaces.manage', companyId)) return { option: null, field, options, added: false, refused: true };

    const option = { id: wbUid(), label, color: WB_PALETTE[options.length % WB_PALETTE.length] };
    const next = [...options, option];
    field.config = { ...field.config, options: next };
    wbSave(companyId);
    return { option, field, options: next, added: true };
  }

  return { wbFieldOwner, wbMintOption };
}
