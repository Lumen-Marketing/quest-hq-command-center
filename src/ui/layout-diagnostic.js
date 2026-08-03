// On-screen layout readout, shown only when the URL carries ?diag=layout.
//
// This exists because the double-scrollbar bug cannot be diagnosed from the stylesheet:
// which element is overflowing depends on computed values that only exist at runtime.
// The obvious route — paste a snippet into the console — is blocked by Chrome's
// "allow pasting" protection, which is a sensible default nobody should be talked out of.
//
// So the measurements come from inside the app instead, behind a flag, with a copy button.
// Fetched on demand: without the flag this costs the bundle nothing.

const px = (v) => Math.round(v);

function measure(label, node) {
  if (!node) return { label, missing: true };
  const cs = getComputedStyle(node);
  return {
    label,
    height: cs.height,
    minHeight: cs.minHeight,
    maxHeight: cs.maxHeight,
    overflowY: cs.overflowY,
    position: cs.position,
    client: px(node.clientHeight),
    scroll: px(node.scrollHeight),
    offset: px(node.offsetHeight),
    scrolls: node.scrollHeight > node.clientHeight + 1,
  };
}

/** Everything the double-scrollbar question needs, as plain text. */
export function collectLayoutReport() {
  const doc = document.documentElement;
  const q = (sel) => document.querySelector(sel);
  const rows = [
    measure('.quest-app', q('.quest-app')),
    measure('.work-surface', q('.work-surface')),
    measure('.deck', q('.deck')),
    measure('.deck-scroll', q('.deck-scroll')),
  ];

  const lines = [
    `viewport      ${window.innerWidth} x ${window.innerHeight}  dpr=${window.devicePixelRatio}`,
    `document      client=${px(doc.clientHeight)} scroll=${px(doc.scrollHeight)} SCROLLS=${doc.scrollHeight > doc.clientHeight + 1 ? 'YES' : 'no'}`,
    `body          scroll=${px(document.body.scrollHeight)} overflowY=${getComputedStyle(document.body).overflowY}`,
    '',
  ];

  for (const r of rows) {
    if (r.missing) { lines.push(`${r.label}  NOT FOUND`); continue; }
    lines.push(
      r.label,
      `  height=${r.height} min=${r.minHeight} max=${r.maxHeight}`,
      `  overflowY=${r.overflowY} position=${r.position}`,
      `  client=${r.client} scroll=${r.scroll} offset=${r.offset} SCROLLS=${r.scrolls ? 'YES' : 'no'}`,
    );
  }

  // The element actually forcing the document to scroll is nearly always in here.
  const tall = [...document.querySelectorAll('body *')]
    .filter((n) => n.offsetHeight > window.innerHeight + 4)
    .slice(0, 10)
    .map((n) => `  ${n.tagName.toLowerCase()}.${[...n.classList].slice(0, 3).join('.') || '(none)'} = ${px(n.offsetHeight)}px`);
  lines.push('', 'taller than viewport:', ...(tall.length ? tall : ['  (none)']));

  // Every element that is actually scrolling, wherever it is. The fixed list above covers
  // the shell, and measuring the shell in a headless browser cleared it at every width from
  // 600 to 1920 — so a second scrollbar now has to be coming from page content, which only
  // a full walk will find. Each one is reported with its ancestor path, because "some div
  // scrolls" is not actionable without knowing which.
  const path = (n) => {
    const parts = [];
    for (let el = n; el && el !== document.body && parts.length < 4; el = el.parentElement) {
      parts.unshift(el.tagName.toLowerCase() + (el.classList.length ? `.${[...el.classList].slice(0, 2).join('.')}` : ''));
    }
    return parts.join(' > ');
  };
  const scrollers = [...document.querySelectorAll('body *')]
    .filter((n) => {
      const cs = getComputedStyle(n);
      if (!/(auto|scroll)/.test(cs.overflowY) && !/(auto|scroll)/.test(cs.overflowX)) return false;
      return n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1;
    })
    .slice(0, 14)
    .map((n) => `  ${path(n)}\n      client=${px(n.clientHeight)} scroll=${px(n.scrollHeight)} y=${getComputedStyle(n).overflowY} x=${getComputedStyle(n).overflowX}`);
  lines.push('', `SCROLLING ELEMENTS (${scrollers.length}):`, ...(scrollers.length ? scrollers : ['  (none)']));

  lines.push('', `route  ${location.pathname}${location.search}`);
  return lines.join('\n');
}

/** Fill the placeholder the shell rendered. Runs after paint, when layout is settled. */
export function mountLayoutDiagnostic() {
  const host = document.querySelector('[data-layout-diagnostic]');
  if (!host) return;
  const text = collectLayoutReport();
  host.innerHTML = `
    <div class="layout-diag-head">
      <b>Layout readout</b>
      <button class="btn btn-sm" type="button" data-layout-diag-copy>Copy</button>
      <a class="btn btn-sm" href="${location.pathname}">Close</a>
    </div>
    <pre class="layout-diag-body"></pre>`;
  host.querySelector('.layout-diag-body').textContent = text;
  const copy = host.querySelector('[data-layout-diag-copy]');
  copy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = 'Copied';
    } catch {
      // Clipboard access can be refused; selecting the text is the fallback that always
      // works, and is what someone would do by hand anyway.
      const range = document.createRange();
      range.selectNodeContents(host.querySelector('.layout-diag-body'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      copy.textContent = 'Selected — press Ctrl+C';
    }
  };
}
