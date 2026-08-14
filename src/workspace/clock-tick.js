// The second hand for every Time & date tile on the page.
//
// Fetched the first time a dashboard actually has a clock on it. The tile renders its own time
// server-side, so nothing is missing before this arrives -- it only takes over the ticking, and
// a dashboard with no clock never pays for it.
//
// One timer for the whole page, cleared before the next paint starts another. A timer per tile,
// or one that outlives the tile it drew, is how a dashboard ends up ticking in the background of
// a page nobody is looking at.

let timer = null;

export function stopClocks() {
  clearInterval(timer);
  timer = null;
}

export function startClocks() {
  stopClocks();
  if (!document.querySelector('[data-wb-clock]')) return;
  timer = setInterval(() => {
    const clocks = document.querySelectorAll('[data-wb-clock]');
    if (!clocks.length) { stopClocks(); return; }
    clocks.forEach((node) => {
      let config;
      try { config = JSON.parse(node.dataset.wbClock || '{}'); } catch { return; }
      const zone = config.tz || undefined;
      const opts = { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: config.hour12 !== false };
      if (config.seconds) opts.second = '2-digit';
      const stamp = new Date();
      const time = node.querySelector('.wb-clock-time');
      const date = node.querySelector('.wb-clock-date');
      const next = stamp.toLocaleTimeString([], opts);
      // Only what changed. Rewriting the tile every second is how a dashboard ends up fighting
      // anybody trying to use it.
      if (time && time.textContent !== next) time.textContent = next;
      // Kept in step with wbTileClock: the tile is rendered once with this format and the
      // ticker rewrites it every second, so a mismatch would make the date flicker on the
      // first tick.
      const day = stamp.toLocaleDateString([], { timeZone: zone, weekday: 'long', day: 'numeric', month: 'short' });
      if (date && date.textContent !== day) date.textContent = day;
    });
  }, 1000);
}
