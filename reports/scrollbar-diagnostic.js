// Paste this whole block into the browser console on the dashboard, then send the output.
// It reads only layout numbers — no data, nothing is sent anywhere.
(() => {
  const px = (v) => Math.round(v);
  const el = (sel) => document.querySelector(sel);

  const report = (label, node) => {
    if (!node) return `${label}: NOT FOUND`;
    const cs = getComputedStyle(node);
    const scrolls = node.scrollHeight > node.clientHeight + 1;
    return [
      `${label}`,
      `  height=${cs.height} minHeight=${cs.minHeight} maxHeight=${cs.maxHeight}`,
      `  overflowY=${cs.overflowY} position=${cs.position} display=${cs.display}`,
      `  client=${px(node.clientHeight)} scroll=${px(node.scrollHeight)} offset=${px(node.offsetHeight)}`,
      `  SCROLLS: ${scrolls ? 'YES' : 'no'}`,
    ].join('\n');
  };

  const doc = document.documentElement;
  const lines = [
    `viewport: ${window.innerWidth} x ${window.innerHeight}  dpr=${window.devicePixelRatio}`,
    `documentElement client=${px(doc.clientHeight)} scroll=${px(doc.scrollHeight)} SCROLLS: ${doc.scrollHeight > doc.clientHeight + 1 ? 'YES' : 'no'}`,
    `body scroll=${px(document.body.scrollHeight)} overflowY=${getComputedStyle(document.body).overflowY}`,
    '',
    report('.quest-app', el('.quest-app')),
    report('.work-surface', el('.work-surface')),
    report('.deck-scroll', el('.deck-scroll')),
    '',
    'route: ' + location.pathname + location.search,
    'sidebarTheme attr: ' + (doc.dataset.sidebarTheme || '(none)') + ' / surface: ' + (doc.dataset.sidebarSurface || '(none)'),
  ];

  // Anything taller than the viewport that is not the shell itself — this is usually the
  // element actually forcing the document to scroll.
  const oversized = [...document.querySelectorAll('body *')]
    .filter((n) => n.offsetHeight > window.innerHeight + 4)
    .slice(0, 8)
    .map((n) => `  ${n.tagName.toLowerCase()}.${[...n.classList].slice(0, 3).join('.') || '(no class)'} = ${px(n.offsetHeight)}px`);
  lines.push('', 'taller than viewport:', ...(oversized.length ? oversized : ['  (none)']));

  const text = lines.join('\n');
  console.log(text);
  return text;
})();
