// Drag-to-pan for the workspace app strip.
//
// Fetched on demand. The strip works without it — it scrolls with the arrows, the wheel
// and a touch swipe — so binding a tick after first paint costs nothing, and keeping it
// out of the entry chunk is what paid for the feature.
//
// Self-contained: it touches only the element it is handed, so there is no context object
// and nothing to keep in step with main.js.

// No JavaScript in this file consulted the motion preference before now; the CSS did it
// all. Momentum is motion the stylesheet cannot switch off, so it has to be asked here.
function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function bindTopbarDrag(track) {
  // Far enough that a click with a shaky hand is still a click, short enough that a
  // deliberate drag starts without a delay.
  const DRAG_SLOP = 5;
  const FRICTION = 0.94;
  const MIN_VELOCITY = 0.08;

  let pressed = false;
  let dragging = false;
  // A drag that started on an app tile reorders it; a drag on the strip itself pans. The
  // two cannot share a gesture, so which one this is gets decided on pointerdown and does
  // not change for the rest of the drag.
  let reordering = null;
  let startX = 0;
  let startScroll = 0;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;
  let momentum = 0;

  const stopMomentum = () => {
    if (momentum) cancelAnimationFrame(momentum);
    momentum = 0;
  };

  const glide = () => {
    velocity *= FRICTION;
    if (Math.abs(velocity) < MIN_VELOCITY) { stopMomentum(); return; }
    const before = track.scrollLeft;
    track.scrollLeft -= velocity * 16;
    // Hitting either end should stop the glide rather than spin against the edge.
    if (track.scrollLeft === before) { stopMomentum(); return; }
    momentum = requestAnimationFrame(glide);
  };

  const tileUnder = (x, y) => {
    const el = track.ownerDocument.elementFromPoint(x, y);
    const tile = el && el.closest ? el.closest('[data-wb-app-id]') : null;
    return tile && track.contains(tile) ? tile : null;
  };

  track.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    stopMomentum();
    pressed = true;
    dragging = false;
    reordering = track.dataset.wbReorder === '1' && event.target.closest
      ? event.target.closest('[data-wb-app-id]')
      : null;
    startX = event.clientX;
    lastX = event.clientX;
    lastTime = event.timeStamp;
    velocity = 0;
    startScroll = track.scrollLeft;
  });

  track.addEventListener('pointermove', (event) => {
    if (!pressed) return;
    const dx = event.clientX - startX;
    if (!dragging) {
      if (Math.abs(dx) < DRAG_SLOP) return;
      dragging = true;
      track.classList.add('wb-topbar-dragging');
      if (reordering) reordering.classList.add('is-reordering');
      // Captured only once a drag is real, so a plain click is left entirely alone.
      try { track.setPointerCapture(event.pointerId); } catch { /* capture is best effort */ }
    }
    if (reordering) {
      // The dragged tile is moved in the DOM as the pointer passes each neighbour, so the
      // strip shows the result as it happens and the final order is simply the DOM order.
      const over = tileUnder(event.clientX, event.clientY);
      if (over && over !== reordering) {
        const box = over.getBoundingClientRect();
        const after = event.clientX > box.left + box.width / 2;
        over.parentNode.insertBefore(reordering, after ? over.nextSibling : over);
      }
      event.preventDefault();
      return;
    }
    const elapsed = event.timeStamp - lastTime;
    if (elapsed > 0) velocity = (event.clientX - lastX) / elapsed;
    lastX = event.clientX;
    lastTime = event.timeStamp;
    track.scrollLeft = startScroll - dx;
    event.preventDefault();
  });

  const release = (event) => {
    if (!pressed) return;
    pressed = false;
    if (!dragging) { reordering = null; return; }
    track.classList.remove('wb-topbar-dragging');
    try { track.releasePointerCapture(event.pointerId); } catch { /* already released */ }
    if (reordering) {
      reordering.classList.remove('is-reordering');
      const ids = [...track.querySelectorAll('[data-wb-app-id]')].map((el) => el.dataset.wbAppId);
      // The order is reported, not saved here: this module knows nothing about workspaces,
      // and keeping it that way is why it needs no context object.
      track.dispatchEvent(new CustomEvent('wb-topbar-reorder', { bubbles: true, detail: { ids } }));
      reordering = null;
      return;
    }
    // A long pause before release means the strip was parked, not thrown.
    const stale = event.timeStamp - lastTime > 100;
    if (!stale && !prefersReducedMotion() && Math.abs(velocity) > MIN_VELOCITY) glide();
  };
  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);

  // Capture phase, so the tab's own handler never sees the click that ended a drag.
  track.addEventListener('click', (event) => {
    if (!dragging) return;
    event.preventDefault();
    event.stopPropagation();
    dragging = false;
  }, true);

  // Any other way of moving the strip should cancel a glide in progress.
  track.addEventListener('wheel', stopMomentum, { passive: true });
}
