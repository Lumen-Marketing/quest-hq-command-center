// Looking at the photos on a record.
//
// Fetched on the click that opens it, and drawn straight onto <body> rather than through
// state.builderModal: stepping through a gallery is one small change repeated, and routing every
// arrow press through the app's render() would rebuild the whole page to move one picture -- and
// would throw away a half-typed inline edit sitting on the record behind it.
//
// It owns nothing outside itself. Hand it a list of { url, name } and which one to start on; it
// puts the keyboard, the page scroll and the focus back exactly as it found them on close.

/** Make an element in one line. `text` goes in as TEXT, so nothing here needs escaping. */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function icon(name) {
  const node = el('i', `ti ${name}`);
  node.setAttribute('aria-hidden', 'true');
  return node;
}

/**
 * A link that saves rather than navigates.
 *
 * Supabase (and most CDNs) honour a `download=` query param; a data: or blob: URL has nobody to
 * ask, and the anchor's own download attribute is what covers those. The same trick the file
 * preview dialog has used since before there was a gallery.
 */
function downloadHref(shot) {
  const url = String((shot && shot.url) || '');
  if (!url || /^(data|blob):/i.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}download=${encodeURIComponent((shot && shot.name) || 'photo')}`;
}

/** Only ever one. A second viewer over the first is two Escape presses to get back to work. */
let openViewer = null;

/**
 * @param {Array<{url:string,name?:string}>} shots every photo on the field
 * @param {number} startAt which one was clicked
 * @returns {{close:()=>void}|null} null when there is nothing to show
 */
export function openImageLightbox(shots, startAt = 0) {
  const list = (Array.isArray(shots) ? shots : []).filter((one) => one && one.url);
  if (!list.length) return null;
  if (openViewer) openViewer.close();

  const many = list.length > 1;
  let at = Math.min(Math.max(0, Number(startAt) || 0), list.length - 1);
  // One at a time, or the contact sheet. A gallery you can only step through hides how much is
  // in it; a grid you cannot leave makes you squint at the one you came for.
  let all = false;
  const returnTo = document.activeElement;

  const overlay = el('div', 'wb-lb');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Photo viewer');
  overlay.tabIndex = -1;

  const name = el('strong', 'wb-lb-name');
  const count = el('span', 'wb-lb-count');
  const titles = el('div', 'wb-lb-titles');
  titles.append(name, count);

  const allBtn = el('button', 'btn btn-sm');
  allBtn.type = 'button';
  const allIcon = icon('ti-layout-grid');
  const allText = el('span', null, 'All photos');
  allBtn.append(allIcon, allText);

  const closeTop = el('button', 'btn btn-sm');
  closeTop.type = 'button';
  closeTop.append(icon('ti-x'), el('span', null, 'Close'));

  const acts = el('div', 'wb-lb-acts');
  if (many) acts.append(allBtn);
  acts.append(closeTop);

  const head = el('div', 'wb-lb-head');
  head.append(titles, acts);

  const img = el('img', 'wb-lb-img');
  img.decoding = 'async';
  const stage = el('div', 'wb-lb-stage');

  const arrow = (dir, label, glyph) => {
    const button = el('button', `wb-lb-arrow ${dir}`);
    button.type = 'button';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.append(icon(glyph));
    return button;
  };
  const prevBtn = arrow('prev', 'Previous photo', 'ti-chevron-left');
  const nextBtn = arrow('next', 'Next photo', 'ti-chevron-right');
  if (many) stage.append(prevBtn);
  stage.append(img);
  if (many) stage.append(nextBtn);

  // Every photo at once. Built once and only re-marked as you move: rebuilding it on each step
  // would re-request thumbnails the browser is already holding.
  const grid = el('div', 'wb-lb-grid');
  const tiles = list.map((shot, i) => {
    const tile = el('button', 'wb-lb-tile');
    tile.type = 'button';
    tile.title = shot.name || `Photo ${i + 1}`;
    tile.setAttribute('aria-label', `View ${shot.name || `photo ${i + 1}`}`);
    const thumb = el('img');
    thumb.src = shot.url;
    thumb.alt = shot.name || `Photo ${i + 1}`;
    thumb.loading = 'lazy';
    thumb.decoding = 'async';
    tile.append(thumb);
    tile.addEventListener('click', () => { at = i; all = false; paint(); });
    grid.append(tile);
    return tile;
  });

  const body = el('div', 'wb-lb-body');
  body.append(stage, grid);

  const openTab = el('a', 'btn');
  openTab.target = '_blank';
  openTab.rel = 'noreferrer';
  openTab.append(icon('ti-external-link'), el('span', null, 'Open in new tab'));

  const download = el('a', 'btn btn-primary');
  download.append(icon('ti-download'), el('span', null, 'Download'));

  const closeFoot = el('button', 'btn');
  closeFoot.type = 'button';
  closeFoot.append(icon('ti-x'), el('span', null, 'Close'));

  const foot = el('div', 'wb-lb-foot');
  foot.append(closeFoot, openTab, download);

  overlay.append(head, body, foot);

  function paint() {
    const shot = list[at];
    name.textContent = shot.name || 'Photo';
    count.textContent = many ? `${at + 1} of ${list.length}` : '';
    img.src = shot.url;
    img.alt = shot.name || 'Photo';
    openTab.href = shot.url;
    download.href = downloadHref(shot);
    download.setAttribute('download', shot.name || 'photo');
    overlay.classList.toggle('is-all', all);
    allText.textContent = all ? 'One at a time' : 'All photos';
    allIcon.className = `ti ${all ? 'ti-photo' : 'ti-layout-grid'}`;
    allBtn.setAttribute('aria-pressed', all ? 'true' : 'false');
    // The contact sheet marks where you are, so leaving it puts you back on a photo you chose
    // rather than on whichever one you happened to be on when you opened it.
    tiles.forEach((tile, i) => tile.classList.toggle('sel', i === at));
  }

  // Wraps, both ways. Past the last of eight photos the thing you want next is the first one,
  // not a dead button -- and the count in the header is what says where you are.
  const step = (by) => { at = (at + by + list.length) % list.length; all = false; paint(); };

  function close() {
    if (openViewer !== api) return;
    openViewer = null;
    document.removeEventListener('keydown', onKey, true);
    overlay.remove();
    document.documentElement.classList.remove('wb-lb-locked');
    if (returnTo && typeof returnTo.focus === 'function' && returnTo.isConnected) returnTo.focus();
  }

  function onKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
    if (!many) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); } else if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
  }

  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  allBtn.addEventListener('click', () => { all = !all; paint(); });
  closeTop.addEventListener('click', close);
  closeFoot.addEventListener('click', close);
  // The picture itself steps forward when tapped, which is what a phone expects of a gallery.
  // The arrows stay for a pointer, and for anyone who cannot aim at the picture.
  if (many) img.addEventListener('click', () => step(1));

  // A swipe across the stage. Horizontal only, and only past a distance no tap produces -- a
  // photo you meant to tap must not also count as a flick.
  let sx = 0;
  let sy = 0;
  stage.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    sx = touch.clientX; sy = touch.clientY;
  }, { passive: true });
  stage.addEventListener('touchend', (event) => {
    if (!many) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - sx;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(touch.clientY - sy)) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  const api = { close, get index() { return at; } };
  openViewer = api;
  paint();
  document.documentElement.classList.add('wb-lb-locked');
  document.body.append(overlay);
  document.addEventListener('keydown', onKey, true);
  overlay.focus();
  return api;
}
