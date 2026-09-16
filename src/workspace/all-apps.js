// "All apps": every app in the workspace at once, in a grid under the strip that scrolls.
//
// Built from the strip's OWN tabs rather than from the workspace document. The strip is
// already the list — in the order it was last dragged into, with the open app marked and
// linked apps flagged — so reading it back means the grid can never disagree with the bar
// above it, and this module needs no access to workspace state to draw itself.
//
// Fetched on first click, like the strip's drag handling beside it: it is behind a button,
// nothing paints before that click, and the entry chunk is at its budget.

const ACTIVITY_TILE = 'activity';

/** One strip tab, redrawn as a grid tile. Cloned so the icon, colour and link mark come along. */
function tileFor(tab) {
  const tile = tab.cloneNode(true);
  tile.className = `wb-allapps-tile${tab.classList.contains('active') ? ' active' : ''}`;
  // Strip-only hooks. Left on, the reorder code and the "scroll the open app into view" pass
  // would both find a second copy of every tab sitting outside the track.
  tile.removeAttribute('data-wb-topbar-active');
  tile.removeAttribute('data-wb-app-id');
  const label = tile.querySelector('.wb-topbar-label');
  const name = (label ? label.textContent : tab.getAttribute('title') || '').trim();
  if (label) label.className = 'wb-allapps-name';
  tile.dataset.name = name.toLowerCase();
  return tile;
}

function filter(panel, query) {
  const needle = String(query || '').trim().toLowerCase();
  let shown = 0;
  panel.querySelectorAll('.wb-allapps-tile').forEach((tile) => {
    const hit = !needle || (tile.dataset.name || '').includes(needle);
    tile.hidden = !hit;
    if (hit) shown += 1;
  });
  const none = panel.querySelector('[data-wb-allapps-none]');
  if (none) none.hidden = shown > 0;
}

function build(bar) {
  const track = bar.querySelector('[data-wb-topbar-apps]');
  const tabs = track ? [...track.querySelectorAll('.wb-topbar-tab')] : [];
  const panel = document.createElement('div');
  panel.className = 'wb-allapps';
  panel.id = 'wbAllApps';
  panel.setAttribute('data-wb-allapps', '');
  panel.innerHTML = `<div class="wb-allapps-head">
      <h3 class="wb-allapps-title"><i class="ti ti-layout-grid" aria-hidden="true"></i>All apps <span data-wb-allapps-count></span></h3>
      <div class="wb-allapps-search"><i class="ti ti-search" aria-hidden="true"></i><input type="text" data-wb-allapps-search placeholder="Filter apps…" aria-label="Filter apps"></div>
      <button class="wb-allapps-close" type="button" data-wb-allapps-close title="Close" aria-label="Close all apps"><i class="ti ti-x" aria-hidden="true"></i></button>
    </div>
    <div class="wb-allapps-grid" data-wb-allapps-grid></div>
    <p class="wb-allapps-none" data-wb-allapps-none hidden>No app matches that.</p>`;
  const grid = panel.querySelector('[data-wb-allapps-grid]');
  tabs.forEach((tab) => grid.append(tileFor(tab)));
  // Activity rides inside the same track, so it is in the grid — but it is not an app, and
  // counting it would report one more app than the workspace has.
  const appCount = tabs.filter((tab) => tab.dataset.wbAppId !== ACTIVITY_TILE).length;
  panel.querySelector('[data-wb-allapps-count]').textContent = String(appCount);
  if (!appCount) {
    const none = panel.querySelector('[data-wb-allapps-none]');
    none.textContent = 'No apps in this workspace yet.';
    none.hidden = false;
  }
  return panel;
}

/**
 * Open the grid, or close it if it is already open.
 *
 * `bar` is the sticky app bar the panel hangs from; `button` is what was pressed, which gets
 * the caret back when the panel is dismissed by keyboard or by its own close button.
 */
export function toggleAllApps(bar, button) {
  if (!bar) return;
  const existing = bar.querySelector('[data-wb-allapps]');
  if (existing) { close(existing, button, true); return; }

  const panel = build(bar);
  bar.append(panel);
  button?.setAttribute('aria-expanded', 'true');

  const search = panel.querySelector('[data-wb-allapps-search]');
  if (search) {
    search.oninput = () => filter(panel, search.value);
    search.focus();
  }
  panel.querySelector('[data-wb-allapps-close]').onclick = () => close(panel, button, true);

  // Escape anywhere, and a click anywhere else, dismiss it. Both listeners are dropped when
  // the panel closes — and by the panel's own absence, since a render replaces the whole bar
  // underneath it and would otherwise leave a pair behind on every open.
  const onKey = (event) => {
    if (!panel.isConnected) { detach(); return; }
    if (event.key === 'Escape') close(panel, button, true);
  };
  const onClick = (event) => {
    if (!panel.isConnected) { detach(); return; }
    // Opening click: the button's own press bubbles to here, and closing on it would shut
    // the panel in the same gesture that asked for it.
    if (button?.contains(event.target)) return;
    // A tile is a link. Closing on the next tick instead of now leaves the router's own
    // document handler a live link to read the destination off.
    if (panel.contains(event.target)) {
      if (event.target.closest('.wb-allapps-tile')) setTimeout(() => close(panel, button, false), 0);
      return;
    }
    close(panel, button, false);
  };
  function detach() {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onClick);
  }
  panel.__detach = detach;
  document.addEventListener('keydown', onKey);
  document.addEventListener('click', onClick);
}

function close(panel, button, refocus) {
  panel.__detach?.();
  panel.remove();
  if (button) {
    button.setAttribute('aria-expanded', 'false');
    if (refocus) button.focus();
  }
}
