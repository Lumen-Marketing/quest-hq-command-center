// Apply the persisted theme before first paint to avoid a flash of the wrong
// theme. Loaded as an external script (rather than inline) so the Content-
// Security-Policy can drop script-src 'unsafe-inline'. Keep this tiny and
// render-blocking in <head> so it runs before the body is styled.
(function () {
  var theme = 'light';
  try {
    var t = localStorage.getItem('questhq:theme');
    if (t === 'light' || t === 'dark') theme = t;
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', theme);
  // Command Center embed (?embed=1): mark the document BEFORE first paint so the
  // boot splash can be suppressed without a flash. This is the only render-
  // blocking script, so it is the only place the flag can be set in time —
  // command-center-host.js is deferred and runs after the splash has painted.
  try {
    if (new URLSearchParams(window.location.search).get('embed') === '1') {
      document.documentElement.setAttribute('data-embedded', '1');
    }
  } catch (e) {}
  // Keep the PWA / mobile-browser chrome band (meta theme-color) in step with
  // the app canvas so the top strip doesn't read as a stray dark bar.
  try {
    var color = theme === 'dark' ? '#08090A' : '#FBFAF8';
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'theme-color'); document.head.appendChild(m); }
    m.setAttribute('content', color);
  } catch (e) {}
})();
