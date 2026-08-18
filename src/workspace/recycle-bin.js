// The app builder's recycle bin: records that were deleted, and the way back.
//
// "So if records is accidentally deleted we can recover it."
//
// Deleting a record used to drop it out of `app.items` and that was that. It now moves to
// `app.trash` with a stamp of when it went and who sent it, and this tab is where it comes
// back from -- or is finally destroyed on purpose rather than by a misclick.
//
// The pure half is here with the view: putting a record in the bin and taking it out again is
// two array operations, and a test can check them without a browser.

/** How long a record sits in the bin before it stops being worth keeping. */
export const TRASH_DAYS = 30;

const stamp = () => new Date().toISOString();

/**
 * Move records out of the app and into its bin.
 *
 * Returns how many actually moved, so the caller can say nothing happened rather than claiming
 * a delete that deleted nothing.
 */
export function sendToTrash(app, itemIds, by = '') {
  const kill = new Set(itemIds || []);
  if (!kill.size) return 0;
  const going = (app.items || []).filter((item) => kill.has(item.id));
  if (!going.length) return 0;
  app.items = (app.items || []).filter((item) => !kill.has(item.id));
  if (!Array.isArray(app.trash)) app.trash = [];
  // Newest first, which is the order somebody looking for what they just deleted expects.
  app.trash.unshift(...going.map((item) => ({ ...item, deletedAt: stamp(), deletedBy: by })));
  return going.length;
}

/**
 * Move records to the bin and do not report completion until their new state is durable.
 *
 * The App Builder loads this module lazily. A caller used to start that load, save the old
 * document immediately, and close the confirmation while the real recycle-bin write was still
 * in flight. A fast reload could therefore bring the record back. Keeping mutation and
 * persistence in one awaitable operation makes the ordering explicit and rolls the in-memory
 * change back if storage refuses it.
 */
export async function sendToTrashAndSave(app, itemIds, by = '', save = async () => {}) {
  const previousItems = [...(app.items || [])];
  const hadTrash = Array.isArray(app.trash);
  const previousTrash = [...(app.trash || [])];
  const moved = sendToTrash(app, itemIds, by);
  if (!moved) return 0;
  try {
    await save();
    return moved;
  } catch (error) {
    app.items = previousItems;
    if (hadTrash) app.trash = previousTrash;
    else delete app.trash;
    throw error;
  }
}

/**
 * Put one back where it came from.
 *
 * It returns to the top of the list rather than to its old position: the position it had is
 * not recorded anywhere, and inventing one would be a worse lie than "the thing you just
 * restored is at the top".
 *
 * A field deleted while the record was in the bin is not recreated. The value it held is still
 * on the record and will read again if that field ever comes back -- restoring is not the place
 * to start rebuilding an app's shape.
 */
export function restoreFromTrash(app, itemId) {
  const at = (app.trash || []).findIndex((item) => item.id === itemId);
  if (at === -1) return null;
  const [item] = app.trash.splice(at, 1);
  const { deletedAt, deletedBy, ...record } = item;
  if (!Array.isArray(app.items)) app.items = [];
  // A record restored twice, or one whose id somehow came back another way, must not appear
  // twice over.
  app.items = app.items.filter((row) => row.id !== record.id);
  app.items.unshift({ ...record, updatedAt: stamp(), lastActivityAt: stamp() });
  return record;
}

/** Destroy one for good. Nothing comes back from here. */
export function purgeFromTrash(app, itemId) {
  const before = (app.trash || []).length;
  app.trash = (app.trash || []).filter((item) => item.id !== itemId);
  return app.trash.length < before;
}

/** Empty the whole bin -- records and fields alike. */
export function emptyTrash(app) {
  const count = (app.trash || []).length + (app.fieldTrash || []).length;
  app.trash = [];
  app.fieldTrash = [];
  return count;
}

// ---- deleted FIELDS ---------------------------------------------------------------------
//
// A deleted field used to be unrecoverable, and worse than unrecoverable: `del-field` ran
// `delete it.values[fieldId]` over every record in the app, so the values went with it. There
// was nothing left to rebuild from -- no deleted_at, no history table, and automatic backups
// are off by default.
//
// That is not a theoretical hazard. On 2026-08-15 the equivalent delete on Company Contacts
// orphaned 17 contacts' values, and they were only recovered because THAT table leaves its
// values behind. The App Builder leaves nothing.
//
// So a field goes to the bin with its data: the definition AND the value it held on every
// record, carried together, so Restore actually restores rather than bringing back an empty
// column. The document does not grow -- the same bytes move from `item.values` into the bin
// entry, and only a purge shrinks anything.

/**
 * Move fields out of the app and into its bin, taking their values with them.
 *
 * @returns {number} how many actually moved, so a caller can say nothing happened rather than
 *   claiming a delete that deleted nothing.
 */
export function sendFieldsToTrash(app, fieldIds, by = '') {
  const kill = new Set(fieldIds || []);
  if (!kill.size) return 0;
  const going = (app.fields || []).filter((field) => kill.has(field.id));
  if (!going.length) return 0;

  if (!Array.isArray(app.fieldTrash)) app.fieldTrash = [];
  const at = stamp();
  going.forEach((field) => {
    // The value this field held on every record, keyed by record id. Only records that had
    // one: an empty map is the honest record of a field nobody ever filled in.
    const values = {};
    (app.items || []).forEach((item) => {
      const value = item?.values?.[field.id];
      if (value === undefined) return;
      values[item.id] = value;
      delete item.values[field.id];
    });
    app.fieldTrash.unshift({
      field: { ...field },
      // Where it sat, so Restore can put it back where it was rather than at the end.
      position: (app.fields || []).findIndex((entry) => entry.id === field.id),
      values,
      deletedAt: at,
      deletedBy: by,
    });
  });
  app.fields = (app.fields || []).filter((field) => !kill.has(field.id));
  return going.length;
}

/**
 * Put a field back, with everything it held.
 *
 * Restored to its old position where that still exists, because a field list is read in order
 * and a column reappearing at the end is a column somebody has to hunt for.
 */
export function restoreFieldFromTrash(app, fieldId) {
  const at = (app.fieldTrash || []).findIndex((entry) => entry.field?.id === fieldId);
  if (at === -1) return null;
  const [entry] = app.fieldTrash.splice(at, 1);
  if (!Array.isArray(app.fields)) app.fields = [];
  // A field restored twice, or whose id came back another way, must not appear twice over.
  app.fields = app.fields.filter((field) => field.id !== entry.field.id);
  const where = Number.isInteger(entry.position) && entry.position >= 0
    ? Math.min(entry.position, app.fields.length)
    : app.fields.length;
  app.fields.splice(where, 0, { ...entry.field });
  // And the data. A record deleted in the meantime simply has nothing to put back.
  (app.items || []).forEach((item) => {
    const value = entry.values?.[item.id];
    if (value === undefined) return;
    if (!item.values || typeof item.values !== 'object') item.values = {};
    item.values[entry.field.id] = value;
  });
  return entry.field;
}

/** Destroy one field and its data for good. Nothing comes back from here. */
export function purgeFieldFromTrash(app, fieldId) {
  const before = (app.fieldTrash || []).length;
  app.fieldTrash = (app.fieldTrash || []).filter((entry) => entry.field?.id !== fieldId);
  return app.fieldTrash.length < before;
}

/** How many records a binned field still holds a value for -- what a purge would destroy. */
export function trashedFieldValueCount(entry) {
  return Object.keys(entry?.values || {}).length;
}

/** Everything in the bin, records and fields both, so a caller can count what a purge costs. */
export function trashTotals(app) {
  return {
    records: (app.trash || []).length,
    fields: (app.fieldTrash || []).length,
    fieldValues: (app.fieldTrash || []).reduce((sum, entry) => sum + trashedFieldValueCount(entry), 0),
  };
}

/**
 * Records that have been in the bin longer than TRASH_DAYS.
 *
 * Reported rather than swept automatically: a bin that quietly destroys things on a timer is
 * one nobody can rely on, and this app has no scheduled job to run the sweep honestly anyway.
 */
export function expiredInTrash(app, now = Date.now()) {
  const cutoff = now - (TRASH_DAYS * 24 * 60 * 60 * 1000);
  return (app.trash || []).filter((item) => {
    const at = Date.parse(item.deletedAt || '');
    return Number.isFinite(at) && at < cutoff;
  });
}

export function createRecycleBin(ctx) {
  const {
    h, can, isCompanyOwner, wbItemTitle, wbTimeAgo, formatDate, memberName, emptyState,
  } = ctx;

  /** A deleted field, and what restoring it would bring back with it. */
  function fieldRow(app, entry, canManage) {
    const held = trashedFieldValueCount(entry);
    return `
      <div class="wb-trash-row is-field" data-wb-trash-field="${h(entry.field.id)}">
        <div class="wb-trash-what">
          <b><i class="ti ti-forms"></i>${h(entry.field.label || 'Field')}</b>
          <small>
            Field · ${held ? `${held} record${held === 1 ? '' : 's'} still hold its value` : 'no records had a value'}
            · deleted ${h(wbTimeAgo(entry.deletedAt) || formatDate(entry.deletedAt))}${entry.deletedBy ? ` by ${h(memberName(entry.deletedBy) || 'someone')}` : ''}
          </small>
        </div>
        ${canManage ? `
          <button class="btn btn-sm" type="button" data-wb-trash-field-restore="${h(entry.field.id)}"><i class="ti ti-arrow-back-up"></i>Restore</button>
          <button class="wb-icon-btn danger" type="button" data-wb-trash-field-purge="${h(entry.field.id)}" title="Delete for good" aria-label="Delete ${h(entry.field.label || 'field')} for good"><i class="ti ti-x"></i></button>
        ` : ''}
      </div>`;
  }

  function wbViewRecycleBin(companyId, workspace, app) {
    const canManage = can('workspaces.manage', companyId);
    const isOwner = isCompanyOwner(companyId);
    const trash = app.trash || [];
    const fields = app.fieldTrash || [];
    const stale = expiredInTrash(app).length;
    if (!trash.length && !fields.length) {
      return `<div class="wb-trash card">
        <div class="section-head"><div><h3>Recycle bin</h3><p>Records and fields deleted from ${h(app.name)} wait here so a misclick is not the end of them.</p></div></div>
        ${emptyState('Nothing has been deleted from this app.')}
      </div>`;
    }
    const parts = [
      trash.length ? `${trash.length} record${trash.length === 1 ? '' : 's'}` : '',
      fields.length ? `${fields.length} field${fields.length === 1 ? '' : 's'}` : '',
    ].filter(Boolean).join(' and ');
    return `<div class="wb-trash card">
      <div class="section-head">
        <div><h3>Recycle bin</h3><p>${parts} deleted from ${h(app.name)}. Restoring a field brings back the value it held on every record.</p></div>
        ${canManage && isOwner ? '<button class="btn danger" type="button" data-wb-trash-empty><i class="ti ti-lock"></i>Empty the bin</button>' : ''}
      </div>
      ${canManage && !isOwner ? '<div class="wb-sub wb-trash-owner"><i class="ti ti-lock"></i>Emptying the bin is an account owner\'s decision — it destroys everything here, including the values any deleted field was holding. Restore and purge one at a time are still yours.</div>' : ''}
      ${stale ? `<div class="wb-sub wb-trash-stale"><i class="ti ti-clock"></i>${stale} ${stale === 1 ? 'record has' : 'records have'} been here more than ${TRASH_DAYS} days. Nothing is removed automatically — the bin only empties when somebody empties it.</div>` : ''}
      <div class="wb-trash-list">
        ${fields.map((entry) => fieldRow(app, entry, canManage)).join('')}
        ${trash.map((item) => `
          <div class="wb-trash-row" data-wb-trash-id="${h(item.id)}">
            <div class="wb-trash-what">
              <b>${h(wbItemTitle(app, item))}</b>
              <small>Deleted ${h(wbTimeAgo(item.deletedAt) || formatDate(item.deletedAt))}${item.deletedBy ? ` by ${h(memberName(item.deletedBy) || 'someone')}` : ''}</small>
            </div>
            ${canManage ? `
              <button class="btn btn-sm" type="button" data-wb-trash-restore="${h(item.id)}"><i class="ti ti-arrow-back-up"></i>Restore</button>
              <button class="wb-icon-btn danger" type="button" data-wb-trash-purge="${h(item.id)}" title="Delete for good" aria-label="Delete ${h(wbItemTitle(app, item))} for good"><i class="ti ti-x"></i></button>
            ` : ''}
          </div>`).join('')}
      </div>
    </div>`;
  }

  return { wbViewRecycleBin };
}
