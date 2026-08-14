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

/** Empty the whole bin. */
export function emptyTrash(app) {
  const count = (app.trash || []).length;
  app.trash = [];
  return count;
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
    h, can, wbItemTitle, wbTimeAgo, formatDate, memberName, emptyState,
  } = ctx;

  function wbViewRecycleBin(companyId, workspace, app) {
    const canManage = can('workspaces.manage', companyId);
    const trash = app.trash || [];
    const stale = expiredInTrash(app).length;
    if (!trash.length) {
      return `<div class="wb-trash card">
        <div class="section-head"><div><h3>Recycle bin</h3><p>Records deleted from ${h(app.name)} wait here so a misclick is not the end of them.</p></div></div>
        ${emptyState('Nothing has been deleted from this app.')}
      </div>`;
    }
    return `<div class="wb-trash card">
      <div class="section-head">
        <div><h3>Recycle bin</h3><p>${trash.length} deleted record${trash.length === 1 ? '' : 's'} from ${h(app.name)}. Restoring one puts it back at the top of the list.</p></div>
        ${canManage ? '<button class="btn danger" type="button" data-wb-trash-empty><i class="ti ti-trash"></i>Empty the bin</button>' : ''}
      </div>
      ${stale ? `<div class="wb-sub wb-trash-stale"><i class="ti ti-clock"></i>${stale} ${stale === 1 ? 'record has' : 'records have'} been here more than ${TRASH_DAYS} days. Nothing is removed automatically — the bin only empties when somebody empties it.</div>` : ''}
      <div class="wb-trash-list">
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
